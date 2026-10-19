---
title: "第 1 步：行业分类"
slug: industry-classification
description: 为经济层级建模 —— 门类、子门类与行业组，带上气候与周期属性。
order: 2
embed: official/fibo-risk-step-1
reviewStatus: under-human-review
---

## 为什么要给行业分类？

银行需要了解自己在各经济部门的敞口。如果组合中 40% 的贷款投向建筑公司，一轮房地产下行就可能是灾难性的。**NAICS**（北美行业分类体系）提供了标准分类体系，FIBO 正是在它之上构建的。

这一步我们建模一个三层级结构：门类 → 子门类 → 行业组，并配上与风险相关的属性。

## 实体类型

### 门类

最宽的分类 —— 比如“制造业”“金融业”“医疗”。

| 属性 | 类型 | 说明 |
|---|---|---|
| `sectorCode` | string | 标识属性（如 "31-33"） |
| `sectorName` | string | 显示名称 |
| `description` | string | 该门类覆盖的范围 |

### 子门类

门类之下的细分 —— “制造业”里的“食品制造”。

| 属性 | 类型 | 说明 |
|---|---|---|
| `subsectorCode` | string | 标识属性（如 "311"） |
| `subsectorName` | string | 显示名称 |

### 行业组

最细的层级，带有投资组合分析所需的风险属性。

| 属性 | 类型 | 说明 |
|---|---|---|
| `naicsCode` | string | 标识属性 —— 官方 NAICS 编码 |
| `name` | string | 行业名称 |
| `cyclicality` | string | 对经济周期的敏感程度（如“高”“低”“逆周期”） |
| `climateSensitivity` | string | 对气候事件的暴露程度（如“高”“中”“低”） |
| `essentialServices` | boolean | 该行业是否提供基础服务（抗冲击能力更强） |
| `description` | string | 行业描述 |

## 关系

- **partOfSector**：`Subsector` → `Sector`（多对一）—— 每个子门类只属于一个门类
- **belongsToSubsector**：`IndustryGroup` → `Subsector`（多对一）—— 每个行业组只属于一个子门类

这就形成一个严格的层级：`Sector` ← `Subsector` ← `IndustryGroup`

## 设计模式：分类层级

这是最常见的本体模式之一 —— **严格树形层级**，每个子节点只有一个父节点。它支持：

- **汇总聚合**：把一个子门类下所有行业组的贷款加总，得到子门类敞口
- **下钻分析**：从门类开始，下钻到子门类，再到具体行业组
- **风险属性继承**：如果一个门类是“周期性”的，它的所有子节点都继承这一风险语境

## 第 1 步图谱

<ontology-embed id="official/fibo-risk-step-1" height="340px"></ontology-embed>

*三个实体构成一棵分类树 —— 行业集中度分析的基础模式。*

```quiz
Q: 为什么行业组要包含 climateSensitivity 属性？
- 用于跟踪该行业的碳排放
- 让投资组合风险查询能按行业对飓风、山火等气候事件的暴露程度筛选 [correct]
- 为了满足 ESG 报告要求
- 用于计算贷款的保险费
> climateSensitivity 属性让风险分析师能识别贷款组合中哪些部分暴露于气候相关事件。结合下一步的地理数据，就能做强大的跨域集中度查询。
```
