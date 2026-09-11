import { describe, it, expect, beforeEach } from '@jest/globals';
import { useSettingsStore } from '../../state/settingsStore';
import { translate } from '../../i18n';
import { tr } from '../../i18n/translations/tr';
import { en } from '../../i18n/translations/en';

describe('Onboarding & First-Time Intro Flow', () => {
  beforeEach(() => {
    useSettingsStore.getState().reset();
  });

  describe('SettingsStore - hasSeenOnboarding', () => {
    it('initializes hasSeenOnboarding to false by default', () => {
      const state = useSettingsStore.getState();
      expect(state.hasSeenOnboarding).toBe(false);
    });

    it('updates hasSeenOnboarding when setHasSeenOnboarding is called', () => {
      useSettingsStore.getState().setHasSeenOnboarding(true);
      expect(useSettingsStore.getState().hasSeenOnboarding).toBe(true);

      useSettingsStore.getState().setHasSeenOnboarding(false);
      expect(useSettingsStore.getState().hasSeenOnboarding).toBe(false);
    });
  });

  describe('Onboarding Localization Completeness & Tone', () => {
    it('contains all required onboarding keys in tr and en dictionaries', () => {
      expect(tr.onboarding).toBeDefined();
      expect(en.onboarding).toBeDefined();

      const requiredKeys: (keyof typeof tr.onboarding)[] = [
        'skip',
        'next',
        'start',
        'back',
        'stepIndicator',
        'slide1Badge',
        'slide1Title',
        'slide1Subtitle',
        'slide1FocusBtn',
        'slide1AdjustTip',
        'slide1RhythmNote',
        'slide2Badge',
        'slide2Title',
        'slide2Subtitle',
        'slide2SampleTask',
        'slide2Tag',
        'slide2PomodoroTarget',
        'slide2RecurrenceDaily',
        'slide2HabitTip',
        'slide3Badge',
        'slide3Title',
        'slide3Subtitle',
        'slide3InviteBtn',
        'slide3TogetherBadge',
        'slide3WarmNote',
        'slide4Badge',
        'slide4Title',
        'slide4Subtitle',
        'slide4StatsHighlight',
        'slide4DiscoverHighlight',
        'slide4InviteHighlight',
        'slide4LeaderboardHighlight',
        'slide5Badge',
        'slide5Title',
        'slide5Subtitle',
        'slide5RoomName',
        'slide5RoomAtmosphere',
        'slide5RoomNote',
        'slide6Badge',
        'slide6Title',
        'slide6Subtitle',
        'slide6TagsTitle',
        'slide6ThemesTitle',
        'slide6SoundsTitle',
        'slide6FinalReady',
      ];

      for (const key of requiredKeys) {
        expect(tr.onboarding[key]).toBeTruthy();
        expect(en.onboarding[key]).toBeTruthy();
      }
    });

    it('has the requested warm psychological tone for buddy invitation in Turkish', () => {
      // User specifically requested warm, inviting language: "Yalnız çalışmak zorunda değilsin"
      expect(tr.onboarding.slide3Title).toContain('Yalnız Çalışmak Zorunda Değilsin');
      expect(tr.onboarding.slide3Subtitle).toContain('Davet Et');
      expect(tr.onboarding.slide3Subtitle).toContain('arkadaş');
    });

    it('includes timer focus and duration adjustment instructions on slide 1', () => {
      expect(tr.onboarding.slide1FocusBtn).toBe('Odaklanmaya Başla');
      expect(tr.onboarding.slide1AdjustTip).toContain('sayaca dokun');
    });

    it('includes task Pomodoro target and recurrence on slide 2', () => {
      expect(tr.onboarding.slide2PomodoroTarget).toContain('Pomodoro');
      expect(tr.onboarding.slide2RecurrenceDaily).toContain('Tekrarla');
    });

    it('includes stats, discover, invite and leaderboard on slide 4', () => {
      expect(tr.onboarding.slide4DiscoverHighlight).toContain('Keşfet');
      expect(tr.onboarding.slide4InviteHighlight).toContain('Davet');
      expect(tr.onboarding.slide4LeaderboardHighlight).toContain('Liderlik');
    });

    it('includes high-level study rooms on slide 5', () => {
      expect(tr.onboarding.slide5Title).toContain('Çalışma Odaları');
    });

    it('includes tags, theme and sounds on slide 6', () => {
      expect(tr.onboarding.slide6TagsTitle).toContain('Etiket');
      expect(tr.onboarding.slide6ThemesTitle).toContain('Tema');
      expect(tr.onboarding.slide6SoundsTitle).toContain('Ses');
    });

    it('includes profile onboardingTour setting key', () => {
      expect(tr.profile.onboardingTour).toBeTruthy();
      expect(en.profile.onboardingTour).toBeTruthy();
    });

    it('translates onboarding keys correctly via translate() helper', () => {
      expect(translate('onboarding.skip', 'tr')).toBe('Geç');
      expect(translate('onboarding.skip', 'en')).toBe('Skip');
      expect(translate('onboarding.slide1FocusBtn', 'tr')).toBe('Odaklanmaya Başla');
      expect(translate('onboarding.slide1FocusBtn', 'en')).toBe('Start Focusing');
    });
  });
});
