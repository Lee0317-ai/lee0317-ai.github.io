---
name: gooyoo-ocr
title: gooyoo-ocr 合同 OCR 比对服务
tagline: 三层架构的合同 OCR 解析与差异比对引擎
status: shipped
category: java
role: 全栈开发（gooyoo 团队项目）
stack: [Spring Boot, FastAPI, Python, Vue 3, OCR]
highlights:
  - 三层架构：Vue3 前端工作台 → Spring Boot Java 网关（鉴权/参数校验/产物代理）→ FastAPI Python 服务
  - 双入口：合同对比（双文档差异）与单文件解析共用一个前端入口
  - OCR、文档预处理、差异比对、风险判定、坐标精修全链路在 Python 服务内完成
  - 前端所有接口统一走 Java 网关，前端不直接访问 Python 服务，边界清晰
  - 是 workEvidence 工程资料证据链引擎的比对引擎底座
links: {}
screenshots:
  - assets/screenshots/gooyoo-ocr/01-workbench.png
order: 2
biz: 把人工逐页比对合同的过程变成"上传两份文件 → 自动差异定位"，解析与比对能力以服务形式供上层系统复用。
---

## 它解决什么问题

合同审阅里最耗时的环节是"找不同"：两份几十页的合同，人工逐页比对既慢又容易漏。gooyoo-ocr
把这件事服务化——上传标准合同与待审合同，OCR 解析、预处理、差异比对、风险判定一次完成，
并给出带坐标的差异定位，供上层系统（如 workEvidence）直接渲染差异视图。

## 技术实现

- **前端工作台**：Vue 3，"合同对比"与"单文件解析"两个入口；比对结果支持滚轮缩放、
  左键拖动、两侧同步滚动。
- **Java 网关**：Spring Boot 负责参数校验、鉴权、调用 Python 服务并代理产物文件——
  前端所有接口统一走网关，Python 服务不对前端暴露。
- **Python 服务**：FastAPI 承载 OCR、文档预处理、差异比对、风险判定与坐标精修的计算主链。

## 当前状态

已随 gooyoo 平台交付使用（客户名称已脱敏），并作为 workEvidence 的比对引擎底座持续演进。
