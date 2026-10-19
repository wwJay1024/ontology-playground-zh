import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Ontology } from '../data/ontology';
import { useDesignerStore } from '../store/designerStore';
import { useAppStore } from '../store/appStore';
import type { CatalogueEntry } from '../types/catalogue';
import { OntologyDesigner } from './OntologyDesigner';

vi.mock('../lib/catalogue', () => ({
  loadCatalogueEntry: vi.fn(),
}));

vi.mock('../lib/router', () => ({
  navigate: vi.fn(),
}));

vi.mock('./designer', () => ({
  DesignerToolbar: ({
    catalogueEntry,
    onNewOntology,
  }: {
    catalogueEntry?: CatalogueEntry | null;
    onNewOntology?: () => void;
  }) => (
    <>
      <span>{catalogueEntry?.name ?? 'No catalogue context'}</span>
      <button onClick={onNewOntology}>New draft</button>
    </>
  ),
  DesignerPreview: ({
    onOntologyReplaced,
  }: {
    onOntologyReplaced?: () => void;
  }) => (
    <button onClick={onOntologyReplaced}>Replace draft</button>
  ),
  DesignerValidation: () => null,
  EntityForm: () => null,
  RelationshipForm: () => null,
  TemplatePicker: () => null,
}));

const ontology: Ontology = {
  name: 'External Equipment',
  description: 'External ontology fixture',
  entityTypes: [{
    id: 'equipment',
    name: 'Equipment',
    description: 'A piece of equipment',
    icon: 'E',
    color: '#0078D4',
    properties: [],
  }],
  relationships: [],
};

const externalEntry: CatalogueEntry = {
  id: 'external/equipment/model',
  name: 'External Equipment',
  description: 'External ontology fixture',
  category: 'general',
  tags: [],
  author: 'Test',
  source: 'external',
  entityCount: 1,
  relationshipCount: 0,
  payloadUrl:
    `catalogue-payloads/external/equipment/model/${'a'.repeat(64)}.json`,
  payloadHash: `sha256:${'a'.repeat(64)}`,
  sourceArtifactUrl:
    `catalogue-sources/external/equipment/model/${'b'.repeat(64)}.rdf`,
  sourceArtifactHash: `sha256:${'b'.repeat(64)}`,
  sourceArtifactByteLength: 42,
  sourceArtifactMediaType: 'application/rdf+xml',
};

describe('OntologyDesigner catalogue provenance', () => {
  beforeEach(() => {
    useAppStore.getState().resetToDefault();
    useAppStore.getState().loadOntology(ontology, [], externalEntry);
    useDesignerStore.getState().loadDraft(ontology);
  });

  it('clears only Designer provenance when its draft is replaced', async () => {
    const user = userEvent.setup();
    render(<OntologyDesigner route={{ page: 'designer' }} />);

    const note = screen.getByRole('note');
    expect(note.classList.contains('source-fidelity-note')).toBe(true);
    expect(note.querySelector('.lucide-info')).toBeTruthy();
    expect(note.textContent).toContain(
      'You are editing the visual subset',
    );
    expect(note.textContent).toContain(
      'source-only RDF remains intact in the reviewed source',
    );
    expect(screen.getByText('External Equipment')).toBeTruthy();

    await user.click(screen.getByText('Replace draft'));

    expect(screen.queryByRole('note')).toBeNull();
    expect(screen.getByText('No catalogue context')).toBeTruthy();
    expect(useAppStore.getState().currentCatalogueEntry).toBe(
      externalEntry,
    );
  });
});
