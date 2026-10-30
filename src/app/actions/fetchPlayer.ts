"use server";

import { headers } from "next/headers";

import { createLookupLimiter } from "@/lib/services/lookupLimiter";
import { isPlayerTag, normalizePlayerTag } from "@/lib/services/playerTag";
import type { PlayerApiResponse } from "@/types/app";

// The official API only accepts the IP addresses listed on the key. A host without a fixed outbound IP sets
// COC_API_BASE_URL to a proxy, such as https://cocproxy.royaleapi.dev/v1, and lists the proxy IP on the key.
const COC_API_URL = process.env.COC_API_BASE_URL ?? "https://api.clashofclans.com/v1";

const limiter = createLookupLimiter();

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
  const normalized = normalizePlayerTag(tag);
  if (!isPlayerTag(normalized)) return { success: false, error: { kind: "notFound", tag: normalized } };

  const token = process.env.COC_API_TOKEN;
  if (!token) return { success: false, error: { kind: "unavailable" } };

  const ip = await getClientIp();
  const limit = limiter.check(ip);
  if (!limit.allowed) return { success: false, error: { kind: "rateLimit", seconds: limit.seconds } };

  try {
    const res = await fetch(`${COC_API_URL}/players/${encodeURIComponent(normalized)}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "no-store",
    });

    if (res.status === 403) return { success: false, error: { kind: "unavailable" } };
    if (!res.ok) {
      limiter.recordFailure(ip);
      if (res.status === 404) return { success: false, error: { kind: "notFound", tag: normalized } };
      return { success: false, error: { kind: "api", status: res.status } };
    }

    limiter.recordSuccess(ip);
    return { success: true, player: (await res.json()) as PlayerApiResponse };
  } catch {
    limiter.recordFailure(ip);
    return { success: false, error: { kind: "network" } };
  }
};
