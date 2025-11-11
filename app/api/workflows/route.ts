import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// This is a simple API that returns workflow templates
// Actual workflow storage happens client-side in localStorage

export async function GET(request: NextRequest) {
  // Return example workflow templates
  const templates = [
    {
      id: 'template_1',
      name: 'Login Flow',
      description: 'Standard login workflow',
      tasks: [
        'go to https://example.com',
        'click login button',
        'fill email with user@example.com',
        'fill password with password123',
        'click submit'
      ],
      tags: ['authentication', 'login'],
      isPublic: true,
    },
    {
      id: 'template_2',
      name: 'Search & Extract',
      description: 'Search and extract links',
      tasks: [
        'go to google.com',
        'search for react tutorials',
        'extract links'
      ],
      tags: ['search', 'scraping'],
      isPublic: true,
    },
    {
      id: 'template_3',
      name: 'Form Automation',
      description: 'Fill and submit a form',
      tasks: [
        'go to https://example.com/contact',
        'fill name with John Doe',
        'fill email with john@example.com',
        'fill message with Hello World',
        'click submit button',
        'wait for #success to appear'
      ],
      tags: ['form', 'automation'],
      isPublic: true,
    },
    {
      id: 'template_4',
      name: 'E-commerce Checkout',
      description: 'Complete checkout process',
      tasks: [
        'go to https://store.example.com',
        'search for laptop',
        'click first product',
        'click add to cart',
        'click checkout',
        'fill shipping address',
        'select express shipping from #shipping-method',
        'click continue'
      ],
      tags: ['ecommerce', 'checkout'],
      isPublic: true,
    },
  ];

  return NextResponse.json({
    success: true,
    templates,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  // This endpoint can be used for server-side workflow execution
  try {
    const body = await request.json();
    const { action, workflow } = body;

    if (action === 'validate') {
      // Validate workflow structure
      if (!workflow || !workflow.tasks || !Array.isArray(workflow.tasks)) {
        return NextResponse.json(
          { error: 'Invalid workflow structure' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        valid: true,
        taskCount: workflow.tasks.length,
      });
    }

    return NextResponse.json(
      { error: 'Unknown action' },
      { status: 400 }
    );

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
