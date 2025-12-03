# PixelTrack - Deployment Guide

## 📊 System Architecture

```
┌─────────────────┐
│  React Frontend │
│ (Vite + TypeScript)
└────────┬────────┘
         │
    HTTP/Websocket
         │
         ▼
┌─────────────────────────┐
│  Supabase Backend       │
├─────────────────────────┤
│ ✓ PostgreSQL Database   │
│ ✓ Edge Functions        │
│ ✓ Realtime Pub/Sub      │
│ ✓ RLS Policies          │
└─────────────────────────┘
```

---

## 🚀 Deployment Steps

### Step 1: Database Setup (5 mins)

```bash
# 1. Supabase SQL Editor aç
# https://supabase.com/dashboard/project/jnlbhiyazvexttfpuxxe/sql

# 2. SUPABASE_SETUP.sql dosyasındaki kodu kopyala

# 3. Supabase SQL Editor'da yapıştır ve çalıştır

# 4. Kontrol et (Query output):
# ✓ CREATE TABLE IF NOT EXISTS (sağlıklı)
# ✓ Tüm indexes oluşturuldu
# ✓ RLS enabled
# ✓ Publication supabase_realtime oluşturuldu
```

### Step 2: GitHub Actions Setup (3 mins)

```bash
# 1. GitHub repo settings aç
# https://github.com/oguztaner/PixelTrack/settings/secrets/actions

# 2. "New repository secret" tıkla

# 3. Ekle:
Name: SUPABASE_ACCESS_TOKEN
Secret: <Supabase'den token al>

# Token nereden?
# https://app.supabase.com/account/tokens
# Personal Access Token oluştur

# 4. Save
```

### Step 3: Deploy Edge Function (1 min)

#### Option A: GitHub Actions (Recommended - Automatic)

```bash
# 1. Repo'da commit & push
git add .
git commit -m "Deploy: Email tracking system with Edge Functions"
git push origin main

# 2. GitHub Actions otomatik çalışır
# Monitor: https://github.com/oguztaner/PixelTrack/actions

# 3. "Deploy to Supabase" workflow'u gözlemle
# Status: "deployed" olana kadar bekle (2-3 dakika)

# Expected output:
# ✓ Setup Node.js
# ✓ Install Supabase CLI via apt
# ✓ Deploy Edge Functions to Supabase
# ✓ Verify Deployment
# ✓ Test Tracking Endpoint
```

#### Option B: Docker-based Manual Deploy

```bash
# 1. Token'ı set et
export SUPABASE_ACCESS_TOKEN="your_personal_token_here"

# 2. Script çalıştır
./deploy-function.sh

# Veya manual:
docker run --rm \
  -e SUPABASE_ACCESS_TOKEN="$SUPABASE_ACCESS_TOKEN" \
  -v "$(pwd)/supabase:/supabase" \
  supabase/cli:latest \
  functions deploy track \
  --project-id jnlbhiyazvexttfpuxxe \
  --no-verify
```

#### Option C: Web Console (Easiest for beginners)

```
1. https://supabase.com/dashboard/project/jnlbhiyazvexttfpuxxe
2. Edge Functions → Create Function (name: "track")
3. supabase/functions/track/index.ts kodu paste et
4. Deploy butonuna tıkla
```

### Step 4: Verify Deployment

```bash
# Test 1: Edge Function is responding
curl -i "https://jnlbhiyazvexttfpuxxe.supabase.co/functions/v1/track?id=test123"

# Expected Response:
# HTTP/1.1 200 OK
# Content-Type: image/gif
# [Binary GIF data - 1x1 pixel]

# Test 2: Missing ID parameter (should fail gracefully)
curl "https://jnlbhiyazvexttfpuxxe.supabase.co/functions/v1/track"
# Expected: 400 Bad Request - "Missing tracking ID"

# Test 3: Database is updated
# Login: https://supabase.com/dashboard
# Go to: SQL Editor
# Run: SELECT COUNT(*) FROM public.tracked_emails;

# Test 4: Realtime connected
# Open app in browser: http://localhost:5173
# Press F12 → Console
# Should see: "Successfully subscribed to database changes"
```

