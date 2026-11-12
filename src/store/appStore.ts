import { create } from 'zustand';
import type { Quest } from '../data/quests';
import { quests as defaultQuests } from '../data/quests';
import type { Ontology, DataBinding } from '../data/ontology';
import { cosmicCoffeeOntology, sampleBindings } from '../data/ontology';
import { generateQuestsForOntology } from '../data/questGenerator';
import type { CatalogueEntry } from '../types/catalogue';
import {
  ONTOLOGY_LIBRARY_VERSION,
  createSavedOntologyId,
  normalizeOntologyName,
  readOntologyLibrary,
  removeOntologyRecord,
  serializeOntologyPayload,
  upsertOntologyRecord,
  writeOntologyLibrary,
  type SavedOntologyRecord,
} from '../lib/ontologyStorage';

export type ThemeId = 'dark' | 'light' | 'aurora' | 'crimson';

export const THEME_OPTIONS: { id: ThemeId; label: string; swatch: string }[] = [
  { id: 'dark', label: 'Dark', swatch: '#1B1B1B' },
  { id: 'light', label: 'Light', swatch: '#F5F5F5' },
  { id: 'aurora', label: 'Aurora', swatch: '#2AAA92' },
  { id: 'crimson', label: 'Crimson', swatch: '#D6002A' },
];

const DARK_BASED_THEMES: ThemeId[] = ['dark', 'aurora'];

/** Whether a theme uses the dark base palette (drives graph/RDF rendering). */
export function isDarkTheme(theme: ThemeId): boolean {
  return DARK_BASED_THEMES.includes(theme);
}

/** CSS class(es) applied to a themed root element. */
export function themeClass(theme: ThemeId): string {
  switch (theme) {
    case 'light':
      return 'light-theme';
    case 'aurora':
      return 'theme-aurora';
    case 'crimson':
      return 'light-theme theme-crimson';
    default:
      return '';
  }
}

function getInitialTheme(): ThemeId {
  if (typeof window === 'undefined' || !('localStorage' in window)) {
    return 'dark';
  }
  try {
    const stored = window.localStorage.getItem('theme');
    if (stored && THEME_OPTIONS.some((t) => t.id === stored)) {
      return stored as ThemeId;
    }
    // Migrate the legacy light/dark flag
    if (window.localStorage.getItem('darkMode') === 'false') {
      return 'light';
    }
    return 'dark';
  } catch {
    return 'dark';
  }
}

const SIDEBAR_STORAGE_KEY = 'ontology-playground.sidebar-collapsed';

