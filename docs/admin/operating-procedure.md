# OKNO Admin Content Studio — Standard Operating Procedure

> Historical version 1.0 implementation guide. Staff should use the [production-only version 2.0](production-operating-procedure.md), the text companion to the illustrated production PDF.

**SOP ID:** OKNO-ADMIN-001  
**Version:** 1.0 · 15 October 2026  
**Audience:** The website owner, content editors and the person maintaining the website.  
**Applies to:** The current Final Showcase admin implementation. Screens and available features on a deployed version may differ until those changes are released.

## 1. What this guide is for

Use this procedure to change website copy, photographs, films, fonts, project records, model information, Journal entries and supported links through the admin page. A **draft** is saved work that visitors cannot see. **Publish** makes saved drafts available to visitors in the environment you are editing.

The normal sequence is:

**Connect → choose page → edit → save each field or collection → review draft → publish → verify the actual website → disconnect.**

Two rules prevent most publishing mistakes:

1. **Seeing a change in the preview does not mean it has been saved or published.** The embedded preview can show unsaved changes from the current tab.
2. **Publish applies all saved drafts across the website in that environment.** It is not limited to the selected page. Coordinate with anyone else editing before publishing.

## 2. Choose the correct environment

| Environment | Admin address | Public website | What Publish changes |
| --- | --- | --- | --- |
| Local Final Showcase | [127.0.0.1:3140/admin](http://127.0.0.1:3140/admin) | [127.0.0.1:3134](http://127.0.0.1:3134) | The local website and local content store |
| Documented production deployment | [Production admin](https://okno-homes-deployment.vercel.app/admin) | [Production website](https://okno-homes-deployment.vercel.app) | The production content store, when available |

Local publishing does **not** deploy source code or copy local content/media to production. A working local editor does not establish that production storage is available. Production availability was not checked while writing this SOP; its previous storage failure remains a separate operational issue until freshly verified. See the [release record](../deployment/release-ledger.md).

### Starting the local admin

This is needed only when the local address is unavailable. If it already works, reuse it.

1. Open a terminal in the canonical checkout:

   ```sh
   cd "/home/CodeAcc2007/Coding/Alphacode AI/OKNO Homes Website/OKNO-homes-final-showcase-2026-09-23"
   npm run admin
   ```

2. Wait for the launcher to report readiness, then open **http://127.0.0.1:3140/admin**.
3. Keep that terminal available while editing. The gateway reuses the website process on 3134 or starts it if needed. Do not launch another Next.js instance or invent another port.
4. If startup reports a port conflict or an unrelated checkout, ask the maintainer to identify it. Do not terminate arbitrary processes.

The local services were deliberately stopped after the memory-pressure report. Writing this guide did not start them. For technical startup details, see [Start the website](../start-the-website.md).

## 3. Connect and understand the screen

1. Enter the existing owner-provided action key in **Admin token**.
2. Select **Connect** or press Enter. Look for **Editor connected** or the local test-token connection message.
3. Keep the key private. Do not put it in screenshots, change logs, page text or support messages.

Access is held in this tab's memory. Reloading the admin or choosing **Disconnect** clears access from the tab; it does not rotate the key or remove saved drafts. An expiring local test token is different from the configured owner key.

| Screen area | Purpose |
| --- | --- |
| **Pages in website order** | Choose the page or nested Home/Models editor. On phones, expand this control to reveal navigation. |
| **Sections** | Expand a section matching the part of the public page you want to edit. Read any section note. |
| **Page content** | Edit fields and collections beside the embedded preview. |
| **Draft site preview** | Give the embedded draft preview more room. It still includes draft/unsaved edits. |
| **Open page** | Open the standalone public page. This is the place to verify published results. |
| **Save draft** | Save the adjacent field privately. It does not save every other edited field. |
| **Save [collection name]** | Save the entire named list, including its order and nested item edits, as a draft. |
| **Publish N drafts** | Publish all currently saved field and collection drafts across the environment. |
| **Reload preview** | Reload a slow embedded preview; this does not save or publish content. |
| **Disconnect** | Clear this tab's access and unsaved editor state. Save intended work first. |

**N drafts** counts saved field/collection entries, not the number of pages, photographs or individual list items changed. Labels such as **Matches live site** and **Matches saved collection** compare editor values with stored values; they are not a substitute for opening the public page.

## 4. The standard editing and publishing procedure

### A. Prepare a small change batch

1. Confirm local versus production using the address bar.
2. Check whether the Publish button already shows saved drafts. If those belong to someone else or their purpose is unclear, coordinate before publishing.
3. Record the intended pages, old wording or asset references, and proposed replacement. This gives you a reliable way to undo a mistake.
4. Work in one connected admin tab. Keep only one additional public page open for verification.

### B. Edit and save

1. Choose the page and open its relevant section.
2. Change a short, related group of fields. Preserve deliberate line breaks and keep headings/labels concise enough for their layout.
3. Review the embedded preview. It is useful for early feedback, but can show unsaved changes.
4. Select **Save draft** for **every edited field**. Wait for the saved-as-draft message after each save.
5. For a collection, finish its related item edits and select its **Save [collection name]** action. Changes inside a list are not saved by a nearby scalar field's Save draft button.
6. If an error appears, follow the message. Do not assume an upload, save or publication succeeded because the preview changed.

There is no general **Save all** action in the current editor. The Signature roster/plans have their own combined save action, described below.

### C. Review before publishing

1. Review every saved draft in your batch, including related lists or other pages affected by shared settings.
2. Check spelling, required image descriptions, link destinations, record order and media loading.
3. Confirm that all intended edits were saved. Unsaved text can remain visible in the preview while being omitted from Publish.
4. Confirm with other editors that the environment's remaining saved drafts are ready to go live.

### D. Publish and verify

1. Select **Publish N drafts** once.
2. Wait for **Published revision [number]**. Record that number. If the request fails, publication is not confirmed.
3. Use **Open page** and inspect the standalone public page. A visible page normally checks for content changes about every 2.5 seconds; allow a few seconds, then refresh once if needed. Background tabs may wait until visible again.
4. Check the changed section, its links and any related pages. Use the acceptance checklist in section 11.
5. If practical, reload/reconnect the admin after first saving all intended work, and confirm the values are still present. Remember that reload clears tab access and unsaved edits.
6. Log the result and select **Disconnect** when finished. Close extra verification tabs.

**Example:** To replace a Hospitality title and photograph, edit the title, upload the photograph, update its description, save each affected field or the owning collection, review the draft, then Publish. Verify both the Hospitality card and any linked Project page affected by the change.

## 5. Fonts and numeric text sizes

### Change the master font

1. Open **Shared site settings → Master font**.
2. Choose the desired font. The default is **Geist OKNO · Sustainability**.
3. Save its draft, then inspect several pages before publishing. A master-font change can alter line wrapping throughout the website.
4. Publish and check at least Home, Hospitality, Signature, a long text page, Header and Footer at phone and desktop widths.

Available choices are Geist OKNO, Manrope, Bodoni Moda, System sans serif and System serif. Uploading arbitrary font files is not part of this interface. Font choices do not replace logo artwork.

### Change one section's font or size

1. Open the page and the relevant section.
2. Expand **Fonts and numeric text sizes**.
3. Use **Body font**, **Heading font** or **Highlight font** to change the corresponding text treatment. **Use master font** follows the shared font choice; highlighted text follows the section's heading font when inherited.
4. To change size, enter a plain number such as `18` or `18.5` in the relevant role and viewport field:

   | Role | Intended use |
   | --- | --- |
   | Large titles | Prominent display text |
   | Headings | Main headings or large values |
   | Subheadings | Secondary headings or supporting card text |
   | Body text | Paragraphs and longer descriptions |
   | Small text | Labels, captions and small controls |

5. Values are **pixels**, from **6 to 400**, with at most **one decimal place**. Enter `18`, not `18px`.
6. **Desktop** applies above **700px** width, including tablets wider than that. **Phone** applies at **700px and below**. The two entries are independent; filling desktop does not automatically fill phone.
7. Save each changed control, review the draft, Publish, and check the actual affected text.

**Leave a size blank to keep its original responsive design.** Original values may change with viewport width; blank does not mean zero. **Use original** clears a size override in the form; save and publish that blank value to restore the public default. For font fields, Use original returns to the field's source default.

Controls apply to the text roles used by the section, not to every individual word. Several elements can share a role. A role with no matching text in a section has no visible effect. Collection items generally inherit their owning section. If a number affects the wrong group of text, return it to blank and report the page/section rather than enlarging several unrelated controls to compensate.

Check card alignment, word wrapping, long labels, fixed-height panels and button clearance after any size/font change. The former five forced global size presets are superseded. See the [current typography record](../numeric-typography-2026-10-15.md).

## 6. Photographs, logos and films

### Replace an image

1. Select the correct image field or collection item.
2. Choose **Drop a replacement here, or browse**, **Upload photograph** or the corresponding **Replace image** control.
3. Use JPEG, PNG, WebP, AVIF or GIF, up to **100 MB per file**. Choose an image that suits the frame; no crop editor is provided here.
4. Wait until upload/checking completes and the replacement appears.
5. Enter a meaningful image description in the related description/alt field, for example: “Timber cabin beside a lake at dusk.” This helps users who cannot see the photograph. A credit/byline is a separate field.
6. Save the image field and its description, or save the owning collection. Review framing on phone and desktop, then publish and verify.

An uploaded file is not automatically a saved draft or a publication. Do not remove old files manually from storage while content may still reference them.

### Replace a film

1. Use the matching video control and choose MP4 or WebM, up to **100 MB**.
2. Keep one upload/preparation task active at a time. Wait through **Uploading original**, preparation and ready-to-stage messages. Use **Cancel upload** if necessary.
3. Inspect any warning, play the prepared result, and check the opening/poster and final frame before saving.
4. For scroll-controlled films, check forward movement, reversal and the ending on the standalone page. A video that plays normally is not by itself proof that scroll seeking works.
5. Save the related fields or collection, publish and repeat the public-page check.

For an existing Signature model's **Replace rotation master film**, one upload prepares the rotation film, Explore detail film and poster. **Save the rotation master** stages that prepared set together. Review all three. A custom model's media is saved through **Save Signature models and plans**.

Home/Process replacements must fit the existing authored composition. Uploading a film does not redesign scroll timing, scene order or geometry. Private media masters and production workflows stay outside the website repository.

### Replace shared brand assets

Use **Shared site settings → Global Brand** for the dark-background logo, light-background logo, compact mark, browser icon and brand accessible name. Inspect the provided brand preview and real Header/Footer backgrounds. Changing the master font does not change these images. A logo embedded inside a photograph or film requires replacement media.

The upload picker supports the image formats listed above. Existing SVG/ICO asset paths can be present, but this does not mean the picker accepts new SVG/ICO uploads; ask the maintainer to prepare an appropriate asset when needed.

## 7. Where to edit each part of the website

| Admin area | Edit here | Public checks after publication |
| --- | --- | --- |
| **Home → Published homepage** | Hero openings collection and choice of live opening | `/`, plus the intended opening and ending |
| **Home → Hero V1 / Hero V2** | Variant-specific fields and the shared lower-home sections | `/hero-v1`, `/hero-v2` and `/` when selected |
| **Projects** | Intro, independent Globe pins, Project library and shared detail-page labels | `/projects`, changed project details and linked Hospitality cards |
| **Models overview** | Signature/Bespoke selector text and images | `/models` |
| **Models → Signature models** | Shared controls, model media/story/Explore, preview galleries, roster and plans | Model selector, relevant plan filters, Explore dialog and Configure destination |
| **Models → Bespoke** | Opening, manifesto, process/stage and result copy/images | `/models/bespoke` through the full relevant sequence |
| **Hospitality** | Opening, benefit cards, selected project work, timeline and closing copy | `/hospitality`, card rows, gallery and project links |
| **Process** | Opening, film-related copy/media, day labels and five-phase details | `/process`, scroll journey, timeline and footer reachability |
| **Sustainability** | Existing opening/story/proof/facts copy, images and relevant links | `/sustainability`, each affected scene and facts panel |
| **Journal** | Opening/featured story, Press and news, Project notes and Journal articles | `/journal`, changed cards, article pages and external destinations |
| **About** | Existing page sections and media | `/about`, including long text and closing content |
| **Enquiry** | Intro, form-tab copy and ordered dropdown options | `/enquiry`, Home, Hospitality and Press/other tabs |
| **Footer** | Brand line, social profiles, three link lists and bottom strip | Several page endings, including light/dark backgrounds |
| **Shared site settings** | Master font, Header wording/accessibility and Global Brand | Header/menu and logos across several page types |

The order of sections follows the public page. Use the disclosure title and its note to locate the right field. A field described as an accessible name may affect assistive technology rather than visible copy. An empty/deferred section is not a promise that its layout or structure can be edited.

### Home opening changes

1. In **Published homepage**, edit the appropriate record in **Hero openings** and save that collection.
2. Choose the intended **Homepage hero** under **Choose the live opening**, then save that field.
3. Review the chosen variant and shared lower page. Publish once both the opening record and selection are ready.
4. Check `/` directly. Viewing a variant preview does not select it as the live homepage.

Added openings use the existing Forest V1 or Nighttime scroll V2 template. They do not create new animation templates. V2's scroll-film field may intentionally stay blank to use its approved frame sequence. Keep the selected opening in the collection; publication rejects a missing selection. Lower-home edits are shared, so inspect both variants when changing them.

### Projects and independent globe pins

**Project record:** Add/edit its title, unique page address, cover and description, category/location, gallery and optional films. Each gallery photograph needs a description; each film needs a video, poster and title. Save **Projects**, then publish.

**Show in Projects** controls inclusion in the Projects showcase/index. Turning it off keeps an active record in the shared library/Hospitality picker. **Archive project** is different: it removes the project from active publication. Use **Undo** for a recent archive or **Restore project** in Archived projects, then save and publish. Before archiving, review Hospitality selections that reference it.

When changing a page address, use the provided address field and move focus out of it so validation/commit completes. Use lowercase letters, numbers and hyphens. The editor retains previous addresses for redirects; verify the new address and an old published address after publication. Avoid editing raw address history.

**Globe pin:** Select **Add location pin**, enter a place label, then **Find coordinates** and choose the correct result, or enter decimal coordinates manually. Latitude is −90 to 90; longitude is −180 to 180. Changing the place label clears coordinates, so choose them again. Save **Globe pins**, publish and check the actual globe location. A pin does not create a project page, and a project does not automatically create a pin.

### Hospitality Selected work

1. Add/open a selection and choose its linked active project with the project picker.
2. Leave display name/description overrides blank to inherit project content. Supply a suitable category/description in either the project or override fields.
3. Choose the project cover, one of its gallery photographs, or upload a custom photograph with its own description.
4. Choose one image source. Selecting a project photograph replaces that card's custom photograph without editing the Project gallery.
5. Reorder or remove selections, then save **Selected work**, publish and check the cards and destinations.

Older standalone cards may be preserved. Confirm their actual identity before linking them to a named project. If a referenced gallery photograph is removed later, review its Hospitality selections before publishing.

### Signature models and plans

1. Open the relevant model tray. Existing built-in models have field-level media, story and Explore controls plus a preview-image collection.
2. Use the model's **Plans, areas and prices** to add/edit/reorder its plans. Area and starting price are public display text: include units and approved wording, such as `376 sq ft` or `Price on request`.
3. Save individual scalar edits and preview-image collections with their own buttons. Save roster/plan changes with **Save Signature models and plans**. One save does not cover every kind of edit in the tray.
4. Keep at least one model overall and at least one plan for each retained model. Removing a model also removes its owned plans from the current draft lists.
5. For a newly added model, choose a stable unique ID before publication; complete prepared media/poster and descriptions, Explore button text, all three story cards, at least one described preview image and a complete plan.
6. Save, preview and publish. Check each changed model and plan, the opening specifications and Explore details. Test Configure's destination without assuming it creates new geometry.

Area/price edits do not change the 3D model or calculate a checkout total. Adding a model does not create a dedicated 3D asset; custom models use the supported enquiry path until a separate configurator integration exists. **Restore removed models** can recover available defaults/history records; inspect restored plans before saving.

### Journal articles, notes and Press

**Article:** Choose **Add article** or open an existing article. Complete category, title, introduction, cover photograph/description and at least one reading section. Every section needs a heading and a nonempty paragraph. Optional body photographs need descriptions. Add/reorder paragraphs and sections with their provided controls. Save **Journal articles**, publish, then verify both the card and article page, including its contents links.

Use the article **Page address** field for URL changes and move focus out to commit validation. Old published addresses are retained as redirects. Verify both old and new addresses. Duplicated articles need their own reviewed title/address/content.

**Project notes:** Complete the required source, headline, photograph/description and destination. **Press and news** may be text-only; when a photograph is supplied, describe it. Choose the external-link setting to match the destination, and test the result.

**Visibility** hides a record while retaining it for editing. Removing a record is a separate collection action. If hiding/removing the selected featured Press story, first choose a shown replacement or **No featured story** in the opening's selector, save both changes, then publish. Otherwise publication is rejected.

### Process, Sustainability and Enquiry

**Process:** Day fields use a short word label plus a range within 01–90, for example `Days 01–10` or `Milestones 04–12`. Keep the first number at or below the second. The label and large numerals render separately. Malformed legacy values may show a warning while the public page uses the original fallback; correct them rather than treating the fallback as proof the draft worked. Editing copy does not move film chapter cue points or add phases.

**Sustainability:** Edit the existing registered scenes and proof/facts fields. Arbitrary add/remove story blocks are not provided. Inspect long copy inside short-screen/phone panels and verify any citations or buttons.

**Enquiry:** Edit the tab-specific copy and dropdown lists. For option wording, change **Visible option** while keeping **Stored value** stable unless the underlying meaning must change. Stored values must be unique within their list; keep at least one option. Save the list and check all affected form states. Content publication does not prove email, CRM or enquiry delivery; delivery requires its own integration check. Avoid sending a real enquiry just to verify a label.

### Footer and Header

Footer link columns can add, reorder and remove links while retaining the three existing column slots. Internal destinations start with `/`; social destinations use secure HTTPS addresses. The copyright supports `{year}` for the current year. Save scalar fields and each changed link list separately. Test the links after publication.

Header wording is in **Shared site settings → Header**. Its destinations remain fixed; changing a label does not create a route or redirect. Open and close the phone menu after publishing longer labels.

## 8. Collections, removal and restoration

A **collection** is an ordered list: projects, article sections, selected work, plans, links or dropdown options. Editing an item, changing order, duplicating or removing it changes the editor's local list until its owning collection is saved.

- Use **Move up/down** to control display order where offered.
- Use **Duplicate** only after reviewing copied identifiers, addresses, destinations and media references.
- Use an immediate **Undo** where shown for a recent removal.
- Use **Restore removed …** where offered to recover records available from defaults/publication history. This is not a complete backup browser and cannot guarantee recovery of never-saved or never-published work.
- Save the collection after restoration and publish only after reviewing it with the other saved drafts.

Projects have an explicit archive/restore workflow. Other editors may remove records from a draft list instead. Neither removing a content reference nor publishing that removal is a command to delete its media files from storage.

## 9. Correcting or undoing a mistake

| Situation | Procedure |
| --- | --- |
| Typed a wrong value but have not saved it | Re-enter the intended value. Alternatively, after preserving other wanted unsaved work, reload/disconnect and reconnect to discard tab-local changes. Saved drafts remain. |
| Want the built-in default | Select **Use original**, inspect the result, save that field and publish. This restores the source default, which may differ from the previous custom publication. |
| Saved an incorrect draft | Replace it with the recorded intended/previous published value and save again. Publishing this correction still publishes all other saved drafts. |
| Published an incorrect value | Re-enter the recorded previous value, save, review the full saved draft batch, publish a correction, then verify the public page. |
| Removed a list item | Use Undo/Restore if available, inspect fields/order/relationships, save the collection and publish. |
| Need to discard saved drafts without publishing, or restore a whole prior revision | Ask the maintainer. The current UI has no general Discard all drafts or one-click whole-site revision rollback. Do not assume Disconnect performs either. |

Before a large batch, record the current values/assets and coordinate with the maintainer about a backup. Recovering one content field is different from restoring the full content/media store.

## 10. Troubleshooting

| Symptom/message | What to do |
| --- | --- |
| Local address cannot be reached | Follow the local startup procedure. Reuse `npm run admin`; do not start multiple servers. |
| **Admin token is incorrect** / 401 | Check the owner-provided key, letter case and environment. Reconnect. Do not rotate credentials to troubleshoot content storage. |
| **Content storage is unavailable** / 503 | Stop attempting edits/uploads/publication. Ask the maintainer to check the existing content store and its availability/limits. A functioning public page or preview does not establish working writes. |
| **Reload before saving/publishing** / 409 | Another session changed the revision. Record unsaved work, coordinate with the other editor, reload/reconnect, review the newer values and reapply only the intended changes. Do not repeatedly click Publish. |
| A required-field or invalid-value error / 422 | Correct the named field/item, save it and retry after reviewing related drafts. A permitted incomplete draft may still fail publication validation. |
| Preview is slow or black | Wait for its readiness message. Use **Reload preview** once. If needed, use Open page to check published rendering separately. Avoid opening many heavy media/3D pages. Report a persistent failure with page/browser details. |
| Preview changed but public website did not | Check for successful field/collection save and published-revision messages. Confirm the environment, make the public tab visible, wait a few seconds and refresh once. Unsaved or draft-only preview changes are private. |
| Publish is disabled | Connect first; finish/cancel an active operation; confirm at least one change was actually saved as a draft. Unsaved edits alone do not enable publishing. |
| Upload is stuck or failed | Wait for the active stage, or Cancel upload. Use a supported file under 100 MB. Keep one task active. Cancel/error is not a successful save or publication. |
| New font size changes the wrong text, or alignment worsens | Clear that size, save and publish the blank override when ready. Record the page, section, text role and viewport width for the maintainer. |
| Chosen project/photo/featured story is missing | Repair the reference or choose an available replacement. Save both the source list and dependent selection before publishing. |

For support, record: environment/URL, page and section, exact action, non-sensitive error text, time, publication revision if available, and a screenshot with the key and private content hidden. Include browser and approximate viewport size for layout issues. Do not repeatedly upload the same large file or open extra preview tabs to diagnose a persistent server/storage error.

## 11. Acceptance checklist for every change batch

Use actual browser resizing or a phone; an expanded embedded preview alone does not verify all screen sizes. Check one viewport at a time to keep memory use low.

- [ ] Correct environment and page; all saved drafts in the batch are understood.
- [ ] Every intended field and collection was saved successfully.
- [ ] Draft preview shows correct wording, images, descriptions, order and links.
- [ ] Publish returned a revision; record it below.
- [ ] Standalone public page reflects the saved publication.
- [ ] Phone view checked, for example around 390px wide; text fits and controls remain reachable.
- [ ] Desktop view checked, for example around 1440px wide; cards, columns and buttons align.
- [ ] Tablet width, around 768px, checked when changing fonts, card layouts or shared navigation.
- [ ] Typography changes checked immediately below/above 700px when both size entries are involved.
- [ ] No unintended horizontal page scrolling, clipped text, overlapping controls or single-character wrapping.
- [ ] Images load and important subjects are framed; film/poster behavior checked if changed.
- [ ] Relevant links, old/new page addresses, model/plan states and dependent cards checked.
- [ ] Saved values remain after reconnect/reload when persistence verification is required.
- [ ] Test-only content and unrelated drafts are absent or explicitly accounted for.
- [ ] Extra public tabs are closed; editor disconnected when finished.

Do not claim email delivery, physical-device performance or cloud persistence from a content preview alone.

## 12. Keep resource use controlled

Use one connected editor tab and one public verification tab. Check routes sequentially. Finish/cancel one upload before another. Close media/3D verification pages when finished.

Content editing does not require running a production build. Leave builds/test suites to the maintainer; they should run sequentially under suitable memory limits, without duplicate website processes. Do not run a build into the same output directory a live production preview is serving.

When finished with local work, use Ctrl+C in the launcher terminal for processes that launcher started. A pre-existing server reused by the launcher may remain running; ask the maintainer to identify it rather than broadly killing Node/browser processes or other users' work.

## 13. Change log template

Copy this for each publication:

```text
Date/time and editor:
Environment: local / production
Pages and sections changed:
Previous wording or asset references:
New wording or asset references:
Fields/collections saved:
Other saved drafts reviewed:
Published revision:
Public URLs checked:
Phone / tablet / desktop widths checked:
Dependent links, models, plans or cards checked:
Persistence checked:
Known issue or remaining check:
Correction/rollback reference:
Editor disconnected and extra tabs closed:
```

Keep credentials and private media masters out of the log.

## 14. Current feature and verification boundaries

This SOP documents the source implementation inspected on **15 October 2026**. It does not certify every control or the deployed version.

- Original responsive text sizes are retained by default; optional numeric section controls and the master/section fonts are implemented locally. Recorded numeric save/publish verification covers 1,010 controls; public CSS reflection covers 101 desktop sections and 90 phone sections. The remaining phone coverage and final restored-default visual acceptance are incomplete.
- The latest typography changes passed 77 focused tests, TypeScript and targeted lint. The capped production build was stopped after very low progress; a completed new full build is not claimed.
- Direct admin-browser inspection was blocked by browser URL safety policy. Authenticated local API save/publish checks are separate evidence and do not establish a complete manual UI walkthrough.
- Configurator editing is intentionally hidden/deferred. This admin does not manage 3D geometry, material assignments, catalogue pricing rules or create new animation templates.
- The UI does not offer arbitrary page-builder layouts, arbitrary new Sustainability blocks, font uploads, a universal Save all/Discard drafts button, or whole-site revision rollback.
- Production storage/auth/upload/publish acceptance must be freshly checked before using production as a reliable editing environment. These local source changes were not deployed as part of the typography correction or SOP writing.

## 15. Maintainer references

Keep this guide aligned with visible control names when changing the editor.

- [Admin scope and decision/progress ledger](../admin-system.md)
- [Current numeric typography behavior and evidence](../numeric-typography-2026-10-15.md)
- [Preview lifecycle and rendering limits](../admin-preview-reliability-2026-10-12.md)
- [Startup and process ownership](../start-the-website.md)
- [Staff sign-in guidance](testing-key-quickstart.md)
- [Deployment operations](../deployment/operations.md) and [release evidence](../deployment/release-ledger.md)
- Implementation: [AdminStudio](../../src/components/admin/AdminStudio.tsx), [content registry](../../src/data/adminContent.ts), [collection definitions](../../src/lib/contentCollections.ts), [store validation/publication](../../src/lib/siteContentStore.ts), [typography](../../src/lib/typography.ts), [upload workflow](../../src/components/admin/uploadMedia.ts), [public updates](../../src/lib/useSiteContent.ts).
