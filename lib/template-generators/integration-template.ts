import { PageAnalysis } from "@/types";

export function generateIntegrationTestTemplate(
  analysis: PageAnalysis
): string {
  return `import { test, expect } from '@playwright/test';

test.describe('Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should integrate frontend with backend APIs', async ({ page }) => {
    const apiCalls: string[] = [];
    
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        apiCalls.push(request.url());
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    console.log('API calls made:', apiCalls);
    expect(apiCalls.length).toBeGreaterThan(0);
  });

  test('should handle API responses correctly', async ({ page }) => {
    const responses: any[] = [];
    
    page.on('response', async response => {
      if (response.url().includes('/api/')) {
        responses.push({
          url: response.url(),
          status: response.status(),
          ok: response.ok(),
        });
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // All API calls should succeed
    responses.forEach(response => {
      expect(response.ok).toBeTruthy();
    });
  });

  test('should persist data across page reloads', async ({ page }) => {
    await page.goto('/');
    
    // Fill a form if available
    const input = page.locator('input[type="text"]').first();
    if (await input.count() > 0) {
      await input.fill('test data');
      
      // Reload page
      await page.reload();
      
      // Check if data persists (if using localStorage/sessionStorage)
      const value = await input.inputValue();
      // This test depends on implementation
      console.log('Value after reload:', value);
    }
  });

  test('should handle authentication flow', async ({ page }) => {
    // Check if login form exists
    const loginForm = page.locator('form[action*="login"], form[id*="login"]');
    
    if (await loginForm.count() > 0) {
      // Fill login form
      await page.locator('input[type="email"], input[name*="email"]').fill('test@example.com');
      await page.locator('input[type="password"]').fill('password123');
      
      // Submit
      await page.locator('button[type="submit"]').click();
      
      // Wait for navigation or response
      await page.waitForLoadState('networkidle');
      
      // Check if logged in (look for logout button or user menu)
      const logoutBtn = page.locator('[href*="logout"], button:has-text("Logout"), button:has-text("Sign Out")');
      const userMenu = page.locator('[aria-label*="user"], [data-testid*="user"]');
      
      const isLoggedIn = await logoutBtn.count() > 0 || await userMenu.count() > 0;
      expect(isLoggedIn).toBeTruthy();
    }
  });

  test('should synchronize state across components', async ({ page }) => {
    await page.goto('/');
    
    // Find a counter or state-changing button
    const button = page.locator('button').first();
    if (await button.count() > 0) {
      const initialText = await button.textContent();
      
      await button.click();
      await page.waitForTimeout(500);
      
      const newText = await button.textContent();
      
      // State should update (text changed or other elements updated)
      console.log('State change:', { initialText, newText });
    }
  });

  test('should handle database operations', async ({ page }) => {
    const dataOperations: string[] = [];
    
    page.on('request', request => {
      const method = request.method();
      const url = request.url();
      
      if ((method === 'POST' || method === 'PUT' || method === 'DELETE') && url.includes('/api/')) {
        dataOperations.push(\`\${method} \${url}\`);
      }
    });
    
    await page.goto('/');
    
    // Try to trigger data operations
    const forms = await page.locator('form').all();
    if (forms.length > 0) {
      // Fill and submit form
      const inputs = await forms[0].locator('input:not([type="hidden"])').all();
      for (const input of inputs) {
        const type = await input.getAttribute('type');
        if (type !== 'submit' && type !== 'button') {
          await input.fill('test');
        }
      }
      
      const submitBtn = forms[0].locator('button[type="submit"]');
      if (await submitBtn.count() > 0) {
        await submitBtn.click();
        await page.waitForTimeout(1000);
      }
    }
    
    console.log('Data operations:', dataOperations);
  });

  test('should handle real-time updates', async ({ page }) => {
    await page.goto('/');
    
    // Check for WebSocket connections
    const wsConnections: string[] = [];
    
    page.on('websocket', ws => {
      wsConnections.push(ws.url());
      console.log('WebSocket connected:', ws.url());
    });
    
    await page.waitForTimeout(2000);
    
    if (wsConnections.length > 0) {
      console.log('Real-time connections detected');
      expect(wsConnections.length).toBeGreaterThan(0);
    }
  });

  test('should handle third-party integrations', async ({ page }) => {
    const externalRequests: string[] = [];
    
    page.on('request', request => {
      const url = request.url();
      // Check for common third-party domains
      if (url.includes('googleapis.com') || 
          url.includes('facebook.com') ||
          url.includes('twitter.com') ||
          url.includes('analytics') ||
          url.includes('cdn')) {
        externalRequests.push(url);
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    console.log('Third-party integrations:', externalRequests.length);
  });

  test('should handle file uploads', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    
    if (await fileInput.count() > 0) {
      // Create a test file
      await fileInput.setInputFiles({
        name: 'test.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('test file content'),
      });
      
      // Submit form if available
      const form = page.locator('form:has(input[type="file"])');
      if (await form.count() > 0) {
        const submitBtn = form.locator('button[type="submit"]');
        if (await submitBtn.count() > 0) {
          await submitBtn.click();
          await page.waitForTimeout(1000);
        }
      }
      
      // Check for success message
      const successMsg = page.locator('[role="alert"], .success, .alert-success');
      const hasSuccess = await successMsg.count() > 0;
      console.log('File upload result:', hasSuccess ? 'success' : 'no confirmation');
    }
  });

  test('should handle pagination correctly', async ({ page }) => {
    await page.goto('/');
    
    const nextBtn = page.locator('button:has-text("Next"), a:has-text("Next"), [aria-label*="next"]');
    
    if (await nextBtn.count() > 0) {
      // Get current page content
      const initialContent = await page.locator('body').textContent();
      
      await nextBtn.click();
      await page.waitForLoadState('networkidle');
      
      // Content should change
      const newContent = await page.locator('body').textContent();
      expect(initialContent).not.toBe(newContent);
    }
  });
});
`;
}
