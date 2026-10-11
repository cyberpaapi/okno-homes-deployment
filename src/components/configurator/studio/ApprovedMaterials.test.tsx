import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MATERIAL_FINISHES } from "@/data/configurator";
import ApprovedMaterials from "./ApprovedMaterials";

describe("public approved material collection", () => {
  it("shows all register materials without needing a published model or private library", () => {
    render(<ApprovedMaterials />);
    const samples = within(screen.getByRole("group", { name: "Material samples" }));
    expect(samples.getAllByRole("button")).toHaveLength(26);
    for (const finish of MATERIAL_FINISHES) expect(samples.getByRole("button", { name: `View ${finish.name} sample` })).toBeInTheDocument();
  });
  it("filters using the register's approved applications and restores the full collection", () => {
    render(<ApprovedMaterials />);
    fireEvent.click(screen.getByRole("button", { name: "Roof" }));
    const samples = within(screen.getByRole("group", { name: "Material samples" }));
    const expected = MATERIAL_FINISHES.filter((finish) => finish.approvedApplications.includes("external-roof"));
    expect(samples.getAllByRole("button")).toHaveLength(expected.length);
    for (const finish of expected) expect(samples.getByRole("button", { name: `View ${finish.name} sample` })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "All materials 26" }));
    expect(samples.getAllByRole("button")).toHaveLength(26);
  });
});
