---
name: workscribe
title: 工作记叙 WorkScribe
tagline: 本地优先的工作记录与汇报工具
status: shipped
role: 独立开发
stack: [TypeScript, React 19, Tauri 2, Rust, SQLite]
highlights:
  - 全局快捷键 Ctrl+Shift+L 随手记录文字与截图，AI 先整理、用户确认后才保存
  - 任务梳理 Agent 自动拆分待办/已完成/待澄清，模糊事项可追问确认
  - 日报/周报/月报/绩效 HTML 报告生成，支持模板、应用内预览与下载；独立工作汇报模式
  - 飞书集成：待办同步 WorkLog 日历，带同步日志保留策略
  - 本地 SQLite + 自动备份（24 小时快照、保留最近 5 份）、导入导出与完整性检查
links: {}
screenshots:
  - assets/screenshots/workscribe/demo.gif
  - assets/screenshots/workscribe/03-ai-result.png
  - assets/screenshots/workscribe/08-schedule.png
  - assets/screenshots/workscribe/07-report-preview.png
order: 4
biz:
  - 零碎工作做完就忘、汇报前反复翻记录——一键记录加 AI 整理，把周报月报的准备压到几分钟，数据全部留在本机，不怕敏感信息出域。
---

日常工作零碎：做完就忘，月底回忆成本高；待办、日程、工作记录分散在各处，周会汇报前要反复整理；报告内容还要排除个人事项。工作记叙（WorkScribe）把"记 → 理 → 报"做成一条本地流水线：随手记下工作片段，AI 整理成结构化事项，再一键生成日报、周报、月报、绩效报告和会议汇报。

## 它解决什么问题

工作记录工具的通病是"记了不看、看了不用"：记录和待办两张皮，和汇报更是断开的。WorkScribe 让记录直接长成汇报——每次随手记的内容都被 AI 拆进待办/已完成/待澄清，生成报告时按时间范围汇总，还能屏蔽不需要的条目；数据本地存储，适合对数据出域敏感的团队和个人。

## 技术实现

- **快速记录**：全局快捷键 Ctrl+Shift+L 唤出，支持文字与截图输入；AI 先整理，用户确认后才保存，避免 AI 自作主张。
- **任务与日程**：待办支持优先级、分类、截止日期、重复任务与完成/重开；日程视图按日/周/月排布，dnd-kit 拖拽调整日期与时间，状态与优先级颜色区分。
- **报告与汇报**：生成日报、周报、月报和绩效 HTML 报告，支持报告模板、应用内预览、保存 HTML；独立"工作汇报"模式整理"正在做 / 已完成 / 下周继续"，可手动补充与屏蔽记录。
- **飞书集成**：账号绑定、待办同步到 WorkLog 日历（只同步有截止时间的顶层待办）、同步日志只保留最近 10 条、报告发布。
- **本地优先与模型**：Tauri v2 + Rust，SQLite（rusqlite）存储；启动时距上次备份超 24 小时自动快照并保留最近 5 份，支持导入导出与 `PRAGMA integrity_check` 完整性检查；LLM 层统一封装 OpenAI 兼容与 Claude 原生格式，支持 Ollama、通义等多模型配置与默认切换。

## 当前状态

开发已完成：记录、待办、日程（日/周/月视图与拖拽排期）、搜索、报告、工作汇报、报告模板、知识库、飞书集成与本地数据保障全部落地，打包走版本号自动更新 + release notes 流程（`npm run package`）。线上作品集演示为示例数据。
