import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useLenisDocumentLock } from './useLenisDocumentLock';
const driver = vi.hoisted(() => ({ start: vi.fn(), stop: vi.fn() }));
vi.mock('lenis/react', () => ({ useLenis: () => driver }));
afterEach(() => { document.body.style.overflow = ''; vi.restoreAllMocks(); vi.clearAllMocks(); });
describe('smooth document modal lock', () => {
  it('stops scrolling and inertia while a dialog is open and resumes after close', async () => {
    const hook = renderHook(useLenisDocumentLock);
    expect(driver.start).toHaveBeenCalledOnce();
    await act(async () => { document.body.style.overflow = 'hidden'; });
    expect(driver.stop).toHaveBeenCalledOnce();
    await act(async () => { document.body.style.overflow = ''; });
    expect(driver.start).toHaveBeenCalledTimes(2);
    hook.unmount();
    await act(async () => { document.body.style.overflow = 'hidden'; });
    expect(driver.stop).toHaveBeenCalledOnce();
  });
  it('stops a hidden tab and respects a still-open menu when visibility returns', async () => {
    const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    const hook = renderHook(useLenisDocumentLock);
    expect(driver.stop).toHaveBeenCalledOnce();
    await act(async () => { document.body.style.overflow = 'hidden'; });
    hidden.mockReturnValue(false);
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    expect(driver.start).not.toHaveBeenCalled();
    await act(async () => { document.body.style.overflow = ''; });
    expect(driver.start).toHaveBeenCalledOnce();
    hook.unmount();
  });
});
