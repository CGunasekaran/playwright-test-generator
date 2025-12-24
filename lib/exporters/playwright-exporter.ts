import { PageAnalysis, UserFlow, ExportOptions } from "@/types";

export class PlaywrightExporter {
  private analysis: PageAnalysis;
  private flows: UserFlow[];
  private options: ExportOptions;

  constructor(
    analysis: PageAnalysis,
    flows: UserFlow[],
    options: ExportOptions
  ) {
    this.analysis = analysis;
    this.flows = flows;
    this.options = options;
  }

  export(): Record<string, string> {
    const isTypeScript = this.options.format === "playwright-ts";
    const ext = isTypeScript ? "ts" : "js";

    const files: Record<string, string> = {
      [`pom.${ext}`]: this.generatePOM(isTypeScript),
    };

    // Only generate snapshot test if explicitly included in templates
    if (this.options.templates.includes("snapshot")) {
      files[`tests/snapshot.spec.${ext}`] =
        this.generateSnapshotTest(isTypeScript);
    }

    if (this.options.templates.includes("e2e") && this.flows.length > 0) {
      files[`tests/e2e.spec.${ext}`] = this.generateE2ETest(isTypeScript);
    }

    if (this.options.templates.includes("component")) {
      files[`tests/component.spec.${ext}`] =
        this.generateComponentTest(isTypeScript);
    }

    if (this.options.templates.includes("accessibility")) {
      files[`tests/accessibility.spec.${ext}`] =
        this.generateAccessibilityTest(isTypeScript);
    }

    if (this.options.templates.includes("performance")) {
      files[`tests/performance.spec.${ext}`] =
        this.generatePerformanceTest(isTypeScript);
    }

    if (this.options.templates.includes("api")) {
      files[`tests/api.spec.${ext}`] = this.generateAPITest(isTypeScript);
    }

    if (this.options.templates.includes("cross-browser")) {
      files[`tests/cross-browser.spec.${ext}`] =
        this.generateCrossBrowserTest(isTypeScript);
    }

    if (this.options.templates.includes("mobile")) {
      files[`tests/mobile.spec.${ext}`] = this.generateMobileTest(isTypeScript);
    }

    if (this.options.includeVisualRegression) {
      files[`tests/visual.spec.${ext}`] = this.generateVisualTest(isTypeScript);
    }

    if (this.options.includeAPIMocks) {
      files[`mocks/api-mocks.${ext}`] = this.generateAPIMocks(isTypeScript);
    }

    files[`playwright.config.${ext}`] = this.generateConfig(isTypeScript);

    return files;
  }

  private generatePOM(isTS: boolean): string {
    const typeAnnotation = isTS ? ": Page" : "";
    const typeImport = isTS
      ? "import { Page } from '@playwright/test';\n\n"
      : "";

    return `${typeImport}export class PageObject {
  constructor(public page${typeAnnotation}) {}

  async goto() {
    await this.page.goto('${this.analysis.url}');
  }

${this.analysis.interactiveElements
  .map((el) => this.generatePageObjectMethod(el, isTS))
  .join("\n\n")}
}`;
  }

  private generatePageObjectMethod(element: any, isTS: boolean): string {
    const returnType = isTS ? ": Promise<void>" : "";
    const methodName =
      element.uniqueName.charAt(0).toLowerCase() + element.uniqueName.slice(1);

    return `  async ${methodName}()${returnType} {
    await this.page.locator('${element.selector}').click();
  }`;
  }

  private generateSnapshotTest(isTS: boolean): string {
    return `import { test, expect } from '@playwright/test';
import { PageObject } from '../pom';

test.describe('Snapshot Tests', () => {
  test('page loads correctly', async ({ page }) => {
    const po = new PageObject(page);
    await po.goto();
    
    await expect(page).toHaveTitle(/${this.analysis.title}/);
  });

  test('all interactive elements are present', async ({ page }) => {
    const po = new PageObject(page);
    await po.goto();
    
${this.analysis.interactiveElements
  .slice(0, 5)
  .map(
    (el) => `    await expect(page.locator('${el.selector}')).toBeVisible();`
  )
  .join("\n")}
  });
});`;
  }

  private generateE2ETest(isTS: boolean): string {
    return `import { test, expect } from '@playwright/test';
import { PageObject } from '../pom';

test.describe('E2E User Flows', () => {
${this.flows.map((flow) => this.generateFlowTest(flow)).join("\n\n")}
});`;
  }

  private generateFlowTest(flow: UserFlow): string {
    return `  test('${flow.name}', async ({ page }) => {
    const po = new PageObject(page);
    await po.goto();
    
    // ${flow.description}
${flow.steps
  .slice(0, 10)
  .map((step) => this.generateStepCode(step))
  .join("\n")}
  });`;
  }

