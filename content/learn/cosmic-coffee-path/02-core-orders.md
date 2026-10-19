---
title: "核心订单"
slug: core-orders
description: "定义 客户、订单、商品 这三个咖啡业务的基础实体，并用关系把它们连起来。"
order: 2
embed: official/cosmic-coffee-step-1
---

## 基础三要素

每个商业系统都从三个核心概念开始：

- **客户**——谁在买？
- **订单**——发生了什么交易？
- **商品**——买了什么？

这三个实体类型构成了 Fourth Coffee 本体的核心。后面添加的一切都与它们相连。

## 定义实体

### 客户

| 属性 | 类型 | 是否标识属性？ |
|---|---|---|
| `customerId` | 字符串 | ✓ |
| `name` | 字符串 | |
| `email` | 字符串 | |
| `loyaltyTier` | 枚举（Bronze, Silver, Gold, Platinum） | |
| `joinDate` | 日期 | |
| `totalSpend` | 小数（USD） | |

`customerId` 唯一标识每位客户。`loyaltyTier` 用枚举把取值限定在有效档位内，避免下游分析出现数据质量问题。

### 订单

| 属性 | 类型 | 是否标识属性？ |
|---|---|---|
| `orderId` | 字符串 | ✓ |
| `timestamp` | 日期时间 | |
| `total` | 小数（USD） | |
| `status` | 枚举（Pending, Preparing, Ready, Completed, Cancelled） | |
| `paymentMethod` | 枚举（Card, Cash, Mobile, Gift Card） | |

### 商品

| 属性 | 类型 | 是否标识属性？ |
|---|---|---|
| `productId` | 字符串 | ✓ |
| `name` | 字符串 | |
| `category` | 枚举（Espresso, Brewed, Cold Brew, Tea, Food, Merchandise） | |
| `price` | 小数（USD） | |
| `origin` | 字符串 | |
| `isOrganic` | 布尔值 | |

`isOrganic` 是布尔标记，后面的筛选和合规查询都会用到。

## 用关系把实体连起来

实体本身只是彼此孤立的表。**关系**把它们变成图谱：

- **places**——`客户` → `订单`（一对多）
  一位客户可以下很多订单，但每张订单只属于一位客户。

- **contains**——`订单` → `商品`（多对多）
  一张订单可以包含多个商品，一个商品也可以出现在很多订单里。

## 目前的图谱

<ontology-embed id="official/cosmic-coffee-step-1" height="350px"></ontology-embed>

*三个实体，两条关系。后面的一切都建立在这个基础之上。*

## 小结

- 每个实体都需要一个**标识属性**，也就是唯一键
- **枚举属性**把取值限制在有效选项内
- **布尔属性**让简单筛选成为可能
- **基数**（一对多还是多对多）决定了实体之间如何关联

```quiz
Q: 为什么 订单 与 商品 之间的 "contains" 关系设为多对多，而不是一对多？
- 每张订单只能包含一个商品
- 一个商品同一时间只能出现在一张订单里
- 一张订单可以包含多个商品，同时一个商品也可以出现在多张订单中 [correct]
- 多对多永远是默认的关系类型
> 一张订单通常会买好几样东西（一杯拿铁、一块松饼、一袋咖啡豆），而每个商品也会出现在许多不同的订单里。这种双向的多重性决定了必须用多对多。
```

接下来，我们加入 门店，用来记录订单在何处处理。
