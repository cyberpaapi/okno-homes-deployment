import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Header from "./Header";
import ModelsHeader from "../models/ModelsHeader";
import ProjectsHeader from "../projects/ProjectsHeader";
import ProcessNavigation from "../process/21st/ProcessNavigation";

vi.mock("next/navigation", () => ({ usePathname: () => "/process" }));

function openMenu() {
  const trigger = screen.getByRole("button", { name: "Open navigation" });
  fireEvent.click(trigger);
  return { trigger, dialog: screen.getByRole("dialog", { name: "Site navigation" }) };
}

describe("shared Models/Projects header", () => {
  it("uses the same navigation and source magnetic enquiry action", () => {
    render(<Header />);
    expect(screen.getByRole("link", { name: "OKNO Modhomes home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Enquire" })).toHaveAttribute("href", "/enquiry");
    expect(screen.getByRole("link", { name: "Process" })).toHaveAttribute("aria-current", "page");
    expect(screen.queryByRole("navigation", { name: "Mobile navigation" })).toBeNull();
  });

  it("preserves enquiry intent in the desktop and mobile actions", () => {
    render(<Header enquiryHref="/enquiry?intent=home" />);
    expect(screen.getByRole("link", { name: "Enquire" })).toHaveAttribute("href", "/enquiry?intent=home");
    const { dialog } = openMenu();
    expect(within(dialog).getByRole("link", { name: "Enquire" })).toHaveAttribute("href", "/enquiry?intent=home");
    expect(within(dialog).getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
  });

  it("locks scroll, wraps focus in both directions and restores it on Escape", () => {
    document.body.style.overflow = "auto";
    render(<Header />);
    const { trigger, dialog } = openMenu();
    const first = within(dialog).getByRole("button", { name: "Close navigation" });
    const last = within(dialog).getByRole("link", { name: "Enquire" });
    expect(first).toHaveFocus();
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.keyDown(first, { key: "Tab", shiftKey: true });
    expect(last).toHaveFocus();
    fireEvent.keyDown(last, { key: "Tab" });
    expect(first).toHaveFocus();
    fireEvent.keyDown(first, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(trigger).toHaveFocus();
    expect(document.body.style.overflow).toBe("auto");
    document.body.style.overflow = "";
  });

  it("closes the menu when a route is chosen", () => {
    render(<Header />);
    const { dialog, trigger } = openMenu();
    fireEvent.click(within(dialog).getByRole("link", { name: "Models" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("closes and restores scrolling when resizing to desktop", () => {
    const width = window.innerWidth;
    render(<Header />);
    openMenu();
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 1440 });
    fireEvent(window, new Event("resize"));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.body.style.overflow).not.toBe("hidden");
    Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
  });

  it("retains the Models context and model-specific enquiry", () => {
    render(<ModelsHeader enquireHref="/enquiry?model=kray" />);
    expect(screen.getByRole("link", { name: "Models" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Enquire" })).toHaveAttribute("href", "/enquiry?model=kray");
  });

  it("retains the Projects context and selected project enquiry", () => {
    render(<ProjectsHeader projectId="lakewood" />);
    expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Enquire" })).toHaveAttribute("href", "/enquiry?project=lakewood");
  });

  it("uses the shared navigation on Process", () => {
    render(<ProcessNavigation />);
    expect(screen.getAllByRole("navigation", { name: "Primary navigation" })).toHaveLength(1);
    expect(screen.getByRole("link", { name: "Process" })).toHaveAttribute("aria-current", "page");
  });
});
