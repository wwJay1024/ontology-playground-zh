---
title: "完整的高校模型"
slug: complete-university
description: "加入 Department，补全高校本体——把教职员工、课程和学生组织成各个学位项目。"
order: 4
embed: official/university-step-3
---

## 组织结构

高校按**院系**划分——院系是行政单位，安置教职员工、开设课程、授予学位。加入 Department 之后，组织层级就出现了，把所有部分串在一起。

## Department 实体

| 属性 | 类型 | 是否标识属性 |
|---|---|---|
| `departmentId` | string | ✓ |
| `name` | string | |
| `building` | string | |
| `budget` | float | |
| `headOfDept` | string | |

`budget` 是浮点数，支持资源分配类查询。`headOfDept` 指向领导该院系的教授——这是一种自引用写法，在组织层级里很常见。

## 新增关系

- **belongs_to** — `教授` → `Department`（多对一）
  教授隶属于某个院系。

- **offers** — `Department` → `课程`（一对多）
  院系作为学位项目的一部分开设课程。

> **组织层级：** Department 位于高校本体的顶层，向下同时连接 教授（师资）和 课程（课程体系）。这个枢纽位置让 Department 特别适合做聚合查询："院系层面的统计。"

## 完整图谱

<ontology-embed id="official/university-step-3" diff="official/university-step-2" height="500px"></ontology-embed>

*完整的高校本体：5 个实体、6 条关系。Department 同时组织师资与课程体系。*

## 完整模型能回答什么

| 问题 | 图谱路径 |
|---|---|
| 哪些院系的学生平均 GPA 最高？ | Department → 课程 ← 选课 ← 学生（平均 GPA） |
| 哪些教授在讲授本院系之外的课程？ | 教授 → Department 对比 教授 → 课程 → Department |
| 每个院系的选课率是多少？ | Department → 课程 ← 选课（计数）/ 课程.maxEnrollment |
| 哪些院系的终身教授最多？ | Department ← 教授（tenured=true，计数） |

## GQL 查询示例

找出学生成绩吃紧（平均成绩低于 B）的院系：

```gql
MATCH (d:Department)-[:offers]->(c:课程)<-[:for_course]-(e:选课)<-[:enrolls_in]-(s:学生)
WHERE e.grade IN ['C', 'D', 'F']
RETURN d.name, c.title, COUNT(e) AS struggling_count
ORDER BY struggling_count DESC
```

## 我们构建了什么

| 步骤 | 新增实体 | 累计 | 关键概念 |
|---|---|---|---|
| 1 | 学生、课程、选课 | 3 | 中间实体、多对多 |
| 2 | 教授 | 4 | 传递查询、布尔属性 |
| 3 | Department | 5 | 组织层级、枢纽实体 |

## 要点

1. **中间实体**（选课）化解带属性的多对多关系
2. **传递查询**沿着多跳路径挖出洞察
3. **布尔属性**（tenured）支持分类筛选
4. **组织层级**（Department）提供聚合分组
5. **枢纽实体**（Department）连接本体的多个分支

```quiz
Q: 为什么说 Department 在高校本体里是一个"枢纽实体"？
- 因为它的属性最多
- 因为它同时连接 教授 和 课程，处在组织层级的顶端 [correct]
- 因为它是最后加入的
- 因为枢纽实体必须有一个预算属性
> Department 向下同时连接 教授（通过 belongs_to）和 课程（通过 offers）。这双重连接使它成为组织枢纽——特别适合在院系层面做结合师资与课程数据的聚合查询。
```

你已经走完高校系统学习路径！从[本体目录](#/catalogue)载入任意一步，就能交互式地查看。
