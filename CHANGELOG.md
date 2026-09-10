# Changelog

All notable changes to the PomoMate project will be documented in this file.

## [1.3.25] - 2026-09-10

### Fixed
- **Timer Mode Switching Locked While Running**:
  - When the timer is active (`isRunning`), the other two timer mode buttons ("Çalışma", "Kısa Mola", "Uzun Mola") are visually dimmed and disabled to prevent accidental cancellation of active pomodoro sessions.
  - Guarded `handleSetMode` with an `isRunning` check to block accidental state transitions.

### Changed
- **Task Creation Sheet Localization Polishing**:
  - Updated task title placeholder from "Örn: 20 sayfa kitap oku" / "e.g. Read 20 pages of book" to "Bir görev ekleyin" / "Add a task".
  - Simplified tag field label from "Etiket (Klas)" / "Tag (Category)" to just "Etiket" / "Tag".

## [1.3.24] - 2026-09-10

### Changed
- **Timer Screen Task Card Spacing**:
  - Reduced unnecessary bottom spacing below the task card, lowering it smoothly to sit just a few pixels above the bottom navigation bar.
- **Timer Design Renamed to 'Net Odak' (Bold Focus)**:
  - Renamed the new bold timer design from 'Forest' to 'Net Odak' (`bold`) to maintain brand independence and trademark safety.
  - Added a dedicated bold preview in Appearance Settings with prominent bold numbers (`25:00`) and the focus leaf badge, distinguishing it clearly from the Minimalist design preview.
- **Sleeping Cat Animation Renamed to 'Odak Arkadaşı'**:
  - Updated the sleeping desk cat focus animation label from "Huzurlu Kedi" to the more professional and fitting title "Odak Arkadaşı" (Focus Companion).

### Fixed
- **Timer Screen Theme Adaptability**:
  - Mode selector pill bar, buddy invite button, cycle badge, new task button, empty task card, more tasks button, and controls now fully adapt to active light themes ("Açık", "Gül Bahçesi", "Okyanus", "Gün Batımı") with dynamic surfaces and borders instead of remaining hardcoded dark.
  - Ghost controls and unselected mode tabs now use readable text colors matching the active theme palette.
  - Task card background in `DraggableTaskList` now dynamically uses `colors.card` and `colors.border` when visual wallpapers are inactive.
  - Removed heavy black text shadows on timer digits and headers in light themes.
- **Profile Settings Header Theme Sync**:
  - `ProfileStack` screen options now dynamically bind `headerStyle`, `headerTintColor`, and `headerTitleStyle` to the active theme's background and primary text colors.
  - Top header region in "Tema ve Görünüm", "Çalışma / Mola Süreleri", and "Sesler ve Bildirimler" screens no longer stays white in dark mode.
  - Linked active theme to `NavigationContainer` and made `StatusBar` icon styling dynamically sync with `theme.dark`.

## [1.3.23] - 2026-09-09

### Added
- **Forest-Style Timer Design (`TimerFaceForest`)**:
  - Added new clean, bold typography timer face inspired by the Forest app.
  - Registered in `timerDesigns` as "Forest", freely accessible to all users.
- **"Odaklanmaya Başla" (Start Focusing) Initial Button**:
  - When the timer is idle, redundant control panel buttons are hidden and replaced with a single prominent "Odaklanmaya Başla" button.
  - Automatically transitions to the active control panel once the pomodoro begins.
- **Hold-to-Activate Controls (`HoldButton`)**:
  - Implemented 2-second press-and-hold interaction with an animated line-shaped progress bar and background fill.
  - Added to "Yeniden Başlat" (Restart) and "Bitir" (Finish) buttons to prevent accidental interruptions.
- **Pro-Only Skip Action**:
  - "Molaya Geç" (Skip) button is now restricted to Pro/Premium subscribers.

### Changed
- **Permanent Removal of Pause (Durdur)**:
  - Removed pause capability globally from `useTimerStore`, UI screens, and room timers.
  - Once started, pomodoros can only be completed, restarted, or finished/cancelled.
  - Durdur has been replaced by "Bitir" (Finish).
- **Realtime Supabase & Buddy Sync**:
  - Full synchronization of start, restart, and finish actions across multiplayer buddy sessions and Supabase database.

## [1.3.22] - 2026-09-09

### Added
- **Tinder-Style Keşfet (Discover) Redesign & Swipe Gestures**:
  - Replaced the previous FlatList with an interactive, single-card profile view featuring **physical left/right swipe gestures** (`PanResponder`).
  - Added layered card deck animations: the next card smoothly scales up while the top card is swiped away.
  - Upgraded card UI to an award-winning edge-to-edge 1x1 square profile picture with glassmorphism gradients.
  - Added dynamic "İSTEK AT" (Send Request) and "GEÇ" (Skip) stamp animations based on swipe direction.
  - Action buttons are now elegantly integrated into the card's bottom layout.
  - Added completion state ("Herkesi gördün!") showing the existing refresh button only after all recommendations are viewed.
- **"Benim Köşem" (My Corner) User Bio**:
  - Added personal bio/status message support (up to 120 characters).
  - Added `EditBioSheet` component on Profile screen for editing bio with live remaining character counter.
  - Displayed custom bio inside discovery user cards with styled italic quotes.
  - Database migration `013_user_bio.sql`: Added `bio` column to `users` table and updated `discover_users` RPC function.
  - Updated `AuthService`, `SupabaseAuthService`, `userStore`, and `FriendService` to persist and load bio data.
- **Localization & Typing**:
  - Added English and Turkish translation keys for all new discovery actions and bio strings.
  - Updated `TranslationSchema` in `types.ts`.

## [1.3.21] - 2026-09-08

### Changed
- UI polishing and pomodoro duration styling updates.
- Crash fix for room join PiP aspect ratio handling.
