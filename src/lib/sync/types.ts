export type SyncStatus =
  | "idle"
  | "syncing"
  | "offline"
  | "reauth"
  | "needsChoice"
  | "error"
  | "signedOut"
  | "needsRepository"
  | "conflicts";

export type SyncErrorKind = "rateLimit" | "notFound" | "server" | "data" | "busy" | "other" | "forbidden";
