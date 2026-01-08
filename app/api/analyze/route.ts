import { NextRequest, NextResponse } from "next/server";
import { PageAnalyzer } from "@/lib/page-analyzer";
import { InteractionAnalyzer } from "@/lib/interaction-analyzer";
import { APICall } from "@/types";
import {
  createBrowser,
  defaultContextOptions,
  antiDetectionScript,
} from "@/lib/browser-config";

export async function POST(request: NextRequest) {
  let browser;

  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    browser = await createBrowser();

    const context = await browser.newContext(defaultContextOptions);

    // Remove automation indicators
    await context.addInitScript(antiDetectionScript);

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

    // Check for common error patterns
    if (error.message && error.message.includes("Executable doesn't exist")) {
      errorMessage =
        "Playwright browsers not installed. Please run: npx playwright install chromium";
    } else if (error.message && error.message.includes("connect")) {
      errorMessage =
        "Failed to connect to browser service. Please check your BROWSERLESS_WS_ENDPOINT configuration.";
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error("Error closing browser:", closeError);
      }
    }
  }
}

export const maxDuration = 60; // Set max duration for serverless function
