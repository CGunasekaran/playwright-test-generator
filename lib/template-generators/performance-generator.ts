import { PageAnalysis } from '@/types';

export class PerformanceTestGenerator {
  private analysis: PageAnalysis;

  constructor(analysis: PageAnalysis) {
    this.analysis = analysis;
  }

  generate(): string {
    return `import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000); // 3 seconds
  });

  test('should have good Core Web Vitals', async ({ page }) => {
    await page.goto('/');
    
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const vitals: any = {};
          
          entries.forEach((entry: any) => {
            if (entry.name === 'first-contentful-paint') {
              vitals.fcp = entry.startTime;
            }
            if (entry.entryType === 'largest-contentful-paint') {
              vitals.lcp = entry.startTime;
            }
            if (entry.name === 'first-input') {
              vitals.fid = entry.processingStart - entry.startTime;
            }
          });
          
          resolve(vitals);
        }).observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input'] });
        
        setTimeout(() => resolve({}), 5000);
      });
    });
    
    // LCP should be less than 2.5s
    if ((metrics as any).lcp) {
      expect((metrics as any).lcp).toBeLessThan(2500);
    }
    
    // FCP should be less than 1.8s
    if ((metrics as any).fcp) {
      expect((metrics as any).fcp).toBeLessThan(1800);
    }
  });

  test('should not have layout shifts', async ({ page }) => {
    await page.goto('/');
    
    const cls = await page.evaluate(() => {
      return new Promise((resolve) => {
        let clsValue = 0;
        
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as any[]) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
        }).observe({ entryTypes: ['layout-shift'] });
        
        setTimeout(() => resolve(clsValue), 3000);
      });
    });
    
    expect(cls).toBeLessThan(0.1); // CLS should be less than 0.1
  });

  test('should load images efficiently', async ({ page }) => {
    await page.goto('/');
    
    const imageMetrics = await page.evaluate(() => {
      const images = Array.from(document.images);
      return images.map(img => ({
        src: img.src,
        loading: img.loading,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        displayWidth: img.width,
        displayHeight: img.height,
      }));
    });
    
    // Check for lazy loading
    const lazyLoadedImages = imageMetrics.filter(img => img.loading === 'lazy');
    expect(lazyLoadedImages.length).toBeGreaterThan(0);
    
    // Check for properly sized images
    imageMetrics.forEach(img => {
      if (img.displayWidth > 0) {
        const scaleFactor = img.naturalWidth / img.displayWidth;
        expect(scaleFactor).toBeLessThan(2); // Not more than 2x oversized
      }
    });
  });

  test('should have efficient resource loading', async ({ page }) => {
    const resources: any[] = [];
    
    page.on('response', (response) => {
      resources.push({
        url: response.url(),
        status: response.status(),
        size: response.headers()['content-length'],
        type: response.request().resourceType(),
      });
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for proper caching
    const cachedResources = resources.filter(r => 
      r.status === 304 || 
      (r.status === 200 && r.url.includes('cache'))
    );
    
    // Check for compressed resources
    const largeUncompressed = resources.filter(r => 
      r.size > 100000 && 
      !r.url.includes('.jpg') && 
      !r.url.includes('.png')
    );
    
    expect(largeUncompressed.length).toBe(0);
  });

  test('should minimize JavaScript bundle size', async ({ page }) => {
    const jsResources: any[] = [];
    
    page.on('response', async (response) => {
      if (response.request().resourceType() === 'script') {
        const size = parseInt(response.headers()['content-length'] || '0');
        jsResources.push({
          url: response.url(),
          size,
        });
      }
    });
    
    await page.goto('/');
    
    const totalJSSize = jsResources.reduce((sum, r) => sum + r.size, 0);
    expect(totalJSSize).toBeLessThan(500000); // Less than 500KB
  });

  test('should use connection pooling', async ({ page }) => {
    const connectionCount = await page.evaluate(() => {
      return (performance as any).getEntriesByType('resource')
        .filter((r: any) => r.nextHopProtocol === 'h2')
        .length;
    });
    
    expect(connectionCount).toBeGreaterThan(0); // Should use HTTP/2
  });

  test('should render above-the-fold content quickly', async ({ page }) => {
    await page.goto('/');
    
    const aboveFoldTime = await page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fcp = entries.find(e => e.name === 'first-contentful-paint');
          if (fcp) {
            resolve(fcp.startTime);
          }
        });
        observer.observe({ entryTypes: ['paint'] });
        setTimeout(() => resolve(0), 3000);
      });
    });
    
    expect(aboveFoldTime).toBeLessThan(1500); // 1.5 seconds
  });
});`;
  }
}
