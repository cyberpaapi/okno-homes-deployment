import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ModelSetupPreview from './ModelSetupPreview';
import { resolveConfigurator } from '@/lib/configuratorSettings';

const scene = vi.hoisted(() => ({ dispose: vi.fn(), turn: vi.fn(), view: vi.fn(), glb: vi.fn().mockResolvedValue({}), resetSurfaces: vi.fn(), surface: vi.fn(), mapSurfaces: vi.fn().mockReturnValue({ counts: { 'external-wall': 1 }, meshes: [{ name: 'Facade', applications: ['external-wall'], supported: true }] }) }));
vi.mock('@/components/configurator/supplied/cabinScene', () => ({ createScene: () => scene }));

beforeEach(() => { vi.clearAllMocks(); vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, blob: async () => new Blob(['GLB']) })); });

describe('draft model setup preview', () => {
  it('loads once, previews finish changes without reloading, exposes unmapped surfaces and assigns a mesh', async () => {
    const settings = resolveConfigurator({ id: 'retreat', fields: { configuratorModel: '/house.glb', finish_ext_wall: '10' } })!;
    const onMap = vi.fn();
    const { rerender, unmount } = render(<ModelSetupPreview settings={settings} disabled={false} linked={false} onMap={onMap} />);
    await screen.findByText(/Some surfaces are not mapped/);
    expect(scene.surface).toHaveBeenCalledWith('external-wall', expect.any(Object), 'Golden Oak');
    rerender(<ModelSetupPreview settings={{ ...settings, defaults: { ...settings.defaults, ext_wall: '03' } }} disabled={false} linked={false} onMap={onMap} />);
    await waitFor(() => expect(scene.surface).toHaveBeenLastCalledWith('external-wall', expect.any(Object), 'Ivory Armor'));
    expect(scene.glb).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByText('Inspect and assign mesh surfaces'));
    fireEvent.change(screen.getByLabelText('Surface for Facade'), { target: { value: 'int_wall' } });
    expect(onMap).toHaveBeenCalledWith('Facade', 'int_wall');
    fireEvent.click(screen.getByRole('button', { name: 'Fit model' }));
    expect(scene.view).toHaveBeenCalledWith('hero');
    unmount(); expect(scene.dispose).toHaveBeenCalledTimes(1);
  });
});
