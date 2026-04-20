/**
 * Shared Types for AI Assistants (LYNA, AURA, JOI)
 */

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    tokenCount?: number;
    model?: string;
    error?: string;
  };
}

export interface AssistantConfig {
  name: string;
  role: string;
  description: string;
  color: {
    primary: string;
    secondary: string;
    gradient: string;
  };
  icon: string;
  systemPrompt: string;
  capabilities: string[];
  limitations: string[];
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  conversationId?: string;
}

export interface AssistantContext {
  userId?: string;
  userName?: string;
  userRole?: 'admin' | 'user' | 'guest';
  sessionData?: any;
  permissions?: string[];
}

export type AssistantType = 'LYNA' | 'AURA' | 'JOI' | 'QuickChat';

export interface AssistantResponse {
  success: boolean;
  message?: string;
  error?: string;
  metadata?: {
    model?: string;
    tokens?: number;
    responseTime?: number;
  };
}

export interface DraggableState {
  position: { x: number; y: number } | null;
  isDragging: boolean;
  dragOffset: { x: number; y: number };
  hasMoved: boolean;
  isAnimating: boolean;
}
