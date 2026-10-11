export type ModelCategory = "home" | "office" | "studio-resort";

export type VerificationStatus = "verified" | "needs-company-confirmation";

export type ModelPrice = {
  display: string;
  amountInr?: number;
  sourceDisplay: string;
  status: VerificationStatus;
};

export type ModelVariant = {
  name: string;
  areaSqFt: number;
  areaDisplay?: string;
  spaces: string[];
  price: ModelPrice;
};

export type OknoModel = {
  number: number;
  name: string;
  slug: string;
  category: ModelCategory;
  description: string;
  variants: ModelVariant[];
  sourceUrl: string;
};

/**
 * Canonical public catalogue captured from the client-rendered OKNO website on
 * 2026-08-17. Keep source formatting in `sourceDisplay` when the existing CMS
 * value is malformed; do not publish a normalized interpretation until OKNO
 * confirms it.
 */
export const oknoModels: OknoModel[] = [
  {
    number: 1,
    name: "Trib",
    slug: "trib",
    category: "studio-resort",
    description:
      "An A-frame vacation home intended for small families or friends looking to step away from busy city life.",
    variants: [
      {
        name: "Trib Studio",
        areaSqFt: 436,
        spaces: ["1 bed", "1 bath", "1 kitchenette", "Smart home"],
        price: {
          display: "₹21.80 lakh",
          amountInr: 2_180_000,
          sourceDisplay: "21,80,000",
          status: "verified",
        },
      },
    ],
    sourceUrl: "https://www.oknomodhomes.com/models/trib",
  },
  {
    number: 2,
    name: "Kioo",
    slug: "kioo",
    category: "studio-resort",
    description:
      "A mirror-house concept designed to reflect its surroundings while providing a compact contemporary retreat.",
    variants: [
      {
        name: "Studio",
        areaSqFt: 300,
        spaces: ["1 bed", "1 bath", "1 kitchenette", "Smart home"],
        price: {
          display: "₹18 lakh",
          amountInr: 1_800_000,
          sourceDisplay: "18 L",
          status: "verified",
        },
      },
    ],
    sourceUrl: "https://www.oknomodhomes.com/models/kioo",
  },
  {
    number: 3,
    name: "Octapod",
    slug: "octapod",
    category: "studio-resort",
    description:
      "An octagon-inspired resort studio that combines geometric form with a compact nature-facing retreat.",
    variants: [
      {
        name: "Studio",
        areaSqFt: 300,
        spaces: ["1 bed", "1 bath", "1 kitchenette", "Smart home"],
        price: {
          display: "₹18 lakh",
          amountInr: 1_800_000,
          sourceDisplay: "18 L",
          status: "verified",
        },
      },
    ],
    sourceUrl: "https://www.oknomodhomes.com/models/octapod",
  },
  {
    number: 4,
    name: "Kray",
    slug: "kray",
    category: "home",
    description:
      "A mountain-house-inspired compact home designed as a small-family retreat from the city.",
    variants: [
      {
        name: "Kray Studio",
        areaSqFt: 306,
        spaces: ["1 bed", "1 bath", "1 kitchenette"],
        price: {
          display: "₹18 lakh",
          amountInr: 1_800_000,
          sourceDisplay: "18 L",
          status: "verified",
        },
      },
      {
        name: "Kray 1 BHK",
        areaSqFt: 550,
        spaces: ["1 bed", "1 bath", "1 kitchen"],
        price: {
          display: "₹27.50 lakh",
          amountInr: 2_750_000,
          sourceDisplay: "2750000",
          status: "verified",
        },
      },
    ],
    sourceUrl: "https://www.oknomodhomes.com/models/kray",
  },
  {
    number: 5,
    name: "Forza",
    slug: "forza",
    category: "home",
    description:
      "A simple gabled home that connects indoor living with its surrounding landscape through a glazed front elevation.",
    variants: [
      {
        name: "Studio",
        areaSqFt: 376,
        spaces: ["1 bed", "1 bath", "1 kitchenette", "Smart home"],
        price: {
          display: "₹18.50 lakh",
          amountInr: 1_850_000,
          sourceDisplay: "18.5L",
          status: "verified",
        },
      },
      {
        name: "1 BHK",
        areaSqFt: 502,
        spaces: ["1 bed", "1 bath", "Smart home", "1 living room"],
        price: {
          display: "₹25.10 lakh",
          amountInr: 2_510_000,
          sourceDisplay: "25,10,000",
          status: "verified",
        },
      },
    ],
    sourceUrl: "https://www.oknomodhomes.com/models/forza",
  },
  {
    number: 6,
    name: "Tish",
    slug: "tish",
    category: "home",
    description:
      "A Nordic grass-roof-cottage-inspired home intended for gatherings and long evenings with family and friends.",
    variants: [
      {
        name: "2 BHK",
        areaSqFt: 1_018,
        spaces: [
          "2 beds",
          "2 baths",
          "1 kitchen",
          "Smart home",
          "1 living room",
          "1 deck",
        ],
        price: {
          display: "₹50.90 lakh",
          amountInr: 5_090_000,
          sourceDisplay: "50,90000",
          status: "needs-company-confirmation",
        },
      },
      {
        name: "3 BHK",
        areaSqFt: 1_339,
        spaces: ["1 kitchen", "Smart home"],
        price: {
          display: "₹66.95 lakh",
          amountInr: 6_695_000,
          sourceDisplay: "66,95000",
          status: "needs-company-confirmation",
        },
      },
    ],
    sourceUrl: "https://www.oknomodhomes.com/models/tishx",
  },
  {
    number: 7,
    name: "Orgo",
    slug: "orgo",
    category: "home",
    description:
      "A large-format home offered in two- and four-bedroom configurations.",
    variants: [
      {
        name: "2 BHK",
        areaSqFt: 1_310,
        spaces: ["2 beds", "2 baths", "1 kitchen", "Smart home"],
        price: {
          display: "₹65.50 lakh",
          amountInr: 6_550_000,
          sourceDisplay: "65,50,000",
          status: "verified",
        },
      },
      {
        name: "4 BHK",
        areaSqFt: 1_979,
        spaces: ["1 kitchen", "Smart home", "1 living room", "1 deck"],
        price: {
          display: "₹98.95 lakh",
          amountInr: 9_895_000,
          sourceDisplay: "98,95,000",
          status: "verified",
        },
      },
    ],
    sourceUrl: "https://www.oknomodhomes.com/models/orgo",
  },
  {
    number: 8,
    name: "Tengo",
    slug: "tengo",
    category: "home",
    description:
      "An expansive home designed around generous living space and a lower-impact modular construction approach.",
    variants: [
      {
        name: "2 BHK",
        areaSqFt: 1_426,
        spaces: [
          "2 beds",
          "2 baths",
          "1 kitchen",
          "Smart home",
          "1 living room",
          "1 deck",
        ],
        price: {
          display: "₹71.30 lakh",
          amountInr: 7_130_000,
          sourceDisplay: "71,30,000",
          status: "verified",
        },
      },
      {
        name: "3 BHK",
        areaSqFt: 1_686,
        spaces: ["Smart home", "1 living room", "1 deck"],
        price: {
          display: "₹84.30 lakh",
          amountInr: 8_430_000,
          sourceDisplay: "84,30,000",
          status: "verified",
        },
      },
    ],
    sourceUrl: "https://www.oknomodhomes.com/models/tengo",
  },
  {
    number: 9,
    name: "Caddy",
    slug: "caddy",
    category: "office",
    description:
      "A compact office arranged for focused work, collaboration and natural daylight.",
    variants: [
      {
        name: "Caddy",
        areaSqFt: 354,
        spaces: [
          "MD cabin",
          "Work station",
          "Conference room",
          "Powder room",
          "Deck",
          "Smart office",
        ],
        price: {
          display: "₹18 lakh",
          amountInr: 1_800_000,
          sourceDisplay: "18 Lakhs",
          status: "verified",
        },
      },
    ],
    sourceUrl: "https://www.oknomodhomes.com/models/caddy",
  },
  {
    number: 10,
    name: "Kasten",
    slug: "kasten",
    category: "office",
    description:
      "A compact office that prioritizes space efficiency, natural light and a practical working layout.",
    variants: [
      {
        name: "Kasten",
        areaSqFt: 360,
        spaces: [
          "MD cabin",
          "Conference room",
          "Pantry room",
          "Powder room",
          "Smart office",
        ],
        price: {
          display: "₹18 lakh",
          amountInr: 1_800_000,
          sourceDisplay: "18 Lakhs",
          status: "verified",
        },
      },
    ],
    sourceUrl: "https://www.oknomodhomes.com/models/kasten",
  },
  {
    number: 11,
    name: "Bosca",
    slug: "bosca",
    category: "office",
    description:
      "A larger office format combining private cabins, shared meeting space and a reception area.",
    variants: [
      {
        name: "Bosca",
        areaSqFt: 480,
        spaces: [
          "2 MD cabins",
          "Reception",
          "Conference room",
          "Pantry room",
          "Powder room",
          "Deck",
          "Smart office",
        ],
        price: {
          display: "₹24 lakh",
          amountInr: 2_400_000,
          sourceDisplay: "24 L",
          status: "verified",
        },
      },
    ],
    sourceUrl: "https://www.oknomodhomes.com/models/bosca",
  },
];

/**
 * Gaze is an approved working-name prototype backed by the client render set,
 * but it is not present in the public catalogue captured above. Keep its
 * commercial fields explicit rather than inventing an area or price.
 */
export const gazePrototype: OknoModel = {
  number: 12,
  name: "Gaze",
  slug: "gaze",
  category: "studio-resort",
  description:
    "A compact timber retreat shaped around a vaulted sleeping room and a full-height glazed gable.",
  variants: [
    {
      name: "Studio retreat",
      areaSqFt: 0,
      areaDisplay: "Area on request",
      spaces: [
        "Vaulted sleeping suite",
        "Full-height glazed gable",
        "Timber-clad envelope",
        "Private retreat format",
      ],
      price: {
        display: "Price on request",
        sourceDisplay: "Working prototype — company confirmation required",
        status: "needs-company-confirmation",
      },
    },
  ],
  sourceUrl: "",
};

export const forza = oknoModels.find((model) => model.slug === "forza")!;
