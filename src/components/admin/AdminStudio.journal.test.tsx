import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AdminStudio from "./AdminStudio";

describe("Journal page editor", () => {
  it("shows an opening-level featured-story selector backed by Press records", () => {
    render(<AdminStudio />);
    fireEvent.click(screen.getByRole("button", { name: /^Journal\d+$/ }));

    const selector = screen.getByRole("combobox", { name: "Featured Press story" }) as HTMLSelectElement;
    expect(selector.value).toBe("press-ad-india");
    expect(screen.getByRole("option", { name: "No featured story" })).toHaveValue("none");
    expect(screen.getByRole("option", { name: /Mirrored tiny house slides out its bed/ })).toHaveValue("press-new-atlas");

    fireEvent.change(selector, { target: { value: "press-new-atlas" } });
    expect(selector.value).toBe("press-new-atlas");
    expect(screen.getByText(/selected Press record supplies the opening card/)).toBeInTheDocument();
  });
});
