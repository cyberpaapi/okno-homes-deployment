# Admin completion plan — approved, with 7 October press clarification

Date: 6 October 2026, revision 3, approved for implementation. The 7 October clarification keeps article and project-note photographs required, but permits Press/news records without a photograph, publication logo, source name, date or credit. A Press/news headline and valid destination remain required. This plan supersedes the 5 October scope and earlier 6 October proposals in `admin-system.md`. Execution status and test evidence are tracked separately in `admin-build-checklist-2026-10-06.md` and `admin-test-checklist-2026-10-07.md`. This is the local Markdown planning record; no external issue tracker is used.

**7 October Projects-globe addendum:** The user reports the pin rendering is fixed and explicitly releases the globe-admin deferral. The project library now gains an editor-controlled place lookup, selectable candidate, editable decimal latitude/longitude and publish-time validation. A published visible project with a location must have a coordinate pair; no pin is invented from its title or media. The geographic globe consumes published project coordinates and keeps each pin attached to the sphere while rotating. Existing unassigned preview pins remain only until a real project pin exists; they are not presented as confirmed client project sites. Process remains deferred. This addendum supersedes only the globe exclusions below; it does not authorize changing the globe's visual design, the public project layout or client site facts.

**7 October Footer addendum:** The user says the shared footer is built and explicitly releases its prior content exclusion. Add a dedicated Footer editor after Enquiry for brand line, four social names/HTTPS destinations/icons, all three fixed navigation column headings and their existing link labels/same-site destinations, and bottom copyright/closing copy. Keep the Global Brand logo central. Preserve the approved footer geometry, route-specific tones and animation; no variable-column redesign is implied. Verify two local publish/restore passes on the live site using the expiring demo token. This addendum supersedes only the Footer content exclusion below; Process remains deferred.

**7 October Signature area/price addendum:** The client owns the public area and starting-price display wording for each existing Signature plan, including Gaze. The editor must put these next to that plan and publish them directly to the Signature opening and Explore specification panel. No separate confirmation workflow or external catalogue source is required for those public strings. Keep stable plan IDs and the existing 3D/configurator workflow; this request does not establish a checkout calculator or alter geometric data. This decision supersedes the earlier catalogue-confirmation requirement for public Signature display wording in the Models section below.

## Version and scope

- Active checkout: `OKNO-homes-final-showcase-2026-09-23`, declared version `final-showcase-2026-10-05`.
- Website stays on `http://127.0.0.1:3134`; admin stays on `http://127.0.0.1:3140/admin`. One website process, existing admin gateway, no additional ports.
- Include Home, Projects except the globe, Models (selector, Signature, Bespoke and customer-facing configurator copy), Hospitality, Sustainability, Journal, the current About page, Enquiry, Header and Global Brand.
- Only the Projects globe is deferred until the user finishes its repair. Project text, preview films, photographs and detail galleries are included now. Do not change globe coordinates, pin motion or rendering in this phase.
- Process content/scroll work is deferred in full while the user changes its lower sequence. Preserve existing wiring/content and do not expose unfinished controls as verified; only shared logo inheritance is covered by Global Brand.
- Footer layout/content is excluded, with one explicit exception: its logo inherits Global Brand. Other Header settings stay scoped to Header. Global Brand also updates standalone logos on otherwise deferred pages without changing their content, scroll or globe behavior.
- Hospitality is included in this proposed scope because the user now says its page is complete. Preserve its current visual composition.
- Hero V2 is still being designed. Its current implementation is a draft baseline; refresh the source audit before wiring changes to it.
- Preserve approved public layouts, animations, cursor, responsive behavior and model interactions. Content controls do not become layout/style/code editors.

## What the current source audit established

| Area | Current evidence and resulting work |
| --- | --- |
| Home | `HomeVariant.tsx` has a fixed V1/V2 selection. Both openings reuse `LandingExperience.tsx`. Adding variants needs a stored collection and a template-driven opening renderer. |
| Signature | `ForzaExperience.tsx` already uses one continuous orbit MP4 per model plus a detail-quality derivative. All 12 files were probed: H.264, 24 fps, 648p/1080p, approximately 7.83–8.08 seconds. No initial stitching is needed. Partial content consumers exist, but the Signature admin section is still empty and `signatureStories` is unused. This is unfinished work. |
| Models/Bespoke | Selector and Bespoke content wiring was added before interruption. It needs a complete field audit and end-to-end verification against the current source. |
| Projects/Hospitality | `/projects/[slug]` currently uses static project lookup and `dynamicParams = false`. Runtime project creation needs route/data changes. Hospitality has a separate project array, not shared project IDs; migration must preserve its existing selections and imagery instead of assuming the lists match. |
| Brand | Header and Footer already share `Brand/OknoLogo`; additional page logos and brand treatments need an active-route inventory. One central record must replace scattered asset paths without silently leaving old logos behind. |
| Journal | Six article cards now open real `/journal/[slug]` reading pages. The article route currently permits only prebuilt slugs. Existing overrides cover card fields, but not article body sections, detail imagery, links or publication icons. Runtime additions require both route and content-store changes. |
| About | `/about` renders `AboutExperience` → `ui/about-section.tsx`. Most existing About IDs remain consumed by this current page. The vision photograph and description are hard-coded and must be added; old unused About components are not the target. |
| Sustainability | The latest page has four photographic press states, a full-viewport ivory facts sheet and the restored closing CTA. Preserve the 6 October image defaults, pacing and sheet composition. |
| Enquiry | Current labels, placeholders, option captions and actions have partial CMS wiring. The form currently prevents submission; editing its content does not add an enquiry-delivery service. |
| Content storage | The current store accepts only predefined string field IDs and local media uploads. Arbitrary new heroes/articles/blocks cannot be implemented honestly by adding buttons alone. Structured collections, migration and publish support are required. |

