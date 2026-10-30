import { createTranslator } from "next-intl";

import { DEFAULT_DATE_FORMAT, DEFAULT_NUMBER_FORMAT, numberTagOf } from "./formats";
import type { DateFormatId, NumberFormatId } from "./formats";
import { DEFAULT_LOCALE, REGION_TAG } from "./locales";
import type { Locale, Messages } from "./locales";
import en from "./messages/en";

/**
 * `I18nProvider` sets this state and remounts its children when it changes, so a plain function
 * such as `formatNumber` is current while it renders.
 */
interface I18nState {
  locale: Locale;
  messages: Messages;
  numberFormat: NumberFormatId;
  dateFormat: DateFormatId;
}

let state: I18nState = {
  locale: DEFAULT_LOCALE,
  messages: en,
  numberFormat: DEFAULT_NUMBER_FORMAT,
  dateFormat: DEFAULT_DATE_FORMAT,
};

export const configureI18n = (next: I18nState) => {
  state = next;
};

export const getI18nState = () => state;

const numberTag = () => numberTagOf(state.numberFormat, state.locale);
const languageTag = () => REGION_TAG[state.locale];

const numberFormatters = new Map<string, Intl.NumberFormat>();

const numberFormatter = (options: Intl.NumberFormatOptions = {}) => {
  const key = `${numberTag()}|${JSON.stringify(options)}`;
  const known = numberFormatters.get(key);
  if (known) return known;

  const created = new Intl.NumberFormat(numberTag(), options);
  numberFormatters.set(key, created);
  return created;
};

export const formatNumber = (value: number) => numberFormatter().format(value);

export const formatDecimal = (value: number, maxFractionDigits = 2) =>
  numberFormatter({ maximumFractionDigits: maxFractionDigits }).format(value);

export const formatFixed = (value: number, digits: number) =>
  numberFormatter({ minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);

type NumericDateFormat = Exclude<DateFormatId, "auto">;

const DATE_PATTERNS: Record<NumericDateFormat, Array<"year" | "month" | "day">> = {
  mdy: ["month", "day", "year"],
  dmy: ["day", "month", "year"],
  ymd: ["year", "month", "day"],
};

const DATE_SEPARATOR: Record<NumericDateFormat, string> = { mdy: "/", dmy: "/", ymd: "-" };

/** The numeric date in the chosen order. Without the year it keeps the day and the month. */
const numericDate = (date: Date, format: NumericDateFormat, withYear: boolean) => {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { year: "numeric", month: "2-digit", day: "2-digit" })
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  );
  return DATE_PATTERNS[format]
    .filter((type) => withYear || type !== "year")
    .map((type) => parts[type])
    .join(DATE_SEPARATOR[format]);
};

export const formatTime = (date: Date) =>
  date.toLocaleTimeString(languageTag(), { hour: "numeric", minute: "2-digit" });

export const formatDateTime = (iso: string) => {
  const date = new Date(iso);
  if (state.dateFormat !== "auto") return `${numericDate(date, state.dateFormat, true)}, ${formatTime(date)}`;
  return date.toLocaleString(languageTag(), { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
};

/** Month and day, without the year. */
export const formatShortDate = (iso: string) => {
  const date = new Date(iso);
  if (state.dateFormat !== "auto") return numericDate(date, state.dateFormat, false);
  return date.toLocaleDateString(languageTag(), { month: "short", day: "numeric" });
};

export const formatDate = (iso: string) => {
  const date = new Date(iso);
  if (state.dateFormat !== "auto") return numericDate(date, state.dateFormat, true);
  return date.toLocaleDateString(languageTag(), { year: "numeric", month: "short", day: "numeric" });
};

/** The weekday and time an upgrade finishes. */
export const formatFinishTime = (date: Date) =>
  date.toLocaleString(languageTag(), { weekday: "short", hour: "numeric", minute: "2-digit" });

export const formatCompact = (value: number) => numberFormatter({ notation: "compact", maximumFractionDigits: 1 }).format(value);

export const formatList = (items: string[]) => new Intl.ListFormat(languageTag(), { type: "conjunction" }).format(items);

export const formatRelative = (value: number, unit: Intl.RelativeTimeFormatUnit) =>
  new Intl.RelativeTimeFormat(languageTag(), { numeric: "auto" }).format(value, unit);

export const formatTimeZoneName = () =>
  new Intl.DateTimeFormat(languageTag(), { timeZoneName: "long" }).formatToParts(new Date()).find((part) => part.type === "timeZoneName")?.value ?? "";

export const formatMonthYear = (date: Date) => date.toLocaleDateString(languageTag(), { month: "long", year: "numeric" });

export const formatMonthDay = (date: Date, month: "long" | "short") => date.toLocaleDateString(languageTag(), { month, day: "numeric" });

/** The calendar day and the time, such as when every queued upgrade is done. */
export const formatDayTime = (date: Date) =>
  date.toLocaleString(languageTag(), { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

/** A component uses the `useTranslations` hook instead. */
export const translator = <Namespace extends keyof Messages>(namespace: Namespace) =>
  createTranslator({ locale: state.locale, messages: state.messages, namespace });
