# News Sources Guide

Your app now aggregates news from **6 different sources** for maximum variety!

## Active Sources (No API Keys Needed)

### 1. The Guardian 🇬🇧
- **Articles:** 50 per request
- **API Key:** Uses 'test' key (always works)
- **Content:** Full articles with images
- **Coverage:** UK & International news

### 2. BBC News 🇬🇧
- **Articles:** 20 per request
- **API Key:** Not required (RSS feed)
- **Content:** Full descriptions with images
- **Coverage:** UK & World news

### 3. Al Jazeera 🇶🇦
- **Articles:** 15 per request
- **API Key:** Not required (RSS feed)
- **Content:** Full articles with images
- **Coverage:** Middle East & International focus

### 4. Reuters 🌍
- **Articles:** 15 per request
- **API Key:** Not required (RSS feed)
- **Content:** Breaking news with images
- **Coverage:** Global wire service

**Total without API keys: ~100 articles**

---

## Optional Sources (Add API Keys for More)

### 5. NewsData.io
- **Articles:** 10 per request
- **Free Tier:** 200 requests/day
- **Setup:** Get free API key at https://newsdata.io
- **Add to Vercel:** Environment variable `NEWSDATA_API_KEY`

### 6. New York Times 🇺🇸
- **Articles:** 15 per request
- **Free Tier:** 1,000 requests/day
- **Setup:** Get free API key at https://developer.nytimes.com
- **Add to Vercel:** Environment variable `NYT_API_KEY`

**Total with API keys: ~125 articles**

---

## How to Add Optional API Keys

1. **Get API Keys:**
   - NewsData.io: https://newsdata.io/register
   - NYT: https://developer.nytimes.com/get-started

2. **Add to Vercel:**
   - Go to: https://vercel.com/amis-projects-6dcd4b7c/learningapp/settings/environment-variables
   - Add new variables:
     - `NEWSDATA_API_KEY` = your-newsdata-key
     - `NYT_API_KEY` = your-nyt-key
   - Redeploy

3. **Done!** Your app will automatically fetch from these sources too.

---

## Benefits

✅ **Diverse Perspectives:** News from US, UK, Middle East, and global sources  
✅ **More Content:** Up to 125 articles per category  
✅ **Better Quality:** All sources provide images and full text  
✅ **Fast Loading:** All sources fetched in parallel  
✅ **No Cost:** Works great with just the free sources (100 articles)

---

## Current Status

Your app is **live** with 4 free sources providing ~100 articles:
- The Guardian (50)
- BBC (20)
- Al Jazeera (15)
- Reuters (15)

Add the optional API keys whenever you want even more content! 🚀

