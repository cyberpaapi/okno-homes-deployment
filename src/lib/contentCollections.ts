export type ContentItem = { id: string; fields: Record<string, string> };
export type ContentCollections = Record<string, ContentItem[]>;

export type CollectionField = {
  key: string;
  label: string;
  kind: "text" | "image" | "video" | "url" | "json" | "choice" | "model";
  required?: boolean;
  help?: string;
  options?: readonly { label: string; value: string }[];
};

export type CollectionDefinition = {
  id: string;
  pageId: string;
  label: string;
  itemLabel: string;
  fields: readonly CollectionField[];
  maxItems?: number;
};

const signatureModels = ["forza", "kray", "gaze", "tengo", "trib", "octapod"] as const;
const enquiryOptionGroups = [
  ["home.land-status", "Land status options"], ["home.home-type", "Home type options"], ["home.timeline", "Home timeline options"],
  ["hospitality.programme", "Hospitality programme options"], ["hospitality.keys", "Hospitality keys options"],
  ["hospitality.timeline", "Hospitality timeline options"], ["press.nature", "Press nature options"],
] as const;

export const collectionDefinitions: readonly CollectionDefinition[] = [
  {
    id: "signature.models", pageId: "signature", label: "Signature model roster", itemLabel: "model", maxItems: 24,
    fields: [
      { key: "name", label: "Model name", kind: "text", required: true },
      { key: "configuratorMode", label: "3D experience", kind: "choice", options: [{label: "Walkthrough configurator", value: "auto"}, {label: "Previous viewer", value: "legacy"}] },
      { key: "configuratorModel", label: "3D house GLB", kind: "model" },
      { key: "configuratorSource", label: "Linked 3D model", kind: "text" },
      { key: "configuratorScale", label: "Metres per model unit", kind: "text" },
      { key: "finish_ext_roof", label: "External roof default finish", kind: "text" },
      { key: "meshes_ext_roof", label: "External roof mesh names", kind: "text" },
      { key: "finish_ext_wall", label: "External wall default finish", kind: "text" },
      { key: "meshes_ext_wall", label: "External wall mesh names", kind: "text" },
      { key: "finish_flooring", label: "Flooring default finish", kind: "text" },
      { key: "meshes_flooring", label: "Flooring mesh names", kind: "text" },
      { key: "finish_int_ceiling", label: "Internal ceiling default finish", kind: "text" },
      { key: "meshes_int_ceiling", label: "Internal ceiling mesh names", kind: "text" },
      { key: "finish_int_wall", label: "Internal wall default finish", kind: "text" },
      { key: "meshes_int_wall", label: "Internal wall mesh names", kind: "text" },

      { key: "orbitFilm", label: "Scroll rotation film", kind: "video" },
      { key: "detailFilm", label: "Explore detail film", kind: "video" },
      { key: "poster", label: "Opening poster", kind: "image" },
      { key: "posterAlt", label: "Poster description", kind: "text" },
      { key: "exploreAction", label: "Explore button", kind: "text" },
      { key: "features", label: "Three story cards", kind: "json" },
      { key: "gallery", label: "Preview images", kind: "json" },
    ],
  },
  {
    id: "signature.plans", pageId: "signature", label: "Signature plans", itemLabel: "plan", maxItems: 120,
    fields: [
      { key: "modelId", label: "Owning model", kind: "text", required: true },
      { key: "name", label: "Plan name", kind: "text", required: true },
      { key: "area", label: "Published internal area", kind: "text", required: true },
      { key: "price", label: "Published starting price", kind: "text", required: true },
      { key: "spaces", label: "Spaces and features", kind: "text", required: true },
    ],
  },
  ...(["homes", "explore", "okno"] as const).map((slot): CollectionDefinition => ({
    id: `footer.links.${slot}`, pageId: "footer", label: `${slot[0].toUpperCase()}${slot.slice(1)} links`, itemLabel: "link", maxItems: 20,
    fields: [
      { key: "label", label: "Link text", kind: "text", required: true },
      { key: "href", label: "Same-site destination", kind: "text", required: true, help: "Start with / and keep the link on this website." },
    ],
  })),
  {
    id: "home.variants", pageId: "homepage", label: "Hero openings", itemLabel: "opening", maxItems: 24,
    fields: [
      { key: "name", label: "Opening name", kind: "text", required: true },
      { key: "template", label: "Animation template", kind: "choice", required: true, options: [{ label: "Forest V1", value: "v1" }, { label: "Nighttime scroll V2", value: "v2" }] },
      { key: "openingVideo", label: "Intro film · V1", kind: "video", help: "V1 only. V2 starts on its cave still and has no intro." },
      { key: "poster", label: "Opening poster", kind: "image", required: true },
      { key: "scrollVideo", label: "Scroll journey film", kind: "video", help: "V2: leave empty for the approved lossless frame film." },
      { key: "endImage", label: "Journey ending still", kind: "image" },
      { key: "introFirstFrame", label: "Loading still (intro first frame) · V1", kind: "image" },
      { key: "introLastFrame", label: "Intro handoff still · V1", kind: "image" },
      { key: "tagline", label: "Still-frame tagline · V1", kind: "text", help: "V1 only. Shown over the frozen intro frame; leave empty to hide." },
      { key: "openingAlt", label: "Poster description", kind: "text", required: true },
      { key: "endAlt", label: "Interior image description · V1", kind: "text" },
      { key: "accessibleTitle", label: "Accessible page title", kind: "text" },
      { key: "endingHeading", label: "Ending headline · V2", kind: "text" },
      { key: "endingDescription", label: "Ending supporting text · V2", kind: "text" },
      { key: "endingPrimaryLabel", label: "Ending primary link text · V2", kind: "text" },
      { key: "endingPrimaryHref", label: "Ending primary destination · V2", kind: "text" },
      { key: "endingSecondaryLabel", label: "Ending secondary link text · V2", kind: "text" },
      { key: "endingSecondaryHref", label: "Ending secondary destination · V2", kind: "text" },
    ],
  },
  {
    id: "projects.globePins", pageId: "projects", label: "Globe pins", itemLabel: "pin", maxItems: 100,
    fields: [
      { key: "label", label: "Place label", kind: "text", required: true, help: "Shown on the globe; no project page or photograph is needed." },
      { key: "latitude", label: "Latitude", kind: "text", required: true, help: "North/south decimal degrees, from −90 to 90." },
      { key: "longitude", label: "Longitude", kind: "text", required: true, help: "East/west decimal degrees, from −180 to 180." },
    ],
  },
  {
    id: "projects.records", pageId: "projects", label: "Projects", itemLabel: "project", maxItems: 200,
    fields: [
      { key: "status", label: "Publication status", kind: "choice", options: [{ label: "Published", value: "active" }, { label: "Archived", value: "archived" }] },
      { key: "slug", label: "Project page address", kind: "text", help: "Unique address after /projects/. Existing records use their stable ID until changed." },
      { key: "slugHistory", label: "Previous page addresses", kind: "json", help: "Saved redirects for earlier project addresses." },
      { key: "showInProjects", label: "Show on Projects page", kind: "choice", options: [{ label: "Show", value: "true" }, { label: "Keep in library only", value: "false" }] },
      { key: "title", label: "Project title", kind: "text", required: true },
      { key: "category", label: "Project type", kind: "text" },
      { key: "location", label: "Project detail location", kind: "text", help: "Shown on this project's detail page only. Edit globe pins separately above the project library." },
      { key: "description", label: "Description", kind: "text" },
      { key: "coverSrc", label: "Cover photograph", kind: "image", required: true },
      { key: "coverAlt", label: "Cover description", kind: "text", required: true },
      { key: "gallery", label: "Gallery photographs", kind: "json", help: "Ordered gallery items. Use the photograph controls below when available." },
      { key: "films", label: "Films", kind: "json", help: "Ordered film items. Use the film controls below when available." },
      { key: "previewSrc", label: "Showcase preview film", kind: "video" },
      { key: "previewPoster", label: "Showcase film poster", kind: "image", help: "If omitted, the cover photograph is used." },
    ],
  },
  {
    id: "hospitality.selectedWork", pageId: "hospitality", label: "Selected work", itemLabel: "selection", maxItems: 100,
    fields: [
      { key: "projectId", label: "Project", kind: "text", help: "Choose a published project. Older standalone entries are preserved separately." },
      { key: "nameOverride", label: "Display name override", kind: "text" },
      { key: "kindOverride", label: "Category override", kind: "text" },
      { key: "descriptionOverride", label: "Description override", kind: "text" },
      { key: "galleryPhotoId", label: "Project gallery photograph", kind: "text", help: "Choose a published photograph from the linked project's gallery." },
      { key: "imageSrcOverride", label: "Photograph override", kind: "image" },
      { key: "imageAltOverride", label: "Photograph description override", kind: "text" },
    ],
  },
  {
    id: "journal.articles", pageId: "journal", label: "Journal articles", itemLabel: "article", maxItems: 200,
    fields: [
      { key: "recordId", label: "Stable article identity", kind: "text", help: "Internal identity retained when the page address changes." },
      { key: "slugHistory", label: "Previous page addresses", kind: "json", help: "Redirects from earlier article URLs." },
      { key: "category", label: "Category", kind: "text", required: true },
      { key: "title", label: "Article title", kind: "text", required: true },
      { key: "excerpt", label: "Introduction", kind: "text", required: true },
      { key: "image", label: "Cover photograph", kind: "image", required: true },
      { key: "imageAlt", label: "Cover description", kind: "text", required: true },
      { key: "heroCaption", label: "Cover caption", kind: "text" },
      { key: "sections", label: "Article sections", kind: "json", required: true },
    ],
  },
  ...(["press", "notes"] as const).map((kind): CollectionDefinition => ({
    id: `journal.${kind}`, pageId: "journal", label: kind === "press" ? "Press and news" : "Project notes", itemLabel: kind === "press" ? "news item" : "project note", maxItems: 200,
    fields: [
      { key: "visibility", label: "Visibility", kind: "choice", options: [{ label: "Shown on the site", value: "shown" }, { label: "Hidden from the site", value: "hidden" }], help: "Hide temporarily without removing this editable record. Remove archives it with Restore available." },
      { key: "kind", label: "Story type", kind: "text" },
      { key: "source", label: "Publication or source", kind: "text", required: kind !== "press" },
      { key: "byline", label: "Byline", kind: "text" },
      { key: "date", label: "Date", kind: "text" },
      { key: "title", label: "Headline", kind: "text", required: true },
      { key: "summary", label: "Summary", kind: "text" },
      { key: "image", label: "Main photograph", kind: "image", required: kind !== "press", help: kind === "press" ? "Optional for news. Text-only cards remain publishable." : undefined },
      { key: "imageAlt", label: "Photograph description", kind: "text", required: kind !== "press", help: kind === "press" ? "Required when a photograph is supplied." : undefined },
      { key: "credit", label: "Photograph credit", kind: "text" },
      { key: "href", label: "Destination", kind: "url", required: true },
      { key: "external", label: "Open as external link", kind: "choice", options: [{ label: "No", value: "false" }, { label: "Yes", value: "true" }] },
      { key: "logo", label: "Optional publication logo", kind: "image" },
    ],
  })),
  ...signatureModels.map((slug): CollectionDefinition => ({
    id: `signature.gallery.${slug}`, pageId: "signature", label: `${slug.charAt(0).toUpperCase()}${slug.slice(1)} preview images`, itemLabel: "image", maxItems: 50,
    fields: [
      { key: "label", label: "Image button text", kind: "text", required: true },
      { key: "image", label: "Preview image", kind: "image", required: true },
      { key: "alt", label: "Image description", kind: "text", required: true },
    ],
  })),
  ...enquiryOptionGroups.map(([group, label]): CollectionDefinition => ({
    id: `enquiry.options.${group}`, pageId: "enquiry", label, itemLabel: "option", maxItems: 40,
    fields: [
      { key: "label", label: "Visible option", kind: "text", required: true },
      { key: "value", label: "Stored value", kind: "text", required: true, help: "Keep this stable when changing the visible wording." },
    ],
  })),
];

export const collectionDefinitionsById = new Map(collectionDefinitions.map(definition => [definition.id, definition]));
export const collectionDefinitionsForPage = (pageId: string) => collectionDefinitions.filter(definition => definition.pageId === pageId);
