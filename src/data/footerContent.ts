export const footerGroups = [
  {
    id: "homes", heading: "Homes", links: [
      { id: "signature", label: "Signature", href: "/models/signature" },
      { id: "bespoke", label: "Bespoke", href: "/models/bespoke" },
      { id: "hospitality", label: "Hospitality", href: "/hospitality" },
    ],
  },
  {
    id: "explore", heading: "Explore", links: [
      { id: "projects", label: "Projects", href: "/projects" },
      { id: "process", label: "Process", href: "/process" },
      { id: "journal", label: "Journal", href: "/journal" },
    ],
  },
  {
    id: "okno", heading: "OKNO", links: [
      { id: "about", label: "About", href: "/about" },
      { id: "sustainability", label: "Sustainability", href: "/sustainability" },
      { id: "enquire", label: "Enquire", href: "/enquiry?intent=home" },
    ],
  },
] as const;

export const footerSocialLinks = [
  { id: "instagram", name: "Instagram", href: "https://www.instagram.com/oknomodhomes/", icon: "/assets/footer/instagram.svg" },
  { id: "youtube", name: "YouTube", href: "https://www.youtube.com/@OknoModHomes", icon: "/assets/footer/youtube.svg" },
  { id: "linkedin", name: "LinkedIn", href: "https://www.linkedin.com/company/oknomodhomes/", icon: "/assets/footer/linkedin.svg" },
  { id: "facebook", name: "Facebook", href: "https://www.facebook.com/Oknomodhomes/", icon: "/assets/footer/facebook.svg" },
] as const;

export function validFooterSocialHref(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" && Boolean(parsed.hostname) && !parsed.username && !parsed.password;
  } catch {
    return false;
  }
}
