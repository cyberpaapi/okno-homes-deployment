import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AdminStudio from './AdminStudio';
const snapshot = { revision: 0, draftRevision: 0, published: {}, draft: {}, publishedCollections: {}, draftCollections: {}, history: [] };
afterEach(() => vi.restoreAllMocks());
describe('password-free content studio', () => {
  it('automatically loads content without a password input, credential or disconnect action', async () => {
    const fetch = vi.spyOn(globalThis,'fetch').mockResolvedValue({ ok: true, json: async () => snapshot } as Response);
    render(<AdminStudio passwordless />);
    await screen.findByText('Editor connected.');
    expect(fetch).toHaveBeenCalledWith('/api/admin/content', expect.objectContaining({ headers: {} }));
    expect(screen.queryByLabelText('Admin token')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Connect' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Disconnect' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Publish changes' })).toBeInTheDocument();
  });
  it('allows a failed storage connection to retry without asking for a password', async () => {
    const fetch = vi.spyOn(globalThis,'fetch')
      .mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'Content storage is unavailable.' }) } as Response)
      .mockResolvedValue({ ok: true, json: async () => snapshot } as Response);
    render(<AdminStudio passwordless />);
    await screen.findByRole('alert');
    fireEvent.click(screen.getByRole('button', { name: 'Retry connection' }));
    await screen.findByText('Editor connected.');
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    expect(screen.queryByLabelText('Admin token')).toBeNull();
  });
});
