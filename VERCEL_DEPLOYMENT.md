# Deploy to Vercel using CLI

## Quick Deploy

### Option 1: Interactive Deployment (Recommended)

```bash
cd /Users/amirfooladi/learningapp
./deploy-vercel-cli.sh
```

This will:
1. Install Vercel CLI if needed
2. Build your app
3. Deploy to Vercel (will prompt for login/linking)

### Option 2: Manual Deployment

```bash
cd /Users/amirfooladi/learningapp

# Install Vercel CLI (if not installed)
npm install -g vercel

# Login to Vercel (first time only)
vercel login

# Deploy to production
vercel --prod
```

## First Time Setup

If this is your first time deploying:

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```
   This will open a browser for authentication.

3. **Link to existing project or create new:**
   ```bash
   vercel link
   ```
   - If you have an existing Vercel project, enter the project name
   - If creating new, follow the prompts

4. **Deploy:**
   ```bash
   vercel --prod
   ```

## Deployment Commands

### Deploy to Production
```bash
vercel --prod
```

### Deploy to Preview
```bash
vercel
```

### Deploy with specific environment
```bash
vercel --prod --env NEXT_PUBLIC_APP_URL=https://your-vercel-url.vercel.app
```

## Environment Variables

Make sure your environment variables are set in Vercel:

1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add all your variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `OPENROUTER_API_KEY`
   - `DEEPSEEK_MODEL`
   - `SPOTIFY_CLIENT_ID`
   - `SPOTIFY_CLIENT_SECRET`
   - `SPOTIFY_REDIRECT_URI`
   - `GENIUS_ACCESS_TOKEN`

## Troubleshooting

### Vercel CLI not found
```bash
npm install -g vercel
```

### Not logged in
```bash
vercel login
```

### Project not linked
```bash
vercel link
```

### Build fails
Check build logs:
```bash
vercel logs
```

### Environment variables missing
Set them in Vercel Dashboard or via CLI:
```bash
vercel env add VARIABLE_NAME
```

## Quick Reference

```bash
# Install CLI
npm install -g vercel

# Login
vercel login

# Link project
vercel link

# Deploy to production
vercel --prod

# View deployments
vercel ls

# View logs
vercel logs

# Remove deployment
vercel remove
```

## After Deployment

Your app will be available at:
- Production: `https://your-project.vercel.app`
- Or your custom domain if configured

## Notes

- Vercel automatically detects Next.js
- Builds are done on Vercel's servers
- Environment variables need to be set in Vercel Dashboard
- Custom domains can be added in Vercel Dashboard





