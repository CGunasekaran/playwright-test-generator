import { Page } from "playwright";
import { PageElement, PageAnalysis, ElementType, PageSection } from "@/types";

export class PageAnalyzer {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async analyze(url: string): Promise<PageAnalysis> {
    // Try to navigate with retries and different strategies
    let navigationSuccess = false;
    let lastError: Error | null = null;

    // Strategy 1: Try with networkidle
    try {
      await this.page.goto(url, {
        waitUntil: "networkidle",
        timeout: 30000,
      });
      navigationSuccess = true;
    } catch (error: any) {
      console.log(
        "Navigation with networkidle failed, trying domcontentloaded..."
      );
      lastError = error;

      // Strategy 2: Try with domcontentloaded (less strict)
      try {
        await this.page.goto(url, {
          waitUntil: "domcontentloaded",
          timeout: 30000,
        });
        navigationSuccess = true;
      } catch (error2: any) {
        console.log("Navigation with domcontentloaded failed, trying load...");
        lastError = error2;

        // Strategy 3: Try with load
        try {
          await this.page.goto(url, {
            waitUntil: "load",
            timeout: 30000,
          });
          navigationSuccess = true;
        } catch (error3: any) {
          lastError = error3;
        }
      }
    }

    if (!navigationSuccess) {
      // Provide helpful error message based on the error type
      const errorMessage = lastError?.message || "Failed to navigate to page";

      if (errorMessage.includes("ERR_HTTP2_PROTOCOL_ERROR")) {
        throw new Error(
          "HTTP/2 protocol error: The website may be blocking automated browsers. " +
            "Try accessing the page manually first, or use a different URL."
        );
      } else if (errorMessage.includes("net::ERR_")) {
        throw new Error(
          `Network error: ${errorMessage}. Please check if the URL is accessible and try again.`
        );
      } else if (errorMessage.includes("Timeout")) {
        throw new Error(
          "Page load timeout: The page took too long to load. Try a simpler page or check your internet connection."
        );
      } else {
        throw new Error(`Navigation failed: ${errorMessage}`);
      }
    }

    await this.page.waitForTimeout(2000);

    const elements = await this.extractElements();
    const sections = this.categorizeSections(elements);
    const interactiveElements = elements.filter((el) => el.isInteractive);

    const screenshot = await this.page.screenshot({
      fullPage: true,
      type: "png",
    });
    const screenshotBase64 = screenshot.toString("base64");

    const title = await this.page.title();

    return {
      url,
      title,
      elements,
      screenshot: `data:image/png;base64,${screenshotBase64}`,
      sections,
      interactiveElements,
      userFlows: [],
      apiRoutes: [],
      metadata: {
        totalElements: elements.length,
        testIds: elements.filter((el) => el.testId).length,
        interactiveElements: interactiveElements.length,
        forms: elements.filter((el) => el.elementType === "form").length,
        modals: elements.filter((el) => el.elementType === "modal").length,
        tables: elements.filter((el) => el.elementType === "table").length,
      },
    };
  }

