---
title: "完整模型"
slug: complete-model
description: "加入 SustainabilityProgram，完成从果园到货架的模型——12 个实体、13 条关系，可以直接用于演示。"
order: 6
embed: official/zava-grove-to-shelf-step-5
---

## 最后一个实体：可持续发展

Zava 运营着一个种植商发展计划，内部代号 **Dreams**，合作农场可以自愿加入。计划资助节水、公平薪酬与生物多样性方面的举措。如今这些数据存放在营销系统里，与供应链彼此隔绝。

一个实体、一条关系，就把它拉进模型：

### SustainabilityProgram

| 属性 | 类型 | 是否标识属性？ |
|---|---|---|
| `programId` | 字符串 | ✓ |
| `name` | 字符串 | |
| `focusArea` | 字符串 | |
| `startYear` | 整数 | |

### 新关系

| 起点 | 关系 | 终点 | 基数 |
|---|---|---|---|
| Farm | participatesIn | SustainabilityProgram | 多对多 |

选择多对多，是因为一个农场可以同时参加多个计划（例如 *Dreams Water* 与 *Dreams Biodiversity*），一个计划也会纳入很多农场。

## 完整的图谱

<ontology-embed id="official/zava-grove-to-shelf-step-5" diff="official/zava-grove-to-shelf-step-4" height="520px"></ontology-embed>

*12 个实体、13 条关系。Zava 关心的每个业务领域现在都是一等概念，由具名边连接。*

## 这个模型在台上能讲什么

五个问题，过去每一个都要跨多个系统、耗上几天，现在都能从同一个本体里答出来：

| 问题 | 路径 |
|---|---|
| *「给我上一季度柑橘的收入，按零售连锁和原产国拆分。」* | `Order forVariety FruitVariety[category=citrus]`，按 `Store.retailerName` 与 `HarvestLot → Plot → Farm.country` 分组 |
| *「过去 30 天里哪些种植商的蓝莓质检不合格？」* | `QualityCheck[passed=false] → HarvestLot[ofVariety.category=berry] → Plot → Farm ← owns ← Grower` |
| *「在途发运中，哪些的温度超过了其品种的安全阈值？」* | `Shipment monitoredBy ColdChainSensor[temperatureC > carries.harvestLot.ofVariety.maxStorageTempC]` |
| *「发运 SH-2026-04812 越限后，哪些零售订单有风险？收入敞口是多少？」* | `Shipment[id=SH-2026-04812] → RetailDC supplies Store places Order[forVariety = breached variety, status=open]`，再对 `kilograms × unitPriceEur` 求和 |
| *「本季我们的浆果销量中，有多大比例来自 Dreams 计划农场？」* | `HarvestLot[ofVariety.category=berry, harvestDate∈season]`，按 `fromPlot → Farm participatesIn SustainabilityProgram[name~"Dreams"]` 是否成立分组 |

## 我们构建了什么

| 步骤 | 新增实体 | 累计 | 核心概念 |
|---|---|---|---|
| 1 | Grower、Farm、Plot、FruitVariety | 4 | 多产地采购、追溯锚点 |
| 2 | HarvestLot、QualityCheck | 6 | 谱系事件、四级质检制度 |
| 3 | Shipment、ColdChainSensor | 8 | 枢纽实体、时序绑定 |
| 4 | RetailDC、Store、Order | 11 | 把链条接到收入上 |
| 5 | SustainabilityProgram | 12 | 多对多的 CSR 叠加层 |

## 要点回顾

1. **一套词汇覆盖五个系统。**农艺 ERP、包装厂质检应用、IoT 事件库、零售 EDI 数据流与 CSR 记录，全部成为同一个 12 实体模型上的绑定。
2. **枢纽实体很关键。**`HarvestLot` 是谱系枢纽，`Shipment` 是湖仓与事件库之间的枢纽，`FruitVariety` 是供给与需求之间的枢纽。
3. **时序遥测是一等概念。**`ColdChainSensor` 在本体里和其他实体看起来没有区别——底层存储在 Eventhouse 这件事，提问的人根本看不见。
4. **可持续发展不是一张附带的电子表格。**加入 `SustainabilityProgram` 后，CSR 问题和收入问题跑在同一张图谱上。
5. **本体成为契约。**GQL 查询、Fabric 数据智能体的提示词、Activator 规则，引用的都是同一套实体名与关系名。

```quiz
Q: 在 Zava 的完整模型里，回答*「本季浆果销量中有多少比例来自 Dreams 计划农场？」*需要走哪条路径？
- Order → Store → RetailDC → Farm
- HarvestLot → Plot → Farm → SustainabilityProgram [correct]
- ColdChainSensor → Shipment → Farm → SustainabilityProgram
- FruitVariety → SustainabilityProgram
> 数量记录在 HarvestLot 上。要判断该批次是否来自 Dreams 计划农场，沿 HarvestLot → fromPlot → Plot →（隶属于）Farm → participatesIn → SustainabilityProgram 走一遍，再按计划名称筛选。
```

你已经完成 Zava 从果园到货架实验。在演练场中打开[第 5 步本体](#/catalogue/official/zava-grove-to-shelf-step-5)，即可查询、扩展或导出。
