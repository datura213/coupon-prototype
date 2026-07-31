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
