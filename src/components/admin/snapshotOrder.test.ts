import { describe, expect, it } from "vitest";
import { preferNewerSnapshot } from "./snapshotOrder";

describe("admin snapshot ordering", () => {
  const view = (revision: number, draftRevision: number) => ({ revision, draftRevision });

  it("keeps the latest draft when save responses arrive out of order", () => {
    expect(preferNewerSnapshot(view(2, 6), view(2, 1))).toEqual(view(2, 6));
    expect(preferNewerSnapshot(view(2, 1), view(2, 6))).toEqual(view(2, 6));
  });

  it("keeps a publication newer than any draft response", () => {
    expect(preferNewerSnapshot(view(3, 0), view(2, 10))).toEqual(view(3, 0));
    expect(preferNewerSnapshot(view(2, 10), view(3, 0))).toEqual(view(3, 0));
  });
});
