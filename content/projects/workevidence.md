---
name: workevidence
title: workEvidence 工程资料证据链引擎
tagline: 合同解析、版式级比对、风险审查与证据报告的桌面引擎
status: wip
category: ai
role: 独立开发
stack: [Tauri 2, Rust, React, TypeScript, pdf.js, PaddleOCR, LLM]
highlights:
  - 双文档版式级比对：PDF/Word 解析、页面对齐、段落与条款级差异高亮，layout / text / LLM 三引擎可切换
  - 规则引擎驱动风险审查：付款、工期、质保、变更签证等规则命中生成风险清单，复核结论全流程留痕（待复核 / 已确认 / 误报 / 需法务）
  - 条款审查模式：单份合同条款级 AI 审查，与双文档比对互补，覆盖无标准范本的场景
  - 合同模板库与比对参数预设：范本版本管理、参数 schema 化调参、试运行预览命中统计
  - 本地优先：资料、中间结果与报告全部落本地，OCR 支持本地服务（gooyoo-ocr / PaddleOCR）与 LLM 兜底
links: {}
screenshots:
  - assets/screenshots/workevidence/demo.gif
  - assets/screenshots/workevidence/diff.png
  - assets/screenshots/workevidence/risk.png
  - assets/screenshots/workevidence/dashboard.png
order: 10
biz: 把工程师"多版本合同反复肉眼比对"的数小时工作压到几分钟，差异可追溯、风险可复核、报告可直接交付，产出结果供 workOperator 回写业务系统。
---

## 它解决什么问题

施工企业的合同与工程资料管理里有一个高频痛点：投标稿、补充协议、变更单在标准范本之间反复横跳，
人工比对既慢又容易漏——而漏掉的那一条付款比例改动，可能就是结算时几十万的争议。

workEvidence 专门做这件事：把两份合同（或任意工程资料）解析成结构化文本，做页面对齐和条款级差异，
再由规则引擎和 LLM 标注风险等级，最后生成可复核、可追溯的证据报告。它不做个人工作台，也不替代业务系统，
只产出"可追溯的证据和结构化结果"——下游由 workOperator 回写业务系统，或在 WorkScribe 工作流里被引用。

## 技术实现

- **Tauri 2 + Rust 桌面引擎**：文档解析、页面对齐、比对流水线在本地 Rust 侧运行，资料不出本机；
  前端 React + React Router，比对进度通过事件通道（compare:event）实时推送。
- **三比对引擎**：gooyoo-ocr 本地 OCR 版式比对（默认）、PaddleOCR 云端比对、LLM 兜底比对，
  按 `check_ocr_health` 健康探测自动感知可用性；差异按页配对（PagePair）组织，支持重新对齐。
- **规则与审查流**：规则中心管理 PAY/QUA/CHG 等规则包（作用域、条款类型、严重度、版本、发布态），
  命中结果进入风险复核面板——系统规则解释、AI 建议、联网参考、复核结论四段式，复核动作写审计记录。
- **报告链**：比对完成一键生成 HTML 报告（报告中心版本化管理），"完成并出报告"把差异复核状态收敛进报告。

## 当前状态

MVP 可用（v0.1）：双文档比对、风险审查、规则中心、报告中心、条款审查主链路已跑通；
图纸（CAD）证据与计量证据在路线图中，是刻意避开的深水区（见项目 PRD 的分阶段策略）。
当前为私有仓库，界面演示为示例数据。
