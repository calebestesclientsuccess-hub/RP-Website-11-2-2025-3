/**
 * Shared TypeScript types for SimpleBridgeSection components
 */

export type EmberParticle = {
  id: number;
  left: number;
  startY: number;
  delay: number;
  duration: number;
  size: number;
  drift: number;
  spread: number;
  hasSparks: boolean;
  crackleOffset: number;
};

export type EmberOptions = {
  spreadMultiplier?: number;
  durationScale?: number;
  driftScale?: number;
  sizeOffset?: number;
};