## Admin organization and common editing behavior

The sidebar order is Home → Projects → Models → Hospitality → Process (deferred) → Sustainability → Journal → About → Enquiry → Shared site settings (Header, Global Brand). Projects expands into Opening, Showcase, Project library with Add project, individual project galleries, and Globe (deferred). Hospitality has a Selected work menu linked to that library. Models expands into Overview, Signature, Configurators and Bespoke. Home expands into Published homepage, hero variants and Shared lower sections. Every page displays its sections in public screen order. A deferred entry explains why it is unavailable; it is not an empty editor or a completion claim.

Each section expands into its own content fields. Collections display a compact item list with a selected-item editor in a side panel. Long article bodies use nested ordered blocks. Closed media sections do not mount full video players. The user sees human-readable labels and thumbnails, with technical IDs kept out of the normal editing view.

Common controls: edit, replace media, save draft, preview, publish this page/collection, restore original, discard draft and restore a previous published revision. Collection items also support add, duplicate, reorder, hide and archive. Archive removes an item from the published collection after publishing but retains recoverable content and media. Unsaved edits remain visible when moving between sections, with an explicit discard action.

Draft typing updates the embedded preview without changing public content. Publishing commits a complete validated page/collection snapshot and notifies open website tabs; a polling fallback handles a lost live connection. Preview updates preserve the current scroll position except when an opening variant or media scene must restart. Controls show saving, processing, ready, published and failed states clearly.

Existing 21st.dev-derived sidebar, accordion, tabs, buttons, textarea and upload patterns remain the foundation. Any new drawer, collection action, reorder control, icon picker or confirmation UI must use actual retrieved 21st.dev source, recording URL, author, component ID and adaptation in `admin-system.md` before implementation. Search results alone are insufficient provenance.

## Page-by-page content and structure

### 1. Home and hero variants

**Opening variants:** place an **Add hero variant** button at the top of the Home admin page. Create a named draft by selecting or duplicating a supported opening template. Assign a stable ID and preview URL, then supply that template's intro video, ambient loop, scroll video where applicable, opening/end posters, image descriptions, accessible title and any visible heading/button text. Show only media slots used by the chosen template.

V1's forest/scroll opening and V2's intro-to-loop opening are the initial templates. A different video can change the visual story within these interactions. A wholly new interaction or animation mechanism requires a new coded template; uploading a film does not create arbitrary interaction logic.

Each variant reuses the same lower-page content record. Do not copy the lower-page component tree or create drifting copies of its text. Keep `/hero-v1` and `/hero-v2` working, and give future variants their own preview address. Selecting **Use on homepage**, then publishing, sets `/` to that variant. Keep at least one usable variant; archiving the active variant requires selecting its replacement in the same publish transaction.

**Shared lower sections, in order:**

1. 90-day timeline: heading, button label/destination, day ranges, milestone titles/descriptions, image, caption and image description.
2. Signature preview: title lines, description, button label/destination, rotation film, poster/image and descriptions.
3. Bespoke preview: title lines, background word, description, button label/destination, background/inset images and descriptions.
4. Sustainability preview: title lines, copy, button label/destination, ambient film, poster and descriptions.
5. Journal/About previews: each card's title, copy, image, image description and button label/destination.

**Add/remove:** hero variants can be added, duplicated, reordered and archived. Shared lower sections keep their current structure in this scope. V2 stays a draft while its design work continues.

### 2. Projects — non-globe content included

Keep the approved page composition. The current opening is a logo/atlas entrance, not a standalone intro movie. Expose the actual cinema preview films below rather than inventing an unused intro-video field. If the user's next revision introduces a separate opening film, re-audit and map its real source before adding that control.

| Public section | Editable fields | Collection/layout rules |
| --- | --- | --- |
| Entrance | Loading message and Global Brand logo reference | The logo is managed centrally; entrance timing remains fixed. |
| Opening | Eyebrow, title lines, supporting paragraph, Our projects button label and section destination | Preserve the atlas entrance and heading composition. |
| Cinema showcase | Per-project display title, cover/fallback photograph and alt, preview-loop video and poster, associated project destination, existing playback/navigation accessible labels | Existing preview clips exist for Forrest, Kray Sangareddy and Lakewood. Other records may have no preview film and retain a photograph; a missing film must not break the showcase. |
| Project index | Project title, thumbnail and alt, existing project destination | Preserve the current image/title-only design. Do not reintroduce previously removed descriptions or Read more buttons. |
| Project detail heading | Project title, All places return-link label/destination, Photographs and Films tab labels | Common labels editable once with clearly identified consumers. Stable project slugs do not change when titles change. |
| Photographs | Each image, alt description, order and preview thumbnail; any currently rendered caption | Add, duplicate, replace, reorder and archive images. Lightbox and masonry consume the same record. Do not add public captions where none currently exist. |
| Films and film dialog | Each film source, poster, title, order and accessible playback/close labels | Add, replace, reorder and archive films. Film chooser and modal use the same records. No films means no dead film trigger or empty Films tab. |

