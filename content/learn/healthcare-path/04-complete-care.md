---
title: "完整照护模型"
slug: complete-care
description: "加入处方，补全医疗本体——把诊断连到治疗，闭合照护周期。"
order: 4
embed: official/healthcare-step-3
---

## 治疗链路

医疗这块拼图的最后一片是**处方**——针对诊断给出的治疗措施。它闭合了整个照护周期：预约 → 诊断 → 治疗。

## 处方实体

| 属性 | 类型 | 是否标识属性 |
|---|---|---|
| `rxNumber` | string | ✓ |
| `medication` | string | |
| `dosage` | string | |
| `frequency` | string | |
| `refillsRemaining` | integer | |

标识属性是 `rxNumber`（处方编号）——药房通用的标识。整数型的 `refillsRemaining` 让续配跟踪和用药依从性监测成为可能。

## 新增关系

- **treated_by**——`Diagnosis` → `Prescription`（一对多）
  一个诊断可以对应多张处方（例如同一病症开了多种药）。

- **prescribes**——`Provider` → `Prescription`（一对多）
  服务提供方为患者开具处方。

> **照护链路：** 完整路径现在是 `Patient → Diagnosis → Prescription`，而服务提供方在每一环都有连接（看诊预约、做出诊断、开具处方）。这与真实的临床工作流一致。

## 完整图谱

<ontology-embed id="official/healthcare-step-3" diff="official/healthcare-step-2" height="500px"></ontology-embed>

*完整的医疗本体：5 个实体、6 个关系。照护链路从患者经诊断流向处方。*

## 完整模型能回答什么

| 问题 | 图谱路径 |
|---|---|
| 哪些患者需要续配处方？ | 患者 → 诊断 → 处方 (refillsRemaining=0) |
| 哪些服务提供方开的药最多？ | 服务提供方 → 处方（计数） |
| 哪些重症诊断还没有治疗方案？ | 诊断 (severity=severe) 且无 → 处方 |
| 哪些专科服务提供方诊断的病症正是自己开药的病症？ | 服务提供方 → 诊断 且 服务提供方 → 处方 |

## GQL 查询示例

查找诊断严重、处方即将用完的患者：

```gql
MATCH (p:Patient)-[:diagnosed_with]->(d:Diagnosis)-[:treated_by]->(rx:Prescription)
WHERE d.severity = 'severe' AND rx.refillsRemaining <= 1
RETURN p.patientId, d.description, rx.medication, rx.refillsRemaining
```

## 我们构建了什么

| 步骤 | 新增实体 | 累计 | 关键概念 |
|---|---|---|---|
| 1 | 患者、服务提供方、预约 | 3 | 共享实体、排班 |
| 2 | 诊断 | 4 | 标准化编码、双向连接 |
| 3 | 处方 | 5 | 照护链路、治疗跟踪 |

## 要点回顾

1. **共享实体**（预约、诊断）把多个参与者连在一起
2. **标准化编码**（ICD、Rx）实现跨系统互通
3. **照护链路**（患者 → 诊断 → 处方）刻画临床工作流
4. **服务提供方贯穿每一环**——这反映了其在医疗交付中的核心位置
5. **整数属性**（refillsRemaining、duration）支撑运营类查询

```quiz
Q: 在完整的医疗本体中，服务提供方是如何连接的？
- 只连接预约
- 连接预约、诊断和处方——体现其在照护各环节的角色 [correct]
- 直接连接患者
- 只连接处方
> 服务提供方是这个本体中连接最多的实体——看诊、诊断、开方都有它。真实世界里也是如此：医疗服务的每个环节都离不开服务提供方。
```

你已完成医疗系统学习路径！在[本体目录](#/catalogue)中加载任一步骤，即可交互探索。
