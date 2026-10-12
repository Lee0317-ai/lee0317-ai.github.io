---
name: gooyoo-platform
title: 集成平台 · 企业级业务系统
tagline: 面向建筑工程企业的多系统数字化平台（Spring Boot 3 + Vue3 + uni-app，18+ 业务模块）
status: shipped
category: java
role: 团队项目 · 核心全栈开发（约 90% 开发独立承担）
stack: [Spring Boot 3.4, JDK 17/21, Vue 3, Element Plus, uni-app, MySQL, Redis, Docker]
highlights:
  - 七大子系统统一门户：证书管理、物电一体、投标管理、项目管理、资料管理、检测系统、系统管理中心，一次登录跨系统流转
  - 跨系统核心指标总览：证书台账、投标项目、合同额、产值/回款/开票、风险预警在综合门户聚合呈现
  - 18+ 业务模块：BPM 工作流、CRM、ERP、IoT、商城、会员、支付、报表、文档解析等可插拔扩展
  - 内置 CRM 销售管理：线索 → 客户 → 商机 → 合同 → 回款全流程 + 公海池机制 + 合同数据看板
  - 多客户定制交付体系：客户级构建脚本与环境变量，同一代码库交付多家企业客户
  - 三端覆盖：Web 管理端（Vue3）+ 移动端（uni-app，一份代码适配 APP/小程序/H5）
links: {}
screenshots:
  - assets/screenshots/gooyoo/demo.gif
  - assets/screenshots/gooyoo/02-home.png
  - assets/screenshots/gooyoo/sys-certificate.png
  - assets/screenshots/gooyoo/sys-LOT.png
  - assets/screenshots/gooyoo/sys-bidding.png
  - assets/screenshots/gooyoo/sys-project.png
  - assets/screenshots/gooyoo/sys-document.png
  - assets/screenshots/gooyoo/sys-inspection.png
  - assets/screenshots/gooyoo/sys-platform.png
  - assets/screenshots/gooyoo/crm-customer.png
  - assets/screenshots/gooyoo/crm-contract.png
  - assets/screenshots/gooyoo/10-m-workbench.png
order: 1
biz: 为建筑工程企业交付的数字化底座：从投标拿单、项目立项、产值回款，到证书资质、工程检测、资料归档，全业务链条一个平台管到底，并按客户需求模块化定制交付。
---

## 它解决什么问题

建筑工程企业的数字化痛点是"系统林立、数据孤岛"：投标在一个系统、项目在另一个系统、证书资质靠 Excel、
检测报告在检测机构手里、资料归档靠人工。集成平台把这条业务链收进一个多系统门户：

**投标管理系统**负责投标项目台账、开标跟踪与中标统计；中标后进入**项目管理系统**管理项目台账、
合同额、产值/回款/开票与超期预警；企业经营需要的**证书管理系统**（企业资质证书 + 个人执业证书）
提供台账、到期预警与印章风险管理；工地侧的检测业务由**检测系统**承接，工程资料由**资料管理系统**
统一归档；**物电一体系统**服务物电一体化业务场景；底层的账号、租户、权限与审计由**系统管理中心**统一治理。
综合门户把七个系统的核心指标、风险预警和待办聚合到一个入口。

## 七大子系统

- **证书管理系统**：企业证书与个人执业证书双台账，30 天内到期 / 已过期预警，
  证书状态分布与企业 vs 个人对比分析，到期趋势与临期预警清单。
- **投标管理系统**：投标项目台账、开标跟踪、中标/废标统计、投标金额汇总、本月投标视图。
- **项目管理系统**：项目台账（总数/进行中）、合同总额与结算、行业分布（房建/市政/钢结构/电力等）、
  产值/回款/开票趋势、项目超期预警。
- **资料管理系统**：工程资料归档台账、归档完成度、归档趋势与待归档清单。
- **检测系统**：检测报告台账、在办检测、检测类别 TopN 与异常统计。
- **物电一体系统**：物电一体化业务场景专属子系统。
- **CRM 客户关系管理**（内置模块，按需开通）：线索 / 客户 / 联系人 / 商机 / 合同 / 回款 / 发票全流程，
  公海池流转（转移 / 领取 / 分配）、合同数据看板与开票欠款预警、跟进记录与操作日志全程留痕。
- **系统管理中心**：用户、科室、角色、租户、审计等平台治理能力。

## 技术实现

- **后端**：Spring Boot 3.4 + JDK 17/21 多模块单体（22 个业务模块），MySQL + Redis，
  多租户隔离、数据权限、操作审计全链路内建。
- **前端**：Vue 3 + Element Plus，动态菜单 + 组件级权限；综合门户聚合七大子系统的指标、
  风险预警与审批中心，子系统以 portalAppCode 维度隔离进入。
- **移动端**：uni-app 一份代码适配 APP / 微信小程序 / H5（工作台、审批、通讯录）。
- **交付体系**：客户级构建脚本与环境变量管理，同一代码库衍生多客户版本；Docker 化部署。

## 当前状态

已上线交付多家企业客户，持续迭代中。截图来自开发环境真实系统，平台品牌与客户名称已脱敏。
