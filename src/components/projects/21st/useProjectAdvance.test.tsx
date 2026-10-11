import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { motionValue } from 'motion/react';
import { useProjectAdvance } from './useProjectAdvance';
beforeEach(() => { vi.useFakeTimers();vi.spyOn(document, 'hidden', 'get').mockReturnValue(false); });
afterEach(() => { vi.useRealTimers();vi.restoreAllMocks(); });
describe('automatic showcase sequence', () => {
  it('advances a photograph after seven seconds and waits for film completion', () => {
    const next = vi.fn();
    const { rerender } = renderHook(props => useProjectAdvance({ ...props, next }), { initialProps: { id: 'kioo', running: true, photoOnly: true } });
    act(() => vi.advanceTimersByTime(6999));expect(next).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));expect(next).toHaveBeenCalledOnce();
    rerender({ id: 'kray-sangareddy', running: true, photoOnly: false });
    act(() => vi.advanceTimersByTime(30000));expect(next).toHaveBeenCalledOnce();
  });
  it('does not change projects when paused, offscreen, or in a hidden tab', () => {
    const next = vi.fn();
    const { rerender } = renderHook(props => useProjectAdvance({ ...props, next }), { initialProps: { id: 'kioo', running: true, photoOnly: true } });
    act(() => vi.advanceTimersByTime(3000));rerender({ id: 'kioo', running: false, photoOnly: true });
    act(() => vi.advanceTimersByTime(10000));expect(next).not.toHaveBeenCalled();
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);rerender({ id: 'kioo', running: true, photoOnly: true });
    act(() => vi.advanceTimersByTime(10000));expect(next).not.toHaveBeenCalled();
  });
  it('preserves photo progress when paused and resets it when selecting another project', () => {
    const progress = motionValue(0), next = vi.fn();
    const { rerender } = renderHook(props => useProjectAdvance({ ...props, next, progress }), { initialProps: { id: 'kioo', running: true, photoOnly: true } });
    act(() => vi.advanceTimersByTime(3000));expect(progress.get()).toBeCloseTo(3 / 7, 2);
    rerender({ id: 'kioo', running: false, photoOnly: true });
    act(() => vi.advanceTimersByTime(9000));expect(progress.get()).toBeCloseTo(3 / 7, 2);
    rerender({ id: 'kioo', running: true, photoOnly: true });
    act(() => vi.advanceTimersByTime(4000));expect(next).toHaveBeenCalledOnce();expect(progress.get()).toBe(1);
    rerender({ id: 'kray-sangareddy', running: true, photoOnly: false });expect(progress.get()).toBe(0);
  });

});
