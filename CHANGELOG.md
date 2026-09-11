# Changelog

All notable changes to the PomoMate project will be documented in this file.

## [1.3.32] - 2026-09-11

### Changed
- **Discover Screen UI Modernization & Collapsible Notch (Keşfet Ekranı Çentikli Filtreleme & 1:1 Kart Tasarımı)**:
  - **Collapsible Filter Drawer / Notch**: Filtreleme alanı ve arama çubuğu açılır/katlanır şık bir çentik paneli (`notchHandleBar` + etkileşimli pill) arkasına alındı. Ekrandaki kalabalık ve görüntü kirliliği ortadan kaldırılarak arayüz minimalist ve ferah bir görünüme kavuşturuldu.
  - **Gesture & Tap Controls**: Çentiğe tek bir dokunuşla veya aşağı doğru kaydırarak (swipe down) arama ve kategori seçenekleri açılabilir, yukarı kaydırılarak veya tekrar dokunularak kapatılabilir.
  - **Active Filter Indicator**: Filtreler kapalıyken bile herhangi bir arama, kategori veya ülke filtresi devrede olduğunda çentikte küçük bir rozet (aktif kategori ikonu / nokta) gösterilerek filtrenin açık olduğu netleştirildi.
  - **1:1 Square Profile Image**: Keşfet kartının görsel alanına `aspectRatio: 1` verilerek profil fotoğraflarının yatay 4:3 basıklığından kurtulup tam kare 1:1 formatında ve kırpılmadan görünmesi sağlandı.
  - **Enlarged Discover Card**: Üstteki filtrelerin gizlenmesiyle açılan dikey alan değerlendirilerek kart boyutu ekranın merkezinde belirgin şekilde büyütüldü ve yukarı doğru uzatıldı (~566px yükseklik).

## [1.3.31] - 2026-09-11

### Fixed
- **Android Native Floating Widget Build & CI Fixes**:
  - Resolved unresolved `currentActivity` compilation error in `FloatingWidgetModule`.
  - Removed legacy `floating-bubble-view` CI injection and stabilized Kotlin/Android build pipeline.

## [1.3.30] - 2026-09-11

### Fixed
- **Mini Mode (Floating Widget / PiP) Android 12 & Samsung Knox Root-Cause Fix**:
  - **Bulletproof Permission Check**: Replaced naive `Settings.canDrawOverlays` with `AppOpsManager.OPSTR_SYSTEM_ALERT_WINDOW == MODE_ALLOWED` plus a functional 0x0 `WindowManager.addView` test. Fixes the issue where active `MediaProjection` (screen sharing) falsely reported permission as granted at the system level and bypassed the permission dialog.
  - **Direct Settings Navigation**: Removed the blocking pre-check in `requestPermission()` and added robust multi-tier OEM fallbacks (`package:` URI, generic overlay list, and application details settings) to directly open the Samsung "Appear on top" / "Üstte göster" configuration.
  - **Knox Untrusted Touch Protection**: Completely replaced the crash-prone 3rd-party `io.github.torrydo:floating-bubble-view` library with a pure Kotlin Android `WindowManager` implementation. Eliminated `FLAG_WATCH_OUTSIDE_TOUCH` and `FLAG_LAYOUT_NO_LIMITS` which caused Samsung Knox to immediately terminate the process under active WebRTC screen capture.
  - **Gated Background Transition**: `showWidget()` now verifies `FloatingWidgetService.isOverlayAttached` before backgrounding the activity, completely eliminating false minimization and app crash loops.
  - **Removed Bloat Dependencies**: Removed `floating-bubble-view` dependency from `build.gradle` along with its Compose coroutine lifecycle overhead.

## [1.3.29] - 2026-09-11

