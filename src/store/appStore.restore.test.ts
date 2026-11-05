import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Ontology } from '../data/ontology';
import { ONTOLOGY_LIBRARY_KEY, ONTOLOGY_LIBRARY_VERSION } from '../lib/ontologyStorage';

function makeOntology(name: string): Ontology {
  return {
    name,
    description: '',
    entityTypes: [
      {
        id: 'a',
        name: '实体A',
        description: '',
        icon: '📦',
        color: '#0078D4',
        properties: [{ name: 'aId', type: 'string', isIdentifier: true }],
      },
    ],
    relationships: [],
  };
}

function seedLibrary(activeId: string, name = '存档本体') {
  const record = {
    id: activeId,
    name,
    savedAt: Date.now(),
    ontology: makeOntology(name),
    bindings: [],
  };
  window.localStorage.setItem(
    ONTOLOGY_LIBRARY_KEY,
    JSON.stringify({ version: ONTOLOGY_LIBRARY_VERSION, activeId, entries: [record] }),
  );
  return record;
}

async function loadFreshStore() {
  vi.resetModules();
  return await import('./appStore');
}

beforeEach(() => {
  window.localStorage.clear();
  window.location.hash = '';
});

describe('启动恢复', () => {
  it('首页带库时直接以存档本体初始化', async () => {
    seedLibrary('rec-1', '我的存档');

    const { useAppStore } = await loadFreshStore();
    const state = useAppStore.getState();

    expect(state.currentOntology.name).toBe('我的存档');
    expect(state.activeSavedId).toBe('rec-1');
    expect(state.savedOntologies).toHaveLength(1);
    expect(state.hasUnsavedChanges()).toBe(false);
  });

  it('分享链接优先，不恢复存档', async () => {
    seedLibrary('rec-1');
    window.location.hash = '#/share/abc123';

    const { useAppStore } = await loadFreshStore();
    const state = useAppStore.getState();

    expect(state.currentOntology.name).not.toBe('存档本体');
    expect(state.activeSavedId).toBeNull();
    expect(state.savedOntologies).toHaveLength(1);
  });

  it('目录详情深链优先，不恢复存档', async () => {
    seedLibrary('rec-1');
    window.location.hash = '#/catalogue/coffee-shop';

    const { useAppStore } = await loadFreshStore();
    expect(useAppStore.getState().activeSavedId).toBeNull();
  });

  it('设计器与学堂路由不恢复', async () => {
    seedLibrary('rec-1');

    window.location.hash = '#/designer';
    expect((await loadFreshStore()).useAppStore.getState().activeSavedId).toBeNull();

    window.location.hash = '#/learn';
    expect((await loadFreshStore()).useAppStore.getState().activeSavedId).toBeNull();
  });

  it('activeId 指不到任何条目时回退默认本体，库保留', async () => {
    window.localStorage.setItem(
      ONTOLOGY_LIBRARY_KEY,
      JSON.stringify({
        version: ONTOLOGY_LIBRARY_VERSION,
        activeId: 'gone',
        entries: [{
          id: 'rec-1',
          name: '仓库里的',
          savedAt: Date.now(),
          ontology: makeOntology('仓库里的'),
          bindings: [],
        }],
      }),
    );

    const { useAppStore } = await loadFreshStore();
    const state = useAppStore.getState();

    expect(state.activeSavedId).toBeNull();
    expect(state.currentOntology.name).not.toBe('仓库里的');
    expect(state.savedOntologies).toHaveLength(1);
  });

  it('库损坏时以默认本体启动', async () => {
    window.localStorage.setItem(ONTOLOGY_LIBRARY_KEY, 'oops');

    const { useAppStore } = await loadFreshStore();
    const state = useAppStore.getState();

    expect(state.savedOntologies).toEqual([]);
    expect(state.activeSavedId).toBeNull();
  });
});
