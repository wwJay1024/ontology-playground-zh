---
title: "第 4 步：监管语境"
slug: regulatory-context
description: 用银行监管法规、集中度限额与跨域连接补全模型。
order: 5
embed: official/fibo-risk-step-4
reviewStatus: under-human-review
---

## 收束全局

前三步建立的是参考数据：行业、地理与贷款分类。最后一步加入**监管执行层** —— 约束投资组合集中度的法规与量化限额。

本体在这里才真正具备运营价值：你可以从一笔具体贷款追到它的集中度类别，再追到适用的监管限额，并知道每个限额由哪部法规设定。

## 新增实体类型

### 监管法规

由银行监管机构发布的监管框架。

| 属性 | 类型 | 说明 |
|---|---|---|
| `regulationCode` | string | 标识属性（如 "OCC_CRE_2006"） |
| `name` | string | 法规名称 |
| `issuingAuthority` | string | 发布机构（OCC、FDIC、巴塞尔委员会） |
| `effectiveDate` | date | 生效日期 |
| `scope` | string | 适用范围 |
| `description` | string | 完整描述 |

### 监管限额

法规中的具体量化阈值。

| 属性 | 类型 | 说明 |
|---|---|---|
| `limitId` | string | 标识属性 |
| `limitName` | string | 显示名称 |
| `category` | string | 约束的维度 |
| `thresholdPct` | decimal (%) | 限额取值 |
| `severity` | string | 突破后的后果（如“提示”“需采取行动”“监管介入”） |
| `description` | string | 该限额的含义 |

关键示例：

| 限额 | 阈值 | 法规 |
|---|---|---|
| CRE 集中度 | 资本的 300% | OCC 2006-46 号指引 |
| 气候 + 飓风 | 投资组合的 15% | 内部风险政策 |
| 地理集中度 | 投资组合的 20% | OCC 2011-12 号公告 |
| 行业集中度 | 投资组合的 25% | FDIC 风险管理 |

## 新增关系

- **mandatedBy**：`RegulatoryLimit` → `Regulation`（多对一）—— 每个限额由特定法规设定
- **limitAppliesToCategory**：`RegulatoryLimit` → `ConcentrationCategory`（多对一）—— 把限额连到它所约束的集中度类别

## 设计模式：跨域桥接

通过 `limitAppliesToCategory`，监管层经集中度类别连到贷款分类层。这就形成了一条**跨域查询路径**：

```
Jurisdiction (hurricaneZone=true)
  → [geographic dimension]
    → ConcentrationCategory
      → [regulatory dimension]
        → RegulatoryLimit (thresholdPct)
          → Regulation (issuingAuthority)
```

再从行业一侧看：

```
IndustryGroup (climateSensitivity="high")
  → [industry dimension]
    → Subsector → Sector
```

## 完整模型

最终的本体横跨四个领域，包含 **11 个实体类型**和 **10 个关系**：

| 领域 | 实体 | 关系 |
|---|---|---|
| 行业 | 门类、子门类、行业组 | partOfSector、belongsToSubsector |
| 地理 | 区域、国家、司法辖区 | inCountry、inRegion |
| 贷款分类 | 集中度类别、贷款类型、抵押物类型 | loanClassifiedAs、collateralClassifiedAs、typicallySecuredBy |
| 监管 | 监管法规、监管限额 | mandatedBy、limitAppliesToCategory |

## 第 4 步图谱（相对第 3 步的差异）

<ontology-embed id="official/fibo-risk-step-4" diff="official/fibo-risk-step-3" height="480px"></ontology-embed>

*两个新增实体（监管法规与监管限额）补全模型。limitAppliesToCategory 关系把监管要求连到贷款分类。*

## 完整的外部参考本体

你也可以在外部目录中逐个查看各领域：

- [FIBO 行业分类](/#/catalogue/external/fibo/industry-classification)
- [FIBO 地理层级](/#/catalogue/external/fibo/geographic-hierarchy)
- [FIBO 贷款分类](/#/catalogue/external/fibo/loan-classification)
- [FIBO 监管语境](/#/catalogue/external/fibo/regulatory-context)

## 你构建了什么

你现在拥有一个完整的、受 FIBO 启发的风险管理本体，它支持：

- **行业集中度分析** —— 按门类、子门类和行业组汇总敞口
- **地理风险评估** —— 按灾害区标记筛选，并与组合数据交叉参照
- **巴塞尔 III 资本计算** —— 对贷款类型套用标准风险权重
- **监管合规监测** —— 对照法定限额检查组合集中度

这个模型支撑的正是那些在传统数据仓库里需要复杂多表 JOIN 的跨域风险查询，在本体驱动的系统里则可以表达为简单的图遍历。

## 许可

本实验室引用的全部 FIBO 本体内容：

- **版权** (c) 2016-2025 EDM Council, Inc. 与 Object Management Group, Inc.
- 依 [MIT 许可证](https://opensource.org/licenses/MIT)授权

```quiz
Q: 在完整模型中，集中度类别扮演什么角色？
- 它存储地理坐标
- 它作为枢纽实体，连接贷款分类、抵押物类型与跨领域的监管限额 [correct]
- 它为每类贷款定义巴塞尔风险权重
- 它在合规跟踪中取代监管法规实体
> 集中度类别是连接贷款分类领域与监管领域的中心枢纽。贷款类型和抵押物类型都归入它，监管限额又约束它。这使之成为跨域集中度风险查询的关键节点。
```
