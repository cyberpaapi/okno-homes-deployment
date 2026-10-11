import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { JournalSourceMark } from "./JournalSourceMark";

describe("publication identity", () => {
  it("omits the icon entirely when the publication supplies no logo", () => {
    const { container } = render(<><JournalSourceMark source="New Atlas" logo="" /><strong>New Atlas</strong></>);
    expect(container.querySelector("[data-journal-source-mark]")).toBeNull();
    expect(screen.getByText("New Atlas")).toBeInTheDocument();
  });

  it("shows a custom uploaded icon without recoloring it in the ticker", () => {
    const { container } = render(<JournalSourceMark source="New Atlas" logo="/api/site-media/custom.webp" monochrome />);
    expect(container.querySelector("img")).toHaveAttribute("src", "/api/site-media/custom.webp");
    expect(container.querySelector("svg")).toBeNull();
  });
});
