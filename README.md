<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# PixelTrack - Email Open Tracking System

E-postanız açıldığında gerçek zamanlı olarak bildirim alan profesyonel email takip sistemi.

## 🚀 Özellikler

- **Pixel-Based Tracking**: 1x1 transparente tracking pixel ile email açılmaları yakalama
- **Realtime Updates**: Supabase realtime pub/sub ile canlı veri güncellemeleri
- **Supabase Edge Functions**: Serverless backend ile güvenli ve ölçeklenebilir tracking
- **AI-Powered**: Gemini API ile subject line optimizasyonu
- **Beautiful Dashboard**: Açılma oranları ve istatistikler
- **One-Click Deploy**: GitHub Actions ile otomatik deployment

## 📋 Kurulum Adımları

### 1. Supabase Veritabanı Kurulumu

Dashboard → **DB Kurulum** butonuna tıklayın ve SQL kodunu çalıştırın:

```sql
-- Supabase SQL Editor'de çalıştır
CREATE TABLE IF NOT EXISTS public.tracked_emails (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tracking_id TEXT NOT NULL UNIQUE,
    recipient TEXT DEFAULT 'Belirtilmedi',
    subject TEXT,
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'opened')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    opened_at TIMESTAMP WITH TIME ZONE
);

-- RLS Politikası
ALTER TABLE public.tracked_emails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access" ON public.tracked_emails FOR ALL USING (true) WITH CHECK (true);

-- Realtime
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tracked_emails;
```

### 2. Edge Function Deploy

**GitHub Actions ile otomatik deploy**: Commit ve push ettikten sonra workflow çalışır.

**Manuel deploy**:
```bash
npm install -g supabase
supabase login
supabase functions deploy track --project-id jnlbhiyazvexttfpuxxe
```

### 3. Yerel Başlat

```bash
npm install
npm run dev
```

## 🧪 Testing

1. **Takip Kodu Oluştur** → "Kod Üret" butonuna tıkla
2. **Email Listesi** → "Simüle Et" ile açılma test et
3. **Dashboard** → Canlı istatistikleri gör

## 📊 API

```
GET /functions/v1/track?id={trackingId}
Response: 1x1 pixel + status='opened' güncelle
```
