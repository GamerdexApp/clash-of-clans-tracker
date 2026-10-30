export const toDateInputValue = (iso?: string): string => (iso ? iso.split("T")[0] : "");

/** A date from a date field is stored as UTC midnight, as the old app did. */
export const fromDateInputValue = (value: string): string | undefined =>
  value ? new Date(`${value}T00:00:00.000Z`).toISOString() : undefined;

export const todayDateInputValue = (now = new Date()): string => {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};
