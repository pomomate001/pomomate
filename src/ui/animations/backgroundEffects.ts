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
    label: 'Sade',
    category: 'none',
    free: true,
    icon: 'close-circle',
    description: 'Düz ve dikkat dağıtmayan arka plan',
  },

  // Canlı Video Arka Planlar (AI Video Loops)
  {
    id: 'video_windmill',
    label: 'Rüzgar Değirmeni',
    category: 'video',
    free: true,
    icon: 'videocam',
    description: 'Ekin tarlası ve dönen yel değirmeni',
  },
  {
    id: 'video_sky',
    label: 'Süzülen Bulutlar',
    category: 'video',
    free: true,
    icon: 'videocam',
    description: 'Huzurlu gökyüzü ve süzülen bulutlar',
  },
  {
    id: 'video_rain',
    label: 'Dingin Yağmur',
    category: 'video',
    free: true,
    icon: 'videocam',
    description: 'Sakinleştirici doğa ve yağmur manzarası',
  },

  // Statik Görsel Arka Planlar
  {
    id: 'image_pixel_art',
    label: 'Retro Piksel Manzara',
    category: 'image',
    free: true,
    icon: 'image',
    description: 'Sıcak atmosferli piksel sanat duvar kağıdı',
  },

  // Parçacık Efektleri
  {
    id: 'particles',
    label: 'Işıltılı Parçacıklar',
    category: 'particle',
    free: true,
    icon: 'sparkles',
    description: 'Yavaşça süzülen parıltılı ışık tozları',
  },
  {
    id: 'rain',
    label: 'Yağmur Damlaları',
    category: 'particle',
    free: false,
    icon: 'rainy',
    description: 'Ekrana hafifçe düşen yağmur damlaları',
  },
  {
    id: 'snow',
    label: 'Kar Yağışı',
    category: 'particle',
    free: false,
    icon: 'snow',
    description: 'Huzur veren nazik kar taneleri',
  },
  {
    id: 'bubbles',
    label: 'Uçuşan Baloncuklar',
    category: 'particle',
    free: false,
    icon: 'water',
    description: 'Yukarı doğru süzülen şeffaf baloncuklar',
  },
];
