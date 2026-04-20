/**
 * Base Chat Bubble Component
 * Reusable draggable chat bubble for all assistants with full touch support
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Loader2, Trash2, type LucideIcon } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { toast } from 'sonner';
import { Message, AssistantConfig } from './types';

interface BaseChatBubbleProps {
  config: AssistantConfig;
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onClose: () => void;
  onClear?: () => void;
  icon?: LucideIcon;
  customHeader?: React.ReactNode;
  customFooter?: React.ReactNode;
}

export function BaseChatBubble({
  config,
  messages,
  isLoading,
  onSendMessage,
  onClose,
  onClear,
  icon: Icon = Send,
  customHeader,
  customFooter
}: BaseChatBubbleProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragTranslate, setDragTranslate] = useState({ x: 0, y: 0 });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize position
  useEffect(() => {
    if (!position) {
      const initialX = Math.max(16, window.innerWidth - 420);
      const initialY = Math.max(16, window.innerHeight - 664);
      setPosition({ x: initialX, y: initialY });
    }
  }, [position]);

  const handleSendMessage = () => {
    if (!inputMessage.trim() || isLoading) return;
    onSendMessage(inputMessage);
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const rect = chatRef.current?.getBoundingClientRect();
    if (rect && position) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setDragTranslate({ x: 0, y: 0 });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const rect = chatRef.current?.getBoundingClientRect();
    if (rect && position && e.touches[0]) {
      setIsDragging(true);
      setDragOffset({
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      });
      setDragTranslate({ x: 0, y: 0 });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !position) return;

      const translateX = e.clientX - position.x - dragOffset.x;
      const translateY = e.clientY - position.y - dragOffset.y;

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(() => {
        setDragTranslate({ x: translateX, y: translateY });
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !position || !e.touches[0]) return;
      e.preventDefault();

      const translateX = e.touches[0].clientX - position.x - dragOffset.x;
      const translateY = e.touches[0].clientY - position.y - dragOffset.y;

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(() => {
        setDragTranslate({ x: translateX, y: translateY });
      });
    };

    const handleMouseUp = () => {
      if (!isDragging || !position) return;

      const finalX = position.x + dragTranslate.x;
      const finalY = position.y + dragTranslate.y;

      setPosition({ x: finalX, y: finalY });
      setDragTranslate({ x: 0, y: 0 });
      setIsDragging(false);

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };

    const handleTouchEnd = () => {
      handleMouseUp();
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
  }, [isDragging, dragOffset, position, dragTranslate]);

  const handleClear = () => {
    if (onClear) {
      onClear();
      toast.success('Chat-Verlauf gelöscht');
    }
  };

  return (
    <div
      ref={chatRef}
      className="fixed bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      style={{
        width: '384px',
        height: '600px',
        left: position ? `${position.x}px` : undefined,
        top: position ? `${position.y}px` : undefined,
        transform: `translate(${dragTranslate.x}px, ${dragTranslate.y}px)`,
        transition: isDragging ? 'none' : 'transform 0.3s ease',
        zIndex: 9999,
        cursor: isDragging ? 'grabbing' : 'default',
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 text-white flex items-center justify-between cursor-grab active:cursor-grabbing"
        style={{ background: config.color.gradient }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {customHeader || (
          <>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-base">{config.name}</h3>
                <p className="text-xs text-white/90">{config.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onClear && (
                <button
                  onClick={handleClear}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title="Chat löschen"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                message.role === 'user'
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
              style={
                message.role === 'user'
                  ? { background: config.color.gradient }
                  : {}
              }
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p
                className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-white/70' : 'text-gray-500'
                }`}
              >
                {message.timestamp.toLocaleTimeString('de-DE', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="bg-gray-100 p-3 rounded-2xl">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.1s' }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                ></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200 rounded-b-2xl">
        {customFooter || (
          <div className="flex gap-2">
            <Input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Frage ${config.name}...`}
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-4 py-2.5 text-white rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
              style={{ background: config.color.gradient }}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}