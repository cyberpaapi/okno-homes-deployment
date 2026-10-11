import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ProductTimeline from './ProductTimeline';

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; quality?: number }) => {
    const imageProps = { ...props };
    delete imageProps.fill;
    delete imageProps.quality;
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...imageProps} alt={props.alt} />;
  },
}));
vi.mock('@/components/ui/SubtleAction', () => ({
  SubtleLink: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
}));
vi.mock('motion/react', () => ({
  motion: new Proxy({}, { get: (_, tag) => tag }),
  useReducedMotion: () => false,
  useScroll: () => ({ scrollYProgress: {} }),
  useTransform: () => ({}),
  useMotionValue: () => ({ set: vi.fn() }),
  useMotionValueEvent: vi.fn(),
}));

beforeEach(() => {
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });
});
afterEach(() => vi.unstubAllGlobals());

describe('90-day product timeline', () => {
  it('shows a completed real OKNO home without generated construction-light media', () => {
    const { container } = render(<ProductTimeline />);
    const image = screen.getByRole('img', { name: 'A completed OKNO Kioo home surrounded by mature forest' });
    expect(image).toHaveAttribute('src', '/assets/projects/real-v1/kioo-03.webp');
    expect(screen.getByText('Day 90 · Ready for handover')).toBeInTheDocument();
    expect(container.querySelector('video')).toBeNull();
    expect(container.querySelector('[src*="factory-manufacturing"]')).toBeNull();
  });

  it('presents the five day ranges in order and links to the full process', () => {
    render(<ProductTimeline />);
    expect(screen.getAllByText(/^Days /).map(node => node.textContent)).toEqual([
      'Days 01–10',
      'Days 11–25',
      'Days 26–60',
      'Days 61–72',
      'Days 73–90',
    ]);
    expect(screen.getByRole('link', { name: 'See the process' })).toHaveAttribute('href', '/process');
  });
});
