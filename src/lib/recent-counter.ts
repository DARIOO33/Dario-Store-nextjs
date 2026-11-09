// Counts events per key (for example orders per IP address) over a sliding time window, in the
// server's memory. Good enough on one VPS process: it is reset by a restart or deploy, which
// only gives a spammer a fresh hour, and it stores no IP address in the database.
export function recentCounter(windowMs: number) {
  const times = new Map<string, number[]>();

  function recent(key: string, nowMs: number) {
    const kept = (times.get(key) ?? []).filter((time) => nowMs - time < windowMs);
    if (kept.length) times.set(key, kept);
    else times.delete(key);
    return kept;
  }

  return {
    // Adds one event unless the key already has `max` in the window. Synchronous on purpose:
    // many requests sent at the same moment are counted one by one, none slips through.
    tryAdd(key: string, max: number, nowMs = Date.now()): boolean {
      const kept = recent(key, nowMs);
      if (kept.length >= max) return false;
      times.set(key, [...kept, nowMs]);
      return true;
    },
  };
}
