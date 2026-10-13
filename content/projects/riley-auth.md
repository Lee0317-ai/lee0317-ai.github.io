---
name: riley-auth
title: 睿狸账号中心 Riley Auth
tagline: 独立账号认证服务与 Web 管理后台
status: shipped
category: java
role: 独立开发
stack: [Fastify, TypeScript, Prisma, PostgreSQL, React 18]
highlights:
  - 不透明双令牌：accessToken 2 小时 / refreshToken 30 天轮换作废，数据库只存 SHA-256 哈希，可即时吊销
  - 应用作用域授权：角色绑定"可登录应用"，登录时校验角色是否覆盖目标应用，新应用注册数据即可接入
  - Web 管理后台：账号/角色/权限点/应用/科室/团队管理与真实分页审计日志
  - 个人改密保留当前会话、吊销其它设备会话，丢号风险可控
  - 自助注册页按应用编码自动绑定成员角色，公开路由直接可用
links: {}
screenshots:
  - assets/screenshots/rileyauth/demo.gif
  - assets/screenshots/rileyauth/02-accounts.png
  - assets/screenshots/rileyauth/04-roles.png
  - assets/screenshots/rileyauth/07-audit.png
order: 4
biz:
  - 给自研的多个应用提供一套统一登录与权限底座：账号、角色、审计集中在一个后台管，新应用注册即接入，不用每个系统各写一套认证。
---

自研应用一多，每个系统各写一套登录、角色、审计很快就失控。睿狸账号中心（Riley Auth）是一套独立的账号认证服务 + Web 管理后台：账号、科室、团队、角色、审计集中管理，agent-os、ai-agent 等应用按"应用编码"接入，用户一次注册、按角色决定能进哪些应用。

## 它解决什么问题

多应用共用账号的常见做法是把用户表复制来复制去，权限口径很快对不上。Riley Auth 把"谁能登录哪个应用"做成显式建模：角色绑定应用，登录时校验用户角色是否覆盖目标应用（`APP_NOT_ALLOWED` 直接拒绝）；所有管理动作进审计日志，改密、重置、启停都有据可查。

## 技术实现

- **认证设计**：不透明双令牌——accessToken 2 小时、refreshToken 30 天且轮换作废；数据库只存 SHA-256 哈希，令牌可即时吊销；统一错误码（INVALID_CREDENTIALS / ACCOUNT_DISABLED / APP_NOT_ALLOWED / TOKEN_EXPIRED 等）中文化返回。
- **应用作用域授权**：注册应用 → 角色关联应用 → 用户绑定角色三步接入新应用，不改认证代码；自助注册页 `/#/register?app=<编码>` 为公开路由，注册即自动绑定对应成员角色。
- **管理后台**（React 18 + Vite）：账号管理（分页搜索、新建/编辑/重置密码/启停）、角色与权限点配置、应用注册、科室树与团队、审计日志、顶栏个人改密与退出。
- **设计系统**：oklch 设计 token、浅色/深色一键切换、品牌 Logo，最低适配 1024px。
- **部署形态**：Fastify API 无构建步骤（tsx 直跑 TypeScript），管理后台构建为静态站点；Nginx 统一入口，静态文件直出、`/auth` `/admin` `/api` 前缀反代到 API。

## 当前状态

M1（服务骨架：认证接口、自助注册、应用作用域校验、审计埋点与查询）与 M3（Web 管理后台全模块）完成，已作为 agent-os 等应用的统一登录入口运行；M4（微信/飞书登录）在规划中。线上作品集演示为示例数据。
