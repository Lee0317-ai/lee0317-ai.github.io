---
name: dreamchasers
title: DreamChasers 梦想启航
tagline: 免费工具与小游戏的 monorepo 门户，工具站与游戏站独立分流
status: wip
category: software
role: 团队开发（参与）
stack: [Next.js 16, React 19, TypeScript, Prisma, PostgreSQL, NextAuth, Tailwind, Cocos Creator 3.8, GDevelop]
highlights:
  - 免费 PDF 工具箱 MVP：合并/拆分/旋转/排序/删除/文字水印/签名/PDF 转 Word Beta/区域遮盖/图片扫描成 PDF，浏览器内完成不上传服务器
  - 麻将 Roguelike「胡了卜」：手动吃碰杠组合 + 槽位成长 + 铜钱/体力经济 + 20 关主线（第 10 关终局试炼、第 20 关 Boss），已上线 Web 试玩版
  - 统一账号中心：邮箱验证登录 + 产品 token 交换骨架，已接入内部产品 TimePick（拾光）实现跨产品单点登录
  - Monorepo 工程规范：每个工具/游戏独立模块目录 + 独立文档夹，路由层只做入口，便于多人协作与逐项验收
links: {}
screenshots:
  - assets/screenshots/dreamchasers/demo.gif
  - assets/screenshots/dreamchasers/home.png
  - assets/screenshots/dreamchasers/tools.png
  - assets/screenshots/dreamchasers/pdf-toolbox.png
  - assets/screenshots/dreamchasers/hulebu.png
  - assets/screenshots/dreamchasers/hulebu-ingame.png
order: 1
biz:
  - 给普通用户提供完全免费、无需注册、浏览器内处理的 PDF 与图像小工具
  - 给碎片时间玩家提供打开即玩的休闲小游戏入口
  - 给团队一个能持续上架新工具/新游戏的门户底座
---

## 它解决什么问题

免费工具站和小游戏站这两类产品，常见的痛点是：

- 要么服务器处理，文件被上传、隐私不可控；
- 要么工具散落各处，每个都单建仓库、单建账号、单做部署，维护成本随数量线性增长；
- 小游戏做出来一个就单独买一个域名，推广和复用都难。

DreamChasers 想把这两件事合在一个 monorepo 里做掉：**工具在浏览器内完成（PDF 用 pdf-lib / pdfjs 本地处理，不上传服务器），游戏提供 Web 试玩 + Cocos 正式包双形态，账号中心给所有产品共用**。门户首页直接把用户分流到「效率工具箱」或「休闲游戏馆」，两边视觉独立、互不干扰。

## 技术实现

### Monorepo 结构

```
apps/
  web/                    # Next.js 16 门户 + 全部 Web 工具
    src/app/tools/        # /tools/pdf-toolbox、/tools/ai-photo-editor 等
    src/app/games/        # /games/hulebu 等
    src/app/account/      # 账号中心
    src/modules/          # 每个工具/游戏独立业务模块（路由层只做入口）
  game/
    mahjong-roguelike/
      cocos/              # Cocos Creator 3.8 正式工程
      prototypes/         # HTML 验证原型
packages/
  shared/                 # 共享领域类型与玩法配置
```

关键工程约定（写死在 AGENTS.md 里）：

- 每个小工具/游戏必须有独立模块目录 `apps/web/src/modules/tools/<slug>/` 或 `games/<slug>/`；
- 每个模块必须配套独立文档夹 `docs/modules/<slug>/{README,IMPLEMENTATION_PLAN,PROGRESS,DECISIONS,HANDOFF}.md`；
- 路由层 `app/**/page.tsx` 只做入口、不承载业务逻辑。

### PDF 工具箱 MVP

基于 pdf-lib（写入）+ pdfjs-dist（渲染）做纯浏览器内 PDF 处理：

- **已完成**：合并、拆分、旋转、排序、删除、文字水印、签名图片、PDF 转 Word（Beta）、区域遮盖、图片扫描成 PDF；
- **进行中**：PDF 转图片、基础压缩；
- **规划中**：扫描件 OCR。

文件全程留在浏览器里，隐私边界清晰。

### 胡了卜（麻将 Roguelike 消除）

- **Web 试玩版**：Next.js 内嵌于 `/games/hulebu`，纯 HTML + 共享配置，已开放 20 关主线（第 10 关终局试炼、第 20 关胡了卜王 Boss），并支持无尽牌山、每日牌局、成就图鉴与高阶周目；
- **Cocos 正式工程**：`apps/game/mahjong-roguelike/cocos/hulebu-cocos-3.8.8`，为微信/抖音小游戏发布准备，当前在做音频链路与局外 UI 回归；
- **共享配置**：`packages/shared/` 承载关卡、奖励与规则配置，Web 与 Cocos 两端同源，避免数值漂移。

### 统一账号中心

基于 NextAuth v5 + Prisma + PostgreSQL：

- 邮箱验证码登录（T110–T111）；
- 产品 token 交换骨架（T112–T113），允许内部产品拿到当前登录态；
- 已接入团队内另一款产品 TimePick（拾光）的前端登录壳、文件夹、资源、标签、搜索、灵感抽屉、角色选择等 12 个 API 切换任务（T114–T128），实现跨产品单点登录。

### 部署形态

- 默认部署到 Vercel（`apps/web/package.json` 已声明 next / react / react-dom，解决子目录识别）；
- 可选 `STANDALONE_BUILD=1` 切换到 Next.js standalone 自托管（Docker / Nginx 配置在 `deploy/`）。

## 当前状态

**状态：进行中（wip）。** 门户骨架、PDF 工具箱 MVP、胡了卜 Web 试玩版、统一账号中心都已可用，但都还在持续打磨：

- PDF 工具箱在补 PDF 转图片和压缩；
- 胡了卜 Cocos 端在修实测反馈的素材映射、按钮黑底和音频链路；
- 账号中心 T110–T128 系列任务处于「待验收」阶段；
- AI 修图工具仅有占位页面，未开始实质开发；
- 规划中的 AI 内容转换工具箱（参考 qiaomu-anything-to-notebooklm）尚未排期。

整体节奏是双人协作 + AI 结对开发，每个任务都有独立的 `docs/tasks/items/T*` 任务书、允许修改文件清单和验证命令，所有完成项在 `docs/status/CURRENT_STATUS.md` 里可追溯。
