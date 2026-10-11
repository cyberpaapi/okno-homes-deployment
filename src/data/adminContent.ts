import { siteNavigationItems } from "@/data/siteNavigation";
import projectMedia from "@/data/realProjectMedia.json";
import { projectPreviewClips } from "@/data/projectPreviewClips";
import { pressEntries, projectNotes, publicationLogos } from "@/components/journal/journalData";
import { journalBlogPosts } from "@/components/journal/journalBlogData";
import { gazePrototype, oknoModels } from "@/data/models";
import { customerCopySections } from "@/data/configurator/studio/customerCopy";
import { footerGroups, footerSocialLinks } from "@/data/footerContent";
import { processDetailPhases } from "@/data/processDetailPhases";
import type { ContentItem } from "@/lib/contentCollections";
export { homeVariantDefaults } from "@/data/homeVariants";

export type ContentKind = "text" | "image" | "video" | "choice";
export type ContentField = {
  id: string;
  label: string;
  kind: ContentKind;
  defaultValue: string;
  help?: string;
  options?: readonly { value: string; label: string }[];
};
export type ContentSection = {
  id: string;
  label: string;
  fields: readonly ContentField[];
  note?: string;
};
export type ContentPage = {
  id: string;
  label: string;
  href: string;
  sections: readonly ContentSection[];
  children?: readonly ContentPage[];
};

const assuranceIconOptions = [
  { value: "badge", label: "Certification badge" },
  { value: "calendar", label: "Calendar" },
  { value: "shield", label: "Shield" },
  { value: "bulb", label: "Light bulb" },
  { value: "home", label: "Home" },
] as const;

// Shared below-the-fold sections appear under both hero variants. Their stable
// field IDs are stored only once; editing either variant updates both pages.
const sharedHomeSections: readonly ContentSection[] = [
  { id: "timeline", label: "90-day process timeline", fields: [
    { id: "home.timeline.heading-start", label: "Heading · opening", kind: "text", defaultValue: "A home in" },
    { id: "home.timeline.heading-emphasis", label: "Heading · emphasis", kind: "text", defaultValue: "90 days." },
    { id: "home.timeline.action", label: "Process button", kind: "text", defaultValue: "See the process" },
    { id: "home.timeline.action-href", label: "Process button destination", kind: "text", defaultValue: "/process", help: "Same-site path beginning with / or an in-page #anchor." },
    { id: "home.timeline.image", label: "Completed home image", kind: "image", defaultValue: "/assets/projects/real-v1/kioo-03.webp" },
    { id: "home.timeline.image-alt", label: "Image description", kind: "text", defaultValue: "A completed OKNO Kioo home surrounded by mature forest" },
    { id: "home.timeline.image-caption", label: "Image caption", kind: "text", defaultValue: "Day 90 · Ready for handover" },
    ...[
      ["Days 01–10", "Client brief and site", "The site and the brief are understood together before a model is selected or a custom design begins."],
      ["Days 11–25", "Design and approvals", "Design development, approvals, engineering and material planning are completed before manufacturing."],
      ["Days 26–60", "Factory manufacturing", "The approved home moves through factory manufacturing and quality inspection."],
      ["Days 61–72", "Packing and transportation", "The completed parts are packed and transported for assembly."],
      ["Days 73–90", "Assembly and handover", "Site assembly, interior completion and final handover close the process."],
    ].flatMap(([days, title, copy], index): ContentField[] => [
      { id: `home.timeline.stage-${index + 1}.days`, label: `Stage ${index + 1} · day range`, kind: "text", defaultValue: days },
      { id: `home.timeline.stage-${index + 1}.title`, label: `Stage ${index + 1} · heading`, kind: "text", defaultValue: title },
      { id: `home.timeline.stage-${index + 1}.copy`, label: `Stage ${index + 1} · description`, kind: "text", defaultValue: copy },
    ]),
  ] },
  { id: "signature-preview", label: "Signature preview", fields: [
    { id: "home.signature.image", label: "Forza image", kind: "image", defaultValue: "/models/forza/orbit-keyframes-invisible-glow-1080p/forza-invisible-a00.png" },
    { id: "home.signature.image-alt", label: "Forza image description", kind: "text", defaultValue: "Forza Signature home exterior" },
    { id: "home.signature.video", label: "Scroll rotation film", kind: "video", defaultValue: "/models/forza/video/forza-360-scroll-648p-24fps-fluid.mp4", help: "Keep this film seekable; scrolling controls playback position." },
    { id: "home.signature.label", label: "Section label", kind: "text", defaultValue: "Signature homes" },
    { id: "home.signature.heading-1", label: "Heading · first line", kind: "text", defaultValue: "Meet Forza." },
    { id: "home.signature.heading-2", label: "Heading · second line", kind: "text", defaultValue: "Turn the home with your scroll." },
    { id: "home.signature.copy", label: "Closing copy", kind: "text", defaultValue: "Explore Forza and the complete Signature collection." },
    { id: "home.signature.action", label: "Models button", kind: "text", defaultValue: "View the models" },
    { id: "home.signature.action-href", label: "Models button destination", kind: "text", defaultValue: "/models/signature", help: "Same-site path beginning with /." },
  ] },
  { id: "bespoke-preview", label: "Bespoke preview", fields: [
    { id: "home.bespoke.image", label: "Bespoke background", kind: "image", defaultValue: "/models/bespoke/bespoke-pearl-exterior-v1.webp" },
    { id: "home.bespoke.image-alt", label: "Background description", kind: "text", defaultValue: "Bespoke limestone and oak home shaped around a wooded site" },
    { id: "home.bespoke.card-image", label: "Courtyard image", kind: "image", defaultValue: "/models/bespoke/bespoke-pearl-courtyard-v1.webp" },
    { id: "home.bespoke.card-alt", label: "Courtyard description", kind: "text", defaultValue: "Bespoke courtyard opening to water and mature trees" },
    { id: "home.bespoke.word", label: "Background word", kind: "text", defaultValue: "Bespoke" },
    { id: "home.bespoke.heading-1", label: "Heading · first line", kind: "text", defaultValue: "One site." },
    { id: "home.bespoke.heading-2", label: "Heading · second line", kind: "text", defaultValue: "One original home." },
    { id: "home.bespoke.copy", label: "Description", kind: "text", defaultValue: "The architecture begins with your land, your routines and a brief of your own." },
    { id: "home.bespoke.action", label: "Bespoke button", kind: "text", defaultValue: "Enter Bespoke" },
    { id: "home.bespoke.action-href", label: "Bespoke button destination", kind: "text", defaultValue: "/models/bespoke", help: "Same-site path beginning with /." },
  ] },
  { id: "sustainability-preview", label: "Sustainability preview", fields: [
    { id: "home.sustainability.poster", label: "Opening still", kind: "image", defaultValue: "/sustainability/shared-poster.png" },
    { id: "home.sustainability.poster-alt", label: "Still description", kind: "text", defaultValue: "OKNO home held within a dense green landscape" },
    { id: "home.sustainability.video", label: "Ambient film", kind: "video", defaultValue: "/sustainability/hero-idle.mp4" },
    { id: "home.sustainability.label", label: "Section label", kind: "text", defaultValue: "Sustainability" },
    { id: "home.sustainability.heading-1", label: "Heading · first line", kind: "text", defaultValue: "Build less" },
    { id: "home.sustainability.heading-2", label: "Heading · second line", kind: "text", defaultValue: "against the land." },
    { id: "home.sustainability.copy", label: "Description", kind: "text", defaultValue: "The slope, trees, light and path of water are inputs to the architecture." },
    { id: "home.sustainability.action", label: "Approach button", kind: "text", defaultValue: "See the approach" },
    { id: "home.sustainability.action-href", label: "Approach button destination", kind: "text", defaultValue: "/sustainability", help: "Same-site path beginning with /." },
  ] },
  { id: "editorial-preview", label: "Journal and About previews", fields: [
    { id: "home.editorial.journal.image", label: "Journal image", kind: "image", defaultValue: "/assets/projects/real-v1/kioo-09.webp" },
    { id: "home.editorial.journal.image-alt", label: "Journal image description", kind: "text", defaultValue: "Warm-lit Kioo interior opening to the forest at dusk" },
    { id: "home.editorial.journal.title", label: "Journal heading", kind: "text", defaultValue: "From the journal" },
    { id: "home.editorial.journal.copy", label: "Journal description", kind: "text", defaultValue: "Projects, published stories and notes from the practice." },
    { id: "home.editorial.journal.action", label: "Journal button", kind: "text", defaultValue: "Open" },
    { id: "home.editorial.journal.href", label: "Journal destination", kind: "text", defaultValue: "/journal", help: "Same-site path beginning with /." },
    { id: "home.editorial.about.image", label: "About preview image", kind: "image", defaultValue: "/process/generated/process-factory-keyframe-v2.webp" },
    { id: "home.editorial.about.image-alt", label: "About preview image description", kind: "text", defaultValue: "OKNO home taking shape in the factory" },
    { id: "home.editorial.about.title", label: "About preview heading", kind: "text", defaultValue: "About OKNO" },
    { id: "home.editorial.about.copy", label: "About preview description", kind: "text", defaultValue: "The people, thinking and making behind every home." },
    { id: "home.editorial.about.action", label: "About preview button", kind: "text", defaultValue: "Open" },
    { id: "home.editorial.about.href", label: "About destination", kind: "text", defaultValue: "/about", help: "Same-site path beginning with /." },
  ] },
];

const projectRecordSections: ContentSection[] = projectMedia.map(project => ({
  id: `project-${project.id}`,
  label: project.title,
  note: "Globe pins and the Project library are separate. Location lookup gives an approximate pin, not verified site coordinates.",
  fields: [
    { id: `projects.${project.id}.title`, label: "Project title", kind: "text", defaultValue: project.title },
    { id: `projects.${project.id}.description`, label: "Gallery description", kind: "text", defaultValue: `Photography and films from the supplied ${project.title} project collection.` },
    ...project.gallery.flatMap((image, index): ContentField[] => [
      { id: `projects.${project.id}.image-${index + 1}.src`, label: `Photograph ${index + 1}`, kind: "image", defaultValue: image.src },
      { id: `projects.${project.id}.image-${index + 1}.alt`, label: `Photograph ${index + 1} · description`, kind: "text", defaultValue: image.alt },
    ]),
    ...project.films.flatMap((film, index): ContentField[] => [
      { id: `projects.${project.id}.film-${index + 1}.src`, label: `Film ${index + 1}`, kind: "video", defaultValue: film.src },
      { id: `projects.${project.id}.film-${index + 1}.poster`, label: `Film ${index + 1} · poster`, kind: "image", defaultValue: film.poster },
      { id: `projects.${project.id}.film-${index + 1}.title`, label: `Film ${index + 1} · title`, kind: "text", defaultValue: film.title },
    ]),
    ...(projectPreviewClips[project.id] ? [{ id: `projects.${project.id}.preview`, label: "Showcase preview loop", kind: "video" as const, defaultValue: projectPreviewClips[project.id] }] : []),
  ],
}));

