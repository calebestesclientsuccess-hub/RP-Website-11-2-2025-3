/**
 * Ember particle generation logic
 * Shared between Desktop and Mobile components (though mobile uses fewer)
 */

import { EMBER_PRIMES } from './constants';
import type { EmberParticle, EmberOptions } from './types';

/**
 * Generates an array of ember particles with deterministic pseudo-random properties
 * Uses prime number sequences for consistent, non-repeating patterns
 * 
 * @param count - Number of ember particles to generate
 * @param options - Optional scaling parameters for mobile vs desktop
 * @returns Array of ember particle configurations
 */
export const generateEmbers = (
  count: number,
  options: EmberOptions = {}
): EmberParticle[] => {
  const {
    spreadMultiplier = 1,
    durationScale = 1,
    driftScale = 1,
    sizeOffset = 0,
  } = options;

  const systemLeft = 50; // Center point percentage
  const baseSpread = 7 * spreadMultiplier;

  return Array.from({ length: count }, (_, i) => {
    const p1 = EMBER_PRIMES[i % EMBER_PRIMES.length];
    const p2 = EMBER_PRIMES[(i + 5) % EMBER_PRIMES.length];
    const p3 = EMBER_PRIMES[(i + 11) % EMBER_PRIMES.length];

    const left =
      systemLeft +
      (((i * p1 * 1.7) % 100) / 100) * baseSpread * 2 -
      baseSpread;

    const spawnHeight = 4 + ((i * p2 * 0.43) % 5);
    const durationBase = 25 + ((i * p3) % 30);
    const duration = Math.max(10, durationBase * durationScale);
    const delay = -((i * p1 * p2 * 0.017) % duration);

    return {
      id: i,
      left,
      startY: spawnHeight,
      delay,
      duration,
      size: Math.max(2, 3 + ((i * p1) % 6) - sizeOffset),
      drift:
        ((i % 2 === 0 ? 1 : -1) * (12 + ((i * p2) % 4) * 6)) * driftScale,
      spread:
        ((i % 2 === 0 ? 1 : -1) * (35 + ((i * p3) % 7) * 15)) * driftScale,
      hasSparks: i % 3 === 0,
      crackleOffset: ((i * p1) % 10) * 0.15,
    };
  });
};