Seed all seven existing projects without losing any media:

| Project | Photographs | Full films |
| --- | ---: | ---: |
| Forrest | 12 | 2 |
| Kioo | 10 | 0 |
| Kray Sangareddy | 8 | 3 |
| Lakewood Villa | 10 | 1 |
| Octapod Layana | 10 | 5 |
| Rasa Vikarabad | 10 | 0 |
| Trib BirdsEye | 3 | 0 |

**Project library and Add project:** add, duplicate, edit, reorder, archive and restore projects. Each record has a stable internal ID, editable title, unique slug, type/category, short description, cover photograph/alt, gallery photographs, optional showcase preview film/poster, optional full films/posters/titles, and draft/published status. Location display text is optional; no coordinates are required while globe integration is deferred. An incomplete record can always be saved as a draft.

Publishing requires title, unique valid slug, cover photograph and alt. Type and short description are required when selecting it for Hospitality's descriptive Selected work presentation. Gallery images, preview film and full films are optional. A film requires a valid media source, title and a supplied or generated poster. If the detail gallery is empty, use the cover as a single-image fallback. Deleting an open image/film moves selection to a remaining item or closes the empty viewer safely.

Publishing a new project must create a working `/projects/[slug]` page, metadata and index entry without a code edit/rebuild. Offer an explicit Show in Projects control and showcase ordering; the shared library can also hold hospitality-only records without silently adding them to the Projects listing. Hospitality selection is independent, explicit and never automatic for every new project. Non-globe showcase/index views use the published library; the globe remains on its current data and new projects receive no invented pin.

Titles may change without changing IDs/slugs. A deliberate published-slug change retains a redirect. Before archiving, show every reference, including Hospitality and a future globe association; require removal/replacement of active selections in the same validated publish operation. Do not silently break a published card. An archived URL returns a consistent unavailable response or explicit replacement redirect. Media originals remain recoverable.

**Migration:** preserve the seven current Projects records and all listed media. Reconcile Hospitality's Forrest, Miraya, Nova Valley, Layana Farms and Project Thiru against the library by verified identity, not similar names. Add unmatched records as hospitality-only entries with their existing cover/copy. Do not assume Layana Farms equals Octapod Layana without evidence. Retain the current Hospitality image using a linked library image or presentation override; migration must not replace it with a different cover. Existing content remains visually unchanged until an intentional edit is published.

**Future globe integration — specified, not implemented now:** after the user's repair, expose a stable project association, pin/display heading, location label, city/country and confirmed latitude/longitude. A typed location can request lookup suggestions; the admin selects a result, verifies it on a preview map and saves the coordinates. Allow manual correction. Do not guess real coordinates from image folders or names, geocode during rendering, or let positions drift during rotation. Keep geographically anchored pins, borders, graticules and latitude/longitude meaning. Provider choice and integration depend on the completed globe baseline; no lookup service is selected or claimed working now.

### 3. Models

**Overview:** opening heading, supporting line, each Signature/Bespoke selector card's heading, label, description, image, image description and button text. Keep both choices and their destinations.

**Signature:** model groups appear in the current order: Forza, Kray, Gaze, Tengo, Trib, Octapod. For each model expose:

- Model display name and model/variant copy; plan names, area, price display and specification text must read the appropriate shared catalogue record, so the model page and configurator do not acquire conflicting copies.
- One **Replace rotation video** action representing the logical master. Media preparation produces the scroll and detail-quality derivatives plus poster; advanced media inspection can show them without requiring two separate uploads.
- Poster, image description and accessible rotation description.
- Each of the three scroll feature headings and descriptions.
- Explore details button, collection label, scroll instruction, loading text, plan-filter captions and availability wording.
- Details overlay: the complete field inventory and dynamic gallery below, not only the main model story.

**Signature Explore details — exact editing hierarchy:**

