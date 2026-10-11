"use client";

import Header from "@/components/Header/Header";

export default function ProjectsHeader({ projectId }: { projectId?: string }) {
  return <Header currentHref="/projects" enquiryHref={projectId ? `/enquiry?project=${projectId}` : "/enquiry"} />;
}
