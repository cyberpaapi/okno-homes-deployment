import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Header from "./Header";
import ModelsHeader from "../models/ModelsHeader";
import ProjectsHeader from "../projects/ProjectsHeader";
import ProcessNavigation from "../process/21st/ProcessNavigation";

const navigation = vi.hoisted(() => ({ pathname: "/process" }));
vi.mock("next/navigation", () => ({ usePathname: () => navigation.pathname }));

function openMenu() {
  const trigger = screen.getByRole("button", { name: "Open navigation" });
  fireEvent.click(trigger);
  return { trigger, dialog: screen.getByRole("dialog", { name: "Site navigation" }) };
}

describe("shared Models/Projects header", () => {
  it("keeps configurator header presentation outside public menu changes", () => {
    navigation.pathname = "/models/signature/forza/configure";
    try {
      const { container } = render(<Header currentHref="/models" />);
      expect(container.querySelector("header")).toHaveAttribute("data-public-site", "false");
      expect(screen.queryByRole("link", { name: "Testimonials" })).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Open navigation" })).toHaveStyle({ width: "100px" });
    } finally { navigation.pathname = "/process"; }
  });

  it("lifts the public header out of an isolated page so its menu can cover the sibling footer", () => {
    const { container } = render(<div style={{ isolation: "isolate" }}><Header /></div>);
    const header = screen.getByRole("banner");
    expect(header.parentElement).toBe(document.body);
    expect(container).not.toContainElement(header);
    const { dialog } = openMenu();
    expect(header).toContainElement(dialog);
    expect(within(dialog).getByRole("link", { name: "Testimonials" })).toBeInTheDocument();
  });

  it("keeps decorative rendering paused through closing, cancels release on reopen and restores it on unmount", () => {
    vi.useFakeTimers();
    const activity: boolean[] = [];
    const readActivity = (event: Event) => activity.push((event as CustomEvent<{ active: boolean }>).detail.active);
    window.addEventListener("okno-public-menu-activity", readActivity);
    const view = render(<Header />);
    try {
      const { trigger } = openMenu();
      expect(activity.at(-1)).toBe(true);
      fireEvent.click(trigger);
      act(() => vi.advanceTimersByTime(249));
      expect(activity.at(-1)).toBe(true);
      fireEvent.click(trigger);
      act(() => vi.advanceTimersByTime(20));
      expect(activity).not.toContain(false);
      fireEvent.click(trigger);
      act(() => vi.advanceTimersByTime(250));
      expect(activity.at(-1)).toBe(false);
      fireEvent.click(trigger);
      view.unmount();
      expect(activity.at(-1)).toBe(false);
      expect(document.documentElement.dataset.oknoPublicMenuActive).toBe("false");
    } finally {
      view.unmount();
      window.removeEventListener("okno-public-menu-activity", readActivity);
      vi.useRealTimers();
    }
  });

  it("does not broadcast public menu activity from the protected configurator", () => {
    navigation.pathname = "/models/signature/forza/configure";
    const listener = vi.fn();
    window.addEventListener("okno-public-menu-activity", listener);
    const view = render(<Header />);
    try {
      const { trigger } = openMenu();
      fireEvent.click(trigger);
      view.unmount();
      expect(listener).not.toHaveBeenCalled();
    } finally {
      view.unmount();
      navigation.pathname = "/process";
      window.removeEventListener("okno-public-menu-activity", listener);
    }
  });

  it("uses the same navigation and source magnetic enquiry action", () => {
    render(<Header />);
    expect(screen.getByRole("link", { name: "OKNO Modhomes home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Enquire" })).toHaveAttribute("href", "/enquiry");
    expect(screen.getByRole("link", { name: "Process" })).toHaveAttribute("aria-current", "page");
    expect(screen.queryByRole("navigation", { name: "Mobile navigation" })).toBeNull();
  });

  it("makes Testimonials reachable and current in public desktop and mobile navigation", () => {
    navigation.pathname = "/testimonials";
    try {
      render(<Header />);
      expect(screen.getByRole("link", { name: "Testimonials" })).toHaveAttribute("aria-current", "page");
      const { dialog } = openMenu();
      expect(within(dialog).getByRole("link", { name: "Testimonials" })).toHaveAttribute("href", "/testimonials");
      expect(within(dialog).getByRole("link", { name: "Testimonials" })).toHaveAttribute("aria-current", "page");
    } finally { navigation.pathname = "/process"; }
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
