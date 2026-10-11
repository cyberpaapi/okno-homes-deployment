"use client";

import { useEffect } from "react";
import { useSiteContent } from "@/lib/useSiteContent";

/** Keep the browser icon in step with the published Global Brand selection. */
export default function BrandBrowserIcon() {
  const icon = useSiteContent("brand.logo.icon", "/favicon.ico");

  useEffect(() => {
    let link = document.querySelector<HTMLLinkElement>('link[data-okno-brand-icon="true"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      link.dataset.oknoBrandIcon = "true";
      document.head.appendChild(link);
    }
    link.href = icon;
  }, [icon]);

  return null;
}
