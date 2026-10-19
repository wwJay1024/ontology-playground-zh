import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Ontology } from '../../data/ontology';
import { useAppStore } from '../../store/appStore';
import { useDesignerStore } from '../../store/designerStore';
import type { CatalogueEntry } from '../../types/catalogue';
import { DesignerToolbar } from './DesignerActions';

vi.mock('../../lib/router', () => ({
  navigate: vi.fn(),
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
    properties: [{
      name: 'equipmentId',
      type: 'string',
      isIdentifier: true,
    }],
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

describe('DesignerToolbar', () => {
  beforeEach(() => {
    useAppStore.getState().resetToDefault();
    useDesignerStore.getState().loadDraft(ontology);
  });

  it('lets authors select either RDF export profile', async () => {
    render(<DesignerToolbar />);

    const profile = screen.getByLabelText('RDF export profile');
    expect(profile).toHaveValue('playground');

    await userEvent.selectOptions(profile, 'standards');

    expect(profile).toHaveValue('standards');
  });

  it('retains external lineage when loading a draft in Playground', async () => {
    render(<DesignerToolbar catalogueEntry={externalEntry} />);

    await userEvent.click(screen.getByTitle('Load in Playground'));

    expect(useAppStore.getState().currentOntology).toBe(ontology);
    expect(useAppStore.getState().currentCatalogueEntry).toBe(
      externalEntry,
    );
  });
});
