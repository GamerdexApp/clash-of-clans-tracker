export const uiText = {
  close: "Close",
  field: { optional: "Optional" },
  stepper: {
    lower: (label: string) => `Lower ${label}`,
    raise: (label: string) => `Raise ${label}`,
    labelPrefix: (label: string) => `${label}, `,
  },
  switch: { on: "On", off: "Off" },
  tabs: { locked: " (locked)" },
  toast: {
    dismiss: "Dismiss",
    variants: {
      success: "Success",
      info: "Info",
      warning: "Warning",
      error: "Error",
    },
    missingProvider: "useToast must be used within a ToastProvider",
  },
  filters: {
    filters: "Filters",
    activeCount: (count: number) => `${count} active`,
    clearFilters: "Clear filters",
    reset: "Reset",
    description: "Changes apply as you go. Filters are not saved.",
  },
  savedChip: {
    automatic: "Saves automatically",
    justNow: "Saved just now",
    minutesAgo: (count: number) => `Saved ${count} min ago`,
    at: (time: string) => `Saved ${time}`,
    failed: "Not saved, storage is full",
  },
} as const;
