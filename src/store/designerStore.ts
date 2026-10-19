/**
 * Zustand store for the Ontology Designer.
 *
 * Manages a *draft* ontology that is independent of the main appStore.
 * Changes here don't affect the main graph until the user explicitly
 * exports or loads the designed ontology.
 */
import { create } from 'zustand';
import type { Ontology, EntityType, Property, Relationship, RelationshipAttribute } from '../data/ontology';

// ─── Validation ──────────────────────────────────────────────────────────────

export interface ValidationError {
  message: string;
  entityId?: string;
  relationshipId?: string;
}

// ─── Fabric IQ naming rules ─────────────────────────────────────────────────
// 1–26 chars, alphanumeric + hyphens + underscores, must start & end with
// an alphanumeric character.

const FABRIC_IQ_NAME_RE = /^[\p{L}\p{N}]([\p{L}\p{N}_-]{0,24}[\p{L}\p{N}])?$/u;

export function isValidFabricIQName(name: string): boolean {
  return FABRIC_IQ_NAME_RE.test(name);
}

export function fabricIQNameError(kind: string, name: string): string | null {
  if (!name) return null; // empty names are caught separately
  if (name.length > 26) return `${kind}名称「${name}」超过 26 个字符。`;
  if (!/^[\p{L}\p{N}]/u.test(name)) return `${kind}名称「${name}」必须以字母、数字或汉字开头。`;
  if (!/[\p{L}\p{N}]$/u.test(name)) return `${kind}名称「${name}」必须以字母、数字或汉字结尾。`;
  if (!FABRIC_IQ_NAME_RE.test(name)) return `${kind}名称「${name}」只能包含文字、数字、连字符和下划线。`;
  return null;
}

export function validateOntology(ontology: Ontology): ValidationError[] {
  const errors: ValidationError[] = [];

  if (ontology.entityTypes.length === 0) {
    errors.push({ message: '至少添加一个实体类型。' });
  }

  const entityIds = new Set<string>();

  // Cross-entity property name → type map for uniqueness check (§7.2)
  const propNameTypeMap = new Map<string, { type: string; entityName: string }>();

  for (const e of ontology.entityTypes) {
    const label = e.name || '未命名实体';
    if (!e.id) {
      errors.push({ message: `「${label}」缺少内部 ID。`, entityId: e.id });
    } else if (entityIds.has(e.id)) {
      errors.push({ message: `两个实体用了同一个 ID「${e.id}」，请改掉其中一个。`, entityId: e.id });
    } else {
      entityIds.add(e.id);
    }
    if (!e.name) {
      errors.push({ message: '有实体还没有名称，请补上。', entityId: e.id });
    }

    // §7.1 — Entity type name validation
    const nameErr = fabricIQNameError('实体', e.name);
    if (nameErr) {
      errors.push({ message: nameErr, entityId: e.id });
    }

    const hasIdentifier = e.properties.some((p) => p.isIdentifier);
    if (!hasIdentifier) {
      errors.push({
        message: `「${label}」没有标识属性。点某个属性上的钥匙图标 🔑，把它设为唯一标识。`,
        entityId: e.id,
      });
    }

    // §1 partial — Identifier properties must be string or integer
    for (const p of e.properties) {
      if (p.isIdentifier && p.type !== 'string' && p.type !== 'integer') {
        errors.push({
          message: `「${label}」的标识属性「${p.name}」必须是字符串或整数类型，才能与 Fabric IQ 兼容。`,
          entityId: e.id,
        });
      }

      // §7.2 — Property name validation
      if (p.name) {
        const propNameErr = fabricIQNameError('属性', p.name);
        if (propNameErr) {
          errors.push({ message: propNameErr, entityId: e.id });
        }
        // Cross-entity uniqueness: same property name must map to the same type
        const existing = propNameTypeMap.get(p.name);
        if (existing && existing.type !== p.type) {
          errors.push({
            message: `属性「${p.name}」在「${label}」中是 ${p.type}，在「${existing.entityName}」中是 ${existing.type}。属性同名时，Fabric IQ 要求类型一致。`,
            entityId: e.id,
          });
        } else if (!existing) {
          propNameTypeMap.set(p.name, { type: p.type, entityName: label });
        }
      }
    }
  }

  const graphElementIds = new Set(entityIds);
  for (const r of ontology.relationships) {
    const label = r.name || '未命名关系';
    if (!r.id) {
      errors.push({ message: `「${label}」缺少内部 ID。`, relationshipId: r.id });
    } else if (graphElementIds.has(r.id)) {
      const message = entityIds.has(r.id)
        ? `一个实体和一条关系用了同一个 ID「${r.id}」。设计器图谱里的 ID 必须唯一。`
        : `两条关系用了同一个 ID「${r.id}」，请改掉其中一条。`;
      errors.push({ message, relationshipId: r.id });
    } else {
      graphElementIds.add(r.id);
    }
    if (!entityIds.has(r.from)) {
      const fromLabel = r.from || '（未填写）';
      errors.push({
        message: `「${label}」的起点「${fromLabel}」不存在，请选择有效的起点实体。`,
        relationshipId: r.id,
      });
    }
    if (!entityIds.has(r.to)) {
      const toLabel = r.to || '（未填写）';
      errors.push({
        message: `「${label}」的终点「${toLabel}」不存在，请选择有效的终点实体。`,
        relationshipId: r.id,
      });
    }
  }

  return errors;
}

