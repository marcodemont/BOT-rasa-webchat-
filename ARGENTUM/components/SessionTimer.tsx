/**
 * ARGENTUM Session Timer
 * Visual indicator for session expiration
 */

import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface SessionTimerProps {
  sessionId: string;
  expiresAt: Date;
  onExpire?: () => void;
  onExtend?: () => void;
}

export function SessionTimer({ sessionId, expiresAt, onExpire, onExtend }: SessionTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isExpiringSoon, setIsExpiringSoon] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const diffMs = expiresAt.getTime() - now.getTime();
      const minutes = Math.max(0, Math.floor(diffMs / (60 * 1000)));

      setTimeRemaining(minutes);
      setIsExpiringSoon(minutes <= 60 && minutes > 0);

      if (minutes === 0 && onExpire) {
        onExpire();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    } else {
      const days = Math.floor(minutes / 1440);
      const hours = Math.floor((minutes % 1440) / 60);
      return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
    }
  };

  const getColorClass = () => {
    if (timeRemaining === 0) return 'text-red-600 bg-red-50 border-red-200';
    if (isExpiringSoon) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-cyan-600 bg-cyan-50 border-cyan-200';
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border ${getColorClass()}`}>
      {isExpiringSoon ? (
        <AlertTriangle className="w-4 h-4 animate-pulse" />
      ) : (
        <Clock className="w-4 h-4" />
      )}
      
      <span className="text-sm font-medium">
        {timeRemaining === 0 ? 'Expired' : formatTime(timeRemaining)}
      </span>

      {isExpiringSoon && onExtend && (
        <button
          onClick={onExtend}
          className="ml-2 text-xs font-medium underline hover:no-underline"
        >
          Extend
        </button>
      )}
    </div>
  );
}
