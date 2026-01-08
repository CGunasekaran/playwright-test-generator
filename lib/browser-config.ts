import { chromium, Browser } from "playwright-chromium";

/**
 * Creates a browser instance, either local or remote based on environment
 */
export async function createBrowser(): Promise<Browser> {
  const wsEndpoint = process.env.BROWSERLESS_WS_ENDPOINT;

  if (wsEndpoint) {
    // Connect to remote browser (e.g., Browserless.io for Vercel)
    console.log("Connecting to remote browser...");
    try {
      return await chromium.connect(wsEndpoint, {
        timeout: 30000, // 30 second timeout
      });
    } catch (error) {
      console.error("Failed to connect to remote browser:", error);
      throw new Error(
        `Failed to connect to remote browser. Please check your BROWSERLESS_WS_ENDPOINT configuration. Error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Launch local browser for development
  console.log("Launching local browser...");
  try {
    return await chromium.launch({
      headless: true,
      args: [
        "--disable-blink-features=AutomationControlled",
        "--disable-dev-shm-usage",
        "--no-sandbox",
        "--disable-setuid-sandbox",
      ],
    });
  } catch (error) {
    console.error("Failed to launch local browser:", error);
    throw new Error(
      `Failed to launch browser. Make sure Playwright browsers are installed: npx playwright install chromium. Error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Standard browser context options
 */
export const defaultContextOptions = {
  viewport: { width: 1920, height: 1080 },
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  extraHTTPHeaders: {
    "Accept-Language": "en-US,en;q=0.9",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    "sec-ch-ua":
      '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
  },
  locale: "en-US",
  timezoneId: "America/New_York",
  permissions: [],
  geolocation: undefined,
  colorScheme: "light" as const,
};

/**
 * Anti-detection script to inject into pages
 */
export const antiDetectionScript = () => {
  Object.defineProperty(navigator, "webdriver", {
    get: () => undefined,
  });
  (window as any).chrome = {
    runtime: {},
  };
};
