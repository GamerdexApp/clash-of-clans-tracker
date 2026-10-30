import { afterEach, describe, expect, it } from "vitest";

import { DATE_FORMATS, NUMBER_FORMATS, numberTagOf } from "@/i18n/formats";
import type { DateFormatId, NumberFormatId } from "@/i18n/formats";
import { configureI18n, formatDate, formatDateTime, formatDecimal, formatFixed, formatNumber, formatShortDate } from "@/i18n/formatter";
import { DEFAULT_LOCALE, directionOf, isSupportedLocale, loadMessages, REGION_TAG, SUPPORTED_LOCALES } from "@/i18n/locales";
import type { Locale } from "@/i18n/locales";
import en from "@/i18n/messages/en";
import { PREFS_KEY, prefsStore } from "@/i18n/prefs";

const use = (locale: Locale, numberFormat: NumberFormatId = "auto", dateFormat: DateFormatId = "auto") =>
  configureI18n({ locale, messages: en, numberFormat, dateFormat });

afterEach(() => use(DEFAULT_LOCALE));

describe("languages", () => {
  it("offers English and the 18 languages of the other trackers", () => {
    expect(SUPPORTED_LOCALES).toHaveLength(19);
    expect(SUPPORTED_LOCALES[0]).toBe("en");
    expect(Object.keys(REGION_TAG).sort()).toEqual([...SUPPORTED_LOCALES].sort());
  });

  it("knows a supported language and rejects anything else", () => {
    expect(isSupportedLocale("fr")).toBe(true);
    expect(isSupportedLocale("pt-BR")).toBe(true);
    expect(isSupportedLocale("xx")).toBe(false);
    expect(isSupportedLocale(undefined)).toBe(false);
  });

  it("writes Arabic right to left and every other language left to right", () => {
    expect(directionOf("ar")).toBe("rtl");
    SUPPORTED_LOCALES.filter((locale) => locale !== "ar").forEach((locale) => expect(directionOf(locale)).toBe("ltr"));
  });

  it("shows English for a message that a language has not translated", async () => {
    const messages = await loadMessages("fr");
    expect(messages.settings.region.title).toBeTruthy();
    expect(Object.keys(messages)).toEqual(Object.keys(en));
  });
});

describe("number formats", () => {
  it("follows the language when the choice is Automatic", () => {
    use("de");
    expect(formatNumber(1234567.5)).toBe("1.234.567,5");
    use("fr");
    expect(formatNumber(1234567.5).replace(/\s/g, " ")).toBe("1 234 567,5");
    use("en");
    expect(formatNumber(1234567.5)).toBe("1,234,567.5");
  });

  it("uses the chosen format whatever the language is", () => {
    use("en", "european");
    expect(formatNumber(1234.5)).toBe("1.234,5");
    use("de", "us");
    expect(formatNumber(1234.5)).toBe("1,234.5");
    use("en", "indian");
    expect(formatNumber(1234567)).toBe("12,34,567");
    use("en", "swiss");
    expect(formatNumber(1234567)).toMatch(/^1['’]234['’]567$/);
  });

  it("writes decimals with the decimal sign of the format", () => {
    use("en");
    expect(formatDecimal(4.75, 2)).toBe("4.75");
    expect(formatFixed(1.3, 2)).toBe("1.30");
    use("de");
    expect(formatDecimal(4.75, 2)).toBe("4,75");
    expect(formatFixed(1.3, 2)).toBe("1,30");
  });

  it("lists the formats of the other trackers", () => {
    expect(NUMBER_FORMATS.map((format) => format.id)).toEqual(["auto", "us", "european", "french", "swiss", "indian"]);
    expect(numberTagOf("auto", "es")).toBe(REGION_TAG.es);
    expect(numberTagOf("european", "en")).toBe("de-DE");
  });
});

describe("date formats", () => {
  const moment = "2026-10-08T14:05:00.000Z";

  it("writes Month/Day/Year, Day/Month/Year and Year-Month-Day", () => {
    expect(DATE_FORMATS.map((format) => format.id)).toEqual(["auto", "mdy", "dmy", "ymd"]);
    use("en", "auto", "mdy");
    expect(formatDate(moment)).toBe("10/08/2026");
    use("en", "auto", "dmy");
    expect(formatDate(moment)).toBe("08/10/2026");
    use("en", "auto", "ymd");
    expect(formatDate(moment)).toBe("2026-10-08");
  });

  it("leaves the year out of a short date", () => {
    use("en", "auto", "mdy");
    expect(formatShortDate(moment)).toBe("10/08");
    use("en", "auto", "ymd");
    expect(formatShortDate(moment)).toBe("10-08");
    use("en");
    expect(formatShortDate(moment)).toBe("Oct 8");
  });

  it("follows the language when the choice is Automatic", () => {
    use("en");
    expect(formatDate(moment)).toBe("Oct 8, 2026");
    use("de");
    expect(formatDate(moment)).toContain("2026");
    expect(formatDate(moment)).not.toBe("Oct 8, 2026");
  });

  it("puts the time after the numeric date", () => {
    use("en", "auto", "ymd");
    expect(formatDateTime(moment)).toMatch(/^2026-10-08, \d{1,2}:05/);
  });
});

describe("saved preferences", () => {
  it("keeps a valid language and formats and drops invalid ones", () => {
    localStorage.clear();
    prefsStore.update({ language: "fr", numberFormat: "european", dateFormat: "ymd" });
    expect(prefsStore.load()).toEqual({ language: "fr", numberFormat: "european", dateFormat: "ymd" });

    localStorage.setItem(PREFS_KEY, JSON.stringify({ language: "xx", numberFormat: "nope", dateFormat: 5 }));
    expect(prefsStore.load()).toEqual({});
  });

  it("keeps the other preferences when one changes", () => {
    localStorage.clear();
    prefsStore.update({ numberFormat: "swiss" });
    prefsStore.update({ language: "ja" });
    expect(prefsStore.load()).toEqual({ numberFormat: "swiss", language: "ja" });
  });

  it("uses a key of its own, outside the saved villages", () => {
    expect(PREFS_KEY).toBe("clash-of-clans-tracker-prefs");
  });
});
