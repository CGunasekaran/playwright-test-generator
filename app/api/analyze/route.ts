import { NextRequest, NextResponse } from "next/server";
import { chromium } from "playwright";
import { PageAnalyzer } from "@/lib/page-analyzer";
import { InteractionAnalyzer } from "@/lib/interaction-analyzer";
import { APICall } from "@/types";

export async function POST(request: NextRequest) {
  let browser;

  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    browser = await chromium.launch({
      headless: true,
      args: [
        "--disable-blink-features=AutomationControlled",
        "--disable-dev-shm-usage",
        "--no-sandbox",
      ],
    });

    const context = await browser.newContext({
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
      colorScheme: "light",
    });

    // Remove automation indicators
    await context.addInitScript(() => {
      // Override the navigator.webdriver property
      Object.defineProperty(navigator, "webdriver", {
        get: () => false,
      });

      // Override plugins to make it look like a real browser
      Object.defineProperty(navigator, "plugins", {
        get: () => [1, 2, 3, 4, 5],
      });

      // Override languages
      Object.defineProperty(navigator, "languages", {
        get: () => ["en-US", "en"],
      });

      // Add chrome object if missing
      if (!(window as any).chrome) {
        (window as any).chrome = {
          runtime: {},
        };
      }

      // Override permissions
      const originalQuery = window.navigator.permissions.query;
      (window.navigator.permissions.query as any) = (parameters: any) =>
        parameters.name === "notifications"
          ? Promise.resolve({ state: "prompt" } as PermissionStatus)
          : originalQuery(parameters);
    });

    const page = await context.newPage();

    // Track API calls
    const apiCalls: APICall[] = [];
    page.on("response", async (response) => {
      const request = response.request();
      const url = request.url();

      // Only track API calls (not static assets)
      if (
        url.includes("/api/") ||
        url.includes("/graphql") ||
        response.request().resourceType() === "fetch" ||
        response.request().resourceType() === "xhr"
      ) {
        try {
          let responseBody = null;
          let requestBody = null;

          try {
            responseBody = await response.json();
          } catch {
            // Response might not be JSON
          }

          try {
            requestBody = request.postDataJSON();
          } catch {
            // Request might not have JSON body
          }

          apiCalls.push({
            method: request.method() as any,
            url: url,
            requestBody,
            responseBody,
            status: response.status(),
          });
        } catch (error) {
          console.error("Error capturing API call:", error);
        }
      }
    });

    const analyzer = new PageAnalyzer(page);

    const analysis = await analyzer.analyze(url);

    // Add detected API calls to analysis
    analysis.apiRoutes = apiCalls;

    // Optionally analyze interactions
    const interactionAnalyzer = new InteractionAnalyzer(page, analysis);
    const autoFlows = await interactionAnalyzer.analyzeInteractionPatterns();

    // Add auto-detected flows to userFlows
    analysis.userFlows = [...analysis.userFlows, ...autoFlows];

    await context.close();

    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error("Analysis error:", error);

    let errorMessage = error.message || "Failed to analyze page";

    // Check for Playwright browser not installed error
    if (error.message && error.message.includes("Executable doesn't exist")) {
      errorMessage =
        "Playwright browsers not installed. Please run: npx playwright install chromium";
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

export const maxDuration = 60; // Set max duration for serverless function
