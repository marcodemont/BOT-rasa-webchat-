import React from 'react';
import { motion } from 'motion/react';

interface MessageBubbleProps {
  content: string;
  isUser: boolean;
  timestamp?: string;
  avatar?: string;
}

export function MessageBubble({ content, isUser, timestamp, avatar }: MessageBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex items-end gap-2 mb-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      {!isUser && avatar && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-semibold">
          {avatar}
        </div>
      )}

      {/* Message Bubble */}
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
          isUser
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-sm'
            : 'bg-gray-200 text-gray-900 rounded-bl-sm'
        }`}
      >
        <p className="text-sm leading-relaxed">{content}</p>
        {timestamp && (
          <p className={`text-xs mt-1 ${isUser ? 'text-purple-100' : 'text-gray-500'}`}>
            {timestamp}
          </p>
        )}
      </div>
    </motion.div>
  );
}
