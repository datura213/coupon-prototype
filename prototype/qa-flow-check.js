const fs = require("fs");
const path = require("path");

const docsRoot = path.join(__dirname, "docs");

const requiredActions = [
  {
    file: "pages/backend/budget-pool-form.html",
    label: "提交审核",
    target: "../../pages/backend/budget-pools.html",
  },
  {
    file: "pages/backend/budget-pool-increase-form.html",
    label: "提交审核",
    target: "../../pages/backend/approvals.html",
  },
  {
    file: "pages/backend/budget-pool-detail-upcoming.html",
    label: "确认停用",
    target: "../../pages/backend/budget-pools.html",
  },
  {
    file: "pages/backend/coupon-batch-detail-pending.html",
    label: "返回",
    target: "../../pages/backend/coupon-batches.html",
  },
  {
    file: "pages/backend/coupon-batch-detail-upcoming.html",
    label: "确认停用",
    target: "../../pages/backend/coupon-batches.html",
  },
  {
    file: "pages/backend/coupon-batch-detail-upcoming.html",
    label: "确认作废",
    target: "../../pages/backend/coupon-batches.html",
  },
  {
    file: "pages/backend/coupon-batch-detail.html",
    label: "确认停用",
    target: "../../pages/backend/coupon-batches.html",
  },
  {
    file: "pages/backend/coupon-batch-detail.html",
    label: "确认作废",
    target: "../../pages/backend/coupon-batches.html",
  },
  {
    file: "pages/backend/coupon-batch-detail-direct.html",
    label: "新增发放任务",
    target: "../../pages/backend/issue-task-form.html?return=coupon-batch-detail-direct",
  },
  {
    file: "pages/backend/coupon-batch-detail-direct.html",
    label: "返回",
    target: "../../pages/backend/coupon-batches.html",
  },
  {
    file: "pages/backend/coupon-batch-detail-direct.html",
    label: "确认停用",
    target: "../../pages/backend/coupon-batches.html",
  },
  {
    file: "pages/backend/coupon-batch-detail-direct.html",
    label: "确认作废",
    target: "../../pages/backend/coupon-batches.html",
  },
  {
    file: "pages/backend/coupon-batch-detail-disabled.html",
    label: "返回",
    target: "../../pages/backend/coupon-batches.html",
  },
  {
    file: "pages/backend/coupon-batch-detail-disabled.html",
    label: "确认启用",
    target: "../../pages/backend/coupon-batches.html",
  },
  {
    file: "pages/backend/coupon-batch-detail-expired.html",
    label: "返回",
    target: "../../pages/backend/coupon-batches.html",
  },
  {
    file: "pages/backend/coupon-batch-detail-voided.html",
    label: "返回",
    target: "../../pages/backend/coupon-batches.html",
  },
  {
    file: "pages/backend/approval-budget-APB20260714001.html",
    label: "审核通过",
    target: "../../pages/backend/approvals.html",
  },
  {
    file: "pages/backend/approval-budget-APB20260714003.html",
    label: "确认驳回",
    target: "../../pages/backend/approvals.html",
  },
  {
    file: "pages/backend/approval-batch-CB20260714001.html",
    label: "审核通过",
    target: "../../pages/backend/approvals.html",
  },
  {
    file: "pages/backend/approval-batch-CB20260714009.html",
    label: "确认驳回",
    target: "../../pages/backend/approvals.html",
  },
  {
    file: "pages/backend/external-scene-form.html",
    label: "保存场景",
    target: "../../pages/backend/external-scenes.html",
  },
  {
    file: "pages/backend/external-scene-detail.html",
    label: "确认停用",
    target: "../../pages/backend/external-scenes.html",
  },
  {
    file: "pages/backend/issue-tasks.html",
    label: "新增发放任务",
    target: "../../pages/backend/issue-task-form.html?return=issue-tasks",
  },
  {
    file: "pages/backend/issue-task-form.html",
    label: "取消",
    target: "../../pages/backend/issue-tasks.html",
  },
  {
    file: "pages/backend/issue-task-form.html",
    label: "提交发放任务",
    target: "../../pages/backend/issue-tasks.html",
  },
];

const listDetailChecks = [
  {
    source: "pages/backend/budget-pools.html",
    href: "../../pages/backend/budget-pool-detail-pending.html?return=budget-pools",
    detail: "pages/backend/budget-pool-detail-pending.html",
    values: ["BP20260707001", "平台通用营销预算池", "2026-07-10 至 2026-08-31", "500,000.00", "0.00", "待审核"],
  },
  {
    source: "pages/backend/budget-pools.html",
    href: "../../pages/backend/budget-pool-detail-upcoming.html?return=budget-pools",
    detail: "pages/backend/budget-pool-detail-upcoming.html",
    values: ["BP20260709002", "8 月新人预算池", "2026-08-01 至 2026-08-31", "300,000.00", "120,000.00", "0.00", "待开始"],
  },
  {
    source: "pages/backend/budget-pools.html",
    href: "../../pages/backend/budget-pool-detail.html?return=budget-pools",
    detail: "pages/backend/budget-pool-detail.html",
    values: ["BP20260701009", "平台通用预算池", "2026-07-10 至 2026-08-31", "800,000.00", "720,000.00", "304,500.00", "启用"],
  },
  {
    source: "pages/backend/budget-pools.html",
    href: "../../pages/backend/budget-pool-detail-disabled.html?return=budget-pools",
    detail: "pages/backend/budget-pool-detail-disabled.html",
    values: ["BP20260628003", "平台通用预算池", "2026-06-01 至 2026-08-15", "120,000.00", "50,000.00", "32,000.00", "停用"],
  },
  {
    source: "pages/backend/budget-pools.html",
    href: "../../pages/backend/budget-pool-detail-ended.html?return=budget-pools",
    detail: "pages/backend/budget-pool-detail-ended.html",
    values: ["BP20260501001", "5 月活动预算池", "2026-05-01 至 2026-05-31", "200,000.00", "0.00", "已结束"],
  },
  {
    source: "pages/backend/coupon-batches.html",
    href: "../../pages/backend/coupon-batch-detail-pending.html?return=coupon-batches",
    detail: "pages/backend/coupon-batch-detail-pending.html",
    values: ["CB20260707001", "平台通用满减券", "固定抵扣券", "平台通用预算池", "120,000.00", "外部自动发券", "2026-07-10 至 2026-08-31", "领取后 7 天", "APR-20260707-1842", "待审核"],
  },
  {
    source: "pages/backend/coupon-batches.html",
    href: "../../pages/backend/coupon-batch-detail-upcoming.html?return=coupon-batches",
    detail: "pages/backend/coupon-batch-detail-upcoming.html",
    values: ["CB20260725001", "8 月新人自动发券", "固定抵扣券", "8 月新人预算池", "120,000.00", "外部自动发券", "2026-08-01 至 2026-08-31", "领取后 7 天", "APR-20260725-1008", "待开始"],
  },
  {
    source: "pages/backend/coupon-batches.html",
    href: "../../pages/backend/coupon-batch-detail.html?return=coupon-batches",
    detail: "pages/backend/coupon-batch-detail.html",
    values: ["CB20260701011", "平台通用满减券", "固定抵扣券", "平台通用预算池", "300,000.00", "用户主动领取", "2026-07-10 至 2026-08-31", "领取后 7 天", "APR-20260701-2014", "进行中"],
  },
  {
    source: "pages/backend/coupon-batches.html",
    href: "../../pages/backend/coupon-batch-detail-external.html?return=coupon-batches",
    detail: "pages/backend/coupon-batch-detail-external.html",
    values: ["CB20260708021", "平台通用自动发券", "固定抵扣券", "平台通用营销预算池", "180,000.00", "外部自动发券", "2026-07-08 至 2026-08-31", "领取后 7 天", "APR-20260708-1530", "进行中"],
  },
  {
    source: "pages/backend/coupon-batches.html",
    href: "../../pages/backend/coupon-batch-detail-direct.html?return=coupon-batches",
    detail: "pages/backend/coupon-batch-detail-direct.html",
    values: ["CB20260709015", "平台定向补贴券", "固定抵扣券", "平台通用预算池", "90,000.00", "运营定向发券", "2026-07-09 至 2026-08-31", "领取后 7 天", "APR-20260709-0920", "进行中"],
  },
  {
    source: "pages/backend/coupon-batches.html",
    href: "../../pages/backend/coupon-batch-detail-disabled.html?return=coupon-batches",
    detail: "pages/backend/coupon-batch-detail-disabled.html",
    values: ["CB20260618015", "平台通用满减券", "固定抵扣券", "平台通用预算池", "50,000.00", "用户主动领取", "2026-06-18 至 2026-07-15", "领取后 5 天", "停用"],
  },
  {
    source: "pages/backend/coupon-batches.html",
    href: "../../pages/backend/coupon-batch-detail-expired.html?return=coupon-batches",
    detail: "pages/backend/coupon-batch-detail-expired.html",
    values: ["CB20260612018", "平台通用满减券", "固定抵扣券", "平台通用预算池", "40,000.00", "用户主动领取", "2026-06-12 至 2026-06-30", "已过期"],
  },
  {
    source: "pages/backend/coupon-batches.html",
    href: "../../pages/backend/coupon-batch-detail-voided.html?return=coupon-batches",
    detail: "pages/backend/coupon-batch-detail-voided.html",
    values: ["CB20260610007", "平台通用折扣券", "折扣券", "平台通用预算池", "60,000.00", "运营定向发券", "2026-06-10 至 2026-07-20", "领取后 10 天", "已作废"],
  },
  {
    source: "pages/backend/approvals.html",
    href: "../../pages/backend/approval-batch-CB20260714001.html?return=approvals&tab=batch",
    detail: "pages/backend/approval-batch-CB20260714001.html",
    values: ["CB20260714001", "现金全平台固定券", "平台通用营销预算池", "外部系统自动发券", "APC20260714001"],
  },
  {
    source: "pages/backend/external-scenes.html",
    href: "../../pages/backend/external-scene-detail.html?return=external-scenes",
    detail: "pages/backend/external-scene-detail.html",
    values: ["平台系统（platform_system）", "coupon_issue_standard", "通用发券场景", "CB20260708021", "启用", "生效中", "2026-07-08 至 2026-08-31", "成功"],
  },
  {
    source: "pages/backend/external-scenes.html",
    href: "../../pages/backend/external-scene-detail-new-user-register.html?return=external-scenes",
    detail: "pages/backend/external-scene-detail-new-user-register.html",
    values: ["增长系统（growth_system）", "new_user_register_202607", "7 月新人注册自动发券", "CB20260708021", "启用", "未生效", "2026-07-10 至 2026-08-31"],
  },
  {
    source: "pages/backend/external-scenes.html",
    href: "../../pages/backend/external-scene-detail-august.html?return=external-scenes",
    detail: "pages/backend/external-scene-detail-august.html",
    values: ["增长系统（growth_system）", "new_user_august_202608", "8 月新人注册自动发券", "CB20260725001", "启用", "未生效", "2026-08-01 至 2026-08-31"],
  },
  {
    source: "pages/backend/external-scenes.html",
    href: "../../pages/backend/external-scene-detail-ended.html?return=external-scenes",
    detail: "pages/backend/external-scene-detail-ended.html",
    values: ["增长系统（growth_system）", "june_user_register_202606", "6 月新人注册自动发券", "CB20260612018", "启用", "已结束", "2026-06-01 至 2026-06-30", "成功"],
  },
  {
    source: "pages/backend/external-scenes.html",
    href: "../../pages/backend/external-scene-detail-disabled.html?return=external-scenes",
    detail: "pages/backend/external-scene-detail-disabled.html",
    values: ["增长系统（growth_system）", "profile_completed_202607", "7 月完善资料自动发券", "CB20260707011", "停用", "未生效", "2026-07-10 至 2026-08-31"],
  },
];

