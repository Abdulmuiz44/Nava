'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Plus, 
  Save, 
  Trash2, 
  Play, 
  Edit, 
  Download, 
  Upload,
  Search,
  Zap,
  Clock
} from 'lucide-react';
import { WorkflowManager, Workflow } from '@/lib/workflow-manager';

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [templates, setTemplates] = useState<Array<{
    id: string;
    name: string;
    description: string;
    tasks: string[];
    tags?: string[];
  }>>([]);
  const [editingWorkflow, setEditingWorkflow] = useState<Partial<Workflow> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadWorkflows();
    loadTemplates();
  }, []);

  const loadWorkflows = () => {
    const loaded = WorkflowManager.getWorkflows();
    setWorkflows(loaded);
  };

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/workflows');
      const data = await response.json();
      if (data.success) {
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const handleSaveWorkflow = () => {
    if (!editingWorkflow || !editingWorkflow.name || !editingWorkflow.tasks?.length) {
      alert('Please provide a name and at least one task');
      return;
    }

    if (editingWorkflow.id) {
      WorkflowManager.updateWorkflow(editingWorkflow.id, editingWorkflow);
    } else {
      WorkflowManager.saveWorkflow({
        name: editingWorkflow.name,
        description: editingWorkflow.description || '',
        tasks: editingWorkflow.tasks,
        tags: editingWorkflow.tags,
      });
    }

    loadWorkflows();
    setEditingWorkflow(null);
  };

  const handleDeleteWorkflow = (id: string) => {
    if (confirm('Are you sure you want to delete this workflow?')) {
      WorkflowManager.deleteWorkflow(id);
      loadWorkflows();
    }
  };

  const handleExport = () => {
    const exported = WorkflowManager.exportWorkflows();
    const blob = new Blob([exported], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nava_workflows_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const result = WorkflowManager.importWorkflows(content);
      
      if (result.success) {
        alert(`Successfully imported ${result.imported} workflows`);
        loadWorkflows();
      } else {
        alert(`Import failed:\n${result.errors.join('\n')}`);
      }
    };
    reader.readAsText(file);
  };

  const handleUseTemplate = (template: { name: string; description: string; tasks: string[]; tags?: string[] }) => {
    setEditingWorkflow({
      name: template.name + ' (Copy)',
      description: template.description,
      tasks: [...template.tasks],
      tags: template.tags,
    });
  };

  const filteredWorkflows = searchQuery
    ? WorkflowManager.searchWorkflows(searchQuery)
    : workflows;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="text-gray-400 hover:text-purple-400 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-white">Workflow Library</h1>
              <p className="text-gray-400 mt-2">Save, manage, and reuse your automation workflows</p>
            </div>
          </div>

          <div className="flex gap-3">
            <label className="btn-secondary cursor-pointer">
              <Upload className="w-4 h-4" />
              Import
              <input 
                type="file" 
                accept=".json" 
                onChange={handleImport} 
                className="hidden"
              />
            </label>
            <button onClick={handleExport} className="btn-secondary">
              <Download className="w-4 h-4" />
              Export All
            </button>
            <button 
              onClick={() => setEditingWorkflow({ name: '', description: '', tasks: [''], tags: [] })}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" />
              New Workflow
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search workflows..."
              className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-purple-500/30 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Editor Modal */}
        {editingWorkflow && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl border border-purple-500/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <h2 className="text-2xl font-bold text-white mb-4">
                {editingWorkflow.id ? 'Edit Workflow' : 'New Workflow'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">Name</label>
                  <input
                    type="text"
                    value={editingWorkflow.name || ''}
                    onChange={(e) => setEditingWorkflow({ ...editingWorkflow, name: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-purple-500/30 rounded-lg text-gray-200"
                    placeholder="My Workflow"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Description</label>
                  <textarea
                    value={editingWorkflow.description || ''}
                    onChange={(e) => setEditingWorkflow({ ...editingWorkflow, description: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-purple-500/30 rounded-lg text-gray-200 h-20"
                    placeholder="What does this workflow do?"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Tasks (one per line)</label>
                  <textarea
                    value={editingWorkflow.tasks?.join('\n') || ''}
                    onChange={(e) => setEditingWorkflow({ 
                      ...editingWorkflow, 
                      tasks: e.target.value.split('\n').filter(t => t.trim()) 
                    })}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-purple-500/30 rounded-lg text-gray-200 font-mono text-sm h-40"
                    placeholder="go to example.com&#10;click login button&#10;fill email with test@test.com"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={editingWorkflow.tags?.join(', ') || ''}
                    onChange={(e) => setEditingWorkflow({ 
                      ...editingWorkflow, 
                      tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                    })}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-purple-500/30 rounded-lg text-gray-200"
                    placeholder="automation, login, testing"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button 
                  onClick={() => setEditingWorkflow(null)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveWorkflow}
                  className="btn-primary"
                >
                  <Save className="w-4 h-4" />
                  Save Workflow
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Saved Workflows */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-2xl font-bold text-white mb-4">Your Workflows ({filteredWorkflows.length})</h2>
            
            {filteredWorkflows.length === 0 ? (
              <div className="bg-slate-800/30 rounded-xl p-12 text-center">
                <Zap className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No workflows yet. Create one or use a template!</p>
              </div>
            ) : (
              filteredWorkflows.map((workflow) => (
                <div key={workflow.id} className="bg-slate-800/50 rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-1">{workflow.name}</h3>
                      <p className="text-gray-400 text-sm">{workflow.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingWorkflow(workflow)}
                        className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteWorkflow(workflow.id)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <Clock className="w-4 h-4" />
                      {new Date(workflow.updatedAt).toLocaleDateString()}
                    </div>
                    {workflow.tags && workflow.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {workflow.tags.map((tag, i) => (
                          <span key={i} className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-900/50 rounded-lg p-3 mb-3">
                    <p className="text-xs text-gray-500 mb-2">{workflow.tasks.length} tasks:</p>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {workflow.tasks.map((task, i) => (
                        <div key={i} className="text-sm text-gray-400 font-mono">
                          {i + 1}. {task}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Link
                    href={`/?workflow=${workflow.id}`}
                    className="btn-primary w-full justify-center"
                  >
                    <Play className="w-4 h-4" />
                    Run Workflow
                  </Link>
                </div>
              ))
            )}
          </div>

          {/* Templates */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-4">Templates</h2>
            
            {templates.map((template) => (
              <div key={template.id} className="bg-slate-800/30 rounded-xl p-4 border border-purple-500/10">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-lg font-semibold text-white">{template.name}</h3>
                </div>
                <p className="text-gray-400 text-sm mb-3">{template.description}</p>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {template.tags?.map((tag: string, i: number) => (
                    <span key={i} className="px-2 py-1 bg-slate-700/50 text-gray-400 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => handleUseTemplate(template)}
                  className="w-full px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-colors text-sm"
                >
                  Use Template
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .btn-primary {
          @apply bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-6 py-2 rounded-xl flex items-center gap-2 transition-all;
        }
        .btn-secondary {
          @apply bg-slate-700/50 hover:bg-slate-700 text-gray-300 font-semibold px-6 py-2 rounded-xl flex items-center gap-2 transition-all;
        }
      `}</style>
    </div>
  );
}
