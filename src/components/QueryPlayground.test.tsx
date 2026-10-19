import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Ontology } from '../data/ontology';
import { useAppStore } from '../store/appStore';
import { QueryPlayground } from './QueryPlayground';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
      const htmlProps = Object.fromEntries(
        Object.entries(props).filter(([key]) => !['initial', 'animate', 'exit', 'transition'].includes(key)),
      );
      return <div {...htmlProps}>{children}</div>;
    },
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

const ontologyWithHtmlPayload: Ontology = {
  name: 'Safety Test',
  description: 'Contributor content safety test.',
  entityTypes: [{
    id: 'unsafe',
    name: '<img src=x onerror=alert(1)>',
    description: '<script>alert(1)</script>',
    icon: 'X',
    color: '#000000',
    properties: [],
  }],
  relationships: [],
};

describe('QueryPlayground content safety', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useAppStore.getState().loadOntology(ontologyWithHtmlPayload);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders contributor-controlled query results as text rather than HTML', async () => {
    const { container } = render(<QueryPlayground />);

    fireEvent.change(screen.getByPlaceholderText('Ask about Safety Test...'), {
      target: { value: 'How does this ontology work?' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Run query' }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(600);
    });

    const result = container.querySelector('.query-result');
    expect(result).not.toBeNull();
    expect(result).toHaveTextContent('<img src=x onerror=alert(1)>');
    expect(result?.querySelector('img')).toBeNull();
    expect(result?.querySelector('script')).toBeNull();
  });
});
