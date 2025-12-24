import { PageAnalysis, PageElement, PageSection } from '@/types';

export class POMGenerator {
  private analysis: PageAnalysis;
  private className: string;

  constructor(analysis: PageAnalysis) {
    this.analysis = analysis;
    this.className = this.generateClassName(analysis.title);
  }

  private generateClassName(title: string): string {
    return title
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('') + 'Page';
  }

  generate(): string {
    const imports = this.generateImports();
    const sectionClasses = this.generateSectionClasses();
    const mainClass = this.generateMainClass();

    return `${imports}\n\n${sectionClasses}\n\n${mainClass}`;
  }

  private generateImports(): string {
    return `import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';`;
  }

  private generateSectionClasses(): string {
    return this.analysis.sections.map(section => {
      const className = section.name + 'Component';
      const properties = section.elements
        .map(el => this.generateProperty(el))
        .filter(Boolean)
        .join('\n  ');

      const getters = section.elements
        .map(el => this.generateGetter(el))
        .filter(Boolean)
        .join('\n\n  ');

      return `export class ${className} {
  private page: Page;

  ${properties}

  constructor(page: Page) {
    this.page = page;
  }

  ${getters}

  async isDisplayed(): Promise<boolean> {
    return await this.${section.elements[0]?.uniqueName || 'container'}.isVisible();
  }
}`;
    }).join('\n\n');
  }

  private generateProperty(element: PageElement): string {
    if (element.uniqueName) {
      return `readonly ${element.uniqueName}Locator: string = '${element.selector}';`;
    }
    return '';
  }

  private generateGetter(element: PageElement): string {
    if (!element.uniqueName) return '';

    const comment = this.generateComment(element);
    
    return `${comment}
  get ${element.uniqueName}(): Locator {
    return this.page.locator(this.${element.uniqueName}Locator);
  }`;
  }

  private generateComment(element: PageElement): string {
    const parts: string[] = [];
    
    if (element.testId) parts.push(`Test ID: ${element.testId}`);
    if (element.ariaLabel) parts.push(`Aria Label: ${element.ariaLabel}`);
    if (element.text) parts.push(`Text: ${element.text.slice(0, 50)}`);
    if (element.classes.length > 0) parts.push(`Classes: ${element.classes.slice(0, 3).join(', ')}`);

    if (parts.length === 0) return '';

    return `/**
   * ${parts.join(' | ')}
   */`;
  }

  private generateMainClass(): string {
    const sectionProperties = this.analysis.sections
      .map(section => {
        const componentName = section.name.toLowerCase() + 'Component';
        const className = section.name + 'Component';
        return `  readonly ${componentName}: ${className};`;
      })
      .join('\n');

    const interactiveElements = this.analysis.interactiveElements
      .slice(0, 20) // Limit to top 20 interactive elements
      .filter(el => !this.analysis.sections.some(s => s.elements.includes(el)));

    const interactiveProperties = interactiveElements
      .map(el => this.generateProperty(el))
      .filter(Boolean)
      .join('\n  ');

    const interactiveGetters = interactiveElements
      .map(el => this.generateGetter(el))
      .filter(Boolean)
      .join('\n\n  ');

    const sectionInit = this.analysis.sections
      .map(section => {
        const componentName = section.name.toLowerCase() + 'Component';
        const className = section.name + 'Component';
        return `    this.${componentName} = new ${className}(page);`;
      })
      .join('\n');

    return `export class ${this.className} extends BasePage {
${sectionProperties}

  ${interactiveProperties}

  constructor(page: Page) {
    super(page);
${sectionInit}
  }

  ${interactiveGetters}

  async open(path: string = '/'): Promise<void> {
    await this.page.goto(path);
    await this.page.waitForLoadState('networkidle');
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }
}`;
  }
}
