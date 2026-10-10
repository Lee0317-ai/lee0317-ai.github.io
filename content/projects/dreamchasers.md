---
name: dreamchasers
title: DreamChasers 梦想启航
tagline: 免费工具与小游戏门户
status: wip
role: 独立开发
stack: [TypeScript, Next.js, PostgreSQL, Prisma, Cocos Creator]
highlights:
  - Monorepo 门户：Next.js 工具站 / 游戏站双入口分流，独立导航与视觉，部署在 Vercel
  - PDF 工具箱 MVP 第一轮落地：上传/预览/旋转/排序/拆分/下载，外加文字水印、签名、PDF 转 Word Beta、区域遮盖、图片扫描成 PDF
  - 麻将 Roguelike「胡了卜」：从最小可玩 HTML 验证原型推进到 Cocos 正式工程（模板化牌山生成器、渐进难度试玩 Demo）
  - 模块化协作规范：每个工具/游戏独立文档目录 + 独立代码目录，双人 + 多 AI 通过任务分片协作，`docs:sync` 自动汇总看板
  - 统一账号中心第一阶段完成：账号密码登录、找回/修改密码，TimePick 等产品同账号接入
links: {}
screenshots: []
order: 9
biz:
  - 一个免费、好用、更新快的工具与小游戏门户：先用 PDF 工具箱拿搜索流量、用小游戏拉停留和回访，再接 AI 能力与订阅变现。
---

DreamChasers（梦想启航）是一个免费工具 / 小游戏门户，用 monorepo 同时承载工具站和游戏站：第一阶段以"免费、好用、更新快"拿流量和停留，后续再接 AI 能力、订阅与 API 等变现能力。工具和游戏平级，每个小工具或游戏都按模块独立归档——独立的文档目录与独立的代码目录，支持多人多 AI 并行开发。

## 它解决什么问题

门户类产品的冷启动靠的是单点刚需和回访理由。DreamChasers 把第一阶段收敛成三个交付：PDF 工具箱吃搜索刚需（不调用模型的能力尽量免费）、AI 修图工具展示 AI 能力与付费空间（基础修图免费、AI 能力限次收费）、麻将 Roguelike 消除小游戏提升停留时长和回访。三件事共用一套平台底座和账号体系，避免每个小产品各起一套炉灶。

## 技术实现

- **平台底座**：Monorepo + Next.js 主站 + PostgreSQL/Prisma + Docker Compose，Web 部署在 Vercel（含 standalone 自托管构建开关）；首页按工具站/游戏站左右分流，`/tools` 与 `/games` 独立导航。
- **PDF 工具箱**：页面级处理第一轮完成——上传、预览、旋转、排序、删除、拆分、下载，并补齐文字水印、签名图片、PDF 转 Word Beta、区域遮盖和图片扫描成 PDF；完整在线编辑按边界规划不做。
- **麻将 Roguelike「胡了卜」**：玩法为麻将消除 + 手动吃碰杠 + Roguelike 奖励构筑（槽位成长、能力池、体力与救场、词缀与 Boss）。推进路径是先用 HTML 验证原型跑通最小可玩闭环和观察指标，再进 Cocos Creator 正式工程：模板注册表与参数化牌山生成器、渐进难度 10 关朋友试玩 Demo；GDevelop 只作为 Web H5 原型通道。
- **账号与产品协同**：统一账号中心第一阶段完成（账号密码登录、找回/修改密码），TimePick 等产品逐步切换到同账号 PostgreSQL 基座。
- **协作机制**：双人 + 多 AI 的文档驱动协作——任务必须先领取、文件范围显式声明，任务分片落盘后由 `docs:sync` 脚本自动汇总主看板，降低多人提交冲突。

## 当前状态

平台基础（Monorepo 外壳、Next.js 应用、数据库与 Prisma、门户 UI、账号中心第一阶段）已完成；PDF 工具箱 MVP 核心功能第一轮落地、转图片与压缩在补；「胡了卜」推进到 Cocos 试玩 Demo 与模板化牌山生成器，正式 MVP 尚未冻结；AI 修图工具未开始。整体处于持续开发中（wip）。
