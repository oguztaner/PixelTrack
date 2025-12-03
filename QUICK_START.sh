#!/bin/bash

# PixelTrack - Quick Start Guide
# Bu dosya önemli komutlar ve linkler içerir

cat << 'EOF'
╔══════════════════════════════════════════════════════════════════╗
║                    PIXELTRACK - QUICK START                     ║
║                                                                  ║
║  📧 Email Open Tracking System with Supabase & GitHub Actions   ║
╚══════════════════════════════════════════════════════════════════╝

📋 KURULUM ADIM ADIM:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣  SUPABASE DATABASE SETUP (2 dakika)
   ├─ Adres: https://supabase.com/dashboard/project/jnlbhiyazvexttfpuxxe/sql
   ├─ Dosya: SUPABASE_SETUP.sql (tüm kodu kopyala-yapıştır)
   └─ Result: ✅ "Kurulum Tamamlandı"


2️⃣  GITHUB ACTIONS SETUP (3 dakika)
   ├─ Adres: https://github.com/oguztaner/PixelTrack/settings/secrets/actions
   ├─ Secret Name: SUPABASE_ACCESS_TOKEN
   ├─ Token From: https://app.supabase.com/account/tokens
   └─ Result: ✅ Secret saved


3️⃣  EDGE FUNCTION DEPLOY (1 dakika)
   ├─ Otomatik: Push ettikten sonra GitHub Actions çalışır
   ├─ Kontrol: https://github.com/oguztaner/PixelTrack/actions
   └─ Result: ✅ "Deploy to Supabase" workflow success


4️⃣  LOCAL TESTING (5 dakika)
   ├─ npm install
   ├─ npm run dev
   ├─ Adres: http://localhost:5173
   ├─ Test: "Takip Kodu Oluştur" → "Hızlı Oluştur & Kopyala"
   └─ Result: ✅ HTML kod kopyalandı


🧪 TESTING CHECKLIST:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Test 1: Dashboard istatistikler yükleniyor
✓ Test 2: Email oluşturma başarılı
✓ Test 3: "Simüle Et" butonu email'i "Okundu" yapıyor
✓ Test 4: Realtime güncelleştiriyor (iki tab'da test et)
✓ Test 5: Dashboard istatistikleri güncelleniyor
✓ Test 6: Edge Function pixel URL'i 1x1 GIF döndürüyor


📊 ÖNEMLI DOSYALAR:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📄 SUPABASE_SETUP.sql
   └─ Database schema, RLS, Realtime config

📄 TESTING_GUIDE.md
   └─ 7-step test checklist + troubleshooting

📄 DEPLOYMENT.md
   └─ Production deployment guide

📄 .github/workflows/deploy.yml
   └─ GitHub Actions CI/CD workflow

🐍 supabase/functions/track/index.ts
   └─ Edge Function backend (Deno)


🔗 ÖNEMLI LINKLER:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌐 PixelTrack App:        http://localhost:5173
📊 Supabase Dashboard:    https://supabase.com/dashboard/project/jnlbhiyazvexttfpuxxe
🔌 SQL Editor:            https://supabase.com/dashboard/project/jnlbhiyazvexttfpuxxe/sql
⚙️  Edge Functions:        https://supabase.com/dashboard/project/jnlbhiyazvexttfpuxxe/functions
🚀 GitHub Actions:        https://github.com/oguztaner/PixelTrack/actions
🔐 GitHub Secrets:        https://github.com/oguztaner/PixelTrack/settings/secrets/actions
🪙 Supabase Tokens:       https://app.supabase.com/account/tokens


⚡ QUICK COMMANDS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Start development
npm install
npm run dev

# Build for production
npm run build

# Deploy Edge Function manually
supabase functions deploy track --project-id jnlbhiyazvexttfpuxxe

# Test tracking pixel
curl "https://jnlbhiyazvexttfpuxxe.supabase.co/functions/v1/track?id=test123" -v


🎯 SISTEM İŞLEYİŞİ:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Email Gönder
   ↓
2. "Takip Kodu Oluştur" → HTML Pixel Kodu Al
   <img src="https://...supabase.co/functions/v1/track?id=xyz" />
   ↓
3. Email'de Pixel Embed Et
   ↓
4. Alıcı Email Açar
   ↓
5. Pixel Yüklenir (Browser)
   GET /functions/v1/track?id=xyz
   ↓
6. Edge Function Database'i Günceller
   UPDATE tracked_emails SET status='opened'
   ↓
7. Realtime Event Tetiklenir
   ↓
8. Frontend Otomatik Yenilenir
   ↓
9. Dashboard: Açılma Oranı Artıyor! 📈


💡 TIPS & TRICKS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ AI Subject Optimization:
   - "Takip Kodu Oluştur" → Subject yazıp ✨ butonuna tıkla
   - Gemini 3 tane suggestion verecek

📊 Realtime Test:
   - 2 browser tab aç
   - Her ikisinde Email List aç
   - Tab 1'de "Simüle Et" tıkla
   - Tab 2 otomatik güncellenir!

🔍 Debug Console:
   - F12 → Console
   - "Realtime Status: SUBSCRIBED" görsen ✅
   - "postgres_changes" eventi geliyorsa ✅

⚙️  Manual Deploy Test:
   - Sayfayı yenile
   - Query: "SELECT * FROM tracked_emails WHERE status='opened'"
   - DB'de değişim görsen ✅


⚠️  TROUBLESHOOTING:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ "Simüle Et" çalışmıyor
   → SUPABASE_SETUP.sql'i yeniden çalıştır
   → RLS politikalarını kontrol et

❌ Edge Function 404
   → GitHub Actions workflow'u kontrol et
   → Token eksik mi?

❌ Realtime güncellenmiyor
   → Browser console'da hata var mı?
   → Websocket bağlantısını kontrol et

❌ API Key hatası
   → .env.local'de değerler doğru mu?
   → Dev server yeniden başlat


🎉 SUCCESS CRITERIA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Tüm testler pass'e döndü
✅ Dashboard istatistikler güncelleşiyor
✅ Edge Function pixel URL'i çalışıyor
✅ Email listesi "Simüle Et" ile güncelleniyor
✅ GitHub Actions workflow success
✅ Realtime subscriptions aktif


📞 NEXT STEPS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. SUPABASE_SETUP.sql'i çalıştır
2. SUPABASE_ACCESS_TOKEN GitHub Secrets'a ekle
3. Commit & Push et (GitHub Actions otomatik çalışır)
4. Local testing yap
5. Production deploy et


════════════════════════════════════════════════════════════════════
Made with ❤️  using Supabase + React + GitHub Actions
Happy email tracking! 🚀
════════════════════════════════════════════════════════════════════
EOF
