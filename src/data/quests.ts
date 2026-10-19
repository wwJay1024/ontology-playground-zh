// Quest system for Ontology Playground demo

export interface Quest {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'exploration' | 'traversal' | 'query';
  steps: QuestStep[];
  reward: {
    badge: string;
    badgeIcon: string;
    points: number;
  };
}

export interface QuestStep {
  id: string;
  instruction: string;
  targetType: 'entity' | 'relationship' | 'property' | 'query';
  targetId?: string;
  hint?: string;
}

export const quests: Quest[] = [
  {
    id: "quest-1",
    title: "认识实体",
    description: "从实体类型入手，认识 Fourth Coffee 本体的基本构件。",
    difficulty: "beginner",
    category: "exploration",
    steps: [
      {
        id: "step-1-1",
    instruction: "点击「客户」实体，看看客户是怎么建模的",
        targetType: "entity",
        targetId: "customer",
    hint: "在图谱里找 👤 图标"
      },
      {
        id: "step-1-2",
    instruction: "再看看「商品」实体",
        targetType: "entity",
        targetId: "product",
    hint: "找 ☕ 咖啡杯图标"
      },
      {
        id: "step-1-3",
    instruction: "最后来看看「门店」实体",
        targetType: "entity",
        targetId: "store",
    hint: "定位 🏪 门店图标"
      }
    ],
    reward: {
    badge: "实体探索者",
      badgeIcon: "🎖️",
      points: 100
    }
  },
  {
    id: "quest-2",
    title: "咖啡豆之旅",
    description: "沿关系追踪一颗咖啡豆从供应商到客户的完整路径。",
    difficulty: "intermediate",
    category: "traversal",
    steps: [
      {
        id: "step-2-1",
    instruction: "从「供应商」实体出发，咖啡豆的旅程从这里开始",
        targetType: "entity",
        targetId: "supplier",
    hint: "找 🚚 货车图标"
      },
      {
        id: "step-2-2",
    instruction: "沿「货源来自」关系走到「商品」",
        targetType: "relationship",
        targetId: "product_sourced_from_supplier",
    hint: "点击连接供应商与商品的那条线"
      },
      {
        id: "step-2-3",
    instruction: "沿「包含」关系，看商品如何进入订单",
        targetType: "relationship",
        targetId: "order_contains_product",
    hint: "看看订单与商品之间的连线"
      },
      {
        id: "step-2-4",
    instruction: "最后看「下单」关系，确认是谁下的单",
        targetType: "relationship",
        targetId: "customer_places_order",
    hint: "找到从客户指向订单的那条关系"
      }
    ],
    reward: {
    badge: "咖啡豆侦探",
      badgeIcon: "🔍",
      points: 250
    }
  },
  {
    id: "quest-3",
    title: "供应链导航",
    description: "弄清发运如何把供应商和门店连起来。",
    difficulty: "intermediate",
    category: "traversal",
    steps: [
      {
        id: "step-3-1",
    instruction: "点击「发运」实体",
        targetType: "entity",
        targetId: "shipment",
    hint: "找 📦 包裹图标"
      },
      {
        id: "step-3-2",
    instruction: "沿「由供应商发出」关系走到「供应商」",
        targetType: "relationship",
        targetId: "shipment_from_supplier",
    hint: "看看货是从谁那里发出的"
      },
      {
        id: "step-3-3",
    instruction: "沿「送达门店」关系走到「门店」",
        targetType: "relationship",
        targetId: "shipment_to_store",
    hint: "看看货最终送到哪里"
      }
    ],
    reward: {
    badge: "供应链达人",
      badgeIcon: "🌐",
      points: 200
    }
  },
  {
    id: "quest-4",
    title: "查询探索",
    description: "学会用自然语言提问。",
    difficulty: "advanced",
    category: "query",
    steps: [
      {
        id: "step-4-1",
    instruction: "试着问：「看看金牌客户都有谁」",
        targetType: "query",
    hint: "在查询演练场里输入"
      },
      {
        id: "step-4-2",
    instruction: "再问：「哪些商品来自埃塞俄比亚？」",
        targetType: "query",
    hint: "用自然语言按产地筛选"
      },
      {
        id: "step-4-3",
    instruction: "试试跳转查询：「Arif Ramadhan 下过哪些订单？」",
        targetType: "query",
    hint: "这会沿着「客户 → 订单」的关系一路查下去"
      }
    ],
    reward: {
    badge: "查询高手",
      badgeIcon: "🧙",
      points: 300
    }
  },
  {
    id: "quest-5",
    title: "数据绑定探秘",
    description: "看清本体概念如何接到真实的数据平台。",
    difficulty: "advanced",
    category: "exploration",
    steps: [
      {
        id: "step-5-1",
    instruction: "选中「客户」实体，查看它的数据绑定",
        targetType: "entity",
        targetId: "customer",
    hint: "到检查器里找「数据绑定」这一节"
      },
      {
        id: "step-5-2",
    instruction: "看看客户属性如何映射到源表字段",
        targetType: "property",
        targetId: "name",
    hint: "注意 name 对应源表里的 full_name"
      },
      {
        id: "step-5-3",
    instruction: "查看「商品」实体的绑定，留意数据源和表名",
        targetType: "entity",
        targetId: "product",
    hint: "看商品下方的数据绑定卡片"
      }
    ],
    reward: {
    badge: "绑定专家",
      badgeIcon: "🔗",
      points: 350
    }
  }
];

