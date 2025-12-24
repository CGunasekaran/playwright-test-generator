import { NextRequest, NextResponse } from "next/server";
import { POMGenerator } from "@/lib/pom-generator";
import { TestGenerator } from "@/lib/test-generator";
import { CodeFormatter } from "@/lib/code-formatter";
import { E2ETestGenerator } from "@/lib/template-generators/e2e-generator";
import { AccessibilityTestGenerator } from "@/lib/template-generators/accessibility-generator";
import { PerformanceTestGenerator } from "@/lib/template-generators/performance-generator";
import { VisualRegressionGenerator } from "@/lib/visual-regression-generator";
import { APIMockGenerator } from "@/lib/api-mock-generator";
import { PlaywrightExporter } from "@/lib/exporters/playwright-exporter";
import { CypressExporter } from "@/lib/exporters/cypress-exporter";
import { PuppeteerExporter } from "@/lib/exporters/puppeteer-exporter";
import { SeleniumExporter } from "@/lib/exporters/selenium-exporter";
import { PageAnalysis, ExportOptions, UserFlow } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const {
      analysis,
      userFlows = [],
      options,
    } = (await request.json()) as {
      analysis: PageAnalysis;
      userFlows: UserFlow[];
      options: ExportOptions;
    };

    console.log("generate-code API called with:", {
      hasAnalysis: !!analysis,
      flowsCount: userFlows.length,
      templates: options?.templates,
      format: options?.format,
    });

    // If no options provided, use defaults (backward compatibility)
    if (!options) {
      return generateLegacyCode(analysis);
    }

    // Generate code based on export format
    let generatedFiles: Record<string, string>;

    if (options.format.startsWith("playwright")) {
      const exporter = new PlaywrightExporter(analysis, userFlows, options);
      generatedFiles = exporter.export();
      console.log("Generated files:", Object.keys(generatedFiles));
    } else if (options.format.startsWith("cypress")) {
      const exporter = new CypressExporter(analysis, userFlows, options);
      generatedFiles = exporter.export();
      console.log("Generated Cypress files:", Object.keys(generatedFiles));
    } else if (options.format.startsWith("puppeteer")) {
      const exporter = new PuppeteerExporter(analysis, userFlows, options);
      generatedFiles = exporter.export();
    } else if (options.format.startsWith("selenium")) {
      const exporter = new SeleniumExporter(analysis, userFlows, options);
      generatedFiles = exporter.export();
    } else {
      throw new Error(`Unsupported export format: ${options.format}`);
    }

    // Add additional template-specific files
    if (options.templates.includes("e2e") && userFlows.length > 0) {
      const e2eGenerator = new E2ETestGenerator(analysis, userFlows);
      generatedFiles["e2eFlowTests"] = e2eGenerator.generate();
    }

    if (options.templates.includes("accessibility")) {
      const a11yGenerator = new AccessibilityTestGenerator(analysis);
      generatedFiles["accessibilityTests"] = a11yGenerator.generate();
    }

    if (options.templates.includes("performance")) {
      const perfGenerator = new PerformanceTestGenerator(analysis);
      generatedFiles["performanceTests"] = perfGenerator.generate();
    }

    if (options.includeVisualRegression && options.visualConfig) {
      const visualGenerator = new VisualRegressionGenerator(
        options.visualConfig,
        [] // Add checkpoints based on analysis
      );
      generatedFiles["visualRegressionTests"] = visualGenerator.generate();
    }

    if (options.includeAPIMocks && analysis.apiRoutes.length > 0) {
      const mockGenerator = new APIMockGenerator(analysis.apiRoutes);
      generatedFiles["apiMocks"] = mockGenerator.generateMSWHandlers();
      generatedFiles["apiMocksPlaywright"] =
        mockGenerator.generatePlaywrightMocks();
    }

    // Map new format to legacy format for CodeViewer compatibility
    const legacyFormat = mapToLegacyFormat(generatedFiles, options.format);

    return NextResponse.json(legacyFormat);
  } catch (error: any) {
    console.error("Code generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate code" },
      { status: 500 }
    );
  }
}

