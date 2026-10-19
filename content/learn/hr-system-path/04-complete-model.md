---
title: "完整人力资源模型"
slug: complete-model
description: "加入绩效评估，把完整的人力资源本体用到真实的员工分析问题上。"
order: 4
embed: community/ravi-chandu/hr-system
---

## 补齐人才分析层

最后一个实体是**绩效评估**。它按考核周期把评估结果连到员工身上。

关系：

- `Employee` -> `PerformanceReview`（一对多）

### 绩效评估的属性

| 属性 | 类型 | 是否标识属性 |
|---|---|---|
| `reviewId` | string | ✓ |
| `reviewPeriod` | string | |
| `rating` | enum | |
| `reviewDate` | date | |

至此，本体可以在同一张图谱上同时回答日常运营和战略性的人力资源问题。

## 完整图谱

<ontology-embed id="community/ravi-chandu/hr-system" height="460px"></ontology-embed>

*人力资源系统本体，共 5 个实体：员工、部门、岗位、任职、绩效评估。*

## 图谱查询示例

| 问题 | 图谱路径 |
|---|---|
| 哪些部门的资深员工最多？ | 部门 <- 任职 <- 员工 (`jobLevel=senior`) |
| 去年哪些员工换过岗位？ | 员工 -> 任职（按日期取多条记录）-> 岗位 |
| 哪些团队的优秀评估最多？ | 部门 <- 任职 <- 员工 -> 绩效评估 (`rating=outstanding`) |
| 哪些任职已经失效？ | 任职（已填 `endDate` 或 `isPrimary=false`） |

## 要点回顾

1. 把**人员**、**组织单元**和**角色**拆成各自的实体。
2. 用**任职**作为关联实体，记录带时间维度的任职历史。
3. 用**绩效评估**把可度量的结果挂到人员相关实体上。
4. 标识保持稳定，状态用枚举值加以约束。

```quiz
Q: 哪个实体支撑了对岗位与部门变动的历史分析？
- 员工
- 部门
- 任职 [correct]
- 绩效评估
> 任职记录了某位员工与某个部门、某个岗位之间这段关联的起止日期。没有它，就无法清晰地跟踪任职历史。
```

你已完成人力资源系统路径。在[本体目录](#/catalogue/community/ravi-chandu/hr-system)中打开该模型，或继续在[设计器](#/designer/community/ravi-chandu/hr-system)中迭代。
