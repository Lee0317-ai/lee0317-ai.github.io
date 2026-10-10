---
name: rhein-auction
title: rhein 拍卖系统
tagline: 从需求到上线的企业级艺术品拍卖业务系统
status: shipped
category: java
role: 独立开发（需求 → 上线）
stack: [Spring Boot 3, Vue 3, uni-app, MySQL]
highlights:
  - 竞拍大厅：实时出价、竞价倒计时、延时周期、关注拍品分组（进行中/即将开始/已完成）
  - 业务闭环：专场 → 拍品 → 竞价 → 成交结果 → 提货管理全流程覆盖
  - 客户自有系统接口集成：与客户平台打通注册、会员与消息链路
  - 生产数据脱敏体系：备份 → 脱敏 → 校验 → 人工确认 → 回滚预案的标准化 runbook
  - 沿用 gooyoo 平台架构（boot + vue3 + uniapp 三仓），独立部署、独立品牌交付
links: {}
screenshots:
  - assets/screenshots/auction/demo.gif
  - assets/screenshots/auction/03-hall-list.png
  - assets/screenshots/auction/02-hall-home.png
  - assets/screenshots/auction/01-login.png
order: 4
biz: 为客户交付的线上拍卖业务系统：竞买人从关注、出价到提货的完整线上体验，运营方从专场搭建到成交归档的管理闭环。
---

## 它解决什么问题

传统拍卖行的线上化不只是"把拍卖搬上网"：专场编排、拍品管理、竞价规则（延时周期、加价幅度）、
竞买人资格、成交后的提货与结算，每一环都有自己的业务规则。rhein 拍卖系统以 gooyoo 平台架构为底座，
针对拍卖业务做了一整套领域建模与流程实现，并从需求分析一路交付到客户环境上线。

## 技术实现

- **竞拍大厅**：拍品按进行中/即将开始/已完成分组展示，实时刷新当前价与竞价人数，
  出价与倒计时联动，支持关注拍品。
- **业务管理**：专场管理、拍品管理（含导入与错误重试导出）、竞价记录、成交结果、提货管理，
  审批环节接入 BPM 工作流。
- **接口集成**：与客户自有平台打通注册、会员与消息链路（客户名称已脱敏为"莱茵置地集团"示例品牌）。
- **数据脱敏**：建立生产数据脱敏 runbook——备份、脱敏脚本（MySQL 8 REGEXP_REPLACE）、
  校验、人工确认与回滚预案，保证演示与测试环境不含真实客户数据。

## 当前状态

已交付客户上线运行（客户品牌已脱敏为示例名称）。以上截图为示例数据演示。
