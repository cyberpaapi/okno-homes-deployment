"use client";

import { usePathname } from "next/navigation";
import CustomCursor from "@/components/CustomCursor/CustomCursor";
import SiteFooter, { type FooterTone } from "@/components/Footer/SiteFooter";

export default function SiteFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return <>{children}</>;
  const showFooter = pathname !== "/models/signature" && !pathname?.startsWith("/models/signature/");
  const footerTone: FooterTone = pathname === "/" || pathname === "/hero-v1" || pathname === "/hero-v2" ? "home"
    : pathname?.startsWith("/enquiry") ? "enquiry"
    : pathname?.startsWith("/models/bespoke") ? "bespoke"
    : pathname?.startsWith("/sustainability") ? "sustainability"
    : pathname?.startsWith("/journal") ? "journal"
    : pathname?.startsWith("/projects") ? "projects"
    : "forest";
  return <><CustomCursor />{children}{showFooter && <SiteFooter tone={footerTone} />}</>;
}
