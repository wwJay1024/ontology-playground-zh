---
title: "车间"
slug: factory-floor
description: "定义设备与传感器——它们是实时监控工厂装备的物联网基础。"
order: 2
embed: official/manufacturing-step-1
---

## 物联网基础

每座智能工厂都从两个概念起步：

- **设备**——车间里有哪些机器？
- **传感器**——它们在产生什么数据？

设备与传感器构成遥测主干。要跟踪生产或质量，先得知道哪些机器在运行、在报告什么。

## 定义实体

### 设备

| 属性 | 类型 | 是否标识属性 |
|---|---|---|
| `machineId` | string | ✓ |
| `name` | string | |
| `type` | string | |
| `status` | string | |
| `installDate` | date | |

`status` 属性记录运行状态——`running`、`idle`、`maintenance` 或 `offline`。实时看板与保养排程都依赖它。

### 传感器

| 属性 | 类型 | 是否标识属性 |
|---|---|---|
| `sensorId` | string | ✓ |
| `type` | string | |
| `unit` | string | |
| `lastReading` | float | |
| `threshold` | float | |

`threshold` 属性定义告警边界。当 `lastReading` 超过 `threshold` 时，系统触发告警。这个模式是预测性维护的基础。

## 关系

- **monitors**——`Sensor` → `Machine`（多对一）
  多台传感器监测同一台设备——一台测温度，另一台测振动，如此类推。

> **归属层级：** 在 IoT 本体中，传感器归属于设备。方向很关键：传感器监测设备，而不是反过来。这种父子层级正是 IoT 平台组织遥测数据的方式。

## 当前的图谱

<ontology-embed id="official/manufacturing-step-1" height="300px"></ontology-embed>

*一个简单但有意义的起点：设备由传感器监测。*

## 小结

- **IoT 层级结构**用父子关系表达（传感器 → 设备）
- **状态属性**支撑实时运行跟踪
- **阈值属性**驱动预测性维护告警
- 只有两个实体，也能构成可用的遥测主干

```quiz
Q: 为什么传感器实体要同时有 lastReading 和 threshold 两个属性？
- 为了在一个值出错时保留备份
- threshold 定义告警边界——lastReading 超过它时，系统触发告警，用于预测性维护 [correct]
- 所有 IoT 标准都要求这两个值
- threshold 用来计算传感器的精度
> 阈值模式是预测性维护的基础。把当前读数与已知的安全边界比较，系统就能自动发现异常，在设备故障发生之前通知运维人员。
```

接下来，我们用工单和零件补上生产跟踪。
