/**
 * LYNA - Type Definitions
 */

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface LYNARequest {
  prompt: string;
  mode?: 'general' | 'posts' | 'chat' | 'profile' | 'reactions' | 'help';
  context?: {
    tone?: string;
    userInfo?: any;
  };
}

export interface LYNAResponse {
  text: string;
  suggestions?: string[];
  metadata?: {
    model: string;
    tokens: number;
    mode?: string;
    contextUsed: boolean;
  };
}

export interface ChatBotProps {
  currentUser?: any;
  onClose?: () => void;
  zIndex?: number;
}
