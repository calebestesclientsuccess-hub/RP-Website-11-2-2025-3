export const MAX_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MS = 15 * 60 * 1000;
export const ATTEMPT_WINDOW_MS = 5 * 60 * 1000;

export function computeNextAttemptState(
  prev:
    | {
        count: number | null;
        lastAttempt: Date | null;
      }
    | null,
  now: Date,
) {
  let count = 1;
  if (prev?.lastAttempt) {
    const last = prev.lastAttempt.getTime();
    if (now.getTime() - last <= ATTEMPT_WINDOW_MS) {
      count = (prev.count ?? 0) + 1;
    }
  }

  const lockedUntil =
    count >= MAX_ATTEMPTS
      ? new Date(now.getTime() + LOCKOUT_DURATION_MS)
      : null;

  return { count, lockedUntil };
}

