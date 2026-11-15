/*
 * 项目博物馆后端：只读发现项目，静默期后自动归档，提供 HUD 双路径接口。
 * 自动保存七道保险：① 临时文件 + fsync + 原子替换 ② 500ms 合并
 * ③ 100/300/900ms 重试 ④ 连败五次另存救援快照 ⑤ 卸载同步 flush
 * ⑥ broken 留证 + bak 恢复 ⑦ Promise 串行队列（失败不堵后续）。
 * items 先落盘、pending 后移除，跨文件中断可幂等重放；卸载后禁止旧异步提交。
 * 默认扫描 ~/Projects 和 ~/Desktop，可通过 roots 指定 D:\\插件 等目录。
 * sessionKeys（两表）/ fingerprints（pending）为内部元数据，用于重启去重和活动判断。
 * 本地资料不足时 how/pitfalls 留空，不编造开发经历。不启动服务、不请求网络。
 */
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'

export const DEFAULTS = {
  roots: [],
  settleHours: 6,
  maxProjects: 200,
  scanMinutes: 10,
  includePending: true,
  enabled: true,
}

export function apply(ctx, rawConfig) {
  let log = () => {}
  try {
    const cfg = { ...DEFAULTS, ...(rawConfig ?? {}) }
    for (const [key, min, max] of [['settleHours', 0, 876000], ['maxProjects', 1, 10000], ['scanMinutes', 0.001, 35791]]) {
      if (typeof cfg[key] !== 'number' || !Number.isFinite(cfg[key])) cfg[key] = DEFAULTS[key]
      cfg[key] = Math.max(min, Math.min(max, cfg[key]))
    }
    cfg.maxProjects = Math.floor(cfg.maxProjects)
    cfg.includePending = cfg.includePending !== false
    cfg.enabled = cfg.enabled !== false
    const home = os.homedir()
    const dir = path.join(home, '.dsh', 'museum')
    const roots = Array.isArray(cfg.roots) && cfg.roots.length
      ? cfg.roots.filter(p => typeof p === 'string' && path.isAbsolute(p)).map(p => path.resolve(p))
      : [path.join(home, 'Projects'), path.join(home, 'Desktop')]
    const skip = new Set(['node_modules', '.git', 'dist', 'build', 'out', '.venv', 'venv', '__pycache__', '.next', 'target'])
    const paths = ['/api/museum', '/museum'].flatMap(prefix => ['list', 'item', 'scan', 'status'].map(name => `${prefix}/${name}.json`))
    const tables = {}
    let active = true
    let queue = Promise.resolve()
    let debounce = null
    let queued = false
    let lastScan = 0
    let failedWrites = 0
    let serial = 0
    let logs = []
    const now = () => Date.now()
    const reason = e => String(e?.message ?? e)
    const keyOf = p => path.resolve(p).replace(/[\\/]+$/, '').toLowerCase()
    const stamp = () => `${now()}-${++serial}`
    const safe = fn => { try { return fn() } catch { return undefined } }
    const dispose = fn => { try { if (typeof fn === 'function') fn() } catch (e) { log('warn', reason(e)) } }
    const enqueue = job => {
      queue = queue.then(job).catch(e => log('warn', reason(e)))
      return queue
    }
    const schedule = (delay = 500) => {
      if (!active || debounce) return
      debounce = setTimeout(() => {
        debounce = null
        if (queued || !active) return
        queued = true
        void enqueue(async () => {
          try { if (active) await persist() } finally {
            queued = false
            if (active && (Object.values(tables).some(t => t.dirty) || logs.length)) schedule(900)
          }
        })
      }, delay)
      debounce.unref?.()
    }
    log = (level, msg) => {
      try {
        logs.push(JSON.stringify({ time: now(), level, msg: String(msg).slice(0, 4000) }))
        if (logs.length > 400) logs = logs.slice(-400)
        schedule()
      } catch {}
    }
    const dirty = table => {
      table.dirty = true
      table.revision++
      schedule()
    }

    // 初始化允许同步 IO；目录不可写时仍注册只读接口，后续保存会继续重试。
    try { fs.mkdirSync(dir, { recursive: true }) } catch (e) { log('warn', `存储目录不可写：${reason(e)}`) }
    function validate(data, kind) {
      if (!data || data.version !== 1 || !Number.isFinite(data.updatedAt) || !Array.isArray(data.items)) throw new Error('无效的数据库结构')
      for (const item of data.items) {
        if (!item || typeof item.path !== 'string' || !path.isAbsolute(item.path)) throw new Error('无效的项目路径')
        if (kind === 'items') {
          if (typeof item.id !== 'string' || !item.id || typeof item.name !== 'string' || typeof item.locked !== 'boolean' || typeof item.summary !== 'string') throw new Error('无效的档案')
          for (const key of ['how', 'pitfalls']) if (!Array.isArray(item[key]) || !item[key].every(v => typeof v === 'string')) throw new Error(`无效的 ${key}`)
          for (const key of ['sessions', 'files', 'bytes', 'createdAt', 'updatedAt', 'settledAt']) if (!Number.isFinite(item[key]) || item[key] < 0) throw new Error(`无效的 ${key}`)
          const types = ['plugin', 'app', 'game', 'tool', 'terminal', 'script', 'film', 'image', 'music', 'cube', 'doc', 'note', 'school', 'chart', 'ai', 'chip', 'web', 'palette', 'hardware', 'other']
          if (!types.includes(item.type) || !types.includes(item.icon) || !['hex', 'ring', 'page', 'diamond', 'square', 'shield'].includes(item.shape) || !['common', 'fine', 'rare', 'legend'].includes(item.rarity)) throw new Error('无效的勋章参数')
        }
        if (kind === 'pending' && (typeof item.name !== 'string' || !Number.isFinite(item.lastActive) || !Number.isFinite(item.firstSeen) || !Number.isFinite(item.hits))) throw new Error('无效的待定档案')
      }
      return data
    }
    function load(kind) {
      const file = path.join(dir, `${kind}.json`)
      let data
      let repaired = false
      try { data = validate(JSON.parse(fs.readFileSync(file, 'utf8')), kind) } catch (e) {
        if (e.code !== 'ENOENT') {
          safe(() => fs.copyFileSync(file, path.join(dir, `${kind}.broken-${stamp()}.json`), fs.constants.COPYFILE_EXCL))
          log('warn', `${kind} 读取失败，已尝试保留损坏原件：${reason(e)}`)
          repaired = true
        }
        try {
          data = validate(JSON.parse(fs.readFileSync(`${file}.bak`, 'utf8')), kind)
          repaired = true
          log('warn', `${kind} 已恢复备份`)
        } catch {
          data = { version: 1, updatedAt: 0, items: [] }
          if (repaired) log('warn', `${kind} 无可用备份，使用空库`)
        }
      }
      const unique = new Map()
      for (const item of data.items) {
        const key = keyOf(item.path)
        if (!unique.has(key) || item.locked === true) unique.set(key, item)
      }
      if (unique.size !== data.items.length) repaired = true
      data.items = [...unique.values()]
      const table = { file, data, dirty: repaired, revision: 0, failures: 0 }
      tables[kind] = table
      if (repaired) schedule()
      return table
    }
    const items = load('items')
    const pending = load('pending')
    // Map 避免用户会话 ID 或路径触发原型键问题。
    const sessions = new Map()
    for (const table of [pending, items]) {
      for (const [key, ids] of Object.entries(table.data.sessionKeys ?? {})) {
        if (Array.isArray(ids)) sessions.set(key, [...new Set([...(sessions.get(key) ?? []), ...ids.filter(v => typeof v === 'string')])])
      }
    }
    const fingerprints = new Map(Object.entries(pending.data.fingerprints ?? {}))
    const details = new Map()
    const itemMap = new Map(items.data.items.map(item => [keyOf(item.path), item]))
    const pendingMap = new Map(pending.data.items.map(item => [keyOf(item.path), item]))
    const usedIds = new Set()
    function idFor(projectPath) {
      const base = path.basename(projectPath).toLowerCase().replace(/[^\p{L}\p{N}_-]+/gu, '-').replace(/^-+|-+$/g, '') || 'project'
      let id = base
      if (usedIds.has(id)) id = `${base}-${crypto.createHash('sha256').update(keyOf(projectPath)).digest('hex').slice(0, 12)}`
      let suffix = 2
      const candidate = id
      while (usedIds.has(id)) id = `${candidate}-${suffix++}`
      usedIds.add(id)
      return id
    }
    for (const item of items.data.items) {
      if (usedIds.has(item.id)) {
        item.id = idFor(item.path)
        dirty(items)
      } else usedIds.add(item.id)
    }
    function snapshot(table) {
      // 计数与去重键随 items 同次原子提交，防止 items 成功/pending 失败后重复计数。
      table.data.sessionKeys = Object.fromEntries(sessions)
      if (table === pending) {
        table.data.fingerprints = Object.fromEntries(fingerprints)
      }
      return { ...table.data, updatedAt: now() }
    }
    function atomicSync(file, text) {
      const temp = `${file}.tmp-${process.pid}-${stamp()}`
      let fd
      try {
        fd = fs.openSync(temp, 'wx', 0o600)
        fs.writeFileSync(fd, text, 'utf8')
        fs.fsyncSync(fd)
        fs.closeSync(fd)
        fd = undefined
        fs.renameSync(temp, file)
      } finally {
        if (fd !== undefined) safe(() => fs.closeSync(fd))
        safe(() => fs.unlinkSync(temp))
      }
    }
    async function atomic(file, text) {
      if (!active) return false
      const temp = `${file}.tmp-${process.pid}-${stamp()}`
      let handle
      try {
        handle = await fs.promises.open(temp, 'wx', 0o600)
        if (!active) return false
        await handle.writeFile(text, 'utf8')
        if (!active) return false
        fs.fsyncSync(handle.fd)
        await handle.close()
        handle = null
        // 检查与 rename 不跨 await，保证退出 flush 不会被旧快照覆盖。
        if (!active) return false
        fs.renameSync(temp, file)
        return true
      } finally {
        if (handle) await handle.close().catch(() => {})
        await fs.promises.unlink(temp).catch(() => {})
      }
    }
    async function failure(table, error) {
      table.failures++
      failedWrites++
      log('warn', `${path.basename(table.file)} 保存失败 (${table.failures})：${reason(error)}`)
      if (table.failures % 5 === 0 && active) {
        try {
          const file = `${table.file}.failed-${stamp()}.json`
          if (await atomic(file, JSON.stringify(snapshot(table), null, 2))) log('warn', `内存保留，救援快照：${file}`)
        } catch (e) { log('warn', `救援快照也不可写，仍保留内存：${reason(e)}`) }
      }
    }
    async function save(table) {
      if (!table.dirty) return true
      for (const delay of [0, 100, 300, 900]) {
        if (delay) await new Promise(resolve => setTimeout(resolve, delay))
        if (!active) return false
        const revision = table.revision
        const data = snapshot(table)
        const text = JSON.stringify(data, null, 2)
        try {
          if (!await atomic(table.file, text)) return false
          table.data.updatedAt = data.updatedAt
          // 备份也原子更新，防止写坏 .bak。备份失败保留脏标记并重试。
          if (!await atomic(`${table.file}.bak`, text)) return false
          table.failures = 0
          if (revision === table.revision) table.dirty = false
          return !table.dirty
        } catch (e) { await failure(table, e) }
      }
      return false
    }
    async function persist() {
      // items 未保存成功时绝不提交 pending 的删除，避免中途崩溃丢失归档。
      if (await save(items)) await save(pending)
      if (!active || !logs.length) return
      const batch = logs.splice(0)
      const file = path.join(dir, 'log.jsonl')
      try {
        await fs.promises.appendFile(file, `${batch.join('\n')}\n`, { mode: 0o600 })
        if (!active) return
        const stat = await fs.promises.stat(file)
        if (stat.size > 512 * 1024) {
          const text = await fs.promises.readFile(file, 'utf8')
          await atomic(file, `${text.trimEnd().split('\n').slice(-200).join('\n')}\n`)
        }
      } catch {}
    }
    function flushSync() {
      if (!active) return
      active = false
      clearTimeout(debounce)
      let itemSaved = true
      for (const table of [items, pending]) {
        if (!table.dirty || (table === pending && !itemSaved)) continue
        try {
          const data = snapshot(table)
          const text = JSON.stringify(data, null, 2)
          atomicSync(table.file, text)
          table.data.updatedAt = data.updatedAt
          atomicSync(`${table.file}.bak`, text)
          table.dirty = false
        } catch (e) {
          if (table === items) itemSaved = false
          table.failures++
          failedWrites++
          log('warn', `退出保存失败：${reason(e)}`)
          safe(() => atomicSync(`${table.file}.failed-${stamp()}.json`, JSON.stringify(snapshot(table), null, 2)))
        }
      }
      try {
        const file = path.join(dir, 'log.jsonl')
        if (logs.length) fs.appendFileSync(file, `${logs.splice(0).join('\n')}\n`, { mode: 0o600 })
        if (fs.statSync(file).size > 512 * 1024) atomicSync(file, `${fs.readFileSync(file, 'utf8').trimEnd().split('\n').slice(-200).join('\n')}\n`)
      } catch {}
    }

    function ignored(name) { return name.startsWith('.') || skip.has(name.toLowerCase()) }
    function entries(projectPath) {
      const stat = fs.lstatSync(projectPath)
      if (!stat.isDirectory() || stat.isSymbolicLink()) return []
      return fs.readdirSync(projectPath, { withFileTypes: true })
    }
    function isRoot(list) {
      return list.some(e => !e.isSymbolicLink() && ((e.isFile() && /^(package\.json|readme\.md|cmakelists\.txt|pyproject\.toml|cargo\.toml|go\.mod)$/i.test(e.name)) || (e.name === '.git') || (e.isFile() && /\.sln$/i.test(e.name))))
    }
    function readSmall(file, limit = 262144) {
      try {
        const stat = fs.lstatSync(file)
        if (!stat.isFile() || stat.isSymbolicLink()) return ''
        const fd = fs.openSync(file, 'r')
        try {
          const buffer = Buffer.alloc(Math.min(stat.size, limit))
          return buffer.subarray(0, fs.readSync(fd, buffer, 0, buffer.length, 0)).toString('utf8')
        } finally { fs.closeSync(fd) }
      } catch { return '' }
    }
    function inspect(projectPath) {
      const list = entries(projectPath)
      if (!isRoot(list)) return null
      const hash = crypto.createHash('sha256')
      let files = 0
      let bytes = 0
      let modified = 0
      function walk(folder, depth) {
        for (const entry of entries(folder).sort((a, b) => a.name.localeCompare(b.name))) {
          if (entry.isSymbolicLink() || ignored(entry.name)) continue
          const file = path.join(folder, entry.name)
          if (entry.isDirectory() && depth < 3) walk(file, depth + 1)
          else if (entry.isFile()) {
            const stat = fs.lstatSync(file)
            if (!stat.isFile() || stat.isSymbolicLink()) continue
            files++
            bytes += stat.size
            modified = Math.max(modified, stat.mtimeMs)
            hash.update(JSON.stringify([path.relative(projectPath, file), stat.size, stat.mtimeMs]))
          }
        }
      }
      walk(projectPath, 0)
      const pkgEntry = list.find(e => e.isFile() && e.name.toLowerCase() === 'package.json')
      const pkg = pkgEntry ? safe(() => JSON.parse(readSmall(path.join(projectPath, pkgEntry.name)))) ?? {} : {}
      const readme = list.find(e => e.isFile() && /^readme\.md$/i.test(e.name))
      const readmeText = readme ? readSmall(path.join(projectPath, readme.name)) : ''
      const deps = { ...pkg.dependencies, ...pkg.devDependencies }
      const directFiles = list.filter(e => e.isFile() && !ignored(e.name))
      const ratio = regex => directFiles.length > 0 && directFiles.filter(e => regex.test(e.name)).length / directFiles.length > 0.6
      let type = 'other'
      if (pkgEntry) {
        type = String(pkg.name ?? '').includes('dsh-') ? 'plugin' : ('electron' in deps ? 'app' : ['next', 'vite', 'react'].some(k => k in deps) ? 'web' : 'tool')
      } else if (list.some(e => e.isFile() && /\.sln$|^cmakelists\.txt$/i.test(e.name))) type = 'app'
      else if (list.some(e => e.isFile() && e.name === 'pyproject.toml')) type = 'tool'
      else if (ratio(/\.(mp4|mov)$/i)) type = 'film'
      else if (ratio(/\.(png|jpg)$/i)) type = 'image'
      else if (ratio(/\.md$/i)) type = 'doc'
      let rarity = readme || pkgEntry ? 'fine' : 'common'
      const git = list.find(e => e.name === '.git' && !e.isSymbolicLink())
      if (git) {
        rarity = 'rare'
        if (git.isDirectory()) {
          const tags = safe(() => entries(path.join(projectPath, '.git', 'refs', 'tags'))) ?? []
          if (tags.some(e => !e.isSymbolicLink()) || /^[0-9a-f]+ refs\/tags\//m.test(readSmall(path.join(projectPath, '.git', 'packed-refs')))) rarity = 'legend'
        }
      }
      const description = typeof pkg.description === 'string' ? pkg.description.trim() : ''
      const name = description ? description.split(/[\n。！？!?]/)[0].slice(0, 60) || path.basename(projectPath) : path.basename(projectPath)
      const summary = description.slice(0, 500) || readmeText.split(/\r?\n/).map(s => s.trim()).find(s => s && !/^(#|[!\[<`|>-])/.test(s))?.slice(0, 500) || ''
      function section(pattern) {
        const result = []
        let capture = false
        for (const line of readmeText.split(/\r?\n/)) {
          if (/^#{1,6}\s/.test(line)) capture = pattern.test(line)
          else if (capture && /^\s*(?:[-*+]\s|\d+[.)]\s)/.test(line)) result.push(line.replace(/^\s*(?:[-*+]\s|\d+[.)]\s)/, '').trim().slice(0, 500))
          if (result.length === 12) break
        }
        return result
      }
      const shape = { film: 'ring', image: 'ring', music: 'ring', palette: 'ring', doc: 'page', note: 'page', school: 'page', chart: 'diamond', ai: 'diamond', web: 'square', hardware: 'shield', chip: 'shield' }[type] ?? 'hex'
      return { path: path.resolve(projectPath), name, type, shape, rarity, icon: type, summary, how: section(/怎么做|实现|技术栈|implementation|architecture/i), pitfalls: section(/踩坑|问题|注意|pitfalls|troubleshoot/i), files, bytes, modified, fingerprint: hash.digest('hex') }
    }
    function observe(info, activity = false, sessionId) {
      const key = keyOf(info.path)
      details.set(key, info)
      const existing = itemMap.get(key)
      let waiting = pendingMap.get(key)
      const oldFingerprint = fingerprints.get(key)
      const changed = oldFingerprint !== undefined && oldFingerprint !== info.fingerprint
      if (existing && (existing.files !== info.files || existing.bytes !== info.bytes || changed || activity)) {
        Object.assign(existing, { files: info.files, bytes: info.bytes, updatedAt: now() })
        dirty(items)
      }
      if (!waiting && (!existing || changed || activity)) {
        waiting = { path: info.path, name: info.name, firstSeen: now(), lastActive: now(), hits: 0 }
        pendingMap.set(key, waiting)
        pending.data.items.push(waiting)
        dirty(pending)
      }
      if (waiting && (activity || changed)) {
        waiting.lastActive = now()
        dirty(pending)
      }
      if (waiting && activity) {
        waiting.hits++
        dirty(pending)
      }
      if (sessionId !== undefined && sessionId !== null && String(sessionId)) {
        const seen = sessions.get(key) ?? []
        const id = String(sessionId)
        if (!seen.includes(id)) {
          seen.push(id)
          sessions.set(key, seen)
          if (existing) existing.sessions = (Number(existing.sessions) || 0) + 1
          dirty(items)
          dirty(pending)
        }
      }
      if (oldFingerprint !== info.fingerprint) {
        fingerprints.set(key, info.fingerprint)
        dirty(pending)
      }
    }
    function settle(info) {
      const key = keyOf(info.path)
      const waiting = pendingMap.get(key)
      if (!waiting || now() - waiting.lastActive < cfg.settleHours * 3600000) return false
      let item = itemMap.get(key)
      if (item) Object.assign(item, { files: info.files, bytes: info.bytes, updatedAt: now() })
      else {
        item = {
          id: idFor(info.path), name: info.name, type: info.type, shape: info.shape, rarity: info.rarity, icon: info.icon,
          summary: info.summary, how: info.how, pitfalls: info.pitfalls, path: info.path,
          sessions: sessions.get(key)?.length ?? 0, files: info.files, bytes: info.bytes,
          createdAt: waiting.firstSeen, updatedAt: now(), settledAt: now(), locked: false,
        }
        itemMap.set(key, item)
        items.data.items.push(item)
      }
      dirty(items)
      pendingMap.delete(key)
      pending.data.items = pending.data.items.filter(p => keyOf(p.path) !== key)
      dirty(pending)
      log('info', `结算项目：${info.path}`)
      return true
    }
    function scanRoots() {
      if (!active || !cfg.enabled) return { found: 0, settled: 0, total: itemMap.size }
      let found = 0
      let settled = 0
      const visited = new Set()
      function visit(folder, depth) {
        if (found >= cfg.maxProjects || visited.has(keyOf(folder)) || keyOf(folder) === keyOf(dir)) return
        visited.add(keyOf(folder))
        try {
          const list = entries(folder)
          if (isRoot(list)) {
            const info = inspect(folder)
            if (info) {
              found++
              observe(info)
              if (settle(info)) settled++
            }
          }
          if (depth < 3) {
            for (const entry of list) {
              if (entry.isDirectory() && !entry.isSymbolicLink() && !ignored(entry.name)) visit(path.join(folder, entry.name), depth + 1)
              if (found >= cfg.maxProjects) break
            }
          }
        } catch (e) { if (e.code !== 'ENOENT') log('warn', `扫描跳过 ${folder}：${reason(e)}`) }
      }
      for (const root of roots) visit(root, 0)
      // 事件发现的项目可能不在 roots 中，仍须自动结算，不受发现数量上限影响。
      for (const waiting of [...pendingMap.values()]) {
        if (visited.has(keyOf(waiting.path))) continue
        try {
          const info = inspect(waiting.path)
          if (info) {
            observe(info)
            if (settle(info)) settled++
          }
        } catch {}
      }
      lastScan = now()
      log('info', `扫描：发现 ${found}，结算 ${settled}，档案 ${itemMap.size}`)
      return { found, settled, total: itemMap.size }
    }
    function projectOf(target) {
      if (typeof target !== 'string' || !path.isAbsolute(target)) return null
      let folder = path.resolve(target)
      if (!safe(() => fs.lstatSync(folder).isDirectory())) folder = path.dirname(folder)
      while (true) {
        if (ignored(path.basename(folder)) || keyOf(folder) === keyOf(dir)) return null
        const info = safe(() => inspect(folder))
        if (info) return info
        const parent = path.dirname(folder)
        if (folder === parent) return null
        folder = parent
      }
    }
    function cwdOf(payload) {
      for (const read of [() => payload.cwd, () => payload.workingDirectory, () => payload.session.header.cwd, () => payload.session.meta.cwd, () => payload.session.cwd, () => payload.agent.session.header.cwd, () => payload.agent.session.meta.cwd, () => payload.agent.cwd, () => payload.header.cwd, () => payload.meta.cwd]) {
        const value = safe(read)
        if (typeof value === 'string' && path.isAbsolute(value)) return value
      }
      return ''
    }
    function sessionOf(payload) {
      return safe(() => payload.sessionId) ?? safe(() => payload.session.id) ?? safe(() => payload.agent.session.id) ?? safe(() => payload.agent.sessionId) ?? safe(() => payload.id)
    }
    function onTurnEnd(payload) {
      if (!active || !cfg.enabled) return
      const info = projectOf(cwdOf(payload))
      if (info) observe(info, true, sessionOf(payload))
    }
    function onToolResult(payload, result) {
      if (!active || !cfg.enabled || !payload) return
      const exec = payload.exec ?? payload
      const outcome = result ?? payload.result
      if (!outcome || outcome.isError || outcome.error || outcome.ok === false || outcome.success === false || payload.error) return
      const name = exec.name ?? exec.toolName ?? exec.tool?.name
      if (!['write', 'edit', 'str_replace_editor'].includes(name)) return
      let args = exec.arguments ?? exec.args ?? exec.input ?? {}
      if (typeof args === 'string') args = JSON.parse(args)
      if (name === 'str_replace_editor' && !['create', 'str_replace', 'insert', 'undo_edit'].includes(args.command)) return
      const file = args.path ?? args.file_path ?? args.filePath ?? args.target_file
      if (typeof file !== 'string' || !file) return
      const cwd = cwdOf(exec)
      if (!path.isAbsolute(file) && !cwd) return
      const info = projectOf(path.isAbsolute(file) ? file : path.resolve(cwd, file))
      if (info) observe(info, true, sessionOf(exec))
    }

    function send(res, code, data) {
      try {
        if (res.writableEnded || res.destroyed) return
        res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
        res.end(JSON.stringify(data))
      } catch (e) { log('warn', `响应失败：${reason(e)}`) }
    }
    function readBody(req, res, allowEmpty = false) {
      return new Promise((resolve, reject) => {
        let size = 0
        let chunks = []
        let done = false
        const cleanup = () => {
          for (const [event, callback] of [['data', data], ['end', end], ['error', error], ['aborted', abort], ['close', close]]) req.removeListener(event, callback)
        }
        const finish = (err, value) => {
          if (done) return
          done = true
          cleanup()
          chunks = []
          if (err) reject(err)
          else resolve(value)
        }
        const tooLarge = () => {
          send(res, 413, { ok: false, reason: 'body 超过 64KB' })
          finish(null, null)
          // 先发送响应再关闭输入流；destroy 不传 Error，避免未处理 error 事件。
          safe(() => req.destroy())
        }
        const data = chunk => {
          try {
            const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
            size += buffer.length
            if (size > 65536) tooLarge()
            else chunks.push(buffer)
          } catch (e) { finish(e) }
        }
        const end = () => {
          try {
            const text = Buffer.concat(chunks).toString('utf8')
            finish(null, allowEmpty && !text.trim() ? {} : JSON.parse(text))
          } catch (e) { finish(e) }
        }
        const error = e => finish(e)
        const abort = () => finish(new Error('请求已中断'))
        const close = () => { if (!done) abort() }
        try {
          if (Number(req.headers?.['content-length']) > 65536) {
            tooLarge()
            return
          }
          for (const [event, callback] of [['data', data], ['end', end], ['error', error], ['aborted', abort], ['close', close]]) req.on(event, callback)
        } catch (e) { finish(e) }
      })
    }
    function patchItem(body) {
      if (!body || typeof body.id !== 'string') throw new Error('id 必须是字符串')
      const item = items.data.items.find(i => i.id === body.id)
      if (!item) throw new Error('id 不存在')
      const patch = body.patch
      if (!patch || typeof patch !== 'object' || Array.isArray(patch) || !Object.keys(patch).length) throw new Error('patch 必须是非空对象')
      for (const [key, value] of Object.entries(patch)) {
        if (!['name', 'summary', 'how', 'pitfalls', 'locked'].includes(key)) throw new Error(`不可修改字段：${key}`)
        if (['name', 'summary'].includes(key) && typeof value !== 'string') throw new Error(`${key} 必须是字符串`)
        if (['how', 'pitfalls'].includes(key) && (!Array.isArray(value) || !value.every(v => typeof v === 'string'))) throw new Error(`${key} 必须是字符串数组`)
        if (key === 'locked' && typeof value !== 'boolean') throw new Error('locked 必须是布尔值')
      }
      // 文档规定任何手改均锁定，包含仅提交 locked:false 的情况。
      Object.assign(item, patch, { locked: true, updatedAt: now() })
      dirty(items)
      return item
    }
    async function handler(req, res) {
      try {
        if (!['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket?.remoteAddress)) {
          send(res, 403, { ok: false, reason: '仅允许本机访问' })
          return
        }
        if (!active) {
          send(res, 503, { ok: false, reason: '插件已卸载' })
          return
        }
        const url = new URL(req.url, 'http://127.0.0.1')
        if (!paths.includes(url.pathname)) {
          send(res, 404, { ok: false, reason: '接口不存在' })
          return
        }
        const route = url.pathname.split('/').pop()
        if (req.method === 'GET' && route === 'list.json') {
          const result = [...items.data.items]
          if (cfg.includePending) {
            for (const waiting of pendingMap.values()) {
              if (itemMap.has(keyOf(waiting.path))) continue
              const info = details.get(keyOf(waiting.path))
              result.push({ id: `pending:${keyOf(waiting.path)}`, name: info?.name ?? waiting.name, type: info?.type ?? 'other', shape: info?.shape ?? 'hex', rarity: info?.rarity ?? 'common', icon: info?.icon ?? 'other', summary: info?.summary ?? '', how: info?.how ?? [], pitfalls: info?.pitfalls ?? [], path: waiting.path, sessions: sessions.get(keyOf(waiting.path))?.length ?? 0, files: info?.files ?? 0, bytes: info?.bytes ?? 0, createdAt: waiting.firstSeen, updatedAt: waiting.lastActive, settledAt: 0, locked: false, pending: true })
            }
          }
          send(res, 200, { ok: true, updatedAt: items.data.updatedAt, items: result, pendingCount: pendingMap.size })
        } else if (req.method === 'GET' && route === 'item.json') {
          const item = items.data.items.find(i => i.id === url.searchParams.get('id'))
          send(res, item ? 200 : 404, item ? { ok: true, item } : { ok: false, reason: 'id 不存在' })
        } else if (req.method === 'POST' && route === 'item.json') {
          let body
          try { body = await readBody(req, res) } catch (e) {
            send(res, 400, { ok: false, reason: reason(e) })
            return
          }
          if (res.writableEnded || res.destroyed) return
          if (!active) {
            send(res, 503, { ok: false, reason: '插件已卸载' })
            return
          }
          try { send(res, 200, { ok: true, item: patchItem(body) }) } catch (e) { send(res, 400, { ok: false, reason: reason(e) }) }
        } else if (req.method === 'POST' && route === 'scan.json') {
          try { await readBody(req, res, true) } catch (e) {
            send(res, 400, { ok: false, reason: reason(e) })
            return
          }
          if (res.writableEnded || res.destroyed) return
          if (!active) {
            send(res, 503, { ok: false, reason: '插件已卸载' })
            return
          }
          send(res, 200, { ok: true, ...scanRoots() })
        } else if (req.method === 'GET' && route === 'status.json') {
          send(res, 200, { ok: true, lastScan, pendingCount: pendingMap.size, totalCount: itemMap.size, failedWrites, dir })
        } else send(res, 405, { ok: false, reason: '不支持的请求方法' })
      } catch (e) {
        log('warn', `HTTP：${reason(e)}`)
        send(res, 500, { ok: false, reason: reason(e), items: [] })
      }
    }
    function effect(register, label) {
      try {
        ctx.effect(() => {
          try { return register() ?? (() => {}) } catch (e) {
            log('warn', `${label}：${reason(e)}`)
            return () => {}
          }
        }, label)
      } catch (e) { log('warn', `${label}：${reason(e)}`) }
    }
    // flush 先注册；无论宿主按正序或逆序清理，active 都会拦住晚到的请求。
    effect(() => () => { try { flushSync() } catch (e) { log('warn', reason(e)) } }, 'museum.flush')
    try {
      ctx.inject(['tools'], toolCtx => {
        try {
          if (!active || !toolCtx?.tools) return
          effect(() => {
            const off = ctx.on('tools/result', (payload, result) => {
              try { onToolResult(payload, result) } catch (e) { log('warn', reason(e)) }
            })
            return () => dispose(off)
          }, 'museum.tools')
        } catch (e) { log('warn', reason(e)) }
      })
    } catch (e) { log('warn', reason(e)) }
    effect(() => {
      const off = ctx.on('turn/end', payload => {
        try { onTurnEnd(payload) } catch (e) { log('warn', reason(e)) }
      })
      return () => dispose(off)
    }, 'museum.turn')
    effect(() => {
      const off = ctx.on('session/event', (session, event) => {
        try { if (event?.type === 'turn/end') onTurnEnd({ session }) } catch (e) { log('warn', reason(e)) }
      })
      return () => dispose(off)
    }, 'museum.session')
    try {
      ctx.inject(['webServer'], webCtx => {
        try {
          const server = webCtx?.webServer
          if (!active || typeof server?.register !== 'function') return
          effect(() => {
            const disposers = []
            const cleanup = () => { for (const off of disposers.splice(0).reverse()) dispose(off) }
            try { for (const route of paths) disposers.push(server.register({ kind: 'exact', path: route, handler })) } catch (e) {
              cleanup()
              throw e
            }
            return cleanup
          }, 'museum.routes')
        } catch (e) { log('warn', reason(e)) }
      })
    } catch (e) { log('warn', reason(e)) }
    effect(() => {
      if (!cfg.enabled) return () => {}
      const timer = setInterval(() => { try { scanRoots() } catch (e) { log('warn', reason(e)) } }, cfg.scanMinutes * 60000)
      timer.unref?.()
      return () => clearInterval(timer)
    }, 'museum.scan')
    // 重放关机期间已满足静默期的 pending，并检查关机期间是否有新文件修改。
    if (cfg.enabled) {
      for (const waiting of [...pendingMap.values()]) {
        try {
          const info = inspect(waiting.path)
          if (!info) continue
          if (!fingerprints.has(keyOf(info.path)) && info.modified > waiting.lastActive) waiting.lastActive = Math.min(now(), info.modified)
          observe(info)
          settle(info)
        } catch (e) { log('warn', `恢复待定项目失败：${reason(e)}`) }
      }
      scanRoots()
    }
  } catch (e) { log('warn', `博物馆初始化失败：${String(e?.message ?? e)}`) }
}
