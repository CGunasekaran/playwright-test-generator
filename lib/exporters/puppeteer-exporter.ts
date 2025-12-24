import { PageAnalysis, UserFlow, ExportOptions } from "@/types";

export class PuppeteerExporter {
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
    const isTypeScript = this.options.format === "puppeteer-ts";
    const ext = isTypeScript ? "ts" : "js";

    const files: Record<string, string> = {
      [`tests/snapshot.test.${ext}`]: this.generateSnapshotTest(isTypeScript),
      "jest.config.js": this.generateJestConfig(),
    };

    if (this.options.templates.includes("e2e") && this.flows.length > 0) {
      files[`tests/e2e.test.${ext}`] = this.exportE2E();
    }

    return files;
  }

  private generateSnapshotTest(isTypeScript: boolean): string {
    return `${this.generateImports(isTypeScript)}

describe('Snapshot Tests', () => {
  let browser${isTypeScript ? ": Browser" : ""};
  let page${isTypeScript ? ": Page" : ""};

  beforeAll(async () => {
    browser = await puppeteer.launch({ headless: true });
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    page = await browser.newPage();
    await page.goto('${this.analysis.url}');
  });

  afterEach(async () => {
    await page.close();
  });

  test('page loads correctly', async () => {
    const title = await page.title();
    expect(title).toContain('${this.analysis.title}');
  });

  test('interactive elements are visible', async () => {
${this.analysis.interactiveElements
  .slice(0, 5)
  .map(
    (el) =>
      `    const el${el.id} = await page.$('${el.selector}');\n    expect(el${el.id}).toBeTruthy();`
  )
  .join("\n")}
  });
});`;
  }

  private generateJestConfig(): string {
    return `module.exports = {
  preset: 'jest-puppeteer',
  testTimeout: 30000,
};`;
  }

  exportE2E(): string {
    const isTypeScript = this.options.format.includes("ts");

    return `${this.generateImports(isTypeScript)}

describe('${this.getPageName()} - E2E Tests', () => {
  let browser${isTypeScript ? ": Browser" : ""};
  let page${isTypeScript ? ": Page" : ""};

  beforeAll(async () => {
    browser = await puppeteer.launch({ headless: true });
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    page = await browser.newPage();
    await page.goto('http://localhost:3000');
  });

  afterEach(async () => {
    await page.close();
  });

${this.flows.map((flow) => this.generatePuppeteerFlow(flow)).join("\n\n")}
});`;
  }

  private generateImports(isTypeScript: boolean): string {
    if (isTypeScript) {
      return `import puppeteer, { Browser, Page } from 'puppeteer';`;
    }
    return `const puppeteer = require('puppeteer');`;
  }

  private generatePuppeteerFlow(flow: UserFlow): string {
    return `  test('${flow.name}', async () => {
    // ${flow.description}
${flow.steps
  .map((step, idx) => this.generatePuppeteerStep(step, idx))
  .join("\n")}
  });`;
  }

  private generatePuppeteerStep(step: any, index: number): string {
    const action = step.action;
    let code = "";

    switch (action.type) {
      case "fill":
        code = `    await page.type('${action.element}', '${action.value}');`;
        break;
      case "click":
        code = `    await page.click('${action.element}');`;
        if (action.waitFor === "networkidle") {
          code += `\n    await page.waitForNavigation({ waitUntil: 'networkidle0' });`;
        }
        break;
      case "select":
        code = `    await page.select('${action.element}', '${action.value}');`;
        break;
      default:
        code = `    // ${action.type} action`;
    }

    if (step.assertion) {
      code += `\n${this.generatePuppeteerAssertion(step.assertion)}`;
    }

    if (step.screenshot) {
      code += `\n    await page.screenshot({ path: 'screenshot-${index}.png' });`;
    }

    return code;
  }

  private generatePuppeteerAssertion(assertion: any): string {
    switch (assertion.type) {
      case "visible":
        return `    const element = await page.$('${assertion.selector}');
    expect(element).toBeTruthy();`;
      case "text":
        return `    const text = await page.$eval('${assertion.selector}', el => el.textContent);
    expect(text).toBe('${assertion.expected}');`;
      case "url":
        return `    const url = page.url();
    expect(url).toContain('${assertion.expected}');`;
      default:
        return `    // Assertion: ${assertion.type}`;
    }
  }

  private getPageName(): string {
    return this.analysis.title
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("");
  }
}
