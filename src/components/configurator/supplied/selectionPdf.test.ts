import { describe, expect, it } from 'vitest';
import { estimate, priceKey, catalogueBase } from '@/lib/configuratorPricing';
import { createSelectionPdf } from './selectionPdf';

describe('house estimate and downloaded specification', () => {
  const counts = { 'external-wall': 12, flooring: 3, 'external-roof': 4 };
  const rates = { [priceKey('external-wall', 'golden-oak')]: '12500', [priceKey('external-wall', 'titanium-veil')]: '0' };
  const make = (wall: string) => estimate({ base: 1850000, rates }, { 'external-wall': wall, flooring: 'obsidian-shield' }, counts);
  it('charges once per component and replaces the previous finish', () => {
    expect(make('golden-oak').total).toBe(1862500);
    expect(make('titanium-veil').total).toBe(1850000);
    expect(make('obsidian-shield').total).toBeNull();
    expect(estimate({base:null,rates},{},counts).total).toBeNull();
    expect(estimate({base:0,rates},{'external-wall':'golden-oak'},{}).total).toBe(0);
  });
  it('reads catalogue units and respects the requested plan', () => {
    expect(catalogueBase('forza',[])).toBe(1850000);
    expect(catalogueBase('tengo',[],'3-bhk')).toBe(8430000);
    expect(catalogueBase('custom',[])).toBeNull();
    expect(catalogueBase('tengo',[],'unknown')).toBeNull();
  });
  it('prints the same total and includes only approved selections', () => {
    const pdf = createSelectionPdf({ name: 'Tengo', quote: make('golden-oak'), variant: '3-bhk' });
    expect(pdf.getNumberOfPages()).toBe(1);
    const content = pdf.internal.pages.flat().join('\n');
    for (const value of ['Golden Oak','Original model finish','Surface unavailable','INR 18,62,500','Three-bedroom']) {
      expect(content).toContain(value);
    }
    expect(content).not.toContain('Obsidian Shield');
  });
});