| Editor group | Editable content | Rules |
| --- | --- | --- |
| Heading and plan selector | Collection eyebrow, model display name, plan/variant display names, close-button accessible text | Shared names belong to the catalogue; stable variant IDs must not depend on editable names. |
| Left specification panel | Internal area label and value/unit/display, Starting price label and displayed price, Delivery label and value, Spaces label and ordered room/space descriptions | Keep numerical area/price and display values consistent. One canonical catalogue editor supplies Signature and configurators. Do not change pricing formulas through a copy override. |
| Main action | Configure button label/template and supported destination for each model; Explore details label outside the panel | Preserve existing Tengo/Kray configurator links and enquiry destinations for other models. Preview the full resolved label including the model name. |
| Detail information boxes | Built indoors eyebrow, Factory precision and Landscape presence lines; Included eyebrow and warranty text | Each visible string is separately named in its actual box, not merged into an unrelated text stack. |
| Gallery/preview images | Stable image ID, image upload, alt, image caption/tab-button label, ordering and crop/focal point where supported | Add, duplicate, replace, reorder and archive images per model. Existing five images are initial data, not a five-image limit. |
| Branding | Any brand logo actually rendered by the Signature experience, its asset/alt or accessible label | Reference Global Brand, not a competing per-model logo copy. No fake slot if the component does not render one. |
| Scroll feature cards | Each of the three feature-card eyebrows, headings and descriptions | Include the currently hard-coded Signature detail eyebrow. Keep feature timing and position fixed. |

**Gallery and long-label behavior:** zero detail images uses the model poster with no empty thumbnail bar; one image needs no redundant selector; multiple images use the existing gallery presentation with accessible wrapping or horizontal scrolling. Image fit preserves aspect ratio and the frame; replacements do not stretch the image or collapse its space. Tab/button labels wrap without clipping, overlap or forced ellipsis; buttons can grow vertically and retain a usable touch target. Long prices, specification values and action labels must fit at phone widths. After deleting/reordering a selected image, retain selection by stable ID when possible, otherwise select a valid neighbor. Preview labels and captions always refer to the same image record.

Keep the current orbit direction, angle mapping, scroll response, detail overlay and model selector presentation. Existing files are already single orbit videos. If a future source arrives as ordered angles or clips, preparation may combine the sequence into one model master, but it must preserve framing and sequence and must not combine different models into one video.

**Bespoke — exact section order:**

| Section | Editable fields |
| --- | --- |
| Opening | Background photograph/alt, layered BESPOKE word, eyebrow and both heading lines. |
| Manifesto | Eyebrow, three heading lines, body paragraph, photograph and alt. |
| Glyph portal | Portal photograph and alt; its brand silhouette references the Global Brand mask role, preserving the transition mechanism. |
| Place, Brief, Form, Atmosphere | Each stage's label, detail line, body copy, photograph/alt and next-step label; next-stage target stays associated with a stable stage ID. |
| Result | Background image/alt, ONE PLACE and ONE HOME words, inset image/alt, eyebrow and result heading. |
| Loading state | Existing rendered loading copy and Global Brand logo reference/description. |

The current Bespoke body is photographic, not video-based. Do not add a nonfunctional video field or replace its design with video. Decorative shaders and four-stage movement remain fixed; brand mask artwork can change through Global Brand with a compatible asset and preview.

**Configurators:** map customer-facing headings, labels, help text, buttons and catalogue-provided names/media. Preserve the existing product-data workflow for geometry, materials, configurations and pricing rules. Shared catalogue values should have one editing destination rather than independent overrides. Distinguish a replaceable showcase film from an interactive 3D asset.

**Add/remove:** Signature gallery images are repeatable. Keep the current model roster, product variants, three feature positions, two selector cards and four Bespoke stages fixed for this phase. Adding a model or changing product geometry is separate from replacing content on an existing model.

### 4. Hospitality

Map the current page in this order:

| Section | Editable fields |
| --- | --- |
| Opening | Built to welcome / Designed to scale heading parts, photograph, alt, caption and Begin a project label/destination. Preserve the current Silk-backed photographic opening. |
| Capability bento | Each of five cards: eyebrow, value, title, photograph and alt. Groups remain Estate scale, Opening path, Site, Finish and Aftercare, with editable display wording. |
| Selected work | Section heading; searchable project-library selector with thumbnail/title/status, selected-project order and cover choice. Name/type/description default to the linked project. Optional Hospitality-specific description and image overrides are clearly labelled, with Reset to project default. |
| Delivery introduction | Delivery path label, Brief to opening heading, displayed range, cover photograph and alt. |
| Seven delivery stages | Private consultation, Site study, Design curation, Craftsmanship, Delivery, Installation and Opening: displayed number, title, description, supporting photograph and alt. Desktop/mobile use one record per stage. |
| Closing | Begin a hospitality conversation heading; Hospitality enquiry button label and destination. |

**Selected work menu:** search the shared project library, select/deselect projects, reorder them and preview the exact gallery. Default to published projects; selecting a draft shows a warning and cannot publish a dead reference. The current five selections are initial content, not a permanent limit. No duplicate selection of the same project ID. Unselecting removes it only from Hospitality, not from the library or Projects page. Choose a photograph from that project's media or a clearly labelled presentation override. Global project edits update inherited fields everywhere; local overrides stay explicit. Keep the current photograph viewer behavior; any project detail link must use the canonical published route.

**Add/remove:** enable Selected work selection/removal/reordering with 0/1/2/many layouts. Zero hides the entire Selected work section; one has no redundant next/previous controls; more entries reflow within the existing editorial grid without empty columns or tiny compressed images. Recalculate gallery motion and viewer selection safely. Keep five capability cards and seven timeline stages fixed, with all content replaceable.

### 5. Process — content/scroll deferred; shared logo inheritance only

