# Changelog

All notable changes to the PomoMate project will be documented in this file.

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
