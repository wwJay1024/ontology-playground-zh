---
title: "完整工厂模型"
slug: complete-factory
description: "加入质量检查，补全制造本体——从生产到检验形成回路。"
order: 4
embed: official/manufacturing-step-3
---

## 闭合质量回路

零件生产出来，制造流程并没有结束——它还要经过检验。**质量检查**验证零件是否符合规格，让生产周期就此闭合。

## 质量检查实体

| 属性 | 类型 | 是否标识属性 |
|---|---|---|
| `checkId` | string | ✓ |
| `inspector` | string | |
| `checkDate` | date | |
| `passed` | boolean | |
| `defectCode` | string | |

`passed` 这个布尔属性是关键——它决定零件是发运还是返工。`defectCode` 属性给失效情况分类，供根因分析使用。

## 新增关系

- **inspects**——`Quality-Check` → `Part`（多对一）
  每次质量检查针对一个具体零件。一个零件可能经历多次检验（首检、返工后复检）。

> **反馈回路：** 质量检查不合格时，生产链会反向追溯：`Quality-Check (passed=false) → Part → Work-Order → Machine`。智能工厂正是靠这条反馈回路找出有问题的设备，逐步提升生产质量。

## 完整图谱

<ontology-embed id="official/manufacturing-step-3" diff="official/manufacturing-step-2" height="500px"></ontology-embed>

*完整的智能制造本体：5 个实体、5 个关系。质量检查让检验结果回流到生产环节。*

## 完整模型能回答什么

| 问题 | 图谱路径 |
|---|---|
| 哪些设备产出的零件检验不合格？ | 设备 → 零件 ← 质量检查 (passed=false) |
| 生产不合格零件时，哪些传感器读数异常？ | 传感器 → 设备 → 零件 ← 质量检查 (passed=false) |
| 按工单优先级看，缺陷率分别是多少？ | 工单 (priority) → 零件 ← 质量检查 |
| 哪些零件需要复检？ | 零件 ← 质量检查 (passed=false, count > 1) |

## GQL 查询示例

把传感器异常与质量失效关联起来：

```gql
MATCH (s:Sensor)-[:monitors]->(m:Machine)-[:has_part]->(p:Part)<-[:inspects]-(qc:QualityCheck)
WHERE s.lastReading > s.threshold AND qc.passed = false
RETURN m.name, s.type, s.lastReading, p.name, qc.defectCode
```

## 我们构建了什么

| 步骤 | 新增实体 | 累计 | 关键概念 |
|---|---|---|---|
| 1 | 设备、传感器 | 2 | IoT 层级、遥测 |
| 2 | 工单、零件 | 4 | 生产链路、公差 |
| 3 | 质量检查 | 5 | 反馈回路、检验 |

## 要点回顾

1. **IoT 层级结构**把传感器组织在设备之下，便于遥测数据聚合
2. **生产链路**借排产实体把设备与产出连起来
3. **质量反馈回路**让沿生产链的根因分析成为可能
4. **基于阈值的告警**驱动预测性维护
5. **布尔属性**（passed）在工作流中形成清晰的判断点

```quiz
Q: 质量检查如何在制造本体中形成反馈回路？
- 它直接连接设备
- 检验不合格会沿“零件 → 工单 → 设备”回溯，定位缺陷来源 [correct]
- 它回连到传感器实体
- 质量检查不会形成反馈回路
> 质量检查不合格时，质量检查 → 零件 → 工单 → 设备 这条路径能把缺陷追溯到源头。这条反馈回路是智能制造持续改进的基础——它能指出是哪些设备、哪些工单或哪些条件产出了不合格零件。
```

你已完成智能制造学习路径！在[本体目录](#/catalogue)中加载任一步骤，即可交互探索。
