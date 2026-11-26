import { useState } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ContentItem } from '@/lib/contentCollections';
import SignatureModelPanel from './SignatureModelPanel';

function Editor({ initial, upload, others = [{ id: 'tengo', fields: { name: 'Tengo' } }], builtIn = false, disabled = false }: { initial: ContentItem; others?: ContentItem[]; builtIn?: boolean; disabled?: boolean; upload: (file: File, rotation?: boolean) => Promise<{ url: string; detailUrl?: string; posterUrl?: string }> }) {
  const [model, setModel] = useState(initial);
  return <SignatureModelPanel model={model} roster={[model, ...others]} plans={[]} builtIn={builtIn} disabled={disabled} onModelChange={setModel} onModelIdChange={() => true} onRemoveModel={() => {}} onMoveModel={() => {}} canMoveUp={false} canMoveDown={false} onPlansChange={() => {}} onUpload={upload} />;
}

const galleryFixture: ContentItem = { id: 'retreat', fields: { name: 'Retreat', gallery: JSON.stringify([{ id: 'exterior', label: 'Exterior', image: '', alt: 'Retreat exterior' }]) } };
const uploadNames = ['Upload rotation master video for Retreat', 'Upload explore detail video for Retreat', 'Upload opening poster for Retreat', 'Upload preview image 1 for Retreat', 'Upload 3D house GLB for Retreat'];