function readDoc(relativeFile) {
  return fs.readFileSync(path.join(docsRoot, relativeFile), "utf8");
}

function readPrd() {
  return fs.readFileSync(path.join(__dirname, "..", "优惠券中台一期PRD.md"), "utf8");
}

function normalizeText(value) {
  return value.replace(/<[^>]+>/g, "").replace(/\s+/g, "");
}

function findControlByLabel(html, label) {
  const controlPattern = /<(a|button|span)\b([^>]*)>([\s\S]*?)<\/\1>/g;
  let match;

  while ((match = controlPattern.exec(html))) {
    if (normalizeText(match[3]) === label) {
      return { tag: match[1], attrs: match[2], html: match[0] };
    }
  }

  return null;
}

function targetExists(fromFile, target) {
  const targetPath = target.split("#")[0].split("?")[0];
  const absoluteTarget = path.normalize(path.join(docsRoot, path.dirname(fromFile), targetPath));
  return absoluteTarget.startsWith(docsRoot) && fs.existsSync(absoluteTarget);
}

function normalizedIncludes(html, expectedValue) {
  return normalizeText(html).includes(normalizeText(expectedValue));
}

const errors = [];

for (const action of requiredActions) {
  const html = readDoc(action.file);
  const control = findControlByLabel(html, action.label);

  if (!control) {
    errors.push(`${action.file}: 未找到操作「${action.label}」`);
    continue;
  }

  const expectedRedirect = `data-redirect="${action.target}"`;
  const expectedReturnRedirect = `data-return-redirect="${action.target}"`;
  const expectedHref = `href="${action.target}"`;

  if (!control.attrs.includes(expectedRedirect) && !control.attrs.includes(expectedReturnRedirect) && !control.attrs.includes(expectedHref)) {
    errors.push(`${action.file}: 操作「${action.label}」缺少目标 ${action.target}`);
  }

  if (!targetExists(action.file, action.target)) {
    errors.push(`${action.file}: 操作「${action.label}」目标文件不存在 ${action.target}`);
  }
}

for (const check of listDetailChecks) {
  const sourceHtml = readDoc(check.source);

  if (!sourceHtml.includes(`href="${check.href}"`)) {
    errors.push(`${check.source}: 缺少指向对应详情页的入口 ${check.href}`);
  }

  if (!targetExists(check.source, check.href)) {
    errors.push(`${check.source}: 对应详情页目标不存在 ${check.href}`);
    continue;
  }

  const detailHtml = readDoc(check.detail);
  for (const value of check.values) {
    if (!normalizedIncludes(detailHtml, value)) {
      errors.push(`${check.detail}: 详情页缺少列表字段值「${value}」`);
    }
  }
}

