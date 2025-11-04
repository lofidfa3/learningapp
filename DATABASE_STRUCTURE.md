# 🗄️ Database Structure (Supabase PostgreSQL)

## Overview

Your app uses **Supabase PostgreSQL** with 4 main tables and automatic triggers for tracking user activity.

---

## 📊 Tables

### 1. **users** (User Profiles)
Stores user account information and learning statistics.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | User ID (matches Supabase Auth) |
| `email` | TEXT | User's email address |
| `display_name` | TEXT | Display name |
| `photo_url` | TEXT | Profile photo URL |
| `premium` | BOOLEAN | Premium subscription status (default: false) |
| `subscription_status` | TEXT | active/inactive/cancelled |
| `subscription_end_date` | TIMESTAMP | When subscription expires |
| `current_streak` | INTEGER | Days of consecutive use (default: 0) |
| `longest_streak` | INTEGER | Best streak record (default: 0) |
| `articles_read` | INTEGER | Total articles read (default: 0) |
| `words_learned` | INTEGER | Total words learned (default: 0) |
| `last_active` | TIMESTAMP | Last activity timestamp |
| `created_at` | TIMESTAMP | Account creation date |
| `updated_at` | TIMESTAMP | Last profile update |

**Indexes:**
- `idx_users_email` - Fast email lookups
- `idx_users_premium` - Query premium users

---

### 2. **vocabulary_items** (Saved Words)
Stores all words users save while reading articles.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique word entry ID |
| `user_id` | UUID (FK → users) | Who saved this word |
| `word` | TEXT | The word/phrase |
| `translation` | TEXT | Translation to target language |
| `definition` | TEXT | Word definition |
| `example` | TEXT | Example sentence |
| `language` | TEXT | Target language (e.g., 'italian') |
| `mastered` | BOOLEAN | Word fully learned (default: false) |
| `review_count` | INTEGER | Times reviewed (default: 0) |
| `last_reviewed` | TIMESTAMP | Last review date |
| `next_review` | TIMESTAMP | Next scheduled review |
| `article_id` | TEXT | Source article ID |
| `article_title` | TEXT | Source article title |
| `created_at` | TIMESTAMP | When word was saved |
| `updated_at` | TIMESTAMP | Last update |

**Indexes:**
- `idx_vocabulary_user_id` - Fast user lookups
- `idx_vocabulary_language` - Filter by language
- `idx_vocabulary_mastered` - Find unmastered words
- `idx_vocabulary_next_review` - Spaced repetition scheduling

**Unique Constraint:**
- `unique_user_word_language` - Prevents duplicate words per user/language

---

### 3. **articles** (Saved Articles)
Stores articles users save for reading later.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique article entry ID |
| `user_id` | UUID (FK → users) | Who saved the article |
| `article_id` | TEXT | External article ID (from Guardian API) |
| `title` | TEXT | Article title |
| `url` | TEXT | Article URL |
| `thumbnail` | TEXT | Article thumbnail image |
| `description` | TEXT | Article summary |
| `published_date` | TIMESTAMP | When article was published |
| `language` | TEXT | Target language |
| `saved_at` | TIMESTAMP | When user saved it |
| `read` | BOOLEAN | Reading completed (default: false) |
| `read_at` | TIMESTAMP | When marked as read |

**Indexes:**
- `idx_articles_user_id` - Fast user lookups
- `idx_articles_read` - Filter by read status
- `idx_articles_language` - Filter by language

**Unique Constraint:**
- `unique_user_article` - Prevents duplicate saves

---

### 4. **user_actions** (Activity Log)
Tracks all user actions for analytics and progress.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique action ID |
| `user_id` | UUID (FK → users) | Who performed the action |
| `action_type` | TEXT | Type: 'article_read', 'word_saved', etc. |
| `target_id` | TEXT | ID of target (article/word) |
| `language` | TEXT | Language context |
| `metadata` | JSONB | Additional data (flexible) |
| `created_at` | TIMESTAMP | When action occurred |

**Indexes:**
- `idx_user_actions_user_id` - Fast user lookups
- `idx_user_actions_type` - Filter by action type
- `idx_user_actions_created` - Sort by date

---

## 🔒 Row Level Security (RLS)

All tables have RLS enabled. Users can only access their own data:

### users
- ✅ Users can read their own profile
- ✅ Users can update their own profile
- ✅ Service role has full access

### vocabulary_items
- ✅ Users can CRUD their own words
- ✅ Service role has full access

### articles
- ✅ Users can CRUD their own saved articles
- ✅ Service role has full access

### user_actions
- ✅ Users can read/insert their own actions
- ✅ Service role has full access

---

## ⚡ Automatic Triggers

### 1. **update_updated_at_column**
Automatically updates `updated_at` timestamp on every row change.

Applied to:
- `users`
- `vocabulary_items`

### 2. **on_vocabulary_added**
When a word is saved:
- Increments `users.words_learned` counter
- Logs action to `user_actions` table

---

## 🔧 Helper Functions

### `increment_articles_read(user_id UUID)`
- Increments article counter
- Updates `last_active` timestamp
- Maintains streak tracking

### `increment_words_learned(user_id UUID)`
- Increments word counter
- Updates `last_active` timestamp

### `update_user_streak(user_id UUID)`
- Calculates daily streaks
- Updates current and longest streak

### `get_user_stats(user_id UUID)`
Returns JSON with:
```json
{
  "articles_read": 42,
  "words_learned": 156,
  "current_streak": 7,
  "longest_streak": 14,
  "vocabulary_count": 156,
  "mastered_count": 23
}
```

---

## 📈 Relationships

```
users (1) ──→ (many) vocabulary_items
users (1) ──→ (many) articles
users (1) ──→ (many) user_actions

vocabulary_items.user_id ──→ users.id (CASCADE DELETE)
articles.user_id ──→ users.id (CASCADE DELETE)
user_actions.user_id ──→ users.id (CASCADE DELETE)
```

**Cascade Delete:** When a user is deleted, all their data is automatically removed.

---

## 🎯 Key Features

### Spaced Repetition (Flashcards)
- `vocabulary_items.next_review` - Scheduled review date
- `vocabulary_items.review_count` - Tracks practice sessions
- `vocabulary_items.mastered` - Word fully learned (5+ reviews)

### Progress Tracking
- Automatic counters via triggers
- Real-time stats via `get_user_stats()` function
- Streak calculation based on `last_active`

### Language Learning
- Multi-language support (per word/article)
- Source tracking (which article word came from)
- Translation and definition storage

---

## 🔍 Example Queries

### Get user's unmastered Italian words:
```sql
SELECT * FROM vocabulary_items
WHERE user_id = 'xxx'
  AND language = 'italian'
  AND mastered = false
ORDER BY next_review ASC;
```

### Get words due for review today:
```sql
SELECT * FROM vocabulary_items
WHERE user_id = 'xxx'
  AND next_review <= NOW()
  AND mastered = false;
```

### Get user's reading stats:
```sql
SELECT * FROM get_user_stats('user-id-here');
```

---

## 📍 Database Location

- **Provider:** Supabase (PostgreSQL)
- **URL:** `https://cnuuusmeigryzkctfcgr.supabase.co`
- **Dashboard:** [https://supabase.com/dashboard/project/cnuuusmeigryzkctfcgr](https://supabase.com/dashboard/project/cnuuusmeigryzkctfcgr)

---

## 📁 Migration Files

- `supabase/migrations/001_initial_schema.sql` - All table definitions
- `supabase/migrations/002_helper_functions.sql` - All functions and triggers

---

Your database is production-ready with automatic tracking, security, and efficient indexing! 🚀

