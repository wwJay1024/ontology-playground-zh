---
title: 地理
slug: geography
description: 用 Region 和 Store 建模地理结构——订单在哪里履约，门店位于何处。
order: 4
embed: official/iq-lab-retail-step-3
---

## 加入位置信息

交易不发生在真空里，而发生在**具体的地方**。加入地理实体后，就能回答这些问题：

- "西南地区的总销售额是多少？"
- "东北地区哪些门店的订单量在下滑？"
- "西南地区需要冷链物流吗？"

## Region

区域表示包含门店和仓库的大片地理范围：

| 属性 | 类型 | 是否标识属性 |
|---|---|---|
| `regionId` | string | ✓ |
| `regionName` | string | |
| `timezone` | string | |
| `coldChainRequired` | boolean | |

`coldChainRequired` 是一个很好的**布尔属性**例子——它把一条是/否的业务规则（这个区域是否需要冷链运输？）变成可查询的属性，而不是埋在文档里。

## Store

门店是客户下单的实体零售场所：

| 属性 | 类型 | 是否标识属性 |
|---|---|---|
| `storeId` | string | ✓ |
| `storeName` | string | |
| `address` | string | |

## 新增关系

- **OrderFulfilledToRegion** — `Order` → `Region`（多对一）
  每笔订单在一个区域履约。这让区域销售分析成为可能。

- **StoreInRegion** — `Store` → `Region`（多对一）
  每家门店属于一个区域。加上订单那条关系，通往 Region 就有了两条路径——便于从不同分析视角切入。

## 地理层级

注意这个模式：**Store** → **Region** 构成一个**地理层级**。更细致的本体里，还可以加上 City、State、Country 等层级。核心原则是：

> 层级中每一级都通过多对一关系连到上一级。这样就能自动上卷：门店级数据汇总成区域级合计。

## 第三步的图谱

<ontology-embed id="official/iq-lab-retail-step-3" diff="official/iq-lab-retail-step-2" height="400px"></ontology-embed>

*七个实体类型。Region 与 Store 补上地理信息。注意 Order 现在既连 Customer（谁买的），也连 Region（在哪里履约）。*

## 我们学到了什么

- **地理实体**支撑基于位置的分析
- **布尔属性**（如 `coldChainRequired`）承载业务规则
- **层级结构**让数据从细粒度上卷到汇总
- 一个实体可以同时对不同实体建多条关系——Order 连着 Customer、Product（经 OrderLine）和 Region

```quiz
Q: 把 Region 建成独立实体，为什么比在 Store 上加一个 "region" 文本属性更好用？
- 这样更省存储
- 这样可以做上卷查询，并让地理数据只有一个事实来源 [correct]
- 这样本体图更好看
- Fabric IQ 要求这么做
> 把 Region 建成独立实体就形成了层级：Store → Region。这样可以按区域聚合数据（"东北地区的总销售额"），也保证区域信息只定义一次，而不是在每个门店上重复。
```

接下来，我们建模订单究竟是怎么送达的。
