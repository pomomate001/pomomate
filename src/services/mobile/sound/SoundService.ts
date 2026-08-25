/**
 * Sound Service — handles audio cues and timer completion sounds.
 */
import { createAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { logger } from '../../../utils/logger';
import { useSettingsStore } from '../../../state';

export interface SoundItem {
  id: string;
  label: string;
  description: string;
  url: string;
}

export const SOUND_PRESETS: SoundItem[] = [
  {
    id: 'default',
    label: 'Dijital Melodi',
    description: 'Canlı ve net bir bitiş melodisi',
    url: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
  },
  {
    id: 'bell',
    label: 'Klasik Çan (Bell)',
    description: 'Huzurlu ve derin meditasyon çanı',
    url: 'https://assets.mixkit.co/active_storage/sfx/2874/2874-preview.mp3',
  },
  {
    id: 'bird',
    label: 'Kuş Cıvıltısı',
    description: 'Huzur verici orman ve neşeli kuş cıvıltıları',
    url: 'https://assets.mixkit.co/active_storage/sfx/2436/2436-preview.mp3',
  },
  {
    id: 'campfire',
    label: 'Kamp Ateşi',
    description: 'Çıtırdayan sıcak ve sakinleştirici kamp ateşi',
    url: 'https://assets.mixkit.co/active_storage/sfx/1256/1256-preview.mp3',
  },
  {
    id: 'rain',
    label: 'Yağmur Sesi',
    description: 'Odaklanmayı artıran pencereli dinlendirici yağmur',
    url: 'https://assets.mixkit.co/active_storage/sfx/1251/1251-preview.mp3',
  },
  {
    id: 'chime',
    label: 'Yumuşak Melodi',
    description: 'Sakinleştirici ve nazik bitiş melodisi',
    url: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  },
];

class SoundService {
  private activePlayer: any = null;

  async playSound(soundId: string): Promise<void> {
    const soundItem = SOUND_PRESETS.find((s) => s.id === soundId) || SOUND_PRESETS[0];

    try {
      // Haptic feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Stop any existing playback
      if (this.activePlayer) {
        try {
          this.activePlayer.pause();
          this.activePlayer.remove();
        } catch {}
        this.activePlayer = null;
      }

      // Create new audio player with the sound URL
      const player = createAudioPlayer(soundItem.url);
      this.activePlayer = player;
      player.play();

      logger.info(`[SoundService] Playing sound: ${soundItem.label}`);
    } catch (err) {
      logger.warn('[SoundService] Failed to play sound:', err);
    }
  }

  async playCompletionSound(): Promise<void> {
    const { soundEnabled, soundId } = useSettingsStore.getState();
    if (!soundEnabled) return;
    await this.playSound(soundId);
  }

  stopSound(): void {
    if (this.activePlayer) {
      try {
        this.activePlayer.pause();
        this.activePlayer.remove();
      } catch {}
      this.activePlayer = null;
    }
  }
}

export const soundService = new SoundService();