const processStages = [
  ["land", "Days 01–10", "Land", "The brief meets the land.", "The site and the brief are read together before a model is selected or a bespoke design begins.", "/process/land-poster.webp"],
  ["architecture", "Days 11–25", "Architecture", "The plan takes shape.", "The site, programme and chosen model are translated into a clear architectural direction.", "/process/drawing-poster.webp"],
  ["design-lock", "Days 11–25", "Design lock", "Every decision is resolved.", "Design development, approvals, engineering and material planning are completed before the build advances.", "/process/design-lock-poster.webp"],
  ["assembly", "Days 73–90", "Assembly", "The structure takes shape.", "Prepared floor and wall panels are aligned into the resolved structure on the finished base.", "/process/generated/process-panel-base-v1.webp"],
  ["enclosure", "Days 73–90", "Enclosure", "The home closes around the view.", "Roof, glazing and envelope complete the form while keeping the architecture tied to its setting.", "/process/generated/process-panel-walls-v1.webp"],
  ["handover", "Days 73–90", "Handover", "Finished where it belongs.", "The completed home is checked as one resolved whole before the final handover.", "/process/generated/process-panel-complete-v1.webp"],
] as const;

const sustainabilityPress = [
  ["Architectural Digest", "10 JUN 2024", "A 300-square-foot holiday home that is one with nature.", "/sustainability/reflections-forest-exterior.jpg", "Reflections cabin elevated among dense forest trees"],
  ["New Atlas", "26 JUN 2024", "A mirrored tiny house with a bed that slides under the stars.", "/sustainability/reflections-deck-bed-detail.jpg", "Motorized bed extended onto the Reflections forest deck"],
  ["HomeCrux", "03 JUL 2024", "A modular holiday home blurring indoor and outdoor.", "/sustainability/reflections-bedroom.jpg", "Wood-lined Reflections bedroom opening toward the forest"],
  ["Architecture+Design", "09 JUL 2024", "A home among the trees, where nature and the built meld as one.", "/sustainability/reflections-mirrored-deck.jpg", "Mirrored glass facade and deck of the Reflections cabin among trees"],
] as const;

const sustainabilityFacts = [
  ["300 sq ft", "A compact forest cabin in Chikmagalur, Karnataka."],
  ["Prefabricated", "A modular home designed for a remote forest site."],
  ["Aluminium composite", "A custom exterior envelope around the structure."],
  ["Motorized deck bed", "A king-size bed that extends outdoors."],
] as const;

const bespokeStages = [
  ["PLACE", "Topography, weather and view", "Read orientation, access, climate and long views before drawing a room.", "/assets/projects/real-v1/forrest-01.webp", "Completed OKNO residence following a curved garden path and reflecting pool through established planting"],
  ["BRIEF", "Ritual, privacy and gathering", "Translate arrival, gathering, privacy and retreat into clear spatial priorities.", "/models/bespoke/bespoke-brief-v3.webp", "Luminous architecture table with a floor plan, material samples and tracing paper"],
  ["FORM", "Volume, structure and material", "Develop volume, structure, material and landscape as one architectural response.", "/models/bespoke/bespoke-form-v3.webp", "Pale stone and oak architectural massing model on a layered topographic base"],
  ["ATMOSPHERE", "Light, texture and landscape", "Tune light, texture and thresholds until the home feels inseparable from its setting.", "/models/bespoke/bespoke-pearl-courtyard-v1.webp", "Luminous limestone courtyard residence with water and mature trees"],
] as const;

const signatureStories = [
  { slug: "forza", film: "/models/forza/video/forza-360-scroll-648p-24fps-fluid.mp4", detail: "/models/forza/video/forza-360-scroll-1080p-24fps-smooth.mp4", poster: "/models/forza/orbit-keyframes-invisible-glow-1080p/forza-invisible-a00.png",
    gallery: [
      ["Exterior", "/models/forza/interiors/forza-exterior.webp", "Forza front three-quarter exterior"], ["Kitchen", "/models/forza/interiors/forza-kitchen.webp", "Forza kitchen interior"],
      ["Living", "/models/forza/interiors/forza-living.webp", "Forza living and dining interior"], ["Bedroom", "/models/forza/interiors/forza-bedroom.webp", "Forza bedroom interior"], ["Bath", "/models/forza/interiors/forza-bathroom.webp", "Forza bathroom interior"],
    ], features: [
      ["Aperture", "Full-height glazing holds the horizon inside the room."], ["Threshold", "A sheltered verandah makes the edge between home and landscape disappear."], ["Precisely resolved", "One bed, one bath and one considered kitchenette within 376 square feet."],
    ] },
  { slug: "kray", film: "/models/kray/video/kray-360-scroll-648p-24fps-fluid.mp4", detail: "/models/kray/video/kray-360-scroll-1080p-24fps-smooth.mp4", poster: "/models/kray/orbit-keyframes-midnight-teal-1080p/kray-a00.png",
    gallery: [
      ["Exterior", "/models/kray/gallery/kray-exterior-water.webp", "Kray modular home beside a reflective mountain pool"], ["Living", "/models/kray/gallery/kray-interior-panorama.webp", "Kray living room looking through full-height glazing toward the mountains"],
      ["Kitchen", "/models/kray/gallery/kray-interior-kitchen-lounge.webp", "Kray timber kitchen and lounge interior"], ["Deck", "/models/kray/gallery/kray-exterior-deck.webp", "Kray exterior with its integrated waterside deck"], ["Setting", "/models/kray/gallery/kray-mountain-community.webp", "A collection of Kray homes in a mountain landscape"],
    ], features: [
      ["Ascent", "A rising roofline turns a compact footprint into a room with presence."], ["Outlook", "Full-height glazing opens the living space to mountain, forest and sky."], ["Compact retreat", "A complete studio home resolved within 306 square feet."],
    ] },
  { slug: "gaze", film: "/models/gaze/video/gaze-360-scroll-648p-24fps-fluid.mp4", detail: "/models/gaze/video/gaze-360-scroll-1080p-24fps-smooth.mp4", poster: "/models/gaze/orbit-keyframes-moonlit-cyan-1080p/gaze-a00.png",
    gallery: [
      ["Exterior", "/models/gaze/gallery/gaze-exterior-three-quarter.webp", "Gaze timber retreat in a mountain setting"], ["Bedroom", "/models/gaze/gallery/gaze-bedroom-wide.webp", "Gaze vaulted bedroom with warm timber ceiling"],
      ["Interior", "/models/gaze/gallery/gaze-interior-front.webp", "Gaze bedroom and sitting space beneath the vaulted roof"], ["Setting", "/models/gaze/gallery/gaze-retreat-setting.webp", "A collection of Gaze retreats beside a mountain pool"], ["Axonometric", "/models/gaze/gallery/gaze-axonometric.webp", "Cutaway axonometric view of the Gaze interior"],
    ], features: [
      ["Framed outlook", "A full-height glazed gable turns the landscape into the room's principal surface."], ["Quiet volume", "A vaulted timber ceiling gives the compact sleeping room a calm, generous proportion."], ["Private retreat", "One focused interior, a warm timber envelope and a footprint made for remote settings."],
    ] },
  { slug: "tengo", film: "/models/tengo/video/tengo-360-scroll-648p-24fps-fluid.mp4", detail: "/models/tengo/video/tengo-360-scroll-1080p-24fps-smooth.mp4", poster: "/models/tengo/blender-accurate/styled-imagen-final-1080p/tengo-a000-roof-final-1920x1080.png",
    gallery: [
      ["Exterior", "/models/tengo/gallery/tengo-exterior-pool.webp", "Tengo modular home beside a reflective pool"], ["Living", "/models/tengo/gallery/tengo-living.webp", "Tengo living room with full-height garden glazing"],
      ["Bedroom", "/models/tengo/gallery/tengo-bedroom.webp", "Tengo bedroom with warm timber ceiling and framed garden views"], ["Dining", "/models/tengo/gallery/tengo-dining.webp", "Tengo dining room beneath a timber ceiling"], ["Plan", "/models/tengo/gallery/tengo-axonometric.webp", "Tengo cutaway axonometric interior plan"],
    ], features: [
      ["Long horizon", "An extended roofline gives the home a calm, grounded silhouette."], ["Gathering room", "Generous living and dining spaces open toward the deck and landscape."], ["Room to arrive", "Two- and three-bedroom plans begin at 1,426 square feet."],
    ] },
  { slug: "trib", film: "/models/trib/video/trib-360-scroll-648p-24fps-fluid.mp4", detail: "/models/trib/video/trib-360-scroll-1080p-24fps-smooth.mp4", poster: "/models/trib/orbit-keyframes-smoked-amber-clean-geometry-v2-1080p/trib-a00.png",
    gallery: [
      ["Exterior", "/models/trib/gallery/trib-exterior-front.webp", "Trib A-frame retreat among tall forest trees"], ["Bedroom", "/models/trib/gallery/trib-bedroom.webp", "Trib bedroom beneath the warm timber A-frame ceiling"],
      ["Kitchenette", "/models/trib/gallery/trib-kitchenette.webp", "Trib compact kitchenette beside the sleeping space"], ["Bath", "/models/trib/gallery/trib-bathroom.webp", "Trib compact bathroom with timber finishes"], ["Setting", "/models/trib/gallery/trib-setting.webp", "A collection of Trib retreats in a forest clearing"],
    ], features: [
      ["A-frame clarity", "A steep, uninterrupted roof gives the retreat its unmistakable silhouette."], ["Glazed arrival", "The full-height triangular facade opens the compact interior toward the landscape."], ["Compact escape", "One bed, one bath and a kitchenette resolved within 436 square feet."],
    ] },
  { slug: "octapod", film: "/models/octapod/video/octapod-360-scroll-648p-24fps-fluid.mp4", detail: "/models/octapod/video/octapod-360-scroll-1080p-24fps-smooth.mp4", poster: "/models/octapod/orbit-keyframes-muted-aubergine-geometry-v2-1080p/octapod-a00.png",
    gallery: [
      ["Exterior", "/models/octapod/gallery/octapod-exterior-forest.webp", "Octapod glazed exterior in a forest clearing"], ["Bedroom", "/models/octapod/gallery/octapod-bedroom-wide.webp", "Octapod timber-lined bedroom with warm afternoon light"],
      ["Interior", "/models/octapod/gallery/octapod-bedroom-detail.webp", "Octapod bedroom with a timber feature wall and pendant lights"], ["Setting", "/models/octapod/gallery/octapod-landscape-setting.webp", "Octapod retreat placed in a sunlit woodland landscape"], ["Cutaway", "/models/octapod/gallery/octapod-cutaway-plan.webp", "Octapod cutaway showing the bedroom and compact bathroom arrangement"],
    ], features: [
      ["Eight-sided calm", "A disciplined octagonal shell gives the compact retreat its unmistakable silhouette."], ["Panoramic aperture", "Full-height front glazing opens the studio to its setting while opaque facets provide shelter."], ["Resort-ready studio", "One bed, one bath and one kitchenette resolved within 300 square feet."],
    ] },
] as const;

