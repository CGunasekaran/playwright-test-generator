# Vercel Deployment Guide

This guide explains how to deploy the Playwright Test Generator to Vercel using a remote browser service.

## Why Remote Browser?

Vercel serverless functions have limitations:
- 50MB deployment size limit (Playwright browsers are ~400MB)
- 2048MB memory limit on Hobby plan
- Limited execution time

To work around this, we use a remote browser service like Browserless.io.

## Setup Instructions

### 1. Create a Browserless.io Account

1. Go to [Browserless.io](https://www.browserless.io/)
2. Sign up for a free account (includes 5 hours/month free)
3. Copy your API token from the dashboard

### 2. Configure Vercel Environment Variables

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add the following variable:
   ```
   BROWSERLESS_WS_ENDPOINT=wss://chrome.browserless.io?token=YOUR_API_TOKEN_HERE
   ```
4. Make sure to apply it to all environments (Production, Preview, Development)

### 3. Deploy to Vercel

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Deploy
vercel

# Or for production
vercel --prod
```

### 4. Verify Deployment

1. Visit your deployed URL
2. Try analyzing a webpage
3. Check Vercel function logs if you encounter issues

## Alternative Remote Browser Services

### Playwright Browser Service (Official)
```
BROWSERLESS_WS_ENDPOINT=wss://playwright.chromium.io/...
```

### BrowserStack
```
BROWSERLESS_WS_ENDPOINT=wss://YOUR_USERNAME:YOUR_ACCESS_KEY@hub-cloud.browserstack.com/playwright
```

### Self-Hosted Browserless
If you need more control, you can self-host Browserless on:
- Railway
- Render
- Digital Ocean
- AWS/GCP/Azure

## Local Development

For local development, leave the `BROWSERLESS_WS_ENDPOINT` empty. The app will automatically use local Playwright browsers.

```bash
# Install browsers locally
npx playwright install chromium

# Run development server
npm run dev
```

## Cost Considerations

**Browserless.io Pricing:**
- Free: 5 hours/month
- Hobby: $29/month (20 hours)
- Professional: $99/month (100 hours)

**Vercel Pricing:**
- Hobby: Free (includes function execution)
- Pro: $20/month (increased limits)

## Troubleshooting

### "Failed to connect to browser"
- Verify your `BROWSERLESS_WS_ENDPOINT` is correct
- Check if your Browserless.io account has available hours
- Ensure the environment variable is set in Vercel

### "Function timeout"
- Increase `maxDuration` in API routes (max 60s on Hobby)
- Optimize page analysis to reduce execution time
- Consider upgrading to Vercel Pro for longer timeouts

### "Memory limit exceeded"
- Ensure `memory` is set to 2048 or less in vercel.json
- Close browser contexts properly after use
- Consider analyzing fewer elements per request

## Alternative Deployment Platforms

If Vercel's limitations are too restrictive, consider:

1. **Railway** - Supports Docker, can run Playwright natively
2. **Render** - Good for Node.js apps with Playwright
3. **Fly.io** - Docker-based, works well with Playwright
4. **AWS Lambda with Layers** - More complex but fully featured

Each platform has tradeoffs between ease of use, cost, and capabilities.
