import { describe, expect, it } from 'vitest';
import { resolveConfigurator, configuratorSettingsError } from './configuratorSettings';

describe('model-specific walkthrough configuration', () => {
  it.each(['forza','tengo','kray'])('selects the supplied %s house, not the default Forza geometry', id => {
    const result = resolveConfigurator({id, fields:{name:id}});
    expect(result?.profile).toBe(id);
    expect(result?.url).toContain(`/${id}-`);
  });
  it('uses an uploaded house and independent surface defaults on an added model', () => {
    expect(resolveConfigurator({id:'aurora', fields:{name:'Aurora', configuratorModel:'/api/site-media/house.glb', configuratorScale:'.001', finish_ext_roof:'02', meshes_ext_wall:'Facade A\nFacade B'}})).toMatchObject({profile:'custom', scale:.001, defaults:{ext_roof:'02'}, mapping:{ext_wall:['Facade A','Facade B']}});
  });
  it('does not present another model as an unavailable house', () => {
    expect(resolveConfigurator({id:'gaze',fields:{name:'Gaze'}})).toBeNull();
    expect(resolveConfigurator({id:'forza',fields:{configuratorMode:'legacy'}})).toBeNull();
  });
  it.each(['https://example.com/house.glb','//example.com/house.glb','/../house.glb','/a/%2e%2e/house.glb','/house.html'])('rejects unsafe or non-GLB model paths: %s', configuratorModel => {
    expect(configuratorSettingsError({configuratorModel})).not.toBeNull();
  });
  it('rejects invalid dimensions and finishes on the wrong surface', () => {
    expect(configuratorSettingsError({configuratorScale:'NaN'})).not.toBeNull();
    expect(configuratorSettingsError({configuratorScale:'0'})).not.toBeNull();
    expect(configuratorSettingsError({finish_flooring:'02'})).not.toBeNull();
    expect(configuratorSettingsError({meshes_ext_wall:'Facade', meshes_int_wall:'Facade'})).toMatch(/more than one surface/);
  });
  it('links new houses to supplied or uploaded models with independent finishes', () => {
    const source = { id: 'custom', fields: { name: 'Custom', configuratorModel: '/api/site-media/custom.glb', configuratorScale: '.001', finish_ext_roof: '02', meshes_ext_wall: 'Facade' } };
    const linked = { id: 'retreat', fields: { name: 'Retreat', configuratorSource: 'custom', finish_ext_roof: '09' } };
    expect(resolveConfigurator(linked, [source, linked])).toMatchObject({ slug: 'retreat', name: 'Retreat', url: '/api/site-media/custom.glb', scale: .001, defaults: { ext_roof: '09' }, mapping: { ext_wall: ['Facade'] } });
    expect(resolveConfigurator({ id: 'new-house', fields: { configuratorSource: 'tengo' } })?.url).toContain('/tengo-');
  });
  it('rejects broken, circular and ambiguous model links', () => {
    const a = { id: 'a', fields: { configuratorSource: 'b' } };
    const b = { id: 'b', fields: { configuratorSource: 'a' } };
    expect(resolveConfigurator(a, [a, b])).toBeNull();
    expect(resolveConfigurator(a, [a])).toBeNull();
    expect(configuratorSettingsError({ configuratorSource: 'forza', configuratorModel: '/house.glb' })).not.toBeNull();
  });
});
