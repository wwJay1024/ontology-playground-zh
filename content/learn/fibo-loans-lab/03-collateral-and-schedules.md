---
title: 抵押物与还款计划
slug: collateral-and-schedules
description: 借助 FIBO 的抵押物与还款计划概念，加入担保协议与还款节奏。
order: 3
embed: official/fibo-loans-step-2
reviewStatus: under-human-review
---

## 从合同到结构

加入 FIBO 的这两个概念后，贷款才具备运营意义：

- **抵押物** —— 为还款提供担保的资产（改编自 [FBC/DebtAndEquities/Debt](https://github.com/edmcouncil/fibo/tree/master/FBC/DebtAndEquities/Debt) 中的 `fibo-fbc-dae-dbt:Collateral`）
- **贷款还款计划** —— 还款在时间上应如何安排（改编自 [LOAN/LoansGeneral/Loans](https://github.com/edmcouncil/fibo/tree/master/LOAN/LoansGeneral/Loans) 中的 `fibo-loan-ln-ln:LoanPaymentSchedule`）

这两项补充对应 FIBO 关注的两个核心：**担保协议**与**带时间维度的义务**。

## 新增属性

### 抵押物

| 属性 | 类型 | 说明 |
|---|---|---|
| `assetType` | string | 标识属性 —— 资产种类（如“不动产”“车辆”“证券”） |
| `appraisedValue` | decimal (USD) | 评估时点的市场价值 |

> **FIBO 参考**：在完整本体中，债务抵押物建模为 `fibo-fbc-dae-dbt:Collateral`，可表示有形与无形的质押资产。在 FIBO 的按揭模块（[LOAN/RealEstateLoans/Mortgages](https://github.com/edmcouncil/fibo/tree/master/LOAN/RealEstateLoans/Mortgages)）中，`LoanSecuredByRealEstate` 把抵押物约束为 `fibo-fnd-plc-rp:RealProperty`，并通过 `owl:Restriction` 块关联到 `SecurityAgreement`。

### 贷款还款计划

| 属性 | 类型 | 说明 |
|---|---|---|
| `scheduleId` | string | 标识属性 |
| `expectedPayments` | integer | 预期的还款期数 |

## 新增关系

- **securedBy**：`Loan` → `Collateral`（一对多）—— 一笔贷款可以由多项资产担保
- **repaidBySchedule**：`Loan` → `LoanPaymentSchedule`（一对一）—— 每笔贷款只有一个主还款计划

## 第 2 步图谱（相对第 1 步的差异）

<ontology-embed id="official/fibo-loans-step-2" diff="official/fibo-loans-step-1" height="380px"></ontology-embed>

*新增实体已高亮：抵押物与贷款还款计划为贷款模型补上了担保与时间结构。*

```quiz
Q: 在 FIBO 中，抵押物（Collateral）概念源自哪里？
- LOAN/LoansGeneral/Loans
- FBC/DebtAndEquities/Debt [correct]
- FND/Agreements/Contracts
- FND/Places/RealProperty
> 抵押物定义在 FIBO 的 FBC（金融业务与商业）域下的 DebtAndEquities/Debt 中。它表示质押用于担保还款义务的资产 —— 这一概念适用于所有有担保的借贷类型，而不只是按揭。
```
