---
name: zero
title: Zero 个人智能工作台
tagline: 一人公司 OS / 本地优先的个人成长引擎
status: wip
category: ai
role: 独立开发
stack: [Tauri 2, Rust, TypeScript, React]
highlights:
  - 员工 Agent 组织：公司/部门/岗位/负责人任命落库，内置 10 名员工，每人独立认知版本与运行档案
  - 通用 Agent Runtime：ReAct 与 Plan-and-Execute 双模式、上下文压缩、工具/技能/MCP/Subagent 全走 allowlist 权限校验
  - 事实链完整：Ticket → Assignment → 不可变员工快照 → Run → Artifact → 事件，产物路径服务端生成，越权落异常不造假产物
  - 个人上下文底座：Flomo 只读导入去重、Obsidian 档案（USER.md / MEMORY.md），外部连接器默认只读、写入须老板确认并留审计
  - 桌面工作台：公司工作区、员工办公室、内容/反馈工作台、画布固定模板工作流与 ComfyUI 封面生成闭环
links: {}
screenshots:
  - assets/screenshots/placeholders/zero.svg
order: 3
biz:
  - 把"一人公司"的日常运营拆成可审批的员工任务流：素材自动采集提炼、内容经老板审批后才产出，重要动作全部留痕、可回溯。
---

一个人做一家公司的事，最大的瓶颈不是不会用工具，而是上下文散落：做过的决策、聊过的想法、写过的文章、各平台的反馈互不相通，AI 助手每次都要从零理解你。Zero 想做的是本地优先的个人智能工作台：把个人上下文沉淀成本地底座，再用一支"员工 Agent"队伍在受控流程里干活——采集、提炼、撰稿、分析各有其人，重要动作必须老板审批。

## 它解决什么问题

把工作交给 AI，人最担心的是失控：它改了什么、凭什么这么改、出错了能不能查。Zero 用"公司组织"的隐喻把 AI 工作流结构化——每个员工有岗位、有私有记忆、有运行档案，老板有审批关卡，每一步有事件留痕。个人数据则守住本地优先的边界：SQLite 管运行状态，Obsidian 管人工可读内容，密钥进系统凭据管理器。

## 技术实现

- **员工 Agent 组织**：公司/部门/岗位/角色模板落库（SQLite schema v8），内置 10 名员工，每人有独立认知版本与运行档案；支持同岗多人、负责人任命与更换，员工私有记忆在 SQL 查询层隔离，不把全量记忆交给 Prompt 过滤。
- **通用 Agent Runtime**：ReAct 与 Plan-and-Execute 双模式、按 token 估算触发上下文压缩（保留系统约束与最近工具结果）、Tool/Skill/MCP/Subagent 全走 allowlist 与权限范围校验，模型能力不满足时明确失败而非硬跑。
- **完整事实链**：Ticket → Assignment → 不可变 EmployeeSnapshot → Run → AgentTurn → Artifact → 事件；产物路径由服务端生成、拒绝路径穿越与覆盖，非法 JSON 与越权记忆引用落 `anomaly_detected`，不登记伪产物。
- **个人上下文底座**：Flomo 导出文件只读导入并按 hash 去重，Obsidian Vault 保存人工可读档案；外部连接器默认只读，任何写入须老板确认并留下审计事件。
- **桌面端**：Tauri 2 + React 提供公司工作区、员工办公室、内容/反馈工作台、画布固定模板工作流；媒体制作员用 Rust 构造固定 ComfyUI 封面工作流，非法远端路径不能决定本地输出位置。

## 当前状态

切片 1-9 与员工 Agent 地基升级均通过自动化验收：Rust 136 个单元测试与端到端场景全绿，前端 Vitest、生产构建与 Playwright 桌面/移动用例通过。尚未验证的部分如实保留：真实 LLM / Flomo / ComfyUI 服务下的输出质量、连续 7 天真实使用反馈与"80% 内容值得保留"的人工质量门槛——这些是反哺 spec、驱动下一轮切片的输入。
