import { APICall } from '@/types';

export class APIMockGenerator {
  private apiCalls: APICall[];

  constructor(apiCalls: APICall[]) {
    this.apiCalls = apiCalls;
  }

  generateMSWHandlers(): string {
    return `import { rest } from 'msw';

export const handlers = [
${this.apiCalls.map(call => this.generateMSWHandler(call)).join(',\n\n')}
];`;
  }

  private generateMSWHandler(call: APICall): string {
    const method = call.method.toLowerCase();
    const mockResponse = call.mockResponse || this.generateMockResponse(call);

    return `  rest.${method}('${call.url}', (req, res, ctx) => {
    return res(
      ctx.status(${call.status}),
      ctx.json(${JSON.stringify(mockResponse, null, 2).split('\n').join('\n      ')})
    );
  })`;
  }

  private generateMockResponse(call: APICall): any {
    if (call.responseBody) return call.responseBody;

    // Generate mock based on URL pattern
    if (call.url.includes('user') || call.url.includes('profile')) {
      return {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
      };
    }

    if (call.url.includes('product')) {
      return {
        id: 1,
        name: 'Test Product',
        price: 99.99,
        inStock: true,
      };
    }

    if (call.url.includes('cart')) {
      return {
        items: [],
        total: 0,
      };
    }

    return { success: true };
  }

  generatePlaywrightMocks(): string {
    return `import { Page } from '@playwright/test';

export async function setupAPIMocks(page: Page) {
${this.apiCalls.map(call => this.generatePlaywrightMock(call)).join('\n\n')}
}`;
  }

  private generatePlaywrightMock(call: APICall): string {
    const mockResponse = call.mockResponse || this.generateMockResponse(call);

    return `  await page.route('${call.url}', async (route) => {
    await route.fulfill({
      status: ${call.status},
      contentType: 'application/json',
      body: JSON.stringify(${JSON.stringify(mockResponse, null, 2).split('\n').join('\n        ')}),
    });
  });`;
  }

  generateFixtures(): string {
    const fixtures: Record<string, any> = {};

    this.apiCalls.forEach((call) => {
      const key = this.getFixtureKey(call.url);
      fixtures[key] = call.mockResponse || this.generateMockResponse(call);
    });

    return `export const apiFixtures = ${JSON.stringify(fixtures, null, 2)};`;
  }

  private getFixtureKey(url: string): string {
    const parts = url.split('/').filter(Boolean);
    return parts[parts.length - 1] || 'default';
  }

  generateAPITestFile(): string {
    return `import { test, expect } from '@playwright/test';
import { setupAPIMocks } from './api-mocks';

test.describe('API Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupAPIMocks(page);
  });

${this.apiCalls.map((call, idx) => this.generateAPITest(call, idx)).join('\n\n')}
});`;
  }

  private generateAPITest(call: APICall, index: number): string {
    return `  test('API Call ${index + 1}: ${call.method} ${call.url}', async ({ page }) => {
    let apiCalled = false;
    let requestData: any = null;
    let responseData: any = null;

    page.on('request', (request) => {
      if (request.url().includes('${call.url}')) {
        apiCalled = true;
        requestData = request.postDataJSON();
      }
    });

    page.on('response', async (response) => {
      if (response.url().includes('${call.url}')) {
        responseData = await response.json();
      }
    });

    // Trigger the API call (update with actual user action)
    // await page.click('button');

    expect(apiCalled).toBe(true);
    expect(responseData).toBeDefined();
  });`;
  }
}
