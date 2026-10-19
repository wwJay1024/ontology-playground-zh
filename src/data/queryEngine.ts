import type { Ontology } from './ontology';
import { nlQueryResponses } from './quests';

export interface QueryResponse {
  query: string;
  result: string;
  highlightEntities: string[];
  highlightRelationships: string[];
  interpretation?: string;
}

/** 英文输入兼容：去掉冠词，中文输入不受影响。 */
function stripLeadingArticle(text: string): string {
  return text.replace(/^(a|an|the)\s+/, '').trim();
}

/** 英文输入兼容：粗略去复数，中文不经此处理。 */
function singularize(text: string): string {
  return text.endsWith('s') ? text.slice(0, -1) : text;
}

function matchesDemoQuery(normalizedQuery: string, demoQuery: string, matches: string[]): boolean {
  return normalizedQuery === demoQuery || matches.some(match => normalizedQuery.includes(match));
}

function propertyList(entity: Ontology['entityTypes'][number], limit = 4): string {
  return entity.properties
    .slice(0, limit)
    .map(p => `• **${p.name}**（${p.type}）${p.isIdentifier ? ' 🔑' : ''}`)
    .join('\n');
}

/** 按当前本体生成提问示例 */
export function generateQuerySuggestions(ontology: Ontology): string[] {
  const suggestions: string[] = [];
  const entities = ontology.entityTypes;
  const relationships = ontology.relationships;

  if (entities.length > 0) {
    suggestions.push(`看看所有${entities[0].name}`);

    if (entities.length > 1) {
      suggestions.push(`列出所有${entities[1].name}`);
    }
  }

  entities.forEach(entity => {
    entity.properties.forEach(prop => {
      if (prop.type === 'string' && !prop.isIdentifier && prop.name !== 'name') {
        suggestions.push(`${entity.name}按${prop.name}怎么看`);
      }
    });
  });

  if (relationships.length > 0) {
    const rel = relationships[0];
    const fromEntity = entities.find(e => e.id === rel.from);
    const toEntity = entities.find(e => e.id === rel.to);
    if (fromEntity && toEntity) {
      suggestions.push(`${fromEntity.name}怎么连到${toEntity.name}`);
    }
  }

  suggestions.push('什么是实体类型');
  suggestions.push('什么是关系');
  suggestions.push('这个本体怎么运作');

  return [...new Set(suggestions)].slice(0, 6);
}

