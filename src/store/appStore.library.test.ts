import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Ontology } from '../data/ontology';
import { useAppStore } from './appStore';
import { ONTOLOGY_LIBRARY_KEY, readOntologyLibrary } from '../lib/ontologyStorage';

function makeOntology(name: string, entityCount = 1): Ontology {
  return {
    name,
    description: `${name} 说明`,
    entityTypes: Array.from({ length: entityCount }, (_, index) => ({
      id: `entity_${index}`,
      name: `实体${index}`,
      description: '',
      icon: '📦',
      color: '#0078D4',
      properties: [{ name: `id_${index}`, type: 'string' as const, isIdentifier: true }],
    })),
    relationships: [],
  };
}

function resetStore() {
  useAppStore.setState({
    savedOntologies: [],
    activeSavedId: null,
    baselinePayload: null,
    storageAvailable: true,
  });
  useAppStore.getState().resetToDefault();
}

beforeEach(() => {
  window.localStorage.clear();
  resetStore();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('saveCurrentOntology', () => {
  it('保存后写入库并指向新条目', () => {
    useAppStore.getState().loadOntology(makeOntology('第一个'), []);
    const result = useAppStore.getState().saveCurrentOntology('  第一个  ');

    expect(result).toEqual({ ok: true, name: '第一个', overwritten: false });
    const state = useAppStore.getState();
    expect(state.savedOntologies).toHaveLength(1);
    expect(state.savedOntologies[0].name).toBe('第一个');
    expect(state.activeSavedId).toBe(state.savedOntologies[0].id);
    expect(readOntologyLibrary().library.entries).toHaveLength(1);
  });

  it('同名保存覆盖原条目，条目数与 id 不变', () => {
    useAppStore.getState().loadOntology(makeOntology('零售', 1), []);
    useAppStore.getState().saveCurrentOntology('零售');
    const idBefore = useAppStore.getState().savedOntologies[0].id;

    useAppStore.getState().loadOntology(makeOntology('零售', 3), []);
    const result = useAppStore.getState().saveCurrentOntology('零售');

    expect(result).toEqual({ ok: true, name: '零售', overwritten: true });
    const entries = useAppStore.getState().savedOntologies;
    expect(entries).toHaveLength(1);
    expect(entries[0].id).toBe(idBefore);
    expect(entries[0].ontology.entityTypes).toHaveLength(3);
  });

  it('改名保存会新增一条', () => {
    useAppStore.getState().loadOntology(makeOntology('A'), []);
    useAppStore.getState().saveCurrentOntology('A');
    const result = useAppStore.getState().saveCurrentOntology('B');

    expect(result).toEqual({ ok: true, name: 'B', overwritten: false });
    expect(useAppStore.getState().savedOntologies.map((entry) => entry.name).sort()).toEqual(['A', 'B']);
  });

  it('空名称被拒绝，库不变', () => {
    const result = useAppStore.getState().saveCurrentOntology('   ');
    expect(result).toEqual({ ok: false, reason: 'empty-name' });
    expect(useAppStore.getState().savedOntologies).toHaveLength(0);
  });

  it('配额不足时状态不变', () => {
    useAppStore.getState().loadOntology(makeOntology('A'), []);
    useAppStore.getState().saveCurrentOntology('A');
    const before = useAppStore.getState().savedOntologies;

    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError');
    });

    useAppStore.getState().loadOntology(makeOntology('B'), []);
    const result = useAppStore.getState().saveCurrentOntology('B');

    expect(result).toEqual({ ok: false, reason: 'quota' });
    expect(useAppStore.getState().savedOntologies).toBe(before);
  });
});

