import { Page } from 'playwright';
import { UserFlow, FlowStep, Interaction, APICall } from '@/types';

export class InteractionDetector {
  private page: Page;
  private recordedAPICalls: APICall[] = [];

  constructor(page: Page) {
    this.page = page;
  }

  async detectUserFlows(url: string): Promise<UserFlow[]> {
    // Setup API call recording
    await this.setupAPIRecording();

    const flows: UserFlow[] = [];

    // Detect common user flows
    const loginFlow = await this.detectLoginFlow();
    if (loginFlow) flows.push(loginFlow);

    const searchFlow = await this.detectSearchFlow();
    if (searchFlow) flows.push(searchFlow);

    const formFlow = await this.detectFormFlow();
    if (formFlow) flows.push(formFlow);

    const navigationFlow = await this.detectNavigationFlow();
    if (navigationFlow) flows.push(navigationFlow);

    const cartFlow = await this.detectCartFlow();
    if (cartFlow) flows.push(cartFlow);

    const filterFlow = await this.detectFilterFlow();
    if (filterFlow) flows.push(filterFlow);

    const modalFlow = await this.detectModalFlow();
    if (modalFlow) flows.push(modalFlow);

    const accordionFlow = await this.detectAccordionFlow();
    if (accordionFlow) flows.push(accordionFlow);

    const tabFlow = await this.detectTabFlow();
    if (tabFlow) flows.push(tabFlow);

    const infiniteScrollFlow = await this.detectInfiniteScrollFlow();
    if (infiniteScrollFlow) flows.push(infiniteScrollFlow);

    return flows;
  }

  private async setupAPIRecording(): Promise<void> {
    await this.page.route('**/*', (route) => {
      const request = route.request();
      
      if (request.resourceType() === 'xhr' || request.resourceType() === 'fetch') {
        route.continue().then(() => {
          route.request().response().then((response) => {
            if (response) {
              this.recordedAPICalls.push({
                method: request.method() as any,
                url: request.url(),
                requestBody: request.postDataJSON(),
                status: response.status(),
                responseBody: null, // Would need to be captured
              });
            }
          });
        });
      } else {
        route.continue();
      }
    });
  }

  private async detectLoginFlow(): Promise<UserFlow | null> {
    const loginSelectors = [
      'input[type="email"]',
      'input[type="password"]',
      'input[name*="email"]',
      'input[name*="username"]',
      'input[name*="password"]',
      'button[type="submit"]',
      'button:has-text("Login")',
      'button:has-text("Sign in")',
    ];

    const elements = await this.page.locator(loginSelectors.join(', ')).all();
    
    if (elements.length < 2) return null;

    const steps: FlowStep[] = [];
    let stepId = 1;

    // Check for email/username field
    const emailInput = await this.page.locator('input[type="email"], input[name*="email"], input[name*="username"]').first();
    if (await emailInput.count() > 0) {
      const selector = await this.getSelector(emailInput);
      steps.push({
        id: `step_${stepId++}`,
        action: {
          type: 'fill',
          element: selector,
          value: 'user@example.com',
        },
        screenshot: false,
      });
    }

    // Check for password field
    const passwordInput = await this.page.locator('input[type="password"]').first();
    if (await passwordInput.count() > 0) {
      const selector = await this.getSelector(passwordInput);
      steps.push({
        id: `step_${stepId++}`,
        action: {
          type: 'fill',
          element: selector,
          value: 'password123',
        },
        screenshot: false,
      });
    }

    // Check for submit button
    const submitButton = await this.page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")').first();
    if (await submitButton.count() > 0) {
      const selector = await this.getSelector(submitButton);
      steps.push({
        id: `step_${stepId++}`,
        action: {
          type: 'click',
          element: selector,
          waitFor: 'networkidle',
        },
        screenshot: true,
        visualRegression: true,
        assertion: {
          type: 'url',
          expected: '/dashboard',
        },
      });
    }

    if (steps.length === 0) return null;

    return {
      name: 'Login Flow',
      description: 'User login with email and password',
      steps,
      expectedAPICalls: this.recordedAPICalls.filter(call => 
        call.url.includes('login') || call.url.includes('auth')
      ),
      visualCheckpoints: [
        {
          name: 'login-page-initial',
          fullPage: true,
          mask: [],
        },
        {
          name: 'dashboard-after-login',
          fullPage: true,
          mask: ['header', 'footer'],
        },
      ],
    };
  }

