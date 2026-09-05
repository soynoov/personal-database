export const motionPresets = {
  cardTilt: {
    maxDegrees: 3,
    followDuration: 0.16,
    resetDuration: 0.24,
    ease: 'power2.out',
  },
  goldenFoil: {
    followDuration: 0.12,
    resetDuration: 0.26,
    opacity: 0.68,
    ease: 'power2.out',
  },
} as const;
