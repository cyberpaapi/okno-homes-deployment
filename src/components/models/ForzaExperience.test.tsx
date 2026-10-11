import {
  fireEvent,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { gazePrototype, oknoModels } from "@/data/models";
import ForzaExperience from "./ForzaExperience";
import { clampProgress, mapProgressToTime } from "./forzaMotion";
import { exploreVariantId } from "@/data/configurator/studio/variantIds";
import { signatureModelDefaults, signaturePlanDefaults } from "@/lib/signatureCollections";

const cms = vi.hoisted(() => ({
  values: {} as Record<string, string>,
  collections: {} as Record<string, { id: string; fields: Record<string, string> }[]>,
}));
vi.mock("@/lib/useSiteContent", () => ({
  useSiteContentMap: () => cms.values,
  useSiteCollectionsMap: () => cms.collections,
  useSiteCollection: (id: string, fallback: { id: string; fields: Record<string, string> }[]) =>
    Object.hasOwn(cms.collections, id) ? cms.collections[id] : fallback,
}));

beforeEach(() => {
  cms.values = {};
  cms.collections = {};
});

const forza = oknoModels.find((model) => model.slug === "forza");
const kray = oknoModels.find((model) => model.slug === "kray");
const tengo = oknoModels.find((model) => model.slug === "tengo");
const trib = oknoModels.find((model) => model.slug === "trib");
const octapod = oknoModels.find((model) => model.slug === "octapod");

if (!forza || !kray || !tengo || !trib || !octapod) {
  throw new Error("Signature model fixtures are missing");
}

const signatureModels = [forza, kray, gazePrototype, tengo, trib, octapod];

describe("ForzaExperience", () => {
  it("renders an added model and its added plan with independent media and Explore copy", async () => {
    cms.collections["signature.models"] = [...signatureModelDefaults, { id: "aurora", fields: {
      name: "Aurora", orbitFilm: "/qa/aurora-a.mp4", detailFilm: "/qa/aurora-b.mp4", poster: "/qa/aurora.webp",
      exploreAction: "Explore Aurora", features: JSON.stringify([{title:"Shelter",copy:"Quiet shelter"},{title:"Light",copy:"Soft light"},{title:"Space",copy:"Room to pause"}]),
      gallery: JSON.stringify([{id:"aurora-view",label:"Garden",image:"/qa/aurora.webp",alt:"Aurora in a garden"}]),
    } }];
    cms.collections["signature.plans"] = [...signaturePlanDefaults(), { id:"aurora-plan-1", fields:{modelId:"aurora",name:"Studio",area:"410 sq ft",price:"₹23 lakh",spaces:"1 bed · 1 bath"} }];
    const { container } = render(<ForzaExperience models={signatureModels} />);
    const scrollTo = vi.spyOn(window,"scrollTo").mockImplementation(() => undefined);
    fireEvent.click(within(screen.getByRole("group",{name:"Signature models"})).getByRole("button",{name:"Aurora"}));
    await waitFor(() => expect(screen.getByRole("heading",{name:"Aurora"})).toBeInTheDocument());
    expect(screen.getByText("410 sq ft")).toBeInTheDocument();
    expect(screen.getByText("₹23 lakh")).toBeInTheDocument();
    expect(container.querySelector('source[src="/qa/aurora-a.mp4"]')).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button",{name:"Explore Aurora"}));
    const dialog=screen.getByRole("dialog",{name:"Aurora"});
    expect(within(dialog).getByAltText("Aurora in a garden")).toBeInTheDocument();
    scrollTo.mockRestore();
  });
  it("keeps immutable plan IDs distinct from editable names and Signature-only geometry", () => {
    expect(exploreVariantId("tengo", 0)).toBe("2-bhk");
    expect(exploreVariantId("tengo", 1)).toBe("3-bhk");
    expect(exploreVariantId("kray", 0)).toBe("studio");
    expect(exploreVariantId("kray", 1)).toBe("1-bhk");
    expect(exploreVariantId("tengo", 2)).toBeNull();
    expect(exploreVariantId("forza", 0)).toBeNull();
  });

  it("uses the published replacement poster when every preview image is removed", () => {
    cms.values = { "models.signature.forza.poster": "/test/new-forza-poster.webp" };
    cms.collections = { "signature.gallery.forza": [] };
    render(<ForzaExperience models={signatureModels} />);

    fireEvent.click(screen.getByRole("button", { name: "Explore details" }));
    const dialog = screen.getByRole("dialog", { name: "Forza" });
    const image = within(dialog).getByAltText("Forza exterior");
    expect(image.getAttribute("src")).toContain("new-forza-poster.webp");
  });

  it("passes the selected stable plan to Configure and retains edited Explore specifications", async () => {
    cms.values = {
      "models.signature.tengo.variant-1.name": "Two-bedroom edition",
      "models.signature.tengo.variant-1.area": "1,500 sq ft",
      "models.signature.tengo.variant-1.price": "₹75 lakh",
    };
    render(<ForzaExperience models={signatureModels} />);
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    fireEvent.click(screen.getByRole("button", { name: "Tengo" }));
    await waitFor(() => expect(screen.getByRole("heading", { name: "Tengo" })).toBeInTheDocument());
    expect(screen.getByText("Two-bedroom edition")).toBeInTheDocument();
    expect(screen.getByText("1,500 sq ft")).toBeInTheDocument();
    expect(screen.getByText("₹75 lakh")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Explore details" }));
    const dialog = screen.getByRole("dialog", { name: "Tengo" });
    expect(within(dialog).getByText("1,500 sq ft")).toBeInTheDocument();
    expect(within(dialog).getByText("₹75 lakh")).toBeInTheDocument();
    expect(within(dialog).getByRole("link", { name: /Configure Tengo/ })).toHaveAttribute(
      "href", "/models/signature/tengo/configure?variant=2-bhk",
    );
    fireEvent.click(within(dialog).getByRole("tab", { name: "3 BHK" }));
    expect(within(dialog).getAllByRole("link", { name: /Configure Tengo/ })).toHaveLength(1);
    const outgoing = dialog.querySelector('[data-variant-stack="0"]');
    if (outgoing) {
      expect(outgoing).toHaveAttribute("aria-hidden", "true");
      expect(outgoing).toHaveAttribute("inert");
    }
    await waitFor(() => expect(within(dialog).getByRole("link", { name: /Configure Tengo/ })).toHaveAttribute(
      "href", "/models/signature/tengo/configure?variant=3-bhk",
    ));
    scrollTo.mockRestore();
  });

  it("clamps scroll progress before mapping it to the video duration", () => {
    expect(clampProgress(-0.4)).toBe(0);
    expect(clampProgress(1.4)).toBe(1);
    expect(mapProgressToTime(0.5, 8)).toBeCloseTo(3.9896, 3);
    expect(mapProgressToTime(2, 8)).toBeLessThan(8);
  });

  it("presents the Porsche-style Forza story without a process timeline", () => {
    render(<ForzaExperience models={signatureModels} />);

    expect(screen.getByRole("heading", { name: "Forza" })).toBeInTheDocument();
    expect(screen.getByText("Aperture")).toBeInTheDocument();
    expect(screen.getByText("Threshold")).toBeInTheDocument();
    expect(screen.queryByText(/the vault/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/delivery/i)).not.toBeInTheDocument();
  });

  it("opens the specifications, switches variants, and closes accessibly", async () => {
    render(<ForzaExperience models={signatureModels} />);

    fireEvent.click(screen.getByRole("button", { name: "Explore details" }));
    const dialog = screen.getByRole("dialog", { name: "Forza" });
    expect(dialog).toBeInTheDocument();
    expect(dialog.querySelectorAll("[data-bento-card]")).toHaveLength(4);
    expect(within(dialog).getByText("376 sq ft")).toBeInTheDocument();

    const kitchenView = within(dialog).getByRole("tab", { name: /kitchen/i });
    expect(kitchenView).toHaveAttribute("aria-selected", "true");
    expect(within(dialog).getByAltText("Forza kitchen interior")).toBeInTheDocument();

    const bedroomView = within(dialog).getByRole("tab", { name: /bedroom/i });
    fireEvent.click(bedroomView);
    expect(bedroomView).toHaveAttribute("aria-selected", "true");
    expect(within(dialog).getByAltText("Forza bedroom interior")).toBeInTheDocument();

    const oneBedroomTab = screen.getByRole("tab", { name: "1 BHK" });
    fireEvent.click(oneBedroomTab);
    expect(oneBedroomTab).toHaveAttribute("aria-selected", "true");

    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    await waitForElementToBeRemoved(dialog, { timeout: 1_500 });
  });

  it("switches from Forza to the stitched Kray experience", async () => {
    const { container } = render(<ForzaExperience models={signatureModels} />);
    const scrollTo = vi
      .spyOn(window, "scrollTo")
      .mockImplementation(() => undefined);

    fireEvent.click(screen.getByRole("button", { name: "Kray" }));

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "auto" });

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Kray" })).toBeInTheDocument();
    });
    expect(screen.getByText("Ascent")).toBeInTheDocument();
    await waitFor(() => {
      expect(
        container.querySelector(
          'source[src="/models/kray/video/kray-360-scroll-648p-24fps-fluid.mp4"]',
        ),
      ).toBeInTheDocument();
    });
    expect(
      container.querySelector(
        'source[src="/models/kray/video/kray-360-scroll-1080p-24fps-smooth.mp4"]',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /enquire/i })).toHaveAttribute(
      "href",
      "/enquiry?model=kray",
    );

    fireEvent.click(screen.getByRole("button", { name: "Explore details" }));
    const dialog = screen.getByRole("dialog", { name: "Kray" });
    expect(within(dialog).getByRole("tab", { name: /living/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(
      within(dialog).getByAltText(
        "Kray living room looking through full-height glazing toward the mountains",
      ),
    ).toBeInTheDocument();

    scrollTo.mockRestore();
  });

  it("switches to Gaze and opens its real interior gallery", async () => {
    const { container } = render(<ForzaExperience models={signatureModels} />);
    const scrollTo = vi
      .spyOn(window, "scrollTo")
      .mockImplementation(() => undefined);

    fireEvent.click(screen.getByRole("button", { name: "Gaze" }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Gaze" })).toBeInTheDocument();
    });
    expect(screen.getByText("Area on request")).toBeInTheDocument();
    expect(screen.getByText("Framed outlook")).toBeInTheDocument();
    expect(
      container.querySelector(
        'source[src="/models/gaze/video/gaze-360-scroll-648p-24fps-fluid.mp4"]',
      ),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Explore details" }));
    const dialog = screen.getByRole("dialog", { name: "Gaze" });
    expect(within(dialog).getByRole("tab", { name: /bedroom/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(
      within(dialog).getByAltText(
        "Gaze vaulted bedroom with warm timber ceiling",
      ),
    ).toBeInTheDocument();
    expect(within(dialog).getByText("Price on request")).toBeInTheDocument();

    scrollTo.mockRestore();
  });

  it("switches to the optimized Tengo orbit and opens its interior gallery", async () => {
    const { container } = render(<ForzaExperience models={signatureModels} />);
    const scrollTo = vi
      .spyOn(window, "scrollTo")
      .mockImplementation(() => undefined);

    fireEvent.click(screen.getByRole("button", { name: "Tengo" }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Tengo" })).toBeInTheDocument();
    });
    expect(screen.getByText("Long horizon")).toBeInTheDocument();
    expect(
      container.querySelector(
        'source[src="/models/tengo/video/tengo-360-scroll-648p-24fps-fluid.mp4"]',
      ),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Explore details" }));
    const dialog = screen.getByRole("dialog", { name: "Tengo" });
    expect(within(dialog).getByRole("tab", { name: /living/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(
      within(dialog).getByAltText(
        "Tengo living room with full-height garden glazing",
      ),
    ).toBeInTheDocument();
    expect(within(dialog).getByText("1,426 sq ft")).toBeInTheDocument();

    scrollTo.mockRestore();
  });

  it("filters the Signature collection by studio, 2 BHK, and 3 BHK plans", async () => {
    render(<ForzaExperience models={signatureModels} />);
    const scrollTo = vi
      .spyOn(window, "scrollTo")
      .mockImplementation(() => undefined);
    const modelSelector = screen.getByRole("group", { name: "Signature models" });

    fireEvent.click(screen.getByRole("button", { name: "Studio" }));
    expect(within(modelSelector).getByRole("button", { name: "Forza" })).toBeInTheDocument();
    expect(within(modelSelector).getByRole("button", { name: "Octapod" })).toBeInTheDocument();
    await waitFor(() => {
      expect(within(modelSelector).queryByRole("button", { name: "Tengo" })).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "2 BHK" }));
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Tengo" })).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(within(modelSelector).getAllByRole("button")).toHaveLength(1);
    });
    expect(screen.getByText("1,426 sq ft")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "3 BHK" }));
    expect(screen.getByText("1,686 sq ft")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Explore details" }));
    const dialog = screen.getByRole("dialog", { name: "Tengo" });
    expect(within(dialog).getByRole("tab", { name: "3 BHK" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(within(dialog).getByText("1,686 sq ft")).toBeInTheDocument();

    scrollTo.mockRestore();
  });

  it("switches to the stitched Trib orbit and opens its real interior gallery", async () => {
    const { container } = render(<ForzaExperience models={signatureModels} />);
    const scrollTo = vi
      .spyOn(window, "scrollTo")
      .mockImplementation(() => undefined);

    fireEvent.click(screen.getByRole("button", { name: "Trib" }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Trib" })).toBeInTheDocument();
    });
    expect(screen.getByText("A-frame clarity")).toBeInTheDocument();
    expect(
      container.querySelector(
        'source[src="/models/trib/video/trib-360-scroll-648p-24fps-fluid.mp4"]',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /enquire/i })).toHaveAttribute(
      "href",
      "/enquiry?model=trib",
    );

    fireEvent.click(screen.getByRole("button", { name: "Explore details" }));
    const dialog = screen.getByRole("dialog", { name: "Trib" });
    expect(within(dialog).getByRole("tab", { name: /bedroom/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(
      within(dialog).getByAltText(
        "Trib bedroom beneath the warm timber A-frame ceiling",
      ),
    ).toBeInTheDocument();
    expect(within(dialog).getByText("436 sq ft")).toBeInTheDocument();

    scrollTo.mockRestore();
  });

  it("switches to the stitched Octapod orbit and opens its exterior gallery", async () => {
    const { container } = render(<ForzaExperience models={signatureModels} />);
    const scrollTo = vi
      .spyOn(window, "scrollTo")
      .mockImplementation(() => undefined);

    fireEvent.click(screen.getByRole("button", { name: "Octapod" }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Octapod" })).toBeInTheDocument();
    });
    expect(screen.getByText("Eight-sided calm")).toBeInTheDocument();
    expect(
      container.querySelector(
        'source[src="/models/octapod/video/octapod-360-scroll-648p-24fps-fluid.mp4"]',
      ),
    ).toBeInTheDocument();
    expect(
      container.querySelector(
        'section[aria-label="Octapod scroll-controlled 360 degree experience"]',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /enquire/i })).toHaveAttribute(
      "href",
      "/enquiry?model=octapod",
    );

    fireEvent.click(screen.getByRole("button", { name: "Explore details" }));
    const dialog = screen.getByRole("dialog", { name: "Octapod" });
    expect(
      within(dialog).getByRole("region", { name: "Octapod gallery" }),
    ).toBeInTheDocument();
    expect(within(dialog).getByRole("tab", { name: /bedroom/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(
      within(dialog).getByAltText(
        "Octapod timber-lined bedroom with warm afternoon light",
      ),
    ).toBeInTheDocument();
    expect(within(dialog).getByText("300 sq ft")).toBeInTheDocument();

    scrollTo.mockRestore();
  });
});
