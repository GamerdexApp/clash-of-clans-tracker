const editDistance = (a: string, b: string): number => {
  const row = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    let diagonal = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const above = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
      diagonal = above;
    }
  }
  return row[b.length];
};

const MAX_DISTANCE_SHARE = 0.34;

/** The known path closest to a mistyped one, or null when nothing is close enough to be a typo. */
export const closestPath = (pathname: string, known: readonly string[]): string | null => {
  const wanted = pathname.toLowerCase().replace(/\/+$/, "");
  let best: { path: string; distance: number } | null = null;
  for (const path of known) {
    const distance = editDistance(wanted, path.toLowerCase());
    if (!best || distance < best.distance) best = { path, distance };
  }
  if (!best || best.distance === 0) return null;
  return best.distance <= Math.max(2, Math.floor(best.path.length * MAX_DISTANCE_SHARE)) ? best.path : null;
};
