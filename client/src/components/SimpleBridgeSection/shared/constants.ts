/**
 * Shared constants for SimpleBridgeSection components
 */

/**
 * Prime numbers used for generating pseudo-random but deterministic ember patterns
 */
export const EMBER_PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];

/**
 * Red glow text shadow definition for "You need a system."
 */
export const RED_GLOW_SHADOW = `
  0 0 8px rgba(0, 0, 0, 0.9),
  0 0 2px #ff0000,
  0 0 10px #ff0000,
  0 0 30px #ff0000,
  0 0 60px #cc0000,
  0 0 100px #990000
`;

/**
 * Standard red glow style object for red text
 */
export const STANDARD_GLOW_STYLE = {
  color: '#ff3300',
  WebkitTextStroke: '2px #ff0000',
  willChange: 'text-shadow, transform' as const,
  transform: 'translateZ(0)',
  textShadow: RED_GLOW_SHADOW
};

