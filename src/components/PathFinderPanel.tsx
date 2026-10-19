import { useState, useMemo, useCallback, useEffect } from 'react';
import { GitFork, ChevronDown, ChevronUp, ArrowRight, Search, X } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { findShortestPath } from '../lib/pathFinder';
import type { PathNode } from '../lib/pathFinder';
import { useT } from '../i18n';

interface PathStep {
  entityId: string;
  entityName: string;
  entityIcon: string;
  relationship?: {
    id: string;
    name: string;
    cardinality: string;
  };
}

export function PathFinderPanel() {
  const { currentOntology, setHighlights, clearHighlights } = useAppStore();
  const t = useT();
  const [expanded, setExpanded] = useState(false);
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [searched, setSearched] = useState(false);

  const entities = currentOntology.entityTypes;
  const relationships = currentOntology.relationships;

  const path = useMemo<PathNode[] | null>(() => {
    if (!searched || !fromId || !toId) return null;
    return findShortestPath(fromId, toId, relationships);
  }, [searched, fromId, toId, relationships]);

  // Build display steps from raw BFS path
  const displaySteps = useMemo<PathStep[]>(() => {
    if (!path) return [];
    return path.map((node) => {
      const entity = entities.find(e => e.id === node.entityId);
      return {
        entityId: node.entityId,
        entityName: entity?.name ?? node.entityId,
        entityIcon: entity?.icon ?? '📦',
        relationship: node.via
          ? {
              id: node.via.rel.id,
              name: node.via.rel.name,
              cardinality: node.via.rel.cardinality,
            }
          : undefined,
      };
    });
  }, [path, entities]);

  const handleFind = useCallback(() => {
    setSearched(true);
    if (!fromId || !toId) return;
    // Highlights will be applied via the useMemo path result below
  }, [fromId, toId]);

  // Apply highlights whenever path changes
  useEffect(() => {
    if (!searched || !path) {
      if (searched) clearHighlights();
      return;
    }
    const entityIds = path.map(n => n.entityId);
    const relIds = path.filter(n => n.via).map(n => n.via!.rel.id);
    setHighlights(entityIds, relIds);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, searched]);

  const handleClear = useCallback(() => {
    setFromId('');
    setToId('');
    setSearched(false);
    clearHighlights();
  }, [clearHighlights]);

  const noPath = searched && fromId && toId && !path;
  const sameEntity = fromId && toId && fromId === toId;

  return (
    <div className="pathfinder-panel">
      <button
        className="pathfinder-header"
        onClick={() => setExpanded(prev => !prev)}
        aria-expanded={expanded}
      >
        <span className="pathfinder-title">
          <GitFork size={14} />
          {t('Path Finder')}
        </span>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {expanded && (
        <div className="pathfinder-body">
          <div className="pathfinder-selects">
            <div className="pathfinder-select-group">
              <label className="pathfinder-label">{t('From')}</label>
              <select
                className="pathfinder-select"
                value={fromId}
                onChange={e => { setFromId(e.target.value); setSearched(false); clearHighlights(); }}
              >
                <option value="">{t('Select entity…')}</option>
                {entities.map(e => (
                  <option key={e.id} value={e.id}>{e.icon} {e.name}</option>
                ))}
              </select>
            </div>

            <ArrowRight size={16} className="pathfinder-arrow-icon" />

            <div className="pathfinder-select-group">
              <label className="pathfinder-label">{t('To')}</label>
              <select
                className="pathfinder-select"
                value={toId}
                onChange={e => { setToId(e.target.value); setSearched(false); clearHighlights(); }}
              >
                <option value="">{t('Select entity…')}</option>
                {entities.map(e => (
                  <option key={e.id} value={e.id}>{e.icon} {e.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pathfinder-actions">
            <button
              className="pathfinder-btn-find"
              onClick={handleFind}
              disabled={!fromId || !toId || !!sameEntity}
            >
              <Search size={13} />
              {t('Find Path')}
            </button>
            {searched && (
              <button className="pathfinder-btn-clear" onClick={handleClear}>
                <X size={13} />
                {t('Clear')}
              </button>
            )}
          </div>

          {sameEntity && (
            <div className="pathfinder-message pathfinder-message--warn">
              {t('Select two different entities.')}
            </div>
          )}

          {noPath && (
            <div className="pathfinder-message pathfinder-message--warn">
              {t('No directed path found between these entities.')}
            </div>
          )}

          {displaySteps.length > 0 && (
            <div className="pathfinder-result">
              <div className="pathfinder-result-label">
                {t('Shortest path — {count} hops', { count: displaySteps.length - 1 })}
              </div>
              <div className="pathfinder-chain">
                {displaySteps.map((step, i) => (
                  <div key={step.entityId} className="pathfinder-chain-item">
                    {step.relationship && (
                      <div className="pathfinder-chain-rel">
                        <div className="pathfinder-chain-rel-arrow" />
                        <span className="pathfinder-chain-rel-name">{step.relationship.name}</span>
                      </div>
                    )}
                    <div className={`pathfinder-chain-node ${i === 0 ? 'pathfinder-chain-node--start' : i === displaySteps.length - 1 ? 'pathfinder-chain-node--end' : ''}`}>
                      <span className="pathfinder-chain-icon">{step.entityIcon}</span>
                      <span className="pathfinder-chain-name">{step.entityName}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
