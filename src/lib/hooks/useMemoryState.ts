import { useState } from "react";

const memory = new Map<string, unknown>();

/**
 * State that survives leaving the page and coming back while the app stays open, and is never
 * written to storage. A reload starts clean.
 */
export const useMemoryState = <Value>(key: string, initial: Value) => {
  const [value, setValue] = useState<Value>(() =>
    memory.has(key) ? (memory.get(key) as Value) : initial,
  );

  const update = (next: Value) => {
    memory.set(key, next);
    setValue(next);
  };

  return [value, update] as const;
};

/** Drops everything remembered. Tests call it so one test cannot leak a filter into the next. */
export const forgetMemoryState = () => memory.clear();