  private async extractElements(): Promise<PageElement[]> {
    const elementsData = await this.page.evaluate(() => {
      const elements: any[] = [];
      let elementId = 0;

      function getUniqueSelector(element: Element): string {
        // Try data-testid first
        const testId =
          element.getAttribute("data-testid") ||
          element.getAttribute("data-test") ||
          element.getAttribute("data-qa");
        if (testId) return `[data-testid="${testId}"]`;

        // Try ID
        if (element.id) return `#${CSS.escape(element.id)}`;

        // Build selector from classes and tag
        const tag = element.tagName.toLowerCase();
        const classes = Array.from(element.classList)
          .slice(0, 3)
          .filter((cls) => {
            // Filter out classes with special characters that might cause issues
            // Keep only classes that are safe for CSS selectors
            return /^[a-zA-Z_-][a-zA-Z0-9_-]*$/.test(cls);
          })
          .map((cls) => CSS.escape(cls))
          .join(".");

        if (classes) {
          const selector = `${tag}.${classes}`;
          try {
            const matches = document.querySelectorAll(selector);
            if (matches.length === 1) return selector;
          } catch (e) {
            // Invalid selector, continue to fallback
          }
        }

        // Use nth-child as fallback
        let path = tag;
        let current = element;
        while (current.parentElement) {
          const parent = current.parentElement;
          const siblings = Array.from(parent.children).filter(
            (el) => el.tagName === current.tagName
          );
          if (siblings.length > 1) {
            const index = siblings.indexOf(current) + 1;
            path = `${current.tagName.toLowerCase()}:nth-child(${index}) > ${path}`;
          }
          current = parent;
          if (parent.id) {
            path = `#${CSS.escape(parent.id)} > ${path}`;
            break;
          }
        }
        return path;
      }

      function getXPath(element: Element | null): string {
        if (!element) return "";

        if (element.id) return `//*[@id="${element.id}"]`;

        if (element === document.body) return "/html/body";

        if (element === document.documentElement) return "/html";

        let ix = 0;
        const siblings = element.parentNode?.childNodes || [];

        for (let i = 0; i < siblings.length; i++) {
          const sibling = siblings[i];
          if (sibling === element) {
            const tagName = element.tagName.toLowerCase();
            const parentPath = getXPath(element.parentElement);
            if (!parentPath) return `/${tagName}[${ix + 1}]`;
            return `${parentPath}/${tagName}[${ix + 1}]`;
          }
          if (
            sibling.nodeType === 1 &&
            (sibling as Element).tagName === element.tagName
          ) {
            ix++;
          }
        }
        return "";
      }

      function getComputedStyles(element: Element): Record<string, string> {
        const computed = window.getComputedStyle(element);
        return {
          display: computed.display,
          position: computed.position,
          width: computed.width,
          height: computed.height,
          backgroundColor: computed.backgroundColor,
          color: computed.color,
          fontSize: computed.fontSize,
          fontWeight: computed.fontWeight,
          padding: computed.padding,
          margin: computed.margin,
          border: computed.border,
          zIndex: computed.zIndex,
        };
      }

      function determineElementType(element: Element): string {
        const tag = element.tagName.toLowerCase();
        const role = element.getAttribute("role");

        // Check by role first
        if (role === "banner" || tag === "header") return "header";
        if (role === "contentinfo" || tag === "footer") return "footer";
        if (role === "navigation" || tag === "nav") return "navigation";
        if (role === "dialog" || element.classList.contains("modal"))
          return "modal";
        if (tag === "form") return "form";

        // Check by tag
        if (
          tag === "button" ||
          (tag === "input" && element.getAttribute("type") === "submit")
        )
          return "button";
        if (tag === "input" || tag === "textarea" || tag === "select")
          return "input";
        if (tag === "a") return "link";
        if (tag === "img" || tag === "picture" || tag === "svg") return "image";
        if (tag === "ul" || tag === "ol") return "list";
        if (
          tag === "main" ||
          tag === "section" ||
          tag === "article" ||
          tag === "div"
        )
          return "container";
        if (
          tag === "p" ||
          tag === "span" ||
          tag === "h1" ||
          tag === "h2" ||
          tag === "h3" ||
          tag === "h4" ||
          tag === "h5" ||
          tag === "h6"
        )
          return "text";

        return "other";
      }

      function isInteractive(element: Element): boolean {
        const tag = element.tagName.toLowerCase();
        const interactiveTags = ["button", "a", "input", "select", "textarea"];
        const role = element.getAttribute("role");
        const interactiveRoles = [
          "button",
          "link",
          "tab",
          "menuitem",
          "option",
        ];

        if (interactiveTags.includes(tag)) return true;
        if (role && interactiveRoles.includes(role)) return true;
        if (element.getAttribute("onclick")) return true;

        const style = window.getComputedStyle(element);
        if (style.cursor === "pointer") return true;

        return false;
      }

      function generateUniqueName(element: Element, type: string): string {
        const testId =
          element.getAttribute("data-testid") ||
          element.getAttribute("data-test") ||
          element.getAttribute("data-qa");
        if (testId) return testId.replace(/[-\s]/g, "_");

        if (element.id) return element.id.replace(/[-\s]/g, "_");

        const ariaLabel = element.getAttribute("aria-label");
        if (ariaLabel) {
          return ariaLabel
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "_")
            .replace(/^_|_$/g, "");
        }

        const text = element.textContent?.trim().slice(0, 30);
        if (text && text.length > 0) {
          return text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "_")
            .replace(/^_|_$/g, "");
        }

        const classes = Array.from(element.classList);
        if (classes.length > 0) {
          return classes[0].replace(/[-\s]/g, "_");
        }

        return `${type}_${elementId++}`;
      }

      function extractElement(element: Element): any {
        const attributes: Record<string, string> = {};
        Array.from(element.attributes).forEach((attr) => {
          attributes[attr.name] = attr.value;
        });

        const elementType = determineElementType(element);
        const uniqueName = generateUniqueName(element, elementType);

        return {
          id: `element_${elementId++}`,
          tagName: element.tagName.toLowerCase(),
          selector: getUniqueSelector(element),
          testId:
            element.getAttribute("data-testid") ||
            element.getAttribute("data-test") ||
            element.getAttribute("data-qa") ||
            undefined,
          ariaLabel: element.getAttribute("aria-label") || undefined,
          role: element.getAttribute("role") || undefined,
          text: element.textContent?.trim().slice(0, 100) || undefined,
          classes: Array.from(element.classList),
          styles: getComputedStyles(element),
          attributes,
          xpath: getXPath(element),
          isInteractive: isInteractive(element),
          elementType,
          uniqueName,
        };
      }

      // Extract key elements
      const selectors = [
        "header",
        "footer",
        "nav",
        "main",
        "aside",
        "section",
        "article",
        "form",
        "button",
        "a",
        "input",
        "textarea",
        "select",
        "img",
        "[data-testid]",
        "[data-test]",
        "[data-qa]",
        '[role="dialog"]',
        '[role="banner"]',
        '[role="navigation"]',
        ".modal",
        ".dropdown",
        ".menu",
        "h1",
        "h2",
        "h3",
      ];

      const foundElements = new Set<Element>();

      selectors.forEach((selector) => {
        try {
          document
            .querySelectorAll(selector)
            .forEach((el) => foundElements.add(el));
        } catch (e) {
          // Skip invalid selectors
        }
      });

      foundElements.forEach((element) => {
        elements.push(extractElement(element));
      });

      return elements;
    });

    return elementsData;
  }

  private categorizeSections(elements: PageElement[]): PageSection[] {
    const sections: PageSection[] = [];

    const sectionTypes: ElementType[] = [
      "header",
      "footer",
      "navigation",
      "form",
      "modal",
    ];

    sectionTypes.forEach((type) => {
      const sectionElements = elements.filter((el) => el.elementType === type);

      if (sectionElements.length > 0) {
        sections.push({
          name: type.charAt(0).toUpperCase() + type.slice(1),
          type,
          elements: sectionElements,
          selector: sectionElements[0]?.selector || "",
        });
      }
    });

    return sections;
  }
}
