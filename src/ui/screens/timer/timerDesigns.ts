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
  description?: string;
}

export const timerDesigns: TimerDesignDef[] = [
  { id: 'minimal', label: 'Minimalist', free: true, description: 'Yalnızca süreye odaklanan sade görünüm' },
  { id: 'circle', label: 'Klasik Daire', free: true, description: 'Tam dairesel dolum çemberi' },
  { id: 'digital', label: 'Modern Dijital', free: true, description: 'LED dijital saat göstergesi' },
  { id: 'arc', label: 'Kavisli Yay', free: false, description: 'Modern kavisli sayaç yayı' },
  { id: 'neon', label: 'Neon Parıltı', free: false, description: 'Işıltılı çift halka neon gösterge' },
];
