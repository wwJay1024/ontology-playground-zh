---
title: 向目录贡献本体
slug: contributing-to-the-catalogue
description: 如何把本体分享给社区——复刻仓库、加入 RDF 与元数据、提交 PR，然后看着它出现在目录里。
order: 6
embed: official/university
---

## 社区目录

本体演练场带一个本体[目录](#/catalogue)：一部分由项目团队维护（标为「official」），其余来自社区贡献。谁都可以提交一个本体，方式是开一个 pull request。

## 两种贡献方式

### 方式 A：在设计器里一键提 PR

这是最快的路径：

1. 打开[设计器](#/designer)，搭好你的本体（或载入已有的本体）
2. 点击工具栏上的 **提交到目录** 按钮
3. 填写元数据：名称、描述、分类和标签
4. 用 GitHub 登录（设备码流程——不保存密码）
5. 工具会自动复刻仓库、创建分支、提交你的 RDF 和元数据，并开出 pull request

就这样。CI 流水线会校验 RDF、检查元数据结构、运行测试，然后由维护者审阅并合并。

### 方式 B：手动提 PR

如果你更习惯直接操作 Git：

1. 在 GitHub 上**复刻（fork）**仓库
2. 在 `catalogue/community/<your-github-username>/<ontology-slug>/` 下建目录
3. 添加两个文件：
   - `ontology.rdf`——你的 RDF/OWL 文件
   - `metadata.json`——描述这份本体

## 元数据格式

```json
{
  "name": "Library System",
  "description": "A public library with books, authors, members, and loans.",
  "icon": "📚",
  "category": "education",
  "tags": ["library", "books", "lending"],
  "author": "your-github-username"
}
```

| 字段 | 是否必填 | 说明 |
|-------|----------|-------------|
| `name` | 是 | 目录里显示的名称 |
| `description` | 是 | 一句话概述 |
| `category` | 是 | 取值之一：`retail`、`healthcare`、`finance`、`manufacturing`、`education`、`technology`、`general` |
| `icon` | 否 | 卡片上的单个 emoji |
| `tags` | 否 | 供搜索使用的小写关键词数组 |
| `author` | 否 | GitHub 用户名（一键流程会自动填） |

## 校验规则

你的 PR 会自动按下面几条规则校验：

- **RDF/OWL 合法**——必须能无错解析
- **往返一致**——`parse(serialize(ontology))` 的输出必须等价
- **元数据结构**——必填字段齐全，分类取值有效
- **目录命名**——只用小写字母、数字、连字符和下划线
- **不含符号链接**——出于安全考虑，目录中的符号链接会被拒绝

## 合并之后会发生什么？

合并之后，构建流水线会：

1. 运行 `npm run catalogue:build`——把所有 RDF 文件编译进 `catalogue.json`
2. 部署更新后的站点——你的本体出现在[作品库](#/catalogue)里
3. 随即可以用于嵌入、直达链接，以及在演练场中载入

<ontology-embed id="official/university" height="400px"></ontology-embed>

*高校本体是官方目录条目之一。社区贡献走同样的格式——你的本体在作品库里看起来就是这个样子。*

## 让审阅更顺利的几点建议

- **把描述写好**——说清你的本体覆盖哪个领域、给谁用
- **标签要有意义**——方便用户在搜索里找到它
- **本地先测**——推送前运行 `npm run validate -- catalogue/community/<you>/<slug>/ontology.rdf`
- **控制范围**——3 到 8 个实体类型的本体，比铺开三十多个实体的大杂烩更有用

## 要点回顾

- 谁都可以通过一键 PR 流程或手动 pull request 贡献本体
- 每次提交都需要一个 RDF 文件和一个 `metadata.json`
- CI 会自动校验 RDF，最好在审阅前把错误修掉
- 合并后的本体会在部署完成后立即出现在线上目录中

```quiz
Q: 每次向目录贡献本体，必须包含哪两个文件？
- ontology.json 和 README.md
- schema.rdf 和 config.yaml
- ontology.rdf 和 metadata.json [correct]
- index.html 和 style.css
> 每个目录条目都需要一个 ontology.rdf（RDF/OWL 本体）和一个 metadata.json（目录列表用的名称、描述、分类和标签）。
```
