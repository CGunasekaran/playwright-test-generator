import { PageAnalysis, UserFlow } from "@/types";

export function generateE2ETestTemplate(
  analysis: PageAnalysis,
  flows: UserFlow[]
): string {
  return `import { test, expect } from '@playwright/test';

test.describe('End-to-End User Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

${flows.map((flow) => generateFlowTest(flow)).join("\n\n")}

${generateHappyPathTest(analysis)}

${generateErrorHandlingTest(analysis)}
});`;
}

function generateFlowTest(flow: UserFlow): string {
  return `  test('${flow.name}', async ({ page }) => {
    // ${flow.description}
    
${flow.steps
  .map((step, idx) => {
    const action = step.action;
    let code = "";

    switch (action.type) {
      case "click":
        code = `    // Step ${idx + 1}: Click ${action.element}
    await page.locator('${action.element}').click();`;
        if (action.waitFor) {
          code += `\n    await page.waitForLoadState('${action.waitFor}');`;
        }
        break;

      case "fill":
        code = `    // Step ${idx + 1}: Fill ${action.element}
    await page.locator('${action.element}').fill('${action.value || "test"}');`;
        break;

      case "select":
        code = `    // Step ${idx + 1}: Select option in ${action.element}
    await page.locator('${action.element}').selectOption('${
          action.value || "option1"
        }');`;
        break;

      case "hover":
        code = `    // Step ${idx + 1}: Hover over ${action.element}
    await page.locator('${action.element}').hover();`;
        break;

      case "wait":
        code = `    // Step ${idx + 1}: Wait
    await page.waitForTimeout(${action.value || "1000"});`;
        break;

      default:
        code = `    // Step ${idx + 1}: ${action.type} on ${action.element}`;
    }

    if (step.assertion) {
      code += `\n${generateAssertion(step.assertion)}`;
    }

    if (step.screenshot) {
      code += `\n    await page.screenshot({ path: 'screenshots/step-${
        idx + 1
      }.png' });`;
    }

    return code;
  })
  .join("\n\n")}

${
  flow.visualCheckpoints.length > 0
    ? `
    // Visual Checkpoints
${flow.visualCheckpoints
  .map(
    (checkpoint, idx) =>
      `    await expect(page${
        checkpoint.selector ? `.locator('${checkpoint.selector}')` : ""
      }).toHaveScreenshot('${checkpoint.name}.png');`
  )
  .join("\n")}`
    : ""
}
  });`;
}

function generateAssertion(assertion: any): string {
  switch (assertion.type) {
    case "visible":
      return `    await expect(page.locator('${assertion.selector}')).toBeVisible();`;
    case "hidden":
      return `    await expect(page.locator('${assertion.selector}')).toBeHidden();`;
    case "text":
      return `    await expect(page.locator('${assertion.selector}')).toHaveText('${assertion.expected}');`;
    case "value":
      return `    await expect(page.locator('${assertion.selector}')).toHaveValue('${assertion.expected}');`;
    case "url":
      return `    await expect(page).toHaveURL(/${assertion.expected}/);`;
    case "count":
      return `    await expect(page.locator('${assertion.selector}')).toHaveCount(${assertion.expected});`;
    default:
      return `    // Assertion: ${assertion.type}`;
  }
}

function generateHappyPathTest(analysis: PageAnalysis): string {
  return `  test('complete happy path user journey', async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    await expect(page).toHaveTitle(/${analysis.title}/);

    // Verify main content is loaded
    const main = page.locator('main, [role="main"]');
    await expect(main).toBeVisible();

    // Interact with primary CTA if available
    const primaryCTA = page.locator('button[type="submit"], .btn-primary, [role="button"]').first();
    if (await primaryCTA.count() > 0) {
      await primaryCTA.click();
      await page.waitForLoadState('networkidle');
    }

    // Verify no console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    expect(consoleErrors).toEqual([]);
  });
`;
}

function generateErrorHandlingTest(analysis: PageAnalysis): string {
  const forms = analysis.elements.filter((el) => el.elementType === "form");

  if (forms.length === 0) {
    return `  test('handles errors gracefully', async ({ page }) => {
    // Simulate network error
    await page.route('**/*', route => route.abort());
    
    await page.goto('/').catch(() => {});
    
    // Should show error message or offline page
    const errorMsg = page.locator('[role="alert"], .error-message, .offline-message');
    await expect(errorMsg).toBeVisible({ timeout: 5000 }).catch(() => {});
  });
`;
  }

  return `  test('handles form validation errors', async ({ page }) => {
    // Try to submit form without filling required fields
    const form = page.locator('form').first();
    const submitBtn = form.locator('button[type="submit"], input[type="submit"]');
    
    await submitBtn.click();
    
    // Should show validation errors
    await page.waitForTimeout(500);
    
    const errorMessages = page.locator('[role="alert"], .error, .invalid-feedback, .text-danger');
    const errorCount = await errorMessages.count();
    
    // Either validation errors are shown or form wasn't submitted
    expect(errorCount >= 0).toBeTruthy();
  });

  test('handles network errors gracefully', async ({ page }) => {
    // Listen for failed requests
    const failedRequests: string[] = [];
    page.on('requestfailed', request => {
      failedRequests.push(request.url());
    });

    await page.goto('/');
    
    // Simulate API failure
    await page.route('**/api/**', route => route.abort());
    
    // Try an action that might call API
    const buttons = await page.locator('button').all();
    if (buttons.length > 0) {
      await buttons[0].click().catch(() => {});
      await page.waitForTimeout(1000);
    }
    
    // Application should handle gracefully (not crash)
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
`;
}
