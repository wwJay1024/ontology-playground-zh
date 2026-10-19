// Fourth Coffee - Sample Ontology for Microsoft Fabric IQ Demo

export interface Property {
  name: string;
  type: 'string' | 'integer' | 'decimal' | 'double' | 'date' | 'datetime' | 'boolean' | 'enum';
  isIdentifier?: boolean;
  unit?: string;
  values?: string[];
  description?: string;
}

export interface RelationshipAttribute {
  name: string;
  type: string;
}

export type RelationshipKind = 'association' | 'subclass';

export interface Relationship {
  id: string;
  name: string;
  from: string;
  to: string;
  cardinality: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';
  kind?: RelationshipKind;
  description?: string;
  attributes?: RelationshipAttribute[];
}

export interface EntityType {
  id: string;
  name: string;
  description: string;
  properties: Property[];
  icon: string;
  color: string;
}

export interface EntityInstance {
  id: string;
  entityTypeId: string;
  values: Record<string, unknown>;
}

export type PreservedSourceFeature = 'owlImports' | 'shacl';

export interface OntologyRdfMetadata {
  ontologyIri?: string;
  versionIri?: string;
  versionInfo?: string;
  license?: string;
  imports: string[];
  preservedSourceFeatures: PreservedSourceFeature[];
}

export interface Ontology {
  name: string;
  description: string;
  entityTypes: EntityType[];
  relationships: Relationship[];
  rdfMetadata?: OntologyRdfMetadata;
}

export interface DataBinding {
  entityTypeId: string;
  source: string;
  table: string;
  columnMappings: Record<string, string>;
}