describe('admin model linking and upload', () => {
  it('links a new house to a supplied model and keeps approved finish overrides editable', () => {
    render(<Editor initial={{ id: 'retreat', fields: { name: 'Retreat' } }} upload={vi.fn()} />);
    fireEvent.click(screen.getByText('3D configurator and walkthrough · required'));
    expect(screen.getByRole('button', { name: 'Preview model and materials' })).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('3D model required');
    expect(screen.queryByRole('link', { name: /Open published configurator/ })).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Link an existing 3D model/), { target: { value: 'tengo' } });
    expect(screen.getByRole('button', { name: 'Preview model and materials' })).toBeEnabled();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Open published configurator/ })).toHaveAttribute('href', '/models/signature/retreat/configure');
    expect(screen.getByLabelText(/Metres per model unit/)).toBeDisabled();
    const flooring = screen.getByLabelText('Flooring · starting finish');
    expect(flooring.textContent).toContain('Tuscan Elegance');
    expect(flooring.textContent).not.toContain('Obsidian Shield');
    fireEvent.change(flooring, { target: { value: '18' } });
    expect(flooring).toHaveValue('18');
  });
  it('does not offer descendants or disabled houses as model sources', () => {
    render(<Editor initial={{ id: 'retreat', fields: { name: 'Retreat', configuratorModel: '/house.glb' } }} others={[
      { id: 'dependent', fields: { name: 'Dependent', configuratorSource: 'retreat' } },
      { id: 'tengo', fields: { name: 'Tengo', configuratorMode: 'legacy' } },
    ]} upload={vi.fn()} />);
    fireEvent.click(screen.getByText('3D configurator and walkthrough · required'));
    const choices = screen.getByLabelText(/Link an existing 3D model/);
    expect(choices).not.toHaveTextContent('Dependent');
    expect(choices).not.toHaveTextContent('Tengo');
    expect(choices).toHaveTextContent('Forza');
  });
  it('uploads a GLB, removes a source link and clears stale mesh mappings', async () => {
    const upload = vi.fn().mockResolvedValue({ url: '/api/site-media/new-house.glb' });
    const { container } = render(<Editor initial={{ id: 'retreat', fields: { name: 'Retreat', configuratorSource: 'tengo', meshes_ext_wall: 'Old wall' } }} upload={upload} />);
    fireEvent.click(screen.getByText('3D configurator and walkthrough · required'));
    fireEvent.change(container.querySelector('input[accept=".glb,model/gltf-binary"]')!, { target: { files: [new File(['GLB fixture'], 'house.glb')] } });
    await waitFor(() => expect(screen.getByLabelText(/Link an existing 3D model/)).toHaveValue(''));
    expect(upload).toHaveBeenCalledWith(expect.objectContaining({ type: 'model/gltf-binary' }), false);
    expect(screen.getByDisplayValue('/api/site-media/new-house.glb')).toBeEnabled();
    fireEvent.click(screen.getByText('Map surfaces by mesh name'));
    expect(screen.getByLabelText('External wall mesh names')).toHaveValue('');
  });

  it('gives every custom-model upload its own named file input and independent activation label', () => {
    const { container } = render(<Editor initial={galleryFixture} upload={vi.fn()} />);
    const files = Array.from(container.querySelectorAll<HTMLInputElement>('input[type="file"]'));
    expect(files).toHaveLength(5);
    expect(new Set(files.map(input => input.id)).size).toBe(5);
    const pathClicks = vi.fn();
    container.querySelectorAll<HTMLInputElement>('input:not([type="file"])').forEach(input => input.addEventListener('click', pathClicks));
    uploadNames.forEach(name => {
      const input = screen.getByLabelText(new RegExp(name)) as HTMLInputElement;
      expect(input).toHaveAttribute('type', 'file');
      expect(input).toHaveAccessibleName(name);
      expect(input.id).not.toBe('');
      expect(input.labels).toHaveLength(1);
      const label = input.labels![0];
      expect(label.control).toBe(input);
      expect(label.htmlFor).toBe(input.id);
      expect(label.querySelectorAll('input, select, textarea, button')).toHaveLength(1);
      expect(label.parentElement?.closest('label')).toBeNull();
      const fileClicks = vi.fn();
      input.addEventListener('click', fileClicks);
      fireEvent.click(label.querySelector('span[aria-hidden="true"]')!);
      expect(fileClicks).toHaveBeenCalledTimes(1);
    });
    expect(pathClicks).not.toHaveBeenCalled();
    ['Rotation master video', 'Explore detail video', 'Opening poster', '3D house GLB'].forEach(name => {
      const pathInput = screen.getByLabelText(name) as HTMLInputElement;
      expect(pathInput.type).toBe('text');
      expect(pathInput.labels).toHaveLength(1);
      expect(pathInput.labels![0].control).toBe(pathInput);
    });
  });

  it('keeps upload IDs unique across panels and associates the built-in GLB label only with its file input', () => {
    const { container } = render(<><Editor initial={galleryFixture} upload={vi.fn()} /><Editor initial={{ id: 'forza', fields: { name: 'Forza' } }} builtIn upload={vi.fn()} /></>);
    const ids = Array.from(container.querySelectorAll<HTMLInputElement>('input[id]')).map(input => input.id);
    expect(new Set(ids).size).toBe(ids.length);
    const file = screen.getByLabelText(/Upload 3D house GLB for Forza/) as HTMLInputElement;
    expect(file).toHaveAccessibleName('Upload 3D house GLB for Forza');
    expect(file.labels![0].control).toBe(file);
    const click = vi.fn();
    file.addEventListener('click', click);
    fireEvent.click(file.labels![0]);
    expect(click).toHaveBeenCalledTimes(1);
  });

  it.each([false, true])('keeps the file inputs disabled with the editor disabled (builtIn=%s)', builtIn => {
    const upload = vi.fn();
    const { container } = render(<Editor initial={galleryFixture} builtIn={builtIn} disabled upload={upload} />);
    const inputs = Array.from(container.querySelectorAll<HTMLInputElement>('input[type="file"]'));
    expect(inputs).toHaveLength(builtIn ? 1 : 5);
    inputs.forEach(input => {
      expect(input).toBeDisabled();
      const click = vi.fn();
      input.addEventListener('click', click);
      fireEvent.click(input.labels![0]);
      expect(click).not.toHaveBeenCalled();
    });
    expect(upload).not.toHaveBeenCalled();
  });

  it('keeps all upload inputs busy until the pending upload completes', async () => {
    let finish!: (value: { url: string }) => void;
    const upload = vi.fn().mockImplementation(() => new Promise<{ url: string }>(resolve => { finish = resolve; }));
    const { container } = render(<Editor initial={galleryFixture} upload={upload} />);
    const rotation = screen.getByLabelText(/Upload rotation master video for Retreat/);
    fireEvent.change(rotation, { target: { files: [new File(['film'], 'rotation.mp4', { type: 'video/mp4' })] } });
    container.querySelectorAll('input[type="file"]').forEach(input => expect(input).toBeDisabled());
    expect(rotation).toHaveAccessibleName('Upload rotation master video for Retreat');
    await act(async () => finish({ url: '/rotation.mp4' }));
    container.querySelectorAll('input[type="file"]').forEach(input => expect(input).toBeEnabled());
  });

  it.each([
    { label: uploadNames[0], filename: 'rotation.mp4', type: 'video/mp4', rotation: true, outputLabel: 'Rotation master video' },
    { label: uploadNames[1], filename: 'detail.mp4', type: 'video/mp4', rotation: false, outputLabel: 'Explore detail video' },
    { label: uploadNames[2], filename: 'poster.webp', type: 'image/webp', rotation: false, outputLabel: 'Opening poster' },
    { label: uploadNames[3], filename: 'gallery.webp', type: 'image/webp', rotation: false, outputLabel: 'Image path' },
    { label: uploadNames[4], filename: 'house.glb', type: 'model/gltf-binary', rotation: false, outputLabel: '3D house GLB' },
    { label: 'Upload 3D house GLB for Forza', filename: 'forza.glb', type: 'model/gltf-binary', rotation: false, outputLabel: '3D house GLB', builtIn: true },
  ])('preserves upload and field-update callbacks for $label', async ({ label, filename, type, rotation, outputLabel, builtIn = false }) => {
    const url = `/api/site-media/${filename}`;
    const upload = vi.fn().mockResolvedValue({ url, ...(rotation ? { detailUrl: '/detail-prepared.mp4', posterUrl: '/poster-prepared.webp' } : {}) });
    render(<Editor initial={builtIn ? { id: 'forza', fields: { name: 'Forza' } } : galleryFixture} builtIn={builtIn} upload={upload} />);
    const input = screen.getByLabelText(new RegExp(label)) as HTMLInputElement;
    const file = new File(['fixture'], filename, { type });
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => expect(screen.getByLabelText(outputLabel)).toHaveValue(url));
    expect(upload).toHaveBeenCalledTimes(1);
    expect(upload).toHaveBeenCalledWith(expect.objectContaining({ name: filename, type }), rotation);
    expect(input.value).toBe('');
    if (rotation) {
      expect(screen.getByLabelText('Explore detail video')).toHaveValue('/detail-prepared.mp4');
      expect(screen.getByLabelText('Opening poster')).toHaveValue('/poster-prepared.webp');
    }
  });
});
