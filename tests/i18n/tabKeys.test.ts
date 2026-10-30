import { describe, expect, it } from "vitest";

import { tabIndexAfterKey } from "@/lib/utils/tabKeys";

describe("tabIndexAfterKey", () => {
  it("moves right with ArrowRight in a left-to-right layout and wraps", () => {
    expect(tabIndexAfterKey("ArrowRight", 0, 3)).toBe(1);
    expect(tabIndexAfterKey("ArrowLeft", 0, 3)).toBe(2);
  });

  it("swaps the arrow keys in a right-to-left layout", () => {
    expect(tabIndexAfterKey("ArrowLeft", 0, 3, true)).toBe(1);
    expect(tabIndexAfterKey("ArrowRight", 0, 3, true)).toBe(2);
  });
});
