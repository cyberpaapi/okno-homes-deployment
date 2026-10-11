import type { ContentItem } from "@/lib/contentCollections";

export const homeVariantDefaults: ContentItem[] = [
  { id: "hero-v1", fields: {
    name: "Hero V1 · forest", template: "v1",
    openingVideo: "/assets/landing-options/forest-entry-intro-15s.mp4",
    loopVideo: "/assets/landing-options/forest-entry-ambient-loop.mp4",
    scrollVideo: "/assets/landing-options/forest-entry-scroll-seekable-900p.mp4",
    poster: "/assets/landing-options/forest-entry-start-v2.jpg",
    endImage: "/assets/landing-options/forest-entry-end-v2.jpg",
    introLastFrame: "/assets/landing-options/forest-entry-intro-last-frame.png",
    openingAlt: "A single illuminated Kioo home within dense forest at blue hour",
    endAlt: "The timber-lined interior of the Kioo home opening to the forest",
    accessibleTitle: "OKNO Modhomes",
  } },
  { id: "hero-v2", fields: {
    name: "Hero V2 · city to Forza", template: "v2",
    openingVideo: "/hero-v2/city-to-forza.mp4",
    loopVideo: "/hero-v2/forza-island-loop.mp4",
    poster: "/hero-v2/journey-poster.jpg",
    loopPoster: "/hero-v2/forza-island-poster.webp",
    openingAlt: "OKNO Modhomes - from the city to Forza",
    accessibleTitle: "OKNO Modhomes - from the city to Forza", buttonLabel: "Skip the film and view Forza",
  } },
];
