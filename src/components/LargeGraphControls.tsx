import { useState, type FormEvent } from 'react';
import type { GraphView } from '../lib/graphView';
import { SemanticDepthSlider } from './SemanticDepthSlider';
import { useT } from '../i18n';

interface LargeGraphControlsProps {
  graphView: GraphView;
  totalNodeCount: number;
  totalEdgeCount: number;
  searchInput: string;
  appliedSearch: string;
  depth: number;
  maxDepth: number;
  canReset: boolean;
  selectedEntity: {
    name: string;
    hiddenNeighborCount: number;
    isExpanded: boolean;
    canExpand: boolean;
  } | null;
  onSearchInputChange: (value: string) => void;
  onSearch: () => void;
  onDepthChange: (depth: number) => void;
  onExpandSelectedEntity: () => void;
  onCollapseSelectedEntity: () => void;
  onShowOverview: () => void;
}

export function LargeGraphControls({
  graphView,
  totalNodeCount,
  totalEdgeCount,
  searchInput,
  appliedSearch,
  depth,
  maxDepth,
  canReset,
  selectedEntity,
  onSearchInputChange,
  onSearch,
  onDepthChange,
  onExpandSelectedEntity,
  onCollapseSelectedEntity,
  onShowOverview,
}: LargeGraphControlsProps) {
  const t = useT();
  const [collapsed, setCollapsed] = useState(false);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSearch();
  };

  return (
    <section
      className={`large-graph-panel${collapsed ? ' large-graph-panel--collapsed' : ''}`}
      aria-label={t('Large ontology controls')}
    >
      <div className="large-graph-header">
        <div>
          <div className="large-graph-title">{t('Semantic overview')}</div>
          <div className="large-graph-tier">{t('Focused hierarchy view')}</div>
        </div>
        <button
          type="button"
          className="large-graph-collapse"
          aria-expanded={!collapsed}
          onClick={() => setCollapsed((value) => !value)}
        >
          {collapsed ? t('Open') : t('Hide')}
        </button>
      </div>

      {!collapsed && (
        <>
          <p className="large-graph-counts" aria-live="polite">
            {t('Showing {visible} of {total} entities and {visibleRels} of {totalRels} relationships.', {
              visible: graphView.visibleNodeCount.toLocaleString(),
              total: totalNodeCount.toLocaleString(),
              visibleRels: graphView.visibleEdgeCount.toLocaleString(),
              totalRels: totalEdgeCount.toLocaleString(),
            })}
          </p>

          <form className="large-graph-search" onSubmit={handleSubmit}>
            <label htmlFor="large-graph-search">{t('Jump to an entity')}</label>
            <div>
              <input
                id="large-graph-search"
                type="search"
                value={searchInput}
                onChange={(event) => onSearchInputChange(event.target.value)}
                placeholder={t('Name, ID, or keyword')}
              />
              <button type="submit">{t('Find')}</button>
            </div>
          </form>

          <div className="large-graph-options">
            <div className="large-graph-detail-header">
              <label htmlFor="large-graph-depth">
                {t('Detail:')} <strong>{t('{count} hops', { count: depth })}</strong>
                <span className="large-graph-depth-max">
                  {' '}· {t('max {count}', { count: maxDepth })}
                </span>
              </label>
              <button
                type="button"
                disabled={!canReset}
                onClick={onShowOverview}
              >
                {t('Reset view')}
              </button>
            </div>
            <SemanticDepthSlider
              id="large-graph-depth"
              max={maxDepth}
              value={depth}
              disabled={maxDepth <= 1}
              onDepthChange={onDepthChange}
              aria-label={t('Detail: {count} hops', { count: depth })}
              aria-valuetext={t('{count} hops', { count: depth })}
            />
          </div>

          <div className="large-graph-selection-action">
            {selectedEntity?.isExpanded ? (
              <button
                type="button"
                aria-label={t('Hide shown neighbors for {name}', { name: selectedEntity.name })}
                onClick={onCollapseSelectedEntity}
              >
                {t('Hide shown neighbors')}
              </button>
            ) : selectedEntity
              && selectedEntity.hiddenNeighborCount > 0
              ? (
                <button
                  type="button"
                  disabled={!selectedEntity.canExpand}
                  aria-label={t('Show {count} hidden neighbors for {name}', {
                    count: selectedEntity.hiddenNeighborCount,
                    name: selectedEntity.name,
                  })}
                  onClick={onExpandSelectedEntity}
                >
                  {t('Show {count} hidden neighbors', { count: selectedEntity.hiddenNeighborCount.toLocaleString() })}
                </button>
              ) : (
                <button type="button" disabled>
                  {!selectedEntity
                    ? t('Select a +N entity to show neighbors')
                    : t('No hidden neighbors for this entity')}
                </button>
              )}
          </div>
          <div className="large-graph-status" aria-live="polite">
            {selectedEntity
              && selectedEntity.hiddenNeighborCount > 0
              && !selectedEntity.canExpand ? (
                <p className="large-graph-warning" role="status">
                  {t('{count} neighbors remain hidden because the {limit}-entity view limit is full. Hide a shown neighborhood to make room.', {
                    count: selectedEntity.hiddenNeighborCount.toLocaleString(),
                    limit: graphView.visibleNodeCount.toLocaleString(),
                  })}
                </p>
              ) : appliedSearch && graphView.searchMatchCount > 0 ? (
                <p className="large-graph-result">
                  {t('{count} matching entities.', { count: graphView.searchMatchCount.toLocaleString() })}
                </p>
              ) : appliedSearch ? (
                <p className="large-graph-warning" role="alert">
                  {t('No matching entity was found. Showing hierarchy roots instead.')}
                </p>
              ) : null}
          </div>
          <p className="large-graph-hint">
            {t('Select a dashed “+N” entity to show its neighbor action beside the node. Hide a shown neighborhood here, or select another “+N” entity to continue. Selecting any entity also labels its visible relationships.')}
          </p>
        </>
      )}
    </section>
  );
}
