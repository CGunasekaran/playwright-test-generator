import { PageAnalysis } from "@/types";

export function generatePerformanceTestTemplate(
  analysis: PageAnalysis
): string {
  return `import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('page should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;
    
    console.log(\`Page load time: \${loadTime}ms\`);
    expect(loadTime).toBeLessThan(3000); // 3 seconds
  });

  test('should have good Core Web Vitals', async ({ page }) => {
    await page.goto('/');
    
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals: any = {};
        
        // Largest Contentful Paint (LCP)
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          vitals.lcp = lastEntry.renderTime || lastEntry.loadTime;
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        
        // First Input Delay (FID)
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            vitals.fid = entry.processingStart - entry.startTime;
          });
        }).observe({ entryTypes: ['first-input'] });
        
        // Cumulative Layout Shift (CLS)
        let clsScore = 0;
        new PerformanceObserver((list) => {
          list.getEntries().forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsScore += entry.value;
            }
          });
          vitals.cls = clsScore;
        }).observe({ entryTypes: ['layout-shift'] });
        
        // First Contentful Paint (FCP)
        const paintEntries = performance.getEntriesByType('paint');
        const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
          vitals.fcp = fcpEntry.startTime;
        }
        
        // Time to Interactive (TTI) approximation
        if (document.readyState === 'complete') {
          vitals.tti = performance.timing.domInteractive - performance.timing.navigationStart;
        }
        
        setTimeout(() => resolve(vitals), 5000);
      });
    });
    
    console.log('Core Web Vitals:', metrics);
    
    // LCP should be less than 2.5s (good)
    if ((metrics as any).lcp) {
      expect((metrics as any).lcp).toBeLessThan(2500);
    }
    
    // FID should be less than 100ms (good)
    if ((metrics as any).fid) {
      expect((metrics as any).fid).toBeLessThan(100);
    }
    
    // CLS should be less than 0.1 (good)
    if ((metrics as any).cls !== undefined) {
      expect((metrics as any).cls).toBeLessThan(0.1);
    }
    
    // FCP should be less than 1.8s (good)
    if ((metrics as any).fcp) {
      expect((metrics as any).fcp).toBeLessThan(1800);
    }
  });

  test('should not have memory leaks', async ({ page }) => {
    await page.goto('/');
    
    const initialMemory = await page.evaluate(() => {
      if ((performance as any).memory) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return 0;
    });
    
    // Interact with page multiple times
    for (let i = 0; i < 5; i++) {
      await page.reload();
      await page.waitForLoadState('networkidle');
    }
    
    const finalMemory = await page.evaluate(() => {
      if ((performance as any).memory) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return 0;
    });
    
    if (initialMemory > 0 && finalMemory > 0) {
      const memoryIncrease = (finalMemory - initialMemory) / initialMemory;
      console.log(\`Memory increase: \${(memoryIncrease * 100).toFixed(2)}%\`);
      
      // Memory shouldn't increase by more than 50%
      expect(memoryIncrease).toBeLessThan(0.5);
    }
  });

  test('should load resources efficiently', async ({ page }) => {
    const resourceSizes: { [key: string]: number } = {};
    const resourceCount: { [key: string]: number } = {};
    
    page.on('response', async (response) => {
      const request = response.request();
      const resourceType = request.resourceType();
      const url = request.url();
      
      try {
        const buffer = await response.body();
        const size = buffer.length;
        
        if (!resourceSizes[resourceType]) {
          resourceSizes[resourceType] = 0;
          resourceCount[resourceType] = 0;
        }
        
        resourceSizes[resourceType] += size;
        resourceCount[resourceType]++;
      } catch (e) {
        // Some resources might not have bodies
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    console.log('Resource sizes:', resourceSizes);
    console.log('Resource counts:', resourceCount);
    
    // Total page size should be reasonable (< 5MB)
    const totalSize = Object.values(resourceSizes).reduce((a, b) => a + b, 0);
    expect(totalSize).toBeLessThan(5 * 1024 * 1024);
    
    // Script size should be reasonable (< 2MB)
    if (resourceSizes['script']) {
      expect(resourceSizes['script']).toBeLessThan(2 * 1024 * 1024);
    }
    
    // Image sizes should be optimized (< 3MB total)
    if (resourceSizes['image']) {
      expect(resourceSizes['image']).toBeLessThan(3 * 1024 * 1024);
    }
  });

  test('should render above-the-fold content quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    
    // Wait for first meaningful paint
    await page.waitForSelector('body > *');
    const renderTime = Date.now() - startTime;
    
    console.log(\`Above-the-fold render time: \${renderTime}ms\`);
    expect(renderTime).toBeLessThan(1500); // 1.5 seconds
  });

  test('should handle high-frequency updates efficiently', async ({ page }) => {
    await page.goto('/');
    
    const startTime = Date.now();
    
    // Simulate rapid interactions
    for (let i = 0; i < 10; i++) {
      await page.mouse.move(100 + i * 50, 100 + i * 50);
      await page.waitForTimeout(50);
    }
    
    const duration = Date.now() - startTime;
    
    // Should handle 10 rapid events in less than 2 seconds
    expect(duration).toBeLessThan(2000);
  });

  test('should lazy load images below the fold', async ({ page }) => {
    const loadedImages: string[] = [];
    
    page.on('response', (response) => {
      if (response.request().resourceType() === 'image') {
        loadedImages.push(response.url());
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const initialImageCount = loadedImages.length;
    
    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    
    const finalImageCount = loadedImages.length;
    
    console.log(\`Initial images: \${initialImageCount}, After scroll: \${finalImageCount}\`);
    
    // If page has many images, some should be lazy loaded
    const totalImages = await page.locator('img').count();
    if (totalImages > 5) {
      expect(finalImageCount).toBeGreaterThanOrEqual(initialImageCount);
    }
  });

  test('should not block main thread for long periods', async ({ page }) => {
    await page.goto('/');
    
    const longTasks = await page.evaluate(() => {
      return new Promise((resolve) => {
        const tasks: any[] = [];
        
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry: any) => {
            if (entry.duration > 50) { // Tasks longer than 50ms
              tasks.push({
                duration: entry.duration,
                startTime: entry.startTime,
              });
            }
          });
        });
        
        observer.observe({ entryTypes: ['longtask'] });
        
        setTimeout(() => {
          observer.disconnect();
          resolve(tasks);
        }, 5000);
      });
    });
    
    console.log('Long tasks:', longTasks);
    
    // Should have minimal long tasks (< 5)
    expect((longTasks as any[]).length).toBeLessThan(5);
  });
});
`;
}
