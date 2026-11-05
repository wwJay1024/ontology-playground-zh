import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useT } from '../i18n';

interface SaveOntologyDialogProps {
  open: boolean;
  initialName: string;
  existingNames: string[];
  errorMessage?: string | null;
  onCancel: () => void;
  onConfirm: (name: string) => void;
}

export function SaveOntologyDialog({
  open,
  initialName,
  existingNames,
  errorMessage,
  onCancel,
  onConfirm,
}: SaveOntologyDialogProps) {
  const t = useT();
  const [name, setName] = useState(initialName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setName(initialName);
  }, [open, initialName]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 30);
    return () => window.clearTimeout(timer);
  }, [open]);

  if (!open) return null;

  const trimmed = name.trim();
  const conflict = trimmed.length > 0 && existingNames.includes(trimmed);
  const canSubmit = trimmed.length > 0;

  const submit = () => {
    if (!canSubmit) return;
    onConfirm(trimmed);
  };

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCancel}
    >
      <motion.div
        className="modal-content save-ontology-dialog"
        initial={{ scale: 0.94, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 22, stiffness: 320 }}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={t('Save ontology')}
      >
        <h2>{t('Save ontology')}</h2>
        <p className="save-ontology-intro">
          {t('The ontology is saved in this browser. Use an existing name to overwrite it.')}
        </p>

        <label className="save-ontology-field">
          <span>{t('Ontology name')}</span>
          <input
            ref={inputRef}
            value={name}
            maxLength={80}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') submit();
              if (event.key === 'Escape') onCancel();
            }}
          />
        </label>

        <div className={`save-ontology-hint ${conflict ? 'warning' : ''}`}>
          {conflict
            ? t('This will overwrite the existing saved ontology with the same name.')
            : t('This will create a new saved ontology.')}
        </div>

        {errorMessage && <div className="save-ontology-error">{errorMessage}</div>}

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            {t('Cancel')}
          </button>
          <button type="button" className="btn btn-primary" disabled={!canSubmit} onClick={submit}>
            {t('Save')}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
