import { useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ContentItem } from '@/lib/contentCollections';
import SignatureModelPanel from './SignatureModelPanel';

function Editor({ initial, upload, others = [{ id: 'tengo', fields: { name: 'Tengo' } }] }: { initial: ContentItem; others?: ContentItem[]; upload: (file: File) => Promise<{ url: string }> }) {
  const [model, setModel] = useState(initial);
  return <SignatureModelPanel model={model} roster={[model, ...others]} plans={[]} builtIn={false} disabled={false} onModelChange={setModel} onModelIdChange={() => true} onRemoveModel={() => {}} onMoveModel={() => {}} canMoveUp={false} canMoveDown={false} onPlansChange={() => {}} onUpload={upload} />;
}

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
});
