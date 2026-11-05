import { useEffect, useRef, useState } from 'react';
import { BookMarked, Check, ChevronDown, Plus, Trash2 } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import type { SavedOntologyRecord } from '../lib/ontologyStorage';
import { useT } from '../i18n';

interface OntologySwitcherProps {
  variant?: 'popover' | 'inline';
  onSelect: (id: string) => void;
  onSaveClick: () => void;
  onDelete: (record: SavedOntologyRecord) => void;
}

export function OntologySwitcher({
  variant = 'popover',
  onSelect,
  onSaveClick,
  onDelete,
}: OntologySwitcherProps) {
  const t = useT();
  const { currentOntology, savedOntologies, activeSavedId, storageAvailable, hasUnsavedChanges } = useAppStore();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const dirty = hasUnsavedChanges();
  const activeRecord = savedOntologies.find((record) => record.id === activeSavedId);
  const displayName = activeRecord?.name ?? currentOntology.name;

  useEffect(() => {
    if (variant !== 'popover' || !open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, variant]);

  const renderList = () => (
    <>
      {savedOntologies.length === 0 ? (
        <div className="ontology-switcher-empty">{t('No saved ontologies yet')}</div>
      ) : (
        savedOntologies.map((record) => {
          const isActive = record.id === activeSavedId;
          return (
            <div key={record.id} className={`ontology-switcher-item ${isActive ? 'active' : ''}`}>
              <button
                type="button"
                role="menuitemradio"
                aria-checked={isActive}
                className="ontology-switcher-item-main"
                onClick={() => {
                  setOpen(false);
                  onSelect(record.id);
                }}
              >
                <span className="ontology-switcher-item-name" title={record.name}>{record.name}</span>
                <span className="ontology-switcher-item-meta">
                  {t('{entities} entities · {relationships} relationships', {
                    entities: record.ontology.entityTypes.length,
                    relationships: record.ontology.relationships.length,
                  })}
                  {' · '}
                  {new Date(record.savedAt).toLocaleDateString()}
                </span>
                {isActive && <Check size={14} className="ontology-switcher-check" />}
              </button>
              <button
                type="button"
                className="ontology-switcher-delete"
                aria-label={t('Delete {name}', { name: record.name })}
                title={t('Delete')}
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(record);
                }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          );
        })
      )}

      <div className="ontology-switcher-footer">
        <button
          type="button"
          className="ontology-switcher-save"
          onClick={() => {
            setOpen(false);
            onSaveClick();
          }}
        >
          <Plus size={14} /> {t('Save current ontology')}
        </button>
        {!storageAvailable && (
          <div className="ontology-switcher-warning">
            {t('Browser storage is unavailable. Saved ontologies will be lost on refresh.')}
          </div>
        )}
      </div>
    </>
  );

  if (variant === 'inline') {
    return <div className="ontology-switcher-inline">{renderList()}</div>;
  }

  return (
    <div className="ontology-switcher" ref={rootRef}>
      <button
        type="button"
        className="header-text-btn ontology-switcher-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        title={displayName}
        onClick={() => setOpen((value) => !value)}
      >
        <BookMarked size={16} />
        <span className="ontology-switcher-name">{displayName}</span>
        {dirty && (
          <span
            className="ontology-switcher-dirty-dot"
            aria-label={t('Unsaved changes')}
            title={t('Unsaved changes')}
          />
        )}
        <ChevronDown size={14} />
      </button>

      {open && (
        <div className="ontology-switcher-menu" role="menu">
          <div className="ontology-switcher-menu-title">{t('Saved ontologies')}</div>
          {renderList()}
        </div>
      )}
    </div>
  );
}
