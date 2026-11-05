import type { DataBinding, Ontology } from '../data/ontology';

/**
 * 保存在浏览器里的本体库。
 *
 * 整个库存放在一个 localStorage 键里，一次读写即为原子操作，
 * 不会出现「列表更新了、当前项没更新」的中间态。
 */

export const ONTOLOGY_LIBRARY_KEY = 'ontology-playground.ontologies';
export const ONTOLOGY_LIBRARY_VERSION = 1;

const MAX_NAME_LENGTH = 80;

export interface SavedOntologyRecord {
  id: string;
  name: string;
  savedAt: number;
  ontology: Ontology;
  bindings: DataBinding[];
}

export interface OntologyLibrary {
  version: number;
  activeId: string | null;
  entries: SavedOntologyRecord[];
}

export interface LibraryReadResult {
  library: OntologyLibrary;
  /** localStorage 是否可读写；false 时调用方应转为内存模式 */
  available: boolean;
  /** 原始内容存在但无法解析 */
  corrupt: boolean;
}

export type LibraryWriteResult =
  | { ok: true }
  | { ok: false; reason: 'quota' | 'unavailable'; detail?: string };

export function emptyLibrary(): OntologyLibrary {
  return { version: ONTOLOGY_LIBRARY_VERSION, activeId: null, entries: [] };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isOntologyShapeValid(value: unknown): value is Ontology {
  if (!isRecord(value)) return false;
  return typeof value.name === 'string'
    && Array.isArray(value.entityTypes)
    && Array.isArray(value.relationships);
}

function isRecordShapeValid(value: unknown): value is SavedOntologyRecord {
  if (!isRecord(value)) return false;
  return typeof value.id === 'string'
    && value.id.length > 0
    && typeof value.name === 'string'
    && typeof value.savedAt === 'number'
    && isOntologyShapeValid(value.ontology)
    && Array.isArray(value.bindings);
}

/** 解析库内容，丢弃结构非法的单条记录，不抛异常。 */
export function parseOntologyLibrary(raw: string | null): {
  library: OntologyLibrary;
  corrupt: boolean;
  droppedEntries: number;
} {
  if (!raw) return { library: emptyLibrary(), corrupt: false, droppedEntries: 0 };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { library: emptyLibrary(), corrupt: true, droppedEntries: 0 };
  }

  if (!isRecord(parsed) || parsed.version !== ONTOLOGY_LIBRARY_VERSION) {
    return { library: emptyLibrary(), corrupt: true, droppedEntries: 0 };
  }

  const rawEntries = Array.isArray(parsed.entries) ? parsed.entries : [];
  const entries = rawEntries.filter(isRecordShapeValid);
  const droppedEntries = rawEntries.length - entries.length;
  const activeId = typeof parsed.activeId === 'string' ? parsed.activeId : null;

  return {
    library: {
      version: ONTOLOGY_LIBRARY_VERSION,
      activeId: activeId && entries.some((entry) => entry.id === activeId) ? activeId : null,
      entries,
    },
    corrupt: false,
    droppedEntries,
  };
}

export function readOntologyLibrary(): LibraryReadResult {
  if (typeof window === 'undefined' || !('localStorage' in window)) {
    return { library: emptyLibrary(), available: false, corrupt: false };
  }

  let raw: string | null;
  try {
    raw = window.localStorage.getItem(ONTOLOGY_LIBRARY_KEY);
  } catch {
    return { library: emptyLibrary(), available: false, corrupt: false };
  }

  const { library, corrupt } = parseOntologyLibrary(raw);
  return { library, available: true, corrupt };
}

export function isQuotaError(error: unknown): boolean {
  if (typeof DOMException !== 'undefined' && error instanceof DOMException) {
    return error.name === 'QuotaExceededError'
      || error.name === 'NS_ERROR_DOM_QUOTA_REACHED'
      || error.code === 22;
  }
  return error instanceof Error && /quota/i.test(error.message);
}

export function writeOntologyLibrary(library: OntologyLibrary): LibraryWriteResult {
  if (typeof window === 'undefined' || !('localStorage' in window)) {
    return { ok: false, reason: 'unavailable' };
  }

  let serialized: string;
  try {
    serialized = JSON.stringify(library);
  } catch {
    return { ok: false, reason: 'unavailable' };
  }

  try {
    window.localStorage.setItem(ONTOLOGY_LIBRARY_KEY, serialized);
    return { ok: true };
  } catch (error) {
    if (isQuotaError(error)) {
      return { ok: false, reason: 'quota' };
    }
    return { ok: false, reason: 'unavailable' };
  }
}

/** 用于变更比对的稳定序列化：同一份内容得到同一字符串。 */
export function serializeOntologyPayload(ontology: Ontology, bindings: DataBinding[]): string {
  return JSON.stringify({ ontology, bindings });
}

export function normalizeOntologyName(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ').slice(0, MAX_NAME_LENGTH);
}

export function createSavedOntologyId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `ont_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

/** 名称相同的记录被替换（保留原 id），并按保存时间倒序排列。 */
export function upsertOntologyRecord(
  library: OntologyLibrary,
  record: SavedOntologyRecord,
): OntologyLibrary {
  const existing = library.entries.find((entry) => entry.name === record.name);
  const nextRecord: SavedOntologyRecord = existing
    ? { ...record, id: existing.id }
    : record;
  const entries = [
    nextRecord,
    ...library.entries.filter((entry) => entry.id !== nextRecord.id),
  ].sort((a, b) => b.savedAt - a.savedAt);

  return {
    version: ONTOLOGY_LIBRARY_VERSION,
    activeId: nextRecord.id,
    entries,
  };
}

export function removeOntologyRecord(library: OntologyLibrary, id: string): OntologyLibrary {
  const entries = library.entries.filter((entry) => entry.id !== id);
  return {
    version: ONTOLOGY_LIBRARY_VERSION,
    activeId: library.activeId === id ? null : library.activeId,
    entries,
  };
}

export function setActiveRecord(library: OntologyLibrary, id: string | null): OntologyLibrary {
  return {
    ...library,
    activeId: id && library.entries.some((entry) => entry.id === id) ? id : null,
    version: ONTOLOGY_LIBRARY_VERSION,
  };
}
