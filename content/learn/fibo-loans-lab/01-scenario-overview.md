---
title: 场景概览
slug: scenario-overview
description: FIBO 是什么、从哪来，以及本实验室要构建什么。
order: 1
reviewStatus: under-human-review
---

## 什么是 FIBO？

**金融业业务本体**（Financial Industry Business Ontology，FIBO）是由 [EDM Council](https://edmcouncil.org/) 与[对象管理组织](https://www.omg.org/)（OMG）共同制定的行业标准本体族。它为金融工具、交易各方、合同与监管概念提供了一套形式化、机器可读的词汇表。

FIBO 的特点：

- 以 [MIT 许可证](https://opensource.org/licenses/MIT)开源
- 托管在 GitHub 的 [edmcouncil/fibo](https://github.com/edmcouncil/fibo)
- 以 OWL 本体形式发布于 [spec.edmcouncil.org/fibo](https://spec.edmcouncil.org/fibo/)
- 自 2012 年起持续开发，有大型金融机构、监管机构和标准组织参与贡献

> **来源**：本实验室的概念主要改编自 `LOAN/LoansGeneral/Loans`，并参考了 `FBC/DebtAndEquities/Debt`、`FBC/ProductsAndServices/ClientsAndAccounts` 与 `FND/OwnershipAndControl/Ownership` 中的相关概念。完整源模块见 [FIBO GitHub 仓库](https://github.com/edmcouncil/fibo)。

## 为什么要做这个实验室

FIBO 规模很大 —— 数百个本体模块，覆盖证券、衍生品、公司行为、指数等等。仅 `LOAN` 领域就横跨多个子模块：

| FIBO 模块 | 内容 |
|---|---|
| `LOAN/LoansGeneral/Loans` | 贷款生命周期概念（贷款、服务、还款历史、留置权与所有权分类器） |
| `FBC/DebtAndEquities/Debt` | 借款人/出借人角色、抵押物、担保协议、债务条款 |
| `FBC/ProductsAndServices/ClientsAndAccounts` | 还款历史所用的交易记录与单笔交易 |
| `LOAN/RealEstateLoans/Mortgages` | 房地产特有的约束（不动产抵押物与按揭结构） |
| `FND/OwnershipAndControl/Ownership` | 被贷款所有权分类器复用的所有权语义 |

*（来源：[FIBO 本体结构](https://github.com/edmcouncil/fibo/tree/master/LOAN)）*

本实验室抽取了一个适合教学的子集，聚焦贷款合同与还款流程，让你不必在完整的模块层级中穿行，也能学到 FIBO 的建模模式。

## 我们要构建的模型

在四个递进步骤中，我们会建模一个包含 10 个实体类型、10 个关系的**贷款本体**：

1. **核心贷款三角** —— `Loan`、`Borrower`、`Lender`
2. **抵押物与还款计划** —— `Collateral`、`LoanPaymentSchedule`
3. **服务与还款历史** —— `Servicer`、`PaymentHistory`、`PaymentTransaction`
4. **风险分类器** —— `OwnershipInterest`、`LenderLienPosition`

## 这个模型能回答的实际问题

- 哪些有抵押的贷款处于次级留置顺位？
- 哪些借款人的只付息贷款超过本金阈值？
- 还款交易模式在不同服务商之间有何差异？
- 哪些所有权结构与还款问题相关？

## 许可与署名

本实验室改编自 EDM Council 的 FIBO 本体：

- **版权**：EDM Council, Inc. 与 Object Management Group, Inc.（具体年份区间见各模块文件头）
- **许可证**：[MIT 许可证](https://opensource.org/licenses/MIT)
- **源仓库**：[github.com/edmcouncil/fibo](https://github.com/edmcouncil/fibo)
- **规范**：[spec.edmcouncil.org/fibo](https://spec.edmcouncil.org/fibo/)

本实验室中的本体文件是简化过的、面向课堂的改编版本。它们保留了 FIBO 的核心语义，同时降低了复杂度，便于分步讲解。

```quiz
Q: FIBO 由哪个组织开发和维护？
- 世界银行
- EDM Council 与对象管理组织（OMG）[correct]
- 欧洲中央银行
- W3C Web 本体工作组
> FIBO 由 EDM Council（企业数据管理委员会）与对象管理组织合作开发，以 MIT 许可证开源，托管在 GitHub 的 edmcouncil/fibo。
```