Do not implement further Process content controls, film preparation or lower-scroll changes now. Preserve existing values, consumers and assets while the user completes the bottom sequence. Keep a clearly labelled deferred page entry.

For the later re-audit, retain this inventory as provisional, not approved execution scope: opening label/heading/summary/instruction, poster and loading copy; master film and desktop/mobile derivatives; currently six chapters with day range/label/title/copy/poster; currently five lower timeline steps with day range/title/copy/image/alt. Refresh counts, source owners and cue boundaries after the user's changes. A replacement film must be aligned to the finished sequence, not assumed to match old timing.

### 6. Sustainability

| Section, in public order | Editable fields |
| --- | --- |
| Opening | Heading lines, emphasized words and supporting paragraph. |
| Journey media | Idle film, scroll-journey film, fog-loop film, shared poster, fog poster and meaningful media descriptions. Show separate roles, not an ambiguous video stack. |
| Journey statements | Site, canopy, production and longevity stage titles; map any rendered supporting text found in the final audit. Preserve stage count and cue relationships. |
| Material truth | Heading and body copy. |
| Proof/press introduction | Opening proof statement, press heading and supporting copy. |
| Four photographic records | Publication/source, displayed date, headline, photograph, alt and any rendered credit. Preserve their ordered photographic sequence. |
| Final photograph | Photograph, alt and photographer/source credit, preserving the current Inclined Studio attribution unless the replacement has different rights/credit. |
| Ivory facts sheet | Four records, each with value and description. No text hidden in a layout-only component. |
| Ending | Eyebrow, heading lines/emphasis, button label and enquiry destination. |

Include any additional actually rendered caption/accessibility label discovered in the pre-implementation diff audit. Preserve the 6 October Reflections imagery, pacing and full-viewport ivory sheet. Photographs remain required for these composed Sustainability scenes.

**Add/remove:** fixed four story stages, four press records and four facts. Preserve the latest 6 October design, imagery defaults and pacing. Media can be replaced; replacing a scroll film includes cue/seek validation.

### 7. Journal, press and article pages

Journal needs structured collections rather than six fixed preview slots. Keep the current public sequence: opening/featured story → press introduction and cards → publication ticker → project-note marquee → article grid.

**Page-level fields:** opening heading/supporting copy and featured-record choice; press introduction heading/copy; any visible publication-ticker label; project-note section heading/copy; article-grid heading and action labels. Expose only text actually rendered in the current components, not new filler headings. Featured news reads its chosen record rather than a second independently editable copy. Publication names/logos in the ticker derive from the same press records with duplicate sources consolidated. Record titles, dates and source labels are edited inside their own ordered item, not in a separate page-wide text list.

**Journal articles:** an **Add journal article** button creates a draft with title, stable slug, category, excerpt, cover image, image description, caption/credit and article body. Each body section can contain a heading, paragraphs and an image with description/caption; support adding, duplicating, reordering and removing these sections. Seed the six current articles, including their detail images and full existing text, without rewriting them. The admin side panel mirrors their reading order.

Publishing a new article creates its usable reading URL and card without a code edit or rebuild. Article metadata, on-page contents navigation and related stories use the same published record. Existing links remain stable when the title changes. If a published slug is deliberately changed, retain a redirect. Archived articles leave the grid/related lists; their prior URL gets a consistent unavailable response or a chosen replacement redirect.

**Press/news records:** allow add, duplicate, edit, reorder, hide and archive. The 7 October clarification permits text-only news. Required to publish: headline and valid destination URL. Publication/source name, photograph, icon/logo, date and credit are optional, except legally required attribution. If a photograph is supplied, its alt description is required. Incomplete drafts remain savable. Use validated image uploads or an approved icon picker, not raw SVG/script markup. Internal routes and external HTTPS links retain their intended behavior. The first published press record currently drives the featured opening card; a separate explicit featured-story selector remains to implement.

| Available news media | Public/editor behavior |
| --- | --- |
| Photograph and publication logo | Keep photo panel and publication identity. |
| Photograph, no publication logo | Keep the same photo panel; publication identity is text only with no empty icon box or generic replacement icon. |
| No photograph, with or without logo/source | Publish a deliberate text-first card and featured treatment; retain an optional photo control in the editor with no missing-image warning. If no source is supplied, omit the publication ticker entry. |

These rules apply to editor preview, marquee and featured news. A runtime failure of a supplied photo is distinct from intentionally omitting a photo: do not pretend an upload succeeded or silently treat a broken asset as text-only news. Logo failure falls back to publication text where present. Optional date/credit omission removes separators and excess space. No invented dates or photographs.

**Article template requirements remain separate:** title, unique stable slug, category, excerpt, cover image/alt and at least one meaningful body section are required to publish. Detail/body images and captions are optional; each body block keeps the approved typography and spacing whether text-only or illustrated. Article reading-page controls include the back link, top line, cover caption, contents heading, Read next heading and closing/back-link text. Reading time is derived from the body, not an unrelated manual field. Body sections use stable IDs so contents anchors survive reorder/title edits.

**Project-note marquee:** allow the same collection actions. Fields: source, project/date label, headline, image, image description, credit and internal/external destination. The publication ticker follows current press-source records and does not keep removed names.

