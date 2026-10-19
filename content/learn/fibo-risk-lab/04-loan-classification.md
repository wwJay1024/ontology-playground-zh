---
title: "第 3 步：贷款分类"
slug: loan-classification
description: 加入带巴塞尔风险权重的贷款类型、抵押物类别，以及 OCC/FDIC 集中度分组。
order: 4
embed: official/fibo-risk-step-3
reviewStatus: under-human-review
---

## 产品维度

我们已经建模了风险*发生在哪里*（地理）和*哪些门类*暴露（行业）。现在加入**贷款产品维度** —— 按类型对贷款分类、它们的抵押物，以及所属的监管集中度分组。

巴塞尔 III 的风险权重从这里进入画面。

## 新增实体类型

### 集中度类别

OCC/FDIC 指引定义的监管分组。银行必须按类别监测敞口。

| 属性 | 类型 | 说明 |
|---|---|---|
| `categoryId` | string | 标识属性（如 "CRE"、"C&I"、"CONSUMER"） |
| `name` | string | 显示名称 |
| `description` | string | 归入该类别的业务范围 |
| `occGuidance` | string | 相关的 OCC/FDIC 指引编号 |

示例类别：**CRE**（商业房地产）、**C&I**（商业与工业）、**消费类**、**农业**。

### 贷款类型

具体贷款产品，带巴塞尔 III 资本要求。

| 属性 | 类型 | 说明 |
|---|---|---|
| `loanTypeCode` | string | 标识属性（如 "residential_mortgage"） |
| `name` | string | 显示名称 |
| `baselRiskWeight` | decimal (%) | 巴塞尔 III 标准风险权重 |
| `regulatoryTreatment` | string | 监管机构对该产品的分类方式 |
| `capitalTier` | string | 资本计提档次 |
| `description` | string | 产品描述 |

关键示例：

| 贷款类型 | 巴塞尔风险权重 |
|---|---|
| 住宅按揭 | 35% |
| 汽车贷款 | 75% |
| SBA 贷款 | 0%（政府担保） |
| 建筑贷款 | 150% |
| CRE 按揭 | 100% |

### 抵押物类型

为贷款提供担保的资产类别，带回收预期。

| 属性 | 类型 | 说明 |
|---|---|---|
| `collateralTypeCode` | string | 标识属性 |
| `name` | string | 显示名称 |
| `recoveryExpectation` | string | 预期回收率（如“高”“中”“低”） |
| `description` | string | 资产类别描述 |

## 新增关系

- **loanClassifiedAs**：`LoanType` → `ConcentrationCategory`（多对一）—— 每种贷款类型映射到一个集中度分组
- **collateralClassifiedAs**：`CollateralType` → `ConcentrationCategory`（多对一）—— 抵押物类型也映射到集中度分组
- **typicallySecuredBy**：`CollateralType` → `LoanType`（多对多）—— 描述哪些抵押物类型通常为哪些贷款类型担保

## 设计模式：枢纽实体

**集中度类别**是一个*枢纽实体* —— 它把贷款分类子图连到模型的其他部分。贷款类型和抵押物类型都指向它，形成监管分析共用的参照点。

第 4 步中，监管限额也会连到集中度类别，使它成为合规查询的中心节点。

## 巴塞尔 III 风险权重：为什么重要

巴塞尔 III 为每类贷款设定风险权重，决定银行需要为它持有多少资本。住宅按揭 35% 的风险权重意味着每贷出一美元所需资本较少，而建筑贷款 150% 的权重意味着要多得多的资本。

这直接影响：

- **盈利能力**：风险权重越低，占用的资本越少，净资产收益率越高
- **组合策略**：银行在权衡风险权重的情况下优化贷款结构
- **监管合规**：超出风险加权资产上限会触发监管措施

## 第 3 步图谱（相对第 2 步的差异）

<ontology-embed id="official/fibo-risk-step-3" diff="official/fibo-risk-step-2" height="440px"></ontology-embed>

*三个新增实体构成贷款分类簇。集中度类别是连接贷款类型与抵押物类型的枢纽。*

```quiz
Q: 为什么建筑贷款的巴塞尔风险权重是 150%，而 SBA 贷款是 0%？
- 建筑贷款的审批流程更长
- SBA 贷款有政府担保，银行不承担信用风险；建筑贷款则面临较高的违约与完工风险 [correct]
- 建筑公司的盈利能力更低
- SBA 是“安全银行资产”的缩写
> 巴塞尔 III 风险权重反映银行承担的信用风险。SBA（小企业管理局）贷款由美国政府担保，银行没有信用风险。建筑贷款面临完工风险、市场风险和高违约率，银行必须为它持有 150% 的风险加权资本。
```
