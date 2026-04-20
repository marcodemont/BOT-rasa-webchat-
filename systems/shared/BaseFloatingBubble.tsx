/**
 * Base Floating Bubble Component
 * Reusable floating button with drag support for all assistants
 */

import React, { useState, useEffect, useRef } from 'react';
import { LucideIcon } from 'lucide-react';
import { AssistantConfig } from './types';

interface BaseFloatingBubbleProps {
  config: AssistantConfig;
  icon: LucideIcon;
  onClick: () => void;
  isVisible: boolean;
  showIntroBubble?: boolean;
  introText?: string;
  onIntroClose?: () => void;
}

export function BaseFloatingBubble({
  config,
  icon: Icon,
  onClick,
  isVisible,
  showIntroBubble = false,
  introText,
  onIntroClose
}: BaseFloatingBubbleProps) {
  const [bubblePosition, setBubblePosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);
  const bubbleRef = useRef<HTMLButtonElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Handle mouse down
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const rect = bubbleRef.current?.getBoundingClientRect();
    if (rect) {
      setIsDragging(true);
      setHasMoved(false);
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  // Handle touch start
  const handleTouchStart = (e: React.TouchEvent) => {
    const rect = bubbleRef.current?.getBoundingClientRect();
    if (rect && e.touches[0]) {
      setIsDragging(true);
      setHasMoved(false);
      setDragOffset({
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      });
    }
  };

  // Handle dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(() => {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;

        setBubblePosition({ x: newX, y: newY });

        if (!hasMoved) {
          const startX = bubbleRef.current?.getBoundingClientRect().left || 0;
          const startY = bubbleRef.current?.getBoundingClientRect().top || 0;
          const distance = Math.sqrt(
            Math.pow(newX - startX, 2) + Math.pow(newY - startY, 2)
          );
          if (distance > 5) {
            setHasMoved(true);
          }
        }
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !e.touches[0]) return;
      e.preventDefault();

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(() => {
        const newX = e.touches[0].clientX - dragOffset.x;
        const newY = e.touches[0].clientY - dragOffset.y;

        setBubblePosition({ x: newX, y: newY });

        if (!hasMoved) {
          const startX = bubbleRef.current?.getBoundingClientRect().left || 0;
          const startY = bubbleRef.current?.getBoundingClientRect().top || 0;
          const distance = Math.sqrt(
            Math.pow(newX - startX, 2) + Math.pow(newY - startY, 2)
          );
          if (distance > 5) {
            setHasMoved(true);
          }
        }
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setTimeout(() => setHasMoved(false), 100);

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      setTimeout(() => setHasMoved(false), 100);

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [isDragging, dragOffset, hasMoved]);

  if (!isVisible) return null;

  return (
    <>
      {/* Intro Bubble */}
      {showIntroBubble && introText && (
        <div
          className="fixed z-40 bg-white rounded-2xl shadow-2xl border-2 px-6 py-4 max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-500"
          style={{
            right: bubblePosition ? undefined : '6rem',
            bottom: bubblePosition ? undefined : '1.5rem',
            left: bubblePosition ? `${bubblePosition.x + 80}px` : undefined,
            top: bubblePosition ? `${bubblePosition.y}px` : undefined,
            borderColor: config.color.primary,
          }}
          onClick={(e) => {
            e.stopPropagation();
            onIntroClose?.();
          }}
        >
          <div className="flex items-start gap-3">
            <div>
              <h4 className="text-gray-900 mb-1 font-semibold">
                Hallo! Ich bin {config.name}
              </h4>
              <p className="text-sm text-gray-600">{introText}</p>
            </div>
          </div>
          <div
            className="absolute w-3 h-3 bg-white transform rotate-45"
            style={{
              right: bubblePosition ? undefined : '-6px',
              bottom: bubblePosition ? undefined : '1.5rem',
              left: bubblePosition ? '-6px' : undefined,
              top: bubblePosition ? '1.5rem' : undefined,
              borderRight: `2px solid ${config.color.primary}`,
              borderTop: `2px solid ${config.color.primary}`,
            }}
          />
        </div>
      )}

      {/* Floating Button */}
      <button
        ref={bubbleRef}
        onClick={() => {
          if (!hasMoved) {
            onClick();
          }
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className="fixed w-16 h-16 rounded-full shadow-2xl flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200 z-50"
        style={{
          background: config.color.gradient,
          right: bubblePosition ? undefined : '1.5rem',
          bottom: bubblePosition ? undefined : '1.5rem',
          left: bubblePosition ? `${bubblePosition.x}px` : undefined,
          top: bubblePosition ? `${bubblePosition.y}px` : undefined,
        }}
        title={`${config.name} - ${config.description}`}
      >
        <Icon className="w-8 h-8 text-white" />
      </button>
    </>
  );
}