export const signatureGalleryDefaults: Record<string, ContentItem[]> = Object.fromEntries(signatureStories.map(story => [
  `signature.gallery.${story.slug}`,
  story.gallery.map(([label, image, alt], index) => ({
    id: `${story.slug}-gallery-${index + 1}`,
    fields: { label, image, alt },
  })),
]));

const signatureCommonSections: readonly ContentSection[] = [
  { id: "signature-controls", label: "Collection controls", fields: [
    { id: "models.signature.eyebrow", label: "Collection eyebrow", kind: "text", defaultValue: "Signature collection" },
    { id: "models.signature.loading", label: "Loading message", kind: "text", defaultValue: "Loading" },
    { id: "models.signature.plan-filter-label", label: "Plan filter accessible label", kind: "text", defaultValue: "Filter by floor plan" },
    { id: "models.signature.filter-all", label: "All plans button", kind: "text", defaultValue: "All" },
    { id: "models.signature.filter-studio", label: "Studio button", kind: "text", defaultValue: "Studio" },
    { id: "models.signature.filter-2-bhk", label: "Two bedroom button", kind: "text", defaultValue: "2 BHK" },
    { id: "models.signature.filter-3-bhk", label: "Three bedroom button", kind: "text", defaultValue: "3 BHK" },
    { id: "models.signature.scroll-cue", label: "Scroll instruction", kind: "text", defaultValue: "Scroll to rotate" },
    { id: "models.signature.models-label", label: "Model selector accessible label", kind: "text", defaultValue: "Signature models" },
    { id: "models.signature.details-action", label: "Explore details button", kind: "text", defaultValue: "Explore details" },
    { id: "models.signature.home-singular", label: "Available count · singular", kind: "text", defaultValue: "home" },
    { id: "models.signature.home-plural", label: "Available count · plural", kind: "text", defaultValue: "homes" },
    { id: "models.signature.available", label: "Available count · qualifier", kind: "text", defaultValue: "available" },
    { id: "models.signature.feature-eyebrow", label: "Feature card label", kind: "text", defaultValue: "Signature detail" },
    { id: "models.signature.detail.close", label: "Explore close button", kind: "text", defaultValue: "Close" },
    { id: "models.signature.detail.internal-area", label: "Internal area label", kind: "text", defaultValue: "Internal area" },
    { id: "models.signature.detail.starting-price", label: "Starting price label", kind: "text", defaultValue: "Starting price" },
    { id: "models.signature.detail.delivery", label: "Delivery label", kind: "text", defaultValue: "Delivery" },
    { id: "models.signature.detail.delivery-value", label: "Delivery value", kind: "text", defaultValue: "90 days" },
    { id: "models.signature.detail.spaces", label: "Spaces label", kind: "text", defaultValue: "Spaces" },
    { id: "models.signature.detail.configure-action", label: "Configure button prefix", kind: "text", defaultValue: "Configure" },
    { id: "models.signature.detail.build-eyebrow", label: "Build box label", kind: "text", defaultValue: "Built indoors" },
    { id: "models.signature.detail.build-line-1", label: "Build box first line", kind: "text", defaultValue: "Factory precision." },
    { id: "models.signature.detail.build-line-2", label: "Build box second line", kind: "text", defaultValue: "Landscape presence." },
    { id: "models.signature.detail.warranty-eyebrow", label: "Warranty box label", kind: "text", defaultValue: "Included" },
    { id: "models.signature.detail.warranty-value", label: "Warranty statement", kind: "text", defaultValue: "20-year structural warranty" },
  ] },
];

const signatureModelSections: readonly ContentSection[] = signatureStories.flatMap(story => {
  const model = oknoModels.find(item => item.slug === story.slug) ?? (story.slug === "gaze" ? gazePrototype : undefined);
  return [
    { id: `${story.slug}-media`, label: `${model?.name ?? story.slug} · rotation media`, fields: [
      { id: `models.signature.${story.slug}.orbit-film`, label: "Replace rotation master film", kind: "video", defaultValue: story.film, help: "One upload prepares the scroll and detail films plus a first-frame poster. Save this field to stage all three together; preview the result before publishing." },
      { id: `models.signature.${story.slug}.detail-film`, label: "Prepared Explore detail film", kind: "video", defaultValue: story.detail, help: "Filled automatically by a rotation master upload; may be replaced independently after review." },
      { id: `models.signature.${story.slug}.poster`, label: "Rotation poster", kind: "image", defaultValue: story.poster, help: "A first-frame poster is prepared with the master film. Replace this still if the opening frame is unsuitable." },
      { id: `models.signature.${story.slug}.poster-alt`, label: "Poster description", kind: "text", defaultValue: `${model?.name ?? story.slug} modular home in the Signature collection` },
      { id: `models.signature.${story.slug}.orbit-description`, label: "Rotation accessible description", kind: "text", defaultValue: `${model?.name ?? story.slug} rotating in response to page scroll` },
    ] },
    { id: `${story.slug}-story`, label: `${model?.name ?? story.slug} · story cards`, fields: story.features.flatMap(([title, copy], index) => [
      { id: `models.signature.${story.slug}.feature-${index + 1}.title`, label: `Feature ${index + 1} heading`, kind: "text" as const, defaultValue: title },
      { id: `models.signature.${story.slug}.feature-${index + 1}.copy`, label: `Feature ${index + 1} description`, kind: "text" as const, defaultValue: copy },
    ]) },
    { id: `${story.slug}-explore`, label: `${model?.name ?? story.slug} · Explore details`, fields: [
      { id: `models.signature.${story.slug}.display-name`, label: "Display name", kind: "text", defaultValue: model?.name ?? story.slug },
      { id: `models.signature.${story.slug}.explore-action`, label: "Explore button", kind: "text", defaultValue: "Explore details" },
    ], note: "Gallery images are managed in the ordered image collection below. Plan names, areas, prices and spaces are edited in the plan sections that follow." },
    ...(model?.variants.map((variant, index): ContentSection => ({
      id: `${story.slug}-plan-${index + 1}`,
      label: `${model.name} · ${variant.name} plan and price`,
      fields: [
        { id: `models.signature.${story.slug}.variant-${index + 1}.name`, label: "Plan name", kind: "text", defaultValue: variant.name },
        { id: `models.signature.${story.slug}.variant-${index + 1}.area`, label: "Published internal area", kind: "text", defaultValue: variant.areaDisplay ?? `${variant.areaSqFt.toLocaleString("en-IN")} sq ft`, help: "Include the unit, for example 376 sq ft. This is the client-controlled value shown in the Signature opening and Explore specifications." },
        { id: `models.signature.${story.slug}.variant-${index + 1}.price`, label: "Published starting price", kind: "text", defaultValue: variant.price.display, help: "Enter the exact public wording, for example ₹18.50 lakh or Price on request. Publishing applies it directly; no separate confirmation is required." },
        { id: `models.signature.${story.slug}.variant-${index + 1}.spaces`, label: "Spaces and features", kind: "text", defaultValue: variant.spaces.join(" · ") },
      ],
      note: "These display values update both the model opening and the Explore specification panel. They do not change 3D geometry or calculate a checkout total.",
    })) ?? []),
  ];
});

function journalEntrySection(entry: (typeof pressEntries)[number]): ContentSection {
  const prefix = `journal.entry-${entry.id}`;
  return { id: entry.id, label: entry.source === "OKNO project archive" ? entry.date : entry.source, fields: [
    { id: `${prefix}.source`, label: "Publication or archive source", kind: "text", defaultValue: entry.source },
    { id: `${prefix}.date`, label: "Date or project label", kind: "text", defaultValue: entry.date },
    { id: `${prefix}.title`, label: "Headline", kind: "text", defaultValue: entry.title },
    { id: `${prefix}.image`, label: "Story photograph", kind: "image", defaultValue: entry.image },
    { id: `${prefix}.alt`, label: "Image description", kind: "text", defaultValue: entry.imageAlt },
    { id: `${prefix}.credit`, label: "Image credit", kind: "text", defaultValue: entry.credit },
    { id: `${prefix}.byline`, label: "Byline", kind: "text", defaultValue: entry.byline ?? "" },
    { id: `${prefix}.summary`, label: "Summary", kind: "text", defaultValue: entry.summary },
    { id: `${prefix}.href`, label: "Destination", kind: "text", defaultValue: entry.href },
    ...((entry.logo ?? publicationLogos[entry.source]) ? [{ id: `${prefix}.logo`, label: "Publication logo", kind: "image" as const, defaultValue: entry.logo ?? publicationLogos[entry.source] }] : []),
  ] };
}

