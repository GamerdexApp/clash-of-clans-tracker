import { describe, expect, it } from "vitest";

import { closestPath } from "@/lib/utils/suggestPath";

const known = ["/overview", "/builder", "/builder-base/upgrades", "/forge", "/settings"];

describe("closestPath", () => {
  it("suggests the page for a typo", () => {
    expect(closestPath("/bulider", known)).toBe("/builder");
    expect(closestPath("/overveiw", known)).toBe("/overview");
    expect(closestPath("/Settings/", known)).toBeNull();
  });

  it("suggests nothing for a path that is far from every page", () => {
    expect(closestPath("/completely/different/place", known)).toBeNull();
  });

  it("does not suggest the page itself", () => {
    expect(closestPath("/forge", known)).toBeNull();
  });
});
