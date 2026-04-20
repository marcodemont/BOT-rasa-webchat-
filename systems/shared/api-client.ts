/**
 * Shared API Client for AI Assistants
 */

import { projectId, publicAnonKey } from '../../../utils/api-config.tsx';
import { Message, AssistantResponse, AssistantType } from './types';

interface SendMessageOptions {
  message: string;
  conversationHistory: Array<{ role: string; content: string }>;
  systemContext?: string;
  assistantType: AssistantType;
  apiKey?: string;
}

export class AssistantAPIClient {
  private baseUrl: string;
  
  constructor() {
    this.baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-JALf1403`;
  }

  /**
   * Send a message to an AI assistant
   */
  async sendMessage(options: SendMessageOptions): Promise<AssistantResponse> {
    const { message, conversationHistory, systemContext, assistantType, apiKey } = options;

    try {
      console.log(`${assistantType}: Sending message to server...`);
      
      const endpoint = this.getEndpointForAssistant(assistantType);
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
          ...(apiKey && { 'X-API-Key': apiKey })
        },
        body: JSON.stringify({
          message,
          conversationHistory,
          systemContext,
          assistantType
        })
      });

      console.log(`${assistantType}: Response received, status: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error(`${assistantType}: Server error:`, errorData);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`${assistantType}: Response data:`, data);

      if (data.success && data.message) {
        console.log(`${assistantType}: Message received successfully`);
        return {
          success: true,
          message: data.message,
          metadata: {
            model: data.model,
            tokens: data.tokens,
            responseTime: data.responseTime
          }
        };
      } else {
        console.error(`${assistantType}: No message in response`);
        throw new Error(data.error || 'Unbekannter Fehler');
      }
    } catch (error) {
      return this.handleError(error, assistantType);
    }
  }

  /**
   * Get the API endpoint for a specific assistant
   */
  private getEndpointForAssistant(assistantType: AssistantType): string {
    const endpoints: Record<AssistantType, string> = {
      LYNA: '/chat',
      AURA: '/aura/chat',
      JOI: '/joi/chat',
      QuickChat: '/quickchat'
    };
    
    return endpoints[assistantType] || '/chat';
  }

  /**
   * Handle API errors with proper error messages
   */
  private handleError(error: unknown, assistantType: AssistantType): AssistantResponse {
    let errorText = `Entschuldigung, es gab einen Fehler beim Verbinden mit ${assistantType}.`;
    
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch')) {
        errorText = 'Verbindungsfehler. Bitte überprüfen Sie Ihre Internetverbindung.';
      } else if (error.message.includes('401')) {
        errorText = 'Authentifizierungsfehler. Bitte laden Sie die Seite neu.';
      } else if (error.message.includes('500')) {
        errorText = 'Server-Fehler. Der OpenAI Service ist möglicherweise nicht verfügbar.';
      } else if (error.message.includes('429')) {
        errorText = 'Zu viele Anfragen. Bitte warten Sie einen Moment.';
      } else {
        errorText = `Fehler: ${error.message}`;
      }
    }
    
    console.error(`${assistantType}: Error:`, error);
    
    return {
      success: false,
      error: errorText + ' Bitte versuchen Sie es später erneut.'
    };
  }

  /**
   * Log assistant interaction (for analytics)
   */
  async logInteraction(params: {
    assistantType: AssistantType;
    userId?: string;
    question: string;
    answer: string;
    metadata?: any;
  }): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/analytics/log-interaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(params)
      });
    } catch (error) {
      console.error('Error logging interaction:', error);
      // Don't throw - logging failures shouldn't break the app
    }
  }
}

// Export singleton instance
export const assistantAPI = new AssistantAPIClient();