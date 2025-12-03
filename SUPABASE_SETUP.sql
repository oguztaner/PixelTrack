-- ===================================================
-- EMAIL TRACKING SYSTEM - SUPABASE SQL SETUP
-- ===================================================
-- Bu SQL kodunu Supabase SQL Editor'de çalıştırın
-- Adres: https://supabase.com/dashboard/project/jnlbhiyazvexttfpuxxe/sql
-- 
-- ⏱️ Tahmini Süre: 2-3 dakika
-- ⚠️  Önemli: Tüm kodu bir kerede çalıştırın (copy-paste)
-- ===================================================

-- 1. TABLO OLUŞTUR
-- ===================================================
CREATE TABLE IF NOT EXISTS public.tracked_emails (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tracking_id TEXT NOT NULL UNIQUE,
    recipient TEXT DEFAULT 'Belirtilmedi',
    subject TEXT,
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'opened')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    opened_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. İNDEKSLER OLUŞTUR (Performans için)
-- ===================================================
CREATE INDEX IF NOT EXISTS idx_tracking_id ON public.tracked_emails(tracking_id);
CREATE INDEX IF NOT EXISTS idx_status ON public.tracked_emails(status);
CREATE INDEX IF NOT EXISTS idx_created_at ON public.tracked_emails(created_at DESC);

-- 3. RLS (ROW LEVEL SECURITY) AYARLA
-- ===================================================
ALTER TABLE public.tracked_emails ENABLE ROW LEVEL SECURITY;

-- Eski politikaları temizle (varsa)
DROP POLICY IF EXISTS "Public Access Select" ON public.tracked_emails;
DROP POLICY IF EXISTS "Public Access Insert" ON public.tracked_emails;
DROP POLICY IF EXISTS "Public Access Update" ON public.tracked_emails;
DROP POLICY IF EXISTS "Public Access Delete" ON public.tracked_emails;

-- Yeni politikalar (Demo/Test için - Üretimde güvenleştirin)
CREATE POLICY "Public Access Select" 
    ON public.tracked_emails FOR SELECT 
    USING (true);

CREATE POLICY "Public Access Insert" 
    ON public.tracked_emails FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Public Access Update" 
    ON public.tracked_emails FOR UPDATE 
    USING (true);

CREATE POLICY "Public Access Delete" 
    ON public.tracked_emails FOR DELETE 
    USING (true);

-- 4. REALTIME PUB/SUB YAPILANDIRMA
-- ===================================================
-- Mevcut publication'ı temizle (varsa)
DROP PUBLICATION IF EXISTS supabase_realtime;

-- Yeni publication oluştur
CREATE PUBLICATION supabase_realtime;

-- Tabloyu publication'a ekle
ALTER PUBLICATION supabase_realtime ADD TABLE public.tracked_emails;

-- ===================================================
-- ✅ KURULUM TAMAMLANDI
-- ===================================================
-- Aşağıdaki komutları çalıştırıp kontrol et:

-- Tablo varlığını kontrol et:
SELECT 
    COUNT(*) as "Toplam E-posta",
    COUNT(CASE WHEN status = 'opened' THEN 1 END) as "Okunan",
    COUNT(CASE WHEN status = 'sent' THEN 1 END) as "Gönderilen"
FROM public.tracked_emails;

-- Tablo yapısını gör:
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'tracked_emails';

-- RLS politikalarını kontrol et:
SELECT policyname FROM pg_policies WHERE tablename = 'tracked_emails';

-- ===================================================
-- 💡 Sonraki Adımlar:
-- ===================================================
-- 1. GitHub Secrets'a ekle: SUPABASE_ACCESS_TOKEN
-- 2. Edge Function deploy et (GitHub Actions)
-- 3. PixelTrack uygulamasını başlat: npm run dev
-- 4. "Takip Kodu Oluştur" → Kod üret ve test et
-- 5. "Takip Edilen E-Postalar" → Simüle Et butonuna tıkla
-- 6. Dashboard'dan istatistikleri gör (Realtime)
