"use server";

import { headers } from "next/headers";

import type { PlayerApiResponse } from "@/types/app";

const COC_API_URL = "https://api.clashofclans.com/v1";

// Module-level singleton: survives across requests in the same server process.
// Keyed by client IP → timestamp of last successful call.
const _lastCall = new Map<string, number>();
const RATE_LIMIT_MS = 60_000; // 60 seconds

const getRateLimitResult = (ip: string): { allowed: boolean; secondsRemaining: number } => {
  const now = Date.now();
  const last = _lastCall.get(ip) ?? 0;
  const elapsed = now - last;
  if (elapsed < RATE_LIMIT_MS) {
    return { allowed: false, secondsRemaining: Math.ceil((RATE_LIMIT_MS - elapsed) / 1000) };
  }
  _lastCall.set(ip, now);
  return { allowed: true, secondsRemaining: 0 };
};

const getClientIp = async (): Promise<string> => {
  try {
    const h = await headers();
    return (
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      h.get("x-real-ip") ??
      "unknown"
    );
  } catch {
    return "unknown";
  }
};

export type PlayerLookupError =
  | { kind: "rateLimit"; seconds: number }
  | { kind: "unavailable" }
  | { kind: "notFound"; tag: string }
  | { kind: "api"; status: number }
  | { kind: "network" };

export const fetchPlayerByTag = async (
  tag: string,
): Promise<
  | { success: true; player: PlayerApiResponse }
  | { success: false; error: PlayerLookupError }
> => {
  const ip = await getClientIp();
  const { allowed, secondsRemaining } = getRateLimitResult(ip);

  if (!allowed) {
    return {
      success: false,
      error: { kind: "rateLimit", seconds: secondsRemaining },
    };
  }

  const token = process.env.COC_API_TOKEN;

  if (!token) {
    // Don't consume the rate limit slot for a config error
    _lastCall.delete(ip);
    return { success: false, error: { kind: "unavailable" } };
  }

  // Normalise the tag: ensure it starts with #
  const normalized = tag.trim().startsWith("#") ? tag.trim() : `#${tag.trim()}`;

  try {
    const res = await fetch(`${COC_API_URL}/players/${encodeURIComponent(normalized)}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      // Don't consume the rate limit slot on API errors so the user can correct and retry
      _lastCall.delete(ip);
      if (res.status === 404)
        return { success: false, error: { kind: "notFound", tag: normalized } };
      if (res.status === 403)
        return { success: false, error: { kind: "unavailable" } };
      return { success: false, error: { kind: "api", status: res.status } };
    }

    const player = (await res.json()) as PlayerApiResponse;
    return { success: true, player };
  } catch (err: unknown) {
    _lastCall.delete(ip);
    return { success: false, error: { kind: "network" } };
  }
}
