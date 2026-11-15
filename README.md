# dsh-museum · 项目博物馆

把做过的项目自动收进一座博物馆。项目静置一段时间后自动入库，按类型生成勋章，点开能看到它做什么、怎么做的、踩过哪些坑。

## 它做什么

- **自动发现**：从会话回合、文件写入事件、定时扫描三处捕捉项目
- **静置入库**：项目最后一次改动后静默 `settleHours` 小时，才算完工入馆（默认 6 小时）
- **自动保存**：原子写 + 防抖 + 重试 + 崩溃恢复，七道保险，断电不丢
- **勋章**：6 种形状 × 4 档稀有度 × 20 个图标，全部内联 SVG，零图片
- **详情**：作用 / 怎么做的 / 踩过的坑 / 路径 / 会话数 / 最后更新，可复制路径、可打开文件夹

## 安装

1. 把 `dsh-museum` 放进插件目录
2. 在 profile 的 `package.json` 里加依赖与 bundle：

```json
{
  "dependencies": { "dsh-museum": "link:D:/插件/dsh-museum" },
  "dsh": { "profile": { "bundles": ["dsh-museum"] } }
}
```

3. 关掉 DSH 窗口重新打开

## 配置

`cordis.patch.yml`：

```yaml
roots:            # 要扫描的根目录
  - 'D:\插件'
settleHours: 6    # 完工静默期（小时）
maxProjects: 200  # 单次扫描上限
scanMinutes: 10    # 后台扫描间隔
enabled: true     # 总开关
```

## 数据位置

`~/.dsh/museum/`

| 文件 | 内容 |
|---|---|
| `items.json` | 已完工项目档案 |
| `pending.json` | 已发现、还没静置够的项目 |
| `log.jsonl` | 操作日志 |

## 接口

双写路径 `/api/museum/*` 与 `/museum/*`：

- `GET list.json` — 项目列表
- `GET item.json?id=` — 单条
- `POST item.json` — 手动改名字/作用/做法/坑（改完自动锁定，不再被自动流程覆盖）
- `POST scan.json` — 立即扫描
- `GET status.json` — 上次扫描、待定数、总数

## 只读承诺

扫描过程**绝不写入**任何项目目录。

## License

MIT
