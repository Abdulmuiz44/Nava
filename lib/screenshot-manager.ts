export interface Screenshot {
  id: string;
  url: string; // Data URL or path
  timestamp: string;
  taskName: string;
  thumbnail?: string;
  metadata?: {
    pageUrl?: string;
    dimensions?: { width: number; height: number };
    fileSize?: number;
  };
}

export class ScreenshotManager {
  private static STORAGE_KEY = 'nava_screenshots';
  private static MAX_SCREENSHOTS = 50; // Limit to prevent storage overflow

  static saveScreenshot(screenshot: Omit<Screenshot, 'id' | 'timestamp'>): Screenshot {
    const screenshots = this.getScreenshots();
    
    const newScreenshot: Screenshot = {
      ...screenshot,
      id: this.generateId(),
      timestamp: new Date().toISOString(),
    };

    // Add to beginning (newest first)
    screenshots.unshift(newScreenshot);

    // Limit the number of stored screenshots
    if (screenshots.length > this.MAX_SCREENSHOTS) {
      screenshots.splice(this.MAX_SCREENSHOTS);
    }

    this.saveToStorage(screenshots);
    return newScreenshot;
  }

  static getScreenshot(id: string): Screenshot | null {
    const screenshots = this.getScreenshots();
    return screenshots.find(s => s.id === id) || null;
  }

  static getScreenshots(limit?: number): Screenshot[] {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return [];

    try {
      const screenshots = JSON.parse(stored) as Screenshot[];
      return limit ? screenshots.slice(0, limit) : screenshots;
    } catch {
      return [];
    }
  }

  static deleteScreenshot(id: string): boolean {
    const screenshots = this.getScreenshots();
    const filtered = screenshots.filter(s => s.id !== id);
    
    if (filtered.length === screenshots.length) return false;

    this.saveToStorage(filtered);
    return true;
  }

  static clearAllScreenshots(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.STORAGE_KEY);
  }

  static exportScreenshot(id: string): void {
    const screenshot = this.getScreenshot(id);
    if (!screenshot) return;

    // Create download link
    const link = document.createElement('a');
    link.href = screenshot.url;
    link.download = `nava_screenshot_${screenshot.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  static getStorageSize(): number {
    if (typeof window === 'undefined') return 0;
    
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return 0;

    // Return size in KB
    return new Blob([stored]).size / 1024;
  }

  private static saveToStorage(screenshots: Screenshot[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(screenshots));
    } catch (error) {
      // Handle quota exceeded error
      console.error('Failed to save screenshot:', error);
      // Remove oldest screenshots and retry
      if (screenshots.length > 10) {
        screenshots.splice(10);
        this.saveToStorage(screenshots);
      }
    }
  }

  private static generateId(): string {
    return `screenshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
