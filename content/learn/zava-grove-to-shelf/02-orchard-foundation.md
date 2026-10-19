---
title: "果园基础"
slug: orchard-foundation
description: "定义 Grower、Farm、Plot 与 FruitVariety，这四个实体刻画了 Zava 的多产地采购模式。"
order: 2
embed: official/zava-grove-to-shelf-step-1
---

## Zava 数据的起点

Zava 从一张合作生产者网络采购高端水果。在讨论质量、发运或零售订单之前，先得有一套词汇说明**谁在何处种什么**。

四个实体担起这件事：

- **Grower**——合作公司（例如 *Finca La Marina S.L.*）。
- **Farm**——种植商拥有或经营的地块所在场所。
- **Plot**——农场内部的一块管理单元，只种一个品种。
- **FruitVariety**——商业品种（例如 *Nadorcott* 柑橘、*Sekoya Pop* 蓝莓）。

## 实体

### Grower

| 属性 | 类型 | 是否标识属性？ |
|---|---|---|
| `growerId` | 字符串 | ✓ |
| `name` | 字符串 | |
| `country` | 字符串 | |
| `partnerSince` | 日期 | |
| `isMasterGrower` | 布尔值 | |

`isMasterGrower` 标记 Zava 的战略长期合作伙伴。

### Farm

| 属性 | 类型 | 是否标识属性？ |
|---|---|---|
| `farmId` | 字符串 | ✓ |
| `name` | 字符串 | |
| `country` | 字符串 | |
| `region` | 字符串 | |
| `hectares` | 小数（公顷） | |

### Plot

| 属性 | 类型 | 是否标识属性？ |
|---|---|---|
| `plotId` | 字符串 | ✓ |
| `hectares` | 小数（公顷） | |
| `plantingYear` | 整数 | |

### FruitVariety

| 属性 | 类型 | 是否标识属性？ |
|---|---|---|
| `varietyId` | 字符串 | ✓ |
| `commercialName` | 字符串 | |
| `category` | 字符串 | |
| `shelfLifeDays` | 整数（天） | |

## 关系

| 起点 | 关系 | 终点 | 基数 |
|---|---|---|---|
| Grower | owns | Farm | 一对多 |
| Farm | contains | Plot | 一对多 |
| Plot | grows | FruitVariety | 多对一 |

`Grower → Farm → Plot → FruitVariety` 这条链路让**端到端追溯**成为可能：从货架上的一颗水果，一路追回它长在哪一块地。

## 目前的图谱

<ontology-embed id="official/zava-grove-to-shelf-step-1" height="380px"></ontology-embed>

*四个实体加三条关系，已经足以回答「Zava 从西班牙采购了多少公顷的 Nadorcott 柑橘？」这类问题。*

```quiz
Q: 在 Zava 的模型里，为什么 `Plot` 是独立实体，而不是 `Farm` 的一个属性？
- 这样图谱看起来更密
- 一个农场可以有多块地，每块种不同品种，而追溯需要地块级的标识 [correct]
- 地块的所有者和农场不同
- 这是 RDF 的要求
> 地块之所以是一等概念，是因为一个农场通常并排种着好几个品种，而 Zava 需要把每个采收批次追到具体的地块，而不只是追到农场。
```

接下来，我们加入**采收事件**，以及那套著名的**四道质量检验**。
