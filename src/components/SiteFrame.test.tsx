import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SiteFrame from './SiteFrame';

const route = vi.hoisted(() => ({ pathname: '/' }));

vi.mock('next/navigation', () => ({ usePathname: () => route.pathname }));
vi.mock('@/components/CustomCursor/CustomCursor', () => ({ default: () => null }));
vi.mock('@/components/Footer/SiteFooter', () => ({ default: ({ tone }: { tone: string }) => <footer data-testid="site-footer" data-tone={tone} /> }));

afterEach(() => { route.pathname = '/'; });

describe('SiteFrame footer placement', () => {
  it.each(['/models/signature', '/models/signature/forza/configure'])(
    'omits the footer on the immersive Signature route %s',
    (pathname) => {
      route.pathname = pathname;
      render(<SiteFrame><main>Signature experience</main></SiteFrame>);
      expect(screen.queryByTestId('site-footer')).not.toBeInTheDocument();
    },
  );

  it.each(['/', '/enquiry', '/models/bespoke'])('keeps the footer on %s', (pathname) => {
    route.pathname = pathname;
    render(<SiteFrame><main>Page</main></SiteFrame>);
    expect(screen.getByTestId('site-footer')).toBeInTheDocument();
  });

  it.each([
    ['/', 'home'],
    ['/hero-v1', 'home'],
    ['/hero-v2', 'home'],
    ['/enquiry', 'enquiry'],
    ['/models/bespoke', 'bespoke'],
    ['/sustainability', 'sustainability'],
    ['/journal', 'journal'],
    ['/journal/compact-site', 'journal'],
    ['/projects', 'projects'],
    ['/about', 'forest'],
    ['/process', 'forest'],
  ])('selects the %s footer surface', (pathname, tone) => {
    route.pathname = pathname;
    render(<SiteFrame><main>Page</main></SiteFrame>);
    expect(screen.getByTestId('site-footer')).toHaveAttribute('data-tone', tone);
  });
});
