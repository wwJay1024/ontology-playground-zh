import { useState, useEffect } from 'react';
import { Download, AlertTriangle, CheckCircle, Upload, Github, FilePlus, Undo2, Redo2 } from 'lucide-react';
import { useDesignerStore } from '../../store/designerStore';
import type { ValidationError } from '../../store/designerStore';
import { useAppStore } from '../../store/appStore';
import {
  serializeToRDF,
  type RdfExportProfile,
} from '../../lib/rdf/serializer';
import { navigate } from '../../lib/router';
import { SubmitCatalogueModal } from './SubmitCatalogueModal';
import type { CatalogueEntry } from '../../types/catalogue';
import { useT } from '../../i18n';

interface DesignerToolbarProps {
  catalogueEntry?: CatalogueEntry | null;
  onNewOntology?: () => void;
}

/**
 * Toolbar buttons — rendered in the designer topbar.
 */
export function DesignerToolbar({
  catalogueEntry,
  onNewOntology,
}: DesignerToolbarProps = {}) {
  const t = useT();
  const { ontology, validate, resetDraft, undo, redo, _past, _future } = useDesignerStore();
  const loadOntology = useAppStore((s) => s.loadOntology);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [rdfExportProfile, setRdfExportProfile] = useState<RdfExportProfile>('playground');
  const canUndo = _past.length > 0;
  const canRedo = _future.length > 0;

  const handleValidate = () => {
    validate();
  };

  const handleExportRDF = () => {
    const errors = validate();
    // Allow download even with validation errors (user sees warnings in sidebar)
    try {
      const rdf = serializeToRDF(ontology, [], { profile: rdfExportProfile });
      const blob = new Blob([rdf], { type: 'application/rdf+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const draftSuffix = errors.length > 0 ? '-draft' : '';
      const profileSuffix = rdfExportProfile === 'standards' ? '-owl-shacl' : '';
      a.download = `${ontology.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'ontology'}${draftSuffix}${profileSuffix}.rdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // serialization failed — validation errors are shown in sidebar
    }
  };

  const handleLoadInPlayground = () => {
    const errors = validate();
    if (errors.length > 0) return;
    loadOntology(ontology, [], catalogueEntry ?? null);
    navigate({ page: 'home' });
  };

  const handleNewOntology = () => {
    resetDraft();
    onNewOntology?.();
  };

  const handleSubmitToCatalogue = () => {
    const errors = validate();
    if (errors.length > 0) return;
    setShowSubmitModal(true);
  };

  return (
    <>
      <div className="designer-toolbar">
        <button className="designer-toolbar-btn" onClick={undo} disabled={!canUndo} title={t('Undo (Ctrl+Z)')}>
          <Undo2 size={14} />
        </button>
        <button className="designer-toolbar-btn" onClick={redo} disabled={!canRedo} title={t('Redo (Ctrl+Shift+Z)')}>
          <Redo2 size={14} />
        </button>
        <div className="designer-toolbar-sep" />
        <button className="designer-toolbar-btn" onClick={handleNewOntology} title={t('New ontology')}>
          <FilePlus size={14} /> {t('New')}
        </button>
        <button className="designer-toolbar-btn" onClick={handleValidate} title={t('Validate ontology')}>
          <CheckCircle size={14} /> {t('Validate')}
        </button>
        <div className="designer-toolbar-sep" />
        <select
          aria-label={t('RDF export profile')}
          className="designer-toolbar-select"
          title={t('RDF export profile')}
          value={rdfExportProfile}
          onChange={(event) => {
            const profile = event.target.value;
            if (profile === 'playground' || profile === 'standards') {
              setRdfExportProfile(profile);
            }
          }}
        >
          <option value="playground">{t('Playground round-trip')}</option>
          <option value="standards">{t('Standards-oriented OWL + SHACL')}</option>
        </select>
        <button
          className="designer-toolbar-btn"
          onClick={handleExportRDF}
          title={catalogueEntry?.source === 'external'
            ? t('Export generated RDF subset')
            : t('Export RDF')}
        >
          <Download size={14} />
          {catalogueEntry?.source === 'external'
            ? t('Export RDF subset')
            : t('Export RDF')}
        </button>
        <button className="designer-toolbar-btn" onClick={handleLoadInPlayground} title={t('Load in Playground')}>
          <Upload size={14} /> {t('Load in Playground')}
        </button>
        <button className="designer-toolbar-btn submit" onClick={handleSubmitToCatalogue} title={t('Submit to community catalogue')}>
          <Github size={14} /> {t('Submit to Catalogue')}
        </button>
      </div>

      {showSubmitModal && (
        <SubmitCatalogueModal onClose={() => setShowSubmitModal(false)} />
      )}
    </>
  );
}

/**
 * Validation feedback — rendered in the sidebar.
 */
export function DesignerValidation() {
  const t = useT();
  const validationErrors = useDesignerStore((s) => s.validationErrors);
  const lastValidatedAt = useDesignerStore((s) => s._lastValidatedAt);
  const [showSuccess, setShowSuccess] = useState(false);

  // Show success banner for 3 seconds when validation runs with 0 errors
  useEffect(() => {
    if (lastValidatedAt > 0 && validationErrors.length === 0) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
    setShowSuccess(false);
  }, [lastValidatedAt, validationErrors.length]);

  if (validationErrors.length === 0) {
    if (!showSuccess) return null;
    return (
      <div className="designer-validation-success">
        <div className="designer-validation-header" style={{ color: 'var(--ms-green, #16c60c)' }}>
          <CheckCircle size={14} /> {t('No issues found')}
        </div>
      </div>
    );
  }

  return (
    <div className="designer-validation-errors">
      <div className="designer-validation-header">
        <AlertTriangle size={14} /> {t('{count} issues to fix', { count: validationErrors.length })}
      </div>
      <ul>
        {validationErrors.map((err, i) => (
          <li key={i}>
            <ErrorItem error={err} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function ErrorItem({ error }: { error: ValidationError }) {
  const selectEntity = useDesignerStore((s) => s.selectEntity);
  const selectRelationship = useDesignerStore((s) => s.selectRelationship);

  const handleClick = () => {
    if (error.entityId) {
      selectEntity(error.entityId);
    } else if (error.relationshipId) {
      selectRelationship(error.relationshipId);
    }
  };

  const isClickable = error.entityId || error.relationshipId;

  return (
    <span
      className={isClickable ? 'designer-error-link' : ''}
      onClick={isClickable ? handleClick : undefined}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => { if (e.key === 'Enter') handleClick(); } : undefined}
    >
      {error.message}
    </span>
  );
}
