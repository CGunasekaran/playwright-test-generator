export class CodeFormatter {
  static formatTypeScript(code: string): string {
    // Basic formatting - in production, use prettier
    return code
      .replace(/\n{3,}/g, '\n\n') // Remove excessive newlines
      .trim();
  }

  static generateFixturesFile(): string {
    return `import { test as base } from '@playwright/test';
import { ${this.pageName}Page } from '@/pageObjects';

type Fixtures = {
  ${this.pageName.toLowerCase()}Page: ${this.pageName}Page;
};

export const test = base.extend<Fixtures>({
  ${this.pageName.toLowerCase()}Page: async ({ page }, use) => {
    const ${this.pageName.toLowerCase()}Page = new ${this.pageName}Page(page);
    await use(${this.pageName.toLowerCase()}Page);
  },
});

export { expect } from '@playwright/test';`;
  }

  static generateConstantsFile(): string {
    return `export const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

export const TIMEOUTS = {
  default: 30000,
  long: 60000,
  short: 5000,
};

export const SCREENSHOT_OPTIONS = {
  maxDiffPixels: 100,
  threshold: 0.2,
};`;
  }

  static generateTypesFile(): string {
    return `import { Locator } from '@playwright/test';

export interface ScreenshotOptions {
  mask?: Locator[];
  fullPage?: boolean;
  maxDiffPixels?: number;
  threshold?: number;
}

export interface PageOptions {
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle';
  timeout?: number;
}`;
  }

  static generateBasePageFile(): string {
    return `import { Page, Locator } from '@playwright/test';

export abstract class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async waitForElement(locator: Locator, timeout: number = 30000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  async clickElement(locator: Locator): Promise<void> {
    await locator.click();
  }

  async fillInput(locator: Locator, value: string): Promise<void> {
    await locator.fill(value);
  }

  async getText(locator: Locator): Promise<string> {
    return await locator.textContent() || '';
  }

  async isVisible(locator: Locator): Promise<boolean> {
    return await locator.isVisible();
  }

  async screenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: \`screenshots/\${name}.png\`, fullPage: true });
  }
}`;
  }

  private static pageName: string = 'Page';

  static setPageName(name: string): void {
    this.pageName = name;
  }
}