**Layout rules after additions/removals:**

- Preserve card proportions, source/icon hierarchy, spacing and existing typography; handle long titles with intentional wrapping.
- Article grids reflow for any supported item count without blank placeholder cards.
- Empty optional collections hide their complete section and associated heading/spacing.
- One marquee item uses a stable presentation; multiple items produce a measured loop without stretching or visible gaps. Any duplicated loop items are decorative and do not create duplicate keyboard stops.
- Related articles exclude the current article, deleted items and duplicates, and show only available records. With no alternatives, hide the related block.
- Removing the featured record requires a replacement choice or an intentional hero-without-feature state before publishing.
- Recalculate marquee width and scroll geometry after content/image changes without jumping the reader back to the top.

**Add/remove:** enabled for articles, article body sections, press records and project notes. Top-level Journal design sections retain their current templates; a collection may disappear cleanly when empty.

### 8. About — current page only

Target `src/components/ui/about-section.tsx`, reached through the current `/about` route.

| Section | Editable fields |
| --- | --- |
| Opening | Title, photograph and alt. |
| Purpose | Both statement parts with their existing emphasis/composition. |
| Vision | Heading, copy, photograph and alt; the currently hard-coded living-room image must gain a real consumer and editor. |
| Future | Heading, copy, photograph and alt. |
| Founders | Heading, copy, photograph and alt. |
| Why OKNO | Section heading and five assurance rows: sustainability/certificate, move-in, warranty, energy and resilience. Each has title, detail and approved icon choice. |
| Closing fit section | Heading, copy, photograph and alt. |

Include meaningful accessible labels owned by these sections. Icon choices do not change the five-row design.

**Add/remove:** fixed sections and five assurance rows. Preserve the current Silk/ivory presentation and motion. Do not map the unused historic About timeline as if it were on this page.

### 9. Enquiry

Map the opening heading/copy, Home/Hospitality/Press tab labels, form names, field labels, placeholders, helper/error text that actually exists, dropdown labels/options and submit-button text. Provide option add/remove/reorder controls with stable stored values and a valid default. Keep required contact fields and submission keys stable.

| Form/group | Specific content covered |
| --- | --- |
| Introduction | Both heading lines, explanatory copy, three tab names and accessible tab labels. |
| Home | Name, contact and land fields; land-status, home-type and timeline dropdown captions/options; submit label. |
| Hospitality | Name, company, contact, site, programme, keys and timeline fields, all current placeholders/help/options, and submit label. |
| Press | Name, contact, purpose and nature fields, current placeholders/help/options, and submit label. |
| Form feedback | Existing required-field, invalid-value and other rendered feedback copy. Add success/delivery wording only alongside an actual backend response, not a fake success message. |

Preview every changed option in its real field. Removing an option cannot leave a stale selected value; select the configured default or an unselected prompt. Preserve the current document-flow Enquiry section and reachable shared footer.

The editor and public dropdowns must remain usable with long option lists, keyboard navigation and small screens. Handle internal scrolling without trapping page scroll or hiding actions. Scrollbar appearance itself is part of the approved UI, not an arbitrary style setting.

**Add/remove:** dropdown options can change within existing fields. Keep the three form types and required field structure. Current form submission does not send data; a recipient, delivery endpoint and delivery testing are a separate enquiry-backend decision, not a claim made by this content-admin work.

### 10. Shared Header

Map desktop/mobile navigation labels, Home/Enquire text, Menu/Close text and accessible navigation labels. Logos reference Global Brand's light/dark assets rather than Header-specific overrides. Keep desktop and mobile labels synchronized. Use route-aware link choices and preserve existing destinations and menu order. Navigation/text edits remain scoped to Header so separate Footer work is unaffected.

**Add/remove:** no arbitrary navigation entries or routes in this phase. Hero variants are managed inside Home. Footer layout/content, global cursor, shader settings and animation internals remain outside the editor.

### 11. Global Brand — one logo system across the active site

Add Shared site settings → Global Brand with light-surface and dark-surface logo previews, then a Where this appears list. The global record owns the primary wordmark, required contrast variants, accessible brand/home-link text, compact mark where used, browser icon and compatible brand mask artwork where used. Roles may share one asset when it works; do not require redundant uploads. Preserve transparency, intrinsic proportions and supplied colours; do not recolour a multicolour brand with a CSS filter automatically.

Audit active route imports and rendered logos in Header/mobile navigation, Footer, page entrances/loaders, Signature, hero openings and Bespoke brand masks. Distinguish real active owners from unused historical components. Replace standalone image/inline-vector/CSS logo sources through the same central record. A compatible alpha/silhouette asset supplies masks without rewriting their animation. Show every usage against its actual background and size before global publish; any required missing contrast or mask asset blocks that brand publish with an explanation, not a silent old-logo fallback.

Footer logo inheritance is the only exception to its content/layout exclusion. Shared branding may appear on Process and Projects while their content/globe work is deferred; do not alter their scene geometry, timings or pins. Global publication switches one validated versioned asset set, with cache-safe URLs, to avoid stale mixed branding; a failed upload retains the previous complete set. Restoring a brand revision restores all roles together.

