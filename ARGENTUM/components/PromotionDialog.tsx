/**
 * ARGENTUM Promotion Dialog
 * UI for promoting sessions to AURUM
 */

import React, { useState, useEffect } from 'react';
import { Archive, X, AlertCircle, CheckCircle } from 'lucide-react';
import { promotionService } from '../../memory/promotionService';

interface PromotionDialogProps {
  isOpen: boolean;
  sessionId: string;
  onConfirm: (projectTitle: string) => Promise<void>;
  onCancel: () => void;
}

export function PromotionDialog({
  isOpen,
  sessionId,
  onConfirm,
  onCancel,
}: PromotionDialogProps) {
  const [projectTitle, setProjectTitle] = useState('');
  const [suggestedTitle, setSuggestedTitle] = useState('');
  const [preview, setPreview] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadPreview();
    }
  }, [isOpen, sessionId]);

  const loadPreview = async () => {
    try {
      const [previewData, title] = await Promise.all([
        promotionService.previewPromotion(sessionId),
        promotionService.suggestTitle(sessionId),
      ]);

      setPreview(previewData);
      setSuggestedTitle(title);
      setProjectTitle(title);
    } catch (err) {
      setError('Failed to load session preview');
      console.error(err);
    }
  };

  const handleConfirm = async () => {
    if (!projectTitle.trim()) {
      setError('Please provide a project title');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onConfirm(projectTitle);
    } catch (err) {
      setError('Failed to promote session');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-amber-500 rounded-lg">
              <Archive className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Promote to AURUM
              </h2>
              <p className="text-sm text-slate-600">
                Transform ephemeral session into permanent project
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Preview */}
          {preview && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
              <h3 className="text-sm font-medium text-slate-700">Session Preview</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Messages:</span>
                  <span className="ml-2 font-medium text-slate-900">
                    {preview.messageCount}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Size:</span>
                  <span className="ml-2 font-medium text-slate-900">
                    {preview.estimatedSize}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500">Created:</span>
                  <span className="ml-2 font-medium text-slate-900">
                    {new Date(preview.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* First Message Preview */}
              {preview.firstMessage && (
                <div className="pt-3 border-t border-slate-200">
                  <span className="text-xs text-slate-500 uppercase tracking-wide">
                    First Message
                  </span>
                  <p className="mt-1 text-sm text-slate-700 line-clamp-2">
                    {preview.firstMessage}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Project Title */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Project Title
            </label>
            <input
              type="text"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              placeholder="Enter a title for your AURUM project"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
            {suggestedTitle && suggestedTitle !== projectTitle && (
              <button
                onClick={() => setProjectTitle(suggestedTitle)}
                className="text-xs text-cyan-600 hover:text-cyan-700 underline"
              >
                Use suggested: "{suggestedTitle}"
              </button>
            )}
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm text-blue-900">
                <p className="font-medium">What happens next:</p>
                <ul className="space-y-1 ml-4 list-disc">
                  <li>Content will be saved permanently to AURUM</li>
                  <li>All messages and context will be preserved</li>
                  <li>Session will be removed from ARGENTUM</li>
                  <li>You can version and layer the content in AURUM</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-900">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-200">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading || !projectTitle.trim()}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-amber-500 hover:from-cyan-600 hover:to-amber-600 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Promoting...
              </>
            ) : (
              <>
                <Archive className="w-4 h-4" />
                Promote to AURUM
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