  private async detectSearchFlow(): Promise<UserFlow | null> {
    const searchSelectors = [
      'input[type="search"]',
      'input[placeholder*="Search" i]',
      'input[aria-label*="Search" i]',
      'input[name*="search" i]',
      '[role="search"] input',
    ];

    const searchInput = await this.page.locator(searchSelectors.join(', ')).first();
    if (await searchInput.count() === 0) return null;

    const steps: FlowStep[] = [];
    const selector = await this.getSelector(searchInput);

    steps.push({
      id: 'step_1',
      action: {
        type: 'fill',
        element: selector,
        value: 'test query',
      },
      screenshot: false,
    });

    steps.push({
      id: 'step_2',
      action: {
        type: 'press',
        element: selector,
        value: 'Enter',
        waitFor: 'networkidle',
      },
      screenshot: true,
      visualRegression: true,
    });

    return {
      name: 'Search Flow',
      description: 'User performs a search query',
      steps,
      expectedAPICalls: this.recordedAPICalls.filter(call => 
        call.url.includes('search') || call.url.includes('query')
      ),
      visualCheckpoints: [
        {
          name: 'search-results',
          fullPage: true,
          mask: [],
        },
      ],
    };
  }

  private async detectFormFlow(): Promise<UserFlow | null> {
    const forms = await this.page.locator('form').all();
    if (forms.length === 0) return null;

    const steps: FlowStep[] = [];
    let stepId = 1;

    for (const form of forms.slice(0, 1)) { // Process first form
      const inputs = await form.locator('input, select, textarea').all();

      for (const input of inputs) {
        const type = await input.getAttribute('type');
        const tagName = await input.evaluate(el => el.tagName.toLowerCase());
        const selector = await this.getSelector(input);

        if (tagName === 'input') {
          if (type === 'text' || type === 'email' || type === 'tel') {
            steps.push({
              id: `step_${stepId++}`,
              action: {
                type: 'fill',
                element: selector,
                value: type === 'email' ? 'test@example.com' : 'Test Value',
              },
              screenshot: false,
            });
          } else if (type === 'checkbox' || type === 'radio') {
            steps.push({
              id: `step_${stepId++}`,
              action: {
                type: 'check',
                element: selector,
              },
              screenshot: false,
            });
          }
        } else if (tagName === 'select') {
          steps.push({
            id: `step_${stepId++}`,
            action: {
              type: 'select',
              element: selector,
              value: 'option1',
            },
            screenshot: false,
          });
        } else if (tagName === 'textarea') {
          steps.push({
            id: `step_${stepId++}`,
            action: {
              type: 'fill',
              element: selector,
              value: 'Test message',
            },
            screenshot: false,
          });
        }
      }

      // Add submit action
      const submitButton = await form.locator('button[type="submit"], input[type="submit"]').first();
      if (await submitButton.count() > 0) {
        const selector = await this.getSelector(submitButton);
        steps.push({
          id: `step_${stepId++}`,
          action: {
            type: 'click',
            element: selector,
            waitFor: 'networkidle',
          },
          screenshot: true,
          visualRegression: true,
        });
      }
    }

    if (steps.length === 0) return null;

    return {
      name: 'Form Submission Flow',
      description: 'User fills and submits a form',
      steps,
      expectedAPICalls: this.recordedAPICalls,
      visualCheckpoints: [
        {
          name: 'form-filled',
          fullPage: false,
          selector: 'form',
          mask: [],
        },
      ],
    };
  }

