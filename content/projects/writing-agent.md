---
name: writing-agent
title: 写作搭子 Writing Agent
tagline: 本机运行、隐私优先的 AI 写作伙伴
status: wip
category: agent
role: 独立开发
stack: [Python 3.11, FastAPI, Pydantic, 原生 HTML/JS, OpenAI/Anthropic 兼容接口]
highlights:
  - 项目制对话 + "今天到这"摘要沉淀，卡片需用户确认才入库
  - 范文九维手法拆解：引文必须出自原文，无依据的维度不能确认
  - 多模型服务商管理，密钥只存本机，界面不回显
  - AIHOT 热点发现、今日建议与每日 Windows 通知提醒
  - 对话附件、项目资料检索、上下文预算与压缩可审计
links: {}
screenshots:
  - assets/screenshots/writing-agent/home.png
  - assets/screenshots/writing-agent/thinking.png
  - assets/screenshots/writing-agent/cards.png
  - assets/screenshots/writing-agent/discover.png
  - assets/screenshots/writing-agent/discover-mobile.png
order: 3
biz:
  - 把日常聊天式的写作素材自动沉淀成可找回、可复用的私有卡片库，写作从"翻聊天记录"变成"调自己的素材"。
---

写作素材平时散落在聊天记录、备忘录和各个文档里，真到动笔时要么找不到，要么懒得翻。写作搭子是一个跑在自己电脑上的 AI 写作伙伴：在它里面聊想法，聊到一段落点一下"今天到这"，AI 把当天的聊天提取成摘要卡片，由用户逐条确认、选择类别后才沉淀进私有卡片库；之后写稿时可以按项目、按类别把素材找回来，甚至让 Agent 带着这些素材继续聊。

## 它解决什么问题

通用 AI 聊天工具的问题在于"聊完就散"：对话越长越难复用，素材没有归属，隐私还得交给云端。写作搭子把闭环做反了过来——先在本机沉淀，再由 AI 调用：卡片默认私有、公开性默认关闭；摘要只是预览，不确认不入库；模型密钥只保存在本机配置文件里，界面只显示"是否已配置"。写作这件事从一次性问答，变成可以持续积累的素材资产。

## 技术实现

- **沉淀闭环**：项目制对话 + "今天到这"触发提取子任务，摘要预览经用户确认、归类后才写入卡片库；手动整理的卡片不会被标成 AI 产物。
- **范文拆解与手法库**：粘贴范文后按开头、结构、节奏、例证、转折、金句、结尾、情绪、人称九个维度拆解；引文必须来自原文，无依据的维度拒绝确认，勾选后才进入项目方法库并可引用回对话。
- **上下文治理**：用户原话、助手回复、摘要带不同来源标记；未确认预览和工具输出不进入项目记忆；压缩只改变模型看到的摘要视图，原始日志完整保留，提取失败时阻止丢弃原文。
- **本机架构**：Python 3.11 + FastAPI + 原生 HTML/JS，只绑定本机地址；数据全部落在本地 workspace/（会话追加日志、Markdown 卡片、预览、运行日志），支持 OpenAI 兼容与 Anthropic Messages 双协议服务商，逐模型设置上下文窗口。
- **发现与提醒**：接入 AIHOT 只读公开源展示 24 小时精选；按项目、按自然日生成"今日建议"；每日 21:00 Windows 通知提醒，通知只含通用提示，不带私人题材。

## 当前状态

对话、沉淀、手法库、附件、发现、今日建议与每日提醒均已可用，配套 pytest 回归与浏览器验收脚本；沙箱执行（Windows 原生）与 MCP 工具接入在推进中。项目保持"本机优先、确认才入库"的边界持续迭代。
