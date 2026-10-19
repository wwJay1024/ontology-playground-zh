---
title: "市场核心实体"
slug: core-marketplace
description: "定义 买家、商品、订单 这三个支撑电商平台的基础实体。"
order: 2
embed: official/ecommerce-step-1
---

## 购买流程

每个市场都围绕三个概念：

- **买家**——谁在买？
- **商品**——卖的是什么？
- **订单**——完成了什么交易？

这三个实体勾勒出基本的购买流程，后面添加的内容都是对它们的补充。

## 定义实体

### 买家

| 属性 | 类型 | 是否标识属性？ |
|---|---|---|
| `buyerId` | 字符串 | ✓ |
| `email` | 字符串 | |
| `memberSince` | 日期 | |
| `loyaltyTier` | 字符串 | |
| `totalSpent` | 小数（USD） | |

与线下零售客户不同，电商买家总有一个 `email` 作为主要联系方式。`totalSpent` 可用于按客户终身价值分群。

### 商品

| 属性 | 类型 | 是否标识属性？ |
|---|---|---|
| `sku` | 字符串 | ✓ |
| `name` | 字符串 | |
| `category` | 字符串 | |
| `price` | 小数（USD） | |
| `stockQty` | 整数 | |

这里的标识属性是 `sku`（Stock Keeping Unit，库存单位），也是电商领域的标准商品标识。`stockQty` 记录实时库存。

### 订单

| 属性 | 类型 | 是否标识属性？ |
|---|---|---|
| `orderId` | 字符串 | ✓ |
| `orderDate` | 日期时间 | |
| `status` | 字符串 | |
| `total` | 小数（USD） | |
| `shippingMethod` | 字符串 | |

## 关系

- **places**——`买家` → `订单`（一对多）
  一个买家会在不同时间下多张订单。

- **includes**——`订单` → `商品`（多对多）
  一张订单可以包含多个商品，每个商品也会出现在很多订单里。

## 目前的图谱

<ontology-embed id="official/ecommerce-step-1" height="350px"></ontology-embed>

*买家、商品 与 订单 通过购买流程中的关系连在一起。*

## 小结

- **SKU** 是电商商品的标准标识
- `stockQty` 这个整数属性让库存查询成为可能
- 基本的购买流程（买家 → 订单 → 商品）是任何市场的骨架

```quiz
Q: 为什么 商品 用 "sku" 而不是 "productId" 作为标识属性？
- SKU 打起来更短
- SKU（Stock Keeping Unit，库存单位）是电商与零售系统里通用的商品标识 [correct]
- productId 会造成命名冲突
- SKU 一定是数字
> SKU 全称 Stock Keeping Unit，是行业通用的标识，库存管理、仓储和电商系统都用它来唯一区分每一件货品。
```

接下来，我们加入 购物车，为购买前的环节建模。
