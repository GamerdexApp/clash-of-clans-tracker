import {
  authorizeUrl,
  AUTH_SERVICE_URL as DEFAULT_AUTH_URL,
  CLIENT_IDS as DEFAULT_CLIENT_IDS,
  dropboxAuthorizeUrl,
  DropboxProvider,
  GitHubProvider,
  googleAuthorizeUrl,
  GoogleDriveProvider,
  microsoftAuthorizeUrl,
  OneDriveProvider,
  ROOT_FOLDER,
  type SyncProvider,
} from "@gamerdexapp/gamerdex-sync";
import type { DeviceSync } from "./device";
import type { SyncProviderId } from "./providers";

type FolderProviderId = Exclude<SyncProviderId, "github">;

/** These functions load on demand, so a visitor who never connects a cloud account never loads them. */
/** The sign in service. A variable replaces the default of the sync package. */
const AUTH_URL = process.env.NEXT_PUBLIC_GAMERDEX_AUTH_URL ?? DEFAULT_AUTH_URL;

/** The public client IDs. A variable replaces the default of the sync package. */
const CLIENT_IDS: Record<FolderProviderId, string> = {
  google: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? DEFAULT_CLIENT_IDS.google,
  dropbox:
    process.env.NEXT_PUBLIC_DROPBOX_CLIENT_ID ?? DEFAULT_CLIENT_IDS.dropbox,
  microsoft:
    process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID ?? DEFAULT_CLIENT_IDS.microsoft,
};

/** The sign in service without a provider, so a value that ends in a provider name still works. */
const authBase = AUTH_URL.replace(/\/+$/, "").replace(
  /\/(github|google|dropbox|microsoft)$/,
  "",
);

export const authEndpoint = (provider: SyncProviderId) =>
  `${authBase}/${provider}`;

/**
 * The folder that holds the folder of the tracker, as the player sees it. Dropbox and OneDrive name
 * their app folder after the app registration, so these names must match the registrations.
 */
const PARENT_FOLDERS: Partial<Record<SyncProviderId, string>> = {
  dropbox: "Apps/Gamerdex",
  microsoft: "Apps/Gamerdex Sync/Gamerdex",
};

export const dataFolderOf = (provider: SyncProviderId, appId: string) =>
  `${PARENT_FOLDERS[provider] ?? ROOT_FOLDER}/${appId}`;

const FOLDER_SIGN_IN_URLS = {
  google: googleAuthorizeUrl,
  dropbox: dropboxAuthorizeUrl,
  microsoft: microsoftAuthorizeUrl,
};

export const signInUrl = (
  provider: SyncProviderId,
  redirectUri: string,
  state: string,
) =>
  provider === "github"
    ? authorizeUrl(redirectUri, state)
    : FOLDER_SIGN_IN_URLS[provider](CLIENT_IDS[provider], redirectUri, state);

const FOLDER_PROVIDERS = {
  google: GoogleDriveProvider,
  dropbox: DropboxProvider,
  microsoft: OneDriveProvider,
};

export const createProvider = (
  provider: SyncProviderId,
  device: DeviceSync,
  getToken: () => Promise<string>,
): SyncProvider | null => {
  if (provider !== "github")
    return new FOLDER_PROVIDERS[provider]({ getToken });
  return device.repository
    ? new GitHubProvider({ repository: device.repository, getToken })
    : null;
};
