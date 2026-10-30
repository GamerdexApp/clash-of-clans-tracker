import { useSyncExternalStore } from "react";
import type { DateFormatId, NumberFormatId } from "./formats";
import { DATE_FORMATS, NUMBER_FORMATS } from "./formats";
import type { Locale } from "./locales";
import { isSupportedLocale } from "./locales";

/**
 * A device setting with the language and the formats. It is not part of the saved villages,
 * not exported, not imported and not synced, so it has a key of its own.
 */
export const PREFS_KEY = "clash-of-clans-tracker-prefs";

export interface Prefs {
  language?: Locale;
  numberFormat?: NumberFormatId;
  dateFormat?: DateFormatId;
}

const EMPTY: Prefs = {};
const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cached: Prefs = EMPTY;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** Unknown or old values read as the default, so a bad key never breaks the app. */
const parsePrefs = (raw: string | null): Prefs => {
  if (raw === null) return EMPTY;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return EMPTY;
    const numberFormat = NUMBER_FORMATS.find(
      (f) => f.id === parsed.numberFormat,
    )?.id;
    const dateFormat = DATE_FORMATS.find((f) => f.id === parsed.dateFormat)?.id;
    return {
      ...(isSupportedLocale(parsed.language) && { language: parsed.language }),
      ...(numberFormat && { numberFormat }),
      ...(dateFormat && { dateFormat }),
    };
  } catch {
    return EMPTY;
  }
};

export const prefsStore = {
  load(): Prefs {
    if (typeof window === "undefined") return EMPTY;
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      if (raw === cachedRaw) return cached;
      cachedRaw = raw;
      cached = parsePrefs(raw);
      return cached;
    } catch {
      return EMPTY;
    }
  },

  loadOnServer: (): Prefs => EMPTY,

  update(changes: Prefs) {
    try {
      localStorage.setItem(
        PREFS_KEY,
        JSON.stringify({ ...prefsStore.load(), ...changes }),
      );
    } catch {
      return;
    }
    listeners.forEach((listener) => listener());
  },

  subscribe(listener: () => void) {
    listeners.add(listener);
    window.addEventListener("storage", listener);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", listener);
    };
  },
};

export const usePrefs = (): Prefs =>
  useSyncExternalStore(
    prefsStore.subscribe,
    prefsStore.load,
    prefsStore.loadOnServer,
  );
