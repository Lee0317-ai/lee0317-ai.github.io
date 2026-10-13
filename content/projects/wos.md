---
name: wos
title: WOS 桌面 Agent
tagline: 基于 LobsterAI 深度改编的桌面 Agent 工作台——做完必须有证据、高危必须人确认
status: adapted
category: agent
role: 改编开发（约 90% 开发独立承担）
stack: [Electron 40, React 18, TypeScript, SQLite, OpenClaw]
highlights:
  - 事件溯源式运行时：任务执行的状态、事件、证据全部持久化（SQLite），中断 run 从事件恢复且幂等键防重
  - 证据定验收：run 必须走完 finalize 并集齐必需证据才进入 accepted，缺证据停在 partial，失败证据不会被标成通过
  - 权限与审批边界：生产部署等高危能力必须 confirm，工作区外文件操作直接拒绝，拒绝经真实路由边界返回、不推进状态
  - 全场景办公任务模式：代码开发、日常办公、研究分析、设计创作、制作幻灯片、数据分析、文档写作、创建网站八类模式一键切换
  - 项目工作区与技能体系：我的项目绑定独立工作区与技能包，市场内置 39 个技能，支持 Word/Excel/PPT 文档生成
  - 品牌迁移与数据兼容：LobsterAI 旧归档根目录在 WOS 品牌下可读可恢复，未知根目录拒绝并保留路径安全检查
  - P0 回归 270/270、Agent 编排 257/257、数据迁移 20/20 通过；未验证项在验收报告中如实留档
links: {}
screenshots:
  - assets/screenshots/wos/demo.gif
  - assets/screenshots/wos/01-home.png
  - assets/screenshots/wos/05-projects-expanded.png
  - assets/screenshots/wos/06-session-folder-check.png
  - assets/screenshots/wos/07-session-fix.png
  - assets/screenshots/wos/03-skills.png
order: 2
biz:
  - 在开源桌面 Agent 基础上改编出一套"做完必须有证据、高危必须人确认"的可控工作台：任务验收有据可查，适合真正拿来干活而不是演示。
---

通用桌面 Agent 拿来就能用，但真拿它干活会担心两件事：任务说完成就完成、没有证据；高危动作（比如生产部署）说干就干。WOS 基于网易有道开源的 LobsterAI（MIT 协议）深度改编，目标是一个改编可控、验收有据的桌面 Agent 工作台：品牌、数据目录与验收体系完整迁移到 WOS，同时完整保留上游许可与署名。

打开 WOS：问候语、全场景办公输入框、八类任务模式一键切换（代码开发 / 日常办公 / 研究分析 / 设计创作 /
制作幻灯片 / 数据分析 / 文档写作 / 创建网站）；左侧是我的项目（测试工作、riley-auth、project——
每个项目关联一个工作目录，会话按项目归档，随时回看历史）和我的 Agent（灵狐、coding小熊）；
AI 引擎本地启动，OpenClaw 网关就绪后即可接活。每次任务结束，Agent 自动产出"今日产出物"清单
（技术报告、验证项目、脚本、资料快照）与"待办 / 遗留"，工作痕迹完整可回溯。

## 它解决什么问题

fork 一个开源项目容易，让它在自己的场景里"可信任"难。WOS 的改编围绕一条主线：把"Agent 说做完了"变成
"证据齐了才算做完"——执行、等待复核、部分完成的状态边界由验收报告单一事实源定义，凡是没验证过的能力
一律如实列为未验证，不冒充已完成。

## 技术实现

- **证据定验收**：run 走完 finalize 并集齐必需证据才进入 accepted；缺必需证据停在 partial，失败的证据
  同样不会被标成 accepted，`run.completed` 不直接等于验收通过。
- **权限与审批边界**：生产部署等高危能力必须 confirm；工作区之外的文件操作直接拒绝。拒绝经真实路由
  边界返回，不推进 `startSession` / `continueSession`，非法审批响应在路由前被拦截。
- **事件持久化与恢复**：从持久化事件恢复被中断的 run、保持事件顺序，幂等键防止已完成的动作重复执行。
- **数据迁移兼容**：LobsterAI 旧归档根目录在 WOS 品牌下可读可恢复，未知根目录拒绝并保留路径安全检查；
  新备份写入 WOS root。
- **安全基线**：渲染进程启用上下文隔离、禁用 Node 集成、开启沙箱，渲染层访问主进程只走 preload IPC；
  应用数据存本地 userData。
- **自建认证接入（实验）**：已实验性接入睿狸账号中心（riley-auth）账号密码登录，令牌经 Electron
  safeStorage 加密存储，与登录态体系打通。
- **可选外部 Agent**：Codex / Claude Code 是可选扩展而非运行前提，测试层同时覆盖"有 Codex 用外部
  Agent"与"无 Codex 回退原生执行"两条路径。

## 当前状态

P0 验收结论"有条件通过"：固定 P0 回归 270/270、Agent 编排 257/257、数据迁移 20/20 通过，
Electron 主进程编译与渲染层构建通过，首页、高级执行选项与 Sidebar"运行中/待复核"投影有真实启动
截图佐证。未验证项如实列在验收报告中：真实任务端到端（缺 provider 与运行时）、Windows 安装包、
签名与自动更新、Computer Use 与紧急停止、会话页端到端等——这些是进入 P1 前必须补齐的清单。
页面截图来自本机真实启动与真实工作会话。
