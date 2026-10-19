---
title: "采收与质量"
slug: harvest-and-quality
description: "加入 HarvestLot 与 QualityCheck，记录每一次可追溯的采收事件，以及 Zava 的四级质量制度。"
order: 3
embed: official/zava-grove-to-shelf-step-2
---

## 每一箱都有批次

一块地采收之后，摘下来的公斤数就成为一个 **HarvestLot**，也就是贯穿后续供应链的追溯单元。之后的每一个事件（温度越限、零售商退货、客户索赔）最终都指向某个 HarvestLot。

Zava 还实行**「四道质量检验」**：同一批次要在四个不同阶段受检——田间、包装厂、目的配送中心，最后是门店。每次检验都是一个独立的 `QualityCheck` 事件，各自带阶段编号。

## 实体

### HarvestLot

| 属性 | 类型 | 是否标识属性？ |
|---|---|---|
| `lotId` | 字符串 | ✓ |
| `harvestDate` | 日期 | |
| `kilograms` | 小数（kg） | |
| `qcGrade` | 字符串 | |

### QualityCheck

| 属性 | 类型 | 是否标识属性？ |
|---|---|---|
| `checkId` | 字符串 | ✓ |
| `stage` | 整数（1–4） | |
| `passed` | 布尔值 | |
| `defectRate` | 小数（%） | |
| `checkedAt` | 日期时间 | |

`stage` 字段让四级制度在语义层里显式可见：像*「哪些种植商总是过不了第 3 阶段检验？」*这样的问题，现在只需要一个属性筛选。

## 新增关系

| 起点 | 关系 | 终点 | 基数 |
|---|---|---|---|
| HarvestLot | fromPlot | Plot | 多对一 |
| HarvestLot | ofVariety | FruitVariety | 多对一 |
| QualityCheck | checks | HarvestLot | 多对一 |

有了 `fromPlot → grows → FruitVariety`，`ofVariety` 看起来似乎多余，但它能让「发运中的品种构成」这类查询少走一跳；更重要的是，它记录的是*采收时*的品种，在换种轮作之后，这个品种可能与地块名义上的品种不同。

## 目前的图谱

<ontology-embed id="official/zava-grove-to-shelf-step-2" diff="official/zava-grove-to-shelf-step-1" height="420px"></ontology-embed>

*六个实体。注意两个新枢纽：HarvestLot 是谱系锚点，QualityCheck 从侧面挂在它上面。*

## 由此可以回答的业务问题

- *「过去 30 天里哪些种植商的蓝莓质检不合格？」*
  → `QualityCheck[passed=false] → HarvestLot → Plot → Farm → Grower`，并按 `ofVariety.category = "berry"` 过滤。
- *「按阶段和原产国统计，我们的质检通过率是多少？」*
  → 按 `QualityCheck.stage` 和 `HarvestLot → Plot → Farm.country` 分组。

```quiz
Q: 为什么 Zava 把 `QualityCheck` 建成独立实体，而不是在 `HarvestLot` 上加四个布尔列（例如 `qc1Passed`、`qc2Passed`……）？
- RDF 不支持布尔值
- 建成实体后，每次检验都能带上自己的 `inspector`、`defectRate`、`checkedAt`，也能按 `stage` 统计或筛选 [correct]
- 这样可以提升图谱渲染性能
- Fabric IQ 不支持布尔列
> 用布尔值会把检验员、时间戳和缺陷率这些信息压没。作为实体，QualityCheck 成为一等事件，可以聚合、筛选、关联——这正是回答「哪些种植商最常在第 3 阶段不合格？」所需要的。
```

接下来，我们把采收批次接到业务的冷链一侧。
