---
title: "零售履约"
slug: retail-fulfillment
description: "加入 零售配送中心、门店 与 订单，把 Zava 的供应链接到零售伙伴和收入上。"
order: 5
embed: official/zava-grove-to-shelf-step-4
---

## 供应链与收银台相遇的地方

上一步停在一批在途发运上。这一步给收货方一个具体身份：哪家零售连锁、哪个配送中心、哪些门店、哪些订单。

三个新实体补全 Zava 的商业一侧：

- **零售配送中心**——零售商的配送中心，接收 Zava 的发运。
- **门店**——零售商的店面，由一个配送中心供货。
- **订单**——门店针对某个水果品种下的采购订单。

## 实体

### 零售配送中心

| 属性 | 类型 | 是否标识属性？ |
|---|---|---|
| `dcId` | 字符串 | ✓ |
| `name` | 字符串 | |
| `country` | 字符串 | |
| `city` | 字符串 | |
| `retailerCode` | 字符串 | |

### 门店

| 属性 | 类型 | 是否标识属性？ |
|---|---|---|
| `storeId` | 字符串 | ✓ |
| `name` | 字符串 | |
| `retailerName` | 字符串 | |
| `country` | 字符串 | |
| `city` | 字符串 | |

### 订单

| 属性 | 类型 | 是否标识属性？ |
|---|---|---|
| `orderId` | 字符串 | ✓ |
| `kilograms` | 小数（kg） | |
| `orderDate` | 日期 | |
| `deliveryDate` | 日期 | |
| `status` | 字符串 | |
| `unitPriceEur` | 小数（EUR） | |

## 新增关系

| 起点 | 关系 | 终点 | 基数 |
|---|---|---|---|
| 发运 | deliveredTo | 零售配送中心 | 多对一 |
| 零售配送中心 | supplies | 门店 | 一对多 |
| 门店 | places | 订单 | 一对多 |
| 订单 | forVariety | 水果品种 | 多对一 |

## 越限查询现在能走完全程

回想第 3 步的越限问题。零售一侧补齐后，完整遍历是：

```
冷链传感器[breach]
   → 发运
   → 采收批次 ─ ofVariety → 水果品种
   → 发运
   → 零售配送中心
   → 门店
   → 订单[forVariety = same variety, status = open]
```

Fabric IQ 的数据智能体现在可以用业务语言回答客户影响问题：

> *「针对发运 SH-2026-04812 的冷链越限，哪些零售订单有风险？收入敞口是多少（kg × unitPriceEur）？」*

## 目前的图谱

<ontology-embed id="official/zava-grove-to-shelf-step-4" diff="official/zava-grove-to-shelf-step-3" height="480px"></ontology-embed>

*十一个实体。零售分支（零售配送中心 → 门店 → 订单）通过 `订单 forVariety 水果品种` 直接接入 水果品种 枢纽，从果园到货架的路径就此完整。*

```quiz
Q: 在越限查询中，为什么除了 `发运 carries 采收批次 ofVariety 水果品种`，还需要 `订单 forVariety 水果品种`？
- Fabric IQ 要求这种冗余
- 它能让我们把受影响的批次与*同一品种的未结订单*对上，因为订单是针对品种下的，而不是针对具体批次 [correct]
- 它只是为了可视化
- 没有它，图谱就是断的
> 零售商是按品种订货，不是按批次。要知道某个批次越限会*影响哪些订单*，就得用它的品种去对照 `订单.forVariety`。少了这条连接，图谱只能告诉我们这批货有风险，却说不出哪些未结订单受影响。
```

还剩一个实体——正是它让整个模型能为 Zava 的 CSR 叙事说话。