  private async detectNavigationFlow(): Promise<UserFlow | null> {
    const navLinks = await this.page.locator('nav a, header a').all();
    if (navLinks.length === 0) return null;

    const steps: FlowStep[] = [];
    
    for (let i = 0; i < Math.min(3, navLinks.length); i++) {
      const link = navLinks[i];
      const selector = await this.getSelector(link);
      const text = await link.textContent();

      steps.push({
        id: `step_${i + 1}`,
        action: {
          type: 'click',
          element: selector,
          waitFor: 'networkidle',
        },
        screenshot: true,
        visualRegression: true,
        assertion: {
          type: 'visible',
          selector: 'main, [role="main"]',
          expected: true,
        },
      });
    }

    return {
      name: 'Navigation Flow',
      description: 'User navigates through main menu items',
      steps,
      expectedAPICalls: [],
      visualCheckpoints: steps.map((_, idx) => ({
        name: `nav-page-${idx + 1}`,
        fullPage: true,
        mask: ['header', 'footer'],
      })),
    };
  }

  private async detectCartFlow(): Promise<UserFlow | null> {
    const addToCartSelectors = [
      'button:has-text("Add to Cart")',
      'button:has-text("Add to Bag")',
      'button[aria-label*="Add to cart" i]',
      '.add-to-cart',
    ];

    const addButton = await this.page.locator(addToCartSelectors.join(', ')).first();
    if (await addButton.count() === 0) return null;

    const steps: FlowStep[] = [];
    const selector = await this.getSelector(addButton);

    steps.push({
      id: 'step_1',
      action: {
        type: 'click',
        element: selector,
        waitFor: 'networkidle',
      },
      screenshot: true,
      visualRegression: true,
    });

    // Check for cart icon
    const cartIcon = await this.page.locator('[aria-label*="cart" i], [data-testid*="cart"]').first();
    if (await cartIcon.count() > 0) {
      const cartSelector = await this.getSelector(cartIcon);
      steps.push({
        id: 'step_2',
        action: {
          type: 'click',
          element: cartSelector,
        },
        screenshot: true,
        visualRegression: true,
      });
    }

    return {
      name: 'Add to Cart Flow',
      description: 'User adds item to shopping cart',
      steps,
      expectedAPICalls: this.recordedAPICalls.filter(call => 
        call.url.includes('cart') || call.url.includes('basket')
      ),
      visualCheckpoints: [
        {
          name: 'product-added',
          fullPage: false,
          selector: '.cart-notification, .toast',
          mask: [],
        },
        {
          name: 'cart-page',
          fullPage: true,
          mask: [],
        },
      ],
    };
  }

  private async detectFilterFlow(): Promise<UserFlow | null> {
    const filterSelectors = [
      'input[type="checkbox"]',
      'select',
      '[role="checkbox"]',
      '.filter',
    ];

    const filters = await this.page.locator(filterSelectors.join(', ')).all();
    if (filters.length === 0) return null;

    const steps: FlowStep[] = [];
    
    for (let i = 0; i < Math.min(2, filters.length); i++) {
      const filter = filters[i];
      const selector = await this.getSelector(filter);
      const tagName = await filter.evaluate(el => el.tagName.toLowerCase());

      if (tagName === 'input') {
        steps.push({
          id: `step_${i + 1}`,
          action: {
            type: 'check',
            element: selector,
            waitFor: 'networkidle',
          },
          screenshot: true,
        });
      } else if (tagName === 'select') {
        steps.push({
          id: `step_${i + 1}`,
          action: {
            type: 'select',
            element: selector,
            value: 'option1',
            waitFor: 'networkidle',
          },
          screenshot: true,
        });
      }
    }

    if (steps.length === 0) return null;

    return {
      name: 'Filter Flow',
      description: 'User applies filters to refine results',
      steps,
      expectedAPICalls: this.recordedAPICalls,
      visualCheckpoints: [
        {
          name: 'filtered-results',
          fullPage: true,
          mask: [],
        },
      ],
    };
  }