// ─── ID helpers ──────────────────────────────────────────────────────────────

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    || 'entity';
}

let entityCounter = 0;
let relationshipCounter = 0;

function nextEntityId(name: string, existingIds: ReadonlySet<string>): string {
  let id: string;
  do {
    id = `${slugify(name)}-${++entityCounter}`;
  } while (existingIds.has(id));
  return id;
}

function nextRelationshipId(name: string, existingIds: ReadonlySet<string>): string {
  let id: string;
  do {
    id = `rel-${slugify(name)}-${++relationshipCounter}`;
  } while (existingIds.has(id));
  return id;
}

function graphElementIds(ontology: Ontology): Set<string> {
  return new Set([
    ...ontology.entityTypes.map((entity) => entity.id),
    ...ontology.relationships.map((relationship) => relationship.id),
  ]);
}

// ─── Default palette ─────────────────────────────────────────────────────────

export const ENTITY_COLORS = [
  '#0078D4', '#107C10', '#D83B01', '#5C2D91',
  '#00A9E0', '#FFB900', '#E81123', '#008272',
];

export const ENTITY_ICONS = [
  '📦', '👤', '🏢', '📋', '🛒', '💳', '📊', '🔧',
  '🌐', '📁', '🎯', '⚡', '🔗', '📝', '🏷️', '📈',
];

// ─── History helpers ─────────────────────────────────────────────────────────

const HISTORY_LIMIT = 50;

function cloneOntology(o: Ontology): Ontology {
  return JSON.parse(JSON.stringify(o));
}

/** Returns _past/_future updates to spread into set(). Call before mutating. */
function historyPush(s: { _past: Ontology[]; ontology: Ontology }): { _past: Ontology[]; _future: Ontology[] } {
  const past = [...s._past, cloneOntology(s.ontology)];
  if (past.length > HISTORY_LIMIT) past.shift();
  return { _past: past, _future: [] };
}

// ─── Store ───────────────────────────────────────────────────────────────────

interface DesignerState {
  // Draft ontology
  ontology: Ontology;
  selectedEntityId: string | null;
  selectedRelationshipId: string | null;
  validationErrors: ValidationError[];
  _lastValidatedAt: number;

  // Actions — ontology metadata
  setOntologyName: (name: string) => void;
  setOntologyDescription: (description: string) => void;

  // Actions — entities
  addEntity: () => void;
  updateEntity: (id: string, updates: Partial<Omit<EntityType, 'id' | 'properties'>>) => void;
  removeEntity: (id: string) => void;
  selectEntity: (id: string | null) => void;

  // Actions — properties
  addProperty: (entityId: string) => void;
  updateProperty: (entityId: string, index: number, updates: Partial<Property>) => void;
  removeProperty: (entityId: string, index: number) => void;
  moveProperty: (entityId: string, fromIndex: number, toIndex: number) => void;

