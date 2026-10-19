---
title: "完整平台"
slug: complete-platform
description: "加入 Review，补上买家反馈回路，完成电商本体。"
order: 4
embed: official/ecommerce-step-3
---

## 补上反馈回路

电商拼图的最后一块是**客户评价**。评价把买家重新连回商品，形成一条影响后续购买的反馈回路。

## Review 实体

| 属性 | 类型 | 是否标识属性？ |
|---|---|---|
| `reviewId` | 字符串 | ✓ |
| `rating` | 整数 | |
| `title` | 字符串 | |
| `body` | 字符串 | |
| `verified` | 布尔值 | |

`verified` 布尔值表示评价者是否真的买过该商品。对其他买家和分析工作来说，这都是关键的信任信号。

## 新关系

- **writes**——`Buyer` → `Review`（一对多）
  一个买家会陆续写很多评价。

- **reviews**——`Review` → `Product`（多对一）
  每条评价只针对一个商品，一个商品可以有很多评价。

> **反馈回路：**路径 `Buyer → writes → Review → reviews → Product` 绕回 Product，形成一个回路：买家消费商品，再评价商品，进而影响其他买家。

## 完整的图谱

<ontology-embed id="official/ecommerce-step-3" diff="official/ecommerce-step-2" height="500px"></ontology-embed>

*完整的电商本体：5 个实体、6 条关系。Review 补上了买家反馈回路。*

## 完整模型能回答什么

| 问题 | 图谱路径 |
|---|---|
| 哪些商品拥有评分最高的已验证评价？ | Review (verified=true) → Product |
| 哪些买家购物车里有东西却没有下过单？ | 有 Buyer → Cart (itemCount > 0) 但没有 Buyer → Order |
| 某个品类商品的平均评分是多少？ | Review → Product（按 category 分组） |
| 哪些忠诚买家写的评价最多？ | Buyer (loyaltyTier=Gold) → Review（计数） |

## GQL 查询示例

查找那些「商品当前正放在某个购物车里」的已验证评价：

```gql
MATCH (b:Buyer)-[:has_cart]->(c:Cart)-[:contains]->(p:Product)<-[:reviews]-(r:Review)
WHERE r.verified = true
RETURN p.name, r.rating, r.title
```

## 我们构建了什么

| 步骤 | 新增实体 | 累计 | 核心概念 |
|---|---|---|---|
| 1 | Buyer、Product、Order | 3 | 购买流程、SKU 标识 |
| 2 | Shopping-Cart | 4 | 会话实体、一对一 |
| 3 | Review | 5 | 反馈回路、已验证信任 |

## 要点回顾

1. **会话实体**（Cart）记录进行中的状态
2. **一对一**关系表达排他性的归属
3. **布尔属性**（verified）支持基于信任的筛选
4. **反馈回路**带来的查询路径比线性链条更丰富
5. 完整图谱支持从浏览到评价的**漏斗分析**

```quiz
Q: 在这个本体里，Review 实体为什么构成一条「反馈回路」？
- 它连到了图谱里的其他所有实体
- 它让 Buyer 通过一条不同于购买路径的路线重新抵达 Product [correct]
- 它的属性数量最多
- 它用了 verified 布尔属性
> 没有 Review 时，Buyer 到 Product 只有经过 Order 这一条路。Review 造出了第二条：Buyer → Review → Product，于是形成回路。这种双路径结构支持对比查询，例如「买了但没评」与「评了但没买」。
```

你已经完成电商平台学习路径！在[目录](#/catalogue)中加载任意一步，即可交互式地查看。
