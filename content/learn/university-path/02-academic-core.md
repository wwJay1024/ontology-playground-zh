---
title: "教务核心"
slug: academic-core
description: "定义 Student、Course 和 Enrollment——支撑教务记录的中间实体模式。"
order: 2
embed: official/university-step-1
---

## 教务记录的基础

教务记录围绕一个核心问题展开：*哪些学生选了哪些课，学得怎么样？* 三个实体回答了这个问题：

- **Student** — 谁在学？
- **Course** — 教的是什么？
- **Enrollment** — 把学生和课程连起来、并带上成绩的记录

## 定义实体

### Student

| 属性 | 类型 | 是否标识属性 |
|---|---|---|
| `studentId` | string | ✓ |
| `name` | string | |
| `gpa` | float | |
| `enrollmentYear` | integer | |
| `major` | string | |

`gpa` 属性的类型是浮点数——平均绩点（GPA）的取值范围是 0.0 到 4.0。这个聚合指标支撑学业等级查询和荣誉名单计算。

### Course

| 属性 | 类型 | 是否标识属性 |
|---|---|---|
| `courseId` | string | ✓ |
| `title` | string | |
| `credits` | integer | |
| `level` | string | |
| `maxEnrollment` | integer | |

`level` 属性（100、200、300、400）表示课程难度和先修要求。`maxEnrollment` 是整数，用于容量规划。

### Enrollment

| 属性 | 类型 | 是否标识属性 |
|---|---|---|
| `enrollmentId` | string | ✓ |
| `semester` | string | |
| `grade` | string | |
| `enrollDate` | date | |
| `status` | string | |

Enrollment 是一个**中间实体**——它存在的目的，就是把 Student 和 Course 连起来，并承载额外的上下文（成绩、学期、状态）。

## 关系

- **enrolls_in** — `Student` → `Enrollment`（一对多）
  一个学生在多个学期里有多条选课记录。

- **for_course** — `Enrollment` → `Course`（多对一）
  每条选课记录对应一门具体的课程。

> **中间实体模式：** 当两个实体是多对多关系、而关系本身还要带属性时，就引入一个中间实体。一个学生选多门课，一门课有多个学生。Enrollment 夹在两者之间，承载成绩、学期和状态。这是本体设计中最常见的模式之一。

## 目前的图谱

<ontology-embed id="official/university-step-1" height="350px"></ontology-embed>

*Student 与 Course 通过 Enrollment 相连——经典的中间实体模式。*

## 我们学到了什么

- **中间实体**（Enrollment）化解带属性的多对多关系
- **浮点属性**（GPA）支撑聚合计算和阈值判断
- **整数属性**（credits、maxEnrollment）用于容量与工作量规划
- 教务核心沿着 Student → Enrollment → Course 展开

```quiz
Q: 为什么把 Enrollment 建成独立实体，而不是直接用 Student–Course 关系？
- 为了让图上有更多节点
- 因为 Enrollment 有自己的属性（成绩、学期、状态），这些属性既不属于 Student 也不属于 Course [correct]
- 本体至少需要三个实体
- 实体之间不允许直接建关系
> 直接的 Student–Course 关系无法承载成绩、学期或状态。中间实体模式把关系本身建成一个一等实体，于是可以问"这个学生这学期在这门课上得了什么成绩？"——这类问题要求属性挂在连接上，而不是挂在两端。
```

接下来，我们加入 Professor，用来记录教师的任课安排。
