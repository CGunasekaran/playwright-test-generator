import { NextRequest, NextResponse } from "next/server";
import { chromium } from "playwright";
import { InteractionDetector } from "@/lib/interaction-detector";

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
        "--no-sandbox",
        "--disable-setuid-sandbox",
      ],
    });

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      extraHTTPHeaders: {
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "sec-ch-ua":
          '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
      },
    });

    const page = await context.newPage();

    // Remove webdriver detection
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "webdriver", {
        get: () => undefined,
      });
      (window as any).chrome = {
        runtime: {},
      };
    });

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
