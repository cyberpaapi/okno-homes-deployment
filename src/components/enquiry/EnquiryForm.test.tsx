import { act, fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import EnquiryForm from "./EnquiryForm";

beforeAll(() => {
  vi.stubGlobal("matchMedia", vi.fn().mockImplementation((query: string) => ({
    matches: query.includes("prefers-reduced-motion"),
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })));
});

afterEach(() => window.history.replaceState(null, "", "/"));
afterAll(() => vi.unstubAllGlobals());

describe("EnquiryForm URL intent", () => {
  it.each([
    ["?intent=home", "A home of my own"],
    ["?intent=hospitality", "Hospitality & estates"],
    ["?intent=property", "Hospitality & estates"],
    ["?intent=press", "Press & other"],
    ["?intent=unknown", "A home of my own"],
    ["", "A home of my own"],
  ])("selects the appropriate enquiry category for %s", (query, category) => {
    window.history.replaceState(null, "", `/enquiry${query}`);
    render(<EnquiryForm isOpen />);
    expect(screen.getByRole("tab", { name: category })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("form", { name: category })).toBeInTheDocument();
  });

  it("carries the hospitality intent with the brief's five-residence minimum", () => {
    window.history.replaceState(null, "", "/enquiry?intent=hospitality");
    render(<EnquiryForm isOpen />);
    const form = screen.getByRole("form", { name: "Hospitality & estates" });
    expect(new FormData(form as HTMLFormElement).get("intent")).toBe("hospitality");
    expect(screen.getByRole("combobox", { name: "Keys planned" })).toHaveTextContent("5–1011–2526+");
  });

  it("keeps a visitor's manual selection across rerenders and history changes", () => {
    window.history.replaceState(null, "", "/enquiry?intent=hospitality");
    const view = render(<EnquiryForm isOpen />);
    fireEvent.click(screen.getByRole("tab", { name: "Press & other" }));
    view.rerender(<EnquiryForm isOpen={false} />);
    act(() => {
      window.history.replaceState(null, "", "/enquiry?intent=home");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    view.rerender(<EnquiryForm isOpen />);
    expect(screen.getByRole("tab", { name: "Press & other" })).toHaveAttribute("aria-selected", "true");
  });

  it("hydrates the default server markup before selecting the URL category", () => {
    window.history.replaceState(null, "", "/enquiry?intent=press");
    const container = document.createElement("div");
    document.body.appendChild(container);
    container.innerHTML = renderToString(<EnquiryForm isOpen />);
    expect(container.querySelector('[role="tab"][aria-selected="true"]')).toHaveTextContent("A home of my own");
    const recoverableError = vi.fn();
    render(<EnquiryForm isOpen />, { container, hydrate: true, onRecoverableError: recoverableError });
    expect(screen.getByRole("tab", { name: "Press & other" })).toHaveAttribute("aria-selected", "true");
    expect(recoverableError).not.toHaveBeenCalled();
  });

  it("supports arrow-key selection without exposing process counters", () => {
    render(<EnquiryForm isOpen />);
    const home = screen.getByRole("tab", { name: "A home of my own" });
    fireEvent.keyDown(home, { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: "Hospitality & estates" })).toHaveAttribute("aria-selected", "true");
    expect(screen.queryByText("Begin a conversation")).not.toBeInTheDocument();
    expect(screen.queryByText("How a commission begins")).not.toBeInTheDocument();
    expect(screen.queryByText(/\b[0-9]+\s*(?:\/|of)\s*[0-9]+\b/i)).not.toBeInTheDocument();
  });
});
