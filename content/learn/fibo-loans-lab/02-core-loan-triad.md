---
title: 核心贷款三角
slug: core-loan-triad
description: 为 FIBO 的基础贷款三角建模 —— 贷款、借款人与出借人 —— 含属性与关系。
order: 2
embed: official/fibo-loans-step-1
reviewStatus: under-human-review
---

## 合同核心

每个借贷系统都从 FIBO 贷款与债务模块中的三个核心概念起步：

- **贷款** —— 债务工具与合同外壳（`LOAN/LoansGeneral/Loans`）
- **借款人** —— 承担还款义务的一方角色（`FBC/DebtAndEquities/Debt`）
- **出借人** —— 提供资金的发起方角色（`FBC/DebtAndEquities/Debt`）

在 FIBO 的 OWL 本体中，它们分别建模为 `fibo-loan-ln-ln:Loan`、`fibo-fbc-dae-dbt:Borrower` 与 `fibo-fbc-dae-dbt:Lender`。LOAN 模块导入并约束这些交易方角色概念，供贷款场景使用。我们简化了类的层级结构，但保留了核心语义。

## 关键属性

### 贷款

| 属性 | 类型 | 说明 |
|---|---|---|
| `loanId` | string | 标识属性 |
| `principalAmount` | decimal (USD) | 最初约定的金额 |
| `isInterestOnly` | boolean | 借款人在初始期限内是否只付利息 |

### 借款人

| 属性 | 类型 | 说明 |
|---|---|---|
| `borrowerId` | string | 标识属性 |
| `name` | string | 交易方名称 |
| `creditScore` | integer | 承销指标（如 FICO 评分） |

### 出借人

| 属性 | 类型 | 说明 |
|---|---|---|
| `lenderId` | string | 标识属性 |
| `name` | string | 机构名称 |
| `lenderType` | string | 分类（如“银行”“信用合作社”“按揭公司”） |

## 关系

FIBO 把贷款交易方角色建模为从合同对象指向交易方的关系：

- **owedBy**：`Loan` → `Borrower`（多对一）—— 一笔贷款只欠一个借款人，但一个借款人可以持有多笔贷款
- **originatedBy**：`Loan` → `Lender`（多对一）—— 一笔贷款由一个出借人发起，但一个出借人可以做多笔贷款

> **FIBO 参考**：在完整的 FIBO 模型中，借款人与出借人是合同交易方角色概念，通过债务与贷款本体使用，其角色语义根植于交易方与合同模式。为清晰起见，我们采用简化的直接实体模型。参见 [FBC Debt](https://github.com/edmcouncil/fibo/tree/master/FBC/DebtAndEquities/Debt)、[LOAN LoansGeneral](https://github.com/edmcouncil/fibo/tree/master/LOAN/LoansGeneral/Loans) 与 [FND Parties](https://github.com/edmcouncil/fibo/tree/master/FND/Parties)。

## 第 1 步图谱

<ontology-embed id="official/fibo-loans-step-1" height="340px"></ontology-embed>

*三个实体、两个关系构成核心贷款三角 —— 每个 FIBO 借贷模型的基础。*

```quiz
Q: 哪个关系最能表达贷款的还款责任？
- Borrower → Loan（originatedBy）
- Loan → Borrower（owedBy）[correct]
- Lender → Loan（owedBy）
- Loan → Lender（hasCollateral）
> 在这个模型中，贷款通过 `owedBy` 指向借款人，从合同对象出发把还款义务表达清楚。这遵循了 FIBO 从工具指向交易方来表达义务的方向性建模方式。
```
