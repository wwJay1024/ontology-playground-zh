import { designerTemplates } from '../../data/designerTemplates';
import { useDesignerStore } from '../../store/designerStore';
import { useT } from '../../i18n';

interface TemplatePickerProps {
  onTemplateSelected?: () => void;
}

export function TemplatePicker({
  onTemplateSelected,
}: TemplatePickerProps = {}) {
  const t = useT();
  const loadDraft = useDesignerStore((s) => s.loadDraft);

  return (
    <div className="template-picker">
      <div className="template-picker-header">
        <h3>{t('Start from a template')}</h3>
        <p>{t('Pick a domain to get started quickly, or add entities manually.')}</p>
      </div>
      <div className="template-picker-grid">
        {designerTemplates.map((template) => (
          <button
            key={template.id}
            className="template-card"
            onClick={() => {
              loadDraft(template.ontology);
              onTemplateSelected?.();
            }}
          >
            <span className="template-card-icon">{template.icon}</span>
            <span className="template-card-label">{template.label}</span>
            <span className="template-card-desc">{template.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
