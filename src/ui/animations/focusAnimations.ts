export interface FocusAnimationMeta {
  id: string;
  label: string;
  icon: string;
  free: boolean;
  type: 'svg' | 'lottie' | 'image';
}

export const focusAnimations: FocusAnimationMeta[] = [
  {
    id: 'none',
    label: '🚫 Yok (Sadece Arka Plan)',
    icon: 'close-circle',
    free: true,
    type: 'svg',
  },
  {
    id: 'cat_tail',
    label: '🐱 Uyanık Kedi',
    icon: 'paw',
    free: true,
    type: 'lottie',
  },
  {
    id: 'cat_table_right',
    label: '😴 Uyuyan Kedi (Sağ)',
    icon: 'cafe',
    free: true,
    type: 'svg',
  },
  {
    id: 'cat_table_left',
    label: '😴 Uyuyan Kedi (Sol)',
    icon: 'laptop',
    free: true,
    type: 'svg',
  },
  {
    id: 'campfire_svg',
    label: '🔥 Kamp Ateşi (SVG)',
    icon: 'flame',
    free: true,
    type: 'svg',
  },
  {
    id: 'campfire_lottie',
    label: '⛺ Kamp & Ateş',
    icon: 'bonfire',
    free: true,
    type: 'lottie',
  },
  {
    id: 'camping_marshmallow',
    label: '🍢 Çadır & Marshmallow',
    icon: 'trail-sign',
    free: true,
    type: 'lottie',
  },
];
