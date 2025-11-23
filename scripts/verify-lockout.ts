import assert from "node:assert/strict";
import {
  computeNextAttemptState,
  MAX_ATTEMPTS,
  ATTEMPT_WINDOW_MS,
} from "../server/lib/lockout-utils";

const now = new Date();

const first = computeNextAttemptState(null, now);
assert.equal(first.count, 1);
assert.equal(first.lockedUntil, null);

const nearWindow = computeNextAttemptState(
  { count: MAX_ATTEMPTS - 1, lastAttempt: new Date(now.getTime() - 500) },
  now,
);
assert.equal(nearWindow.count, MAX_ATTEMPTS);
assert.ok(nearWindow.lockedUntil);

const outsideWindow = computeNextAttemptState(
  {
    count: MAX_ATTEMPTS - 1,
    lastAttempt: new Date(now.getTime() - (ATTEMPT_WINDOW_MS + 1000)),
  },
  now,
);
assert.equal(outsideWindow.count, 1);

console.log("✅ Lockout computation verified");

