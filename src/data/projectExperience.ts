export type ProjectMedia = {
  src: string;
  alt: string;
  position?: string;
};

export type ProjectExperienceItem = {
  id: string;
  title: string;
  setting: string;
  description: string;
  coordinates: [number, number];
  image: ProjectMedia;
  backdrop: ProjectMedia;
  gallery: ProjectMedia[];
  video?: {
    src: string;
    poster: string;
  };
};

export const PROJECT_EXPERIENCE_ITEMS: ProjectExperienceItem[] = [
  {
    id: "highland-study",
    title: "Highland study",
    setting: "Project placeholder",
    description: "A quiet study of a home meeting slope, mist and a long horizon.",
    coordinates: [18.754, 73.407],
    image: {
      src: "/assets/projects/project-highlands.webp",
      alt: "Placeholder home in a misty highland landscape",
    },
    backdrop: {
      src: "/models/gaze/gallery/gaze-retreat-setting.webp",
      alt: "Soft forest atmosphere behind the highland study",
      position: "50% 48%",
    },
    gallery: [
      {
        src: "/models/gaze/gallery/gaze-exterior-three-quarter.webp",
        alt: "Placeholder exterior view for the highland gallery",
      },
      {
        src: "/models/kray/gallery/kray-mountain-community.webp",
        alt: "Placeholder landscape view for the highland gallery",
      },
      {
        src: "/models/octapod/gallery/octapod-landscape-setting.webp",
        alt: "Placeholder setting view for the highland gallery",
      },
    ],
  },
  {
    id: "desert-study",
    title: "Desert study",
    setting: "Project placeholder",
    description: "A compact shelter drawn around shade, warmth and open ground.",
    coordinates: [31.768, 35.214],
    image: {
      src: "/assets/projects/project-desert.webp",
      alt: "Placeholder compact home in a dry landscape",
    },
    backdrop: {
      src: "/models/forza/interiors/forza-exterior.webp",
      alt: "Muted architectural atmosphere behind the desert study",
    },
    gallery: [
      {
        src: "/models/tengo/gallery/tengo-exterior-pool.webp",
        alt: "Placeholder exterior view for the desert gallery",
      },
      {
        src: "/models/bespoke/journey-land-v2.webp",
        alt: "Placeholder land view for the desert gallery",
      },
      {
        src: "/models/trib/gallery/trib-exterior-front.webp",
        alt: "Placeholder facade view for the desert gallery",
      },
    ],
  },
  {
    id: "forest-study",
    title: "Forest study",
    setting: "Project placeholder",
    description: "A steep-roofed retreat held between trees, snow and warm light.",
    coordinates: [60.17, 24.938],
    image: {
      src: "/assets/projects/project-nordic.webp",
      alt: "Placeholder timber home in a snowy forest",
    },
    backdrop: {
      src: "/models/octapod/gallery/octapod-exterior-forest.webp",
      alt: "Blurred woodland atmosphere behind the forest study",
    },
    gallery: [
      {
        src: "/models/gaze/gallery/gaze-retreat-setting.webp",
        alt: "Placeholder forest setting for the forest gallery",
      },
      {
        src: "/models/trib/gallery/trib-setting.webp",
        alt: "Placeholder woodland view for the forest gallery",
      },
      {
        src: "/models/octapod/gallery/octapod-landscape-setting.webp",
        alt: "Placeholder landscape view for the forest gallery",
      },
    ],
  },
  {
    id: "coastal-study",
    title: "Coastal study",
    setting: "Project placeholder",
    description: "A low home oriented toward sea air, soft light and the waterline.",
    coordinates: [-33.924, 18.424],
    image: {
      src: "/assets/projects/project-coast.webp",
      alt: "Placeholder home beside a rocky coast",
    },
    backdrop: {
      src: "/models/kray/gallery/kray-exterior-water.webp",
      alt: "Blurred water view behind the coastal study",
    },
    gallery: [
      {
        src: "/models/kray/gallery/kray-exterior-deck.webp",
        alt: "Placeholder deck view for the coastal gallery",
      },
      {
        src: "/models/kray/gallery/kray-mountain-community.webp",
        alt: "Placeholder wider setting for the coastal gallery",
      },
      {
        src: "/models/tengo/gallery/tengo-exterior-pool.webp",
        alt: "Placeholder water-facing exterior for the coastal gallery",
      },
    ],
  },
  {
    id: "valley-study",
    title: "Valley study",
    setting: "Project placeholder",
    description: "A sheltered home opening toward a broad valley and changing weather.",
    coordinates: [46.818, 8.227],
    image: {
      src: "/models/gaze/gallery/gaze-exterior-three-quarter.webp",
      alt: "Placeholder home in a valley setting",
    },
    backdrop: {
      src: "/assets/projects/project-highlands.webp",
      alt: "Blurred highland atmosphere behind the valley study",
    },
    gallery: [
      {
        src: "/models/gaze/gallery/gaze-retreat-setting.webp",
        alt: "Placeholder retreat setting for the valley gallery",
      },
      {
        src: "/models/gaze/gallery/gaze-axonometric.webp",
        alt: "Placeholder architectural view for the valley gallery",
      },
      {
        src: "/models/bespoke/journey-original-v2.webp",
        alt: "Placeholder original-home view for the valley gallery",
      },
    ],
  },
  {
    id: "lakeside-study",
    title: "Lakeside study",
    setting: "Project placeholder",
    description: "A waterside study balancing outlook, privacy and a sheltered deck.",
    coordinates: [35.689, 139.692],
    image: {
      src: "/models/kray/gallery/kray-exterior-water.webp",
      alt: "Placeholder home beside still water",
    },
    backdrop: {
      src: "/assets/projects/project-coast.webp",
      alt: "Blurred coastal atmosphere behind the lakeside study",
    },
    gallery: [
      {
        src: "/models/kray/gallery/kray-exterior-deck.webp",
        alt: "Placeholder deck view for the lakeside gallery",
      },
      {
        src: "/models/kray/gallery/kray-mountain-community.webp",
        alt: "Placeholder community view for the lakeside gallery",
      },
      {
        src: "/models/octapod/gallery/octapod-landscape-setting.webp",
        alt: "Placeholder landscape view for the lakeside gallery",
      },
    ],
  },
  {
    id: "woodland-study",
    title: "Woodland study",
    setting: "Project placeholder",
    description: "A low-impact study threaded between existing trees and filtered light.",
    coordinates: [-41.286, 174.776],
    image: {
      src: "/models/octapod/gallery/octapod-landscape-setting.webp",
      alt: "Placeholder home held within woodland",
    },
    backdrop: {
      src: "/assets/projects/project-nordic.webp",
      alt: "Blurred forest atmosphere behind the woodland study",
    },
    gallery: [
      {
        src: "/models/octapod/gallery/octapod-exterior-forest.webp",
        alt: "Placeholder forest exterior for the woodland gallery",
      },
      {
        src: "/models/octapod/gallery/octapod-cutaway-plan.webp",
        alt: "Placeholder spatial view for the woodland gallery",
      },
      {
        src: "/models/trib/gallery/trib-setting.webp",
        alt: "Placeholder setting view for the woodland gallery",
      },
    ],
  },
];

