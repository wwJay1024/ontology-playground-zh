import type { Ontology, DataBinding } from './ontology';

export interface SampleOntologyEntry {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'retail' | 'healthcare' | 'finance' | 'manufacturing' | 'education' | 'iq-lab';
  ontology: Ontology;
  bindings: DataBinding[];
}

// E-Commerce Ontology
const ecommerceOntology: Ontology = {
  name: "电商平台",
  description: "由买家、商品、购物车、订单与评价构成的在线零售业务模型",
  entityTypes: [
    {
      id: "buyer",
      name: "买家",
      description: "完成下单的注册用户",
      icon: "🛒",
      color: "#0078D4",
      properties: [
        { name: "buyerId", type: "string", isIdentifier: true },
        { name: "email", type: "string" },
        { name: "memberSince", type: "date" },
        { name: "loyaltyTier", type: "string" },
        { name: "totalSpent", type: "decimal", unit: "USD" }
      ]
    },
    {
      id: "product",
      name: "商品",
      description: "可供销售的商品",
      icon: "📦",
      color: "#107C10",
      properties: [
        { name: "sku", type: "string", isIdentifier: true },
        { name: "name", type: "string" },
        { name: "category", type: "string" },
        { name: "price", type: "decimal", unit: "USD" },
        { name: "stockQty", type: "integer" }
      ]
    },
    {
      id: "cart",
      name: "购物车",
      description: "正在进行的购物会话",
      icon: "🛍️",
      color: "#FFB900",
      properties: [
        { name: "cartId", type: "string", isIdentifier: true },
        { name: "createdAt", type: "datetime" },
        { name: "itemCount", type: "integer" },
        { name: "subtotal", type: "decimal", unit: "USD" }
      ]
    },
    {
      id: "order",
      name: "订单",
      description: "已完成的购买交易",
      icon: "📋",
      color: "#8764B8",
      properties: [
        { name: "orderId", type: "string", isIdentifier: true },
        { name: "orderDate", type: "datetime" },
        { name: "status", type: "string" },
        { name: "total", type: "decimal", unit: "USD" },
        { name: "shippingMethod", type: "string" }
      ]
    },
    {
      id: "review",
      name: "评价",
      description: "用户对商品的评价与评分",
      icon: "⭐",
      color: "#00B7C3",
      properties: [
        { name: "reviewId", type: "string", isIdentifier: true },
        { name: "rating", type: "integer" },
        { name: "title", type: "string" },
        { name: "body", type: "string" },
        { name: "verified", type: "boolean" }
      ]
    }
  ],
  relationships: [
    { id: "buyer_has_cart", name: "拥有购物车", from: "buyer", to: "cart", cardinality: "one-to-one", description: "买家当前的购物车" },
    { id: "cart_contains", name: "选购", from: "cart", to: "product", cardinality: "many-to-many", description: "购物车里的商品" },
    { id: "buyer_places", name: "下单", from: "buyer", to: "order", cardinality: "one-to-many", description: "买家提交的订单" },
    { id: "order_includes", name: "包含", from: "order", to: "product", cardinality: "many-to-many", description: "订单中的商品" },
    { id: "buyer_writes", name: "撰写", from: "buyer", to: "review", cardinality: "one-to-many", description: "买家写的评价" },
    { id: "review_for", name: "评价对象", from: "review", to: "product", cardinality: "many-to-one", description: "被评价的商品" }
  ]
};

