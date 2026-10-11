import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import WorksWheel from './WorksWheel';

let compact = false;
let rafs: Map<number, FrameRequestCallback>;
let nextID = 0;
vi.mock('next/image', () => ({ default: (props: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean }) => {
  const imageProps = { ...props }; delete imageProps.fill;
  // Native image keeps the test focused on navigation rather than Next's loader.
  // eslint-disable-next-line @next/next/no-img-element
  return <img {...imageProps} alt={props.alt} />;
} }));
vi.mock('@/components/ui/SubtleAction', () => ({
  SubtleButton: (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props} />,
  SubtleLink: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
}));
beforeEach(() => {
  compact = false; rafs = new Map(); nextID = 0;
  vi.stubGlobal('matchMedia', () => ({ matches: compact, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });
  vi.stubGlobal('IntersectionObserver', class { observe() {} disconnect() {} });
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { rafs.set(++nextID, callback); return nextID; });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => rafs.delete(id));
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });
function frames(count = 100) {
  act(() => {
    for (let i = 0; i < count && rafs.size; i++) {
      const callbacks = [...rafs.values()]; rafs.clear(); callbacks.forEach(callback => callback(i * 16));
    }
  });
}

describe('retrieved Works Wheel', () => {
  it('uses inert project photography and routes only the dedicated project action', () => {
    compact = true;
    const { container } = render(<WorksWheel />);
    expect(screen.getByRole('link', { name: 'View Lakewood Villa' })).toHaveAttribute('href', '/projects/lakewood');
    expect(container.querySelector('img')?.closest('a')).toBeNull();
    expect(container.querySelector('img')).not.toHaveAttribute('data-landing-magnetic');
    fireEvent.click(screen.getByRole('button', { name: 'Next project' }));
    expect(screen.getByRole('link', { name: 'View Forrest' })).toHaveAttribute('href', '/projects/forrest');
    expect(screen.getAllByRole('link')).toHaveLength(1);
  });

  it('supports keyboard boundaries with reduced motion without scheduling animation', () => {
    compact = true;
    render(<WorksWheel />);
    const stage = screen.getByRole('region', { name: 'Project wheel' });
    fireEvent.keyDown(stage, { key: 'End' });
    expect(screen.getByRole('link', { name: 'View Rasa Vikarabad' })).toHaveAttribute('href', '/projects/rasa-vikarabad');
    expect(screen.getByRole('button', { name: 'Next project' })).toBeDisabled();
    fireEvent.keyDown(stage, { key: 'ArrowRight' });
    expect(screen.getByRole('link', { name: 'View Rasa Vikarabad' })).toBeInTheDocument();
    fireEvent.keyDown(stage, { key: 'Home' });
    expect(screen.getByRole('button', { name: 'Previous project' })).toBeDisabled();
    expect(rafs.size).toBe(0);
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it('never consumes wheel gestures and stops RAF after the drum settles', () => {
    const { unmount } = render(<WorksWheel />);
    const stage = screen.getByRole('region', { name: 'Project wheel' });
    const wheelEvent = new WheelEvent('wheel', { deltaY: 900, bubbles: true, cancelable: true });
    fireEvent(stage, wheelEvent);
    expect(wheelEvent.defaultPrevented).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: 'Next project' }));
    frames();
    expect(screen.getByRole('link', { name: 'View Forrest' })).toHaveAttribute('href', '/projects/forrest');
    expect(rafs.size).toBe(0);
    fireEvent.click(screen.getByRole('button', { name: 'Next project' }));
    expect(rafs.size).toBe(1);
    unmount();
    expect(rafs.size).toBe(0);
  });

  it('accepts horizontal touch swipes while leaving vertical swipes to native scrolling', () => {
    compact = true;
    render(<WorksWheel />);
    const stage = screen.getByRole('region', { name: 'Project wheel' });
    const pointer = (type: string, x: number, y: number) => {
      const event = new Event(type, { bubbles: true }); Object.assign(event, { clientX: x, clientY: y }); fireEvent(stage, event);
    };
    pointer('pointerdown', 250, 100); pointer('pointerup', 160, 350);
    expect(screen.getByRole('link', { name: 'View Lakewood Villa' })).toBeInTheDocument();
    pointer('pointerdown', 250, 100); pointer('pointerup', 160, 110);
    expect(screen.getByRole('link', { name: 'View Forrest' })).toBeInTheDocument();
  });
});