for (const file of fs.readdirSync(path.join(docsRoot, "pages/backend"))) {
  if (!file.endsWith(".html")) continue;

  const relativeFile = `pages/backend/${file}`;
  const html = readDoc(relativeFile);
  const tableCount = (html.match(/<table class="[^"]*\bdata-table\b[^"]*"/g) || []).length;
  const tableScrollCount = (html.match(/<div class="table-scroll"/g) || []).length;

  if (tableCount !== tableScrollCount) {
    errors.push(`${relativeFile}: 后台表格滚动容器数量不匹配，table=${tableCount} scroll=${tableScrollCount}`);
  }

  const attributes = [...html.matchAll(/\b(?:href|data-redirect|data-return-redirect)="([^"]+)"/g)];

  for (const [, target] of attributes) {
    if (/^(https?:|mailto:|tel:|#)/.test(target)) continue;
    if (!targetExists(relativeFile, target)) {
      errors.push(`${relativeFile}: 链接或跳转目标不存在 ${target}`);
    }
  }
}

for (const file of fs.readdirSync(path.join(docsRoot, "pages/backend"))) {
  if (!file.endsWith(".html")) continue;

  const relativeFile = `pages/backend/${file}`;
  const html = readDoc(relativeFile);
  if (/固定日期|固定有效日期|固定有效期/.test(html)) {
    errors.push(`${relativeFile}: 券有效期不应使用“固定日期”口径，应展示时间区间或领取后 N 天`);
  }
}

if (!fs.existsSync(path.join(docsRoot, "diagrams/backend-page-flow.mmd"))) {
  errors.push("diagrams/backend-page-flow.mmd: 缺少后台页面关系图源文件");
}

const budgetPoolsHtml = readDoc("pages/backend/budget-pools.html");
const externalScenesHtml = readDoc("pages/backend/external-scenes.html");
const diamondBatchDetailHtml = readDoc("pages/backend/coupon-batch-detail-diamond.html");
const expiredBatchDetailHtml = readDoc("pages/backend/coupon-batch-detail-expired.html");
const generatorSource = fs.readFileSync(path.join(__dirname, "build-prototype.js"), "utf8");
if (!externalScenesHtml.includes("时间态") || !externalScenesHtml.includes("未生效") || !externalScenesHtml.includes("生效中") || !externalScenesHtml.includes("已结束")) {
  errors.push("pages/backend/external-scenes.html: 缺少外部发券场景时间态展示");
}
if (!expiredBatchDetailHtml.includes("当前实际占用</span><b>0.00 元</b>") || !expiredBatchDetailHtml.includes("<span>当前实际占用</span><strong>0</strong>")) {
  errors.push("pages/backend/coupon-batch-detail-expired.html: 已过期批次的当前实际占用应统一为 0");
}
if (expiredBatchDetailHtml.includes("当前实际占用</span><b>2,600") || expiredBatchDetailHtml.includes("<span>当前实际占用</span><strong>2,600</strong>")) {
  errors.push("pages/backend/coupon-batch-detail-expired.html: 不应保留与过期状态冲突的当前实际占用 2,600");
}
for (const [file, audience] of [
  ["pages/backend/approval-batch-CB20260714003.html", "按用户分群：所有"],
  ["pages/backend/approval-batch-CB20260714004.html", "按用户 ID：上传清单"],
  ["pages/backend/approval-batch-CB20260714007.html", "按用户 ID：手动录入"],
]) {
  const html = readDoc(file);
  if (!html.includes("领取对象") || !html.includes(audience)) {
    errors.push(`${file}: 用户主动领取审批快照应展示领取对象「${audience}」`);
  }
}
for (const file of ["pages/backend/budget-pools.html", "pages/backend/coupon-batches.html", "pages/backend/approvals.html", "pages/backend/external-scenes.html", "pages/backend/redeem-records.html", "pages/backend/user-records.html"]) {
  if (!readDoc(file).includes("data-list-filter-action")) {
    errors.push(`${file}: 列表查询按钮缺少通用筛选交互标识`);
  }
}
if (!readDoc("assets/js/app.js").includes("function applyListFilter")) {
  errors.push("assets/js/app.js: 缺少通用列表筛选交互");
}
if (/pages\["pages\/backend\/coupon-batch-confirm\.html"\]\s*=/.test(generatorSource)) {
  errors.push("prototype/build-prototype.js: 不应保留已废弃的券批次提交审核确认页定义");
}

const externalSceneEditChecks = [
  {
    file: "pages/backend/external-scene-edit.html",
    values: ["平台系统（platform_system）", "coupon_issue_standard", "通用发券场景", "生效中", "启停状态", "2026-07-08 00:00"],
    forbidden: ["生效时间编辑限制", "<label>场景状态</label>"],
    disabledStart: "value=\"2026-07-08 00:00\" disabled",
  },
  {
    file: "pages/backend/external-scene-edit-new-user-register.html",
    values: ["增长系统（growth_system）", "new_user_register_202607", "7 月新人注册自动发券", "未生效", "启停状态", "2026-07-10 00:00"],
    forbidden: ["生效时间编辑限制", "<label>场景状态</label>", "value=\"2026-07-10 00:00\" disabled"],
  },
  {
    file: "pages/backend/external-scene-edit-august.html",
    values: ["增长系统（growth_system）", "new_user_august_202608", "8 月新人注册自动发券", "未生效", "启停状态", "2026-08-01 00:00"],
    forbidden: ["生效时间编辑限制", "<label>场景状态</label>", "value=\"2026-08-01 00:00\" disabled"],
  },
  {
    file: "pages/backend/external-scene-edit-disabled.html",
    values: ["增长系统（growth_system）", "profile_completed_202607", "7 月完善资料自动发券", "未生效", "启停状态", "2026-07-10 00:00", "<option selected>停用</option>"],
    forbidden: ["生效时间编辑限制", "<label>场景状态</label>"],
  },
];

for (const check of externalSceneEditChecks) {
  const html = readDoc(check.file);
  for (const value of check.values) {
    if (!html.includes(value)) {
      errors.push(`${check.file}: 缺少编辑页字段或状态「${value}」`);
    }
  }
  for (const value of check.forbidden) {
    if (html.includes(value)) {
      errors.push(`${check.file}: 不应展示或保留「${value}」`);
    }
  }
  if (check.disabledStart && !html.includes(check.disabledStart)) {
    errors.push(`${check.file}: 生效中场景的生效开始时间应置灰不可编辑`);
  }
}

const styles = readDoc("assets/css/styles.css");
if (!styles.includes(".backend-surface .table-scroll::before") || !styles.includes(".action-table th:last-child")) {
  errors.push("assets/css/styles.css: 缺少后台小屏表格滚动提示或固定操作列样式");
}

const issueTaskFormHtml = readDoc("pages/backend/issue-task-form.html");
for (const value of ["任务名称", "提交发放任务"]) {
  if (!issueTaskFormHtml.includes(value)) {
    errors.push(`pages/backend/issue-task-form.html: 缺少直接提交任务字段或操作「${value}」`);
  }
}
for (const value of ["预校验", "提交说明", "确认生成任务", "data-precheck-action"]) {
  if (issueTaskFormHtml.includes(value)) {
    errors.push(`pages/backend/issue-task-form.html: 不应保留已取消内容「${value}」`);
  }
}
if (issueTaskFormHtml.includes("审核驳回") || issueTaskFormHtml.includes("不可选")) {
  errors.push("pages/backend/issue-task-form.html: 目标券批次只能展示审核通过且进行中的运营定向发券批次");
}

const externalSceneFormHtml = readDoc("pages/backend/external-scene-form.html");
if (externalSceneFormHtml.includes("保存失败状态示例")) {
  errors.push("pages/backend/external-scene-form.html: 保存失败规则不应作为原型内独立示例模块展示");
}
for (const value of ["nav-count", "系统设置", "class=\"nav-item app-link\""]) {
  if (externalScenesHtml.includes(value)) errors.push(`pages/backend/external-scenes.html: 不应展示侧边栏元素「${value}」`);
}
for (const value of ["topbar-links", "原型首页", "App 侧原型"]) {
  if (!externalScenesHtml.includes(value)) errors.push(`pages/backend/external-scenes.html: 缺少顶部原型导航「${value}」`);
}
const issueTasksHtml = readDoc("pages/backend/issue-tasks.html");
const issueTaskDetailIds = ["T20260709001", "T20260709002", "T20260708001", "T20260708002", "T20260708003", "T20260708004", "T20260708005", "T20260708006", "T20260708007"];
for (const id of issueTaskDetailIds) {
  const detailFile = `pages/backend/issue-task-detail-${id}.html`;
  if (!fs.existsSync(path.join(docsRoot, detailFile))) errors.push(`发放任务: 缺少任务明细页「${id}」`);
}
if (issueTasksHtml.includes("导出明细")) errors.push("pages/backend/issue-tasks.html: 一期不应提供任务明细导出");
for (const value of ["查看明细", "issue-task-detail-T20260709001.html", "issue-task-detail-T20260708007.html"]) {
  if (!issueTasksHtml.includes(value)) errors.push(`pages/backend/issue-tasks.html: 缺少任务明细入口「${value}」`);
}
for (const value of ["任务名称", "业务调用事件 ID", "data-issue-task-keyword", "data-issue-task-trigger", "data-issue-task-status", "data-issue-task-batch"]) {
  if (!issueTasksHtml.includes(value)) errors.push(`pages/backend/issue-tasks.html: 缺少任务字段或筛选项「${value}」`);
}
for (const value of ["任务类型", "发放对象类型"]) {
  if (issueTasksHtml.includes(value)) errors.push(`pages/backend/issue-tasks.html: 不应展示无运营价值字段「${value}」`);
}
const issueTaskDetailHtml = readDoc("pages/backend/issue-task-detail-T20260709001.html");
for (const value of ["发放明细 ID", "任务名称", "明细状态", "失败原因", "重试次数", "最近重试时间", "data-issue-detail-keyword", "data-issue-detail-status", "data-issue-detail-retry"]) {
  if (!issueTaskDetailHtml.includes(value)) errors.push(`发放任务明细页: 缺少字段「${value}」`);
}
const directTaskDetailHtml = readDoc("pages/backend/issue-task-detail-T20260709001.html");
if (directTaskDetailHtml.includes("业务调用事件 ID")) {
  errors.push("运营主动发券任务明细页: 不应展示业务调用事件 ID");
}
for (const value of ["任务类型", "发放对象类型", "执行汇总", "<th>券批次 ID</th>", "<th>券名称</th>"]) {
  if (directTaskDetailHtml.includes(value)) errors.push(`运营主动发券任务明细页: 不应展示重复或无运营价值字段「${value}」`);
}
if (!directTaskDetailHtml.includes("目标券批次") || !directTaskDetailHtml.includes("CB20260709015 平台定向补贴券")) {
  errors.push("运营主动发券任务明细页: 应在任务信息中展示目标券批次 ID 和名称");
}
for (const value of ["券有效期规则", "用户券实际有效期", "2026-07-09 10:20 至 2026-07-16 23:59"]) {
  if (!directTaskDetailHtml.includes(value)) errors.push(`运营主动发券任务明细页: 缺少有效期展示「${value}」`);
}
if (directTaskDetailHtml.includes("<td>领取后 7 天</td>")) {
  errors.push("运营主动发券任务明细页: 实际有效期列不应展示券规则文案");
}
if (!directTaskDetailHtml.includes('data-detail-retry="是"') || !directTaskDetailHtml.includes('<td>1</td><td>2026-07-09 10:28</td>')) {
  errors.push("运营主动发券任务明细页: 应包含已重试明细的次数和最近重试时间演示");
}
if (!directTaskDetailHtml.includes('data-detail-retry="否"') || !directTaskDetailHtml.includes('<td>0</td><td>-</td>')) {
  errors.push("运营主动发券任务明细页: 应包含未重试明细的次数和最近重试时间演示");
}
const directDetailTable = directTaskDetailHtml.match(/<table[^>]*><tr>([\s\S]*?)<\/tr><tr data-issue-detail-row[^>]*>([\s\S]*?)<\/tr>/);
if (!directDetailTable) {
  errors.push("运营主动发券任务明细页: 缺少发放明细表头或首条明细");
} else {
  const headerCount = (directDetailTable[1].match(/<th\b/g) || []).length;
  const cellCount = (directDetailTable[2].match(/<td\b/g) || []).length;
  if (headerCount !== cellCount) {
    errors.push(`运营主动发券任务明细页: 表头 ${headerCount} 列与首条明细 ${cellCount} 列不一致`);
  }
}
const externalTaskDetailHtml = readDoc("pages/backend/issue-task-detail-T20260708001.html");
if (!externalTaskDetailHtml.includes("业务调用事件 ID") || !externalTaskDetailHtml.includes("standard_20260708_0001")) {
  errors.push("外部接口调用任务明细页: 缺少业务调用事件 ID 及其入参值");
}
const allDetailRows = (readDoc("pages/backend/issue-task-detail-T20260708003.html").match(/data-issue-detail-row/g) || []).length;
if (allDetailRows !== 820) {
  errors.push(`发放任务明细页: T20260708003 应展示全部 820 条发放明细，当前为 ${allDetailRows} 条`);
}

const userRecordsHtml = readDoc("pages/backend/user-records.html");
for (const value of ["用户券记录", "用户券 ID", "用户券状态", "状态原因", "到账时间", "用户券实际有效期", "user-coupon-detail-available.html"]) {
  if (!userRecordsHtml.includes(value)) {
    errors.push(`pages/backend/user-records.html: 缺少用户券记录字段「${value}」`);
  }
}
for (const value of ["<th>关联任务 ID</th>", "<th>券批次 ID</th>", "<th>发放/领取方式</th>"]) {
  if (userRecordsHtml.includes(value)) {
    errors.push(`pages/backend/user-records.html: 列表不应展示详情字段「${value}」`);
  }
}
for (const value of ["待使用", "锁定中", "已使用", "已过期", "已作废"]) {
  if (!userRecordsHtml.includes(value)) {
    errors.push(`pages/backend/user-records.html: 缺少用户券状态示例或状态原因「${value}」`);
  }
}
if (userRecordsHtml.includes("<option>已失效</option>")) {
  errors.push("pages/backend/user-records.html: 后台用户券状态筛选不应包含已失效");
}
for (const value of ["发放结果", "全部发放结果", "外部发券场景未生效", "用户已达到同批次限领"]) {
  if (userRecordsHtml.includes(value)) {
    errors.push(`pages/backend/user-records.html: 不得重复展示失败任务内容「${value}」`);
  }
}
for (const slug of ["available", "locked", "used", "expired", "voided"]) {
  const detailFile = `pages/backend/user-coupon-detail-${slug}.html`;
  if (!fs.existsSync(path.join(docsRoot, detailFile))) errors.push(`用户券记录: 缺少详情页「${slug}」`);
}
if (fs.existsSync(path.join(docsRoot, "pages/backend/user-coupon-detail-invalid.html"))) {
  errors.push("用户券记录: 不应保留已失效用户券详情页");
}
const lockedCouponDetailHtml = readDoc("pages/backend/user-coupon-detail-locked.html");
for (const value of ["用户券基础与有效期信息", "权益类型", "券面规则", "适用范围", "状态信息", "状态原因", "关联任务 ID", "券批次 ID", "发放/领取方式", "订单信息", "订单状态", "支付状态", "通钻商品包", "券分摊优惠", "商品金额合计", "平台营销成本"]) {
  if (!lockedCouponDetailHtml.includes(value)) errors.push(`用户券详情页: 缺少详情字段「${value}」`);
}
if (lockedCouponDetailHtml.includes('class="grid-2"')) {
  errors.push("用户券详情页: 信息模块必须纵向排列，不应使用双列布局");
}
if (lockedCouponDetailHtml.includes("状态说明")) {
  errors.push("用户券详情页: 状态信息不应展示状态说明字段");
}
if (lockedCouponDetailHtml.includes("权益交付状态")) {
  errors.push("用户券详情页: 不应展示独立的业务处理状态字段");
}
if (!lockedCouponDetailHtml.includes("状态原因</span><b>-</b>")) {
  errors.push("用户券详情页: 非终态用户券的状态原因应展示为 -");
}
for (const [file, reason] of [["pages/backend/user-coupon-detail-expired.html", "自然过期"], ["pages/backend/user-coupon-detail-voided.html", "后台作废：活动提前结束"]]) {
  const detailHtml = readDoc(file);
  if (!detailHtml.includes("状态原因") || !detailHtml.includes(reason)) {
    errors.push(`用户券详情页: ${file} 应展示状态原因「${reason}」`);
  }
}
for (const [file, values] of [["pages/backend/user-coupon-detail-used.html", ["订单信息", "短剧 / 短剧全集解锁", "已完成", "已扣除通钻", "《夏夜回声》全集", "-30 通钻", "商品金额合计", "3.00 元（已确认）"]]]) {
  const detailHtml = readDoc(file);
  for (const value of values) {
    if (!detailHtml.includes(value)) errors.push(`用户券详情页: ${file} 缺少字段「${value}」`);
  }
}
for (const file of ["pages/backend/user-coupon-detail-available.html", "pages/backend/user-coupon-detail-expired.html", "pages/backend/user-coupon-detail-voided.html"]) {
  const detailHtml = readDoc(file);
  if (detailHtml.includes('<div class="panel-head">订单信息</div>') || detailHtml.includes("商品金额合计")) {
    errors.push(`用户券详情页: ${file} 不应展示空订单模块`);
  }
}
if (!userRecordsHtml.includes('data-open-modal="#voidUserCoupon"') || !userRecordsHtml.includes("用户券作废确认")) {
  errors.push("pages/backend/user-records.html: 待使用用户券缺少作废入口或确认弹窗");
}
if (!userRecordsHtml.includes("作废原因，必填") || !userRecordsHtml.includes("释放当前实际预算占用")) {
  errors.push("pages/backend/user-records.html: 用户券作废缺少原因必填或预算释放说明");
}

const couponCenterHtml = readDoc("pages/app/coupon-center.html");
const myCouponsHtml = readDoc("pages/app/my-coupons.html");
const errorStatesHtml = readDoc("pages/app/error-states.html");
if (couponCenterHtml.includes("加载失败")) {
  errors.push("pages/app/coupon-center.html: 正常领券中心不应与加载失败态同时展示");
}
if (couponCenterHtml.includes("已领取")) {
  errors.push("pages/app/coupon-center.html: 初始领券中心不应展示已领取券");
}
if (!couponCenterHtml.includes("data-claim-coupon")) {
  errors.push("pages/app/coupon-center.html: 可领取券缺少当前会话领取反馈交互标识");
}
const appScript = readDoc("assets/js/app.js");
if (!appScript.includes("coupon-center-claimed") || !couponCenterHtml.includes("data-claim-empty")) {
  errors.push("pages/app/coupon-center.html: 领取后刷新应隐藏已领取券并展示空态");
}
if (!myCouponsHtml.includes('data-app-tab="unused"') || !myCouponsHtml.includes('data-app-tab="invalid"')) {
  errors.push("pages/app/my-coupons.html: 缺少待使用和已失效 Tab 交互标识");
}
if (!myCouponsHtml.includes('data-app-panel="unused"') || !myCouponsHtml.includes('data-app-panel="invalid"')) {
  errors.push("pages/app/my-coupons.html: 缺少与 Tab 对应的互斥内容区");
}
if (myCouponsHtml.includes('<span class="tag red">已失效</span>') || !myCouponsHtml.includes('<span class="tag red">已作废</span>')) {
  errors.push("pages/app/my-coupons.html: 已失效 Tab 应聚合已过期和已作废，不应展示已失效状态");
}
const invalidCouponPanel = myCouponsHtml.split('data-app-panel="invalid"')[1]?.split("</section>")[0] || "";
if (!invalidCouponPanel.includes('<span class="tag gray">已过期</span>') || !invalidCouponPanel.includes('<span class="tag red">已作废</span>')) {
  errors.push("pages/app/my-coupons.html: 已失效 Tab 应同时展示已过期和已作废券卡");
}
for (const variant of ["cash-voided", "diamond-voided"]) {
  const cardStart = myCouponsHtml.indexOf(`data-coupon-variant="${variant}"`);
  const cardEnd = myCouponsHtml.indexOf("</div></div>", cardStart);
  const voidedCard = cardStart < 0 || cardEnd < 0 ? "" : myCouponsHtml.slice(cardStart, cardEnd);
  if (!voidedCard.includes("作废原因：")) {
    errors.push(`pages/app/my-coupons.html: ${variant} 卡应直接展示作废原因`);
  }
}
for (const tab of ['data-app-tab="unused"', 'data-app-tab="used"', 'data-app-tab="invalid"']) {
  if (!myCouponsHtml.includes(tab)) {
    errors.push(`pages/app/my-coupons.html: 缺少三 Tab 规则要求的 ${tab}`);
  }
}
if (myCouponsHtml.includes('data-app-tab="using"')) {
  errors.push("pages/app/my-coupons.html: 使用中不得作为独立 Tab");
}
if (myCouponsHtml.includes('订单处理中') || myCouponsHtml.includes('短剧全集已解锁')) {
  errors.push("pages/app/my-coupons.html: 使用中和已使用券卡不应展示订单处理或履约结果文案");
}
if (!myCouponsHtml.includes('使用中') || !myCouponsHtml.includes('已使用')) {
  errors.push("pages/app/my-coupons.html: 应展示使用中和已使用状态标签");
}
const appCouponVariants = [
  "cash-pending", "diamond-pending", "cash-using", "diamond-using",
  "cash-used", "diamond-used", "cash-expired", "diamond-expired",
  "cash-voided", "diamond-voided",
];
for (const variant of appCouponVariants) {
  if (!myCouponsHtml.includes(`data-coupon-variant="${variant}"`)) {
    errors.push(`pages/app/my-coupons.html: 缺少「${variant}」权益与状态组合卡片`);
  }
}
for (const selector of [
  ".mini-coupon.cash-coupon",
  ".mini-coupon.diamond-coupon",
  ".mini-coupon.state-using",
  ".mini-coupon.invalid .mini-value",
]) {
  if (!styles.includes(selector)) {
    errors.push(`assets/css/styles.css: 缺少用户券状态与权益类型的视觉样式「${selector}」`);
  }
}
for (const value of ['满 100 通钻可用', '有效期至 2026-07-20 23:59', '适用范围：短剧全集解锁']) {
  const occurrences = (myCouponsHtml.match(new RegExp(value, 'g')) || []).length;
  if (occurrences < 2) errors.push(`pages/app/my-coupons.html: 使用中和已使用券卡应共享固定信息「${value}」`);
}
if (!errorStatesHtml.includes("加载失败") || !errorStatesHtml.includes("领取失败") || !errorStatesHtml.includes("暂无可领取优惠券")) {
  errors.push("pages/app/error-states.html: 缺少一期 App 异常态覆盖");
}

const firstPhasePrd = readPrd();
if (!firstPhasePrd.includes("当前状态、状态更新时间、状态原因；状态原因仅展示已过期的自然过期原因或已作废的作废原因，其他状态展示“-”；系统数据修正原因仅在审计日志中查看")) {
  errors.push("优惠券中台一期PRD.md: 用户券详情应明确状态原因的展示边界");
}
for (const value of ["| 已失效 | 已过期 | 已过期 |", "| 已失效 | 已作废 | 已作废，展示作废原因 |"]) {
  if (!firstPhasePrd.includes(value)) errors.push(`优惠券中台一期PRD.md: App 状态映射应使用真实券状态「${value}」`);
}
for (const value of ["核销记录仅展示已成功核销的事实", "订单 ID 或用户券 ID", "不提供新增、操作按钮、处理结果字段或独立核销详情页", "用户券 ID 与核销记录为一对一关系"]) {
  if (!firstPhasePrd.includes(value)) errors.push(`优惠券中台一期PRD.md: 核销记录规则缺少「${value}」`);
}
for (const value of ["通钻抵扣券", "人民币支付成功", "通钻扣款成功", "不作为优惠券核销条件", "平台优惠券不可与其他活动叠加", "一期不支持退款退券"]) {
  if (!firstPhasePrd.includes(value)) {
    errors.push(`优惠券中台一期PRD.md: 缺少交易闭环规则「${value}」`);
  }
}

const couponBatchFormHtml = readDoc("pages/backend/coupon-batch-form.html");
for (const value of ["权益类型", "关联预算池", "成本归属", "全平台通用", "指定业务线", "通钻购买", "算力购买", "电影票购买", "短剧", "优惠券可用目标", "用户主动领取", "投放对象类型", "批次预算上限"]) {
  if (!couponBatchFormHtml.includes(value)) {
    errors.push(`pages/backend/coupon-batch-form.html: 缺少券批次交易配置「${value}」`);
  }
}
for (const value of ["抵扣单位", "最低实付", "预算结算汇率"]) {
  if (couponBatchFormHtml.includes(value)) {
    errors.push(`pages/backend/coupon-batch-form.html: 不应在券批次页展示「${value}」`);
  }
}
for (const value of ["data-cash-scope-mode", "data-diamond-target", "data-claim-target-type", "data-claim-id-mode", "data-batch-budget-cap"]) {
  if (!couponBatchFormHtml.includes(value)) {
    errors.push(`pages/backend/coupon-batch-form.html: 缺少联动控件「${value}」`);
  }
}
if ((couponBatchFormHtml.match(/checked disabled/g) || []).length < 3) {
  errors.push("pages/backend/coupon-batch-form.html: 全平台通用初始状态下三个现金业务场景必须全选且不可取消");
}
if ((couponBatchFormHtml.match(/type="radio" name="cash-business-scene"/g) || []).length !== 3) {
  errors.push("pages/backend/coupon-batch-form.html: 指定业务线下现金业务场景必须使用单选控件");
}
if (couponBatchFormHtml.indexOf("预算与库存") > couponBatchFormHtml.indexOf("发放配置")) {
  errors.push("pages/backend/coupon-batch-form.html: 发放配置必须位于预算与库存之后");
}

if (!couponBatchFormHtml.includes('data-return-redirect="../../pages/backend/approvals.html"')) {
  errors.push("pages/backend/coupon-batch-form.html: 券批次创建页必须直接提交审核并进入审批管理");
}
if (fs.existsSync(path.join(docsRoot, "pages/backend/coupon-batch-confirm.html"))) {
  errors.push("pages/backend/coupon-batch-confirm.html: 一期不应保留独立提交审核确认页");
}

const budgetPoolFormHtml = readDoc("pages/backend/budget-pool-form.html");
for (const value of ["成本归属类型", "成本归属业务线", "平台", "业务线"]) {
  if (!budgetPoolFormHtml.includes(value)) {
    errors.push(`pages/backend/budget-pool-form.html: 缺少预算池成本归属配置「${value}」`);
  }
}

const budgetIncreaseFormHtml = readDoc("pages/backend/budget-pool-increase-form.html");
for (const value of ["目标预算池", "预算池 ID", "成本归属", "readonly"]) {
  if (!budgetIncreaseFormHtml.includes(value)) {
    errors.push(`pages/backend/budget-pool-increase-form.html: 缺少指定预算池信息「${value}」`);
  }
}
if (budgetIncreaseFormHtml.includes("data-budget-pool-combo")) {
  errors.push("pages/backend/budget-pool-increase-form.html: 增加预算页不应支持切换目标预算池");
}
for (const value of ["外部发券场景保存失败规则", "场景编码格式错误", "生效时间倒置", "同场景编码时间重叠", "绑定券批次不可用"]) {
  if (!firstPhasePrd.includes(value)) errors.push(`优惠券中台一期PRD.md: 缺少外部发券场景保存失败规则「${value}」`);
}
if (fs.existsSync(path.join(docsRoot, "pages/backend/dashboard.html"))) {
  errors.push("pages/backend/dashboard.html: 一期不应保留概览页");
}

const approvalsHtml = readDoc("pages/backend/approvals.html");
const budgetApprovalIds = ["APB20260714001", "APB20260714002", "APB20260714003", "APB20260714004"];
const batchApprovalIds = ["CB20260714001", "CB20260714002", "CB20260714003", "CB20260714004", "CB20260714005", "CB20260714006", "CB20260714007", "CB20260714008", "CB20260714009"];
for (const id of budgetApprovalIds) {
  const detailFile = `pages/backend/approval-budget-${id}.html`;
  if (!approvalsHtml.includes(`approval-budget-${id}.html`) || !fs.existsSync(path.join(docsRoot, detailFile))) {
    errors.push(`审批管理: 预算池审批「${id}」缺少对应审核详情`);
    continue;
  }
  if (!readDoc(detailFile).includes(id)) errors.push(`${detailFile}: 审批详情与列表审批单号不一致`);
}
for (const id of batchApprovalIds) {
  const detailFile = `pages/backend/approval-batch-${id}.html`;
  if (!approvalsHtml.includes(`approval-batch-${id}.html?return=approvals&tab=batch`) || !fs.existsSync(path.join(docsRoot, detailFile))) {
    errors.push(`审批管理: 券批次审批「${id}」缺少对应审核详情`);
    continue;
  }
  if (!readDoc(detailFile).includes(id)) errors.push(`${detailFile}: 审批详情与列表券批次 ID 不一致`);
  if (readDoc(detailFile).includes("投放/触发说明") || readDoc(detailFile).includes("undefined")) {
    errors.push(`${detailFile}: 不应展示已废弃的投放/触发说明或技术占位词`);
  }
}
if (approvalsHtml.includes("投放/触发说明") || approvalsHtml.includes("undefined")) {
  errors.push("pages/backend/approvals.html: 不应展示已废弃的投放/触发说明或技术占位词");
}
for (const value of ["成本归属", "适用范围", "券规则摘要", "库存 / 批次预算上限"]) {
  if (!approvalsHtml.includes(value)) errors.push(`pages/backend/approvals.html: 缺少审批列表字段「${value}」`);
}

if (!fs.existsSync(path.join(docsRoot, "pages/backend/redeem-records.html"))) {
  errors.push("pages/backend/redeem-records.html: 缺少交易闭环原型页面");
}
for (const file of ["pages/backend/delivery-exceptions.html", "pages/backend/user-coupon-detail-delivery.html"]) {
  if (fs.existsSync(path.join(docsRoot, file))) {
    errors.push(`${file}: 支付或通钻扣款成功即核销后不应继续生成该页面`);
  }
}
const redeemRecordsHtml = readDoc("pages/backend/redeem-records.html");
for (const value of ["通钻 / 通钻购买", "算力 / 算力购买", "电影票 / 电影票购买", "短剧 / 短剧单集解锁", "短剧 / 短剧全集解锁", "现金优惠券", "通钻抵扣券", "营销成本"]) {
  if (!redeemRecordsHtml.includes(value)) errors.push(`pages/backend/redeem-records.html: 缺少核销业务样例或字段「${value}」`);
}
for (const value of ["<th>处理结果</th>", "<th>操作</th>"]) {
  if (redeemRecordsHtml.includes(value)) errors.push(`pages/backend/redeem-records.html: 核销成功列表不应展示字段「${value}"`);
}
for (const slug of ["used", "used-diamond", "used-compute", "used-movie", "used-drama-episode"]) {
  const target = `../../pages/backend/user-coupon-detail-${slug}.html?return=redeem-records`;
  if (!redeemRecordsHtml.includes(target)) errors.push(`pages/backend/redeem-records.html: 用户券 ID 缺少详情链接「${slug}」`);
  if (!fs.existsSync(path.join(docsRoot, `pages/backend/user-coupon-detail-${slug}.html`))) errors.push(`核销记录: 缺少已使用用户券详情「${slug}」`);
}

const readmeHtml = readDoc("README.md");
const indexHtml = readDoc("index.html");
for (const value of ["核销记录", "人民币支付或通钻扣款成功后核销", "交易闭环"]) {
  if (!readmeHtml.includes(value)) {
    errors.push(`README.md: 缺少原型交付说明「${value}」`);
  }
}
if (readmeHtml.includes("不展示交易核销")) {
  errors.push("README.md: 不应保留一期不展示交易核销的旧口径");
}

if (!firstPhasePrd.includes("已使用") || !firstPhasePrd.includes("锁定中")) {
  errors.push("优惠券中台一期PRD.md: 一期用户券状态应覆盖锁券和已使用");
}
if (!firstPhasePrd.includes("后台用户券状态仅包括待使用、锁定中、已使用、已过期、已作废") || !firstPhasePrd.includes("App 的“已失效”仅为展示分类")) {
  errors.push("优惠券中台一期PRD.md: 未明确后台状态与 App 已失效展示分类的边界");
}
if (!firstPhasePrd.includes("仅设置待使用、已使用、已失效 3 个 Tab") || !firstPhasePrd.includes("锁定中不新增独立 Tab")) {
  errors.push("优惠券中台一期PRD.md: 我的优惠券未明确三 Tab 与锁定中归类规则");
}
if (!lockedCouponDetailHtml.includes("未支付") || lockedCouponDetailHtml.includes("已支付")) {
  errors.push("pages/backend/user-coupon-detail-locked.html: 锁定中示例应停留在人民币支付成功前");
}
for (const value of ["锁券跨有效期规则", "lock_expire_at", "payment_success_at <= lock_expire_at", "锁券到期但订单结果未知", "保持锁定中，进入技术重试与告警"]) {
  if (!firstPhasePrd.includes(value)) {
    errors.push(`优惠券中台一期PRD.md: 缺少锁券跨有效期规则「${value}」`);
  }
}
for (const value of ["交易保护截止时间", "支付成功可在保护截止时间前完成核销", "原有效期结束后仍在交易保护窗口内"]) {
  if (!lockedCouponDetailHtml.includes(value)) {
    errors.push(`pages/backend/user-coupon-detail-locked.html: 缺少锁券跨有效期展示「${value}」`);
  }
}
if (!readmeHtml.includes("30 分钟交易保护窗口") || !readmeHtml.includes("锁券前有效即可")) {
  errors.push("README.md: 缺少锁券跨有效期保护窗口说明");
}
const configHtml = readDoc("pages/backend/config.html");
if (!configHtml.includes('锁券超时时间</label><input value="30 分钟" disabled') || !configHtml.includes("一期固定规则，不支持运营后台修改")) {
  errors.push("pages/backend/config.html: 一期锁券超时时间应固定 30 分钟且不可在后台修改");
}
const userFlow = readDoc("diagrams/user-flow.mmd");
if (userFlow.includes("X{交易结果}") || userFlow.includes("W --> X{交易结果}")) {
  errors.push("diagrams/user-flow.mmd: 不应保留锁券到期一律恢复待使用的旧流程");
}
for (const value of ["可信支付成功时间是否在保护窗口内", "原有效期是否结束", "保持锁定中<br/>技术重试与告警"]) {
  if (!userFlow.includes(value)) {
    errors.push(`diagrams/user-flow.mmd: 缺少锁券跨有效期分支「${value}」`);
  }
}
for (const file of fs.readdirSync(path.join(docsRoot, "pages/backend"))) {
  if (!file.endsWith(".html")) continue;
  const html = readDoc(`pages/backend/${file}`);
  for (const forbidden of ["订单处理异常", "等待业务线结果", "待交付确认", "等待权益确认"]) {
    if (html.includes(forbidden)) errors.push(`pages/backend/${file}: 不应保留旧核销口径「${forbidden}」`);
  }
}
if (!myCouponsHtml.includes("使用中") || !myCouponsHtml.includes("已使用")) {
  errors.push("pages/app/my-coupons.html: 应展示使用中和已使用状态");
}
if (couponCenterHtml.includes("退款退券") || myCouponsHtml.includes("退款退券")) {
  errors.push("一期 App 原型不应展示退款退券能力");
}

const couponBatchDetailFiles = [
  "coupon-batch-detail-pending.html",
  "coupon-batch-detail-upcoming.html",
  "coupon-batch-detail.html",
  "coupon-batch-detail-external.html",
  "coupon-batch-detail-direct.html",
  "coupon-batch-detail-disabled.html",
  "coupon-batch-detail-expired.html",
  "coupon-batch-detail-voided.html",
  "coupon-batch-detail-diamond.html",
];
for (const file of couponBatchDetailFiles) {
  const html = readDoc(`pages/backend/${file}`);
  const basicInfoCount = (html.match(/<span>基础信息<\/span>/g) || []).length;
  const basicInfoPanel = html.match(/<section class="panel"><div class="panel-head"><span>基础信息<\/span>[\s\S]*?<\/section>/);
  if (basicInfoCount !== 1 || !basicInfoPanel || !basicInfoPanel[0].includes('detail-meta-grid') || basicInfoPanel[0].includes('panel-body desc-list')) {
    errors.push(`pages/backend/${file}: 基础信息的全部字段应使用同一个双字段紧凑布局`);
  }
  for (const fieldName of ["券批次 ID", "券名称", "权益类型", "券类型", "关联预算池", "成本归属", "券批次活动时间", "适用模式", "业务场景", "有效期类型", "券有效期", "批次预算上限", "发放方式", "每人限领", "设备限领", "审批单号", "审批状态", "审核人", "审核时间", "审批图片", "使用说明"]) {
    if (!html.includes(`<span>${fieldName}</span>`)) {
      errors.push(`pages/backend/${file}: 基础信息缺少统一字段「${fieldName}」`);
    }
  }
  for (const fieldName of ["适用范围", "券有效期", "发放方式", "审批单号"]) {
    if ((html.match(new RegExp(`<span>${fieldName}</span>`, "g")) || []).length > 1) {
      errors.push(`pages/backend/${file}: 基础信息不应重复展示字段「${fieldName}」`);
    }
  }
  for (const fieldName of ["投放/触发说明", "汇率版本"]) {
    if (html.includes(`<span>${fieldName}</span>`)) {
      errors.push(`pages/backend/${file}: 基础信息不应展示字段「${fieldName}」`);
    }
  }
  let lastFieldIndex = -1;
  for (const fieldName of ["券批次 ID", "券名称", "权益类型", "券类型", "关联预算池", "成本归属", "券批次活动时间", "发放方式", "适用模式", "业务场景", "有效期类型", "券有效期", "批次预算上限", "当前实际占用", "批次剩余预算", "每人限领", "设备限领", "审批单号", "审批状态", "审核人", "审核时间", "审批图片"]) {
    const index = html.indexOf(`<span>${fieldName}</span>`);
    if (index <= lastFieldIndex) {
      errors.push(`pages/backend/${file}: 公共字段「${fieldName}」未按统一顺序展示`);
      break;
    }
    lastFieldIndex = index;
  }
  for (const moduleName of ["创建配置快照", "适用范围", "券规则与有效期", "发放配置", "领取限制", "审批信息", "预算与成本归属"]) {
    if (html.includes(`<div class="panel-head">${moduleName}</div>`)) {
      errors.push(`pages/backend/${file}: 创建配置快照不应拆分独立模块「${moduleName}」`);
    }
  }
}
const activeCouponBatchHtml = readDoc("pages/backend/coupon-batch-detail.html");
const diamondCouponBatchHtml = readDoc("pages/backend/coupon-batch-detail-diamond.html");
const externalCouponBatchHtml = readDoc("pages/backend/coupon-batch-detail-external.html");
const expiredCouponBatchHtml = readDoc("pages/backend/coupon-batch-detail-expired.html");
if (!activeCouponBatchHtml.includes("用户券记录") || activeCouponBatchHtml.includes("领取/发放记录")) {
  errors.push("pages/backend/coupon-batch-detail.html: 应以用户券记录替换旧领取/发放记录模块");
}
if (!diamondCouponBatchHtml.includes("用户券记录")) {
  errors.push("pages/backend/coupon-batch-detail-diamond.html: 已发放库存对应的用户券记录不可缺失");
}
for (const fieldName of ["优惠券可用目标", "预算结算汇率", "批次剩余预算", "折扣比例", "最高抵扣通钻数"]) {
  if (!diamondCouponBatchHtml.includes(`<span>${fieldName}</span>`)) {
    errors.push(`pages/backend/coupon-batch-detail-diamond.html: 缺少通钻抵扣券字段「${fieldName}」`);
  }
}
if (!diamondCouponBatchHtml.includes("指定业务线：短剧")) {
  errors.push("pages/backend/coupon-batch-detail-diamond.html: 指定业务线必须明确展示业务线名称");
}
const couponBatchListHtml = readDoc("pages/backend/coupon-batches.html");
if (couponBatchListHtml.includes("<th>可用目标</th>")) {
  errors.push("pages/backend/coupon-batches.html: 列表不应展示可用目标列");
}
for (const value of ["CB20260714002", "指定短剧 8 折通钻券", "CB20260714003", "指定单集 8 折通钻券"]) {
  if (!couponBatchListHtml.includes(value)) {
    errors.push(`pages/backend/coupon-batches.html: 缺少指定目标样例「${value}」`);
  }
}
for (const [file, targetType, targetId] of [["coupon-batch-detail-diamond-drama.html", "指定短剧", "drama_1001"], ["coupon-batch-detail-diamond-episode.html", "指定单集", "episode_2001"]]) {
  const detailPath = path.join(docsRoot, "pages/backend", file);
  if (!fs.existsSync(detailPath)) {
    errors.push(`pages/backend/${file}: 缺少指定目标券批次详情页`);
  } else {
    const html = readDoc(`pages/backend/${file}`);
    for (const value of [targetType, targetId, "优惠券可用目标", "短剧/剧集 ID"]) {
      if (!html.includes(value)) errors.push(`pages/backend/${file}: 缺少指定目标字段「${value}」`);
    }
  }
}
for (const [file, fieldNames] of [["coupon-batch-detail.html", ["抵扣金额", "使用门槛"]], ["coupon-batch-detail-voided.html", ["折扣比例", "最高抵扣金额", "使用门槛"]]]) {
  const html = readDoc(`pages/backend/${file}`);
  for (const fieldName of fieldNames) {
    if (!html.includes(`<span>${fieldName}</span>`)) {
      errors.push(`pages/backend/${file}: 缺少与券类型匹配的规则字段「${fieldName}」`);
    }
  }
}
if (externalCouponBatchHtml.includes("运营主动触发")) {
  errors.push("pages/backend/coupon-batch-detail-external.html: 外部自动发券详情不应混入运营主动触发任务");
}
if (expiredCouponBatchHtml.includes("<th>触发规则</th>")) {
  errors.push("pages/backend/coupon-batch-detail-expired.html: 预算释放记录不应展示触发规则列");
}
const rejectedBatchEditPath = path.join(docsRoot, "pages/backend/coupon-batch-edit-rejected.html");
if (!fs.existsSync(rejectedBatchEditPath)) {
  errors.push("pages/backend/coupon-batch-edit-rejected.html: 缺少审核驳回编辑页");
} else {
  const rejectedBatchEditHtml = readDoc("pages/backend/coupon-batch-edit-rejected.html");
  for (const value of ["驳回原因", "重新提交审核"]) {
    if (!rejectedBatchEditHtml.includes(value)) {
      errors.push(`pages/backend/coupon-batch-edit-rejected.html: 缺少审核驳回编辑信息「${value}」`);
    }
  }
}
const budgetPoolDetailFiles = [
  "budget-pool-detail-pending.html",
  "budget-pool-detail.html",
  "budget-pool-detail-upcoming.html",
  "budget-pool-detail-disabled.html",
  "budget-pool-detail-ended.html",
];
const singlePanelDetailFiles = [
  ...budgetPoolDetailFiles,
  ...couponBatchDetailFiles.filter((file) => file !== "coupon-batch-detail-diamond.html"),
];
for (const file of singlePanelDetailFiles) {
  const html = readDoc(`pages/backend/${file}`);
  if (!html.includes('class="grid-2 detail-single"')) {
    errors.push(`pages/backend/${file}: 移除记录模块后基础信息应通栏展示`);
  }
}
if (!styles.includes('.detail-single { grid-template-columns: minmax(0, 1fr); }')) {
  errors.push("assets/css/styles.css: 缺少单面板详情通栏样式");
}
for (const file of [...budgetPoolDetailFiles, ...couponBatchDetailFiles]) {
  const html = readDoc(`pages/backend/${file}`);
  for (const moduleName of ["处理记录", "审核记录"]) {
    if (html.includes(`<div class="panel-head">${moduleName}</div>`)) {
      errors.push(`pages/backend/${file}: 不应展示${moduleName}模块`);
    }
  }
}

const pendingBudgetPoolHtml = readDoc("pages/backend/budget-pool-detail-pending.html");
const upcomingBudgetPoolHtml = readDoc("pages/backend/budget-pool-detail-upcoming.html");
const activeBudgetPoolHtml = readDoc("pages/backend/budget-pool-detail.html");
const endedBudgetPoolHtml = readDoc("pages/backend/budget-pool-detail-ended.html");
if (pendingBudgetPoolHtml.includes("已关联券批次") || pendingBudgetPoolHtml.includes("预算调整记录")) {
  errors.push("pages/backend/budget-pool-detail-pending.html: 无关联券批次或预算调整记录时不应展示对应模块");
}
if (upcomingBudgetPoolHtml.includes("预算调整记录")) {
  errors.push("pages/backend/budget-pool-detail-upcoming.html: 无增加预算记录时不应展示预算调整记录模块");
}
if (!activeBudgetPoolHtml.includes("已关联券批次") || !activeBudgetPoolHtml.includes("预算调整记录")) {
  errors.push("pages/backend/budget-pool-detail.html: 有关联券批次和增加预算记录时应展示对应模块");
}
for (const value of ["CB20260501005", "已过期", "券有效期"]) {
  if (!endedBudgetPoolHtml.includes(value)) {
    errors.push(`pages/backend/budget-pool-detail-ended.html: 应展示历史审核通过关联券批次字段「${value}」`);
  }
}
for (const file of couponBatchDetailFiles) {
  const html = readDoc(`pages/backend/${file}`);
  for (const value of ["库存信息", "总库存", "已发放数量", "剩余库存"]) {
    if (!html.includes(value)) {
      errors.push(`pages/backend/${file}: 券批次详情缺少库存字段「${value}」`);
    }
  }
}
for (const value of ["可分配计划额度", "80,000.00"]) {
  if (!budgetPoolsHtml.includes(value)) {
    errors.push(`pages/backend/budget-pools.html: 预算池列表缺少「${value}」`);
  }
}
if (budgetPoolsHtml.includes("空态预览")) {
  errors.push("pages/backend/budget-pools.html: 不应展示空态预览");
}

for (const value of ["预算已核销成本", "未结清预算占用", "预算已承诺总额", "实际剩余可用预算"]) {
  if (!firstPhasePrd.includes(value)) {
    errors.push(`优惠券中台一期PRD.md: 缺少结清后关闭的预算口径「${value}」`);
  }
}
if (!firstPhasePrd.includes("未结清预算占用为 0") || firstPhasePrd.includes("当前实际预算占用为 0 时才允许关闭")) {
  errors.push("优惠券中台一期PRD.md: 关闭预算池应以未结清预算占用为零为条件，不应以累计核销成本为条件");
}
if (!endedBudgetPoolHtml.includes("关闭预算池确认") || !endedBudgetPoolHtml.includes("data-budget-pool-close") || !endedBudgetPoolHtml.includes("data-budget-pool-close-reason")) {
  errors.push("pages/backend/budget-pool-detail-ended.html: 已结清预算池缺少关闭确认、原因必填和确认操作");
}
const generatedAppScript = readDoc("assets/js/app.js");
for (const value of ["function closeBudgetPool", "data-budget-pool-close-reason", "data-budget-pool-close-error", "const budgetPoolClose"]) {
  if (!generatedAppScript.includes(value)) {
    errors.push(`assets/js/app.js: 关闭预算池缺少原因必填交互「${value}」`);
  }
}
const closedBudgetPoolFile = "pages/backend/budget-pool-detail-closed.html";
if (!fs.existsSync(path.join(docsRoot, closedBudgetPoolFile))) {
  errors.push(`${closedBudgetPoolFile}: 缺少已关闭预算池详情页`);
} else {
  const closedBudgetPoolHtml = readDoc(closedBudgetPoolFile);
  for (const value of ["已关闭", "关闭原因", "预算已核销成本", "未结清预算占用", "预算已承诺总额"]) {
    if (!closedBudgetPoolHtml.includes(value)) errors.push(`${closedBudgetPoolFile}: 缺少关闭后预算池字段「${value}」`);
  }
}
if (!budgetPoolsHtml.includes("budget-pool-detail-closed.html")) {
  errors.push("pages/backend/budget-pools.html: 缺少已关闭预算池详情入口");
}
if (externalScenesHtml.includes("空态预览")) {
  errors.push("pages/backend/external-scenes.html: 不应展示空态预览");
}
if (diamondBatchDetailHtml.includes("交易闭环说明")) {
  errors.push("pages/backend/coupon-batch-detail-diamond.html: 不应展示交易闭环说明");
}
if (fs.existsSync(path.join(docsRoot, "pages/backend/stats.html"))) {
  errors.push("pages/backend/stats.html: 数据统计页应删除");
}
for (const [file, html] of [["index.html", indexHtml], ["README.md", readmeHtml]]) {
  if (html.includes("pages/backend/stats.html")) {
    errors.push(`${file}: 不应保留数据统计页入口`);
  }
}
if (firstPhasePrd.includes("### 10.2 后台统计指标") || firstPhasePrd.includes("| stats:view |")) {
  errors.push("优惠券中台一期PRD.md: 不应保留独立数据统计页需求或权限");
}
const couponBatchDetailPrdSection = firstPhasePrd.split("##### 券批次详情")[1]?.split("##### 券批次处理记录类型与规则")[0] || "";
for (const value of ["库存信息", "总库存", "已发放数量", "剩余库存", "剩余库存 = 总库存 - 已发放数量"]) {
  if (!couponBatchDetailPrdSection.includes(value)) {
    errors.push(`优惠券中台一期PRD.md: 券批次详情缺少库存口径「${value}」`);
  }
}
for (const file of fs.readdirSync(path.join(docsRoot, "pages/app"))) {
  if (!file.endsWith(".html")) continue;

  const relativeFile = `pages/app/${file}`;
  const html = readDoc(relativeFile);
  if (html.includes("table-scroll")) {
    errors.push(`${relativeFile}: App 页面不应注入后台表格滚动容器`);
  }
}

if (errors.length) {
  console.error(["页面流向校验失败：", ...errors.map((item) => `- ${item}`)].join("\n"));
  process.exit(1);
}

console.log(`页面流向校验通过：${requiredActions.length} 个关键操作、${listDetailChecks.length} 组列表详情字段和后台相对链接均可达`);
