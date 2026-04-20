import { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Maximize2, 
  Minimize2, 
  Sparkles, 
  Shield,
  Trash2,
  MessageCircle,
  Activity,
  FileText,
  Zap,
  Lock,
  User,
  Key
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { AdminLoginDialog } from '../../admin/AdminLoginDialog';
import { useNavigate } from 'react-router';
import {
  LYNASystem,
  AnalysisState,
  AIExplanation,
} from './core';
import {
  projectId,
  publicAnonKey,
} from '../../../utils/supabase/info';
import { supabase } from '../../../utils/supabase/client';

/**
 * LYNA - AI Assistant Component
 * 
 * Main AI assistant for JOAT.project
 * Available everywhere except in admin areas
 */

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface LynaAssistantProps {
  isAdminMode?: boolean;
  onClose?: () => void;
  zIndex?: number;
}

export function LynaAssistant({ 
  isAdminMode = false, 
  onClose,
  zIndex = 9999 
}: LynaAssistantProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  
  const bubbleRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize position (bottom right)
  useEffect(() => {
    // Responsive positioning based on screen size
    const isMobile = window.innerWidth < 640;
    const isTablet = window.innerWidth >= 640 && window.innerWidth < 1024;
    
    if (isMobile) {
      // Mobile: Smaller, bottom right corner
      setPosition({
        x: window.innerWidth - 70,
        y: window.innerHeight - 70,
      });
    } else if (isTablet) {
      // Tablet: Medium size, bottom right
      setPosition({
        x: window.innerWidth - 90,
        y: window.innerHeight - 90,
      });
    } else {
      // Desktop: Default size
      setPosition({
        x: window.innerWidth - 100,
        y: window.innerHeight - 100,
      });
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: 'Hallo! Ich bin LYNA, deine AI-Assistentin für JOAT.project. Wie kann ich dir heute helfen?',
        timestamp: new Date(),
      }]);
    }
  }, [isOpen]);

  // Handle drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isOpen || isMaximized) return; // Only drag when collapsed
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
      
      // Keep within viewport bounds
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
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // TODO: Replace with actual API call
      // Simulated AI response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const aiResponse: Message = {
        role: 'assistant',
        content: `Das ist eine Demo-Antwort auf: "${userMessage.content}". Die echte AI-Integration erfolgt über das Backend mit OpenAI API.`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Fehler beim Senden der Nachricht');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([{
      role: 'assistant',
      content: 'Chat wurde geleert. Wie kann ich dir helfen?',
      timestamp: new Date(),
    }]);
    toast.success('Chat geleert');
  };

  const handleAdminLogin = (token: string, user: any) => {
    console.log('Admin login successful:', user);
    setShowAdminDialog(false);
    setIsOpen(false);
    setIsMaximized(false);
    // TODO: Navigate to admin dashboard
    toast.success('Admin-Login erfolgreich!');
  };

  // Collapsed Bubble
  if (!isOpen && !isMaximized) {
    // Responsive bubble size
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
          <div className="relative w-full h-full rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 shadow-2xl flex items-center justify-center hover:scale-110 transition-transform duration-200">
            <MessageCircle className={`${iconSize} text-white`} />
          </div>
          
          {/* Pulse animation */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 opacity-30 animate-ping" />
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]" />
      )}

      {/* Chat Window */}
      <div
        className={`fixed ${chatPosition} ${chatWidth} flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300`}
        style={{ zIndex: zIndex + 1 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-amber-600 p-3 sm:p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg">LYNA</h3>
                <p className="text-xs text-white/80 hidden sm:block">AI Assistant für JOAT.project</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Admin Button - Hidden on mobile */}
              <button
                onClick={() => setShowAdminDialog(true)}
                className="hidden sm:block p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Admin-Bereich"
              >
                <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Clear Chat */}
              <button
                onClick={handleClearChat}
                className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Chat leeren"
              >
                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Maximize/Minimize - Hidden on mobile */}
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

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gray-50">
          {messages.map((message, idx) => (
            <div
              key={idx}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[80%] px-3 sm:px-4 py-2 sm:py-3 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white'
                    : 'bg-white border-2 border-gray-200 text-gray-900'
                }`}
              >
                <p className="text-xs sm:text-sm whitespace-pre-wrap">{message.content}</p>
                <p className={`text-[10px] sm:text-xs mt-1 ${
                  message.role === 'user' ? 'text-white/70' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString('de-DE', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border-2 border-gray-200 px-3 sm:px-4 py-2 sm:py-3 rounded-2xl">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs sm:text-sm text-gray-500">LYNA denkt nach...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 sm:p-4 border-t border-gray-200 bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Frage LYNA..."
              disabled={isLoading}
              className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="px-3 sm:px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline text-sm">Senden</span>
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

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  analysisState?: AnalysisState;
  explanation?: AIExplanation;
}

interface ChatBotProps {
  onCreateBoardNote?: (noteData: {
    content: string;
    type?: "sticky" | "text" | "card";
    x?: number;
    y?: number;
  }) => void;
  onOpenAura?: () => void;
  onEditorLogin?: (token: string, user: any) => void;
  onClick?: () => void;
  zIndex?: number;
  onClose?: () => void;
}

export function ChatBot({
  onCreateBoardNote,
  onOpenAura,
  onEditorLogin,
  onClick,
  zIndex = 9999,
  onClose,
}: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragTranslate, setDragTranslate] = useState({
    x: 0,
    y: 0,
  });
  const [bubblePosition, setBubblePosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isBubbleDragging, setIsBubbleDragging] =
    useState(false);
  const [bubbleDragOffset, setBubbleDragOffset] = useState({
    x: 0,
    y: 0,
  });
  const [bubbleHasMoved, setBubbleHasMoved] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [showIntroBubble, setShowIntroBubble] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    email: string;
    role: string;
  } | null>(null);
  const [isAdminActive, setIsAdminActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLButtonElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const bubbleAnimationFrameRef = useRef<number | null>(null);

  // Check and update admin login status
  useEffect(() => {
    const checkAdminStatus = () => {
      const status = isAdminLoggedIn();
      setIsAdminActive(status);
    };

    // Check on mount
    checkAdminStatus();

    // Check periodically (every 5 seconds) to catch session expiry
    const interval = setInterval(checkAdminStatus, 5000);

    // Also listen to storage events (when localStorage changes in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (
        e.key === "fraktal_admin_session" ||
        e.key === "admin_token"
      ) {
        checkAdminStatus();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener(
        "storage",
        handleStorageChange,
      );
    };
  }, []);

  // Load current user from localStorage
  useEffect(() => {
    const patientData = localStorage.getItem("patient_data");
    const doctorData = localStorage.getItem("doctor_data");
    const adminUser = localStorage.getItem("admin_user");

    if (patientData) {
      try {
        const patient = JSON.parse(patientData);
        setCurrentUser({
          id: patient.id,
          name: patient.name || patient.email,
          email: patient.email,
          role: "patient",
        });
      } catch (e) {
        console.error("Error parsing patient data:", e);
      }
    } else if (doctorData) {
      try {
        const doctor = JSON.parse(doctorData);
        setCurrentUser({
          id: doctor.id,
          name: doctor.name || doctor.email,
          email: doctor.email,
          role: "doctor",
        });
      } catch (e) {
        console.error("Error parsing doctor data:", e);
      }
    } else if (adminUser) {
      try {
        const admin = JSON.parse(adminUser);
        setCurrentUser({
          id: admin.id || "admin",
          name: admin.name || admin.email,
          email: admin.email,
          role: "admin",
        });
      } catch (e) {
        console.error("Error parsing admin data:", e);
      }
    }
  }, []);

  // Check if user is logged in as admin
  const isAdminLoggedIn = () => {
    const adminSessionStr = localStorage.getItem(
      "fraktal_admin_session",
    );
    if (!adminSessionStr) return false;

    try {
      const session = JSON.parse(adminSessionStr);
      // Check if session is expired
      if (session.expiresAt && Date.now() > session.expiresAt) {
        // Session expired, clean up
        localStorage.removeItem("fraktal_admin_session");
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
        return false;
      }
      return true;
    } catch (e) {
      console.error("Error parsing admin session:", e);
      return false;
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Show intro bubble only on first visit after 3-5 seconds
  useEffect(() => {
    const hasSeenIntro = localStorage.getItem(
      "hasSeenLynaIntro",
    );

    if (!hasSeenIntro) {
      // Random delay between 3-5 seconds
      const delay = 3000 + Math.random() * 2000;
      const timer = setTimeout(() => {
        setShowIntroBubble(true);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, []);

  // Close intro bubble on any click and mark as seen
  useEffect(() => {
    const handleClickAnywhere = () => {
      if (showIntroBubble) {
        setShowIntroBubble(false);
        localStorage.setItem("hasSeenLynaIntro", "true");
      }
    };

    if (showIntroBubble) {
      document.addEventListener("click", handleClickAnywhere);
      return () =>
        document.removeEventListener(
          "click",
          handleClickAnywhere,
        );
    }
  }, [showIntroBubble]);

  // Load messages from localStorage on mount
  useEffect(() => {
    // Create welcome message based on user context
    const getWelcomeMessage = () => {
      if (currentUser) {
        // Im Portal: Personalisierte Begrüßung
        return `Hallo ${currentUser.name}! Ich bin LYNA – Ihre persönliche medizinische Assistentin. Ich kann Ihnen bei allen Fragen helfen, Ihre Vitaldaten analysieren und Sie unterstützen. Wie kann ich Ihnen heute helfen?`;
      } else {
        // Auf der Website: Neutrale Begrüßung
        return "Hallo! Ich bin LYNA – Ihre medizinische KI-Assistentin. Ich kann Ihnen Fragen zum FRAKTAL vitalLink System beantworten und Sie bei der Nutzung unterstützen. Wie kann ich Ihnen helfen?";
      }
    };

    if (currentUser === undefined) return; // Still loading user data

    const messagesKey = currentUser
      ? `lyna_chat_messages_${currentUser.id}`
      : "lyna_chat_messages_public";
    const savedMessages = localStorage.getItem(messagesKey);

    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        // Convert timestamp strings back to Date objects
        const messagesWithDates = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(messagesWithDates);
      } catch (error) {
        console.error("Error loading chat messages:", error);
        // Start with welcome message if loading fails
        setMessages([
          {
            role: "assistant",
            content: getWelcomeMessage(),
            timestamp: new Date(),
          },
        ]);
      }
    } else {
      // Start with welcome message
      setMessages([
        {
          role: "assistant",
          content: getWelcomeMessage(),
          timestamp: new Date(),
        },
      ]);
    }
  }, [currentUser]);

  // Save messages to localStorage whenever they change (per user)
  useEffect(() => {
    if (messages.length > 0 && currentUser) {
      const messagesKey = `lyna_chat_messages_${currentUser.id}`;
      localStorage.setItem(
        messagesKey,
        JSON.stringify(messages),
      );
    }
  }, [messages, currentUser]);

  // Close LYNA chat when admin dialog opens
  useEffect(() => {
    if (showAdminDialog) {
      setIsOpen(false);
    }
  }, [showAdminDialog]);

  // Calculate chat position based on bubble position
  // Chat expands from bubble (bubble = bottom-left or bottom-right corner of chat)
  const getChatPositionFromBubble = () => {
    if (!bubbleRef.current) {
      // Default position if no bubble ref
      return {
        x: window.innerWidth - 420,
        y: window.innerHeight - 664,
      };
    }

    const bubbleRect =
      bubbleRef.current.getBoundingClientRect();
    const bubbleCenterX =
      bubbleRect.left + bubbleRect.width / 2;
    const bubbleCenterY =
      bubbleRect.top + bubbleRect.height / 2;

    const chatWidth = 384; // w-96 = 24rem = 384px
    const chatHeight = 600; // h-[600px]

    // Check if there's more space on the left or right
    const spaceOnRight = window.innerWidth - bubbleCenterX;
    const spaceOnLeft = bubbleCenterX;

    let chatX, chatY;

    if (
      spaceOnRight > chatWidth &&
      spaceOnRight >= spaceOnLeft
    ) {
      // Expand to the right, bubble = bottom-left corner
      chatX = bubbleCenterX - 32; // Small offset from bubble edge
      chatY = bubbleCenterY - chatHeight + 32; // Bubble at bottom
    } else {
      // Expand to the left, bubble = bottom-right corner
      chatX = bubbleCenterX - chatWidth + 32; // Bubble at right edge
      chatY = bubbleCenterY - chatHeight + 32; // Bubble at bottom
    }

    // Ensure chat stays within viewport
    chatX = Math.max(
      16,
      Math.min(chatX, window.innerWidth - chatWidth - 16),
    );
    chatY = Math.max(
      16,
      Math.min(chatY, window.innerHeight - chatHeight - 16),
    );

    return { x: chatX, y: chatY };
  };

  // Open chat from bubble with animation
  const openChat = () => {
    setIsAnimating(true);
    setIsOpen(true);

    // Position chat based on bubble location
    const chatPos = getChatPositionFromBubble();
    setPosition(chatPos);

    setTimeout(() => setIsAnimating(false), 300);
  };

  // Close chat and collapse back into bubble with animation
  const closeChat = () => {
    setIsAnimating(true);

    // Don't change position, just trigger animation
    // The chat will collapse visually while position stays

    setTimeout(() => {
      setIsOpen(false);
      setPosition(null);
      setIsAnimating(false);
    }, 300);
  };

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isAnimating) return;
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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !position) return;

      const translateX = e.clientX - position.x - dragOffset.x;
      const translateY = e.clientY - position.y - dragOffset.y;

      // Use requestAnimationFrame for smooth updates
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(() => {
        setDragTranslate({ x: translateX, y: translateY });
      });
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!isDragging || !position) return;

      // Calculate final position
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

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener(
          "mousemove",
          handleMouseMove,
        );
        document.removeEventListener("mouseup", handleMouseUp);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [isDragging, dragOffset, position, dragTranslate]);

  const handleBubbleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const rect = bubbleRef.current?.getBoundingClientRect();
    if (rect) {
      setIsBubbleDragging(true);
      setBubbleHasMoved(false); // Reset movement flag
      setBubbleDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  // Touch support for mobile devices (iPad, etc.)
  const handleBubbleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const rect = bubbleRef.current?.getBoundingClientRect();
    if (rect && e.touches[0]) {
      setIsBubbleDragging(true);
      setBubbleHasMoved(false); // Reset movement flag
      setBubbleDragOffset({
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isBubbleDragging) return;

      // Use requestAnimationFrame for smooth updates
      if (bubbleAnimationFrameRef.current) {
        cancelAnimationFrame(bubbleAnimationFrameRef.current);
      }

      bubbleAnimationFrameRef.current = requestAnimationFrame(
        () => {
          const newX = e.clientX - bubbleDragOffset.x;
          const newY = e.clientY - bubbleDragOffset.y;

          setBubblePosition({
            x: newX,
            y: newY,
          });

          // Set hasMoved flag if position changed significantly
          if (!bubbleHasMoved) {
            const startX =
              bubbleRef.current?.getBoundingClientRect().left ||
              0;
            const startY =
              bubbleRef.current?.getBoundingClientRect().top ||
              0;
            const distance = Math.sqrt(
              Math.pow(newX - startX, 2) +
                Math.pow(newY - startY, 2),
            );
            if (distance > 5) {
              // 5px tolerance
              setBubbleHasMoved(true);
            }
          }
        },
      );
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isBubbleDragging || !e.touches[0]) return;

      // Use requestAnimationFrame for smooth updates
      if (bubbleAnimationFrameRef.current) {
        cancelAnimationFrame(bubbleAnimationFrameRef.current);
      }

      bubbleAnimationFrameRef.current = requestAnimationFrame(
        () => {
          const newX = e.touches[0].clientX - bubbleDragOffset.x;
          const newY = e.touches[0].clientY - bubbleDragOffset.y;

          setBubblePosition({
            x: newX,
            y: newY,
          });

          // Set hasMoved flag if position changed significantly
          if (!bubbleHasMoved) {
            const startX =
              bubbleRef.current?.getBoundingClientRect().left ||
              0;
            const startY =
              bubbleRef.current?.getBoundingClientRect().top ||
              0;
            const distance = Math.sqrt(
              Math.pow(newX - startX, 2) +
                Math.pow(newY - startY, 2),
            );
            if (distance > 5) {
              // 5px tolerance
              setBubbleHasMoved(true);
            }
          }
        },
      );
    };

    const handleMouseUp = () => {
      setIsBubbleDragging(false);

      // Reset hasMoved flag after short delay
      setTimeout(() => {
        setBubbleHasMoved(false);
      }, 100);

      if (bubbleAnimationFrameRef.current) {
        cancelAnimationFrame(bubbleAnimationFrameRef.current);
        bubbleAnimationFrameRef.current = null;
      }
    };

    const handleTouchEnd = () => {
      setIsBubbleDragging(false);

      // Reset hasMoved flag after short delay
      setTimeout(() => {
        setBubbleHasMoved(false);
      }, 100);

      if (bubbleAnimationFrameRef.current) {
        cancelAnimationFrame(bubbleAnimationFrameRef.current);
        bubbleAnimationFrameRef.current = null;
      }
    };

    if (isBubbleDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("touchend", handleTouchEnd);
      return () => {
        document.removeEventListener(
          "mousemove",
          handleMouseMove,
        );
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
        if (bubbleAnimationFrameRef.current) {
          cancelAnimationFrame(bubbleAnimationFrameRef.current);
        }
      };
    }
  }, [isBubbleDragging, bubbleDragOffset, bubbleHasMoved]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");

    // Check if user wants to talk to AURA (must be standalone word, not part of another word like "Laura")
    const auraPatterns = [
      /\baura\b/i, // Word boundary check
      /^aura$/i, // Exact match
      /öffne\s+aura/i,
      /zeig\s+mir\s+aura/i,
      /starte\s+aura/i,
      /mit\s+aura\s+sprechen/i,
      /zu\s+aura\s+wechseln/i,
    ];

    if (
      auraPatterns.some((pattern) => pattern.test(currentInput))
    ) {
      const auraMessage: Message = {
        role: "assistant",
        content:
          "Ich öffne AURA für Sie! AURA ist Ihr READ-ONLY Wissensassistent mit Zugriff auf alle Referenzen und Notizbücher.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, auraMessage]);

      // Trigger AURA to open
      if (onOpenAura) {
        setTimeout(() => onOpenAura(), 500);
      }
      return;
    }

    // Check if user wants Admin access (also use word boundaries)
    const adminPatterns = [
      /\badmin\b/i,
      /administration/i,
      /verwaltung/i,
      /\blogin\b/i,
      /anmelden/i,
      /admin\s+bereich/i,
      /admin\s+panel/i,
    ];

    if (
      adminPatterns.some((pattern) =>
        pattern.test(currentInput),
      )
    ) {
      // Check if admin is already logged in
      if (isAdminActive && onEditorLogin) {
        // Admin is already logged in, go directly to admin area
        const adminToken = localStorage.getItem("admin_token");
        const adminUserStr = localStorage.getItem("admin_user");

        if (adminToken && adminUserStr) {
          try {
            const adminUser = JSON.parse(adminUserStr);
            const successMessage: Message = {
              role: "assistant",
              content: `Willkommen zurück, ${adminUser.name}! Ich öffne den Admin-Bereich für Sie...`,
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, successMessage]);

            setTimeout(() => {
              onEditorLogin(adminToken, adminUser);
            }, 500);

            return;
          } catch (error) {
            console.error("Error parsing admin user:", error);
            // Fall through to show login dialog
          }
        }
      }

      // Not logged in or error - show login dialog
      const editorResponse: Message = {
        role: "assistant",
        content:
          "Ich sehe, Sie möchten auf den Admin-Bereich zugreifen. Dies ist ein geschützter Bereich. Bitte authentifizieren Sie sich.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, editorResponse]);
      setShowAdminDialog(true);

      return;
    }

    setIsLoading(true);

    try {
      // Check if this is a medical signal analysis request
      const isMedicalAnalysis =
        currentInput.toLowerCase().includes("analyse") ||
        currentInput.toLowerCase().includes("hrv") ||
        currentInput.toLowerCase().includes("signal") ||
        currentInput.toLowerCase().includes("ekg") ||
        currentInput.toLowerCase().includes("spo2");

      if (isMedicalAnalysis) {
        // Use LYNA Architecture for medical analysis
        await handleMedicalAnalysis(currentInput);
      } else {
        // Use OpenAI for general admin tasks
        await handleGeneralQuery(currentInput);
      }
    } catch (error) {
      console.error("LYNA error:", error);
      toast.error("Fehler bei der Kommunikation mit LYNA");

      const fallbackMessage: Message = {
        role: "assistant",
        content: generateFallbackResponse(currentInput),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Medical Signal Analysis using LYNA Architecture
  const handleMedicalAnalysis = async (query: string) => {
    const systemMessage: Message = {
      role: "system",
      content:
        "**LYNA Medizinische Analyse gestartet**\n\nFractal Decomposition läuft...\nDeterministische Analyse aktiv...\nAI-Erklärung wird vorbereitet...",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, systemMessage]);

    try {
      // Initialize LYNA System
      const lynaSystem = new LYNASystem();

      // Generate demo HRV data (in production, this would come from real sensors)
      const demoSignal = generateDemoHRVData();
      const timestamps = demoSignal.map((_, i) =>
        new Date(
          Date.now() - (demoSignal.length - i) * 1000,
        ).toISOString(),
      );

      // Run through LYNA Architecture
      // Step 1: Fractal Decomposition (deterministic)
      // Step 2: Rule-based Analysis (no AI decision-making)
      // Step 3: Optional AI Explanation (only for translation, not decisions)
      const result = await lynaSystem.analyze(
        demoSignal,
        timestamps,
        "HRV",
        {
          baseline: {
            mean: 50,
            std: 6,
            established: "2024-12-01T00:00:00Z",
            sampleSize: 100,
          },
          userLevel: "patient",
          includeExplanation: true,
        },
      );

      // Display Analysis Results
      const analysisMessage: Message = {
        role: "assistant",
        content: formatAnalysisResult(
          result.analysisState,
          result.explanation,
        ),
        timestamp: new Date(),
        analysisState: result.analysisState,
        explanation: result.explanation,
      };

      setMessages((prev) => [...prev, analysisMessage]);
    } catch (error) {
      console.error("Medical analysis error:", error);

      const errorMessage: Message = {
        role: "assistant",
        content:
          "**Analyse-Fehler**\n\nDie medizinische Analyse konnte nicht abgeschlossen werden. Bitte stellen Sie sicher, dass:\n\n1. Gültige Signaldaten vorhanden sind\n2. Die LYNA-Architektur korrekt initialisiert ist\n3. Optional: OpenAI API-Key für Erklärungen konfiguriert ist\n\nHinweis: Das System funktioniert auch ohne OpenAI (nur ohne natürlichsprachliche Erklärungen).",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  // General chat query handler - Calls backend OpenAI integration
  const handleGeneralQuery = async (query: string) => {
    try {
      console.log("🤖 LYNA: Calling backend via Supabase client...");
      console.log("📝 Query:", query);
      
      // Use Supabase Functions client instead of direct fetch
      // This often bypasses sandbox restrictions
      const { data, error } = await supabase.functions.invoke('make-server-0f4f038b/chat', {
        body: {
          message: query,
          context: currentUser
            ? currentUser.role === "patient"
              ? "lyna_patient"
              : currentUser.role === "doctor"
                ? "lyna_doctor"
                : "lyna_public"
            : "lyna_public",
          userId: currentUser?.id,
          userType: currentUser?.role || "guest",
          conversationHistory: messages
            .slice(-5)
            .map((msg) => ({
              role: msg.role === "system" ? "assistant" : msg.role,
              content: msg.content,
            })),
        },
      });

      if (error) {
        console.error("❌ Supabase Functions error:", error);
        throw new Error(error.message || "Supabase Functions call failed");
      }

      console.log("✅ Backend response:", data);

      if (data && data.success && data.message) {
        const assistantMessage: Message = {
          role: "assistant",
          content: data.message,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(data?.error || "Invalid response from backend");
      }
    } catch (error) {
      console.error("❌ LYNA Error:", error);
      toast.error("Fehler bei der Kommunikation mit dem Backend");

      const errorMessage: Message = {
        role: "assistant",
        content: `Es tut mir leid, ich konnte keine Verbindung zum Backend herstellen.\n\n**Fehler:** ${error instanceof Error ? error.message : String(error)}\n\nBitte überprüfen Sie:\n• Backend-URL korrekt\n• OpenAI API Key gesetzt\n• Supabase Edge Function deployed`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  // Format analysis results for display
  const formatAnalysisResult = (
    state: AnalysisState,
    explanation?: AIExplanation,
  ): string => {
    let result = "**LYNA Analyse-Ergebnis**\n\n";

    // Analysis State (Deterministic)
    result += "**Deterministische Analyse:**\n";
    result += `- State ID: ${state.stateId.substring(0, 12)}...\n`;
    result += `- Version: ${state.analysisVersion}\n`;
    result += `- Severity: ${["Normal", "Leicht", "Mittel", "Hoch"][state.overallSeverity]} (${state.overallSeverity}/3)\n`;
    result += `- Confidence: ${(state.overallConfidence * 100).toFixed(1)}%\n\n`;

    // Flags
    if (state.flags && state.flags.length > 0) {
      result += "**Erkannte Muster:**\n";
      state.flags.forEach((flag, i) => {
        result += `${i + 1}. ${flag.flagType} (Severity: ${flag.severity})\n`;
        result += `   - Regel: ${flag.triggeredBy.rule} v${flag.triggeredBy.ruleVersion}\n`;
        result += `   - Schwellwert: ${flag.triggeredBy.threshold}\n`;
        result += `   - Gemessen: ${flag.triggeredBy.actualValue.toFixed(2)}\n`;
      });
      result += "\n";
    }

    // AI Explanation (Optional)
    if (explanation) {
      result +=
        "**AI-Erklärung (nur Übersetzung, keine Entscheidung):**\n";
      result += explanation.summary + "\n\n";

      if (
        explanation.findings &&
        explanation.findings.length > 0
      ) {
        result += "**Details:**\n";
        explanation.findings.forEach((finding, i) => {
          result += `${i + 1}. ${finding}\n`;
        });
        result += "\n";
      }

      if (
        explanation.recommendations &&
        explanation.recommendations.length > 0
      ) {
        result += "**Empfehlungen (allgemeine Wellness):**\n";
        explanation.recommendations.forEach((rec, i) => {
          result += `${i + 1}. ${rec}\n`;
        });
      }
    } else {
      result +=
        "**Hinweis:** Für natürlichsprachliche Erklärungen konfigurieren Sie einen OpenAI API-Key.\n";
      result +=
        "Die Analyse ist auch ohne AI-Erklärung vollständig und deterministisch.\n";
    }

    result +=
      "\n**Wichtig:** OpenAI ist NICHT Teil der Analyse-Logik, sondern nur für Erklärungen. Alle Entscheidungen sind regelbasiert und reproduzierbar.";

    return result;
  };

  // Generate demo HRV data for testing
  const generateDemoHRVData = (): number[] => {
    // Simulate 5 minutes of HRV data (1 sample per second)
    const samples = 300;
    const data: number[] = [];

    // Baseline: 50ms with some stress pattern
    for (let i = 0; i < samples; i++) {
      const baseline = 50;
      const noise = (Math.random() - 0.5) * 10;

      // Simulate stress drop around sample 150
      const stressFactor = i > 150 && i < 250 ? -15 : 0;

      data.push(baseline + noise + stressFactor);
    }

    return data;
  };

  const generateFallbackResponse = (query: string): string => {
    const q = query.toLowerCase();

    if (q.includes("notiz") || q.includes("note")) {
      return 'Ich kann für Sie eine Notiz erstellen! Welchen Inhalt soll die Notiz haben? Sie können mir sagen:\\n\\n- "Erstelle eine Notiz: [Inhalt]"\\n- "Neue Sticky-Note: [Text]"\\n- "Board-Karte für [Thema]"\\n\\nDie Notiz wird automatisch zu Ihrem Board hinzugefügt.';
    }

    if (q.includes("projekt")) {
      return "**Ihre Projekte:**\\n\\n1. **FRAKTAL Medical**\\n   - Status: Aktiv\\n   - Nutzer: 127 aktiv\\n   - Performance: Optimal\\n\\n2. **Studio Demont**\\n   - Status: Aktiv\\n   - Nutzer: 89 aktiv\\n   - Performance: Sehr gut\\n\\n3. **Portfolio**\\n   - Status: Wartung\\n   - Nutzer: 45 aktiv\\n   - Performance: Gut\\n\\nWie kann ich Ihnen weiterhelfen?";
    }

    if (q.includes("datenbank") || q.includes("db")) {
      return "**Datenbank-Status:**\\n\\nAlle Systeme online\\n- Supabase: Verbunden\\n- Latenz: ~45ms (optimal)\\n- Speicher: 1.2 GB / 8 GB\\n- Verbindungen: 12/100 aktiv\\n\\nKeine Probleme erkannt. Möchten Sie eine spezifische Abfrage durchführen?";
    }

    if (q.includes("api")) {
      return "**API-Status:**\\n\\nAlle Keys aktiv\\n- Production Key: Gültig bis 31.12.2025\\n- Development Key: Gültig bis 30.06.2025\\n- Test Key: Gültig bis 15.03.2025\\n\\n**Heutige Nutzung:**\\n- FRAKTAL: 1.543 Requests\\n- Studio Demont: 892 Requests\\n- Portfolio: 234 Requests";
    }

    if (
      q.includes("hilfe") ||
      q.includes("help") ||
      q.includes("was kannst du")
    ) {
      return "**Ich kann Ihnen helfen mit:**\\n\\n**Admin-Funktionen:**\\n- Projekt-Übersichten & Analysen\\n- Datenbank-Operationen\\n- API-Key-Management\\n- Performance-Monitoring\\n\\n**Notizen & Organisation:**\\n- Board-Notizen erstellen\\n- AURA-Notizbücher durchsuchen\\n- Wissens-Graphen analysieren\\n\\n**Analysen:**\\n- System-Status prüfen\\n- Fehler-Diagnosen\\n- Optimierungsvorschläge\\n\\nStellen Sie mir einfach Ihre Frage!";
    }

    return `Verstanden! Zu "${query}" kann ich Ihnen helfen.\\n\\n**Meine Fähigkeiten:**\\n- Projekt-Management (FRAKTAL, Studio Demont, Portfolio)\\n- Datenbank-Operationen & SQL-Abfragen\\n- API-Key-Verwaltung\\n- Notizen & Board-Management\\n- Performance-Analysen\\n- System-Monitoring\\n\\nStellen Sie mir eine spezifischere Frage oder fordern Sie eine Aktion an!`;
  };

  // Clear chat history
  const handleClearChat = () => {
    const welcomeMessage = currentUser
      ? `Hallo ${currentUser.name}! Ich bin LYNA – Ihre persönliche medizinische Assistentin. Ich kann Ihnen bei allen Fragen helfen, Ihre Vitaldaten analysieren und Sie unterstützen. Wie kann ich Ihnen heute helfen?`
      : "Hallo! Ich bin LYNA – Ihre medizinische KI-Assistentin. Ich kann Ihnen Fragen zum FRAKTAL vitalLink System beantworten und Sie bei der Nutzung unterstützen. Wie kann ich Ihnen helfen?";

    setMessages([
      {
        role: "assistant",
        content: welcomeMessage,
        timestamp: new Date(),
      },
    ]);

    if (currentUser) {
      const messagesKey = `lyna_chat_messages_${currentUser.id}`;
      localStorage.removeItem(messagesKey);
    } else {
      localStorage.removeItem("lyna_chat_messages_public");
    }

    toast.success("Chat-Verlauf gelöscht");
  };

  if (!isOpen) {
    return (
      <>
        <button
          ref={bubbleRef}
          onMouseDown={handleBubbleMouseDown}
          onTouchStart={handleBubbleTouchStart}
          onClick={(e) => {
            // Only open if bubble was not moved (pure click)
            if (!bubbleHasMoved) {
              // If admin is logged in, go directly to admin area
              if (isAdminActive && onEditorLogin) {
                const adminSessionStr = localStorage.getItem(
                  "fraktal_admin_session",
                );
                const adminToken = localStorage.getItem("admin_token");
                const adminUser = localStorage.getItem("admin_user");

                if (adminSessionStr && adminToken && adminUser) {
                  try {
                    const user = JSON.parse(adminUser);
                    onEditorLogin(adminToken, user);
                  } catch (error) {
                    console.error("Error parsing admin user:", error);
                    openChat();
                  }
                } else {
                  openChat();
                }
              } else {
                openChat();
              }
            }
            // Reset movement flag for next interaction
            setBubbleHasMoved(false);
          }}
          className="fixed w-16 h-16 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center group hover:scale-110 z-50"
          style={{
            left: bubblePosition
              ? `${bubblePosition.x}px`
              : undefined,
            top: bubblePosition
              ? `${bubblePosition.y}px`
              : undefined,
            right: bubblePosition ? undefined : "1.5rem",
            bottom: bubblePosition ? undefined : "1.5rem",
            cursor: isBubbleDragging ? "grabbing" : "grab",
            background:
              "linear-gradient(135deg, rgb(250, 204, 21) 0%, rgb(234, 179, 8) 50%, rgb(249, 115, 22) 100%)",
            transform: isBubbleDragging
              ? "scale(0.95)"
              : "scale(1)",
            transition: isBubbleDragging
              ? "none"
              : "transform 0.2s ease",
          }}
          title={
            isAdminActive
              ? "LYNA - Admin-Bereich öffnen (eingeloggt)"
              : "LYNA - Ihr Admin-Assistent. Ziehen um zu verschieben, klicken zum Öffnen"
          }
        >
          <MessageCircle className="w-7 h-7 text-white group-hover:rotate-12 transition-transform" />
          {/* Pulse animation - only when logged in as admin */}
          {isAdminActive && (
            <div className="absolute inset-0 rounded-full bg-yellow-400 animate-ping opacity-20"></div>
          )}
        </button>

        {/* Intro Bubble - appears after 3-5 seconds on first visit */}
        {showIntroBubble && (
          <div
            className="fixed z-40 bg-white rounded-2xl shadow-2xl border-2 border-yellow-400 px-6 py-4 max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{
              right: bubblePosition ? undefined : "6rem",
              bottom: bubblePosition ? undefined : "1.5rem",
              left: bubblePosition
                ? `${bubblePosition.x + 80}px`
                : undefined,
              top: bubblePosition
                ? `${bubblePosition.y}px`
                : undefined,
            }}
          >
            <div className="flex items-start gap-3 opacity-50">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-gray-900 mb-1">
                  Hallo! Ich bin LYNA
                </h4>
                <p className="text-sm text-gray-600">
                  Ihr intelligenter Admin-Assistent. Klicken Sie
                  auf mich, um zu starten!
                </p>
              </div>
            </div>
            {/* Small arrow pointing to bubble */}
            <div
              className="absolute w-3 h-3 bg-white border-r-2 border-t-2 border-yellow-400 transform rotate-45"
              style={{
                right: bubblePosition ? undefined : "-6px",
                bottom: bubblePosition ? undefined : "1.5rem",
                left: bubblePosition ? "-6px" : undefined,
                top: bubblePosition ? "1.5rem" : undefined,
              }}
            />
          </div>
        )}

        {/* Admin Login Dialog - also render when LYNA is closed! */}
        {showAdminDialog && (
          <AdminLoginDialog
            isOpen={showAdminDialog}
            onClose={() => setShowAdminDialog(false)}
            onLoginSuccess={(token, user) => {
              setShowAdminDialog(false);

              // Update admin status immediately
              setIsAdminActive(true);

              if (onEditorLogin) {
                onEditorLogin(token, user);
              }
            }}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div
        ref={chatRef}
        onClick={onClick}
        className={`fixed bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col w-96 h-[600px] ${
          isAnimating
            ? "duration-300 ease-out"
            : isDragging
              ? ""
              : "duration-200"
        }`}
        style={{
          left: position ? `${position.x}px` : undefined,
          top: position ? `${position.y}px` : undefined,
          right: position ? undefined : "1.5rem",
          bottom: position ? undefined : "1.5rem",
          cursor: isDragging ? "grabbing" : "default",
          transform: isDragging
            ? `translate3d(${dragTranslate.x}px, ${dragTranslate.y}px, 0)`
            : isAnimating
              ? "scale(0.9)"
              : "scale(1)",
          opacity: isAnimating ? 0.8 : 1,
          willChange: isDragging ? "transform" : "auto",
          transition: isDragging ? "none" : undefined,
          zIndex: zIndex,
        }}
      >
        {/* Header */}
        <div
          className="bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 p-4 rounded-t-2xl flex items-center justify-between cursor-move"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <MessageCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-white">LYNA</h3>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleClearChat}
              className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-lg transition-colors"
              title="Chat-Verlauf löschen"
            >
              <Trash2 className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={() => closeChat()}
              className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                  message.role === "user"
                    ? "bg-amber-50 text-gray-900 border border-amber-200"
                    : "bg-white border border-gray-200 text-gray-900 shadow-sm"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex items-center gap-1.5 mb-1.5 pb-1.5 border-b border-gray-200">
                    <MessageCircle className="w-3.5 h-3.5 text-gray-600" />
                    <span className="text-xs text-gray-600">
                      LYNA
                    </span>
                  </div>
                )}
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content}
                </p>
                <p
                  className={`text-[11px] mt-1.5 ${message.role === "user" ? "text-gray-500" : "text-gray-500"}`}
                >
                  {message.timestamp.toLocaleTimeString(
                    "de-DE",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-yellow-200 rounded-2xl px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-yellow-600 animate-pulse" />
                  <span className="text-gray-600 text-sm">
                    LYNA denkt nach...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-gray-200 rounded-b-2xl">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && handleSend()
              }
              placeholder="Fragen Sie LYNA..."
              className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-sm"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="px-4 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}