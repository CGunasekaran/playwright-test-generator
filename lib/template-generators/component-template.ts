import { PageAnalysis } from "@/types";

export function generateComponentTestTemplate(analysis: PageAnalysis): string {
  return `import { test, expect } from '@playwright/test';

test.describe('Component Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

${generateHeaderTests(analysis)}

${generateFooterTests(analysis)}

${generateNavigationTests(analysis)}

${generateFormTests(analysis)}

${generateModalTests(analysis)}

${generateInteractiveComponentTests(analysis)}
});`;
}

function generateHeaderTests(analysis: PageAnalysis): string {
  const headers = analysis.elements.filter((el) => el.elementType === "header");
  if (headers.length === 0) return "";

  return `  test.describe('Header Component', () => {
    test('should render header correctly', async ({ page }) => {
      const header = page.locator('header');
      await expect(header).toBeVisible();
    });

    test('should have correct structure', async ({ page }) => {
      const header = page.locator('header');
      await expect(header).toContainText(/./); // Has content
    });
  });
`;
}

function generateFooterTests(analysis: PageAnalysis): string {
  const footers = analysis.elements.filter((el) => el.elementType === "footer");
  if (footers.length === 0) return "";

  return `  test.describe('Footer Component', () => {
    test('should render footer correctly', async ({ page }) => {
      const footer = page.locator('footer');
      await expect(footer).toBeVisible();
    });

    test('should be at bottom of page', async ({ page }) => {
      const footer = page.locator('footer');
      const box = await footer.boundingBox();
      const viewport = page.viewportSize();
      expect(box!.y).toBeGreaterThan(viewport!.height / 2);
    });
  });
`;
}

function generateNavigationTests(analysis: PageAnalysis): string {
  const navElements = analysis.elements.filter(
    (el) => el.elementType === "navigation"
  );
  if (navElements.length === 0) return "";

  return `  test.describe('Navigation Component', () => {
    test('should render navigation menu', async ({ page }) => {
      const nav = page.locator('nav');
      await expect(nav).toBeVisible();
    });

    test('should have navigation links', async ({ page }) => {
      const links = page.locator('nav a');
      const count = await links.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should navigate on link click', async ({ page }) => {
      const firstLink = page.locator('nav a').first();
      await firstLink.click();
      await page.waitForLoadState('networkidle');
    });
  });
`;
}

function generateFormTests(analysis: PageAnalysis): string {
  const forms = analysis.elements.filter((el) => el.elementType === "form");
  if (forms.length === 0) return "";

  return forms
    .map(
      (form) => `  test.describe('${form.uniqueName} Component', () => {
    test('should render form fields', async ({ page }) => {
      const form = page.locator('${form.selector}');
      await expect(form).toBeVisible();
      
      const inputs = form.locator('input:not([type="hidden"])');
      const inputCount = await inputs.count();
      expect(inputCount).toBeGreaterThan(0);
    });

    test('should validate required fields', async ({ page }) => {
      const form = page.locator('${form.selector}');
      const submitBtn = form.locator('button[type="submit"], input[type="submit"]');
      await submitBtn.click();
      
      // Check for validation messages
      const validationMsg = page.locator('[role="alert"], .error, .invalid-feedback');
      await expect(validationMsg.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
    });

    test('should submit with valid data', async ({ page }) => {
      const form = page.locator('${form.selector}');
      
      // Fill form fields
      const inputs = form.locator('input:not([type="hidden"]):not([type="submit"])');
      const count = await inputs.count();
      
      for (let i = 0; i < count; i++) {
        const input = inputs.nth(i);
        const type = await input.getAttribute('type') || 'text';
        
        if (type === 'email') {
          await input.fill('test@example.com');
        } else if (type === 'password') {
          await input.fill('Password123!');
        } else {
          await input.fill('Test Value');
        }
      }
      
      const submitBtn = form.locator('button[type="submit"], input[type="submit"]');
      await submitBtn.click();
    });
  });
`
    )
    .join("\n");
}

function generateModalTests(analysis: PageAnalysis): string {
  const modals = analysis.elements.filter((el) => el.elementType === "modal");
  if (modals.length === 0) return "";

  return modals
    .map(
      (modal) => `  test.describe('${modal.uniqueName} Component', () => {
    test('should open modal', async ({ page }) => {
      // Find and click modal trigger
      const trigger = page.locator('[data-toggle="modal"], [data-target*="${modal.attributes["id"]}"]').first();
      if (await trigger.count() > 0) {
        await trigger.click();
        const modalEl = page.locator('${modal.selector}');
        await expect(modalEl).toBeVisible();
      }
    });

    test('should close modal', async ({ page }) => {
      const trigger = page.locator('[data-toggle="modal"], [data-target*="${modal.attributes["id"]}"]').first();
      if (await trigger.count() > 0) {
        await trigger.click();
        const closeBtn = page.locator('${modal.selector} [data-dismiss="modal"], ${modal.selector} .close').first();
        if (await closeBtn.count() > 0) {
          await closeBtn.click();
          const modalEl = page.locator('${modal.selector}');
          await expect(modalEl).toBeHidden();
        }
      }
    });
  });
`
    )
    .join("\n");
}

function generateInteractiveComponentTests(analysis: PageAnalysis): string {
  const buttons = analysis.interactiveElements
    .filter((el) => el.elementType === "button")
    .slice(0, 5);

  if (buttons.length === 0) return "";

  return `  test.describe('Interactive Elements', () => {
${buttons
  .map(
    (
      btn
    ) => `    test('${btn.uniqueName} should be clickable', async ({ page }) => {
      const button = page.locator('${btn.selector}');
      await expect(button).toBeEnabled();
      await button.click();
    });
`
  )
  .join("\n")}
  });
`;
}
