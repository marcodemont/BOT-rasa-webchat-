/**
 * LYNA System Types
 * Type definitions for LYNA AI Chat System
 */

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    model?: string;
    tokens?: number;
    context?: string;
  };
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
  metadata?: {
    tags?: string[];
    category?: string;
  };
}

export interface LYNAConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt?: string;
}

export interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  isLoading: boolean;
  error: string | null;
}