Brand artwork baked into a photograph/video cannot be changed by a logo URL. Identify those media in the usage audit and flag them as Requires replacement media; allow their existing media workflow to supply a corrected asset. Do not promise automatic pixel/video editing or silently report complete rebranding while embedded marks remain. Brand replacement does not rewrite all editorial mentions of OKNO or introduce a general company-renaming workflow.

## Required versus optional — publish rules

Every editor marks Required or Optional, keeps the Photo/Media panel visible where required, and allows incomplete drafts. Publish errors link to the exact field. Uploaded replacements must be ready and decodable; clearing a required asset cannot remove it from the public site. Existing records migrate without silently dropping content; unresolved requirements are reported before publishing the affected record.

| Record | Required to publish | Optional |
| --- | --- | --- |
| Project | Title, unique slug, cover photo and alt | More gallery photos, preview film, full films, location text; type/description become required for Hospitality selection. |
| Hospitality selection | Published project reference, cover/alt, type and short description inherited or explicitly supplied | Presentation-specific image/copy override; additional selected projects. |
| Journal article | Title, unique slug, category, excerpt, cover photo/alt, at least one meaningful body section | Publication logo, detail/body images, captions, date; attribution when not required by rights. |
| Press/news | Headline and destination link; alt if a photo is supplied | Publication name, main photo, publication logo/icon, date and non-mandatory credit. |
| Journal project note | Headline, source/project label, destination, main photo and alt | Date, publication logo/icon and non-mandatory credit. |
| Hero variant | Name, template and media/poster roles that template actually needs | Unused roles are not shown; optional copy only where the template supports it. |
| Fixed page slots | Existing structural headings/actions and essential media; destination for a visible action | Supporting copy/captions only where omission has a defined clean layout. |
| Global Brand | Valid primary logo plus usable assets for every currently used contrast/mask role; accessible brand text | Unused logo roles; one compatible asset may serve multiple roles. |

## Responsive text and image-quality contract

- Preserve all edited wording. Headings, labels, buttons, cards and captions grow/wrap instead of clipping, overlapping or shrinking into unreadable type. Do not apply silent truncation or hidden line clamps to content. Long unbroken tokens get safe wrapping. Fixed cinematic scenes get measured space/scroll recalculation; if content exceeds a safe scene budget, show an explicit editor validation message rather than publishing cut-off text.
- Check original copy, short copy, 2–3× longer copy, long model/project names, long prices and URLs across desktop, tablet and 320–430px phone widths, plus browser zoom. Test dropdown and dialog internal scroll without trapping page scroll or hiding close/publish actions.
- Preserve uploaded originals. Use sharp responsive derivatives appropriate to display size/device pixel ratio, correct orientation, transparency and colour handling; do not distort, apply unrequested filters or pretend low-resolution input is high-resolution. Show resolution guidance and a warning for visibly undersized assets before publication.
- Show the full uploaded image in the media panel alongside exact desktop/mobile slot previews. Maintain the current slot's proportions. Full-image/contain presentation is used where the whole image is required; existing edge-to-edge cover slots show their unavoidable crop explicitly, with focal-point adjustment. Never silently stretch an image or promise both zero cropping and an incompatible fixed aspect ratio. Full gallery/lightbox views retain access to the complete image.
- Reserve image geometry while loading to avoid layout jumps. Lazy-load offscreen media, keep full players unmounted when closed, and measure scroll behavior after collection changes. Verify network failures and slow media without blank broken controls.

## Add/remove boundaries for approval

| Area | Add/remove/reorder enabled | Structure kept fixed |
| --- | --- | --- |
| Home | Template-based hero variants | Shared lower sections; new animation code is not generated from an upload. |
| Projects | Projects themselves, detail photographs and films; showcase ordering | Stable IDs/routes after publication; globe deferred. |
| Signature | Each model's Explore gallery images | Six models, product variants and three feature positions per model. |
| Models overview / Bespoke | None at section level | Two model-type choices and four Bespoke stages. |
| Hospitality | Selected work project references and their order | Five capability cards and seven delivery stages; gallery adapts to selected count. |
| Process | None in this phase | Content/scroll deferred; shared logo inheritance only. |
| Sustainability | None at section level | Four journey statements, four photographic records, four facts. |
| Journal | Articles, article body sections, news and project notes | Existing page/reading templates; empty optional collection sections hide cleanly. |
| About | None at section level | Current sections and five assurance rows. |
| Enquiry | Options inside existing dropdowns | Three forms, required contact fields and submission keys. |
| Header / Global Brand | Replace brand asset set; no arbitrary navigation entries | Current destinations/order; Footer layout/content excluded, logo inherits globally. |

All included fixed slots still allow their text and actual media to be replaced. Archive is the default removal operation, recoverable through history; originals are not deleted automatically. New layout builders, arbitrary CSS, globe internals, Process content/scroll changes, Footer editing beyond global logo inheritance and automatic creation of product geometry are outside this approval.

## Media preparation and smooth scrolling

