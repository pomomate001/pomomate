# PomoMate — Deployment Guide

## 🎯 Overview

PomoMate is a collaborative Pomodoro timer app with real-time P2P rooms, supporting up to 8 users simultaneously on Android, iOS, and Web.

**Architecture:**
- React Native mobile app (Expo)
- Node.js backend (Express + WebSocket)
- Supabase (PostgreSQL + Storage + Auth)
- WebRTC P2P (mesh topology, host-authoritative)
- AdMob (free tier)
- RevenueCat (premium subscriptions)

---

## 📋 Prerequisites

### Development Environment
- Node.js 20+
- npm 10+
- Git
- Expo CLI
- Android Studio (for Android builds)
- Xcode (for iOS builds, macOS only)

### Production Environment
- Linux server (Abacus SuperComputer recommended)
- PostgreSQL 15
- Nginx
- PM2
- Certbot (for SSL)
- Docker & Docker Compose (optional)

### Third-Party Services
1. **Supabase**
   - Self-hosted or cloud instance
   - Database + Storage + Auth configured

2. **RevenueCat**
   - Account created
   - Products configured (monthly, yearly premium)
   - API keys obtained

3. **AdMob**
   - Google AdMob account
   - App registered
   - Ad unit IDs created

4. **Domain & DNS**
   - Domain purchased
   - DNS A records configured

---

## 🚀 Quick Start (Development)

### 1. Clone Repository

```bash
git clone https://github.com/your-org/pomomate.git
cd pomomate
```

### 2. Install Dependencies

```bash
# Mobile app
npm install

# Backend
cd server
npm install
cd ..
```

### 3. Configure Environment

```bash
# Mobile
cp .env.example .env
nano .env
# Fill in EXPO_PUBLIC_* variables

# Backend
cd server
cp .env.example .env
nano .env
# Fill in Supabase, JWT, CORS variables
cd ..
```

### 4. Start Development Servers

```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Mobile app
npm start
# Press 'a' for Android, 'i' for iOS, 'w' for Web
```

---

## 🏭 Production Deployment

### Backend Deployment (Abacus SuperComputer)

#### 1. Initial Setup

```bash
# SSH into server
ssh user@your-server.com

# Clone repository
cd /home/ubuntu
git clone https://github.com/your-org/pomomate.git
cd pomomate

# Install dependencies
cd server
npm ci --only=production
npm run build
cd ..
```

#### 2. Database Setup

```bash
# Create PostgreSQL database and user
sudo -u postgres psql
CREATE DATABASE pomomate;
CREATE USER pomomate_user WITH PASSWORD 'SECURE_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE pomomate TO pomomate_user;
\q

# Run migrations
psql -h localhost -U pomomate_user -d pomomate < server/migrations/001_initial_schema.sql
psql -h localhost -U pomomate_user -d pomomate < server/migrations/002_rls_policies.sql
psql -h localhost -U pomomate_user -d pomomate < server/migrations/003_storage_buckets.sql
```

#### 3. Environment Configuration

```bash
cp .env.production.example .env.production
nano .env.production
# Fill in all production values
```

#### 4. Nginx Setup

```bash
sudo cp deployment/nginx/pomomate.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/pomomate.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 5. SSL Certificate

```bash
sudo certbot --nginx -d api.pomomate.app
```

#### 6. Start Services

```bash
# Install PM2 globally
npm install -g pm2

# Start backend
pm2 start deployment/config/ecosystem.config.js

# Save PM2 state
pm2 save

# Enable PM2 on boot
pm2 startup
# Run the command PM2 outputs
```

#### 7. Setup Automated Backups

```bash
chmod +x deployment/scripts/backup.sh

# Add to crontab
crontab -e
# Add: 0 2 * * * /home/ubuntu/pomomate/deployment/scripts/backup.sh
```

### Mobile App Deployment

#### Android Build

```bash
# Configure app.json
nano app.json
# Update version, package name, etc.

# Build APK
eas build --platform android --profile production

