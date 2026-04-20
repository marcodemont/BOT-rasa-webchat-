import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Minimize2, Maximize2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageBubble } from '../shared/MessageBubble';
import { sendToLYNA } from '../../../utils/chatApi';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
}

interface LYNABubbleChatProps {
  onClose?: () => void;
  userId?: string;
  userType?: 'patient' | 'doctor' | 'public';
  patientId?: string;
}

export function LYNABubbleChat({ onClose, userId, userType = 'public', patientId }: LYNABubbleChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hey! Ich bin LYNA, deine KI-Assistentin. Wie kann ich dir heute helfen?',
      isUser: false,
      timestamp: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await sendToLYNA(messageText, userId, userType, patientId, conversationId, 'vibe');
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.response,
        isUser: false,
        timestamp: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMessage]);
      setConversationId(response.conversationId);
    } catch (error) {
      console.error('LYNA error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Entschuldigung, es gab einen Fehler. Bitte versuche es erneut.',
        isUser: false,
        timestamp: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className="fixed bottom-6 right-6 w-96 bg-white rounded-2xl shadow-2xl overflow-hidden z-[10000] border border-gray-200"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-purple-600 font-bold">
            L
          </div>
          <div>
            <h3 className="text-white font-semibold">LYNA</h3>
            <p className="text-xs text-purple-100">KI-Assistentin</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="h-96 overflow-y-auto p-4 bg-gray-50">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  content={message.content}
                  isUser={message.isUser}
                  timestamp={message.timestamp}
                  avatar={message.isUser ? undefined : 'L'}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Nachricht schreiben..."
                  className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-2 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}