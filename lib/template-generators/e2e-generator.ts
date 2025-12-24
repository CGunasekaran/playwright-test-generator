import { PageAnalysis, UserFlow, FlowStep } from "@/types";

export class E2ETestGenerator {
  private analysis: PageAnalysis;
  private flows: UserFlow[];

  constructor(analysis: PageAnalysis, flows: UserFlow[]) {
    this.analysis = analysis;
    this.flows = flows;
  }

  generate(): string {
    const imports = this.generateImports();
    const testSuite = this.generateTestSuite();

    return `${imports}\n\n${testSuite}`;
  }

  private generateImports(): string {
    return `import { test, expect } from '@playwright/test';
import { setupAPIMocks } from './api-mocks';`;
  }

  private generateTestSuite(): string {
    const pageName = this.getPageName();

    return `test.describe('${pageName} - E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupAPIMocks(page);
    await page.goto('/');
  });

${this.flows.map((flow) => this.generateFlowTest(flow)).join("\n\n")}
});`;
  }

  private generateFlowTest(flow: UserFlow): string {
    return `  test('${flow.name}', async ({ page }) => {
    // ${flow.description}
    
${flow.steps.map((step, idx) => this.generateStep(step, idx)).join("\n\n")}
  });`;
  }

  private generateStep(step: FlowStep, index: number): string {
    const action = step.action;
    let code = `    // Step ${index + 1}: ${action.type}\n`;

    switch (action.type) {
      case "fill":
        code += `    await page.locator('${action.element}').fill('${action.value}');`;
        break;
      case "click":
        code += `    await page.locator('${action.element}').click();`;
        if (action.waitFor) {
          code += `\n    await page.waitForLoadState('${action.waitFor}');`;
        }
        break;
      case "select":
        code += `    await page.locator('${action.element}').selectOption('${action.value}');`;
        break;
      case "check":
        code += `    await page.locator('${action.element}').check();`;
        break;
      case "press":
        code += `    await page.locator('${action.element}').press('${action.value}');`;
        break;
      case "hover":
        code += `    await page.locator('${action.element}').hover();`;
        break;
      case "scroll":
        code += `    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));`;
        break;
      default:
        code += `    // Implement ${action.type} action`;
    }

    if (step.assertion) {
      code += `\n\n    // Assertion\n`;
      code += this.generateAssertion(step.assertion);
    }

    if (step.screenshot) {
      code += `\n    await page.screenshot({ path: 'screenshots/step-${
        index + 1
      }.png' });`;
    }

    return code;
  }

  private generateAssertion(assertion: any): string {
    switch (assertion.type) {
      case "visible":
        return `    await expect(page.locator('${assertion.selector}')).toBeVisible();`;
      case "hidden":
        return `    await expect(page.locator('${assertion.selector}')).toBeHidden();`;
      case "text":
        return `    await expect(page.locator('${assertion.selector}')).toHaveText('${assertion.expected}');`;
      case "value":
        return `    await expect(page.locator('${assertion.selector}')).toHaveValue('${assertion.expected}');`;
      case "count":
        return `    await expect(page.locator('${assertion.selector}')).toHaveCount(${assertion.expected});`;
      case "url":
        return `    await expect(page).toHaveURL(new RegExp('${assertion.expected}'));`;
      default:
        return `    // Add assertion for ${assertion.type}`;
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
