---
title: 服务与还款历史
slug: servicing-and-payment-history
description: 用 FIBO 的服务机构与可审计的还款事件扩展模型。
order: 4
embed: official/fibo-loans-step-3
reviewStatus: under-human-review
---

## 运营生命周期

贷款发起之后进入服务环节。FIBO 用两个模块表达这一转变：

- **服务商** —— 收取并处理还款的机构（改编自 [LOAN/LoansGeneral/Loans](https://github.com/edmcouncil/fibo/tree/master/LOAN/LoansGeneral/Loans) 中的 `fibo-loan-ln-ln:Servicer`）
- **还款历史** —— 汇总的还款记录（改编自 [LOAN/LoansGeneral/Loans](https://github.com/edmcouncil/fibo/tree/master/LOAN/LoansGeneral/Loans) 中的 `fibo-loan-ln-ln:PaymentHistory`，它继承了 [FBC/ProductsAndServices/ClientsAndAccounts](https://github.com/edmcouncil/fibo/tree/master/FBC/ProductsAndServices/ClientsAndAccounts) 的交易记录模式）
- **还款交易** —— 单笔还款事件（改编自 `fibo-loan-ln-ln:IndividualPaymentTransaction`，后者基于 `fibo-fbc-pas-caa:IndividualTransaction`）

这与真实借贷平台把合同约定与执行日志分开的做法一致。

## 新增属性

### 服务商

| 属性 | 类型 | 说明 |
|---|---|---|
| `servicerId` | string | 标识属性 |
| `organizationName` | string | 服务机构的名称 |

### 还款历史

| 属性 | 类型 | 说明 |
|---|---|---|
| `paymentHistoryId` | string | 标识属性 |

### 还款交易

| 属性 | 类型 | 说明 |
|---|---|---|
| `paymentTransactionId` | string | 标识属性 |
| `amount` | decimal (USD) | 还款金额 |
| `postedAt` | datetime | 还款的记录时间 |

## 新增关系

- **servicedBy**：`Loan` → `Servicer`（多对一）—— 多笔贷款可以由同一家机构服务
- **hasPaymentHistory**：`LoanPaymentSchedule` → `PaymentHistory`（一对一）—— 把计划中的预期与实际记录连起来
- **hasIndividualPayment**：`PaymentHistory` → `PaymentTransaction`（一对多）—— 每份历史包含多笔交易事件

## 审计轨迹

有了这些连接，你可以在模型中走出一条清晰的路径：

`Loan` → `LoanPaymentSchedule` → `PaymentHistory` → `PaymentTransaction`

这条路径支撑审计查询、逾期分析和服务质量指标 —— 正是本体驱动的数据集成最有价值的图遍历场景。

> **FIBO 参考**：在生产版 FIBO 中，贷款服务与还款历史模式横跨 LOAN 与 FBC 模块：`Loan` 关联到贷款专用账户，还款历史建模为交易记录，单笔还款交易记录事件级事实。我们的简化模型保留了这一核心模式。参见 [LOAN/LoansGeneral/Loans](https://github.com/edmcouncil/fibo/tree/master/LOAN/LoansGeneral/Loans) 与 [FBC/ProductsAndServices/ClientsAndAccounts](https://github.com/edmcouncil/fibo/tree/master/FBC/ProductsAndServices/ClientsAndAccounts)。

## 第 3 步图谱（相对第 2 步的差异）

<ontology-embed id="official/fibo-loans-step-3" diff="official/fibo-loans-step-2" height="420px"></ontology-embed>

*三个新增实体（服务商、还款历史、还款交易）构成运营层，用于跟踪贷款生命周期事件。*

```quiz
Q: 金额（amount）与入账时间（postedAt）这类单笔还款事件，应该放在哪个实体内？
- Loan
- Servicer
- PaymentHistory
- PaymentTransaction [correct]
> 还款历史是汇总容器。单笔事件属于还款交易，它保存用于对账与审计的事件级细节。这种拆分遵循 FIBO 区分汇总记录与单笔交易的建模方式。
```
