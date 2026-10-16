"use client";

import { useMemo } from 'react';
import Header from "../Header/Header";
import { MagneticLink } from "../projects/21st/Magnetic";
import { SilkBackground } from "../projects/21st/SilkBackground";
import { HospitalityBento } from "./21st/HospitalityBento";
import { HospitalityGallery } from "./21st/HospitalityGallery";
import { HospitalityTimeline, type TimelineStep } from "./21st/HospitalityTimeline";
import { TextBlockAnimation } from "./21st/TextBlockAnimation";
import { HospitalityIntro } from "./HospitalityIntro";
import { HospitalityTextLens } from "./HospitalityTextLens";
import styles from "./HospitalityExperience.module.css";
import { atlasProjects, type AtlasProject } from '@/data/projectAtlas';
import { initialHospitalitySelections, resolveHospitalitySelections } from '@/data/hospitalitySelectedWork';
import { useProjectsContent } from '@/lib/useProjectContent';
import { useSiteCollection, useSiteContent } from '@/lib/useSiteContent';
import { localDestination } from '@/lib/localDestination';
import type { ContentItem } from '@/lib/contentCollections';

const enquiryHref = "/enquiry?intent=hospitality";

const journey: readonly TimelineStep[] = [
  ["01", "Private consultation", "Ambition, residence count, operating model and investment range."],
  ["02", "Site study", "Access, topography, climate and the guest arrival sequence."],
  ["03", "Design curation", "Residence mix, interiors and shared pavilions."],
  ["04", "Craftsmanship", "Precision production against the approved programme."],
  ["05", "Delivery", "Sequenced logistics shaped around terrain and access."],
  ["06", "Installation", "Placement, connection, testing and completion."],
  ["07", "Opening", "Handover into guest operations and continuing care."],
];

export default function HospitalityExperience({ initialProjects = atlasProjects, initialSelections = initialHospitalitySelections }: { initialProjects?: AtlasProject[]; initialSelections?: ContentItem[] }) {
  const projects = useProjectsContent(initialProjects);
  const selections = useSiteCollection('hospitality.selectedWork', initialSelections);
  const selectedWork = useMemo(() => resolveHospitalitySelections(selections, projects), [selections, projects]);
  const selectedHeading = useSiteContent('hospitality.selected.heading', 'Selected work.');
  const closingHeading = useSiteContent('hospitality.closing.heading', 'Begin a hospitality conversation.');
  const closingAction = useSiteContent('hospitality.closing.action', 'Hospitality enquiry');
  const closingHref = useSiteContent('hospitality.closing.action-href', enquiryHref);
  return (
    <main className={styles.page} data-route="hospitality">
      <Header variant="immersive" enquiryHref={enquiryHref} />

      <div className={styles.opening}>
        <SilkBackground className={styles.openingCanvas} maxPixels={620_000} fps={24} interactive={false} />
        <HospitalityIntro enquiryHref={enquiryHref} />

        <section className={styles.proof} data-type-section="hospitality.proof" aria-label="Hospitality estate capabilities" data-header-tone="dark">
          <HospitalityBento />
        </section>
      </div>

      <div className={styles.atmosphere}>
        <SilkBackground className={styles.atmosphereCanvas} maxPixels={520_000} fps={18} interactive={false} />

        {selectedWork.length > 0 && <section id="projects" data-type-section="hospitality.projects" className={styles.projects} aria-labelledby="projects-title" data-header-tone="dark">
          <h2 id="projects-title" className={styles.srOnly} data-type-field={"hospitality.selected.heading"}>{selectedHeading}</h2>
          <TextBlockAnimation blockColor="#b9cbb8" className={styles.blockHeading}>
            <h2 aria-hidden="true" data-type-field={"hospitality.selected.heading"}><HospitalityTextLens text={selectedHeading} /></h2>
          </TextBlockAnimation>
          <HospitalityGallery projects={selectedWork} />
        </section>}

        <HospitalityTimeline steps={journey} />

        <section className={styles.enquire} data-type-section="hospitality.enquiry" aria-labelledby="enquire-title" data-header-tone="dark">
          <h2 id="enquire-title" className={styles.srOnly} data-type-field={"hospitality.closing.heading"}>{closingHeading}</h2>
          <TextBlockAnimation blockColor="#b9cbb8" duration={0.42} className={styles.enquireTitle}>
            <h2 aria-hidden="true" data-type-field={"hospitality.closing.heading"}><HospitalityTextLens text={closingHeading} /></h2>
          </TextBlockAnimation>
          <MagneticLink
            href={localDestination(closingHref, enquiryHref)}
            data-magnetic
            onClick={(event) => {
              if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
              // This link sits after the pinned timeline; a client transition can stall here.
              event.preventDefault();
              window.location.assign(event.currentTarget.href);
            }}
          >
            {closingAction} <span aria-hidden="true">↗</span>
          </MagneticLink>
        </section>
      </div>
    </main>
  );
}
