import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import ModelsEntry from "./ModelsEntry";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/models",
}));

beforeAll(() => {
  vi.stubGlobal("matchMedia", vi.fn().mockImplementation((query: string) => ({
    matches: false, media: query, onchange: null,
    addEventListener: vi.fn(), removeEventListener: vi.fn(),
    addListener: vi.fn(), removeListener: vi.fn(), dispatchEvent: vi.fn(),
  })));
});
afterAll(() => vi.unstubAllGlobals());

describe("ModelsEntry", () => {
  it("presents two clear, navigable ownership paths", () => {
    render(<ModelsEntry />);

    expect(
      screen.getByRole("heading", { name: "Two ways to begin." }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /enter the signature collection/i }),
    ).toHaveAttribute("href", "/models/signature");
    expect(
      screen.getByRole("link", { name: /begin a bespoke home/i }),
    ).toHaveAttribute("href", "/models/bespoke");
    expect(screen.queryByText(/^01$/)).not.toBeInTheDocument();
    expect(screen.queryByText(/^02$/)).not.toBeInTheDocument();
    expect(screen.queryByText("Signature Models")).not.toBeInTheDocument();
  });

  it("moves between ownership paths with the keyboard without navigating", () => {
    render(<ModelsEntry />);
    const signature = screen.getByRole("link", { name: /enter the signature collection/i });
    const bespoke = screen.getByRole("link", { name: /begin a bespoke home/i });
    act(() => signature.focus());
    fireEvent.keyDown(signature, { key: "ArrowRight" });
    expect(bespoke).toHaveFocus();
    fireEvent.keyDown(bespoke, { key: "ArrowLeft" });
    expect(signature).toHaveFocus();
  });

  it("uses one destination-specific transition before opening Bespoke", () => {
    render(<ModelsEntry />);
    fireEvent.click(screen.getByRole("link", { name: /begin a bespoke home/i }));

    expect(screen.getByRole("status", { name: "Opening Bespoke" })).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute("data-model-transition", "bespoke");
    document.documentElement.removeAttribute("data-model-transition");
    sessionStorage.removeItem("okno-model-destination");
  });

  it("identifies Models as the active primary destination", () => {
    render(<ModelsEntry />);

    expect(screen.getByRole("link", { name: "Models" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("opens and closes the compact navigation menu", () => {
    render(<ModelsEntry />);

    const menuButton = screen.getByRole("button", { name: "Open navigation" });
    fireEvent.click(menuButton);

    expect(menuButton).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("navigation", { name: "Mobile navigation" })).toHaveAttribute("aria-hidden", "false");

    fireEvent.click(screen.getByRole("button", { name: "Close navigation" }));
    expect(menuButton).toHaveAttribute("aria-expanded", "false");
  });
});
