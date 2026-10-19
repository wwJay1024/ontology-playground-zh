import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NLBuilderModal } from './NLBuilderModal';
import { useAppStore } from '../store/appStore';
import type { Ontology } from '../data/ontology';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
      const htmlProps = Object.fromEntries(
        Object.entries(props).filter(([key]) =>
          !['initial', 'animate', 'exit', 'transition'].includes(key)
        )
      );
      return <div {...htmlProps}>{children}</div>;
    },
  },
}));

const fetchMock = vi.fn();

function createOntology(hasIdentifier = true): Ontology {
  return {
    name: 'Generated Inventory',
    description: 'Generated inventory ontology',
    entityTypes: [
      {
        id: 'product',
        name: 'Product',
        description: 'An inventory product',
        icon: 'P',
        color: '',
        properties: [
          {
            name: 'productId',
            type: 'string',
            isIdentifier: hasIdentifier,
          },
        ],
      },
    ],
    relationships: [],
  };
}

function createMalformedOntology(): Record<string, unknown> {
  const ontology = createOntology();
  return {
    ...ontology,
    entityTypes: [{
      ...ontology.entityTypes[0],
      id: 1,
      properties: [{
        name: 'productId',
        type: 'string',
        isIdentifier: 'false',
      }],
    }],
  };
}

function mockGeneratedOntology(ontology: unknown): void {
  fetchMock.mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ ontology }),
  } as Response);
}

describe('NLBuilderModal validation', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    onClose.mockClear();
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    useAppStore.getState().resetToDefault();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('rejects invalid generated ontologies before previewing them', async () => {
    mockGeneratedOntology(createOntology(false));
    const user = userEvent.setup();

    render(<NLBuilderModal onClose={onClose} />);
    await user.type(
      screen.getByPlaceholderText('Describe your business scenario...'),
      'Track products in inventory',
    );
    await user.click(screen.getByRole('button', { name: 'Generate Ontology' }));

    expect(await screen.findByText('Generation Failed')).toBeInTheDocument();
    expect(screen.getByText(/has no identifier property/)).toBeInTheDocument();
    expect(useAppStore.getState().currentOntology.name).toBe('Fourth Coffee');
    expect(onClose).not.toHaveBeenCalled();
  });

  it('rejects malformed generated ontology field types', async () => {
    mockGeneratedOntology(createMalformedOntology());
    const user = userEvent.setup();

    render(<NLBuilderModal onClose={onClose} />);
    await user.type(
      screen.getByPlaceholderText('Describe your business scenario...'),
      'Track products in inventory',
    );
    await user.click(screen.getByRole('button', { name: 'Generate Ontology' }));

    expect(await screen.findByText('Generation Failed')).toBeInTheDocument();
    expect(screen.getByText(/entityTypes\[0\]\.id must be a string/)).toBeInTheDocument();
    expect(screen.getByText(/isIdentifier must be a boolean/)).toBeInTheDocument();
    expect(useAppStore.getState().currentOntology.name).toBe('Fourth Coffee');
    expect(onClose).not.toHaveBeenCalled();
  });

  it('rejects invalid JSON edits before applying them', async () => {
    mockGeneratedOntology(createOntology());
    const user = userEvent.setup();

    render(<NLBuilderModal onClose={onClose} />);
    await user.type(
      screen.getByPlaceholderText('Describe your business scenario...'),
      'Track products in inventory',
    );
    await user.click(screen.getByRole('button', { name: 'Generate Ontology' }));
    expect(await screen.findByText('Generated Inventory')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Edit JSON' }));
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: JSON.stringify(createOntology(false)) },
    });
    await user.click(screen.getByRole('button', { name: 'Apply Ontology' }));

    expect(screen.getByText(/has no identifier property/)).toBeInTheDocument();
    expect(useAppStore.getState().currentOntology.name).toBe('Fourth Coffee');
    expect(onClose).not.toHaveBeenCalled();
  });

  it('rejects malformed JSON field types before applying them', async () => {
    mockGeneratedOntology(createOntology());
    const user = userEvent.setup();

    render(<NLBuilderModal onClose={onClose} />);
    await user.type(
      screen.getByPlaceholderText('Describe your business scenario...'),
      'Track products in inventory',
    );
    await user.click(screen.getByRole('button', { name: 'Generate Ontology' }));
    expect(await screen.findByText('Generated Inventory')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Edit JSON' }));
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: JSON.stringify(createMalformedOntology()) },
    });
    await user.click(screen.getByRole('button', { name: 'Apply Ontology' }));

    expect(screen.getByText(/entityTypes\[0\]\.id must be a string/)).toBeInTheDocument();
    expect(screen.getByText(/isIdentifier must be a boolean/)).toBeInTheDocument();
    expect(useAppStore.getState().currentOntology.name).toBe('Fourth Coffee');
    expect(onClose).not.toHaveBeenCalled();
  });

  it('continues to apply valid generated ontologies', async () => {
    mockGeneratedOntology(createOntology());
    const user = userEvent.setup();

    render(<NLBuilderModal onClose={onClose} />);
    await user.type(
      screen.getByPlaceholderText('Describe your business scenario...'),
      'Track products in inventory',
    );
    await user.click(screen.getByRole('button', { name: 'Generate Ontology' }));
    expect(await screen.findByText('Generated Inventory')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Apply Ontology' }));

    expect(useAppStore.getState().currentOntology.name).toBe('Generated Inventory');
    expect(useAppStore.getState().currentOntology.entityTypes[0].color).toBe('#0078D4');
    expect(onClose).toHaveBeenCalledOnce();
  });
});
