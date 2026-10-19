---
title: 完整模型
slug: complete-model
description: 加入 Promotion 和 Return，完成 15 个实体的零售供应链本体——然后浏览完整图谱。
order: 7
embed: official/iq-lab-retail-step-6
---

## 最后两个实体

最后两个实体类型把零售生命周期接成一个完整的回路：

- **Promotion** — 拉动销售的营销活动
- **Return** — 退回的商品，同时关联订单与商品

## Promotion

针对特定商品的营销活动：

| 属性 | 类型 | 是否标识属性 |
|---|---|---|
| `promotionId` | string | ✓ |
| `promotionName` | string | |
| `isActivePromotion` | boolean | |

`isActivePromotion` 标记可以筛出当前活动——"哪些在售促销关联的商品退货率高？"这样的问题，走的是 Promotion → Product ← Return。

## Return

退回的商品，关联回订单与商品：

| 属性 | 类型 | 是否标识属性 |
|---|---|---|
| `returnId` | string | ✓ |
| `returnDate` | date | |
| `reason` | string | |

## 新增关系

最后三条关系：

- **PromotionForProduct** — `Promotion` → `Product`（多对一）
  促销针对哪个商品。

- **ReturnForOrder** — `Return` → `Order`（多对一）
  退货关联哪笔订单。

- **ReturnOfProduct** — `Return` → `Product`（多对一）
  退回的是哪个商品。

## 完整图谱

<ontology-embed id="official/iq-lab-retail-step-6" diff="official/iq-lab-retail-step-5" height="500px"></ontology-embed>

*完整的零售供应链本体：15 个实体类型、18 条关系。每个实体至少连到另一个实体，构成一张丰富、可遍历的图谱。*

## 完整模型能做什么

本体齐备之后，下面这些问题就变得容易回答了：

| 问题 | 图谱路径 |
|---|---|
| 哪些促销带来了退货？ | Promotion → Product ← Return |
| 被退回的商品库存有多少？ | Return → Product ← Inventory → Warehouse |
| 哪些承运商服务于高需求区域？ | DemandSignal → Region ← Store; Shipment → Carrier |
| 哪些客户订购了促销商品？ | Customer ← Order → OrderLine → Product ← Promotion |
| 库存告急的商品预测如何？ | Inventory → Product ← Forecast |

这些问题原本都需要写复杂的多表 SQL 关联。有了本体，它们就是图谱遍历；在 Fabric IQ 里，自然语言数据代理可以直接依据本体结构作答。

## GQL 查询示例

第一个问题——"哪些促销带来了退货？"——用 GQL 写出来是这样：

```gql
MATCH (r:Return)-[:ReturnOfProduct]->(p:Product)<-[:PromotionForProduct]-(promo:Promotion)
WHERE promo.isActivePromotion = true
RETURN promo.promotionName, p.name, r.reason
```

这个 GQL 写法与你在本体里设计的关系一一对应，模型与查询之间没有阻抗失配。

## 我们构建了什么

六个步骤，我们逐步搭出了一个完整的本体：

| 步骤 | 新增实体 | 累计 | 关键概念 |
|---|---|---|---|
| 1 | Customer、Order、Product | 3 | 实体类型、标识属性、基数 |
| 2 | OrderLine、ProductCategory | 5 | 连接实体、层级结构 |
| 3 | Region、Store | 7 | 地理结构、布尔属性 |
| 4 | Shipment、Carrier、Warehouse | 10 | 枢纽实体、跨域连接 |
| 5 | Inventory、Forecast、DemandSignal | 13 | 跨源统一、规划数据 |
| 6 | Promotion、Return | 15 | 闭合环路、GQL 查询 |

## 要点

1. **从小处起步，逐步生长** — 三个实体就足以产生价值
2. **连接实体**解决多对多的属性问题
3. **枢纽实体**（如 Shipment）桥接不同领域
4. **跨源统一**是核心价值 — 一个本体，对接多个数据引擎
5. **图谱遍历**用直观的路径模式取代复杂的 SQL 关联
6. **本体就是 API** — GQL 查询与数据代理提问遵循同一套结构

```quiz
Q: 在完整的零售本体里，"哪些促销带来了退货？"这个问题怎样表达成图谱遍历？
- Customer → Order → Product → Promotion
- Promotion → Product ← Return [correct]
- Return → Order → Customer → Promotion
- Promotion → Return → Product
> Promotion → Product ← Return 这条路径沿 PromotionForProduct 和 ReturnOfProduct 两条关系走，通过共同的 Product 实体把促销和退货商品连了起来。
```

你已经完成 IQ Lab：零售供应链。从[本体目录](#/catalogue)载入任意一步的本体，就能在演练场里交互式查看。
