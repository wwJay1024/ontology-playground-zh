/**
 * Starter templates for the Ontology Designer.
 *
 * Each template provides a small, domain-specific ontology (2–3 entities with
 * relationships) so users don't face a blank page when they open the designer.
 */
import type { Ontology } from './ontology';

export interface DesignerTemplate {
  id: string;
  label: string;
  description: string;
  icon: string;
  ontology: Ontology;
}

export const designerTemplates: DesignerTemplate[] = [
  {
    id: 'retail',
    label: '零售',
    description: '客户、商品与订单',
    icon: '🛒',
    ontology: {
      name: '零售本体',
      description: '面向零售业务的本体，涵盖客户、商品与订单。',
      entityTypes: [
        {
          id: 'customer',
          name: '客户',
          description: '购买商品的人',
          icon: '👤',
          color: '#4A90D9',
          properties: [
            { name: 'customerId', type: 'string', isIdentifier: true },
            { name: 'name', type: 'string' },
            { name: 'email', type: 'string' },
            { name: 'memberSince', type: 'date' },
          ],
        },
        {
          id: 'product',
          name: '商品',
          description: '可供销售的商品',
          icon: '📦',
          color: '#E74C3C',
          properties: [
            { name: 'sku', type: 'string', isIdentifier: true },
            { name: 'name', type: 'string' },
            { name: 'price', type: 'decimal', unit: 'USD' },
            { name: 'category', type: 'string' },
          ],
        },
        {
          id: 'order',
          name: '订单',
          description: '一次购买交易',
          icon: '🧾',
          color: '#27AE60',
          properties: [
            { name: 'orderId', type: 'string', isIdentifier: true },
            { name: 'orderDate', type: 'date' },
            { name: 'total', type: 'decimal', unit: 'USD' },
          ],
        },
      ],
      relationships: [
        { id: 'r-places', name: '下单', from: 'customer', to: 'order', cardinality: 'one-to-many', description: '客户提交订单' },
        { id: 'r-contains', name: '包含', from: 'order', to: 'product', cardinality: 'many-to-many', description: '订单包含商品' },
      ],
    },
  },
  {
    id: 'healthcare',
    label: '医疗',
    description: '患者、诊疗提供方与就诊',
    icon: '🏥',
    ontology: {
      name: '医疗本体',
      description: '面向医疗业务的本体，涵盖患者、诊疗提供方与就诊。',
      entityTypes: [
        {
          id: 'patient',
          name: '患者',
          description: '接受诊疗的人',
          icon: '🩺',
          color: '#3498DB',
          properties: [
            { name: 'patientId', type: 'string', isIdentifier: true },
            { name: 'name', type: 'string' },
            { name: 'dateOfBirth', type: 'date' },
            { name: 'bloodType', type: 'enum', values: ['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−'] },
          ],
        },
        {
          id: 'provider',
          name: '诊疗提供方',
          description: '医疗服务人员',
          icon: '👨‍⚕️',
          color: '#2ECC71',
          properties: [
            { name: 'npi', type: 'string', isIdentifier: true },
            { name: 'name', type: 'string' },
            { name: 'specialty', type: 'string' },
          ],
        },
        {
          id: 'encounter',
          name: '就诊',
          description: '一次就诊或预约',
          icon: '📋',
          color: '#9B59B6',
          properties: [
            { name: 'encounterId', type: 'string', isIdentifier: true },
            { name: 'date', type: 'datetime' },
            { name: 'diagnosis', type: 'string' },
          ],
        },
      ],
      relationships: [
        { id: 'r-has-encounter', name: '就诊记录', from: 'patient', to: 'encounter', cardinality: 'one-to-many', description: '患者的一次就诊' },
        { id: 'r-seen-by', name: '接诊方', from: 'encounter', to: 'provider', cardinality: 'many-to-one', description: '该次就诊由谁接诊' },
      ],
    },
  },
  {
    id: 'finance',
    label: '金融',
    description: '账户、交易与交易主体',
    icon: '💰',
    ontology: {
      name: '金融本体',
      description: '面向金融业务的本体，涵盖账户、交易与交易主体。',
      entityTypes: [
        {
          id: 'party',
          name: '交易主体',
          description: '个人或机构',
          icon: '🏦',
          color: '#2C3E50',
          properties: [
            { name: 'partyId', type: 'string', isIdentifier: true },
            { name: 'name', type: 'string' },
            { name: 'type', type: 'enum', values: ['Individual', 'Corporation', 'Trust'] },
          ],
        },
        {
          id: 'account',
          name: '账户',
          description: '金融账户',
          icon: '💳',
          color: '#E67E22',
          properties: [
            { name: 'accountNumber', type: 'string', isIdentifier: true },
            { name: 'accountType', type: 'enum', values: ['Checking', 'Savings', 'Loan', 'Credit'] },
            { name: 'balance', type: 'decimal', unit: 'USD' },
            { name: 'openedDate', type: 'date' },
          ],
        },
        {
          id: 'transaction',
          name: '交易',
          description: '一笔资金变动',
          icon: '🔄',
          color: '#1ABC9C',
          properties: [
            { name: 'transactionId', type: 'string', isIdentifier: true },
            { name: 'amount', type: 'decimal', unit: 'USD' },
            { name: 'timestamp', type: 'datetime' },
            { name: 'type', type: 'enum', values: ['Debit', 'Credit', 'Transfer'] },
          ],
        },
      ],
      relationships: [
        { id: 'r-owns', name: '持有', from: 'party', to: 'account', cardinality: 'one-to-many', description: '交易主体持有账户' },
        { id: 'r-has-txn', name: '发生交易', from: 'account', to: 'transaction', cardinality: 'one-to-many', description: '账户发生多笔交易' },
      ],
    },
  },
  {
    id: 'iot',
    label: '物联网',
    description: '设备、传感器与读数',
    icon: '📡',
    ontology: {
      name: '物联网本体',
      description: '面向物联网业务的本体，涵盖设备、传感器与读数。',
      entityTypes: [
        {
          id: 'device',
          name: '设备',
          description: '联网的物联网设备',
          icon: '🖥️',
          color: '#34495E',
          properties: [
            { name: 'deviceId', type: 'string', isIdentifier: true },
            { name: 'manufacturer', type: 'string' },
            { name: 'firmwareVersion', type: 'string' },
            { name: 'installedDate', type: 'date' },
          ],
        },
        {
          id: 'sensor',
          name: '传感器',
          description: '设备上的测量部件',
          icon: '🌡️',
          color: '#E74C3C',
          properties: [
            { name: 'sensorId', type: 'string', isIdentifier: true },
            { name: 'sensorType', type: 'enum', values: ['Temperature', 'Humidity', 'Pressure', 'Motion'] },
            { name: 'unit', type: 'string' },
          ],
        },
        {
          id: 'reading',
          name: '读数',
          description: '某一时刻的传感器测量值',
          icon: '📊',
          color: '#3498DB',
          properties: [
            { name: 'readingId', type: 'string', isIdentifier: true },
            { name: 'value', type: 'decimal' },
            { name: 'timestamp', type: 'datetime' },
          ],
        },
      ],
      relationships: [
        { id: 'r-has-sensor', name: '装有', from: 'device', to: 'sensor', cardinality: 'one-to-many', description: '设备装有传感器' },
        { id: 'r-produces', name: '产生', from: 'sensor', to: 'reading', cardinality: 'one-to-many', description: '传感器产生读数' },
      ],
    },
  },
  {
    id: 'education',
    label: '教育',
    description: '学生、课程与选课',
    icon: '🎓',
    ontology: {
      name: '教育本体',
      description: '面向教育业务的本体，涵盖学生、课程与选课。',
      entityTypes: [
        {
          id: 'student',
          name: '学生',
          description: '注册课程的学生',
          icon: '🧑‍🎓',
          color: '#8E44AD',
          properties: [
            { name: 'studentId', type: 'string', isIdentifier: true },
            { name: 'name', type: 'string' },
            { name: 'enrollmentYear', type: 'integer' },
          ],
        },
        {
          id: 'course',
          name: '课程',
          description: '一门教学课程',
          icon: '📚',
          color: '#D35400',
          properties: [
            { name: 'courseCode', type: 'string', isIdentifier: true },
            { name: 'title', type: 'string' },
            { name: 'credits', type: 'integer' },
          ],
        },
        {
          id: 'instructor',
          name: '教师',
          description: '授课教师',
          icon: '👩‍🏫',
          color: '#16A085',
          properties: [
            { name: 'instructorId', type: 'string', isIdentifier: true },
            { name: 'name', type: 'string' },
            { name: 'department', type: 'string' },
          ],
        },
      ],
      relationships: [
        { id: 'r-enrolled-in', name: '选修', from: 'student', to: 'course', cardinality: 'many-to-many', description: '学生选修课程' },
        { id: 'r-taught-by', name: '授课教师', from: 'course', to: 'instructor', cardinality: 'many-to-one', description: '课程由教师讲授' },
      ],
    },
  },
];
