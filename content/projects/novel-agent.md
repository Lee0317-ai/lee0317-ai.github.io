---
name: novel-agent
title: novel-agent 小说 Agent
tagline: Agent 原生的中文小说工作台——文件即真相，模型只出候选，绿黄红三级裁决
status: wip
category: agent
role: 独立开发
stack: [Python 3.14, FastAPI, SSE, React 18, Babel Standalone, JSONL Journal]
highlights:
  - Agent 原生三位一体：对话 + 工具 + 文件，所有能力都从 Agent 派生，没有绕过 Agent 直接改数据的路径
  - 文件即真相：一本书就是一个目录（章节/设定/记忆/日志），JSONL Journal 单一事实源，git 友好、回收站可恢复
  - 世界脉动：主角视野外的世界自行演化，绿色事件自动入正史（每次最多 1 条），黄/红必须作者裁决，红色还需主动解锁
  - 角色决策沙盘：剧情瓶颈时代入角色重演决策点，认知边界由代码侧输入过滤强制——角色看不到大纲、别人的秘密和伏笔表
  - 20 个写作技能渐进披露：从立意、开书、分卷到去 AI 味、读者审读，覆盖长篇全流程
  - 上下文三层治理：旧工具结果 60% 清理、85% 触发模型压缩摘要、大结果落 artifact；Journal 支撑冷启动恢复
links: {}
screenshots:
  - assets/screenshots/novel-agent/demo.gif
  - assets/screenshots/novel-agent/01-bookshelf.png
  - assets/screenshots/novel-agent/02-write.png
  - assets/screenshots/novel-agent/03-agents.png
  - assets/screenshots/novel-agent/04-skills.png
  - assets/screenshots/novel-agent/05-memory.png
  - assets/screenshots/novel-agent/06-styles.png
order: 3
biz:
  - 让 AI 长篇协作停在"候选"而不是"接管"：每个自动动作都有级别和裁决关口，作者的时间只花在决定上
  - 全部状态落在纯文本文件，备份、迁移、检索就是复制目录；换编辑器、换机器不锁死
---

## 它解决什么问题

中文长篇的 AI 协作写作，卡点从来不是"模型写不出来"，而是三件事：写到 30 章忘了第 5 章埋的伏笔；AI 一步到位改了不该改的东西；所有状态锁在数据库或云服务里，作者失去对自己稿子的控制权。

novel-agent 的回答是一条架构约束：**对话 + 工具 + 文件的三位一体**。所有功能都必须从这三件事派生，不允许出现"绕过 Agent 直接改数据"的路径。一本书就是一个普通目录——chapters/ 正文、setting/ 设定正史、memory/ 记忆、journal/ 会话日志，全部是 Markdown 和 JSONL，git 可以直接管，备份就是复制目录。

## 技术实现

### Agent 核心 SDK（不感知写作业务）

- **Journal 单一事实源**：消息、工具调用、事件全部以 JSONL 持久化，冷启动可恢复；
- **Session / Run / SubAgent 任务树**：主 Agent 可委派 SubAgent（读者审读、通用任务），parent/child Session 绑定，会话与书籍工作区对应；
- **权限三级 allow / confirm / deny**：高危动作必须人确认，拒绝直接返回不推进状态；
- **上下文治理**：旧工具结果 60% 清理（elision）、85% 触发模型生成摘要（compaction）、大结果落为不可变 artifact；
- **双 Runtime**：内嵌 Python 引擎默认可用；Codex CLI / Claude Code 可作为可选子进程 Runtime，复用其工具生态——没装外部 CLI 也不影响使用。

### 写作业务层

- **20 个写作技能**：book-setup 立意开书、volume-planning 分卷、novel-standard / novel-lite 正文、opening-polish 开篇打磨、rewrite 重写、review 审读、reader-review 读者视角审读、de-ai-flavor / humanizer-zh 去 AI 味、style-distillation 风格蒸馏等，按需渐进披露，不一次性塞进 system prompt；
- **伏笔台账**：伏笔登记 + 告警，跨章节追踪"埋了没兑现"的线；
- **世界脉动**：让小说世界在主角视野外自行演化。裸模型生成候选事件，代码侧确定性完成节奏判断、解析与落盘——绿色事件自动追加正史（每次最多 1 条防刷屏），黄色事件要满足"距上次脉动满 2 章"的张力门槛并进入待裁决队列，红色事件永不自动生成、需作者裁决解锁；
- **角色决策沙盘**：剧情瓶颈时代入角色视角重演决策点，认知边界由代码强制——只喂该角色认知范围内的材料，不喂全书大纲、其他角色的秘密状态和伏笔表。产出分叉卡，作者裁决后才兑现，永不直接改写已发布章节；
- **作者记忆**：跨书的经验沉淀池，采纳才写入，支持合并、冲突标记、停用保留；
- **风格库与拆书**：风格样本沉淀 → 蒸馏成风格卡 → 写作时注入；导入拆解的书目可沉到风格样本、方案预设或记忆。

### Web 工作台

- 单文件 React（本地 vendor 的 react + babel-standalone）+ FastAPI，REST + SSE 实时流；
- 11 个模块：书架、写作台、Agents、Skills、方案预设、资料库、拆书、记忆、风格库、系统设置、版本管理；
- 书架"文件即真相"：封面卡只读目录元数据（合同已立、章节数、连载状态），删书先进回收站可恢复；
- 方案预设按 kind 管理 Prompt 预设，带使用统计、停用与恢复。

## 当前状态

**状态：进行中（wip）。** 251 个测试全部通过；本机已有两部真实作品在持续写作（《我在网游里修仙》已 10+ 章），书架、写作台、记忆、风格库、拆书全流程日常可用。页面截图来自本机真实运行实例与真实书稿。

已知边界：仓库私有未开源；当前形态是单机本地工作台，桌面分发与多用户未做。
