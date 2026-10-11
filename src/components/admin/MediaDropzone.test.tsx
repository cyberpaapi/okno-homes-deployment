import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ContentField } from "@/data/adminContent";
import { MediaDropzone } from "./AdminStudio";

describe("MediaDropzone", () => {
  it("allows the same file to be chosen again after the first upload", () => {
    const onUploaded = vi.fn();
    const field = { kind: "image" } as ContentField;
    const { container } = render(<MediaDropzone field={field} onUploaded={onUploaded} busy={false} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["test image"], "logo.png", { type: "image/png" });

    fireEvent.change(input, { target: { files: [file] } });
    expect(input.value).toBe("");
    fireEvent.change(input, { target: { files: [file] } });
    expect(onUploaded).toHaveBeenCalledTimes(2);
    expect(onUploaded).toHaveBeenNthCalledWith(1, file);
    expect(onUploaded).toHaveBeenNthCalledWith(2, file);
  });
});