// Healthcare Ontology
const healthcareOntology: Ontology = {
  name: "医疗系统",
  description: "由诊疗提供方、预约、诊断与处方构成的诊疗管理模型",
  entityTypes: [
    {
      id: "patient",
      name: "患者",
      description: "接受诊疗的人",
      icon: "🏥",
      color: "#0078D4",
      properties: [
        { name: "patientId", type: "string", isIdentifier: true },
        { name: "mrn", type: "string" },
        { name: "dateOfBirth", type: "date" },
        { name: "bloodType", type: "string" },
        { name: "allergies", type: "string" }
      ]
    },
    {
      id: "provider",
      name: "诊疗提供方",
      description: "提供医疗服务的机构或人员",
      icon: "👨‍⚕️",
      color: "#107C10",
      properties: [
        { name: "providerId", type: "string", isIdentifier: true },
        { name: "name", type: "string" },
        { name: "specialty", type: "string" },
        { name: "licenseNumber", type: "string" },
        { name: "department", type: "string" }
      ]
    },
    {
      id: "appointment",
      name: "预约",
      description: "已排期的就诊",
      icon: "📅",
      color: "#FFB900",
      properties: [
        { name: "appointmentId", type: "string", isIdentifier: true },
        { name: "scheduledTime", type: "datetime" },
        { name: "duration", type: "integer", unit: "minutes" },
        { name: "type", type: "string" },
        { name: "status", type: "string" }
      ]
    },
    {
      id: "diagnosis",
      name: "诊断",
      description: "已确认的病情",
      icon: "🩺",
      color: "#D13438",
      properties: [
        { name: "diagnosisId", type: "string", isIdentifier: true },
        { name: "icdCode", type: "string" },
        { name: "description", type: "string" },
        { name: "severity", type: "string" },
        { name: "diagnosedDate", type: "date" }
      ]
    },
    {
      id: "prescription",
      name: "处方",
      description: "用药医嘱",
      icon: "💊",
      color: "#8764B8",
      properties: [
        { name: "rxNumber", type: "string", isIdentifier: true },
        { name: "medication", type: "string" },
        { name: "dosage", type: "string" },
        { name: "frequency", type: "string" },
        { name: "refillsRemaining", type: "integer" }
      ]
    }
  ],
  relationships: [
    { id: "patient_has_appt", name: "预约就诊", from: "patient", to: "appointment", cardinality: "one-to-many", description: "患者的预约记录" },
    { id: "provider_sees", name: "接诊", from: "provider", to: "appointment", cardinality: "one-to-many", description: "医生接诊的预约" },
    { id: "patient_diagnosed", name: "诊断为", from: "patient", to: "diagnosis", cardinality: "one-to-many", description: "患者的诊断" },
    { id: "provider_diagnoses", name: "作出诊断", from: "provider", to: "diagnosis", cardinality: "one-to-many", description: "医生作出的诊断" },
    { id: "diagnosis_treated", name: "对应处方", from: "diagnosis", to: "prescription", cardinality: "one-to-many", description: "该诊断对应的处方" },
    { id: "provider_prescribes", name: "开具处方", from: "provider", to: "prescription", cardinality: "one-to-many", description: "医生开具的处方" }
  ]
};

// Financial Services Ontology
const financeOntology: Ontology = {
  name: "银行与金融",
  description: "由账户、交易、贷款与投资构成的金融服务模型",
  entityTypes: [
    {
      id: "customer",
      name: "客户",
      description: "银行账户持有人",
      icon: "👤",
      color: "#0078D4",
      properties: [
        { name: "customerId", type: "string", isIdentifier: true },
        { name: "name", type: "string" },
        { name: "ssn", type: "string" },
        { name: "creditScore", type: "integer" },
        { name: "riskProfile", type: "string" }
      ]
    },
    {
      id: "account",
      name: "账户",
      description: "金融账户",
      icon: "🏦",
      color: "#107C10",
      properties: [
        { name: "accountNumber", type: "string", isIdentifier: true },
        { name: "type", type: "string" },
        { name: "balance", type: "decimal", unit: "USD" },
        { name: "interestRate", type: "decimal", unit: "%" },
        { name: "openDate", type: "date" }
      ]
    },
    {
      id: "transaction",
      name: "交易",
      description: "资金往来记录",
      icon: "💳",
      color: "#FFB900",
      properties: [
        { name: "transactionId", type: "string", isIdentifier: true },
        { name: "amount", type: "decimal", unit: "USD" },
        { name: "type", type: "string" },
        { name: "timestamp", type: "datetime" },
        { name: "merchant", type: "string" }
      ]
    },
    {
      id: "loan",
      name: "贷款",
      description: "信贷产品",
      icon: "📄",
      color: "#D13438",
      properties: [
        { name: "loanId", type: "string", isIdentifier: true },
        { name: "principal", type: "decimal", unit: "USD" },
        { name: "apr", type: "decimal", unit: "%" },
        { name: "term", type: "integer", unit: "months" },
        { name: "status", type: "string" }
      ]
    },
    {
      id: "investment",
      name: "投资",
      description: "所持有的投资项目",
      icon: "📈",
      color: "#8764B8",
      properties: [
        { name: "holdingId", type: "string", isIdentifier: true },
        { name: "symbol", type: "string" },
        { name: "shares", type: "decimal" },
        { name: "purchasePrice", type: "decimal", unit: "USD" },
        { name: "currentValue", type: "decimal", unit: "USD" }
      ]
    }
  ],
  relationships: [
    { id: "customer_owns_acct", name: "持有账户", from: "customer", to: "account", cardinality: "one-to-many", description: "客户名下的账户" },
    { id: "account_has_txn", name: "发生交易", from: "account", to: "transaction", cardinality: "one-to-many", description: "账户的交易流水" },
    { id: "customer_has_loan", name: "申请贷款", from: "customer", to: "loan", cardinality: "one-to-many", description: "客户的贷款" },
    { id: "account_funds_loan", name: "放款来源", from: "account", to: "loan", cardinality: "one-to-many", description: "还款资金来源" },
    { id: "customer_holds", name: "持有投资", from: "customer", to: "investment", cardinality: "one-to-many", description: "投资组合" },
    { id: "account_linked", name: "关联账户", from: "account", to: "investment", cardinality: "one-to-many", description: "关联的证券账户" }
  ]
};

