---
title: 风险与分类器
slug: risk-and-classifiers
description: 加入 FIBO 的所有权与留置权分类器，支撑承销与抵押物风险分析。
order: 5
embed: official/fibo-loans-step-4
reviewStatus: under-human-review
---

## 分类层

FIBO 大量依赖显式分类器 —— 主要作用是给其他实体分类的实体。最后一步，我们加入两个对按揭与有担保借贷风险分析至关重要的概念：

- **所有权权益** —— 对抵押物的法定所有权类型分类（改编自 [LOAN/LoansGeneral/Loans](https://github.com/edmcouncil/fibo/tree/master/LOAN/LoansGeneral/Loans) 中的 `fibo-loan-ln-ln:OwnershipInterest`，根植于 `fibo-fnd-oac-own:Ownership`）
- **出借人留置权顺位** —— 对出借人针对抵押资产的受偿优先顺序分类（改编自 [LOAN/LoansGeneral/Loans](https://github.com/edmcouncil/fibo/tree/master/LOAN/LoansGeneral/Loans) 中的 `fibo-loan-ln-ln:LenderLienPosition`）

## 分类器为什么重要

在 FIBO 按揭模块（[LOAN/RealEstateLoans/Mortgages](https://github.com/edmcouncil/fibo/tree/master/LOAN/RealEstateLoans/Mortgages)）中，留置权顺位决定处置抵押物时的受偿优先顺序。第一顺位按揭的回收预期强于次级顺位，这直接影响：

- 信用风险建模
- 违约损失估计
- 投资组合风险汇总
- 监管资本计算

> **FIBO 参考**：FIBO 按揭本体用 `owl:Restriction` 块约束房地产抵押物与合同语义。在 LOAN 本体中，`SecurityAgreement` 和 `Loan` 进一步受 `LenderLienPosition`、`OwnershipInterest` 等分类器的使用约束。参见 [LOAN/RealEstateLoans/Mortgages.rdf](https://github.com/edmcouncil/fibo/blob/master/LOAN/RealEstateLoans/Mortgages.rdf) 与 [LOAN/LoansGeneral/Loans.rdf](https://github.com/edmcouncil/fibo/blob/master/LOAN/LoansGeneral/Loans.rdf)。

## 新增关系

- **classifiesCollateralOwnership**：`OwnershipInterest` → `Collateral`（一对多）
- **hasLienPosition**：`Collateral` → `LenderLienPosition`（多对一）

## 第 4 步图谱（相对第 3 步的差异）

<ontology-embed id="official/fibo-loans-step-4" diff="official/fibo-loans-step-3" height="460px"></ontology-embed>

*两个分类器实体（所有权权益与出借人留置权顺位）为模型补上风险与承销语义。*

## 完整的改编模型

你也可以查看基于同一批 FIBO 源概念构建的完整外部子集：

<ontology-embed id="external/fibo/loans-general" height="420px"></ontology-embed>

## 你构建了什么

你现在拥有一个递进的、受 FIBO 启发的贷款本体，覆盖：

| 层次 | 实体 | FIBO 源模块 |
|---|---|---|
| 合同参与方 | 贷款、借款人、出借人 | [LOAN/LoansGeneral/Loans](https://github.com/edmcouncil/fibo/tree/master/LOAN/LoansGeneral/Loans) |
| 担保与计划 | 抵押物、贷款还款计划 | [FBC/DebtAndEquities/Debt](https://github.com/edmcouncil/fibo/tree/master/FBC/DebtAndEquities/Debt) |
| 服务运营 | 服务商、还款历史、还款交易 | [LOAN/LoansGeneral/Loans](https://github.com/edmcouncil/fibo/tree/master/LOAN/LoansGeneral/Loans) + [FBC/ProductsAndServices/ClientsAndAccounts](https://github.com/edmcouncil/fibo/tree/master/FBC/ProductsAndServices/ClientsAndAccounts) |
| 风险分类器 | 所有权权益、出借人留置权顺位 | [LOAN/LoansGeneral/Loans](https://github.com/edmcouncil/fibo/tree/master/LOAN/LoansGeneral/Loans) + [FND/OwnershipAndControl/Ownership](https://github.com/edmcouncil/fibo/tree/master/FND/OwnershipAndControl) |

这是一个很好的起点，可以继续扩展到特定领域的模块 —— 按揭类型、HELOC 产品、汽车贷款或小微企业贷款。

## 延伸阅读

- **FIBO GitHub**：[github.com/edmcouncil/fibo](https://github.com/edmcouncil/fibo)
- **FIBO 规范**：[spec.edmcouncil.org/fibo](https://spec.edmcouncil.org/fibo/)
- **EDM Council**：[edmcouncil.org](https://edmcouncil.org/)
- **FIBO 贷款模块**：[LOAN/LoansGeneral/Loans 源码](https://github.com/edmcouncil/fibo/tree/master/LOAN/LoansGeneral/Loans)
- **FIBO 按揭模块**：[LOAN/RealEstateLoans/Mortgages 源码](https://github.com/edmcouncil/fibo/tree/master/LOAN/RealEstateLoans/Mortgages)
- **FIBO 债务模块**：[FBC/DebtAndEquities/Debt 源码](https://github.com/edmcouncil/fibo/tree/master/FBC/DebtAndEquities/Debt)
- **FIBO 客户与账户模块**：[FBC/ProductsAndServices/ClientsAndAccounts 源码](https://github.com/edmcouncil/fibo/tree/master/FBC/ProductsAndServices/ClientsAndAccounts)

## 许可

本实验室引用的全部 FIBO 本体内容：

- **版权**归 EDM Council, Inc. 与 Object Management Group, Inc.（具体年份区间见各模块文件头）
- 依 [MIT 许可证](https://opensource.org/licenses/MIT)授权

MIT 许可证允许使用、修改和再分发这些本体文件，包括商业用途，前提是保留版权声明。本实验室中的本体文件是为教学目的制作的改编子集。

```quiz
Q: 在抵押物模型中加入出借人留置权顺位，主要价值是什么？
- 它取代了对借款人信息的需求
- 它表达出借人的受偿优先顺序，这对信用风险与损失建模至关重要 [correct]
- 它保存还款时间戳
- 它自动决定贷款利率
> 留置权顺位表达受偿优先顺序（例如第一顺位与次级顺位），直接影响处置抵押物时的回收预期。这对承销、投资组合风险模型与监管资本计算都很关键 —— 这也是 FIBO 债务与权益模块中的核心概念。
```
