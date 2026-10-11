import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import LandingCursor from './LandingCursor';

let callbacks: Map<number, FrameRequestCallback>;
let fine = true;
let reduced = false;
let id = 0;
let now = 0;

beforeEach(() => {
  fine = true; reduced = false; id = 0; now = 0;
  callbacks = new Map();
  // RAF timestamps and performance.now share one clock in the browser.
  vi.spyOn(performance, 'now').mockImplementation(() => now);
  vi.stubGlobal('matchMedia', (query: string) => ({ matches: query.includes('reduced') ? reduced : fine, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { callbacks.set(++id, callback); return id; });
  vi.stubGlobal('cancelAnimationFrame', (key: number) => callbacks.delete(key));
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

function move(target: Element, x = 150, y = 80, pointerType = 'mouse') {
  const event = new Event('pointermove', { bubbles: true });
  Object.assign(event, { clientX: x, clientY: y, pointerType });
  fireEvent(target, event);
}
function settle() {
  act(() => {
    for (let i = 0; i < 220 && callbacks.size; i++) {
      now += 16.67;
      const frame = [...callbacks.values()]; callbacks.clear();
      frame.forEach((callback) => callback(now));
    }
  });
}
describe('landing cursor boundaries', () => {
  it('stays circular over controls instead of expanding into their bounds', () => {
    render(<><LandingCursor /><a href="/enquiry" data-landing-magnetic>Configure your OKNO home</a></>);
    const link = screen.getByRole('link');
    move(link); settle();
    const cursor = screen.getByTestId('landing-cursor');
    expect(cursor).toHaveAttribute('data-mode', 'interactive');
    expect(cursor.style.width).toBe('');
    expect(cursor.style.height).toBe('');
    expect(cursor.style.transform).toContain('scale(1.45)');
    expect(callbacks.size).toBe(0);
  });

  it('does not expand into a lens over marked headings', () => {
    render(<><LandingCursor /><h1 data-landing-heading>Homes without compromise</h1><p>Regular paragraph</p></>);
    const heading = screen.getByRole('heading');
    move(heading, 220, 140); settle();
    const cursor = screen.getByTestId('landing-cursor');
    expect(cursor).toHaveAttribute('data-mode', 'fluid');
    expect(cursor.style.transform).toContain('scale(1)');
    expect(cursor).toBeEmptyDOMElement();
    move(screen.getByText('Regular paragraph')); settle();
    expect(cursor).toHaveAttribute('data-mode', 'fluid');
  });

  it('keeps the circular cursor over media, keeps forms native, and marks controls as interactive', () => {
    render(<><LandingCursor /><div><span>Media surface</span><button data-cursor-media-action>Open</button></div><input aria-label="Your name" /></>);
    move(screen.getByText('Media surface')); settle();
    expect(document.documentElement).toHaveAttribute('data-landing-cursor', 'true');
    expect(screen.getByTestId('landing-cursor')).toHaveAttribute('data-mode', 'fluid');
    const button = screen.getByRole('button');
    move(button); settle();
    expect(screen.getByTestId('landing-cursor')).toHaveAttribute('data-mode', 'interactive');
    move(screen.getByRole('textbox'));
    expect(document.documentElement).not.toHaveAttribute('data-landing-cursor');
    expect(callbacks.size).toBe(0);
  });

  it.each(['touch', 'reduced', 'coarse'])('does not replace the native cursor in %s context', (context) => {
    reduced = context === 'reduced'; fine = context !== 'coarse';
    render(<><LandingCursor /><button data-landing-magnetic>Contact</button></>);
    move(screen.getByRole('button'), 30, 30, context === 'touch' ? 'touch' : 'mouse');
    expect(document.documentElement).not.toHaveAttribute('data-landing-cursor');
    expect(callbacks.size).toBe(0);
  });
});
