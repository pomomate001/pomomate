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
    label: 'Odak Arkadaşı',
    icon: 'cafe',
    free: true,
    type: 'svg',
    description: 'Masa başında sessizce eşlik eden kedi',
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
  {
    id: 'boy_reading',
    label: 'Kitap Okuyan Çocuk',
    icon: 'book',
    free: true,
    type: 'lottie',
    description: 'Masa başında kitap okuyan öğrenci',
  },
  {
    id: 'bunny_and_dog',
    label: 'Tavşan ve Köpek',
    icon: 'pencil',
    free: true,
    type: 'lottie',
    description: 'Masa başında çalışan sevimli dostlar',
  },
  {
    id: 'cozy_night',
    label: 'Huzurlu Gece',
    icon: 'moon',
    free: true,
    type: 'lottie',
    description: 'Yatakta dinlenme ve rahatlama modu',
  },
  {
    id: 'girl_reading',
    label: 'Kitap Okuyan Kız',
    icon: 'school',
    free: true,
    type: 'lottie',
    description: 'Bilgi dünyasına dalmış öğrenci',
  },
  {
    id: 'girl_reading_2',
    label: 'Pencere Kenarında',
    icon: 'cafe',
    free: true,
    type: 'lottie',
    description: 'Pencere kenarında kahve ve kitap keyfi',
  },
  {
    id: 'study_boy',
    label: 'Ders Çalışan Çocuk',
    icon: 'headset',
    free: true,
    type: 'lottie',
    description: 'Kulaklıkla notlarını tekrarlayan öğrenci',
  },
  {
    id: 'study_girl',
    label: 'Ders Çalışan Kız',
    icon: 'bulb',
    free: true,
    type: 'lottie',
    description: 'Lamba altında kitap okuyan öğrenci',
  },
];
