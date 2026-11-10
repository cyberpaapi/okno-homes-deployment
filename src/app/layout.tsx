import Script from "next/script";
import { heroReloadBootstrap } from "@/lib/heroReloadPosition";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import SiteFrame from '@/components/SiteFrame';
import SiteTypography from '@/components/SiteTypography/SiteTypography';
import FontPreloads from '@/components/SiteTypography/FontPreloads';
import BrandBrowserIcon from '@/components/Brand/BrandBrowserIcon';

export const metadata: Metadata = {
  title: "OKNO Modhomes · Homes for rare places",
  description: "Architect-designed homes and hospitality estates, made off-site and delivered with certainty.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#101810" };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-site-typography suppressHydrationWarning>
      <head>
        <FontPreloads />
      </head>
      <body id="top">
        <Script id="hero-v1-reload-position" strategy="beforeInteractive">{heroReloadBootstrap}</Script>
        <BrandBrowserIcon />
        <SiteTypography />
        <SiteFrame>{children}</SiteFrame>
      </body>
    </html>
  );
}
