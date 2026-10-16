import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AdminStudio from './AdminStudio';
import { PREVIEW_READY, PREVIEW_UPDATE } from '@/lib/sitePreview';

const snapshot = { revision: 9, draftRevision: 50, published: {}, draft: { 'about.opening.title': 'Draft About' }, publishedCollections: {}, draftCollections: {}, history: [] };
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });

describe('admin preview lifecycle', () => {
  it('hides Configurators while keeping the remaining Models editors', () => {
    render(<AdminStudio />);
    fireEvent.click(screen.getByText('Models', {exact:true}).closest('summary')!);
    expect(screen.queryByRole('button', {name:/Configurators/})).not.toBeInTheDocument();
    expect(screen.getByRole('button', {name:/Signature models/})).toBeInTheDocument();
    expect(screen.getByRole('button', {name:/Bespoke/})).toBeInTheDocument();
  });
  it('keeps the loaded frame through connection and resends current drafts when the child becomes ready', async () => {
    vi.spyOn(globalThis,'fetch').mockResolvedValue({ok:true,json:async()=>snapshot} as Response);
    const view=render(<AdminStudio />);
    const initial=view.container.querySelector('iframe')!;
    expect(initial).toHaveAttribute('loading','eager');
    expect(initial).toHaveAttribute('allow','autoplay; fullscreen');
    fireEvent.change(screen.getByLabelText('Admin token'),{target:{value:'local-test-token'}});
    fireEvent.click(screen.getByRole('button',{name:'Connect'}));
    await screen.findByText('Editor connected.');
    expect(view.container.querySelector('iframe')).toBe(initial);
    fireEvent.click(screen.getByRole('button',{name:/^About\d+/}));
    const frame=view.container.querySelector('iframe')!;
    const post=vi.spyOn(frame.contentWindow!,'postMessage');
    fireEvent.load(frame);
    fireEvent.click(screen.getByText('About opening',{exact:true}).closest('summary')!);
    fireEvent.change(screen.getByLabelText('Page title'),{target:{value:'Unsaved About preview'}});
    post.mockClear();
    fireEvent(window,new MessageEvent('message',{origin:window.location.origin,source:frame.contentWindow,data:{type:PREVIEW_READY}}));
    expect(post).toHaveBeenCalledWith(expect.objectContaining({type:PREVIEW_UPDATE,values:expect.objectContaining({'about.opening.title':'Unsaved About preview'})}),window.location.origin);
    expect(view.container.querySelector('iframe')).toBe(frame);
    post.mockClear();
    fireEvent(window,new MessageEvent('message',{origin:'https://untrusted.example',source:frame.contentWindow,data:{type:PREVIEW_READY}}));
    fireEvent(window,new MessageEvent('message',{origin:window.location.origin,source:window,data:{type:PREVIEW_READY}}));
    expect(post).not.toHaveBeenCalled();
  }, 15000);
  it('offers recovery for a stalled preview and keeps a healthy preview after the timeout', async () => {
    vi.useFakeTimers();
    const view=render(<AdminStudio />);
    const old=view.container.querySelector('iframe')!;
    await act(async()=>{await vi.advanceTimersByTimeAsync(12000);});
    expect(screen.getByRole('button',{name:'Reload preview'})).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Reload preview'}));
    const fresh=view.container.querySelector('iframe')!;
    expect(fresh).not.toBe(old);
    fireEvent(window,new MessageEvent('message',{origin:window.location.origin,source:fresh.contentWindow,data:{type:PREVIEW_READY}}));
    await act(async()=>{await vi.advanceTimersByTimeAsync(13000);});
    expect(screen.queryByRole('button',{name:'Reload preview'})).not.toBeInTheDocument();
  });
});
