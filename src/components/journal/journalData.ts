export type JournalEntryKind = "Press" | "Project record" | "Project note";

export interface JournalEntry {
  id: string;
  kind: JournalEntryKind;
  source: string;
  byline?: string;
  date: string;
  title: string;
  summary: string;
  image: string;
  imageAlt: string;
  credit: string;
  href: string;
  external?: boolean;
  logo?: string;
}

export const publicationLogos: Record<string, string> = {
  "Architectural Digest India": "/assets/journal/source-logos/architectural-digest.png",
  "New Atlas": "/assets/journal/source-logos/new-atlas.png",
  Homecrux: "/assets/journal/source-logos/homecrux.png",
  "World Architecture Community": "/assets/journal/source-logos/world-architecture-community.png",
  ArchDaily: "/assets/journal/source-logos/archdaily.svg",
};

export const pressEntries: JournalEntry[] = [
  {
    id: "press-ad-india",
    kind: "Press",
    source: "Architectural Digest India",
    byline: "Alisha Lad",
    date: "10 Jun 2024",
    title: "AD Small Spaces: This 300-square-foot holiday home in Karnataka is one with nature",
    summary: "Architectural Digest India visits OKNO's 300 sq ft mirrored holiday home in Chikkamagaluru.",
    image: "/assets/projects/real-v1/kioo-01.webp",
    imageAlt: "Kioo mirrored cabin raised among dense forest trees",
    credit: "Photography · Inclined Studio",
    href: "https://www.architecturaldigest.in/story/ad-small-spaces-this-300-square-foot-holiday-home-in-karnataka-spotlights-sustainability-by-okno-modhomes/",
    external: true,
  },
  {
    id: "press-new-atlas",
    kind: "Press",
    source: "New Atlas",
    byline: "Adam Williams",
    date: "26 Jun 2024",
    title: "Mirrored tiny house slides out its bed so owners can sleep under the stars",
    summary: "New Atlas focuses on the compact interior and the bedroom's opening to the landscape.",
    image: "/assets/projects/real-v1/kioo-05.webp",
    imageAlt: "Kioo timber-lined bedroom at dusk",
    credit: "Photography · Inclined Studio",
    href: "https://newatlas.com/tiny-houses/reflections-okno-modhomes/",
    external: true,
  },
  {
    id: "press-homecrux",
    kind: "Press",
    source: "Homecrux",
    byline: "Pragati Shandil",
    date: "3 Jul 2024",
    title: "Reflections is a Modular Holiday Home in India That Blurs Boundaries of Indoor and Outdoor",
    summary: "Homecrux looks at the relationship between the mirrored exterior, terrace and forest setting.",
    image: "/assets/projects/real-v1/kioo-04.webp",
    imageAlt: "Kioo outdoor terrace overlooking the forest",
    credit: "Photography · Inclined Studio",
    href: "https://www.homecrux.com/reflections-holiday-home-by-okno-modhomes/262584/",
    external: true,
  },
  {
    id: "press-wac",
    kind: "Press",
    source: "World Architecture Community",
    date: "14 Jun 2024",
    title: "Okno Modhomes Completes A Serene Sanctuary With A Mirrored Façade In Karnataka",
    summary: "A project report on the mirrored façade and the holiday home's forest context.",
    image: "/assets/projects/real-v1/kioo-10.webp",
    imageAlt: "Misty landscape around the Kioo forest cabin",
    credit: "Photography · Inclined Studio",
    href: "https://worldarchitecture.org/architecture-news/fhzpf/okno-modhomes-completes-a-serene-sanctuary-with-a-mirrored-facade-in-karnataka",
    external: true,
  },
  {
    id: "press-archdaily",
    kind: "Project record",
    source: "ArchDaily",
    date: "16 Jun 2024",
    title: "Reflections Holiday Home / OKNO MODHOMES",
    summary: "The published project record for Reflections Holiday Home in Karnataka.",
    image: "/assets/projects/real-v1/kioo-03.webp",
    imageAlt: "Aerial view of the Kioo mirrored cabin and deck",
    credit: "Photography · Inclined Studio",
    href: "https://www.archdaily.com/1017679/reflections-holiday-home-okno-modhomes",
    external: true,
  },
];

export const projectNotes: JournalEntry[] = [
  {
    id: "note-kioo",
    kind: "Project note",
    source: "OKNO project archive",
    date: "Kioo",
    title: "Kioo — the 300 sq ft mirror-house model",
    summary: "A compact contemporary retreat designed to reflect its surroundings.",
    image: "/assets/projects/real-v1/kioo-09.webp",
    imageAlt: "Warm-lit Kioo bedroom opening onto the terrace at dusk",
    credit: "Photography · Inclined Studio",
    href: "/projects/kioo",
  },
  {
    id: "note-kray",
    kind: "Project note",
    source: "OKNO project archive",
    date: "Kray",
    title: "Kray — two compact layouts, 306 and 550 sq ft",
    summary: "A mountain-house-inspired compact home in studio and one-bedroom layouts.",
    image: "/assets/projects/real-v1/kray-sangareddy-01.webp",
    imageAlt: "Kray Sangareddy timber-clad cabin with a deep sloping roof",
    credit: "OKNO project archive",
    href: "/projects/kray-sangareddy",
  },
  {
    id: "note-octapod",
    kind: "Project note",
    source: "OKNO project archive",
    date: "Octapod",
    title: "Octapod — a 300 sq ft resort studio shaped by an octagonal plan",
    summary: "An octagon-inspired studio arranged as a compact, nature-facing retreat.",
    image: "/assets/projects/real-v1/octapod-layana-01.webp",
    imageAlt: "Octapod Layana cabins arranged around a swimming pool",
    credit: "OKNO project archive",
    href: "/projects/octapod-layana",
  },
  {
    id: "note-forrest",
    kind: "Project note",
    source: "OKNO project archive",
    date: "Forrest",
    title: "Forrest — a photographic project file",
    summary: "A field record of the home, its interiors and its surrounding landscape.",
    image: "/assets/projects/real-v1/forrest-01.webp",
    imageAlt: "Forrest project exterior in its landscape",
    credit: "OKNO project archive",
    href: "/projects/forrest",
  },
  {
    id: "note-rasa",
    kind: "Project note",
    source: "OKNO project archive",
    date: "Rasa Vikarabad",
    title: "Rasa Vikarabad — cabins around a central pool",
    summary: "A photographic record of the cabins, shared water and planted setting.",
    image: "/assets/projects/real-v1/rasa-vikarabad-01.webp",
    imageAlt: "Rasa Vikarabad cabins arranged around a central swimming pool",
    credit: "OKNO project archive",
    href: "/projects/rasa-vikarabad",
  },
];

export const journalEntries = [...pressEntries, ...projectNotes];
