import { render, screen, within } from '@testing-library/react';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import SiteFooter from './SiteFooter';

beforeAll(() => {
  vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('prefers-reduced-motion'),
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })));
});

afterAll(() => vi.unstubAllGlobals());

describe('SiteFooter', () => {
  it('uses the OKNO brand and three clear link categories', () => {
    render(<SiteFooter />);
    const footer = screen.getByRole('contentinfo');

    expect(footer).toHaveAttribute('data-component', 'site-footer');
    expect(within(footer).getByRole('link', { name: 'OKNO Modhomes home' })).toHaveAttribute('href', '/');
    expect(within(footer).getByRole('link', { name: 'Enquire' })).toHaveAttribute(
      'href',
      '/enquiry?intent=home',
    );
    expect(within(footer).getByRole('navigation', { name: 'Homes' })).toBeInTheDocument();
    expect(within(footer).getByRole('navigation', { name: 'Explore' })).toBeInTheDocument();
    expect(within(footer).getByRole('navigation', { name: 'OKNO' })).toBeInTheDocument();
  });

  it('uses the dark wordmark on Bespoke’s light surface', () => {
    const { container } = render(<SiteFooter tone="bespoke" />);
    expect(screen.getByRole('contentinfo')).toHaveAttribute('data-tone', 'bespoke');
    expect(container.querySelector('img[data-tone="dark"]')).toBeInTheDocument();
  });

  it('keeps every compact directory link on a real current route', () => {
    const { container } = render(<SiteFooter />);
    const footer = screen.getByRole('contentinfo');

    for (const [name, href] of [
      ['Signature', '/models/signature'],
      ['Bespoke', '/models/bespoke'],
      ['Hospitality', '/hospitality'],
      ['Projects', '/projects'],
      ['Process', '/process'],
      ['About', '/about'],
      ['Sustainability', '/sustainability'],
      ['Journal', '/journal'],
    ] as const) {
      expect(within(footer).getByRole('link', { name })).toHaveAttribute('href', href);
    }

    expect(container.querySelector('a[href="#"]')).not.toBeInTheDocument();
  });

  it('links to the four social profiles published by OKNO', () => {
    render(<SiteFooter />);
    const footer = screen.getByRole('contentinfo');
    const social = within(footer).getByRole('navigation', { name: 'Social media' });

    for (const [name, href] of [
      ['Instagram', 'https://www.instagram.com/oknomodhomes/'],
      ['YouTube', 'https://www.youtube.com/@OknoModHomes'],
      ['LinkedIn', 'https://www.linkedin.com/company/oknomodhomes/'],
      ['Facebook', 'https://www.facebook.com/Oknomodhomes/'],
    ] as const) {
      const link = within(social).getByRole('link', { name: new RegExp(name) });
      expect(link).toHaveAttribute('href', href);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }

    expect(within(footer).queryByRole('heading', { level: 2, name: /begin|ready|build/i })).not.toBeInTheDocument();
  });
});
