---
title: 履约与物流
slug: fulfillment-and-logistics
description: 加入 Shipment、Carrier 和 Warehouse，建模配送链路——订单如何从仓库走到客户手里。
order: 5
embed: official/iq-lab-retail-step-4
---

## 配送链路

客户下单之后，订单怎么送到他们手上？履约层把订单与实体物流基础设施连起来：

- **Shipment** — 一次配送记录
- **Carrier** — 物流承运商（FedEx、UPS 等）
- **Warehouse** — 存放并发运商品的履约中心

## Shipment

每条发运记录代表一次配送：

| 属性 | 类型 | 是否标识属性 |
|---|---|---|
| `shipmentId` | string | ✓ |
| `shipDate` | date | |
| `deliveryDate` | date | |
| `status` | string | |

## Carrier

负责配送的物流公司：

| 属性 | 类型 | 是否标识属性 |
|---|---|---|
| `carrierId` | string | ✓ |
| `carrierName` | string | |
| `serviceType` | string | |

## Warehouse

履约中心：

| 属性 | 类型 | 是否标识属性 |
|---|---|---|
| `warehouseId` | string | ✓ |
| `warehouseName` | string | |
| `capacity` | integer | |

## 新增关系

三条新关系把物流实体连了起来：

- **ShipmentFulfillsOrder** — `Shipment` → `Order`（多对一）
  每次发运完成一笔订单。同一笔订单可以由多次发运完成（拆单发货）。

- **ShipmentByCarrier** — `Shipment` → `Carrier`（多对一）
  每次发运由一家承运商负责。

- **ShipmentDepartedFromWarehouse** — `Shipment` → `Warehouse`（多对一）
  每次发运从一个仓库出发。

## 枢纽模式

注意 **Shipment** 是一个**枢纽实体**——它同时连到 Order、Carrier 和 Warehouse。这是交易类、事件类实体常见的模式，用来桥接多个概念：

```
Carrier ← Shipment → Order → Customer
              ↓
          Warehouse
```

从 Carrier 出发，经 Shipment 到 Order 再到 Customer，一次遍历就能回答："哪些客户收到了 CarrierX 发运的货？"

## 第四步的图谱

<ontology-embed id="official/iq-lab-retail-step-4" diff="official/iq-lab-retail-step-3" height="450px"></ontology-embed>

*十个实体类型构成一张丰富连通的图谱。Shipment 把物流层（Carrier、Warehouse）接到交易层（Order、Customer）。沿着图谱，你可以从任意仓库走到任意客户。*

## 我们学到了什么

- **枢纽实体**（如 Shipment）连接多个领域
- 物流层是交易层的延伸——不需要改动已有实体
- 图谱遍历让跨域查询变得自然："哪些仓库往西南地区发货？"不需要写 SQL 关联
- 本体现在有 10 个实体、10 条关系——在长大，但依然读得懂

```quiz
Q: Shipment 实体在本体里起什么作用？
- 它替代了 Order 实体
- 它作为枢纽，把物流层与交易层连起来 [correct]
- 它存放客户地址
- 它定义 Warehouse 与 Carrier 之间的基数
> Shipment 是枢纽实体，连接多个领域：它把 Order 接到物流基础设施（Carrier、Warehouse）上，从而在不改动已有实体的前提下支持跨域查询。
```

接下来，我们加入库存跟踪与需求预测。
