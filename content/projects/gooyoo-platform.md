---
name: gooyoo-platform
title: gooyoo 企业级业务平台
tagline: Spring Boot 3 + Vue3 + uni-app 的多模块企业平台与多客户交付体系
status: shipped
category: java
role: 团队项目 · 核心全栈开发（约 90% 开发独立承担）
stack: [Spring Boot 3.4, JDK 17/21, Vue 3, Element Plus, uni-app, MySQL, Redis, Docker]
highlights:
  - 18+ 业务模块：系统管理、BPM 工作流、CRM、ERP、招投标、证书、巡检、IoT、商城、会员、支付、报表、门户、文档解析等
  - 多客户定制交付体系：客户级构建脚本与环境变量，同一代码库交付多家企业客户
  - 三端覆盖：Web 管理端（Vue3）+ 移动端（uni-app，一份代码适配 APP/小程序/H5）
  - 综合门户：跨系统核心指标、风险预警汇总、审批中心与系统入口统一编排
  - 多租户与细粒度权限：租户隔离、角色权限、数据权限与审计贯穿全部模块
links: {}
screenshots:
  - assets/screenshots/gooyoo/demo.gif
  - assets/screenshots/gooyoo/02-home.png
  - assets/screenshots/gooyoo/01-login.png
  - assets/screenshots/gooyoo/10-m-workbench.png
order: 1
biz: 为多家企业客户交付的统一业务底座：一套平台承载客户的核心业务流程，按客户定制扩展，交付后持续迭代——替代客户自建多套孤立系统的老路。
---

## 它解决什么问题

成长型企业常见困境：业务系统一堆，账号不互通、数据不互通、流程跑在纸面上。gooyoo 平台把企业需要的
系统能力（组织权限、流程审批、客户与项目、招投标、证书、巡检、设备、商城支付等）收进一个模块化底座，
按客户选择模块组合交付，再通过门户把跨系统的指标、待办和风险汇总到一个入口。

## 技术实现

- **后端**：Spring Boot 3.4 + JDK 17/21 多模块单体（22 个业务模块），MySQL + Redis，
  多租户隔离、数据权限、操作审计全链路内建。
- **Web 管理端**：Vue 3 + Element Plus，动态菜单 + 组件级权限；综合门户聚合各子系统指标、
  风险预警与审批中心。
- **移动端**：uni-app 一份代码适配 APP / 微信小程序 / H5，工作台、审批、通讯录等高频场景移动化。
- **交付体系**：客户级构建脚本与环境变量管理，同一代码库衍生多客户版本；Docker 化部署。

## 当前状态

已上线交付多家企业客户（客户名称已脱敏），持续迭代中。以上截图为示例数据演示。
