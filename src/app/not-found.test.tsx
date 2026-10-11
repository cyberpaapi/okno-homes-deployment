import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import NotFound from './not-found';

vi.mock('next/navigation', () => ({ usePathname: () => '/missing-page' }));

describe('site-wide not found', () => {
  it('provides real recovery destinations and the standard site navigation', () => {
    render(<NotFound />);
    expect(screen.getByRole('heading', { level: 1, name: '404 — Page not found' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Go home' })).toHaveAttribute('href', '/');
    expect(within(screen.getByRole('navigation', { name: 'Primary navigation' })).getByRole('link', { name: 'Projects' })).toHaveAttribute('href', '/projects');
    const recovery = screen.getAllByRole('link', { name: 'Models' });
    expect(recovery).toHaveLength(2);
    recovery.forEach(link => expect(link).toHaveAttribute('href', '/models'));
    expect(document.querySelector('a[href="#"]')).toBeNull();
  });
});
