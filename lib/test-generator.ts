import { PageAnalysis, PageElement } from '@/types';

export class TestGenerator {
  private analysis: PageAnalysis;
  private pageName: string;

  constructor(analysis: PageAnalysis) {
    this.analysis = analysis;
    this.pageName = this.generatePageName(analysis.title);
  }

  private generatePageName(title: string): string {
    return title
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }

  generate(): string {
    const imports = this.generateImports();
    const testSuite = this.generateTestSuite();

    return `${imports}\n\n${testSuite}`;
  }

  private generateImports(): string {
    return `import { expect, test } from '@playwright/test';
import { ${this.pageName}Page } from '@/pageObjects';
import { ScreenshotOptions } from '@/types';`;
  }

  private generateTestSuite(): string {
    const beforeEach = this.generateBeforeEach();
    const fullPageTest = this.generateFullPageTest();
    const sectionTests = this.generateSectionTests();
    const interactiveTests = this.generateInteractiveTests();
    const modalTests = this.generateModalTests();

    return `test.describe('${this.pageName} - Snapshot Tests', () => {
  let _defaultScreenshotOptions: ScreenshotOptions;
  let page: ${this.pageName}Page;

${beforeEach}

${fullPageTest}

${sectionTests}

${interactiveTests}

${modalTests}
});`;
  }

  private generateBeforeEach(): string {
    const maskElements = this.analysis.sections
      .map(section => {
        const componentName = section.name.toLowerCase() + 'Component';
        return `        page.${componentName}`;
      })
      .join(',\n');

    return `  test.beforeEach(async ({ page: playwrightPage }) => {
    page = new ${this.pageName}Page(playwrightPage);
    await page.open('${new URL(this.analysis.url).pathname}');
    
    _defaultScreenshotOptions = {
      mask: [
${maskElements}
      ],
    };
  });`;
  }

  private generateFullPageTest(): string {
    return `  test('${this.pageName} - entire page snapshot', async () => {
    await expect(page.page).toHaveScreenshot({
      ..._defaultScreenshotOptions,
      fullPage: true,
    });
  });`;
  }

  private generateSectionTests(): string {
    return this.analysis.sections
      .filter(section => section.type !== 'header' && section.type !== 'footer')
      .map(section => {
        const componentName = section.name.toLowerCase() + 'Component';
        const maskElements = section.elements
          .filter(el => el.elementType === 'image')
          .map(el => `page.${componentName}.${el.uniqueName}`)
          .join(',\n        ');

        const masks = maskElements ? `,
      mask: [
        ${maskElements}
      ]` : '';

        return `  test('${this.pageName} - ${section.name} section snapshot', async () => {
    await page.${componentName}.isDisplayed();
    
    await expect(page.${componentName}.${section.elements[0]?.uniqueName || 'container'}).toHaveScreenshot({
      ..._defaultScreenshotOptions${masks}
    });
  });`;
      })
      .join('\n\n');
  }

  private generateInteractiveTests(): string {
    const forms = this.analysis.elements.filter(el => el.elementType === 'form');
    
    return forms.map((form, index) => {
      const inputs = this.analysis.elements.filter(
        el => el.elementType === 'input' && 
        el.selector.includes(form.selector)
      );

      return `  test('${this.pageName} - Form ${index + 1} interaction snapshot', async () => {
    // Interact with form elements
${inputs.slice(0, 3).map(input => {
  if (input.attributes.type === 'text' || input.attributes.type === 'email') {
    return `    await page.${input.uniqueName}.fill('test@example.com');`;
  } else if (input.attributes.type === 'checkbox') {
    return `    await page.${input.uniqueName}.check();`;
  }
  return `    // await page.${input.uniqueName}.click();`;
}).join('\n')}
    
    await expect(page.page).toHaveScreenshot({
      ..._defaultScreenshotOptions,
    });
  });`;
    }).join('\n\n');
  }

  private generateModalTests(): string {
    const modals = this.analysis.elements.filter(el => el.elementType === 'modal');
    
    if (modals.length === 0) return '';

    return modals.map((modal, index) => {
      return `  test('${this.pageName} - Modal ${index + 1} snapshot', async () => {
    // Trigger modal (update selector based on your modal trigger)
    // await page.modalTrigger${index + 1}.click();
    
    await page.${modal.uniqueName}.waitFor({ state: 'visible' });
    
    const maskedModalOptions: ScreenshotOptions = {
      mask: [
        page.headerComponent,
        page.footerComponent,
      ],
    };

    await expect(page.${modal.uniqueName}).toHaveScreenshot(maskedModalOptions);
  });`;
    }).join('\n\n');
  }
}
