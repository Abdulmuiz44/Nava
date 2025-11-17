/**
 * useAutomation Hook
 * React hook for running browser automation tasks
 */

'use client';

import { useState, useCallback } from 'react';

interface AutomationTask {
  url?: string;
  actions?: Array<{
    type: 'click' | 'type' | 'wait' | 'scroll' | 'screenshot' | 'getText' | 'hover' | 'select' | 'press';
    selector?: string;
    text?: string;
    value?: string;
    option?: string;
    key?: string;
    timeout?: number;
    direction?: 'up' | 'down' | 'top' | 'bottom';
    pixels?: number;
    fullPage?: boolean;
  }>;
  screenshot?: boolean;
  extractLinks?: boolean;
}

interface AutomationResult {
  success: boolean;
  result?: any;
  pageUrl?: string;
  pageTitle?: string;
  logs?: Array<{
    type: string;
    text: string;
    timestamp: string;
  }>;
  error?: string;
  timestamp?: string;
}

interface UseAutomationReturn {
  runAutomation: (task: AutomationTask) => Promise<AutomationResult>;
  loading: boolean;
  result: AutomationResult | null;
  error: string | null;
  reset: () => void;
}

/**
 * Hook for browser automation
 */
export function useAutomation(): UseAutomationReturn {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AutomationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runAutomation = useCallback(async (task: AutomationTask): Promise<AutomationResult> => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/automation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ task }),
      });

      const data: AutomationResult = await response.json();

      if (response.ok && data.success) {
        setResult(data);
        return data;
      } else {
        const errorMessage = data.error || 'Automation failed';
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setResult(null);
    setError(null);
  }, []);

  return {
    runAutomation,
    loading,
    result,
    error,
    reset,
  };
}

/**
 * Hook for checking MCP server health
 */
export function useMCPHealth() {
  const [loading, setLoading] = useState(false);
  const [healthy, setHealthy] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/automation', {
        method: 'GET',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setHealthy(true);
        return { healthy: true, status: data.status };
      } else {
        setHealthy(false);
        setError(data.error || 'Health check failed');
        return { healthy: false, error: data.error };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error';
      setHealthy(false);
      setError(errorMessage);
      return { healthy: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    checkHealth,
    loading,
    healthy,
    error,
  };
}
