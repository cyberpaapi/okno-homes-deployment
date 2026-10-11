import { useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import GlobePinsEditor from './GlobePinsEditor';
import type { ContentItem } from '@/lib/contentCollections';

function Harness({ initial = [], lookup = async () => [] }: {
  initial?: ContentItem[];
  lookup?: (query: string) => Promise<{ id: string; label: string; latitude: number; longitude: number; kind: string }[]>;
}) {
  const [items, setItems] = useState(initial);
  return <><GlobePinsEditor items={items} onChange={setItems} disabled={false} onLookupLocation={lookup} /><output data-testid="pins-json">{JSON.stringify(items)}</output></>;
}

it('keeps existing pins collapsed and creates a location without project media', () => {
  render(<Harness initial={[{ id: 'hyderabad', fields: { label: 'Hyderabad', latitude: '17.385', longitude: '78.487' } }]} />);
  expect(screen.getByText('Hyderabad').closest('details')).not.toHaveAttribute('open');
  fireEvent.click(screen.getByRole('button', { name: 'Add location pin' }));
  const items = JSON.parse(screen.getByTestId('pins-json').textContent || '[]') as ContentItem[];
  expect(items).toHaveLength(2);
  expect(items[1].fields).toEqual({ label: '', latitude: '', longitude: '' });
  expect(items[1].fields).not.toHaveProperty('coverSrc');
});

it('uses place lookup, clears stale coordinates on rename, and supports manual coordinates and removal', async () => {
  const lookup = vi.fn(async () => [{ id: 'pune', label: 'Pune, Maharashtra, India', latitude: 18.5204, longitude: 73.8567, kind: 'city' }]);
  render(<Harness lookup={lookup} />);
  fireEvent.click(screen.getByRole('button', { name: 'Add location pin' }));
  fireEvent.change(screen.getByRole('textbox', { name: /Place label/ }), { target: { value: 'Pune' } });
  fireEvent.click(screen.getByRole('button', { name: 'Find coordinates' }));
  await waitFor(() => expect(screen.getByRole('button', { name: /Pune, Maharashtra, India/ })).toBeInTheDocument());
  fireEvent.click(screen.getByRole('button', { name: /Pune, Maharashtra, India/ }));
  expect(lookup).toHaveBeenCalledWith('Pune');
  expect(screen.getByRole('textbox', { name: /Place label/ })).toHaveValue('Pune');
  expect(screen.getByTestId('pins-json')).toHaveTextContent('"latitude":"18.5204"');
  fireEvent.change(screen.getByRole('textbox', { name: /Place label/ }), { target: { value: 'Another place' } });
  expect(screen.getByTestId('pins-json')).toHaveTextContent('"latitude":""');
  fireEvent.change(screen.getByRole('spinbutton', { name: /Latitude/ }), { target: { value: '12.34' } });
  fireEvent.change(screen.getByRole('spinbutton', { name: /Longitude/ }), { target: { value: '56.78' } });
  expect(screen.getByTestId('pins-json')).toHaveTextContent('"longitude":"56.78"');
  fireEvent.click(screen.getByRole('button', { name: 'Remove pin' }));
  expect(screen.getByTestId('pins-json')).toHaveTextContent('[]');
  fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
  expect(screen.getByTestId('pins-json')).toHaveTextContent('Another place');
});
