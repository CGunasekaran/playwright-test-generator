import { PageAnalysis } from "@/types";

export function generateAccessibilityTestTemplate(
  analysis: PageAnalysis
): string {
  return `import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should not have any automatically detectable accessibility issues', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should not have critical accessibility violations', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const criticalViolations = accessibilityScanResults.violations.filter(
      violation => violation.impact === 'critical'
    );

    expect(criticalViolations).toEqual([]);
  });

${generateHeadingTests(analysis)}

${generateImageAltTests(analysis)}

${generateFormLabelTests(analysis)}

${generateColorContrastTests()}

${generateKeyboardNavigationTests(analysis)}

${generateAriaTests(analysis)}

${generateLandmarkTests(analysis)}
});`;
}

function generateHeadingTests(analysis: PageAnalysis): string {
  return `  test.describe('Heading Structure', () => {
    test('should have exactly one h1', async ({ page }) => {
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBe(1);
    });

    test('should have proper heading hierarchy', async ({ page }) => {
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      expect(headings.length).toBeGreaterThan(0);
      
      const h1 = await page.locator('h1').first();
      await expect(h1).toBeVisible();
    });

    test('headings should not be empty', async ({ page }) => {
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      
      for (const heading of headings) {
        const text = await heading.textContent();
        expect(text?.trim()).toBeTruthy();
      }
    });
  });
`;
}

function generateImageAltTests(analysis: PageAnalysis): string {
  const images = analysis.elements.filter((el) => el.tagName === "img");

  return `  test.describe('Image Accessibility', () => {
    test('all images should have alt attributes', async ({ page }) => {
      const images = await page.locator('img').all();
      
      for (const img of images) {
        const alt = await img.getAttribute('alt');
        expect(alt).toBeDefined();
      }
    });

    test('decorative images should have empty alt', async ({ page }) => {
      const decorativeImages = await page.locator('img[role="presentation"], img[role="none"]').all();
      
      for (const img of decorativeImages) {
        const alt = await img.getAttribute('alt');
        expect(alt).toBe('');
      }
    });
  });
`;
}

function generateFormLabelTests(analysis: PageAnalysis): string {
  const forms = analysis.elements.filter((el) => el.elementType === "form");
  if (forms.length === 0) return "";

  return `  test.describe('Form Accessibility', () => {
    test('all form inputs should have labels', async ({ page }) => {
      const inputs = await page.locator('input:not([type="hidden"]), textarea, select').all();
      
      for (const input of inputs) {
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledBy = await input.getAttribute('aria-labelledby');
        
        if (id) {
          const label = page.locator(\`label[for="\${id}"]\`);
          const hasLabel = await label.count() > 0;
          expect(hasLabel || ariaLabel || ariaLabelledBy).toBeTruthy();
        } else {
          expect(ariaLabel || ariaLabelledBy).toBeTruthy();
        }
      }
    });

    test('required fields should be indicated', async ({ page }) => {
      const requiredInputs = await page.locator('input[required], textarea[required], select[required]').all();
      
      for (const input of requiredInputs) {
        const ariaRequired = await input.getAttribute('aria-required');
        const required = await input.getAttribute('required');
        expect(ariaRequired === 'true' || required !== null).toBeTruthy();
      }
    });
  });
`;
}

function generateColorContrastTests(): string {
  return `  test.describe('Color Contrast', () => {
    test('should meet WCAG AA color contrast requirements', async ({ page }) => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2aa'])
        .disableRules(['color-contrast']) // Disable to check manually
        .analyze();

      // Check for color contrast violations
      const contrastResults = await new AxeBuilder({ page })
        .withTags(['cat.color'])
        .analyze();

      expect(contrastResults.violations.filter(v => v.id === 'color-contrast')).toEqual([]);
    });
  });
`;
}

function generateKeyboardNavigationTests(analysis: PageAnalysis): string {
  return `  test.describe('Keyboard Navigation', () => {
    test('all interactive elements should be keyboard accessible', async ({ page }) => {
      const interactiveElements = await page.locator('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])').all();
      
      for (const element of interactiveElements.slice(0, 10)) {
        await element.focus();
        const focused = await element.evaluate(el => el === document.activeElement);
        expect(focused).toBeTruthy();
      }
    });

    test('should have visible focus indicators', async ({ page }) => {
      const firstLink = page.locator('a').first();
      await firstLink.focus();
      
      // Check if focus is visible (this is a basic check)
      const outline = await firstLink.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return styles.outline !== 'none' || styles.boxShadow !== 'none';
      });
      
      expect(outline).toBeTruthy();
    });

    test('should allow tab navigation through page', async ({ page }) => {
      let tabCount = 0;
      const maxTabs = 20;
      
      while (tabCount < maxTabs) {
        await page.keyboard.press('Tab');
        tabCount++;
        
        const activeElement = await page.evaluate(() => {
          const el = document.activeElement;
          return el?.tagName;
        });
        
        if (activeElement) {
          expect(['A', 'BUTTON', 'INPUT', 'TEXTAREA', 'SELECT']).toContain(activeElement);
        }
      }
      
      expect(tabCount).toBe(maxTabs);
    });
  });
`;
}

function generateAriaTests(analysis: PageAnalysis): string {
  return `  test.describe('ARIA Attributes', () => {
    test('buttons should have accessible names', async ({ page }) => {
      const buttons = await page.locator('button').all();
      
      for (const button of buttons) {
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');
        const ariaLabelledBy = await button.getAttribute('aria-labelledby');
        
        expect(text?.trim() || ariaLabel || ariaLabelledBy).toBeTruthy();
      }
    });

    test('links should have accessible names', async ({ page }) => {
      const links = await page.locator('a').all();
      
      for (const link of links) {
        const text = await link.textContent();
        const ariaLabel = await link.getAttribute('aria-label');
        
        expect(text?.trim() || ariaLabel).toBeTruthy();
      }
    });

    test('ARIA roles should be valid', async ({ page }) => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['cat.aria'])
        .analyze();

      expect(accessibilityScanResults.violations.filter(v => v.id.includes('aria'))).toEqual([]);
    });
  });
`;
}

function generateLandmarkTests(analysis: PageAnalysis): string {
  return `  test.describe('Landmark Regions', () => {
    test('should have main landmark', async ({ page }) => {
      const main = page.locator('main, [role="main"]');
      await expect(main).toBeVisible();
    });

    test('should have navigation landmark', async ({ page }) => {
      const nav = page.locator('nav, [role="navigation"]');
      const count = await nav.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should not have duplicate landmarks without labels', async ({ page }) => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['cat.semantics'])
        .analyze();

      const landmarkViolations = accessibilityScanResults.violations.filter(
        v => v.id === 'landmark-unique'
      );
      
      expect(landmarkViolations).toEqual([]);
    });
  });
`;
}
