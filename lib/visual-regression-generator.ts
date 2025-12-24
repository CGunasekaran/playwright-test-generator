import { VisualRegressionConfig, VisualCheckpoint } from '@/types';

export class VisualRegressionGenerator {
  private config: VisualRegressionConfig;
  private checkpoints: VisualCheckpoint[];

  constructor(config: VisualRegressionConfig, checkpoints: VisualCheckpoint[]) {
    this.config = config;
    this.checkpoints = checkpoints;
  }

  generate(): string {
    switch (this.config.provider) {
      case 'percy':
        return this.generatePercyTests();
      case 'applitools':
        return this.generateApplitoolsTests();
      case 'chromatic':
        return this.generateChromaticTests();
      case 'playwright':
        return this.generatePlaywrightVisualTests();
      case 'backstop':
        return this.generateBackstopConfig();
      default:
        return this.generatePlaywrightVisualTests();
    }
  }

  private generatePercyTests(): string {
    return `import { test } from '@playwright/test';
import percySnapshot from '@percy/playwright';

test.describe('Visual Regression Tests - Percy', () => {
${this.checkpoints.map((checkpoint, idx) => this.generatePercyTest(checkpoint, idx)).join('\n\n')}
});`;
  }

  private generatePercyTest(checkpoint: VisualCheckpoint, index: number): string {
    const percyOptions = {
      fullPage: checkpoint.fullPage,
      widths: [375, 768, 1280],
    };

    return `  test('Visual: ${checkpoint.name}', async ({ page }) => {
    await page.goto('/');
    
    ${checkpoint.selector ? `await page.locator('${checkpoint.selector}').waitFor({ state: 'visible' });` : ''}

    await percySnapshot(page, '${checkpoint.name}', ${JSON.stringify(percyOptions, null, 2).split('\n').join('\n    ')});
  });`;
  }

  private generateApplitoolsTests(): string {
    return `import { test } from '@playwright/test';
import { Eyes, Target } from '@applitools/eyes-playwright';

test.describe('Visual Regression Tests - Applitools', () => {
  let eyes: Eyes;

  test.beforeEach(async () => {
    eyes = new Eyes();
    eyes.setApiKey('${this.config.apiKey || 'YOUR_API_KEY'}');
  });

  test.afterEach(async () => {
    await eyes.close();
    await eyes.abortIfNotClosed();
  });

${this.checkpoints.map((checkpoint, idx) => this.generateApplitoolsTest(checkpoint, idx)).join('\n\n')}
});`;
  }

  private generateApplitoolsTest(checkpoint: VisualCheckpoint, index: number): string {
    return `  test('Visual: ${checkpoint.name}', async ({ page }) => {
    await eyes.open(page, '${this.config.projectName}', '${checkpoint.name}');
    await page.goto('/');
    
    ${checkpoint.selector 
      ? `await eyes.check('${checkpoint.name}', Target.region('${checkpoint.selector}'));`
      : `await eyes.check('${checkpoint.name}', Target.window().fully(${checkpoint.fullPage}));`
    }
  });`;
  }

  private generateChromaticTests(): string {
    return `import { test } from '@playwright/test';

test.describe('Visual Regression Tests - Chromatic', () => {
${this.checkpoints.map((checkpoint, idx) => this.generateChromaticTest(checkpoint, idx)).join('\n\n')}
});

// Run with: npx chromatic --playwright`;
  }

  private generateChromaticTest(checkpoint: VisualCheckpoint, index: number): string {
    return `  test('Visual: ${checkpoint.name}', async ({ page }) => {
    await page.goto('/');
    
    ${checkpoint.selector ? `await page.locator('${checkpoint.selector}').waitFor({ state: 'visible' });` : ''}

    await page.screenshot({ 
      path: \`chromatic-snapshots/${checkpoint.name}.png\`,
      fullPage: ${checkpoint.fullPage}
    });
  });`;
  }

