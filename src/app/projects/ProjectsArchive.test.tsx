import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ProjectsArchive from "./ProjectsArchive";

describe("ProjectsArchive", () => {
  it("filters the structured archive and keeps every project action real", () => {
    render(<ProjectsArchive />);

    expect(screen.getByRole("heading", { name: "Mehul Valley" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Mirror House" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "The first home delivered" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Export 01" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Homes" }));

    expect(screen.queryByRole("heading", { name: "Mehul Valley" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Mirror House" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "The first home delivered" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Export 01" })).not.toBeInTheDocument();

    expect(screen.getAllByRole("link").every((link) => link.getAttribute("href") !== "#")).toBe(true);
    expect(
      screen
        .getAllByRole("link", { name: /Discuss this project/ })
        .some((link) => link.getAttribute("href") === "/enquiry?project=mirror-house"),
    ).toBe(true);
  });
});
