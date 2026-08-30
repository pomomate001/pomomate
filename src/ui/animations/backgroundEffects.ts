/**
 * Background animation / effect registry — extensible.
 *
 * Supports particle animations, full-screen live video loops, and static image wallpapers.
 * The actual rendering component is resolved in BackgroundEffect.tsx.
 */

export type BackgroundCategory = 'none' | 'video' | 'image' | 'particle';

export interface BackgroundEffectDef {
  id: string;
  label: string;
  category: BackgroundCategory;
  free: boolean;
  icon?: string;
  description?: string;
}

export const backgroundEffects: BackgroundEffectDef[] = [
  // Standart / Efekt Yok
  {
    id: 'none',
    label: 'Yok',
    category: 'none',
    free: true,
    icon: 'close-circle',
  },

  // Canlı Video Arka Planlar (AI Video Loops)
  {
    id: 'video_windmill',
    label: '🌾 Yel Değirmeni (Canlı)',
    category: 'video',
    free: true,
    icon: 'videocam',
    description: 'Ekin tarlası ve dönen yel değirmeni',
  },
  {
    id: 'video_sky',
    label: '☁️ Bulutlu Gökyüzü (Canlı)',
    category: 'video',
    free: true,
    icon: 'videocam',
    description: 'Huzurlu gökyüzü ve süzülen bulutlar',
  },
  {
    id: 'video_rain',
    label: '🌧️ Yağmurlu Doğa (Canlı)',
    category: 'video',
    free: true,
    icon: 'videocam',
    description: 'Sakinleştirici yağmur manzarası',
  },

  // Statik Görsel Arka Planlar
  {
    id: 'image_pixel_art',
    label: '🎨 Pixel Art Manzara',
    category: 'image',
    free: true,
    icon: 'image',
    description: 'Retro pixel art duvar kağıdı',
  },

  // Parçacık Efektleri
  {
    id: 'particles',
    label: '✨ Parçacıklar',
    category: 'particle',
    free: true,
    icon: 'sparkles',
  },
  {
    id: 'rain',
    label: '💧 Yağmur Efekti',
    category: 'particle',
    free: false,
    icon: 'rainy',
  },
  {
    id: 'snow',
    label: '❄️ Kar Efekti',
    category: 'particle',
    free: false,
    icon: 'snow',
  },
  {
    id: 'bubbles',
    label: '🫧 Baloncuklar',
    category: 'particle',
    free: false,
    icon: 'water',
  },
];
