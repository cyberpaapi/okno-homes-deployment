"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const PRESERVED_MODEL_ROUTES = ["/models/signature", "/models/bespoke"];

export default function SiteTypography() {
  const pathname = usePathname();

  useEffect(() => {
    const preservesModelTypography = PRESERVED_MODEL_ROUTES.some((route) => (
      pathname === route || pathname.startsWith(`${route}/`)
    ));

    document.documentElement.dataset.siteFont = preservesModelTypography
      ? "preserve"
      : "geist";

    return () => {
      delete document.documentElement.dataset.siteFont;
    };
  }, [pathname]);

  return null;
}
