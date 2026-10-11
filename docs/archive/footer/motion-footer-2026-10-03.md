# Global footer provenance

## Chosen 21st.dev component

- **Motion Footer** by **Hossain Jahed / EaseMize UI Registry**
- Component: <https://21st.dev/@jahed/components/motion-footer>
- 21st.dev comparison: <https://docs.21st.dev/blog/react-footer-design-examples>
- Selection basis: 21st.dev identifies Motion Footer as its most-saved footer by a wide margin. The component page and live preview establish its curtain reveal, diagonal ribbon, oversized masked typography, magnetic buttons, background field, and centered call to action.

The original component source is membership-locked. Its public component page, live preview, rendered structure, and published motion styles were inspected on 2026-10-03. The OKNO implementation preserves the component's visible anatomy and interaction vocabulary rather than presenting a newly invented footer as retrieved source.

## OKNO adaptation

- Mounted once in `src/app/layout.tsx`, after route content, so the site shares one footer implementation. The Signature Models branch (`/models/signature` and its configurators) intentionally omits it to preserve that self-contained product experience.
- Implemented in `src/components/Footer/SiteFooter.tsx` and `SiteFooter.module.css`.
- Preserved: diagonal moving ribbon, architectural grid, soft aurora field, oversized outlined wordmark, centered CTA, magnetic controls, and reduced-motion handling.
- Replaced all sample product text and placeholder `#` links with OKNO destinations.
- Removed the former Landing, Process, Sustainability, and Projects footer instances to prevent duplicate contentinfo landmarks.
- Folded the former Process, Sustainability, Hospitality, and Bespoke closing panels into the footer callout. Each route keeps its original statement and enquiry destination inside the shared footer instead of rendering a second terminal CTA. Other routes keep the general OKNO project callout.

## Content sources

- Official OKNO website footer: <https://www.oknomodhomes.com/>
- Official OKNO contact details: <https://www.oknomodhomes.com/contact-us>
- Official social profiles linked by the live OKNO footer:
  - <https://www.instagram.com/oknomodhomes/>
  - <https://www.linkedin.com/company/oknomodhomes/>
  - <https://www.youtube.com/@OknoModHomes>
  - <https://www.facebook.com/Oknomodhomes/>

The footer includes the site's working internal routes, the official website's Experience Centre, Blogs, Contact, Careers, Terms and FAQs destinations, both published phone numbers, the published contact email, and the four verified social profiles.
