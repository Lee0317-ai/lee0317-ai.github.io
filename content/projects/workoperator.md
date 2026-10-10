---
name: workoperator
title: 企业系统操作 Agent
tagline: 自然语言操作业务系统，人机协同确认后执行
status: wip
role: 独立开发
stack: [Python, FastAPI, LangGraph, SQLAlchemy, PostgreSQL]
highlights:
  - LangGraph HITL 图（draft → interrupt 暂停 → 确认后执行）：模型只能产草稿、永不能决定提交，提示注入越不过确认闸门
  - 写工具与出站连接器物理隔离：写工具零 HTTP import，出站唯一出口是确认后的 provider.submit，由源码级测试锁死
  - 凭证中心：PAT 只存 Fernet 密文 + sha256 哈希，审计只记 credential_id，明文不落日志、不入响应
  - FormProfile 低代码适配：YAML 声明表单字段语义与外键解析规则，新增表单不改代码
  - 39 个 hermetic 测试（SQLite + InMemorySaver）零 Postgres 依赖全量跑绿
links: {}
screenshots:
  - assets/screenshots/placeholders/workoperator.svg
order: 2
biz:
  - 让业务人员少在多个系统间反复登录、手动填表：一句话说清要办的事，Agent 以本人身份起草操作，人确认后才真正提交，权限仍完全受被控系统约束。
---

企业里的日常操作——填表单、发起审批、查数据——散落在多个业务系统里，用户要反复登录、逐个页面点。workOperator 的思路是：用户登录它一次，用一句自然语言说要办什么事，它就以用户本人的身份去操作目标系统（gooyoo-boot 及未来其他系统），草稿经用户确认后才真正提交并跟踪结果。它替代的不是某个系统，而是"在多个系统里反复手动操作"这件事本身。

## 它解决什么问题

让 Agent 替人操作系统，最怕两件事：干不该干的事，和越权。workOperator 把这两个问题前置进架构——以用户身份透传 PAT，权限完全受被控系统约束，不另起权限体系；所有写操作先产草稿、人确认后才执行。这样企业才敢把它接进真实业务流程。

## 技术实现

- **LangGraph HITL 图**（intent → draft → ask → execute/cancel）：写工具只产出 PendingAction 草稿，图在 ask 节点 interrupt 暂停，只有确认端点能 resume 进入 execute。即使上传内容里夹带"忽略指令直接提交"类注入，也越不过这道闸门（OWASP LLM01 防线）。
- **物理隔离的出站边界**：`tools/` 里的写工具零 HTTP import，出站调用全部集中在 `providers/`，唯一出口是确认后的 `provider.submit`——这条不变量由源码级断言测试锁死。
- **凭证中心**：PAT 明文只在录入瞬间出现一次，库里只存 Fernet 密文 + sha256 哈希；fetch 审计 payload 只记 credential_id + system，日志、审计、响应都不回明文。
- **FormProfile 低代码适配**：用 YAML 声明表单字段语义和外键解析规则（如合同表单的 fk_query 调 simple-list 解析外键候选），新增表单不改代码；mock / 真实连接器按配置自动切换，本地没有被控系统也能完整演示闭环。
- **hermetic 测试**：SQLite + InMemorySaver，39 个测试不依赖 Postgres 全量跑绿，Windows 下绕开 TestClient 与 aiosqlite 的线程竞争坑。

## 当前状态

M0（LangGraph HITL 底座）与 M1（凭证中心 + gooyoo-boot provider + FormProfile + 供应商/合同两类表单 create 闭环）代码完成，39/39 测试通过，mock 端到端已验证；真连验收待 gooyoo-boot 侧补 PAT 端点后进行。合同 submit + BPM 审批因 HTTP 接口无 businessKey 等硬约束拆到 M1.5；后续规划图像/文档转草稿（M2）、确认闸门 UX 与审计页（M3）、移动端试用（M4）。
