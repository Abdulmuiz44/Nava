'use client';

/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, useRef } from 'react';
import { Play, Loader2, Smartphone, Tablet, Maximize, Minimize, Settings } from 'lucide-react';

interface TaskResult {
  success: boolean;
  taskType: string;
  detail: string;
  data?: unknown;
  errorMessage?: string;
  screenshot?: string;
  timestamp?: number;
  duration?: number;
  url?: string;
  title?: string;
  viewport?: {
    width: number;
    height: number;
    isMobile: boolean;
    hasTouch: boolean;
    isLandscape: boolean;
  };
  metrics?: {
    loadTime?: number;
    firstContentfulPaint?: number;
    timeToInteractive?: number;
    cumulativeLayoutShift?: number;
  };
}

export default function MobileOptimizedPage() {
  const [task, setTask] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<TaskResult | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isTabletView, setIsTabletView] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const downHandler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        handleExecuteTask();
      }
    };

    window.addEventListener('keydown', downHandler);
    return () => window.removeEventListener('keydown', downHandler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task, isExecuting, isMobileView, isTabletView]);

  const toggleMobileView = () => {
    setIsMobileView((prev) => !prev);
    setIsTabletView(false);
    setStatusMessage(!isMobileView ? 'Switched to mobile preview' : 'Switched to desktop preview');
  };

  const toggleTabletView = () => {
    setIsTabletView((prev) => !prev);
    setIsMobileView(false);
    setStatusMessage(!isTabletView ? 'Switched to tablet preview' : 'Switched to desktop preview');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
        setStatusMessage('Fullscreen preview enabled');
      }).catch((error) => {
        console.error('Failed to enter fullscreen:', error);
        setStatusMessage('Unable to enter fullscreen');
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
        setStatusMessage('Fullscreen preview disabled');
      }).catch((error) => {
        console.error('Failed to exit fullscreen:', error);
        setStatusMessage('Unable to exit fullscreen');
      });
    }
  };

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handle task execution
  const handleExecuteTask = async () => {
    if (!task.trim() || isExecuting) return;
    
    setIsExecuting(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task, viewport: { isMobile: isMobileView, isTablet: isTabletView } })
      });
      
      const data = await response.json();
      setResult(data);
      
      setStatusMessage(data.success ? 'Task executed successfully' : (data.errorMessage || 'Task failed'));
    } catch (error) {
      console.error('Error executing task:', error);
      setStatusMessage('Failed to execute task');
    } finally {
      setIsExecuting(false);
    }
  };

  // Render responsive viewport
  const renderViewport = () => {
    const viewportClass = `
      bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden transition-all duration-300
      ${isMobileView ? 'w-[375px] h-[667px]' : ''}
      ${isTabletView ? 'w-[768px] h-[1024px]' : ''}
      ${!isMobileView && !isTabletView ? 'w-full h-[80vh]' : ''}
    `;

    return (
      <div className={viewportClass}>
        {result?.screenshot ? (
          <img 
            src={result.screenshot} 
            alt="Screenshot result" 
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <p className="text-gray-500 dark:text-gray-400">
              {isExecuting ? 'Executing task...' : 'No preview available'}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`flex flex-col h-screen transition-colors ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header className={`shadow-sm ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">
              Nava Automation
            </h1>
            <div className="flex space-x-2">
              <button
                onClick={toggleMobileView}
                className={`p-2 rounded-md ${
                  isMobileView ? 'bg-blue-100' : 'hover:bg-gray-100'
                }`}
                title={isMobileView ? 'Switch to desktop preview' : 'Switch to mobile preview'}
                type="button"
              >
                <Smartphone className="w-5 h-5" />
              </button>
              <button
                onClick={toggleTabletView}
                className={`p-2 rounded-md ${
                  isTabletView ? 'bg-blue-100' : 'hover:bg-gray-100'
                }`}
                title={isTabletView ? 'Switch to desktop preview' : 'Switch to tablet preview'}
                type="button"
              >
                <Tablet className="w-5 h-5" />
              </button>
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-md hover:bg-gray-100"
                title={isFullscreen ? 'Exit fullscreen preview' : 'Enter fullscreen preview'}
                type="button"
              >
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {statusMessage && (
        <div className={`px-4 py-2 text-sm text-center ${isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-blue-50 text-blue-800'}`}>
          {statusMessage}
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* Task Input */}
            <div className="flex flex-col h-full">
              <div className={`flex-1 flex flex-col rounded-lg shadow overflow-hidden ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}`}>
                <div className={`px-4 py-3 border-b flex justify-between items-center ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h2 className="text-lg font-medium">Task Input</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowSettings((prev) => !prev)}
                      className="p-1 text-gray-500 hover:text-gray-700"
                      title="Settings"
                      type="button"
                    >
                      <Settings className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                {showSettings && (
                  <div className={`px-4 py-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">
                        Dark Mode
                      </label>
                      <button
                        onClick={() => setIsDarkMode((prev) => !prev)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                          isDarkMode ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                        type="button"
                        aria-pressed={isDarkMode}
                      >
                        <span className="sr-only">Toggle dark mode</span>
                        <span
                          className={`${
                            isDarkMode ? 'translate-x-6' : 'translate-x-1'
                          } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                        />
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex-1 p-4 overflow-auto">
                  <textarea
                    ref={inputRef}
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                    placeholder="Enter your automation task (e.g., 'Go to example.com and take a screenshot')"
                    className={`w-full h-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                      isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-300 bg-white text-gray-900'
                    }`}
                    disabled={isExecuting}
                    rows={8}
                  />
                </div>
                
                <div className={`px-4 py-3 border-t flex justify-between ${
                  isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-600'
                }`}>
                  <div className="text-sm">
                    Press <kbd className="px-2 py-1 bg-gray-200 rounded">Ctrl+Enter</kbd> to run
                  </div>
                  <button
                    onClick={handleExecuteTask}
                    disabled={!task.trim() || isExecuting}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                      isExecuting || !task.trim()
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    }`}
                  >
                    {isExecuting ? (
                      <>
                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                        Executing...
                      </>
                    ) : (
                      <>
                        <Play className="-ml-1 mr-2 h-4 w-4" />
                        Execute Task
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Preview Pane */}
            <div className="flex flex-col h-full">
              <div className={`flex-1 flex flex-col rounded-lg shadow overflow-hidden ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}`}>
                <div className={`px-4 py-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h2 className="text-lg font-medium">
                    {isMobileView ? 'Mobile Preview' : isTabletView ? 'Tablet Preview' : 'Desktop Preview'}
                  </h2>
                </div>
                <div className={`flex-1 p-4 overflow-auto flex items-center justify-center ${
                  isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
                }`}>
                  {renderViewport()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`border-t ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-gray-200 text-gray-500'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center text-sm">
            <div>Nava Automation Platform</div>
            <div>v2.0.0</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
