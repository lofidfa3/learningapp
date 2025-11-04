# 🚀 LinguaNews - AI-Powered Language Learning

## Quick Start

Your app is configured and ready!

### Start the App:

```bash
cd /Users/amirfooladi/learningapp
npm run dev
```

Open: http://localhost:3000

### AI Features Configured:

✅ **Translation** - Powered by DeepSeek Chat v3.1
✅ **Vocabulary Extraction** - AI finds important words
✅ **Database** - Supabase for data persistence
✅ **Flashcards** - Spaced repetition learning

### API Keys (in .env.local):
- ✅ Supabase URL and Key
- ✅ DeepSeek API Key (OpenRouter)
- ✅ Model: deepseek/deepseek-chat-v3.1:free

### Test Your App:
1. Browse news articles
2. Click any article
3. Click "Translate Article" → AI translates
4. Click "Extract Vocabulary" → AI finds words
5. Save words → Stored in database
6. Review flashcards → Track progress

## All Functions Working:
- Authentication (Supabase)
- News browsing (Guardian API)
- AI Translation (DeepSeek)
- AI Vocabulary (DeepSeek)
- Flashcard reviews (Database)
- Progress tracking (Database)

## For Production (Vercel):
Add these environment variables in Vercel dashboard:
- DEEPSEEK_API_KEY
- OPENROUTER_API_KEY  
- DEEPSEEK_MODEL

Your app is ready to use! 🎉


