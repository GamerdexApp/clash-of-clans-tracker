/**
 * The index a tab key moves to, or null for any other key. Arrow keys wrap around, and Home and
 * End go to the first and last tab, as in the WAI-ARIA tabs pattern. In a right-to-left layout the
 * arrow keys swap, because the next tab sits on the left.
 */
export const tabIndexAfterKey = (
  key: string,
  from: number,
  count: number,
  rightToLeft = false,
): number | null => {
  const nextKey = rightToLeft ? "ArrowLeft" : "ArrowRight";
  const previousKey = rightToLeft ? "ArrowRight" : "ArrowLeft";
  if (key === nextKey) return (from + 1) % count;
  if (key === previousKey) return (from - 1 + count) % count;
  if (key === "Home") return 0;
  if (key === "End") return count - 1;
  return null;
};
