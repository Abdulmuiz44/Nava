import { NextRequest, NextResponse } from 'next/server';
import { BrowserSession } from '@/lib/browser';
import fs from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SCREENSHOTS_DIR = path.join(process.cwd(), 'public', 'screenshots');

// Ensure screenshots directory exists
async function ensureScreenshotsDir() {
  try {
    await fs.access(SCREENSHOTS_DIR);
  } catch {
    await fs.mkdir(SCREENSHOTS_DIR, { recursive: true });
  }
}

export async function POST(request: NextRequest) {
  let session: BrowserSession | null = null;

  try {
    const body = await request.json();
    const { url, headless = true } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    await ensureScreenshotsDir();

    // Initialize browser and take screenshot
    session = new BrowserSession({ headless });
    await session.initialize();
    await session.goto(url);

    // Generate filename
    const timestamp = Date.now();
    const filename = `screenshot_${timestamp}.png`;
    const filepath = path.join(SCREENSHOTS_DIR, filename);

    // Take screenshot
    await session.screenshot(filepath);

    // Get file stats
    const stats = await fs.stat(filepath);

    return NextResponse.json({
      success: true,
      screenshot: {
        id: `screenshot_${timestamp}`,
        filename,
        url: `/screenshots/${filename}`,
        timestamp: new Date().toISOString(),
        size: stats.size,
        pageUrl: url,
      },
    });

  } catch (error) {
    console.error('Screenshot error:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to capture screenshot',
      },
      { status: 500 }
    );
  } finally {
    if (session) {
      await session.close();
    }
  }
}

export async function GET() {
  try {
    await ensureScreenshotsDir();

    // List all screenshots
    const files = await fs.readdir(SCREENSHOTS_DIR);
    const screenshots = await Promise.all(
      files
        .filter(file => file.endsWith('.png'))
        .map(async (file) => {
          const filepath = path.join(SCREENSHOTS_DIR, file);
          const stats = await fs.stat(filepath);
          
          return {
            filename: file,
            url: `/screenshots/${file}`,
            size: stats.size,
            created: stats.birthtime.toISOString(),
          };
        })
    );

    // Sort by creation date (newest first)
    screenshots.sort((a, b) => 
      new Date(b.created).getTime() - new Date(a.created).getTime()
    );

    return NextResponse.json({
      success: true,
      screenshots,
      count: screenshots.length,
    });

  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to list screenshots',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename) {
      return NextResponse.json(
        { error: 'Filename is required' },
        { status: 400 }
      );
    }

    const filepath = path.join(SCREENSHOTS_DIR, filename);
    await fs.unlink(filepath);

    return NextResponse.json({
      success: true,
      message: 'Screenshot deleted',
    });

  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to delete screenshot',
      },
      { status: 500 }
    );
  }
}
