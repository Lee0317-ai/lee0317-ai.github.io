---
name: workevidence
title: workEvidence 工程资料证据链引擎
tagline: 合同解析、版式级比对、风险审查与证据报告的桌面引擎
status: wip
category: ai
role: 独立开发
stack: [Tauri 2, Rust, React, TypeScript, pdf.js, PaddleOCR, LLM]
highlights:
  - 双文档版式级比对：PDF/Word 解析、页面对齐、段落与条款级差异高亮，layout / text / LLM 三引擎可切换，支持水印比对开关
  - 规则引擎驱动风险审查：付款、工期、质保、变更签证等规则命中生成风险清单，复核结论全流程留痕（待复核 / 已确认 / 误报 / 需法务）
  - 条款审查模式：单份合同条款级 AI 审查，规则命中给出合同原文 + 修改建议（如发票违约金比例畸高、付款期限超审核上限），支持 gooyoo-ocr 本地服务识别扫描件
  - 复核报告一键生成：差异与复核按页组汇总、高风险分级统计，支持下载 HTML / PDF
  - 规则中心三级体系：系统基准规则 / 企业规则 / 候选规则，规则可编辑、克隆、停用，全国版本化管理
  - 本地优先：资料、中间结果与报告全部落本地，OCR 支持本地服务（gooyoo-ocr / PaddleOCR 在线）与 LLM 兜底
links: {}
screenshots:
  - assets/screenshots/workevidence/demo.gif
  - assets/screenshots/workevidence/diff-review-p1.png
  - assets/screenshots/workevidence/diff-review-p6.png
  - assets/screenshots/workevidence/clause-review.png
  - assets/screenshots/workevidence/review-report.png
  - assets/screenshots/workevidence/rules-center.png
  - assets/screenshots/workevidence/dashboard.png
order: 10
biz: 把工程师"多版本合同反复肉眼比对"的数小时工作压到几分钟，差异可追溯、风险可复核、报告可直接交付，产出结果供 workOperator 回写业务系统。
---

## 它解决什么问题

合同审阅里最耗时的环节是"找不同"：两份几十页的合同，人工逐页比对既慢又容易漏——漏掉的
一条付款比例改动，可能就是结算时几十万的争议。workEvidence 把这件事产品化：
上传标准合同与待审合同，OCR 解析、页面对齐、条款级差异比对、规则风险标注一次完成，
再以双页对照视图逐条复核，最后生成可下载的复核报告。

## 核心功能

- **差异复核（双页对照）**：按页组导航（每组显示差异计数与需复核状态），标准合同与待审合同
  双页对照，差异以红绿标注高亮；右侧风险面板按高风险 / 中风险 / 低风险分级过滤，
  逐项展示差异类型（修改 / 新增 / 删除）与原文对照；本组复核支持已确认风险、已接受差异、
  误报（忽略）、需法务处理四种结论，负责人与批注可留痕。
- **条款审查**：单份合同条款级 AI 审查——按违约责任、结算、生效条款等类别给出规则命中、
  合同原文引用与修改建议（如"发票违约金 100% 畸高，建议调整到不超过实际损失 30%"），
  支持已有任务待审合同或新上传扫描件（gooyoo-ocr 本地服务识别），历史审查可重试与删除。
- **复核报告**：差异与复核按页组汇总，差异项 / 高风险 / 中风险 / 低风险分级统计，
  一键下载 HTML / PDF 交付。
- **规则中心**：系统基准规则、企业规则、候选规则三级体系（如 LIAB-001 违约金过分高于实际损失、
  QUAL-001 质量保修期低于法定最低期限），规则支持编辑、克隆、停用与全国版本化管理。
- **比对实验室与工作台**：工作台聚合处理中 / 待复核 / 高风险待处理 / 本周完成四类指标，
  我的待复核、最近任务、最近报告与最近条款审查直达。

## 技术实现

- **三层架构**：Vue3 前端工作台 → Spring Boot Java 网关（鉴权、参数校验、产物代理）→
  FastAPI Python 服务（OCR、文档预处理、差异比对、风险判定、坐标精修）。
- **比对引擎**：PaddleOCR 在线 / gooyoo-ocr 本地服务可切换，layout / text / LLM 三模式比对，
  页面对齐（page-aligned）后逐条输出带坐标的差异项，支持水印比对开关与重新比对。
- **实时流水线**：比对进度经事件通道推送前端；差异复核状态写入审计，报告由复核结论收敛生成。
- **本地优先**：Tauri 2 桌面端，资料与中间结果全部落本地；金额、坐标等关键数据以结构化
  JSON 存储供上层系统复用。

## 当前状态

MVP 已跑通真实合同审阅闭环：双文档比对、条款审查、规则中心、复核报告均已可用（见截图中的
材料购销合同审阅示例）。图纸（CAD）证据与计量证据在路线图中。桌面端应用，暂以真实系统
截图展示。