// Pre-defined NL query responses for demo
export interface QueryResponse {
  query: string;
  matches: string[];
  result: string;
  highlightEntities: string[];
  highlightRelationships: string[];
}

export const nlQueryResponses: QueryResponse[] = [
  {
    query: "看看金牌客户都有谁",
    matches: ["金牌", "gold", "gold tier"],
    result: "找到 1 位金牌客户：\n• Arif Ramadhan（CUST-001）— 2024 年起为金牌会员",
    highlightEntities: ["customer"],
    highlightRelationships: []
  },
  {
    query: "哪些商品来自埃塞俄比亚",
    matches: ["埃塞俄比亚", "ethiopia", "ethiopian"],
    result: "找到 1 款埃塞俄比亚商品：\n• 埃塞俄比亚单品（☕ 手冲）— $4.50\n  货源：埃塞俄比亚高原农场",
    highlightEntities: ["product", "supplier"],
    highlightRelationships: ["product_sourced_from_supplier"]
  },
  {
    query: "Arif Ramadhan 下过哪些订单",
    matches: ["arif", "订单", "arif ramadhan"],
    result: "Arif Ramadhan 的订单：\n• ORD-2025-001 — $12.50（已完成）\n  商品：埃塞俄比亚单品 ×2、哥伦比亚拿铁 ×1\n  门店：西雅图市中心店",
    highlightEntities: ["customer", "order", "store"],
    highlightRelationships: ["customer_places_order", "order_processed_at_store"]
  },
  {
    query: "西雅图有几家门店",
    matches: ["西雅图", "门店", "seattle", "stores"],
    result: "西雅图共有 2 家门店：\n• Fourth Coffee — 西雅图市中心店（45 座）\n• Fourth Coffee — 国会山店（32 座）",
    highlightEntities: ["store"],
    highlightRelationships: []
  },
  {
    query: "看看哥伦比亚拿铁的供应链",
    matches: ["供应链", "哥伦比亚拿铁", "colombian latte", "supply chain"],
    result: "哥伦比亚拿铁的供应链：\n• 咖啡豆产地：哥伦比亚 🇨🇴\n• 供应商：哥伦比亚山地烘焙\n• 认证：雨林联盟 🌿\n• 最近一批发运：SHIP-001（1 月 27 日签收）",
    highlightEntities: ["product", "supplier", "shipment"],
    highlightRelationships: ["product_sourced_from_supplier", "shipment_from_supplier"]
  },
  {
    query: "什么是实体类型",
    matches: ["实体类型", "什么是实体", "entity type"],
    result: "实体类型是对现实世界概念的复用式逻辑建模，例如客户、商品、订单。它统一了名称、描述、标识属性和属性定义，让不同团队说同一个词时指的是同一件事。",
    highlightEntities: [],
    highlightRelationships: []
  },
  {
    query: "什么是关系",
    matches: ["什么是关系", "关系", "relationship"],
    result: "关系是两个实体类型之间带类型、有方向的连接。比如「客户 下单 订单」定义了客户与订单如何相连。关系本身也可以带属性，例如数量或置信度。",
    highlightEntities: [],
    highlightRelationships: []
  },
  {
    query: "看看铂金客户",
    matches: ["铂金", "platinum"],
    result: "找到 1 位铂金客户：\n• Jaroslav Cerny（CUST-002）— 铂金会员\n  累计消费：$3,420.00\n  入会时间：2023 年 1 月",
    highlightEntities: ["customer"],
    highlightRelationships: []
  },
  {
    query: "列出所有有机商品",
    matches: ["有机", "organic"],
    result: "找到 2 款有机商品：\n• 埃塞俄比亚单品（手冲）— $4.50 🌱\n• 星云冷萃（冷萃）— $5.25 🌱",
    highlightEntities: ["product"],
    highlightRelationships: []
  }
];
