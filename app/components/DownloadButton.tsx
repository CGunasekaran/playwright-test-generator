"use client";

import JSZip from "jszip";
import { saveAs } from "file-saver";

interface DownloadButtonProps {
  code: {
    pomFile: string;
    testFile: string;
    fixturesFile: string;
    constantsFile: string;
    typesFile: string;
    basePageFile: string;
  };
  pageName: string;
}

export default function DownloadButton({
  code,
  pageName,
}: DownloadButtonProps) {
  const downloadAsZip = async () => {
    const zip = new JSZip();

    const testFolder = zip.folder("tests");
    const pomFolder = zip.folder("pageObjects");
    const fixturesFolder = zip.folder("fixtures");
    const typesFolder = zip.folder("types");
    const constantsFolder = zip.folder("constants");

    testFolder?.file(`${pageName}.spec.ts`, code.testFile);
    pomFolder?.file(`${pageName}Page.ts`, code.pomFile);
    pomFolder?.file("BasePage.ts", code.basePageFile);
    fixturesFolder?.file("fixtures.ts", code.fixturesFile);
    typesFolder?.file("index.ts", code.typesFile);
    constantsFolder?.file("index.ts", code.constantsFile);

    // Add README
    const readme = `# Playwright Test Files for ${pageName}

## Generated Files

- \`tests/${pageName}.spec.ts\` - Snapshot test file
- \`pageObjects/${pageName}Page.ts\` - Page Object Model
- \`pageObjects/BasePage.ts\` - Base page class
- \`fixtures/fixtures.ts\` - Test fixtures
- \`types/index.ts\` - TypeScript types
- \`constants/index.ts\` - Test constants

## Installation

1. Install dependencies:
\`\`\`bash
npm install @playwright/test
\`\`\`

2. Run tests:
\`\`\`bash
npx playwright test
\`\`\`

3. Update snapshots:
\`\`\`bash
npx playwright test --update-snapshots
\`\`\`

## Notes

- Review and adjust selectors as needed
- Update mask elements based on dynamic content
- Add custom test scenarios for your specific use cases
`;

    zip.file("README.md", readme);

    // Add playwright config
    const playwrightConfig = `import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
`;

    zip.file("playwright.config.ts", playwrightConfig);

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `${pageName}-playwright-tests.zip`);
  };

  return (
    <button
      onClick={downloadAsZip}
      className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center gap-3"
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      📦 Download All Files
    </button>
  );
}
