---
title: 库存与需求
slug: inventory-and-demand
description: 加入 Inventory、Forecast 和 DemandSignal，跟踪各仓库与各区域的库存水平并预测未来需求。
order: 6
embed: official/iq-lab-retail-step-5
---

## 从事后记录到事前规划

第 1 到第 4 步建模的是**已经发生**的事——订单、发运、配送。现在我们加入描述**正在发生**（库存水平、需求信号）和**将要发生**（预测）的实体。本体真正发挥价值的地方就在这里：把历史数据、实时数据和预测数据统一在一个模型下。

## Inventory

各仓库的库存水平：

| 属性 | 类型 | 是否标识属性 |
|---|---|---|
| `inventoryId` | string | ✓ |
| `stockLevel` | integer | |
| `reorderPoint` | integer | |

`reorderPoint` 表示应当补货的阈值——供应链管理里的关键指标。

## Forecast

商品的需求预测：

| 属性 | 类型 | 是否标识属性 |
|---|---|---|
| `forecastId` | string | ✓ |
| `forecastDate` | date | |
| `predictedDemand` | integer | |

## DemandSignal

客户需求的实时指标——搜索趋势、社交媒体提及、天气变化：

| 属性 | 类型 | 是否标识属性 |
|---|---|---|
| `signalId` | string | ✓ |
| `signalDate` | datetime | |
| `signalStrength` | decimal | |

## 新增关系

五条新关系把库存与需求接到已有实体上：

- **InventoryForProduct** — `Inventory` → `Product`（多对一）
  某个商品的库存水平。

- **InventoryAtWarehouse** — `Inventory` → `Warehouse`（多对一）
  库存在哪里存放。它与 InventoryForProduct 一起确定了交集："商品 X 在仓库 Y 有多少？"

- **ForecastForProduct** — `Forecast` → `Product`（多对一）
  某个商品的预测需求。

- **DemandSignalForProduct** — `DemandSignal` → `Product`（多对一）
  某个商品的实时需求指标。

- **DemandSignalInRegion** — `DemandSignal` → `Region`（多对一）
  需求信号产生的区域。

## 跨源统一

在真实的 Fabric IQ 部署里，这些实体可能来自差别很大的数据源：

| 实体 | 典型来源 |
|---|---|
| Inventory | Eventhouse（实时更新） |
| Forecast | Lakehouse（批量机器学习预测） |
| DemandSignal | Eventhouse（流式数据） |
| Product | Lakehouse（商品目录）与 Eventhouse（折扣）都有 |

本体把这一切**统一**到一张连通的图谱里。"西南地区需求信号高的商品，附近仓库现在有多少库存？"这样的查询，可以平滑地跨过所有数据源。

## 第五步的图谱

<ontology-embed id="official/iq-lab-retail-step-5" diff="official/iq-lab-retail-step-4" height="450px"></ontology-embed>

*十三个实体类型。Inventory 把 Product 接到 Warehouse，DemandSignal 把 Product 接到 Region。图谱现在横跨交易、物流与规划三个领域。*

## 我们学到了什么

- 本体可以统一**历史、实时与预测**数据
- **Inventory** 是典型的交叉实体——它夹在 Product 与 Warehouse 之间
- **DemandSignal** 同时连到 Product 和 Region，支持跨维度分析
- 跨源统一是核心价值——一个模型，对接多个数据引擎

```quiz
Q: 为什么说 Inventory 是"交叉实体"？
- 它比其他实体存的数据更多
- 它夹在 Product 与 Warehouse 之间，表示某个商品在某个地点的库存 [correct]
- 它在本体里关系最多
- 它是唯一来自 Eventhouse 的实体
> Inventory 交叉了 Product 与 Warehouse——每条库存记录回答"商品 X 在仓库 Y 有多少？"，因此它是典型的交叉（连接）实体。
```

还剩一步：加入 Promotion 和 Return，把图景补全。
