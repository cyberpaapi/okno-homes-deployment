import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AboutExperience from "./AboutExperience";

vi.mock("next/navigation", () => ({ usePathname: () => "/about" }));
vi.mock("@/components/projects/21st/SilkBackground", () => ({
  SilkBackground: () => <canvas data-testid="about-silk-background" />,
}));

beforeEach(() => { vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} }); });

describe("About experience", () => {
  it("keeps the complete OKNO story in the rebuilt photo-and-copy sequence", () => {
    render(<AboutExperience />);
    expect(screen.getByRole("heading", { name: "About OKNO" })).toBeInTheDocument();
    expect(screen.getByText("Revolutionise construction.")).toBeInTheDocument();
    expect(screen.getByText("Driving the world's transition to sustainable luxury living.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Fabricating the Future" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Meet our founders" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Why OKNO?" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "A perfect fit. Everywhere, every time." })).toBeInTheDocument();
    expect(
      Array.from(document.querySelectorAll("[data-about-21st]")).map((node) => node.getAttribute("data-about-21st")),
    ).toEqual(expect.arrayContaining(["kuratlielia/text-reveal", "24383"]));
    expect(document.querySelector("[data-about-surface='silk']")).toBeInTheDocument();
    expect(screen.getByTestId("about-silk-background")).toBeInTheDocument();
    expect(document.querySelectorAll("[data-about-viewport-section]")).toHaveLength(7);
    expect(document.querySelector("[data-about-paper]")).toBeInTheDocument();
    expect(document.querySelectorAll("[data-about-paper] [data-about-viewport-section]")).toHaveLength(2);
    expect(document.querySelector('[data-about-21st="4775"]')).not.toBeInTheDocument();
    expect(document.querySelector('[data-about-21st="3362"]')).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "From brief to home in 90 days." })).not.toBeInTheDocument();
    expect(screen.queryByText("Days 01—10")).not.toBeInTheDocument();
    expect(screen.queryByText("Days 73—90")).not.toBeInTheDocument();
    expect(screen.getByText("90 days move-in")).toBeInTheDocument();
    expect(screen.getByText("20 years")).toBeInTheDocument();
    expect(document.querySelectorAll("[data-about-icon]")).toHaveLength(5);
    expect(screen.queryByText("The essentials are designed into every home, not added as decoration.")).not.toBeInTheDocument();
    expect(screen.queryByText("Built for the land")).not.toBeInTheDocument();
    expect(screen.queryByText("Founded in Hyderabad")).not.toBeInTheDocument();
    expect(screen.queryByText("Sixty-five homes. Seventeen features.")).not.toBeInTheDocument();
    expect(screen.queryByText("One connected system")).not.toBeInTheDocument();
  });

  it("uses the real founders and architecture imagery without adding a redundant page CTA", () => {
    render(<AboutExperience />);
    expect(screen.getByRole("img", { name: "OKNO Modhomes founders" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "The timber facade and entrance of an OKNO home" })).toBeInTheDocument();
    expect(document.querySelector("#founders")).not.toHaveClass("lg:min-h-[100svh]");
    expect(document.querySelectorAll("section.grid")).toHaveLength(0);
    expect(screen.queryByRole("link", { name: /Start a conversation/ })).not.toBeInTheDocument();
  });
});