  private async detectModalFlow(): Promise<UserFlow | null> {
    const modalTriggers = await this.page.locator('[data-modal], [data-toggle="modal"], button:has-text("Open")').all();
    if (modalTriggers.length === 0) return null;

    const trigger = modalTriggers[0];
    const selector = await this.getSelector(trigger);

    const steps: FlowStep[] = [
      {
        id: 'step_1',
        action: {
          type: 'click',
          element: selector,
        },
        screenshot: true,
        visualRegression: true,
        assertion: {
          type: 'visible',
          selector: '[role="dialog"], .modal',
          expected: true,
        },
      },
    ];

    return {
      name: 'Modal Interaction Flow',
      description: 'User opens and interacts with modal dialog',
      steps,
      expectedAPICalls: [],
      visualCheckpoints: [
        {
          name: 'modal-open',
          fullPage: false,
          selector: '[role="dialog"], .modal',
          mask: [],
        },
      ],
    };
  }

  private async detectAccordionFlow(): Promise<UserFlow | null> {
    const accordionItems = await this.page.locator('[role="button"][aria-expanded]').all();
    if (accordionItems.length === 0) return null;

    const steps: FlowStep[] = [];
    
    for (let i = 0; i < Math.min(2, accordionItems.length); i++) {
      const selector = await this.getSelector(accordionItems[i]);
      steps.push({
        id: `step_${i + 1}`,
        action: {
          type: 'click',
          element: selector,
        },
        screenshot: true,
      });
    }

    return {
      name: 'Accordion Expansion Flow',
      description: 'User expands accordion sections',
      steps,
      expectedAPICalls: [],
      visualCheckpoints: [
        {
          name: 'accordion-expanded',
          fullPage: false,
          selector: '[role="region"]',
          mask: [],
        },
      ],
    };
  }

  private async detectTabFlow(): Promise<UserFlow | null> {
    const tabs = await this.page.locator('[role="tab"]').all();
    if (tabs.length === 0) return null;

    const steps: FlowStep[] = [];
    
    for (let i = 0; i < Math.min(3, tabs.length); i++) {
      const selector = await this.getSelector(tabs[i]);
      steps.push({
        id: `step_${i + 1}`,
        action: {
          type: 'click',
          element: selector,
        },
        screenshot: true,
        visualRegression: true,
      });
    }

    return {
      name: 'Tab Navigation Flow',
      description: 'User switches between tabs',
      steps,
      expectedAPICalls: [],
      visualCheckpoints: steps.map((_, idx) => ({
        name: `tab-${idx + 1}`,
        fullPage: false,
        selector: '[role="tabpanel"]',
        mask: [],
      })),
    };
  }

  private async detectInfiniteScrollFlow(): Promise<UserFlow | null> {
    const initialHeight = await this.page.evaluate(() => document.body.scrollHeight);
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await this.page.waitForTimeout(1000);
    const newHeight = await this.page.evaluate(() => document.body.scrollHeight);

    if (newHeight <= initialHeight) return null;

    return {
      name: 'Infinite Scroll Flow',
      description: 'User scrolls to load more content',
      steps: [
        {
          id: 'step_1',
          action: {
            type: 'scroll',
            element: 'body',
            value: 'bottom',
            waitFor: 'networkidle',
          },
          screenshot: true,
        },
      ],
      expectedAPICalls: this.recordedAPICalls,
      visualCheckpoints: [
        {
          name: 'scrolled-content',
          fullPage: true,
          mask: [],
        },
      ],
    };
  }

  private async getSelector(locator: any): Promise<string> {
    try {
      const testId = await locator.getAttribute('data-testid');
      if (testId) return `[data-testid="${testId}"]`;

      const id = await locator.getAttribute('id');
      if (id) return `#${id}`;

      const ariaLabel = await locator.getAttribute('aria-label');
      if (ariaLabel) return `[aria-label="${ariaLabel}"]`;

      return await locator.evaluate((el: Element) => {
        const tag = el.tagName.toLowerCase();
        const classes = Array.from(el.classList).slice(0, 2).join('.');
        return classes ? `${tag}.${classes}` : tag;
      });
    } catch {
      return 'unknown';
    }
  }
}
