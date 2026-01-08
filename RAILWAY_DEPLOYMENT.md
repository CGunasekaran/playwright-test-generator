# Railway Deployment Guide

This guide explains how to deploy the Playwright Test Generator to Railway.

## Why Railway?

- ✅ **Native Playwright Support** - No external browser service needed
- ✅ **Docker-based** - Full control over the environment
- ✅ **Free Tier** - $5/month credit (enough for small projects)
- ✅ **Auto-deploys** - From GitHub, just like Vercel
- ✅ **Easy Setup** - Similar to Vercel's simplicity

## Deployment Steps

### 1. Sign up for Railway

1. Go to [Railway.app](https://railway.app/)
2. Click "Login" and sign in with GitHub
3. Authorize Railway to access your repositories

### 2. Create New Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your `playwright-test-generator` repository
4. Railway will automatically detect the Dockerfile

### 3. Configure (Optional)

Railway will automatically:
- Use the Dockerfile to build your app
- Install Playwright browsers
- Expose port 3000
- Generate a public URL

**No environment variables needed!** Everything runs locally in the container.

### 4. Deploy

1. Railway starts building automatically
2. Wait 2-3 minutes for the build to complete
3. Click on the deployment to get your public URL
4. Visit your app and test it!

## Project Structure for Railway

```
playwright-test-generator/
├── Dockerfile              # Railway build configuration
├── railway.json           # Railway deployment settings
├── package.json
└── ... (rest of your app)
```

## Local Development vs Railway

### Local Development
```bash
npm install
npx playwright install chromium
npm run dev
```

### Railway Deployment
- Uses Docker with Playwright pre-installed
- Automatically installs all dependencies
- No manual browser installation needed
- Runs in production mode

## Monitoring & Logs

1. Go to your Railway dashboard
2. Click on your project
3. View real-time logs in the "Deployments" tab
4. Monitor resource usage in the "Metrics" tab

## Cost

**Free Tier:**
- $5/month in credits
- 500 hours of usage
- Good for small projects and demos

**Pro Plan ($20/month):**
- $20 in credits included
- Pay only for what you use
- Better performance and priority support

## Troubleshooting

### Build Fails
- Check the build logs in Railway dashboard
- Ensure package.json has all dependencies
- Verify Dockerfile syntax

### App Crashes
- Check runtime logs
- Ensure port 3000 is exposed
- Verify Next.js build is successful

### Slow Performance
- Railway free tier has limited resources
- Consider upgrading to Pro for better performance
- Optimize your code for faster execution

## Updating Your App

Railway automatically redeploys when you push to GitHub:

```bash
git add .
git commit -m "Update app"
git push origin main
```

Railway detects the push and redeploys automatically!

## Alternative: Manual Deploy with Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Deploy
railway up
```

## Comparison: Railway vs Vercel

| Feature | Railway | Vercel (with Browserless) |
|---------|---------|---------------------------|
| Playwright Support | ✅ Native | ⚠️ Needs external service |
| Setup Complexity | Easy | Complex |
| Cost (Free Tier) | $5/month credit | Limited + Browserless costs |
| Auto-deploy | ✅ Yes | ✅ Yes |
| Docker Support | ✅ Yes | ❌ No |
| Best For | Full-stack apps | Static/serverless apps |

## Migrating from Vercel to Railway

1. Already have the code on GitHub ✅
2. Connect Railway to your repo ✅
3. Railway auto-deploys ✅
4. No code changes needed! ✅

That's it! Your app works the same way, but with native Playwright support.
