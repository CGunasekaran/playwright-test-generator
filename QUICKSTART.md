# Quick Start Guide

Get up and running with Playwright Test Generator in 5 minutes!

## 🚀 Installation (5 minutes)

### Step 1: Install Dependencies (2 min)
```bash
npm install
```

### Step 2: Install Playwright Browsers (3 min)
```bash
npx playwright install chromium
```

**OR use the automated setup script:**
```bash
npm run setup
```

---

## 🎮 Running the Application

### Development Mode
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm start
```

---

## 📝 How to Use

### 1. Enter a URL
Type or paste any website URL into the input field:
```
https://example.com
```

### 2. Configure Options (Optional)

Before clicking "Generate Tests", you can configure:

- **Test Templates**: Choose which types of tests to generate
  - ✅ Snapshot Tests (recommended for first run)
  - E2E Tests
  - Component Tests
  - Accessibility Tests
  - Performance Tests
  - API Tests
  - Visual Regression
  - Cross-Browser Tests
  - Mobile Tests

- **Export Format**: Select your testing framework
  - Playwright (TypeScript/JavaScript)
  - Cypress (TypeScript/JavaScript)
  - Puppeteer (TypeScript/JavaScript)
  - Selenium (TypeScript/JavaScript)

- **Additional Options**:
  - ☐ Include API Mocks
  - ☐ Include Visual Regression

### 3. Generate Tests
Click the **"✨ Generate Tests"** button

The tool will:
1. Launch a headless browser
2. Navigate to your URL
3. Analyze page structure
4. Detect interactions
5. Capture API calls
6. Generate test code

**⏱️ This takes 10-30 seconds depending on page complexity**

### 4. Review Generated Code

You'll see multiple tabs:
- **Test File** - Main test specifications
- **Page Object** - Page Object Model class
- **Fixtures** - Test fixtures and helpers
- **Base Page** - Base page class
- **Types** - TypeScript type definitions
- **Constants** - Test constants

### 5. Download Tests

Click **"📦 Download All Files"** to get a ZIP file containing:
- All test files
- Page Object Models
- Configuration files
- README with instructions

---

## 🎯 Example Workflow

```bash
# 1. Start the app
npm run dev

# 2. Visit http://localhost:3000

# 3. Enter URL: https://github.com

# 4. Click "Generate Tests"

# 5. Wait for analysis (15-20 seconds)

# 6. Review generated code

# 7. Download ZIP file

# 8. Extract and integrate into your project
```

---

## 💡 Tips for Best Results

### ✅ DO:
- Start with simple, static pages
- Use pages with test IDs (`data-testid`)
- Review and customize generated selectors
- Use the code as a starting point

### ❌ DON'T:
- Test pages that require authentication (without mocking)
- Expect perfect selectors for complex SPAs
- Use generated code without reviewing it
- Test infinite scroll pages on first try

---

## 🔧 Customization

### Change Test Templates
Select/deselect templates based on your needs:
- First time? → Just use "Snapshot Tests"
- E2E testing? → Enable "E2E Tests" + "Component Tests"
- Accessibility? → Enable "Accessibility Tests"

### Visual Regression Settings
Click to expand and configure:
- Provider (Playwright, Percy, Applitools, etc.)
- Threshold (0-1, how much difference to allow)
- Baseline folder
- CI/CD integration

### API Mocking
Enable "Include API Mocks" to:
- Capture all API calls during analysis
- Generate mock response data
- Create request interceptors

---

## 📊 Understanding the Output

### File Structure
```
your-page-tests.zip
├── tests/
│   └── Page.spec.ts          # Main test file
├── pageObjects/
│   ├── PagePage.ts            # Page Object Model
│   └── BasePage.ts            # Base page class
├── fixtures/
│   └── fixtures.ts            # Test fixtures
├── types/
│   └── index.ts               # Type definitions
├── constants/
│   └── index.ts               # Constants
├── playwright.config.ts        # Playwright config
└── README.md                   # Setup instructions
```

### Integrating into Your Project

1. Extract the ZIP file
2. Copy files to your test directory
3. Install dependencies (if needed)
4. Update the base URL in config
5. Run tests:
   ```bash
   npx playwright test
   ```

---

## 🐛 Troubleshooting

**Error: "Failed to analyze page"**
```bash
npx playwright install chromium
```

**Page analysis stuck?**
- Check your internet connection
- Try a simpler page first
- Check the console for errors

**Generated code has errors?**
- Review selectors
- Add test IDs to your page
- Manually adjust as needed

For more help, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

## 🎓 Next Steps

1. ✅ Generate your first test
2. 📖 Read [Playwright docs](https://playwright.dev)
3. 🎨 Customize the generated code
4. 🧪 Add more test scenarios
5. 🚀 Integrate into CI/CD

---

## 📚 Resources

- [Full README](./README.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Best Practices](https://playwright.dev/docs/best-practices)

---

**Ready to generate tests? Let's go! 🎭**

Created by [Gunasekaran](https://gunasekaran-portfolio.vercel.app/)