/** 在当前本体上解释一条自然语言提问 */
export function processQuery(query: string, ontology: Ontology): QueryResponse {
  const normalizedQuery = query.toLowerCase().trim();
  const normalizedNoPunctuation = normalizedQuery.replace(/[?!.,;:，。、；：？！]+/g, '').trim();
  const entities = ontology.entityTypes;
  const relationships = ontology.relationships;

  if (ontology.name === 'Fourth Coffee') {
    const demoResponse = nlQueryResponses.find(response =>
      matchesDemoQuery(normalizedNoPunctuation, response.query, response.matches)
    );

    if (demoResponse) {
      return {
        query,
        result: demoResponse.result,
        highlightEntities: demoResponse.highlightEntities,
        highlightRelationships: demoResponse.highlightRelationships,
        interpretation: '识别为：Fourth Coffee 示例查询'
      };
    }
  }

  // ── 概念问题 ──
  const asksWhat = normalizedQuery.includes('what is') || normalizedQuery.includes('什么是') || normalizedQuery.includes('是什么');
  const asksHow = normalizedQuery.includes('how') || normalizedQuery.includes('怎么') || normalizedQuery.includes('如何');
  // 提问里点到具体实体时，交给后面的实体/关系分支处理，避免用通用解释敷衍
  const mentionsEntity = entities.some(entity => normalizedQuery.includes(entity.name.toLowerCase()));

  if (!mentionsEntity && asksWhat && (normalizedQuery.includes('entity') || normalizedQuery.includes('ontology') || normalizedQuery.includes('实体') || normalizedQuery.includes('本体'))) {
    return {
      query,
      result: `**实体类型**是对现实世界概念的复用式逻辑建模，例如客户、商品、订单。在 Fabric IQ 本体中，实体类型统一了三件事：\n\n• **名称与描述** —— 团队共用的术语\n• **属性** —— 带类型和单位的特征\n• **标识属性** —— 唯一区分每个实例的键\n\n这样一来，组织里每个人说到同一个词，指的都是同一个东西。`,
      highlightEntities: entities.slice(0, 2).map(e => e.id),
      highlightRelationships: [],
      interpretation: '识别为：关于实体类型的概念问题'
    };
  }

  if (!mentionsEntity && asksWhat && (normalizedQuery.includes('relationship') || normalizedQuery.includes('关系'))) {
    return {
      query,
      result: `**关系**是两个实体类型之间带类型、有方向的连接。一条关系定义四件事：\n\n• **名称** —— 动词短语，如「下单」「包含」\n• **方向** —— 从哪个实体指向哪个实体\n• **基数** —— 一对一、一对多等\n• **属性** —— 连接上可选的附加信息\n\n沿关系走一遍，就能回答跨越多个实体的问题。`,
      highlightEntities: [],
      highlightRelationships: relationships.slice(0, 2).map(r => r.id),
      interpretation: '识别为：关于关系的概念问题'
    };
  }

  if (!mentionsEntity && asksHow && (normalizedQuery.includes('ontology') || normalizedQuery.includes('work') || normalizedQuery.includes('本体') || normalizedQuery.includes('运作'))) {
    return {
      query,
      result: `**${ontology.name}** 本体包含：\n\n• **${entities.length} 个实体类型** —— ${entities.map(e => e.name).join('、')}\n• **${relationships.length} 条关系** —— 把实体串起来\n\n本体是一层语义中间层，绑定到数据平台的数据源之后，系统就能听懂业务语言，把提问翻译成对真实数据的查询。`,
      highlightEntities: entities.map(e => e.id),
      highlightRelationships: [],
      interpretation: '识别为：关于本体结构的问题'
    };
  }

  // ── 实体定义：「客户是什么」 ──
  const definitionPrefixes = ['what is', '什么是', '介绍一下'];
  const matchedPrefix = definitionPrefixes.find(prefix => normalizedNoPunctuation.startsWith(prefix));
  const suffixSubject = normalizedNoPunctuation.endsWith('是什么')
    ? normalizedNoPunctuation.slice(0, -'是什么'.length).trim()
    : null;
  const subjectRaw = suffixSubject !== null
    ? suffixSubject
    : matchedPrefix
      ? normalizedNoPunctuation.slice(matchedPrefix.length).trim()
      : null;
  if (subjectRaw !== null) {
    const subject = stripLeadingArticle(subjectRaw);

    for (const entity of entities) {
      const entityNameLower = entity.name.toLowerCase();
      const entityNameSingular = entityNameLower.endsWith('s') ? entityNameLower.slice(0, -1) : entityNameLower;

      if (
        subject === entityNameLower
        || subject === entityNameSingular
        || singularize(subject) === entityNameSingular
      ) {
        return {
          query,
          result: `**${entity.name}** ${entity.icon}\n${entity.description}\n\n**属性：**\n${propertyList(entity)}`,
          highlightEntities: [entity.id],
          highlightRelationships: [],
          interpretation: `识别为：${entity.name} 的定义查询`
        };
      }
    }
  }

  // ── 实体列举 ──
  for (const entity of entities) {
    const name = entity.name;
    const nameLower = name.toLowerCase();

    if (
      normalizedQuery.includes(`所有${nameLower}`)
      || normalizedQuery.includes(`列出${nameLower}`)
      || normalizedQuery.includes(`看看${nameLower}`)
      || normalizedQuery.includes(`show me all ${nameLower}`)
      || normalizedQuery.includes(`list all ${nameLower}`)
      || normalizedQuery.includes(`show ${nameLower}`)
    ) {
      return {
        query,
        result: `**${entity.name}** ${entity.icon}\n${entity.description}\n\n**属性：**\n${propertyList(entity)}\n\n_实际部署时，这里会去数据平台取出真实的${entity.name}记录。_`,
        highlightEntities: [entity.id],
        highlightRelationships: [],
        interpretation: `识别为：${entity.name} 实体查询`
      };
    }
  }

  // ── 关系名查询 ──
  for (const rel of relationships) {
    const relName = rel.name.toLowerCase().trim();
    const fromEntity = entities.find(e => e.id === rel.from);
    const toEntity = entities.find(e => e.id === rel.to);

    if (
      normalizedNoPunctuation.includes(relName)
      && (normalizedNoPunctuation.includes('关系') || normalizedNoPunctuation.includes('连接')
        || normalizedNoPunctuation.includes('connection') || normalizedNoPunctuation.includes('relationship'))
    ) {
      return {
        query,
        result: `**${rel.name}** 把 **${fromEntity?.name ?? rel.from}** 连到 **${toEntity?.name ?? rel.to}**（${rel.cardinality}）。${rel.description ? `\n\n${rel.description}` : ''}`,
        highlightEntities: [rel.from, rel.to],
        highlightRelationships: [rel.id],
        interpretation: `识别为：关系「${rel.name}」查询`
      };
    }
  }

  // ── 两个实体之间是什么关系 ──
  if (normalizedQuery.includes('关系') || normalizedQuery.includes('连接') || normalizedQuery.includes('relat')) {
    const mentioned = entities.filter(entity => normalizedQuery.includes(entity.name.toLowerCase()));

    if (mentioned.length >= 2) {
      const [left, right] = mentioned;
      const between = relationships.filter(rel =>
        (rel.from === left.id && rel.to === right.id) || (rel.from === right.id && rel.to === left.id)
      );

      if (between.length > 0) {
        const lines = between.map(rel => {
          const forward = rel.from === left.id;
          const fromName = forward ? left.name : right.name;
          const toName = forward ? right.name : left.name;
          return `• **${rel.name}** ${fromName} → ${toName}（${rel.cardinality}）`;
        }).join('\n');

        return {
          query,
          result: `**${left.name}** 与 **${right.name}** 之间有 ${between.length} 条关系：\n\n${lines}`,
          highlightEntities: [left.id, right.id],
          highlightRelationships: between.map(rel => rel.id),
          interpretation: `识别为：${left.name} 与 ${right.name} 的关系查询`
        };
      }

      return {
        query,
        result: `**${left.name}** 与 **${right.name}** 之间没有直接关系。\n\n可以沿中间的实体找一条路径，或打开右侧的「路径查找」看两者的最短连接。`,
        highlightEntities: [left.id, right.id],
        highlightRelationships: [],
        interpretation: `识别为：${left.name} 与 ${right.name} 的关系查询`
      };
    }
  }

  // ── 某个实体连到哪里 ──
  for (const entity of entities) {
    const name = entity.name;
    const nameLower = name.toLowerCase();

    if (
      normalizedQuery.includes(`${nameLower}怎么连`)
      || normalizedQuery.includes(`${nameLower}连接`)
      || normalizedQuery.includes(`${nameLower}关系`)
      || normalizedQuery.includes(`how does ${nameLower}`)
      || normalizedQuery.includes(`${nameLower} connect`)
    ) {
      const relatedRels = relationships.filter(r => r.from === entity.id || r.to === entity.id);

      if (relatedRels.length > 0) {
        const relList = relatedRels.map(rel => {
          const isOutgoing = rel.from === entity.id;
          const otherEntityId = isOutgoing ? rel.to : rel.from;
          const otherEntity = entities.find(e => e.id === otherEntityId);
          const direction = isOutgoing ? '→' : '←';
          return `• **${rel.name}** ${direction} ${otherEntity?.icon} ${otherEntity?.name}（${rel.cardinality}）`;
        }).join('\n');

        return {
          query,
          result: `**${entity.name}** ${entity.icon} 共有 ${relatedRels.length} 条关系：\n\n${relList}`,
          highlightEntities: [entity.id, ...relatedRels.map(r => r.from === entity.id ? r.to : r.from)],
          highlightRelationships: relatedRels.map(r => r.id),
          interpretation: `识别为：${entity.name} 的关系查询`
        };
      }
    }
  }

  // ── 属性查询 ──
  for (const entity of entities) {
    for (const prop of entity.properties) {
      if (normalizedQuery.includes(prop.name.toLowerCase()) && normalizedQuery.includes(entity.name.toLowerCase())) {
        return {
          query,
          result: `**${entity.name}.${prop.name}**\n\n• 类型：${prop.type}\n${prop.unit ? `• 单位：${prop.unit}\n` : ''}${prop.isIdentifier ? '• 这是标识属性 🔑\n' : ''}${prop.description ? `• ${prop.description}\n` : ''}\n_实际部署时，可以按这个属性筛选${entity.name}。_`,
          highlightEntities: [entity.id],
          highlightRelationships: [],
          interpretation: `识别为：属性查询 ${entity.name}.${prop.name}`
        };
      }
    }
  }

  // ── 计数查询 ──
  if (normalizedQuery.includes('how many') || normalizedQuery.includes('多少') || normalizedQuery.includes('几个') || normalizedQuery.includes('几家')) {
    for (const entity of entities) {
      if (normalizedQuery.includes(entity.name.toLowerCase())) {
        return {
          query,
          result: `本体中定义了 **${entity.name}** 这个实体类型。\n\n_实际部署时，这里会去数据平台统计真实的${entity.name}记录数。_\n\n示例：SELECT COUNT(*) FROM ${entity.id}`,
          highlightEntities: [entity.id],
          highlightRelationships: [],
          interpretation: `识别为：${entity.name} 计数查询`
        };
      }
    }
  }

  // ── 结构总览 ──
  if (normalizedQuery.includes('entity') || normalizedQuery.includes('schema') || normalizedQuery.includes('overview')
    || normalizedQuery.includes('实体') || normalizedQuery.includes('概览') || normalizedQuery.includes('模式')) {
    const entityList = entities.map(e => `• ${e.icon} **${e.name}** —— ${e.description.slice(0, 40)}…`).join('\n');
    return {
      query,
      result: `**${ontology.name}** 结构总览\n\n${entityList}\n\n**合计：** ${entities.length} 个实体、${relationships.length} 条关系`,
      highlightEntities: entities.map(e => e.id),
      highlightRelationships: [],
      interpretation: '识别为：结构总览请求'
    };
  }

  const suggestions = generateQuerySuggestions(ontology).slice(0, 3);
  return {
    query,
    result: `没能理解「${query}」在这个本体中的含义。\n\n可以试着这样问：\n${suggestions.map(s => `• 「${s}」`).join('\n')}\n\n也可以直接点图谱里的节点和连线，用眼睛看一遍结构。`,
    highlightEntities: [],
    highlightRelationships: [],
    interpretation: undefined
  };
}
