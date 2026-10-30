import type { AppSettings } from "@/types/app";

type UiSettings = NonNullable<AppSettings["ui"]>;

const HIDE_MAX_KEYS = [
  "upgrade:builder:hideMax",
  "upgrade:research:hideMax",
  "upgrade:pets:hideMax",
  "upgrade:equipment:hideMax",
];

const HIDDEN_CATEGORY_KEYS = {
  builder: "queue:builder:hiddenCategories",
  research: "queue:research:hiddenCategories",
} as const;

export const LEGACY_KEYS = [
  ...HIDE_MAX_KEYS,
  ...Object.values(HIDDEN_CATEGORY_KEYS),
];

const readCategories = (
  storage: Pick<Storage, "getItem">,
  key: string,
): string[] | undefined => {
  try {
    const parsed: unknown = JSON.parse(storage.getItem(key) ?? "null");
    if (!Array.isArray(parsed)) return undefined;
    const ids = parsed.filter((id): id is string => typeof id === "string");
    return ids.length > 0 ? ids : undefined;
  } catch {
    return undefined;
  }
};

/**
 * The old app kept one Hide Max flag per page. The new app has one shared flag, so it is on
 * when any old flag was on. Values already in `ui` win over the old keys.
 */
export const uiFromLegacyKeys = (
  storage: Pick<Storage, "getItem">,
  current: UiSettings = {},
): UiSettings => {
  const hadHideMax = HIDE_MAX_KEYS.some(
    (key) => storage.getItem(key) === "true",
  );
  const builder = readCategories(storage, HIDDEN_CATEGORY_KEYS.builder);
  const research = readCategories(storage, HIDDEN_CATEGORY_KEYS.research);

  return {
    ...current,
    ...(current.hideMax === undefined && hadHideMax ? { hideMax: true } : {}),
    ...((builder && !current.hiddenCategories?.builder) ||
    (research && !current.hiddenCategories?.research)
      ? {
          hiddenCategories: {
            ...current.hiddenCategories,
            ...(builder && !current.hiddenCategories?.builder
              ? { builder }
              : {}),
            ...(research && !current.hiddenCategories?.research
              ? { research }
              : {}),
          },
        }
      : {}),
  };
};

export const hasLegacyKeys = (storage: Pick<Storage, "getItem">): boolean =>
  LEGACY_KEYS.some((key) => storage.getItem(key) !== null);
