import { heroV2EndingDefaults } from "./heroV2Ending";
import type { ContentItem } from "@/lib/contentCollections";

export const homeVariantDefaults: ContentItem[] = [
  { id: "hero-v1", fields: {
    name: "Hero V1 · forest", template: "v1",
    openingVideo: "/assets/landing-options/forest-entry-intro-15s.mp4",
    scrollVideo: "/assets/landing-options/forest-entry-scroll-window-smooth-b6de05527e75.mp4",
    poster: "/assets/landing-options/forest-entry-start-v2.jpg",
    endImage: "/assets/landing-options/forest-entry-window-finish.jpg",
    introFirstFrame: "/assets/landing-options/forest-entry-intro-first-frame.jpg",
    introLastFrame: "/assets/landing-options/forest-entry-intro-last-frame.png",
    openingAlt: "A single illuminated Kioo home within dense forest at blue hour",
    endAlt: "The timber-lined interior of the Kioo home opening to the forest",
    accessibleTitle: "OKNO Modhomes", tagline: "Homes for rare places.",
  } },
  { id: "hero-v2", fields: {
    name: "Hero V2 · nighttime scroll", template: "v2",
    ...heroV2EndingDefaults,
    scrollVideo: "",
    poster: "/hero-v2/nighttime-first.webp",
    endImage: "/hero-v2/nighttime-last.webp",
    openingAlt: "A nighttime journey from a cave into an illuminated home",
    endAlt: "The illuminated home among trees in the original final nighttime frame",
    accessibleTitle: "OKNO Modhomes",
  } },
];
