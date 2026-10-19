---
title: 核心交易
slug: core-commerce
description: 定义 客户、订单 和 商品——任何零售本体最基础的三个实体——并用关系把它们连起来。
order: 2
embed: official/iq-lab-retail-step-1
---

## 基础

每个零售系统都从三个核心概念起步：

- **客户** — 谁在买？
- **订单** — 发生了什么交易？
- **商品** — 买的是什么？

这三个实体类型构成本体的核心。后面每一步新增的东西，都会连回它们。

## 定义实体类型

每个实体类型需要：

1. 一个**名称** — 单数、能说明含义（例如 `客户`，而不是 `Customers` 或 `tbl_cust`）
2. 一个**标识属性** — 每个实例的唯一键
3. **属性** — 描述每个实例的字段

### 客户

| 属性 | 类型 | 是否标识属性 |
|---|---|---|
| `customerId` | string | ✓ |
| `name` | string | |
| `email` | string | |
| `loyaltyTier` | string | |
| `lifetimeValue` | decimal (USD) | |

`customerId` 唯一标识每位客户。`loyaltyTier`、`lifetimeValue` 这样的属性用业务语言命名，背后对应的可能是源数据库里难以看懂的列名。

### 订单

| 属性 | 类型 | 是否标识属性 |
|---|---|---|
| `orderId` | string | ✓ |
| `orderDate` | datetime | |
| `status` | string | |
| `totalAmount` | decimal (USD) | |

### 商品

| 属性 | 类型 | 是否标识属性 |
|---|---|---|
| `productId` | string | ✓ |
| `name` | string | |
| `unitCost` | decimal (USD) | |
| `discountPercent` | decimal (%) | |

## 用关系连起来

只有实体，不过是几张孤立的表。**关系**把它们变成连通的图谱：

- **OrderPlacedByCustomer** — `订单` → `客户`（多对一）
  每笔订单都由且仅由一位客户下单，但一位客户可以下多笔订单。

- **OrderContainsProduct** — `订单` → `商品`（多对多）
  一笔订单可以包含多个商品，一个商品也可以出现在多笔订单里。

### 基数很重要

基数告诉系统怎么计数和聚合：

| 基数 | 含义 | 示例 |
|---|---|---|
| 一对一 | 两侧各恰好一个 | Employee → Badge |
| 一对多 | 一个父级，多个子级 | 客户 → Orders |
| 多对一 | 多个子级，一个父级 | Orders → 客户 |
| 多对多 | 不做限制 | Orders ↔ Products |

选对基数，才能让"每位客户下了多少笔订单？"这类查询返回正确的计数。

## 目前的图谱

只用三个实体、两条关系，就已经是一个连通的图谱：

<ontology-embed id="official/iq-lab-retail-step-1" height="350px"></ontology-embed>

*客户、订单 和 商品 由两条关系连接。后面所有内容都建在这个基础之上。*

## 我们学到了什么

- 每个实体类型都需要一个标识属性
- 用业务语言命名，不要照搬内部列名
- 关系的基数会影响数据如何计数
- 即便只有三个实体，也能构成有用的连通图谱

```quiz
Q: 一位 客户 可以下多笔 订单，但每笔 订单 只属于一位 客户。这是什么基数？
- 一对一
- 多对多
- 一对多 [correct]
- 多对一
> 从 客户 的角度看是一对多：一位客户可以有多笔订单。从 订单 的角度看是多对一。这条关系按 客户 → 订单、一对多来定义。
```

接下来，我们给订单加上明细，并把商品归入分类。
