import { fireEvent, render } from '@testing-library/react';
import { motionValue } from 'motion/react';
import { useRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import useProcessScrollGuard from './useProcessScrollGuard';

function Fixture({ shown = motionValue(0), enabled = true }) {
  const ref = useRef<HTMLElement>(null);
  useProcessScrollGuard(ref, shown, 'film', enabled);
  return <section ref={ref}><button>Menu</button></section>;
}

function BothSequences({ film, timeline }: { film: ReturnType<typeof motionValue<number>>; timeline: ReturnType<typeof motionValue<number>> }) {
  const filmRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<HTMLElement>(null);
  useProcessScrollGuard(filmRef, film);
  useProcessScrollGuard(timelineRef, timeline, 'timeline');
  return <main data-route="process"><section ref={filmRef} data-playback="scroll" /><section ref={timelineRef} data-process-detail-timeline><div style={{ position: 'sticky' }} /></section></main>;
}

describe('gesture guard integration', () => {
  afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers(); });
  function setup(shown = motionValue(0)) {
    let y = 0;
    vi.spyOn(window, 'scrollY', 'get').mockImplementation(() => y);
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(720);
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation((options) => { y = (options as ScrollToOptions).top!; });
    const view = render(<Fixture shown={shown} />);
    const section = view.container.querySelector('section')!;
    Object.defineProperty(section, 'offsetHeight', { value: 3720 });
    vi.spyOn(section, 'getBoundingClientRect').mockImplementation(() => ({ top: -y } as DOMRect));
    return { ...view, scrollTo, shown, getY: () => y, setY: (next: number) => { y = next; } };
  }
  it('limits rapid wheel and momentum scrolling, releases forward, and protects reverse entry', () => {
    const view = setup();
    expect(fireEvent.wheel(window, { deltaY: 6000, cancelable: true })).toBe(false);
    expect(view.getY()).toBeCloseTo(632.1);
    view.setY(4000); fireEvent.scroll(window);
    expect(view.getY()).toBeCloseTo(632.1);
    view.shown.set(.999);
    expect(fireEvent.wheel(window, { deltaY: 6000, cancelable: true })).toBe(true);
    view.setY(4000); fireEvent.scroll(window);
    fireEvent.wheel(window, { deltaY: -6000, cancelable: true });
    expect(view.getY()).toBeGreaterThan(2600);
    expect(view.getY()).toBeLessThan(2700);
    view.shown.set(0);
    expect(fireEvent.wheel(window, { deltaY: -6000, cancelable: true })).toBe(true);
  });
  it('protects the first gesture after a long idle and fails open after eight seconds of stalled frames', () => {
    vi.useFakeTimers();
    const view = setup();
    vi.advanceTimersByTime(60000);
    fireEvent.wheel(window, { deltaY: 6000, cancelable: true });
    expect(view.getY()).toBeCloseTo(632.1);
    vi.advanceTimersByTime(8100);
    expect(fireEvent.wheel(window, { deltaY: 6000, cancelable: true })).toBe(true);
    view.shown.set(.1);
    expect(fireEvent.wheel(window, { deltaY: 6000, cancelable: true })).toBe(false);
  });
  it('protects keyboard/touch gestures but preserves explicit jumps, zoom, menu and cleanup', () => {
    const view = setup(motionValue(.5));
    view.setY(1700);
    expect(fireEvent.keyDown(window, { key: 'PageUp', cancelable: true })).toBe(false);
    expect(view.getY()).toBeCloseTo(1497.9);
    fireEvent.touchStart(window, { touches: [{ clientY: 0 }] });
    expect(fireEvent.touchMove(window, { touches: [{ clientY: 1000 }], cancelable: true })).toBe(false);
    expect(view.getY()).toBeCloseTo(1497.9);
    expect(fireEvent.keyDown(window, { key: 'Home', cancelable: true })).toBe(true);
    view.setY(0); fireEvent.scroll(window);
    expect(view.getY()).toBe(0);
    expect(fireEvent.wheel(window, { deltaY: 9000, ctrlKey: true, cancelable: true })).toBe(true);
    expect(fireEvent.wheel(view.getByText('Menu'), { deltaY: 9000, cancelable: true })).toBe(true);
    view.unmount();
    expect(fireEvent.wheel(window, { deltaY: 9000, cancelable: true })).toBe(true);
  });
  it('lets the nearest unfinished sequence own a large gesture without the other guard overriding it', () => {
    let y = 0;
    vi.spyOn(window, 'scrollY', 'get').mockImplementation(() => y);
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(720);
    vi.spyOn(window, 'scrollTo').mockImplementation(options => { y = (options as ScrollToOptions).top!; });
    const film = motionValue(0), timeline = motionValue(0);
    const view = render(<BothSequences film={film} timeline={timeline} />);
    const sections = view.container.querySelectorAll('section');
    sections.forEach((section, index) => {
      Object.defineProperty(section, 'offsetHeight', { value: 3720 });
      vi.spyOn(section, 'getBoundingClientRect').mockImplementation(() => ({ top: index * 4000 - y } as DOMRect));
    });
    fireEvent.wheel(window, { deltaY: 10000, cancelable: true });
    expect(y).toBeCloseTo(632.1); // Film owns forward entry.
    film.set(.999); y = 2900;
    fireEvent.wheel(window, { deltaY: 10000, cancelable: true });
    expect(y).toBe(4000); // Finished film releases into the complete first phase.
    fireEvent.wheel(window, { deltaY: 10000, cancelable: true });
    expect(y).toBe(4480); // A fresh gesture advances to the next phase.
    timeline.set(1); y = 7400;
    fireEvent.wheel(window, { deltaY: -10000, cancelable: true });
    expect(y).toBe(7000); // Reverse entry shows the complete last phase.
    fireEvent.wheel(window, { deltaY: -10000, cancelable: true });
    expect(y).toBe(6520); // Detail timeline owns further reverse movement.
    timeline.set(0); y = 4100;
    fireEvent.wheel(window, { deltaY: -10000, cancelable: true });
    expect(y).toBeGreaterThan(2600); // Detail releases into the film's ending.
    expect(y).toBeLessThan(2700);
    sections[1].firstElementChild!.setAttribute('style', 'position: relative');
    y = 4800;
    expect(fireEvent.wheel(window, { deltaY: 10000, cancelable: true })).toBe(true); // Short-mobile vertical flow stays native.
  });
});
