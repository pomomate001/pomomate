# PomoMate – Android Yayın Kontrol Listesi

Bu dosyayı adım adım takip ederek uygulamanızı Google Play Store'a yayınlayın.

---

## AŞAMA 1 – Dış Servisleri Yapılandır

### 1.1 Supabase
- [ ] [supabase.com](https://supabase.com) → Yeni proje oluştur
- [ ] **Project URL** ve **anon key**'i kopyala → `.env` dosyasına ekle
- [ ] SQL Editor'da migrations'ı sırayla çalıştır:
  ```
  server/migrations/001_initial_schema.sql
  server/migrations/002_rls_policies.sql
  server/migrations/003_storage_buckets.sql
  server/migrations/004_social_features.sql
  server/migrations/005_seed_tags.sql
  server/migrations/006_fix_user_insert.sql
  server/migrations/007_discover_rpc.sql
  server/migrations/008_subscription_tier_enum.sql
  server/migrations/009_accept_request_rpc.sql
  server/migrations/010_friend_stats_rpc.sql
  server/migrations/011_referral_reward_system.sql
  server/migrations/012_discover_country_filter.sql
  ```
- [ ] Authentication → Providers → **Email** (aktif)
- [ ] Authentication → Providers → **Google** (isteğe bağlı, aşağıda)
- [ ] Storage → Bucket oluştur: `avatars` (public)

### 1.2 Google Cloud (AdMob & OAuth)
- [ ] [console.cloud.google.com](https://console.cloud.google.com) → Yeni proje
- [ ] Firebase'i bağla VEYA doğrudan AdMob kullan:
  - [ ] [apps.admob.com](https://apps.admob.com) → Uygulama ekle → Android → `com.pomomate.app`
  - [ ] **App ID**'yi al → `app.json` → `plugins.react-native-google-mobile-ads.androidAppId`'ye gir
  - [ ] Banner reklam birimi oluştur → **Ad Unit ID**'yi al → `.env`'ye: `EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID`
- [ ] Google Play Games veya Google Sign-In kullanacaksan:
  - [ ] OAuth 2.0 istemcisi oluştur (Android + Web)
  - [ ] Web istemcisini Supabase Auth → Google provider → Client ID/Secret'a gir
  - [ ] SHA-1 parmak izini `google-services.json`'daki `certificate_hash`'e yaz

### 1.3 `google-services.json` Güncelleme
- [ ] Firebase Console veya Google Cloud'dan gerçek `google-services.json` dosyasını indir
- [ ] `/home/ubuntu/pomomate/google-services.json` dosyasının üzerine yaz
- [ ] `package_name: com.pomomate.app` olduğunu doğrula

### 1.4 RevenueCat
- [ ] [app.revenuecat.com](https://app.revenuecat.com) → Yeni uygulama → Android
- [ ] **Google Play** → Service Account bağla (Play Console'dan JSON indir)
- [ ] Offering oluştur: `default` → Package: `com.pomomate.premium_monthly`
- [ ] Android Public Key'i al → `.env`'ye: `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`

---

## AŞAMA 2 – Expo / EAS Kurulumu

### 2.1 EAS Hesabı
```bash
# EAS CLI'yi kur
npm install -g eas-cli

# Giriş yap
eas login

# Projeyi EAS'a bağla (project ID alırsın)
eas init --id <YOUR_PROJECT_ID>
```
- [ ] `app.json` → `expo.extra.eas.projectId` alanını güncelle
- [ ] `app.json` → `expo.owner` alanını güncelle (Expo kullanıcı adın)

### 2.2 Ortam Değişkenlerini Ayarla
```bash
# .env dosyasını oluştur
cp .env.example .env
# Tüm değerleri doldur (Supabase, AdMob, RevenueCat)

# EAS'a sır olarak ekle (production build için)
eas secret:push --scope project --env-file .env
```

### 2.3 Android İmzalama Anahtarı
EAS build sırasında otomatik oluşturur VE yönetir. İlk buildde sorar.
- [ ] EAS Managed Credentials kullan (önerilen) VEYA kendi keystore'unu yükle:
  ```bash
  eas credentials --platform android
  ```
- [ ] **ÖNEMLİ:** Keystore dosyasını güvenli bir yerde yedekle!

---

## AŞAMA 3 – İlk Android Build

### 3.1 Preview Build (test için APK)
```bash
cd /home/ubuntu/pomomate
eas build --platform android --profile preview
```
- [ ] Build tamamlandığında APK'yı indir ve fiziksel cihazda test et
- [ ] Giriş/kayıt akışını test et
- [ ] Pomodoro sayacını test et
- [ ] Oda oluşturma ve katılmayı test et (sunucu çalışmalı)
- [ ] AdMob banner reklamının göründüğünü doğrula (test modunda)
- [ ] Bildirimler çalışıyor mu kontrol et

### 3.2 Production Build (AAB – Play Store için)
```bash
eas build --platform android --profile production
```
- [x] Build başarılı oldu mu kontrol et
- [x] AAB dosyasını indir → build-output/pomomate-production.aab

---

## AŞAMA 4 – Google Play Console

### 4.1 Developer Hesabı
- [ ] [play.google.com/console](https://play.google.com/console) → Kayıt ($25 tek seferlik)
- [ ] Kimlik doğrulamasını tamamla

### 4.2 Uygulama Oluştur
- [ ] "Uygulama oluştur" → Android → Ücretsiz → Türkçe
- [ ] Uygulama adı: `PomoMate – Birlikte Çalış`

### 4.3 Store Listing Doldur
`store-assets/play-store-listing.md` dosyasından kopyala:
- [ ] Kısa açıklama (80 karakter)
- [ ] Tam açıklama
- [ ] Uygulama kategorisi: **Üretkenlik**
- [ ] E-posta: support@pomomate.app
- [ ] Gizlilik politikası URL: `https://pomomate.app/privacy` (veya geçici host et)

### 4.4 Görselleri Yükle
- [ ] Uygulama ikonu: 512×512 PNG (assets/icon.png)
- [ ] Feature Graphic: 1024×500 JPG (oluştur veya Canva kullan)
- [ ] En az 2 ekran görüntüsü (1080px+ genişlik)

### 4.5 İçerik Derecelendirmesi
- [ ] Anketi doldur → Beklenen: **Herkes (Everyone)**

### 4.6 Hedef Kitle
- [ ] 13+ yaş
- [ ] "Çocuklara yönelik mi?" → **Hayır**

### 4.7 Veri Güvenliği Formu
- [ ] Toplanan veriler: Email, Kullanıcı adı
- [ ] Şifreleme: Evet (transit + beklemede)
- [ ] Silme talebi: Evet (uygulama içi + email)
- [ ] Reklam kullanımı: Evet (AdMob)

### 4.8 AAB'ı Yükle (Internal Testing)
- [ ] Test → Internal testing → Yeni sürüm oluştur
- [ ] AAB dosyasını yükle
- [ ] Sürüm notlarını ekle (`store-assets/play-store-listing.md`)
- [ ] Gözden geçir ve yayınla (Internal)

### 4.9 Test Kullanıcıları Ekle
- [ ] Internal test: kendi e-postanla test et
- [ ] Uygulama akışını baştan sona test et
- [ ] Herşey yolundaysa → **Closed/Open Testing** → ardından **Production**

---

## AŞAMA 5 – Backend Sunucusu Deploy

PomoMate backend'i (WebSocket signaling + REST API) da yayına alınmalı.

### 5.1 Sunucu Seçenekleri
Deployment kılavuzu: `deployment/README.md`

| Seçenek | Tahmini Maliyet | Kolaylık |
|---------|-----------------|---------|
| Railway | ~$5/ay | ⭐⭐⭐⭐⭐ |
| Render | Ücretsiz tier var | ⭐⭐⭐⭐ |
| DigitalOcean Droplet | ~$6/ay | ⭐⭐⭐ |
| AWS EC2 (t3.micro) | Free tier | ⭐⭐ |

### 5.2 Railway ile Hızlı Deploy (Önerilen)
```bash
# Railway CLI kur
npm i -g @railway/cli
railway login
railway new

# server/ dizinine git
cd server
railway up
```
- [ ] Environment variables'ı Railway dashboard'da ayarla (`server/.env.example` şablonunu kullan)
- [ ] WebSocket support açık mı kontrol et
- [ ] HTTPS otomatik gelir (Railway)
- [ ] URL'yi `.env`'e yaz: `EXPO_PUBLIC_API_URL=https://...railway.app`
- [ ] `EXPO_PUBLIC_WEBRTC_SIGNALING_URL=wss://...railway.app/ws/signaling`

### 5.3 Domain (İsteğe Bağlı)
- [ ] `pomomate.app` gibi bir domain al
- [ ] DNS → Railway/Render/VPS'e yönlendir
- [ ] SSL sertifikası aktif mi kontrol et

---

## AŞAMA 6 – Gizlilik & Yasal

- [ ] `store-assets/privacy-policy.html` dosyasını internet'te host et (GitHub Pages ücretsiz)
- [ ] `store-assets/terms-of-service.html` dosyasını host et
- [ ] Play Console → Uygulama içeriği → Gizlilik politikası URL'sini gir
- [ ] GDPR için kullanıcı onay diyaloğu (AdMob `UMP SDK` — opsiyonel ama önerilir)

---

## AŞAMA 7 – Yayın Sonrası

- [ ] Crash reporting: Sentry veya Firebase Crashlytics ekle (opsiyonel)
- [ ] Analytics: RevenueCat dashboard'u takip et
- [ ] AdMob dashboard'u izle
- [ ] Kullanıcı yorumlarını düzenli takip et (Play Console → Reviews)
- [ ] Haftalık stat bildirimleri için e-posta ayarla

---

## Hızlı Komutlar Referans

```bash
# TypeScript kontrol
cd /home/ubuntu/pomomate && npx tsc --noEmit

# Geliştirme sunucusu
cd /home/ubuntu/pomomate && npx expo start

# Preview APK build
eas build --platform android --profile preview

# Production AAB build
eas build --platform android --profile production

# Play Store'a otomatik gönder (eas.json submit profili)
eas submit --platform android --profile production

# EAS güncellemesi (OTA update, native build gerektirmez)
eas update --branch production --message "Hata düzeltmesi"
```

---

## İletişim & Destek

- **Geliştirici:** PomoMate Team
- **Destek:** support@pomomate.app
- **Gizlilik:** privacy@pomomate.app

---
*Bu kontrol listesi PomoMate v1.0.0 için hazırlanmıştır.*
