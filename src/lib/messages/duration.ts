import { messages } from "@/i18n/text";

export const durationText = messages<{
  days: (count: number) => string;
  hours: (count: number) => string;
  minutes: (count: number) => string;
  seconds: (count: number) => string;
  paddedSeconds: (count: string) => string;
  join: (first: string, second: string) => string;
}>("duration", {
  fns: {
    days: ["count"],
    hours: ["count"],
    minutes: ["count"],
    seconds: ["count"],
    paddedSeconds: ["count"],
    join: ["first", "second"],
  },
  arrays: [],
});
