import { motion } from 'framer-motion';
import { X, MousePointer, Target, MessageSquare, Link2, Lightbulb, Command } from 'lucide-react';
import { useT } from '../i18n';

interface HelpModalProps {
  onClose: () => void;
}

export function HelpModal({ onClose }: HelpModalProps) {
  const t = useT();
  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-content"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 700 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 24, fontWeight: 600 }}>{t('How to Use Ontology Playground (Preview)')}</h2>
          <button className="icon-btn" onClick={onClose} aria-label={t('Close')}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="feature-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <MousePointer size={20} color="var(--ms-blue)" />
              <span className="feature-title" style={{ marginBottom: 0 }}>{t('Explore the Graph')}</span>
            </div>
            <p className="feature-text">
              {t('Click on any entity type (colored node) to see its properties, relationships, and data bindings. Click on relationship lines to see how entities connect. Use the controls in the bottom-left to zoom and reset the layout.')}
              <br /><br />
              {t('Very large ontologies open as a bounded semantic overview instead of drawing every entity at once. Use its search and detail controls to navigate the hierarchy. A dashed node labeled +N has hidden neighbors; select it and choose the Show neighbors action beside the node to expand it without moving the entities already on screen. Use Hide shown neighbors in the Semantic overview to collapse that node-specific expansion again. If the view limit is full, the overview explains how many neighbors remain hidden and asks you to hide a shown neighborhood before expanding another. Changing the detail level starts an unfocused hierarchy projection, clears the current selection, and collapses node-specific expansions. Click either side of the detail slider thumb to change hops, drag the thumb, or use the arrow keys. Selecting an entity labels every visible relationship connected to it; hovering over or selecting a connection also shows that relationship\u2019s name. Search & Filter can still jump to any entity in the complete ontology.')}
            </p>
          </div>

          <div className="feature-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <Target size={20} color="var(--ms-purple)" />
              <span className="feature-title" style={{ marginBottom: 0 }}>{t('Complete Quests')}</span>
            </div>
            <p className="feature-text">
              {t('Select a quest from the left panel to start a guided journey. Follow the instructions to click on specific entities or relationships. Complete all steps to earn badges and points!')}
            </p>
          </div>

          <div className="feature-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <MessageSquare size={20} color="var(--ms-yellow-fg)" />
              <span className="feature-title" style={{ marginBottom: 0 }}>{t('Ask Natural Language Questions')}</span>
            </div>
            <p className="feature-text">
              {t('Use the query playground in the bottom-right to ask questions like "Show me Gold tier customers" or "Which products come from Ethiopia?". The graph will highlight relevant entities and relationships.')}
            </p>
          </div>

          <div className="feature-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <Link2 size={20} color="var(--ms-green)" />
              <span className="feature-title" style={{ marginBottom: 0 }}>{t('View Data Bindings')}</span>
            </div>
            <p className="feature-text">
              {t('When you select an entity type, the inspector shows how ontology properties map to real data sources in a data lakehouse, including lakehouse tables and semantic models.')}
            </p>
          </div>

          <div style={{ 
            padding: 16, 
            background: 'rgba(0, 120, 212, 0.1)', 
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12
          }}>
            <Lightbulb size={20} color="var(--ms-blue)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong style={{ color: 'var(--ms-blue)' }}>{t('About Microsoft Fabric IQ Ontology')}</strong>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.5 }}>
                {t('An ontology is a shared, machine-understandable vocabulary of your business. It defines entity types (like Customer, Product), their properties, and relationships. This demo uses a fictional "Fourth Coffee" to illustrate these concepts.')}
              </p>
            </div>
          </div>

          <div className="feature-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <Command size={20} color="var(--ms-blue)" />
              <span className="feature-title" style={{ marginBottom: 0 }}>{t('Keyboard Shortcuts')}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>
              <kbd className="help-kbd">⌘K</kbd><span>{t('Open command palette')}</span>
              <kbd className="help-kbd">?</kbd><span>{t('Open this help dialog')}</span>
              <kbd className="help-kbd">Esc</kbd><span>{t('Close any dialog')}</span>
              <kbd className="help-kbd">↑ ↓</kbd><span>{t('Navigate palette results')}</span>
              <kbd className="help-kbd">↵</kbd><span>{t('Select palette command')}</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <button className="btn btn-primary" onClick={onClose}>
            {t('Got it!')}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
