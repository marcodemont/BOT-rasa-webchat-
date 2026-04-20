/**
 * Shared Chat Hook for AI Assistants
 * Reusable chat logic with state management
 */

import { useState, useCallback } from 'react';
import { Message, AssistantType } from './types';
import { assistantAPI } from './api-client';
import { getAssistantConfig } from './configs';

interface UseChatOptions {
  assistantType: AssistantType;
  initialMessage?: string;
  systemContext?: string;
  onError?: (error: string) => void;
}

export function useChat({ assistantType, initialMessage, systemContext, onError }: UseChatOptions) {
  const config = getAssistantConfig(assistantType);
  
  const [messages, setMessages] = useState<Message[]>(() => {
    const welcome = initialMessage || `Hallo! Ich bin ${config.name}, ${config.description}. Wie kann ich dir helfen?`;
    return [{
      role: 'assistant' as const,
      content: welcome,
      timestamp: new Date()
    }];
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await assistantAPI.sendMessage({
        message: text,
        conversationHistory,
        systemContext: systemContext || config.systemPrompt,
        assistantType
      });

      if (response.success && response.message) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: response.message,
          timestamp: new Date(),
          metadata: response.metadata
        };
        setMessages(prev => [...prev, assistantMessage]);

        // Log interaction
        await assistantAPI.logInteraction({
          assistantType,
          question: text,
          answer: response.message,
          metadata: response.metadata
        });
      } else {
        throw new Error(response.error || 'Unbekannter Fehler');
      }
    } catch (err) {
      const errorText = err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten';
      setError(errorText);
      
      const errorMessage: Message = {
        role: 'assistant',
        content: errorText,
        timestamp: new Date(),
        metadata: { error: errorText }
      };
      setMessages(prev => [...prev, errorMessage]);
      
      if (onError) {
        onError(errorText);
      }
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, assistantType, systemContext, config, onError]);

  const clearMessages = useCallback(() => {
    const welcome = initialMessage || `Hallo! Ich bin ${config.name}, ${config.description}. Wie kann ich dir helfen?`;
    setMessages([{
      role: 'assistant',
      content: welcome,
      timestamp: new Date()
    }]);
    setError(null);
  }, [config, initialMessage]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    config
  };
}
