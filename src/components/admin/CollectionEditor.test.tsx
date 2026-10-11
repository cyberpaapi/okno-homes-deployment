import { useState } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { collectionDefinitionsById, type ContentItem } from "@/lib/contentCollections";
import CollectionEditor from "./CollectionEditor";

const definition = collectionDefinitionsById.get("signature.gallery.forza")!;

function Fixture({ start }: { start: ContentItem[] }) {
  const [items, setItems] = useState(start);
  return <><CollectionEditor definition={definition} items={items} onChange={setItems} onUpload={vi.fn(async () => "/uploaded.webp")} /><output data-testid="order">{items.map(item => item.id).join(",")}</output></>;
}

function openItem(id: string) {
  const summary = screen.getByText(id, { selector: "small" }).closest("summary")!;
  const details = summary.closest("details")!;
  if (!details.open) fireEvent.click(summary);
  return within(details);
}

describe("reusable collection editor", () => {
  it("hides and shows a Journal record without removing it from the editor", () => {
    const pressDefinition = collectionDefinitionsById.get("journal.press")!;
    const onChange = vi.fn();
    const item = { id: "news", fields: { visibility: "shown", title: "A news story", href: "https://example.com" } };
    const { rerender } = render(<CollectionEditor definition={pressDefinition} items={[item]} onChange={onChange} onUpload={vi.fn()} />);
    fireEvent.change(screen.getByRole("combobox", { name: "Visibility" }), { target: { value: "hidden" } });
    expect(onChange).toHaveBeenCalledWith([{ id: "news", fields: expect.objectContaining({ visibility: "hidden" }) }]);
    rerender(<CollectionEditor definition={pressDefinition} items={[{ ...item, fields: { ...item.fields, visibility: "hidden" } }]} onChange={onChange} onUpload={vi.fn()} />);
    expect(screen.getByText("A news story")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Visibility" })).toHaveValue("hidden");
  });

  it("adds, duplicates, reorders, removes and restores an image item", () => {
    render(<Fixture start={[{ id: "outside", fields: { label: "Outside", image: "/photo.webp", alt: "Outside view" } }]} />);
    fireEvent.click(screen.getByRole("button", { name: "Add image" }));
    expect(screen.getByTestId("order")).toHaveTextContent("outside,new-image");
    fireEvent.click(openItem("outside").getByRole("button", { name: "Duplicate" }));
    expect(screen.getByTestId("order")).toHaveTextContent("outside,outside-copy,new-image");
    fireEvent.click(openItem("outside").getByRole("button", { name: "Move down" }));
    expect(screen.getByTestId("order")).toHaveTextContent("outside-copy,outside,new-image");
    fireEvent.click(openItem("outside").getByRole("button", { name: "Remove" }));
    expect(screen.getByTestId("order")).toHaveTextContent("outside-copy,new-image");
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(screen.getByTestId("order")).toHaveTextContent("outside-copy,outside,new-image");
  });

  it("edits a gallery button label without a fixed length", () => {
    render(<Fixture start={[{ id: "outside", fields: { label: "Outside", image: "/photo.webp", alt: "Outside view" } }]} />);
    const field = screen.getByRole("textbox", { name: /Image button text/ });
    fireEvent.change(field, { target: { value: "A longer view across the garden and lake" } });
    expect(field).toHaveValue("A longer view across the garden and lake");
    expect(screen.getByText("A longer view across the garden and lake")).toBeInTheDocument();
  });

  it("focuses a new Home opening without losing the rest of the collection", () => {
    const homeDefinition = collectionDefinitionsById.get("home.variants")!;
    const onChange = vi.fn();
    render(<CollectionEditor definition={homeDefinition} items={[
      { id: "hero-v1", fields: { name: "Forest", template: "v1", accessibleTitle: "Forest home" } },
      { id: "new-opening", fields: { name: "New opening", template: "v2", accessibleTitle: "New OKNO home" } },
    ]} focusedId="new-opening" onChange={onChange} onUpload={vi.fn(async () => "/uploaded.mp4")} />);
    expect(screen.getAllByText("New opening")).toHaveLength(2);
    expect(screen.queryByText("Forest")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Add opening" })).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox", { name: "Accessible page title" }), { target: { value: "Changed title" } });
    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({ id: "hero-v1" }),
      expect.objectContaining({ id: "new-opening", fields: expect.objectContaining({ accessibleTitle: "Changed title" }) }),
    ]);
  });
});