// Existing scalar records stay readable during the move to ordered collections.
// They are kept in the validation registry without appearing as duplicate editors.
const legacyCollectionSections: ContentSection[] = [
  ...projectRecordSections,
  ...pressEntries.map(journalEntrySection),
  ...projectNotes.map(journalEntrySection),
  ...journalBlogPosts.map((post): ContentSection => ({ id: `legacy-post-${post.id}`, label: post.title, fields: [
    { id: `journal.post-${post.id}.category`, label: "Category", kind: "text", defaultValue: post.category },
    { id: `journal.post-${post.id}.title`, label: "Heading", kind: "text", defaultValue: post.title },
    { id: `journal.post-${post.id}.excerpt`, label: "Excerpt", kind: "text", defaultValue: post.excerpt },
    { id: `journal.post-${post.id}.image`, label: "Photograph", kind: "image", defaultValue: post.image },
    { id: `journal.post-${post.id}.alt`, label: "Image description", kind: "text", defaultValue: post.imageAlt },
    { id: `journal.post-${post.id}.detail-image`, label: "Body photograph", kind: "image", defaultValue: post.detailImage },
    { id: `journal.post-${post.id}.detail-alt`, label: "Body photograph description", kind: "text", defaultValue: post.detailImageAlt },
  ] })),
];

const legacyOptionFields: ContentField[] = [];
// Retain historical saved data without offering a V1 loop that is no longer used.
const retiredHeroFields: ContentField[] = [{ id: 'hero-v1.opening.ambient-video', label: 'Retired V1 ambient loop', kind: 'video', defaultValue: '/assets/landing-options/forest-entry-ambient-loop.mp4' }];
function enquirySection(id: string, label: string, entries: readonly (readonly [string, string, string])[]): ContentSection {
  const fields = entries.map(([key, fieldLabel, defaultValue]): ContentField => ({
    id: `enquiry.${key}`, label: fieldLabel, kind: "text", defaultValue,
  }));
  const visible = fields.filter(field => {
    if (!/\.option-[0-9]+$/.test(field.id)) return true;
    legacyOptionFields.push(field);
    return false;
  });
  return { id, label, fields: visible, note: id === "intro" ? undefined : "Dropdown choices are edited in the ordered options collection for this form." };
}

