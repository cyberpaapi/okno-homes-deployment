import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ContentItem } from '@/lib/contentCollections';
import ConfiguratorPrices from './ConfiguratorPrices';

function Editor() {
  const [items, setItems] = useState<ContentItem[]>([{ id: 'forza', fields: { 'materials.external-wall': '["golden-oak"]', 'external-wall.golden-oak': '12000' } }]);
  return <><ConfiguratorPrices roster={[]} plans={[]} items={items} onChange={setItems} disabled={false} /><output aria-label="Saved schedule">{JSON.stringify(items)}</output></>;
}
describe('house materials and prices editor', () => {
  it('adds and removes compatible materials, preserves rates and keeps house schedules separate', () => {
    render(<Editor />);
    expect(screen.getByLabelText('Golden Oak (INR)')).toHaveValue(12000);
    fireEvent.click(screen.getByRole('button', { name: 'Remove Golden Oak from external wall' }));
    expect(screen.queryByLabelText('Golden Oak (INR)')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Saved schedule')).toHaveTextContent('"materials.external-wall":"[]"');
    fireEvent.change(screen.getByRole('combobox', { name: 'Add material', exact: true }), { target: { value: 'golden-oak' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add material to component' }));
    expect(screen.getByLabelText('Golden Oak (INR)')).toHaveValue(12000);
    fireEvent.change(screen.getByLabelText('Golden Oak (INR)'), { target: { value: '13500' } });
    fireEvent.change(screen.getByRole('combobox', { name: 'House', exact: true }), { target: { value: 'tengo' } });
    expect(screen.getByLabelText('Golden Oak (INR)')).toHaveValue(null);
    fireEvent.change(screen.getByRole('combobox', { name: 'House', exact: true }), { target: { value: 'forza' } });
    expect(screen.getByLabelText('Golden Oak (INR)')).toHaveValue(13500);
    fireEvent.change(screen.getByRole('combobox', { name: 'Component', exact: true }), { target: { value: 'flooring' } });
    expect(screen.queryByLabelText('Golden Oak (INR)')).not.toBeInTheDocument();
  });
});
