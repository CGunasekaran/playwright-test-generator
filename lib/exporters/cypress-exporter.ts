import { PageAnalysis, UserFlow, ExportOptions } from "@/types";

export class CypressExporter {
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
    const isTypeScript = this.options.format === "cypress-ts";
    const ext = isTypeScript ? "ts" : "js";

    const files: Record<string, string> = {
      [`cypress/support/pages/page-object.${ext}`]: this.exportPOM(),
      "cypress.config.js": this.exportConfig(),
    };

    // Only generate snapshot test if explicitly included in templates
    if (this.options.templates.includes("snapshot")) {
      files[`cypress/e2e/snapshot.cy.${ext}`] =
        this.generateSnapshotTest(isTypeScript);
    }

    if (this.options.templates.includes("e2e") && this.flows.length > 0) {
      files[`cypress/e2e/user-flows.cy.${ext}`] = this.exportE2E();
    }

    return files;
  }

  private generateSnapshotTest(isTypeScript: boolean): string {
    return `${
      isTypeScript ? '/// <reference types="cypress" />\n\n' : ""
    }describe('Snapshot Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should load page correctly', () => {
    cy.title().should('contain', '${this.analysis.title}');
  });

  it('should display interactive elements', () => {
${this.analysis.interactiveElements
  .slice(0, 5)
  .map((el) => `    cy.get('${el.selector}').should('be.visible');`)
  .join("\n")}
  });
});`;
  }

  exportE2E(): string {
    const isTypeScript = this.options.format.includes("ts");

    return `${
      isTypeScript ? '/// <reference types="cypress" />\n\n' : ""
    }describe('${this.getPageName()} - E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

${this.flows.map((flow) => this.generateCypressFlow(flow)).join("\n\n")}
});`;
  }

  private generateCypressFlow(flow: UserFlow): string {
    return `  it('${flow.name}', () => {
    // ${flow.description}
${flow.steps.map((step, idx) => this.generateCypressStep(step, idx)).join("\n")}
  });`;
  }

  private generateCypressStep(step: any, index: number): string {
    const action = step.action;
    let code = "";

    switch (action.type) {
      case "fill":
        code = `    cy.get('${action.element}').type('${action.value}');`;
        break;
      case "click":
        code = `    cy.get('${action.element}').click();`;
        if (action.waitFor) {
          code += `\n    cy.wait(1000);`;
        }
        break;
      case "select":
        code = `    cy.get('${action.element}').select('${action.value}');`;
        break;
      case "check":
        code = `    cy.get('${action.element}').check();`;
        break;
      default:
        code = `    // ${action.type} action`;
    }

    if (step.assertion) {
      code += `\n${this.generateCypressAssertion(step.assertion)}`;
    }

    return code;
  }

  private generateCypressAssertion(assertion: any): string {
    switch (assertion.type) {
      case "visible":
        return `    cy.get('${assertion.selector}').should('be.visible');`;
      case "text":
        return `    cy.get('${assertion.selector}').should('have.text', '${assertion.expected}');`;
      case "value":
        return `    cy.get('${assertion.selector}').should('have.value', '${assertion.expected}');`;
      case "url":
        return `    cy.url().should('include', '${assertion.expected}');`;
      default:
        return `    // Assertion: ${assertion.type}`;
    }
  }

  exportPOM(): string {
    const isTypeScript = this.options.format.includes("ts");
    const className = this.getPageName() + "Page";

    return `${isTypeScript ? "export " : ""}class ${className} {
${this.analysis.sections
  .map((section) => this.generateCypressSection(section))
  .join("\n\n")}

  visit() {
    cy.visit('/');
  }
}

${isTypeScript ? "" : "module.exports = " + className + ";"}`;
  }

  private generateCypressSection(section: any): string {
    return section.elements
      .slice(0, 5)
      .map(
        (el: any) => `  get ${el.uniqueName}() {
    return cy.get('${el.selector}');
  }`
      )
      .join("\n\n");
  }

  exportConfig(): string {
    const isTypeScript = this.options.format.includes("ts");

    return `${
      isTypeScript
        ? 'import { defineConfig } from "cypress";\n\nexport default defineConfig'
        : "module.exports = "
    }({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    viewportWidth: 1920,
    viewportHeight: 1080,
    video: false,
    screenshotOnRunFailure: true,
  },
})${isTypeScript ? ";" : ""}`;
  }

  private getPageName(): string {
    return this.analysis.title
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("");
  }
}
