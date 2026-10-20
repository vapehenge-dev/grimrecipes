import { useEffect, useState } from "react";

const preferenceKey = "grim-weekly-reset-enabled";
const weekKey = "grim-weekly-reset-week";

export function weekStarting(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London", year: "numeric", month: "numeric", day: "numeric"
  }).formatToParts(date);
  const part = (type: string) => Number(parts.find(p => p.type === type)?.value);
  const monday = new Date(Date.UTC(part("year"), part("month") - 1, part("day")));
  monday.setUTCDate(monday.getUTCDate() - (monday.getUTCDay() + 6) % 7);
  return monday.toISOString().slice(0, 10);
}

export function weeklyResetDue(storage: Pick<Storage, "getItem" | "setItem">, enabled: boolean, date = new Date()) {
  const week = weekStarting(date);
  const previous = storage.getItem(weekKey);
  storage.setItem(weekKey, week);
  // Establish the current week on first use without deleting an existing plan.
  return enabled && previous !== null && previous !== week;
}

export function useWeeklyReset(
  setPlanner: (value: Record<string, number[]>) => void,
  setChecked: (value: string[]) => void,
  setRemoved: (value: string[]) => void
) {
  const [enabled, setEnabled] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try { setEnabled(localStorage.getItem(preferenceKey) !== "false"); } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const check = () => {
      try {
        if (weeklyResetDue(localStorage, enabled)) {
          setPlanner({}); setChecked([]); setRemoved([]);
        }
      } catch {}
    };
    const resume = () => { if (document.visibilityState === "visible") check(); };
    check();
    const timer = window.setInterval(check, 30000);
    window.addEventListener("focus", check);
    document.addEventListener("visibilitychange", resume);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", check);
      document.removeEventListener("visibilitychange", resume);
    };
  }, [enabled, ready, setPlanner, setChecked, setRemoved]);

  const changeEnabled = (value: boolean) => {
    try {
      localStorage.setItem(preferenceKey, JSON.stringify(value));
      localStorage.setItem(weekKey, weekStarting());
    } catch {}
    setEnabled(value);
  };
  return [enabled, changeEnabled] as const;
}