describe('loadSavedOntology', () => {
  it('切换后重置选中与任务状态', () => {
    useAppStore.getState().loadOntology(makeOntology('目标'), []);
    useAppStore.getState().saveCurrentOntology('目标');
    const targetId = useAppStore.getState().savedOntologies[0].id;

    useAppStore.getState().selectEntity('entity_0');
    useAppStore.getState().startQuest(useAppStore.getState().availableQuests[0]?.id ?? 'x');

    expect(useAppStore.getState().loadSavedOntology(targetId)).toBe(true);
    const state = useAppStore.getState();
    expect(state.selectedEntityId).toBeNull();
    expect(state.activeQuest).toBeNull();
    expect(state.activeSavedId).toBe(targetId);
    expect(state.currentOntology.name).toBe('目标');
  });

  it('id 不存在时返回 false 且不改变状态', () => {
    const before = useAppStore.getState().currentOntology;
    expect(useAppStore.getState().loadSavedOntology('missing')).toBe(false);
    expect(useAppStore.getState().currentOntology).toBe(before);
  });
});

describe('deleteSavedOntology', () => {
  it('删除后库里少一条，当前内容保留但不再属于存档', () => {
    useAppStore.getState().loadOntology(makeOntology('待删'), []);
    useAppStore.getState().saveCurrentOntology('待删');
    const id = useAppStore.getState().savedOntologies[0].id;

    expect(useAppStore.getState().deleteSavedOntology(id)).toBe(true);
    const state = useAppStore.getState();
    expect(state.savedOntologies).toHaveLength(0);
    expect(state.activeSavedId).toBeNull();
    expect(state.baselinePayload).toBeNull();
    expect(state.currentOntology.name).toBe('待删');
    expect(state.hasUnsavedChanges()).toBe(true);
  });

  it('删除非当前条目时保留当前绑定', () => {
    useAppStore.getState().loadOntology(makeOntology('A'), []);
    useAppStore.getState().saveCurrentOntology('A');
    const idA = useAppStore.getState().savedOntologies[0].id;

    useAppStore.getState().loadOntology(makeOntology('B'), []);
    useAppStore.getState().saveCurrentOntology('B');
    const idB = useAppStore.getState().savedOntologies.find((e) => e.name === 'B')!.id;

    useAppStore.getState().loadSavedOntology(idB);
    useAppStore.getState().deleteSavedOntology(idA);

    expect(useAppStore.getState().activeSavedId).toBe(idB);
    expect(useAppStore.getState().hasUnsavedChanges()).toBe(false);
  });
});

describe('hasUnsavedChanges', () => {
  it('刚保存过是干净的', () => {
    useAppStore.getState().loadOntology(makeOntology('A'), []);
    useAppStore.getState().saveCurrentOntology('A');
    expect(useAppStore.getState().hasUnsavedChanges()).toBe(false);
  });

  it('换成库外的本体后变脏', () => {
    useAppStore.getState().loadOntology(makeOntology('A'), []);
    useAppStore.getState().saveCurrentOntology('A');
    useAppStore.getState().loadOntology(makeOntology('新导入'), []);
    expect(useAppStore.getState().hasUnsavedChanges()).toBe(true);
  });

  it('加载库里已有的同内容本体不算脏', () => {
    useAppStore.getState().loadOntology(makeOntology('A'), []);
    useAppStore.getState().saveCurrentOntology('A');
    const saved = useAppStore.getState().savedOntologies[0];

    useAppStore.getState().loadOntology(saved.ontology, saved.bindings);
    expect(useAppStore.getState().hasUnsavedChanges()).toBe(false);
  });

  it('首次使用、库为空时视为脏', () => {
    expect(useAppStore.getState().savedOntologies).toHaveLength(0);
    expect(useAppStore.getState().hasUnsavedChanges()).toBe(true);
  });
});

describe('写入内容', () => {
  it('库中保留本体与数据绑定', () => {
    const ontology = makeOntology('带绑定');
    const bindings = [
      { entityTypeId: 'entity_0', source: 'Lakehouse', table: 't0', columnMappings: { id_0: 'id' } },
    ];
    useAppStore.getState().loadOntology(ontology, bindings);
    useAppStore.getState().saveCurrentOntology('带绑定');

    const stored = JSON.parse(window.localStorage.getItem(ONTOLOGY_LIBRARY_KEY) ?? '{}');
    expect(stored.entries[0].bindings).toEqual(bindings);
    expect(stored.activeId).toBe(stored.entries[0].id);
  });
});
