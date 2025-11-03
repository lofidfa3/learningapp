#!/bin/bash

# Automated Migration Executor
# This script attempts to run migrations using curl

set -e

# Load .env.local
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL}"
SUPABASE_SERVICE_KEY="${SUPABASE_SERVICE_ROLE_KEY}"
SUPABASE_ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY}"

if [ -z "$SUPABASE_URL" ]; then
  echo "❌ NEXT_PUBLIC_SUPABASE_URL not set"
  exit 1
fi

PROJECT_REF=$(echo "$SUPABASE_URL" | sed -n 's|https://\([^.]*\)\.supabase\.co|\1|p')

echo "🚀 Executing Supabase Migrations"
echo "================================="
echo ""
echo "📡 Project: $PROJECT_REF"
echo "🔗 Dashboard: https://supabase.com/dashboard/project/$PROJECT_REF/sql"
echo ""

if [ -z "$SUPABASE_SERVICE_KEY" ]; then
  echo "⚠️  SUPABASE_SERVICE_ROLE_KEY not found"
  echo ""
  echo "📋 To run migrations automatically:"
  echo "   1. Get your service role key from Supabase Dashboard"
  echo "   2. Settings → API → service_role key (keep it secret!)"
  echo "   3. Add to .env.local: SUPABASE_SERVICE_ROLE_KEY=your-key"
  echo ""
  echo "💡 For now, run migrations manually:"
  echo "   1. Open: https://supabase.com/dashboard/project/$PROJECT_REF/sql"
  echo "   2. Copy SQL from: supabase/migrations/001_initial_schema.sql"
  echo "   3. Paste and Run"
  echo "   4. Repeat for: supabase/migrations/002_helper_functions.sql"
  echo ""
  exit 0
fi

# Read migration files
MIGRATION1="supabase/migrations/001_initial_schema.sql"
MIGRATION2="supabase/migrations/002_helper_functions.sql"

if [ ! -f "$MIGRATION1" ] || [ ! -f "$MIGRATION2" ]; then
  echo "❌ Migration files not found"
  exit 1
fi

echo "📝 Running migration 1..."
SQL1=$(cat "$MIGRATION1")

# Use Supabase Management API
RESPONSE1=$(curl -s -w "\n%{http_code}" \
  -X POST \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"$SQL1\"}" \
  "https://api.supabase.com/v1/projects/$PROJECT_REF/sql" 2>/dev/null)

HTTP_CODE1=$(echo "$RESPONSE1" | tail -n1)
BODY1=$(echo "$RESPONSE1" | sed '$d')

if [ "$HTTP_CODE1" -eq 200 ] || [ "$HTTP_CODE1" -eq 201 ]; then
  echo "✅ Migration 1 completed"
else
  echo "⚠️  Migration 1 returned HTTP $HTTP_CODE1"
  echo "Response: $BODY1"
fi

echo ""
echo "📝 Running migration 2..."
SQL2=$(cat "$MIGRATION2")

RESPONSE2=$(curl -s -w "\n%{http_code}" \
  -X POST \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"$SQL2\"}" \
  "https://api.supabase.com/v1/projects/$PROJECT_REF/sql" 2>/dev/null)

HTTP_CODE2=$(echo "$RESPONSE2" | tail -n1)
BODY2=$(echo "$RESPONSE2" | sed '$d')

if [ "$HTTP_CODE2" -eq 200 ] || [ "$HTTP_CODE2" -eq 201 ]; then
  echo "✅ Migration 2 completed"
else
  echo "⚠️  Migration 2 returned HTTP $HTTP_CODE2"
  echo "Response: $BODY2"
fi

echo ""
echo "🔍 Verifying tables..."

# Test each table
for table in users vocabulary_items articles user_actions; do
  TEST_URL="$SUPABASE_URL/rest/v1/$table?select=id&limit=1"
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "apikey: $SUPABASE_ANON_KEY" \
    -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
    "$TEST_URL" 2>/dev/null)
  
  if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 406 ]; then
    echo "   ✅ $table"
  else
    echo "   ❌ $table (HTTP $HTTP_CODE)"
  fi
done

echo ""
echo "🎉 Migration process complete!"
echo ""

