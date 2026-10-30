export const SUCCESS_COOLDOWN_MS = 60_000;
const FAILURE_WINDOW_MS = 10 * 60_000;
const MAX_FAILURES_PER_WINDOW = 5;
const CALL_WINDOW_MS = 60_000;
const MAX_CALLS_PER_WINDOW = 30;

export type LimitResult =
  { allowed: true } | { allowed: false; seconds: number };

const secondsUntil = (ms: number) => Math.max(1, Math.ceil(ms / 1000));

/**
 * Limits calls to the Clash of Clans API. Failed lookups count too, so a script cannot probe with bad tags,
 * and a global cap protects the shared API key. State lives in the memory of one server instance, so on
 * serverless hosting it is a first filter and a firewall rule is the hard limit.
 */
export const createLookupLimiter = (now: () => number = Date.now) => {
  const lastSuccess = new Map<string, number>();
  const failures = new Map<string, number[]>();
  let calls: number[] = [];

  const purge = (time: number) => {
    for (const [ip, at] of lastSuccess)
      if (time - at >= SUCCESS_COOLDOWN_MS) lastSuccess.delete(ip);
    for (const [ip, times] of failures) {
      const recent = times.filter((at) => time - at < FAILURE_WINDOW_MS);
      if (recent.length === 0) failures.delete(ip);
      else failures.set(ip, recent);
    }
    calls = calls.filter((at) => time - at < CALL_WINDOW_MS);
  };

  return {
    /** Records the call when it is allowed. */
    check(ip: string): LimitResult {
      const time = now();
      purge(time);

      const success = lastSuccess.get(ip);
      if (success !== undefined)
        return {
          allowed: false,
          seconds: secondsUntil(SUCCESS_COOLDOWN_MS - (time - success)),
        };

      const recentFailures = failures.get(ip) ?? [];
      if (recentFailures.length >= MAX_FAILURES_PER_WINDOW) {
        return {
          allowed: false,
          seconds: secondsUntil(FAILURE_WINDOW_MS - (time - recentFailures[0])),
        };
      }

      if (calls.length >= MAX_CALLS_PER_WINDOW) {
        return {
          allowed: false,
          seconds: secondsUntil(CALL_WINDOW_MS - (time - calls[0])),
        };
      }

      calls.push(time);
      return { allowed: true };
    },

    recordSuccess(ip: string) {
      lastSuccess.set(ip, now());
    },

    recordFailure(ip: string) {
      failures.set(ip, [...(failures.get(ip) ?? []), now()]);
    },
  };
};
