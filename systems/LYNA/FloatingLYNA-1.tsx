import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useSystem } from '../SystemContext';
import { 
  X, 
  Send, 
  Maximize2, 
  Minimize2, 
  Sparkles, 
  Shield,
  Trash2,
  MessageCircle,
  Brain,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { AdminLoginDialog } from '../../admin/AdminLoginDialog';

type Message = {
  id: string;
  role: 'user' | 'lyna' | 'joi' | 'aura';
  content: string;
  timestamp: Date;
};

type AssistantMode = 'lyna' | 'joi' | 'aura';

interface FloatingLYNAProps {
  onClose?: () => void;
  zIndex?: number;
}

export function FloatingLYNA({ onClose, zIndex = 9999 }: FloatingLYNAProps) {
  const navigate = useNavigate();
  const { currentSystem } = useSystem();
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentMode, setCurrentMode] = useState<AssistantMode>('lyna');
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [showWelcomeBubbles, setShowWelcomeBubbles] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });

  // Initialize position (bottom right)
  useEffect(() => {
    const isMobile = window.innerWidth < 640;
    const isTablet = window.innerWidth >= 640 && window.innerWidth < 1024;
    
    if (isMobile) {
      setPosition({ x: window.innerWidth - 70, y: window.innerHeight - 70 });
    } else if (isTablet) {
      setPosition({ x: window.innerWidth - 90, y: window.innerHeight - 90 });
    } else {
      setPosition({ x: window.innerWidth - 100, y: window.innerHeight - 100 });
    }
  }, []);

  // Auto-collapse welcome bubbles after 5 seconds
  useEffect(() => {
    if (showWelcomeBubbles && !isOpen) {
      const timer = setTimeout(() => {
        setShowWelcomeBubbles(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showWelcomeBubbles, isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initial greeting when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = currentSystem === 'AURUM'
        ? "Hello! I'm LYNA, your guide through AURUM. I can help you with layers, archives, and creative structure. Need creative expansion? I can connect you with JOI. Need analysis? AURA is here too."
        : "Hello! I'm LYNA, your ARGENTUM companion. I focus on clarity, reduction, and presence. How can I help you stay focused today?";
      
      setMessages([{
        id: '1',
        role: 'lyna',
        content: greeting,
        timestamp: new Date(),
      }]);
    }
  }, [isOpen, currentSystem]);

  // Handle drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isOpen || isMaximized) return;
    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const newX = e.clientX - dragStartPos.current.x;
      const newY = e.clientY - dragStartPos.current.y;
      
      const maxX = window.innerWidth - 80;
      const maxY = window.innerHeight - 80;
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput('');

    // Check for Admin access request
    const adminPatterns = [
      /\badmin\b/i,
      /administration/i,
      /verwaltung/i,
      /\blogin\b/i,
      /anmelden/i,
      /admin\s+bereich/i,
      /admin\s+panel/i,
    ];

    if (adminPatterns.some(pattern => pattern.test(currentInput))) {
      const adminResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'lyna',
        content: "I see you want to access the Admin area. This is a protected space. Please authenticate.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, adminResponse]);
      setShowAdminDialog(true);
      return;
    }

    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const response = generateResponse(currentInput, currentMode, currentSystem);
      setMessages(prev => [...prev, response]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const generateResponse = (userInput: string, mode: AssistantMode, system: string): Message => {
    const lowerInput = userInput.toLowerCase();

    // Check for mode switching requests
    if (lowerInput.includes('joi') || lowerInput.includes('creative') || lowerInput.includes('idea')) {
      setCurrentMode('joi');
      return {
        id: Date.now().toString(),
        role: 'lyna',
        content: "I'm connecting you with JOI for creative expansion. JOI, please assist!",
        timestamp: new Date(),
      };
    }

    if (lowerInput.includes('aura') || lowerInput.includes('analysis') || lowerInput.includes('strategy')) {
      setCurrentMode('aura');
      return {
        id: Date.now().toString(),
        role: 'lyna',
        content: "I'm bringing in AURA for analytical insights. AURA, your expertise please!",
        timestamp: new Date(),
      };
    }

    // Mode-specific responses
    if (mode === 'joi') {
      return {
        id: Date.now().toString(),
        role: 'joi',
        content: generateJOIResponse(userInput, system),
        timestamp: new Date(),
      };
    }

    if (mode === 'aura') {
      return {
        id: Date.now().toString(),
        role: 'aura',
        content: generateAURAResponse(userInput, system),
        timestamp: new Date(),
      };
    }

    return {
      id: Date.now().toString(),
      role: 'lyna',
      content: generateLYNAResponse(userInput, system),
      timestamp: new Date(),
    };
  };

  const generateLYNAResponse = (input: string, system: string): string => {
    if (system === 'AURUM') {
      if (input.includes('layer')) return "In AURUM, layers create depth. Each layer preserves a moment in your creative journey. Would you like help organizing your layers?";
      if (input.includes('archive')) return "Your archive is your memory. Every sheet you've created is preserved here with full history. Want to explore your archives?";
      if (input.includes('help')) return "I can guide you through AURUM's features: Layers, Archive, History, Letter Mode, and Fold Mode. What interests you?";
      return "I'm here to help you build and preserve in AURUM. Your ideas deserve structure and permanence.";
    } else {
      if (input.includes('focus')) return "ARGENTUM is about the present moment. Let go of complexity and focus on what's here now.";
      if (input.includes('help')) return "In ARGENTUM, simplicity reigns. No layers, no archive—just pure, immediate creation. What do you want to create right now?";
      return "Stay present. ARGENTUM is about clarity and reduction. How can I help you simplify?";
    }
  };

  const generateJOIResponse = (input: string, system: string): string => {
    const creativePrompts = [
      "What if we expanded that idea into three parallel dimensions?",
      "I see potential here! Let's push this concept further—what's the wildest version?",
      "Interesting! Have you considered the inverse perspective?",
      "Let's layer this idea with unexpected connections. What if we combined it with...",
      "That's a spark! Now let's fan it into a flame—what comes next?",
    ];
    return creativePrompts[Math.floor(Math.random() * creativePrompts.length)];
  };

  const generateAURAResponse = (input: string, system: string): string => {
    const analyticalPrompts = [
      "Let's break this down systematically. What are the core components?",
      "From a strategic perspective, the key risk factors are...",
      "Structurally, this requires three validation steps: input, logic, and output.",
      "The most efficient approach would be to prioritize by impact and effort.",
      "Analytically, this concept has strong foundations. Let's validate the edge cases.",
    ];
    return analyticalPrompts[Math.floor(Math.random() * analyticalPrompts.length)];
  };

  const handleClearChat = () => {
    const greeting = currentSystem === 'AURUM'
      ? "Chat cleared. I'm LYNA, ready to assist with AURUM."
      : "Chat cleared. I'm LYNA, ready to assist with ARGENTUM.";
    
    setMessages([{
      id: Date.now().toString(),
      role: 'lyna',
      content: greeting,
      timestamp: new Date(),
    }]);
    toast.success('Chat cleared');
  };

  const handleAdminLogin = (token: string, user: any) => {
    console.log('Admin login successful:', user);
    setShowAdminDialog(false);
    setIsOpen(false);
    setIsMaximized(false);
    toast.success(`Welcome back, ${user.name}! Opening Admin area...`);
    
    // Navigate to admin dashboard
    setTimeout(() => {
      navigate('/admin');
    }, 500);
  };

  const getModeColor = () => {
    switch (currentMode) {
      case 'joi': 
        return currentSystem === 'AURUM' 
          ? 'from-green-500 to-emerald-500' 
          : 'from-green-400 to-emerald-400';
      case 'aura': 
        return currentSystem === 'AURUM' 
          ? 'from-blue-500 to-indigo-500' 
          : 'from-cyan-400 to-blue-400';
      default: 
        // LYNA: Immer Gold/Orange, unabhängig vom System
        return 'from-amber-500 to-orange-500';
    }
  };

  const getModeIcon = () => {
    switch (currentMode) {
      case 'joi': return <Sparkles className="w-5 h-5" />;
      case 'aura': return <Brain className="w-5 h-5" />;
      default: return <Zap className="w-5 h-5" />;
    }
  };

  const getModeName = () => {
    switch (currentMode) {
      case 'joi': return 'JOI - Creative Mode';
      case 'aura': return 'AURA - Analytical Mode';
      default: return 'LYNA - Guide Mode';
    }
  };

  // Collapsed Bubble
  if (!isOpen && !isMaximized) {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const isTablet = typeof window !== 'undefined' && window.innerWidth >= 640 && window.innerWidth < 1024;
    const bubbleSize = isMobile ? '60px' : isTablet ? '70px' : '80px';
    const iconSize = isMobile ? 'w-6 h-6' : isTablet ? 'w-8 h-8' : 'w-10 h-10';
    
    return (
      <>
        <div
          ref={bubbleRef}
          onMouseDown={handleMouseDown}
          onClick={() => !isDragging && setIsOpen(true)}
          className={`fixed cursor-${isDragging ? 'grabbing' : 'pointer'} select-none`}
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            width: bubbleSize,
            height: bubbleSize,
            zIndex,
          }}
        >
          <div className={`relative w-full h-full rounded-full bg-gradient-to-br ${getModeColor()} shadow-2xl flex items-center justify-center hover:scale-110 transition-transform duration-200`}>
            <MessageCircle className={`${iconSize} text-white`} />
          </div>
          
          {/* Pulse animation */}
          <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${getModeColor()} opacity-30 animate-ping`} />
        </div>

        {/* Admin Dialog */}
        {showAdminDialog && (
          <AdminLoginDialog
            isOpen={showAdminDialog}
            onClose={() => setShowAdminDialog(false)}
            onLoginSuccess={handleAdminLogin}
          />
        )}
      </>
    );
  }

  // Expanded Chat - Responsive sizing
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const isTablet = typeof window !== 'undefined' && window.innerWidth >= 640 && window.innerWidth < 1024;
  
  const chatWidth = isMaximized 
    ? 'w-full h-full' 
    : isMobile 
      ? 'w-[calc(100vw-2rem)] max-w-md h-[70vh]'
      : isTablet
        ? 'w-[400px] h-[550px]'
        : 'w-[500px] h-[600px]';
  
  const chatPosition = isMaximized ? 'inset-0' : isMobile ? 'bottom-2 right-2 left-2' : 'bottom-4 right-4';

  return (
    <>
      {/* Backdrop for maximized */}
      {isMaximized && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" style={{ zIndex: zIndex - 1 }} />
      )}

      {/* Chat Window */}
      <div
        className={`fixed ${chatPosition} ${chatWidth} flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300`}
        style={{ zIndex: zIndex + 1 }}
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${getModeColor()} p-3 sm:p-4 text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                {getModeIcon()}
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg">{getModeName()}</h3>
                <p className="text-xs text-white/80 hidden sm:block">{currentSystem}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Admin Button */}
              <button
                onClick={() => setShowAdminDialog(true)}
                className="hidden sm:block p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Admin Area"
              >
                <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Clear Chat */}
              <button
                onClick={handleClearChat}
                className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Clear chat"
              >
                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Maximize/Minimize */}
              <button
                onClick={() => setIsMaximized(!isMaximized)}
                className="hidden sm:block p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                {isMaximized ? (
                  <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>

              {/* Close */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsMaximized(false);
                  onClose?.();
                }}
                className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex border-b dark:border-gray-700 bg-white dark:bg-gray-900">
          <button
            onClick={() => setCurrentMode('lyna')}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              currentMode === 'lyna'
                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            LYNA
          </button>
          <button
            onClick={() => setCurrentMode('joi')}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              currentMode === 'joi'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            JOI
          </button>
          <button
            onClick={() => setCurrentMode('aura')}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              currentMode === 'aura'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            AURA
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gray-50 dark:bg-gray-950">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[80%] px-3 sm:px-4 py-2 sm:py-3 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                    : message.role === 'joi'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100'
                    : message.role === 'aura'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100'
                    : 'bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100'
                }`}
              >
                <p className="text-xs sm:text-sm whitespace-pre-wrap">{message.content}</p>
                <p className={`text-[10px] sm:text-xs mt-1 ${
                  message.role === 'user' ? 'text-gray-600 dark:text-gray-400' : 'text-gray-500 dark:text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-200 dark:bg-gray-800 rounded-2xl px-3 sm:px-4 py-2 sm:py-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 sm:p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={`Ask ${currentMode.toUpperCase()}...`}
              className="flex-1 px-3 sm:px-4 py-2 border dark:border-gray-700 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-800 dark:text-gray-100"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className={`p-2 rounded-lg bg-gradient-to-r ${getModeColor()} text-white disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform`}
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Admin Dialog */}
      {showAdminDialog && (
        <AdminLoginDialog
          isOpen={showAdminDialog}
          onClose={() => setShowAdminDialog(false)}
          onLoginSuccess={handleAdminLogin}
        />
      )}
    </>
  );
}