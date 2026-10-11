"use client";

import Header from "@/components/Header/Header";

/** Backwards-compatible entry point for the shared Models/Projects header. */
export default function ModelsHeader({ tone = "dark", enquireHref = "/enquiry", currentHref = "/models" }: {
  tone?: "dark" | "light";
  enquireHref?: string;
  currentHref?: string;
}) {
  return <Header tone={tone} enquiryHref={enquireHref} currentHref={currentHref} />;
}
