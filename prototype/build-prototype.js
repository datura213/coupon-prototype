const fs = require("fs");
const path = require("path");

const root = __dirname;
const docs = path.join(root, "docs");

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function write(file, content) {
  const target = path.join(docs, file);
  ensureDir(path.dirname(target));
  fs.writeFileSync(target, content.trimStart(), "utf8");
}

function enhanceBackendTables(file, content) {
  if (!file.startsWith("pages/backend/")) return content;

  return content.replace(/<table class="data-table">([\s\S]*?)<\/table>/g, (tableHtml) => {
    const columnCount = Math.max(4, (tableHtml.match(/<th\b/g) || []).length);
    const tableMinWidth = Math.max(760, columnCount * 132);
    const hasActionColumn = /<th>操作<\/th>/.test(tableHtml);
    const tableClass = hasActionColumn ? "data-table action-table" : "data-table";
    const enhancedTable = tableHtml.replace(
      '<table class="data-table">',
      `<table class="${tableClass}" style="--table-min-width:${tableMinWidth}px">`,
    );

    return `<div class="table-scroll" data-scroll-hint="左右滑动查看更多字段">${enhancedTable}</div>`;
  });
}

function relBase(file) {
  const depth = file.split("/").length - 1;
  return depth === 0 ? "." : Array(depth).fill("..").join("/");
}

const backendNav = [
  ["pages/backend/budget-pools.html", "预算池管理"],
  ["pages/backend/coupon-batches.html", "券批次管理"],
  ["pages/backend/approvals.html", "审批管理"],
  ["pages/backend/external-scenes.html", "外部发券场景"],
  ["pages/backend/issue-tasks.html", "发放任务"],
  ["pages/backend/user-records.html", "用户券记录"],
  ["pages/backend/redeem-records.html", "核销记录"],
  ["pages/backend/config.html", "基础规则配置"],
];

function layout(file, title, active, body, options = {}) {
  const base = relBase(file);
  const isApp = options.surface === "app";
  const renderedBody = file.startsWith("pages/backend/coupon-batch-detail")
    ? mergeCouponBatchConfiguration(body)
    : body;
  const navItems = backendNav.map(([href, label]) => {
    const cls = label === active ? "nav-item active" : "nav-item";
    return `<a class="${cls}" href="${base}/${href}"><span>${label}</span></a>`;
  });

  const shell = isApp ? `
    <main class="app-stage">
      <div class="prototype-switcher" aria-label="原型导航">
        <a href="${base}/index.html">原型首页</a>
        <a href="${base}/pages/backend/budget-pools.html">运营后台</a>
      </div>
      <section class="phone-frame">
        <div class="phone-status"><span>09:41</span><span>5G 86%</span></div>
        ${renderedBody}
        <nav class="app-bottom">
          <a class="${active === "领券中心" ? "on" : ""}" href="${base}/pages/app/coupon-center.html"><span></span>领券</a>
          <a class="${active === "我的优惠券" ? "on" : ""}" href="${base}/pages/app/my-coupons.html"><span></span>我的券</a>
        </nav>
      </section>
    </main>` : `
    <div class="admin-shell">
      <aside class="sidebar">
        <a class="brand" href="${base}/index.html"><span class="brand-mark">券</span><span>优惠券中台</span></a>
        ${navItems.slice(0, 4).join("\n")}
        <div class="nav-group-title">发放与查询</div>
        ${navItems.slice(4, 10).join("\n")}
        ${navItems.slice(10).join("\n")}
      </aside>
      <section class="workspace">
        <header class="topbar">
          <div class="topbar-links"><a href="${base}/index.html">原型首页</a><a href="${base}/pages/app/coupon-center.html">App 侧原型</a></div>
          <div class="operator"><span>原型预览</span><span class="avatar">券</span></div>
        </header>
        <main class="content">${renderedBody}</main>
      </section>
    </div>`;

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} - 优惠券一期原型</title>
  <link rel="stylesheet" href="${base}/assets/css/styles.css">
</head>
<body class="${isApp ? "app-surface" : "backend-surface"}">
${shell}
<script src="${base}/assets/js/app.js"></script>
</body>
</html>`;
}

const css = `
:root {
  --ink: #20242b;
  --muted: #6f7782;
  --weak: #8a929d;
  --line: #dfe4ea;
  --line-soft: #edf0f4;
  --paper: #f7f8fa;
  --panel: #ffffff;
  --side: #252a31;
  --red: #d51f32;
  --red-soft: #fff1f2;
  --green: #0e7c66;
  --green-soft: #e9f7f2;
  --blue: #2d6cdf;
  --blue-soft: #eef4ff;
  --amber: #b76b00;
  --amber-soft: #fff7e5;
  --shadow: 0 18px 42px rgba(31, 41, 55, 0.08);
}

* { box-sizing: border-box; }
[hidden] { display: none !important; }
html, body { min-height: 100%; }
body {
  margin: 0;
  color: var(--ink);
  background: var(--paper);
  font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
}
a { color: inherit; text-decoration: none; }
button, input, select, textarea { font: inherit; }

.admin-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 236px minmax(0, 1fr);
}
.sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: auto;
  padding: 24px 18px;
  background: var(--side);
  color: #d7dce3;
}
.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #fff;
  font-size: 18px;
  font-weight: 800;
  margin-bottom: 28px;
}
.brand-mark {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 7px;
  background: var(--red);
  font-weight: 900;
}
.nav-group-title {
  margin: 26px 12px 10px;
  color: #8e98a6;
  font-size: 12px;
}
.nav-item {
  min-height: 38px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  margin: 3px 0;
  border-radius: 7px;
  color: #d7dce3;
  font-size: 14px;
  font-weight: 650;
}
.nav-item.active {
  background: #343b44;
  color: #fff;
  border-left: 3px solid var(--red);
  padding-left: 9px;
}
.nav-item:hover { background: #303740; }
.workspace {
  min-width: 0;
  background:
    linear-gradient(90deg, rgba(213, 31, 50, 0.055), transparent 34%),
    var(--paper);
}
.topbar {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  background: rgba(255, 255, 255, 0.82);
  border-bottom: 1px solid var(--line);
  backdrop-filter: blur(10px);
}
.topbar-links { display: flex; align-items: center; gap: 16px; }
.topbar-links a { color: var(--muted); font-size: 13px; font-weight: 700; }
.topbar-links a:hover { color: var(--ink); }
.topbar a, .operator { color: var(--muted); font-size: 13px; }
.operator { display: flex; align-items: center; gap: 10px; }
.avatar {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #e9edf2;
  color: var(--ink);
  font-weight: 800;
}
.content { padding: 24px 28px 40px; }
.page-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 18px;
}
h1 { margin: 0; font-size: 26px; line-height: 1.25; font-weight: 850; }
h2 { margin: 0; font-size: 18px; line-height: 1.3; }
h3 { margin: 0 0 10px; font-size: 16px; }
.sub { margin-top: 7px; color: var(--muted); font-size: 13px; line-height: 1.55; }
.btn-row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.btn {
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0 14px;
  border: 1px solid var(--line);
  border-radius: 7px;
  background: #fff;
  color: var(--ink);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}
