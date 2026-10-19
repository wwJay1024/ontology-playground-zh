---
title: "交易"
slug: transactions
description: "加入交易记录，跟踪账户上的每一笔借记、贷记与转账。"
order: 3
embed: official/finance-step-2
---

## 记录活动

没有交易历史的账户只是一个静态余额。加入**交易**才能记录资金的流动 —— 每一笔消费、存款、转账和手续费。

这样一来，就能回答这类问题：
- “这位客户上个月在餐厅花了多少钱？”
- “哪些账户的交易模式异常？”
- “按账户类型划分的平均交易金额是多少？”

## 交易实体

| 属性 | 类型 | 标识属性？ |
|---|---|---|
| `transactionId` | string | ✓ |
| `amount` | decimal (USD) | |
| `type` | string | |
| `timestamp` | datetime | |
| `merchant` | string | |

`timestamp` 用 datetime 而不是 date，因为金融交易需要精度 —— 对反欺诈来说，下午 2:30 的一笔消费和 2:31 的一笔并不相同。

`merchant` 属性记录交易发生的地点，便于做消费类别分析。

## 新关系

- **has_transaction**：`Account` → `Transaction`（一对多）
  每个账户随时间产生多笔交易，但每笔交易只属于一个账户。

这把所有权链延长了：`客户 → Account → Transaction`。

## 不断生长的图谱

<ontology-embed id="official/finance-step-2" diff="official/finance-step-1" height="400px"></ontology-embed>

*交易补上了活动层。所有权链随之延长：`客户 → Account → Transaction`。*

## 小结

- **Datetime 精度**在金融与合规场景中很重要
- **所有权链**（`客户 → Account → Transaction`）支持逐层下钻的查询
- `merchant` 属性让消费分析成为可能，不必额外增加一个商户实体
- 每增加一个实体，能回答的问题就更深一层

```quiz
Q: 为什么交易的 timestamp 用 datetime 类型而不是 date？
- datetime 是所有时间字段的默认属性类型
- 金融交易需要精确到时刻，以支撑反欺诈与审计追踪 [correct]
- 现代本体已弃用 date 类型
- datetime 比 date 占用更少存储
> 金融合规与反欺诈都需要精确的时间戳。同一天内相隔几分钟的两笔交易，可能正是一种欺诈模式。datetime 同时记录日期与时间，提供了所需的精度。
```

接下来，我们加入贷款与投资，补齐银行的产品体系。
