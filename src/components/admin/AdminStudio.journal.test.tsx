import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AdminStudio from "./AdminStudio";

describe("Journal page editor", () => {
  it("shows an opening-level featured-story selector backed by Press records", () => {
    render(<AdminStudio />);
    const hierarchy = screen.getByLabelText("Website page hierarchy");
    fireEvent.click(within(hierarchy).getByRole("button", { name: /^Journal\d+$/ }));

    const label = screen.getByText("Featured Press story", { selector: "label" }) as HTMLLabelElement;
    const selector = label.control as HTMLSelectElement;
    expect(selector).toHaveRole("combobox");
    expect(selector).toHaveAccessibleName("Featured Press story");
    expect(selector.value).toBe("press-ad-india");
    expect(within(selector).getByRole("option", { name: "No featured story" })).toHaveValue("none");
    expect(within(selector).getByRole("option", { name: /Mirrored tiny house slides out its bed/ })).toHaveValue("press-new-atlas");

    fireEvent.change(selector, { target: { value: "press-new-atlas" } });
    expect(selector.value).toBe("press-new-atlas");
    expect(screen.getByText(/selected Press record supplies the opening card/)).toBeInTheDocument();
  });
});