### Fixed
- **Mini Mode (Floating Widget / PiP) Android 12 Screen Share Crash Loop Fix**:
  - Eliminated fatal `IllegalStateException: View has already been added to the window manager` caused by calling `minimize()` in `FloatingWidgetService.onCreate()` when `super.onCreate()` already attaches the bubble view.
  - Resolved `RemoteServiceException: Context.startForegroundService() did not then call Service.startForeground()` by ensuring the foreground notification handshake is acknowledged and not abruptly killed with synchronous `stopSelf()` in error paths.
  - Increased activity backgrounding delay to 500ms in `FloatingWidgetModule.kt` to eliminate the `ForegroundServiceStartNotAllowedException` race condition under heavy WebRTC screen share load on budget devices (Samsung A22).
  - Added `tools:targetApi="34"` to `FloatingWidgetService` in `AndroidManifest.xml` for clean Android 12 backward compatibility with Android 14 `specialUse` foreground service types.

## [1.3.28] - 2026-09-10

### Changed
- **Default Timer Design Changed to 'Net Odak' (Bold Focus)**:
  - Updated the application's default timer design from 'Minimalist' (`minimal`) to 'Net Odak' (`bold`).
  - Positioned 'Net Odak' as the top item in the timer design catalog and appearance settings.
  - Reverted fallback behavior and free-tier downgrades to target 'Net Odak' instead of 'Minimalist'.

## [1.3.27] - 2026-09-10

### Fixed
- **Mini Mode (Floating Widget / PiP) Android Stability & Crash Prevention**:
  - Resolved Android 12 background launch restrictions (`ForegroundServiceStartNotAllowedException`) by introducing a 250ms smooth transition delay before moving the task to background, ensuring the foreground service and overlay attach cleanly.
  - Implemented immediate foreground notification startup in `onCreate()` and `onStartCommand()` to prevent the 5-second `ForegroundServiceDidNotStartInTimeException` timeout.
  - Added programmatic fallback views (`createDefaultBubbleView` and `createDefaultMenuView`) with pure Android drawables and layouts, guaranteeing that the floating bubble view never returns `null` or crashes due to theme/inflation issues in a Service context.
  - Wrapped vector drawable loading across action buttons (mic, cam, screen, open app, close) with `ContextCompat.getDrawable` and fallback protections to eliminate `Resources$NotFoundException`.
  - Updated permission prompt dialog to mention both OEM "Üstte göster" (Samsung/Xiaomi) and stock "Diğer uygulamaların üzerinde göster" (AOSP) system setting labels.

## [1.3.26] - 2026-09-10

### Added
- **Friends Leaderboard & Podium (Liderlik Sıralaması ve Ödül Kürsüsü)**:
  - Transformed the Friends expandable section on the Statistics screen into a competitive social Leaderboard ranking users by focused duration, pomodoros, and streak.
  - Included the current user in the ranking with an eye-catching "SEN" / "YOU" neon accent badge and highlighted row card.
  - Implemented an Olympic 3-tier Podium (`LeaderboardPodium`) featuring 1st place in the center with golden crown and aura, 2nd place on the left with silver medal badge, and 3rd place on the right with bronze badge.
  - Designed prestigious medals and ranking badges (🥇, 🥈, 🥉, and `#4+` minimal numeral pills).
- **Timeframe Synchronization (Günlük, Haftalık, Aylık)**:
  - Synchronized the active period filter ("Günlük", "Haftalık", "Aylık") directly with friend statistics and leaderboard rankings.
  - Selecting "Haftalık" immediately reflects the 7-day focus duration race among friends, while "Günlük" shows today's race, and "Aylık" reflects the current month.
- **Social Media Achievement Ranking Card & Sharing (`LeaderboardShareCard`)**:
  - Added a prominent Share button in the Leaderboard header opening an animated modal (`LeaderboardShareModal`).
  - Rendered a luxury cosmic dark-gradient achievement card using `react-native-view-shot` featuring PomoMate branding, active period tag, podium champions, top 5 rankings, and the user's personal achievement box.
  - Integrated native image sharing across Instagram Stories, WhatsApp, and social media via `expo-sharing`.
- **Backend Supabase Migration 015 (`015_friend_stats_period_rpc.sql`)**:
  - Updated `public.get_friends_stats(UUID[], TIMESTAMPTZ, TIMESTAMPTZ)` RPC function to support optional `p_start_date` and `p_end_date` parameters for timeframe filtering.
- **Friend Details Sheet Enhancement**:
  - Displaying both the active period stats (e.g. "Haftalık Süre", "Haftalık Pomodoro") and all-time totals in clean cards.

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
