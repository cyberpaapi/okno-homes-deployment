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
    quote: "We wanted somewhere to leave the week behind. The wide windows and a simple, open living space were what drew us in. There’s room to sit together, cook slowly and spend more of the day outside.",
    name: "Ananya Deshmukh",
    location: ["Mulshi", "Pune, Maharashtra"],
    image: { src: "/assets/projects/real-v1/forrest-01.webp", alt: "Illustrative OKNO project photo: Forrest — glazed pavilion, curved garden path and reflecting pool at sunset" },
    status: "sample",
  },
  {
    id: "family-space",
    quote: "Our brief was quite practical: space for family visits without a house that felt empty the rest of the time. A shared living area and two private bedrooms made more sense for us than adding more floor space.",
    name: "Rohan Mehta",
    location: ["Karjat", "Raigad, Maharashtra"],
    image: { src: "/assets/projects/real-v1/kioo-01.webp", alt: "Illustrative OKNO project photo: Kioo — mirrored cabin raised among dense forest trees" },
    status: "sample",
  },
  {
    id: "site-planning",
    quote: "We had plenty of questions about bringing a home onto our land. Talking through access, foundations and the position of the windows helped us understand the decisions we needed to make before choosing the finishes.",
    name: "Kavya Rao",
    location: ["Shankarpally", "Rangareddy, Telangana"],
    image: { src: "/assets/projects/real-v1/kray-sangareddy-01.webp", alt: "Illustrative OKNO project photo: Kray Sangareddy — timber-clad cabin with a deep sloping roof" },
    status: "sample",
  },
  {
    id: "quiet-workspace",
    quote: "We needed a quiet place to work that could also welcome friends for a weekend. Keeping the plan compact, with a separate room and a generous view from the living space, gave the home two useful roles.",
    name: "Arjun Nair",
    location: ["Sakleshpur", "Hassan, Karnataka"],
    image: { src: "/assets/projects/real-v1/lakewood-01.webp", alt: "Illustrative OKNO project photo: Lakewood Villa — angular glazed villa illuminated at dusk" },
    status: "sample",
  },
  {
    id: "guest-stay",
    quote: "For a guest stay, the small details matter: somewhere to leave a bag, a comfortable bathroom and a sheltered spot for morning tea. Those were the things we wanted to get right before adding anything else.",
    name: "Ishita Kulkarni",
    location: ["Alibaug", "Raigad, Maharashtra"],
    image: { src: "/assets/projects/real-v1/octapod-layana-01.webp", alt: "Illustrative OKNO project photo: Octapod Layana — octagonal cabins arranged around a swimming pool" },
    status: "sample",
  },
  {
    id: "bespoke-home",
    quote: "We started with how we use a home, rather than a list of rooms. A longer kitchen counter, storage near the entrance and a living space facing the garden became the starting points for our bespoke brief.",
    name: "Vikram Reddy",
    location: ["Ananthagiri Hills", "Vikarabad, Telangana"],
    image: { src: "/assets/projects/real-v1/rasa-vikarabad-01.webp", alt: "Illustrative OKNO project photo: Rasa Vikarabad — timber-clad cabins framing a central swimming pool" },
    status: "sample",
  },
];
