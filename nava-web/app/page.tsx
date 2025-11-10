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
  Loader2
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

  const executeTask = async () => {
    if (!task.trim()) return;

    setIsExecuting(true);
    setResult(null);

    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ task, headless: true }),
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
    { icon: MousePointer, text: 'click button#submit', color: 'text-purple-400' },
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
            <div className="flex items-center gap-3 mb-6">
              <Terminal className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-semibold text-gray-200">Command Center</h2>
            </div>

            <div className="flex gap-4">
              <input
                type="text"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isExecuting && executeTask()}
                placeholder="Enter your command... (e.g., go to github.com)"
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
                    </p>
                    <p className="text-gray-300">{result.detail}</p>
                    {result.errorMessage && (
                      <p className="text-red-400 text-sm mt-2">{result.errorMessage}</p>
                    )}
                    {result.data && (
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
