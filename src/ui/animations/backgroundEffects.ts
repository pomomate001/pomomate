/**
 * Background animation / effect registry — extensible.
 *
 * Each definition declares an id and label. The actual rendering
 * component is resolved in BackgroundEffect.tsx via a switch.
 */

export interface BackgroundEffectDef {
  id: string;
  label: string;
  free: boolean;
}

export const backgroundEffects: BackgroundEffectDef[] = [
  { id: 'none', label: 'Yok', free: true },
  { id: 'particles', label: 'Parçacıklar', free: true },
  { id: 'rain', label: 'Yağmur', free: false },
  { id: 'snow', label: 'Kar', free: false },
  { id: 'bubbles', label: 'Baloncuklar', free: false },
];
