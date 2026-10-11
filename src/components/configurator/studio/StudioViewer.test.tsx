import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import StudioViewer from "./StudioViewer";
import { createStudioScene, type SceneState } from "./studioScene";

vi.mock("./studioScene", () => ({ createStudioScene: vi.fn() }));
const create = vi.mocked(createStudioScene);
const state: SceneState = { groups: [], choices: { "external-wall": "golden-oak" }, selected: [], isolate: false, original: false };
const api = () => ({ update: vi.fn(), dispose: vi.fn(), fit: vi.fn(), lighting: vi.fn() });

beforeEach(() => { create.mockReset(); });

describe("customer preview recovery", () => {
  it("retries a failed material on the current model and current selections", async () => {
    const scene = api(); create.mockResolvedValue(scene);
    render(<StudioViewer slug="tengo" state={state} />);
    await screen.findByRole("button", { name: "Reset view" });
    const report = create.mock.calls[0][5]!;
    act(() => report("A material sample could not load."));
    fireEvent.click(screen.getByRole("button", { name: "Retry material" }));
    expect(scene.update).toHaveBeenLastCalledWith(state);
    expect(scene.update).toHaveBeenCalledTimes(2);
    expect(create).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("uses a fresh canvas after context loss and restores the selected palette", async () => {
    const first = api(), second = api();
    create.mockResolvedValueOnce(first).mockResolvedValueOnce(second);
    const { container } = render(<StudioViewer slug="tengo" state={state} />);
    await screen.findByRole("button", { name: "Reset view" });
    const originalCanvas = container.querySelector("canvas")!;
    fireEvent(originalCanvas, new Event("webglcontextlost", { cancelable: true }));
    expect(create.mock.calls[0][2].aborted).toBe(true);
    expect(screen.getByText("3D preview unavailable")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retry 3D" }));
    await waitFor(() => expect(second.update).toHaveBeenCalledWith(state));
    expect(container.querySelector("canvas")).not.toBe(originalCanvas);
    expect(first.dispose).toHaveBeenCalled();
    act(() => create.mock.calls[0][5]!("Old request failed"));
    expect(screen.queryByText("Old request failed")).not.toBeInTheDocument();
  });

  it("recovers from a failed model download without losing choices", async () => {
    const scene = api();
    create.mockRejectedValueOnce(new Error("Offline")).mockResolvedValueOnce(scene);
    render(<StudioViewer slug="tengo" state={state} />);
    fireEvent.click(await screen.findByRole("button", { name: "Retry 3D" }));
    await waitFor(() => expect(scene.update).toHaveBeenCalledWith(state));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});


describe("customer scene lighting", () => {
  it("changes lighting without reloading the house or changing finish selections", async () => {
    const scene = api(); create.mockResolvedValue(scene);
    render(<StudioViewer slug="tengo" state={state} />);
    fireEvent.click(await screen.findByRole("button", { name: "Golden hour" }));
    expect(scene.lighting).toHaveBeenLastCalledWith("golden");
    expect(create).toHaveBeenCalledTimes(1);
    expect(scene.update).toHaveBeenCalledTimes(1);
    expect(scene.update).toHaveBeenLastCalledWith(state);
    expect(create.mock.calls[0][6]).toBe(true);
    expect(screen.getByRole("button", { name: "Golden hour" })).toHaveAttribute("aria-pressed", "true");
  });
  it("keeps the admin surface editor on its original setting", async () => {
    const scene = api(); create.mockResolvedValue(scene);
    render(<StudioViewer slug="tengo" state={state} admin />);
    fireEvent.click(screen.getByRole("button", { name: /Explore in 3D/ }));
    await screen.findByRole("button", { name: "Reset view" });
    expect(create.mock.calls[0][6]).toBe(false);
    expect(screen.queryByRole("group", { name: "Preview lighting" })).not.toBeInTheDocument();
  });
});