// The Fourth Coffee Ontology
export const cosmicCoffeeOntology: Ontology = {
  name: "Fourth Coffee",
  description: "示例本体：一家现代咖啡连锁，涵盖供应商、商品、门店、客户与订单。",
  entityTypes: [
    {
      id: "customer",
      name: "客户",
      description: "在门店购买咖啡商品的客户",
      icon: "👤",
      color: "#0078D4", // Microsoft Blue
      properties: [
        { name: "customerId", type: "string", isIdentifier: true, description: "客户的唯一标识" },
        { name: "name", type: "string", description: "客户姓名" },
        { name: "email", type: "string", description: "联系邮箱" },
        { name: "loyaltyTier", type: "enum", values: ["Bronze", "Silver", "Gold", "Platinum"], description: "会员等级" },
        { name: "joinDate", type: "date", description: "入会日期" },
        { name: "totalSpend", type: "decimal", unit: "USD", description: "累计消费金额" }
      ]
    },
    {
      id: "order",
      name: "订单",
      description: "客户在门店完成的一笔购买",
      icon: "🧾",
      color: "#107C10", // Microsoft Green
      properties: [
        { name: "orderId", type: "string", isIdentifier: true, description: "订单的唯一标识" },
        { name: "timestamp", type: "datetime", description: "下单时间" },
        { name: "total", type: "decimal", unit: "USD", description: "订单总金额" },
        { name: "status", type: "enum", values: ["Pending", "Preparing", "Ready", "Completed", "Cancelled"], description: "当前订单状态" },
        { name: "paymentMethod", type: "enum", values: ["Card", "Cash", "Mobile", "Gift Card"], description: "支付方式" }
      ]
    },
    {
      id: "product",
      name: "商品",
      description: "在售的咖啡饮品或商品",
      icon: "☕",
      color: "#5C2D91", // Microsoft Purple
      properties: [
        { name: "productId", type: "string", isIdentifier: true, description: "商品的唯一标识" },
        { name: "name", type: "string", description: "商品名称" },
        { name: "category", type: "enum", values: ["Espresso", "Brewed", "Cold Brew", "Tea", "Food", "Merchandise"], description: "商品分类" },
        { name: "price", type: "decimal", unit: "USD", description: "单价" },
        { name: "origin", type: "string", description: "咖啡豆原产国" },
        { name: "isOrganic", type: "boolean", description: "是否获得有机认证" }
      ]
    },
    {
      id: "store",
      name: "门店",
      description: "一家实体咖啡门店",
      icon: "🏪",
      color: "#FFB900", // Microsoft Yellow/Gold
      properties: [
        { name: "storeId", type: "string", isIdentifier: true, description: "门店的唯一标识" },
        { name: "name", type: "string", description: "门店名称" },
        { name: "city", type: "string", description: "所在城市" },
        { name: "state", type: "string", description: "所在省/州" },
        { name: "openDate", type: "date", description: "开业日期" },
        { name: "capacity", type: "integer", description: "座位数" }
      ]
    },
    {
      id: "supplier",
      name: "供应商",
      description: "提供咖啡豆或货品的合作供应商",
      icon: "🚚",
      color: "#D83B01", // Microsoft Orange
      properties: [
        { name: "supplierId", type: "string", isIdentifier: true, description: "供应商的唯一标识" },
        { name: "name", type: "string", description: "供应商公司名称" },
        { name: "country", type: "string", description: "所在国家" },
        { name: "certification", type: "enum", values: ["Fair Trade", "Rainforest Alliance", "Organic", "Direct Trade", "None"], description: "可持续认证" },
        { name: "rating", type: "decimal", description: "质量评分（1–5）" }
      ]
    },
    {
      id: "shipment",
      name: "发运",
      description: "从供应商发往门店的一批货",
      icon: "📦",
      color: "#00A9E0", // Light Blue
      properties: [
        { name: "shipmentId", type: "string", isIdentifier: true, description: "发运的唯一标识" },
        { name: "dispatchDate", type: "date", description: "供应商发货日期" },
        { name: "arrivalDate", type: "date", description: "到达门店日期" },
        { name: "status", type: "enum", values: ["In Transit", "Delivered", "Delayed"], description: "发运状态" },
        { name: "weight", type: "decimal", unit: "kg", description: "发运总重量" }
      ]
    }
  ],
  relationships: [
    {
      id: "customer_places_order",
      name: "下单",
      from: "customer",
      to: "order",
      cardinality: "one-to-many",
      description: "客户提交一笔或多笔订单"
    },
    {
      id: "order_contains_product",
      name: "包含",
      from: "order",
      to: "product",
      cardinality: "many-to-many",
      description: "一笔订单包含一件或多件商品",
      attributes: [
        { name: "quantity", type: "integer" },
        { name: "customizations", type: "string" }
      ]
    },
    {
      id: "order_processed_at_store",
      name: "由门店处理",
      from: "order",
      to: "store",
      cardinality: "many-to-one",
      description: "订单在指定门店完成"
    },
    {
      id: "product_sourced_from_supplier",
      name: "货源来自",
      from: "product",
      to: "supplier",
      cardinality: "many-to-one",
      description: "商品的原料来自某家供应商"
    },
    {
      id: "shipment_from_supplier",
      name: "由供应商发出",
      from: "shipment",
      to: "supplier",
      cardinality: "many-to-one",
      description: "发运由供应商发起"
    },
    {
      id: "shipment_to_store",
      name: "送达门店",
      from: "shipment",
      to: "store",
      cardinality: "many-to-one",
      description: "发运送达指定门店"
    },
    {
      id: "shipment_contains_product",
      name: "承运商品",
      from: "shipment",
      to: "product",
      cardinality: "many-to-many",
      description: "一次发运承载的商品",
      attributes: [
        { name: "quantity", type: "integer" }
      ]
    }
  ]
};