export type ConfirmedGlobeLocation = {
  id: string;
  city: string;
  project: string;
  coordinates: [number, number];
  projectId: ProjectExperienceItem["id"];
};

export const CONFIRMED_GLOBE_LOCATIONS: ConfirmedGlobeLocation[] = [
  {
    id: "hyderabad",
    city: "Hyderabad, India",
    project: "Courtyard House 01",
    coordinates: [17.385, 78.487],
    projectId: "valley-study",
  },
  {
    id: "lonavala",
    city: "Lonavala, India",
    project: "Mehul Valley Retreats",
    coordinates: [18.754, 73.407],
    projectId: "highland-study",
  },
  {
    id: "coorg",
    city: "Coorg, India",
    project: "The Mirror House",
    coordinates: [12.424, 75.738],
    projectId: "woodland-study",
  },
  {
    id: "oslo",
    city: "Oslo, Norway",
    project: "Pine House N02",
    coordinates: [59.914, 10.752],
    projectId: "forest-study",
  },
  {
    id: "lisbon",
    city: "Lisbon, Portugal",
    project: "Atlantic Courtyard",
    coordinates: [38.722, -9.139],
    projectId: "coastal-study",
  },
  {
    id: "vancouver",
    city: "Vancouver, Canada",
    project: "Cedar Annex 04",
    coordinates: [49.283, -123.121],
    projectId: "lakeside-study",
  },
  {
    id: "austin",
    city: "Austin, USA",
    project: "Hill Country House",
    coordinates: [30.267, -97.743],
    projectId: "desert-study",
  },
  {
    id: "san-jose",
    city: "San José, Costa Rica",
    project: "Cloud Forest Cabin",
    coordinates: [9.928, -84.091],
    projectId: "forest-study",
  },
  {
    id: "cape-town",
    city: "Cape Town, South Africa",
    project: "Fynbos Coastal Home",
    coordinates: [-33.925, 18.424],
    projectId: "coastal-study",
  },
  {
    id: "melbourne",
    city: "Melbourne, Australia",
    project: "Mallee Pavilion",
    coordinates: [-37.814, 144.963],
    projectId: "desert-study",
  },
];
