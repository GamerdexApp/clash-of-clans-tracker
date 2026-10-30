import { describe, expect, it } from "vitest";

import { activeHoursProblem, isSameWindow, utcWindowFor } from "@/service/activeHours";
import { localTimeToUtcMinutes, utcMinutesToLocalTimeStr } from "@/lib/utils/activeHoursHelpers";

describe("active hours", () => {
  it("flags equal times and overnight windows", () => {
    expect(activeHoursProblem({ start: "07:00", end: "07:00" })).toBe("sameTime");
    expect(activeHoursProblem({ start: "22:00", end: "06:00" })).toBe("overnight");
    expect(activeHoursProblem({ start: "07:00", end: "23:00" })).toBeNull();
  });

  it("derives the UTC window from the local window", () => {
    const window = utcWindowFor({ start: "07:00", end: "23:00" });
    expect(window.startUtcMinutes).toBe(localTimeToUtcMinutes("07:00"));
    expect(utcMinutesToLocalTimeStr(window.endUtcMinutes)).toBe("23:00");
  });

  it("compares windows", () => {
    expect(isSameWindow({ startUtcMinutes: 1, endUtcMinutes: 2 }, { startUtcMinutes: 1, endUtcMinutes: 2 })).toBe(true);
    expect(isSameWindow(undefined, { startUtcMinutes: 1, endUtcMinutes: 2 })).toBe(false);
  });
});
