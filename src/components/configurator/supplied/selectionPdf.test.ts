import { describe, expect, it } from 'vitest';
import { createSelectionPdf } from './selectionPdf';

describe('customer PDF', () => {
  it('exports approved choices and distinguishes unspecified and unmapped surfaces', () => {
    const pdf = createSelectionPdf({ name: 'Tengo', selected: { 'external-wall': 'golden-oak', flooring: 'obsidian-shield' }, counts: { 'external-wall': 2, flooring: 1, 'external-roof': 4 }, variant: 'Studio' });
    const bytes = pdf.output();
    expect(bytes.startsWith('%PDF-')).toBe(true);
    expect(pdf.getNumberOfPages()).toBe(1);
    const content = pdf.internal.pages.flat().join('\n');
    expect(content).toContain('10 / Golden Oak');
    expect(content).toContain('Original model finish - not specified');
    expect(content).toContain('Not available in this model');
    expect(content).not.toContain('Obsidian Shield'); // Metal is not approved for flooring.
    expect(content).toContain('Requested plan: Studio');
  });
});
