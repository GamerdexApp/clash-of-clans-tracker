import { messages } from "@/i18n/text";

export const uiText = messages<{
  close: string;
  field: {
    optional: string;
  };
  stepper: {
    lower: (label: string) => string;
    raise: (label: string) => string;
    labelPrefix: (label: string) => string;
  };
  switch: {
    on: string;
    off: string;
  };
  tabs: {
    locked: string;
  };
  toast: {
    dismiss: string;
    variants: {
      success: string;
      info: string;
      warning: string;
      error: string;
    };
    missingProvider: string;
  };
  filters: {
    filters: string;
    activeCount: (count: number) => string;
    clearFilters: string;
    reset: string;
    description: string;
  };
  savedChip: {
    automatic: string;
    justNow: string;
    minutesAgo: (count: number) => string;
    at: (time: string) => string;
    failed: string;
  };
}>("ui", {
  fns: {
    "stepper.lower": ["label"],
    "stepper.raise": ["label"],
    "stepper.labelPrefix": ["label"],
    "filters.activeCount": ["count"],
    "savedChip.minutesAgo": ["count"],
    "savedChip.at": ["time"],
  },
  arrays: [],
});
