import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence, useDragControls } from 'motion/react';
import { sendToLYNA } from '../../../utils/chatApi';
import { useSystem } from '../SystemProvider';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
}

interface FloatingLYNAProps {
  userId?: string;
  userType?: 'patient' | 'doctor' | 'public';
  patientId?: string;
  onTriggerAI?: (aiName: string) => void;
}

const WELCOME_MESSAGES = [
  {
    id: 'welcome-1',
    content: 'Hallo, wie kann ich dir helfen?',
    isUser: false,
    timestamp: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
  }
];

const QUICK_REPLIES = [
  'Angebotsanfrage',
  'Ich habe eine Frage',
  'Nur stöbern',
  'Termin vereinbaren'
];

export function FloatingLYNA({ userId, userType = 'public', patientId, onTriggerAI }: FloatingLYNAProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>();
  const [unreadCount, setUnreadCount] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(() => {
    // Load saved position from localStorage
    const saved = localStorage.getItem('lyna-bubble-position');
    return saved ? JSON.parse(saved) : { x: 0, y: 0 };
  });
  const dragControls = useDragControls();
  const bubbleDragControls = useDragControls();
  
  // Get current system for theming
  const { currentSystem } = useSystem();

  // Save position to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('lyna-bubble-position', JSON.stringify(position));
  }, [position]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      setShowWelcome(false);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageText = text || inputValue;
    if (!messageText.trim()) return;

    // Check if user wants to trigger JOI or AURA
    const lowerMessage = messageText.toLowerCase().trim();
    if (lowerMessage === 'joi' || lowerMessage.includes('öffne joi') || lowerMessage.includes('starte joi')) {
      if (onTriggerAI) {
        onTriggerAI('joi');
        const systemMessage: Message = {
          id: Date.now().toString(),
          content: '✨ JOI wird geöffnet...',
          isUser: false,
          timestamp: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, systemMessage]);
        setInputValue('');
        return;
      }
    } else if (lowerMessage === 'aura' || lowerMessage.includes('öffne aura') || lowerMessage.includes('starte aura')) {
      if (onTriggerAI) {
        onTriggerAI('aura');
        const systemMessage: Message = {
          id: Date.now().toString(),
          content: '📚 AURA wird geöffnet...',
          isUser: false,
          timestamp: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, systemMessage]);
        setInputValue('');
        return;
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageText,
      isUser: true,
      timestamp: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setShowWelcome(false);

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

  const handleQuickReply = (reply: string) => {
    handleSend(reply);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Welcome Messages - Floating above button */}
      <AnimatePresence>
        {showWelcome && !isOpen && (
          <motion.div 
            className="fixed z-[9999] flex flex-col items-end gap-3"
            style={{
              bottom: `calc(6rem + ${-position.y}px)`,
              right: `calc(1.5rem + ${-position.x}px)`,
            }}
          >
            {WELCOME_MESSAGES.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: 20, y: 20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, x: 20, y: -20 }}
                transition={{ delay: index * 0.3 }}
                className="flex items-start gap-3"
              >
                {/* Avatar */}
                <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-md opacity-60 animate-pulse"></div>
                    <div className="relative w-10 h-10 bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>
                {/* Message Bubble */}
                <div className="bg-white rounded-2xl shadow-xl px-6 py-4 max-w-xs border border-orange-100">
                  <p className="text-gray-800 text-base leading-relaxed">{msg.content}</p>
                </div>
              </motion.div>
            ))}

            {/* Quick Reply Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col gap-2 w-full max-w-xs mt-2"
            >
              {QUICK_REPLIES.map((reply) => (
                <button
                  key={reply}
                  onClick={() => {
                    setIsOpen(true);
                    handleQuickReply(reply);
                  }}
                  className="bg-gradient-to-r from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100 text-gray-700 px-6 py-3 rounded-full shadow-lg transition-all hover:shadow-xl border border-orange-200 text-sm font-medium"
                >
                  {reply}
                </button>
              ))}
            </motion.div>

            {/* Powered by indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.9 }}
              className="flex items-center justify-end gap-1 mr-2 mt-2"
            >
              
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Messages - Floating & Draggable */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            drag
            dragControls={dragControls}
            dragListener={false}
            dragMomentum={false}
            dragElastic={0.05}
            onDragEnd={(event, info) => {
              setPosition(prev => ({
                x: prev.x + info.offset.x,
                y: prev.y + info.offset.y
              }));
            }}
            dragConstraints={{
              top: -window.innerHeight + 500,
              left: -window.innerWidth + 360,
              right: window.innerWidth - 360,
              bottom: window.innerHeight - 500
            }}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed z-[9999] w-80 max-h-[450px] flex flex-col touch-none"
            style={{ 
              bottom: `calc(8rem + ${-position.y}px)`,
              right: `calc(1.5rem + ${-position.x}px)`,
            }}
          >
            {/* Drag Handle Header */}
            <div 
              onPointerDown={(e) => dragControls.start(e)}
              className="bg-gradient-to-r from-yellow-400/20 via-amber-400/20 to-orange-400/20 backdrop-blur-md rounded-t-2xl shadow-lg px-4 py-3 flex items-center justify-between border border-orange-200/50 border-b-0 cursor-grab active:cursor-grabbing relative overflow-hidden"
            >
              {/* Animated gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/10 via-orange-300/10 to-yellow-300/10 animate-[shimmer_3s_ease-in-out_infinite]"></div>
              
              <div className="flex items-center gap-3 relative z-10">
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-orange-400 rounded-full"></div>
                  <div className="w-1 h-1 bg-amber-400 rounded-full"></div>
                  <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-sm opacity-40"></div>
                  <div className="relative w-6 h-6 bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                    <Sparkles className="h-3.5 w-3.5 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-gray-900 font-semibold text-sm flex items-center gap-1">
                    LYNA
                    <span className="text-xs">✨</span>
                  </h3>
                  <p className="text-xs text-gray-600">KI-Assistentin</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                onPointerDown={(e) => e.stopPropagation()}
                className="text-gray-600 hover:text-gray-900 hover:bg-orange-100/50 rounded-lg p-1 transition-colors relative z-10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto space-y-3 pb-3 bg-white/95 backdrop-blur-sm px-3 pt-3 border-x border-orange-200/50 overscroll-contain">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.isUser ? 'justify-end' : 'items-start gap-2'}`}
                >
                  {!message.isUser && (
                    <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-sm opacity-30"></div>
                        <div className="relative w-7 h-7 bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                          <Sparkles className="h-3.5 w-3.5 text-white" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div
                    className={`rounded-2xl shadow-md px-4 py-2.5 max-w-[240px] text-sm ${ 
                      message.isUser
                        ? 'bg-gradient-to-r from-yellow-100/90 via-amber-100/90 to-orange-100/90 backdrop-blur-sm text-gray-900 border border-orange-200/70'
                        : 'bg-white/95 backdrop-blur-sm text-gray-800 border border-gray-200/50'
                    }`}
                  >
                    <p className="leading-relaxed">{message.content}</p>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-start gap-2"
                >
                  <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-sm opacity-30"></div>
                      <div className="relative w-7 h-7 bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                        <Sparkles className="h-3.5 w-3.5 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-md px-4 py-2.5 border border-gray-200/50">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Field */}
            <div className="bg-gradient-to-r from-yellow-50/80 via-amber-50/80 to-orange-50/80 backdrop-blur-md rounded-b-2xl shadow-lg px-3 py-3 flex items-center gap-2 border border-orange-200/50 border-t-0">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nachricht schreiben..."
                className="flex-1 bg-white/60 backdrop-blur-sm focus:outline-none text-gray-900 placeholder-gray-500 text-sm px-3 py-2 rounded-full border border-orange-200/30 focus:border-orange-300 transition-colors"
              />
              <button
                onClick={() => handleSend()}
                disabled={!inputValue.trim() || isLoading}
                className="bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-white p-2.5 rounded-full hover:from-yellow-500 hover:via-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Send className="h-3.5 w-3.5 relative z-10" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button - Bottom Right - Now Draggable */}
      <motion.button
        drag
        dragControls={bubbleDragControls}
        dragMomentum={false}
        dragElastic={0.1}
        onDragEnd={(event, info) => {
          setPosition(prev => ({
            x: prev.x + info.offset.x,
            y: prev.y + info.offset.y
          }));
        }}
        dragConstraints={{
          top: -window.innerHeight + 100,
          left: -window.innerWidth + 100,
          right: window.innerWidth - 100,
          bottom: window.innerHeight - 100
        }}
        onClick={(e) => {
          // Only toggle if not dragging
          const target = e.target as HTMLElement;
          if (!target.closest('[data-dragging]')) {
            setIsOpen(!isOpen);
          }
        }}
        className="fixed w-16 h-16 rounded-full flex items-center justify-center text-white shadow-2xl hover:shadow-3xl transition-all z-[9998] cursor-grab active:cursor-grabbing relative overflow-hidden group"
        style={{
          bottom: `calc(1.5rem + ${-position.y}px)`,
          right: `calc(1.5rem + ${-position.x}px)`,
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 rounded-full"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-300/50 via-transparent to-orange-400/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Glowing pulse effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-xl opacity-60 animate-pulse"></div>
        
        {/* Rotating shimmer effect */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%)',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />

        {/* Unread Badge */}
        {unreadCount > 0 && !isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg z-10 border-2 border-white"
          >
            {unreadCount}
          </motion.div>
        )}

        {/* Icon */}
        <div className="relative z-10 flex items-center justify-center">
          <Sparkles className="h-8 w-8 text-white drop-shadow-lg" />
        </div>
      </motion.button>

      {/* CSS for shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
      `}</style>
    </>
  );
}