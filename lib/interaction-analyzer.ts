import { Page } from "playwright";
import { PageAnalysis, UserFlow, Interaction } from "@/types";

export class InteractionAnalyzer {
  private page: Page;
  private analysis: PageAnalysis;

  constructor(page: Page, analysis: PageAnalysis) {
    this.page = page;
    this.analysis = analysis;
  }

  async analyzeInteractionPatterns(): Promise<UserFlow[]> {
    const flows: UserFlow[] = [];

    // Analyze forms for potential user flows
    const formFlows = await this.analyzeFormInteractions();
    flows.push(...formFlows);

    // Analyze navigation patterns
    const navFlows = await this.analyzeNavigationInteractions();
    flows.push(...navFlows);

    // Analyze interactive component patterns
    const componentFlows = await this.analyzeComponentInteractions();
    flows.push(...componentFlows);

    return flows;
  }

  private async analyzeFormInteractions(): Promise<UserFlow[]> {
    const flows: UserFlow[] = [];
    const forms = this.analysis.elements.filter(
      (el) => el.elementType === "form"
    );

    for (const form of forms) {
      const formInputs = this.analysis.elements.filter(
        (el) => el.elementType === "input" && this.isChildOf(el, form)
      );

      if (formInputs.length > 0) {
        const steps: any[] = formInputs.map((input, idx) => ({
          id: `form-step-${idx}`,
          action: {
            type: "fill" as const,
            element: input.selector,
            value: this.generateMockValue(input),
          },
          assertion: {
            type: "visible" as const,
            selector: input.selector,
            expected: true,
          },
        }));

        // Add submit button if found
        const submitButton = this.analysis.elements.find(
          (el) =>
            (el.elementType === "button" || el.tagName === "button") &&
            this.isChildOf(el, form) &&
            (el.attributes["type"] === "submit" ||
              el.text?.toLowerCase().includes("submit"))
        );

        if (submitButton) {
          steps.push({
            id: `form-submit`,
            action: {
              type: "click" as const,
              element: submitButton.selector,
            },
          });
        }

        flows.push({
          name: `Form Submission - ${form.uniqueName}`,
          description: `Fill and submit ${form.uniqueName} form`,
          steps,
          expectedAPICalls: [],
          visualCheckpoints: [],
        });
      }
    }

    return flows;
  }

  private async analyzeNavigationInteractions(): Promise<UserFlow[]> {
    const flows: UserFlow[] = [];
    const navLinks = this.analysis.elements.filter(
      (el) =>
        el.elementType === "navigation" ||
        (el.elementType === "link" && el.role === "navigation")
    );

    if (navLinks.length > 0) {
      const steps = navLinks.slice(0, 5).map((link, idx) => ({
        id: `nav-step-${idx}`,
        action: {
          type: "click" as const,
          element: link.selector,
          waitFor: "networkidle",
        },
        assertion: {
          type: "url" as const,
          expected: link.attributes["href"] || "/",
        },
      }));

      flows.push({
        name: "Navigation Flow",
        description: "Navigate through main menu items",
        steps,
        expectedAPICalls: [],
        visualCheckpoints: steps.map((step, idx) => ({
          name: `Navigation Step ${idx + 1}`,
          fullPage: true,
        })),
      });
    }

    return flows;
  }

  private async analyzeComponentInteractions(): Promise<UserFlow[]> {
    const flows: UserFlow[] = [];

    // Analyze modals
    const modals = this.analysis.elements.filter(
      (el) => el.elementType === "modal"
    );
    for (const modal of modals) {
      const triggerButton = this.findModalTrigger(modal);
      if (triggerButton) {
        flows.push({
          name: `Modal Interaction - ${modal.uniqueName}`,
          description: `Open and interact with ${modal.uniqueName}`,
          steps: [
            {
              id: "open-modal",
              action: {
                type: "click",
                element: triggerButton.selector,
              },
              assertion: {
                type: "visible",
                selector: modal.selector,
                expected: true,
              },
            },
          ],
          expectedAPICalls: [],
          visualCheckpoints: [
            { name: "Modal Open", selector: modal.selector, fullPage: false },
          ],
        });
      }
    }

    // Analyze tabs/accordions
    const tabs = this.analysis.elements.filter(
      (el) => el.elementType === "tab"
    );
    if (tabs.length > 0) {
      flows.push({
        name: "Tab Navigation",
        description: "Navigate through tab components",
        steps: tabs.map((tab, idx) => ({
          id: `tab-${idx}`,
          action: {
            type: "click",
            element: tab.selector,
          },
          assertion: {
            type: "visible",
            selector: tab.selector,
            expected: true,
          },
        })),
        expectedAPICalls: [],
        visualCheckpoints: [],
      });
    }

    return flows;
  }

  private isChildOf(element: any, parent: any): boolean {
    // Simple check - in production, use DOM hierarchy
    return element.xpath.startsWith(parent.xpath);
  }

  private generateMockValue(input: any): string {
    const type = input.attributes["type"]?.toLowerCase() || "text";
    const name = (input.attributes["name"] || "").toLowerCase();

    if (type === "email" || name.includes("email")) {
      return "test@example.com";
    }
    if (type === "password" || name.includes("password")) {
      return "Password123!";
    }
    if (type === "tel" || name.includes("phone")) {
      return "555-0123";
    }
    if (type === "number") {
      return "42";
    }
    if (type === "date") {
      return "2024-01-01";
    }
    if (name.includes("name")) {
      return "Test User";
    }

    return "test value";
  }

  private findModalTrigger(modal: any): any {
    // Look for buttons with modal-related attributes
    return this.analysis.elements.find(
      (el) =>
        el.elementType === "button" &&
        (el.attributes["data-target"] === modal.attributes["id"] ||
          el.attributes["aria-controls"] === modal.attributes["id"] ||
          el.text?.toLowerCase().includes("open"))
    );
  }

  async recordInteraction(interaction: Interaction): Promise<void> {
    // Record interactions for later analysis
    console.log("Recording interaction:", interaction);
  }

  async generateInteractionReport(): Promise<string> {
    const patterns = await this.analyzeInteractionPatterns();

    return `# Interaction Analysis Report

## Total Patterns Found: ${patterns.length}

${patterns
  .map(
    (pattern) => `
### ${pattern.name}
${pattern.description}

**Steps:** ${pattern.steps.length}
**API Calls:** ${pattern.expectedAPICalls.length}
**Visual Checkpoints:** ${pattern.visualCheckpoints.length}
`
  )
  .join("\n")}
`;
  }
}