# Or build AAB for Google Play
eas build --platform android --profile production:aab
```

#### iOS Build

```bash
# Configure app.json
nano app.json
# Update version, bundle identifier, etc.

# Build IPA
eas build --platform ios --profile production
```

#### Submit to Stores

```bash
# Google Play Store
eas submit --platform android

# Apple App Store
eas submit --platform ios
```

---

## 🔧 Configuration

### Environment Variables

#### Mobile App (.env)

```bash
EXPO_PUBLIC_API_URL=https://api.pomomate.app
EXPO_PUBLIC_SUPABASE_URL=https://your-instance.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_WEBRTC_SIGNALING_URL=wss://api.pomomate.app/ws/signaling
EXPO_PUBLIC_ENV=production
```

#### Backend (.env.production)

```bash
PORT=3000
NODE_ENV=production
SUPABASE_URL=https://your-instance.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CORS_ORIGIN=https://pomomate.app
JWT_SECRET=your-supabase-jwt-secret
DB_USER=pomomate_user
DB_PASSWORD=your-secure-password
```

### RevenueCat Configuration

1. Update `src/services/monetization/RevenueCatService.ts`
2. Replace API keys with production values
3. Configure products in RevenueCat dashboard

### AdMob Configuration

1. Update `src/services/monetization/AdMobService.ts`
2. Replace test ad unit IDs with production IDs
3. Enable ads in AdMob console

---

## 📊 Monitoring

### Health Checks

```bash
# Backend health
curl https://api.pomomate.app/health

# PM2 status
pm2 status

# PM2 logs
pm2 logs pomomate-backend --lines 50

# PM2 monitoring
pm2 monit
```

### Database Monitoring

```bash
# Check connections
psql -U pomomate_user -d pomomate -c "SELECT count(*) FROM pg_stat_activity;"

# Check table sizes
psql -U pomomate_user -d pomomate -c "SELECT schemaname, tablename, pg_total_relation_size(schemaname||'.'||tablename) AS size FROM pg_tables ORDER BY size DESC LIMIT 10;"
```

### Nginx Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

---

## 🔄 Updates & Maintenance

### Deploy New Version

```bash
cd /home/ubuntu/pomomate
git pull origin main
./deployment/scripts/deploy.sh
```

### Database Migrations

```bash
# Create new migration
nano server/migrations/004_your_migration.sql

# Apply migration
psql -U pomomate_user -d pomomate < server/migrations/004_your_migration.sql
```

### Rollback

```bash
# Rollback PM2 to previous version
pm2 reload pomomate-backend --update-env

# Or restore from backup
gunzip -c /home/ubuntu/pomomate/backups/pomomate_backup_YYYYMMDD_HHMMSS.sql.gz | psql -U pomomate_user pomomate
```

---

## 🛡️ Security

### Checklist
- [x] SSL/TLS enabled
- [x] JWT secrets secure
- [x] Database passwords strong
- [x] RLS policies enforced
- [x] CORS configured
- [x] Rate limiting enabled
- [x] Secrets not committed to git

### Security Updates

```bash
# Update packages
npm audit
npm audit fix

# Update system
sudo apt update && sudo apt upgrade -y
```

---

## 🐛 Troubleshooting

### Backend Won't Start

```bash
# Check logs
pm2 logs pomomate-backend

# Check port conflicts
sudo lsof -i :3000

# Restart services
pm2 restart pomomate-backend
```

### Database Connection Failed

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -U pomomate_user -d pomomate -c "SELECT 1;"
```

### WebSocket Not Connecting

```bash
# Check Nginx WebSocket config
sudo nginx -t

# Check firewall
sudo ufw status
```

### Mobile App Build Failed

```bash
# Clear cache
expo start -c

# Clear node_modules
rm -rf node_modules
npm install
```

---

## 📞 Support

- **Documentation**: `/docs`
- **GitHub Issues**: [Repository Issues]
- **Email**: dev@pomomate.app

---

**Last Updated**: 2026-08-22
**Version**: 1.0.0
