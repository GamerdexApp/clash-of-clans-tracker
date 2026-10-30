"use client";

import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "coc_api_cooldown_until";

const getRemainingSeconds = (): number  => {
  if (typeof window === "undefined") return 0;
  const until = parseInt(localStorage.getItem(STORAGE_KEY) ?? "0", 10);
  return Math.max(0, Math.ceil((until - Date.now()) / 1000));
}

interface ApiCooldown {
  secondsLeft: number;
  isOnCooldown: boolean;
  startCooldown: (seconds?: number) => void;
}

export const useApiCooldown = (): ApiCooldown  => {
  const [secondsLeft, setSecondsLeft] = useState(getRemainingSeconds);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = (initial: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSecondsLeft(initial);
    timerRef.current = setInterval(() => {
      const remaining = getRemainingSeconds();
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        clearInterval(timerRef.current!);
        timerRef.current = null;
      }
    }, 1000);
  };

  // On mount: if there's already an active cooldown, resume the countdown.
  // useState(getRemainingSeconds) already initialises secondsLeft correctly,
  // so we only need to start the interval — no direct setState in the effect body.
  useEffect(() => {
    if (getRemainingSeconds() <= 0) return;
    timerRef.current = setInterval(() => {
      const remaining = getRemainingSeconds();
      setSecondsLeft(remaining);
      if (remaining <= 0 && timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startCooldown = (seconds = 60) => {
    localStorage.setItem(STORAGE_KEY, String(Date.now() + seconds * 1000));
    startTimer(seconds);
  };

  return { secondsLeft, isOnCooldown: secondsLeft > 0, startCooldown };
};
