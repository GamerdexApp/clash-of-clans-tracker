import type { DeviceSync } from "./device";

export type SyncProviderId = "github" | "google" | "dropbox" | "microsoft";

type FolderProviderId = Exclude<SyncProviderId, "github">;

/**
 * This file must not import the sync package. Every page loads it, and the package loads on demand.
 * The values of the package are in `providerFactory.ts`.
 *
 * A build variable that is set but empty turns sync off, or leaves one provider out of this build.
 * A variable that is not set keeps the default of the sync package.
 */
const authServiceOff =
  process.env.NEXT_PUBLIC_GAMERDEX_AUTH_URL?.replace(/\/+$/, "") === "";

const clientIdOff: Record<FolderProviderId, boolean> = {
  google: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID === "",
  dropbox: process.env.NEXT_PUBLIC_DROPBOX_CLIENT_ID === "",
  microsoft: process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID === "",
};

const PICKER_ORDER: SyncProviderId[] = [
  "google",
  "dropbox",
  "microsoft",
  "github",
];

export const availableProviders: SyncProviderId[] = authServiceOff
  ? []
  : PICKER_ORDER.filter(
      (provider) => provider === "github" || !clientIdOff[provider],
    );

export const usesRepository = (provider: SyncProviderId) =>
  provider === "github";

/** A device that signed in before there was a choice of providers used GitHub. */
export const providerOf = (device: DeviceSync): SyncProviderId | null =>
  device.provider ?? (device.tokens ? "github" : null);