1. Upload into a draft media job with progress, cancellation and clear supported-format/size guidance. Inspect actual decodable media, dimensions, duration, frame rate and orientation; do not trust the filename alone.
2. Preserve the original. Produce browser-compatible, constant-frame-rate derivatives suited to the existing player, with frequent keyframes, seekable metadata and appropriately sized desktop/mobile output. Extract a poster with an editable crop/focal point where the layout supports it.
3. Show a scroll-scrub preview and media status. Check forward/backward seeking, first/last frames, aspect ratio, loop seam where relevant and chapter/feature alignment.
4. Prepare in the background without blocking the editor. Publish media references atomically only when the complete required set is ready. A failed upload/transcode keeps the previous published asset working.
5. Keep public playback bounded to the active/visible scene; pause offscreen/hidden-tab activity and preserve reduced-motion stills. Test with the actual page, not only the video player.

Smooth seeking can be improved by encoding and player behavior. A source with abrupt angle cuts, missing frames or discontinuous motion still needs a better source or editorial correction; do not promise that any uploaded film automatically becomes visually continuous.

## Storage, migration and implementation sequence after approval

The first implementation target remains the authenticated local demo on the fixed ports. External deployment/shared storage is a separate hosting decision. Preserve existing published values, drafts and originals while migrating to a versioned content document with fixed page fields and ID-based collections. Every add/remove/reorder/replace operation participates in draft, publish, history and conflict handling.

1. Capture the current source/content baseline and finish exact field/logo ownership inventory; refresh pages being worked on elsewhere, especially Hero V2. Keep globe and Process content/scroll deferred; Footer layout/content excluded. Audit standalone versus baked-in logos.
2. Add the structured content schema, migration, collection APIs, validation and revision-safe page/collection publishing. Verify existing overrides survive migration.
3. Add the reusable collection editor/side panel and retrieve/document the actual 21st.dev source for any new controls. Verify create/duplicate/reorder/archive/restore with keyboard and touch.
4. Implement the media preparation jobs and verify one Signature replacement before applying the workflow across models and scroll-video pages.
5. Implement Home variant creation and homepage selection with the shared lower-page record.
6. Complete Models/Signature/Bespoke, Header and Global Brand, including catalogue consistency, repeatable galleries and long-label layout. Build the shared project library/runtime routes and reference-safe publication, migrate existing Projects/Hospitality records, then implement the Hospitality selector. Complete Sustainability, current About and Enquiry; preserve Process content/scroll and globe internals.
7. Implement Journal collections, article body editing, runtime article routes, featured selection, text-only-news/optional-logo validation, links/icons and all collection-count layouts.
8. Run end-to-end acceptance and record the exact verified coverage, remaining limitations and start commands in the working docs.

## Acceptance before calling the admin complete

- Every declared editable field visibly updates its real current page in draft preview, persists after reload and updates an already-open public page after publishing. Public pages never read unpublished drafts.
- Hero: create a variant, upload its required media, preview it, publish it to `/`, switch back and archive safely; shared lower content stays identical across variants.
- Signature: replace one model master; edit each detail box, price/specification and action label; add/delete/reorder gallery images; verify 0/1/many images and long labels at phone widths. Confirm scroll/detail playback and Explore/Configure controls; the original presentation remains unchanged with original content and catalogue values stay consistent.
- Projects/Hospitality: preserve original records/media and visible selections; create a new project and open its new URL without rebuilding. Select it in Hospitality, reorder/unselect it, publish shared edits, and verify both routes. Test draft references, duplicate IDs/slugs, archive dependencies, redirects, 0/1/2/many selections, optional films and empty-gallery cover fallback. No new globe pins or coordinate changes.
- Journal: create a seventh article with image/text sections and a working route; add/remove/reorder press and project notes. Publish a photo news card with and without a publication logo, then a text-only news card. Verify a missing article/project-note photo blocks publish but permits draft save; a supplied news photo needs alt. Test failed assets, missing optional source/date/credit, long text, related stories and archives.
- Global Brand: publish and restore a test logo set; inspect all active standalone logo/mask usages, light/dark backgrounds, mobile/header/footer and deferred-page shells. Check proportions, contrast, cache refresh and no stale old standalone logo. Record baked-in media exceptions explicitly. Footer layout/content and Process content/scroll remain unchanged; globe internals remain untouched.
- About/Hospitality/Sustainability/Enquiry/Header: check each source-owned section, desktop/mobile views and all media types actually used. Run the long-text/image-quality contract and verify no clipped text, stretched images or accidental crops. Existing globe defects are not a claim of admin completion or a task to fix in this phase.
- Recover correctly from a cancelled/invalid upload, a failed media job, stale saves, competing tabs and restoring a previous revision.
- Verify video seeking/byte ranges, deferred media loading, hidden-tab behavior, keyboard focus and reduced motion. Compare scroll behavior to the pre-change baseline; inspect console/network errors and layout overflow.
- Run TypeScript, relevant functional tests, zero-warning lint and a production build. Coordinate the build with the fixed website process so its serving assets are not overwritten mid-session. Then verify the built admin and website together on 3140/3134.

Approval was given in the user's subsequent request to divide the task and keep working. Any later material scope change still needs a separate decision; completion is recorded only in the live build checklist.
