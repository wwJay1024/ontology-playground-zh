---
title: "照护交付"
slug: care-delivery
description: "定义患者、服务提供方与预约这三个核心实体——它们支撑起医疗排班与照护交付。"
order: 2
embed: official/healthcare-step-1
---

## 照护交付的基础

医疗照护围绕三个概念展开：

- **患者**——谁在接受照护？
- **服务提供方**——谁在提供照护？
- **预约**——照护在何时、何地进行？

这三个实体刻画了医疗服务的排班与交付过程。每一次诊断与治疗，都从一次预约开始。

## 定义实体

### 患者

| 属性 | 类型 | 是否标识属性 |
|---|---|---|
| `patientId` | string | ✓ |
| `mrn` | string | |
| `dateOfBirth` | date | |
| `bloodType` | string | |
| `allergies` | string | |

`mrn`（病历号）是医院的内部标识。`patientId` 用作本体的标识属性，`mrn` 则是领域特有属性，对应到 EHR 系统。

### 服务提供方

| 属性 | 类型 | 是否标识属性 |
|---|---|---|
| `providerId` | string | ✓ |
| `name` | string | |
| `specialty` | string | |
| `licenseNumber` | string | |
| `department` | string | |

`specialty` 与 `department` 两个属性，让系统可以按临床领域筛选服务提供方——转诊与分诊查询都离不了它。

### 预约

| 属性 | 类型 | 是否标识属性 |
|---|---|---|
| `appointmentId` | string | ✓ |
| `scheduledTime` | datetime | |
| `duration` | integer (minutes) | |
| `type` | string | |
| `status` | string | |

`duration` 属性用整数表示分钟数，排班计算与利用率分析都依赖它。

## 关系

- **has_appointment**——`Patient` → `Appointment`（一对多）
  一名患者随时间可以有多条预约。

- **sees**——`Provider` → `Appointment`（一对多）
  一名服务提供方处理多条预约。

> **共享实体模式：** 预约同时连接患者与服务提供方，是两类独立实体交汇的地方。只要两个参与者共同参与同一件事，这种模式就会出现。

## 当前的图谱

<ontology-embed id="official/healthcare-step-1" height="350px"></ontology-embed>

*患者与服务提供方都连接到预约——照护交付的交汇点。*

## 小结

- **共享实体**（预约）连接两类独立参与者（患者、服务提供方）
- **时长类属性**用带单位的整数表示（分钟、小时、天）
- **领域标识**（MRN）与本体标识（patientId）可以并存
- 患者—预约—服务提供方这个排班三角，是医疗建模的起点

```quiz
Q: 为什么预约要同时连接患者和服务提供方，而不是只连其中一个？
- 为了让图谱看起来更完整
- 因为预约是共享实体，代表两类参与者之间的交互点 [correct]
- 因为每个实体至少要有两个关系
- 因为患者和服务提供方的属性相同
> 预约本身就是患者与服务提供方共同参与的事件。把两条关系都建出来，才能还原完整的排班图景，也才能从任一视角提问：“这位患者下次什么时候就诊？”或者“这位服务提供方每天看多少患者？”
```

接下来，我们加入诊断，用来记录病情。
