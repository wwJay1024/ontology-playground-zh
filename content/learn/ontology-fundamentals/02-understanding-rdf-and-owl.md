---
title: 理解 RDF 与 OWL
slug: understanding-rdf-and-owl
description: 了解本体如何用 RDF/OWL 表示——这是语义网上描述类、属性和关系的标准语言。
order: 2
embed: official/ecommerce
---

## 什么是 RDF？

**RDF**（Resource Description Framework，资源描述框架）是 W3C 的标准，用来把信息描述成一张由相互连接的资源构成的图。RDF 里的一切都写成**三元组**：主语 → 谓语 → 宾语。

```
:Customer  rdf:type       owl:Class .
:name      rdf:type       owl:DatatypeProperty .
:name      rdfs:domain    :Customer .
:name      rdfs:range     xsd:string .
```

上面这组三元组的意思是：存在一个叫 Customer 的类，它有一个叫 name 的属性，取值为字符串。

## OWL 建立在 RDF 之上

**OWL**（Web Ontology Language，网络本体语言）在 RDF 的基础上加入了更丰富的建模能力——基数约束、类的层级结构、逻辑公理。做本体设计时，最常打交道的 OWL 构件是这几个：

| OWL 概念 | 对应什么 | 示例 |
|-------------|---------|---------|
| `owl:Class` | 实体类型 | `Customer`、`Product` |
| `owl:DatatypeProperty` | 取值为基本类型的属性 | `name`（字符串）、`price`（小数） |
| `owl:ObjectProperty` | 实体之间的关系 | `placedBy`（Order → Customer） |
| `rdfs:domain` / `rdfs:range` | 属性属于哪个实体 / 它的取值类型 | `price` 属于 `Product`，类型为 `xsd:decimal` |

## 命名空间消除歧义

RDF 里每个资源都有全局唯一的 **URI**。为了不必到处写长 URI，RDF/XML 使用**命名空间前缀**：

```xml
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:owl="http://www.w3.org/2002/07/owl#"
         xmlns="https://mycompany.com/ontology/">
```

默认命名空间 `xmlns=` 的含义是：`<owl:Class rdf:about="Customer">` 实际指向 `https://mycompany.com/ontology/Customer`。

## 读懂一个 RDF/OWL 文件

下面是一个最小本体，只有一个实体类型和一个属性：

```xml
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
         xmlns:owl="http://www.w3.org/2002/07/owl#"
         xmlns:xsd="http://www.w3.org/2001/XMLSchema#"
         xmlns="https://example.com/shop/">

  <!-- Entity type: Product -->
  <owl:Class rdf:about="Product">
    <rdfs:label>Product</rdfs:label>
  </owl:Class>

  <!-- Property: productName (string, identifier) -->
  <owl:DatatypeProperty rdf:about="productName">
    <rdfs:domain rdf:resource="Product"/>
    <rdfs:range rdf:resource="http://www.w3.org/2001/XMLSchema#string"/>
    <rdfs:label>productName</rdfs:label>
  </owl:DatatypeProperty>
</rdf:RDF>
```

本体演练场可以直接导入这样的文件，也可以让你在界面上设计好再导出为 RDF。

<ontology-embed id="official/ecommerce" height="400px"></ontology-embed>

*电商本体是一个更完整的例子，里面有多个实体类型，以及连接它们的对象属性。*

## JSON 与 RDF，何时用哪个

| | JSON | RDF/OWL |
|---|------|---------|
| **可读性** | 好读也好改 | 啰嗦，但精确 |
| **工具支持** | 任意文本编辑器 | 语义网工具、SPARQL 端点 |
| **互操作性** | 只适用于特定应用 | W3C 标准，各方都能理解 |
| **更适合** | 快速做原型、应用配置 | 正式的数据模型、跨系统集成 |

本体演练场两种格式都支持：在可视化编辑器里设计，需要快速使用时导出 JSON，需要正式发布时导出 RDF/OWL。

## 要点回顾

- RDF 把知识表示成**主语 → 谓语 → 宾语**的三元组
- OWL 在 RDF 之上增加了类、数据属性和对象属性
- 命名空间让 URI 又短又不至于混淆
- 演练场能导入导出标准 RDF/OWL，不用手写代码

```quiz
Q: 在 RDF 中，信息被表示成：
- 带行列的表格
- JSON 键值对
- 主语 → 谓语 → 宾语的三元组 [correct]
- 二进制数据流
> RDF 用三元组描述信息：三个部分，主语通过谓语连到宾语，整体构成一张由相互连接的资源组成的图。
```

```quiz
Q: owl:ObjectProperty 表示什么？
- 取值为字符串这类基本类型的属性
- 两个实体类型之间的关系 [correct]
- 本体的命名空间
- 对数据类型的约束
> 在 OWL 中，ObjectProperty 定义两个类（实体类型）之间的关系，例如把 Order 连到 Customer 的 `placedBy`。基本类型的取值用 DatatypeProperty。
```