---

## 📱 Frontend Deployment

### Option 1: Vercel (Recommended for React/Vite)

```bash
# 1. Vercel account oluştur: https://vercel.com

# 2. CLI install
npm install -g vercel

# 3. Deploy
vercel

# 4. .env vars ekle
# VITE_SUPABASE_URL=https://jnlbhiyazvexttfpuxxe.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJ...

# 5. Kontrol
# https://pixeltrack.vercel.app
```

### Option 2: GitHub Pages

```bash
# 1. vite.config.ts'de base ekle
export default defineConfig({
  base: '/PixelTrack/',
  ...
})

# 2. Build
npm run build

# 3. GitHub Pages settings
# Branch: main, folder: /docs
# veya Actions ile deploy

# 4. Kontrol
# https://oguztaner.github.io/PixelTrack
```

### Option 3: Docker + Any Host

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "preview"]
```

---

## 🔐 Security Checklist

- [ ] RLS politikaları prod için kısıtlandı mı?
- [ ] API key'ler env vars'da mı (hardcoded değil)?
- [ ] CORS origins ayarlandı mı?
- [ ] Rate limiting yapılandırıldı mı?
- [ ] Tracking pixel'i spam için kötüye kullanılabilir mi?
- [ ] GDPR compliance kontrol edildi mi?

### Production RLS Policy Example

```sql
-- Yalnızca kendi emaillerini görebilsinler
ALTER POLICY "Public Access Select" ON public.tracked_emails
FOR SELECT
USING (auth.uid() = user_id);
-- (Eğer user_id column'u eklediysen)
```

---

## 📊 Monitoring

### Supabase Dashboard
- URL: https://supabase.com/dashboard/project/jnlbhiyazvexttfpuxxe
- Check: Database > tracked_emails
- Monitor: Realtime > Events

### GitHub Actions
- URL: https://github.com/oguztaner/PixelTrack/actions
- Check: Deploy to Supabase workflow runs

### Application Logs
```bash
# Supabase logs
supabase logs --project-id jnlbhiyazvexttfpuxxe

# Browser console
Open app → F12 → Console
Look for: "Real-time update received"
```

---

## 🐛 Common Issues & Fixes

### Issue: "Edge Function not found" (404)
**Cause**: Function not deployed
**Fix**: 
```bash
# Check deployment
supabase functions list --project-id jnlbhiyazvexttfpuxxe

# Redeploy
supabase functions deploy track --project-id jnlbhiyazvexttfpuxxe
```

### Issue: "RLS violation" (403)
**Cause**: RLS policy too restrictive
**Fix**: Check RLS policies in Supabase SQL Editor

### Issue: "Realtime not updating"
**Cause**: Publication not configured
**Fix**: Rerun SQL setup script, check pub/sub status

---

## 🎯 Success Criteria

✅ **Deployment is successful when:**
1. Edge Function responds with 200 + GIF
2. Database inserts work without errors
3. Status updates from 'sent' to 'opened'
4. Dashboard shows updated stats
5. No CORS or realtime errors in console

---

## 📈 Performance Optimization

```
# Indexes untuk fast queries
- tracking_id: Unique index (UNIQUE lookup)
- status: Regular index (WHERE status = 'opened')
- created_at: DESC index (ORDER BY created_at DESC)

# Realtime optimization
- Only listen to status changes
- Debounce updates on frontend (500ms)
```

---

## 🔄 CI/CD Pipeline

```
Code Push → GitHub Actions → Supabase Deploy → Test → Notification
   ↓              ↓                ↓             ↓         ↓
main          trigger          functions    curl test   Slack/Email
             deploy.yml         deploy       verify     (optional)
```

---

## 📞 Support Resources

- Supabase Docs: https://supabase.com/docs
- Edge Functions: https://supabase.com/docs/guides/functions
- Realtime: https://supabase.com/docs/guides/realtime
- GitHub Actions: https://docs.github.com/en/actions

---

**Last Updated**: 2025-12-03  
**Version**: 1.0.0  
**Status**: Production Ready ✓
