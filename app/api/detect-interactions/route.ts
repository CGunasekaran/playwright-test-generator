import { NextRequest, NextResponse } from "next/server";
import { InteractionDetector } from "@/lib/interaction-detector";
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

    const page = await context.newPage();

    // Remove webdriver detection
    await page.addInitScript(antiDetectionScript);

    // Try multiple navigation strategies
    let navigationError = null;
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    } catch (e1) {
      navigationError = e1;
      try {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
      } catch (e2) {
        try {
          await page.goto(url, { waitUntil: "load", timeout: 30000 });
        } catch (e3) {
          throw new Error(
            `Failed to navigate to ${url}: ${
              navigationError instanceof Error
                ? navigationError.message
                : "Unknown error"
            }`
          );
        }
      }
    }

    const detector = new InteractionDetector(page);
    const flows = await detector.detectUserFlows(url);

    await context.close();

    return NextResponse.json({ flows });
  } catch (error: any) {
    console.error("Interaction detection error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to detect interactions" },
      { status: 500 }
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

export const maxDuration = 60;
