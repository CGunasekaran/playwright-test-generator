# Troubleshooting Guide

## Common Issues and Solutions

### 1. "Failed to analyze page" Error

**Cause**: Playwright browsers are not installed.

**Solution**:
```bash
npx playwright install chromium
```

Or use the automated setup:
```bash
npm run setup
```

**Details**: The application requires Playwright's Chromium browser (~160MB) to analyze web pages. This is a one-time installation.

---

### 2. "Executable doesn't exist" Error

**Full error**: 
```
browserType.launch: Executable doesn't exist at /Users/.../ms-playwright/chromium...
```

**Cause**: Same as above - Playwright browsers need to be installed.

**Solution**:
```bash
npx playwright install chromium
```

---

### 3. Build or TypeScript Errors

**Cause**: Missing dependencies or outdated packages.

**Solution**:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

---

### 4. Dev Server Won't Start

**Cause**: Port 3000 might be in use.

**Solution**:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

---

### 5. API Route Timeout

**Cause**: Large/complex websites take longer to analyze.

**Solution**: This is expected. The API has a 60-second timeout. For very large sites, you may need to:
- Wait longer
- Try a simpler page first
- Check your internet connection

---

### 6. Module Not Found Errors

**Cause**: Missing dependencies.

**Solution**:
```bash
npm install
```

**For specific modules**:
```bash
npm install playwright @playwright/test
npm install monaco-editor @monaco-editor/react
npm install jszip file-saver
npm install -D @types/file-saver
```

---

### 7. Dark Mode Not Working

**Cause**: System preferences or browser settings.

**Solution**: The app uses system dark mode preferences. Change your OS theme to see the difference.

---

### 8. Generated Code Has Errors

**Cause**: Page structure varies, generated selectors might need adjustment.

**Solution**: 
- Review generated selectors
- Use test IDs on your website
- Manually adjust selectors as needed
- The generated code is a starting point

---

### 9. Download Button Not Working

**Cause**: Browser popup blocker or JavaScript issues.

**Solution**:
- Allow popups for localhost
- Check browser console for errors
- Try a different browser

---

### 10. Monaco Editor Not Loading

**Cause**: Missing monaco-editor package or bundle issues.

**Solution**:
```bash
npm install monaco-editor @monaco-editor/react
```

Then rebuild:
```bash
npm run build
```

---

## Still Having Issues?

1. **Check the logs**: Look at the terminal/console for detailed error messages
2. **Clear cache**: 
   ```bash
   rm -rf .next
   npm run build
   ```
3. **Update dependencies**:
   ```bash
   npm update
   ```
4. **Check Node version**: Requires Node.js 18+
   ```bash
   node --version
   ```

## Getting Help

- Check the [README.md](./README.md) for setup instructions
- Review the error message carefully - it often contains the solution
- Search for the error message in GitHub issues
- Create a new issue with:
  - Error message
  - Steps to reproduce
  - Your environment (OS, Node version, etc.)

## Quick Setup (Start Fresh)

```bash
# 1. Install dependencies
npm install

# 2. Install Playwright browsers
npx playwright install chromium

# 3. Start dev server
npm run dev

# Or use the setup script
./setup.sh
```

---

**Created by**: [Gunasekaran](https://gunasekaran-portfolio.vercel.app/)
