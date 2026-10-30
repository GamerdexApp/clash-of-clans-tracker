import { describe, expect, it } from "vitest";
import { createLookupLimiter } from "@/lib/services/lookupLimiter";
import { isPlayerTag } from "@/lib/services/playerTag";

const clockAt = (start = 1_000_000) => {
  let time = start;
  return { now: () => time, advance: (ms: number) => void (time += ms) };
};

describe("lookup limiter", () => {
  it("blocks a client for 60 seconds after a successful lookup", () => {
    const clock = clockAt();
    const limiter = createLookupLimiter(clock.now);
    expect(limiter.check("a")).toEqual({ allowed: true });
    limiter.recordSuccess("a");
    clock.advance(20_000);
    expect(limiter.check("a")).toEqual({ allowed: false, seconds: 40 });
    expect(limiter.check("b")).toEqual({ allowed: true });
    clock.advance(40_000);
    expect(limiter.check("a")).toEqual({ allowed: true });
  });

  it("counts failed lookups and stops a client after five in ten minutes", () => {
    const clock = clockAt();
    const limiter = createLookupLimiter(clock.now);
    for (let i = 0; i < 5; i++) {
      expect(limiter.check("a").allowed).toBe(true);
      limiter.recordFailure("a");
      clock.advance(1_000);
    }
    expect(limiter.check("a")).toEqual({ allowed: false, seconds: 595 });
    clock.advance(595_000);
    expect(limiter.check("a").allowed).toBe(true);
  });

  it("caps the calls of all clients together", () => {
    const clock = clockAt();
    const limiter = createLookupLimiter(clock.now);
    for (let i = 0; i < 30; i++)
      expect(limiter.check(`ip-${i}`).allowed).toBe(true);
    expect(limiter.check("another")).toEqual({ allowed: false, seconds: 60 });
    clock.advance(60_000);
    expect(limiter.check("another").allowed).toBe(true);
  });
});

describe("isPlayerTag", () => {
  it("accepts tags built from the game characters", () => {
    expect(isPlayerTag("#PPV2Y09R")).toBe(true);
  });

  it("rejects other characters, a missing hash and bad lengths", () => {
    expect(isPlayerTag("#ABC")).toBe(false);
    expect(isPlayerTag("PPV2Y09R")).toBe(false);
    expect(isPlayerTag("#P")).toBe(false);
    expect(isPlayerTag("#" + "P".repeat(16))).toBe(false);
  });
});
