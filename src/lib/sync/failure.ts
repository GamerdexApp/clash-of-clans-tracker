import { ProviderError, RemoteDataError, SyncBusyError } from "@gamerdexapp/gamerdex-sync";

import type { SyncErrorKind, SyncStatus } from "./types";

export interface Failure {
  status: SyncStatus;
  kind: SyncErrorKind | null;
  httpStatus: number | null;
}

/** Reads a failed sync into the state that the Cloud sync tab shows. */
export const failureOf = (error: unknown): Failure => {
  if (error instanceof ProviderError) {
    const httpStatus = error.status ?? null;
    if (error.kind === "network") return { status: "offline", kind: null, httpStatus };
    if (error.kind === "auth" && httpStatus === 403) return { status: "error", kind: "forbidden", httpStatus };
    if (error.kind === "auth") return { status: "reauth", kind: null, httpStatus };
    if (error.kind === "rate-limit") return { status: "error", kind: "rateLimit", httpStatus };
    if (error.kind === "not-found") return { status: "error", kind: "notFound", httpStatus };
    if (error.kind === "server") return { status: "error", kind: "server", httpStatus };
    return { status: "error", kind: "data", httpStatus };
  }
  if (error instanceof RemoteDataError) return { status: "error", kind: "data", httpStatus: null };
  if (error instanceof SyncBusyError) return { status: "error", kind: "busy", httpStatus: null };
  return { status: "error", kind: "other", httpStatus: null };
};
