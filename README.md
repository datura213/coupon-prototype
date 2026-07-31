# 优惠券一期原型交付说明

## 原型说明

本目录为优惠券中台一期静态多页面原型站点，视觉方向为“专业运营后台 + 轻营销 App”。原型覆盖后台侧和 App 侧，包含关键页面、关键状态、审批流程、外部发券场景管理、App 异常态和空态。

一期已覆盖现金优惠券与通钻抵扣券、业务线适用范围、统一人民币预算、业务线试算、锁券，以及人民币支付或通钻扣款成功后核销，形成正向交易闭环。业务线交易页面不属于本原型；退款退券、多券叠加和复杂分摊仍在后续版本。

## 页面清单

入口页：`index.html`

后台页面：
- `pages/backend/budget-pools.html`：预算池列表
- `pages/backend/budget-pool-form.html`：新建预算池
- `pages/backend/budget-pool-increase-form.html`：增加预算
- `pages/backend/budget-pool-detail-pending.html`：待审核预算池详情
- `pages/backend/budget-pool-detail.html`：预算池详情
- `pages/backend/budget-pool-detail-upcoming.html`：待开始预算池详情
- `pages/backend/budget-pool-detail-disabled.html`：停用预算池详情
- `pages/backend/budget-pool-detail-ended.html`：已结束预算池详情
- `pages/backend/budget-pool-detail-closed.html`：已关闭预算池详情
- `pages/backend/coupon-batches.html`：券批次列表
- `pages/backend/coupon-batch-form.html`：新建券批次
- `pages/backend/coupon-batch-detail-pending.html`：待审核券批次详情
- `pages/backend/coupon-batch-detail-upcoming.html`：待开始券批次详情
- `pages/backend/coupon-batch-detail.html`：券批次详情
- `pages/backend/coupon-batch-detail-external.html`：外部自动发券进行中详情
- `pages/backend/coupon-batch-detail-direct.html`：运营定向发券进行中详情
- `pages/backend/coupon-batch-detail-disabled.html`：停用券批次详情
- `pages/backend/coupon-batch-detail-expired.html`：过期券批次详情
- `pages/backend/coupon-batch-detail-voided.html`：作废券批次详情
- `pages/backend/approvals.html`：审批管理
- `pages/backend/approval-budget-APB20260714001.html` 至 `approval-budget-APB20260714004.html`：预算池审批快照详情
- `pages/backend/approval-batch-CB20260714001.html` 至 `approval-batch-CB20260714009.html`：券批次审批快照详情
- `pages/backend/external-scenes.html`：外部发券场景列表
- `pages/backend/external-scene-form.html`：新建外部发券场景
- `pages/backend/external-scene-edit.html`：编辑生效中外部发券场景
- `pages/backend/external-scene-edit-new-user-register.html`：编辑 7 月新人注册外部发券场景
- `pages/backend/external-scene-edit-august.html`：编辑 8 月新人注册外部发券场景
- `pages/backend/external-scene-edit-disabled.html`：编辑停用外部发券场景
- `pages/backend/external-scene-detail.html`：外部发券场景详情
- `pages/backend/external-scene-detail-new-user-register.html`：7 月新人注册外部发券场景详情
- `pages/backend/external-scene-detail-august.html`：8 月新人注册外部发券场景详情
- `pages/backend/external-scene-detail-ended.html`：已结束外部发券场景详情
- `pages/backend/external-scene-detail-disabled.html`：停用外部发券场景详情
- `pages/backend/issue-tasks.html`：发放任务
- `pages/backend/issue-task-form.html`：新增发放任务
- `pages/backend/issue-task-detail-T20260708001.html` 至 `issue-task-detail-T20260709002.html`：单条发放任务明细
- `pages/backend/user-records.html`：用户券记录
- `pages/backend/redeem-records.html`：核销记录
- `pages/backend/config.html`：基础规则配置

App 页面：
- `pages/app/coupon-center.html`：领券中心
- `pages/app/my-coupons.html`：我的优惠券
- `pages/app/error-states.html`：App 异常态汇总

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

图表源文件：`diagrams/backend-page-flow.mmd`

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
- 编辑外部发券场景时，保存需重新校验绑定券批次活动时间、预算池预算周期，以及同一 `source_system + issue_scene_code` 下启用配置的生效时间是否重叠。
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
- 外部自动发券按 `source_system + issue_scene_code` 匹配场景，不允许外部系统直接传券批次 ID。
- 新建或编辑外部发券场景时，绑定券批次只展示外部自动发券、已审核通过、待开始或进行中的批次；待开始批次用于未来生效配置。
- 同一 `source_system + issue_scene_code` 可保留历史或未来配置，但启用且生效的时间区间不得重叠。
- 外部发券幂等键为 `source_system + issue_scene_code + external_event_id + user_id`。
- 运营定向发券的指定用户清单只在新增发放任务时录入；券批次创建表单不维护具体用户清单。
- 发放任务只支持针对单条任务查看明细，不提供任务明细文件导出、全局失败记录或跨任务失败明细。
- 预算不足、库存不足、批次停用、批次结束等内部原因不暴露给 App 用户，领券中心直接不展示不可领取券。
- App 一期不提供独立券详情页，用户在券卡内查看优惠券核心信息。

## GitHub Pages 部署说明

将仓库的 GitHub Pages 发布目录设置为 `prototype/docs/`。本原型所有页面跳转和资源引用均使用相对路径，可直接通过 `docs/index.html` 作为入口访问。
