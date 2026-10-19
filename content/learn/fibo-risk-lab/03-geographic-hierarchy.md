---
title: "第 2 步：地理层级"
slug: geographic-hierarchy
description: 加入区域、国家与司法辖区，并带上灾害区标记，用于地理集中度分析。
order: 3
embed: official/fibo-risk-step-2
reviewStatus: under-human-review
---

## 风险发生在哪里

行业分类告诉你组合暴露在*哪些*门类，地理层级告诉你*在哪里*。集中在佛罗里达的组合与集中在加利福尼亚的组合面临不同的风险 —— 飓风对地震、山火。

这一步我们加入三个实体，按越来越细的粒度建模地理位置，并配上自然灾害标记。

## 新增实体类型

### 区域

大陆级或宏观经济区域 —— “北美”“欧洲”“亚太”。

| 属性 | 类型 | 说明 |
|---|---|---|
| `regionCode` | string | 标识属性 |
| `regionName` | string | 显示名称 |
| `description` | string | 区域描述 |
| `disasterProfile` | string | 该区域主要的灾害类型 |

### 国家

民族国家，带经济与监管属性。

| 属性 | 类型 | 说明 |
|---|---|---|
| `countryCode` | string | 标识属性（ISO 国家代码） |
| `countryName` | string | 显示名称 |
| `economicZone` | string | 经济分类（如“发达”“新兴”） |
| `currency` | string | 本国货币代码 |
| `regulatoryFramework` | string | 主要银行监管机构 |

### 司法辖区

次国家层级辖区（州、省），带布尔型灾害区标记。

| 属性 | 类型 | 说明 |
|---|---|---|
| `code` | string | 标识属性（如 "FL"、"CA"） |
| `name` | string | 显示名称 |
| `hurricaneZone` | boolean | 是否暴露于飓风风险 |
| `floodZone` | boolean | 是否暴露于洪水风险 |
| `earthquakeZone` | boolean | 是否暴露于地震风险 |
| `wildfireZone` | boolean | 是否暴露于山火风险 |
| `coastal` | boolean | 是否为沿海辖区 |
| `latitude` | decimal | 地理纬度 |
| `longitude` | decimal | 地理经度 |

## 新增关系

- **inCountry**：`Jurisdiction` → `Country`（多对一）—— 每个辖区属于一个国家
- **inRegion**：`Jurisdiction` → `区域`（多对一）—— 每个辖区对应一个地理区域

## 设计模式：布尔风险标记

注意辖区用的是**布尔标记**，而不是单一的“riskType”枚举。这是有意的 —— 一个辖区可以同时处于多个灾害区。佛罗里达既是 `hurricaneZone` 也是 `floodZone`，加利福尼亚既是 `earthquakeZone` 也是 `wildfireZone`。

这种模式支持精确筛选：

- “列出同时满足 `hurricaneZone = true` 与 `coastal = true` 的所有辖区”
- “我们在 `earthquakeZone` 辖区中的总敞口是多少？”

## 两条独立的层级

此时模型有两个独立子图：

1. **行业**：门类 ← 子门类 ← 行业组
2. **地理**：区域 ← 国家（经辖区），以及区域 ← 辖区

后续加入贷款产品与监管限额时，它们会连起来。

## 第 2 步图谱（相对第 1 步的差异）

<ontology-embed id="official/fibo-risk-step-2" diff="official/fibo-risk-step-1" height="400px"></ontology-embed>

*三个新增实体（高亮）补上地理维度。注意此时仍是两个独立子图 —— 它们会在第 3 步连接。*

```quiz
Q: 为什么辖区用布尔标记，而不是单一的 riskType 属性？
- 布尔标记在数据库里更容易存储
- 一个辖区可以同时处于多个灾害区，单一枚举无法表达 [correct]
- 布尔标记在图谱可视化中渲染效果更好
- FIBO 要求所有分类器都使用布尔属性
> 同一个辖区可能同时面临多种自然灾害风险。佛罗里达既易受飓风，也易受洪水。布尔标记支持精确的多维筛选，对“飓风区 且 沿海 且 洪水区”这类复合风险查询必不可少。
```
