/**
 * AURA Types
 */

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface VibeUser {
  id: string;
  email?: string;
  user_metadata?: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    userId?: string;
  };
}
