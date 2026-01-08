# Playwright Test Generator ✨

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Playwright](https://img.shields.io/badge/Playwright-1.57-green?style=for-the-badge&logo=playwright)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)

An intelligent, AI-powered tool for generating comprehensive test suites with Page Object Models, supporting multiple testing frameworks with a beautiful modern UI.

[Demo](https://test-generator.vercel.app) • [Report Bug](https://github.com/CGunasekaran/Test-Generator/issues) • [Request Feature](https://github.com/CGunasekaran/Test-Generator/issues)

</div>

---

## 🎯 Features

### Core Functionality
- 🎭 **Automated Test Generation** - Analyze any webpage and generate complete test suites
- 📦 **Page Object Models** - Automatic POM generation following best practices
- 🔄 **Multi-Framework Support** - Export tests for Playwright, Cypress, Puppeteer, or Selenium
- 🌓 **Dark Mode** - Beautiful gradient UI with dark mode support

### Test Templates (9 Types)
1. **Snapshot Tests** - Basic page object model and snapshot tests
2. **E2E Tests** - End-to-end user flow tests with interactions
3. **Component Tests** - Individual component testing
4. **Accessibility Tests** - WCAG 2.0 AA compliance checking with Axe
5. **Performance Tests** - Core Web Vitals and load time monitoring
6. **API Tests** - API endpoint validation and response testing
7. **Cross-Browser Tests** - Chrome, Firefox, Safari compatibility
8. **Mobile Tests** - iPhone, iPad device emulation and responsive testing
9. **Visual Regression** - Screenshot comparison with configurable thresholds

### Export Formats
- **Playwright** (TypeScript/JavaScript)
- **Cypress** (TypeScript/JavaScript)
- **Puppeteer** (TypeScript/JavaScript)
- **Selenium** (TypeScript/JavaScript)

### Advanced Features
- 🔍 **Interaction Detection** - Automatically detect user flows and common patterns
- 🌐 **API Mock Generation** - Capture and mock API calls with MSW & Playwright
- 🎨 **Visual Regression** - Percy, Applitools, Chromatic, BackstopJS support
- 📊 **Element Analysis** - Comprehensive DOM structure analysis
- 🚀 **Anti-Detection** - Bypass bot protection with realistic browser profiles
- ⚡ **Smart Selectors** - CSS selector safety with special character escaping
- 💾 **Download Tests** - Export as ZIP with complete folder structure

### User Experience
- ✨ **Modern Gradient UI** - Indigo/Purple/Pink gradient theme
- 🎯 **Modal Dialogs** - Beautiful Tailwind CSS modals (no JavaScript alerts)
- 📜 **Auto-Scroll** - Automatically scroll to generated code
- ⏱️ **Loading States** - Minimum 1-second loader for better UX
- 🎨 **Monaco Editor** - Syntax-highlighted code viewing
- 📱 **Responsive Design** - Works perfectly on all screen sizes

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/CGunasekaran/Test-Generator.git
cd Test-Generator
```

2. **Install dependencies**
```bash
npm install
```

3. **Install Playwright browsers** (Required ⚠️)
```bash
npx playwright install chromium
```
> This downloads the Chromium browser (~160MB) needed for page analysis.

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage Guide

### Basic Workflow

1. **Enter URL** - Input the website URL you want to test
2. **Analyze Page** - Click "✨ Analyze Page" to extract page structure
3. **Select Templates** - Choose which test types to generate:
   - Check/uncheck any combination of the 9 test templates
   - At least one template must be selected
4. **Choose Format** - Select your testing framework and language
5. **Generate Tests** - Click "Generate Tests" button
   - Code generates with animated loader (minimum 1 second)
   - Page auto-scrolls to show generated code
6. **View & Download** - Review code in Monaco Editor, download as ZIP

### Advanced Options

#### Visual Regression Testing
- Enable visual regression checkbox
- Configure provider (Percy, Applitools, Chromatic, Playwright, BackstopJS)
- Set threshold (0.0 - 1.0)
- Specify project name

#### API Mocking
- Enable API mocks checkbox
- Generates MSW handlers and Playwright route mocking
- Automatically captures detected API calls

#### Interaction Detection
- Click "Detect Interactions" to find common user flows:
  - Login/Authentication flows
  - Search functionality
  - Form submissions
  - Navigation patterns
  - Shopping cart flows
  - Filter/Sort interactions
  - Modals, accordions, tabs
  - Infinite scroll patterns

## 🏗️ Project Structure

```
playwright-test-generator/
├── app/
│   ├── components/              # React components
│   │   ├── URLInput.tsx        # URL input with validation
│   │   ├── TestTemplateSelector.tsx  # Template checkboxes
│   │   ├── ExportFormatSelector.tsx  # Framework selection
│   │   ├── CodeViewer.tsx      # Monaco Editor wrapper
│   │   ├── DownloadButton.tsx  # ZIP export functionality
│   │   ├── ElementTree.tsx     # DOM structure viewer
│   │   ├── InteractionRecorder.tsx   # User flow detection
│   │   ├── VisualRegressionSettings.tsx
│   │   ├── Modal.tsx           # Custom modal dialogs
│   │   ├── Header.tsx          # App header
│   │   └── Footer.tsx          # App footer with portfolio link
│   ├── api/                    # API routes
│   │   ├── analyze/            # Page analysis endpoint
│   │   ├── generate-code/      # Test generation endpoint
│   │   ├── detect-interactions/ # User flow detection
│   │   ├── extract-api-calls/  # API call extraction
│   │   └── record-interactions/ # Interaction recording
│   ├── page.tsx                # Main application page
│   ├── layout.tsx              # Root layout with metadata
│   └── globals.css             # Global styles with gradients
├── lib/                        # Core libraries
│   ├── page-analyzer.ts        # Page analysis & DOM parsing
│   ├── test-generator.ts       # Test code generation
│   ├── pom-generator.ts        # Page Object Model generator
│   ├── code-formatter.ts       # Code formatting utilities
│   ├── interaction-detector.ts # User flow detection logic
│   ├── interaction-analyzer.ts # Flow analysis
│   ├── api-mock-generator.ts  # API mocking code generation
│   ├── visual-regression-generator.ts
│   ├── exporters/              # Framework-specific exporters
│   │   ├── playwright-exporter.ts  # Playwright format
│   │   ├── cypress-exporter.ts     # Cypress format
│   │   ├── puppeteer-exporter.ts   # Puppeteer format
│   │   └── selenium-exporter.ts    # Selenium format
│   └── template-generators/    # Test template generators
│       ├── e2e-generator.ts
│       ├── accessibility-generator.ts
│       └── performance-generator.ts
├── types/
│   └── index.ts                # TypeScript definitions
├── playwright-tests/           # Example test structure
└── public/                     # Static assets
```

## 🛠️ Technologies

- **[Next.js 16](https://nextjs.org/)** - React framework with App Router & Turbopack
- **[TypeScript 5](https://www.typescriptlang.org/)** - Type safety and better DX
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Utility-first CSS with custom gradients
- **[Playwright 1.57](https://playwright.dev/)** - Browser automation and testing
- **[Monaco Editor](https://microsoft.github.io/monaco-editor/)** - VS Code's code editor
- **[JSZip](https://stuk.github.io/jszip/)** - Client-side ZIP file generation

## 🎨 UI/UX Features

### Design System
- **Color Palette**: Gradient theme (indigo → purple → pink)
- **Typography**: Modern sans-serif with bold headings
- **Components**: Rounded corners, shadows, smooth transitions
- **Icons**: Emoji-based framework icons (🎭 Playwright, 🌲 Cypress, etc.)

### Interactive Elements
- Hover effects with scale transforms
- Gradient buttons with shadow effects
- Smooth scroll behavior
- Loading spinners with animations
- Modal dialogs with backdrop blur
- Syntax highlighting in code viewer

## 🔧 Configuration

### Environment Variables (Optional)

Create a `.env.local` file:

```env
# Base URL for generated tests
BASE_URL=http://localhost:3000

# API keys for visual regression (optional)
PERCY_TOKEN=your_percy_token
APPLITOOLS_API_KEY=your_applitools_key
CHROMATIC_PROJECT_TOKEN=your_chromatic_token
```

### Next.js Configuration

The `next.config.js` includes:
- Turbopack for fast builds
- Max request body size: 10MB
- API timeouts: 60 seconds

## 🐛 Troubleshooting

### Common Issues

**1. "Playwright browsers not installed" error**
```bash
npx playwright install chromium
```

**2. "Failed to analyze page" error**
- Check if the URL is accessible
- Some sites block automated browsers (anti-bot protection)
- Try a different website
- Check console for detailed error messages

**3. Build errors**
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run build
```

**4. Empty/undefined generated code**
- Ensure at least one test template is selected
- Check browser console for API errors
- Verify Playwright browsers are installed

**5. CSS selector issues**
- Special characters are automatically escaped
- Invalid Tailwind classes are filtered
- XPath generation has null safety checks

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for more details.

## 📚 Additional Documentation

- [QUICKSTART.md](QUICKSTART.md) - Fast setup guide
- [THEME_UPDATE.md](THEME_UPDATE.md) - UI design details
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common issues and solutions

## 🚀 Deployment

### Deploy to Vercel (Recommended)

**⚠️ Important: Vercel serverless functions cannot run Playwright browsers directly.**

For production deployment on Vercel, you need to use a remote browser service like Browserless.io.

See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) for detailed instructions.

**Quick Setup:**
1. Sign up for [Browserless.io](https://www.browserless.io/) (free tier available)
2. Add environment variable in Vercel:
   ```
   BROWSERLESS_WS_ENDPOINT=wss://chrome.browserless.io?token=YOUR_TOKEN
   ```
3. Deploy to Vercel:
   ```bash
   npm i -g vercel
   vercel --prod
   ```

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/CGunasekaran/playwright-test-generator)

### Alternative Platforms with Native Playwright Support
- **Railway**: Docker-based, runs Playwright natively
- **Render**: Good for Node.js apps with Playwright
- **Fly.io**: Docker-based deployment
- **AWS Lambda**: With custom layers for Playwright
- **Digital Ocean App Platform**: Container-based deployment

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Gunasekaran**
- Portfolio: [https://gunasekaran-portfolio.vercel.app/](https://gunasekaran-portfolio.vercel.app/)
- GitHub: [@CGunasekaran](https://github.com/CGunasekaran)

## 🌟 Show Your Support

Give a ⭐️ if this project helped you!

## 📸 Screenshots

### Main Interface
![Main Interface](docs/screenshots/main-interface.png)

### Test Generation
![Test Generation](docs/screenshots/test-generation.png)

### Code Viewer
![Code Viewer](docs/screenshots/code-viewer.png)

---

<div align="center">

**Built with ❤️ using Next.js, TypeScript, and Playwright**

[Report Bug](https://github.com/CGunasekaran/Test-Generator/issues) • [Request Feature](https://github.com/CGunasekaran/Test-Generator/issues)

</div>
