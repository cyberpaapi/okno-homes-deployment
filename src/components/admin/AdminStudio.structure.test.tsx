import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AdminStudio from "./AdminStudio";

describe("page-first admin structure", () => {
  it("starts sections collapsed and nests the Signature controls under each model", () => {
    render(<AdminStudio />);
    fireEvent.click(screen.getByRole("button", { name: /Signature models\d+/ }));
    expect(screen.getByText("Signature model library")).toBeInTheDocument();
    const model = screen.getAllByText("Forza", { exact: true }).find(element => element.tagName === "SPAN")?.closest("details");
    expect(model).not.toHaveAttribute("open");
    fireEvent.click(model!.querySelector("summary")!);
    expect(model).toHaveAttribute("open");
    expect(model!.textContent).toContain("rotation media");
    expect(model!.textContent).toContain("Explore details");
    expect(model!.textContent).toContain("Plans, areas and prices");
    expect(model!.querySelectorAll("details[open]")).toHaveLength(0);
  });

  it("keeps the Models dropdown open long enough to select Signature", () => {
    render(<AdminStudio />);
    const modelsSummary = screen.getByText("Models", { exact: true }).closest("summary")!;
    fireEvent.click(modelsSummary);
    expect(modelsSummary.closest("details")).toHaveAttribute("open");
    fireEvent.click(screen.getByRole("button", { name: /Signature models\d+/ }));
    expect(screen.getByRole("heading", { level: 1, name: "Signature models" })).toBeInTheDocument();
  });

  it("keeps Footer link lists inside closed column sections", () => {
    render(<AdminStudio />);
    fireEvent.click(screen.getByRole("button", { name: /^Footer\d+$/ }));
    const homes = screen.getAllByText("Homes links", { exact: true }).find(element => element.tagName === "SPAN")?.closest("details");
    expect(homes).not.toHaveAttribute("open");
    fireEvent.click(homes!.querySelector("summary")!);
    expect(homes).toHaveAttribute("open");
    expect(homes!.textContent).toContain("Add link");
  });

  it("places independent globe pins above the Project library", () => {
    render(<AdminStudio />);
    fireEvent.click(screen.getByRole("button", { name: /^Projects\d+$/ }));
    const pins = screen.getAllByText("Globe pins", { exact: true }).find(element => element.tagName === "SPAN")?.closest("details");
    const library = screen.getByText("Project library", { exact: true }).closest("details");
    expect(pins).not.toHaveAttribute("open");
    expect(library).not.toHaveAttribute("open");
    expect(pins!.compareDocumentPosition(library!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    fireEvent.click(pins!.querySelector("summary")!);
    expect(pins!.textContent).toContain("Add location pin");
    expect(pins!.textContent).toContain("No project page or photograph is required");
  });

  it("opens Process with collapsed film, chapter and five-phase timeline editors", () => {
    render(<AdminStudio />);
    fireEvent.click(screen.getByRole("button", { name: /^Process\d+$/ }));
    expect(screen.queryByText(/Process content editing is paused/)).not.toBeInTheDocument();
    const opening = screen.getByText("Film opening", { exact: true }).closest("details");
    const timeline = screen.getByText("Five-phase timeline opening", { exact: true }).closest("details");
    const firstPhase = screen.getByText("Detail 1 · Brief and site", { exact: true }).closest("details");
    expect(opening).not.toHaveAttribute("open");
    expect(timeline).not.toHaveAttribute("open");
    expect(firstPhase).not.toHaveAttribute("open");
    fireEvent.click(firstPhase!.querySelector("summary")!);
    expect(firstPhase).toHaveAttribute("open");
    expect(within(firstPhase!).getByRole("textbox", { name: "Photograph local path" })).toHaveValue("/process/generated/photo-series-v1/site-survey.webp");
    expect(firstPhase!.textContent).toContain("Image description");
  });

  it("warns when a saved Process day range falls back on the public site", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ revision: 9, draftRevision: 50, published: { "process.stage-land.days": "Days 01–1022321222" }, draft: {}, publishedCollections: {}, draftCollections: {}, history: [] }),
    } as Response);
    try {
      render(<AdminStudio />);
      fireEvent.change(screen.getByLabelText("Admin token"), { target: { value: "local-test-token" } });
      fireEvent.click(screen.getByRole("button", { name: "Connect" }));
      await screen.findByText("Editor connected.");
      fireEvent.click(screen.getByRole("button", { name: /^Process\d+$/ }));
      fireEvent.click(screen.getByText("Land · film chapter", { exact: true }).closest("summary")!);
      expect(screen.getByText("Saved range is invalid; the website shows the original until corrected.")).toBeInTheDocument();
      expect(document.getElementById("process.stage-land.days")).toHaveValue("Days 01–1022321222");
    } finally {
      fetchMock.mockRestore();
    }
  });
});
