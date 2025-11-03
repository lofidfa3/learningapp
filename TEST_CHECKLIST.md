# 🧪 Testing Checklist - Supabase Backend

## Prerequisites
✅ Supabase project created
✅ Environment variables set (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
⚠️ Database tables created (run migrations from `supabase/migrations/`)

## Test Sequence

### 1. Authentication Flow
- [ ] Sign up with email/password
  - Check: User created in Supabase `users` table
  - Check: Profile has default values (free subscription, italian language)
- [ ] Sign in with email/password
  - Check: User session established
  - Check: User profile loaded
- [ ] Sign out
  - Check: Session cleared

### 2. Browse News
- [ ] Visit homepage
- [ ] Select category (Technology, Business, etc.)
- [ ] See articles displayed
- [ ] Click on an article

### 3. Read Article
- [ ] Article content displays
- [ ] Click "Mark as Read"
  - Check: Article saved to Supabase `articles` table
  - Check: Action logged in `user_actions` table

### 4. Translate Article
- [ ] Click "Translate Article"
- [ ] Translation displays
  - Check: Translation action logged in `user_actions` table

### 5. Extract & Save Vocabulary
- [ ] Click "Extract Vocabulary"
- [ ] Vocabulary list displays
- [ ] Click "Save" on a word
  - Check: Vocabulary saved to `vocabulary_items` table
  - Check: Action logged in `user_actions` table
- [ ] Click "Save All"
  - Check: All words saved to database

### 6. Review Flashcards
- [ ] Go to Flashcards page
- [ ] See vocabulary count
- [ ] Click "Start Review"
- [ ] Review cards (mark correct/wrong)
  - Check: Review count increments in `vocabulary_items`
  - Check: `last_reviewed` and `next_review` dates updated
  - Check: Mastery status updates after 5 correct

### 7. View Progress
- [ ] Go to Progress page
- [ ] See articles read count
- [ ] See words learned count
- [ ] See vocabulary by language
  - Check: Data aggregated from `vocabulary_items` table

## Database Verification

### Check Supabase Dashboard

1. **Users Table**
```sql
SELECT * FROM users ORDER BY created_at DESC LIMIT 5;
```
Should show: New user profiles with stats

2. **Vocabulary Items**
```sql
SELECT * FROM vocabulary_items WHERE user_id = 'YOUR_USER_ID' ORDER BY created_at DESC;
```
Should show: Saved vocabulary with review data

3. **Articles**
```sql
SELECT * FROM articles WHERE user_id = 'YOUR_USER_ID';
```
Should show: Read articles

4. **User Actions**
```sql
SELECT * FROM user_actions WHERE user_id = 'YOUR_USER_ID' ORDER BY created_at DESC LIMIT 10;
```
Should show: All tracked actions (reads, saves, translations)

## Common Issues

### Issue: User profile not created
**Solution:** Check if migrations ran. Run `001_initial_schema.sql` in Supabase SQL editor.

### Issue: Cannot save vocabulary
**Solution:** Check RLS policies on `vocabulary_items` table. Should allow INSERT for authenticated users.

### Issue: Flashcards not loading
**Solution:** Check if `vocabulary_items` table exists and has data for the user.

### Issue: Progress not showing
**Solution:** Save some vocabulary first. Progress is calculated from vocabulary items.

## Success Criteria

✅ All functions use Supabase (no localStorage except for sessionStorage for articles)
✅ User data persists across sessions
✅ Database tables have data
✅ Actions are tracked
✅ Progress is calculated correctly

## Next Steps After Testing

1. Run migrations if not done
2. Test all functions
3. Verify database has data
4. Deploy to Vercel
5. Test on production