  private generateStepCode(step: any): string {
    const action = step.action;
    switch (action.type) {
      case "click":
        return `    await page.locator('${action.element}').click();`;
      case "fill":
        return `    await page.locator('${action.element}').fill('${
          action.value || "test"
        }');`;
      case "select":
        return `    await page.locator('${action.element}').selectOption('${
          action.value || "option1"
        }');`;
      default:
        return `    // ${action.type} on ${action.element}`;
    }
  }

  private generateComponentTest(isTS: boolean): string {
    return `import { test, expect } from '@playwright/test';

test.describe('Component Tests', () => {
  test('header renders correctly', async ({ page }) => {
    await page.goto('${this.analysis.url}');
    const header = page.locator('header');
    await expect(header).toBeVisible();
  });

  test('footer renders correctly', async ({ page }) => {
    await page.goto('${this.analysis.url}');
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });
});`;
  }

  private generateAccessibilityTest(isTS: boolean): string {
    return `import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test('should not have accessibility violations', async ({ page }) => {
    await page.goto('${this.analysis.url}');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});`;
  }

  private generatePerformanceTest(isTS: boolean): string {
    return `import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('page loads within acceptable time', async ({ page }) => {
    const start = Date.now();
    await page.goto('${this.analysis.url}');
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(3000);
  });

  test('Core Web Vitals', async ({ page }) => {
    await page.goto('${this.analysis.url}');
    
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          resolve(entries);
        }).observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
        
        setTimeout(() => resolve([]), 5000);
      });
    });
    
    console.log('Performance metrics:', metrics);
  });
});`;
  }

  private generateAPITest(isTS: boolean): string {
    return `import { test, expect } from '@playwright/test';

test.describe('API Tests', () => {
  test('API endpoints respond correctly', async ({ request }) => {
    const response = await request.get('${this.analysis.url}/api/health');
    expect(response.ok()).toBeTruthy();
  });

  test('API returns valid JSON', async ({ request }) => {
    const response = await request.get('${this.analysis.url}/api/data');
    const data = await response.json();
    expect(data).toBeDefined();
  });
});`;
  }

  private generateCrossBrowserTest(isTS: boolean): string {
    return `import { test, expect, devices } from '@playwright/test';

test.describe('Cross-Browser Tests', () => {
  const browsers = ['Desktop Chrome', 'Desktop Firefox', 'Desktop Safari'];
  
  for (const browserName of browsers) {
    test(\`renders correctly on \${browserName}\`, async ({ browser }) => {
      const context = await browser.newContext({
        ...devices[browserName],
      });
      const page = await context.newPage();
      
      await page.goto('${this.analysis.url}');
      await expect(page).toHaveTitle(/${this.analysis.title}/);
      
      await context.close();
    });
  }
});`;
  }

  private generateMobileTest(isTS: boolean): string {
    return `import { test, expect, devices } from '@playwright/test';

test.describe('Mobile Tests', () => {
  test('renders correctly on iPhone 12', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone 12'],
    });
    const page = await context.newPage();
    
    await page.goto('${this.analysis.url}');
    await expect(page).toHaveTitle(/${this.analysis.title}/);
    
    // Check mobile-specific elements
    const viewport = page.viewportSize();
    expect(viewport?.width).toBeLessThanOrEqual(428);
    
    await context.close();
  });

  test('renders correctly on iPad', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPad Pro'],
    });
    const page = await context.newPage();
    
    await page.goto('${this.analysis.url}');
    await expect(page).toHaveTitle(/${this.analysis.title}/);
    
    await context.close();
  });
});`;
  }

  private generateVisualTest(isTS: boolean): string {
    const provider = this.options.visualConfig?.provider || "playwright";

    if (provider === "playwright") {
      return `import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test('page visual snapshot', async ({ page }) => {
    await page.goto('${this.analysis.url}');
    await expect(page).toHaveScreenshot('page-snapshot.png', {
      threshold: ${this.options.visualConfig?.threshold || 0.2},
    });
  });
});`;
    }

    return `// Visual regression for ${provider}`;
  }

  private generateAPIMocks(isTS: boolean): string {
    return `import { Page } from '@playwright/test';

export async function setupAPIMocks(page${isTS ? ": Page" : ""}) {
  await page.route('**/api/**', async (route) => {
    const url = route.request().url();
    
    // Add your API mocks here
    await route.fulfill({
      status: 200,
      body: JSON.stringify({ message: 'Mocked response' }),
    });
  });
}`;
  }

  private generateConfig(isTS: boolean): string {
    return `import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: '${this.analysis.url}',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});`;
  }
}
