'use client';

import { useState } from 'react';
import { 
  Sparkles, 
  Terminal, 
  Zap, 
  Globe, 
  Search, 
  MousePointer, 
  FileText,
  Image as ImageIcon,
  ArrowRight,
  Play,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';

interface TaskResult {
  success: boolean;
  taskType: string;
  detail: string;
  data?: any;
  errorMessage?: string;
}

export default function Home() {
  const [task, setTask] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<TaskResult | null>(null);
  const [history, setHistory] = useState<{ task: string; result: TaskResult }[]>([]);
  const [showBrowser, setShowBrowser] = useState(true); // false = headless, true = visible

  const executeTask = async () => {
    if (!task.trim()) return;

    setIsExecuting(true);
    setResult(null);

    try {
      // Check if task contains comma-separated commands
      const hasMultipleTasks = task.includes(',');
      
      if (hasMultipleTasks) {
        // Split by comma and execute as a chain
        const tasks = task.split(',').map(t => t.trim()).filter(t => t.length > 0);
        
        const response = await fetch('/api/execute-chain', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tasks, headless: !showBrowser }),
        });

        const data = await response.json();
        
        if (data.results) {
          // Show combined result
          const allSuccessful = data.results.every((r: TaskResult) => r.success);
          const resultDetail = data.results.map((r: TaskResult, i: number) => 
            `${i + 1}. ${r.detail}`
          ).join('\n');
          
          setResult({
            success: allSuccessful,
            taskType: 'chain',
            detail: `Executed ${tasks.length} tasks:\n${resultDetail}`,
            data: data.results,
          });
          setHistory(prev => [{ task, result: data.results[data.results.length - 1] }, ...prev.slice(0, 9)]);
        } else {
          setResult({
            success: false,
            taskType: 'error',
            detail: 'Failed to execute task chain',
            errorMessage: data.error || 'Unknown error',
          });
        }
      } else {
        // Execute single task
        const response = await fetch('/api/execute', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ task, headless: !showBrowser }),
        });

        const data = await response.json();
        
        if (data.result) {
          setResult(data.result);
          setHistory(prev => [{ task, result: data.result }, ...prev.slice(0, 9)]);
        } else {
          setResult({
            success: false,
            taskType: 'error',
            detail: 'Failed to execute task',
            errorMessage: data.error || 'Unknown error',
          });
        }
      }
    } catch (error) {
      setResult({
        success: false,
        taskType: 'error',
        detail: 'Failed to execute task',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const exampleTasks = [
    { icon: Globe, text: 'go to github.com', color: 'text-blue-400' },
    { icon: Search, text: 'search for react tutorials', color: 'text-green-400' },
    { icon: Zap, text: 'go to google.com, search Tradia', color: 'text-yellow-400' },
    { icon: FileText, text: 'extract all links', color: 'text-orange-400' },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="container mx-auto px-4 pt-20 pb-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-6">
            <Sparkles className="w-12 h-12 text-purple-400 animate-pulse-slow" />
            <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
              NAVA
            </h1>
          </div>
          <p className="text-2xl text-gray-300 mb-4">Intelligent Browser Automation</p>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Control your browser with natural language commands. Powered by Playwright and AI.
          </p>
        </div>

        {/* Main Command Interface */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-purple-500/20 shadow-2xl p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Terminal className="w-6 h-6 text-purple-400" />
                <h2 className="text-xl font-semibold text-gray-200">Command Center</h2>
              </div>
              <label className="flex items-center gap-2 cursor-pointer bg-slate-900/50 px-4 py-2 rounded-lg border border-purple-500/20 hover:border-purple-500/40 transition-all">
                {showBrowser ? (
                  <Eye className="w-4 h-4 text-green-400" />
                ) : (
                  <EyeOff className="w-4 h-4 text-gray-500" />
                )}
                <input
                  type="checkbox"
                  checked={showBrowser}
                  onChange={(e) => setShowBrowser(e.target.checked)}
                  className="w-4 h-4 rounded border-purple-500/30 bg-slate-900/50 text-purple-500 focus:ring-2 focus:ring-purple-500/20"
                />
                <span className={`text-sm font-medium ${showBrowser ? 'text-green-400' : 'text-gray-400'}`}>
                  {showBrowser ? 'Browser Visible' : 'Headless Mode'}
                </span>
              </label>
            </div>

            <div className="flex gap-4">
              <input
                type="text"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isExecuting && executeTask()}
                placeholder="Enter command (e.g., go to github.com) or multiple commands (e.g., go to google.com, search Tradia)"
                className="flex-1 bg-slate-900/50 border border-purple-500/30 rounded-xl px-6 py-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                disabled={isExecuting}
              />
              <button
                onClick={executeTask}
                disabled={isExecuting || !task.trim()}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold px-8 py-4 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-purple-500/50"
              >
                {isExecuting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Executing
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Execute
                  </>
                )}
              </button>
            </div>

            {/* Info Messages */}
            {showBrowser && (
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-start gap-2">
                <Eye className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-300">
                  <strong>Browser Visible Mode:</strong> A Chrome window will open and you&apos;ll see the automation in action!
                </p>
              </div>
            )}
            {task.includes(',') && (
              <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg flex items-start gap-2">
                <Zap className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-purple-300">
                  <strong>Task Chain Detected:</strong> Multiple commands will be executed in sequence!
                </p>
              </div>
            )}

            {/* Result Display */}
            {result && (
              <div className={`mt-6 p-6 rounded-xl border ${
                result.success 
                  ? 'bg-green-500/10 border-green-500/30' 
                  : 'bg-red-500/10 border-red-500/30'
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`mt-1 ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                    {result.success ? '✓' : '✗'}
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold mb-1 ${
                      result.success ? 'text-green-300' : 'text-red-300'
                    }`}>
                      {result.success ? 'Success' : 'Failed'}
                      {result.taskType === 'chain' && ' - Task Chain'}
                    </p>
                    <p className="text-gray-300 whitespace-pre-line">{result.detail}</p>
                    {result.errorMessage && (
                      <p className="text-red-400 text-sm mt-2">{result.errorMessage}</p>
                    )}
                    {result.data && result.taskType === 'chain' && Array.isArray(result.data) && (
                      <div className="mt-4 space-y-2">
                        {result.data.map((taskResult: TaskResult, index: number) => (
                          <div key={index} className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                            <div className="flex items-center gap-2">
                              <span className={taskResult.success ? 'text-green-400' : 'text-red-400'}>
                                {taskResult.success ? '✓' : '✗'}
                              </span>
                              <span className="text-sm text-gray-400">Step {index + 1}:</span>
                              <span className="text-sm text-gray-300">{taskResult.detail}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {result.data && result.taskType !== 'chain' && (
                      <pre className="mt-4 p-4 bg-slate-900/50 rounded-lg text-sm text-gray-300 overflow-x-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Example Commands */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {exampleTasks.map((example, index) => (
              <button
                key={index}
                onClick={() => setTask(example.text)}
                className="bg-slate-800/30 backdrop-blur-sm hover:bg-slate-800/50 border border-purple-500/10 hover:border-purple-500/30 rounded-xl p-4 text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <example.icon className={`w-5 h-5 ${example.color}`} />
                  <span className="text-gray-300 group-hover:text-gray-200 font-mono text-sm">
                    {example.text}
                  </span>
                  <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-purple-400 ml-auto transition-all" />
                </div>
              </button>
            ))}
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-purple-500/10 p-6">
              <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Recent Commands
              </h3>
              <div className="space-y-3">
                {history.map((item, index) => (
                  <div
                    key={index}
                    className="bg-slate-900/30 rounded-lg p-4 border border-slate-700/30"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-2 h-2 rounded-full ${
                        item.result.success ? 'bg-green-400' : 'bg-red-400'
                      }`} />
                      <code className="text-sm text-gray-400 font-mono">{item.task}</code>
                    </div>
                    <p className="text-sm text-gray-500 ml-4">{item.result.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mt-20">
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/10">
            <Zap className="w-10 h-10 text-yellow-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-200 mb-2">Lightning Fast</h3>
            <p className="text-gray-400">Execute complex browser tasks in seconds with our optimized automation engine.</p>
          </div>
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/10">
            <Terminal className="w-10 h-10 text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-200 mb-2">Natural Language</h3>
            <p className="text-gray-400">Use simple commands like "go to" and "click" - no coding required.</p>
          </div>
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/10">
            <Sparkles className="w-10 h-10 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-200 mb-2">Smart Automation</h3>
            <p className="text-gray-400">Powered by Playwright for reliable, cross-browser automation.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
