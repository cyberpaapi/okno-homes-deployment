import { jsPDF } from 'jspdf';
import type { MaterialApplicationId } from '@/data/configurator';
import { applicationGroups, registerOptions } from './registerOptions';

export function createSelectionPdf({ name, selected, counts, preview, variant }: {
  name: string; selected: Partial<Record<MaterialApplicationId, string>>;
  counts: Record<string, number>; preview?: string; variant?: string;
}) {
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  pdf.setProperties({ title: `${name} - OKNO material selections`, author: 'OKNO' });
  pdf.setTextColor(32, 58, 42);
  pdf.setFontSize(26); pdf.text('OKNO', 18, 24);
  pdf.setFontSize(17);
  const title = pdf.splitTextToSize(`${name.slice(0, 80)} - material selections`, 174);
  pdf.text(title, 18, 36);
  let y = 41 + (title.length - 1) * 7;
  pdf.setFontSize(9);
  pdf.text(`Prepared ${new Date().toLocaleDateString('en-GB')}`, 18, y);
  y += 7;
  if (variant) { const lines = pdf.splitTextToSize(`Requested plan: ${variant.slice(0, 120)}. The preview shows the house family.`, 174); pdf.text(lines, 18, y); y += lines.length * 4 + 4; }
  if (preview) {
    const image = pdf.getImageProperties(preview);
    const height = Math.min(76, 174 * image.height / image.width);
    const width = height * image.width / image.height;
    pdf.addImage(preview, 'PNG', (210 - width) / 2, y, width, height);
    y += height + 10;
  }
  for (const group of applicationGroups) {
    const option = registerOptions.find(item => item.id === selected[group.id] && item.approvedApplications.includes(group.id));
    const value = !counts[group.id] ? 'Not available in this model' : option ? `${option.registerNumber} / ${option.name}` : 'Original model finish - not specified';
    pdf.setDrawColor(207, 214, 204); pdf.line(18, y, 192, y);
    pdf.setFontSize(10); pdf.text(group.label, 18, y + 7);
    pdf.setFont('helvetica', 'bold'); pdf.text(value, 85, y + 7); pdf.setFont('helvetica', 'normal');
    y += 18;
  }
  pdf.setFontSize(9);
  pdf.text(pdf.splitTextToSize('Finishes follow Cladding_Materials_Register.pdf, application matrix (page 9). Screen colours and textures are indicative. Confirm physical samples and house-specific availability with OKNO. This is a selection summary, not a quotation.', 174), 18, y + 8);
  return pdf;
}

export function downloadSelectionPdf(input: Parameters<typeof createSelectionPdf>[0]) {
  createSelectionPdf(input).save(`OKNO-${input.name.replace(/[^a-z0-9-]+/gi, '-').slice(0, 60) || 'house'}-materials.pdf`);
}
