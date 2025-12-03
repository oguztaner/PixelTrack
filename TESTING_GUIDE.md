# PixelTrack - Testing & Deployment Checklist

## 📋 Pre-Deployment Checklist

### 1. Environment Setup
- [ ] Node.js 18+ installed (`node --version`)
- [ ] `.env.local` dosyası oluşturuldu
- [ ] `API_KEY` (Gemini) eklendi
- [ ] Supabase project URL eklendi
- [ ] Supabase ANON key eklendi

### 2. Database Setup
- [ ] SQL kodu çalıştırıldı (Dashboard → DB Kurulum)
- [ ] `tracked_emails` tablosu oluşturuldu
- [ ] RLS politikaları aktif
- [ ] Realtime pub/sub yapılandırıldı
- [ ] Test: Dashboard realtime verisi gösteriyor

### 3. GitHub Actions Setup
- [ ] GitHub Secrets'a `SUPABASE_ACCESS_TOKEN` eklendi
- [ ] Repository settings'de Actions enabled
- [ ] Workflow file yüklendi (`.github/workflows/deploy.yml`)

---

## 🧪 Local Testing (Development)

### Test 1: Application Start
```bash
npm install
npm run dev
# ✅ App açılıyor: http://localhost:5173
```

### Test 2: Database Connection
1. Dashboard sayfasına git
2. Refresh butonuna tıkla
3. İstatistikler yüklenerse ✅ Veritabanı bağlantısı OK

### Test 3: Email Creation & Tracking
1. "Takip Kodu Oluştur" sayfasına git
2. "Hızlı Oluştur & Kopyala" butonuna tıkla
3. Kod kopyalandı mı kontrol et
4. Örnek kod:
   ```html
   <img src="https://jnlbhiyazvexttfpuxxe.supabase.co/functions/v1/track?id=abc123xyz" 
        width="1" height="1" alt="" style="display:none;" />
   ```
5. ✅ Başarılı ise email DB'ye kaydedildi

### Test 4: Email List & Simulation
1. "Takip Edilen E-Postalar" sayfasına git
2. Listede az önce oluşturduğumuz email var mı?
3. Email satırındaki "Simüle Et" (external link ikonu) butonuna tıkla
4. Durum değişti mi? ("Gönderildi" → "Okundu")
5. ✅ Başarılı ise frontend-backend iletişimi OK

### Test 5: Realtime Updates
1. İki browser tab aç (veya incognito window)
2. Tab1: Email List sayfası
3. Tab2: Same Email List sayfası
4. Tab1'de "Simüle Et" tıkla
5. Tab2'de otomatik güncellenme var mı?
6. ✅ Başarılı ise Realtime pub/sub çalışıyor

### Test 6: Dashboard Stats
1. Dashboard sayfasına git
2. "Toplam Gönderilen" say: X
3. "Toplam Okunan" say: Y
4. "Okunma Oranı": %Z (= Y/X * 100)
5. ✅ Rakamlar tutarlı mı?

### Test 7: AI Suggestions (Bonus)
1. "Takip Kodu Oluştur" → Detaylı Oluşturma
2. Subject: "Yeni Teklif" yaz
3. Sparkles (✨) butonu tıkla
4. Gemini önerileri geldi mi?
5. ✅ 3 adet suggestion görseydin başarılı

---

## 🚀 Deployment to Supabase

### Option A: GitHub Actions (Recommended)
```bash
# 1. Commit ve push
git add .
git commit -m "Test: Email tracking implementation"
git push origin main

# 2. GitHub Actions çalışacak
# Settings → Actions → Deploy to Supabase

# 3. Kontrol
# https://jnlbhiyazvexttfpuxxe.supabase.co/functions/v1/track?id=test123
# Response: 1x1 GIF image (200 OK)
```

### Option B: Manual Supabase CLI
```bash
npm install -g supabase
supabase login
supabase functions deploy track --project-id jnlbhiyazvexttfpuxxe

# Verify
supabase functions list --project-id jnlbhiyazvexttfpuxxe
```

---

## ✅ Post-Deployment Testing

### Test 1: Edge Function is Live
```bash
curl -i "https://jnlbhiyazvexttfpuxxe.supabase.co/functions/v1/track?id=test123"

# Expected Response:
# HTTP/1.1 200 OK
# Content-Type: image/gif
# [Binary GIF data]
```

### Test 2: Email Status Update
1. Production app aç (Vercel/hosting)
2. "Takip Kodu Oluştur" → Email oluştur
3. HTML code'da tracking URL'i kontrol et
4. Farklı bir tab'da pixel URL'ini aç
   ```
   https://jnlbhiyazvexttfpuxxe.supabase.co/functions/v1/track?id=xyz
   ```
5. "Takip Edilen E-Postalar"da durumu kontrol et
6. ✅ "Okundu" olmuşsa sistem canlı!

### Test 3: Real Email Test (Optional)
1. Gmail'den fake account oluştur
2. E-posta gönder ve tracking kodu ekle
3. Real client'ı e-postayı açmasını iste
4. Dashboard'dan açılmayı gözlemle

---

## 🐛 Troubleshooting

| Sorun | Çözüm |
|-------|-------|
| "Supabase connection failed" | `.env.local`'de URL/KEY kontrol et, dev server yeniden başlat |
| "Simüle Et" çalışmıyor | RLS politikaları kontrol et, SQL'i yeniden çalıştır |
| Realtime güncellenmiyor | Browser console'da hata var mı? Websocket bağlantısı? |
| Edge Function 404 | GitHub Actions başarıyla çalıştı mı? Function deploy edildimi? |
| CORS hatası | Edge Function'da CORS headers açık mı? Supabase CLI kontrol et |

---

## 📊 Test Results Template

```
Date: 2025-12-03
Environment: Development

Test 1: Database Connection: ✅ PASS
Test 2: Email Creation: ✅ PASS
Test 3: Email Simulation: ✅ PASS
Test 4: Realtime Updates: ✅ PASS
Test 5: Dashboard Stats: ✅ PASS
Test 6: Edge Function Deploy: ✅ PASS (GitHub Actions)
Test 7: Pixel Tracking: ✅ PASS

Overall: ✅ ALL TESTS PASSED - READY FOR PRODUCTION
```

---

## 🔗 Faydalı Linkler

- Supabase SQL Editor: https://supabase.com/dashboard/project/jnlbhiyazvexttfpuxxe/sql
- Edge Functions: https://supabase.com/dashboard/project/jnlbhiyazvexttfpuxxe/functions
- GitHub Actions: https://github.com/oguztaner/PixelTrack/actions
- PixelTrack App: http://localhost:5173

---

## 📝 Notes

- Üretim için RLS politikalarını güvenleştir
- Email headers'ında Privacy-Settings kontrol et
- Spam folder'a düşme ihtimalini azalt
- Open rates optimizasyonları: Send time, A/B testing vb.
