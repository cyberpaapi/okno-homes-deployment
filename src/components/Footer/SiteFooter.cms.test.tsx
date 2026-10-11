import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SiteFooter from './SiteFooter';

const cms = vi.hoisted(() => ({ values: {} as Record<string, string>, collections: {} as Record<string, { id: string; fields: Record<string, string> }[]> }));
vi.mock('@/lib/useSiteContent', () => ({ useSiteContentMap: () => cms.values, useSiteCollectionsMap: () => cms.collections }));

beforeEach(() => { cms.values = {}; cms.collections = {}; });

describe('SiteFooter published content', () => {
  it('adds and removes links inside the original footer slot without changing the columns', () => {
    cms.collections['footer.links.homes'] = [
      {id:'signature',fields:{label:'Signature',href:'/models/signature'}},
      {id:'new',fields:{label:'New retreat',href:'/models/bespoke'}},
    ];
    render(<SiteFooter />);
    const footer=screen.getByRole('contentinfo');
    const homes=within(footer).getByRole('navigation',{name:'Homes'});
    expect(within(homes).getByRole('link',{name:'New retreat'})).toHaveAttribute('href','/models/bespoke');
    expect(within(homes).queryByRole('link',{name:'Hospitality'})).not.toBeInTheDocument();
    expect(within(footer).getByRole('navigation',{name:'Explore'})).toBeInTheDocument();
  });
  it('renders edited copy, navigation destinations, social profile and icon in their original layout', () => {
    cms.values = {
      'footer.brand.line': 'A considered way to live.',
      'footer.social.instagram.name': 'Instagram studio',
      'footer.social.instagram.href': 'https://www.instagram.com/oknomodhomes/',
      'footer.social.instagram.icon': '/assets/footer/new-instagram.png',
      'footer.homes.heading': 'Our homes',
      'footer.homes.signature.label': 'Explore Signature',
      'footer.homes.signature.href': '/models/signature?view=all',
      'footer.bottom.copyright': '© {year} OKNO Studio',
      'footer.bottom.closing': 'Made with care.',
    };
    const { container } = render(<SiteFooter />);
    const footer = screen.getByRole('contentinfo');
    expect(within(footer).getByText('A considered way to live.')).toBeInTheDocument();
    expect(within(footer).getByRole('navigation', { name: 'Our homes' })).toBeInTheDocument();
    expect(within(footer).getByRole('link', { name: 'Explore Signature' })).toHaveAttribute('href', '/models/signature?view=all');
    expect(within(footer).getByRole('link', { name: /Instagram studio/ })).toHaveAttribute('href', 'https://www.instagram.com/oknomodhomes/');
    expect(container.querySelector('img[data-custom="true"]')?.getAttribute('src')).toContain(encodeURIComponent('/assets/footer/new-instagram.png'));
    expect(within(footer).getByText(`© ${new Date().getFullYear()} OKNO Studio`)).toBeInTheDocument();
    expect(within(footer).getByText('Made with care.')).toBeInTheDocument();
  });

  it('falls back to approved destinations when an older snapshot contains unsafe URLs', () => {
    cms.values = { 'footer.homes.signature.href': 'javascript:alert(1)', 'footer.social.instagram.href': 'javascript:alert(1)' };
    render(<SiteFooter />);
    const footer = screen.getByRole('contentinfo');
    expect(within(footer).getByRole('link', { name: 'Signature' })).toHaveAttribute('href', '/models/signature');
    expect(within(footer).getByRole('link', { name: /Instagram/ })).toHaveAttribute('href', 'https://www.instagram.com/oknomodhomes/');
  });
});
