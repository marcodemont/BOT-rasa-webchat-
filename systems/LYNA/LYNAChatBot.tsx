import { useState, useRef, useEffect } from 'react';
import { MessageCircle, MessageSquare, X, Send, Loader2, Trash2 } from 'lucide-react';
import { Button } from '../../../src/app/components/ui/button';
import { Input } from '../../../src/app/components/ui/input';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import type { Message, ChatBotProps } from './types';
import { callLYNA } from './api';
import { JOIChatBot } from '../JOI/JOIChatBot';

const STORAGE_KEY = 'vibe_lyna_messages';
const JOI_BUBBLE_KEY = 'vibe_joi_bubble_visible';
const LYNA_BUBBLE_POSITION_KEY = 'vibe_lyna_bubble_position';
const JOI_BUBBLE_POSITION_KEY = 'vibe_joi_bubble_position';

export function LYNAChatBot({ currentUser, onClose, zIndex = 9999 }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showJOIBubble, setShowJOIBubble] = useState(false);
  const [isJOIOpen, setIsJOIOpen] = useState(false);
  
  // Drag & Drop State - LYNA
  const [bubblePosition, setBubblePosition] = useState<{ x: number; y: number } | null>(null);
  const [isBubbleDragging, setIsBubbleDragging] = useState(false);
  const [bubbleDragOffset, setBubbleDragOffset] = useState({ x: 0, y: 0 });
  const [bubbleHasMoved, setBubbleHasMoved] = useState(false);

  // Drag & Drop State - JOI
  const [joiBubblePosition, setJoiBubblePosition] = useState<{ x: number; y: number } | null>(null);
  const [isJoiBubbleDragging, setIsJoiBubbleDragging] = useState(false);
  const [joiBubbleDragOffset, setJoiBubbleDragOffset] = useState({ x: 0, y: 0 });
  const [joiBubbleHasMoved, setJoiBubbleHasMoved] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const joiBubbleRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    "Wie erstelle ich einen Post?",
    "Wie funktioniert der Chat?",
    "Wie bearbeite ich mein Profil?",
    "Welche Reaktionen gibt es?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem(STORAGE_KEY);
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        const messagesWithDates = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(messagesWithDates);
      } catch (error) {
        console.error('Error loading messages:', error);
        initWelcomeMessage();
      }
    } else {
      initWelcomeMessage();
    }
  }, []); // Removed currentUser dependency to prevent re-initialization on reload

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  // Load JOI bubble visibility
  useEffect(() => {
    const joiBubbleVisible = localStorage.getItem(JOI_BUBBLE_KEY);
    if (joiBubbleVisible === 'true') {
      setShowJOIBubble(true);
    }
  }, []);

  // Save JOI bubble visibility
  useEffect(() => {
    if (showJOIBubble) {
      localStorage.setItem(JOI_BUBBLE_KEY, 'true');
    } else {
      localStorage.removeItem(JOI_BUBBLE_KEY);
    }
  }, [showJOIBubble]);

  // Load LYNA bubble position
  useEffect(() => {
    const savedPosition = localStorage.getItem(LYNA_BUBBLE_POSITION_KEY);
    if (savedPosition) {
      try {
        setBubblePosition(JSON.parse(savedPosition));
      } catch (error) {
        console.error('Error loading LYNA bubble position:', error);
      }
    }
  }, []);

  // Save LYNA bubble position
  useEffect(() => {
    if (bubblePosition) {
      localStorage.setItem(LYNA_BUBBLE_POSITION_KEY, JSON.stringify(bubblePosition));
    }
  }, [bubblePosition]);

  // Load JOI bubble position
  useEffect(() => {
    const savedPosition = localStorage.getItem(JOI_BUBBLE_POSITION_KEY);
    if (savedPosition) {
      try {
        setJoiBubblePosition(JSON.parse(savedPosition));
      } catch (error) {
        console.error('Error loading JOI bubble position:', error);
      }
    }
  }, []);

  // Save JOI bubble position
  useEffect(() => {
    if (joiBubblePosition) {
      localStorage.setItem(JOI_BUBBLE_POSITION_KEY, JSON.stringify(joiBubblePosition));
    }
  }, [joiBubblePosition]);

  const initWelcomeMessage = () => {
    const welcomeMessage = currentUser 
      ? `Hey ${currentUser.user_metadata?.firstName || 'there'}! Schön dich zu sehen!\n\nIch bin LYNA und helfe dir hier bei allem! Egal ob du was über Posts, Chats, dein Profil oder die coolen Reaktionen wissen willst - frag mich einfach!\n\nWomit kann ich dir helfen?`
      : `Hey! Na, wie geht's?\n\nIch bin LYNA, deine persönliche Assistentin hier auf Vibe!\n\nMelde dich an, dann kann ich dir noch besser helfen! Aber auch ohne Login kann ich dir die Basics erklären.\n\nWas willst du wissen?`;

    setMessages([{
      role: 'assistant',
      content: welcomeMessage,
      timestamp: new Date()
    }]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    // Easter Egg: Check for "joi"
    const trimmedInput = inputMessage.trim().toLowerCase();
    if (trimmedInput === 'joi' || trimmedInput === 'jo') {
      const userMessage: Message = {
        role: 'user',
        content: inputMessage,
        timestamp: new Date()
      };

      const lynaResponse: Message = {
        role: 'assistant',
        content: 'Oh, du willst kreativ werden? Perfekt!\n\nIch rufe JOI für dich! Sie ist die Expertin für kreative Ideen und Post-Inspiration!\n\nJOI-Bubble erscheint gleich...',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage, lynaResponse]);
      setInputMessage('');

      setTimeout(() => {
        setShowJOIBubble(true);
        toast.success('JOI-Bubble erscheint!', {
          description: 'Klicke auf das grüne Icon um mit JOI zu chatten!'
        });
      }, 1000);

      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await callLYNA({
        prompt: currentInput,
        mode: 'general',
        context: {
          userInfo: currentUser
        }
      });

      const aiMessage: Message = {
        role: 'assistant',
        content: response.text || 'Hey! Ich bin gerade etwas verwirrt, aber ich helfe dir trotzdem gerne! Frag mich etwas über Posts, Chats oder dein Profil!',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error calling LYNA:', error);
      
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Oh nein! Da ist was schiefgelaufen.\n\nAber keine Sorge - ich kann dir trotzdem helfen!\n\nFrag mich:\n- Wie erstelle ich einen Post?\n- Wie funktioniert der Chat?\n- Wie bearbeite ich mein Profil?\n- Was sind die Reaktionen?\n\nTipp: Schreib "joi" für kreative Ideen!',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
    setTimeout(() => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      handleSendMessage();
    }, 100);
  };

  const handleClearChat = () => {
    localStorage.removeItem(STORAGE_KEY);
    initWelcomeMessage();
    toast.success('Chat-Verlauf gelöscht!');
  };

  // LYNA Bubble Drag Handlers (Mouse + Touch)
  const handleBubbleStart = (clientX: number, clientY: number) => {
    const rect = bubbleRef.current?.getBoundingClientRect();
    if (rect) {
      setIsBubbleDragging(true);
      setBubbleHasMoved(false);
      setBubbleDragOffset({
        x: clientX - rect.left,
        y: clientY - rect.top
      });
    }
  };

  const handleBubbleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleBubbleStart(e.clientX, e.clientY);
  };

  const handleBubbleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleBubbleStart(touch.clientX, touch.clientY);
  };

  // LYNA Bubble Move Logic
  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
      if (!isBubbleDragging) return;

      const newX = clientX - bubbleDragOffset.x;
      const newY = clientY - bubbleDragOffset.y;

      setBubblePosition({
        x: Math.max(0, Math.min(newX, window.innerWidth - 80)),
        y: Math.max(0, Math.min(newY, window.innerHeight - 80))
      });

      if (!bubbleHasMoved) {
        setBubbleHasMoved(true);
      }
    };

    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    };

    const handleEnd = () => {
      setIsBubbleDragging(false);
      setTimeout(() => setBubbleHasMoved(false), 100);
    };

    if (isBubbleDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleEnd);
      };
    }
  }, [isBubbleDragging, bubbleDragOffset, bubbleHasMoved]);

  const handleBubbleClick = () => {
    if (!bubbleHasMoved) {
      setIsOpen(true);
    }
  };

  // JOI Bubble Drag Handlers (Mouse + Touch)
  const handleJoiBubbleStart = (clientX: number, clientY: number) => {
    const rect = joiBubbleRef.current?.getBoundingClientRect();
    if (rect) {
      setIsJoiBubbleDragging(true);
      setJoiBubbleHasMoved(false);
      setJoiBubbleDragOffset({
        x: clientX - rect.left,
        y: clientY - rect.top
      });
    }
  };

  const handleJoiBubbleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleJoiBubbleStart(e.clientX, e.clientY);
  };

  const handleJoiBubbleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleJoiBubbleStart(touch.clientX, touch.clientY);
  };

  // JOI Bubble Move Logic
  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
      if (!isJoiBubbleDragging) return;

      const newX = clientX - joiBubbleDragOffset.x;
      const newY = clientY - joiBubbleDragOffset.y;

      setJoiBubblePosition({
        x: Math.max(0, Math.min(newX, window.innerWidth - 80)),
        y: Math.max(0, Math.min(newY, window.innerHeight - 80))
      });

      if (!joiBubbleHasMoved) {
        setJoiBubbleHasMoved(true);
      }
    };

    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    };

    const handleEnd = () => {
      setIsJoiBubbleDragging(false);
      setTimeout(() => setJoiBubbleHasMoved(false), 100);
    };

    if (isJoiBubbleDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleEnd);
      };
    }
  }, [isJoiBubbleDragging, joiBubbleDragOffset, joiBubbleHasMoved]);

  const handleJoiBubbleClick = () => {
    if (!joiBubbleHasMoved) {
      setIsJOIOpen(true);
    }
  };

  return (
    <>
      {/* LYNA Floating Bubble */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            ref={bubbleRef}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            onMouseDown={handleBubbleMouseDown}
            onTouchStart={handleBubbleTouchStart}
            onClick={handleBubbleClick}
            className="fixed z-50 cursor-grab active:cursor-grabbing touch-none"
            style={{
              left: bubblePosition ? `${bubblePosition.x}px` : undefined,
              top: bubblePosition ? `${bubblePosition.y}px` : undefined,
              right: bubblePosition ? undefined : '1.5rem',
              bottom: bubblePosition ? undefined : '1.5rem',
              zIndex
            }}
          >
            <MessageCircle 
              className="w-20 h-20 text-purple-500 drop-shadow-2xl" 
              fill="white"
              strokeWidth={1.5}
              style={{
                filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.5))'
              }}
            />
            <div className="absolute top-1 right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* JOI Floating Bubble */}
      <AnimatePresence>
        {showJOIBubble && !isJOIOpen && (
          <motion.div
            ref={joiBubbleRef}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            onMouseDown={handleJoiBubbleMouseDown}
            onTouchStart={handleJoiBubbleTouchStart}
            onClick={handleJoiBubbleClick}
            className="fixed z-50 cursor-grab active:cursor-grabbing touch-none"
            style={{
              left: joiBubblePosition ? `${joiBubblePosition.x}px` : undefined,
              top: joiBubblePosition ? `${joiBubblePosition.y}px` : undefined,
              right: joiBubblePosition ? undefined : '7rem',
              bottom: joiBubblePosition ? undefined : '1.5rem',
              zIndex
            }}
          >
            <MessageSquare 
              className="w-20 h-20 text-emerald-500 drop-shadow-2xl" 
              fill="white"
              strokeWidth={2}
              strokeLinecap="square"
              strokeLinejoin="miter"
              style={{
                filter: 'drop-shadow(0 0 20px rgba(16, 185, 129, 0.5))',
                borderRadius: '8px'
              }}
            />
            <div className="absolute top-1 right-1 w-5 h-5 bg-yellow-400 rounded-full border-2 border-white animate-pulse"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LYNA Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-6 right-6 w-[400px] h-[600px] bg-white/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 flex flex-col overflow-hidden max-w-[calc(100vw-3rem)] max-h-[calc(100vh-3rem)]"
            style={{
              boxShadow: '0 0 60px rgba(0, 0, 0, 0.15)',
              zIndex: zIndex + 1
            }}
          >
            {/* Header */}
            <div className="relative p-6 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center border-2 border-white/30">
                    <MessageCircle className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">LYNA</h3>
                    <p className="text-white/80 text-sm">Deine KI-Assistentin</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClearChat}
                    className="w-10 h-10 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center hover:bg-white/30 transition-colors border border-white/30"
                    title="Chat löschen"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onClose?.();
                    }}
                    className="w-10 h-10 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center hover:bg-white/30 transition-colors border border-white/30"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide" style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'bg-white/60 backdrop-blur-xl border border-white/30 text-gray-800'
                  } rounded-2xl px-4 py-3 shadow-lg`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-white/70' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/60 backdrop-blur-xl border border-white/30 rounded-2xl px-4 py-3 shadow-lg">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                      <span className="text-sm text-gray-600">LYNA denkt nach...</span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2">
                <p className="text-xs text-gray-500 mb-2">Schnelle Fragen:</p>
                <div className="grid grid-cols-2 gap-2">
                  {quickQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickQuestion(q)}
                      className="text-xs bg-white/60 backdrop-blur-xl border border-white/30 rounded-lg px-3 py-2 hover:bg-white/80 transition-all text-left"
                    >
                      {q}
                    </button>
                  ))}
                </div>
                <div className="mt-2 pt-2 border-t border-white/30">
                  <p className="text-xs text-gray-500 mb-1.5">Easter Egg:</p>
                  <button
                    onClick={() => handleQuickQuestion('joi')}
                    className="w-full text-xs bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-300/50 rounded-lg px-3 py-2 hover:from-emerald-500/30 hover:to-green-500/30 transition-all text-left text-emerald-700 font-medium"
                  >
                    Schreib "joi" für kreative Ideen!
                  </button>
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 bg-white/40 backdrop-blur-xl border-t border-white/30">
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Deine Frage..."
                  className="flex-1 bg-white/60 backdrop-blur-xl border-white/30"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* JOI ChatBot */}
      <AnimatePresence>
        {isJOIOpen && (
          <JOIChatBot
            currentUser={currentUser}
            onClose={() => setIsJOIOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}