/**
 * Background animation / effect registry — extensible.
 *
 * Each definition declares an id and label. The actual rendering
 * component is resolved in BackgroundEffect.tsx via a switch.
 *
 * To add a new effect:
 *   1. Create a component (e.g. StarfieldEffect.tsx)
 *   2. Push a def here
 *   3. Add a case in BackgroundEffect.tsx
 */

export interface BackgroundEffectDef {
  id: string;
  label: string;
  free: boolean;
}

export const backgroundEffects: BackgroundEffectDef[] = [
  { id: 'none', label: 'Yok', free: true },
  { id: 'particles', label: 'Parçacıklar', free: true },
  { id: 'gradient', label: 'Gradient', free: false },
];
