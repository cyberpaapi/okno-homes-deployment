import { jsPDF } from 'jspdf';
import type { estimate } from '@/lib/configuratorPricing';
import { applicationGroups, registerOptions } from './registerOptions';
import type { Background } from './cabinScene';

type Sheet = {
  name: string; quote: ReturnType<typeof estimate>; preview?: string; variant?: string;
  background?: Background; light?: 'day' | 'golden';
};
type Art = { hero?: string; mark?: string; samples?: Map<string, string>; titleFont?: string };
const money = (value: number) => 'INR ' + value.toLocaleString('en-IN');

export function createSelectionPdf(input: Sheet, art: Art = {}) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true, putOnlyUsedFonts: true });
  const { name, quote, variant } = input;
  const paper = '#F8F6EF', forest = '#19372E', ink = '#192D26', muted = '#54655B', brass = '#D9CB9C';
  doc.setProperties({ title: name + ' | Material specification and estimate', author: 'OKNO Modhomes' });
  if (art.titleFont) {
    doc.addFileToVFS('Bodoni.ttf', art.titleFont);
    doc.addFont('Bodoni.ttf', 'Bodoni', 'normal');
  }
  function block(x: number, y: number, w: number, h: number, color: string) {
    doc.setFillColor(color); doc.rect(x, y, w, h, 'F');
  }
  function text(value: string, x: number, y: number, size: number, color = ink, font = 'helvetica', style = 'normal', align: 'left' | 'right' = 'left') {
    doc.setFont(font, style); doc.setFontSize(size); doc.setTextColor(color); doc.text(value, x, y, { align });
  }
  function line(y: number) { doc.setDrawColor('#CCD0C3'); doc.setLineWidth(.2); doc.line(14, y, 196, y); }
  block(0, 0, 210, 297, paper);
  block(0, 0, 210, 63, forest);
  if (art.mark) doc.addImage(art.mark, 'PNG', 14, 9.5, 28, 5.46);
  else text('OKNO', 14, 15, 17, paper, 'helvetica', 'bold');
  text(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }), 196, 14.5, 9, paper, 'helvetica', 'normal', 'right');
  text('MATERIAL SPECIFICATION', 14, 28, 8.5, brass, 'helvetica', 'bold');
  const titleFont = art.titleFont ? 'Bodoni' : 'times';
  doc.setFont(titleFont, 'normal');
  let size = 34;
  doc.setFontSize(size);
  let title = doc.splitTextToSize(name, 181) as string[];
  while (title.length > 2 && size > 18) {
    size -= 2;
    doc.setFontSize(size);
    title = doc.splitTextToSize(name, 181);
  }
  if (title.length > 2) {
    let last = title[1].trimEnd();
    while (last && doc.getTextWidth(last + '...') > 181) last = last.slice(0, -1);
    title = [title[0], last.trimEnd() + '...'];
  }
  title.forEach((row, i) => text(row, 14, (title.length === 1 ? 47 : 39) + 11 * i, size, paper, titleFont));
  if (art.hero) doc.addImage(art.hero, 'JPEG', 14, 55, 182, 82.73);
  else {
    block(14, 55, 182, 82.73, '#DEE4DB');
    text('Exterior preview unavailable', 23, 101, 14, muted, 'times', 'italic');
  }
  const plan = variant && ({ '2-bhk': 'Two-bedroom', '3-bhk': 'Three-bedroom', '1-bhk': 'One-bedroom', studio: 'Studio', signature: 'Signature' } as Record<string,string>)[variant];
  text('Exterior study' + (plan ? '   /   ' + plan + ' plan' : ''), 14, 143.3, 8, muted);
  text('OKNO SIGNATURE', 196, 143.3, 8, muted, 'helvetica', 'bold', 'right');
  text('Finish schedule', 14, 157, 21, forest, 'times');
  text('ADJUSTMENT', 196, 157, 8, muted, 'helvetica', 'bold', 'right');
  quote.lines.forEach((item, i) => {
    const y = 163 + i * 15.6;
    line(y);
    const sample = item.finish && art.samples?.get(item.finish.id);
    if (sample) doc.addImage(sample, 'JPEG', 14, y + 2.8, 13, 10);
    else { block(14, y + 2.8, 13, 10, '#E6E6DB'); text('—', 18.5, y + 9.2, 9, muted); }
    const label = applicationGroups.find(group => group.id === item.surface)!.label;
    text(label.toUpperCase(), 31, y + 5.8, 7.7, muted);
    const finish = !item.available ? 'Surface unavailable' : item.finish?.name ?? 'Original model finish';
    text(finish, 31, y + 11.6, 11.8, ink, 'helvetica', 'bold');
    const amount = !item.available ? '—' : item.amount === null ? 'On request' : item.amount === 0 ? 'Included' : '+' + money(item.amount);
    text(amount, 196, y + 9.6, 10, ink, 'helvetica', 'normal', 'right');
  });
  block(14, 245, 182, 33, forest);
  text('BASE HOUSE', 19, 253, 7.5, brass);
  text(quote.base === null ? 'On request' : money(quote.base), 19, 263, 12.5, paper);
  text('PRICED FINISHES', 73, 253, 7.5, brass);
  text(money(quote.extras), 73, 263, 12.5, paper);
  text('ESTIMATED TOTAL', 191, 253, 7.5, brass, 'helvetica', 'normal', 'right');
  text(quote.total === null ? 'On request' : money(quote.total), 191, 264, 17, paper, 'times', 'normal', 'right');
  text(quote.total === null ? 'OKNO will confirm the outstanding prices.' : 'Indicative estimate for this configuration.', 19, 273, 8, paper);
  text('Confirm physical samples, scope and final pricing with OKNO.', 14, 288, 8.5, muted);
  return doc;
}

