# Changelog

All notable changes to the PomoMate project will be documented in this file.

## [1.3.22] - 2026-09-09

### Added
- **Tinder-Style Keşfet (Discover) Redesign**:
  - Replaced the previous FlatList with an interactive, single-card profile view.
  - Added smooth animated card exits and spring entrances for sequential discovery.
  - Added circular action buttons: **Skip** (red `close` icon) and **Send Request** (green `checkmark` icon).
  - Added completion state ("Herkesi gördün!" / "You've seen everyone!") showing the existing refresh button only after all recommendations are viewed.
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
