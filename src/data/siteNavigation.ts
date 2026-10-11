export const siteNavigationItems = [
  { label: "Projects", href: "/projects" },
  { label: "Models", href: "/models" },
  { label: "Hospitality", href: "/hospitality" },
  { label: "Process", href: "/process" },
  { label: "Sustainability", href: "/sustainability" },
  { label: "Journal", href: "/journal" },
  { label: "About", href: "/about" },
] as const;

export function isSiteNavigationActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