.btn.primary { background: var(--red); border-color: var(--red); color: #fff; }
.btn.soft-red { background: var(--red-soft); border-color: #ffd6da; color: var(--red); }
.btn.blue { background: var(--blue); border-color: var(--blue); color: #fff; }
.btn:disabled { opacity: .55; cursor: not-allowed; }

.grid-2 { display: grid; grid-template-columns: minmax(0, 1fr) 330px; gap: 18px; }
.detail-single { grid-template-columns: minmax(0, 1fr); }
.grid-3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
.grid-4 { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
.panel {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 8px;
  overflow: hidden;
}
.panel-head {
  min-height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 18px;
  border-bottom: 1px solid var(--line);
  font-weight: 800;
}
.panel-body { padding: 18px; }
.stack { display: grid; gap: 14px; }
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 16px;
  row-gap: 16px;
  align-items: start;
}
.field {
  display: grid;
  gap: 6px;
  align-content: start;
}
.field.full { grid-column: 1 / -1; }
label {
  min-height: 18px;
  display: flex;
  align-items: center;
  font-size: 13px;
  line-height: 18px;
  color: #3b414a;
  font-weight: 700;
}
.required::after { content: "*"; color: var(--red); margin-left: 4px; }
input, select, textarea {
  width: 100%;
  border: 1px solid #d8dee6;
  border-radius: 7px;
  background: #fff;
  color: var(--ink);
  font-size: 14px;
  box-sizing: border-box;
}
input, select { height: 40px; padding: 0 11px; }
select {
  appearance: none;
  -webkit-appearance: none;
  padding-right: 38px;
  background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2 2L6 6L10 2' stroke='%237B8490' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  background-size: 12px 8px;
}
textarea { min-height: 80px; padding: 10px 11px; resize: vertical; }
input[readonly], input[disabled], textarea[readonly], textarea[disabled], select[disabled] {
  border-color: #d5dbe3;
  background-color: #eef1f5;
  color: #7b8490;
  -webkit-text-fill-color: #7b8490;
  cursor: not-allowed;
  opacity: 1;
  box-shadow: none;
}
.field.locked label { color: #8a929d; }
.field.locked .hint { color: #9aa3ad; }
.field.error input, .field.error select, .field.error textarea { border-color: var(--red); background: var(--red-soft); }
.inline-error { color: var(--red); font-size: 12px; line-height: 1.5; }
.input-unit {
  position: relative;
  display: block;
}
.input-unit input {
  padding-right: 52px;
}
.input-unit span {
  position: absolute;
  top: 1px;
  right: 1px;
  bottom: 1px;
  width: 44px;
  display: grid;
  place-items: center;
  border-left: 1px solid #d8dee6;
  border-radius: 0 6px 6px 0;
  background: #f6f8fa;
  color: var(--muted);
  font-size: 13px;
  font-weight: 700;
  pointer-events: none;
}
.choice-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
  min-height: 40px;
  align-items: center;
}
.choice-option {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--text);
  font-size: 13px;
  line-height: 1.4;
}
.choice-option input { width: auto; min-height: 0; accent-color: var(--red); }
.choice-option.is-locked { color: var(--muted); }
.combo {
  position: relative;
}
.combo input {
  padding-right: 34px;
}
.combo::after {
  content: "";
  position: absolute;
  top: 16px;
  right: 12px;
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 6px solid #7b8490;
  pointer-events: none;
}
.combo-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 8;
  display: none;
  gap: 4px;
  padding: 6px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 8px;
  box-shadow: 0 14px 32px rgba(31, 41, 55, .14);
}
.combo.open .combo-menu { display: grid; }
.combo-option {
  display: grid;
  gap: 3px;
  width: 100%;
  padding: 9px 10px;
  border: 0;
  border-radius: 6px;
  background: #fff;
  color: var(--ink);
  text-align: left;
  cursor: pointer;
}
.combo-option:hover { background: #f5f7fa; }
.combo-option b { font-size: 13px; }
.combo-option span {
  color: var(--muted);
  font-size: 12px;
  line-height: 1.4;
}
.upload {
  min-height: 118px;
  display: grid;
  place-items: center;
  text-align: center;
  border: 1px dashed #c6ced8;
  border-radius: 8px;
  background: #fbfcfd;
  color: var(--muted);
  font-size: 13px;
}
.hint { color: var(--muted); font-size: 12px; line-height: 1.5; }
.error-text { color: var(--red); font-size: 12px; line-height: 1.5; }
.filter-bar {
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr 1fr auto;
  gap: 12px;
  padding: 16px;
  margin-bottom: 14px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 8px;
}
.filter-bar .btn-query {
  width: 72px;
  min-width: 72px;
  padding: 0;
  justify-self: end;
}
.stat-card {
  min-height: 84px;
  display: grid;
  gap: 8px;
  padding: 14px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 8px;
}
.stat-card span { color: var(--muted); font-size: 12px; }
.stat-card strong { font-size: 25px; line-height: 1; }
a.stat-card:hover {
  border-color: #cbd4df;
  box-shadow: 0 8px 24px rgba(31, 41, 55, .06);
}
.metric-note {
  display: block;
  margin-top: -2px;
  color: var(--weak);
  font-size: 12px;
  line-height: 1.45;
}
.stats-filter {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: end;
}
.stats-filter-fields {
  display: contents;
}
.stats-filter-actions {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding-left: 0;
}
.stats-filter-actions .btn-query {
  justify-self: auto;
}
.stats-section-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, .9fr);
  gap: 14px;
  margin-top: 14px;
}
.metric-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.metric-item {
  padding: 12px;
  border: 1px solid var(--line-soft);
  border-radius: 7px;
  background: #fbfcfd;
}
.metric-item span {
  display: block;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.45;
}
.metric-item b {
  display: block;
  margin-top: 5px;
  font-size: 18px;
  line-height: 1.2;
}
.bar-list {
  display: grid;
  gap: 12px;
}
.bar-row {
  display: grid;
  grid-template-columns: 130px minmax(0, 1fr) 54px;
  align-items: center;
  gap: 10px;
  font-size: 13px;
}
.bar-label {
  min-width: 0;
  color: #3b414a;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.bar-track {
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: #eef1f5;
}
.bar-fill {
  height: 100%;
  border-radius: inherit;
  background: var(--red);
}
.bar-fill.blue { background: var(--blue); }
.bar-fill.green { background: var(--green); }
.bar-fill.amber { background: var(--amber); }
.bar-value {
  color: var(--muted);
  font-weight: 800;
  text-align: right;
}
.table-scroll {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-gutter: stable;
}
.table-scroll::before {
  content: attr(data-scroll-hint);
  display: none;
  padding: 10px 14px 0;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.5;
}
.data-table {
  width: 100%;
  min-width: var(--table-min-width, 760px);
  border-collapse: separate;
  border-spacing: 0;
  font-size: 13px;
}
.data-table th, .data-table td {
  padding: 13px 14px;
  text-align: left;
  border-bottom: 1px solid var(--line-soft);
  white-space: nowrap;
  background: #fff;
}
.data-table th { color: #626b76; background: #fbfcfd; font-weight: 800; }
.data-table tr:hover td { background: #fcfdff; }
.action-table th:last-child,
.action-table td:last-child {
  position: sticky;
  right: 0;
  z-index: 1;
  min-width: 132px;
  box-shadow: -12px 0 18px rgba(31, 41, 55, .07);
}
.action-table th:last-child {
  z-index: 2;
  background: #fbfcfd;
}
.action-table td:last-child { background: #fff; }
.action-table tr:hover td:last-child { background: #fcfdff; }
.tag {
  display: inline-grid;
  min-height: 24px;
  align-items: center;
  padding: 0 9px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 800;
}
.tag.green { background: var(--green-soft); color: var(--green); }
.tag.blue { background: var(--blue-soft); color: var(--blue); }
.tag.amber { background: var(--amber-soft); color: var(--amber); }
.tag.red { background: var(--red-soft); color: var(--red); }
.tag.gray { background: #eef0f3; color: #66707c; }
.link { color: var(--blue); font-weight: 800; margin-right: 10px; cursor: pointer; }
.desc-list { display: grid; gap: 12px; }
.desc-row { display: grid; grid-template-columns: 150px 1fr; gap: 16px; font-size: 13px; }
.desc-row span:first-child { color: var(--muted); }
.detail-meta-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px 32px; }
.detail-meta-item { min-width: 0; display: grid; grid-template-columns: 118px minmax(0, 1fr); gap: 12px; align-items: start; padding: 4px 0; font-size: 13px; }
.detail-meta-item span { color: var(--muted); }
.detail-meta-item b { min-width: 0; overflow-wrap: anywhere; }
.detail-meta-item.full { grid-column: 1 / -1; }
.order-product-table th:nth-child(n + 3), .order-product-table td:nth-child(n + 3) { text-align: right; }
.order-summary { width: min(100%, 420px); margin: 18px 14px 0 auto; display: grid; gap: 12px; font-size: 13px; }
.order-summary-row { display: grid; grid-template-columns: 1fr auto; gap: 24px; align-items: baseline; }
.order-summary-row span { color: var(--muted); text-align: right; }
.order-summary-row b { min-width: 130px; text-align: right; }
.timeline { display: grid; gap: 14px; }
.step { display: grid; grid-template-columns: 22px 1fr; gap: 10px; font-size: 13px; }
.dot {
  width: 20px;
  height: 20px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--blue-soft);
  color: var(--blue);
  font-size: 12px;
  font-weight: 900;
}
.empty {
  min-height: 150px;
  display: grid;
  place-items: center;
  text-align: center;
  border: 1px dashed #d7dee8;
  border-radius: 8px;
  color: var(--muted);
  background: #fbfcfd;
}
.alert {
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid #ffd6da;
  background: var(--red-soft);
  color: var(--red);
  font-size: 13px;
  line-height: 1.5;
}
.success {
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid #c8eadf;
  background: var(--green-soft);
  color: var(--green);
  font-size: 13px;
  line-height: 1.5;
}
.tabs { display: flex; gap: 8px; margin-bottom: 14px; }
.tab {
  height: 34px;
  display: inline-flex;
  align-items: center;
  padding: 0 14px;
  border: 1px solid var(--line);
  border-radius: 17px;
  background: #fff;
  color: var(--muted);
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
}
.tab.active { background: #252a31; color: #fff; border-color: #252a31; }
.tab-panel { display: none; }
.tab-panel.active { display: block; }
.modal-mask {
  position: fixed;
  inset: 0;
  display: none;
  place-items: center;
  background: rgba(31, 41, 55, .38);
  z-index: 10;
}
.modal-mask.show { display: grid; }
.modal {
  width: min(520px, calc(100vw - 40px));
  background: #fff;
  border-radius: 10px;
  box-shadow: var(--shadow);
  border: 1px solid var(--line);
  overflow: hidden;
}
.modal .panel-head { border-bottom: 1px solid var(--line); }
.toast {
  position: fixed;
  left: 50%;
  bottom: 32px;
  transform: translateX(-50%);
  display: none;
  padding: 10px 16px;
  border-radius: 18px;
  background: #252a31;
  color: #fff;
  font-size: 13px;
  z-index: 20;
}
.toast.show { display: block; }

.site-home {
  min-height: 100vh;
  padding: 42px;
  background: linear-gradient(135deg, #f8fafc 0%, #fff5f5 100%);
}
.home-card {
  max-width: 1180px;
  margin: 0 auto;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 10px;
  box-shadow: var(--shadow);
  padding: 28px;
}
.home-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-top: 22px;
}
.home-link {
  min-height: 116px;
  display: grid;
  align-content: start;
  gap: 8px;
  padding: 16px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fbfcfd;
}
.home-link b { font-size: 16px; }
.home-link span { color: var(--muted); font-size: 13px; line-height: 1.5; }

.app-stage {
  min-height: 100vh;
  position: relative;
  display: grid;
  place-items: center;
  padding: 24px;
  background: linear-gradient(180deg, #fff6f0 0%, #f4f6fa 48%, #f8fafc 100%);
}
.prototype-switcher {
  position: absolute;
  top: 24px;
  right: 24px;
  display: flex;
  gap: 8px;
}
.prototype-switcher a {
  min-height: 32px;
  display: inline-flex;
  align-items: center;
  padding: 0 12px;
  border: 1px solid var(--line);
  border-radius: 7px;
  background: rgba(255, 255, 255, .92);
  color: var(--muted);
  font-size: 13px;
  font-weight: 800;
  box-shadow: 0 8px 22px rgba(31, 41, 55, .08);
}
.phone-frame {
  width: 390px;
  height: 844px;
  overflow: hidden;
  border: 8px solid #222832;
  border-radius: 28px;
  background: #f8fafc;
  box-shadow: 0 28px 70px rgba(28, 32, 39, .25);
  display: grid;
  grid-template-rows: 44px 1fr 64px;
}
.phone-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px;
  background: #fff7f2;
  font-size: 13px;
  font-weight: 800;
}
.app-screen {
  min-height: 0;
  overflow: auto;
  padding: 18px 16px;
  background: linear-gradient(180deg, #fff7f2 0%, #fff 170px, #f8fafc 100%);
}
.app-title { margin-bottom: 16px; }
.app-title h1 { font-size: 25px; }
.app-title-bar {
  min-height: 40px;
  position: relative;
  display: grid;
  place-items: center;
  margin-bottom: 16px;
}
.app-title-bar h1 { font-size: 23px; }
.app-back {
  position: absolute;
  left: 0;
  top: 0;
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 18px;
  background: transparent;
  color: var(--ink);
  font-size: 28px;
  line-height: 1;
  font-weight: 650;
  cursor: pointer;
}
.app-back:hover { background: rgba(31, 41, 55, .06); }
.pill {
  min-height: 28px;
  display: inline-flex;
  align-items: center;
  padding: 0 10px;
  border-radius: 14px;
  background: #fff;
  border: 1px solid #ffe1d3;
  color: var(--red);
  font-size: 12px;
  font-weight: 800;
}
.app-tabs { display: flex; gap: 8px; margin: 18px 0 12px; }
.app-tab {
  height: 32px;
  display: grid;
  place-items: center;
  padding: 0 13px;
  border-radius: 16px;
  background: #fff;
  color: #646b75;
  font-size: 13px;
  font-weight: 800;
}
.app-tab.active { background: #222832; color: #fff; }
.app-panel { display: none; }
.app-panel.active { display: block; }
.mini-list { display: grid; gap: 12px; }
.mini-coupon {
  min-height: 108px;
  display: grid;
  grid-template-columns: 92px minmax(0, 1fr);
  overflow: hidden;
  border-radius: 14px;
  border: 1px solid #ffd9ca;
  background: #fff8f5;
  box-shadow: 0 8px 24px rgba(31, 41, 55, .055);
}
.mini-coupon.coupon-row {
  grid-template-columns: 92px minmax(0, 1fr) auto;
  align-items: center;
}
.mini-coupon.cash-coupon { border-color: #ffd9ca; background: #fff8f5; }
.mini-coupon.diamond-coupon { border-color: #c9e5f5; background: #f4fbff; }
.mini-coupon.diamond-coupon .mini-value { border-right-color: #b8dff4; color: #1677a4; }
.mini-coupon.state-using { border-color: #f3d69c; background: #fffdf3; }
.mini-coupon.invalid { background: #f8fafc; border-color: #e5eaf0; }
.mini-coupon.invalid .mini-value { border-right-color: #d9e0e8; background: rgba(255, 255, 255, .5); color: #737d89; }
.mini-coupon .btn {
  align-self: center;
  justify-self: end;
  margin-right: 14px;
  min-width: 72px;
}
.mini-value {
  min-height: 100%;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 4px;
  padding: 12px 8px;
  border-right: 1px dashed #ffc5b3;
  background: rgba(255, 255, 255, .7);
  color: var(--red);
  text-align: center;
  font-size: 24px;
  font-weight: 950;
}
.mini-value strong { font-size: 24px; line-height: 1; font-weight: 950; }
.mini-value span { font-size: 12px; font-weight: 800; line-height: 1.25; }
.mini-copy {
  min-width: 0;
  display: grid;
  align-content: center;
  gap: 5px;
  padding: 12px 14px;
}
.mini-copy b { font-size: 15px; line-height: 1.35; }
.mini-copy span { color: var(--muted); font-size: 12px; line-height: 1.35; }
.coupon-note { color: var(--red) !important; }
.coupon-invalid { color: #a94442 !important; }
.app-empty {
  min-height: 88px;
  display: grid;
  place-items: center;
  margin-top: 12px;
  border: 1px dashed #d9dfe8;
  border-radius: 14px;
  color: #8a929d;
  text-align: center;
  font-size: 13px;
  line-height: 1.5;
}
.app-bottom {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  border-top: 1px solid var(--line-soft);
  background: #fff;
}
.app-bottom a {
  display: grid;
  place-items: center;
  gap: 4px;
  padding-top: 8px;
  color: #78818d;
  font-size: 12px;
}
.app-bottom a.on { color: var(--red); font-weight: 900; }
.app-bottom span {
  width: 20px;
  height: 20px;
  border: 2px solid currentColor;
  border-radius: 6px;
}
@media (max-width: 980px) {
  .admin-shell { grid-template-columns: 1fr; }
  .sidebar { position: static; height: auto; }
  .content { padding: 18px; }
  .grid-2, .grid-3, .grid-4, .filter-bar, .form-grid, .home-grid, .stats-section-grid, .metric-grid { grid-template-columns: 1fr; }
  .detail-meta-grid { grid-template-columns: 1fr; }
  .detail-meta-item.full { grid-column: auto; }
  .stats-filter-actions { justify-content: flex-end; padding-left: 0; }
  .bar-row { grid-template-columns: 1fr; align-items: stretch; }
  .bar-value { text-align: left; }
  .backend-surface .table-scroll::before { display: block; }
  .backend-surface .panel-head { align-items: flex-start; padding-top: 14px; padding-bottom: 14px; }
  .prototype-switcher {
    position: static;
    align-self: start;
    justify-self: center;
    margin-bottom: 12px;
  }
}
@media (max-width: 480px) {
  .app-stage { padding: 12px; place-items: start center; }
  .phone-frame { width: 100%; height: min(844px, calc(100vh - 24px)); }
  .prototype-switcher { margin-bottom: 8px; }
}
`;

const js = `
function prototypeReturnTarget(fallback) {
  const params = new URLSearchParams(window.location.search);
  const returnKey = params.get("return");
  const targets = {
    "budget-pools": "../../pages/backend/budget-pools.html",
    "coupon-batches": "../../pages/backend/coupon-batches.html",
    "coupon-batch-form": "../../pages/backend/coupon-batch-form.html",
    "coupon-batch-detail-direct": "../../pages/backend/coupon-batch-detail-direct.html",
    approvals: "../../pages/backend/approvals.html",
    "external-scenes": "../../pages/backend/external-scenes.html",
    "external-scene-detail": "../../pages/backend/external-scene-detail.html",
    "issue-tasks": "../../pages/backend/issue-tasks.html",
    "user-records": "../../pages/backend/user-records.html",
  };
  const target = targets[returnKey] || fallback;
  const tab = params.get("tab");
  return returnKey === "approvals" && tab ? target + "?tab=" + encodeURIComponent(tab) : target;
}

function prototypeHrefWithReturn(href) {
  const params = new URLSearchParams(window.location.search);
  const returnKey = params.get("return");
  if (!returnKey) return href;

  const separator = href.includes("?") ? "&" : "?";
  return href + separator + "return=" + encodeURIComponent(returnKey);
}

function setBudgetPoolValue(form, selector, value) {
  const target = form.querySelector(selector);
  if (!target) return;
  if ("value" in target) {
    target.value = value;
  } else {
    target.textContent = value;
  }
}

const budgetPoolContexts = {
  BP20260701009: {
    id: "BP20260701009",
    name: "平台通用预算池",
    costOwner: "平台",
    owner: "陈运营",
    period: "2026-07-10 至 2026-08-31",
    total: "800,000.00 元",
    afterTotal: "1,000,000.00 元",
    allocated: "720,000.00 元",
    available: "80,000.00 元",
    redeemed: "256,500.00 元",
    unsettled: "48,000.00 元",
    committed: "304,500.00 元",
    remaining: "495,500.00 元",
  },
  BP20260709002: {
    id: "BP20260709002",
    name: "8 月新人预算池",
    costOwner: "业务线：通钻购买",
    owner: "赵运营",
    period: "2026-08-01 至 2026-08-31",
    total: "300,000.00 元",
    afterTotal: "500,000.00 元",
    allocated: "120,000.00 元",
    available: "180,000.00 元",
    redeemed: "0.00 元",
    unsettled: "0.00 元",
    committed: "0.00 元",
    remaining: "300,000.00 元",
  },
};

function syncBudgetIncreaseForm() {
  const form = document.querySelector("[data-budget-increase-form]");
  if (!form) return;

  const poolId = new URLSearchParams(window.location.search).get("pool") || "BP20260701009";
  const context = budgetPoolContexts[poolId] || budgetPoolContexts.BP20260701009;
  setBudgetPoolValue(form, "[data-budget-pool-id]", context.id);
  setBudgetPoolValue(form, "[data-budget-pool-name]", context.name);
  setBudgetPoolValue(form, "[data-budget-cost-owner]", context.costOwner);
  setBudgetPoolValue(form, "[data-budget-owner]", context.owner);
  setBudgetPoolValue(form, "[data-budget-period]", context.period);
  setBudgetPoolValue(form, "[data-budget-total]", context.total);
  setBudgetPoolValue(form, "[data-budget-after-total]", context.afterTotal);
  setBudgetPoolValue(form, "[data-budget-allocated]", context.allocated);
  setBudgetPoolValue(form, "[data-budget-available]", context.available);
  setBudgetPoolValue(form, "[data-budget-redeemed]", context.redeemed);
  setBudgetPoolValue(form, "[data-budget-unsettled]", context.unsettled);
  setBudgetPoolValue(form, "[data-budget-committed]", context.committed);
  setBudgetPoolValue(form, "[data-budget-remaining]", context.remaining);
}

function syncCouponBatchForm(form, changedElement) {
  if (!form) return;

  const benefitType = form.querySelector("[data-benefit-type]")?.value;
  form.querySelectorAll("[data-benefit-field]").forEach((field) => {
    field.hidden = field.dataset.benefitField !== benefitType;
  });

  const couponType = form.querySelector("[data-coupon-type]")?.value;
  form.querySelectorAll("[data-coupon-rule]").forEach((field) => {
    field.hidden = field.dataset.couponRule !== couponType || (field.dataset.benefitField && field.dataset.benefitField !== benefitType);
  });

  const cashScopeMode = form.querySelector("[data-cash-scope-mode]")?.value;
  const switchedToSpecifiedBusiness = changedElement?.matches("[data-cash-scope-mode]") && cashScopeMode === "指定业务线";
  form.querySelectorAll("[data-cash-scene-mode]").forEach((field) => {
    field.hidden = field.dataset.cashSceneMode !== cashScopeMode;
  });
  if (switchedToSpecifiedBusiness) {
    form.querySelectorAll("[data-cash-business-scene]").forEach((input) => { input.checked = false; });
  }

  const diamondTarget = form.querySelector("[data-diamond-target]")?.value;
  form.querySelectorAll("[data-diamond-target-field]").forEach((field) => {
    field.hidden = field.dataset.diamondTargetField !== diamondTarget;
  });

  const scopeMode = benefitType === "现金优惠券" ? cashScopeMode : "指定业务线";
  form.querySelectorAll("[data-jump-link]").forEach((field) => {
    field.hidden = scopeMode !== "指定业务线";
  });

  const issueMethod = form.querySelector("[data-issue-method]")?.value;
  form.querySelectorAll("[data-issue-target='direct']").forEach((field) => {
    field.hidden = issueMethod !== "运营定向发券";
  });

  const directMode = form.querySelector("[data-direct-target-mode]")?.value;
  form.querySelectorAll("[data-direct-target-panel]").forEach((panel) => {
    panel.hidden = issueMethod !== "运营定向发券" || panel.dataset.directTargetPanel !== directMode;
  });

  form.querySelectorAll("[data-claim-target]").forEach((field) => {
    field.hidden = issueMethod !== "用户主动领取";
  });
  const claimTargetType = form.querySelector("[data-claim-target-type]")?.value;
  form.querySelectorAll("[data-claim-target-panel]").forEach((panel) => {
    panel.hidden = issueMethod !== "用户主动领取" || panel.dataset.claimTargetPanel !== claimTargetType;
  });
  const claimIdMode = form.querySelector("[data-claim-id-mode]")?.value;
  form.querySelectorAll("[data-claim-id-panel]").forEach((panel) => {
    panel.hidden = issueMethod !== "用户主动领取" || claimTargetType !== "按用户 ID" || panel.dataset.claimIdPanel !== claimIdMode;
  });

  const validityType = form.querySelector("[data-validity-type]")?.value;
  form.querySelectorAll("[data-validity-field]").forEach((field) => {
    field.hidden = field.dataset.validityField !== validityType;
  });

  const batchBudgetCap = form.querySelector("[data-batch-budget-cap]");
  if (batchBudgetCap) {
    batchBudgetCap.value = benefitType === "通钻抵扣券" ? "18,000.00 元（按平台规则折算）" : "120,000.00 元（自动计算）";
  }
}

function syncAllCouponBatchForms() {
  document.querySelectorAll("[data-coupon-batch-form]").forEach(syncCouponBatchForm);
}

function syncBudgetPoolCostOwner(form) {
  if (!form) return;

  const type = form.querySelector("[data-cost-owner-type]")?.value;
  const businessLineField = form.querySelector("[data-cost-owner-business-line-field]");
  const businessLine = form.querySelector("[data-cost-owner-business-line]");
  if (!businessLineField || !businessLine) return;

  businessLineField.hidden = type !== "业务线";
  businessLine.required = type === "业务线";
  if (type !== "业务线") businessLine.value = "";
}

function syncAllBudgetPoolCostOwners() {
  document.querySelectorAll("[data-budget-pool-cost-form]").forEach(syncBudgetPoolCostOwner);
}

function initializeListFilters() {
  document.querySelectorAll(".filter-bar input").forEach((input) => {
    input.dataset.filterInitial = input.value.trim();
  });
}

function filterTableFor(filterBar) {
  const panel = filterBar.closest(".panel");
  if (panel?.querySelector("table")) return panel.querySelector("table");
  return filterBar.nextElementSibling?.querySelector("table") || null;
}

function applyListFilter(button) {
  const filterBar = button.closest(".filter-bar");
  const table = filterBar && filterTableFor(filterBar);
  if (!filterBar || !table) return;

  const filters = [...filterBar.querySelectorAll("input, select")]
    .map((control) => {
      const value = control.value.trim();
      if (!value || (control.tagName === "INPUT" && value === control.dataset.filterInitial)) return "";
      if (control.tagName === "SELECT" && control.selectedIndex === 0) return "";
      return value.toLowerCase();
    })
    .filter(Boolean);

  table.querySelectorAll("tr").forEach((row, index) => {
    if (index === 0) return;
    const text = row.textContent.toLowerCase();
    row.hidden = !filters.every((filter) => text.includes(filter));
  });
}

function applyIssueTaskListFilter(container) {
  if (!container) return;
  const keyword = container.querySelector("[data-issue-task-keyword]")?.value.trim().toLowerCase() || "";
  const trigger = container.querySelector("[data-issue-task-trigger]")?.value || "";
  const status = container.querySelector("[data-issue-task-status]")?.value || "";
  const batch = container.querySelector("[data-issue-task-batch]")?.value || "";
  container.querySelectorAll("[data-issue-task-row]").forEach((row) => {
    const matches = (!keyword || row.textContent.toLowerCase().includes(keyword))
      && (!trigger || row.dataset.taskTrigger === trigger)
      && (!status || row.dataset.taskStatus === status)
      && (!batch || row.dataset.taskBatch === batch);
    row.hidden = !matches;
  });
}

function applyIssueTaskDetailFilter(container) {
  if (!container) return;
  const keyword = container.querySelector("[data-issue-detail-keyword]")?.value.trim().toLowerCase() || "";
  const status = container.querySelector("[data-issue-detail-status]")?.value || "";
  const retry = container.querySelector("[data-issue-detail-retry]")?.value || "";
  container.querySelectorAll("[data-issue-detail-row]").forEach((row) => {
    const matches = (!keyword || row.textContent.toLowerCase().includes(keyword))
      && (!status || row.dataset.detailStatus === status)
      && (!retry || row.dataset.detailRetry === retry);
    row.hidden = !matches;
  });
}

function switchAppTab(tab) {
  const target = tab.dataset.appTab;
  if (!target) return;

  document.querySelectorAll("[data-app-tab]").forEach((node) => {
    node.classList.toggle("active", node === tab);
  });
  document.querySelectorAll("[data-app-panel]").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.appPanel === target);
  });
}

function voidUserCoupon(button) {
  const modal = button.closest(".modal-mask");
  const reasonInput = modal?.querySelector("[data-user-coupon-void-reason]");
  const error = modal?.querySelector("[data-user-coupon-void-error]");
  const reason = reasonInput?.value.trim();

  if (!reason) {
    if (error) error.hidden = false;
    return false;
  }

  document.querySelectorAll("[data-user-coupon-row]").forEach((row) => {
    const status = row.querySelector("[data-user-coupon-status]");
    const reasonNode = row.querySelector("[data-user-coupon-reason]");
    const action = row.querySelector("[data-user-coupon-action]");
    if (status) status.innerHTML = '<span class="tag red">已作废</span>';
    if (reasonNode) reasonNode.textContent = reason;
    if (action) action.hidden = true;
  });
  modal?.classList.remove("show");
  return true;
}

function closeBudgetPool(button) {
  const modal = button.closest(".modal-mask");
  const reasonInput = modal?.querySelector("[data-budget-pool-close-reason]");
  const error = modal?.querySelector("[data-budget-pool-close-error]");

  if (!reasonInput?.value.trim()) {
    if (error) error.hidden = false;
    return false;
  }

  return true;
}

function syncClaimedCoupon() {
  let claimed = false;
  try {
    claimed = window.sessionStorage.getItem("coupon-center-claimed") === "true";
  } catch (error) {
    claimed = false;
  }
  if (!claimed) return;

  document.querySelectorAll("[data-claim-coupon]").forEach((button) => {
    button.closest(".mini-coupon")?.remove();
  });
  const empty = document.querySelector("[data-claim-empty]");
  if (empty) empty.hidden = false;
}

function claimCoupon(button) {
  button.disabled = true;
  button.textContent = "已领取";
  button.classList.remove("soft-red");
  const status = button.closest(".mini-coupon")?.querySelector("[data-claim-status]");
  if (status) {
    status.textContent = "已领取";
    status.className = "tag blue";
  }
  try {
    window.sessionStorage.setItem("coupon-center-claimed", "true");
  } catch (error) {
    // 原型在禁用存储的浏览器中仍保留当前会话内的领取反馈。
  }
}

function selectTab(group, tabName) {
  document.querySelectorAll("[data-tab][data-group='" + group + "']").forEach((node) => node.classList.toggle("active", node.dataset.tab === tabName));
  document.querySelectorAll("[data-panel][data-group='" + group + "']").forEach((node) => node.classList.toggle("active", node.dataset.panel === tabName));
}

function syncApprovalTabFromQuery() {
  if (!window.location.pathname.endsWith("/pages/backend/approvals.html")) return;
  const tab = new URLSearchParams(window.location.search).get("tab");
  if (tab === "budget" || tab === "batch") selectTab("approval", tab);
}

document.addEventListener("DOMContentLoaded", () => {
  syncAllCouponBatchForms();
  syncAllBudgetPoolCostOwners();
  syncBudgetIncreaseForm();
  syncClaimedCoupon();
  syncApprovalTabFromQuery();
  initializeListFilters();
});

document.addEventListener("click", (event) => {
  const returnLink = event.target.closest("[data-return-link]");
  if (returnLink) {
    event.preventDefault();
    window.location.href = prototypeReturnTarget(returnLink.getAttribute("href"));
    return;
  }

  const preserveReturnLink = event.target.closest("[data-preserve-return]");
  if (preserveReturnLink) {
    event.preventDefault();
    window.location.href = prototypeHrefWithReturn(preserveReturnLink.getAttribute("href"));
    return;
  }

  const backButton = event.target.closest("[data-back-fallback]");
  if (backButton) {
    const fallback = backButton.dataset.backFallback;
    if (document.referrer && document.referrer.includes("/pages/app/")) {
      window.history.back();
    } else if (fallback) {
      window.location.href = fallback;
    }
    return;
  }

  const tab = event.target.closest("[data-tab]");
  if (tab) {
    selectTab(tab.dataset.group, tab.dataset.tab);
  }

  const appTab = event.target.closest("[data-app-tab]");
  if (appTab) {
    switchAppTab(appTab);
  }

  const claimButton = event.target.closest("[data-claim-coupon]");
  if (claimButton) {
    claimCoupon(claimButton);
  }

  const modalOpen = event.target.closest("[data-open-modal]");
  if (modalOpen) {
    const modal = document.querySelector(modalOpen.dataset.openModal);
    if (modal) modal.classList.add("show");
  }

  const modalClose = event.target.closest("[data-close-modal]");
  if (modalClose) {
    modalClose.closest(".modal-mask")?.classList.remove("show");
  }

  const issueTaskFilterButton = event.target.closest("[data-issue-task-filter-action]");
  if (issueTaskFilterButton) {
    applyIssueTaskListFilter(issueTaskFilterButton.closest("[data-issue-task-filter]"));
  }

  const issueTaskDetailFilterButton = event.target.closest("[data-issue-detail-filter-action]");
  if (issueTaskDetailFilterButton) {
    applyIssueTaskDetailFilter(issueTaskDetailFilterButton.closest("[data-issue-detail-filter]"));
  }

  const listFilterButton = event.target.closest("[data-list-filter-action]");
  if (listFilterButton) {
    applyListFilter(listFilterButton);
  }

  const userCouponVoid = event.target.closest("[data-user-coupon-void]");
  if (userCouponVoid && !voidUserCoupon(userCouponVoid)) {
    return;
  }

  const budgetPoolClose = event.target.closest("[data-budget-pool-close]");
  if (budgetPoolClose && !closeBudgetPool(budgetPoolClose)) {
    return;
  }

  const toastButton = event.target.closest("[data-toast]");
  if (toastButton) {
    let toast = document.querySelector(".toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      document.body.appendChild(toast);
    }
    toast.textContent = toastButton.dataset.toast;
    toast.classList.add("show");
    window.clearTimeout(window.__toastTimer);
    window.__toastTimer = window.setTimeout(() => toast.classList.remove("show"), 1800);

    const redirect = toastButton.dataset.returnRedirect
      ? prototypeReturnTarget(toastButton.dataset.returnRedirect)
      : toastButton.dataset.redirect;
    if (redirect) {
      toastButton.closest(".modal-mask")?.classList.remove("show");
      window.clearTimeout(window.__redirectTimer);
      window.__redirectTimer = window.setTimeout(() => {
        window.location.href = redirect;
      }, Number(toastButton.dataset.redirectDelay || 700));
    }
  }
});

document.addEventListener("change", (event) => {
  const costOwnerType = event.target.closest("[data-cost-owner-type]");
  if (costOwnerType) {
    syncBudgetPoolCostOwner(costOwnerType.closest("[data-budget-pool-cost-form]"));
    return;
  }

  const changed = event.target.closest("[data-benefit-type], [data-coupon-type], [data-issue-method], [data-validity-type], [data-direct-target-mode], [data-cash-scope-mode], [data-diamond-target], [data-claim-target-type], [data-claim-id-mode]");
  if (!changed) return;

  syncCouponBatchForm(changed.closest("[data-coupon-batch-form]"), changed);
});
`;

function pageHead(title, sub, actions = "") {
  return `<div class="page-head">
    <div><h1>${title}</h1><div class="sub">${sub}</div></div>
    <div class="btn-row">${actions}</div>
  </div>`;
}

function statusCards(items) {
  return `<div class="grid-4">${items.map(([label, value, href]) => {
    const body = `<span>${label}</span><strong>${value}</strong>`;
    return href ? `<a class="stat-card" href="${href}">${body}</a>` : `<div class="stat-card">${body}</div>`;
  }).join("")}</div>`;
}

function inventorySnapshot(total, issued) {
  const remaining = total - issued;
  const format = (value) => value.toLocaleString("zh-CN");
  return `<section class="panel" style="margin-top:14px;"><div class="panel-head">库存信息</div><div class="panel-body desc-list"><div class="desc-row"><span>总库存</span><b>${format(total)} 张</b></div><div class="desc-row"><span>已发放数量</span><b>${format(issued)} 张</b></div><div class="desc-row"><span>剩余库存</span><b>${format(remaining)} 张</b></div></div></section>`;
}

function couponBatchConfiguration({
  name = "",
  benefitType = "现金优惠券",
  couponType = "固定抵扣券",
  pool = "平台通用预算池",
  costOwner = "平台营销预算（继承预算池）",
  activityTime = "",
  scopeMode = "全平台通用",
  businessScene = "通钻购买、算力购买、电影票购买",
  couponTarget = "",
  targetIds = "",
  ruleFields = [["抵扣金额", "20.00 元"], ["使用门槛", "满 99.00 元可用"]],
  validityType = "领取后 N 天",
  validity,
  budgetCap = "",
  actualOccupied = "",
  remainingBudget = "",
  budgetRate = "",
  issue,
  usageInstructions = "一期平台券单个订单仅可使用一张，且不可与业务线其他活动叠加。",
  approvalNo,
  approvalStatus = "审核通过",
  reviewer = "陈审核",
  reviewedAt = "2026-07-10 10:30",
  approvalImage = "approval-proof.png",
  rejectReason = "",
}) {
  const item = (label, value, full = false) => value ? `<div class="detail-meta-item${full ? " full" : ""}"><span>${label}</span><b>${value}</b></div>` : "";
  const fields = [
    ["券名称", name], ["权益类型", benefitType], ["券类型", couponType], ["关联预算池", pool], ["成本归属", costOwner], ["券批次活动时间", activityTime],
    ["适用模式", scopeMode], ["业务场景", businessScene], ["优惠券可用目标", couponTarget, true], ["短剧/剧集 ID", targetIds, true],
    ...ruleFields, ["有效期类型", validityType], ["券有效期", validity], ["批次预算上限", budgetCap], ["当前实际占用", actualOccupied], ["批次剩余预算", remainingBudget], ["预算结算汇率", budgetRate],
    ["发放方式", issue], ["每人限领", "1 张"], ["设备限领", "1 张"], ["使用说明", usageInstructions, true],
    ["审批单号", approvalNo], ["审批状态", approvalStatus], ["审核人", reviewer], ["审核时间", reviewedAt], ["审批图片", approvalImage, true], ["驳回原因", rejectReason, true],
  ];
  return `<section class="panel" style="margin-top:14px;"><div class="panel-head">创建配置快照</div><div class="panel-body detail-meta-grid">${fields.map(([label, value, full]) => item(label, value, full)).join("")}</div></section>`;
}

function mergeCouponBatchConfiguration(body) {
  const normalizedBody = body
    .replaceAll('<span>预算池</span>', '<span>关联预算池</span>')
    .replaceAll('<span>券类型</span><b>金额券</b>', '<span>券类型</span><b>固定抵扣券</b>');
  const configurationPattern = /<section class="panel" style="margin-top:14px;"><div class="panel-head">创建配置快照<\/div><div class="panel-body detail-meta-grid">([\s\S]*?)<\/div><\/section>/;
  const configurationMatch = normalizedBody.match(configurationPattern);
  if (!configurationMatch) return normalizedBody;

  const basicInfoPattern = /(<section class="panel"><div class="panel-head"><span>基础信息<\/span>[\s\S]*?<\/div>)<div class="panel-body desc-list">([\s\S]*?)<\/div><\/section>/;
  const basicInfoMatch = normalizedBody.match(basicInfoPattern);
  if (!basicInfoMatch) return normalizedBody;

  const item = (label, value, full = false) => `<div class="detail-meta-item${full ? " full" : ""}"><span>${label}</span><b>${value}</b></div>`;
  const fields = new Map();
  for (const [, label, value] of basicInfoMatch[2].matchAll(/<div class="desc-row"><span>([^<]+)<\/span>([\s\S]*?)<\/div>/g)) {
    fields.set(label, { value: value.trim().replace(/^<b>([\s\S]*?)<\/b>$/, "$1"), full: false });
  }
  for (const [, fullClass, label, value] of configurationMatch[1].matchAll(/<div class="detail-meta-item( full)?"><span>([^<]+)<\/span><b>([\s\S]*?)<\/b><\/div>/g)) {
    if (!fields.has(label)) fields.set(label, { value, full: Boolean(fullClass) });
  }

  const fieldOrder = [
    "券批次 ID", "券名称", "权益类型", "券类型", "关联预算池", "成本归属", "券批次活动时间", "发放方式",
    "适用模式", "业务场景", "优惠券可用目标", "短剧/剧集 ID", "最低实付", "单业务线跳转",
    "抵扣金额", "抵扣通钻数", "折扣比例", "最高抵扣金额", "最高抵扣通钻数", "使用门槛",
    "有效期类型", "券有效期", "批次预算上限", "当前实际占用", "批次剩余预算", "预算结算汇率",
    "每人限领", "设备限领", "使用说明", "审批单号", "审批状态", "审核人", "审核时间", "审批图片", "驳回原因",
  ];
  const orderedItems = fieldOrder.filter((label) => fields.has(label)).map((label) => {
    const { value, full } = fields.get(label);
    return item(label, value, full);
  }).join("");
  const extraItems = [...fields].filter(([label]) => !fieldOrder.includes(label)).map(([label, { value, full }]) => item(label, value, full)).join("");
  const mergedBasicInfo = `${basicInfoMatch[1]}<div class="panel-body detail-meta-grid">${orderedItems}${extraItems}</div></section>`;
  return normalizedBody.replace(basicInfoPattern, mergedBasicInfo).replace(configurationPattern, "");
}

function couponBatchUserCouponRecords(rows) {
  return `<section class="panel" style="margin-top:14px;"><div class="panel-head">用户券记录</div><table class="data-table"><tr><th>用户券 ID</th><th>用户 ID</th><th>手机号</th><th>券名称</th><th>用户券状态</th><th>到账时间</th><th>用户券实际有效期</th><th>操作</th></tr>${rows.map(([id, userId, phone, couponName, status, receivedAt, validity]) => `<tr><td>${id}</td><td>${userId}</td><td>${phone}</td><td>${couponName}</td><td>${userCouponStatusTag(status)}</td><td>${receivedAt}</td><td>${validity}</td><td><a class="link" href="../../pages/backend/user-records.html?batch=${id}">查看</a></td></tr>`).join("")}</table></section>`;
}

function diamondTargetBatchDetail({ id, name, target, targetIds, approvalNo, budgetCap, actualOccupied, stock, issued }) {
  const remainingBudget = (Number(budgetCap.replace(/,/g, "")) - Number(actualOccupied.replace(/,/g, ""))).toLocaleString("zh-CN", { minimumFractionDigits: 2 });
  return layout(`pages/backend/coupon-batch-detail-${target === "指定短剧" ? "diamond-drama" : "diamond-episode"}.html`, "券批次详情", "券批次管理", `
${pageHead("券批次详情", "通钻抵扣券按已固化汇率折算人民币预算；内容下架不触发系统自动处理。", `<a class="btn" href="../../pages/backend/coupon-batches.html" data-return-link>返回</a>`)}
<div class="grid-2 detail-single"><section class="panel"><div class="panel-head"><span>基础信息</span><span class="tag green">进行中</span></div><div class="panel-body desc-list"><div class="desc-row"><span>券批次 ID</span><b>${id}</b></div><div class="desc-row"><span>券名称</span><b>${name}</b></div><div class="desc-row"><span>权益类型</span><b>通钻抵扣券</b></div><div class="desc-row"><span>券类型</span><b>折扣券</b></div></div></section></div>
${couponBatchConfiguration({ name, benefitType: "通钻抵扣券", couponType: "折扣券", pool: "平台通用预算池", costOwner: "平台营销预算（继承预算池）", activityTime: "2026-07-14 至 2026-08-31", scopeMode: "指定业务线：短剧", businessScene: "短剧", couponTarget: target, targetIds, ruleFields: [["折扣比例", "8 折"], ["最高抵扣通钻数", "30 通钻"], ["使用门槛", "满 100 通钻可用"]], budgetCap: `${budgetCap} 元`, actualOccupied: `${actualOccupied} 元`, remainingBudget: `${remainingBudget} 元`, budgetRate: "10 通钻 = 1 元", validity: "领取后 7 天有效", issue: "用户主动领取", usageInstructions: "短剧订单仅可使用一张通钻抵扣券，通钻扣款成功后立即核销。", approvalNo })}
${inventorySnapshot(stock, issued)}
${couponBatchUserCouponRecords([[`UC${id.slice(2)}001`, "u_770101", "13800000031", name, "待使用", "2026-07-14 11:20", "2026-07-14 至 2026-07-21"]])}
`);
}

function queryButton() {
  return `<button class="btn primary btn-query" type="button" data-list-filter-action>查询</button>`;
}

function modal(id, title, body, footer) {
  return `<div class="modal-mask" id="${id}">
    <section class="modal">
      <div class="panel-head"><span>${title}</span><button class="btn" data-close-modal>关闭</button></div>
      <div class="panel-body stack">${body}${footer ? `<div class="btn-row">${footer}</div>` : ""}</div>
    </section>
  </div>`;
}

const issueTaskSamples = [
  ["T20260709001", "客服补偿名单发放", "批量发放", "运营主动触发", "", "", "", "CB20260709015", "120", "118", "2", "部分失败", "2026-07-09 10:20", "部分用户达到同批次每人限领"],
  ["T20260708001", "平台系统-coupon_issue_standard调用", "单条发放", "外部接口调用", "standard_20260708_0001", "平台系统", "coupon_issue_standard", "CB20260708021", "1", "1", "0", "成功", "2026-07-08 15:20", "-"],
  ["T20260708002", "平台系统-coupon_issue_standard调用", "单条发放", "外部接口调用", "standard_20260708_0002", "平台系统", "coupon_issue_standard", "CB20260708021", "1", "0", "1", "失败", "2026-07-08 15:32", "外部发券场景未生效"],
  ["T20260708003", "平台系统-coupon_issue_standard调用", "批量发放", "外部接口调用", "standard_20260708_0003", "平台系统", "coupon_issue_standard", "CB20260708021", "820", "820", "0", "成功", "2026-07-08 15:45", "-"],
  ["T20260708004", "平台系统-coupon_issue_standard调用", "批量发放", "外部接口调用", "standard_20260708_0004", "平台系统", "coupon_issue_standard", "CB20260708021", "622", "610", "12", "部分失败", "2026-07-08 16:05", "部分用户达到同批次每人限领"],
  ["T20260708005", "平台系统-coupon_issue_standard调用", "批量发放", "外部接口调用", "standard_20260708_0005", "平台系统", "coupon_issue_standard", "CB20260708021", "3", "0", "0", "待执行", "2026-07-08 16:18", "-"],
  ["T20260708006", "平台系统-coupon_issue_standard调用", "批量发放", "外部接口调用", "standard_20260708_0006", "平台系统", "coupon_issue_standard", "CB20260708021", "240", "0", "0", "执行中", "2026-07-08 16:26", "-"],
  ["T20260708007", "平台系统-coupon_issue_standard调用", "批量发放", "外部接口调用", "standard_20260708_0007", "平台系统", "coupon_issue_standard", "CB20260708021", "5", "0", "5", "失败", "2026-07-08 16:40", "库存不足，整批未发放"],
];

const directIssueTaskSamples = [
  issueTaskSamples[0],
  ["T20260709002", "7月会员回馈名单发放", "批量发放", "运营主动触发", "", "", "", "CB20260709015", "80", "80", "0", "成功", "2026-07-09 11:05", "-"],
];

function issueTaskStatusTag(status) {
  const cls = {
    "待执行": "gray",
    "执行中": "blue",
    "成功": "green",
    "失败": "red",
    "部分失败": "amber",
  }[status] || "gray";
  return `<span class="tag ${cls}">${status}</span>`;
}

function issueTaskActions(id, status, returnKey = "issue-tasks") {
  const detailLink = `<a class="link" href="../../pages/backend/issue-task-detail-${id}.html?return=${returnKey}">查看明细</a>`;
  if (status === "部分失败") {
    return `<span class="link" data-toast="已发起重试">重试失败明细</span>${detailLink}`;
  }
  if (status === "失败") {
    return `<span class="link" data-toast="已发起重试">重试</span>${detailLink}`;
  }
  return detailLink;
}

function issueTaskRows(rows, options = {}) {
  return rows.map(([id, name, type, trigger, businessEventId, sourceSystem, sceneCode, batchId, expected, success, failed, status, time, reason]) => {
    const reasonCell = options.withReason ? `<td>${reason}</td>` : "";
    const businessEventCell = options.hideBusinessEvent ? "" : `<td>${businessEventId}</td>`;
    return `<tr data-issue-task-row data-task-trigger="${trigger}" data-task-status="${status}" data-task-batch="${batchId}"><td>${id}</td><td>${name}</td><td>${trigger}</td>${businessEventCell}<td>${batchId}</td><td>${expected}</td><td>${success}</td><td>${failed}</td><td>${issueTaskStatusTag(status)}</td><td>${time}</td>${reasonCell}<td>${issueTaskActions(id, status, options.returnKey)}</td></tr>`;
  }).join("");
}

function issueTaskCouponValidityRule(batchId) {
  return {
    "CB20260709015": "领取后 7 天",
    "CB20260708021": "领取后 7 天",
  }[batchId] || "领取后 7 天";
}

function issuedCouponActualValidity(issuedAt) {
  const [date] = issuedAt.split(" ");
  const [year, month, day] = date.split("-").map(Number);
  const expiresAt = new Date(Date.UTC(year, month - 1, day));
  expiresAt.setUTCDate(expiresAt.getUTCDate() + 7);
  const endDate = `${expiresAt.getUTCFullYear()}-${String(expiresAt.getUTCMonth() + 1).padStart(2, "0")}-${String(expiresAt.getUTCDate()).padStart(2, "0")}`;
  return `${issuedAt} 至 ${endDate} 23:59`;
}

function issueTaskDetailRows(sample) {
  const [id, name, type, trigger, businessEventId, sourceSystem, sceneCode, batchId, expected, success, failed, status, time, reason] = sample;
  const makeRow = (index, detailStatus, failureReason = "-", retryCount = 0, lastRetryAt = "-") => {
    const succeeded = detailStatus === "成功";
    const processing = detailStatus === "待执行" || detailStatus === "执行中";
    const userId = `u_${id.slice(-4)}${String(index).padStart(2, "0")}`;
    return `<tr data-issue-detail-row data-detail-status="${detailStatus}" data-detail-retry="${retryCount > 0 ? "是" : "否"}"><td>D${id.slice(1)}${String(index).padStart(3, "0")}</td><td>${userId}</td><td>${succeeded ? "1380000" + String(index).padStart(4, "0") : "-"}</td><td>${succeeded ? "UC" + id.slice(1) + String(index).padStart(3, "0") : "-"}</td>${trigger === "外部接口调用" ? `<td>${businessEventId}</td>` : ""}<td>${issueTaskStatusTag(detailStatus)}</td><td>${failureReason}</td><td>${succeeded ? time : "-"}</td><td>${succeeded ? issuedCouponActualValidity(time) : "-"}</td><td>${retryCount}</td><td>${lastRetryAt}</td></tr>`;
  };
  const rows = [];
  for (let index = 1; index <= Number(expected); index += 1) {
    if (status === "待执行" || status === "执行中") rows.push(makeRow(index, status));
    else if (index <= Number(success)) rows.push(makeRow(index, "成功"));
    else {
      const hasRetried = status === "部分失败" && index === Number(success) + 1;
      rows.push(makeRow(index, "失败", reason, hasRetried ? 1 : 0, hasRetried ? "2026-07-09 10:28" : "-"));
    }
  }
  return rows.join("");
}

function issueTaskDetailPage(sample) {
  const [id, name, type, trigger, businessEventId, sourceSystem, sceneCode, batchId, expected, success, failed, status, time, reason] = sample;
  const businessEventInfo = trigger === "外部接口调用" ? `<div class="desc-row"><span>业务调用事件 ID</span><b>${businessEventId}</b></div><div class="desc-row"><span>外部发券场景</span><b>${sourceSystem} / ${sceneCode}</b></div>` : "";
  const businessEventColumn = trigger === "外部接口调用" ? "<th>业务调用事件 ID</th>" : "";
  const couponName = batchId === "CB20260709015" ? "平台定向补贴券" : "平台通用自动发券";
  return layout(`pages/backend/issue-task-detail-${id}.html`, "发放任务明细", "发放任务", `${pageHead("发放任务明细", "展示当前任务下全部发放明细，支持按处理结果和用户信息筛选检索。", `<a class="btn" href="../../pages/backend/issue-tasks.html" data-return-link>返回</a>`)}<section class="panel"><div class="panel-head">任务信息</div><div class="panel-body desc-list"><div class="desc-row"><span>任务 ID</span><b>${id}</b></div><div class="desc-row"><span>任务名称</span><b>${name}</b></div><div class="desc-row"><span>触发方式</span><b>${trigger}</b></div>${businessEventInfo}<div class="desc-row"><span>目标券批次</span><b>${batchId} ${couponName}</b></div><div class="desc-row"><span>券有效期规则</span><b>${issueTaskCouponValidityRule(batchId)}</b></div><div class="desc-row"><span>任务状态</span><b>${issueTaskStatusTag(status)}</b></div></div></section><section class="panel" style="margin-top:14px;" data-issue-detail-filter><div class="panel-head">发放明细</div><div class="panel-body"><div class="filter-bar" style="grid-template-columns:1.35fr .8fr .8fr auto;"><input data-issue-detail-keyword placeholder="用户 ID / 手机号 / 用户券 ID${trigger === "外部接口调用" ? " / 业务调用事件 ID" : ""}"><select data-issue-detail-status><option value="">全部处理结果</option><option>待执行</option><option>执行中</option><option>成功</option><option>失败</option></select><select data-issue-detail-retry><option value="">全部重试状态</option><option value="否">未重试</option><option value="是">已重试</option></select><button class="btn primary" type="button" data-issue-detail-filter-action>查询</button></div><table class="data-table"><tr><th>发放明细 ID</th><th>用户 ID</th><th>手机号</th><th>用户券 ID</th>${businessEventColumn}<th>明细状态</th><th>失败原因</th><th>发放时间</th><th>用户券实际有效期</th><th>重试次数</th><th>最近重试时间</th></tr>${issueTaskDetailRows(sample)}</table></div></section>`);
}

const userCouponRecordSamples = [
  { slug: "available", id: "UC20260708001", taskId: "T20260708001", userId: "u_123456", phone: "13800000000", batchId: "CB20260708021", couponName: "平台通用自动发券", method: "外部自动发券", status: "待使用", receivedAt: "2026-07-08 15:20", validity: "2026-07-08 15:20 至 2026-07-15 23:59", reason: "可正常使用", orderInfo: "-" },
  { slug: "locked", id: "UC202607130122", taskId: "T20260708001", userId: "u_660122", phone: "13600000122", batchId: "CB20260708021", couponName: "平台通用自动发券", method: "外部自动发券", status: "锁定中", receivedAt: "2026-07-13 13:30", validity: "2026-07-13 13:30 至 2026-07-13 14:10", reason: "订单 OD202607130122 锁定中", lockedAt: "2026-07-13 14:06", lockExpiresAt: "2026-07-13 14:36", orderInfo: "OD202607130122" },
  { slug: "used", id: "UC202607130091", taskId: "T20260709001", userId: "u_660091", phone: "13600000091", batchId: "CB20260709016", couponName: "短剧全集通钻抵扣券", method: "运营定向发券", status: "已使用", receivedAt: "2026-07-09 10:20", validity: "2026-07-09 10:20 至 2026-07-16 23:59", reason: "订单 OD202607130091 已核销，2026-07-13 14:12", orderInfo: "OD202607130091" },
  { slug: "used-diamond", id: "UC202607130072", taskId: "T20260709002", userId: "u_660072", phone: "13600000072", batchId: "CB20260709017", couponName: "通钻购买立减券", method: "运营定向发券", status: "已使用", receivedAt: "2026-07-09 11:05", validity: "2026-07-09 11:05 至 2026-07-16 23:59", reason: "订单 OD202607130072 已核销，2026-07-13 11:28", orderInfo: "OD202607130072" },
  { slug: "used-compute", id: "UC202607130066", taskId: "T20260709002", userId: "u_660066", phone: "13600000066", batchId: "CB20260709018", couponName: "算力购买立减券", method: "运营定向发券", status: "已使用", receivedAt: "2026-07-09 11:05", validity: "2026-07-09 11:05 至 2026-07-16 23:59", reason: "订单 OD202607130066 已核销，2026-07-13 11:16", orderInfo: "OD202607130066" },
  { slug: "used-movie", id: "UC202607130062", taskId: "T20260709001", userId: "u_660062", phone: "13600000062", batchId: "CB20260709015", couponName: "电影票立减券", method: "运营定向发券", status: "已使用", receivedAt: "2026-07-09 10:20", validity: "2026-07-09 10:20 至 2026-07-16 23:59", reason: "订单 OD202607130062 已核销，2026-07-13 10:42", orderInfo: "OD202607130062" },
  { slug: "used-drama-episode", id: "UC202607130058", taskId: "T20260709001", userId: "u_660058", phone: "13600000058", batchId: "CB20260709016", couponName: "短剧单集通钻抵扣券", method: "运营定向发券", status: "已使用", receivedAt: "2026-07-09 10:20", validity: "2026-07-09 10:20 至 2026-07-16 23:59", reason: "订单 OD202607130058 已核销，2026-07-13 10:18", orderInfo: "OD202607130058" },
  { slug: "expired", id: "UC20260701001", taskId: "-", userId: "u_789001", phone: "13900000000", batchId: "CB20260701011", couponName: "平台通用满减券", method: "用户主动领取", status: "已过期", receivedAt: "2026-07-01 10:00", validity: "2026-07-01 10:00 至 2026-07-08 23:59", reason: "自然过期", orderInfo: "-" },
  { slug: "voided", id: "UC20260618015", taskId: "-", userId: "u_789002", phone: "13900000001", batchId: "CB20260618015", couponName: "平台通用满减券", method: "用户主动领取", status: "已作废", receivedAt: "2026-06-18 10:00", validity: "2026-06-18 10:00 至 2026-07-15 23:59", reason: "后台作废：活动提前结束", orderInfo: "-" },
];

function userCouponStatusTag(status) {
  const cls = { "待使用": "green", "锁定中": "blue", "已使用": "green", "已过期": "gray", "已作废": "red" }[status] || "gray";
  return `<span class="tag ${cls}">${status}</span>`;
}

function userCouponStatusReason(coupon) {
  return ["已过期", "已作废"].includes(coupon.status) ? coupon.reason : "-";
}

function userCouponListRows() {
  return userCouponRecordSamples.map((coupon) => {
    const detail = `<a class="link" href="../../pages/backend/user-coupon-detail-${coupon.slug}.html?return=user-records">详情</a>`;
    const action = coupon.status === "待使用" ? `${detail}<span class="link" data-user-coupon-action data-open-modal="#voidUserCoupon">作废</span>` : detail;
    return `<tr data-user-coupon-row><td><a class="link" href="../../pages/backend/user-coupon-detail-${coupon.slug}.html?return=user-records">${coupon.id}</a></td><td>${coupon.userId}</td><td>${coupon.phone}</td><td>${coupon.couponName}</td><td data-user-coupon-status>${userCouponStatusTag(coupon.status)}</td><td>${userCouponStatusReason(coupon)}</td><td>${coupon.receivedAt}</td><td>${coupon.validity}</td><td>${action}</td></tr>`;
  }).join("");
}

function redeemRecordRows() {
  const redeemedCoupons = userCouponRecordSamples.filter((coupon) => coupon.status === "已使用");
  return redeemedCoupons.map((coupon) => {
    const order = userCouponOrderInfo(coupon);
    const rule = userCouponRuleInfo(coupon);
    return `<tr><td>${order.orderId}</td><td><a class="link" href="../../pages/backend/user-coupon-detail-${coupon.slug}.html?return=redeem-records">${coupon.id}</a></td><td>${coupon.couponName}</td><td>${rule.benefitType}</td><td>${order.businessLine} / ${order.scene}</td><td>${order.couponDiscount.replace("-", "")}</td><td>${order.marketingCost.replace("（已确认）", "")}</td><td>${statusMapRedeemedAt(coupon.slug)}</td></tr>`;
  }).join("");
}

function statusMapRedeemedAt(slug) {
  return {
    used: "2026-07-13 14:12",
    "used-diamond": "2026-07-13 11:28",
    "used-compute": "2026-07-13 11:16",
    "used-movie": "2026-07-13 10:42",
    "used-drama-episode": "2026-07-13 10:18",
  }[slug];
}

function userCouponOrderInfo(coupon) {
  const orderMap = {
    locked: {
      orderId: "OD202607130122",
      businessLine: "通钻",
      scene: "通钻购买",
      orderStatus: "待支付",
      paymentStatus: "未支付",
      products: [{ productName: "通钻商品包", productId: "DIAMOND_PACK_1000", unitPrice: "26.99 元", quantity: "2", productAmount: "53.98 元", couponDiscount: "-10.00 元", userPayable: "43.98 元" }],
      productAmount: "53.98 元",
      couponDiscount: "-10.00 元",
      userPayable: "43.98 元",
      businessReceivable: "43.98 元（待支付）",
      marketingCost: "10.00 元（预算预占）",
      settlementStatus: "待支付",
    },
    used: {
      orderId: "OD202607130091",
      businessLine: "短剧",
      scene: "短剧全集解锁",
      orderStatus: "已完成",
      paymentStatus: "已扣除通钻",
      products: [{ productName: "《夏夜回声》全集", productId: "DRAMA202607130091", unitPrice: "200 通钻", quantity: "1", productAmount: "200 通钻", couponDiscount: "-30 通钻", userPayable: "170 通钻" }],
      productAmount: "200 通钻",
      couponDiscount: "-30 通钻",
      userPayable: "170 通钻",
      businessReceivable: "170 通钻（已扣除）",
      marketingCost: "3.00 元（已确认）",
      settlementStatus: "已核销",
    },
    "used-diamond": {
      orderId: "OD202607130072",
      businessLine: "通钻",
      scene: "通钻购买",
      orderStatus: "已完成",
      paymentStatus: "已支付",
      products: [{ productName: "通钻 1,000 个商品包", productId: "DIAMOND_PACK_1000", unitPrice: "100.00 元", quantity: "1", productAmount: "100.00 元", couponDiscount: "-10.00 元", userPayable: "90.00 元" }],
      productAmount: "100.00 元",
      couponDiscount: "-10.00 元",
      userPayable: "90.00 元",
      businessReceivable: "90.00 元（已支付）",
      marketingCost: "10.00 元（已确认）",
      settlementStatus: "已核销",
    },
    "used-compute": {
      orderId: "OD202607130066",
      businessLine: "算力",
      scene: "算力购买",
      orderStatus: "已完成",
      paymentStatus: "已支付",
      products: [{ productName: "算力 1,500 积分包", productId: "COMPUTE_PACK_1500", unitPrice: "150.00 元", quantity: "1", productAmount: "150.00 元", couponDiscount: "-15.00 元", userPayable: "135.00 元" }],
      productAmount: "150.00 元",
      couponDiscount: "-15.00 元",
      userPayable: "135.00 元",
      businessReceivable: "135.00 元（已支付）",
      marketingCost: "15.00 元（已确认）",
      settlementStatus: "已核销",
    },
    "used-movie": {
      orderId: "OD202607130062",
      businessLine: "电影票",
      scene: "电影票购买",
      orderStatus: "已完成",
      paymentStatus: "已支付",
      products: [{ productName: "《星际远航》2D 成人票", productId: "MOV202607130062", unitPrice: "59.00 元", quantity: "1", productAmount: "59.00 元", couponDiscount: "-20.00 元", userPayable: "39.00 元" }],
      productAmount: "59.00 元",
      couponDiscount: "-20.00 元",
      userPayable: "39.00 元",
      businessReceivable: "39.00 元（已支付）",
      marketingCost: "20.00 元（已确认）",
      settlementStatus: "已核销",
    },
    "used-drama-episode": {
      orderId: "OD202607130058",
      businessLine: "短剧",
      scene: "短剧单集解锁",
      orderStatus: "已完成",
      paymentStatus: "已扣除通钻",
      products: [{ productName: "《夏夜回声》第 8 集", productId: "EPISODE202607130058", unitPrice: "100 通钻", quantity: "1", productAmount: "100 通钻", couponDiscount: "-20 通钻", userPayable: "80 通钻" }],
      productAmount: "100 通钻",
      couponDiscount: "-20 通钻",
      userPayable: "80 通钻",
      businessReceivable: "80 通钻（已扣除）",
      marketingCost: "2.00 元（已确认）",
      settlementStatus: "已核销",
    },
  };
  return orderMap[coupon.slug] || null;
}

function userCouponRuleInfo(coupon) {
  const ruleMap = {
    available: { benefitType: "现金优惠券", couponType: "固定抵扣券", rule: "满 50.00 元减 10.00 元", scope: "通钻购买、算力购买、电影票购买" },
    locked: { benefitType: "现金优惠券", couponType: "固定抵扣券", rule: "满 50.00 元减 10.00 元", scope: "通钻购买、算力购买、电影票购买" },
    used: { benefitType: "通钻抵扣券", couponType: "固定抵扣券", rule: "满 100 通钻减 30 通钻", scope: "短剧 / 全集解锁" },
    "used-diamond": { benefitType: "现金优惠券", couponType: "固定抵扣券", rule: "满 50.00 元减 10.00 元", scope: "通钻购买" },
    "used-compute": { benefitType: "现金优惠券", couponType: "固定抵扣券", rule: "满 100.00 元减 15.00 元", scope: "算力购买" },
    "used-movie": { benefitType: "现金优惠券", couponType: "固定抵扣券", rule: "满 50.00 元减 20.00 元", scope: "电影票购买" },
    "used-drama-episode": { benefitType: "通钻抵扣券", couponType: "固定抵扣券", rule: "满 100 通钻减 20 通钻", scope: "短剧 / 单集解锁" },
    expired: { benefitType: "现金优惠券", couponType: "固定抵扣券", rule: "满 99.00 元减 20.00 元", scope: "通钻购买、算力购买、电影票购买" },
    voided: { benefitType: "现金优惠券", couponType: "固定抵扣券", rule: "满 99.00 元减 20.00 元", scope: "通钻购买、算力购买、电影票购买" },
  };
  return ruleMap[coupon.slug];
}

function detailMetaItem(label, value, full = false) {
  return `<div class="detail-meta-item${full ? " full" : ""}"><span>${label}</span><b>${value}</b></div>`;
}

function userCouponDetailPage(coupon) {
  const order = userCouponOrderInfo(coupon);
  const rule = userCouponRuleInfo(coupon);
  const statusMap = {
    available: { updatedAt: coupon.receivedAt },
    locked: { updatedAt: "2026-07-13 14:06" },
    used: { updatedAt: "2026-07-13 14:12" },
    "used-diamond": { updatedAt: "2026-07-13 11:28" },
    "used-compute": { updatedAt: "2026-07-13 11:16" },
    "used-movie": { updatedAt: "2026-07-13 10:42" },
    "used-drama-episode": { updatedAt: "2026-07-13 10:18" },
    expired: { updatedAt: "2026-07-01 00:00" },
    voided: { updatedAt: "2026-07-12 11:30" },
  }[coupon.slug];
  const productRows = order ? order.products.map((product) => `<tr><td>${product.productName}</td><td>${product.productId}</td><td>${product.unitPrice}</td><td>${product.quantity}</td><td>${product.productAmount}</td><td>${product.couponDiscount}</td><td>${product.userPayable}</td></tr>`).join("") : "";
  const orderSection = order ? `<section class="panel"><div class="panel-head">订单信息</div><div class="panel-body"><div class="detail-meta-grid">${detailMetaItem("订单 ID", order.orderId)}${detailMetaItem("业务线 / 使用场景", `${order.businessLine} / ${order.scene}`)}${detailMetaItem("订单状态", order.orderStatus)}${detailMetaItem("支付状态", order.paymentStatus)}</div><div class="table-scroll" style="margin-top:22px;" data-scroll-hint="左右滑动查看完整商品明细"><table class="data-table order-product-table" style="--table-min-width:900px;"><tr><th>商品信息</th><th>商品编号</th><th>商品单价</th><th>数量</th><th>商品金额</th><th>券分摊优惠</th><th>商品实付</th></tr>${productRows}</table></div><div class="order-summary"><div class="order-summary-row"><span>商品金额合计</span><b>${order.productAmount}</b></div><div class="order-summary-row"><span>平台券优惠合计</span><b>${order.couponDiscount}</b></div><div class="order-summary-row"><span>订单实付合计</span><b>${order.userPayable}</b></div><div class="order-summary-row"><span>业务线应收</span><b>${order.businessReceivable}</b></div><div class="order-summary-row"><span>平台营销成本</span><b>${order.marketingCost}</b></div><div class="order-summary-row"><span>分账状态</span><b>${order.settlementStatus}</b></div></div></div></section>` : "";
  const taskInfo = coupon.taskId === "-" ? "-" : coupon.taskId;
  const lockProtection = coupon.status === "锁定中" ? `${detailMetaItem("锁券时间", coupon.lockedAt)}${detailMetaItem("交易保护截止时间", coupon.lockExpiresAt)}${detailMetaItem("交易保护说明", "原有效期结束后仍在交易保护窗口内；支付成功可在保护截止时间前完成核销", true)}` : "";
  return layout(`pages/backend/user-coupon-detail-${coupon.slug}.html`, "用户券详情", "用户券记录", `${pageHead("用户券详情", "查看用户券规则、状态、实际有效期及关联订单信息。", `<a class="btn" href="../../pages/backend/user-records.html" data-return-link>返回</a>`)}<div class="stack"><section class="panel"><div class="panel-head">用户券基础与有效期信息</div><div class="panel-body"><div class="detail-meta-grid">${detailMetaItem("用户券 ID", coupon.id)}${detailMetaItem("用户 ID", coupon.userId)}${detailMetaItem("手机号", coupon.phone)}${detailMetaItem("券名称", coupon.couponName)}${detailMetaItem("券批次 ID", coupon.batchId)}${detailMetaItem("权益类型", rule.benefitType)}${detailMetaItem("券类型", rule.couponType)}${detailMetaItem("发放/领取方式", coupon.method)}${detailMetaItem("关联任务 ID", taskInfo)}${detailMetaItem("到账时间", coupon.receivedAt)}${detailMetaItem("券面规则", rule.rule, true)}${detailMetaItem("适用范围", rule.scope, true)}${detailMetaItem("用户券实际有效期", coupon.validity, true)}</div></div></section><section class="panel"><div class="panel-head">状态信息</div><div class="panel-body"><div class="detail-meta-grid">${detailMetaItem("当前状态", userCouponStatusTag(coupon.status))}${detailMetaItem("状态更新时间", statusMap.updatedAt)}${detailMetaItem("状态原因", userCouponStatusReason(coupon))}${lockProtection}</div></div></section>${orderSection}</div>`);
}

const pages = {};

pages["index.html"] = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>优惠券一期原型</title>
  <link rel="stylesheet" href="./assets/css/styles.css">
</head>
<body>
  <main class="site-home">
    <section class="home-card">
      <h1>优惠券中台一期原型</h1>
      <div class="sub">静态多页面原型站点，覆盖运营后台、App 用户侧、审批、发放、锁券核销、异常态和空态。所有页面使用相对路径，可直接作为 GitHub Pages docs 目录发布。</div>
      <div class="home-grid">
        <a class="home-link" href="./pages/backend/budget-pools.html"><b>预算池管理</b><span>预算池列表、新建、增加预算、停用启用和预算边界。</span></a>
        <a class="home-link" href="./pages/backend/coupon-batches.html"><b>券批次管理</b><span>券批次创建、提交审核、详情与发放任务。</span></a>
        <a class="home-link" href="./pages/backend/approvals.html"><b>审批管理</b><span>预算池新建、增加预算和券批次的单级审核列表与详情。</span></a>
        <a class="home-link" href="./pages/backend/external-scenes.html"><b>外部发券场景</b><span>source_system + issue_scene_code 场景配置与调用记录。</span></a>
        <a class="home-link" href="./pages/backend/issue-tasks.html"><b>发放任务</b><span>运营定向发券任务、自动发券失败、重试和单条任务明细查看。</span></a>
        <a class="home-link" href="./pages/backend/redeem-records.html"><b>核销记录</b><span>人民币支付或通钻扣款成功后的核销事实、实际抵扣和人民币预算成本。</span></a>
        <a class="home-link" href="./pages/app/coupon-center.html"><b>App 领券中心</b><span>轻营销券卡、领取中、领取失败与空态。</span></a>
        <a class="home-link" href="./pages/app/my-coupons.html"><b>App 我的优惠券</b><span>待使用、已使用、已失效展示分类与列表加载失败状态。</span></a>
        <a class="home-link" href="./README.md"><b>交付说明</b><span>页面清单、流程说明、状态说明和部署方式。</span></a>
      </div>
    </section>
  </main>
</body>
</html>`;

pages["pages/backend/budget-pools.html"] = layout("pages/backend/budget-pools.html", "预算池管理", "预算池管理", `
${pageHead("预算池管理", "预算池按预算周期进入待开始、启用或已结束；待开始可提前创建批次，启用后才参与实际发券。", `<a class="btn primary" href="../../pages/backend/budget-pool-form.html?return=budget-pools">新建预算池</a>`)}
<div class="filter-bar" style="margin-top:14px;"><input value="预算池名称 / ID"><select><option>全部状态</option><option>待审核</option><option>审核驳回</option><option>待开始</option><option>启用</option><option>停用</option><option>已结束</option><option>已关闭</option></select><input value="负责人">${queryButton()}</div>
<section class="panel">
  <div class="panel-head">预算池列表</div>
  <table class="data-table">
    <tr><th>预算池 ID</th><th>预算池名称</th><th>成本归属</th><th>预算周期</th><th>总额</th><th>已分配计划额度</th><th>可分配计划额度</th><th>预算已核销成本</th><th>未结清预算占用</th><th>预算已承诺总额</th><th>实际剩余可用预算</th><th>状态</th><th>操作</th></tr>
    <tr><td>BP20260707001</td><td>平台通用营销预算池</td><td>平台</td><td>2026-07-10 至 2026-08-31</td><td>500,000.00</td><td>0.00</td><td>0.00</td><td>0.00</td><td>0.00</td><td>0.00</td><td>500,000.00</td><td><span class="tag amber">待审核</span></td><td><a class="link" href="../../pages/backend/budget-pool-detail-pending.html?return=budget-pools">详情</a></td></tr>
    <tr><td>BP20260709002</td><td>8 月新人预算池</td><td>通钻购买</td><td>2026-08-01 至 2026-08-31</td><td>300,000.00</td><td>120,000.00</td><td>180,000.00</td><td>0.00</td><td>0.00</td><td>0.00</td><td>300,000.00</td><td><span class="tag amber">待开始</span></td><td><a class="link" href="../../pages/backend/budget-pool-detail-upcoming.html?return=budget-pools">详情</a><a class="link" href="../../pages/backend/budget-pool-increase-form.html?pool=BP20260709002&return=budget-pools">增加预算</a><span class="link" data-open-modal="#disablePool">停用</span></td></tr>
    <tr><td>BP20260701009</td><td>平台通用预算池</td><td>平台</td><td>2026-07-10 至 2026-08-31</td><td>800,000.00</td><td>720,000.00</td><td>80,000.00</td><td>256,500.00</td><td>48,000.00</td><td>304,500.00</td><td>495,500.00</td><td><span class="tag green">启用</span></td><td><a class="link" href="../../pages/backend/budget-pool-detail.html?return=budget-pools">详情</a><a class="link" href="../../pages/backend/budget-pool-increase-form.html?pool=BP20260701009&return=budget-pools">增加预算</a><span class="link" data-open-modal="#disablePool">停用</span></td></tr>
    <tr><td>BP20260628003</td><td>平台通用预算池</td><td>平台</td><td>2026-06-01 至 2026-08-15</td><td>120,000.00</td><td>50,000.00</td><td>70,000.00</td><td>12,000.00</td><td>20,000.00</td><td>32,000.00</td><td>88,000.00</td><td><span class="tag blue">停用</span></td><td><a class="link" href="../../pages/backend/budget-pool-detail-disabled.html?return=budget-pools">详情</a><span class="link" data-open-modal="#enablePool">启用</span></td></tr>
    <tr><td>BP20260501001</td><td>5 月活动预算池</td><td>平台</td><td>2026-05-01 至 2026-05-31</td><td>200,000.00</td><td>0.00</td><td>0.00</td><td>72,000.00</td><td>0.00</td><td>72,000.00</td><td>128,000.00</td><td><span class="tag gray">已结束</span></td><td><a class="link" href="../../pages/backend/budget-pool-detail-ended.html?return=budget-pools">详情</a></td></tr>
    <tr><td>BP20260401001</td><td>4 月拉新预算池</td><td>平台</td><td>2026-04-01 至 2026-04-30</td><td>100,000.00</td><td>0.00</td><td>0.00</td><td>64,000.00</td><td>0.00</td><td>64,000.00</td><td>36,000.00</td><td><span class="tag gray">已关闭</span></td><td><a class="link" href="../../pages/backend/budget-pool-detail-closed.html?return=budget-pools">详情</a></td></tr>
  </table>
</section>
${modal("disablePool", "停用预算池确认", `<div class="alert">停用后，该预算池下已关联的待开始、进行中批次不可继续发券、领券或外部自动发券；已发用户券和历史记录不删除。</div><textarea placeholder="请输入停用原因，必填"></textarea>`, `<button class="btn" data-close-modal>取消</button><button class="btn primary" data-toast="预算池已停用并记录审计">确认停用</button>`)}
${modal("enablePool", "启用预算池确认", `<div class="alert">启用前系统需校验预算池未关闭、预算周期未结束、基础信息完整且当前账号具备权限；通过后按预算周期恢复为待开始或启用。</div>`, `<button class="btn" data-close-modal>取消</button><button class="btn primary" data-toast="预算池已按预算周期恢复状态并记录审计">确认启用</button>`)}
`);

pages["pages/backend/budget-pool-form.html"] = layout("pages/backend/budget-pool-form.html", "新建预算池", "预算池管理", `
${pageHead("新建预算池", "录入预算额度、成本归属、预算周期与审批凭证；审核通过后按预算周期进入待开始或启用。", `<a class="btn" href="../../pages/backend/budget-pools.html" data-return-link>取消</a><button class="btn primary" data-toast="已提交预算池审核" data-return-redirect="../../pages/backend/budget-pools.html">提交审核</button>`)}
<section class="panel" data-budget-pool-cost-form><div class="panel-head"><span>预算池信息</span></div><div class="panel-body form-grid">
    <div class="field"><label class="required">预算池名称</label><input value="平台通用营销预算池"></div>
    <div class="field"><label class="required">预算池总额</label><input value="500,000.00 元"></div>
    <div class="field"><label class="required">成本归属类型</label><select data-cost-owner-type><option>平台</option><option>业务线</option></select><div class="hint">券批次继承预算池成本归属，不可单独修改。</div></div>
    <div class="field" data-cost-owner-business-line-field hidden><label class="required">成本归属业务线</label><select data-cost-owner-business-line><option value="">请选择业务线</option><option>通钻购买</option><option>算力购买</option><option>电影票</option><option>短剧</option></select><div class="hint">跨业务线组合券只能关联平台成本归属的预算池。</div></div>
    <div class="field"><label>负责人</label><select><option>陈运营</option></select></div>
    <div class="field"><label class="required">预算周期</label><input value="2026-07-10 至 2026-08-31"></div>
    <div class="field"><label class="required">审批单号</label><input value="APR-20260707-1842"><div class="hint">系统内仅展示审批单号，不展示外部系统名称。</div></div>
    <div class="field"><label class="required">审批图片</label><div class="upload"><b>approval-proof.png</b><div class="hint">已上传，支持点击预览</div></div></div>
    <div class="field full"><label>备注</label><textarea>用于平台通用领券中心活动。</textarea></div>
  </div></section>
`);

pages["pages/backend/budget-pool-increase-form.html"] = layout("pages/backend/budget-pool-increase-form.html", "增加预算", "预算池管理", `
${pageHead("增加预算", "从指定预算池进入，申请额度审批通过后才更新该预算池总额。", `<a class="btn" href="../../pages/backend/budget-pools.html" data-return-link>取消</a><button class="btn primary" data-toast="已提交增加预算审批" data-return-redirect="../../pages/backend/approvals.html">提交审核</button>`)}
<div class="grid-2" data-budget-increase-form>
  <section class="panel"><div class="panel-head">增加预算申请</div><div class="panel-body form-grid">
    <div class="field"><label>预算池 ID</label><input value="BP20260701009" readonly data-budget-pool-id></div>
    <div class="field"><label>目标预算池</label><input value="平台通用预算池" readonly data-budget-pool-name></div>
    <div class="field"><label>成本归属</label><input value="平台" readonly data-budget-cost-owner></div>
    <div class="field"><label>负责人</label><input value="陈运营" readonly data-budget-owner></div>
    <div class="field"><label>预算周期</label><input value="2026-07-10 至 2026-08-31" readonly data-budget-period></div>
    <div class="field"><label>当前预算池总额</label><input value="800,000.00 元" readonly data-budget-total></div>
    <div class="field"><label class="required">增加额度</label><input value="200,000.00 元"></div>
    <div class="field"><label>审批通过后预算池总额</label><input value="1,000,000.00 元" readonly data-budget-after-total></div>
    <div class="field"><label class="required">审批单号</label><input value="APR-20260708-1024"></div>
    <div class="field"><label class="required">审批图片</label><div class="upload"><b>increase-proof.png</b><div class="hint">已上传，支持点击预览</div></div></div>
    <div class="field full"><label>备注</label><textarea>用于补充 7 月平台通用券活动额度。</textarea></div>
  </div></section>
  <div class="stack">
    <section class="panel"><div class="panel-head">预算快照</div><div class="panel-body desc-list">
      <div class="desc-row"><span>已分配计划额度</span><b data-budget-allocated>720,000.00 元</b></div>
      <div class="desc-row"><span>可分配计划额度</span><b data-budget-available>80,000.00 元</b></div>
      <div class="desc-row"><span>预算已核销成本</span><b data-budget-redeemed>256,500.00 元</b></div>
      <div class="desc-row"><span>未结清预算占用</span><b data-budget-unsettled>48,000.00 元</b></div>
      <div class="desc-row"><span>预算已承诺总额</span><b data-budget-committed>304,500.00 元</b></div>
      <div class="desc-row"><span>实际剩余可用预算</span><b data-budget-remaining>495,500.00 元</b></div>
    </div></section>
  </div>
</div>
`);

pages["pages/backend/budget-pool-detail-pending.html"] = layout("pages/backend/budget-pool-detail-pending.html", "预算池详情", "预算池管理", `
${pageHead("预算池详情", "当前预算池待审核，审核通过前不可创建券批次或参与发券。", `<a class="btn" href="../../pages/backend/budget-pools.html" data-return-link>返回</a>`)}
<div class="grid-2 detail-single">
  <section class="panel"><div class="panel-head"><span>基础信息</span><span class="tag amber">待审核</span></div><div class="panel-body desc-list">
    <div class="desc-row"><span>预算池 ID</span><b>BP20260707001</b></div>
    <div class="desc-row"><span>预算池名称</span><b>平台通用营销预算池</b></div>
    <div class="desc-row"><span>成本归属</span><b>平台</b></div>
    <div class="desc-row"><span>预算周期</span><b>2026-07-10 至 2026-08-31</b></div>
    <div class="desc-row"><span>预算池总额</span><b>500,000.00 元</b></div>
    <div class="desc-row"><span>已分配计划额度</span><b>0.00 元</b></div>
    <div class="desc-row"><span>可分配计划额度</span><b>0.00 元</b></div>
    <div class="desc-row"><span>预算已核销成本</span><b>0.00 元</b></div>
    <div class="desc-row"><span>未结清预算占用</span><b>0.00 元</b></div>
    <div class="desc-row"><span>预算已承诺总额</span><b>0.00 元</b></div>
    <div class="desc-row"><span>实际剩余可用预算</span><b>500,000.00 元</b></div>
    <div class="desc-row"><span>审批单号</span><b>APR-20260707-1842</b></div>
    <div class="desc-row"><span>审批图片</span><span class="link" data-open-modal="#pendingPoolImage">查看审批图片</span></div>
  </div></section>
</div>
${modal("pendingPoolImage", "审批图片", `<div class="upload"><b>approval-proof.png</b><div class="hint">审批图片预览区域</div></div>`, "")}
`);

pages["pages/backend/budget-pool-detail.html"] = layout("pages/backend/budget-pool-detail.html", "预算池详情", "预算池管理", `
${pageHead("预算池详情", "查看预算信息、审批凭证、预算调整记录和已关联券批次。", `<a class="btn primary" href="../../pages/backend/budget-pool-increase-form.html?pool=BP20260701009&return=budget-pools">增加预算</a><button class="btn soft-red" data-open-modal="#disablePoolDetail">停用</button><a class="btn" href="../../pages/backend/budget-pools.html" data-return-link>返回</a>`)}
<div class="grid-2 detail-single">
  <section class="panel"><div class="panel-head"><span>基础信息</span><span class="tag green">启用</span></div><div class="panel-body desc-list">
    <div class="desc-row"><span>预算池 ID</span><b>BP20260701009</b></div>
    <div class="desc-row"><span>预算池名称</span><b>平台通用预算池</b></div>
    <div class="desc-row"><span>成本归属</span><b>平台</b></div>
    <div class="desc-row"><span>预算周期</span><b>2026-07-10 至 2026-08-31</b></div>
    <div class="desc-row"><span>预算池总额</span><b>800,000.00 元</b></div>
    <div class="desc-row"><span>已分配计划额度</span><b>720,000.00 元</b></div>
    <div class="desc-row"><span>可分配计划额度</span><b>80,000.00 元</b></div>
    <div class="desc-row"><span>预算已核销成本</span><b>256,500.00 元</b></div>
    <div class="desc-row"><span>未结清预算占用</span><b>48,000.00 元</b></div>
    <div class="desc-row"><span>预算已承诺总额</span><b>304,500.00 元</b></div>
    <div class="desc-row"><span>实际剩余可用预算</span><b>495,500.00 元</b></div>
    <div class="desc-row"><span>审批单号</span><b>APR-20260701-2014</b></div>
    <div class="desc-row"><span>审批图片</span><span class="link" data-open-modal="#imageModal">查看审批图片</span></div>
  </div></section>
</div>
<section class="panel" style="margin-top:14px;"><div class="panel-head">已关联券批次</div><table class="data-table"><tr><th>券批次 ID</th><th>券名称</th><th>状态</th><th>批次预算上限</th><th>预算已承诺总额</th><th>券批次活动时间</th><th>券有效期</th></tr><tr><td>CB20260701011</td><td>平台通用满减券</td><td><span class="tag green">进行中</span></td><td>300,000.00</td><td>64,000.00</td><td>2026-07-10 至 2026-08-31</td><td>领取后 7 天有效</td></tr><tr><td>CB20260618015</td><td>平台通用满减券</td><td><span class="tag blue">停用</span></td><td>50,000.00</td><td>8,600.00</td><td>2026-06-18 至 2026-07-15</td><td>领取后 5 天有效</td></tr></table></section>
<section class="panel" style="margin-top:14px;"><div class="panel-head">预算调整记录</div><table class="data-table"><tr><th>调整类型</th><th>申请金额</th><th>审批单号</th><th>申请人</th><th>审核人</th><th>审批结果</th><th>总额变化</th></tr><tr><td>增加预算</td><td>200,000.00</td><td>APR-20260708-1024</td><td>陈运营</td><td>林审核</td><td><span class="tag green">通过</span></td><td>600,000.00 → 800,000.00</td></tr></table></section>
${modal("imageModal", "审批图片", `<div class="upload"><b>platform-budget-proof.png</b><div class="hint">审批图片预览区域</div></div>`, "")}
${modal("rejectReason", "驳回原因状态示例", `<div class="alert">审批图片加载失败或凭证信息不完整时，审核人可驳回并要求重新提交。</div>`, "")}
${modal("disablePoolDetail", "停用预算池确认", `<div class="alert">停用后，该预算池下已关联的待开始、进行中批次不可继续发券、领券或外部自动发券。</div><textarea placeholder="请输入停用原因，必填"></textarea>`, `<button class="btn" data-close-modal>取消</button><button class="btn primary" data-toast="预算池已停用并记录审计" data-return-redirect="../../pages/backend/budget-pools.html">确认停用</button>`)}
`);

pages["pages/backend/budget-pool-detail-upcoming.html"] = layout("pages/backend/budget-pool-detail-upcoming.html", "预算池详情", "预算池管理", `
${pageHead("预算池详情", "当前预算池已审核通过但预算周期未开始，可提前创建批次和增加预算，暂不参与实际发券。", `<a class="btn primary" href="../../pages/backend/budget-pool-increase-form.html?pool=BP20260709002&return=budget-pools">增加预算</a><button class="btn soft-red" data-open-modal="#disableUpcomingPool">停用</button><a class="btn" href="../../pages/backend/budget-pools.html" data-return-link>返回</a>`)}
<div class="grid-2 detail-single">
  <section class="panel"><div class="panel-head"><span>基础信息</span><span class="tag amber">待开始</span></div><div class="panel-body desc-list">
    <div class="desc-row"><span>预算池 ID</span><b>BP20260709002</b></div>
    <div class="desc-row"><span>预算池名称</span><b>8 月新人预算池</b></div>
    <div class="desc-row"><span>成本归属</span><b>业务线：通钻购买</b></div>
    <div class="desc-row"><span>预算周期</span><b>2026-08-01 至 2026-08-31</b></div>
    <div class="desc-row"><span>预算池总额</span><b>300,000.00 元</b></div>
    <div class="desc-row"><span>已分配计划额度</span><b>120,000.00 元</b></div>
    <div class="desc-row"><span>可分配计划额度</span><b>180,000.00 元</b></div>
    <div class="desc-row"><span>预算已核销成本</span><b>0.00 元</b></div>
    <div class="desc-row"><span>未结清预算占用</span><b>0.00 元</b></div>
    <div class="desc-row"><span>预算已承诺总额</span><b>0.00 元</b></div>
    <div class="desc-row"><span>实际剩余可用预算</span><b>300,000.00 元</b></div>
    <div class="desc-row"><span>审批单号</span><b>APR-20260709-0820</b></div>
    <div class="desc-row"><span>审批图片</span><span class="link" data-open-modal="#upcomingPoolImage">查看审批图片</span></div>
  </div></section>
</div>
<section class="panel" style="margin-top:14px;"><div class="panel-head">已关联券批次</div><table class="data-table"><tr><th>券批次 ID</th><th>券名称</th><th>状态</th><th>批次预算上限</th><th>预算已承诺总额</th><th>券批次活动时间</th><th>券有效期</th></tr><tr><td>CB20260725001</td><td>8 月新人自动发券</td><td><span class="tag amber">待开始</span></td><td>120,000.00</td><td>0.00</td><td>2026-08-01 至 2026-08-31</td><td>领取后 7 天有效</td></tr></table></section>
${modal("upcomingPoolImage", "审批图片", `<div class="upload"><b>august-budget-proof.png</b><div class="hint">审批图片预览区域</div></div>`, "")}
${modal("disableUpcomingPool", "停用预算池确认", `<div class="alert">停用后，该预算池下已关联的待开始批次不可继续进入发放流程；已配置的外部场景调用会失败并记录原因。</div><textarea placeholder="请输入停用原因，必填"></textarea>`, `<button class="btn" data-close-modal>取消</button><button class="btn primary" data-toast="预算池已停用并记录审计" data-return-redirect="../../pages/backend/budget-pools.html">确认停用</button>`)}
`);

pages["pages/backend/budget-pool-detail-disabled.html"] = layout("pages/backend/budget-pool-detail-disabled.html", "预算池详情", "预算池管理", `
${pageHead("预算池详情", "当前预算池已停用，关联批次不可继续领券、发券或外部自动发券。", `<button class="btn primary" data-open-modal="#enableDisabledPool">启用</button><a class="btn" href="../../pages/backend/budget-pools.html" data-return-link>返回</a>`)}
<div class="grid-2 detail-single">
  <section class="panel"><div class="panel-head"><span>基础信息</span><span class="tag blue">停用</span></div><div class="panel-body desc-list">
    <div class="desc-row"><span>预算池 ID</span><b>BP20260628003</b></div>
    <div class="desc-row"><span>预算池名称</span><b>平台通用预算池</b></div>
    <div class="desc-row"><span>预算周期</span><b>2026-06-01 至 2026-08-15</b></div>
    <div class="desc-row"><span>预算池总额</span><b>120,000.00 元</b></div>
    <div class="desc-row"><span>已分配计划额度</span><b>50,000.00 元</b></div>
    <div class="desc-row"><span>可分配计划额度</span><b>70,000.00 元</b></div>
    <div class="desc-row"><span>预算已核销成本</span><b>12,000.00 元</b></div>
    <div class="desc-row"><span>未结清预算占用</span><b>20,000.00 元</b></div>
    <div class="desc-row"><span>预算已承诺总额</span><b>32,000.00 元</b></div>
    <div class="desc-row"><span>实际剩余可用预算</span><b>88,000.00 元</b></div>
    <div class="desc-row"><span>审批单号</span><b>APR-20260628-1430</b></div>
  </div></section>
</div>
<section class="panel" style="margin-top:14px;"><div class="panel-head">已关联券批次</div><table class="data-table"><tr><th>券批次 ID</th><th>券名称</th><th>状态</th><th>批次预算上限</th><th>预算已承诺总额</th><th>券批次活动时间</th><th>券有效期</th></tr><tr><td>CB20260618015</td><td>平台通用满减券</td><td><span class="tag blue">停用</span></td><td>50,000.00</td><td>8,600.00</td><td>2026-06-18 至 2026-07-15</td><td>领取后 5 天有效</td></tr></table></section>
${modal("enableDisabledPool", "启用预算池确认", `<div class="alert">启用前系统需校验预算池未关闭、预算周期未结束、基础信息完整且当前账号具备权限；通过后按预算周期恢复为待开始或启用。</div>`, `<button class="btn" data-close-modal>取消</button><button class="btn primary" data-toast="预算池已按预算周期恢复状态并记录审计" data-return-redirect="../../pages/backend/budget-pools.html">确认启用</button>`)}
`);

pages["pages/backend/budget-pool-detail-ended.html"] = layout("pages/backend/budget-pool-detail-ended.html", "预算池详情", "预算池管理", `
${pageHead("预算池详情", "预算周期已结束，已核销成本保留；未结清预算占用为零后可关闭预算池。", `<button class="btn soft-red" data-open-modal="#closeEndedPool">关闭预算池</button><a class="btn" href="../../pages/backend/budget-pools.html" data-return-link>返回</a>`)}
<div class="grid-2 detail-single">
  <section class="panel"><div class="panel-head"><span>基础信息</span><span class="tag gray">已结束</span></div><div class="panel-body desc-list">
    <div class="desc-row"><span>预算池 ID</span><b>BP20260501001</b></div>
    <div class="desc-row"><span>预算池名称</span><b>5 月活动预算池</b></div>
    <div class="desc-row"><span>预算周期</span><b>2026-05-01 至 2026-05-31</b></div>
    <div class="desc-row"><span>预算池总额</span><b>200,000.00 元</b></div>
    <div class="desc-row"><span>已分配计划额度</span><b>0.00 元</b></div>
    <div class="desc-row"><span>可分配计划额度</span><b>0.00 元</b></div>
    <div class="desc-row"><span>预算已核销成本</span><b>72,000.00 元</b></div>
    <div class="desc-row"><span>未结清预算占用</span><b>0.00 元</b></div>
    <div class="desc-row"><span>预算已承诺总额</span><b>72,000.00 元</b></div>
    <div class="desc-row"><span>实际剩余可用预算</span><b>128,000.00 元</b></div>
    <div class="desc-row"><span>审批单号</span><b>APR-20260501-0900</b></div>
  </div></section>
</div>
<section class="panel" style="margin-top:14px;"><div class="panel-head">已关联券批次</div><table class="data-table"><tr><th>券批次 ID</th><th>券名称</th><th>状态</th><th>批次预算上限</th><th>预算已承诺总额</th><th>券批次活动时间</th><th>券有效期</th></tr><tr><td>CB20260501005</td><td>5 月活动满减券</td><td><span class="tag gray">已过期</span></td><td>80,000.00</td><td>0.00</td><td>2026-05-01 至 2026-05-31</td><td>2026-05-01 至 2026-05-31</td></tr></table></section>
${modal("closeEndedPool", "关闭预算池确认", `<div class="alert">该预算池已无待审核、待开始、进行中或停用批次，未结清预算占用为 0。关闭后不再允许新建批次、增加预算或通过存量申请；历史核销成本、预算流水和统计保留。</div><textarea data-budget-pool-close-reason placeholder="请输入关闭原因，必填"></textarea><div class="inline-error" data-budget-pool-close-error hidden>请填写关闭原因后再确认。</div>`, `<button class="btn" data-close-modal>取消</button><button class="btn primary" data-budget-pool-close data-toast="预算池已关闭并记录审计" data-redirect="../../pages/backend/budget-pool-detail-closed.html">确认关闭</button>`)}
`);

pages["pages/backend/budget-pool-detail-closed.html"] = layout("pages/backend/budget-pool-detail-closed.html", "预算池详情", "预算池管理", `
${pageHead("预算池详情", "预算池已完成结清关闭；历史成本、预算流水和统计仅供查询。", `<a class="btn" href="../../pages/backend/budget-pools.html" data-return-link>返回</a>`)}
<div class="grid-2 detail-single">
  <section class="panel"><div class="panel-head"><span>基础信息</span><span class="tag gray">已关闭</span></div><div class="panel-body desc-list">
    <div class="desc-row"><span>预算池 ID</span><b>BP20260401001</b></div>
    <div class="desc-row"><span>预算池名称</span><b>4 月拉新预算池</b></div>
    <div class="desc-row"><span>成本归属</span><b>平台</b></div>
    <div class="desc-row"><span>预算周期</span><b>2026-04-01 至 2026-04-30</b></div>
    <div class="desc-row"><span>预算池总额</span><b>100,000.00 元</b></div>
    <div class="desc-row"><span>已分配计划额度</span><b>0.00 元</b></div>
    <div class="desc-row"><span>可分配计划额度</span><b>0.00 元</b></div>
    <div class="desc-row"><span>预算已核销成本</span><b>64,000.00 元</b></div>
    <div class="desc-row"><span>未结清预算占用</span><b>0.00 元</b></div>
    <div class="desc-row"><span>预算已承诺总额</span><b>64,000.00 元</b></div>
    <div class="desc-row"><span>实际剩余可用预算</span><b>36,000.00 元</b></div>
    <div class="desc-row"><span>关闭原因</span><b>活动结算完成，全部用户券已核销或失效</b></div>
    <div class="desc-row"><span>关闭时间</span><b>2026-05-10 18:20</b></div>
    <div class="desc-row"><span>审批单号</span><b>APR-20260401-0900</b></div>
  </div></section>
</div>
<section class="panel" style="margin-top:14px;"><div class="panel-head">已关联券批次</div><table class="data-table"><tr><th>券批次 ID</th><th>券名称</th><th>状态</th><th>批次预算上限</th><th>预算已承诺总额</th><th>券批次活动时间</th><th>券有效期</th></tr><tr><td>CB20260401006</td><td>4 月拉新满减券</td><td><span class="tag gray">已过期</span></td><td>80,000.00</td><td>64,000.00</td><td>2026-04-01 至 2026-04-30</td><td>领取后 7 天</td></tr></table></section>
`);

pages["pages/backend/coupon-batches.html"] = layout("pages/backend/coupon-batches.html", "券批次管理", "券批次管理", `
${pageHead("券批次管理", "创建现金优惠券或通钻抵扣券批次，提交审核通过后才可发布、领取或发放。", `<a class="btn primary" href="../../pages/backend/coupon-batch-form.html?return=coupon-batches">新建券批次</a>`)}
<div class="filter-bar" style="margin-top:14px; grid-template-columns: 1.12fr .95fr .95fr .9fr .95fr auto;"><input value="券名称 / 券批次 ID"><select><option>全部预算池</option><option>平台通用预算池</option><option>平台通用营销预算池</option></select><select><option>全部发放方式</option><option>用户主动领取</option><option>运营定向发券</option><option>外部系统自动发券</option></select><select><option>全部状态</option><option>待审核</option><option>审核驳回</option><option>待开始</option><option>进行中</option><option>停用</option><option>已过期</option><option>已作废</option></select><input value="审批单号">${queryButton()}</div>
<section class="panel"><div class="panel-head">券批次列表</div><table class="data-table">
  <tr><th>券批次 ID</th><th>券名称</th><th>权益 / 券类型</th><th>预算池</th><th>批次预算上限</th><th>发放方式</th><th>活动时间</th><th>有效期</th><th>审批单号</th><th>状态</th><th>操作</th></tr>
  <tr><td>CB20260713001</td><td>短剧 8 折通钻券</td><td>通钻抵扣券 / 折扣券</td><td>平台通用预算池</td><td>30,000.00</td><td>用户主动领取</td><td>2026-07-13 至 2026-08-31</td><td>领取后 7 天</td><td>APR-20260713-1018</td><td><span class="tag green">进行中</span></td><td><a class="link" href="../../pages/backend/coupon-batch-detail-diamond.html?return=coupon-batches">详情</a></td></tr>
  <tr><td>CB20260714002</td><td>指定短剧 8 折通钻券</td><td>通钻抵扣券 / 折扣券</td><td>平台通用预算池</td><td>12,000.00</td><td>用户主动领取</td><td>2026-07-14 至 2026-08-31</td><td>领取后 7 天</td><td>APR-20260714-1022</td><td><span class="tag green">进行中</span></td><td><a class="link" href="../../pages/backend/coupon-batch-detail-diamond-drama.html?return=coupon-batches">详情</a></td></tr>
  <tr><td>CB20260714003</td><td>指定单集 8 折通钻券</td><td>通钻抵扣券 / 折扣券</td><td>平台通用预算池</td><td>8,000.00</td><td>用户主动领取</td><td>2026-07-14 至 2026-08-31</td><td>领取后 7 天</td><td>APR-20260714-1023</td><td><span class="tag green">进行中</span></td><td><a class="link" href="../../pages/backend/coupon-batch-detail-diamond-episode.html?return=coupon-batches">详情</a></td></tr>
  <tr><td>CB20260707001</td><td>平台通用满减券</td><td>现金优惠券 / 固定抵扣券</td><td>平台通用预算池</td><td>120,000.00</td><td>外部自动发券</td><td>2026-07-10 至 2026-08-31</td><td>领取后 7 天</td><td>APR-20260707-1842</td><td><span class="tag amber">待审核</span></td><td><a class="link" href="../../pages/backend/coupon-batch-detail-pending.html?return=coupon-batches">详情</a></td></tr>
  <tr><td>CB20260725001</td><td>8 月新人自动发券</td><td>现金优惠券 / 固定抵扣券</td><td>8 月新人预算池</td><td>120,000.00</td><td>外部自动发券</td><td>2026-08-01 至 2026-08-31</td><td>领取后 7 天</td><td>APR-20260725-1008</td><td><span class="tag amber">待开始</span></td><td><a class="link" href="../../pages/backend/coupon-batch-detail-upcoming.html?return=coupon-batches">详情</a><span class="link" data-open-modal="#disableBatchFromList">停用</span></td></tr>
  <tr><td>CB20260701011</td><td>平台通用满减券</td><td>现金优惠券 / 固定抵扣券</td><td>平台通用预算池</td><td>300,000.00</td><td>用户主动领取</td><td>2026-07-10 至 2026-08-31</td><td>领取后 7 天</td><td>APR-20260701-2014</td><td><span class="tag green">进行中</span></td><td><a class="link" href="../../pages/backend/coupon-batch-detail.html?return=coupon-batches">详情</a><span class="link" data-open-modal="#disableBatchFromList">停用</span></td></tr>
  <tr><td>CB20260708021</td><td>平台通用自动发券</td><td>现金优惠券 / 固定抵扣券</td><td>平台通用营销预算池</td><td>180,000.00</td><td>外部自动发券</td><td>2026-07-08 至 2026-08-31</td><td>领取后 7 天</td><td>APR-20260708-1530</td><td><span class="tag green">进行中</span></td><td><a class="link" href="../../pages/backend/coupon-batch-detail-external.html?return=coupon-batches">详情</a><span class="link" data-open-modal="#disableBatchFromList">停用</span></td></tr>
  <tr><td>CB20260709015</td><td>平台定向补贴券</td><td>现金优惠券 / 固定抵扣券</td><td>平台通用预算池</td><td>90,000.00</td><td>运营定向发券</td><td>2026-07-09 至 2026-08-31</td><td>领取后 7 天</td><td>APR-20260709-0920</td><td><span class="tag green">进行中</span></td><td><a class="link" href="../../pages/backend/coupon-batch-detail-direct.html?return=coupon-batches">详情</a><span class="link" data-open-modal="#disableBatchFromList">停用</span></td></tr>
  <tr><td>CB20260629009</td><td>平台通用折扣券</td><td>现金优惠券 / 折扣券</td><td>平台通用预算池</td><td>80,000.00</td><td>运营定向发券</td><td>2026-07-01 至 2026-07-31</td><td>2026-07-01 至 2026-07-31</td><td>APR-20260629-1910</td><td><span class="tag red">审核驳回</span></td><td><a class="link" href="../../pages/backend/coupon-batch-edit-rejected.html?return=coupon-batches">编辑</a></td></tr>
  <tr><td>CB20260618015</td><td>平台通用满减券</td><td>现金优惠券 / 固定抵扣券</td><td>平台通用预算池</td><td>50,000.00</td><td>用户主动领取</td><td>2026-06-18 至 2026-07-15</td><td>领取后 5 天</td><td>APR-20260618-1510</td><td><span class="tag blue">停用</span></td><td><a class="link" href="../../pages/backend/coupon-batch-detail-disabled.html?return=coupon-batches">详情</a><span class="link" data-open-modal="#enableBatchFromList">启用</span></td></tr>
  <tr><td>CB20260612018</td><td>平台通用满减券</td><td>现金优惠券 / 固定抵扣券</td><td>平台通用预算池</td><td>40,000.00</td><td>用户主动领取</td><td>2026-06-12 至 2026-06-30</td><td>2026-06-12 至 2026-06-30</td><td>APR-20260612-1030</td><td><span class="tag gray">已过期</span></td><td><a class="link" href="../../pages/backend/coupon-batch-detail-expired.html?return=coupon-batches">详情</a></td></tr>
  <tr><td>CB20260610007</td><td>平台通用折扣券</td><td>现金优惠券 / 折扣券</td><td>平台通用预算池</td><td>60,000.00</td><td>运营定向发券</td><td>2026-06-10 至 2026-07-20</td><td>领取后 10 天</td><td>APR-20260610-0908</td><td><span class="tag red">已作废</span></td><td><a class="link" href="../../pages/backend/coupon-batch-detail-voided.html?return=coupon-batches">详情</a></td></tr>
</table></section>
${modal("disableBatchFromList", "停用批次确认", `<div class="alert">停用后，该批次不再支持领券、运营定向发券或外部自动发券；已领取券仍按有效期保留。</div><textarea placeholder="请输入停用原因，必填"></textarea>`, `<button class="btn" data-close-modal>取消</button><button class="btn primary" data-toast="券批次已停用并记录审计">确认停用</button>`)}
${modal("enableBatchFromList", "启用批次确认", `<div class="alert">启用前系统需校验预算池为待开始或启用状态、券批次活动未过期、活动时间仍在预算周期内，且库存和预算仍满足发放条件；通过后按券批次活动时间恢复为待开始或进行中。</div>`, `<button class="btn" data-close-modal>取消</button><button class="btn primary" data-toast="券批次已启用并记录审计">确认启用</button>`)}
`);

pages["pages/backend/coupon-batch-form.html"] = layout("pages/backend/coupon-batch-form.html", "新建券批次", "券批次管理", `
${pageHead("新建券批次", "配置券规则、发放方式、预算库存和审批凭证；系统在本页完成校验后直接提交审核。", `<a class="btn" href="../../pages/backend/coupon-batches.html" data-return-link>取消</a><button class="btn primary" data-toast="已提交券批次审核" data-return-redirect="../../pages/backend/approvals.html">提交审核</button>`)}
<div class="stack" data-coupon-batch-form>
  <section class="panel"><div class="panel-head">基础信息</div><div class="panel-body form-grid">
    <div class="field"><label class="required">券名称</label><input value="现金全平台通用券"></div>
    <div class="field"><label class="required">权益类型</label><select data-benefit-type><option>现金优惠券</option><option>通钻抵扣券</option></select></div>
    <div class="field"><label class="required">券类型</label><select data-coupon-type><option>固定抵扣券</option><option>折扣券</option></select></div>
    <div class="field"><label class="required">关联预算池</label><select><option>平台通用营销预算池（启用）</option><option>8 月新人预算池（待开始）</option></select><div class="hint">仅可选择待开始或启用中的预算池；券批次活动时间需在预算周期内。</div></div>
    <div class="field"><label>成本归属</label><input value="平台营销预算（继承预算池）" readonly></div>
    <div class="field"><label class="required">券批次活动时间</label><input value="2026-07-10 至 2026-08-31"></div>
  </div></section>
  <section class="panel"><div class="panel-head">适用范围</div><div class="panel-body form-grid">
    <div class="field" data-benefit-field="现金优惠券"><label class="required">适用模式</label><select data-cash-scope-mode><option>全平台通用</option><option>指定业务线</option></select></div>
    <div class="field" data-benefit-field="现金优惠券"><label class="required">业务场景</label><div class="choice-grid" data-cash-scene-mode="全平台通用"><label class="choice-option is-locked"><input type="checkbox" checked disabled>通钻购买</label><label class="choice-option is-locked"><input type="checkbox" checked disabled>算力购买</label><label class="choice-option is-locked"><input type="checkbox" checked disabled>电影票购买</label></div><div class="choice-grid" data-cash-scene-mode="指定业务线" hidden><label class="choice-option"><input type="radio" name="cash-business-scene" data-cash-business-scene>通钻购买</label><label class="choice-option"><input type="radio" name="cash-business-scene" data-cash-business-scene>算力购买</label><label class="choice-option"><input type="radio" name="cash-business-scene" data-cash-business-scene>电影票购买</label></div></div>
    <div class="field" data-benefit-field="通钻抵扣券" hidden><label>适用模式</label><input value="指定业务线" readonly></div>
    <div class="field" data-benefit-field="通钻抵扣券" hidden><label class="required">业务场景</label><div class="choice-grid"><label class="choice-option is-locked"><input type="checkbox" checked disabled>短剧</label></div></div>
    <div class="field full" data-benefit-field="通钻抵扣券" hidden><label class="required">优惠券可用目标</label><select data-diamond-target><option>全平台短剧</option><option>全平台单集</option><option>指定短剧</option><option>指定单集</option></select></div>
    <div class="field full" data-benefit-field="通钻抵扣券" data-diamond-target-field="指定短剧" hidden><label class="required">短剧 ID</label><input placeholder="多个短剧 ID 使用英文分号分隔，例如 drama_1001;drama_1002"></div>
    <div class="field full" data-benefit-field="通钻抵扣券" data-diamond-target-field="指定单集" hidden><label class="required">剧集 ID</label><input placeholder="多个剧集 ID 使用英文分号分隔，例如 episode_1001;episode_1002"></div>
    <div class="field full" data-jump-link hidden><label>单业务线跳转链接</label><input placeholder="适用模式为指定业务线时配置"></div>
  </div></section>
  <section class="panel"><div class="panel-head">券规则与有效期</div><div class="panel-body form-grid">
    <div class="field" data-coupon-rule="固定抵扣券" data-benefit-field="现金优惠券"><label class="required">抵扣金额</label><input value="20.00 元"></div>
    <div class="field" data-coupon-rule="固定抵扣券" data-benefit-field="通钻抵扣券" hidden><label class="required">抵扣通钻数</label><input value="30 通钻"></div>
    <div class="field" data-coupon-rule="折扣券" data-benefit-field="现金优惠券" hidden><label class="required">折扣比例</label><div class="input-unit"><input value="8.5" inputmode="decimal"><span>折</span></div></div>
    <div class="field" data-coupon-rule="折扣券" data-benefit-field="通钻抵扣券" hidden><label class="required">折扣比例</label><div class="input-unit"><input value="8.0" inputmode="decimal"><span>折</span></div></div>
    <div class="field" data-coupon-rule="折扣券" data-benefit-field="现金优惠券" hidden><label class="required">最高抵扣金额</label><input value="30.00 元"></div>
    <div class="field" data-coupon-rule="折扣券" data-benefit-field="通钻抵扣券" hidden><label class="required">最高抵扣通钻数</label><input value="30 通钻"></div>
    <div class="field" data-benefit-field="现金优惠券"><label class="required">使用门槛</label><input value="满 99.00 元可用"></div>
    <div class="field" data-benefit-field="通钻抵扣券" hidden><label class="required">使用门槛</label><input value="满 100 通钻可用"></div>
    <div class="field"><label class="required">有效期类型</label><select data-validity-type><option value="relative">领取后 N 天</option><option value="fixed">时间区间</option></select></div>
    <div class="field" data-validity-field="relative"><label class="required">领取后有效天数</label><input value="7 天"></div>
    <div class="field" data-validity-field="fixed" hidden><label class="required">有效期时间区间</label><input value="2026-07-10 至 2026-08-31"></div>
    <div class="field full"><label>使用说明</label><textarea>一期平台券单个订单仅可使用一张，且不可与业务线其他活动叠加；展示和选择由业务线交易页负责。</textarea></div>
  </div></section>
  <section class="panel"><div class="panel-head">预算与库存</div><div class="panel-body form-grid">
    <div class="field"><label class="required">总库存</label><input value="6,000"></div>
    <div class="field"><label>批次预算上限</label><input value="120,000.00 元（自动计算）" readonly data-batch-budget-cap><div class="hint">按券规则、权益类型和总库存自动计算，不可修改。</div></div>
  </div></section>
  <section class="panel"><div class="panel-head">发放配置</div><div class="panel-body form-grid">
    <div class="field"><label class="required">发放方式</label><select data-issue-method><option>外部系统自动发券</option><option>用户主动领取</option><option>运营定向发券</option></select></div>
    <div class="field" data-claim-target hidden><label class="required">投放对象类型</label><select data-claim-target-type><option>按用户分群</option><option>按用户 ID</option></select></div>
    <div class="field full" data-claim-target data-claim-target-panel="按用户分群" hidden><label class="required">用户分群</label><input value="所有" readonly><div class="hint">本期仅支持“所有”分群；后续接入用户系统分群能力后扩展。</div></div>
    <div class="field" data-claim-target data-claim-target-panel="按用户 ID" hidden><label class="required">录入方式</label><select data-claim-id-mode><option value="upload">上传用户 ID 清单</option><option value="manual">手动录入用户 ID</option></select></div>
    <div class="field full" data-claim-target data-claim-target-panel="按用户 ID" data-claim-id-panel="upload" hidden><label class="required">上传用户 ID 清单</label><div class="btn-row" style="margin-bottom:8px;"><button class="btn" type="button" data-toast="Excel 模板已开始下载">下载 Excel 模板</button></div><div class="upload"><b>target-users.xlsx</b><div class="hint">上传 Excel 文件，首列为 user_id。</div></div></div>
    <div class="field full" data-claim-target data-claim-target-panel="按用户 ID" data-claim-id-panel="manual" hidden><label class="required">手动录入用户 ID</label><textarea placeholder="u_10001,u_10002,u_10003"></textarea><div class="hint">多个用户 ID 使用英文逗号分隔。</div></div>
    <div class="field full" data-issue-target="direct" hidden><label>运营定向发券</label><div class="hint">指定用户由“新增发放任务”录入并直接发放至用户券账户。</div></div>
  </div></section>
  <section class="panel"><div class="panel-head">领取限制</div><div class="panel-body form-grid">
    <div class="field"><label class="required">每人限领</label><input type="number" min="1" step="1" inputmode="numeric" pattern="[1-9][0-9]*" value="1"><div class="hint">默认 1，支持修改；仅允许输入大于 0 的正整数。</div></div>
    <div class="field"><label class="required">设备限领</label><input type="number" min="1" step="1" inputmode="numeric" pattern="[1-9][0-9]*" value="1"><div class="hint">同设备同批次最多领取张数，默认 1；仅允许输入大于 0 的正整数。</div></div>
  </div></section>
  <section class="panel"><div class="panel-head">审批信息</div><div class="panel-body form-grid">
    <div class="field"><label class="required">审批单号</label><input value="APR-20260707-1842"></div>
    <div class="field"><label class="required">审批图片</label><div class="upload"><b>approval-proof.png</b><div class="hint">已上传，支持预览</div></div></div>
    <div class="field full"><label>备注</label><textarea>用于平台通用领券中心活动。</textarea></div>
  </div></section>
</div>
`);

pages["pages/backend/coupon-batch-edit-rejected.html"] = layout("pages/backend/coupon-batch-edit-rejected.html", "编辑券批次", "券批次管理", `
${pageHead("编辑券批次", "修改驳回的券批次配置后重新提交审核。", `<a class="btn" href="../../pages/backend/coupon-batches.html" data-return-link>取消</a><button class="btn primary" data-toast="已重新提交券批次审核" data-return-redirect="../../pages/backend/approvals.html">重新提交审核</button>`)}
<section class="panel"><div class="panel-head">驳回原因</div><div class="panel-body"><div class="alert">适用范围与券规则描述不一致，请确认折扣规则、指定业务线和活动时间后重新提交。</div></div></section>
<div class="stack" style="margin-top:14px;">
  <section class="panel"><div class="panel-head">基础信息</div><div class="panel-body form-grid"><div class="field"><label>券名称</label><input value="平台通用折扣券"></div><div class="field"><label>关联预算池</label><input value="平台通用预算池" readonly></div><div class="field"><label>券批次活动时间</label><input value="2026-07-01 至 2026-07-31"></div><div class="field"><label>发放方式</label><select><option selected>运营定向发券</option></select></div></div></section>
  <section class="panel"><div class="panel-head">适用范围</div><div class="panel-body form-grid"><div class="field full"><label>适用范围</label><input value="指定业务线：通钻购买"></div></div></section>
  <section class="panel"><div class="panel-head">券规则与有效期</div><div class="panel-body form-grid"><div class="field"><label>折扣比例</label><input value="8.0 折"></div><div class="field"><label>最高抵扣金额</label><input value="30.00 元"></div><div class="field"><label>使用门槛</label><input value="满 99.00 元可用"></div><div class="field"><label>券有效期</label><input value="2026-07-01 至 2026-07-31"></div></div></section>
  <section class="panel"><div class="panel-head">预算与库存</div><div class="panel-body form-grid"><div class="field"><label>总库存</label><input value="2,000"></div><div class="field"><label>批次预算上限</label><input value="80,000.00 元" readonly></div></div></section>
  <section class="panel"><div class="panel-head">领取限制</div><div class="panel-body form-grid"><div class="field"><label>每人限领</label><input value="1"></div><div class="field"><label>设备限领</label><input value="1"></div></div></section>
  <section class="panel"><div class="panel-head">审批信息</div><div class="panel-body form-grid"><div class="field"><label>审批单号</label><input value="APR-20260629-1910"></div><div class="field"><label>审批图片</label><div class="upload"><b>discount-coupon-proof.png</b></div></div></div></section>
</div>
`);

pages["pages/backend/coupon-batch-detail-pending.html"] = layout("pages/backend/coupon-batch-detail-pending.html", "券批次详情", "券批次管理", `
${pageHead("券批次详情", "当前券批次待审核，审核通过前不可发布、领取或发放。", `<a class="btn" href="../../pages/backend/coupon-batches.html" data-return-link>返回</a>`)}
<div class="grid-2 detail-single">
  <section class="panel"><div class="panel-head"><span>基础信息</span><span class="tag amber">待审核</span></div><div class="panel-body desc-list">
    <div class="desc-row"><span>券批次 ID</span><b>CB20260707001</b></div>
    <div class="desc-row"><span>券名称</span><b>平台通用满减券</b></div>
    <div class="desc-row"><span>券类型</span><b>金额券</b></div>
    <div class="desc-row"><span>发放方式</span><b>外部自动发券</b></div>
    <div class="desc-row"><span>券批次活动时间</span><b>2026-07-10 至 2026-08-31</b></div>
    <div class="desc-row"><span>有效期类型</span><b>领取后 N 天</b></div>
    <div class="desc-row"><span>券有效期</span><b>领取后 7 天有效</b></div>
    <div class="desc-row"><span>预算池</span><b>平台通用预算池</b></div>
    <div class="desc-row"><span>批次预算上限</span><b>120,000.00 元</b></div>
    <div class="desc-row"><span>审批单号</span><b>APR-20260707-1842</b></div>
    <div class="desc-row"><span>审批图片</span><span class="link" data-open-modal="#pendingApprovalImage">查看审批图片</span></div>
  </div></section>
</div>
${couponBatchConfiguration({ pool: "平台通用预算池", activityTime: "2026-07-10 至 2026-08-31", budgetCap: "120,000.00 元", actualOccupied: "0.00 元", remainingBudget: "120,000.00 元", validity: "领取后 7 天有效", issue: "外部自动发券", approvalNo: "APR-20260707-1842", approvalStatus: "待审核", reviewer: "-", reviewedAt: "-" })}
${inventorySnapshot(6000, 0)}
${modal("pendingApprovalImage", "审批图片", `<div class="upload"><b>approval-proof.png</b><div class="hint">审批图片预览区域</div></div>`, "")}
`);

pages["pages/backend/coupon-batch-detail-upcoming.html"] = layout("pages/backend/coupon-batch-detail-upcoming.html", "券批次详情", "券批次管理", `
${pageHead("券批次详情", "当前券批次已审核通过但活动未开始，可提前绑定外部发券场景，活动开始后才允许实际发券。", `<button class="btn" data-open-modal="#disableUpcomingBatch">停用批次</button><button class="btn soft-red" data-open-modal="#voidUpcomingBatch">作废批次</button><a class="btn" href="../../pages/backend/coupon-batches.html" data-return-link>返回</a>`)}
<div class="grid-2 detail-single">
  <section class="panel"><div class="panel-head"><span>基础信息</span><span class="tag amber">待开始</span></div><div class="panel-body desc-list">
    <div class="desc-row"><span>券批次 ID</span><b>CB20260725001</b></div>
    <div class="desc-row"><span>券名称</span><b>8 月新人自动发券</b></div>
    <div class="desc-row"><span>券类型</span><b>金额券</b></div>
    <div class="desc-row"><span>发放方式</span><b>外部自动发券</b></div>
    <div class="desc-row"><span>预算池</span><b>8 月新人预算池（待开始）</b></div>
    <div class="desc-row"><span>预算周期</span><b>2026-08-01 至 2026-08-31</b></div>
    <div class="desc-row"><span>券批次活动时间</span><b>2026-08-01 至 2026-08-31</b></div>
    <div class="desc-row"><span>有效期类型</span><b>领取后 N 天</b></div>
    <div class="desc-row"><span>券有效期</span><b>领取后 7 天有效</b></div>
    <div class="desc-row"><span>批次预算上限</span><b>120,000.00 元</b></div>
    <div class="desc-row"><span>当前实际占用</span><b>0.00 元</b></div>
    <div class="desc-row"><span>审批单号</span><b>APR-20260725-1008</b></div>
  </div></section>
</div>
${couponBatchConfiguration({ pool: "8 月新人预算池", costOwner: "业务线：通钻购买（继承预算池）", activityTime: "2026-08-01 至 2026-08-31", budgetCap: "120,000.00 元", actualOccupied: "0.00 元", remainingBudget: "120,000.00 元", validity: "领取后 7 天有效", issue: "外部自动发券", approvalNo: "APR-20260725-1008" })}
${inventorySnapshot(6000, 0)}
<section class="panel" style="margin-top:14px;"><div class="panel-head">已绑定外部发券场景</div><table class="data-table"><tr><th>接入系统</th><th>发券场景编码</th><th>场景名称</th><th>启停状态</th><th>生效时间</th><th>最近调用结果</th></tr><tr><td>增长系统<br><span class="hint">growth_system</span></td><td>new_user_august_202608</td><td>8 月新人注册自动发券</td><td><span class="tag green">启用</span></td><td>2026-08-01 至 2026-08-31</td><td>-</td></tr></table></section>
<section class="panel" style="margin-top:14px;"><div class="panel-head">发放任务</div><div class="panel-body"><div class="empty">活动未开始，暂无发放任务。</div></div></section>
<section class="panel" style="margin-top:14px;"><div class="panel-head">数据统计</div><div class="panel-body">${statusCards([["发券数", "0"], ["剩余库存", "6,000"], ["当前实际占用", "0.00"], ["批次剩余预算", "120,000"]])}</div></section>
${modal("disableUpcomingBatch", "停用批次确认", `<div class="alert">停用后，该批次不可继续被外部场景实际发券；已绑定场景保留但调用会失败并记录原因。</div><textarea placeholder="请输入停用原因，必填"></textarea>`, `<button class="btn" data-close-modal>取消</button><button class="btn primary" data-toast="券批次已停用并记录审计" data-return-redirect="../../pages/backend/coupon-batches.html">确认停用</button>`)}
${modal("voidUpcomingBatch", "作废批次确认", `<div class="alert">批次作废后不可恢复，已绑定外部场景后续调用会失败并记录原因。</div><textarea placeholder="请输入作废原因"></textarea>`, `<button class="btn" data-close-modal>取消</button><button class="btn primary" data-toast="已提交作废操作" data-return-redirect="../../pages/backend/coupon-batches.html">确认作废</button>`)}
`);

pages["pages/backend/coupon-batch-detail.html"] = layout("pages/backend/coupon-batch-detail.html", "券批次详情", "券批次管理", `
${pageHead("券批次详情", "查看券规则、审批信息、领取记录和数据统计。", `<button class="btn" data-open-modal="#disableBatchModal">停用批次</button><button class="btn soft-red" data-open-modal="#voidModal">作废批次</button><a class="btn" href="../../pages/backend/coupon-batches.html" data-return-link>返回</a>`)}
<div class="grid-2 detail-single">
  <section class="panel"><div class="panel-head"><span>基础信息</span><span class="tag green">进行中</span></div><div class="panel-body desc-list">
    <div class="desc-row"><span>券批次 ID</span><b>CB20260701011</b></div>
    <div class="desc-row"><span>券名称</span><b>平台通用满减券</b></div>
    <div class="desc-row"><span>券类型</span><b>金额券</b></div>
    <div class="desc-row"><span>发放方式</span><b>用户主动领取</b></div>
    <div class="desc-row"><span>券批次活动时间</span><b>2026-07-10 至 2026-08-31</b></div>
    <div class="desc-row"><span>有效期类型</span><b>领取后 N 天</b></div>
    <div class="desc-row"><span>券有效期</span><b>领取后 7 天有效</b></div>
    <div class="desc-row"><span>预算池</span><b>平台通用预算池</b></div>
    <div class="desc-row"><span>批次预算上限</span><b>300,000.00 元</b></div>
    <div class="desc-row"><span>当前实际占用</span><b>64,000.00 元</b></div>
    <div class="desc-row"><span>批次剩余预算</span><b>236,000.00 元</b></div>
    <div class="desc-row"><span>审批单号</span><b>APR-20260701-2014</b></div>
  </div></section>
</div>
${couponBatchConfiguration({ pool: "平台通用预算池", activityTime: "2026-07-10 至 2026-08-31", budgetCap: "300,000.00 元", actualOccupied: "64,000.00 元", remainingBudget: "236,000.00 元", validity: "领取后 7 天有效", issue: "用户主动领取", approvalNo: "APR-20260701-2014" })}
${inventorySnapshot(6000, 3200)}
${couponBatchUserCouponRecords([["UC20260711001", "u_123456", "13800000000", "平台通用满减券", "待使用", "2026-07-11 12:00", "2026-07-11 至 2026-07-18"], ["UC20260712001", "u_123457", "13800000001", "平台通用满减券", "已使用", "2026-07-12 09:30", "2026-07-12 至 2026-07-19"]])}
<section class="panel" style="margin-top:14px;"><div class="panel-head">数据统计</div><div class="panel-body">${statusCards([["发券数", "3,200"], ["剩余库存", "2,800"], ["当前实际占用", "64,000"], ["预算剩余", "236,000"]])}</div></section>
${modal("disableBatchModal", "停用批次确认", `<div class="alert">停用后，该批次不再支持领券、运营定向发券或外部自动发券；已领取券仍按有效期保留。</div><textarea placeholder="请输入停用原因，必填"></textarea>`, `<button class="btn" data-close-modal>取消</button><button class="btn primary" data-toast="券批次已停用并记录审计" data-return-redirect="../../pages/backend/coupon-batches.html">确认停用</button>`)}
${modal("voidModal", "作废批次确认", `<div class="alert">批次作废后，待使用用户券将置为已作废并释放当前实际预算占用。该操作需记录审计。</div><textarea placeholder="请输入作废原因"></textarea>`, `<button class="btn" data-close-modal>取消</button><button class="btn primary" data-toast="已提交作废操作" data-return-redirect="../../pages/backend/coupon-batches.html">确认作废</button>`)}
`);

pages["pages/backend/coupon-batch-detail-external.html"] = layout("pages/backend/coupon-batch-detail-external.html", "券批次详情", "券批次管理", `
${pageHead("券批次详情", "外部自动发券批次进行中，外部系统每次调用自动发券接口时生成一条发放任务。", `<button class="btn" data-open-modal="#disableExternalBatchModal">停用批次</button><button class="btn soft-red" data-open-modal="#voidExternalBatchModal">作废批次</button><a class="btn" href="../../pages/backend/coupon-batches.html" data-return-link>返回</a>`)}
<div class="grid-2 detail-single">
  <section class="panel"><div class="panel-head"><span>基础信息</span><span class="tag green">进行中</span></div><div class="panel-body desc-list">
    <div class="desc-row"><span>券批次 ID</span><b>CB20260708021</b></div>
    <div class="desc-row"><span>券名称</span><b>平台通用自动发券</b></div>
    <div class="desc-row"><span>券类型</span><b>金额券</b></div>
    <div class="desc-row"><span>发放方式</span><b>外部自动发券</b></div>
    <div class="desc-row"><span>券批次活动时间</span><b>2026-07-08 至 2026-08-31</b></div>
    <div class="desc-row"><span>有效期类型</span><b>领取后 N 天</b></div>
    <div class="desc-row"><span>券有效期</span><b>领取后 7 天有效</b></div>
    <div class="desc-row"><span>预算池</span><b>平台通用营销预算池</b></div>
    <div class="desc-row"><span>批次预算上限</span><b>180,000.00 元</b></div>
    <div class="desc-row"><span>当前实际占用</span><b>28,620.00 元</b></div>
    <div class="desc-row"><span>批次剩余预算</span><b>151,380.00 元</b></div>
    <div class="desc-row"><span>审批单号</span><b>APR-20260708-1530</b></div>
  </div></section>
</div>
${couponBatchConfiguration({ pool: "平台通用营销预算池", activityTime: "2026-07-08 至 2026-08-31", budgetCap: "180,000.00 元", actualOccupied: "28,620.00 元", remainingBudget: "151,380.00 元", validity: "领取后 7 天有效", issue: "外部自动发券", approvalNo: "APR-20260708-1530" })}
${inventorySnapshot(6042, 5462)}
<section class="panel" style="margin-top:14px;"><div class="panel-head">发放任务</div><table class="data-table"><tr><th>任务 ID</th><th>任务名称</th><th>触发方式</th><th>业务调用事件 ID</th><th>券批次 ID</th><th>应发放明细数</th><th>成功数</th><th>失败数</th><th>任务状态</th><th>最近触发时间</th><th>操作</th></tr>${issueTaskRows(issueTaskSamples.filter((task) => task[3] === "外部接口调用"))}</table></section>
${couponBatchUserCouponRecords([["UC20260708001", "u_880010", "13600000000", "平台通用自动发券", "待使用", "2026-07-08 15:20", "2026-07-08 至 2026-07-15"], ["UC20260708003", "u_880012", "13600000002", "平台通用自动发券", "待使用", "2026-07-08 15:45", "2026-07-08 至 2026-07-15"]])}
<section class="panel" style="margin-top:14px;"><div class="panel-head">数据统计</div><div class="panel-body">${statusCards([["发券数", "1,431"], ["失败数", "18"], ["当前实际占用", "28,620"], ["预算剩余", "151,380"]])}</div></section>
${modal("disableExternalBatchModal", "停用批次确认", `<div class="alert">停用后，外部系统调用自动发券接口将返回批次不可发放。</div><textarea placeholder="请输入停用原因，必填"></textarea>`, `<button class="btn" data-close-modal>取消</button><button class="btn primary" data-toast="券批次已停用并记录审计" data-return-redirect="../../pages/backend/coupon-batches.html">确认停用</button>`)}
${modal("voidExternalBatchModal", "作废批次确认", `<div class="alert">批次作废后，待使用用户券将置为已作废并释放当前实际预算占用。该操作需记录审计。</div><textarea placeholder="请输入作废原因"></textarea>`, `<button class="btn" data-close-modal>取消</button><button class="btn primary" data-toast="已提交作废操作" data-return-redirect="../../pages/backend/coupon-batches.html">确认作废</button>`)}
`);

pages["pages/backend/coupon-batch-detail-direct.html"] = layout("pages/backend/coupon-batch-detail-direct.html", "券批次详情", "券批次管理", `
${pageHead("券批次详情", "运营定向发券批次进行中，运营可为指定用户新增发放任务。", `<a class="btn primary" href="../../pages/backend/issue-task-form.html?return=coupon-batch-detail-direct">新增发放任务</a><button class="btn" data-open-modal="#disableDirectBatchModal">停用批次</button><button class="btn soft-red" data-open-modal="#voidDirectBatchModal">作废批次</button><a class="btn" href="../../pages/backend/coupon-batches.html" data-return-link>返回</a>`)}
<div class="grid-2 detail-single">
  <section class="panel"><div class="panel-head"><span>基础信息</span><span class="tag green">进行中</span></div><div class="panel-body desc-list">
    <div class="desc-row"><span>券批次 ID</span><b>CB20260709015</b></div>
    <div class="desc-row"><span>券名称</span><b>平台定向补贴券</b></div>
    <div class="desc-row"><span>券类型</span><b>金额券</b></div>
    <div class="desc-row"><span>发放方式</span><b>运营定向发券</b></div>
    <div class="desc-row"><span>券批次活动时间</span><b>2026-07-09 至 2026-08-31</b></div>
    <div class="desc-row"><span>有效期类型</span><b>领取后 N 天</b></div>
    <div class="desc-row"><span>券有效期</span><b>领取后 7 天有效</b></div>
    <div class="desc-row"><span>预算池</span><b>平台通用预算池</b></div>
    <div class="desc-row"><span>批次预算上限</span><b>90,000.00 元</b></div>
    <div class="desc-row"><span>当前实际占用</span><b>9,900.00 元</b></div>
    <div class="desc-row"><span>批次剩余预算</span><b>80,100.00 元</b></div>
    <div class="desc-row"><span>审批单号</span><b>APR-20260709-0920</b></div>
  </div></section>
</div>
${couponBatchConfiguration({ pool: "平台通用预算池", activityTime: "2026-07-09 至 2026-08-31", scopeMode: "指定业务线", businessScene: "通钻购买", ruleFields: [["抵扣金额", "50.00 元"], ["使用门槛", "满 199.00 元可用"]], budgetCap: "90,000.00 元", actualOccupied: "9,900.00 元", remainingBudget: "80,100.00 元", validity: "领取后 7 天有效", issue: "运营定向发券", approvalNo: "APR-20260709-0920" })}
${inventorySnapshot(4920, 118)}
<section class="panel" style="margin-top:14px;"><div class="panel-head"><span>发放任务</span><a class="btn primary" href="../../pages/backend/issue-task-form.html?return=coupon-batch-detail-direct">新增发放任务</a></div><table class="data-table"><tr><th>任务 ID</th><th>任务名称</th><th>触发方式</th><th>券批次 ID</th><th>应发放明细数</th><th>成功数</th><th>失败数</th><th>任务状态</th><th>最近触发时间</th><th>失败原因</th><th>操作</th></tr>${issueTaskRows(directIssueTaskSamples, { withReason: true, hideBusinessEvent: true, returnKey: "coupon-batch-detail-direct" })}</table></section>
${couponBatchUserCouponRecords([["UC20260709001", "u_990001", "13800000010", "平台定向补贴券", "待使用", "2026-07-09 10:22", "2026-07-09 至 2026-07-16"]])}
<section class="panel" style="margin-top:14px;"><div class="panel-head">数据统计</div><div class="panel-body">${statusCards([["发券数", "198"], ["失败数", "2"], ["当前实际占用", "9,900"], ["预算剩余", "80,100"]])}</div></section>
${modal("disableDirectBatchModal", "停用批次确认", `<div class="alert">停用后，该批次不再支持运营新增发放任务；已领取券仍按有效期保留。</div><textarea placeholder="请输入停用原因，必填"></textarea>`, `<button class="btn" data-close-modal>取消</button><button class="btn primary" data-toast="券批次已停用并记录审计" data-return-redirect="../../pages/backend/coupon-batches.html">确认停用</button>`)}
${modal("voidDirectBatchModal", "作废批次确认", `<div class="alert">批次作废后，待使用用户券将置为已作废并释放当前实际预算占用。该操作需记录审计。</div><textarea placeholder="请输入作废原因"></textarea>`, `<button class="btn" data-close-modal>取消</button><button class="btn primary" data-toast="已提交作废操作" data-return-redirect="../../pages/backend/coupon-batches.html">确认作废</button>`)}
`);

pages["pages/backend/coupon-batch-detail-disabled.html"] = layout("pages/backend/coupon-batch-detail-disabled.html", "券批次详情", "券批次管理", `
${pageHead("券批次详情", "当前批次已停用，不再支持领取或发放；已领取券仍按有效期保留。", `<button class="btn primary" data-open-modal="#enableBatchDetail">启用批次</button><a class="btn" href="../../pages/backend/coupon-batches.html" data-return-link>返回</a>`)}
<div class="grid-2 detail-single">
  <section class="panel"><div class="panel-head"><span>基础信息</span><span class="tag blue">停用</span></div><div class="panel-body desc-list">
    <div class="desc-row"><span>券批次 ID</span><b>CB20260618015</b></div>
    <div class="desc-row"><span>券名称</span><b>平台通用满减券</b></div>
    <div class="desc-row"><span>券类型</span><b>金额券</b></div>
    <div class="desc-row"><span>预算池</span><b>平台通用预算池</b></div>
    <div class="desc-row"><span>发放方式</span><b>用户主动领取</b></div>
    <div class="desc-row"><span>券批次活动时间</span><b>2026-06-18 至 2026-07-15</b></div>
    <div class="desc-row"><span>券有效期</span><b>领取后 5 天有效</b></div>
    <div class="desc-row"><span>批次预算上限</span><b>50,000.00 元</b></div>
    <div class="desc-row"><span>当前实际占用</span><b>8,600.00 元</b></div>
  </div></section>
</div>
${couponBatchConfiguration({ pool: "平台通用预算池", activityTime: "2026-06-18 至 2026-07-15", budgetCap: "50,000.00 元", actualOccupied: "8,600.00 元", remainingBudget: "41,400.00 元", validity: "领取后 5 天有效", issue: "用户主动领取", approvalNo: "APR-20260618-1510" })}
${inventorySnapshot(1550, 430)}
${couponBatchUserCouponRecords([["UC20260620031", "u_220031", "13800000031", "平台通用满减券", "待使用", "2026-06-20 12:30", "2026-06-20 至 2026-06-25"]])}
<section class="panel" style="margin-top:14px;"><div class="panel-head">数据统计</div><div class="panel-body">${statusCards([["领券数", "430"], ["剩余库存", "1,120"], ["当前实际占用", "8,600"], ["批次剩余预算", "41,400"]])}</div></section>
${modal("enableBatchDetail", "启用批次确认", `<div class="alert">启用前系统需重新校验预算池为启用状态、券批次活动未过期、库存未超限、批次预算上限和预算池可分配计划额度仍满足发放条件。</div>`, `<button class="btn" data-close-modal>取消</button><button class="btn primary" data-toast="券批次已启用并记录审计" data-return-redirect="../../pages/backend/coupon-batches.html">确认启用</button>`)}
`);

pages["pages/backend/coupon-batch-detail-voided.html"] = layout("pages/backend/coupon-batch-detail-voided.html", "券批次详情", "券批次管理", `
${pageHead("券批次详情", "当前批次已作废，待使用用户券已置为已作废并释放预算占用。", `<a class="btn" href="../../pages/backend/coupon-batches.html" data-return-link>返回</a>`)}
<div class="grid-2 detail-single">
  <section class="panel"><div class="panel-head"><span>基础信息</span><span class="tag red">已作废</span></div><div class="panel-body desc-list">
    <div class="desc-row"><span>券批次 ID</span><b>CB20260610007</b></div>
    <div class="desc-row"><span>券名称</span><b>平台通用折扣券</b></div>
    <div class="desc-row"><span>券类型</span><b>折扣券</b></div>
    <div class="desc-row"><span>预算池</span><b>平台通用预算池</b></div>
    <div class="desc-row"><span>发放方式</span><b>运营定向发券</b></div>
    <div class="desc-row"><span>券批次活动时间</span><b>2026-06-10 至 2026-07-20</b></div>
    <div class="desc-row"><span>券有效期</span><b>领取后 10 天有效</b></div>
    <div class="desc-row"><span>批次预算上限</span><b>60,000.00 元</b></div>
  </div></section>
</div>
${couponBatchConfiguration({ pool: "平台通用预算池", couponType: "折扣券", activityTime: "2026-06-10 至 2026-07-20", ruleFields: [["折扣比例", "8 折"], ["最高抵扣金额", "30.00 元"], ["使用门槛", "满 99.00 元可用"]], budgetCap: "60,000.00 元", actualOccupied: "0.00 元", remainingBudget: "0.00 元", validity: "领取后 10 天有效", issue: "运营定向发券", approvalNo: "APR-20260610-0908" })}
${inventorySnapshot(2000, 620)}
<section class="panel" style="margin-top:14px;"><div class="panel-head">发放任务</div><table class="data-table"><tr><th>任务 ID</th><th>触发方式</th><th>任务类型</th><th>状态</th><th>成功数</th><th>失败数</th><th>最近触发时间</th></tr><tr><td>T20260610001</td><td>运营主动触发</td><td>运营定向发券</td><td><span class="tag green">完成</span></td><td>620</td><td>0</td><td>2026-06-10 11:00</td></tr></table></section>
${couponBatchUserCouponRecords([["UC20260610041", "u_330041", "13800000041", "平台通用折扣券", "已作废", "2026-06-10 11:03", "2026-06-10 至 2026-06-20"], ["UC20260610042", "u_330042", "13800000042", "平台通用折扣券", "已过期", "2026-06-10 11:04", "2026-06-10 至 2026-06-20"]])}
<section class="panel" style="margin-top:14px;"><div class="panel-head">预算释放记录</div><table class="data-table"><tr><th>释放对象</th><th>释放类型</th><th>释放金额</th><th>触发时间</th></tr><tr><td>批次未发放额度</td><td>计划额度释放</td><td>41,200.00</td><td>2026-06-21 09:12</td></tr><tr><td>u_330041</td><td>实际占用释放</td><td>30.00</td><td>2026-06-21 09:12</td></tr></table></section>
<section class="panel" style="margin-top:14px;"><div class="panel-head">数据统计</div><div class="panel-body">${statusCards([["发券数", "620"], ["已过期", "180"], ["当前实际占用", "0"], ["已释放预算", "41,230"]])}</div></section>
`);

pages["pages/backend/coupon-batch-detail-expired.html"] = layout("pages/backend/coupon-batch-detail-expired.html", "券批次详情", "券批次管理", `
${pageHead("券批次详情", "当前批次已过期，不再支持领取或发放。", `<a class="btn" href="../../pages/backend/coupon-batches.html" data-return-link>返回</a>`)}
<div class="grid-2 detail-single">
  <section class="panel"><div class="panel-head"><span>基础信息</span><span class="tag gray">已过期</span></div><div class="panel-body desc-list">
    <div class="desc-row"><span>券批次 ID</span><b>CB20260612018</b></div>
    <div class="desc-row"><span>券名称</span><b>平台通用满减券</b></div>
    <div class="desc-row"><span>券类型</span><b>金额券</b></div>
    <div class="desc-row"><span>预算池</span><b>平台通用预算池</b></div>
    <div class="desc-row"><span>发放方式</span><b>用户主动领取</b></div>
    <div class="desc-row"><span>券批次活动时间</span><b>2026-06-12 至 2026-06-30</b></div>
    <div class="desc-row"><span>券有效期</span><b>2026-06-12 至 2026-06-30</b></div>
    <div class="desc-row"><span>批次预算上限</span><b>40,000.00 元</b></div>
  </div></section>
</div>
${couponBatchConfiguration({ pool: "平台通用预算池", activityTime: "2026-06-12 至 2026-06-30", validityType: "时间区间", budgetCap: "40,000.00 元", actualOccupied: "0.00 元", remainingBudget: "0.00 元", validity: "2026-06-12 至 2026-06-30", issue: "用户主动领取", approvalNo: "APR-20260612-1030" })}
${inventorySnapshot(1500, 1080)}
${couponBatchUserCouponRecords([["UC20260616051", "u_440051", "13800000051", "平台通用满减券", "已过期", "2026-06-16 09:30", "2026-06-16 至 2026-06-30"], ["UC20260618052", "u_440052", "13800000052", "平台通用满减券", "已过期", "2026-06-18 13:20", "2026-06-18 至 2026-06-30"]])}
<section class="panel" style="margin-top:14px;"><div class="panel-head">数据统计</div><div class="panel-body">${statusCards([["领券数", "1,080"], ["已过期", "420"], ["当前实际占用", "0"], ["已释放预算", "18,440"]])}</div></section>
<section class="panel" style="margin-top:14px;"><div class="panel-head">预算释放记录</div><table class="data-table"><tr><th>释放对象</th><th>释放类型</th><th>释放金额</th><th>触发时间</th></tr><tr><td>批次未发放额度</td><td>计划额度释放</td><td>18,400.00</td><td>2026-06-30 23:59</td></tr><tr><td>u_440051</td><td>实际占用释放</td><td>20.00</td><td>2026-06-30 23:59</td></tr><tr><td>u_440053</td><td>实际占用释放</td><td>20.00</td><td>2026-06-24 15:12</td></tr></table></section>
`);

pages["pages/backend/approvals.html"] = layout("pages/backend/approvals.html", "审批管理", "审批管理", `
${pageHead("审批管理", "集中处理预算池新建、增加预算和券批次的单级审核，审核通过和驳回均记录审核人与审计记录。", `<button class="btn primary">刷新</button>`)}
<div class="tabs"><button class="tab active" data-group="approval" data-tab="budget">预算池审批</button><button class="tab" data-group="approval" data-tab="batch">券批次审批</button></div>
<section class="tab-panel active" data-group="approval" data-panel="budget"><div class="filter-bar"><select><option>全部审批类型</option><option>预算池新建审批</option><option>增加预算审批</option></select><input value="预算池名称"><input value="审批单号"><input value="创建人">${queryButton()}</div><section class="panel"><div class="panel-head">预算池审批列表</div><table class="data-table"><tr><th>审批类型</th><th>预算池</th><th>申请金额/预算池总额</th><th>申请人</th><th>提交时间</th><th>审批单号</th><th>操作</th></tr><tr><td>预算池新建审批</td><td>平台通用营销预算池</td><td>500,000.00</td><td>陈运营</td><td>2026-07-07 10:18</td><td>APR-20260707-1842</td><td><a class="link" href="../../pages/backend/approval-budget-detail.html?return=approvals">审核</a></td></tr><tr><td>增加预算审批</td><td>平台通用预算池</td><td>增加 200,000.00</td><td>陈运营</td><td>2026-07-08 10:24</td><td>APR-20260708-1024</td><td><a class="link" href="../../pages/backend/approval-budget-increase-detail.html?return=approvals">审核</a></td></tr></table></section></section>
<section class="tab-panel" data-group="approval" data-panel="batch"><div class="filter-bar"><input value="券名称 / 券批次 ID"><select><option>全部预算池</option><option>平台通用预算池</option><option>平台通用营销预算池</option></select><select><option>全部发放方式</option><option>用户主动领取</option><option>运营定向发券</option><option>外部系统自动发券</option></select><input value="审批单号">${queryButton()}</div><section class="panel"><div class="panel-head">券批次审批列表</div><table class="data-table"><tr><th>券批次</th><th>券名称</th><th>预算池</th><th>发放方式</th><th>审批单号</th><th>操作</th></tr><tr><td>CB20260707001</td><td>平台通用满减券</td><td>平台通用预算池</td><td>外部自动发券</td><td>APR-20260707-1842</td><td><a class="link" href="../../pages/backend/approval-batch-detail.html?return=approvals">审核</a></td></tr></table></section></section>
`);

pages["pages/backend/approval-budget-detail.html"] = layout("pages/backend/approval-budget-detail.html", "预算池审核详情", "审批管理", `
${pageHead("预算池审核详情", "审核预算池新建时提交的预算池信息、审批凭证和备注。", `<a class="btn" href="../../pages/backend/approvals.html" data-return-link>返回</a><button class="btn soft-red" data-open-modal="#rejectModal">审核驳回</button><button class="btn primary" data-toast="预算池审核通过" data-return-redirect="../../pages/backend/approvals.html">审核通过</button>`)}
<div class="grid-2">
  <div class="stack">
    <section class="panel"><div class="panel-head">预算池信息</div><div class="panel-body desc-list">
      <div class="desc-row"><span>预算池名称</span><b>平台通用营销预算池</b></div>
      <div class="desc-row"><span>预算池总额</span><b>500,000.00 元</b></div>
      <div class="desc-row"><span>成本归属</span><b>平台</b></div>
      <div class="desc-row"><span>负责人</span><b>陈运营</b></div>
      <div class="desc-row"><span>预算周期</span><b>2026-07-10 至 2026-08-31</b></div>
    </div></section>
    <section class="panel"><div class="panel-head">备注</div><div class="panel-body"><div class="hint">用于平台通用领券中心活动。</div></div></section>
  </div>
  <section class="panel"><div class="panel-head">审批凭证</div><div class="panel-body desc-list">
    <div class="desc-row"><span>审批单号</span><b>APR-20260707-1842</b></div>
    <div class="desc-row"><span>审批图片</span><span class="link" data-open-modal="#imageFail">查看图片</span></div>
  </div></section>
</div>
${modal("rejectModal", "审核驳回", `<textarea placeholder="请输入驳回原因，必填"></textarea>`, `<button class="btn" data-close-modal>取消</button><button class="btn primary" data-toast="已驳回并记录原因" data-return-redirect="../../pages/backend/approvals.html">确认驳回</button>`)}
${modal("imageFail", "审批图片加载失败状态", `<div class="alert">审批图片加载失败，请重新加载或联系提交人重新上传。</div>`, `<button class="btn primary" data-toast="已重新加载图片">重新加载</button>`)}
`);

pages["pages/backend/approval-budget-increase-detail.html"] = layout("pages/backend/approval-budget-increase-detail.html", "增加预算审核详情", "审批管理", `
${pageHead("增加预算审核详情", "审核目标预算池、提交时预算快照、本次增加额度和审批凭证。", `<a class="btn" href="../../pages/backend/approvals.html" data-return-link>返回</a><button class="btn soft-red" data-open-modal="#rejectIncrease">审核驳回</button><button class="btn primary" data-toast="增加预算审核通过，预算池总额已更新" data-return-redirect="../../pages/backend/approvals.html">审核通过</button>`)}
<div class="grid-2">
  <div class="stack">
    <section class="panel"><div class="panel-head">目标预算池</div><div class="panel-body desc-list">
      <div class="desc-row"><span>预算池名称</span><b>平台通用预算池</b></div>
      <div class="desc-row"><span>负责人</span><b>陈运营</b></div>
      <div class="desc-row"><span>预算周期</span><b>2026-07-10 至 2026-08-31</b></div>
    </div></section>
    <section class="panel"><div class="panel-head">增加预算申请</div><div class="panel-body desc-list">
      <div class="desc-row"><span>本次增加额度</span><b>200,000.00 元</b></div>
      <div class="desc-row"><span>审批通过后预算池总额</span><b>1,000,000.00 元</b></div>
      <div class="desc-row"><span>备注</span><b>用于补充 7 月平台通用券活动额度。</b></div>
    </div></section>
  </div>
  <div class="stack">
    <section class="panel"><div class="panel-head">提交时预算快照</div><div class="panel-body desc-list">
      <div class="desc-row"><span>提交时预算池总额</span><b>800,000.00 元</b></div>
      <div class="desc-row"><span>提交时已分配计划额度</span><b>720,000.00 元</b></div>
      <div class="desc-row"><span>提交时可分配计划额度</span><b>80,000.00 元</b></div>
      <div class="desc-row"><span>提交时当前实际占用</span><b>304,500.00 元</b></div>
    </div></section>
    <section class="panel"><div class="panel-head">审批凭证</div><div class="panel-body desc-list">
      <div class="desc-row"><span>审批单号</span><b>APR-20260708-1024</b></div>
      <div class="desc-row"><span>审批图片</span><span class="link" data-open-modal="#increaseImage">查看图片</span></div>
    </div></section>
  </div>
</div>
${modal("rejectIncrease", "审核驳回", `<textarea placeholder="请输入驳回原因，必填"></textarea>`, `<button class="btn" data-close-modal>取消</button><button class="btn primary" data-toast="已驳回增加预算申请" data-return-redirect="../../pages/backend/approvals.html">确认驳回</button>`)}
${modal("increaseImage", "审批图片", `<div class="upload"><b>increase-proof.png</b><div class="hint">审批图片预览区域</div></div>`, "")}
`);

pages["pages/backend/approval-batch-detail.html"] = layout("pages/backend/approval-batch-detail.html", "券批次审核详情", "审批管理", `
${pageHead("券批次审核详情", "审核新建券批次时提交的基础信息、发放配置、券规则、预算库存和审批凭证。", `<a class="btn" href="../../pages/backend/approvals.html" data-return-link>返回</a><button class="btn soft-red" data-open-modal="#rejectBatch">审核驳回</button><button class="btn primary" data-toast="券批次审核通过，已发布" data-return-redirect="../../pages/backend/approvals.html">审核通过</button>`)}
<div class="grid-2">
  <div class="stack">
    <section class="panel"><div class="panel-head">基础信息</div><div class="panel-body desc-list">
      <div class="desc-row"><span>券批次 ID</span><b>CB20260707001</b></div>
      <div class="desc-row"><span>券名称</span><b>平台通用满减券</b></div>
      <div class="desc-row"><span>权益类型 / 券类型</span><b>现金优惠券 / 固定抵扣券</b></div>
      <div class="desc-row"><span>适用范围</span><b>通钻购买、算力购买、电影票购买</b></div>
      <div class="desc-row"><span>关联预算池</span><b>平台通用预算池（启用）</b></div>
      <div class="desc-row"><span>券批次活动时间</span><b>2026-07-10 至 2026-08-31</b></div>
    </div></section>
    <section class="panel"><div class="panel-head">发放配置</div><div class="panel-body desc-list">
      <div class="desc-row"><span>发放方式</span><b>外部系统自动发券</b></div>
      <div class="desc-row"><span>外部发券场景</span><b>coupon_issue_standard</b></div>
      <div class="desc-row"><span>触发来源</span><b>外部系统按接口调用触发发券任务</b></div>
    </div></section>
    <section class="panel"><div class="panel-head">券规则与有效期</div><div class="panel-body desc-list">
      <div class="desc-row"><span>优惠金额</span><b>20.00 元</b></div>
      <div class="desc-row"><span>使用门槛</span><b>满 99.00 元可用</b></div>
      <div class="desc-row"><span>有效期类型</span><b>领取后 N 天</b></div>
      <div class="desc-row"><span>券有效期</span><b>领取后 7 天有效</b></div>
      <div class="desc-row"><span>使用说明</span><b>平台券与其他活动一期二选一；人民币支付或通钻扣款成功后由中台核销。</b></div>
    </div></section>
  </div>
  <div class="stack">
    <section class="panel"><div class="panel-head">预算与库存</div><div class="panel-body desc-list">
      <div class="desc-row"><span>总库存</span><b>6,000 张</b></div>
      <div class="desc-row"><span>批次预算上限</span><b>120,000.00 元</b></div>
      <div class="desc-row"><span>理论最大优惠金额</span><b>120,000.00 元</b></div>
      <div class="desc-row"><span>预算池总额</span><b>800,000.00 元</b></div>
      <div class="desc-row"><span>预算池可分配计划额度</span><b>680,000.00 元</b></div>
    </div></section>
    <section class="panel"><div class="panel-head">领取限制</div><div class="panel-body desc-list">
      <div class="desc-row"><span>每人限领</span><b>1 张</b></div>
      <div class="desc-row"><span>设备限领</span><b>同设备同批次最多 1 张</b></div>
    </div></section>
    <section class="panel"><div class="panel-head">审批凭证</div><div class="panel-body desc-list">
      <div class="desc-row"><span>审批单号</span><b>APR-20260707-1842</b></div>
      <div class="desc-row"><span>审批图片</span><span class="link" data-open-modal="#batchImage">查看图片</span></div>
    </div></section>
    <section class="panel"><div class="panel-head">备注</div><div class="panel-body"><div class="hint">用于平台通用领券中心活动。</div></div></section>
  </div>
</div>
${modal("rejectBatch", "审核驳回", `<textarea placeholder="请输入驳回原因，必填"></textarea>`, `<button class="btn" data-close-modal>取消</button><button class="btn primary" data-toast="已驳回券批次" data-return-redirect="../../pages/backend/approvals.html">确认驳回</button>`)}
${modal("batchImage", "审批图片", `<div class="upload"><b>approval-proof.png</b><div class="hint">审批图片预览区域</div></div>`, "")}
`);

const budgetApprovalSamples = [
  { id: "APB20260714001", type: "预算池新建审批", poolId: "BP20260714001", poolName: "平台通用营销预算池", costOwner: "平台", owner: "陈运营", period: "2026-07-15 至 2026-08-31", content: "新建，总额 500,000.00 元", amount: "500,000.00 元", submitAt: "2026-07-14 09:18", proof: "budget-platform-proof.png", remark: "用于平台通用领券中心活动。" },
  { id: "APB20260714002", type: "预算池新建审批", poolId: "BP20260714002", poolName: "通钻购买营销预算池", costOwner: "业务线：通钻购买", owner: "李运营", period: "2026-07-15 至 2026-08-31", content: "新建，总额 200,000.00 元", amount: "200,000.00 元", submitAt: "2026-07-14 09:42", proof: "budget-diamond-proof.png", remark: "用于通钻购买业务线的新人促销。" },
  { id: "APB20260714003", type: "增加预算审批", poolId: "BP20260701009", poolName: "平台通用营销预算池", costOwner: "平台", owner: "陈运营", period: "2026-07-10 至 2026-08-31", content: "增加 200,000.00 元，通过后 1,000,000.00 元", amount: "增加 200,000.00 元", submitAt: "2026-07-14 10:06", proof: "increase-platform-proof.png", remark: "补充 7 月平台通用券活动额度。", snapshot: { total: "800,000.00 元", allocated: "720,000.00 元", available: "80,000.00 元", occupied: "304,500.00 元", remaining: "495,500.00 元" }, afterTotal: "1,000,000.00 元" },
  { id: "APB20260714004", type: "增加预算审批", poolId: "BP20260702016", poolName: "算力购买营销预算池", costOwner: "业务线：算力购买", owner: "王运营", period: "2026-07-10 至 2026-08-31", content: "增加 50,000.00 元，通过后 250,000.00 元", amount: "增加 50,000.00 元", submitAt: "2026-07-14 10:24", proof: "increase-compute-proof.png", remark: "补充算力购买暑期活动额度。", snapshot: { total: "200,000.00 元", allocated: "148,000.00 元", available: "52,000.00 元", occupied: "86,400.00 元", remaining: "113,600.00 元" }, afterTotal: "250,000.00 元" }
];

const batchApprovalSamples = [
  { id: "CB20260714001", approvalNo: "APC20260714001", name: "现金全平台固定券", benefit: "现金优惠券", couponType: "固定抵扣券", scope: "全平台通用：通钻购买、算力购买、电影票购买", pool: "平台通用营销预算池", cost: "平台", rule: "减 20.00 元，满 99.00 元可用", stock: "6,000", cap: "120,000.00 元", issue: "外部系统自动发券", validity: "领取后 7 天", applicant: "陈运营", submitAt: "2026-07-14 10:36", proof: "cash-universal-fixed.png", remark: "用于平台通用自动发券活动。" },
  { id: "CB20260714002", approvalNo: "APC20260714002", name: "现金全平台折扣券", benefit: "现金优惠券", couponType: "折扣券", scope: "全平台通用：通钻购买、算力购买、电影票购买", pool: "平台通用营销预算池", cost: "平台", rule: "8.5 折，最高减 30.00 元，满 99.00 元可用", stock: "4,000", cap: "120,000.00 元", issue: "运营定向发券", validity: "2026-07-15 至 2026-08-31", applicant: "李运营", submitAt: "2026-07-14 10:48", proof: "cash-universal-discount.png", remark: "用于高价值用户召回。" },
  { id: "CB20260714003", approvalNo: "APC20260714003", name: "通钻购买新人券", benefit: "现金优惠券", couponType: "固定抵扣券", scope: "指定业务线：通钻购买", pool: "平台通用营销预算池", cost: "平台", rule: "减 10.00 元，满 50.00 元可用", stock: "10,000", cap: "100,000.00 元", issue: "用户主动领取", claimAudience: "按用户分群：所有", validity: "领取后 3 天", applicant: "陈运营", submitAt: "2026-07-14 10:55", proof: "diamond-new-user.png", remark: "用于通钻购买新人活动。" },
  { id: "CB20260714004", approvalNo: "APC20260714004", name: "算力购买折扣券", benefit: "现金优惠券", couponType: "折扣券", scope: "指定业务线：算力购买", pool: "算力购买营销预算池", cost: "业务线：算力购买", rule: "8.0 折，最高减 50.00 元，满 100.00 元可用", stock: "2,000", cap: "100,000.00 元", issue: "用户主动领取", claimAudience: "按用户 ID：上传清单", validity: "领取后 5 天", applicant: "王运营", submitAt: "2026-07-14 11:06", proof: "compute-discount.png", remark: "用于算力购买定向投放。" },
  { id: "CB20260714005", approvalNo: "APC20260714005", name: "电影票购票券", benefit: "现金优惠券", couponType: "固定抵扣券", scope: "指定业务线：电影票购买", pool: "平台通用营销预算池", cost: "平台", rule: "减 15.00 元，满 60.00 元可用", stock: "3,000", cap: "45,000.00 元", issue: "运营定向发券", validity: "领取后 7 天", applicant: "赵运营", submitAt: "2026-07-14 11:18", proof: "movie-fixed.png", remark: "用于电影票业务线拉新。" },
  { id: "CB20260714006", approvalNo: "APC20260714006", name: "短剧全平台通钻券", benefit: "通钻抵扣券", couponType: "固定抵扣券", scope: "短剧：全平台短剧", pool: "平台通用营销预算池", cost: "平台", rule: "减 30 通钻，满 100 通钻可用", stock: "6,000", cap: "18,000.00 元", issue: "外部系统自动发券", validity: "领取后 7 天", applicant: "陈运营", submitAt: "2026-07-14 11:30", proof: "drama-universal-fixed.png", remark: "按平台预算规则折算成本。" },
  { id: "CB20260714007", approvalNo: "APC20260714007", name: "短剧单集折扣券", benefit: "通钻抵扣券", couponType: "折扣券", scope: "短剧：全平台单集", pool: "平台通用营销预算池", cost: "平台", rule: "8.0 折，最高减 30 通钻，满 100 通钻可用", stock: "5,000", cap: "15,000.00 元", issue: "用户主动领取", claimAudience: "按用户 ID：手动录入", validity: "领取后 5 天", applicant: "孙运营", submitAt: "2026-07-14 11:42", proof: "drama-episode-discount.png", remark: "用于短剧单集解锁促销。" },
  { id: "CB20260714008", approvalNo: "APC20260714008", name: "指定短剧通钻券", benefit: "通钻抵扣券", couponType: "固定抵扣券", scope: "短剧：指定短剧（drama_1001;drama_1002）", pool: "平台通用营销预算池", cost: "平台", rule: "减 20 通钻，满 80 通钻可用", stock: "4,000", cap: "8,000.00 元", issue: "运营定向发券", validity: "2026-07-15 至 2026-08-15", applicant: "孙运营", submitAt: "2026-07-14 11:54", proof: "drama-specified.png", remark: "内容下架由运营人工决定停发或作废。" },
  { id: "CB20260714009", approvalNo: "APC20260714009", name: "指定单集折扣券", benefit: "通钻抵扣券", couponType: "折扣券", scope: "短剧：指定单集（episode_1001;episode_1002）", pool: "平台通用营销预算池", cost: "平台", rule: "7.5 折，最高减 40 通钻，满 100 通钻可用", stock: "2,000", cap: "8,000.00 元", issue: "用户主动领取", claimAudience: "按用户分群：所有", validity: "领取后 3 天", applicant: "赵运营", submitAt: "2026-07-14 12:06", proof: "episode-specified-discount.png", remark: "用于剧集重点单集转化。" }
];

function approvalActions(rejectModalId, successText) {
  return `<a class="btn" href="../../pages/backend/approvals.html" data-return-link>返回</a><button class="btn soft-red" data-open-modal="#${rejectModalId}">审核驳回</button><button class="btn primary" data-toast="${successText}" data-return-redirect="../../pages/backend/approvals.html">审核通过</button>`;
}

function approvalProof(sample, modalId) {
  return `<section class="panel"><div class="panel-head">审批信息</div><div class="panel-body desc-list"><div class="desc-row"><span>审批单号</span><b>${sample.approvalNo || sample.id}</b></div><div class="desc-row"><span>申请人</span><b>${sample.owner || sample.applicant}</b></div><div class="desc-row"><span>提交时间</span><b>${sample.submitAt}</b></div><div class="desc-row"><span>审批图片</span><span class="link" data-open-modal="#${modalId}">查看图片</span></div><div class="desc-row"><span>备注</span><b>${sample.remark}</b></div></div></section>`;
}

function budgetApprovalDetail(sample) {
  const modalId = `reject-${sample.id}`;
  const isIncrease = sample.type === "增加预算审批";
  const primary = isIncrease
    ? `<section class="panel"><div class="panel-head">目标预算池</div><div class="panel-body desc-list"><div class="desc-row"><span>预算池 ID</span><b>${sample.poolId}</b></div><div class="desc-row"><span>预算池名称</span><b>${sample.poolName}</b></div><div class="desc-row"><span>成本归属</span><b>${sample.costOwner}</b></div><div class="desc-row"><span>负责人</span><b>${sample.owner}</b></div><div class="desc-row"><span>预算周期</span><b>${sample.period}</b></div><div class="desc-row"><span>提交时状态</span><b>启用</b></div></div></section><section class="panel"><div class="panel-head">增加预算申请</div><div class="panel-body desc-list"><div class="desc-row"><span>本次增加额度</span><b>${sample.amount}</b></div><div class="desc-row"><span>审批通过后预算池总额</span><b>${sample.afterTotal}</b></div></div></section>`
    : `<section class="panel"><div class="panel-head">预算池配置</div><div class="panel-body desc-list"><div class="desc-row"><span>预算池 ID</span><b>${sample.poolId}</b></div><div class="desc-row"><span>预算池名称</span><b>${sample.poolName}</b></div><div class="desc-row"><span>预算池总额</span><b>${sample.amount}</b></div><div class="desc-row"><span>成本归属</span><b>${sample.costOwner}</b></div><div class="desc-row"><span>负责人</span><b>${sample.owner}</b></div><div class="desc-row"><span>预算周期</span><b>${sample.period}</b></div></div></section>`;
  const snapshot = isIncrease ? `<section class="panel"><div class="panel-head">提交时预算快照</div><div class="panel-body desc-list"><div class="desc-row"><span>预算池总额</span><b>${sample.snapshot.total}</b></div><div class="desc-row"><span>已分配计划额度</span><b>${sample.snapshot.allocated}</b></div><div class="desc-row"><span>可分配计划额度</span><b>${sample.snapshot.available}</b></div><div class="desc-row"><span>当前实际占用</span><b>${sample.snapshot.occupied}</b></div><div class="desc-row"><span>实际剩余可用预算</span><b>${sample.snapshot.remaining}</b></div></div></section>` : "";
  return layout(`pages/backend/approval-budget-${sample.id}.html`, sample.type, "审批管理", `${pageHead(sample.type, "审核提交时固化的预算池审批快照。", approvalActions(modalId, sample.type === "增加预算审批" ? "增加预算审核通过，预算池总额已更新" : "预算池审核通过"))}<div class="grid-2"><div class="stack">${primary}</div><div class="stack">${snapshot}${approvalProof(sample, `proof-${sample.id}`)}</div></div>${modal(modalId, "审核驳回", `<textarea placeholder="请输入驳回原因，必填"></textarea>`, `<button class="btn" data-close-modal>取消</button><button class="btn primary" data-toast="已驳回并记录原因" data-return-redirect="../../pages/backend/approvals.html">确认驳回</button>`)}${modal(`proof-${sample.id}`, "审批图片", `<div class="upload"><b>${sample.proof}</b><div class="hint">审批图片预览区域</div></div>`, "")}`);
}

function batchApprovalDetail(sample) {
  const modalId = `reject-${sample.id}`;
  const diamondRate = sample.benefit === "通钻抵扣券" ? `<div class="desc-row"><span>预算换算快照</span><b>10 通钻 = 1 元</b></div>` : "";
  if (sample.claimAudience) {
    sample = { ...sample, issue: `${sample.issue}<br><span class="hint">领取对象：${sample.claimAudience}</span>` };
  }
  return layout(`pages/backend/approval-batch-${sample.id}.html`, "券批次审核详情", "审批管理", `${pageHead("券批次审核详情", "审核创建页提交的券批次审批快照。", approvalActions(modalId, "券批次审核通过，已发布"))}<div class="grid-2"><div class="stack"><section class="panel"><div class="panel-head">基础信息</div><div class="panel-body desc-list"><div class="desc-row"><span>券批次 ID</span><b>${sample.id}</b></div><div class="desc-row"><span>券名称</span><b>${sample.name}</b></div><div class="desc-row"><span>权益类型</span><b>${sample.benefit}</b></div><div class="desc-row"><span>券类型</span><b>${sample.couponType}</b></div><div class="desc-row"><span>关联预算池</span><b>${sample.pool}</b></div><div class="desc-row"><span>成本归属</span><b>${sample.cost}</b></div><div class="desc-row"><span>可领取/发放时间</span><b>2026-07-15 至 2026-08-31</b></div></div></section><section class="panel"><div class="panel-head">适用范围</div><div class="panel-body desc-list"><div class="desc-row"><span>适用范围</span><b>${sample.scope}</b></div></div></section><section class="panel"><div class="panel-head">券规则与有效期</div><div class="panel-body desc-list"><div class="desc-row"><span>券规则</span><b>${sample.rule}</b></div><div class="desc-row"><span>券有效期</span><b>${sample.validity}</b></div></div></section><section class="panel"><div class="panel-head">发放配置</div><div class="panel-body desc-list"><div class="desc-row"><span>发放方式</span><b>${sample.issue}</b></div></div></section></div><div class="stack"><section class="panel"><div class="panel-head">预算与库存</div><div class="panel-body desc-list"><div class="desc-row"><span>总库存</span><b>${sample.stock}</b></div><div class="desc-row"><span>批次预算上限</span><b>${sample.cap}</b></div><div class="desc-row"><span>理论最大优惠金额</span><b>${sample.cap}</b></div><div class="desc-row"><span>提交时预算池可分配计划额度</span><b>380,000.00 元</b></div>${diamondRate}</div></section><section class="panel"><div class="panel-head">领取限制</div><div class="panel-body desc-list"><div class="desc-row"><span>每人限领</span><b>1 张</b></div><div class="desc-row"><span>设备限领</span><b>1 张</b></div></div></section>${approvalProof(sample, `proof-${sample.id}`)}</div></div>${modal(modalId, "审核驳回", `<textarea placeholder="请输入驳回原因，必填"></textarea>`, `<button class="btn" data-close-modal>取消</button><button class="btn primary" data-toast="已驳回券批次" data-return-redirect="../../pages/backend/approvals.html">确认驳回</button>`)}${modal(`proof-${sample.id}`, "审批图片", `<div class="upload"><b>${sample.proof}</b><div class="hint">审批图片预览区域</div></div>`, "")}`);
}

pages["pages/backend/approvals.html"] = layout("pages/backend/approvals.html", "审批管理", "审批管理", `
${pageHead("审批管理", "集中处理预算池和券批次待审核事项；列表摘要与审核详情均读取提交时审批快照。", `<button class="btn primary">刷新</button>`)}
<div class="tabs"><button class="tab active" data-group="approval" data-tab="budget">预算池审批</button><button class="tab" data-group="approval" data-tab="batch">券批次审批</button></div>
<section class="tab-panel active" data-group="approval" data-panel="budget"><div class="filter-bar"><select><option>全部审批类型</option><option>预算池新建审批</option><option>增加预算审批</option></select><input value="预算池名称 / ID"><input value="审批单号"><input value="申请人">${queryButton()}</div><section class="panel"><div class="panel-head">预算池审批列表</div><table class="data-table"><tr><th>审批单号</th><th>审批类型</th><th>预算池</th><th>成本归属</th><th>申请内容</th><th>预算周期</th><th>申请人</th><th>提交时间</th><th>操作</th></tr>${budgetApprovalSamples.map((sample) => `<tr><td>${sample.id}</td><td>${sample.type}</td><td>${sample.poolId}<br><span class="hint">${sample.poolName}</span></td><td>${sample.costOwner}</td><td>${sample.content}</td><td>${sample.period}</td><td>${sample.owner}</td><td>${sample.submitAt}</td><td><a class="link" href="../../pages/backend/approval-budget-${sample.id}.html?return=approvals">审核</a></td></tr>`).join("")}</table></section></section>
<section class="tab-panel" data-group="approval" data-panel="batch"><div class="filter-bar"><input value="券名称 / 券批次 ID"><select><option>全部权益类型</option><option>现金优惠券</option><option>通钻抵扣券</option></select><select><option>全部发放方式</option><option>用户主动领取</option><option>运营定向发券</option><option>外部系统自动发券</option></select><input value="审批单号">${queryButton()}</div><section class="panel"><div class="panel-head">券批次审批列表</div><table class="data-table"><tr><th>审批单号</th><th>券批次</th><th>权益 / 券类型</th><th>适用范围</th><th>预算池 / 成本归属</th><th>券规则摘要</th><th>库存 / 批次预算上限</th><th>发放方式</th><th>申请人 / 提交时间</th><th>操作</th></tr>${batchApprovalSamples.map((sample) => `<tr><td>${sample.approvalNo}</td><td>${sample.id}<br><span class="hint">${sample.name}</span></td><td>${sample.benefit}<br><span class="hint">${sample.couponType}</span></td><td>${sample.scope}</td><td>${sample.pool}<br><span class="hint">${sample.cost}</span></td><td>${sample.rule}</td><td>${sample.stock} 张<br><span class="hint">${sample.cap}</span></td><td>${sample.issue}</td><td>${sample.applicant}<br><span class="hint">${sample.submitAt}</span></td><td><a class="link" href="../../pages/backend/approval-batch-${sample.id}.html?return=approvals&tab=batch">审核</a></td></tr>`).join("")}</table></section></section>
`);

for (const sample of budgetApprovalSamples) pages[`pages/backend/approval-budget-${sample.id}.html`] = budgetApprovalDetail(sample);
for (const sample of batchApprovalSamples) pages[`pages/backend/approval-batch-${sample.id}.html`] = batchApprovalDetail(sample);

pages["pages/backend/external-scenes.html"] = layout("pages/backend/external-scenes.html", "外部发券场景管理", "外部发券场景", `
${pageHead("外部发券场景管理", "外部系统按 source_system + issue_scene_code 调用，优惠券中台内部匹配绑定券批次。", `<a class="btn primary" href="../../pages/backend/external-scene-form.html?return=external-scenes">新建场景</a>`)}
<div class="filter-bar" style="grid-template-columns: 1fr 1fr 1fr .85fr .85fr auto;"><select><option>全部接入系统</option><option>平台系统（platform_system）</option><option>增长系统（growth_system）</option><option>会员系统（member_system）</option></select><input value="发券场景编码"><input value="场景名称"><select><option>全部启停状态</option><option>启用</option><option>停用</option></select><select><option>全部时间态</option><option>未生效</option><option>生效中</option><option>已结束</option></select>${queryButton()}</div>
<section class="panel"><div class="panel-head">场景列表</div><table class="data-table"><tr><th>接入系统</th><th>发券场景编码</th><th>场景名称</th><th>绑定券批次</th><th>启停状态</th><th>时间态</th><th>生效时间</th><th>最近调用结果</th><th>操作</th></tr><tr><td>平台系统<br><span class="hint">platform_system</span></td><td>coupon_issue_standard</td><td>通用发券场景</td><td>CB20260708021</td><td><span class="tag green">启用</span></td><td><span class="tag green">生效中</span></td><td>2026-07-08 至 2026-08-31</td><td><span class="tag green">成功</span></td><td><a class="link" href="../../pages/backend/external-scene-detail.html?return=external-scenes">详情</a><a class="link" href="../../pages/backend/external-scene-edit.html?return=external-scenes">编辑</a><span class="link" data-open-modal="#disableScene">停用</span></td></tr><tr><td>增长系统<br><span class="hint">growth_system</span></td><td>new_user_register_202607</td><td>7 月新人注册自动发券</td><td>CB20260708021</td><td><span class="tag green">启用</span></td><td><span class="tag amber">未生效</span></td><td>2026-07-10 至 2026-08-31</td><td>-</td><td><a class="link" href="../../pages/backend/external-scene-detail-new-user-register.html?return=external-scenes">详情</a><a class="link" href="../../pages/backend/external-scene-edit-new-user-register.html?return=external-scenes">编辑</a><span class="link" data-open-modal="#disableScene">停用</span></td></tr><tr><td>增长系统<br><span class="hint">growth_system</span></td><td>new_user_august_202608</td><td>8 月新人注册自动发券</td><td>CB20260725001</td><td><span class="tag green">启用</span></td><td><span class="tag amber">未生效</span></td><td>2026-08-01 至 2026-08-31</td><td>-</td><td><a class="link" href="../../pages/backend/external-scene-detail-august.html?return=external-scenes">详情</a><a class="link" href="../../pages/backend/external-scene-edit-august.html?return=external-scenes">编辑</a><span class="link" data-open-modal="#disableScene">停用</span></td></tr><tr><td>增长系统<br><span class="hint">growth_system</span></td><td>june_user_register_202606</td><td>6 月新人注册自动发券</td><td>CB20260612018</td><td><span class="tag green">启用</span></td><td><span class="tag gray">已结束</span></td><td>2026-06-01 至 2026-06-30</td><td><span class="tag green">成功</span></td><td><a class="link" href="../../pages/backend/external-scene-detail-ended.html?return=external-scenes">详情</a></td></tr><tr><td>增长系统<br><span class="hint">growth_system</span></td><td>profile_completed_202607</td><td>7 月完善资料自动发券</td><td>CB20260707011</td><td><span class="tag red">停用</span></td><td><span class="tag amber">未生效</span></td><td>2026-07-10 至 2026-08-31</td><td>-</td><td><a class="link" href="../../pages/backend/external-scene-detail-disabled.html?return=external-scenes">详情</a><a class="link" href="../../pages/backend/external-scene-edit-disabled.html?return=external-scenes">编辑</a><span class="link" data-open-modal="#enableScene">启用</span></td></tr></table></section>
${modal("disableScene", "停用场景确认", `<div class="alert">停用后，外部系统使用该 source_system + issue_scene_code 调用自动发券接口将失败并记录原因；历史调用记录保留。</div><textarea placeholder="请输入停用原因，必填"></textarea>`, `<button class="btn" data-close-modal>取消</button><button class="btn primary" data-toast="外部发券场景已停用并记录审计">确认停用</button>`)}
${modal("enableScene", "启用场景确认", `<div class="alert">启用前系统需校验接入系统可用、绑定券批次为外部自动发券且状态为待开始或进行中、生效时间在券批次活动时间和预算池预算周期内，且同组合不存在时间重叠的启用场景。</div>`, `<button class="btn" data-close-modal>取消</button><button class="btn primary" data-toast="外部发券场景已启用并记录审计">确认启用</button>`)}
`);

pages["pages/backend/external-scene-form.html"] = layout("pages/backend/external-scene-form.html", "新建外部发券场景", "外部发券场景", `
${pageHead("新建外部发券场景", "配置外部系统在什么业务场景下触发哪个可绑定券批次。", `<a class="btn" href="../../pages/backend/external-scenes.html" data-return-link>取消</a><button class="btn primary" data-toast="外部发券场景已保存" data-return-redirect="../../pages/backend/external-scenes.html">保存场景</button>`)}
<section class="panel"><div class="panel-head">场景配置</div><div class="panel-body form-grid"><div class="field"><label class="required">接入系统名称</label><select><option>平台系统（platform_system）</option><option>增长系统（growth_system）</option><option>会员系统（member_system）</option></select><div class="hint">接入系统由技术完成一次性接入，新建发券场景无需研发预置场景编码。</div></div><div class="field"><label class="required">发券场景编码 issue_scene_code</label><input value="new_user_register_202607"><div class="hint">运营填写，建议使用小写字母、数字和下划线；保存后不可编辑；同一编码可配置未来时间区间，但不得与已有启用配置重叠。</div></div><div class="field"><label class="required">场景名称</label><input value="7 月新人注册自动发券"></div><div class="field"><label class="required">绑定券批次</label><select><option>CB20260708021 平台通用自动发券（进行中）</option><option>CB20260725001 8 月新人自动发券（待开始）</option></select><div class="hint">仅展示外部系统自动发券、已审核通过且状态为待开始/进行中的券批次；待开始批次仅用于未来生效配置。</div></div><div class="field full"><label class="required">触发事件说明</label><textarea>增长系统在新人注册成功后，按配置的发券场景编码调用自动发券接口。</textarea></div><div class="field"><label class="required">生效开始时间</label><input value="2026-07-10 00:00"><div class="hint">不得早于绑定券批次活动开始时间和预算池预算周期开始时间。</div></div><div class="field"><label class="required">生效结束时间</label><input value="2026-08-31 23:59"><div class="hint">不得晚于券批次活动结束时间和预算池预算周期结束时间。</div></div><div class="field"><label>启停状态</label><select><option>启用</option><option>停用</option></select></div></div></section>
`);

function externalSceneEditPage(file, config) {
  const batchOptions = config.batchOptions.map((option) => `<option${option.selected ? " selected" : ""}>${option.label}</option>`).join("");
  const statusOptions = config.statusOptions.map((option) => `<option${option.selected ? " selected" : ""}>${option.label}</option>`).join("");

  return layout(file, "编辑外部发券场景", "外部发券场景", `
${pageHead("编辑外部发券场景", config.sub, `<a class="btn" href="../../pages/backend/external-scenes.html" data-return-link>取消</a><button class="btn primary" data-toast="外部发券场景已保存" data-return-redirect="../../pages/backend/external-scenes.html">保存</button>`)}
<section class="panel"><div class="panel-head">场景配置</div><div class="panel-body form-grid">
  <div class="field locked"><label>接入系统名称</label><input value="${config.system}" disabled><div class="hint">外部接口路由身份，创建后不可编辑。</div></div>
  <div class="field locked"><label>发券场景编码 issue_scene_code</label><input value="${config.code}" disabled><div class="hint">运营创建时填写，创建后不可编辑，外部系统按该编码调用。</div></div>
  <div class="field locked"><label>当前时间态</label><input value="${config.timeState}" disabled><div class="hint">${config.timeStateHint}</div></div>
  <div class="field"><label class="required">场景名称</label><input value="${config.name}"></div>
  <div class="field"><label class="required">绑定券批次</label><select>${batchOptions}</select><div class="hint">更新后仅影响后续调用；保存时重新校验券批次状态、活动时间、预算池周期和同场景编码时间重叠。</div></div>
  <div class="field full"><label class="required">触发事件说明</label><textarea>${config.eventDesc}</textarea></div>
  <div class="field${config.startDisabled ? " locked" : ""}"><label class="required">生效开始时间</label><input value="${config.startTime}"${config.startDisabled ? " disabled" : ""}><div class="hint">${config.startHint}</div></div>
  <div class="field${config.endDisabled ? " locked" : ""}"><label class="required">生效结束时间</label><input value="${config.endTime}"${config.endDisabled ? " disabled" : ""}><div class="hint">${config.endHint}</div></div>
  <div class="field"><label>启停状态</label><select>${statusOptions}</select></div>
</div></section>
`);
}

const externalSceneBatchOptions = [
  { label: "CB20260708021 平台通用自动发券（进行中）" },
  { label: "CB20260725001 8 月新人自动发券（待开始）" },
];

pages["pages/backend/external-scene-edit.html"] = externalSceneEditPage("pages/backend/external-scene-edit.html", {
  sub: "当前场景生效中，仅可编辑绑定券批次、生效结束时间和启停状态；接入系统、场景编码和生效开始时间不可修改。",
  system: "平台系统（platform_system）",
  code: "coupon_issue_standard",
  timeState: "生效中",
  timeStateHint: "当前时间位于生效区间内，因此生效开始时间不可编辑。",
  name: "通用发券场景",
  batchOptions: externalSceneBatchOptions.map((option, index) => ({ ...option, selected: index === 0 })),
  eventDesc: "平台系统按通用发券场景编码调用自动发券接口。",
  startTime: "2026-07-08 00:00",
  startDisabled: true,
  startHint: "生效中场景开始时间不可编辑；如需调整开始时间，应新建未来配置。",
  endTime: "2026-08-31 23:59",
  endDisabled: false,
  endHint: "生效中场景仅可编辑结束时间，且必须晚于当前时间并不晚于绑定批次活动结束时间。",
  statusOptions: [{ label: "启用", selected: true }, { label: "停用" }],
});

pages["pages/backend/external-scene-edit-new-user-register.html"] = externalSceneEditPage("pages/backend/external-scene-edit-new-user-register.html", {
  sub: "当前场景未生效，可编辑绑定券批次、生效开始时间、生效结束时间和启停状态；接入系统与场景编码不可修改。",
  system: "增长系统（growth_system）",
  code: "new_user_register_202607",
  timeState: "未生效",
  timeStateHint: "当前时间早于生效开始时间，因此允许编辑生效开始/结束时间。",
  name: "7 月新人注册自动发券",
  batchOptions: externalSceneBatchOptions.map((option, index) => ({ ...option, selected: index === 0 })),
  eventDesc: "增长系统在新人注册成功后，按配置的发券场景编码调用自动发券接口。",
  startTime: "2026-07-10 00:00",
  startDisabled: false,
  startHint: "未生效场景可编辑；不得早于当前时间、券批次活动开始时间和预算池周期开始时间。",
  endTime: "2026-08-31 23:59",
  endDisabled: false,
  endHint: "不得晚于券批次活动结束时间和预算池周期结束时间。",
  statusOptions: [{ label: "启用", selected: true }, { label: "停用" }],
});

pages["pages/backend/external-scene-edit-august.html"] = externalSceneEditPage("pages/backend/external-scene-edit-august.html", {
  sub: "当前场景未生效，可编辑绑定券批次、生效开始时间、生效结束时间和启停状态；接入系统与场景编码不可修改。",
  system: "增长系统（growth_system）",
  code: "new_user_august_202608",
  timeState: "未生效",
  timeStateHint: "当前时间早于生效开始时间，因此允许编辑生效开始/结束时间。",
  name: "8 月新人注册自动发券",
  batchOptions: externalSceneBatchOptions.map((option, index) => ({ ...option, selected: index === 1 })),
  eventDesc: "增长系统在 8 月新人注册成功后，按配置的发券场景编码调用自动发券接口。",
  startTime: "2026-08-01 00:00",
  startDisabled: false,
  startHint: "未生效场景可编辑；不得早于当前时间、券批次活动开始时间和预算池周期开始时间。",
  endTime: "2026-08-31 23:59",
  endDisabled: false,
  endHint: "不得晚于券批次活动结束时间和预算池周期结束时间。",
  statusOptions: [{ label: "启用", selected: true }, { label: "停用" }],
});

pages["pages/backend/external-scene-edit-disabled.html"] = externalSceneEditPage("pages/backend/external-scene-edit-disabled.html", {
  sub: "当前场景已停用，可编辑场景信息；启用前系统需重新校验绑定券批次、生效时间和时间重叠。",
  system: "增长系统（growth_system）",
  code: "profile_completed_202607",
  timeState: "未生效",
  timeStateHint: "当前时间早于生效开始时间，但启停状态为停用，保存启用前需重新校验。",
  name: "7 月完善资料自动发券",
  batchOptions: externalSceneBatchOptions.map((option, index) => ({ ...option, selected: index === 0 })),
  eventDesc: "增长系统在用户完善资料后，按配置的发券场景编码调用自动发券接口。",
  startTime: "2026-07-10 00:00",
  startDisabled: false,
  startHint: "未生效场景可编辑；不得早于当前时间、券批次活动开始时间和预算池周期开始时间。",
  endTime: "2026-08-31 23:59",
  endDisabled: false,
  endHint: "不得晚于券批次活动结束时间和预算池周期结束时间。",
  statusOptions: [{ label: "启用" }, { label: "停用", selected: true }],
});

pages["pages/backend/external-scene-detail.html"] = layout("pages/backend/external-scene-detail.html", "外部发券场景详情", "外部发券场景", `
${pageHead("外部发券场景详情", "展示基础信息、当前绑定券批次、接口调用说明和调用记录。", `<a class="btn" href="../../pages/backend/external-scene-edit.html?return=external-scenes">编辑</a><button class="btn soft-red" data-open-modal="#disableSceneDetail">停用场景</button><a class="btn" href="../../pages/backend/external-scenes.html" data-return-link>返回</a>`)}
<div class="grid-2"><section class="panel"><div class="panel-head"><span>基础信息</span><span class="tag green">启用</span></div><div class="panel-body desc-list"><div class="desc-row"><span>接入系统</span><b>平台系统（platform_system）</b></div><div class="desc-row"><span>issue_scene_code</span><b>coupon_issue_standard</b></div><div class="desc-row"><span>场景名称</span><b>通用发券场景</b></div><div class="desc-row"><span>触发事件说明</span><b>平台系统按通用发券场景编码调用自动发券接口</b></div><div class="desc-row"><span>绑定券批次</span><b>CB20260708021 平台通用自动发券</b></div><div class="desc-row"><span>启停状态</span><b>启用</b></div><div class="desc-row"><span>时间态</span><b>生效中</b></div><div class="desc-row"><span>生效时间</span><b>2026-07-08 至 2026-08-31</b></div><div class="desc-row"><span>最近调用结果</span><b>成功</b></div></div></section><section class="panel"><div class="panel-head">接口调用说明</div><div class="panel-body desc-list"><div class="desc-row"><span>必传参数</span><b>source_system / issue_scene_code / external_event_id / user_id</b></div><div class="desc-row"><span>幂等键</span><b>source_system + issue_scene_code + external_event_id + user_id</b></div><div class="desc-row"><span>路由方式</span><b>系统按接入系统、场景编码和生效时间匹配当前绑定券批次</b></div><div class="desc-row"><span>不可发放调用</span><b>失败并记录批次、库存、预算或启停状态原因</b></div></div></section></div>
<section class="panel" style="margin-top:14px;"><div class="panel-head">调用记录</div><div class="filter-bar"><select><option>全部调用结果</option><option>成功</option><option>失败</option></select><input value="外部事件 ID"><input value="用户 ID">${queryButton()}</div><table class="data-table"><tr><th>外部事件 ID</th><th>用户 ID</th><th>调用结果</th><th>失败原因</th><th>关联任务 ID</th><th>调用时间</th></tr><tr><td>standard_20260708_0001</td><td>u_123456</td><td><span class="tag green">成功</span></td><td>-</td><td>T20260708001</td><td>2026-07-08 15:20</td></tr><tr><td>standard_20260708_0002</td><td>u_880099</td><td><span class="tag red">失败</span></td><td>用户已达到同批次每人限领</td><td>T20260708004</td><td>2026-07-08 16:05</td></tr><tr><td>standard_20260708_0003</td><td>u_880120</td><td><span class="tag red">失败</span></td><td>库存不足，整批未发放</td><td>T20260708007</td><td>2026-07-08 16:40</td></tr></table></section>
${modal("disableSceneDetail", "停用场景确认", `<div class="alert">停用后，外部系统使用该 source_system + issue_scene_code 调用自动发券接口将失败并记录原因；历史调用记录保留。</div><textarea placeholder="请输入停用原因，必填"></textarea>`, `<button class="btn" data-close-modal>取消</button><button class="btn primary" data-toast="外部发券场景已停用并记录审计" data-return-redirect="../../pages/backend/external-scenes.html">确认停用</button>`)}
`);

pages["pages/backend/external-scene-detail-new-user-register.html"] = layout("pages/backend/external-scene-detail-new-user-register.html", "外部发券场景详情", "外部发券场景", `
${pageHead("外部发券场景详情", "展示基础信息、当前绑定券批次、接口调用说明和调用记录。", `<a class="btn" href="../../pages/backend/external-scene-edit-new-user-register.html?return=external-scenes">编辑</a><button class="btn soft-red" data-open-modal="#disableNewUserScene">停用场景</button><a class="btn" href="../../pages/backend/external-scenes.html" data-return-link>返回</a>`)}
<div class="grid-2"><section class="panel"><div class="panel-head"><span>基础信息</span><span class="tag green">启用</span></div><div class="panel-body desc-list"><div class="desc-row"><span>接入系统</span><b>增长系统（growth_system）</b></div><div class="desc-row"><span>issue_scene_code</span><b>new_user_register_202607</b></div><div class="desc-row"><span>场景名称</span><b>7 月新人注册自动发券</b></div><div class="desc-row"><span>触发事件说明</span><b>增长系统在新人注册成功后调用自动发券接口</b></div><div class="desc-row"><span>绑定券批次</span><b>CB20260708021 平台通用自动发券</b></div><div class="desc-row"><span>启停状态</span><b>启用</b></div><div class="desc-row"><span>时间态</span><b>未生效</b></div><div class="desc-row"><span>生效时间</span><b>2026-07-10 至 2026-08-31</b></div><div class="desc-row"><span>最近调用结果</span><b>-</b></div></div></section><section class="panel"><div class="panel-head">接口调用说明</div><div class="panel-body desc-list"><div class="desc-row"><span>必传参数</span><b>source_system / issue_scene_code / external_event_id / user_id</b></div><div class="desc-row"><span>幂等键</span><b>source_system + issue_scene_code + external_event_id + user_id</b></div><div class="desc-row"><span>路由方式</span><b>系统按接入系统、场景编码和生效时间匹配当前绑定券批次</b></div><div class="desc-row"><span>未生效调用</span><b>失败并记录“外部发券场景未生效”</b></div></div></section></div>
<section class="panel" style="margin-top:14px;"><div class="panel-head">调用记录</div><div class="panel-body"><div class="empty">当前场景未生效，暂无有效调用记录。</div></div></section>
${modal("disableNewUserScene", "停用场景确认", `<div class="alert">停用后，外部系统使用该 source_system + issue_scene_code 调用自动发券接口将失败并记录原因；历史调用记录保留。</div><textarea placeholder="请输入停用原因，必填"></textarea>`, `<button class="btn" data-close-modal>取消</button><button class="btn primary" data-toast="外部发券场景已停用并记录审计" data-return-redirect="../../pages/backend/external-scenes.html">确认停用</button>`)}
`);

pages["pages/backend/external-scene-detail-august.html"] = layout("pages/backend/external-scene-detail-august.html", "外部发券场景详情", "外部发券场景", `
${pageHead("外部发券场景详情", "展示基础信息、当前绑定券批次、接口调用说明和调用记录。", `<a class="btn" href="../../pages/backend/external-scene-edit-august.html?return=external-scenes">编辑</a><button class="btn soft-red" data-open-modal="#disableAugustScene">停用场景</button><a class="btn" href="../../pages/backend/external-scenes.html" data-return-link>返回</a>`)}
<div class="grid-2"><section class="panel"><div class="panel-head"><span>基础信息</span><span class="tag green">启用</span></div><div class="panel-body desc-list"><div class="desc-row"><span>接入系统</span><b>增长系统（growth_system）</b></div><div class="desc-row"><span>issue_scene_code</span><b>new_user_august_202608</b></div><div class="desc-row"><span>场景名称</span><b>8 月新人注册自动发券</b></div><div class="desc-row"><span>触发事件说明</span><b>增长系统在 8 月新人注册成功后调用自动发券接口</b></div><div class="desc-row"><span>绑定券批次</span><b>CB20260725001 8 月新人自动发券</b></div><div class="desc-row"><span>启停状态</span><b>启用</b></div><div class="desc-row"><span>时间态</span><b>未生效</b></div><div class="desc-row"><span>生效时间</span><b>2026-08-01 至 2026-08-31</b></div><div class="desc-row"><span>最近调用结果</span><b>-</b></div></div></section><section class="panel"><div class="panel-head">接口调用说明</div><div class="panel-body desc-list"><div class="desc-row"><span>必传参数</span><b>source_system / issue_scene_code / external_event_id / user_id</b></div><div class="desc-row"><span>幂等键</span><b>source_system + issue_scene_code + external_event_id + user_id</b></div><div class="desc-row"><span>路由方式</span><b>系统按接入系统、场景编码和生效时间匹配当前绑定券批次</b></div><div class="desc-row"><span>未生效调用</span><b>失败并记录“外部发券场景未生效”</b></div></div></section></div>
<section class="panel" style="margin-top:14px;"><div class="panel-head">调用记录</div><div class="panel-body"><div class="empty">当前场景未生效，暂无调用记录。</div></div></section>
${modal("disableAugustScene", "停用场景确认", `<div class="alert">停用后，外部系统使用该 source_system + issue_scene_code 调用自动发券接口将失败并记录原因；历史调用记录保留。</div><textarea placeholder="请输入停用原因，必填"></textarea>`, `<button class="btn" data-close-modal>取消</button><button class="btn primary" data-toast="外部发券场景已停用并记录审计" data-return-redirect="../../pages/backend/external-scenes.html">确认停用</button>`)}
`);

pages["pages/backend/external-scene-detail-ended.html"] = layout("pages/backend/external-scene-detail-ended.html", "外部发券场景详情", "外部发券场景", `
${pageHead("外部发券场景详情", "展示基础信息、当前绑定券批次、接口调用说明和调用记录。", `<a class="btn" href="../../pages/backend/external-scenes.html" data-return-link>返回</a>`)}
<div class="grid-2"><section class="panel"><div class="panel-head"><span>基础信息</span><span class="tag green">启用</span></div><div class="panel-body desc-list"><div class="desc-row"><span>接入系统</span><b>增长系统（growth_system）</b></div><div class="desc-row"><span>issue_scene_code</span><b>june_user_register_202606</b></div><div class="desc-row"><span>场景名称</span><b>6 月新人注册自动发券</b></div><div class="desc-row"><span>触发事件说明</span><b>增长系统在 6 月新人注册成功后调用自动发券接口</b></div><div class="desc-row"><span>绑定券批次</span><b>CB20260612018 平台通用满减券</b></div><div class="desc-row"><span>启停状态</span><b>启用</b></div><div class="desc-row"><span>时间态</span><b>已结束</b></div><div class="desc-row"><span>生效时间</span><b>2026-06-01 至 2026-06-30</b></div><div class="desc-row"><span>最近调用结果</span><b>成功</b></div></div></section><section class="panel"><div class="panel-head">接口调用说明</div><div class="panel-body desc-list"><div class="desc-row"><span>必传参数</span><b>source_system / issue_scene_code / external_event_id / user_id</b></div><div class="desc-row"><span>幂等键</span><b>source_system + issue_scene_code + external_event_id + user_id</b></div><div class="desc-row"><span>结束后调用</span><b>失败并记录“外部发券场景已结束”</b></div></div></section></div>
<section class="panel" style="margin-top:14px;"><div class="panel-head">调用记录</div><table class="data-table"><tr><th>外部事件 ID</th><th>用户 ID</th><th>调用结果</th><th>失败原因</th><th>关联任务 ID</th><th>调用时间</th></tr><tr><td>june_20260618_0001</td><td>u_440052</td><td><span class="tag green">成功</span></td><td>-</td><td>T20260618001</td><td>2026-06-18 13:20</td></tr></table></section>
`);

pages["pages/backend/external-scene-detail-disabled.html"] = layout("pages/backend/external-scene-detail-disabled.html", "外部发券场景详情", "外部发券场景", `
${pageHead("外部发券场景详情", "展示基础信息、当前绑定券批次、接口调用说明和调用记录。", `<button class="btn primary" data-open-modal="#enableDisabledScene">启用场景</button><a class="btn" href="../../pages/backend/external-scenes.html" data-return-link>返回</a>`)}
<div class="grid-2"><section class="panel"><div class="panel-head"><span>基础信息</span><span class="tag red">停用</span></div><div class="panel-body desc-list"><div class="desc-row"><span>接入系统</span><b>增长系统（growth_system）</b></div><div class="desc-row"><span>issue_scene_code</span><b>profile_completed_202607</b></div><div class="desc-row"><span>场景名称</span><b>7 月完善资料自动发券</b></div><div class="desc-row"><span>触发事件说明</span><b>增长系统在用户完善资料后调用自动发券接口</b></div><div class="desc-row"><span>绑定券批次</span><b>CB20260707011</b></div><div class="desc-row"><span>启停状态</span><b>停用</b></div><div class="desc-row"><span>时间态</span><b>未生效</b></div><div class="desc-row"><span>生效时间</span><b>2026-07-10 至 2026-08-31</b></div><div class="desc-row"><span>最近调用结果</span><b>-</b></div></div></section><section class="panel"><div class="panel-head">接口调用说明</div><div class="panel-body desc-list"><div class="desc-row"><span>必传参数</span><b>source_system / issue_scene_code / external_event_id / user_id</b></div><div class="desc-row"><span>幂等键</span><b>source_system + issue_scene_code + external_event_id + user_id</b></div><div class="desc-row"><span>停用调用</span><b>失败并记录“外部发券场景已停用”</b></div></div></section></div>
<section class="panel" style="margin-top:14px;"><div class="panel-head">调用记录</div><div class="panel-body"><div class="empty">当前场景停用，暂无调用记录。</div></div></section>
${modal("enableDisabledScene", "启用场景确认", `<div class="alert">启用前系统需校验绑定券批次、生效时间和同一 source_system + issue_scene_code 下的时间重叠。</div>`, `<button class="btn" data-close-modal>取消</button><button class="btn primary" data-toast="外部发券场景已启用并记录审计" data-return-redirect="../../pages/backend/external-scenes.html">确认启用</button>`)}
`);

pages["pages/backend/issue-tasks.html"] = layout("pages/backend/issue-tasks.html", "发放任务", "发放任务", `
${pageHead("发放任务", "查看运营定向发券、外部自动发券任务，支持新增、重试和单条任务明细查看。", `<a class="btn primary" href="../../pages/backend/issue-task-form.html?return=issue-tasks">新增发放任务</a>`)}
<section class="panel" data-issue-task-filter><div class="panel-head">任务列表</div><div class="panel-body"><div class="filter-bar" style="grid-template-columns:1.35fr .8fr .8fr .9fr auto;"><input data-issue-task-keyword placeholder="任务 ID / 任务名称 / 业务调用事件 ID"><select data-issue-task-trigger><option value="">全部触发方式</option><option>运营主动触发</option><option>外部接口调用</option></select><select data-issue-task-status><option value="">全部任务状态</option><option>待执行</option><option>执行中</option><option>成功</option><option>失败</option><option>部分失败</option></select><select data-issue-task-batch><option value="">全部券批次</option><option>CB20260709015</option><option>CB20260708021</option></select><button class="btn primary" type="button" data-issue-task-filter-action>查询</button></div><table class="data-table"><tr><th>任务 ID</th><th>任务名称</th><th>触发方式</th><th>业务调用事件 ID</th><th>券批次 ID</th><th>应发放明细数</th><th>成功数</th><th>失败数</th><th>任务状态</th><th>最近触发时间</th><th>失败原因</th><th>操作</th></tr>${issueTaskRows(issueTaskSamples, { withReason: true })}</table></div></section>
`);
for (const sample of issueTaskSamples) pages[`pages/backend/issue-task-detail-${sample[0]}.html`] = issueTaskDetailPage(sample);
for (const sample of directIssueTaskSamples) pages[`pages/backend/issue-task-detail-${sample[0]}.html`] = issueTaskDetailPage(sample);

pages["pages/backend/issue-task-form.html"] = layout("pages/backend/issue-task-form.html", "新增发放任务", "发放任务", `
${pageHead("新增发放任务", "运营录入任务名称、目标券批次和用户清单后直接提交，系统创建任务并在执行时完成校验。", `<a class="btn" href="../../pages/backend/issue-tasks.html" data-return-link>取消</a><button class="btn primary" data-toast="发放任务已创建并开始执行" data-return-redirect="../../pages/backend/issue-tasks.html">提交发放任务</button>`)}
<div class="stack" data-coupon-batch-form data-issue-task-form>
    <section class="panel"><div class="panel-head">任务信息</div><div class="panel-body form-grid">
      <input type="hidden" data-issue-method value="运营定向发券">
      <div class="field full"><label class="required">任务名称</label><input value="客服补偿名单发放" placeholder="请输入任务名称"><div class="hint">仅用于运营主动发券任务的查询与追溯。</div></div>
      <div class="field full"><label class="required">目标券批次</label><select><option>CB20260709015 平台定向补贴券（进行中）</option></select><div class="hint">仅展示发放方式为运营定向发券、审核通过、状态为进行中且预算池为启用的券批次。</div></div>
      <div class="field"><label>券名称</label><input value="平台定向补贴券" readonly></div>
      <div class="field"><label>预算池</label><input value="平台通用预算池（启用）" readonly></div>
      <div class="field"><label>批次剩余预算</label><input value="80,100.00 元" readonly></div>
      <div class="field"><label>剩余库存</label><input value="4,802 张" readonly></div>
      <div class="field full"><label>任务备注</label><textarea>客服补偿名单定向发放。</textarea></div>
    </div></section>
    <section class="panel"><div class="panel-head">发放对象</div><div class="panel-body form-grid">
      <div class="field"><label class="required">录入方式</label><select data-direct-target-mode><option value="upload">上传用户 ID 清单</option><option value="manual">手动录入用户 ID</option></select></div>
      <div class="field full" data-direct-target-panel="upload"><label class="required">上传用户 ID 清单</label><div class="btn-row" style="margin-bottom:8px;"><button class="btn" data-toast="Excel 模板已开始下载">下载 Excel 模板</button></div><div class="upload"><b>target-users.xlsx</b><div class="hint">上传 Excel 文件，首列为 user_id，已识别 120 个用户</div></div></div>
      <div class="field full" data-direct-target-panel="manual" hidden><label class="required">手动录入用户 ID</label><textarea placeholder="u_10001,u_10002,u_10003">u_990001,u_990002,u_990099</textarea><div class="hint">多个用户 ID 使用英文逗号分隔。</div></div>
    </div></section>
</div>
`);

pages["pages/backend/coupon-batch-detail-diamond.html"] = layout("pages/backend/coupon-batch-detail-diamond.html", "券批次详情", "券批次管理", `
${pageHead("券批次详情", "通钻抵扣券按已固化汇率折算人民币预算；内容下架不触发系统自动处理。", `<a class="btn" href="../../pages/backend/coupon-batches.html" data-return-link>返回</a>`)}
<div class="grid-2 detail-single">
  <section class="panel"><div class="panel-head"><span>基础信息</span><span class="tag green">进行中</span></div><div class="panel-body desc-list">
    <div class="desc-row"><span>券批次 ID</span><b>CB20260713001</b></div><div class="desc-row"><span>券名称</span><b>短剧 8 折通钻券</b></div><div class="desc-row"><span>权益类型</span><b>通钻抵扣券</b></div><div class="desc-row"><span>券类型</span><b>折扣券</b></div><div class="desc-row"><span>业务场景</span><b>短剧</b></div><div class="desc-row"><span>优惠券可用目标</span><b>全平台短剧</b></div><div class="desc-row"><span>最低实付</span><b>1 通钻</b></div><div class="desc-row"><span>单业务线跳转</span><b>已配置短剧中心入口</b></div>
  </div></section>
</div>
${couponBatchConfiguration({ name: "短剧 8 折通钻券", benefitType: "通钻抵扣券", couponType: "折扣券", pool: "平台通用预算池", costOwner: "平台营销预算（继承预算池）", activityTime: "2026-07-13 至 2026-08-31", scopeMode: "指定业务线：短剧", businessScene: "短剧", couponTarget: "全平台短剧", ruleFields: [["折扣比例", "8 折"], ["最高抵扣通钻数", "30 通钻"], ["使用门槛", "满 100 通钻可用"]], budgetCap: "30,000.00 元", actualOccupied: "8,420.00 元", remainingBudget: "21,580.00 元", budgetRate: "10 通钻 = 1 元", validity: "领取后 7 天有效", issue: "用户主动领取", usageInstructions: "短剧订单仅可使用一张通钻抵扣券，通钻扣款成功后立即核销。", approvalNo: "APR-20260713-1018" })}
${inventorySnapshot(3000, 842)}
${couponBatchUserCouponRecords([["UC20260713001", "u_770001", "13800000021", "短剧 8 折通钻券", "待使用", "2026-07-13 10:20", "2026-07-13 至 2026-07-20"], ["UC20260713002", "u_770002", "13800000022", "短剧 8 折通钻券", "已使用", "2026-07-13 11:05", "2026-07-13 至 2026-07-20"]])}
`);

pages["pages/backend/coupon-batch-detail-diamond-drama.html"] = diamondTargetBatchDetail({
  id: "CB20260714002", name: "指定短剧 8 折通钻券", target: "指定短剧", targetIds: "drama_1001；drama_1002", approvalNo: "APR-20260714-1022", budgetCap: "12,000.00", actualOccupied: "2,400.00", stock: 1200, issued: 320,
});
pages["pages/backend/coupon-batch-detail-diamond-episode.html"] = diamondTargetBatchDetail({
  id: "CB20260714003", name: "指定单集 8 折通钻券", target: "指定单集", targetIds: "episode_2001；episode_2002", approvalNo: "APR-20260714-1023", budgetCap: "8,000.00", actualOccupied: "1,200.00", stock: 800, issued: 160,
});

pages["pages/backend/redeem-records.html"] = layout("pages/backend/redeem-records.html", "核销记录", "核销记录", `
${pageHead("核销记录", "查询各业务线已成功核销的用户券、实际抵扣与人民币营销预算成本。")}
<div class="filter-bar" style="margin-top:14px; grid-template-columns:1.2fr .9fr .9fr .9fr auto;"><input placeholder="订单 ID / 用户券 ID"><select><option>全部权益类型</option><option>现金优惠券</option><option>通钻抵扣券</option></select><select><option>全部业务线</option><option>通钻</option><option>算力</option><option>电影票</option><option>短剧</option></select><select><option>全部核销时间</option><option>今日</option><option>近 7 天</option><option>自定义时间</option></select>${queryButton()}</div>
<section class="panel"><div class="panel-head">核销记录列表</div><table class="data-table"><tr><th>订单 ID</th><th>用户券 ID</th><th>券名称</th><th>权益类型</th><th>业务线 / 使用场景</th><th>实际抵扣</th><th>营销成本</th><th>核销时间</th></tr>${redeemRecordRows()}</table></section>
`);



pages["pages/backend/user-records.html"] = layout("pages/backend/user-records.html", "用户券记录", "用户券记录", `
${pageHead("用户券记录", "仅查询已成功生成的用户券及其后续状态；发放失败请在发放任务明细中查看。", `<button class="btn primary">导出记录</button>`)}
<div class="filter-bar" style="grid-template-columns: 1fr 1fr .9fr .9fr auto;"><input value="用户券 ID / 用户 ID / 手机号"><input value="券名称"><select><option>全部用户券状态</option><option>待使用</option><option>锁定中</option><option>已使用</option><option>已过期</option><option>已作废</option></select><select><option>全部时间</option><option>今日到账</option><option>近 7 天到账</option><option>自定义时间</option></select>${queryButton()}</div>
<section class="panel"><div class="panel-head">用户券记录列表</div><table class="data-table"><tr><th>用户券 ID</th><th>用户 ID</th><th>手机号</th><th>券名称</th><th>用户券状态</th><th>状态原因</th><th>到账时间</th><th>用户券实际有效期</th><th>操作</th></tr>${userCouponListRows()}</table></section>
${modal("voidUserCoupon", "用户券作废确认", `<div class="alert">作废后用户券将立即失效，并释放当前实际预算占用 20.00 元。该操作会写入预算流水和审计记录，并发送作废通知。</div><div class="desc-list"><div class="desc-row"><span>用户券</span><b>UC20260708001</b></div><div class="desc-row"><span>券批次</span><b>CB20260708021 平台通用自动发券</b></div><div class="desc-row"><span>当前有效期</span><b>2026-07-08 至 2026-07-15</b></div></div><textarea data-user-coupon-void-reason placeholder="请输入作废原因，必填"></textarea><div class="inline-error" data-user-coupon-void-error hidden>请填写作废原因后再确认。</div>`, `<button class="btn" data-close-modal>取消</button><button class="btn primary" data-user-coupon-void data-toast="用户券已作废，预算占用已释放">确认作废</button>`)}
`);
for (const coupon of userCouponRecordSamples) pages[`pages/backend/user-coupon-detail-${coupon.slug}.html`] = userCouponDetailPage(coupon);


pages["pages/backend/config.html"] = layout("pages/backend/config.html", "基础规则配置", "基础规则配置", `
${pageHead("基础规则配置", "运营可配置一期平台基础规则。", `<button class="btn primary" data-toast="配置已保存">保存配置</button>`)}
<section class="panel"><div class="panel-head">开放配置项</div><div class="panel-body form-grid"><div class="field"><label>现金最低实付金额</label><input value="0.01 元"><div class="hint">全平台现金券统一使用，不在券批次单独配置。</div></div><div class="field"><label>通钻最低实付数</label><input value="1 通钻"><div class="hint">全平台通钻抵扣券统一使用，不在券批次单独配置。</div></div><div class="field"><label>通钻预算结算汇率</label><input value="10 通钻 = 1 元"><div class="hint">平台统一规则，券批次仅按该规则自动计算预算上限。</div></div><div class="field locked"><label>锁券超时时间</label><input value="30 分钟" disabled><div class="hint">一期固定规则，不支持运营后台修改；锁券成功后以该时长生成交易保护截止时间。</div></div><div class="field"><label>即将过期提醒提前时间</label><input value="1 天"></div><div class="field"><label>单批次库存预警阈值</label><input value="10%"></div></div></section>
`);

pages["pages/app/coupon-center.html"] = layout("pages/app/coupon-center.html", "App 领券中心", "领券中心", `
<div class="app-screen">
  <div class="app-title"><h1>领券中心</h1></div>
  <div class="mini-list">
    <div class="mini-coupon coupon-row"><div class="mini-value"><strong>¥20</strong><span>满99可用</span></div><div class="mini-copy"><b>现金全平台通用券</b><span>适用：通钻购买、算力购买、电影票</span><span>多业务线券不提供统一跳转</span><span class="tag green" data-claim-status>可领取</span></div><button class="btn soft-red" data-claim-coupon data-toast="领取成功">领取</button></div>
  </div>
  <div class="app-empty" data-claim-empty hidden>暂无可领取优惠券</div>
</div>
`, { surface: "app" });

pages["pages/app/my-coupons.html"] = layout("pages/app/my-coupons.html", "App 我的优惠券", "我的优惠券", `
<div class="app-screen">
  <div class="app-title"><h1>我的优惠券</h1></div>
  <div class="app-tabs"><button class="app-tab active" data-app-tab="unused" type="button">待使用</button><button class="app-tab" data-app-tab="used" type="button">已使用</button><button class="app-tab" data-app-tab="invalid" type="button">已失效</button></div>
  <section class="app-panel active" data-app-panel="unused"><div class="mini-list">
    <div class="mini-coupon cash-coupon" data-coupon-variant="cash-pending"><div class="mini-value"><strong>¥20</strong><span>满99可用</span></div><div class="mini-copy"><b>平台通用满减券</b><span>有效期至 2026-07-14 23:59</span><span>全平台通用</span><span class="tag green">待使用</span></div></div>
    <div class="mini-coupon diamond-coupon" data-coupon-variant="diamond-pending"><div class="mini-value"><strong>30</strong><span>通钻最高抵扣</span></div><div class="mini-copy"><b>短剧 8 折通钻券</b><span>满 100 通钻可用</span><span>有效期至 2026-07-20 23:59</span><span>适用范围：短剧全集解锁</span><span class="tag green">待使用</span></div></div>
    <div class="mini-coupon cash-coupon state-using" data-coupon-variant="cash-using"><div class="mini-value"><strong>¥20</strong><span>满99可用</span></div><div class="mini-copy"><b>平台通用满减券</b><span>有效期至 2026-07-14 23:59</span><span>全平台通用</span><span class="tag amber">使用中</span></div></div>
    <div class="mini-coupon diamond-coupon state-using" data-coupon-variant="diamond-using"><div class="mini-value"><strong>30</strong><span>通钻最高抵扣</span></div><div class="mini-copy"><b>短剧 8 折通钻券</b><span>满 100 通钻可用</span><span>有效期至 2026-07-20 23:59</span><span>适用范围：短剧全集解锁</span><span class="tag amber">使用中</span></div></div>
  </div></section>
  <section class="app-panel" data-app-panel="used"><div class="mini-list">
    <div class="mini-coupon cash-coupon invalid" data-coupon-variant="cash-used"><div class="mini-value"><strong>¥20</strong><span>满99可用</span></div><div class="mini-copy"><b>平台通用满减券</b><span>有效期至 2026-07-14 23:59</span><span>全平台通用</span><span class="tag gray">已使用</span></div></div>
    <div class="mini-coupon diamond-coupon invalid" data-coupon-variant="diamond-used"><div class="mini-value"><strong>30</strong><span>通钻最高抵扣</span></div><div class="mini-copy"><b>短剧 8 折通钻券</b><span>满 100 通钻可用</span><span>有效期至 2026-07-20 23:59</span><span>适用范围：短剧全集解锁</span><span class="tag gray">已使用</span></div></div>
  </div></section>
  <section class="app-panel" data-app-panel="invalid"><div class="mini-list">
    <div class="mini-coupon cash-coupon invalid" data-coupon-variant="cash-expired"><div class="mini-value"><strong>¥20</strong><span>满99可用</span></div><div class="mini-copy"><b>平台通用满减券</b><span>有效期至 2026-07-14 23:59</span><span>全平台通用</span><span class="tag gray">已过期</span></div></div>
    <div class="mini-coupon diamond-coupon invalid" data-coupon-variant="diamond-expired"><div class="mini-value"><strong>30</strong><span>通钻最高抵扣</span></div><div class="mini-copy"><b>短剧 8 折通钻券</b><span>满 100 通钻可用</span><span>有效期至 2026-07-20 23:59</span><span>适用范围：短剧全集解锁</span><span class="tag gray">已过期</span></div></div>
    <div class="mini-coupon cash-coupon invalid" data-coupon-variant="cash-voided"><div class="mini-value"><strong>¥20</strong><span>满99可用</span></div><div class="mini-copy"><b>平台通用满减券</b><span>有效期至 2026-07-14 23:59</span><span>全平台通用</span><span class="coupon-invalid">作废原因：活动提前结束</span><span class="tag red">已作废</span></div></div>
    <div class="mini-coupon diamond-coupon invalid" data-coupon-variant="diamond-voided"><div class="mini-value"><strong>30</strong><span>通钻最高抵扣</span></div><div class="mini-copy"><b>短剧 8 折通钻券</b><span>满 100 通钻可用</span><span>有效期至 2026-07-20 23:59</span><span>适用范围：短剧全集解锁</span><span class="coupon-invalid">作废原因：权益配置调整</span><span class="tag red">已作废</span></div></div>
  </div></section>
</div>
`, { surface: "app" });

pages["pages/app/error-states.html"] = layout("pages/app/error-states.html", "App 异常态汇总", "领券中心", `
<div class="app-screen">
  <div class="app-title"><div><h1>异常态汇总</h1><div class="sub">用户侧不暴露预算池和批次预算内部原因</div></div></div>
  <div class="app-empty">领券中心加载失败，请稍后重试</div>
  <div class="app-empty">领取失败，请稍后重试</div>
  <div class="mini-coupon coupon-row"><div class="mini-value"><strong>¥20</strong><span>满99可用</span></div><div class="mini-copy"><b>平台通用满减券</b><span>领取中，按钮禁用</span><span class="tag amber">领取中</span></div><button class="btn" disabled>领取中</button></div>
  <div class="app-empty">暂无可领取优惠券</div>
  <div class="app-empty">暂无已失效优惠券</div>
</div>
`, { surface: "app" });

const readme = `
# 优惠券一期原型交付说明

## 原型说明

本目录为优惠券中台一期静态多页面原型站点，视觉方向为“专业运营后台 + 轻营销 App”。原型覆盖后台侧和 App 侧，包含关键页面、关键状态、审批流程、外部发券场景管理、App 异常态和空态。

一期已覆盖现金优惠券与通钻抵扣券、业务线适用范围、统一人民币预算、业务线试算、锁券，以及人民币支付或通钻扣款成功后核销，形成正向交易闭环。业务线交易页面不属于本原型；退款退券、多券叠加和复杂分摊仍在后续版本。

## 页面清单

入口页：\`index.html\`

后台页面：
- \`pages/backend/budget-pools.html\`：预算池列表
- \`pages/backend/budget-pool-form.html\`：新建预算池
- \`pages/backend/budget-pool-increase-form.html\`：增加预算
- \`pages/backend/budget-pool-detail-pending.html\`：待审核预算池详情
- \`pages/backend/budget-pool-detail.html\`：预算池详情
- \`pages/backend/budget-pool-detail-upcoming.html\`：待开始预算池详情
- \`pages/backend/budget-pool-detail-disabled.html\`：停用预算池详情
- \`pages/backend/budget-pool-detail-ended.html\`：已结束预算池详情
- \`pages/backend/budget-pool-detail-closed.html\`：已关闭预算池详情
- \`pages/backend/coupon-batches.html\`：券批次列表
- \`pages/backend/coupon-batch-form.html\`：新建券批次
- \`pages/backend/coupon-batch-detail-pending.html\`：待审核券批次详情
- \`pages/backend/coupon-batch-detail-upcoming.html\`：待开始券批次详情
- \`pages/backend/coupon-batch-detail.html\`：券批次详情
- \`pages/backend/coupon-batch-detail-external.html\`：外部自动发券进行中详情
- \`pages/backend/coupon-batch-detail-direct.html\`：运营定向发券进行中详情
- \`pages/backend/coupon-batch-detail-disabled.html\`：停用券批次详情
- \`pages/backend/coupon-batch-detail-expired.html\`：过期券批次详情
- \`pages/backend/coupon-batch-detail-voided.html\`：作废券批次详情
- \`pages/backend/approvals.html\`：审批管理
- \`pages/backend/approval-budget-APB20260714001.html\` 至 \`approval-budget-APB20260714004.html\`：预算池审批快照详情
- \`pages/backend/approval-batch-CB20260714001.html\` 至 \`approval-batch-CB20260714009.html\`：券批次审批快照详情
- \`pages/backend/external-scenes.html\`：外部发券场景列表
- \`pages/backend/external-scene-form.html\`：新建外部发券场景
- \`pages/backend/external-scene-edit.html\`：编辑生效中外部发券场景
- \`pages/backend/external-scene-edit-new-user-register.html\`：编辑 7 月新人注册外部发券场景
- \`pages/backend/external-scene-edit-august.html\`：编辑 8 月新人注册外部发券场景
- \`pages/backend/external-scene-edit-disabled.html\`：编辑停用外部发券场景
- \`pages/backend/external-scene-detail.html\`：外部发券场景详情
- \`pages/backend/external-scene-detail-new-user-register.html\`：7 月新人注册外部发券场景详情
- \`pages/backend/external-scene-detail-august.html\`：8 月新人注册外部发券场景详情
- \`pages/backend/external-scene-detail-ended.html\`：已结束外部发券场景详情
- \`pages/backend/external-scene-detail-disabled.html\`：停用外部发券场景详情
- \`pages/backend/issue-tasks.html\`：发放任务
- \`pages/backend/issue-task-form.html\`：新增发放任务
- \`pages/backend/issue-task-detail-T20260708001.html\` 至 \`issue-task-detail-T20260709002.html\`：单条发放任务明细
- \`pages/backend/user-records.html\`：用户券记录
- \`pages/backend/redeem-records.html\`：核销记录
- \`pages/backend/config.html\`：基础规则配置

App 页面：
- \`pages/app/coupon-center.html\`：领券中心
- \`pages/app/my-coupons.html\`：我的优惠券
- \`pages/app/error-states.html\`：App 异常态汇总

## 核心流程

1. 运营创建预算池，录入审批单号和审批图片，提交审核。
2. 审核人通过预算池审核后，预算池按预算周期进入待开始或启用状态。
3. 待开始或启用中的预算池可提交增加预算申请，审批通过后才更新预算池总额。
4. 待开始或启用中的预算池可停用，停用后已关联批次不可继续发券、领券或外部自动发券；停用中的预算池可按预算周期重新恢复为待开始或启用。池下无非终态批次且未结清预算占用为 0 时，可人工关闭；已核销成本和历史流水保留。
5. 运营创建券批次，选择待开始或启用中的预算池，录入审批单号和审批图片。
6. 系统校验理论最大优惠金额、批次预算上限、预算池可分配计划额度和券批次活动时间是否在预算周期内。
7. 运营在创建页通过校验后直接提交审核，并进入审批管理。
8. 审核人通过券批次审核后，券批次按券批次活动时间进入待开始或进行中。
9. 券批次停用后不再领券或发券，已领取券仍按有效期保留；券批次过期后不再领券或发券，并释放未使用计划额度；券批次作废后待使用券置为已作废并释放预算占用。
10. 用户主动领取、运营新增定向发券任务或外部发券场景自动发券。
11. 业务线比较自身活动与平台券；锁券前有效即可，锁券成功后进入 30 分钟交易保护窗口。保护窗口内的支付成功可跨原有效期核销；订单未成功时按原有效期恢复待使用或置为已过期，结果未知时保持锁定中并由技术重试确认。
12. 商品到账、出票和内容解锁等后续处理不作为核销条件；处理失败由业务线退款，特殊客诉由客服定向补券。
13. App 用户在领券中心和我的优惠券的券卡上直接查看优惠券核心信息和交易成功前的使用中状态。

## 后台页面关系与流向

图表源文件：\`diagrams/backend-page-flow.mmd\`

- 增加预算提交后进入审批管理-预算池审批列表；审批通过前预算池总额不变。
- 增加预算仅可从指定预算池的列表或详情入口进入；预算池 ID、名称和成本归属均为只读带入信息，不支持在申请页切换目标预算池。
- 预算池停用/启用为高风险操作，需二次确认并记录审计。
- 预算池关闭必须校验无待审核、待开始、进行中、停用批次和待审核增加预算申请，且未结清预算占用为 0；关闭原因必填，关闭后历史成本与流水仅可查询。
- 除非页面特别说明，后台页面从哪个入口进入，取消、返回和完成操作后就回到哪个入口页面；缺少来源参数时兜底返回对应模块列表。
- 新建券批次在创建页直接提交审核；提交成功后进入审批管理。
- 新增发放任务可从发放任务列表进入，也可从进行中的运营定向发券批次详情进入；取消和生成任务后回到进入前的来源页面。

## 状态说明

审核状态：待审核、审核通过、审核驳回。

预算池业务状态：待开始、启用、停用、已结束、已关闭。

券批次业务状态：待开始、进行中、停用、已过期、已作废。

后台统一“状态”展示：审核未完成时展示待审核或审核驳回；审核通过后展示对应业务状态。

发放任务状态：待执行、执行中、成功、失败、部分失败。

用户券状态：待使用、锁定中、已使用、已过期、已作废。

外部发券场景时间态：未生效、生效中、已结束。时间态由当前时间与生效开始/结束时间派生，不替代启用/停用状态。

## 交互说明

- 审批详情页支持预算池新建审批、增加预算审批、券批次审批的通过、驳回弹窗和审批图片加载失败状态。
- 提交审核、审核通过、确认驳回、保存场景、停用场景、作废批次等关键操作成功后，会先展示 Toast，再跳转回进入该操作前的来源页面。
- 增加预算提交审核后进入审批管理；审批通过后才更新预算池总额。
- 发放任务页支持新增任务、重试 Toast 和单条任务明细查看；一期不提供发放任务明细文件导出或跨任务失败明细。
- 新增发放任务的目标券批次只展示运营定向发券、审核通过、进行中且预算池启用的批次。
- 用户券记录仅展示已生成用户券及其后续状态；发放失败仅在发放任务明细中查看，不重复进入用户券记录。
- 后台列表页和详情页内的表格在小屏下保留完整字段，通过表格区域横向滚动查看，包含操作列的表格会固定最右侧操作列。
- 待开始预算池可提前创建券批次并占用计划额度，但不可实际发券。
- 待开始券批次可提前绑定外部发券场景，但外部调用需等券批次进入进行中且预算池进入启用。
- 外部发券场景详情展示调用参数和幂等规则；绑定券批次只可选择外部自动发券、已审核通过、待开始或进行中的批次。
- 外部发券场景列表展示启停状态和时间态；未生效场景可编辑生效开始/结束时间，生效中场景仅可编辑生效结束时间，已结束场景不允许编辑生效时间和绑定券批次。
- 编辑外部发券场景时，保存需重新校验绑定券批次活动时间、预算池预算周期，以及同一 \`source_system + issue_scene_code\` 下启用配置的生效时间是否重叠。
- 外部发券场景保存失败规则以一期 PRD 为准；原型新建页不单独展示失败示例模块。
- App 领券中心仅展示当前可领取券；领取成功后仅在当前会话标记已领取并禁用按钮，后续进入页面不再展示该券，用户可在我的优惠券查看；券卡直接展示优惠力度、券名称、门槛、有效期、适用范围和状态；支持领取成功 Toast，并展示加载失败、领取失败、领取中按钮禁用和空态。
- App 我的优惠券仅设置待使用、已使用、已失效 3 个 Tab；锁定中券归入待使用 Tab 并展示“使用中”标签，不提供再次使用入口；已失效 Tab 聚合后台已过期和已作废券，已作废券在卡片内直接展示作废原因，不进入独立详情页。
- 后台锁定中用户券详情展示锁券时间和交易保护截止时间；原有效期结束后仍在保护窗口内时，支付成功可完成核销。App 仍仅展示“使用中”，不展示订单处理细节。
- 用户券记录仅对待使用用户券展示“作废”入口；作废原因必填，确认后更新记录状态并提示预算占用已释放。
- App 侧页面在手机外框外提供原型导航，可返回原型首页或运营后台；该入口仅用于原型评审，不属于 App 业务功能。

## 开发注意事项

- 系统内统一展示“审批单号”“审批图片”，不展示外部审批系统名称。
- 后台 B 端列表字段完整性优先；小屏不要删列或压缩字段，使用表格横向滚动与固定操作列承载多字段列表。
- 一期预算池只做额度控制，不做充值、资金账户余额、付款、核销结算或财务对账。
- 预算池待开始时可提前配置券批次和外部场景，但实际发券时必须校验预算池为启用。
- 预算池停用后，该预算池下已关联待开始、进行中批次不可继续发券、领券或外部自动发券；已发用户券和历史记录不删除。
- 外部自动发券按 \`source_system + issue_scene_code\` 匹配场景，不允许外部系统直接传券批次 ID。
- 新建或编辑外部发券场景时，绑定券批次只展示外部自动发券、已审核通过、待开始或进行中的批次；待开始批次用于未来生效配置。
- 同一 \`source_system + issue_scene_code\` 可保留历史或未来配置，但启用且生效的时间区间不得重叠。
- 外部发券幂等键为 \`source_system + issue_scene_code + external_event_id + user_id\`。
- 运营定向发券的指定用户清单只在新增发放任务时录入；券批次创建表单不维护具体用户清单。
- 发放任务只支持针对单条任务查看明细，不提供任务明细文件导出、全局失败记录或跨任务失败明细。
- 预算不足、库存不足、批次停用、批次结束等内部原因不暴露给 App 用户，领券中心直接不展示不可领取券。
- App 一期不提供独立券详情页，用户在券卡内查看优惠券核心信息。

## GitHub Pages 部署说明

将仓库的 GitHub Pages 发布目录设置为 \`prototype/docs/\`。本原型所有页面跳转和资源引用均使用相对路径，可直接通过 \`docs/index.html\` 作为入口访问。
`;

const flow = `
flowchart TD
  A[运营创建预算池] --> B[录入审批单号和审批图片]
  B --> C[提交预算池审核]
  C --> D{预算池审核通过}
  D -- 否 --> E[审核驳回并记录原因]
  E --> B
  D -- 是 --> F[按预算周期进入待开始或启用]
  F --> F1[可提交增加预算审批]
  F1 --> F2{增加预算审核通过}
  F2 -- 是 --> F3[更新预算池总额并记录流水]
  F2 -- 否 --> F
  F --> F4[可停用预算池]
  F4 --> F5[已关联批次暂停继续发券]
  F5 --> F[重新启用后按预算周期恢复状态]
  F --> G[运营创建券批次]
  G --> H[填写券规则/库存/预算上限/活动时间/审批信息]
  H --> I{预算与规则校验通过}
  I -- 否 --> J[不允许提交审核]
  I -- 是 --> K[提交券批次审核]
  K --> L{券批次审核通过}
  L -- 否 --> M[审核驳回并记录原因]
  M --> H
  L -- 是 --> N[发布为待开始或进行中]
  N --> O{批次进行中且预算池启用}
  O -- 否 --> O1[暂不实际发券]
  O -- 是 --> O2[用户领取/运营定向发券/外部场景发券]
  O2 --> P{库存/预算/限制校验通过}
  P -- 否 --> Q[不发券并记录失败原因]
  P -- 是 --> R[生成用户券并占用预算]
  R --> S[App 券卡查券]
  S --> T[业务线试算平台券]
  T --> U{是否命中其他活动}
  U -- 是 --> V[平台券不可用]
  U -- 否 --> W[提交订单并锁券<br/>写入 lock_expire_at]
  W --> X{可信支付成功时间是否在保护窗口内}
  X -- 是 --> Z[核销并按实际抵扣校准预算]
  X -- 否且订单未成功 --> Y{原有效期是否结束}
  Y -- 否 --> Y1[释放锁券并恢复待使用]
  Y -- 是 --> Y2[置为已过期并释放占用]
  X -- 订单结果未知 --> X1[保持锁定中<br/>技术重试与告警]
  X1 --> X
`;

const backendPageFlow = `
flowchart TD
  BudgetList --> BudgetForm[新建预算池]
  BudgetForm -- 取消/提交审核 --> BudgetList
  BudgetList --> BudgetDetail[预算池详情]
  BudgetList --> BudgetIncrease[增加预算]
  BudgetDetail --> BudgetIncrease
  BudgetIncrease -- 取消 --> BudgetList
  BudgetIncrease -- 提交审核 --> ApprovalList
  BudgetDetail -- 返回/操作完成 --> BudgetList

  BatchList --> BatchForm[新建/编辑券批次]
  BatchForm -- 取消 --> BatchList
  BatchForm -- 提交审核 --> ApprovalList
  BatchList --> BatchDetail[券批次详情]
  BatchDetail -- 返回/确认作废 --> BatchList
  BatchDetail --> TaskForm[新增发放任务]

  ApprovalList --> BudgetApproval[预算池审核详情]
  ApprovalList --> BudgetIncreaseApproval[增加预算审核详情]
  ApprovalList --> BatchApproval[券批次审核详情]
  BudgetApproval -- 返回/审核通过/确认驳回 --> ApprovalList
  BudgetIncreaseApproval -- 返回/审核通过/确认驳回 --> ApprovalList
  BatchApproval -- 返回/审核通过/确认驳回 --> ApprovalList

  SceneList --> SceneForm[新建/编辑外部发券场景]
  SceneForm -- 取消/保存场景 --> SceneList
  SceneList --> SceneDetail[外部发券场景详情]
  SceneDetail -- 返回/停用场景 --> SceneList

  TaskList --> TaskForm
  TaskForm -- 取消/提交发放任务 --> TaskList
  TaskForm -- 取消/提交发放任务 --> BatchDetail

`;

write("assets/css/styles.css", css);
write("assets/js/app.js", js);
write("README.md", readme);
write("diagrams/user-flow.mmd", flow);
write("diagrams/backend-page-flow.mmd", backendPageFlow);
delete pages["pages/backend/coupon-batch-confirm.html"];
delete pages["pages/backend/approval-budget-detail.html"];
delete pages["pages/backend/approval-budget-increase-detail.html"];
delete pages["pages/backend/approval-batch-detail.html"];
for (const [file, content] of Object.entries(pages)) {
  write(file, enhanceBackendTables(file, content));
}
for (const file of ["pages/backend/dashboard.html", "pages/backend/notification-templates.html", "pages/backend/coupon-batch-confirm.html", "pages/backend/approval-budget-detail.html", "pages/backend/approval-budget-increase-detail.html", "pages/backend/approval-batch-detail.html", "pages/backend/delivery-exceptions.html", "pages/backend/user-coupon-detail-delivery.html", "pages/backend/user-coupon-detail-invalid.html", "pages/backend/stats.html"]) {
  fs.rmSync(path.join(docs, file), { force: true });
}

console.log(`generated ${Object.keys(pages).length} html pages in ${docs}`);