async function image(src: string) {
  const img = new Image(); img.src = src; await img.decode(); return img;
}
function canvas(width: number, height: number) {
  const surface = document.createElement('canvas'); surface.width = width; surface.height = height;
  const ctx = surface.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');
  return { surface, ctx };
}
function coverImage(ctx: CanvasRenderingContext2D, img: HTMLImageElement, width: number, height: number) {
  const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
  const w = img.naturalWidth * scale, h = img.naturalHeight * scale;
  ctx.drawImage(img, (width - w) / 2, (height - h) / 2, w, h);
}
async function exterior(input: Sheet) {
  if (!input.preview) return;
  const { surface, ctx } = canvas(1540, 700);
  ctx.fillStyle = input.light === 'golden' ? '#d3b698' : '#d3dee3'; ctx.fillRect(0, 0, 1540, 700);
  const setting = input.background ?? 'meadow';
  const backdrop = setting === 'meadow' ? 'meadow-' + input.light : setting === 'full-island' ? 'sky-' + input.light : 'background-' + setting;
  const sky = await image('/textures/' + backdrop + '.jpg').catch(() => null);
  if (sky) coverImage(ctx, sky, 1540, 700);
  ctx.drawImage(await image(input.preview), 0, 0, 1540, 700);
  return surface.toDataURL('image/jpeg', .91);
}

export async function downloadSelectionPdf(input: Sheet) {
  const samples = new Map<string,string>();
  const [hero, mark, titleFont] = await Promise.all([
    exterior(input),
    image('/assets/projects/brand/okno-white.svg').then(img => {
      const { surface, ctx } = canvas(467, 91); ctx.drawImage(img, 0, 0, 467, 91); return surface.toDataURL('image/png');
    }).catch(() => undefined),
    fetch('/fonts/bodoni-moda.ttf').then(async response => {
      if (!response.ok) return;
      const data = new Uint8Array(await response.arrayBuffer());
      return btoa(Array.from(data, byte => String.fromCharCode(byte)).join(''));
    }).catch(() => undefined),
    ...input.quote.lines.map(async line => {
      if (!line.finish) return;
      const option = registerOptions.find(item => item.id === line.finish!.id)!;
      const img = await image(option.image).catch(() => null);
      if (img) { const { surface, ctx } = canvas(156,120); coverImage(ctx,img,156,120); samples.set(option.id,surface.toDataURL('image/jpeg',.9)); }
    }),
  ]);
  const doc = createSelectionPdf(input, { hero, mark, titleFont, samples });
  doc.save('OKNO-' + (input.name.replace(/[^a-z0-9-]+/gi, '-').slice(0,60) || 'house') + '-materials.pdf');
}
