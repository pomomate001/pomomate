export interface FocusAnimationMeta {
  id: string;
  label: string;
  icon: string;
  free: boolean;
  type: 'svg' | 'lottie' | 'image';
  description?: string;
}

export const focusAnimations: FocusAnimationMeta[] = [
  {
    id: 'none',
    label: 'Animasyonsuz',
    icon: 'close-circle',
    free: true,
    type: 'svg',
    description: 'Sadece sayaç ve arka plan',
  },
  {
    id: 'cat_tail',
    label: 'Neşeli Kedi',
    icon: 'paw',
    free: true,
    type: 'lottie',
    description: 'Kuyruk sallayan sevimli kedi',
  },
  {
    id: 'cat_table_right',
    label: 'Huzurlu Kedi',
    icon: 'cafe',
    free: true,
    type: 'svg',
    description: 'Masa başında uyuyan kedi',
  },
  {
    id: 'campfire_svg',
    label: 'Alev Dansı',
    icon: 'flame',
    free: true,
    type: 'svg',
    description: 'Zarif dans eden kamp ateşi',
  },
  {
    id: 'campfire_lottie',
    label: 'Gece Kampı',
    icon: 'bonfire',
    free: true,
    type: 'lottie',
    description: 'Doğada yanan kamp ateşi',
  },
  {
    id: 'camping_marshmallow',
    label: 'Kamp & Keyif',
    icon: 'trail-sign',
    free: true,
    type: 'lottie',
    description: 'Çadır ve közde marshmallow',
  },
];
