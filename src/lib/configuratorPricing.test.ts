import { describe, expect, it } from 'vitest';
import { catalogueBase, estimate, finishPrice, materialIds, materialsError, materialsKey } from './configuratorPricing';

describe('house material schedules', () => {
  it('preserves legacy approved finishes and supports explicit empty or limited assignments', () => {
    expect(materialIds({}, 'external-wall')).toContain('golden-oak');
    expect(materialIds({ [materialsKey('external-wall')]: '[]' }, 'external-wall')).toEqual([]);
    expect(materialIds({ [materialsKey('external-wall')]: '["golden-oak"]' }, 'external-wall')).toEqual(['golden-oak']);
    expect(materialIds({ [materialsKey('external-wall')]: 'invalid' }, 'external-wall')).toEqual([]);
    for (const value of ['["unknown"]', '["golden-oak","golden-oak"]', '{}', '[3]', 'invalid']) {
      expect(materialsError({ [materialsKey('external-wall')]: value })).not.toBeNull();
    }
    expect(materialsError({ [materialsKey('external-wall')]: '["golden-oak"]' })).toBeNull();
  });
  it('replaces the current component price, keeps surfaces independent and respects unavailable surfaces', () => {
    const schedule = { base: 1850000, rates: { 'external-wall.golden-oak': '12000', 'external-wall.titanium-veil': '3000', 'flooring.tuscan-elegance': '1000' } };
    const counts = { 'external-wall': 1, flooring: 1 };
    expect(estimate(schedule, { 'external-wall': 'golden-oak', flooring: 'tuscan-elegance' }, counts).total).toBe(1863000);
    expect(estimate(schedule, { 'external-wall': 'titanium-veil', flooring: 'tuscan-elegance' }, counts).total).toBe(1854000);
    expect(estimate(schedule, { 'external-wall': 'golden-oak' }, {}).total).toBe(1850000);
    expect(estimate({ ...schedule, rates: {} }, { 'external-wall': 'golden-oak' }, counts).total).toBeNull();
    expect(finishPrice({ ...schedule.rates, [materialsKey('external-wall')]: '[]' }, 'external-wall', 'golden-oak')).toBeNull();
    expect(estimate({ base: null, rates: {} }, {}, counts).total).toBeNull();
  });
  it('uses the selected plan starting amount when no house base override exists', () => {
    const plans = [{ id: 'a', fields: { modelId: 'retreat', price: '₹18.5 lakh' } }];
    expect(catalogueBase('retreat', plans)).toBe(1850000);
    expect(catalogueBase('retreat', [{ ...plans[0], fields: { ...plans[0].fields, price: 'Price on request' } }])).toBeNull();
  });
});
