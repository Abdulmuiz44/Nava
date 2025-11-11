'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
  EyeOff,
  Save,
  RotateCcw,
  Camera,
  Layers,
  BookOpen,
  Download
} from 'lucide-react';
import { WorkflowManager, Workflow } from '@/lib/workflow-manager';
import { ScreenshotManager } from '@/lib/screenshot-manager';

interface TaskResult {
  success: boolean;
  taskType: string;
  detail: string;
  data?: any;
  errorMessage?: string;
}

export default function Home() {
  const searchParams = useSearchParams();
  const [task, setTask] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<TaskResult | null>(null);
  const [history, setHistory] = useState<{ task: string; result: TaskResult; timestamp: string }[]>([]);
  const [showBrowser, setShowBrowser] = useState(true);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');

  // Load workflow from URL parameter
  useEffect(() => {
    const workflowId = searchParams?.get('workflow');
    if (workflowId) {
      const workflow = WorkflowManager.getWorkflow(workflowId);
      if (workflow) {
        setTask(workflow.tasks.join(', '));
      }
    }
  }, [searchParams]);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('nava_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch {}
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('nava_history', JSON.stringify(history));
  }, [history]);

  const executeTask = async () => {
    if (!task.trim()) return;

    setIsExecuting(true);
    setResult(null);

    const startTime = Date.now();

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
          const allSuccessful = data.results.every((r: TaskResult) => r.success);
          const resultDetail = data.results.map((r: TaskResult, i: number) => 
            `${i + 1}. ${r.detail}`
          ).join('\n');
          
          const finalResult = {
            success: allSuccessful,
            taskType: 'chain',
            detail: `Executed ${tasks.length} tasks:\n${resultDetail}`,
            data: data.results,
          };

          setResult(finalResult);
          
          // Save to history
          setHistory(prev => [{
            task,
            result: finalResult,
            timestamp: new Date().toISOString()
          }, ...prev.slice(0, 19)]);

          // Handle screenshots
          handleScreenshotSaving(data.results);
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
          setHistory(prev => [{
            task,
            result: data.result,
            timestamp: new Date().toISOString()
          }, ...prev.slice(0, 19)]);

          // Handle screenshots
          if (data.result.taskType === 'screenshot' && data.result.data?.screenshot) {
            ScreenshotManager.saveScreenshot({
              url: `data:image/png;base64,${data.result.data.screenshot}`,
              taskName: task,
              metadata: { pageUrl: data.result.data.pageUrl }
            });
          }
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

  const handleScreenshotSaving = (results: TaskResult[]) => {
    results.forEach((result) => {
      if (result.taskType === 'screenshot' && result.data?.screenshot) {
        ScreenshotManager.saveScreenshot({
          url: `data:image/png;base64,${result.data.screenshot}`,
          taskName: task,
          metadata: { pageUrl: result.data.pageUrl }
        });
      }
    });
  };

  const handleSaveWorkflow = () => {
    if (!workflowName.trim()) {
      alert('Please enter a workflow name');
      return;
    }

    const tasks = task.split(',').map(t => t.trim()).filter(t => t.length > 0);
    
    WorkflowManager.saveWorkflow({
      name: workflowName,
      description: workflowDescription,
      tasks,
    });

    setShowSaveDialog(false);
    setWorkflowName('');
    setWorkflowDescription('');
    alert('Workflow saved successfully!');
  };

  const handleReplayTask = (historyTask: string) => {
    setTask(historyTask);
  };

  const exampleTasks = [
    { icon: Globe, text: 'go to github.com', color: 'text-blue-400' },
    { icon: Zap, text: 'go to google.com, search Tradia', color: 'text-yellow-400' },
    { icon: MousePointer, text: 'click menu, click login button', color: 'text-purple-400' },
    { icon: FileText, text: 'go to example.com, scroll down, extract links', color: 'text-orange-400' },
    { icon: Camera, text: 'go to github.com, screenshot', color: 'text-green-400' },
    { icon: Search, text: 'go to google.com, search AI tools, wait for #search to appear', color: 'text-pink-400' },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-purple-500/20 backdrop-blur-sm bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-purple-400" />
              <span className="text-2xl font-bold text-white">NAVA</span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/workflows"
                className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-gray-300 rounded-lg transition-colors flex items-center gap-2"
              >
                <Layers className="w-4 h-4" />
                Workflows
              </Link>
              <Link
                href="/screenshots"
                className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-gray-300 rounded-lg transition-colors flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                Screenshots
              </Link>
              <a
                href="https://github.com/Abdulmuiz44/Nava"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-gray-300 rounded-lg transition-colors flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                Docs
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="container mx-auto px-4 pt-12 pb-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text mb-4">
            Intelligent Browser Automation
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Execute complex multi-step workflows with natural language. Now with workflows, screenshot gallery, and enhanced commands.
          </p>
        </div>

        {/* Main Command Interface */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-purple-500/20 shadow-2xl p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Terminal className="w-6 h-6 text-purple-400" />
                <h2 className="text-xl font-semibold text-gray-200">Command Center</h2>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSaveDialog(true)}
                  disabled={!task.trim() || isExecuting}
                  className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 disabled:bg-gray-700/20 disabled:text-gray-600 text-blue-300 rounded-lg transition-colors flex items-center gap-2"
                  title="Save as Workflow"
                >
                  <Save className="w-4 h-4" />
                </button>
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
                    {showBrowser ? 'Visible' : 'Headless'}
                  </span>
                </label>
              </div>
            </div>

            <div className="flex gap-4">
              <input
                type="text"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isExecuting && executeTask()}
                placeholder="Try: go to example.com, scroll down, click menu, hover over button, screenshot"
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

            {/* New Commands Info */}
            <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <p className="text-sm text-purple-300">
                <strong>✨ New commands:</strong> scroll, hover, select from dropdown, get text, wait for element, switch to tab, upload file, download
              </p>
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
                      {result.taskType === 'chain' && ' - Task Chain'}
                    </p>
                    <p className="text-gray-300 whitespace-pre-line">{result.detail}</p>
                    {result.errorMessage && (
                      <p className="text-red-400 text-sm mt-2">{result.errorMessage}</p>
                    )}
                    {result.data && result.taskType !== 'chain' && (
                      <details className="mt-4">
                        <summary className="cursor-pointer text-sm text-purple-400 hover:text-purple-300">
                          View Data
                        </summary>
                        <pre className="mt-2 p-4 bg-slate-900/50 rounded-lg text-sm text-gray-300 overflow-x-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Example Commands */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Recent Commands ({history.length})
                </h3>
                <button
                  onClick={() => {
                    if (confirm('Clear all history?')) {
                      setHistory([]);
                      localStorage.removeItem('nava_history');
                    }
                  }}
                  className="text-sm text-gray-500 hover:text-red-400 transition-colors"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {history.map((item, index) => (
                  <div
                    key={index}
                    className="bg-slate-900/30 rounded-lg p-4 border border-slate-700/30 hover:border-purple-500/30 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          item.result.success ? 'bg-green-400' : 'bg-red-400'
                        }`} />
                        <code className="text-sm text-gray-400 font-mono">{item.task}</code>
                      </div>
                      <button
                        onClick={() => handleReplayTask(item.task)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-purple-500/20 rounded"
                        title="Replay"
                      >
                        <RotateCcw className="w-4 h-4 text-purple-400" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 ml-4">{item.result.detail}</p>
                    <p className="text-xs text-gray-600 ml-4 mt-1">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mt-12">
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/10">
            <Zap className="w-10 h-10 text-yellow-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-200 mb-2">Lightning Fast</h3>
            <p className="text-gray-400">Execute complex browser tasks in seconds with enhanced commands.</p>
          </div>
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/10">
            <Layers className="w-10 h-10 text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-200 mb-2">Save Workflows</h3>
            <p className="text-gray-400">Save and reuse your automation workflows with one click.</p>
          </div>
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/10">
            <Camera className="w-10 h-10 text-green-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-200 mb-2">Screenshot Gallery</h3>
            <p className="text-gray-400">Automatically save and manage all your screenshots.</p>
          </div>
        </div>
      </div>

      {/* Save Workflow Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-purple-500/30 max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Save Workflow</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Workflow Name</label>
                <input
                  type="text"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-purple-500/30 rounded-lg text-gray-200"
                  placeholder="My Automation"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Description (optional)</label>
                <textarea
                  value={workflowDescription}
                  onChange={(e) => setWorkflowDescription(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-purple-500/30 rounded-lg text-gray-200 h-20"
                  placeholder="What does this workflow do?"
                />
              </div>

              <div className="bg-slate-900/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-2">Tasks to save:</p>
                <pre className="text-xs text-gray-400 font-mono overflow-x-auto">
                  {task.split(',').map((t, i) => `${i + 1}. ${t.trim()}`).join('\n')}
                </pre>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => {
                  setShowSaveDialog(false);
                  setWorkflowName('');
                  setWorkflowDescription('');
                }}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveWorkflow}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-6 py-2 rounded-xl flex items-center gap-2 transition-all"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
