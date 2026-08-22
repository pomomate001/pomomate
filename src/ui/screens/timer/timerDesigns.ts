/**
 * Timer design registry — extensible.
 *
 * Each design defines how the timer circle/face is rendered.
 * Add a new design by creating a component and registering it here.
 */

export interface TimerDesignDef {
  id: string;
  label: string;
  /** Whether this design is available for free users. */
  free: boolean;
}

export const timerDesigns: TimerDesignDef[] = [
  { id: 'minimal', label: 'Minimal', free: true },
  { id: 'circle', label: 'Daire', free: true },
  { id: 'arc', label: 'Yay', free: false },
];

/**
 * Add new timer designs:
 *   timerDesigns.push({ id: 'neon', label: 'Neon', free: false });
 */
