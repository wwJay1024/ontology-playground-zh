// Dynamic Quest Generator - Creates quests based on the loaded ontology

import type { Ontology } from './ontology';
import type { Quest, QuestStep } from './quests';

/**
 * Generates a set of quests dynamically based on the current ontology structure.
 * Quests adapt to entity types, relationships, and properties in the loaded ontology.
 */
export function generateQuestsForOntology(ontology: Ontology): Quest[] {
  const quests: Quest[] = [];
  const entities = ontology.entityTypes;
  const relationships = ontology.relationships;

  // Quest 1: Meet the Entities (always generated)
  if (entities.length >= 2) {
    const explorationSteps: QuestStep[] = entities.slice(0, Math.min(4, entities.length)).map((entity, index) => ({
      id: `step-1-${index + 1}`,
      instruction: `点击「${entity.name}」实体，看看它有哪些属性`,
      targetType: 'entity' as const,
      targetId: entity.id,
      hint: `在图谱里找 ${entity.icon} 图标`
    }));

    quests.push({
      id: "quest-1",
      title: "认识实体",
      description: `认识 ${ontology.name} 本体里的核心实体类型。`,
      difficulty: "beginner",
      category: "exploration",
      steps: explorationSteps,
      reward: {
        badge: "实体探索者",
        badgeIcon: "🎖️",
        points: 100
      }
    });
  }

  // Quest 2: Relationship Navigator
  if (relationships.length >= 2) {
    const relSteps: QuestStep[] = [];
    const usedEntities = new Set<string>();

    // Try to find a chain of relationships
    for (const rel of relationships.slice(0, 3)) {
      const sourceEntity = entities.find(e => e.id === rel.from);
      const targetEntity = entities.find(e => e.id === rel.to);

      if (sourceEntity && !usedEntities.has(sourceEntity.id)) {
        relSteps.push({
          id: `step-2-${relSteps.length + 1}`,
          instruction: `从「${sourceEntity.name}」实体出发`,
          targetType: 'entity',
          targetId: sourceEntity.id,
          hint: `找 ${sourceEntity.icon} 图标`
        });
        usedEntities.add(sourceEntity.id);
      }

      relSteps.push({
        id: `step-2-${relSteps.length + 1}`,
        instruction: `沿「${rel.name}」关系${targetEntity ? `走到「${targetEntity.name}」` : ''}`,
        targetType: 'relationship',
        targetId: rel.id,
        hint: `点击标注为「${rel.name}」的那条线`
      });
    }

    if (relSteps.length >= 2) {
      quests.push({
        id: "quest-2",
        title: "关系导航",
        description: `把 ${ontology.name} 里实体之间的连接走一遍。`,
        difficulty: "intermediate",
        category: "traversal",
        steps: relSteps,
        reward: {
          badge: "关系达人",
          badgeIcon: "🔗",
          points: 200
        }
      });
    }
  }

  // Quest 3: Find the Hub - identify the most connected entity
  const connectionCount = new Map<string, number>();
  for (const entity of entities) {
    connectionCount.set(entity.id, 0);
  }
  for (const relationship of relationships) {
    connectionCount.set(
      relationship.from,
      (connectionCount.get(relationship.from) ?? 0) + 1,
    );
    if (relationship.to !== relationship.from) {
      connectionCount.set(
        relationship.to,
        (connectionCount.get(relationship.to) ?? 0) + 1,
      );
    }
  }
  
  const sortedByConnections = entities
    .map(e => ({ entity: e, connections: connectionCount.get(e.id) ?? 0 }))
    .sort((a, b) => b.connections - a.connections);

  if (sortedByConnections.length >= 2 && sortedByConnections[0].connections >= 2) {
    const hub = sortedByConnections[0].entity;
    const connectedRels = relationships.filter(
      r => r.from === hub.id || r.to === hub.id
    ).slice(0, 3);

    const hubSteps: QuestStep[] = [
      {
        id: "step-3-1",
        instruction: `找到「${hub.name}」实体——它是这个本体里连接最多的一个`,
        targetType: 'entity',
        targetId: hub.id,
        hint: `「${hub.name}」有 ${connectionCount.get(hub.id) ?? 0} 条连接`
      }
    ];

    connectedRels.forEach((rel, i) => {
      hubSteps.push({
        id: `step-3-${i + 2}`,
        instruction: `沿「${rel.name}」关系走一走`,
        targetType: 'relationship',
        targetId: rel.id,
        hint: `这条关系${rel.from === hub.id ? '从' : '指向'}「${hub.name}」`
      });
    });

    quests.push({
      id: "quest-3",
      title: "找出枢纽",
      description: `看看 ${ontology.name} 里哪个实体连接最多。`,
      difficulty: "intermediate",
      category: "exploration",
      steps: hubSteps,
      reward: {
        badge: "枢纽侦探",
        badgeIcon: "🔍",
        points: 200
      }
    });
  }

  // Quest 4: Property Detective - explore entity properties
  const entitiesWithManyProps = entities
    .filter(e => e.properties.length >= 3)
    .slice(0, 2);

  if (entitiesWithManyProps.length >= 1) {
    const propSteps: QuestStep[] = [];
    
    for (const entity of entitiesWithManyProps) {
      propSteps.push({
        id: `step-4-${propSteps.length + 1}`,
        instruction: `选中「${entity.name}」实体，逐个看它的 ${entity.properties.length} 个属性`,
        targetType: 'entity',
        targetId: entity.id,
        hint: `属性细节在检查器面板里`
      });

      const identifierProp = entity.properties.find(p => p.isIdentifier);
      if (identifierProp) {
        propSteps.push({
          id: `step-4-${propSteps.length + 1}`,
          instruction: `在「${entity.name}」里找到标识属性「${identifierProp.name}」`,
          targetType: 'property',
          targetId: identifierProp.name,
          hint: `找标着 🔑 的那个属性`
        });
      }
    }

    quests.push({
      id: "quest-4",
      title: "属性侦探",
      description: `认识定义实体类型的那些属性。`,
      difficulty: "intermediate",
      category: "exploration",
      steps: propSteps,
      reward: {
        badge: "数据学者",
        badgeIcon: "📊",
        points: 250
      }
    });
  }

  // Quest 5: Query Explorer (always available)
  const sampleEntities = entities.slice(0, 2);
  const querySteps: QuestStep[] = [
    {
      id: "step-5-1",
      instruction: `试着问：「${sampleEntities[0]?.name || '这个实体'}是什么？」`,
      targetType: 'query',
      hint: "在自然语言查询演练场里输入"
    }
  ];

  if (sampleEntities.length >= 2) {
    querySteps.push({
      id: "step-5-2",
      instruction: `再问：「${sampleEntities[0].name}和${sampleEntities[1].name}是什么关系？」`,
      targetType: 'query',
      hint: "看看实体之间有哪些关系"
    });
  }

  if (relationships.length > 0) {
    const rel = relationships[0];
    const fromEntity = entities.find(e => e.id === rel.from);
    const toEntity = entities.find(e => e.id === rel.to);
    querySteps.push({
      id: "step-5-3",
      instruction: fromEntity && toEntity
        ? `试试跳转查询：「${fromEntity.name}怎么连到${toEntity.name}？」`
        : `试试针对「${rel.name}」关系的跳转查询`,
      targetType: 'query',
      hint: `这会沿「${rel.name}」关系一路查下去`
    });
  }

  quests.push({
    id: "quest-5",
    title: "查询探索",
    description: "学会用自然语言提问。",
    difficulty: "advanced",
    category: "query",
    steps: querySteps,
    reward: {
      badge: "查询高手",
      badgeIcon: "🧙",
      points: 300
    }
  });

  // Quest 6: Full Traversal - go through a chain of entities
  if (relationships.length >= 3) {
    // Try to find a chain: A -> B -> C
    let chain: { entities: typeof entities[0][], rels: typeof relationships[0][] } | null = null;

    for (const startRel of relationships) {
      const midEntity = entities.find(e => e.id === startRel.to);
      if (!midEntity) continue;

      const nextRel = relationships.find(r => r.from === midEntity.id && r.id !== startRel.id);
      if (!nextRel) continue;

      const endEntity = entities.find(e => e.id === nextRel.to);
      if (!endEntity) continue;

      const startEntity = entities.find(e => e.id === startRel.from);
      if (!startEntity) continue;

      chain = {
        entities: [startEntity, midEntity, endEntity],
        rels: [startRel, nextRel]
      };
      break;
    }

    if (chain) {
      const chainSteps: QuestStep[] = [
        {
          id: "step-6-1",
          instruction: `从「${chain.entities[0].name}」开始这趟旅程`,
          targetType: 'entity',
          targetId: chain.entities[0].id,
          hint: `找 ${chain.entities[0].icon} 图标`
        },
        {
          id: "step-6-2",
          instruction: `沿「${chain.rels[0].name}」走到「${chain.entities[1].name}」`,
          targetType: 'relationship',
          targetId: chain.rels[0].id,
          hint: "点击连接两者的那条边"
        },
        {
          id: "step-6-3",
          instruction: `看看「${chain.entities[1].name}」这个实体`,
          targetType: 'entity',
          targetId: chain.entities[1].id,
          hint: `这里是旅程的中点`
        },
        {
          id: "step-6-4",
          instruction: `继续沿「${chain.rels[1].name}」走到「${chain.entities[2].name}」`,
          targetType: 'relationship',
          targetId: chain.rels[1].id,
          hint: "还剩最后一段连接"
        },
        {
          id: "step-6-5",
          instruction: `到终点了！看看「${chain.entities[2].name}」`,
          targetType: 'entity',
          targetId: chain.entities[2].id,
          hint: `旅程结束！${chain.entities[2].icon}`
        }
      ];

      quests.push({
        id: "quest-6",
        title: "完整旅程",
        description: `从「${chain.entities[0].name}」一路走到「${chain.entities[2].name}」。`,
        difficulty: "advanced",
        category: "traversal",
        steps: chainSteps,
        reward: {
          badge: "路径开拓者",
          badgeIcon: "🗺️",
          points: 350
        }
      });
    }
  }

  return quests;
}

/**
 * Get a domain-specific badge icon based on ontology category/name
 */
export function getOntologyThemeIcon(ontologyName: string): string {
  const name = ontologyName.toLowerCase();
  if (name.includes('health') || name.includes('medical') || name.includes('patient')) return '🏥';
  if (name.includes('commerce') || name.includes('retail') || name.includes('shop')) return '🛒';
  if (name.includes('bank') || name.includes('financ')) return '🏦';
  if (name.includes('manufactur') || name.includes('factory') || name.includes('production')) return '🏭';
  if (name.includes('university') || name.includes('education') || name.includes('school')) return '🎓';
  if (name.includes('coffee') || name.includes('cosmic')) return '☕';
  return '🔷';
}
