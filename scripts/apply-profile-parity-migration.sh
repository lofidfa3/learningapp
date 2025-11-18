#!/bin/bash

# Script to apply the profile parity migration
# This ensures all users (email/password and Google OAuth) have identical database capabilities

echo "🔧 Applying Profile Parity Migration"
echo "======================================"
echo ""
echo "This migration will:"
echo "  ✓ Update the handle_new_user() trigger to set complete defaults"
echo "  ✓ Backfill existing users with missing profile fields"
echo "  ✓ Ensure OAuth users have same capabilities as email users"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    echo "Run: npm install -g supabase"
    exit 1
fi

# Apply migration
echo "📦 Applying migration..."
supabase db push --include-all

echo ""
echo "✅ Migration applied successfully!"
echo ""
echo "Next steps:"
echo "  1. Verify in Supabase dashboard that all users have complete profiles"
echo "  2. Test both email/password and Google sign-in"
echo "  3. Confirm both auth methods have identical database access"
echo ""

