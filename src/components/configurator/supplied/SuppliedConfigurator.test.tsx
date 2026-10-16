import { fireEvent, render, screen, within, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { signatureAsset } from "@/data/configurator/signatureAssets";
import SuppliedConfigurator from "./SuppliedConfigurator";

const scene = vi.hoisted(() => ({ finish: vi.fn(), dispose: vi.fn(), turn: vi.fn(), view: vi.fn(), light: vi.fn(), background: vi.fn(), moveCamera: vi.fn(), glb: vi.fn().mockResolvedValue({}), surface: vi.fn() }));
vi.mock("./cabinScene", () => ({ createScene: (_mount: HTMLElement, ready: () => void) => { ready(); return scene; } }));
vi.mock("next/navigation", () => ({ usePathname: () => "/models/signature/forza/configure" }));

describe("supplied cabin customer controls", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn(), addListener: vi.fn(), removeListener: vi.fn() });
  });
  it("applies approved roof and wall swatches through existing scene controls", () => {
    render(<SuppliedConfigurator />);
    fireEvent.click(screen.getByRole("button", { name: /External roof/ }));
    fireEvent.click(screen.getByRole("button", { name: /Castile Crest/ }));
    expect(scene.finish).toHaveBeenLastCalledWith("roof", expect.objectContaining({ texture: "/configurator/material-details/v1/castile-crest.png" }));
    expect(screen.queryByRole("button", { name: /Alpine White/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /External wall/ }));
    fireEvent.click(screen.getByRole("button", { name: /Golden Oak/ }));
    expect(scene.finish).toHaveBeenLastCalledWith("cladding", expect.objectContaining({ texture: "/configurator/material-details/v1/golden-oak.jpg" }));
  });
  it("keeps internal choices separate while disclosing the shared preview", () => {
    render(<SuppliedConfigurator />);
    fireEvent.click(screen.getByRole("button", { name: /Flooring/ }));
    fireEvent.click(screen.getByRole("button", { name: /Tuscan Elegance/ }));
    expect(scene.finish).toHaveBeenLastCalledWith("timber", expect.any(Object));
    fireEvent.click(screen.getByRole("button", { name: /Internal wall/ }));
    fireEvent.click(screen.getByRole("button", { name: /Alpine White/ }));
    fireEvent.click(screen.getByRole("button", { name: /Flooring/ }));
    expect(within(screen.getByRole("region", { name: "Flooring finishes" })).getByRole("button", { name: /Tuscan Elegance/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("status")).toHaveTextContent("Current interior preview — Internal wall: Alpine White");
  });
  it("wires camera, lighting and background and disposes the scene", () => {
    const { unmount } = render(<SuppliedConfigurator />);
    fireEvent.click(within(screen.getByRole("group", { name: "Camera views" })).getByRole("button", { name: "inside" }));
    fireEvent.click(screen.getByRole("button", { name: "Golden hour" }));
    fireEvent.click(screen.getByRole("button", { name: "Forest" }));
    expect(scene.view).toHaveBeenCalledWith("inside");
    expect(scene.light).toHaveBeenCalledWith("golden");
    expect(scene.background).toHaveBeenCalledWith("forest");
    expect(screen.queryByRole("button", { name: "Import model" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to models" })).toHaveAttribute("href", "/models/signature");
    unmount();
    expect(scene.dispose).toHaveBeenCalledOnce();
  });
  it("reuses the site header and preserves finish choices when the panel is hidden", () => {
    render(<SuppliedConfigurator />);
    expect(screen.getByRole("link", { name: "OKNO Modhomes home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("navigation", { name: "Primary navigation" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Golden Oak/ }));
    fireEvent.click(within(screen.getByRole("complementary", { name: "Cladding material options" })).getByRole("button", { name: "Hide finishes" }));
    expect(screen.queryByRole("complementary", { name: "Cladding material options" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Show finishes" }));
    expect(screen.getByRole("button", { name: /Golden Oak/ })).toHaveAttribute("aria-pressed", "true");
  });
  it("loads only the requested house before enabling finishes and keeps surfaces independent", async () => {
    const fetchAsset = vi.fn().mockResolvedValue({ ok: true, blob: async () => new Blob(["house"]) });
    vi.stubGlobal("fetch", fetchAsset);
    render(<SuppliedConfigurator asset={signatureAsset("forza")} requestedName="Forza" />);
    await waitFor(() => expect(screen.getByRole("button", { name: /Golden Oak/ })).toBeEnabled());
    const modelCalls = fetchAsset.mock.calls.filter(([url]) => String(url).startsWith("/configurator/models/"));
    expect(modelCalls).toHaveLength(1);
    expect(modelCalls[0][0]).toMatch(/models\/v2\/forza-[a-f0-9]+\.glb$/);
    expect(scene.glb).toHaveBeenCalledWith(expect.any(Blob), 1);
    fireEvent.click(screen.getByRole("button", { name: /Golden Oak/ }));
    expect(scene.surface).toHaveBeenLastCalledWith("external-wall", expect.any(Object), "Golden Oak");
    fireEvent.click(screen.getByRole("button", { name: /Flooring/ }));
    fireEvent.click(screen.getByRole("button", { name: /Tuscan Elegance/ }));
    expect(scene.surface).toHaveBeenLastCalledWith("flooring", expect.any(Object), "Tuscan Elegance");
    expect(scene.finish).not.toHaveBeenCalled();
    expect(screen.queryByText(/shared interior timber/)).not.toBeInTheDocument();
  });
  it("shows a load failure without silently displaying another house", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    render(<SuppliedConfigurator asset={signatureAsset("kray")} />);
    expect(await screen.findByRole("alert")).toHaveTextContent("could not load");
    expect(scene.glb).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /Golden Oak/ })).toBeDisabled();
    expect(scene.dispose).toHaveBeenCalledOnce();
  });

});
