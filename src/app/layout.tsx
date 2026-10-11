import Script from "next/script";
import { heroReloadBootstrap } from "@/lib/heroReloadPosition";
import type { Metadata } from "next";
import "./globals.css";
import SiteFrame from '@/components/SiteFrame';
import SiteTypography from '@/components/SiteTypography/SiteTypography';
import BrandBrowserIcon from '@/components/Brand/BrandBrowserIcon';

export const metadata: Metadata = {
  title: "OKNO Modhomes",
  description: "Homes, built differently.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body id="top">
        <Script id="hero-v1-reload-position" strategy="beforeInteractive">{heroReloadBootstrap}</Script>
        <BrandBrowserIcon />
        <SiteTypography />
        <SiteFrame>{children}</SiteFrame>
      </body>
    </html>
  );
}
