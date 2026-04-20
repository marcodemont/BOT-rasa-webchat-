import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'joi';
  timestamp: Date;
}

interface JOIProps {
  onClose?: () => void;
  isExternallyControlled?: boolean;
  externalIsOpen?: boolean;
}

export function JOI({ onClose, isExternallyControlled = false, externalIsOpen = false }: JOIProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false); // Start closed - will open via bubble click
  const isOpen = isExternallyControlled ? externalIsOpen : internalIsOpen;
  const setIsOpen = isExternallyControlled ? () => {} : setInternalIsOpen;
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'JOI ONLINE - Creative AI Assistant\n\nI am your creative companion, ready to help you:\n\nGenerate creative ideas\nBrainstorm solutions\nExplore possibilities\nThink outside the box\n\nWhat would you like to create today?',
      sender: 'joi',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Drag & Drop state
  const [position, setPosition] = useState({ x: window.innerWidth - 200, y: window.innerHeight - 120 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  
  // Chat window drag state
  const [chatPosition, setChatPosition] = useState({ x: window.innerWidth - 500, y: 100 });
  const [isChatDragging, setIsChatDragging] = useState(false);
  const [chatDragOffset, setChatDragOffset] = useState({ x: 0, y: 0 });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Listen for external open events - only when NOT externally controlled
  useEffect(() => {
    if (isExternallyControlled) return; // Skip if externally controlled
    
    const handleOpenJoi = () => {
      setInternalIsOpen(true);
    };

    window.addEventListener('openJoiChat', handleOpenJoi);
    return () => {
      window.removeEventListener('openJoiChat', handleOpenJoi);
    };
  }, [isExternallyControlled]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    try {
      // Call backend JOI endpoint
      const conversationHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      // Add the current user message to the conversation
      const allMessages = [
        ...conversationHistory,
        { role: 'user', content: currentInput }
      ];

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4c8e6f90/ai/joi`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            messages: allMessages,
            temperature: 0.9
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Backend request failed');
      }

      const data = await response.json();
      const joiResponse = data.message || 'Sorry, I could not generate a response.';

      const joiMessage: Message = {
        id: Date.now().toString() + '-joi',
        content: joiResponse,
        sender: 'joi',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, joiMessage]);
    } catch (error) {
      console.error('JOI chat error:', error);
      
      const joiMessage: Message = {
        id: Date.now().toString() + '-joi',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try again.`,
        sender: 'joi',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, joiMessage]);
      toast.error('Error communicating with JOI backend');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Drag & Drop functions
  const handleMouseDown = (e: React.MouseEvent) => {
    const currentRef = buttonRef.current;
    if (currentRef) {
      const rect = currentRef.getBoundingClientRect();
      setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      setIsDragging(true);
      e.preventDefault();
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({ 
          x: Math.max(0, Math.min(e.clientX - dragOffset.x, window.innerWidth - 64)), 
          y: Math.max(0, Math.min(e.clientY - dragOffset.y, window.innerHeight - 64))
        });
        setHasMoved(true);
      }
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
  }, [isDragging, dragOffset]);

  // Chat window drag functions
  const handleChatMouseDown = (e: React.MouseEvent) => {
    const currentRef = chatWindowRef.current;
    if (currentRef) {
      const rect = currentRef.getBoundingClientRect();
      setChatDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      setIsChatDragging(true);
      e.preventDefault();
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isChatDragging) {
        setChatPosition({ 
          x: Math.max(0, Math.min(e.clientX - chatDragOffset.x, window.innerWidth - 384)), 
          y: Math.max(0, Math.min(e.clientY - chatDragOffset.y, window.innerHeight - 600))
        });
      }
    };

    const handleMouseUp = () => {
      setIsChatDragging(false);
    };

    if (isChatDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isChatDragging, chatDragOffset]);

  // Click outside to close chat window
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && chatWindowRef.current && !chatWindowRef.current.contains(event.target as Node)) {
        if (isExternallyControlled) {
          if (onClose) onClose();
        } else {
          setIsOpen(false);
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isExternallyControlled, onClose]);

  // Calculate chat window position based on button position
  const getChatWindowPosition = () => {
    const chatWidth = 384; // w-96 = 24rem = 384px
    const chatHeight = 600;
    const margin = 16; // spacing from button

    let chatX = position.x;
    let chatY = position.y;

    // Position chat to the left of button if there's space, otherwise to the right
    if (position.x > chatWidth + margin) {
      chatX = position.x - chatWidth - margin;
    } else {
      chatX = position.x + 64 + margin; // 64 = button width
    }

    // Position chat above the button, aligned at the top
    chatY = position.y - chatHeight + 64; // Align bottom of chat with bottom of button

    // Keep chat window within viewport
    chatX = Math.max(margin, Math.min(chatX, window.innerWidth - chatWidth - margin));
    chatY = Math.max(margin, Math.min(chatY, window.innerHeight - chatHeight - margin));

    return { x: chatX, y: chatY };
  };

  const chatPos = getChatWindowPosition();

  return (
    <>
      {/* Floating Chat Button - GREEN - Only visible when chat is closed and NOT externally controlled */}
      {!isOpen && !isExternallyControlled && (
        <button
          ref={buttonRef}
          onMouseDown={handleMouseDown}
          onClick={(e) => {
            // Only open chat if we didn't drag
            if (!hasMoved) {
              setInternalIsOpen(true);
            }
            // Reset hasMoved for next interaction
            setHasMoved(false);
          }}
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
          className="fixed w-16 h-16 bg-gradient-to-br from-green-400 via-green-500 to-emerald-600 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform duration-200 z-50 group"
          aria-label="JOI Chat"
        >
          <MessageSquare className="w-7 h-7 text-white group-hover:rotate-12 transition-transform" />
        </button>
      )}

      {/* Chat Window - GREEN THEME */}
      {isOpen && (
        <div
          ref={chatWindowRef}
          className="fixed w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 overflow-hidden"
          style={{
            left: `${chatPosition.x}px`,
            top: `${chatPosition.y}px`,
            cursor: isChatDragging ? 'grabbing' : 'default'
          }}
        >
          {/* Header - GREEN - DRAGGABLE */}
          <div 
            className="bg-gradient-to-r from-green-400 via-green-500 to-emerald-600 p-4 flex items-center justify-between cursor-move"
            onMouseDown={handleChatMouseDown}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h3 className="text-white font-semibold">JOI</h3>
              
              </div>
            </div>
            <button
              onClick={() => {
                if (isExternallyControlled) {
                  if (onClose) onClose();
                } else {
                  setInternalIsOpen(false);
                }
              }}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.sender === 'user'
                      ? 'bg-green-100 text-green-900'
                      : 'bg-white border border-green-200 text-gray-800'
                  }`}
                >
                  {message.sender === 'joi' && (
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare className="w-3 h-3 text-green-600" />
                      <span className="text-xs font-semibold text-green-600">JOI</span>
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-green-700' : 'text-gray-400'
                  }`}>
                    {message.timestamp.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-green-200 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-3 h-3 text-green-600 animate-pulse" />
                    <span className="text-xs font-semibold text-green-600">JOI typing...</span>
                  </div>
                  <div className="flex gap-1 mt-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message JOI..."
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}