// Legacy code generation for backward compatibility
function generateLegacyCode(analysis: PageAnalysis) {
  const pomGenerator = new POMGenerator(analysis);
  const testGenerator = new TestGenerator(analysis);

  const pageName = analysis.title
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");

  CodeFormatter.setPageName(pageName);

  const generatedCode = {
    pomFile: CodeFormatter.formatTypeScript(pomGenerator.generate()),
    testFile: CodeFormatter.formatTypeScript(testGenerator.generate()),
    fixturesFile: CodeFormatter.formatTypeScript(
      CodeFormatter.generateFixturesFile()
    ),
    constantsFile: CodeFormatter.formatTypeScript(
      CodeFormatter.generateConstantsFile()
    ),
    typesFile: CodeFormatter.formatTypeScript(
      CodeFormatter.generateTypesFile()
    ),
    basePageFile: CodeFormatter.formatTypeScript(
      CodeFormatter.generateBasePageFile()
    ),
  };

  return NextResponse.json(generatedCode);
}

// Map new exporter format to legacy format for UI compatibility
function mapToLegacyFormat(files: Record<string, string>, format: string): any {
  const ext = format.endsWith("-ts") ? "ts" : "js";

  // Collect all test files and combine them
  const testFiles: string[] = [];

  // Determine file patterns based on format
  let testFilePatterns: string[] = [];

  if (format.startsWith("playwright")) {
    testFilePatterns = [
      `tests/snapshot.spec.${ext}`,
      `tests/e2e.spec.${ext}`,
      `tests/component.spec.${ext}`,
      `tests/accessibility.spec.${ext}`,
      `tests/performance.spec.${ext}`,
      `tests/api.spec.${ext}`,
      `tests/cross-browser.spec.${ext}`,
      `tests/mobile.spec.${ext}`,
      `tests/visual.spec.${ext}`,
    ];
  } else if (format.startsWith("cypress")) {
    testFilePatterns = [
      `cypress/e2e/snapshot.cy.${ext}`,
      `cypress/e2e/user-flows.cy.${ext}`,
      `cypress/e2e/component.cy.${ext}`,
      `cypress/e2e/accessibility.cy.${ext}`,
      `cypress/e2e/performance.cy.${ext}`,
    ];
  } else if (format.startsWith("puppeteer")) {
    testFilePatterns = [
      `tests/snapshot.test.${ext}`,
      `tests/e2e.test.${ext}`,
      `tests/component.test.${ext}`,
    ];
  } else if (format.startsWith("selenium")) {
    testFilePatterns = [
      `tests/snapshot.test.${ext}`,
      `tests/e2e.test.${ext}`,
      `tests/component.test.${ext}`,
    ];
  }

  // Collect all test files from generated files
  for (const filename of testFilePatterns) {
    if (files[filename]) {
      testFiles.push(`// ========================================`);
      testFiles.push(`// ${filename}`);
      testFiles.push(`// ========================================\n`);
      testFiles.push(files[filename]);
      testFiles.push("\n");
    }
  }

  // If no test files found using patterns, search for any test file
  if (testFiles.length === 0) {
    for (const [filename, content] of Object.entries(files)) {
      if (
        filename.includes(".spec.") ||
        filename.includes(".test.") ||
        filename.includes(".cy.") ||
        content.includes("test(") ||
        content.includes("it(")
      ) {
        testFiles.push(`// ========================================`);
        testFiles.push(`// ${filename}`);
        testFiles.push(`// ========================================\n`);
        testFiles.push(content);
        testFiles.push("\n");
      }
    }
  }

  const testFile = testFiles.length > 0 ? testFiles.join("\n") : "";

  // Find the POM file - check different framework patterns
  const pomFile =
    files[`pom.${ext}`] ||
    files[`pageObjects/Page.${ext}`] ||
    files[`cypress/support/pages/page-object.${ext}`] ||
    Object.values(files).find((content) => content.includes("class")) ||
    "";

  // Generate default files for missing ones
  const fixturesFile = `import { test as base } from '@playwright/test';

export const test = base.extend({
  // Add your fixtures here
});

export { expect } from '@playwright/test';`;

  const constantsFile = `export const BASE_URL = '${
    process.env.BASE_URL || "http://localhost:3000"
  }';
export const TIMEOUT = 30000;`;

  const typesFile = `export interface TestData {
  // Add your types here
}`;

  const basePageFile = `import { Page } from '@playwright/test';

export class BasePage {
  constructor(public page: Page) {}

  async goto(url: string) {
    await this.page.goto(url);
  }

  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
  }
}`;

  return {
    pomFile,
    testFile,
    fixturesFile,
    constantsFile,
    typesFile,
    basePageFile,
  };
}
