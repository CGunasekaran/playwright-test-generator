# Playwright Test Generator

An AI-powered tool for generating comprehensive Playwright tests with Page Object Models, visual regression testing, and multi-framework support.

## Features

- 🎭 **Automated Test Generation** - Generate Playwright tests from any URL
- 📦 **Page Object Models** - Automatic POM generation with best practices
- 🎨 **Visual Regression** - Screenshot comparison and visual testing
- 🔌 **Multi-Framework Support** - Export to Playwright, Cypress, Puppeteer, or Selenium
- 🌐 **API Mock Generation** - Capture and mock API calls
- 🔍 **Interaction Detection** - Automatically detect user flows
- 📊 **Accessibility Tests** - WCAG compliance checking
- ⚡ **Performance Tests** - Core Web Vitals monitoring

## Prerequisites

- Node.js 18+ 
- npm or yarn

## Installation

1. Clone the repository or navigate to the project directory

2. Install dependencies:
```bash
npm install
```

3. **Important:** Install Playwright browsers:
```bash
npx playwright install chromium
```

This step is required for the page analysis to work. The chromium browser (~160MB) will be downloaded.

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Usage

1. Enter a website URL in the input field
2. Click "Generate Tests" to analyze the page
3. Configure your test preferences:
   - Select test templates (snapshot, e2e, accessibility, etc.)
   - Choose export format (Playwright, Cypress, etc.)
   - Configure visual regression settings
4. View and download the generated test files

## Project Structure

```
playwright-test-generator/
├── app/
│   ├── components/        # React components
│   ├── api/              # API routes for analysis & generation
│   └── page.tsx          # Main application page
├── lib/
│   ├── page-analyzer.ts  # Page analysis logic
│   ├── test-generator.ts # Test code generation
│   └── exporters/        # Framework-specific exporters
└── types/
    └── index.ts          # TypeScript type definitions
```

## Troubleshooting

### "Playwright browsers not installed" error

If you see this error, run:
```bash
npx playwright install chromium
```

### Build errors

Make sure all dependencies are installed:
```bash
npm install
```

## Technologies

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **Playwright** - Browser automation
- **Monaco Editor** - Code viewer

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Playwright Documentation](https://playwright.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Created By

[Gunasekaran](https://gunasekaran-portfolio.vercel.app/)

## License

MIT
