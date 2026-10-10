---
name: ai-agent
title: 调查型 AI Agent
tagline: 面向研发团队的根因取证 Agent
status: shipped
category: ai
role: 独立开发
stack: [Next.js 14, LangGraph, pgvector, Prisma, PostgreSQL]
highlights:
  - 以 Run → TaskBoard → Task → Retrieval → Evidence → Answer 为主回答链，调查过程可回放
  - KnowledgeSpace + 资源授权快照约束调查范围，证据不足拒答
  - Harness 运行时：ReAct loop、工具快照、持久化子 Agent、长期记忆
links: {}
screenshots:
  - assets/screenshots/ai-agent/admin-desktop.png
  - assets/screenshots/ai-agent/agent-ui-home-3101.png
  - assets/screenshots/ai-agent/agent-ui-thread-3101.png
order: 1
biz: 在授权范围内自动跨系统取证定位根因，把工程师从多系统翻查中解放出来。
---

系统出了问题，工程师往往要先猜"该去哪查"：Git 提交、禅道缺陷、飞书讨论、Jenkins 构建、日志与监控分散在各处，来回切换、逐个翻找。Internal AI Agent 让用户直接用自然语言描述问题：Agent 在当前用户已授权的资源范围内，跨 Git、禅道、飞书、Jenkins、日志、监控和知识库取证，输出可复查的根因、证据、业务解释和修改方向——不用先判断该去哪个系统查。

## 它解决什么问题

面向研发团队的调查型 Agent，核心难点不在"会回答"，而在"答得有据、边界可控"。团队排查一个线上问题常要在五六个系统之间反复横跳，每人查到的信息还受各自权限限制。这个项目把"跨系统取证"做成一条结构化的调查链：范围先被授权约束住，结论必须挂在证据上，过程可回放、可复查。

## 技术实现

- **主回答链**：Run → TaskBoard → Task → Retrieval → Evidence → Answer。KnowledgeSpace、DataProvider 与资源授权快照先把调查范围限制在授权边界内；EvidenceGate 与 Verification Gate 判断证据是否充分，证据不足宁可拒答，不硬编结论。
- **过程可回放**：通过 SSE、Task snapshot 与 RunEvent 呈现调查过程；工具的原始大输出不直接注入模型上下文，而是转成 Observation、Evidence 或句柄，控制上下文成本。
- **Harness 运行时**：按开关独立灰度——任务内带预算的 ReAct loop、工具快照与 Observation、持久化子 Agent 执行器、长期记忆读取与审核型记忆巩固；配套固定评测与灰度门槛、回滚条件，本地回归不依赖数据库和真实 provider。
- **技术栈**：Next.js 14 + React + TypeScript，LangGraph / LangChain 编排，PostgreSQL + Prisma + pgvector 存储与向量检索；用户资源凭据（如 GitLab）通过产品界面绑定，不要求全局配置。

## 当前状态

主回答链、授权边界、证据闸门与 Harness 运行时等核心能力已落地，知识库、代码索引、RAG、provider 调查骨架与失败样本复盘均可用；`eval:harness-runtime` 评测与类型检查构成固定回归，评测报告与灰度门槛在文档中留档。项目持续沿"更多 provider 接入 + 记忆巩固质量"方向迭代。
