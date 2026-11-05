import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DataBinding, Ontology } from '../data/ontology';
import {
  ONTOLOGY_LIBRARY_KEY,
  ONTOLOGY_LIBRARY_VERSION,
  createSavedOntologyId,
  emptyLibrary,
  isQuotaError,
  normalizeOntologyName,
  parseOntologyLibrary,
  readOntologyLibrary,
  removeOntologyRecord,
  serializeOntologyPayload,
  setActiveRecord,
  upsertOntologyRecord,
  writeOntologyLibrary,
  type SavedOntologyRecord,
} from './ontologyStorage';

function makeOntology(name: string): Ontology {
  return {
    name,
    description: '测试本体',
    entityTypes: [
      {
        id: 'customer',
        name: '客户',
        description: '',
        icon: '👤',
        color: '#0078D4',
        properties: [{ name: 'customerId', type: 'string', isIdentifier: true }],
      },
    ],
    relationships: [],
  };
}

const bindings: DataBinding[] = [
  { entityTypeId: 'customer', source: 'Lakehouse', table: 't', columnMappings: { customerId: 'id' } },
];

function makeRecord(name: string, savedAt = Date.now()): SavedOntologyRecord {
  return {
    id: createSavedOntologyId(),
    name,
    savedAt,
    ontology: makeOntology(name),
    bindings,
  };
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('readOntologyLibrary / writeOntologyLibrary', () => {
  it('写入后能原样读回', () => {
    const record = makeRecord('零售本体');
    const library = { version: ONTOLOGY_LIBRARY_VERSION, activeId: record.id, entries: [record] };

    expect(writeOntologyLibrary(library)).toEqual({ ok: true });

    const result = readOntologyLibrary();
    expect(result.available).toBe(true);
    expect(result.library.activeId).toBe(record.id);
    expect(result.library.entries).toHaveLength(1);
    expect(result.library.entries[0].name).toBe('零售本体');
    expect(result.library.entries[0].bindings).toEqual(bindings);
  });

  it('空存储返回空库', () => {
    const result = readOntologyLibrary();
    expect(result.library.entries).toEqual([]);
    expect(result.library.activeId).toBeNull();
    expect(result.corrupt).toBe(false);
  });

  it('损坏的 JSON 返回空库并标记 corrupt，且不删除原值', () => {
    window.localStorage.setItem(ONTOLOGY_LIBRARY_KEY, '{not json');

    const result = readOntologyLibrary();
    expect(result.corrupt).toBe(true);
    expect(result.library.entries).toEqual([]);
    expect(window.localStorage.getItem(ONTOLOGY_LIBRARY_KEY)).toBe('{not json');
  });

  it('版本不匹配时返回空库并标记 corrupt', () => {
    window.localStorage.setItem(
      ONTOLOGY_LIBRARY_KEY,
      JSON.stringify({ version: 99, activeId: null, entries: [makeRecord('旧')] }),
    );

    const result = readOntologyLibrary();
    expect(result.corrupt).toBe(true);
    expect(result.library.entries).toEqual([]);
  });

  it('丢弃结构非法的单条记录，保留其余', () => {
    const valid = makeRecord('正常本体');
    window.localStorage.setItem(
      ONTOLOGY_LIBRARY_KEY,
      JSON.stringify({
        version: ONTOLOGY_LIBRARY_VERSION,
        activeId: valid.id,
        entries: [valid, { id: 'broken', name: '坏的', savedAt: 1, ontology: {} }],
      }),
    );

    const result = readOntologyLibrary();
    expect(result.corrupt).toBe(false);
    expect(result.library.entries).toHaveLength(1);
    expect(result.library.entries[0].name).toBe('正常本体');
  });

  it('activeId 指向不存在的条目时置空', () => {
    const record = makeRecord('唯一');
    window.localStorage.setItem(
      ONTOLOGY_LIBRARY_KEY,
      JSON.stringify({ version: ONTOLOGY_LIBRARY_VERSION, activeId: 'missing', entries: [record] }),
    );

    expect(readOntologyLibrary().library.activeId).toBeNull();
  });

  it('配额不足时返回 quota 失败', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError');
    });

    const result = writeOntologyLibrary(emptyLibrary());
    expect(result).toEqual({ ok: false, reason: 'quota' });
  });

  it('存储被禁用时返回 unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect(readOntologyLibrary()).toMatchObject({ available: false });

    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect(writeOntologyLibrary(emptyLibrary())).toEqual({ ok: false, reason: 'unavailable' });
  });
});