function getInitialSidebarCollapsed(): boolean {
  if (typeof window === 'undefined' || !('localStorage' in window)) return false;
  try {
    return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

const initialTheme = getInitialTheme();

export type SaveOutcome =
  | { ok: true; name: string; overwritten: boolean }
  | { ok: false; reason: 'empty-name' | 'quota' | 'unavailable' };

/**
 * 深链优先：分享链接和目录详情要按 URL 加载，设计器与学堂不渲染顶栏，
 * 这几种情况下都不恢复上次保存的本体。
 */
function shouldSkipRestore(): boolean {
  if (typeof window === 'undefined') return true;
  const hash = window.location.hash || '';
  if (hash.startsWith('#/share/')) return true;
  if (/^#\/catalogue\/[^/?#]+/.test(hash)) return true;
  if (hash.startsWith('#/designer') || hash.startsWith('#/learn')) return true;
  return false;
}

/** 换本体时要重置的全部字段，四处共用（加载、重置、从库加载、初始化）。 */
function ontologyStatePatch(
  ontology: Ontology,
  bindings: DataBinding[],
  catalogueEntry: CatalogueEntry | null,
  quests: Quest[],
) {
  return {
    currentOntology: ontology,
    dataBindings: bindings,
    currentCatalogueEntry: catalogueEntry,
    selectedEntityId: null,
    selectedRelationshipId: null,
    highlightedEntities: [] as string[],
    highlightedRelationships: [] as string[],
    activeQuest: null,
    currentStepIndex: 0,
    availableQuests: quests,
    completedQuests: [] as string[],
  };
}

const libraryRead = readOntologyLibrary();
const restoredRecord: SavedOntologyRecord | null = shouldSkipRestore()
  ? null
  : libraryRead.library.entries.find((entry) => entry.id === libraryRead.library.activeId) ?? null;

const initialOntology = restoredRecord?.ontology ?? cosmicCoffeeOntology;
const initialBindings = restoredRecord?.bindings ?? sampleBindings;
const initialQuests = restoredRecord ? generateQuestsForOntology(initialOntology) : defaultQuests;

interface AppState {
  // Ontology State
  currentOntology: Ontology;
  dataBindings: DataBinding[];
  currentCatalogueEntry: CatalogueEntry | null;

  // Saved Ontologies (browser storage)
  savedOntologies: SavedOntologyRecord[];
  activeSavedId: string | null;
  baselinePayload: string | null;
  storageAvailable: boolean;
  
  // UI State
  selectedEntityId: string | null;
  selectedRelationshipId: string | null;
  highlightedEntities: string[];
  highlightedRelationships: string[];
  showDataBindings: boolean;
  theme: ThemeId;
  darkMode: boolean;
  sidebarCollapsed: boolean;
  
  // Quest State
  availableQuests: Quest[];
  activeQuest: Quest | null;
  currentStepIndex: number;
  completedQuests: string[];
  earnedBadges: { badge: string; icon: string }[];
  totalPoints: number;
  
  // Query State
  queryInput: string;
  queryResult: string | null;
  
  // Ontology Actions
  loadOntology: (
    ontology: Ontology,
    bindings?: DataBinding[],
    catalogueEntry?: CatalogueEntry | null,
  ) => void;
  resetToDefault: () => void;
  exportOntology: () => string;

  // Saved Ontology Actions
  saveCurrentOntology: (name: string) => SaveOutcome;
  loadSavedOntology: (id: string) => boolean;
  deleteSavedOntology: (id: string) => boolean;
  hasUnsavedChanges: () => boolean;
  
  // Actions
  selectEntity: (id: string | null) => void;
  selectRelationship: (id: string | null) => void;
  setHighlightedEntities: (ids: string[]) => void;
  setHighlightedRelationships: (ids: string[]) => void;
  setHighlights: (entityIds: string[], relIds: string[]) => void;
  toggleDataBindings: () => void;
  setTheme: (theme: ThemeId) => void;
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
  
  // Quest Actions
  startQuest: (questId: string) => void;
  advanceQuestStep: () => void;
  completeQuest: () => void;
  abandonQuest: () => void;
  
  // Query Actions
  setQueryInput: (input: string) => void;
  setQueryResult: (result: string | null) => void;
  clearHighlights: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial Ontology State
  currentOntology: initialOntology,
  dataBindings: initialBindings,
  currentCatalogueEntry: null,

  // Initial Saved Ontology State
  savedOntologies: libraryRead.library.entries,
  activeSavedId: restoredRecord?.id ?? null,
  baselinePayload: restoredRecord
    ? serializeOntologyPayload(restoredRecord.ontology, restoredRecord.bindings)
    : null,
  storageAvailable: libraryRead.available,
  
  // Initial UI State
  selectedEntityId: null,
  selectedRelationshipId: null,
  highlightedEntities: [],
  highlightedRelationships: [],
  showDataBindings: false,
  theme: initialTheme,
  darkMode: isDarkTheme(initialTheme),
  sidebarCollapsed: getInitialSidebarCollapsed(),
  
  // Initial Quest State
  availableQuests: initialQuests,
  activeQuest: null,
  currentStepIndex: 0,
  completedQuests: [],
  earnedBadges: [],
  totalPoints: 0,
  
  // Initial Query State
  queryInput: '',
  queryResult: null,
  
  // Ontology Actions
  loadOntology: (ontology, bindings = [], catalogueEntry = null) => {
    set({
      ...ontologyStatePatch(ontology, bindings, catalogueEntry, generateQuestsForOntology(ontology)),
      // 换成本体后与存档解绑；是否算「未保存」由内容比对决定
      activeSavedId: null,
      baselinePayload: null,
    });
  },
  
  resetToDefault: () => set({
    ...ontologyStatePatch(cosmicCoffeeOntology, sampleBindings, null, defaultQuests),
    activeSavedId: null,
    baselinePayload: null,
  }),

  // Saved Ontology Actions
  saveCurrentOntology: (rawName) => {
    const name = normalizeOntologyName(rawName);
    if (!name) return { ok: false, reason: 'empty-name' };

    const { currentOntology, dataBindings, savedOntologies, activeSavedId } = get();
    const existing = savedOntologies.find((entry) => entry.name === name);
    const record: SavedOntologyRecord = {
      id: existing?.id ?? createSavedOntologyId(),
      name,
      savedAt: Date.now(),
      ontology: currentOntology,
      bindings: dataBindings,
    };

    const nextLibrary = upsertOntologyRecord(
      { version: ONTOLOGY_LIBRARY_VERSION, activeId: activeSavedId, entries: savedOntologies },
      record,
    );
    const written = writeOntologyLibrary(nextLibrary);
    if (!written.ok) {
      return { ok: false, reason: written.reason };
    }

    set({
      savedOntologies: nextLibrary.entries,
      activeSavedId: nextLibrary.activeId,
      baselinePayload: serializeOntologyPayload(currentOntology, dataBindings),
      storageAvailable: true,
    });
    return { ok: true, name, overwritten: Boolean(existing) };
  },

  loadSavedOntology: (id) => {
    const { savedOntologies } = get();
    const record = savedOntologies.find((entry) => entry.id === id);
    if (!record) return false;

    set({
      ...ontologyStatePatch(
        record.ontology,
        record.bindings,
        null,
        generateQuestsForOntology(record.ontology),
      ),
      activeSavedId: id,
      baselinePayload: serializeOntologyPayload(record.ontology, record.bindings),
    });

    // 记住当前选中项，下次打开页面时恢复
    writeOntologyLibrary({
      version: ONTOLOGY_LIBRARY_VERSION,
      activeId: id,
      entries: savedOntologies,
    });
    return true;
  },

  deleteSavedOntology: (id) => {
    const { savedOntologies, activeSavedId } = get();
    const nextLibrary = removeOntologyRecord(
      { version: ONTOLOGY_LIBRARY_VERSION, activeId: activeSavedId, entries: savedOntologies },
      id,
    );
    const written = writeOntologyLibrary(nextLibrary);
    if (!written.ok) return false;

    set({
      savedOntologies: nextLibrary.entries,
      activeSavedId: nextLibrary.activeId,
      // 删掉当前条目后，画面内容仍在，但已不属于任何存档
      baselinePayload: nextLibrary.activeId === activeSavedId ? get().baselinePayload : null,
    });
    return true;
  },

  hasUnsavedChanges: () => {
    const { activeSavedId, baselinePayload, savedOntologies, currentOntology, dataBindings } = get();
    const payload = serializeOntologyPayload(currentOntology, dataBindings);

    if (activeSavedId && baselinePayload !== null) {
      return payload !== baselinePayload;
    }
    // 当前内容不属于任何存档时，库里存在同样内容才算干净
    return !savedOntologies.some(
      (entry) => serializeOntologyPayload(entry.ontology, entry.bindings) === payload,
    );
  },

  exportOntology: () => {
    const { currentOntology, dataBindings } = get();
    return JSON.stringify({ ontology: currentOntology, bindings: dataBindings }, null, 2);
  },
  
  // UI Actions
  selectEntity: (id) => set({ 
    selectedEntityId: id, 
    selectedRelationshipId: null 
  }),
  
  selectRelationship: (id) => set({ 
    selectedRelationshipId: id, 
    selectedEntityId: null 
  }),
  
  setHighlightedEntities: (ids) => set({ highlightedEntities: ids }),
  setHighlightedRelationships: (ids) => set({ highlightedRelationships: ids }),
  setHighlights: (entityIds, relIds) => set({ highlightedEntities: entityIds, highlightedRelationships: relIds }),
  
  toggleDataBindings: () => set((state) => ({ showDataBindings: !state.showDataBindings })),
  setTheme: (theme) => {
    try {
      localStorage.setItem('theme', theme);
    } catch {
      // Ignore persistence errors; still update in-memory state
    }
    set({ theme, darkMode: isDarkTheme(theme) });
  },
  toggleDarkMode: () => {
    const next: ThemeId = isDarkTheme(get().theme) ? 'light' : 'dark';
    get().setTheme(next);
  },

  toggleSidebar: () => {
    const next = !get().sidebarCollapsed;
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? '1' : '0');
    } catch {
      // 持久化失败不影响本次切换
    }
    set({ sidebarCollapsed: next });
  },
  
  // Quest Actions
  startQuest: (questId) => {
    const { availableQuests } = get();
    const quest = availableQuests.find(q => q.id === questId);
    if (quest) {
      set({ 
        activeQuest: quest, 
        currentStepIndex: 0,
        highlightedEntities: [],
        highlightedRelationships: [],
        selectedEntityId: null,
        selectedRelationshipId: null
      });
    }
  },
  
  advanceQuestStep: () => {
    const { activeQuest, currentStepIndex } = get();
    if (activeQuest && currentStepIndex < activeQuest.steps.length - 1) {
      set({ currentStepIndex: currentStepIndex + 1 });
    } else if (activeQuest) {
      // Last step completed, complete the quest
      get().completeQuest();
    }
  },
  
  completeQuest: () => {
    const { activeQuest, completedQuests, earnedBadges, totalPoints } = get();
    if (activeQuest && !completedQuests.includes(activeQuest.id)) {
      set({
        completedQuests: [...completedQuests, activeQuest.id],
        earnedBadges: [...earnedBadges, { 
          badge: activeQuest.reward.badge, 
          icon: activeQuest.reward.badgeIcon 
        }],
        totalPoints: totalPoints + activeQuest.reward.points,
        activeQuest: null,
        currentStepIndex: 0
      });
    }
  },
  
  abandonQuest: () => set({ 
    activeQuest: null, 
    currentStepIndex: 0,
    highlightedEntities: [],
    highlightedRelationships: []
  }),
  
  // Query Actions
  setQueryInput: (input) => set({ queryInput: input }),
  setQueryResult: (result) => set({ queryResult: result }),
  clearHighlights: () => set({ highlightedEntities: [], highlightedRelationships: [] })
}));
