---
title: "生产跟踪"
slug: production
description: "加入工单与零件，跟踪生产了什么——把设备与其制造产出连起来。"
order: 3
embed: official/manufacturing-step-2
---

## 从监测到生产

传感器告诉我们设备运行得*怎么样*，但我们还需要知道它在生产*什么*。**工单**与**零件**两个实体为工厂模型补上生产跟踪。

加入生产跟踪之后，就可以回答：

- “本班次哪台设备产出的零件最多？”
- “有多少工单已经延期？”
- “CNC-01 目前正在加工哪些零件？”

## 工单实体

| 属性 | 类型 | 是否标识属性 |
|---|---|---|
| `workOrderId` | string | ✓ |
| `priority` | string | |
| `status` | string | |
| `startDate` | date | |
| `dueDate` | date | |

工单同时有 `startDate` 和 `dueDate`，可以据此计算计划达成情况。再结合 `priority`，就能支撑生产计划类查询。

## 零件实体

| 属性 | 类型 | 是否标识属性 |
|---|---|---|
| `partId` | string | ✓ |
| `name` | string | |
| `material` | string | |
| `weight` | float | |
| `tolerance` | float | |

`tolerance` 属性定义允许的制造偏差。公差要求越紧的零件，越需要高精度设备——这是生产计划中的一条关键约束。

## 新增关系

- **assigned_to**——`Work-订单` → `Machine`（多对一）
  工单被分配到特定设备上生产。

- **produces**——`Work-订单` → `Part`（一对多）
  一张工单产出一个或多个零件。

- **has_part**——`Machine` → `Part`（一对多）
  设备产出零件（从产出视角看）。

> **生产链路：** `Machine ← Work-订单 → Part` 这条链借一个排产实体把设备与产出连起来。这与医疗场景中用预约连接患者和服务提供方是同一思路——中间那个实体代表事件本身。

## 图谱在生长

<ontology-embed id="official/manufacturing-step-2" diff="official/manufacturing-step-1" height="400px"></ontology-embed>

*工单与零件进入图谱，为 IoT 基础补上生产跟踪。diff 显示新增部分。*

## 小结

- **生产链路**借排产实体（工单）把设备与产出连起来
- **成对的日期属性**（startDate/dueDate）支撑计划达成跟踪
- **公差属性**表达制造精度要求
- 工厂模型现在既覆盖监测（传感器），也覆盖生产（工单）

```quiz
Q: 零件实体上的 tolerance 属性代表什么？
- 允许出现缺陷的零件数量上限
- 允许的制造偏差——超出公差的零件需要更高精度的设备 [correct]
- 加工该零件允许的时长
- 零件能承受的温度范围
> 公差定义零件实际尺寸相对规格可以偏差多少。公差越紧，越需要高精度设备，质量控制也越要细致——因此它是生产计划中的一条关键约束。
```

接下来，我们加入质量检查，闭合生产回路。
