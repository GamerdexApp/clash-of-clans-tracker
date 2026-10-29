import { useEffect, useState } from "react";

/** One clock for a page. Every countdown reads this value, so they all tick together. */
export const useNow = (intervalMs = 1_000) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return now;
};
