/* dsh-museum client —— 项目博物馆 HUD（Shadow DOM 隔离，非 ESM） */
;(function () {
  if (typeof window === "undefined" || !window.__ModuleLoader__ || typeof window.__ModuleLoader__.load !== "function") {
    try { console.warn("[dsh-museum] 缺少 __ModuleLoader__，跳过界面") } catch (e) {}
    return;
  }
  window.__ModuleLoader__.load({
    id: "dsh-museum",
    factory: function () {
      var module = { exports: {} };
      var exports = module.exports;
      Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

      var CSS = ":host{\n  --bg:#F7F9FC; --card:#FFFFFF; --line:rgba(148,163,184,.32); --line-strong:rgba(100,116,139,.55);\n  --primary:#2563EB; --text:#0F172A; --text2:#475569; --text3:#94A3B8; --warn:#F97316;\n  --sh-1:0 1px 2px rgba(15,23,42,.06); --sh-2:0 8px 24px rgba(15,23,42,.08);\n  --ease:cubic-bezier(.2,.8,.2,1); --ease-out:cubic-bezier(.22,1,.36,1);\n  --mono:ui-monospace,Consolas,monospace;\n}\n*{box-sizing:border-box}\n:host{margin:0;padding:0}\nhtml.hud-lock{overflow:hidden}\n:host{\n  display:block; background:var(--bg); color:var(--text);\n  font-family:\"Microsoft YaHei\",\"PingFang SC\",system-ui,-apple-system,sans-serif; font-size:14px; line-height:1.5;\n  -webkit-font-smoothing:antialiased;\n}\nbutton,input{font-family:inherit;font-size:inherit;color:inherit}\nbutton{cursor:pointer}\nul,ol{margin:0;padding:0;list-style:none}\n:focus{outline:none}\n:focus-visible{outline:2px solid var(--primary);outline-offset:2px}\n.panel:focus,.panel:focus-visible{outline:none}\n\n/* ---------- 演示页 ---------- */\n.page{flex:1;display:flex;align-items:center;justify-content:center;padding:72px 24px 24px}\n.hero{max-width:520px;text-align:center}\n.hero h1{margin:0 0 10px;font-size:26px;letter-spacing:.02em}\n.hero p{margin:0;color:var(--text2)}\n.hero .hint{margin-top:18px;color:var(--text3);font-size:12px}\n.foot{padding:18px 24px 22px;text-align:center;color:var(--text3);font-size:12px}\n\n/* ---------- 右上角按钮 ---------- */\n.mbtn{\n  position:relative;width:32px;height:32px;padding:0;border:0;border-radius:10px;\n  background:var(--card);color:var(--primary);display:flex;align-items:center;justify-content:center;\n  box-shadow:0 0 0 1px var(--line),var(--sh-1);\n  transition:transform 140ms var(--ease),box-shadow 140ms var(--ease);\n}\n.mbtn:hover{transform:translateY(-1px);box-shadow:0 0 0 1px var(--line-strong),var(--sh-2),var(--sh-1)}\n.mbtn:active{transform:translateY(1px)}\n.mbtn.pressed{animation:btnPress 120ms ease-out}\n.mbtn svg{display:block;width:16px;height:16px}\n.mbtn .badge{\n  position:absolute;top:-6px;right:-6px;min-width:14px;height:14px;padding:0 3px;border-radius:7px;\n  background:var(--primary);color:#fff;font-size:9px;font-weight:700;line-height:14px;text-align:center;\n  box-shadow:0 0 0 1.5px #fff;font-variant-numeric:tabular-nums;pointer-events:none;\n}\n@keyframes btnPress{0%{transform:translateY(0)}50%{transform:translateY(1px)}100%{transform:translateY(0)}}\n\n/* ---------- HUD 浮层 ---------- */\n.hud{\n  position:fixed;left:0;top:0;right:0;bottom:0;z-index:100;display:flex;align-items:center;justify-content:center;\n  background:rgba(15,23,42,.18);-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px);\n  opacity:0;visibility:hidden;transition:opacity 180ms linear,visibility 0s linear 180ms;\n}\n.hud.is-open{opacity:1;visibility:visible;transition:opacity 180ms linear,visibility 0s linear 0s}\n.panel{\n  position:relative;width:min(1120px,92vw);height:82vh;max-height:calc(100vh - 24px);border-radius:20px;background:var(--bg);overflow:hidden;\n  display:flex;flex-direction:column;box-shadow:var(--sh-2),var(--sh-1);\n  opacity:0;transform:translateY(12px) scale(.985);transition:transform 180ms ease-in,opacity 180ms linear;\n}\n.hud.is-open .panel{opacity:1;transform:none;transition:transform 240ms var(--ease),opacity 240ms var(--ease)}\n/* 光影：左上极淡径向高光 + 右缘 1px 内高光 */\n.panel:before{\n  content:\"\";position:absolute;left:0;top:0;width:70%;height:60%;z-index:0;pointer-events:none;\n  background:radial-gradient(ellipse at 0 0,rgba(255,255,255,.5) 0%,rgba(255,255,255,0) 70%);\n}\n.panel:after{content:\"\";position:absolute;right:0;top:0;bottom:0;width:1px;z-index:4;pointer-events:none;background:rgba(255,255,255,.6)}\n\n.top{position:relative;z-index:2;display:flex;align-items:center;flex-wrap:wrap;gap:10px 14px;padding:14px 20px;background:#fff;border-bottom:1px solid var(--line);flex:0 0 auto}\n.top h2{margin:0;font-size:17px;font-weight:700;letter-spacing:.04em;flex:0 0 auto}\n.pills{flex:1 1 280px;min-width:0;display:flex;gap:6px;overflow-x:auto;padding:2px;scrollbar-width:none}\n.pills::-webkit-scrollbar{display:none}\n.pill-btn{\n  flex:0 0 auto;height:26px;padding:0 11px;border:0;border-radius:13px;background:#F1F5F9;color:var(--text2);font-size:12px;\n  box-shadow:0 0 0 1px transparent;\n}\n.pill-btn:hover{background:#E8EEF6}\n.pill-btn.on{background:var(--primary);color:#fff}\n.search{position:relative;flex:0 0 190px}\n.search input{\n  width:100%;height:30px;padding:0 10px 0 30px;border:0;border-radius:10px;background:#F1F5F9;color:var(--text);\n  box-shadow:0 0 0 1px var(--line);\n}\n.search input::placeholder{color:var(--text3)}\n.search input:focus{background:#fff;box-shadow:0 0 0 1px var(--primary)}\n.search svg{position:absolute;left:9px;top:8px;width:14px;height:14px;pointer-events:none}\n.xbtn{\n  flex:0 0 auto;width:30px;height:30px;padding:0;border:0;border-radius:10px;background:#F1F5F9;display:flex;align-items:center;justify-content:center;\n  transition:transform 120ms var(--ease);\n}\n.xbtn:hover{background:#E8EEF6}\n.xbtn:active{transform:translateY(1px)}\n.xbtn svg{width:14px;height:14px;display:block}\n\n.body{position:relative;z-index:2;flex:1 1 auto;min-height:0;overflow-y:auto;padding:22px 24px 26px}\n.grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:18px}\n.cell{min-width:0}\n.grid.stag .cell{animation:medalIn 260ms var(--ease) both;animation-delay:var(--d,0ms)}\n.grid.soft .cell{animation:softIn 160ms linear both}\n@keyframes medalIn{from{opacity:0;transform:translateY(10px) scale(.94)}to{opacity:1;transform:none}}\n@keyframes softIn{from{opacity:0}to{opacity:1}}\n\n.card{\n  width:100%;display:flex;flex-direction:column;align-items:center;padding:14px 10px 12px;border:0;border-radius:16px;background:var(--card);text-align:center;\n  box-shadow:0 0 0 1px var(--line),var(--sh-1);\n  transition:transform 160ms var(--ease),box-shadow 180ms var(--ease);\n}\n.card:hover,.card:focus-visible{\n  transform:translateY(-3px) scale(1.04);\n  box-shadow:0 0 0 1px var(--tone-line,var(--line-strong)),0 0 22px 3px var(--glow,rgba(37,99,235,.28)),var(--sh-2);\n}\n.card.sel{box-shadow:0 0 0 2px var(--primary),var(--sh-1)}\n.card.press{animation:pressA 230ms var(--ease)}\n.card.press:hover{animation:pressB 230ms var(--ease)}\n@keyframes pressA{0%{transform:none}38%{transform:scale(.97)}100%{transform:none}}\n@keyframes pressB{0%{transform:translateY(-3px) scale(1.04)}38%{transform:scale(.97)}100%{transform:translateY(-3px) scale(1.04)}}\n.medal{display:block;width:96px;height:96px;flex:0 0 auto}\n.medal svg{display:block;width:100%;height:100%}\n.nm{display:block;max-width:100%;margin-top:8px;font-size:13px;font-weight:600;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.sub{display:block;max-width:100%;margin-top:2px;font-size:11px;color:var(--text3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.more-wrap{display:flex;justify-content:center;padding-top:22px}\n.more-wrap:empty{display:none}\n.more-btn{height:32px;padding:0 18px;border:0;border-radius:10px;background:#fff;color:var(--primary);font-size:13px;box-shadow:0 0 0 1px var(--line),var(--sh-1)}\n.more-btn:hover{box-shadow:0 0 0 1px var(--primary),var(--sh-1)}\n.empty{padding:70px 0;text-align:center;color:var(--text3)}\n\n/* ---------- 详情抽屉 ---------- */\n.drawer{\n  position:absolute;z-index:5;top:12px;right:12px;bottom:12px;width:min(380px,calc(100% - 24px));border-radius:18px;background:#fff;\n  display:flex;flex-direction:column;overflow:hidden;\n  box-shadow:0 0 0 1px var(--line),var(--sh-2),var(--sh-1);\n  opacity:0;visibility:hidden;transform:translateX(24px);\n  transition:transform 180ms ease-in,opacity 180ms linear,visibility 0s linear 180ms;\n}\n.drawer.is-open{opacity:1;visibility:visible;transform:none;transition:transform 320ms var(--ease-out),opacity 320ms var(--ease-out),visibility 0s linear 0s}\n.dr-scroll{flex:1 1 auto;min-height:0;overflow-y:auto;padding:20px 20px 8px}\n.dr-it{opacity:0;animation:fieldIn 260ms var(--ease-out) both;animation-delay:var(--d,0ms)}\n@keyframes fieldIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}\n.dr-head{display:flex;gap:14px;align-items:center;margin-bottom:16px;padding-right:30px}\n.dr-medal{flex:0 0 120px;width:120px;height:120px}\n.dr-medal svg{display:block;width:100%;height:100%}\n.dr-title{margin:0 0 8px;font-size:19px;font-weight:700;line-height:1.25;word-break:break-all}\n.chips{display:flex;flex-wrap:wrap;gap:6px}\n.chip{display:inline-flex;align-items:center;height:22px;padding:0 9px;border-radius:11px;background:#F1F5F9;color:var(--text2);font-size:11.5px;white-space:nowrap}\n.chip i{display:block;width:6px;height:6px;border-radius:3px;margin-right:6px}\n.chip.r-common{background:#F1F5F9;color:#475569}\n.chip.r-fine{background:#EFF6FF;color:#1D4ED8}\n.chip.r-rare{background:#F5F3FF;color:#6D28D9}\n.chip.r-legend{background:#FEF6E0;color:#8A5A00}\n.dr-sec{margin:0 0 14px}\n.dr-sec h4{margin:0 0 6px;font-size:12px;font-weight:700;color:var(--text3);letter-spacing:.08em}\n.dr-sec p{margin:0;color:var(--text);line-height:1.65}\n.dr-sec li{position:relative;padding-left:20px;margin-bottom:5px;color:var(--text);line-height:1.55}\n.how li{counter-increment:st}\n.how li:before{\n  content:counter(st);position:absolute;left:0;top:2px;width:15px;height:15px;border-radius:8px;background:#EFF6FF;color:var(--primary);\n  font:700 10px/15px var(--mono);text-align:center;\n}\n.how{counter-reset:st}\n.pit li:before{content:\"\";position:absolute;left:4px;top:8px;width:7px;height:7px;border-radius:4px;background:var(--warn)}\n.dr-meta{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px}\n.dr-meta .full{grid-column:1 / 3}\n.kv{padding:8px 10px;border-radius:10px;background:var(--bg);box-shadow:0 0 0 1px var(--line)}\n.kv b{display:block;font-size:11px;font-weight:600;color:var(--text3);margin-bottom:1px}\n.kv span{display:block;font-family:var(--mono);font-size:12.5px;color:var(--text);word-break:break-all}\n.dr-foot{flex:0 0 auto;display:flex;gap:10px;padding:12px 20px 18px;border-top:1px solid var(--line);background:#fff}\n.btn{\n  flex:1 1 0;height:34px;border:0;border-radius:10px;font-size:13px;font-weight:600;\n  transition:transform 120ms var(--ease),box-shadow 160ms var(--ease);\n}\n.btn:active{transform:translateY(1px)}\n.btn.pri{background:var(--primary);color:#fff;box-shadow:var(--sh-1)}\n.btn.pri:hover{box-shadow:var(--sh-2),var(--sh-1)}\n.btn.sec{background:#fff;color:var(--text);box-shadow:0 0 0 1px var(--line),var(--sh-1)}\n.btn.sec:hover{box-shadow:0 0 0 1px var(--line-strong),var(--sh-1)}\n.dr-x{position:absolute;right:12px;top:12px;z-index:2}\n.toast{\n  position:absolute;left:50%;bottom:22px;z-index:8;max-width:80%;margin-left:0;padding:8px 14px;border-radius:10px;background:var(--text);color:#fff;font-size:12px;\n  opacity:0;transform:translate(-50%,6px);pointer-events:none;transition:opacity 160ms linear,transform 160ms var(--ease);\n  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;\n}\n.toast.show{opacity:1;transform:translate(-50%,0)}\n\n@media (max-width:1100px){.grid{grid-template-columns:repeat(3,minmax(0,1fr))}}\n@media (max-width:720px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}.search{flex:1 1 140px}.top h2{flex:1 1 auto}.dr-head{flex-direction:column;align-items:flex-start}}\n\n@media (prefers-reduced-motion:reduce){\n  .grid.stag .cell,.grid.soft .cell{animation:softIn 160ms linear both;animation-delay:0ms}\n  .dr-it{animation:softIn 120ms linear both;animation-delay:0ms}\n  .panel,.hud.is-open .panel{transform:none;transition:opacity 160ms linear}\n  .drawer,.drawer.is-open{transform:none;transition:opacity 160ms linear,visibility 0s linear 160ms}\n  .drawer.is-open{transition:opacity 160ms linear,visibility 0s linear 0s}\n  .card,.card:hover,.card:focus-visible{transform:none}\n  .card.press,.card.press:hover,.mbtn.pressed{animation:none}\n  .mbtn:hover,.mbtn:active{transform:none}\n  .toast{transform:translate(-50%,0)}\n}\n/* 插件里不显示演示页 */\n.page,.foot{display:none !important}\n/* 跟随宿主暗色 */\n:host(.dark){--bg:#0B1220;--card:#111A2B;--line:rgba(148,163,184,.22);--line-strong:rgba(148,163,184,.42);--text:#E5EAF3;--text2:#94A3B8;--text3:#64748B;--sh-1:0 1px 2px rgba(0,0,0,.35);--sh-2:0 8px 24px rgba(0,0,0,.45)}\n";
      var HTML = "\n<button class=\"mbtn\" id=\"mbtn\" type=\"button\" aria-label=\"打开项目博物馆\" aria-haspopup=\"dialog\" aria-expanded=\"false\" title=\"项目博物馆\">\n  <svg viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.15\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\">\n    <path d=\"M8 1.4 L13.4 3.3 V7.9 C13.4 10.9 11.1 13.1 8 14.6 C4.9 13.1 2.6 10.9 2.6 7.9 V3.3 Z\"/>\n    <path d=\"M8 4.9 L8.95 6.85 L11.1 7.15 L9.55 8.65 L9.9 10.8 L8 9.8 L6.1 10.8 L6.45 8.65 L4.9 7.15 L7.05 6.85 Z\"/>\n  </svg>\n  <span class=\"badge\" id=\"badge\">0</span>\n</button>\n\n<main class=\"page\">\n  <div class=\"hero\">\n    <h1>我这些年做过的项目</h1>\n    <p>每一个项目都是一枚勋章：形状代表类型，边框与光泽代表稀有度。</p>\n    <p class=\"hint\">点击右上角的盾徽，打开「项目博物馆」</p>\n  </div>\n</main>\n<footer class=\"foot\" id=\"foot\"></footer>\n\n<div class=\"hud\" id=\"hud\" aria-hidden=\"true\">\n  <div class=\"panel\" id=\"panel\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"hud-title\" tabindex=\"-1\">\n    <header class=\"top\">\n      <h2 id=\"hud-title\">项目博物馆</h2>\n      <div class=\"pills\" id=\"pills\" role=\"group\" aria-label=\"类型筛选\"></div>\n      <label class=\"search\">\n        <svg viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"#94A3B8\" stroke-width=\"1.5\" stroke-linecap=\"round\" aria-hidden=\"true\"><circle cx=\"7\" cy=\"7\" r=\"4.6\"/><path d=\"M10.5 10.5 L14 14\"/></svg>\n        <input id=\"q\" type=\"search\" placeholder=\"搜索项目\" aria-label=\"搜索项目\" autocomplete=\"off\">\n      </label>\n      <button class=\"xbtn\" id=\"hud-x\" type=\"button\" aria-label=\"关闭\">\n        <svg viewBox=\"0 0 14 14\" fill=\"none\" stroke=\"#475569\" stroke-width=\"1.6\" stroke-linecap=\"round\" aria-hidden=\"true\"><path d=\"M3 3 L11 11 M11 3 L3 11\"/></svg>\n      </button>\n    </header>\n    <div class=\"body\" id=\"body\">\n      <ul class=\"grid stag\" id=\"grid\"></ul>\n      <div class=\"empty\" id=\"empty\" style=\"display:none\">没有匹配的项目</div>\n      <div class=\"more-wrap\" id=\"more\"></div>\n    </div>\n    <aside class=\"drawer\" id=\"drawer\" aria-hidden=\"true\" aria-label=\"项目详情\"></aside>\n    <div class=\"toast\" id=\"toast\" role=\"status\"></div>\n  </div>\n</div>\n";
      var HOLDER_ID = "dshmuseum-holder";
      var root = null;

      function warn(msg) { try { console.warn("[dsh-museum] " + msg) } catch (e) {} }

      /* ===== 勋章渲染器 + 常量（模块级） ===== */
      /* 说明：原提示词里的渲染器引用了常量 R 但没有定义；按其注释（42*0.86≈36.1）补 R = 42，渲染器本体一字未改。 */
var R = 42;

/* ===== 勋章渲染器（原样粘贴，不改动） ===== */
var PALETTE = {
  hue:        { hex:220, ring:272, diamond:186, square:148, shield:32, page:210 },
  sat:        { hex:78,  ring:72,  diamond:76,  square:60,  shield:88, page:22 },
  fillOpacity:   { common:0.12, fine:0.18, rare:0.24, legend:0.30 },
  strokeOpacity: { common:0.55, fine:0.70, rare:0.85, legend:1.00 },
  plateLight:  56,
  strokeLight: 46,
  inkDrop:     30,
  iconDark:    '#0F172A',
  iconLight:   '#F1F5F9',
  ribbonFill:  '#F1F5F9',
  gold:        '#E7C170',
  goldLight:   '#F7DFA6',
  halo:        '#FFFFFF',
  glowPeak:    0.34
};

var FONT = "system-ui, -apple-system, 'Segoe UI', 'Helvetica Neue', Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif";

var SHAPES = [
  { key:'hex',     name:'六边形', cat:'造物' },
  { key:'ring',    name:'双圆环', cat:'媒体' },
  { key:'diamond', name:'菱形',   cat:'数据' },
  { key:'square',  name:'圆角方', cat:'网络' },
  { key:'shield',  name:'盾形',   cat:'实体' },
  { key:'page',    name:'书页',   cat:'文本' }
];
var RARITIES = [
  { key:'common', name:'普通' },
  { key:'fine',   name:'精良' },
  { key:'rare',   name:'稀有' },
  { key:'legend', name:'传说' }
];


var ICON_INNER = {
  app:      '<rect x="6" y="10" width="36" height="30" rx="3"/><path d="M6 19 H42"/><path d="M11 14.5 h.01 M16 14.5 h.01 M21 14.5 h.01"/>',
  plugin:   '<path d="M10 14 H20 A5 5 0 0 1 30 14 H38 V22 A5 5 0 0 1 38 32 V38 H10 Z"/>',
  game:     '<rect x="6" y="17" width="36" height="19" rx="9.5"/><path d="M16 23 V31 M12 27 H20"/><circle cx="31" cy="24" r="1.6"/><circle cx="35" cy="29" r="1.6"/>',
  terminal: '<rect x="6" y="9" width="36" height="30" rx="3"/><path d="M12 18 L17 23 L12 28"/><path d="M21 29 H29"/>',
  script:   '<path d="M12 6 H28 L36 14 V42 H12 Z"/><path d="M28 6 V14 H36"/><path d="M25 19 L20 28 H25 L22 38 L30 27 H25 Z"/>',
  film:     '<rect x="6" y="12" width="36" height="24" rx="2"/><path d="M14 12 V36 M34 12 V36"/><path d="M9 17 h2 M9 23 h2 M9 29 h2 M9 33 h2 M37 17 h2 M37 23 h2 M37 29 h2 M37 33 h2"/><rect x="18" y="18" width="12" height="12" rx="1"/>',
  image:    '<rect x="6" y="9" width="36" height="30" rx="3"/><circle cx="17" cy="18" r="3"/><path d="M9 35 L20 24 L27 31 L33 25 L39 35"/>',
  music:    '<path d="M20 32 V11 L36 7 V28"/><ellipse cx="15" cy="33" rx="5" ry="4"/><ellipse cx="31" cy="29" rx="5" ry="4"/>',
  cube:     '<path d="M24 6 L40 15 V33 L24 42 L8 33 V15 Z"/><path d="M8 15 L24 24 L40 15 M24 24 V42"/>',
  doc:      '<path d="M12 6 H28 L36 14 V42 H12 Z"/><path d="M28 6 V14 H36"/><path d="M17 22 H31 M17 28 H31 M17 34 H26"/>',
  note:     '<rect x="12" y="9" width="26" height="33" rx="3"/><path d="M17 9 V5 M23 9 V5 M29 9 V5 M35 9 V5"/><path d="M17 19 H33 M17 26 H33 M17 33 H28"/>',
  school:   '<path d="M4 18 L24 8 L44 18 L24 28 Z"/><path d="M12 23 V33 C12 38 36 38 36 33 V23"/><path d="M40 21 V32"/><circle cx="40" cy="35" r="2"/>',
  chart:    '<path d="M8 7 V40 H42"/><path d="M14 38 V27 M22 38 V21 M30 38 V29"/><path d="M12 19 L20 13 L28 17 L40 8"/>',
  ai:       '<path d="M24 5 C25 16 29 19 40 20 C29 21 25 24 24 35 C23 24 19 21 8 20 C19 19 23 16 24 5 Z"/><circle cx="24" cy="20" r="2.4"/>',
  chip:     '<rect x="14" y="14" width="20" height="20" rx="2"/><rect x="20" y="20" width="8" height="8" rx="1"/><path d="M20 14 V8 M28 14 V8 M20 34 V40 M28 34 V40 M14 20 H8 M14 28 H8 M34 20 H40 M34 28 H40"/>',
  web:      '<circle cx="24" cy="24" r="18"/><ellipse cx="24" cy="24" rx="8" ry="18"/><path d="M6 24 H42 M10 14 H38 M10 34 H38"/>',
  palette:  '<path d="M24 6 C14 6 6 14 6 24 C6 34 14 42 24 42 C29 42 31 39 31 36 C31 33 29 31 32 30 H37 C40 30 42 28 42 24 C42 14 34 6 24 6 Z"/><circle cx="15" cy="19" r="1.8"/><circle cx="22" cy="14" r="1.8"/><circle cx="30" cy="17" r="1.8"/>',
  hardware: '<rect x="10" y="10" width="28" height="28" rx="2"/><path d="M16 17 H26 V25 H34 M16 32 H23 V26"/><circle cx="16" cy="17" r="1.6"/><circle cx="34" cy="25" r="1.6"/><circle cx="23" cy="26" r="1.6"/>',
  tool:     '<path d="M29.4 12.6 a2 2 0 0 0 0 2.8 l3.2 3.2 a2 2 0 0 0 2.8 0 l7.54 -7.54 a12 12 0 0 1 -15.88 15.88 l-13.82 13.82 a4.24 4.24 0 0 1 -6 -6 l13.82 -13.82 a12 12 0 0 1 15.88 -15.88 l-7.52 7.52 z"/>',
  other:    '<circle cx="24" cy="24" r="18"/><path d="M17 18 A7 7 0 1 1 24 27 V31"/><path d="M24 37 h.01"/>'
};

var ICONS = [
  { key:'app',      label:'程序窗口' },
  { key:'plugin',   label:'拼图块' },
  { key:'game',     label:'手柄' },
  { key:'terminal', label:'终端' },
  { key:'script',   label:'脚本' },
  { key:'film',     label:'胶片' },
  { key:'image',    label:'图像' },
  { key:'music',    label:'音符' },
  { key:'cube',     label:'立方体' },
  { key:'doc',      label:'文档' },
  { key:'note',     label:'笔记本' },
  { key:'school',   label:'学士帽' },
  { key:'chart',    label:'柱状图' },
  { key:'ai',       label:'AI 星芒' },
  { key:'chip',     label:'芯片' },
  { key:'web',      label:'地球' },
  { key:'palette',  label:'调色板' },
  { key:'hardware', label:'电路板' },
  { key:'tool',     label:'扳手' },
  { key:'other',    label:'问号' }
];

/* ---------- 通用小工具 ---------- */
function n(v){ return Math.round(v * 100) / 100; }
function pt(x, y){ return n(x) + ' ' + n(y); }
function polar(cx, cy, r, deg){ var a = deg * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; }
function polyPath(points){
  var d = 'M ' + pt(points[0][0], points[0][1]);
  for (var i = 1; i < points.length; i++) d += ' L ' + pt(points[i][0], points[i][1]);
  return d + ' Z';
}
function circlePath(cx, cy, r){
  return 'M ' + pt(cx - r, cy) + ' A ' + n(r) + ' ' + n(r) + ' 0 1 0 ' + pt(cx + r, cy) +
         ' A ' + n(r) + ' ' + n(r) + ' 0 1 0 ' + pt(cx - r, cy) + ' Z';
}
function roundedRectPath(x0, y0, x1, y1, rx){
  return 'M ' + pt(x0 + rx, y0) + ' H ' + n(x1 - rx) +
         ' A ' + n(rx) + ' ' + n(rx) + ' 0 0 1 ' + pt(x1, y0 + rx) + ' V ' + n(y1 - rx) +
         ' A ' + n(rx) + ' ' + n(rx) + ' 0 0 1 ' + pt(x1 - rx, y1) + ' H ' + n(x0 + rx) +
         ' A ' + n(rx) + ' ' + n(rx) + ' 0 0 1 ' + pt(x0, y1 - rx) + ' V ' + n(y0 + rx) +
         ' A ' + n(rx) + ' ' + n(rx) + ' 0 0 1 ' + pt(x0 + rx, y0) + ' Z';
}

function diamondAt(x, y, s){ return 'M ' + pt(x, y - s) + ' L ' + pt(x + s, y) + ' L ' + pt(x, y + s) + ' L ' + pt(x - s, y) + ' Z'; }
function starAt(x, y, s){
  var k = s * 0.22;
  return 'M ' + pt(x, y - s) + ' Q ' + pt(x + k, y - k) + ' ' + pt(x + s, y) +
         ' Q ' + pt(x + k, y + k) + ' ' + pt(x, y + s) +
         ' Q ' + pt(x - k, y + k) + ' ' + pt(x - s, y) +
         ' Q ' + pt(x - k, y - k) + ' ' + pt(x, y - s) + ' Z';
}

function hslToRgb(h, s, l){
  h = h % 360; if (h < 0) h += 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;
  var c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2;
  var r = 0, g = 0, b = 0;
  if (h < 60)       { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else              { r = c; g = 0; b = x; }
  return 'rgb(' + Math.round((r + m) * 255) + ',' + Math.round((g + m) * 255) + ',' + Math.round((b + m) * 255) + ')';
}
/* 颜色唯一出口：稀有度只改透明度与描边强度，不改色相 */
function colorOf(shape, light){ return hslToRgb(PALETTE.hue[shape], PALETTE.sat[shape], light); }
function plateColor(shape){ return colorOf(shape, PALETTE.plateLight); }
function strokeColor(shape){ return colorOf(shape, PALETTE.strokeLight); }
function inkColor(shape){ return colorOf(shape, PALETTE.plateLight - PALETTE.inkDrop); }
function esc(s){
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ---------- 图标 SVG ---------- */

/* ---------- 六种底座轮廓 ---------- */
function shapePath(shape, r){
  var x0 = 64 - r, x1 = 64 + r, y0 = 64 - r, y1 = 64 + r;
  var pts = [], i, rx, f, ys, cy, by;
  if (shape === 'hex') {
    for (i = 0; i < 6; i++) pts.push(polar(64, 64, r, -90 + i * 60));
    return polyPath(pts);
  }
  if (shape === 'diamond') return polyPath([[64, 64 - r], [64 + r, 64], [64, 64 + r], [64 - r, 64]]);
  if (shape === 'square') {
    rx = Math.min(20 * r / 42, r * 0.92);
    return roundedRectPath(x0, y0, x1, y1, rx);
  }
  if (shape === 'shield') {
    ys = 64 + r * 0.29; cy = 64 + r * 0.76; by = 64 + r * 1.14;
    return 'M ' + pt(x0, y0) + ' L ' + pt(x1, y0) + ' L ' + pt(x1, ys) +
           ' Q ' + pt(x1, cy) + ' ' + pt(64, by) + ' Q ' + pt(x0, cy) + ' ' + pt(x0, ys) + ' Z';
  }
  if (shape === 'page') {
    f = 16 * r / 42;
    return 'M ' + pt(x0, y0) + ' H ' + n(x1) + ' V ' + n(y1 - f) +
           ' L ' + n(x1 - f) + ' ' + n(y1) + ' H ' + n(x0) + ' Z';
  }
  /* ring：外环 + 内环，中心留空半径 36.1 > 34 */
  return circlePath(64, 64, r) + ' ' + circlePath(64, 64, r * 0.86);
}
function framePath(shape, r){ return shape === 'ring' ? circlePath(64, 64, r) : shapePath(shape, r); }
function innerPath(shape, r){ return shape === 'ring' ? circlePath(64, 64, r) : shapePath(shape, r); }
function frameEl(shape, r, col, op, w){
  return '<path d="' + framePath(shape, r) + '" fill="none" stroke="' + col +
         '" stroke-opacity="' + n(op) + '" stroke-width="' + w + '" stroke-linejoin="round"/>';
}
function gearPath(teeth, rTip, rRoot, rHole){
  var pts = [], i, base, step = 360 / teeth;
  for (i = 0; i < teeth; i++) {
    base = -90 + i * step;
    pts.push(polar(64, 64, rRoot, base - 15));
    pts.push(polar(64, 64, rRoot, base - 9));
    pts.push(polar(64, 64, rTip,  base - 9));
    pts.push(polar(64, 64, rTip,  base + 9));
    pts.push(polar(64, 64, rRoot, base + 9));
  }
  return polyPath(pts) + ' ' + circlePath(64, 64, rHole);
}

/* ---------- 外圈线框层（底板之下） ---------- */
function decorations(shape, rar, col, op){
  var s = '', gold = PALETTE.gold;
  if (rar === 'common') {
    s += frameEl(shape, R + 6, col, op, 1.5);
  } else if (rar === 'fine') {
    s += frameEl(shape, R + 7, col, op, 1.5);
    s += frameEl(shape, R + 2, col, op * 0.85, 0.8);
  } else if (rar === 'rare') {
    s += frameEl(shape, R + 7, col, op, 1.5);
    s += frameEl(shape, R + 2, col, op * 0.85, 0.8);
    s += '<circle cx="64" cy="64" r="' + n(R + 10) + '" fill="none" stroke="' + gold +
         '" stroke-opacity="0.7" stroke-width="0.8"/>';
  } else {
    s += frameEl(shape, R + 4, col, op, 1.2);
    s += '<path d="' + gearPath(12, 58, 52, 48) + '" fill-rule="evenodd" fill="' + gold +
         '" fill-opacity="0.10" stroke="' + gold + '" stroke-opacity="0.9" stroke-width="1.2" stroke-linejoin="round"/>';
    s += '<circle cx="64" cy="64" r="46" fill="none" stroke="' + col +
         '" stroke-opacity="' + n(op * 0.7) + '" stroke-width="0.8"/>';
  }
  return s;
}
/* 方位饰件画在底板之上，方角形状才不会把它遮成半个 */
function ornaments(shape, rar, col, op){
  var s = '', i, a, p, gold = PALETTE.gold;
  if (rar === 'fine') {
    for (i = 0; i < 4; i++) {
      a = -90 + i * 90; p = polar(64, 64, R + 13, a);
      s += '<path d="' + diamondAt(p[0], p[1], 3.2) + '" fill="' + col +
           '" fill-opacity="' + n(op * 0.55) + '" stroke="' + col +
           '" stroke-opacity="' + n(op) + '" stroke-width="0.7"/>';
    }
  } else if (rar === 'rare') {
    for (i = 0; i < 8; i++) {
      a = -90 + i * 45; p = polar(64, 64, R + 13, a);
      s += '<path d="' + starAt(p[0], p[1], 3.6) + '" fill="' + gold + '" fill-opacity="0.92"/>';
    }
  }
  return s;
}

/* ---------- 底板填充 + 描边（中心不画任何图形） ---------- */
function plateMarkup(shape, rar, uid, pCol, sCol, op, fop){
  var d = shapePath(shape, R);
  var fillAttr = (rar === 'legend')
    ? 'fill="url(#plate-' + uid + ')"'
    : 'fill="' + pCol + '" fill-opacity="' + fop + '"';
  var strokeAttr = 'stroke="' + sCol + '" stroke-opacity="' + op + '" stroke-width="2"';
  var s = '';
  if (shape === 'ring') {
    s += '<path d="' + d + '" fill-rule="evenodd" ' + fillAttr + ' stroke="none"/>';
    s += '<circle cx="64" cy="64" r="' + n(R) + '" fill="none" ' + strokeAttr + '/>';
    s += '<circle cx="64" cy="64" r="' + n(R * 0.86) + '" fill="none" ' + strokeAttr + '/>';
    s += '<circle cx="64" cy="64" r="' + n(R * 0.93) + '" fill="none" stroke="' + sCol +
         '" stroke-opacity="' + n(op * 0.6) + '" stroke-width="0.8"/>';
  } else {
    s += '<path d="' + d + '" ' + fillAttr + ' ' + strokeAttr + ' stroke-linejoin="round"/>';
  }
  if (shape === 'page') {  /* 右下折角小翻片 */
    var f = 16, x1 = 64 + R, y1 = 64 + R;
    s += '<path d="M ' + pt(x1, y1 - f) + ' L ' + pt(x1 - f, y1 - f) + ' L ' + pt(x1 - f, y1) +
         ' Z" fill="' + pCol + '" fill-opacity="' + n(fop * 1.4) + '" stroke="' + sCol +
         '" stroke-opacity="' + n(op * 0.8) + '" stroke-width="1" stroke-linejoin="round"/>';
  }
  return s;
}

/* ---------- 生成一枚空底座 ---------- */
function buildBase(shape, rar, uid, extraData){
  var pCol = plateColor(shape), sCol = strokeColor(shape);
  var op = PALETTE.strokeOpacity[rar], fop = PALETTE.fillOpacity[rar];
  var data = ' data-base="' + shape + '-' + rar + '"' + (extraData || '');
  var s = '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"' + data + '>';

  s += '<defs>';
  if (rar === 'legend') {
    s += '<radialGradient id="plate-' + uid + '" cx="38%" cy="30%" r="78%">' +
         '<stop offset="0%" stop-color="' + colorOf(shape, 74) + '" stop-opacity="0.44"/>' +
         '<stop offset="55%" stop-color="' + pCol + '" stop-opacity="0.30"/>' +
         '<stop offset="100%" stop-color="' + colorOf(shape, 34) + '" stop-opacity="0.26"/>' +
         '</radialGradient>';
    s += '<radialGradient id="glow-' + uid + '" cx="50%" cy="50%" r="50%">' +
         '<stop offset="0%" stop-color="' + pCol + '" stop-opacity="0"/>' +
         '<stop offset="60%" stop-color="' + pCol + '" stop-opacity="0"/>' +
         '<stop offset="78%" stop-color="' + pCol + '" stop-opacity="' + PALETTE.glowPeak + '"/>' +
         '<stop offset="100%" stop-color="' + pCol + '" stop-opacity="0"/>' +
         '</radialGradient>';
    /* 中心高光做成环形柔光：中心 0~58% 全透明，保证半径 34 内不落任何笔触 */
    s += '<radialGradient id="hi-' + uid + '" cx="50%" cy="50%" r="50%">' +
         '<stop offset="0%" stop-color="' + PALETTE.goldLight + '" stop-opacity="0"/>' +
         '<stop offset="58%" stop-color="' + PALETTE.goldLight + '" stop-opacity="0"/>' +
         '<stop offset="76%" stop-color="' + PALETTE.goldLight + '" stop-opacity="0.20"/>' +
         '<stop offset="100%" stop-color="' + PALETTE.goldLight + '" stop-opacity="0"/>' +
         '</radialGradient>';
  }
  s += '</defs>';

  if (rar === 'legend') s += '<circle cx="64" cy="64" r="63" fill="url(#glow-' + uid + ')"/>';
  s += decorations(shape, rar, sCol, op);
  s += plateMarkup(shape, rar, uid, pCol, sCol, op, fop);
  s += ornaments(shape, rar, sCol, op);

  if (rar === 'rare') {
    /* 内圈虚线：贴合形状向内收 6px，远离图标绘图区 */
    var dr = (shape === 'ring') ? 39.5 : R - 6;
    s += '<path d="' + innerPath(shape, dr) + '" fill="none" stroke="' + PALETTE.gold +
         '" stroke-opacity="0.75" stroke-width="0.9" stroke-dasharray="2 4" stroke-linejoin="round"/>';
  }
  if (rar === 'legend') {
    s += '<circle cx="64" cy="64" r="44" fill="url(#hi-' + uid + ')"/>';
    var gr = (shape === 'ring') ? 40 : R - 5;
    s += '<path d="' + innerPath(shape, gr) + '" fill="none" stroke="' + PALETTE.gold +
         '" stroke-opacity="0.6" stroke-width="0.9" stroke-linejoin="round"/>';
  }

  /* 铭带：60×10 圆角条，浅色填充，不写字 */
  s += '<rect x="34" y="100" width="60" height="10" rx="5" fill="' + PALETTE.ribbonFill +
       '" fill-opacity="0.92" stroke="' + sCol + '" stroke-opacity="' + n(op * 0.55) + '" stroke-width="0.8"/>';

  s += '</svg>';
  return s;
}

/* ---------- 合成：底座 + 图标 + 项目名 ---------- */
function composeSvg(shape, rar, icon, projectName){
  var uid = 'compose-' + shape + '-' + rar;
  var body = buildBase(shape, rar, uid, ' data-icon="' + icon + '" data-badge="' + shape + '-' + rar + '-' + icon + '"');
  /* 去掉末尾 </svg>，插入图标与铭带文字 */
  var cut = body.lastIndexOf('</svg>');
  var head = body.slice(0, cut);
  var ink = inkColor(shape);
  /* 先铺一层浅色描边再盖深色 currentColor：深底上图标依然清晰，浅底上浅色描边自动隐形 */
  var iconGroup = '<g transform="translate(40 40)" style="color:' + ink + '" color="' + ink + '">' +
                  '<g fill="none" stroke="' + PALETTE.halo + '" stroke-opacity="0.82" stroke-width="4.6" ' +
                  'stroke-linecap="round" stroke-linejoin="round">' + ICON_INNER[icon] + '</g>' +
                  '<g fill="none" stroke="currentColor" stroke-width="2" ' +
                  'stroke-linecap="round" stroke-linejoin="round">' + ICON_INNER[icon] + '</g>' +
                  '</g>';
  var name = String(projectName || '').slice(0, 6);
  var label = name ? '<text x="64" y="105" text-anchor="middle" dominant-baseline="central" font-family="' + FONT +
                     '" font-size="8" font-weight="700" letter-spacing="0.2" fill="' + ink + '">' + esc(name) + '</text>' : '';
  return head + iconGroup + label + '</svg>';
}

/* =====================================================================
   业务代码（只调用 composeSvg，不改渲染器）
   ===================================================================== */

      /* ===== 界面逻辑（原 IIFE 内部，改成 boot） ===== */
      function boot() {
        var PAGE = 40;
  var TYPE_NAMES = {
    app:'应用', plugin:'插件', game:'游戏', terminal:'终端', script:'脚本', film:'胶片', video:'视频', image:'图像',
    music:'音乐', cube:'三维', doc:'文档', note:'笔记', school:'学习', chart:'图表', data:'数据', ai:'AI',
    chip:'芯片', web:'网络', palette:'设计', hardware:'硬件', tool:'工具', other:'其他'
  };
  var RARITY_NAMES = { common:'普通', fine:'精良', rare:'稀有', legend:'传说' };

  var MOCK = [
    { id:'dsh-research', name:'资料网', type:'plugin', shape:'hex', rarity:'legend', icon:'plugin',
      summary:'动手前先查社区，未查阅就拦一次',
      how:['钉契约','GPT 写 host','grok 写界面','本鲸装配'],
      pitfalls:['git archive 相对路径判断错','blocks 不清零会永久放行'],
      path:'D:\\插件\\dsh-research', sessions:3, updatedAt:1731650000000 },
    { id:'ant-blackhole', name:'蚂蚁黑洞', type:'video', shape:'ring', rarity:'rare', icon:'film',
      summary:'一只蚂蚁慢慢长成黑洞，把整座卡通城市吞进去的 3D 短片',
      how:['先写分镜与节拍','Python 逐帧渲染城市','ffmpeg 合成配乐与调色'],
      pitfalls:['整段视频太大，手机端打不开','黑洞吸积盘的拖影要手动限帧'],
      path:'D:\\视频\\ant-blackhole', sessions:6, updatedAt:1731400000000 },
    { id:'zeno-turtle', name:'芝诺的乌龟', type:'video', shape:'ring', rarity:'fine', icon:'cube',
      summary:'用动画讲清楚阿基里斯追不上乌龟的悖论，以及它为什么不成立',
      how:['用等比级数写讲解稿','edge-tts 生成解说','按段落拆成竖屏分镜'],
      pitfalls:['100/9 秒的结论要放在画面里算一遍','旁白停顿和字幕没对齐'],
      path:'D:\\视频\\zeno', sessions:4, updatedAt:1731300000000 },
    { id:'pixel-quest', name:'像素冒险', type:'game', shape:'hex', rarity:'fine', icon:'game',
      summary:'一个周末做完的 16 色像素小游戏，只有三个关卡',
      how:['Canvas 画瓦片地图','手写碰撞检测','用键盘与触屏双操作'],
      pitfalls:['不同屏幕的像素比导致画面发糊','跳跃手感要用固定时间步长'],
      path:'D:\\游戏\\pixel-quest', sessions:5, updatedAt:1730900000000 },
    { id:'price-watch', name:'价格监控', type:'data', shape:'diamond', rarity:'rare', icon:'chart',
      summary:'盯着几家商店的价格曲线，降价到阈值时提醒我',
      how:['定时抓取公开价格','SQLite 存历史','折线图标出历史最低'],
      pitfalls:['页面改版后选择器全部失效','促销价与会员价混在一起'],
      path:'D:\\工具\\price-watch', sessions:7, updatedAt:1731100000000 },
    { id:'lan-cast', name:'局域网投屏', type:'web', shape:'square', rarity:'fine', icon:'web',
      summary:'同一个 Wi-Fi 下，把电脑画面推到手机浏览器上',
      how:['本机起一个小服务','帧差分降低带宽','手机端只用 canvas 渲染'],
      pitfalls:['防火墙默认拦截端口','熄屏后连接会悄悄断开'],
      path:'D:\\网络\\lan-cast', sessions:2, updatedAt:1730500000000 },
    { id:'ai-writer', name:'AI 写作助手', type:'ai', shape:'square', rarity:'legend', icon:'ai',
      summary:'把零散想法整理成结构清楚的文章，并保留我自己的语气',
      how:['先抽取观点再排序','用我的旧文章做风格样本','每段单独校对事实'],
      pitfalls:['长文后半段会逐渐跑题','引用必须回到原文核对'],
      path:'D:\\AI\\ai-writer', sessions:12, updatedAt:1731600000000 },
    { id:'smart-lamp', name:'智能台灯', type:'hardware', shape:'shield', rarity:'rare', icon:'hardware',
      summary:'自己焊的一盏会随日出日落调色温的台灯',
      how:['画电路板并打样','写色温曲线固件','外壳用 3D 打印'],
      pitfalls:['PWM 频率太低会有可见频闪','电源纹波把亮度搞得忽明忽暗'],
      path:'D:\\硬件\\smart-lamp', sessions:3, updatedAt:1729800000000 },
    { id:'study-notes', name:'学习笔记', type:'note', shape:'page', rarity:'common', icon:'school',
      summary:'按主题整理的读书与课程笔记，能全文搜索',
      how:['Markdown 分目录存放','脚本生成目录索引'],
      pitfalls:['图片路径搬家后全部失效'],
      path:'D:\\笔记\\study', sessions:1, updatedAt:1729000000000 },
    { id:'music-box', name:'音乐盒', type:'music', shape:'ring', rarity:'common', icon:'music',
      summary:'本地音乐的小播放器，支持逐句歌词与淡入淡出',
      how:['Web Audio 做淡入淡出','歌词按时间戳滚动'],
      pitfalls:['浏览器要求先有用户手势才能出声'],
      path:'D:\\音乐\\music-box', sessions:2, updatedAt:1728800000000 }
  ];

  /* ---------- 小工具（ES5） ---------- */
  function $(id){ return root ? root.getElementById(id) : document.getElementById(id); }
  var reduce = false;
  try { reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e0) {}
  var raf = window.requestAnimationFrame || function (f) { return setTimeout(f, 16); };

  function findAttr(el, attr, stop){
    while (el && el !== stop && el.nodeType === 1) {
      if (el.getAttribute(attr) !== null) return el;
      el = el.parentNode;
    }
    return null;
  }
  function pad(v){ return v < 10 ? '0' + v : '' + v; }
  function fmtDate(ms){
    var d = new Date(ms);
    if (!ms || isNaN(d.getTime())) return '—';
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }
  function typeName(t){ return TYPE_NAMES[t] || String(t || '其他'); }
  function glowOf(shape){ return strokeColor(shape).replace('rgb(', 'rgba(').replace(')', ',.34)'); }
  function lineOf(shape){ return strokeColor(shape).replace('rgb(', 'rgba(').replace(')', ',.75)'); }
  function arr(a){ return Object.prototype.toString.call(a) === '[object Array]' ? a : []; }

  function normalize(p, i){
    p = p || {};
    var shape = PALETTE.hue.hasOwnProperty(p.shape) ? p.shape : 'hex';
    var rarity = PALETTE.fillOpacity.hasOwnProperty(p.rarity) ? p.rarity : 'common';
    var icon = ICON_INNER.hasOwnProperty(p.icon) ? p.icon : 'other';
    return {
      id: String(p.id != null ? p.id : 'p' + i), name: String(p.name || p.id || '未命名'), type: String(p.type || 'other'),
      shape: shape, rarity: rarity, icon: icon, summary: String(p.summary || ''),
      how: arr(p.how), pitfalls: arr(p.pitfalls), path: String(p.path || ''),
      sessions: Number(p.sessions) || 0, updatedAt: Number(p.updatedAt) || 0
    };
  }

  /* ---------- 状态 ---------- */
  var els = {
    btn: $('mbtn'), badge: $('badge'), foot: $('foot'), hud: $('hud'), panel: $('panel'), pills: $('pills'), q: $('q'),
    hx: $('hud-x'), body: $('body'), grid: $('grid'), empty: $('empty'), more: $('more'), drawer: $('drawer'), toast: $('toast')
  };
  var st = { all: [], q: '', type: 'all', limit: PAGE, openId: null, opened: false, firstOpen: true, lastFocus: null };
  var timers = { press: 0, toast: 0, hide: 0, stag: 0 };

  function setProjects(list){
    var out = [], i;
    list = arr(list);
    for (i = 0; i < list.length; i++) out.push(normalize(list[i], i));
    st.all = out; st.type = 'all'; st.q = ''; st.limit = PAGE; els.q.value = '';
    els.badge.textContent = String(out.length);
    els.foot.textContent = '项目博物馆 · ' + out.length + ' 个项目 · 纯 SVG 勋章';
    renderPills();
    renderGrid(false, true);
    if (st.openId && !find(st.openId)) closeDrawer();
  }
  function find(id){
    for (var i = 0; i < st.all.length; i++) if (st.all[i].id === id) return st.all[i];
    return null;
  }
  function filtered(){
    var out = [], q = st.q.toLowerCase(), i, p;
    for (i = 0; i < st.all.length; i++) {
      p = st.all[i];
      if (st.type !== 'all' && p.type !== st.type) continue;
      if (q && (p.name + ' ' + p.id + ' ' + p.summary + ' ' + typeName(p.type)).toLowerCase().indexOf(q) < 0) continue;
      out.push(p);
    }
    return out;
  }

  /* ---------- 渲染 ---------- */
  function renderPills(){
    var seen = {}, types = [], i, t, h = '';
    for (i = 0; i < st.all.length; i++) {
      t = st.all[i].type;
      if (!seen[t]) { seen[t] = 1; types.push(t); }
    }
    h += '<button type="button" class="pill-btn' + (st.type === 'all' ? ' on' : '') + '" data-type="all">全部</button>';
    for (i = 0; i < types.length; i++) {
      h += '<button type="button" class="pill-btn' + (st.type === types[i] ? ' on' : '') + '" data-type="' + esc(types[i]) + '">' + esc(typeName(types[i])) + '</button>';
    }
    els.pills.innerHTML = h;
  }
  function cardHtml(p, i, base){
    var svg = composeSvg(p.shape, p.rarity, p.icon, p.name);
    return '<li class="cell" style="--d:' + (base + i * 26) + 'ms">' +
      '<button type="button" class="card' + (st.openId === p.id ? ' sel' : '') + '" data-id="' + esc(p.id) + '" ' +
      'style="--glow:' + glowOf(p.shape) + ';--tone-line:' + lineOf(p.shape) + '" aria-label="' + esc(p.name) + '，' + esc(typeName(p.type)) + '，' + RARITY_NAMES[p.rarity] + '">' +
      '<span class="medal">' + svg + '</span>' +
      '<span class="nm">' + esc(p.name) + '</span>' +
      '<span class="sub">' + esc(typeName(p.type)) + ' · ' + RARITY_NAMES[p.rarity] + '</span>' +
      '</button></li>';
  }
  /* appendFrom：>0 时只追加新增的部分（显示更多），不重播已有勋章 */
  function renderGrid(appendFrom, soft){
    var list = filtered(), shown = Math.min(list.length, st.limit), i, h = '';
    var from = appendFrom || 0, base = 80;
    if (from > 0) { base = 0; }
    for (i = from; i < shown; i++) h += cardHtml(list[i], i - from, base);
    if (from > 0) els.grid.insertAdjacentHTML('beforeend', h); else els.grid.innerHTML = h;
    if (soft) { els.grid.className = 'grid soft'; }
    els.empty.style.display = list.length ? 'none' : 'block';
    els.more.innerHTML = list.length > shown
      ? '<button type="button" class="more-btn" data-act="more">显示更多（还有 ' + (list.length - shown) + ' 个）</button>' : '';
  }

  function rowsHtml(items, d0, cls){
    var h = '', i;
    for (i = 0; i < items.length; i++) h += '<li class="dr-it" style="--d:' + (d0 + i * 30) + 'ms">' + esc(items[i]) + '</li>';
    return h;
  }
  function drawerHtml(p){
    var d = 40, step = 30, h = '';
    var tone = strokeColor(p.shape);
    h += '<div class="dr-scroll">';
    h += '<div class="dr-it dr-head" style="--d:' + d + 'ms"><div class="dr-medal">' + composeSvg(p.shape, p.rarity, p.icon, p.name) + '</div>' +
         '<div><h3 class="dr-title">' + esc(p.name) + '</h3><div class="chips">' +
         '<span class="chip"><i style="background:' + tone + '"></i>' + esc(typeName(p.type)) + '</span>' +
         '<span class="chip r-' + p.rarity + '">' + RARITY_NAMES[p.rarity] + '</span></div></div></div>';
    d += step;
    h += '<section class="dr-sec dr-it" style="--d:' + d + 'ms"><h4>作用</h4><p>' + (esc(p.summary) || '—') + '</p></section>';
    d += step;
    h += '<section class="dr-sec"><h4 class="dr-it" style="--d:' + d + 'ms">怎么做的</h4><ol class="how">';
    d += step;
    h += rowsHtml(p.how.length ? p.how : ['—'], d); d += Math.max(1, p.how.length) * step;
    h += '</ol></section>';
    h += '<section class="dr-sec"><h4 class="dr-it" style="--d:' + d + 'ms">踩过的坑</h4><ul class="pit">';
    d += step;
    h += rowsHtml(p.pitfalls.length ? p.pitfalls : ['—'], d); d += Math.max(1, p.pitfalls.length) * step;
    h += '</ul></section>';
    h += '<div class="dr-meta">' +
         '<div class="kv full dr-it" style="--d:' + d + 'ms"><b>路径</b><span>' + esc(p.path || '—') + '</span></div>' +
         '<div class="kv dr-it" style="--d:' + (d + step) + 'ms"><b>会话数</b><span>' + p.sessions + '</span></div>' +
         '<div class="kv dr-it" style="--d:' + (d + step * 2) + 'ms"><b>最后更新</b><span>' + esc(fmtDate(p.updatedAt)) + '</span></div></div>';
    h += '</div>';
    h += '<div class="dr-foot dr-it" style="--d:' + (d + step * 3) + 'ms">' +
         '<button type="button" class="btn pri" data-act="copy">复制路径</button>' +
         '<button type="button" class="btn sec" data-act="folder">打开文件夹</button></div>';
    h += '<button type="button" class="xbtn dr-x" data-act="close-drawer" aria-label="关闭详情">' +
         '<svg viewBox="0 0 14 14" fill="none" stroke="#475569" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M3 3 L11 11 M11 3 L3 11"/></svg></button>';
    return h;
  }

  /* ---------- 抽屉 ---------- */
  function markSelected(){
    var cards = els.grid.getElementsByTagName('button'), i;
    for (i = 0; i < cards.length; i++) {
      var on = cards[i].getAttribute('data-id') === st.openId;
      var cls = cards[i].className.replace(/\s*\bsel\b/g, '');
      cards[i].className = on ? cls + ' sel' : cls;
    }
  }
  function openDrawer(id){
    var p = find(id);
    if (!p) return;
    st.openId = id;
    els.drawer.innerHTML = drawerHtml(p);
    els.drawer.scrollTop = 0;
    els.drawer.className = 'drawer is-open';
    els.drawer.setAttribute('aria-hidden', 'false');
    markSelected();
  }
  function closeDrawer(){
    if (!st.openId) return;
    st.openId = null;
    els.drawer.className = 'drawer';
    els.drawer.setAttribute('aria-hidden', 'true');
    markSelected();
  }

  /* ---------- HUD 开合 ---------- */
  function rollBadge(target){
    if (reduce || target < 1) { els.badge.textContent = String(target); return; }
    var t0 = new Date().getTime();
    els.badge.textContent = '0';
    (function step(){
      var p = Math.min(1, (new Date().getTime() - t0) / 300);
      els.badge.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf(step);
    })();
  }
  function openHud(){
    if (st.opened) return;
    st.opened = true;
    clearTimeout(timers.hide);
    st.lastFocus = document.activeElement;
    st.openId = null;
    els.drawer.className = 'drawer';
    els.drawer.setAttribute('aria-hidden', 'true');
    els.grid.className = 'grid stag';
    renderGrid(0, false);
    els.body.scrollTop = 0;
    document.documentElement.classList.add('hud-lock');
    els.hud.className = 'hud is-open';
    els.hud.setAttribute('aria-hidden', 'false');
    els.btn.setAttribute('aria-expanded', 'true');
    els.btn.className = 'mbtn pressed';
    setTimeout(function () { els.btn.className = 'mbtn'; }, 140);
    clearTimeout(timers.stag);
    timers.stag = setTimeout(function () { els.grid.className = 'grid soft'; }, 1500);
    if (st.firstOpen) { st.firstOpen = false; rollBadge(st.all.length); }
    try { els.panel.focus({ preventScroll: true }); } catch (e1) { els.panel.focus(); }
  }
  function closeHud(){
    if (!st.opened) return;
    st.opened = false;
    closeDrawer();
    els.hud.className = 'hud';
    els.hud.setAttribute('aria-hidden', 'true');
    els.btn.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('hud-lock');
    var f = st.lastFocus && st.lastFocus.focus ? st.lastFocus : els.btn;
    try { f.focus({ preventScroll: true }); } catch (e2) { f.focus(); }
  }

  function toast(msg){
    els.toast.textContent = msg;
    els.toast.className = 'toast show';
    clearTimeout(timers.toast);
    timers.toast = setTimeout(function () { els.toast.className = 'toast'; }, 1600);
  }
  function copyText(text, done){
    function fallback(){
      var ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
      document.body.appendChild(ta); ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e3) {}
      document.body.removeChild(ta);
      done(ok);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try { navigator.clipboard.writeText(text).then(function () { done(true); }, fallback); } catch (e4) { fallback(); }
    } else { fallback(); }
  }
  function openFolder(p){
    var handled = false;
    try {
      if (window.ProjectMuseumHost && typeof window.ProjectMuseumHost.openFolder === 'function') {
        window.ProjectMuseumHost.openFolder(p.path); handled = true;
      } else {
        var ev;
        if (typeof window.CustomEvent === 'function') ev = new CustomEvent('museum:open-folder', { detail: { id: p.id, path: p.path } });
        else { ev = document.createEvent('CustomEvent'); ev.initCustomEvent('museum:open-folder', false, false, { id: p.id, path: p.path }); }
        document.dispatchEvent(ev);
      }
    } catch (e5) {}
    toast(handled ? '已请求打开：' + p.path : '演示环境：已发出 museum:open-folder 事件');
  }

  /* ---------- 事件 ---------- */
  els.btn.addEventListener('click', function () { if (st.opened) closeHud(); else openHud(); });
  els.hx.addEventListener('click', closeHud);
  els.hud.addEventListener('click', function (e) { if (e.target === els.hud) closeHud(); });          /* 点遮罩 */
  els.panel.addEventListener('click', function (e) {
    if (!st.openId || els.drawer.contains(e.target)) return;
    if (findAttr(e.target, 'data-id', els.panel) || findAttr(e.target, 'data-type', els.panel) || findAttr(e.target, 'data-act', els.panel)) return;
    closeDrawer();                                           /* 点面板空白处只收抽屉 */
  });
  document.addEventListener('keydown', function (e) {
    var k = e.key || e.keyCode;
    if (k === 'Escape' || k === 'Esc' || k === 27) { if (st.opened) { e.preventDefault(); closeHud(); } return; }
    if ((k === 'Tab' || k === 9) && st.opened) {
      var nodes = els.panel.querySelectorAll('button,input'), list = [], i, n0;
      for (i = 0; i < nodes.length; i++) {
        n0 = nodes[i];
        if (n0.offsetParent === null && n0 !== document.activeElement) continue;
        if (els.drawer.className.indexOf('is-open') < 0 && els.drawer.contains(n0)) continue;
        list.push(n0);
      }
      if (!list.length) return;
      var first = list[0], last = list[list.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === els.panel)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  els.pills.addEventListener('click', function (e) {
    var b = findAttr(e.target, 'data-type', els.pills);
    if (!b) return;
    st.type = b.getAttribute('data-type'); st.limit = PAGE;
    renderPills(); renderGrid(0, true); els.body.scrollTop = 0;
  });
  els.q.addEventListener('input', function () {
    st.q = els.q.value; st.limit = PAGE;
    renderGrid(0, true); els.body.scrollTop = 0;
  });
  els.body.addEventListener('click', function (e) {
    var more = findAttr(e.target, 'data-act', els.body);
    if (more && more.getAttribute('data-act') === 'more') {
      var prev = els.grid.children.length;
      st.limit += PAGE;
      renderGrid(prev, false);
      return;
    }
    var card = findAttr(e.target, 'data-id', els.body);
    if (!card) return;
    var id = card.getAttribute('data-id');
    card.className = card.className.replace(/\s*\bpress\b/g, '');
    void card.offsetWidth;                                   /* 重新触发「先压后弹」 */
    card.className += ' press';
    clearTimeout(timers.press);
    timers.press = setTimeout(function () { openDrawer(id); }, reduce ? 0 : 110);
    setTimeout(function () { card.className = card.className.replace(/\s*\bpress\b/g, ''); }, 260);
  });
  els.drawer.addEventListener('click', function (e) {
    var b = findAttr(e.target, 'data-act', els.drawer);
    if (!b) return;
    var act = b.getAttribute('data-act'), p = find(st.openId);
    if (act === 'close-drawer') { closeDrawer(); return; }
    if (!p) return;
    if (act === 'copy') {
      copyText(p.path, function (ok) {
        b.textContent = ok ? '已复制 ✓' : '复制失败';
        setTimeout(function () { b.textContent = '复制路径'; }, 1400);
      });
    } else if (act === 'folder') {
      openFolder(p);
    }
  });

  /* ---------- 数据：优先 /api/museum/list.json，失败就用内置 mock，绝不白屏 ---------- */
  setProjects(MOCK);
  els.badge.textContent = String(st.all.length);
  if (/^https?:$/.test(location.protocol) && window.XMLHttpRequest) {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', '/api/museum/list.json', true);
      xhr.timeout = 3000;
      xhr.onload = function () {
        if (xhr.status !== 200) return;
        try {
          var data = JSON.parse(xhr.responseText);
          if (data && data.ok && arr(data.projects).length) {
            var wasOpen = st.opened;
            setProjects(data.projects);
            if (wasOpen) { els.grid.className = 'grid soft'; renderGrid(0, true); }
          }
        } catch (e6) {}
      };
      xhr.onerror = function () {};
      xhr.ontimeout = function () {};
      xhr.send();
    } catch (e7) {}
  }

  window.ProjectMuseum = { open: openHud, close: closeHud, setProjects: setProjects, openDetail: openDrawer };
      }

      var mountedSlot = null;

      /* ---------- 右上角共享按钮槽：谁先到谁创建，后面的自动往下排 ---------- */
      var RIGHT_DOCK_ID = "dsh-right-dock";
      function ensureRightDock() {
        var d = document.getElementById(RIGHT_DOCK_ID);
        if (d) return d;
        d = document.createElement("div");
        d.id = RIGHT_DOCK_ID;
        d.setAttribute("data-dsh-dock", "1");
        d.style.cssText = "position:fixed;top:104px;right:14px;z-index:2147483000;" +
          "display:flex;flex-direction:column;align-items:flex-end;gap:10px;";
        document.body.appendChild(d);
        return d;
      }

      /* ===== 挂载 / 卸载 ===== */
      function mount() {
        if (document.getElementById(HOLDER_ID)) return;
        var host = document.createElement("div");
        host.id = HOLDER_ID;
        var shadow = host.attachShadow({ mode: "open" });
        var styleEl = document.createElement("style");
        styleEl.textContent = CSS;
        shadow.appendChild(styleEl);
        var wrap = document.createElement("div");
        wrap.innerHTML = HTML;
        while (wrap.firstChild) shadow.appendChild(wrap.firstChild);
        document.body.appendChild(host);
        root = shadow;
        boot();
        /* ★ 按钮留在 shadow 内（样式才生效），只把 top 算到共享 dock 的下方 */
        try { syncTheme(); watchTheme(); placeButton(); bindResize(); } catch (e) { warn("初始化按钮失败：" + (e && e.message ? e.message : e)) }
      }

      var themeObserver = null;
      function syncTheme() {
        try {
          var host = document.getElementById(HOLDER_ID);
          if (!host || !document.body) return;
          var dark = document.body.hasAttribute("data-ds-dark-theme");
          host.className = dark ? "dark" : "";
        } catch (e) {}
      }
      function watchTheme() {
        try {
          if (themeObserver || typeof MutationObserver !== "function") return;
          themeObserver = new MutationObserver(function () { syncTheme() });
          themeObserver.observe(document.body, { attributes: true, attributeFilter: ["data-ds-dark-theme"] });
        } catch (e) {}
      }

      function placeButton() {
        if (!root) return;
        var btn = root.querySelector("#mbtn");
        if (!btn) return;
        var dock = ensureRightDock();
        var bottom = 104 + 34;
        try {
          var r = dock.getBoundingClientRect();
          if (r && r.bottom) bottom = r.bottom;
        } catch (e) {}
        btn.style.position = "fixed";
        btn.style.top = Math.round(bottom + 10) + "px";
        btn.style.right = "14px";
        btn.style.zIndex = "2147483000";
      }

      function unmount() {
        try {
          if (window.ProjectMuseum && typeof window.ProjectMuseum.close === "function") window.ProjectMuseum.close();
        } catch (e) {}
        try { document.documentElement.classList.remove("hud-lock") } catch (e) {}
        try { delete window.ProjectMuseum } catch (e) {}
        try { if (themeObserver) themeObserver.disconnect() } catch (e) {}
        themeObserver = null;
        try { if (resizeBound) window.removeEventListener("resize", resizeBound) } catch (e) {}
        resizeBound = null;
        try { if (mountedSlot && mountedSlot.parentNode) mountedSlot.parentNode.removeChild(mountedSlot) } catch (e) {}
        mountedSlot = null;
        var host = document.getElementById(HOLDER_ID);
        if (host && host.parentNode) host.parentNode.removeChild(host);
        root = null;
      }

      var resizeBound = null;
      function bindResize() {
        try {
          if (resizeBound) return;
          resizeBound = function () { try { placeButton() } catch (e) {} };
          window.addEventListener("resize", resizeBound);
        } catch (e) {}
      }

      exports.inject = ["slots"];
      exports.name = "dsh-museum";
      exports.apply = function (ctx) {
        try {
          var start = function () {
            try { mount() } catch (e) { warn("挂载失败：" + (e && e.message ? e.message : e)) }
          };
          if (!document.body) { setTimeout(start, 400) } else { start() }
          if (ctx && typeof ctx.effect === "function") {
            ctx.effect(function () { return function () { unmount() } }, "museum.client")
          }
        } catch (e) {
          warn("apply 失败：" + (e && e.message ? e.message : e));
        }
      };
      return module.exports;
    },
  });
})();