  // Actions — relationships
  addRelationship: (from: string, to: string) => void;
  updateRelationship: (id: string, updates: Partial<Omit<Relationship, 'id'>>) => void;
  removeRelationship: (id: string) => void;
  selectRelationship: (id: string | null) => void;
  addRelationshipAttribute: (relId: string) => void;
  updateRelationshipAttribute: (relId: string, index: number, updates: Partial<RelationshipAttribute>) => void;
  removeRelationshipAttribute: (relId: string, index: number) => void;

  // Actions — bulk
  loadDraft: (ontology: Ontology) => void;
  resetDraft: () => void;
  validate: () => ValidationError[];

  // History (undo / redo)
  _past: Ontology[];
  _future: Ontology[];
  undo: () => void;
  redo: () => void;
}

function emptyOntology(): Ontology {
  return {
    name: '我的本体',
    description: '',
    entityTypes: [],
    relationships: [],
  };
}

export const useDesignerStore = create<DesignerState>((set, get) => ({
  ontology: emptyOntology(),
  selectedEntityId: null,
  selectedRelationshipId: null,
  validationErrors: [],
  _lastValidatedAt: 0,
  _past: [],
  _future: [],

  // ─ Metadata ─────────────────────────────────────────────────────────────
  setOntologyName: (name) =>
    set((s) => ({ ...historyPush(s), ontology: { ...s.ontology, name } })),

  setOntologyDescription: (description) =>
    set((s) => ({ ...historyPush(s), ontology: { ...s.ontology, description } })),

  // ─ Entities ─────────────────────────────────────────────────────────────
  addEntity: () => {
    const name = 'New Entity';
    const ontology = get().ontology;
    const entityTypes = ontology.entityTypes;
    const colorIdx = entityTypes.length % ENTITY_COLORS.length;
    const iconIdx = entityTypes.length % ENTITY_ICONS.length;
    const entity: EntityType = {
      id: nextEntityId(name, graphElementIds(ontology)),
      name,
      description: '',
      icon: ENTITY_ICONS[iconIdx],
      color: ENTITY_COLORS[colorIdx],
      properties: [{ name: 'id', type: 'string', isIdentifier: true }],
    };
    set((s) => ({
      ...historyPush(s),
      ontology: { ...s.ontology, entityTypes: [entity, ...s.ontology.entityTypes] },
      selectedEntityId: entity.id,
      selectedRelationshipId: null,
    }));
  },

  updateEntity: (id, updates) =>
    set((s) => ({
      ...historyPush(s),
      ontology: {
        ...s.ontology,
        entityTypes: s.ontology.entityTypes.map((e) =>
          e.id === id ? { ...e, ...updates } : e,
        ),
      },
    })),

  removeEntity: (id) =>
    set((s) => ({
      ...historyPush(s),
      ontology: {
        ...s.ontology,
        entityTypes: s.ontology.entityTypes.filter((e) => e.id !== id),
        relationships: s.ontology.relationships.filter(
          (r) => r.from !== id && r.to !== id,
        ),
      },
      selectedEntityId: s.selectedEntityId === id ? null : s.selectedEntityId,
    })),

  selectEntity: (id) =>
    set({ selectedEntityId: id, selectedRelationshipId: null }),

  // ─ Properties ───────────────────────────────────────────────────────────
  addProperty: (entityId) =>
    set((s) => ({
      ...historyPush(s),
      ontology: {
        ...s.ontology,
        entityTypes: s.ontology.entityTypes.map((e) =>
          e.id === entityId
            ? { ...e, properties: [...e.properties, { name: '', type: 'string' as const }] }
            : e,
        ),
      },
    })),

  updateProperty: (entityId, index, updates) =>
    set((s) => ({
      ...historyPush(s),
      ontology: {
        ...s.ontology,
        entityTypes: s.ontology.entityTypes.map((e) =>
          e.id === entityId
            ? {
                ...e,
                properties: e.properties.map((p, i) =>
                  i === index ? { ...p, ...updates } : p,
                ),
              }
            : e,
        ),
      },
    })),

  removeProperty: (entityId, index) =>
    set((s) => ({
      ...historyPush(s),
      ontology: {
        ...s.ontology,
        entityTypes: s.ontology.entityTypes.map((e) =>
          e.id === entityId
            ? { ...e, properties: e.properties.filter((_, i) => i !== index) }
            : e,
        ),
      },
    })),

  moveProperty: (entityId, fromIndex, toIndex) =>
    set((s) => ({
      ...historyPush(s),
      ontology: {
        ...s.ontology,
        entityTypes: s.ontology.entityTypes.map((e) => {
          if (e.id !== entityId) return e;
          const props = [...e.properties];
          const [moved] = props.splice(fromIndex, 1);
          props.splice(toIndex, 0, moved);
          return { ...e, properties: props };
        }),
      },
    })),

  // ─ Relationships ────────────────────────────────────────────────────────
  addRelationship: (from, to) => {
    const ontology = get().ontology;
    const rel: Relationship = {
      id: nextRelationshipId(
        'relates-to',
        graphElementIds(ontology),
      ),
      name: 'relates_to',
      from,
      to,
      cardinality: 'one-to-many',
      description: '',
    };
    set((s) => ({
      ...historyPush(s),
      ontology: { ...s.ontology, relationships: [rel, ...s.ontology.relationships] },
      selectedRelationshipId: rel.id,
      selectedEntityId: null,
    }));
  },

  updateRelationship: (id, updates) =>
    set((s) => ({
      ...historyPush(s),
      ontology: {
        ...s.ontology,
        relationships: s.ontology.relationships.map((r) =>
          r.id === id ? { ...r, ...updates } : r,
        ),
      },
    })),

  removeRelationship: (id) =>
    set((s) => ({
      ...historyPush(s),
      ontology: {
        ...s.ontology,
        relationships: s.ontology.relationships.filter((r) => r.id !== id),
      },
      selectedRelationshipId: s.selectedRelationshipId === id ? null : s.selectedRelationshipId,
    })),

  selectRelationship: (id) =>
    set({ selectedRelationshipId: id, selectedEntityId: null }),

  addRelationshipAttribute: (relId) =>
    set((s) => ({
      ...historyPush(s),
      ontology: {
        ...s.ontology,
        relationships: s.ontology.relationships.map((r) =>
          r.id === relId
            ? { ...r, attributes: [...(r.attributes ?? []), { name: '', type: 'string' }] }
            : r,
        ),
      },
    })),

  updateRelationshipAttribute: (relId, index, updates) =>
    set((s) => ({
      ...historyPush(s),
      ontology: {
        ...s.ontology,
        relationships: s.ontology.relationships.map((r) =>
          r.id === relId
            ? {
                ...r,
                attributes: (r.attributes ?? []).map((a, i) =>
                  i === index ? { ...a, ...updates } : a,
                ),
              }
            : r,
        ),
      },
    })),

  removeRelationshipAttribute: (relId, index) =>
    set((s) => ({
      ...historyPush(s),
      ontology: {
        ...s.ontology,
        relationships: s.ontology.relationships.map((r) =>
          r.id === relId
            ? { ...r, attributes: (r.attributes ?? []).filter((_, i) => i !== index) }
            : r,
        ),
      },
    })),

  // ─ Bulk ─────────────────────────────────────────────────────────────────
  loadDraft: (ontology) =>
    set({ ontology, _past: [], _future: [], selectedEntityId: null, selectedRelationshipId: null, validationErrors: [] }),

  resetDraft: () =>
    set({ ontology: emptyOntology(), _past: [], _future: [], selectedEntityId: null, selectedRelationshipId: null, validationErrors: [] }),

  validate: () => {
    const errors = validateOntology(get().ontology);
    set({ validationErrors: errors, _lastValidatedAt: Date.now() });
    return errors;
  },

  // ─ Undo / Redo ─────────────────────────────────────────────────────────
  undo: () => {
    const { _past, _future, ontology } = get();
    if (_past.length === 0) return;
    const previous = _past[_past.length - 1];
    set({
      ontology: previous,
      _past: _past.slice(0, -1),
      _future: [cloneOntology(ontology), ..._future],
    });
  },

  redo: () => {
    const { _past, _future, ontology } = get();
    if (_future.length === 0) return;
    const next = _future[0];
    set({
      ontology: next,
      _past: [..._past, cloneOntology(ontology)],
      _future: _future.slice(1),
    });
  },
}));
