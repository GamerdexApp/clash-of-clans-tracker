/**
 * The index a tab key moves to, or null for any other key. Arrow keys wrap around, and Home and
 * End go to the first and last tab, as in the WAI-ARIA tabs pattern.
 */
export const tabIndexAfterKey = (
  key: string,
  from: number,
  count: number,
): number | null => {
  if (key === "ArrowRight") return (from + 1) % count;
  if (key === "ArrowLeft") return (from - 1 + count) % count;
  if (key === "Home") return 0;
  if (key === "End") return count - 1;
  return null;
};
