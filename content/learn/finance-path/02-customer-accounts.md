---
title: "客户与账户"
slug: customer-accounts
description: "定义客户与账户这对银行地基，配上所有权关系与金融属性。"
order: 2
embed: official/finance-step-1
---

## 银行的地基

每家金融机构都从两个核心概念起步：

- **客户** —— 谁持有账户？
- **账户** —— 钱存在哪里、在哪里管理？

这一对概念构成任何银行本体的基础。其他所有金融产品都要通过它们建立连接。

## 定义实体

### 客户

| 属性 | 类型 | 标识属性？ |
|---|---|---|
| `customerId` | string | ✓ |
| `name` | string | |
| `ssn` | string | |
| `creditScore` | integer | |
| `riskProfile` | string | |

`creditScore` 是整数（300–850），用于放贷决策。`riskProfile` 属性记录银行的评估结果，供合规与监控使用。

> **敏感数据提示：** `ssn` 这类属性在本体中只是元数据 —— 它们描述*存在*哪些数据，而不是数据的实际取值。本体是模式，不是数据库。

### 账户

| 属性 | 类型 | 标识属性？ |
|---|---|---|
| `accountNumber` | string | ✓ |
| `type` | string | |
| `balance` | decimal (USD) | |
| `interestRate` | decimal (%) | |
| `openDate` | date | |

`type` 属性区分活期、储蓄与经纪账户。`interestRate` 使用百分比单位。

## 所有权关系

- **owns**：`客户` → `Account`（一对多）
  一个客户可以拥有多个账户（活期、储蓄、经纪），但每个账户只属于一个客户。

## 目前的图谱

<ontology-embed id="official/finance-step-1" height="300px"></ontology-embed>

*客户与账户由所有权关系连接。简单，但这是地基。*

## 小结

- **整数属性**适合评分与等级（creditScore）
- **百分比单位**（%）表示基于比率的属性
- **owns** 关系建立起最基础的所有权链
- 本体描述数据的*形状*，而不是数据本身 —— SSN 这类敏感字段只是元数据

```quiz
Q: 为什么 creditScore 建模为整数而不是字符串？
- 字符串在数据库里更难存储
- 整数类型支持数值比较与范围查询（例如 creditScore > 700）[correct]
- 信用评分永远是三位数字
- 整数占用的存储更少
> 使用整数类型，本体就表明 creditScore 支持数值运算 —— 比较、范围、平均值和阈值。字符串属性无法向查询引擎传达这种能力。
```

接下来，我们加入交易，用来跟踪账户活动。
