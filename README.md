# 🍅 PomoMate — Birlikte Çalış

**Collaborative Pomodoro Timer with Real-Time P2P Rooms**

PomoMate is a productivity app that combines the Pomodoro Technique with real-time collaboration. Study, work, or focus together with friends in virtual rooms supporting up to 8 users simultaneously.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Android%20%7C%20iOS%20%7C%20Web-lightgrey)](https://pomomate.app)

---

## ✨ Features

### 🕐 Pomodoro Timer & Native PiP
- **Customizable durations**: Work (25min), Short Break (5min), Long Break (15min)
- **5 Unique Timer Designs**: Minimalist, Classic Circle, Modern Digital, Curved Arc (Pro), and Neon Glow (Pro)
- **Live Video & Atmosphere Backgrounds**:
  - Full-screen looping videos: Deep Space & Stars, Windmill Meadow, Rain Window
  - High-res static wallpapers: Pixel Art, Winter Village
  - Ambient particle overlays: Floating Glowing Particles, Falling Snow, Rain, Bubbles
- **Relaxing Ambient Sounds**: Gentle Forest Morning Birds (`Mixkit SFX 1210`), Window Rain, Crackling Campfire, with live preview
- **Picture-in-Picture (PiP)**: Floating timer overlay keeping focus visible while multitasking on Android
- **Drift-free accuracy**: Target timestamp tracking (<500ms drift) with automatic resynchronization upon `AppState` foregrounding
- **Auto-advance & Local Notifications**: Seamless flow through work and break cycles with background notifications

### 👥 Collaborative Rooms & P2P
- **Real-time sync**: Timer, tasks, and chat synchronized across all members
- **Up to 8 users**: Host-authoritative P2P architecture
- **Audio/Video**: Optional camera and microphone for face-to-face sessions
- **Screen sharing**: Share your screen with room members
- **Modular features**: Timer, Tasks, Chat, Media, Files
- **Room invitations**: Easy join via shareable room codes and deep links

### ✅ Task Management & Smart Recurrence
- **Personal & Shared tasks**: Track individual and room tasks
- **Drag & drop reorder**: Reorganize tasks smoothly with haptic feedback
- **Target Pomodoro Counter**: Auto-completes and shifts tasks upon meeting required pomodoro cycles
- **Smart recurrence tags**: Once, Daily, Weekdays, Weekends with full Turkish & English localization
- **Cloud sync**: Automatic historical recording to Supabase `completed_tasks`

### 📊 Statistics & Calendar Insights
- **Daily/Weekly/Monthly views**: Interactive bar charts tracking productive focus hours
- **Streak tracking**: Consistent daily streaks and historical milestone records
- **Calendar Heatmap**: Day-by-day Pomodoro density visualization
- **Friend comparisons**: Friendly leaderboard with opt-in privacy controls

### 👫 Social & Tag-Based Friend Discovery
- **Smart Discovery Algorithm**: Server-side PostgreSQL RPC (`discover_users`) recommending study partners by hobby/interest overlap
- **Bilingual Tag System**: Shared tag UUIDs with dynamic UI localization (`getTagName`) — "Matematik" and "Mathematics" seamlessly match
- **Friend Requests & Realtime Status**: Send/accept friend requests, see online status, and invite friends directly into buddy focus rooms

### 💎 Pro Mode, Referral Rewards & Hardened Expiration
- **Multi-Source Entitlement Validation**: Store subscriptions via RevenueCat; promotional gifts via Supabase `premium_until`
- **Automatic Expiration & Revocation**: Instant feature re-locking when subscriptions lapse; `AppState` foreground revalidation
- **Safe Fallbacks (`revertToFreeDefaults`)**: Automatically resets expired users to free themes, minimal timer, and neutral backgrounds
- **Viral Referral System (3 Invites → 1 Month Free Pro)**:
  - Deep link routing (`https://pomomate.app/join?ref=CODE` & `pomomate://join?ref=CODE`) with Android App Links and static lightweight landing
  - Automatic code consumption on both standard email registration and Google OAuth sign-in
  - In-app progress tracking, WhatsApp one-tap formatted sharing, and instant reward claiming RPCs
- **Zero-Permission Geo-Localization**: Automatically defaults to Turkish in Turkey and English worldwide without requesting privacy-invasive permissions

---

## 🏗️ Architecture

### Tech Stack

**Mobile App:**
- React Native (Expo)
- TypeScript
- Zustand (state management)
- React Navigation (bottom tabs + stacks)
- WebRTC (P2P connections)

**Backend:**
- Node.js + Express
- WebSocket (signaling server)
- Supabase (PostgreSQL, Storage, Auth)
- Docker + PM2 (production deployment)

**Monetization:**
- Google AdMob (free tier ads)
- RevenueCat (subscriptions)

**Infrastructure:**
- Nginx (reverse proxy + SSL)
- PostgreSQL (data persistence)
- Let's Encrypt (SSL certificates)
- Abacus SuperComputer (hosting)

### Modules

| Module | Description | Status |
|--------|-------------|--------|
| **M01** | Foundation / Shared Core | ✅ Complete |
| **M02** | UI / UX — Design System & Screens | ✅ Complete |
| **M03** | Backend + Supabase | ✅ Complete |
| **M04** | WebRTC — P2P Rooms | ✅ Complete |
| **M05** | Mobile — Native Features | ✅ Complete |
| **M07** | Abacus Infrastructure | ✅ Complete |
| **M08** | Auth + Security + Monetization | ✅ Complete |
| **M09** | QA + Integration + Deployment | ✅ Complete |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm 10+
- Git
- Expo CLI (`npm install -g expo-cli`)
- Android Studio or Xcode (for native builds)

### Installation

```bash
# Clone repository
git clone https://github.com/pomomate/pomomate-app.git
cd pomomate-app

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Supabase & API keys

# Start development server
npm start
```

### Backend Setup

```bash
cd server
npm install
cp .env.example .env
# Edit .env with database credentials

# Run migrations
npm run migrate

# Start backend
npm run dev
```

---

## 📱 Platform Support

- ✅ **Android**: Fully supported
- ✅ **iOS**: Fully supported
- 🚧 **Web**: Planned (M06)

---

## 🧩 Key Components

### 1. Timer System
- **Extensible design registry**: Add new timer faces without touching core logic
- **Host-authoritative sync**: Host broadcasts timer state to all members
- **Accurate tick mechanism**: <500ms drift over 25 minutes

### 2. Room Feature Registry
- **Plugin architecture**: New features (timer, tasks, chat, media, files) register as independent modules
- **Data channel routing**: Messages dispatched to correct feature handlers
- **UI composition**: "+" menu dynamically lists registered features

### 3. WebRTC P2P
- **Mesh topology**: Each peer connects to every other peer (scales to 8 users)
- **STUN/TURN support**: NAT traversal for home networks
- **Reconnection logic**: Auto-reconnect on network changes or temporary drops
- **Data channels**: Reliable, ordered messaging for timer/task/chat sync

### 4. Monetization
- **Non-intrusive ads**: Banners never overlay timer, tasks, or room controls
- **Premium gates**: Ad-free + exclusive designs + extended features
- **Referral incentives**: Viral growth via 3→1 month premium rewards

---

## 🔒 Security

- **Row-Level Security (RLS)**: Supabase policies enforce access control
- **JWT authentication**: Secure token-based auth via Supabase
- **Friend privacy**: Users control which stats are shared
- **Room permissions**: Only members can view room assets and messages
- **Server-side validation**: Referral rewards validated on backend to prevent abuse

---

## 📚 Documentation

- **[Deployment Guide](docs/DEPLOYMENT_GUIDE.md)**: Production setup instructions
- **[Integration Checklist](docs/INTEGRATION_CHECKLIST.md)**: QA & testing checklist

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Pomodoro Technique**: Francesco Cirillo
- **Abacus.AI**: Infrastructure & deployment platform
- **Supabase**: Backend-as-a-Service
- **RevenueCat**: Subscription management
- **Expo**: React Native toolchain

---

## 📞 Contact

- **Website**: [pomomate.app](https://pomomate.app)
- **Email**: dev@pomomate.app
- **GitHub**: [github.com/pomomate/pomomate-app](https://github.com/pomomate/pomomate-app)

---

**Built with ❤️ for productivity enthusiasts**

🍅 *Focus. Collaborate. Achieve.*
