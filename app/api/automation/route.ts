/**
 * API Route: /api/automation
 * Handles browser automation requests via the MCP server
 */

import { NextRequest, NextResponse } from 'next/server';
import { runBrowserAutomation, checkMCPHealth } from '@/lib/automationService';

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds max execution time

/**
 * POST /api/automation
 * Execute a browser automation task
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { task } = body;

    if (!task) {
      return NextResponse.json(
        {
          success: false,
          error: 'Task object is required',
        },
        { status: 400 }
      );
    }

    // Run automation
    const result = await runBrowserAutomation(task);

    if (result.success) {
      return NextResponse.json(
        {
          success: true,
          result: result.data,
          pageUrl: result.pageUrl,
          pageTitle: result.pageTitle,
          logs: result.logs,
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Automation failed',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Automation API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/automation
 * Check MCP server health
 */
export async function GET() {
  try {
    const health = await checkMCPHealth();

    if (health.healthy) {
      return NextResponse.json(
        {
          success: true,
          status: health.status,
          message: 'MCP server is healthy',
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          error: health.error || 'MCP server is unhealthy',
        },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Health check error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Health check failed',
      },
      { status: 503 }
    );
  }
}
