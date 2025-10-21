# LinguaNews - Language Learning with Live News

A comprehensive language learning application that helps you learn new languages by reading live news articles with AI-powered translations, vocabulary extraction, flashcards with spaced repetition, and text-to-speech pronunciation.

## ✨ Features

### Free Features
- 📰 **Live News Articles** - Browse real-time news from various categories
- 👤 **User Accounts** - Sign up with Email or Google
- 📱 **Responsive Design** - Works beautifully on desktop, tablet, and mobile

### Premium Features (€1/month)
- 🌍 **Multi-Language Translation** - Translate to 9 languages (Italian, French, German, Spanish, Portuguese, Russian, Japanese, Chinese, Korean)
- 🎵 **Learn from Song Lyrics** - Connect Spotify, get lyrics & vocabulary from your favorite songs!
- 📚 **Smart Vocabulary Extraction** - AI automatically extracts important vocabulary with context
- 🗂️ **Flashcard System** - Review vocabulary with spaced repetition algorithm
- 📊 **Progress Tracking** - Monitor your learning progress with detailed statistics
- 🔊 **Text-to-Speech** - Practice pronunciation with built-in audio playback

## 🚀 Getting Started

### Prerequisites

**No API keys required!** This app uses completely free APIs:
- **The Guardian API** - For fetching live news articles (no key needed for development)
- **MyMemory Translation API** - For translations (completely free, no key required)
- **LibreTranslate** - Fallback translation service (free)
- **Lyrics APIs** - Multiple free lyrics services (lyrics.ovh, lrclib.net, ChartLyrics)
- **Spotify API** - For currently playing track (free with Spotify account)

### Installation

1. **Clone the repository or navigate to your project folder:**
   ```bash
   cd learningapp
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser and navigate to:**
   ```
   http://localhost:3000
   ```

That's it! The app works immediately without any API key configuration.

### Optional: Enhanced API Keys (for higher rate limits)

If you want to use the app more heavily, you can optionally add these free API keys:

1. **The Guardian API Key** (optional):
   - Get a free key from [The Guardian Open Platform](https://open-platform.theguardian.com/access/)
   - Add to `.env.local`: `GUARDIAN_API_KEY=your_key`
   - Increases rate limits for news fetching

2. **GNews API Key** (optional fallback):
   - Get a free key from [GNews.io](https://gnews.io/)
   - Add to `.env.local`: `GNEWS_API_KEY=your_key`
   - Provides 100 requests/day for news

3. **Spotify Client ID** (for Lyrics feature):
   - Get free Client ID from [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Add to `.env.local`: `NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_client_id`
   - See `SPOTIFY_SETUP.md` for detailed instructions
   - Enables "Learn from Lyrics" feature

## 📖 How to Use

### 1. Reading News Articles
- Select your target language from the dropdown
- Choose a news category (General, Technology, Business, etc.)
- Browse through live news articles
- Click "Learn from Article" to start learning

### 2. Learning from Song Lyrics 🎵 NEW!
- Click "Lyrics" in the navigation menu
- Connect your Spotify account (one-time setup)
- Play any song on Spotify (phone, computer, or web)
- Click "Refresh Currently Playing" to see what's playing
- Click "Get Lyrics" to fetch the song lyrics
- Translate lyrics to your target language
- Extract vocabulary from the song
- Save words to flashcards!

### 3. Translating and Learning
- Click "Translate Article" to see the translation in your target language
- Use "Read Aloud" to hear the pronunciation
- Click "Extract Vocabulary" to get AI-selected vocabulary words
- Save individual words or save all vocabulary to your flashcard deck

### 4. Reviewing Flashcards
- Go to the Flashcards page
- See your vocabulary statistics (Total, Mastered, Due for Review)
- Click "Start Review" to practice with flashcards
- Mark each word as correct or wrong
- The spaced repetition algorithm will schedule reviews automatically

### 5. Tracking Progress
- Visit the Progress page to see your learning statistics
- View vocabulary mastery percentage
- Check your study streak
- See progress across all languages you're learning

### 6. Managing Settings
- Go to Settings to change your default language
- Export your data as a backup (JSON format)
- View your data statistics
- Clear all data if needed

## 🛠️ Technology Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn UI + Radix UI
- **Authentication:** Firebase Authentication (Email/Password + Google Sign-In)
- **Database:** Cloud Firestore
- **Payments:** Stripe (via Firebase Stripe Extension)
- **Translation:** MyMemory API (free) + LibreTranslate (fallback)
- **News API:** The Guardian API (free) + GNews (fallback)
- **Lyrics APIs:** lyrics.ovh, lrclib.net, ChartLyrics (all free)
- **Music Integration:** Spotify Web API + OAuth 2.0
- **Vocabulary Extraction:** Custom NLP algorithm
- **Text-to-Speech:** Web Speech API
- **Deployment:** Vercel (Production)

## 📚 Learning Features

### Spaced Repetition Algorithm
The app uses a proven spaced repetition system for flashcard reviews:
- First review: 1 day later
- Second review: 3 days later
- Third review: 7 days later
- Fourth review: 14 days later
- Fifth review: 30 days later
- After 5 correct reviews, a word is marked as "Mastered"

### Progress Tracking
- Total vocabulary words learned
- Mastery percentage
- Articles read
- Study streak (consecutive days)
- Weekly activity statistics
- Per-language progress overview

## 🔐 Privacy & Data

Your data is securely stored in Cloud Firestore with industry-standard encryption:
- User profiles and authentication
- Subscription status
- Language preferences

**External services used:**
- Firebase Authentication - Secure user authentication
- Cloud Firestore - User data storage
- Stripe - Payment processing (PCI-compliant)
- Spotify API - Music integration (with your permission)
- News APIs - Fetching live articles
- Translation APIs - Text translation

## 📝 Free APIs Used

### The Guardian API
- **Completely free** for content access
- No rate limits for reasonable usage
- High-quality news articles from The Guardian
- Optional API key for production use

### MyMemory Translation API
- **Completely free** - no API key required
- 10,000 words/day limit (more than enough for personal use)
- Supports all major languages
- Automatic fallback to LibreTranslate if needed

### LibreTranslate
- **Free and open-source** translation service
- Used as fallback for MyMemory
- Self-hostable if needed

### GNews API (Optional Fallback)
- Free tier: 100 requests/day
- Used as backup news source
- Optional - app works fine without it

## 💰 Pricing

**Free Tier:**
- Browse all news articles
- Create a free account
- Access all categories

**Premium - €1/month:**
- Unlimited translations to 9 languages
- AI-powered vocabulary extraction
- Flashcard system with spaced repetition
- Learn from Spotify song lyrics
- Progress tracking
- Text-to-speech pronunciation
- Priority support

**Why so affordable?**
- We use free APIs where possible
- Efficient Firebase Firestore usage
- Vercel hosting with optimized builds
- Our goal is to make language learning accessible to everyone!

## 🤝 Contributing

Feel free to submit issues or pull requests if you find bugs or want to add features!

## 📄 License

This project is open source and available for personal and educational use.

## 🙏 Acknowledgments

- Built with Next.js and React
- UI components from Shadcn UI
- Icons from Lucide React
- News from The Guardian Open Platform
- Translations from MyMemory API and LibreTranslate

---

**Happy Learning! 🎉**

Start your language learning journey today by reading real news articles and building your vocabulary naturally!

