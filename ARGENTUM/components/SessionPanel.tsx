/**
 * ARGENTUM Session Panel
 * Control panel for ephemeral sessions
 */

import React, { useState } from 'react';
import { Trash2, Archive, Clock, MessageSquare } from 'lucide-react';
import { SessionTimer } from './SessionTimer';

interface SessionPanelProps {
  sessionId: string;
  expiresAt: Date;
  messageCount: number;
  createdAt: Date;
  onDiscard: () => void;
  onPromote: () => void;
  onExtend: () => void;
}

export function SessionPanel({
  sessionId,
  expiresAt,
  messageCount,
  createdAt,
  onDiscard,
  onPromote,
  onExtend,
}: SessionPanelProps) {
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const handleDiscardClick = () => {
    setShowDiscardConfirm(true);
  };

  const handleConfirmDiscard = () => {
    setShowDiscardConfirm(false);
    onDiscard();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-4">
      {/* Session Info */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-slate-700">Ephemeral Session</h3>
          <p className="text-xs text-slate-500">
            Created {new Date(createdAt).toLocaleDateString()} at{' '}
            {new Date(createdAt).toLocaleTimeString()}
          </p>
        </div>
        
        <SessionTimer
          sessionId={sessionId}
          expiresAt={expiresAt}
          onExtend={onExtend}
        />
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5 text-slate-600">
          <MessageSquare className="w-4 h-4" />
          <span>{messageCount} messages</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600">
          <Clock className="w-4 h-4" />
          <span>Local only</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onPromote}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-md text-sm font-medium transition-colors"
        >
          <Archive className="w-4 h-4" />
          Promote to AURUM
        </button>

        <button
          onClick={handleDiscardClick}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-sm font-medium transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Discard
        </button>
      </div>

      {/* Discard Confirmation */}
      {showDiscardConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Discard Session?
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              This session will be permanently deleted. All messages and content will be lost.
              This action cannot be undone.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowDiscardConfirm(false)}
                className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDiscard}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm font-medium transition-colors"
              >
                Discard Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