// Manufacturing Ontology
const manufacturingOntology: Ontology = {
  name: "智能制造",
  description: "由设备、传感器、工单与质检构成的生产线模型",
  entityTypes: [
    {
      id: "machine",
      name: "设备",
      description: "生产设备",
      icon: "🏭",
      color: "#0078D4",
      properties: [
        { name: "machineId", type: "string", isIdentifier: true },
        { name: "model", type: "string" },
        { name: "location", type: "string" },
        { name: "status", type: "string" },
        { name: "lastMaintenance", type: "date" }
      ]
    },
    {
      id: "sensor",
      name: "传感器",
      description: "物联网监测装置",
      icon: "📡",
      color: "#00B7C3",
      properties: [
        { name: "sensorId", type: "string", isIdentifier: true },
        { name: "type", type: "string" },
        { name: "unit", type: "string" },
        { name: "minThreshold", type: "decimal" },
        { name: "maxThreshold", type: "decimal" }
      ]
    },
    {
      id: "workorder",
      name: "工单",
      description: "生产作业单",
      icon: "📋",
      color: "#FFB900",
      properties: [
        { name: "workOrderId", type: "string", isIdentifier: true },
        { name: "product", type: "string" },
        { name: "quantity", type: "integer" },
        { name: "priority", type: "string" },
        { name: "dueDate", type: "date" }
      ]
    },
    {
      id: "part",
      name: "零件",
      description: "零部件或物料",
      icon: "🔩",
      color: "#107C10",
      properties: [
        { name: "partNumber", type: "string", isIdentifier: true },
        { name: "name", type: "string" },
        { name: "stockLevel", type: "integer" },
        { name: "reorderPoint", type: "integer" },
        { name: "unitCost", type: "decimal", unit: "USD" }
      ]
    },
    {
      id: "qualitycheck",
      name: "质检",
      description: "检验结果",
      icon: "✅",
      color: "#8764B8",
      properties: [
        { name: "checkId", type: "string", isIdentifier: true },
        { name: "timestamp", type: "datetime" },
        { name: "passed", type: "boolean" },
        { name: "defectType", type: "string" },
        { name: "inspector", type: "string" }
      ]
    }
  ],
  relationships: [
    { id: "machine_has_sensor", name: "被监测", from: "machine", to: "sensor", cardinality: "one-to-many", description: "设备上的传感器" },
    { id: "machine_runs", name: "执行工单", from: "machine", to: "workorder", cardinality: "one-to-many", description: "设备执行的工单" },
    { id: "workorder_uses", name: "消耗零件", from: "workorder", to: "part", cardinality: "many-to-many", description: "消耗的零件" },
    { id: "workorder_checked", name: "接受质检", from: "workorder", to: "qualitycheck", cardinality: "one-to-many", description: "质量检验" },
    { id: "machine_maintains", name: "需要备件", from: "machine", to: "part", cardinality: "many-to-many", description: "所需备件" }
  ]
};

