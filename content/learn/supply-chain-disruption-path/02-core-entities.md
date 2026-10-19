---
title: "核心实体与属性"
slug: core-entities
description: "认识刻画供应链中断的 7 个实体类型和 40 个属性——从供应商、零部件一直到风险评估与缓解动作。"
order: 2
---

## 7 个实体类型

你的本体覆盖供应链中断的完整生命周期：从触发事件，到发现、评估和响应。

### 第一层：网络

**供应商**
- 表示提供原材料或零部件的外部公司
- 关键属性：`supplierId`（唯一）、`name`、`country`、`tier`（Tier 1/2/3）、`reliabilityScore`（0-100）、`singleSourced`（布尔）
- 用途：找出关键的单源供应商——它们是风险的放大器

**零部件**
- 从一家或多家供应商采购的零件、材料或子组件
- 关键属性：`componentId`、`name`、`category`（Electronic/Mechanical/Chemical/Packaging/Raw Material）、`daysOfSupplyOnHand`、`criticalityLevel`（Critical/High/Medium/Low）
- 用途：依据安全库存判断哪些零部件能扛住供应商断供

**产品线**
- 共用零部件的成品分组
- 关键属性：`productLineId`、`name`、`annualRevenue`、`marketSegment`、`productionStatus`（Active/At Risk/Halted/Discontinued）
- 用途：计算营收敞口和生产排期影响

### 第二层：中断

**中断事件**
- 打断或威胁一家或多家供应商正常供货的事件
- 关键属性：`eventId`、`type`（Natural Disaster/Geopolitical/Financial/Logistics/Quality Recall/Pandemic/Cyber Attack）、`severity`（Critical/High/Medium/Low）、`startDate`、`estimatedDurationDays`、`region`
- 用途：事件分类和严重程度决定升级层级与响应时限

### 第三层：分析

**风险评估**
- 中断波及供应链时对业务影响的分析
- 关键属性：`assessmentId`、`assessedDate`（datetime）、`revenueAtRisk`（USD）、`timeToImpactDays`、`confidenceLevel`（High/Medium/Low）、`recommendedAction`
- 用途：用业务语言（钱和时间）量化影响，排出响应优先级

**缓解措施**
- 降低或消除中断影响的具体动作
- 关键属性：`actionId`、`type`（Activate Alternative 供应商/Increase Safety Stock/Redesign 零部件/Reduce Production/Expedite 发运/客户 Communication）、`status`（Proposed/Approved/In Progress/Completed/Cancelled）、`estimatedCost`（USD）、`leadTimeSavedDays`
- 用途：记录已采取的动作，以及实际效果与预估效果的对比

### 第四层：备份

**备选供应商**
- 有资质替代主供应商的备份供应商
- 关键属性：`altSupplierId`、`name`、`country`、`qualificationStatus`（Pre-qualified/Approved/Pending Audit/Not Qualified）、`capacityAvailable`（units/month）、`pricePremiumPercent`（%）
- 用途：快速启用产能和成本都已知的备份

## 属性类型与校验

每个属性都有类型，AI 代理和看板据此工作：

| 类型 | 示例 | 在代理中的用途 |
|------|---------|---------------|
| `string` | 供应商名称、零部件类别 | 搜索、筛选、报表 |
| `integer` | 库存天数、产能、数量 | 阈值告警 |
| `decimal` | 营收、溢价百分比、可靠性评分 | 成本收益计算 |
| `date` | 中断开始日期 | 时间线比较 |
| `datetime` | 风险评估时间戳 | 审计追踪、趋势分析 |
| `enum` | 供应商层级、中断类型、严重程度 | 分类、决策树 |
| `boolean` | 单源标记 | 风险标记 |

## 标识属性

每个实体都有一个唯一标识：

```
供应商 → supplierId (e.g., "SUPP-00456")
零部件 → componentId (e.g., "COMP-SEM-0821")
产品线 → productLineId (e.g., "PL-LAP-2024")
中断事件 → eventId (e.g., "DISR-202405-TAIWAN-001")
风险评估 → assessmentId (e.g., "RA-20240501-SEM-001")
缓解措施 → actionId (e.g., "MA-20240501-ALT-SUPP")
备选供应商 → altSupplierId (e.g., "ALTSUPP-00789")
```

这些 ID 就是你和代理在查询、报表中引用具体实例的方式。

## 基数与关系

实体通过带基数的关系相连：

- **一对多**：一家供应商供应多个零部件；一次中断影响多家供应商
- **多对多**：零部件用在多条产品线上；缓解动作会启用多家替代供应商
- **多对一**：多家替代供应商可以替换同一家主供应商

下一步，我们看完整的关系图。
