/**
 * Sound Service — handles audio cues, timer completion sounds, 2s previews,
 * and continuous ambient background audio during focus/break sessions.
 */
import { createAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { logger } from '../../../utils/logger';
import { useSettingsStore } from '../../../state';
import type { TimerMode } from '../../../types';

export interface SoundItem {
  id: string;
  label: string;
  description: string;
  url: string;
}

// 1. Notification / Timer Completion Sounds (Zil Sesleri)
export const NOTIFICATION_SOUNDS: SoundItem[] = [
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
    id: 'chime',
    label: 'Yumuşak Melodi',
    description: 'Sakinleştirici ve nazik bitiş sesi',
    url: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  },
];

// 2. Ambient Focus & Relax Sounds (Ortam Sesleri)
export const AMBIENT_SOUNDS: SoundItem[] = [
  {
    id: 'none',
    label: 'Ortam Sesi Yok',
    description: 'Sessiz çalışma deneyimi',
    url: '',
  },
  {
    id: 'rain',
    label: 'Yağmur Sesi',
    description: 'Odaklanmayı artıran pencereli dinlendirici yağmur',
    url: 'https://assets.mixkit.co/active_storage/sfx/1251/1251-preview.mp3',
  },
  {
    id: 'campfire',
    label: 'Kamp Ateşi',
    description: 'Çıtırdayan sıcak ve sakinleştirici kamp ateşi',
    url: 'https://assets.mixkit.co/active_storage/sfx/1256/1256-preview.mp3',
  },
  {
    id: 'bird',
    label: 'Kuş Cıvıltısı',
    description: 'Huzur verici orman ve neşeli kuş cıvıltıları',
    url: 'https://assets.mixkit.co/active_storage/sfx/2436/2436-preview.mp3',
  },
];

export const ALL_SOUNDS = [...NOTIFICATION_SOUNDS, ...AMBIENT_SOUNDS.filter((s) => s.id !== 'none')];

class SoundService {
  private previewPlayer: any = null;
  private previewTimeout: ReturnType<typeof setTimeout> | null = null;
  private ambientPlayer: any = null;
  private activeAmbientId: string | null = null;

  /* ─── 2-Second Preview for Settings ─── */

  async playPreview(soundId: string, durationMs = 2000): Promise<void> {
    const soundItem = ALL_SOUNDS.find((s) => s.id === soundId);
    if (!soundItem || !soundItem.url) return;

    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Stop existing preview
      this.stopPreview();

      const player = createAudioPlayer(soundItem.url);
      this.previewPlayer = player;
      player.play();

      // Automatically stop preview exactly after durationMs (2 seconds)
      this.previewTimeout = setTimeout(() => {
        this.stopPreview();
      }, durationMs);

      logger.info(`[SoundService] Previewing sound (2s): ${soundItem.label}`);
    } catch (err) {
      logger.warn('[SoundService] Failed to preview sound:', err);
    }
  }

  stopPreview(): void {
    if (this.previewTimeout) {
      clearTimeout(this.previewTimeout);
      this.previewTimeout = null;
    }
    if (this.previewPlayer) {
      try {
        this.previewPlayer.pause();
        this.previewPlayer.remove();
      } catch {}
      this.previewPlayer = null;
    }
  }

  /* ─── Timer Completion Sound ─── */

  async playCompletionSound(): Promise<void> {
    const { soundEnabled, soundId } = useSettingsStore.getState();
    if (!soundEnabled) return;

    const soundItem = NOTIFICATION_SOUNDS.find((s) => s.id === soundId) || NOTIFICATION_SOUNDS[0];

    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const player = createAudioPlayer(soundItem.url);
      player.play();
      logger.info(`[SoundService] Playing completion sound: ${soundItem.label}`);
    } catch (err) {
      logger.warn('[SoundService] Failed to play completion sound:', err);
    }
  }

  /* ─── Continuous Ambient Sound for Focus/Break ─── */

  async startAmbient(soundId: string): Promise<void> {
    if (soundId === 'none') {
      this.stopAmbient();
      return;
    }

    if (this.activeAmbientId === soundId && this.ambientPlayer) {
      // Already playing this sound
      return;
    }

    const soundItem = AMBIENT_SOUNDS.find((s) => s.id === soundId);
    if (!soundItem || !soundItem.url) {
      this.stopAmbient();
      return;
    }

    this.stopAmbient();

    try {
      const player = createAudioPlayer(soundItem.url);
      player.loop = true;
      this.ambientPlayer = player;
      this.activeAmbientId = soundId;
      player.play();
      logger.info(`[SoundService] Ambient audio started: ${soundItem.label}`);
    } catch (err) {
      logger.warn('[SoundService] Failed to start ambient audio:', err);
    }
  }

  stopAmbient(): void {
    if (this.ambientPlayer) {
      try {
        this.ambientPlayer.pause();
        this.ambientPlayer.remove();
      } catch {}
      this.ambientPlayer = null;
    }
    this.activeAmbientId = null;
  }

  /** Syncs ambient sound playback with current timer state and user preferences */
  syncAmbientWithTimer(isRunning: boolean, mode: TimerMode): void {
    const { ambientSoundId, ambientSoundMode, soundEnabled } = useSettingsStore.getState();

    if (!soundEnabled || !isRunning || ambientSoundId === 'none' || ambientSoundMode === 'off') {
      this.stopAmbient();
      return;
    }

    const shouldPlay =
      ambientSoundMode === 'always' ||
      (ambientSoundMode === 'work' && mode === 'work') ||
      (ambientSoundMode === 'break' && (mode === 'shortBreak' || mode === 'longBreak'));

    if (shouldPlay) {
      this.startAmbient(ambientSoundId);
    } else {
      this.stopAmbient();
    }
  }
}

export const soundService = new SoundService();
