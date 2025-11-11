'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Download, 
  Trash2, 
  Camera,
  Search,
  Calendar,
  X,
  ExternalLink
} from 'lucide-react';
import { ScreenshotManager, Screenshot } from '@/lib/screenshot-manager';

export default function ScreenshotsPage() {
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [selectedScreenshot, setSelectedScreenshot] = useState<Screenshot | null>(null);
  const [storageSize, setStorageSize] = useState(0);

  useEffect(() => {
    loadScreenshots();
  }, []);

  const loadScreenshots = () => {
    const loaded = ScreenshotManager.getScreenshots();
    setScreenshots(loaded);
    setStorageSize(ScreenshotManager.getStorageSize());
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this screenshot?')) {
      ScreenshotManager.deleteScreenshot(id);
      loadScreenshots();
      if (selectedScreenshot?.id === id) {
        setSelectedScreenshot(null);
      }
    }
  };

  const handleExport = (id: string) => {
    ScreenshotManager.exportScreenshot(id);
  };

  const handleClearAll = () => {
    if (confirm('Delete ALL screenshots? This cannot be undone.')) {
      ScreenshotManager.clearAllScreenshots();
      loadScreenshots();
      setSelectedScreenshot(null);
    }
  };

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
              <h1 className="text-4xl font-bold text-white">Screenshot Gallery</h1>
              <p className="text-gray-400 mt-2">
                {screenshots.length} screenshots • {storageSize.toFixed(2)} KB used
              </p>
            </div>
          </div>

          {screenshots.length > 0 && (
            <button 
              onClick={handleClearAll}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>

        {/* Screenshots Grid */}
        {screenshots.length === 0 ? (
          <div className="bg-slate-800/30 rounded-xl p-12 text-center">
            <Camera className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No screenshots yet</p>
            <p className="text-gray-500 text-sm">
              Run a task with &quot;screenshot&quot; command to capture pages
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {screenshots.map((screenshot) => (
              <div
                key={screenshot.id}
                className="bg-slate-800/50 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all overflow-hidden group"
              >
                {/* Thumbnail */}
                <div 
                  className="relative aspect-video bg-slate-900 cursor-pointer overflow-hidden"
                  onClick={() => setSelectedScreenshot(screenshot)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={screenshot.url}
                    alt={screenshot.taskName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <Search className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-white font-medium mb-1 truncate">{screenshot.taskName}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                    <Calendar className="w-3 h-3" />
                    {new Date(screenshot.timestamp).toLocaleString()}
                  </div>

                  {screenshot.metadata?.pageUrl && (
                    <p className="text-xs text-gray-500 mb-3 truncate">
                      {screenshot.metadata.pageUrl}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleExport(screenshot.id)}
                      className="flex-1 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                    >
                      <Download className="w-3 h-3" />
                      Save
                    </button>
                    <button
                      onClick={() => handleDelete(screenshot.id)}
                      className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lightbox Modal */}
        {selectedScreenshot && (
          <div 
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedScreenshot(null)}
          >
            <button
              onClick={() => setSelectedScreenshot(null)}
              className="absolute top-4 right-4 text-white hover:text-purple-400 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>

            <div 
              className="max-w-6xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image */}
              <div className="bg-slate-900 rounded-xl overflow-hidden mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedScreenshot.url}
                  alt={selectedScreenshot.taskName}
                  className="w-full h-auto"
                />
              </div>

              {/* Details */}
              <div className="bg-slate-800/90 rounded-xl p-6 backdrop-blur-sm">
                <h2 className="text-2xl font-bold text-white mb-4">{selectedScreenshot.taskName}</h2>
                
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-gray-400">Captured:</span>
                    <span className="text-white ml-2">
                      {new Date(selectedScreenshot.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {selectedScreenshot.metadata?.pageUrl && (
                    <div>
                      <span className="text-gray-400">Page:</span>
                      <a 
                        href={selectedScreenshot.metadata.pageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 ml-2 inline-flex items-center gap-1"
                      >
                        {selectedScreenshot.metadata.pageUrl}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                  {selectedScreenshot.metadata?.dimensions && (
                    <div>
                      <span className="text-gray-400">Size:</span>
                      <span className="text-white ml-2">
                        {selectedScreenshot.metadata.dimensions.width} × {selectedScreenshot.metadata.dimensions.height}
                      </span>
                    </div>
                  )}
                  {selectedScreenshot.metadata?.fileSize && (
                    <div>
                      <span className="text-gray-400">File Size:</span>
                      <span className="text-white ml-2">
                        {(selectedScreenshot.metadata.fileSize / 1024).toFixed(2)} KB
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleExport(selectedScreenshot.id)}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button
                    onClick={() => {
                      handleDelete(selectedScreenshot.id);
                      setSelectedScreenshot(null);
                    }}
                    className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
