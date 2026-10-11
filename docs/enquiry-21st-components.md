# Enquiry page component provenance

The enquiry page uses retrieved 21st.dev components for its visible UI and motion. The layout and copy are specific to OKNO; no reference page was copied.

| Page element | 21st.dev source | What was retained | OKNO adaptation |
| --- | --- | --- | --- |
| Fluid background | [Fluid Field Background 25595 by mengto](https://21st.dev/@mengto/components/fluid-field) | Simplex noise, domain warping, travelling light field | Existing shared renderer lifecycle, restrained stone/bronze palette, reduced-motion still field |
| Heading reveal | [Text Block Animation 9902 by daiwiikharihar](https://21st.dev/@daiwiikharihar/components/text-block-animation) | Line block wipe and staggered reveal | Two explicit editorial lines; shared Motion runtime |
| Enquiry selector | [Segmented Tabs 26923 by micka_design](https://21st.dev/@micka_design/components/tabs-base) | Measured active layer, fluid hover layer, spring motion | Native tab roles and arrow/Home/End keyboard behavior; OKNO palette and labels |
| Form structure | [Input Form 26782 by uiable](https://21st.dev/@uiable/components/input-form) | Field group, labelled field, input/select and paired-column structure | Existing enquiry fields and URL-intent contract; native selects preserve accessibility and avoid a new runtime dependency |
| Submit action | [Interactive Hover Button 969 by dillionverma](https://21st.dev/@dillionverma/components/interactive-hover-button) | Expanding dot, outgoing label and incoming arrow-label motion | OKNO type, color and per-enquiry labels |
| Site cursor | [Fluid Magnetic Cursor 9314 by jahed](https://21st.dev/@jahed/components/fluid-magnetic-cursor) | Magnetic targeting, velocity response and touch/reduced-motion safeguards | Existing shared site implementation automatically covers the page's tabs and submit button |

The retrieved source snapshots for the enquiry-only components are stored in `docs/21st-source/enquiry-26782.json`, `docs/21st-source/enquiry-26923.json`, and `docs/21st-source/enquiry-969.json`. Shared-component source snapshots already live beside them.

Visual direction was checked against contemporary architecture-studio and property enquiry work on Dribbble: focused inquiry flow, large editorial typography, neutral material palette, and strong whitespace. Only those high-level traits were used.

Deliberately excluded: step counts, numeric progress marks, eyebrow labels, process-card copy, icon grids, fake testimonials, decorative metrics, glass panels, and generated success states.