// Sample entity instances for demonstration
export const sampleInstances: EntityInstance[] = [
  // Customers
  { id: "cust-001", entityTypeId: "customer", values: { customerId: "CUST-001", name: "Arif Ramadhan", email: "customer001@example.com", loyaltyTier: "Gold", joinDate: "2024-03-15", totalSpend: 1245.50 }},
  { id: "cust-002", entityTypeId: "customer", values: { customerId: "CUST-002", name: "Jaroslav Cerny", email: "customer002@example.com", loyaltyTier: "Platinum", joinDate: "2023-01-20", totalSpend: 3420.00 }},
  { id: "cust-003", entityTypeId: "customer", values: { customerId: "CUST-003", name: "Sumber Agvaan", email: "customer003@example.com", loyaltyTier: "Bronze", joinDate: "2025-11-01", totalSpend: 89.00 }},
  
  // Products
  { id: "prod-001", entityTypeId: "product", values: { productId: "PROD-001", name: "Ethiopian Single Origin", category: "Brewed", price: 4.50, origin: "Ethiopia", isOrganic: true }},
  { id: "prod-002", entityTypeId: "product", values: { productId: "PROD-002", name: "Colombian Latte", category: "Espresso", price: 5.75, origin: "Colombia", isOrganic: false }},
  { id: "prod-003", entityTypeId: "product", values: { productId: "PROD-003", name: "Nebula Cold Brew", category: "Cold Brew", price: 5.25, origin: "Guatemala", isOrganic: true }},
  
  // Stores
  { id: "store-001", entityTypeId: "store", values: { storeId: "STORE-001", name: "Fourth Coffee - Downtown Seattle", city: "Seattle", state: "WA", openDate: "2022-06-15", capacity: 45 }},
  { id: "store-002", entityTypeId: "store", values: { storeId: "STORE-002", name: "Fourth Coffee - Capitol Hill", city: "Seattle", state: "WA", openDate: "2023-02-28", capacity: 32 }},
  
  // Suppliers
  { id: "supp-001", entityTypeId: "supplier", values: { supplierId: "SUPP-001", name: "Ethiopia Highlands Farm", country: "Ethiopia", certification: "Fair Trade", rating: 4.8 }},
  { id: "supp-002", entityTypeId: "supplier", values: { supplierId: "SUPP-002", name: "Colombian Mountain Roasters", country: "Colombia", certification: "Rainforest Alliance", rating: 4.6 }},
  
  // Orders
  { id: "order-001", entityTypeId: "order", values: { orderId: "ORD-2025-001", timestamp: "2025-01-28T09:15:00", total: 12.50, status: "Completed", paymentMethod: "Mobile" }},
  { id: "order-002", entityTypeId: "order", values: { orderId: "ORD-2025-002", timestamp: "2025-01-28T10:30:00", total: 8.75, status: "Preparing", paymentMethod: "Card" }},
  
  // Shipments
  { id: "ship-001", entityTypeId: "shipment", values: { shipmentId: "SHIP-001", dispatchDate: "2025-01-20", arrivalDate: "2025-01-27", status: "Delivered", weight: 250.5 }},
];

// Sample data bindings showing connection to a data lakehouse platform
export const sampleBindings: DataBinding[] = [
  {
    entityTypeId: "customer",
    source: "Data Lakehouse",
    table: "lakehouse.bronze.customers",
    columnMappings: {
      customerId: "customer_id",
      name: "full_name",
      email: "email_address",
      loyaltyTier: "loyalty_status",
      joinDate: "registration_date",
      totalSpend: "lifetime_value"
    }
  },
  {
    entityTypeId: "order",
    source: "Data Lakehouse",
    table: "lakehouse.silver.orders",
    columnMappings: {
      orderId: "order_id",
      timestamp: "order_timestamp",
      total: "order_total",
      status: "order_status",
      paymentMethod: "payment_type"
    }
  },
  {
    entityTypeId: "product",
    source: "Semantic model",
    table: "semantic_model.Products",
    columnMappings: {
      productId: "ProductKey",
      name: "ProductName",
      category: "ProductCategory",
      price: "UnitPrice",
      origin: "OriginCountry"
    }
  }
];
