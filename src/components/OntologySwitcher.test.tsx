import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { OntologySwitcher } from './OntologySwitcher';
import { useAppStore } from '../store/appStore';
import type { SavedOntologyRecord } from '../lib/ontologyStorage';
import type { Ontology } from '../data/ontology';

function makeRecord(id: string, name: string, savedAt: number): SavedOntologyRecord {
  const ontology: Ontology = {
    name,
    description: '',
    entityTypes: [
      {
        id: 'a',
        name: '实体',
        description: '',
        icon: '📦',
        color: '#0078D4',
        properties: [{ name: 'aId', type: 'string', isIdentifier: true }],
      },
    ],
    relationships: [],
  };
  return { id, name, savedAt, ontology, bindings: [] };
}

const records = [makeRecord('r1', '甲本体', 1_700_000_000_000), makeRecord('r2', '乙本体', 1_700_000_100_000)];

beforeEach(() => {
  window.localStorage.clear();
  useAppStore.setState({
    savedOntologies: records,
    activeSavedId: 'r1',
    baselinePayload: null,
    storageAvailable: true,
  });
});

describe('OntologySwitcher', () => {
  it('触发器显示当前本体名，点击后列出已保存本体', async () => {
    render(<OntologySwitcher onSelect={vi.fn()} onSaveClick={vi.fn()} onDelete={vi.fn()} />);

    const trigger = screen.getByRole('button', { expanded: false });
    expect(within(trigger).getByText('甲本体')).toBeTruthy();

    fireEvent.click(trigger);

    const menu = await screen.findByRole('menu');
    expect(within(menu).getByText('已保存的本体')).toBeTruthy();
    expect(within(menu).getByText('甲本体')).toBeTruthy();
    expect(within(menu).getByText('乙本体')).toBeTruthy();
  });

  it('当前条目带 aria-checked', async () => {
    render(<OntologySwitcher onSelect={vi.fn()} onSaveClick={vi.fn()} onDelete={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { expanded: false }));

    const options = await screen.findAllByRole('menuitemradio');
    expect(options[0].getAttribute('aria-checked')).toBe('true');
    expect(options[1].getAttribute('aria-checked')).toBe('false');
  });

  it('点击条目触发 onSelect 并收起面板', async () => {
    const onSelect = vi.fn();
    render(<OntologySwitcher onSelect={onSelect} onSaveClick={vi.fn()} onDelete={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { expanded: false }));

    const menu = await screen.findByRole('menu');
    fireEvent.click(within(menu).getByText('乙本体'));

    expect(onSelect).toHaveBeenCalledWith('r2');
    await waitFor(() => {
      expect(screen.queryByText('已保存的本体')).toBeNull();
    });
  });

  it('点击删除不会触发选择', async () => {
    const onSelect = vi.fn();
    const onDelete = vi.fn();
    render(<OntologySwitcher onSelect={onSelect} onSaveClick={vi.fn()} onDelete={onDelete} />);
    fireEvent.click(screen.getByRole('button', { expanded: false }));

    fireEvent.click(await screen.findByRole('button', { name: '删除「甲本体」' }));

    expect(onDelete).toHaveBeenCalledWith(records[0]);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('Escape 收起面板', async () => {
    render(<OntologySwitcher onSelect={vi.fn()} onSaveClick={vi.fn()} onDelete={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { expanded: false }));
    await screen.findByRole('menu');

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByText('已保存的本体')).toBeNull();
    });
  });

  it('库为空时显示空态', async () => {
    useAppStore.setState({ savedOntologies: [], activeSavedId: null });
    render(<OntologySwitcher onSelect={vi.fn()} onSaveClick={vi.fn()} onDelete={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { expanded: false }));

    expect(await screen.findByText('还没有保存过本体')).toBeTruthy();
  });

  it('inline 形态不渲染触发器', () => {
    render(
      <OntologySwitcher variant="inline" onSelect={vi.fn()} onSaveClick={vi.fn()} onDelete={vi.fn()} />,
    );

    expect(screen.queryByRole('button', { expanded: false })).toBeNull();
    expect(screen.getByText('甲本体')).toBeTruthy();
    expect(screen.getByText('保存当前本体')).toBeTruthy();
  });

  it('存储不可用时给出提示', () => {
    useAppStore.setState({ storageAvailable: false });
    render(
      <OntologySwitcher variant="inline" onSelect={vi.fn()} onSaveClick={vi.fn()} onDelete={vi.fn()} />,
    );

    expect(screen.getByText(/浏览器存储不可用/)).toBeTruthy();
  });
});
