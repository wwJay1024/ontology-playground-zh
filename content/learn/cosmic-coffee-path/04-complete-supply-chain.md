---
title: "补全供应链"
slug: complete-supply-chain
description: "加入 Supplier 与 Shipment，完成 Fourth Coffee 本体，把采购、物流与零售连成一体。"
order: 4
embed: official/cosmic-coffee-step-3
---

## 补上最后一块

Fourth Coffee 不只是卖咖啡，它从世界各地采购咖啡豆，门店接收发运，整条供应链都要跟踪。加入 **Supplier** 与 **Shipment** 之后，链条就接上了。

## Supplier

| 属性 | 类型 | 是否标识属性？ |
|---|---|---|
| `supplierId` | 字符串 | ✓ |
| `name` | 字符串 | |
| `country` | 字符串 | |
| `certification` | 枚举（Fair Trade, Rainforest Alliance, Organic, Direct Trade, None） | |
| `rating` | 小数 | |

`certification` 是枚举属性，记录可持续认证情况。`rating` 是 1–5 的小数，用于质量评分。

## Shipment

| 属性 | 类型 | 是否标识属性？ |
|---|---|---|
| `shipmentId` | 字符串 | ✓ |
| `dispatchDate` | 日期 | |
| `arrivalDate` | 日期 | |
| `status` | 枚举（In Transit, Delivered, Delayed） | |
| `weight` | 小数（kg） | |

Shipment 是一个**枢纽实体**：它经由 Product 把 Supplier 与 Store 连起来，衔接业务的采购端与零售端。

## 新增关系

四条新关系补全了供应链：

- **sourcedFrom**——`Product` → `Supplier`（多对一）
  每个商品的咖啡豆来自一家供应商。

- **sentBy**——`Shipment` → `Supplier`（多对一）
  每次发运都由一家供应商发出。

- **deliveredTo**——`Shipment` → `Store`（多对一）
  每次发运只送达一家门店。

- **carries**——`Shipment` → `Product`（多对多）
  一次发运可以装载多个商品，一个商品也可以出现在多次发运中。

> **枢纽实体模式：**Shipment 连接了三种不同的实体（Supplier、Store、Product）。枢纽实体的价值在于，它把图谱中原本互不相连的部分接了起来。

## 完整的图谱

<ontology-embed id="official/cosmic-coffee-step-3" diff="official/cosmic-coffee-step-2" height="500px"></ontology-embed>

*完整的 Fourth Coffee 本体：6 个实体类型、7 条关系。Shipment 作为枢纽，把 Supplier、Store 与 Product 连在一起。*

## 完整模型能回答什么

| 问题 | 图谱路径 |
|---|---|
| 哪些供应商提供有机咖啡豆？ | Product (isOrganic=true) → Supplier |
| 哪些门店收到了延误的发运？ | Shipment (status=Delayed) → Store |
| 我们的头号供应商评分是多少？ | Product → Supplier（按 rating 排序） |
| 哪些持证供应商向我们最大的门店发货？ | Supplier → Shipment → Store（按 capacity 排序） |

## GQL 查询示例

查找持有 Fair Trade 认证、且向加州门店发货的供应商：

```gql
MATCH (sup:Supplier)<-[:sentBy]-(s:Shipment)-[:deliveredTo]->(st:Store)
WHERE sup.certification = 'Fair Trade' AND st.state = 'CA'
RETURN sup.name, st.name, s.status
```

## 我们构建了什么

| 步骤 | 新增实体 | 累计 | 核心概念 |
|---|---|---|---|
| 1 | Customer、Order、Product | 3 | 实体类型、标识属性、基数 |
| 2 | Store | 4 | 位置建模、多对一 |
| 3 | Supplier、Shipment | 6 | 供应链、枢纽实体 |

## 要点回顾

1. **从小处着手**——三个实体就足以产生价值
2. 像 Shipment 这样的**枢纽实体**连接不同的业务领域
3. **枚举属性**在模型层面保证数据质量
4. **图谱逐步生长**——每一步都带来新的查询能力
5. **GQL 查询**直接对应本体结构，不存在阻抗失配

```quiz
Q: 在这个本体里，为什么说 Shipment 是「枢纽实体」？
- 它的属性数量最多
- 它连接了 Supplier、Store、Product 三种不同的实体 [correct]
- 它是被查询最频繁的实体
- 它是模型中最后加入的实体
> Shipment 之所以是枢纽，是因为它同时与 Supplier（sentBy）、Store（deliveredTo）、Product（carries）相连，用一个实体把采购、物流与零售三个领域接了起来。
```

你已经完成 Fourth Coffee 学习路径！在[目录](#/catalogue)中加载任意一步，即可交互式地查看。
