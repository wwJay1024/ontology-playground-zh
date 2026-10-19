import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useT } from '../i18n';
import { useDesignerStore } from '../store/designerStore';
import { useAppStore, themeClass } from '../store/appStore';
import { navigate } from '../lib/router';
import { loadCatalogueEntry } from '../lib/catalogue';
import { EntityForm, RelationshipForm, DesignerPreview, DesignerToolbar, DesignerValidation, TemplatePicker } from './designer';
import type { Route } from '../lib/router';
import type { CatalogueEntry } from '../types/catalogue';
import {
  isLargeOntologyGraph,
  ontologyGraphElementCount,
} from '../lib/ontologyScale';
import { SourceFidelityNote } from './SourceFidelityNote';

interface OntologyDesignerProps {
  route: Route & { page: 'designer' };
}

export function OntologyDesigner({ route }: OntologyDesignerProps) {
  const t = useT();
  const { ontology, setOntologyName, setOntologyDescription, loadDraft, undo, redo } = useDesignerStore();
  const theme = useAppStore((s) => s.theme);
  const currentCatalogueEntry = useAppStore(
    (s) => s.currentCatalogueEntry,
  );
  const isEmpty = ontology.entityTypes.length === 0 && ontology.relationships.length === 0;
  const [loadError, setLoadError] = useState<string | null>(null);
  const [routeCatalogueEntry, setRouteCatalogueEntry] =
    useState<CatalogueEntry | null>(null);
  const [designerContextCleared, setDesignerContextCleared] =
    useState(false);
  const editingCatalogueEntry = route.ontologyId
    ? routeCatalogueEntry
    : designerContextCleared
      ? null
      : currentCatalogueEntry;
  const clearDesignerCatalogueContext = () => {
    setRouteCatalogueEntry(null);
    setDesignerContextCleared(true);
  };

  // Keyboard shortcuts: Cmd/Ctrl+Z → undo, Cmd/Ctrl+Shift+Z → redo
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod || e.key !== 'z') return;
      e.preventDefault();
      if (e.shiftKey) {
        redo();
      } else {
        undo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  // Load existing ontology into the designer when editing via /#/designer/<id>
  useEffect(() => {
    if (!route.ontologyId) {
      setRouteCatalogueEntry(null);
      setDesignerContextCleared(false);
      return;
    }
    const id = route.ontologyId;
    let cancelled = false;
    setRouteCatalogueEntry(null);
    setLoadError(null);

    loadCatalogueEntry(id)
      .then((entry) => {
        if (cancelled) return;
        if (isLargeOntologyGraph(entry.ontology)) {
          setLoadError(
            `${entry.name} contains ${ontologyGraphElementCount(entry.ontology).toLocaleString()} graph elements, ` +
            'which is too large for safe all-at-once editing. Open it in the catalogue viewer instead.'
          );
          return;
        }
        setRouteCatalogueEntry(entry);
        loadDraft(entry.ontology);
      })
      .catch((error) => {
        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : 'Failed to load catalogue ontology.',
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [route.ontologyId, loadDraft]);

  return (
    <div className={`designer-page ${themeClass(theme)}`}>
      {/* Top bar */}
      <div className="designer-topbar">
        <button className="designer-back-btn" onClick={() => navigate({ page: 'home' })}>
          <ArrowLeft size={16} /> {t('Back')}
        </button>
        <div className="designer-meta-fields">
          <input
            className="designer-meta-name"
            type="text"
            value={ontology.name}
            onChange={(e) => setOntologyName(e.target.value)}
            placeholder={t('Ontology name')}
          />
          <input
            className="designer-meta-desc"
            type="text"
            value={ontology.description}
            onChange={(e) => setOntologyDescription(e.target.value)}
            placeholder={t('Description')}
          />
        </div>
        <DesignerToolbar
          catalogueEntry={editingCatalogueEntry}
          onNewOntology={clearDesignerCatalogueContext}
        />
      </div>
      {loadError && <div role="alert" className="designer-import-error">{loadError}</div>}
      {editingCatalogueEntry?.source === 'external' && (
        <SourceFidelityNote className="designer-source-fidelity-note">
          <strong>About this draft:</strong> You are editing the visual subset
          of {editingCatalogueEntry.name}. Its generated RDF reflects this
          subset; source-only RDF remains intact in the reviewed source.
        </SourceFidelityNote>
      )}

      {/* Split pane */}
      <div className="designer-split">
        {/* Left: editor forms */}
        <div className="designer-sidebar">
          {isEmpty && (
            <TemplatePicker
              onTemplateSelected={clearDesignerCatalogueContext}
            />
          )}
          <DesignerValidation />
          <EntityForm />
          <RelationshipForm />
        </div>

        {/* Right: live preview */}
        <DesignerPreview
          onOntologyReplaced={clearDesignerCatalogueContext}
        />
      </div>
    </div>
  );
}