describe('parseOntologyLibrary', () => {
  it('空字符串视为空库，不算损坏', () => {
    expect(parseOntologyLibrary(null)).toMatchObject({ corrupt: false, droppedEntries: 0 });
    expect(parseOntologyLibrary('')).toMatchObject({ corrupt: false });
  });
});

describe('normalizeOntologyName', () => {
  it('去掉首尾空白并折叠中间空白', () => {
    expect(normalizeOntologyName('  客户   本体  ')).toBe('客户 本体');
  });

  it('全空白返回空字符串', () => {
    expect(normalizeOntologyName('   \n\t ')).toBe('');
  });

  it('超长名称截断到 80 字', () => {
    expect(normalizeOntologyName('a'.repeat(120))).toHaveLength(80);
  });

  it('保留中文与 emoji', () => {
    expect(normalizeOntologyName('本体 ☕ v2')).toBe('本体 ☕ v2');
  });
});

describe('upsertOntologyRecord', () => {
  it('同名记录被覆盖，保留原 id 并排到最前', () => {
    const first = makeRecord('同名', 1000);
    const other = makeRecord('其他', 2000);
    const library = upsertOntologyRecord(
      upsertOntologyRecord(emptyLibrary(), first),
      other,
    );

    const updated = upsertOntologyRecord({
      ...library,
      entries: library.entries,
    }, { ...makeRecord('同名', 3000) });

    expect(updated.entries).toHaveLength(2);
    expect(updated.entries[0].name).toBe('同名');
    expect(updated.entries[0].savedAt).toBe(3000);
    expect(updated.entries[0].id).toBe(first.id);
    expect(updated.activeId).toBe(first.id);
  });

  it('不同名称新增一条', () => {
    const library = upsertOntologyRecord(emptyLibrary(), makeRecord('A'));
    const next = upsertOntologyRecord(library, makeRecord('B'));

    expect(next.entries).toHaveLength(2);
    expect(next.entries.map((entry) => entry.name).sort()).toEqual(['A', 'B']);
  });
});

describe('removeOntologyRecord / setActiveRecord', () => {
  it('删除记录并清空指向它的 activeId', () => {
    const record = makeRecord('待删');
    const library = upsertOntologyRecord(emptyLibrary(), record);

    const next = removeOntologyRecord(library, record.id);
    expect(next.entries).toEqual([]);
    expect(next.activeId).toBeNull();
  });

  it('setActiveRecord 忽略不存在的 id', () => {
    const record = makeRecord('A');
    const library = upsertOntologyRecord(emptyLibrary(), record);

    expect(setActiveRecord(library, 'nope').activeId).toBeNull();
    expect(setActiveRecord(library, record.id).activeId).toBe(record.id);
  });
});

describe('serializeOntologyPayload', () => {
  it('相同内容得到相同字符串，内容变化则不同', () => {
    const ontology = makeOntology('A');
    const base = serializeOntologyPayload(ontology, bindings);

    expect(serializeOntologyPayload(makeOntology('A'), bindings)).toBe(base);
    expect(serializeOntologyPayload(makeOntology('B'), bindings)).not.toBe(base);
  });
});

describe('isQuotaError', () => {
  it('识别 QuotaExceededError 与普通错误', () => {
    expect(isQuotaError(new DOMException('x', 'QuotaExceededError'))).toBe(true);
    expect(isQuotaError(new Error('boom'))).toBe(false);
  });
});