// University Ontology
const universityOntology: Ontology = {
  name: "高校系统",
  description: "由学生、教授、课程与院系构成的教学管理模型",
  entityTypes: [
    {
      id: "student",
      name: "学生",
      description: "在读学生",
      icon: "🎓",
      color: "#0078D4",
      properties: [
        { name: "studentId", type: "string", isIdentifier: true },
        { name: "name", type: "string" },
        { name: "major", type: "string" },
        { name: "gpa", type: "decimal" },
        { name: "enrollmentYear", type: "integer" }
      ]
    },
    {
      id: "professor",
      name: "教授",
      description: "教职员工",
      icon: "👨‍🏫",
      color: "#107C10",
      properties: [
        { name: "facultyId", type: "string", isIdentifier: true },
        { name: "name", type: "string" },
        { name: "department", type: "string" },
        { name: "tenure", type: "boolean" },
        { name: "researchArea", type: "string" }
      ]
    },
    {
      id: "course",
      name: "课程",
      description: "教学课程",
      icon: "📚",
      color: "#FFB900",
      properties: [
        { name: "courseCode", type: "string", isIdentifier: true },
        { name: "title", type: "string" },
        { name: "credits", type: "integer" },
        { name: "level", type: "string" },
        { name: "maxEnrollment", type: "integer" }
      ]
    },
    {
      id: "department",
      name: "院系",
      description: "教学单位",
      icon: "🏛️",
      color: "#8764B8",
      properties: [
        { name: "deptCode", type: "string", isIdentifier: true },
        { name: "name", type: "string" },
        { name: "building", type: "string" },
        { name: "budget", type: "decimal", unit: "USD" }
      ]
    },
    {
      id: "enrollment",
      name: "选课",
      description: "课程注册记录",
      icon: "📝",
      color: "#00B7C3",
      properties: [
        { name: "enrollmentId", type: "string", isIdentifier: true },
        { name: "semester", type: "string" },
        { name: "grade", type: "string" },
        { name: "status", type: "string" }
      ]
    }
  ],
  relationships: [
    { id: "student_enrolls", name: "选课记录", from: "student", to: "enrollment", cardinality: "one-to-many", description: "学生的选课记录" },
    { id: "enrollment_for", name: "对应课程", from: "enrollment", to: "course", cardinality: "many-to-one", description: "选课对应的课程" },
    { id: "prof_teaches", name: "授课", from: "professor", to: "course", cardinality: "one-to-many", description: "教授的课程" },
    { id: "prof_belongs", name: "所属院系", from: "professor", to: "department", cardinality: "many-to-one", description: "教职员工所属院系" },
    { id: "course_offered", name: "开课院系", from: "course", to: "department", cardinality: "many-to-one", description: "课程的开课院系" },
    { id: "student_advised", name: "受指导于", from: "student", to: "professor", cardinality: "many-to-one", description: "学业导师" }
  ]
};

export const sampleOntologies: SampleOntologyEntry[] = [
  {
    id: "ecommerce",
    name: "电商平台",
    description: "买家、商品、购物车、订单与评价构成的在线零售模型",
    icon: "🛒",
    category: "retail",
    ontology: ecommerceOntology,
    bindings: []
  },
  {
    id: "healthcare",
    name: "医疗系统",
    description: "诊疗提供方、预约、诊断与处方构成的诊疗流程",
    icon: "🏥",
    category: "healthcare",
    ontology: healthcareOntology,
    bindings: []
  },
  {
    id: "finance",
    name: "银行与金融",
    description: "账户、交易、贷款与投资构成的金融服务",
    icon: "🏦",
    category: "finance",
    ontology: financeOntology,
    bindings: []
  },
  {
    id: "manufacturing",
    name: "智能制造",
    description: "设备、传感器、工单与质检构成的生产线",
    icon: "🏭",
    category: "manufacturing",
    ontology: manufacturingOntology,
    bindings: []
  },
  {
    id: "university",
    name: "高校系统",
    description: "学生、教授、课程与院系构成的教学体系",
    icon: "🎓",
    category: "education",
    ontology: universityOntology,
    bindings: []
  }
];

export const categoryLabels: Record<string, string> = {
  retail: "Retail",
  healthcare: "Healthcare",
  finance: "Finance",
  manufacturing: "Manufacturing",
  education: "Education",
  'iq-lab': "IQ Lab"
};

export const categoryColors: Record<string, string> = {
  retail: "#0078D4",
  healthcare: "#D13438",
  finance: "#107C10",
  manufacturing: "#FFB900",
  education: "#8764B8",
  'iq-lab': "#0099BC"
};
