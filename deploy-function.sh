#!/bin/bash

# PixelTrack - Manual Edge Function Deployment
# Bu script Supabase CLI olmadan Docker kullanarak deploy eder

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   PixelTrack - Manual Edge Function Deployment           ║"
echo "║   Docker-based Supabase CLI kullanarak                   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Kontroller
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
    echo "❌ Error: SUPABASE_ACCESS_TOKEN environment variable not set"
    echo ""
    echo "Ayarla:"
    echo "  export SUPABASE_ACCESS_TOKEN='your_token_here'"
    echo ""
    echo "Token al: https://app.supabase.com/account/tokens"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker installed değil"
    echo ""
    echo "Docker kur: https://docs.docker.com/get-docker/"
    exit 1
fi

PROJECT_ID="jnlbhiyazvexttfpuxxe"
FUNCTION_NAME="track"

echo "📦 Supabase CLI Docker image (ghcr.io) download ediliyor..."
docker pull ghcr.io/supabase/cli:latest

echo ""
echo "🚀 Edge Function deploy ediliyor..."
docker run --rm \
  -e SUPABASE_ACCESS_TOKEN="$SUPABASE_ACCESS_TOKEN" \
  -v "$(pwd)/supabase:/supabase" \
  ghcr.io/supabase/cli:latest \
  functions deploy "$FUNCTION_NAME" \
  --project-id "$PROJECT_ID" \
  --no-verify

echo ""
echo "✅ Deployment başarılı!"
echo ""
echo "🔗 Edge Function URL:"
echo "   https://${PROJECT_ID}.supabase.co/functions/v1/${FUNCTION_NAME}"
echo ""
echo "📊 Kontrol:"
echo "   https://supabase.com/dashboard/project/${PROJECT_ID}/functions"
echo ""
echo "🧪 Test:"
echo "   curl 'https://${PROJECT_ID}.supabase.co/functions/v1/${FUNCTION_NAME}?id=test123'"
