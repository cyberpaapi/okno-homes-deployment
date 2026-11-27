export type SampleTestimonial = {
  id: string;
  quote: string;
  name: string;
  location: readonly [string, string];
  image: { src: string; alt: string };
  status: "sample";
};

// Fictional preview copy, never customer evidence. Replace with approved customer
// quotes and consented attribution before removing the page's sample disclosure/noindex.
export const testimonials: readonly SampleTestimonial[] = [
  {
    id: "weekend-retreat",
    quote: "A peaceful retreat, with room to slow down.",
    name: "Ananya Deshmukh",
    location: ["Mulshi", "Pune, Maharashtra"],
    image: { src: "/assets/projects/real-v1/forrest-01.webp", alt: "Illustrative OKNO project photo: Forrest — glazed pavilion, curved garden path and reflecting pool at sunset" },
    status: "sample",
  },
  {
    id: "family-space",
    quote: "Space for family, without more than we need.",
    name: "Rohan Mehta",
    location: ["Karjat", "Raigad, Maharashtra"],
    image: { src: "/assets/projects/real-v1/kioo-01.webp", alt: "Illustrative OKNO project photo: Kioo — mirrored cabin raised among dense forest trees" },
    status: "sample",
  },
  {
    id: "site-planning",
    quote: "Every decision began with understanding our land.",
    name: "Kavya Rao",
    location: ["Shankarpally", "Rangareddy, Telangana"],
    image: { src: "/assets/projects/real-v1/kray-sangareddy-01.webp", alt: "Illustrative OKNO project photo: Kray Sangareddy — timber-clad cabin with a deep sloping roof" },
    status: "sample",
  },
  {
    id: "quiet-workspace",
    quote: "A quiet workspace that welcomes weekend guests.",
    name: "Arjun Nair",
    location: ["Sakleshpur", "Hassan, Karnataka"],
    image: { src: "/assets/projects/real-v1/lakewood-01.webp", alt: "Illustrative OKNO project photo: Lakewood Villa — angular glazed villa illuminated at dusk" },
    status: "sample",
  },
  {
    id: "guest-stay",
    quote: "A sheltered spot for tea made all the difference.",
    name: "Ishita Kulkarni",
    location: ["Alibaug", "Raigad, Maharashtra"],
    image: { src: "/assets/projects/real-v1/octapod-layana-01.webp", alt: "Illustrative OKNO project photo: Octapod Layana — octagonal cabins arranged around a swimming pool" },
    status: "sample",
  },
  {
    id: "bespoke-home",
    quote: "A thoughtful home shaped around the way we live.",
    name: "Vikram Reddy",
    location: ["Ananthagiri Hills", "Vikarabad, Telangana"],
    image: { src: "/assets/projects/real-v1/rasa-vikarabad-01.webp", alt: "Illustrative OKNO project photo: Rasa Vikarabad — timber-clad cabins framing a central swimming pool" },
    status: "sample",
  },
];
