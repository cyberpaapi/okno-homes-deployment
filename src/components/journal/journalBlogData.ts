export interface JournalBlogPost {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  image: string;
  imageAlt: string;
  detailImage: string;
  detailImageAlt: string;
  sections: { heading: string; paragraphs: string[] }[];
}

// Original OKNO Journal guides. The photography illustrates the subject; the
// text does not attribute an unsourced claim or project outcome to an image.
export const journalBlogPosts: JournalBlogPost[] = [
  {
    id: "compact-site",
    category: "Planning",
    title: "Choosing a modular home for a compact site",
    excerpt: "A practical starting point for matching footprint, access and everyday use before selecting a model.",
    image: "/assets/projects/real-v1/kray-sangareddy-01.webp",
    imageAlt: "Compact timber-clad Kray cabin in its planted site",
    detailImage: "/assets/projects/real-v1/kray-sangareddy-03.webp",
    detailImageAlt: "Kray home photographed from a second angle",
    sections: [
      { heading: "Begin with the usable footprint", paragraphs: ["A compact plot is more than a number on a survey. Setbacks, the approach, trees, existing structures and a place for services all reduce the area that can actually hold a home. Draw those constraints before choosing a plan.", "Test the plan against ordinary days: where shoes are left, how a table is used, whether a guest can stay and where bulky things go. The smallest workable footprint is the one that still supports those routines."] },
      { heading: "Make access part of the design", paragraphs: ["A modular home needs a route from fabrication to its final position. Gates, turning space, overhead cables, ground bearing and the reach of lifting equipment can influence how a home is divided and assembled. Ask the delivery and site teams to review access early, using actual measurements.", "On a tight site, construction space matters too. Protect enough room for foundations, connections, safe movement and finishing work rather than letting the building fill every available edge."] },
      { heading: "Use openings to borrow space", paragraphs: ["Place windows for the best available light and view, then check privacy from neighbouring buildings. A well-positioned opening can make a compact room feel calm; glass on every side can create heat and exposure.", "A small deck or sheltered threshold can extend daily use outdoors. Treat it as part of the plan, with the same attention to shade, drainage and circulation as the interior."] },
    ],
  },
  {
    id: "sloped-land",
    category: "Site guide",
    title: "What to check before building on sloped land",
    excerpt: "Access, drainage, services and foundation strategy are the first questions to resolve with the project team.",
    image: "/assets/projects/real-v1/kioo-08.webp",
    imageAlt: "Forest canopy and distant hills at sunset",
    detailImage: "/assets/projects/real-v1/kioo-07.webp",
    detailImageAlt: "Kioo project set within a wooded landscape",
    sections: [
      { heading: "Read the site before placing the home", paragraphs: ["A slope offers outlook and a sense of separation, but it also changes how people, water and materials move across the land. Start with a measured survey that records levels, boundaries, trees, access and visible drainage routes.", "Walk the site after rain if possible. The dry-season view alone will not show where runoff gathers or how the approach behaves in wet weather."] },
      { heading: "Resolve ground and water together", paragraphs: ["The right foundation depends on ground conditions and the chosen structure. A qualified local engineer should assess bearing, stability and any retaining work. Avoid choosing a foundation from photographs of another hillside project.", "Surface water should be guided around the building without pushing a problem onto a neighbour or a lower part of the plot. Roof drainage, paths, retaining edges and service trenches need to be considered together."] },
      { heading: "Plan the route in and the view out", paragraphs: ["A dramatic view does not help if the route to the door is uncomfortable or unsafe. Check the gradient of paths and steps, the location of parking and how deliveries reach the building.", "Then position glazing and outdoor space for the outlook while considering sun, wind and privacy. The final placement should emerge from the whole site, not only its most photogenic angle."] },
    ],
  },
  {
    id: "small-retreat",
    category: "Small spaces",
    title: "Planning a 300 sq ft retreat that still feels open",
    excerpt: "How glazing, storage, circulation and outdoor space can make a compact plan work harder.",
    image: "/assets/projects/real-v1/kioo-02.webp",
    imageAlt: "Compact timber-lined room with full-height forest views",
    detailImage: "/assets/projects/real-v1/kioo-03.webp",
    detailImageAlt: "Kioo interior with a view into the surrounding trees",
    sections: [
      { heading: "Give every zone a purpose", paragraphs: ["At roughly 300 square feet, circulation takes a meaningful share of the plan. Group the kitchen, bath and storage where they work efficiently, then keep the main living area as uninterrupted as possible.", "Draw furniture at its real size. A bed, table and chair that look modest on a moodboard may compete for the same walking space once doors open and people move through the room."] },
      { heading: "Let the view do useful work", paragraphs: ["A large opening can make a small retreat feel connected to its setting. Place it where someone sits or wakes, rather than treating glazing as a graphic feature on the elevation.", "Balance that view with shade, privacy and a sensible window specification. Comfort depends on how the room performs through the day, not just how it looks in a photograph."] },
      { heading: "Keep storage quiet", paragraphs: ["Built-in storage can take advantage of edges that would otherwise be wasted: beneath a bench, beside a bed or above a service zone. Keep the things used daily easy to reach and give luggage and cleaning items an intentional home.", "An outdoor threshold offers another kind of space. Even a modest covered step can support the transition between a compact interior and the landscape beyond."] },
    ],
  },
  {
    id: "material-comfort",
    category: "Materials",
    title: "Materials that shape comfort in a prefab home",
    excerpt: "An introduction to insulation, windows, roof build-up and finishes—and why the full envelope matters.",
    image: "/assets/projects/real-v1/kray-sangareddy-06.webp",
    imageAlt: "Detail of timber siding and a black window frame",
    detailImage: "/assets/projects/real-v1/kray-sangareddy-07.webp",
    detailImageAlt: "Material detail from the Kray project",
    sections: [
      { heading: "Think in layers", paragraphs: ["Comfort is shaped by an assembly, not a single finish. Roof, walls, floor, insulation, air sealing and openings work together to manage heat, sound and moisture. Ask how the complete build-up performs in the local climate.", "A finish may be the first thing you touch, but what sits behind it often has a larger effect on how steady a room feels over time."] },
      { heading: "Give windows a precise role", paragraphs: ["The location, size and specification of glazing influence daylight and heat gain. Look at orientation and shade before selecting a window only for its appearance.", "Opening windows also need to support the way a room is used. Consider ventilation, privacy, insect protection and the route for cleaning and maintenance."] },
      { heading: "Choose surfaces for use and upkeep", paragraphs: ["Exterior cladding should suit the exposure and maintenance routine of the site. Interior surfaces should feel good in the spaces where people spend time while standing up to cleaning and wear.", "Ask for a clear material schedule and samples viewed in the project's light. The strongest palette is one whose details, junctions and maintenance make as much sense as its colour."] },
    ],
  },
  {
    id: "factory-to-site",
    category: "Process",
    title: "From factory preparation to site assembly",
    excerpt: "A plain-language overview of what can happen off-site, what remains on-site and how the two schedules meet.",
    image: "/assets/projects/real-v1/forrest-04.webp",
    imageAlt: "Forrest home photographed during its completed project study",
    detailImage: "/assets/projects/real-v1/forrest-08.webp",
    detailImageAlt: "Forrest project photographed on its landscaped site",
    sections: [
      { heading: "Two workstreams, one programme", paragraphs: ["A modular project can move some preparation away from the site, but the plot still needs its own work: surveys, approvals, access, foundations and service planning. The building and the site should be programmed together.", "Before fabrication starts, confirm the design decisions that affect dimensions, openings and connections. Late changes can disturb both workstreams."] },
      { heading: "Prepare the site for arrival", paragraphs: ["The delivery route, unloading area and final placement need to be checked against the actual module sizes and lifting plan. Weather, ground conditions and local restrictions can change what is practical on a given day.", "Foundations and service points should be surveyed and checked against the fabrication drawings. A small mismatch at a connection can become a large interruption during assembly."] },
      { heading: "Leave time for the last details", paragraphs: ["Assembly is a visible milestone, not the end of the project. Connections, weatherproofing, testing, interior completion and handover all need space in the schedule.", "A clear sequence helps everyone understand which work is complete, which inspections remain and when the home is ready to use."] },
    ],
  },
  {
    id: "hospitality-rooms",
    category: "Hospitality",
    title: "Designing modular rooms for hospitality",
    excerpt: "Balancing repeatable room types with landscape, privacy, housekeeping and guest movement.",
    image: "/assets/projects/real-v1/octapod-layana-01.webp",
    imageAlt: "Octagonal hospitality cabins arranged around a central pool",
    detailImage: "/assets/projects/real-v1/octapod-layana-03.webp",
    detailImageAlt: "Hospitality rooms viewed from another position on the site",
    sections: [
      { heading: "Start with the guest journey", paragraphs: ["A room is experienced as part of a larger place. Map the route from arrival to the door, the first view from inside and the path to shared spaces. That sequence can guide orientation and spacing before the room plan is fixed.", "Quiet and privacy matter as much as a view. Consider sightlines between neighbouring rooms and how paths pass windows or outdoor seating."] },
      { heading: "Repeat what works", paragraphs: ["A repeatable room type can simplify design decisions, but each placement still responds to its landscape. Keep the useful internal logic consistent while adjusting orientation, thresholds and shade where the site asks for it.", "The same principle applies to servicing: accessible connections and a thoughtful maintenance route help the property operate without disrupting guests."] },
      { heading: "Design for the people running the place", paragraphs: ["Housekeeping needs practical access, durable surfaces and places to store the tools of daily operation. Guests should not have to see those systems, but the plan should make them easy to use.", "Review the room and site layout with the operations team early. Their routine can reveal gaps that a beautiful guest-facing render will miss."] },
    ],
  },
];
