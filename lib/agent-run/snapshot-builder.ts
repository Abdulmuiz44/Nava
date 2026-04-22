import { BrowserSession } from '@/lib/browser';
import { RunSnapshot } from './types';

export async function buildRunSnapshot(
  runId: string,
  session: BrowserSession
): Promise<Omit<RunSnapshot, 'id' | 'timestamp'>> {
  const page = session.getPage();

  if (!page) {
    return {
      runId,
      metadata: {
        available: false,
        reason: 'No active page in browser session',
      },
      payload: {},
    };
  }

  let title = '';
  let url = '';
  let payload: Record<string, unknown> = {};

  try {
    // Snapshot collection is best-effort and must not fail the run.
    [title, url, payload] = await Promise.all([
      page.title(),
      Promise.resolve(page.url()),
      page.evaluate(() => {
        return {
          readyState: document.readyState,
          links: document.querySelectorAll('a').length,
          forms: document.querySelectorAll('form').length,
          inputs: document.querySelectorAll('input, textarea, select').length,
        };
      }),
    ]);
  } catch (error) {
    return {
      runId,
      metadata: {
        available: false,
        reason: error instanceof Error ? error.message : 'Snapshot collection failed',
      },
      payload: {},
    };
  }

  return {
    runId,
    title,
    url,
    metadata: {
      available: true,
    },
    payload,
  };
}
