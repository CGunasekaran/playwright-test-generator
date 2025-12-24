import { PageAnalysis, UserFlow, ExportOptions } from "@/types";

export class SeleniumExporter {
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
    const isTypeScript = this.options.format === "selenium-ts";
    const ext = isTypeScript ? "ts" : "js";

    return {
      [`tests/page-object.${ext}`]: this.generatePOM(isTypeScript),
      [`tests/snapshot.test.${ext}`]: this.generateSnapshotTest(isTypeScript),
    };
  }

  private generatePOM(isTS: boolean): string {
    const imports = isTS
      ? "import { WebDriver, By } from 'selenium-webdriver';"
      : "const { By } = require('selenium-webdriver');";

    return `${imports}

export class PageObject {
  constructor(public driver${isTS ? ": WebDriver" : ""}) {}

  async goto() {
    await this.driver.get('${this.analysis.url}');
  }

${this.analysis.interactiveElements
  .slice(0, 10)
  .map(
    (el) => `  async ${
      el.uniqueName.charAt(0).toLowerCase() + el.uniqueName.slice(1)
    }() {
    const element = await this.driver.findElement(By.css('${el.selector}'));
    await element.click();
  }`
  )
  .join("\n\n")}
}`;
  }

  private generateSnapshotTest(isTS: boolean): string {
    const imports = isTS
      ? "import { Builder, Browser, WebDriver } from 'selenium-webdriver';\nimport { PageObject } from './page-object';"
      : "const { Builder, Browser } = require('selenium-webdriver');\nconst { PageObject } = require('./page-object');";

    return `${imports}

describe('Snapshot Tests', () => {
  let driver${isTS ? ": WebDriver" : ""};
  let po${isTS ? ": PageObject" : ""};

  beforeAll(async () => {
    driver = await new Builder().forBrowser(Browser.CHROME).build();
    po = new PageObject(driver);
  });

  afterAll(async () => {
    await driver.quit();
  });

  test('page loads correctly', async () => {
    await po.goto();
    const title = await driver.getTitle();
    expect(title).toContain('${this.analysis.title}');
  });

  test('interactive elements are present', async () => {
    await po.goto();
${this.analysis.interactiveElements
  .slice(0, 5)
  .map(
    (el) =>
      `    const el${el.id} = await driver.findElement(By.css('${el.selector}'));\n    expect(await el${el.id}.isDisplayed()).toBe(true);`
  )
  .join("\n")}
  });
});`;
  }
}
