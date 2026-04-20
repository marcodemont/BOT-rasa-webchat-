/**
 * LYNA Chat System
 * AI-powered conversational interface integrated into AURUM
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  MessageSquare, 
  Plus, 
  Trash2, 
  Archive,
  ChevronDown,
  Settings,
  Loader2,
  Bot,
  User as UserIcon
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { ScrollArea } from '../../../components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import type { Message, Conversation } from './types';

interface LYNAChatProps {
  userId?: string;
  onClose?: () => void;
}

export function LYNA_Chat({ userId, onClose }: LYNAChatProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConversationId) {
      loadMessages(activeConversationId);
    }
  }, [activeConversationId]);

  const loadConversations = async () => {
    // TODO: Load from backend
    // For now, using mock data
    const mockConversations: Conversation[] = [
      {
        id: '1',
        userId: userId || 'demo',
        title: 'Welcome to LYNA',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isArchived: false,
      }
    ];
    setConversations(mockConversations);
    if (mockConversations.length > 0) {
      setActiveConversationId(mockConversations[0].id);
    }
  };

  const loadMessages = async (conversationId: string) => {
    // TODO: Load from backend
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setMessages(conversation.messages || []);
    }
  };

  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: crypto.randomUUID(),
      userId: userId || 'demo',
      title: 'New Conversation',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isArchived: false,
    };
    
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
    setMessages([]);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !activeConversationId) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    // Add user message
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // TODO: Call LYNA API
      // Simulate AI response
      await new Promise(resolve => setTimeout(resolve, 1000));

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `This is LYNA's response to: "${userMessage.content}"\n\nI'm currently in demo mode. Integration with the LYNA AI backend is pending.`,
        timestamp: new Date().toISOString(),
        metadata: {
          model: 'lyna-v1',
          tokens: 150,
        }
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Update conversation title if first message
      if (messages.length === 0) {
        updateConversationTitle(activeConversationId, inputMessage.trim().substring(0, 50));
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const updateConversationTitle = (conversationId: string, title: string) => {
    setConversations(prev => prev.map(c => 
      c.id === conversationId ? { ...c, title } : c
    ));
  };

  const deleteConversation = (conversationId: string) => {
    if (confirm('Delete this conversation?')) {
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      if (activeConversationId === conversationId) {
        const remaining = conversations.filter(c => c.id !== conversationId);
        setActiveConversationId(remaining.length > 0 ? remaining[0].id : null);
      }
    }
  };

  const archiveConversation = (conversationId: string) => {
    setConversations(prev => prev.map(c => 
      c.id === conversationId ? { ...c, isArchived: true } : c
    ));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  return (
    <div className="flex h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-white">
      {/* Sidebar - Conversations List */}
      {isSidebarOpen && (
        <div className="w-80 border-r border-gray-200 bg-white/50 backdrop-blur-sm flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">LYNA</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden"
              >
                ×
              </Button>
            </div>
            <Button
              onClick={createNewConversation}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Conversation
            </Button>
          </div>

          {/* Conversations List */}
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {conversations.filter(c => !c.isArchived).map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setActiveConversationId(conversation.id)}
                  className={`
                    w-full text-left p-3 rounded-lg transition-all
                    ${activeConversationId === conversation.id
                      ? 'bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-300'
                      : 'hover:bg-gray-100 border border-transparent'
                    }
                  `}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-800 truncate">
                          {conversation.title}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(conversation.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <ChevronDown className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          archiveConversation(conversation.id);
                        }}>
                          <Archive className="w-4 h-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConversation(conversation.id);
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200">
            <Button variant="outline" size="sm" className="w-full">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="border-b border-gray-200 p-4 bg-white/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {!isSidebarOpen && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSidebarOpen(true)}
                >
                  <MessageSquare className="w-4 h-4" />
                </Button>
              )}
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-amber-600" />
                <div>
                  <h1 className="text-lg font-semibold text-gray-800">
                    {activeConversation?.title || 'LYNA Assistant'}
                  </h1>
                  <p className="text-xs text-gray-500">AI-powered by AURUM</p>
                </div>
              </div>
            </div>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                ×
              </Button>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-light text-gray-800 mb-2">
                  Welcome to LYNA
                </h3>
                <p className="text-gray-600">
                  Your AI assistant integrated into AURUM. Ask me anything!
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))
            )}
            {isLoading && (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">LYNA is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4 bg-white/50 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-2">
              <Textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask LYNA anything..."
                className="flex-1 min-h-[50px] max-h-[200px] resize-none"
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                size="lg"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Message Bubble Component
// ============================================================================

interface MessageBubbleProps {
  message: Message;
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`
        w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center
        ${isUser 
          ? 'bg-gradient-to-br from-blue-500 to-indigo-500' 
          : 'bg-gradient-to-br from-amber-500 to-orange-500'
        }
      `}>
        {isUser ? (
          <UserIcon className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 ${isUser ? 'flex justify-end' : ''}`}>
        <div className={`
          max-w-[80%] rounded-2xl p-4
          ${isUser 
            ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white' 
            : 'bg-white border border-gray-200 text-gray-800'
          }
        `}>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {message.content}
          </p>
          
          {/* Metadata */}
          <div className={`
            flex items-center gap-2 mt-2 text-xs
            ${isUser ? 'text-blue-100' : 'text-gray-500'}
          `}>
            <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
            {message.metadata?.tokens && (
              <>
                <span>•</span>
                <span>{message.metadata.tokens} tokens</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
