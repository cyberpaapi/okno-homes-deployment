import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import HospitalityExperience from "./HospitalityExperience";
import { initialHospitalitySelections } from '@/data/hospitalitySelectedWork';
import { HospitalityGallery } from './21st/HospitalityGallery';

vi.mock("next/navigation", () => ({ usePathname: () => "/hospitality" }));

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

let viewportWidth = 390;
beforeEach(() => { viewportWidth = 390; });

beforeAll(() => {
  vi.stubGlobal("ResizeObserver", MockResizeObserver);
  vi.stubGlobal("matchMedia", vi.fn().mockImplementation((query: string) => ({
    matches: query === "(max-width: 700px)" && viewportWidth <= 700,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })));
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
});

afterAll(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("HospitalityExperience", () => {
  it.each(['forest', 'pearl'])('seeds the %s background and retains the photograph caption contrast', background => {
    const { container } = render(<HospitalityExperience initialBackground={background} />);
    expect(container.querySelector('main')).toHaveAttribute('data-background', background);
    expect([...container.querySelectorAll('canvas[data-palette]')].map(canvas => canvas.getAttribute('data-palette'))).toEqual([background, background]);
    expect(document.querySelector('[data-site-header]')).toHaveAttribute('data-tone', background === 'pearl' ? 'light' : 'dark');
    expect(screen.getByRole('heading', { name: 'Built to welcome. Designed to perform.' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Lakewood hospitality buildings/i })).toBeInTheDocument();
    expect(container.querySelector('[data-type-section="hospitality.result"]')).toHaveAttribute('data-header-tone', 'dark');
  });

  it('retains the original forest background when a stale choice is unknown', () => {
    const { container } = render(<HospitalityExperience initialBackground="unrecognised" />);
    expect(container.querySelector('main')).toHaveAttribute('data-background', 'forest');
  });

  it("speaks directly to multi-residence hospitality buyers", () => {
    render(<HospitalityExperience />);

    expect(screen.getByRole("heading", { name: "Built to welcome. Designed to perform." })).toBeInTheDocument();
    expect(screen.getByText(/coordinated across every residence and shared space/i)).toBeInTheDocument();
    const consultationLinks = screen.getAllByRole("link", { name: 'Consultation', exact: true });
    expect(consultationLinks).toHaveLength(2);
    for (const link of consultationLinks) {
      expect(link).toHaveAttribute("href", "/enquiry?intent=hospitality");
    }
  });

  it("covers every estate, delivery stage and care pillar from the brief", () => {
    render(<HospitalityExperience />);

    for (const estate of ["Forrest", "Kioo", "Lakewood Villa", "Octapod Layana", "Rasa Vikarabad"]) {
      expect(screen.getByRole("link", { name: `View ${estate} project gallery` })).toBeInTheDocument();
    }
    for (const stage of ["Private consultation", "Site study", "Design curation", "Craftsmanship", "Delivery", "Installation", "Opening"]) {
      expect(screen.getByRole("heading", { name: stage })).toBeInTheDocument();
    }
    expect(screen.getByText("Terrain, access, utilities and resilience resolved first.")).toBeInTheDocument();
    expect(screen.getByText("Warranty, handover and long-term care.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Brief to opening." })).toBeInTheDocument();
  });

  it("uses the bookmarked bento and a single hospitality enquiry route without an embedded form", () => {
    render(<HospitalityExperience />);

    expect(screen.getAllByText("5+")).toHaveLength(1);
    expect(screen.getByText("Delivered guest-ready, Operational.")).toBeInTheDocument();
    expect(screen.queryByText("Places with a life of their own")).not.toBeInTheDocument();
    expect(screen.queryByText("Projects from five residences")).not.toBeInTheDocument();
    expect(screen.queryByRole("form")).not.toBeInTheDocument();
    expect(screen.queryByText(/private WhatsApp/i)).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Begin a hospitality conversation." })).toBeInTheDocument();
  });

  it.each([390, 430, 700])("links phone selected photography to the corresponding Projects gallery at %ipx", width => {
    viewportWidth = width;
    render(<HospitalityExperience />);
    expect(screen.getByRole("link", { name: "View Forrest project gallery" })).toHaveAttribute('href', '/projects/forrest');
    expect(screen.getByRole("link", { name: "View Rasa Vikarabad project gallery" })).toHaveAttribute('href', '/projects/rasa-vikarabad');
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("hides Selected work at zero and fills the gallery at one, two and many selections", () => {
    const empty = render(<HospitalityExperience initialSelections={[]} />);
    expect(screen.queryByRole("region", { name: "Hospitality project photography" })).not.toBeInTheDocument();
    empty.unmount();

    const one = render(<HospitalityExperience initialSelections={initialHospitalitySelections.slice(0, 1)} />);
    expect(screen.getByRole("region", { name: "Hospitality project photography" }).querySelector('[data-count="1"]')).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /^View .* project gallery$/ })).toHaveLength(1);
    expect(screen.getByRole("link", { name: "View Forrest project gallery" })).toHaveAttribute('href', '/projects/forrest');
    one.unmount();

    const two = render(<HospitalityExperience initialSelections={initialHospitalitySelections.slice(0, 2)} />);
    expect(screen.getByRole("region", { name: "Hospitality project photography" }).querySelector('[data-count="2"]')).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /^View .* project gallery$/ })).toHaveLength(2);
    two.unmount();

    render(<HospitalityExperience initialSelections={initialHospitalitySelections} />);
    expect(screen.getByRole("region", { name: "Hospitality project photography" }).querySelector('[data-count="3"]')).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /^View .* project gallery$/ })).toHaveLength(5);
  });

  it("opens corresponding project galleries and retains the unlinked legacy photograph viewer", async () => {
    render(<HospitalityGallery projects={[
      { id: 'custom-selection', projectId: 'rasa-vikarabad', projectHref: '/projects/rasa-retreat', name: 'Pool retreat', image: '/pool.webp', alt: 'Pool', kind: '', description: '' },
      { id: 'legacy-photo', name: 'Earlier estate', image: '/estate.webp', alt: 'Earlier estate', kind: '', description: '' },
    ]} />);
    expect(screen.getByRole('link', { name: 'View Pool retreat project gallery' })).toHaveAttribute('href', '/projects/rasa-retreat');
    fireEvent.click(screen.getByRole('button', { name: 'View Earlier estate photography' }));
    expect(screen.getByRole('dialog', { name: 'Earlier estate photograph' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close photograph' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it("preserves the closing pool scene with a full-resolution phone source and a detailed inset", () => {
    render(<HospitalityExperience />);
    const background = screen.getByRole('img', { name: 'Rasa Vikarabad pool and pavilions at dusk' });
    const source = background.closest('picture')?.querySelector('source');
    expect(source).toHaveAttribute('media', '(max-width: 700px)');
    expect(source).toHaveAttribute('srcset', '/assets/projects/real-v1/rasa-vikarabad-01.webp');
    const inset = screen.getByRole('img', { name: 'Breakfast by the pool at Rasa Vikarabad' });
    expect(inset.getAttribute('src')).toContain('/page-images/');
    expect(inset.getAttribute('srcset')).not.toContain('/thumbnail-images/');
    expect(inset).toHaveAttribute('sizes', '56vw');
  });

  it.each([701, 768, 1440])("links selected work to Projects while preserving the inset source at %ipx", async width => {
    viewportWidth = width;
    render(<HospitalityExperience />);
    expect(screen.getByRole('link', { name: 'View Forrest project gallery' })).toHaveAttribute('href', '/projects/forrest');
    expect(screen.getAllByRole('link', { name: /project gallery$/ })).toHaveLength(5);
    const inset = screen.getByRole('img', { name: 'Breakfast by the pool at Rasa Vikarabad' });
    expect(inset.getAttribute('src')).toContain('/thumbnail-images/');
    expect(inset).toHaveAttribute('sizes', '(max-width: 700px) 40vw, 34vw');
    const background = screen.getByRole('img', { name: 'Rasa Vikarabad pool and pavilions at dusk' });
    expect(background).toHaveAttribute('sizes', '100vw');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it("removes the rejected video-expansion and parallax opening", () => {
    const { container } = render(<HospitalityExperience />);

    expect(container.querySelector("video")).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Lakewood hospitality buildings/i })).toBeInTheDocument();
    expect(container.querySelectorAll("[data-stage-photo]")).toHaveLength(7);
    expect(screen.getByRole("heading", { name: "Selected work." })).toBeInTheDocument();
  });
});
