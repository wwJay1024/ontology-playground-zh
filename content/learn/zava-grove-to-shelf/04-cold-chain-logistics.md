---
title: "冷链物流"
slug: cold-chain-logistics
description: "加入 Shipment 与 ColdChainSensor，为易腐物流这一层建模，并引入驱动 Zava 最重要预警规则的实时温度遥测。"
order: 4
embed: official/zava-grove-to-shelf-step-3
---

## Zava 一天里最贵的几分钟

HarvestLot 一旦离开包装厂，计时就开始了。水果是易腐的。某个品种在安全温度之上越限 15 分钟，就可能让一整个冷藏集装箱报废——损失轻松达到六位数收入。冷链这一层，是 Zava 在语义上的投入回报最明显的地方。

两个新实体表达这个领域：

- **Shipment**——一个冷藏集装箱或卡车，载着一批或多批 HarvestLot 运往零售配送中心。
- **ColdChainSensor**——挂在发运上的传感器，持续上报温度与湿度遥测。

## 实体

### Shipment

| 属性 | 类型 | 是否标识属性？ |
|---|---|---|
| `shipmentId` | 字符串 | ✓ |
| `departureDate` | 日期时间 | |
| `etaDate` | 日期时间 | |
| `modality` | 字符串 | |
| `containerId` | 字符串 | |

### ColdChainSensor

| 属性 | 类型 | 是否标识属性？ |
|---|---|---|
| `sensorId` | 字符串 | ✓ |
| `sensorModel` | 字符串 | |
| `temperatureC` | 小数（°C） | |
| `humidityPct` | 小数（%） | |

在 Microsoft Fabric IQ 中，`ColdChainSensor` 是**时序实体**的典型例子——它的读数绑定到 Eventhouse，而不是 Lakehouse 表。本体把这个差别藏了起来：查询沿 `Sensor → Shipment` 遍历，不必知道底层是哪种引擎。

## 新增关系

| 起点 | 关系 | 终点 | 基数 |
|---|---|---|---|
| Shipment | carries | HarvestLot | 一对多 |
| Shipment | monitoredBy | ColdChainSensor | 一对多 |

可以看到 `Shipment` 起到了**枢纽**作用——它把静态的数据湖仓世界（HarvestLot 谱系）与流式的事件库世界（传感器遥测）连了起来。

## 冷链越限查询

Zava 演示中的招牌问题：

> *「发运 SH-2026-04812 刚刚越过 9°C。哪些零售订单会受影响？」*

今天这是一个跨五个系统的人工追查。有了本体，它就是一次遍历：

```
ColdChainSensor[temperatureC > FruitVariety.maxStorageTempC + 2]
   → Shipment
   → HarvestLot
   → (later) Order → Store → Retailer
```

零售一侧，我们下一步再接。

## 目前的图谱

<ontology-embed id="official/zava-grove-to-shelf-step-3" diff="official/zava-grove-to-shelf-step-2" height="450px"></ontology-embed>

*八个实体。右侧分支（Sensor → Shipment）是实时遥测侧，左侧分支（HarvestLot → Plot → Farm → Grower）是谱系侧。本体把两边合在一起。*

```quiz
Q: 把 `Shipment` 称为「枢纽」实体是什么意思？
- 它是图谱里最大的实体
- 它用一个共享概念连起了原本分离的两个领域——谱系（采收批次）与遥测（传感器） [correct]
- 其他所有实体都必须经过它
- 枢纽是 RDF 规范的要求
> 枢纽实体连接的是原本存放在不同系统里的领域。Shipment 把 HarvestLot（湖仓里的谱系）与 ColdChainSensor（事件库里的遥测）接在一起，一次图谱遍历就能同时跨过两边。
```

接下来我们把回路接到零售——配送中心、门店，以及受影响的订单。
