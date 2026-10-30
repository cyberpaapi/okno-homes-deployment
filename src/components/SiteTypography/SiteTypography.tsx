"use client";

import { usePathname } from 'next/navigation';
import bindings from '@/data/typographySections.json';
import { useSiteContentMap } from '@/lib/useSiteContent';
import { defaultTypographyFont, isTypographySizeField, typographyCss, typographyFonts } from '@/lib/typography';

export default function SiteTypography() {
  const pathname = usePathname();
  const values = useSiteContentMap();
  if (pathname?.startsWith('/admin')) return null;
  const sizeOverrides = Object.keys(values).filter(id => isTypographySizeField(id) && values[id] !== '').length;
  return <style data-okno-typography data-type-size-overrides={sizeOverrides} data-type-master={typographyFonts.find(font => font.value === values["typography.master-font"])?.value ?? defaultTypographyFont.value}>{typographyCss(values, bindings)}</style>;
}