  private generatePlaywrightVisualTests(): string {
    return `import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests - Playwright', () => {
${this.checkpoints.map((checkpoint, idx) => this.generatePlaywrightVisualTest(checkpoint, idx)).join('\n\n')}
});`;
  }

  private generatePlaywrightVisualTest(checkpoint: VisualCheckpoint, index: number): string {
    const mask = checkpoint.mask?.map(m => `page.locator('${m}')`).join(', ') || '';

    return `  test('Visual: ${checkpoint.name}', async ({ page }) => {
    await page.goto('/');
    
    ${checkpoint.selector ? `const element = page.locator('${checkpoint.selector}');
    await element.waitFor({ state: 'visible' });
    
    await expect(element).toHaveScreenshot('${checkpoint.name}.png', {
      ${mask ? `mask: [${mask}],` : ''}
      ${checkpoint.threshold ? `threshold: ${checkpoint.threshold},` : ''}
      maxDiffPixels: 100,
    });` : `await expect(page).toHaveScreenshot('${checkpoint.name}.png', {
      fullPage: ${checkpoint.fullPage},
      ${mask ? `mask: [${mask}],` : ''}
      ${checkpoint.threshold ? `threshold: ${checkpoint.threshold},` : ''}
      maxDiffPixels: 100,
    });`}
  });`;
  }

  private generateBackstopConfig(): string {
    const scenarios = this.checkpoints.map(checkpoint => ({
      label: checkpoint.name,
      url: 'http://localhost:3000',
      selectors: checkpoint.selector ? [checkpoint.selector] : ['document'],
      misMatchThreshold: checkpoint.threshold || 0.1,
      requireSameDimensions: true,
    }));

    return JSON.stringify({
      id: this.config.projectName,
      viewports: [
        { label: 'phone', width: 375, height: 667 },
        { label: 'tablet', width: 768, height: 1024 },
        { label: 'desktop', width: 1920, height: 1080 },
      ],
      scenarios,
      paths: {
        bitmaps_reference: 'backstop_data/bitmaps_reference',
        bitmaps_test: 'backstop_data/bitmaps_test',
        engine_scripts: 'backstop_data/engine_scripts',
        html_report: 'backstop_data/html_report',
        ci_report: 'backstop_data/ci_report',
      },
      report: ['browser'],
      engine: 'playwright',
    }, null, 2);
  }

  generateSetupInstructions(): string {
    const instructions: Record<string, string> = {
      percy: `# Percy Setup

1. Install Percy:
\`\`\`bash
npm install --save-dev @percy/cli @percy/playwright
\`\`\`

2. Set Percy token:
\`\`\`bash
export PERCY_TOKEN=your-token-here
\`\`\`

3. Run tests:
\`\`\`bash
percy exec -- playwright test
\`\`\``,

      applitools: `# Applitools Setup

1. Install Applitools:
\`\`\`bash
npm install --save-dev @applitools/eyes-playwright
\`\`\`

2. Set API key:
\`\`\`bash
export APPLITOOLS_API_KEY=your-key-here
\`\`\`

3. Run tests:
\`\`\`bash
npx playwright test
\`\`\``,

      chromatic: `# Chromatic Setup

1. Install Chromatic:
\`\`\`bash
npm install --save-dev chromatic
\`\`\`

2. Run Chromatic:
\`\`\`bash
npx chromatic --project-token=your-token-here --playwright
\`\`\``,

      playwright: `# Playwright Visual Testing

1. Generate baseline screenshots:
\`\`\`bash
npx playwright test --update-snapshots
\`\`\`

2. Run visual tests:
\`\`\`bash
npx playwright test
\`\`\``,

      backstop: `# BackstopJS Setup

1. Install BackstopJS:
\`\`\`bash
npm install --save-dev backstopjs
\`\`\`

2. Initialize BackstopJS:
\`\`\`bash
npx backstop init
\`\`\`

3. Create reference:
\`\`\`bash
npx backstop reference
\`\`\`

4. Run tests:
\`\`\`bash
npx backstop test
\`\`\``,
    };

    return instructions[this.config.provider] || instructions.playwright;
  }
}
