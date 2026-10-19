import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { OntologySummaryModal } from './OntologySummaryModal';
import { useAppStore } from '../store/appStore';
import type { Ontology } from '../data/ontology';

afterEach(() => {
  cleanup();
  useAppStore.getState().resetToDefault();
});

describe('OntologySummaryModal', () => {
  it('bounds large ontology previews while retaining the full counts', () => {
    const ontology: Ontology = {
      name: 'Large ontology',
      description: 'Scale guardrail fixture',
      entityTypes: Array.from({ length: 150 }, (_, index) => ({
        id: `entity-${index}`,
        name: `Entity ${index}`,
        description: '',
        icon: '📦',
        color: '#0078D4',
        properties: [],
      })),
      relationships: Array.from({ length: 150 }, (_, index) => ({
        id: `relationship-${index}`,
        name: `Relationship ${index}`,
        from: `entity-${index}`,
        to: `entity-${(index + 1) % 150}`,
        cardinality: 'one-to-many' as const,
      })),
    };
    useAppStore.getState().loadOntology(ontology);

    const { container } = render(<OntologySummaryModal onClose={() => undefined} />);

    expect(screen.getByText('Entities (150)')).toBeInTheDocument();
    expect(screen.getByText('Relationships (150)')).toBeInTheDocument();
    expect(screen.getByText('50 additional entity types are omitted from this preview.'))
      .toBeInTheDocument();
    expect(screen.getByText('50 additional relationships are omitted from this preview.'))
      .toBeInTheDocument();
    expect(container.querySelectorAll('.summary-entity-card')).toHaveLength(101);
    expect(container.querySelectorAll('.summary-relationship-card')).toHaveLength(101);
  });
});