// The visible order is intentional. Unmapped sections remain explicit and read-only
// until their owning component consumes typed content values.
export const adminPages: readonly ContentPage[] = [
  {
    id: "home", label: "Home", href: "/", sections: [], children: [
      { id: "homepage", label: "Published homepage", href: "/", sections: [
        { id: "publishing", label: "Choose the live opening", fields: [
          { id: "home.publishing.hero", label: "Homepage hero", kind: "text", defaultValue: "hero-v1", help: "Choose a named hero opening, save this draft, then publish to use it on the live home route." },
        ] },
      ] },
      {
        id: "hero-v1", label: "Hero V1 · default home", href: "/hero-v1", sections: [
          { id: "opening", label: "Forest opening", fields: [
            { id: "hero-v1.opening.start-image", label: "Opening still", kind: "image", defaultValue: "/assets/landing-options/forest-entry-start-v2.jpg" },
            { id: "hero-v1.opening.end-image", label: "Window ending still", kind: "image", defaultValue: "/assets/landing-options/forest-entry-window-finish.jpg" },
            { id: "hero-v1.opening.intro-video", label: "Intro film", kind: "video", defaultValue: "/assets/landing-options/forest-entry-intro-15s.mp4" },
            { id: "hero-v1.opening.scroll-video", label: "Scroll journey film", kind: "video", defaultValue: "/assets/landing-options/forest-entry-scroll-window-smooth.mp4", help: "Replacement must remain seekable; the scroll interaction reads video time." },
            { id: "hero-v1.opening.intro-last-frame", label: "Intro handoff still", kind: "image", defaultValue: "/assets/landing-options/forest-entry-intro-last-frame.png" },
            { id: "hero-v1.opening.tagline", label: "Still-frame tagline · V1", kind: "text", defaultValue: "Live better, live modular.", help: "Shown with OKNO Modhomes on the frozen intro frame. Leave empty to hide the tagline." },
            { id: "hero-v1.opening.accessible-title", label: "Accessible page title", kind: "text", defaultValue: "OKNO Modhomes" },
            { id: "hero-v1.opening.start-alt", label: "Opening image description", kind: "text", defaultValue: "A single illuminated Kioo home within dense forest at blue hour" },
            { id: "hero-v1.opening.end-alt", label: "Interior image description", kind: "text", defaultValue: "The timber-lined interior of the Kioo home opening to the forest" },
          ] },
          ...sharedHomeSections,
        ],
      },
      {
        id: "hero-v2", label: "Hero V2 · city to Forza", href: "/hero-v2", sections: [
          { id: "opening", label: "City-to-Forza opening", fields: [
            { id: "hero-v2.opening.journey-video", label: "City-to-Forza film", kind: "video", defaultValue: "/hero-v2/city-to-forza.mp4" },
            { id: "hero-v2.opening.journey-poster", label: "Opening poster", kind: "image", defaultValue: "/hero-v2/journey-poster.jpg" },
            { id: "hero-v2.opening.island-loop", label: "Forza island loop", kind: "video", defaultValue: "/hero-v2/forza-island-loop.mp4" },
            { id: "hero-v2.opening.island-poster", label: "Island poster", kind: "image", defaultValue: "/hero-v2/forza-island-poster.webp" },
            { id: "hero-v2.opening.accessible-title", label: "Accessible page title", kind: "text", defaultValue: "OKNO Modhomes - from the city to Forza" },
          ] },
          ...sharedHomeSections,
        ],
      },
    ],
  },
  { id: "projects", label: siteNavigationItems[0].label, href: "/projects", sections: [
    { id: "intro", label: "Atlas opening", fields: [
      { id: "projects.intro.eyebrow", label: "Section label", kind: "text", defaultValue: "OKNO PROJECTS" },
      { id: "projects.intro.title", label: "Main heading", kind: "text", defaultValue: "Homes,\n everywhere." },
      { id: "projects.intro.subtitle", label: "Supporting line", kind: "text", defaultValue: "Distinct places. A shared way of living." },
      { id: "projects.intro.action", label: "View projects button", kind: "text", defaultValue: "Our projects" },
      { id: "projects.intro.action-href", label: "View projects button destination", kind: "text", defaultValue: "#collection", help: "Same-site path beginning with / or an in-page #anchor." },
    ], note: "The Globe pins section below owns location lookup and coordinates independently of project pages." },
    { id: "globe-pins", label: "Globe pins", fields: [], note: "Add locations to the globe without adding project photographs or a project page. Search for a place or enter its decimal coordinates." },
    { id: "project-library", label: "Project library", fields: [], note: "Add, edit, reorder and archive projects in the linked collection editor below." },
    { id: "detail-controls", label: "Project detail navigation", fields: [
      { id: "projects.detail.return", label: "Return to projects link", kind: "text", defaultValue: "All places" },
      { id: "projects.detail.return-href", label: "Return link destination", kind: "text", defaultValue: "/projects?place={projectId}", help: "Use {projectId} to return to the current project in the showcase; globe locations are separate." },
      { id: "projects.detail.photos-tab", label: "Photographs tab", kind: "text", defaultValue: "Photographs" },
      { id: "projects.detail.films-tab", label: "Films tab", kind: "text", defaultValue: "Films" },
    ] },
  ] },
  { id: "models", label: siteNavigationItems[1].label, href: "/models", sections: [
    { id: "selector", label: "Model selector opening", fields: [
      { id: "models.selector.heading-start", label: "Heading · opening", kind: "text", defaultValue: "A home." },
      { id: "models.selector.heading-end", label: "Heading · emphasis", kind: "text", defaultValue: "Your way." },
      { id: "models.selector.intro", label: "Supporting line", kind: "text", defaultValue: "Signature or Bespoke" },
      { id: "models.selector.accessible-label", label: "Accessible selector label", kind: "text", defaultValue: "Choose how to build your OKNO home" },
    ] },
    ...([
      ["signature", "Signature", "Enter the Signature Collection", "/models/selector/signature-blue-hour-v1.webp", "Concept visualization of a compact timber and glass Signature home beside still water at blue hour", "Considered models, composed for your land.", "View Signature", "Dark luxury"],
      ["bespoke", "Bespoke", "Begin a Bespoke home", "/models/bespoke/bespoke-pearl-exterior-v1.webp", "Concept visualization of a luminous site-specific limestone and oak Bespoke residence", "One site. One brief. One original home.", "Begin Bespoke", "Light luxury"],
    ] as const).map(([id, title, label, image, alt, description, action, mode]): ContentSection => ({ id: `selector-${id}`, label: `${title} selector card`, fields: [
      { id: `models.selector.${id}.title`, label: "Card heading", kind: "text", defaultValue: title },
      { id: `models.selector.${id}.label`, label: "Accessible card label", kind: "text", defaultValue: label },
      { id: `models.selector.${id}.image`, label: "Card photograph", kind: "image", defaultValue: image },
      { id: `models.selector.${id}.alt`, label: "Image description", kind: "text", defaultValue: alt },
      { id: `models.selector.${id}.description`, label: "Card description", kind: "text", defaultValue: description },
      { id: `models.selector.${id}.action`, label: "Card button", kind: "text", defaultValue: action },
      { id: `models.selector.${id}.mode`, label: "Card label", kind: "text", defaultValue: mode },
    ] })),
  ], children: [
    { id: "signature", label: "Signature models", href: "/models/signature", sections: [
      ...signatureCommonSections,
      ...signatureModelSections,
    ] },
    { id: "configurators", label: "Configurators", href: "/models/signature/tengo/configure", sections: [
      ...customerCopySections.map((section): ContentSection => ({
        id: section.id,
        label: section.label,
        fields: section.fields.map(([id, label, defaultValue]) => ({
          id: `configurator.${id}`,
          label,
          kind: "text" as const,
          defaultValue,
          ...(defaultValue.includes("{") ? { help: "Keep bracketed tokens such as {variant} or {count} where the value should appear." } : {}),
        })),
      })),
      { id: "product-data", label: "Model and finish catalogue", fields: [], note: "Product variants, 3D geometry, surface assignments, finish names and assets, and pricing rules remain in the separate configurator catalogue workflow. These copy fields are shared by the active Tengo and Kray routes." },
    ] },
    { id: "bespoke", label: "Bespoke", href: "/models/bespoke", sections: [
      { id: "hero", label: "Opening", fields: [
        { id: "models.bespoke.hero.image", label: "Opening photograph", kind: "image", defaultValue: "/models/bespoke/bespoke-pearl-exterior-v1.webp" },
        { id: "models.bespoke.hero.alt", label: "Image description", kind: "text", defaultValue: "A luminous site-specific limestone and oak residence integrated into a wooded hillside" },
        { id: "models.bespoke.hero.background-word", label: "Background word", kind: "text", defaultValue: "BESPOKE" },
        { id: "models.bespoke.hero.eyebrow", label: "Section label", kind: "text", defaultValue: "Bespoke by OKNO" },
        { id: "models.bespoke.hero.line-1", label: "Heading · first line", kind: "text", defaultValue: "A home authored" },
        { id: "models.bespoke.hero.line-2", label: "Heading · second line", kind: "text", defaultValue: "from place." },
      ] },
      { id: "manifesto", label: "Manifesto", fields: [
        { id: "models.bespoke.manifesto.eyebrow", label: "Section label", kind: "text", defaultValue: "One commission" },
        { id: "models.bespoke.manifesto.line-1", label: "Heading · first line", kind: "text", defaultValue: "NOT SELECTED." },
        { id: "models.bespoke.manifesto.line-2", label: "Heading · second line", kind: "text", defaultValue: "NOT ADAPTED." },
        { id: "models.bespoke.manifesto.line-3", label: "Heading · third line", kind: "text", defaultValue: "AUTHORED." },
        { id: "models.bespoke.manifesto.copy", label: "Description", kind: "text", defaultValue: "Bespoke begins where a catalogue ends. The architecture is developed around the site, the life it will hold and the atmosphere it should create." },
        { id: "models.bespoke.manifesto.image", label: "Courtyard photograph", kind: "image", defaultValue: "/models/bespoke/bespoke-pearl-courtyard-v1.webp" },
        { id: "models.bespoke.manifesto.alt", label: "Image description", kind: "text", defaultValue: "Luminous limestone courtyard residence shaped around water and mature trees" },
      ] },
      { id: "portal", label: "Architecture transition", fields: [
        { id: "models.bespoke.portal.image", label: "Portal photograph", kind: "image", defaultValue: "/models/bespoke/bespoke-pearl-courtyard-v1.webp" },
        { id: "models.bespoke.portal.image-alt", label: "Portal image description", kind: "text", defaultValue: "" },
      ] },
      { id: "decisions", label: "Design decisions", fields: [
        { id: "models.bespoke.stages.next-action", label: "Next-step button", kind: "text", defaultValue: "Next step" },
      ] },
      ...bespokeStages.map(([label, detail, copy, image, alt], index): ContentSection => ({ id: `decision-${index + 1}`, label: `Decision ${index + 1} · ${label}`, fields: [
        { id: `models.bespoke.stage-${index + 1}.label`, label: "Heading", kind: "text", defaultValue: label },
        { id: `models.bespoke.stage-${index + 1}.detail`, label: "Detail", kind: "text", defaultValue: detail },
        { id: `models.bespoke.stage-${index + 1}.copy`, label: "Description", kind: "text", defaultValue: copy },
        { id: `models.bespoke.stage-${index + 1}.image`, label: "Photograph", kind: "image", defaultValue: image },
        { id: `models.bespoke.stage-${index + 1}.alt`, label: "Image description", kind: "text", defaultValue: alt },
      ] })),
      { id: "result", label: "The result", fields: [
        { id: "models.bespoke.result.image", label: "Background photograph", kind: "image", defaultValue: "/models/bespoke/bespoke-pearl-courtyard-v1.webp" },
        { id: "models.bespoke.result.alt", label: "Background description", kind: "text", defaultValue: "Open-air courtyard connecting architecture, water and landscape" },
        { id: "models.bespoke.result.word-1", label: "Background word · one", kind: "text", defaultValue: "ONE PLACE" },
        { id: "models.bespoke.result.word-2", label: "Background word · two", kind: "text", defaultValue: "ONE HOME" },
        { id: "models.bespoke.result.card-image", label: "Inset photograph", kind: "image", defaultValue: "/models/bespoke/bespoke-pearl-exterior-v1.webp" },
        { id: "models.bespoke.result.card-alt", label: "Inset image description", kind: "text", defaultValue: "Pale limestone and oak bespoke residence in its landscape" },
        { id: "models.bespoke.result.eyebrow", label: "Section label", kind: "text", defaultValue: "The result" },
        { id: "models.bespoke.result.heading", label: "Closing heading", kind: "text", defaultValue: "Architecture that could belong nowhere else." },
      ] },
    ] },
  ] },
  { id: "hospitality", label: siteNavigationItems[2].label, href: "/hospitality", sections: [
    { id: "opening", label: "Opening", fields: [
      { id: "hospitality.opening.heading", label: "Opening heading", kind: "text", defaultValue: "Built to welcome. Designed to scale." },
      { id: "hospitality.opening.image", label: "Opening photograph", kind: "image", defaultValue: "/assets/projects/real-v1/lakewood-08.webp" },
      { id: "hospitality.opening.alt", label: "Photograph description", kind: "text", defaultValue: "Lakewood hospitality buildings reflected in water at dusk" },
      { id: "hospitality.opening.caption", label: "Opening caption", kind: "text", defaultValue: "One architectural language, coordinated across every residence and shared space." },
      { id: "hospitality.opening.action", label: "Begin project button", kind: "text", defaultValue: "Begin a project" },
      { id: "hospitality.opening.action-href", label: "Begin project destination", kind: "text", defaultValue: "/enquiry?intent=hospitality", help: "Same-site path beginning with /." },
    ] },
    { id: "proof", label: "Estate capabilities", fields: [
      ...([
        ["Estate scale", "5+", "Residences, one coordinated brief.", "/assets/projects/real-v1/octapod-layana-01.webp"],
        ["Opening path", "Months", "A delivery programme measured for opening.", "/assets/projects/real-v1/forrest-01.webp"],
        ["Site", "Ready", "Terrain, utilities and resilience planned.", "/assets/projects/real-v1/lakewood-01.webp"],
        ["Finish", "Two", "Guest-ready or architectural shell.", "/assets/projects/real-v1/kioo-01.webp"],
        ["Aftercare", "Ongoing", "Warranty, handover and long-term care.", "/assets/projects/real-v1/rasa-vikarabad-01.webp"],
      ] as const).flatMap(([eyebrow, value, title, image], index) => [
        { id: `hospitality.bento.${index + 1}.eyebrow`, label: `Card ${index + 1} label`, kind: "text" as const, defaultValue: eyebrow },
        { id: `hospitality.bento.${index + 1}.value`, label: `Card ${index + 1} value`, kind: "text" as const, defaultValue: value },
        { id: `hospitality.bento.${index + 1}.title`, label: `Card ${index + 1} heading`, kind: "text" as const, defaultValue: title },
        { id: `hospitality.bento.${index + 1}.image`, label: `Card ${index + 1} photograph`, kind: "image" as const, defaultValue: image },
        { id: `hospitality.bento.${index + 1}.alt`, label: `Card ${index + 1} photograph description`, kind: "text" as const, defaultValue: "", help: "Optional when the photograph repeats the adjacent card wording." },
      ]),
    ], note: "The five-card editorial arrangement stays fixed. Each card's displayed content and photograph are replaceable." },
    { id: "projects", label: "Selected work", fields: [
      { id: "hospitality.selected.heading", label: "Selected work heading", kind: "text", defaultValue: "Selected work." },
    ], note: "Choose, reorder and remove projects from the linked Selected work collection here." },
    { id: "timeline", label: "Delivery journey", fields: [
      { id: "hospitality.timeline.label", label: "Delivery label", kind: "text", defaultValue: "Delivery path" },
      { id: "hospitality.timeline.title", label: "Delivery heading", kind: "text", defaultValue: "Brief to opening." },
      { id: "hospitality.timeline.range", label: "Stage range", kind: "text", defaultValue: "01 — 07" },
      { id: "hospitality.timeline.cover", label: "Journey cover", kind: "image", defaultValue: "/assets/projects/real-v1/octapod-layana-08.webp" },
      { id: "hospitality.timeline.cover-alt", label: "Cover description", kind: "text", defaultValue: "Aerial view of a hospitality estate arranged around a central pool" },
      ...([
        ["01", "Private consultation", "Ambition, residence count, operating model and investment range.", "/assets/projects/real-v1/forrest-03.webp"],
        ["02", "Site study", "Access, topography, climate and the guest arrival sequence.", "/assets/projects/real-v1/kioo-04.webp"],
        ["03", "Design curation", "Residence mix, interiors and shared pavilions.", "/assets/projects/real-v1/lakewood-03.webp"],
        ["04", "Craftsmanship", "Precision production against the approved programme.", "/assets/projects/real-v1/forrest-04.webp"],
        ["05", "Delivery", "Sequenced logistics shaped around terrain and access.", "/assets/projects/real-v1/octapod-layana-08.webp"],
        ["06", "Installation", "Placement, connection, testing and completion.", "/assets/projects/real-v1/kray-sangareddy-02.webp"],
        ["07", "Opening", "Handover into guest operations and continuing care.", "/assets/projects/real-v1/rasa-vikarabad-04.webp"],
      ] as const).flatMap(([number, title, copy, image], index) => [
        { id: `hospitality.timeline.stage-${index + 1}.number`, label: `Stage ${index + 1} number`, kind: "text" as const, defaultValue: number },
        { id: `hospitality.timeline.stage-${index + 1}.title`, label: `Stage ${index + 1} heading`, kind: "text" as const, defaultValue: title },
        { id: `hospitality.timeline.stage-${index + 1}.copy`, label: `Stage ${index + 1} description`, kind: "text" as const, defaultValue: copy },
        { id: `hospitality.timeline.stage-${index + 1}.image`, label: `Stage ${index + 1} photograph`, kind: "image" as const, defaultValue: image },
        { id: `hospitality.timeline.stage-${index + 1}.alt`, label: `Stage ${index + 1} photograph description`, kind: "text" as const, defaultValue: "", help: "Optional when the photograph is decorative beside the stage description." },
      ]),
    ] },
    { id: "enquiry", label: "Enquiry close", fields: [
      { id: "hospitality.closing.heading", label: "Closing heading", kind: "text", defaultValue: "Begin a hospitality conversation." },
      { id: "hospitality.closing.action", label: "Enquiry button", kind: "text", defaultValue: "Hospitality enquiry" },
      { id: "hospitality.closing.action-href", label: "Enquiry destination", kind: "text", defaultValue: "/enquiry?intent=hospitality", help: "Same-site path beginning with /." },
    ] },
  ] },
  { id: "process", label: siteNavigationItems[3].label, href: "/process", sections: [
    { id: "opening", label: "Film opening", fields: [
      { id: "process.opening.eyebrow", label: "Section label", kind: "text", defaultValue: "The OKNO process" },
      { id: "process.opening.title", label: "Opening heading", kind: "text", defaultValue: "Built in 90 days." },
      { id: "process.opening.summary", label: "Opening summary", kind: "text", defaultValue: "From first site reading to final handover, every decision moves through one connected process." },
      { id: "process.opening.cue", label: "Scroll instruction", kind: "text", defaultValue: "Scroll to enter the build" },
      { id: "process.opening.cover", label: "Opening cover photograph", kind: "image", defaultValue: "/process/opening-cover.webp", help: "Separate still shown before the scroll film; scrolling blends it into the first decoded frames." },
      { id: "process.opening.poster", label: "Film fallback poster", kind: "image", defaultValue: "/process/land-poster.webp" },
      { id: "process.opening.master-hq", label: "Desktop master film", kind: "video", defaultValue: "/process/process-master.hq.mp4", help: "Keep the same 25.633-second sequence and stage timing. Scroll controls the film continuously in both directions." },
      { id: "process.opening.master-scrub", label: "Mobile master film", kind: "video", defaultValue: "/process/process-master.scrub.mp4", help: "Use a film with matching sequence and duration. Scroll controls the film continuously, with a gently eased playhead." },
      { id: "process.opening.film-label", label: "Film accessibility label", kind: "text", defaultValue: "OKNO process film advancing from land analysis to the completed home as the page scrolls" },
      { id: "process.opening.loading", label: "Loading label", kind: "text", defaultValue: "Loading process film" },
    ] },
    { id: "sequence", label: "Build sequence", fields: [
      { id: "process.sequence.title", label: "Accessible sequence heading", kind: "text", defaultValue: "The OKNO build sequence" },
      { id: "process.sequence.rail-heading", label: "Timeline rail heading", kind: "text", defaultValue: "Build sequence" },
      { id: "process.sequence.rail-summary", label: "Static timeline summary", kind: "text", defaultValue: "Land to handover", help: "Shown in the reduced-motion timeline before a chapter is selected." },
      { id: "process.sequence.rail-aria", label: "Timeline accessibility label", kind: "text", defaultValue: "90-day home build schedule" },
    ], note: "The stage posters also appear in reduced-motion mode. Master-film chapter timing stays fixed." },
    ...processStages.map(([id, days, label, title, copy, poster]): ContentSection => ({
      id: `stage-${id}`, label: `${label} · film chapter`, fields: [
        { id: `process.stage-${id}.days`, label: "Day range", kind: "text", defaultValue: days, help: "Use a short label plus numbers within 01–90 (for example, Days 01–10). The label stays small; the film cue times do not change." },
        { id: `process.stage-${id}.label`, label: "Chapter label", kind: "text", defaultValue: label },
        { id: `process.stage-${id}.title`, label: "Chapter heading", kind: "text", defaultValue: title, help: "Keep to 48 characters so this heading fits over the scroll film." },
        { id: `process.stage-${id}.copy`, label: "Chapter description", kind: "text", defaultValue: copy, help: "Keep to 220 characters so this copy remains readable above the timeline rail." },
        { id: `process.stage-${id}.poster`, label: "Chapter poster", kind: "image", defaultValue: poster },
      ],
    })),
    { id: "details", label: "Five-phase timeline opening", fields: [
      { id: "process.details.eyebrow", label: "Section label", kind: "text", defaultValue: "What happens within the 90 days" },
      { id: "process.details.heading", label: "Section heading", kind: "text", defaultValue: "From brief to handover." },
    ], note: "The five-slide scroll and its day positions stay fixed. Edit wording and photographs in the phase trays below; replacing media does not reorder the film chapters." },
    ...processDetailPhases.map(({ days, title, copy, image, alt }, index): ContentSection => ({
      id: `detail-${index + 1}`, label: `Detail ${index + 1} · ${title}`, fields: [
        { id: `process.details.phase-${index + 1}.days`, label: "Day range", kind: "text", defaultValue: days, help: "Use a short label plus numbers within 01–90 (for example, Days 01–10). The label stays small; this does not move the five-slide scroll positions." },
        { id: `process.details.phase-${index + 1}.title`, label: "Heading", kind: "text", defaultValue: title, help: "Keep to 44 characters for the fixed five-slide composition." },
        { id: `process.details.phase-${index + 1}.copy`, label: "Description", kind: "text", defaultValue: copy, help: "Keep to 240 characters; each phase stays within one scroll scene." },
        { id: `process.details.phase-${index + 1}.image`, label: "Photograph", kind: "image", defaultValue: image },
        { id: `process.details.phase-${index + 1}.alt`, label: "Image description", kind: "text", defaultValue: alt, help: "Describe the actual replacement image; concept imagery must not be presented as documentary photography." },
      ],
    })),

  ] },
  { id: "sustainability", label: siteNavigationItems[4].label, href: "/sustainability", sections: [
    { id: "journey", label: "Opening journey", fields: [
      { id: "sustainability.journey.accessible-label", label: "Accessible journey label", kind: "text", defaultValue: "OKNO sustainability journey" },
      { id: "sustainability.journey.shared-poster", label: "Shared journey poster", kind: "image", defaultValue: "/sustainability/shared-poster.png" },
      { id: "sustainability.journey.idle-video", label: "Opening ambient film", kind: "video", defaultValue: "/sustainability/hero-idle.mp4" },
      { id: "sustainability.journey.scroll-video", label: "Scroll journey film", kind: "video", defaultValue: "/sustainability/scroll-journey.mp4", help: "Keep this film seekable: page scroll scrubs its frames." },
      { id: "sustainability.journey.fog-video", label: "Closing fog loop", kind: "video", defaultValue: "/sustainability/fog-loop.mp4" },
      { id: "sustainability.journey.fog-poster", label: "Closing fog poster", kind: "image", defaultValue: "/sustainability/fog-poster.png" },
      { id: "sustainability.journey.hero-line-1", label: "Hero heading · first line", kind: "text", defaultValue: "Build less" },
      { id: "sustainability.journey.hero-line-2", label: "Hero heading · second line", kind: "text", defaultValue: "against the " },
      { id: "sustainability.journey.hero-emphasis", label: "Hero heading · emphasis", kind: "text", defaultValue: "land." },
      { id: "sustainability.journey.hero-copy", label: "Hero introduction", kind: "text", defaultValue: "An OKNO home begins with what is already there—the slope, the trees, the light and the path water takes." },
    ] },
    ...(["site", "canopy", "production", "longevity"] as const).map((id, index): ContentSection => ({
      id: `journey-${id}`, label: `Journey ${index + 1} · ${id}`, fields: [
        { id: `sustainability.journey.${id}.title`, label: "Scene heading", kind: "text", defaultValue: ["Read the site before drawing the home.", "Keep what already works.", "Move precision work off the land.", "Design for a longer life."][index] },
      ],
    })),
    { id: "material-truth", label: "The material truth", fields: [
      { id: "sustainability.journey.proof-label", label: "Accessible section label", kind: "text", defaultValue: "The material truth" },
      { id: "sustainability.journey.proof-line-1", label: "Heading · first line", kind: "text", defaultValue: "The material" },
      { id: "sustainability.journey.proof-line-2", label: "Heading · emphasis", kind: "text", defaultValue: "truth." },
      { id: "sustainability.journey.proof-copy", label: "Section description", kind: "text", defaultValue: "Site, structure and making are considered as one continuous decision—so the home can belong to the landscape instead of competing with it." },
    ] },
    { id: "proof", label: "Reflections proof opening", fields: [
      { id: "sustainability.proof.opening-line-1", label: "Opening heading · first line", kind: "text", defaultValue: "The land leads." },
      { id: "sustainability.proof.opening-line-2", label: "Opening heading · second line", kind: "text", defaultValue: "The home " },
      { id: "sustainability.proof.opening-emphasis", label: "Opening heading · emphasis", kind: "text", defaultValue: "follows." },
      { id: "sustainability.proof.press-heading", label: "Press heading", kind: "text", defaultValue: "Reflections travelled beyond the forest." },
      { id: "sustainability.proof.press-copy", label: "Press introduction", kind: "text", defaultValue: "Four publications found different stories in the same compact home." },
    ] },
    ...sustainabilityPress.map(([source, date, title, image, alt], index): ContentSection => ({
      id: `press-${index + 1}`, label: `Press ${index + 1} · ${source}`, fields: [
        { id: `sustainability.proof.press-${index + 1}.source`, label: "Publication", kind: "text", defaultValue: source },
        { id: `sustainability.proof.press-${index + 1}.date`, label: "Date", kind: "text", defaultValue: date },
        { id: `sustainability.proof.press-${index + 1}.title`, label: "Headline", kind: "text", defaultValue: title },
        { id: `sustainability.proof.press-${index + 1}.image`, label: "Photograph", kind: "image", defaultValue: image },
        { id: `sustainability.proof.press-${index + 1}.alt`, label: "Image description", kind: "text", defaultValue: alt },
      ],
    })),
    { id: "facts-intro", label: "Facts and final image", fields: [
      { id: "sustainability.proof.final-image", label: "Closing photograph", kind: "image", defaultValue: "/sustainability/reflections-forest-bath.jpg" },
      { id: "sustainability.proof.final-alt", label: "Closing image description", kind: "text", defaultValue: "Forest-facing deck and outdoor bath at the Reflections cabin" },
      { id: "sustainability.proof.final-credit", label: "Closing photograph credit", kind: "text", defaultValue: "Photography · Inclined Studio" },
      { id: "sustainability.proof.facts-heading", label: "Facts heading", kind: "text", defaultValue: "What the coverage points back to." },
      { id: "sustainability.proof.facts-close", label: "Closing statement", kind: "text", defaultValue: "A compact home can still make a large architectural argument." },
    ] },
    ...sustainabilityFacts.map(([value, label], index): ContentSection => ({
      id: `fact-${index + 1}`, label: `Fact ${index + 1} · ${value}`, fields: [
        { id: `sustainability.proof.fact-${index + 1}.value`, label: "Value", kind: "text", defaultValue: value },
        { id: `sustainability.proof.fact-${index + 1}.label`, label: "Description", kind: "text", defaultValue: label },
      ],
    })),
    { id: "ending", label: "Closing statement", fields: [
      { id: "sustainability.ending.eyebrow", label: "Section label", kind: "text", defaultValue: "The next project" },
      { id: "sustainability.ending.heading-line-1", label: "Heading · first line", kind: "text", defaultValue: "Build with what" },
      { id: "sustainability.ending.heading-line-2", label: "Heading · second line", kind: "text", defaultValue: "the land " },
      { id: "sustainability.ending.heading-emphasis", label: "Heading · emphasis", kind: "text", defaultValue: "gives." },
      { id: "sustainability.ending.action", label: "Enquiry button", kind: "text", defaultValue: "Begin a conversation" },
      { id: "sustainability.ending.action-href", label: "Enquiry destination", kind: "text", defaultValue: "/enquiry", help: "Same-site path beginning with /." },
    ] },
  ] },
  { id: "journal", label: siteNavigationItems[5].label, href: "/journal", sections: [
    { id: "hero", label: "Featured story opening", fields: [
      { id: "journal.hero.eyebrow", label: "Section label", kind: "text", defaultValue: "Press coverage" },
      { id: "journal.hero.heading", label: "Hero heading", kind: "text", defaultValue: "News from the practice." },
      { id: "journal.hero.dek", label: "Hero description", kind: "text", defaultValue: "Press coverage and project notes from OKNO." },
      { id: "journal.hero.featured-id", label: "Featured Press story", kind: "text", defaultValue: pressEntries[0].id, help: "Choose a shown Press story, or No featured story. If the selected story is hidden or removed, choose a replacement before publishing." },
    ], note: "The selected Press record supplies the opening card's headline, image, source and link. Edit that record under Press and news below." },
    { id: "press-intro", label: "Press introduction", fields: [
      { id: "journal.press.eyebrow", label: "Section label", kind: "text", defaultValue: "Press coverage" },
      { id: "journal.press.heading", label: "Section heading", kind: "text", defaultValue: "Published stories and project records." },
      { id: "journal.press.caption", label: "Press marquee caption", kind: "text", defaultValue: "In the press" },
      { id: "journal.press.action", label: "Press arrow link label", kind: "text", defaultValue: "Read" },
    ] },
    { id: "publication-ticker", label: "Publication ticker", fields: [
      { id: "journal.publications.accessible-label", label: "Ticker accessibility label", kind: "text", defaultValue: "Publications covering OKNO" },
    ], note: "Publication names and logos come from the Press records below; repeated publication names appear once." },
    { id: "notes-intro", label: "Project records introduction", fields: [
      { id: "journal.notes.caption", label: "Archive marquee caption", kind: "text", defaultValue: "From the archive" },
      { id: "journal.notes.action", label: "Project-note arrow link label", kind: "text", defaultValue: "View" },
    ], note: "The publication ticker above uses the publication names in the press records." },
    { id: "archive", label: "Journal article grid", fields: [
      { id: "journal.archive.heading", label: "Grid heading", kind: "text", defaultValue: "Latest from the Journal" },
      { id: "journal.archive.copy", label: "Grid introduction", kind: "text", defaultValue: "Ideas on sites, spaces, materials and making homes." },
      { id: "journal.archive.action", label: "Article card button", kind: "text", defaultValue: "Read article" },
    ] },
    { id: "article-reader", label: "Article reader", fields: [
      { id: "journal.article.back", label: "Back button", kind: "text", defaultValue: "Journal" },
      { id: "journal.article.breadcrumb", label: "Breadcrumb", kind: "text", defaultValue: "OKNO / Journal" },
      { id: "journal.article.reading-suffix", label: "Reading time suffix", kind: "text", defaultValue: "min read" },
      { id: "journal.article.contents", label: "Contents heading", kind: "text", defaultValue: "In this article" },
      { id: "journal.article.navigation-label", label: "Article sidebar accessibility label", kind: "text", defaultValue: "Article navigation" },
      { id: "journal.article.on-page-label", label: "Contents links accessibility label", kind: "text", defaultValue: "On this page" },
      { id: "journal.article.related", label: "Next story heading", kind: "text", defaultValue: "Read next" },
      { id: "journal.article.closing-heading", label: "Closing heading", kind: "text", defaultValue: "Continue exploring" },
      { id: "journal.article.closing-action", label: "All stories button", kind: "text", defaultValue: "All Journal stories" },
    ] },
  ] },
  { id: "about", label: siteNavigationItems[6].label, href: "/about", sections: [
    { id: "opening", label: "About opening", fields: [
      { id: "about.opening.title", label: "Page title", kind: "text", defaultValue: "About OKNO" },
      { id: "about.opening.line-one", label: "First statement", kind: "text", defaultValue: "Revolutionise construction." },
      { id: "about.opening.line-two", label: "Second statement", kind: "text", defaultValue: "Driving the world's transition to sustainable luxury living." },
      { id: "about.opening.image", label: "Opening photograph", kind: "image", defaultValue: "/about/storyboard/about-film-frame-01.png" },
      { id: "about.opening.image-alt", label: "Opening image description", kind: "text", defaultValue: "An OKNO home in a natural landscape at dusk" },
    ] },
    { id: "vision", label: "Our vision", fields: [
      { id: "about.vision.title", label: "Section title", kind: "text", defaultValue: "Our vision" },
      { id: "about.vision.copy", label: "Vision statement", kind: "text", defaultValue: "As the world turns, it is startlingly apparent that construction, the way it is right now, is wreaking havoc on the environment. We at OKNO aim to be pioneers in sustainable construction for the world at large. We seek to innovate every day, putting people first and earning their trust through our passionate efforts." },
      { id: "about.vision.image", label: "Vision photograph", kind: "image", defaultValue: "/models/forza/interiors/forza-living.webp" },
      { id: "about.vision.image-alt", label: "Vision image description", kind: "text", defaultValue: "An OKNO living space opening toward a natural landscape" },
    ] },
    { id: "future", label: "Fabricating the Future", fields: [
      { id: "about.future.title", label: "Section title", kind: "text", defaultValue: "Fabricating the Future" },
      { id: "about.future.image", label: "Architecture photograph", kind: "image", defaultValue: "/about/storyboard/about-film-frame-02.png" },
      { id: "about.future.image-alt", label: "Architecture image description", kind: "text", defaultValue: "A precision-fabricated OKNO home" },
      { id: "about.future.copy", label: "Section copy", kind: "text", defaultValue: "Our homes, sculpted by esteemed architects, are symphonies of sophistication. With a fusion of eco-conscious design and bespoke craftsmanship, each residence exudes timeless grace. Discover the art of living at OKNO Modhomes, where elegance is eternalised." },
    ] },
    { id: "founders", label: "Meet our founders", fields: [
      { id: "about.founders.title", label: "Section title", kind: "text", defaultValue: "Meet our founders" },
      { id: "about.founders.image", label: "Founders photograph", kind: "image", defaultValue: "/about/okno-founders.jpeg" },
      { id: "about.founders.image-alt", label: "Founders image description", kind: "text", defaultValue: "OKNO Modhomes founders" },
      { id: "about.founders.copy", label: "Founders story", kind: "text", defaultValue: "Our journey started with a simple idea: to make elegant housing solutions that care for our planet. We envisioned spaces where style meets sustainability, where every family can thrive in a cosy, eco-friendly haven. Guided by this vision, we crafted OKNO Modhomes, a place where elegant designs and green living unite. Each home we create reflects our passion for simplicity, blending sophistication with environmental consciousness. With us, you are not just getting a house; you are stepping into a lifestyle that values elegance, sustainability, and the warmth of a home. Welcome to OKNO Modhomes, where your dream living begins." },
    ] },
    { id: "assurances", label: "Why OKNO?", fields: [
      { id: "about.assurances.title", label: "Section title", kind: "text", defaultValue: "Why OKNO?" },
      { id: "about.assurances.sustainability-title", label: "Sustainability title", kind: "text", defaultValue: "Sustainability" },
      { id: "about.assurances.sustainability-detail", label: "Sustainability detail", kind: "text", defaultValue: "certificate" },
      { id: "about.assurances.sustainability-icon", label: "Sustainability icon", kind: "choice", defaultValue: "badge", options: assuranceIconOptions },
      { id: "about.assurances.move-in-title", label: "Move-in title", kind: "text", defaultValue: "90 days move-in" },
      { id: "about.assurances.move-in-detail", label: "Move-in detail", kind: "text", defaultValue: "guarantee" },
      { id: "about.assurances.move-in-icon", label: "Move-in icon", kind: "choice", defaultValue: "calendar", options: assuranceIconOptions },
      { id: "about.assurances.warranty-title", label: "Warranty title", kind: "text", defaultValue: "20 years" },
      { id: "about.assurances.warranty-detail", label: "Warranty detail", kind: "text", defaultValue: "warranty" },
      { id: "about.assurances.warranty-icon", label: "Warranty icon", kind: "choice", defaultValue: "shield", options: assuranceIconOptions },
      { id: "about.assurances.energy-title", label: "Energy title", kind: "text", defaultValue: "Energy-efficient" },
      { id: "about.assurances.energy-detail", label: "Energy detail", kind: "text", defaultValue: "LED lights" },
      { id: "about.assurances.energy-icon", label: "Energy icon", kind: "choice", defaultValue: "bulb", options: assuranceIconOptions },
      { id: "about.assurances.resilience-title", label: "Resilience title", kind: "text", defaultValue: "Earthquake-storm" },
      { id: "about.assurances.resilience-detail", label: "Resilience detail", kind: "text", defaultValue: "resistant" },
      { id: "about.assurances.resilience-icon", label: "Resilience icon", kind: "choice", defaultValue: "home", options: assuranceIconOptions },
    ] },
    { id: "fit", label: "A perfect fit", fields: [
      { id: "about.fit.title", label: "Section title", kind: "text", defaultValue: "A perfect fit. Everywhere, every time." },
      { id: "about.fit.image", label: "Home photograph", kind: "image", defaultValue: "/about/storyboard/about-film-frame-03.png" },
      { id: "about.fit.image-alt", label: "Home image description", kind: "text", defaultValue: "The timber facade and entrance of an OKNO home" },
      { id: "about.fit.copy", label: "Closing copy", kind: "text", defaultValue: "Don't sweat the details; we've taken care of it all for you. Our walls, ceilings, floors, and everything in between are designed and precision-manufactured to work with one another from beginning to end. What you get is a cohesive aesthetic and perfect lines everywhere you look." },
    ] },
  ] },
  { id: "enquiry", label: "Enquiry", href: "/enquiry", sections: [
    enquirySection("intro", "Introduction", [
      ["intro.heading-line-1", "Heading · first line", "Tell us what"],
      ["intro.heading-line-2", "Heading · second line", "you’re building."],
      ["intro.copy", "Introduction", "Bring what you have: a place, an ambition, or the beginning of an idea."],
    ]),
    enquirySection("home-tab", "Home enquiry tab", [
      ["tab-home.label", "Visible tab label", "A home of my own"],
      ["tab-home.accessible", "Accessible form name", "A home of my own"],
      ["home.name.label", "Name · label", "Name"], ["home.name.placeholder", "Name · placeholder", "Your name"],
      ["home.contact.label", "Contact · label", "Phone or email"], ["home.contact.placeholder", "Contact · placeholder", "How we reach you"],
      ["home.land.label", "Land · label", "Where is the land?"], ["home.land.placeholder", "Land · placeholder", "District, state — or still looking"],
      ["home.land-status.label", "Land status · label", "Land status"],
      ["home.land-status.option-1", "Land status · option 1", "I own it"], ["home.land-status.option-2", "Land status · option 2", "I'm buying it"], ["home.land-status.option-3", "Land status · option 3", "I'm still looking"],
      ["home.home-type.label", "Home type · label", "Home type"],
      ["home.home-type.option-1", "Home type · option 1", "Cabins / villas"], ["home.home-type.option-2", "Home type · option 2", "Family home"], ["home.home-type.option-3", "Home type · option 3", "Hospitality"], ["home.home-type.option-4", "Home type · option 4", "Developer project"],
      ["home.timeline.label", "Timeline · label", "Timeline"], ["home.timeline.option-1", "Timeline · option 1", "This year"], ["home.timeline.option-2", "Timeline · option 2", "Next year"], ["home.timeline.option-3", "Timeline · option 3", "Exploring"],
      ["home.submit", "Submit button", "Begin the conversation"],
    ]),
    enquirySection("hospitality-tab", "Hospitality enquiry tab", [
      ["tab-hospitality.label", "Visible tab label", "Hospitality"], ["tab-hospitality.accessible", "Accessible form name", "Hospitality & estates"],
      ["hospitality.name.label", "Name and company · label", "Name & company"], ["hospitality.name.placeholder", "Name and company · placeholder", "You and the developing entity"],
      ["hospitality.contact.label", "Contact · label", "Phone or email"], ["hospitality.contact.placeholder", "Contact · placeholder", "How we reach you"],
      ["hospitality.site.label", "Site · label", "Site location"], ["hospitality.site.placeholder", "Site · placeholder", "District, state"],
      ["hospitality.programme.label", "Programme · label", "Programme"], ["hospitality.programme.option-1", "Programme · option 1", "Cabins / villas"], ["hospitality.programme.option-2", "Programme · option 2", "Resort / Hotel"], ["hospitality.programme.option-3", "Programme · option 3", "Other"],
      ["hospitality.keys.label", "Keys · label", "Keys planned"], ["hospitality.keys.option-1", "Keys · option 1", "5–10"], ["hospitality.keys.option-2", "Keys · option 2", "11–25"], ["hospitality.keys.option-3", "Keys · option 3", "26+"],
      ["hospitality.timeline.label", "Timeline · label", "Timeline to revenue"], ["hospitality.timeline.option-1", "Timeline · option 1", "This year"], ["hospitality.timeline.option-2", "Timeline · option 2", "Next year"], ["hospitality.timeline.option-3", "Timeline · option 3", "Exploring"],
      ["hospitality.submit", "Submit button", "Request the deck"],
    ]),
    enquirySection("press-tab", "Press and other enquiry tab", [
      ["tab-press.label", "Visible tab label", "Press & other"], ["tab-press.accessible", "Accessible form name", "Press & other"],
      ["press.name.label", "Name · label", "Name"], ["press.name.placeholder", "Name · placeholder", "Your name"],
      ["press.contact.label", "Contact · label", "Phone or email"], ["press.contact.placeholder", "Contact · placeholder", "How we reach you"],
      ["press.purpose.label", "Purpose · label", "Publication or purpose"], ["press.purpose.placeholder", "Purpose · placeholder", "Who you write for, or what this is about"],
      ["press.nature.label", "Nature · label", "Nature"], ["press.nature.option-1", "Nature · option 1", "Press feature"], ["press.nature.option-2", "Nature · option 2", "Partnership"], ["press.nature.option-3", "Nature · option 3", "Career"], ["press.nature.option-4", "Nature · option 4", "Other"],
      ["press.submit", "Submit button", "Send enquiry"],
    ]),
  ] },
  { id: "footer", label: "Footer", href: "/about", sections: [
    { id: "footer-brand", label: "Brand line and social row", fields: [
      { id: "footer.brand.line", label: "Brand line", kind: "text", defaultValue: "Live better, live modular." },
      { id: "footer.social.navigation-label", label: "Social links accessibility name", kind: "text", defaultValue: "Social media" },
    ], note: "The footer logo is managed in Shared site settings → Global Brand. Edit each social profile in the next disclosures." },
    ...footerSocialLinks.map(({ id, name, href, icon }) => ({ id: `footer-social-${id}`, label: `${name} profile`, fields: [
        { id: `footer.social.${id}.name`, label: `${name} · name`, kind: "text" as const, defaultValue: name },
        { id: `footer.social.${id}.icon`, label: `${name} · icon`, kind: "image" as const, defaultValue: icon },
        { id: `footer.social.${id}.href`, label: `${name} · destination`, kind: "text" as const, defaultValue: href, help: "Secure HTTPS address. Opens in a new tab." },
      ] })),
    ...footerGroups.map(({ id, heading, links }) => ({ id: `footer-${id}`, label: `${heading} links`, fields: [
      { id: `footer.${id}.heading`, label: "Column heading", kind: "text" as const, defaultValue: heading },
      ...links.flatMap(({ id: linkId, label, href }) => [
        { id: `footer.${id}.${linkId}.label`, label: `${label} · button text`, kind: "text" as const, defaultValue: label },
        { id: `footer.${id}.${linkId}.href`, label: `${label} · destination`, kind: "text" as const, defaultValue: href, help: "Same-site path beginning with /." },
      ]),
    ] })),
    { id: "footer-bottom", label: "Bottom strip", fields: [
      { id: "footer.bottom.copyright", label: "Copyright line", kind: "text", defaultValue: "© {year} OKNO Modhomes", help: "{year} updates automatically to the current year. You may omit it for a fixed line." },
      { id: "footer.bottom.closing", label: "Closing line", kind: "text", defaultValue: "Designed with intent." },
    ] },
  ] },
  { id: "shared", label: "Shared site settings", href: "/", sections: [
    { id: "header", label: "Header", fields: [
      ...(["Home", "Projects", "Models", "Hospitality", "Process", "Sustainability", "Journal", "About"] as const).map(label => ({ id: `header.nav.${label.toLowerCase()}`, label: `${label} link`, kind: "text" as const, defaultValue: label })),
      { id: "header.action.enquire", label: "Enquiry button", kind: "text", defaultValue: "Enquire" },
      { id: "header.menu.open", label: "Open menu button", kind: "text", defaultValue: "Menu" },
      { id: "header.menu.close", label: "Close menu button", kind: "text", defaultValue: "Close" },
      { id: "header.menu.navigation-label", label: "Menu navigation name", kind: "text", defaultValue: "Site navigation" },
      { id: "header.menu.mobile-navigation-label", label: "Mobile navigation name", kind: "text", defaultValue: "Mobile navigation" },
      { id: "header.menu.open-accessible", label: "Open button accessible name", kind: "text", defaultValue: "Open navigation" },
      { id: "header.menu.close-accessible", label: "Close button accessible name", kind: "text", defaultValue: "Close navigation" },
      { id: "header.nav.accessible-label", label: "Primary navigation name", kind: "text", defaultValue: "Primary navigation" },
    ], note: "Links retain their fixed routes. The logo is edited in Global Brand below." },
    { id: "global-brand", label: "Global Brand", fields: [
      { id: "brand.logo.light", label: "Logo on dark backgrounds", kind: "image", defaultValue: "/assets/projects/brand/okno-modhomes-white.svg", help: "Use a transparent, high-resolution image. Preview the logo on all site backgrounds before publishing." },
      { id: "brand.logo.dark", label: "Logo on light backgrounds", kind: "image", defaultValue: "/assets/projects/brand/okno-modhomes-white.svg", help: "Provide a dedicated dark treatment when the new brand needs one." },
      { id: "brand.logo.compact", label: "Compact brand mark", kind: "image", defaultValue: "/assets/projects/brand/okno-modhomes-white.svg" },
      { id: "brand.logo.icon", label: "Browser icon", kind: "image", defaultValue: "/favicon.ico" },
      { id: "brand.logo.alt", label: "Brand accessible name", kind: "text", defaultValue: "OKNO Modhomes" },
    ], note: "This one asset set updates standalone logos across active pages, including the Footer logo. Artwork embedded in a film or photograph requires replacement media." },
  ] },
];

export function allContentFields(pages: readonly ContentPage[] = adminPages): ContentField[] {
  const unique = new Map<string, ContentField>();
  const walk = (items: readonly ContentPage[]) => {
    for (const page of items) {
      for (const section of page.sections) for (const field of section.fields) unique.set(field.id, field);
      walk(page.children ?? []);
    }
  };
  walk(pages);
  for (const section of legacyCollectionSections) for (const field of section.fields) if (!unique.has(field.id)) unique.set(field.id, field);
  for (const field of legacyOptionFields) if (!unique.has(field.id)) unique.set(field.id, field);
  for (const field of retiredHeroFields) if (!unique.has(field.id)) unique.set(field.id, field);
  return [...unique.values()];
}

export const contentFieldsById = new Map(allContentFields().map(field => [field.id, field]));
