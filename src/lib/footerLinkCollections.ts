import { footerGroups } from "@/data/footerContent";
import type { ContentItem } from "@/lib/contentCollections";

export function footerLinkDefaults(values: Record<string, string> = {}): Record<string, ContentItem[]> {
  return Object.fromEntries(footerGroups.map(group => [
    `footer.links.${group.id}`,
    group.links.map(link => ({ id: link.id, fields: {
      label: values[`footer.${group.id}.${link.id}.label`] ?? link.label,
      href: values[`footer.${group.id}.${link.id}.href`] ?? link.href,
    } })),
  ]));
}
