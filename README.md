# 🍅 PomoMate — Birlikte Çalış

**Collaborative Pomodoro Timer with Real-Time P2P Rooms**

PomoMate is a productivity app that combines the Pomodoro Technique with real-time collaboration. Study, work, or focus together with friends in virtual rooms supporting up to 8 users simultaneously.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Android%20%7C%20iOS%20%7C%20Web-lightgrey)](https://pomomate.app)

---

## ✨ Features

### 🕐 Pomodoro Timer
- **Customizable durations**: Work (25min), Short Break (5min), Long Break (15min)
- **Multiple timer designs**: Minimal, Circle, Arc (Premium)
- **Background animations**: Particles, Gradient (Premium)
- **Auto-advance**: Seamless flow through work and break cycles
- **Notifications**: Local notifications when timers complete

### 👥 Collaborative Rooms
- **Real-time sync**: Timer, tasks, and chat synchronized across all members
- **Up to 8 users**: Host-authoritative P2P architecture
- **Audio/Video**: Optional camera and microphone for face-to-face sessions
- **Screen sharing**: Share your screen with room members
- **Modular features**: Timer, Tasks, Chat, Media, Files (extensible for future features)
- **Room invitations**: Easy join via shareable room codes

### ✅ Task Management
- **Personal & Shared tasks**: Track individual and room tasks
- **Drag & drop reorder**: Organize tasks by priority
- **Pomodoro counter**: Track completed pomodoros per task
- **Persistence**: Tasks saved to cloud via Supabase

### 📊 Statistics & Progress
- **Daily/Weekly/Monthly views**: Visualize your productivity
- **Streak tracking**: Build consistency with daily streaks
- **Friend comparisons**: See how you stack up (with privacy controls)
- **Charts & graphs**: Clean visualizations of your progress

### 👫 Friends & Social
- **Friend requests**: Connect with study partners
- **Shared statistics**: Opt-in stat sharing with friends
- **Privacy controls**: Choose what to share and with whom
- **Friend leaderboard**: Friendly competition to stay motivated

### 💎 Premium & Monetization
- **Ad-free experience**: No ads for premium users
- **Exclusive designs**: Premium timer faces and animations
- **Referral rewards**: Invite 3 friends → earn 1 month free premium
- **Flexible plans**: Monthly and yearly subscriptions via RevenueCat

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
