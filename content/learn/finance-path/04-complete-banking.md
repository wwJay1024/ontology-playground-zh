---
title: "完整的银行模型"
slug: complete-banking
description: "加入贷款与投资，补全银行本体，把信贷产品与投资组合持仓连接起来。"
order: 4
embed: official/finance-step-3
---

## 金融产品

除了基础账户与交易，银行还提供两大类产品：

- **贷款** —— 银行放出资金的信贷产品
- **投资** —— 客户用来积累财富的持仓

加入这两类，整个图景就完整了，也产生了有意思的多路径关系。

## 贷款

| 属性 | 类型 | 标识属性？ |
|---|---|---|
| `loanId` | string | ✓ |
| `principal` | decimal (USD) | |
| `apr` | decimal (%) | |
| `term` | integer (months) | |
| `status` | string | |

`term` 是以月为单位的整数 —— 这是表示时长属性的常见做法。`apr`（年化百分比利率）使用百分比单位。

## 投资

| 属性 | 类型 | 标识属性？ |
|---|---|---|
| `holdingId` | string | ✓ |
| `symbol` | string | |
| `shares` | decimal | |
| `purchasePrice` | decimal (USD) | |
| `currentValue` | decimal (USD) | |

`symbol` 属性（如 MSFT、AAPL）标识股票。同时具备 `purchasePrice` 和 `currentValue`，就能计算盈亏。

## 新关系

四个关系把金融产品连接起来：

- **has_loan**：`Customer` → `Loan`（一对多）
  一个客户可以有多笔贷款。

- **funds**：`Account` → `Loan`（一对多）
  账户是贷款还款的资金来源。

- **holds**：`Customer` → `Investment`（一对多）
  客户的投资组合。

- **linked_to**：`Account` → `Investment`（一对多）
  经纪账户与其下投资持仓的关联。

> **多路径模式：** 投资通过*两条*不同路径连到客户：直接经 `holds`，间接经 `Account → linked_to`。这种冗余是刻意的 —— 它同时表达了所有权（谁持有？）和资金来源（哪个账户支撑？）。

## 完整图谱

<ontology-embed id="official/finance-step-3" diff="official/finance-step-2" height="500px"></ontology-embed>

*完整的银行与金融本体：5 个实体、6 个关系。贷款与投资同时通过客户和账户连接。*

## 完整模型能回答什么

| 问题 | 图路径 |
|---|---|
| 哪些高风险客户有大额贷款？ | `Customer (riskProfile=high)` → `Loan (principal > 100K)` |
| 头部客户的投资组合市值是多少？ | `Customer` → `Investment`（currentValue 求和） |
| 哪些账户同时为贷款和投资提供资金？ | `Account` → `Loan` 且 `Account` → `Investment` |
| 哪些客户的投资收益超过其贷款成本？ | `Customer` → `Investment (currentValue)` 对比 `Customer` → `Loan (principal × apr)` |

## GQL 查询示例

找出投资组合市值超过其贷款本金总额的客户：

```gql
MATCH (c:Customer)-[:holds]->(inv:Investment),
      (c)-[:has_loan]->(loan:Loan)
WITH c, SUM(inv.currentValue) AS portfolio, SUM(loan.principal) AS debt
WHERE portfolio > debt
RETURN c.name, portfolio, debt
```

## 我们构建了什么

| 步骤 | 新增实体 | 累计 | 关键概念 |
|---|---|---|---|
| 1 | 客户、账户 | 2 | 所有权、金融标识属性 |
| 2 | 交易 | 3 | 活动记录、datetime 精度 |
| 3 | 贷款、投资 | 5 | 金融产品、多路径关系 |

## 关键收获

1. **所有权链**（`Customer → Account → Transaction`）支撑合规查询
2. **Datetime 精度**对金融数据至关重要
3. **多路径关系**表达同一条连接的不同侧面
4. **时长属性**（以月为单位的 term）用整数加单位表示
5. 金融本体描述数据的形状 —— 敏感数据仍留在源系统中

```quiz
Q: 为什么投资同时连到客户（经 "holds"）和账户（经 "linked_to"）？
- 这是错误的，只需要一个关系
- 两个关系各表达一个侧面：所有权与资金来源 [correct]
- 投资至少需要两个关系才有效
- 一对多关系总是成对出现
> “holds”回答“这笔投资归谁所有”，而“linked_to”回答“哪个账户为它出资”。这是两个不同的问题，答案也可能不同（例如共同账户为其中一人的投资出资）。
```

你已经完成银行与金融学习路径！从[本体目录](#/catalogue)加载任意一个步骤，即可交互式查看。
