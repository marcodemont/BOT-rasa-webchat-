/**
 * NOVIZIN - Story Writing Assistant
 * Der ursprüngliche AI-Assistent für ARCHmage
 * 
 * Engine: Venice AI (Llama 3.3 70B)
 * 
 * Spezialisiert auf:
 * - Story-Erstellung mit Auto-Save
 * - Versionierung (3 Tage History)
 * - Text-Expansion & Editing
 * - Kontext-bewusste Hilfe
 */

import { useState, useRef, useEffect } from 'react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-4c8e6f90`;

export interface NovizinMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface NovizinStory {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface NovizinVersion {
  id: string;
  title: string;
  content: string;
  tags: string[];
  versionTimestamp: number;
}

export interface NovizinConfig {
  veniceApiKey?: string;
  autoSaveInterval?: number; // ms
  versionRetention?: number; // days
}

/**
 * useNovizin - Hook für Story-Writing mit Novizin
 */
export function useNovizin(config?: NovizinConfig) {
  const [messages, setMessages] = useState<NovizinMessage[]>([
    {
      id: 0,
      role: 'assistant',
      content: 'Hallo! Ich bin Novizin, deine Story-Assistentin. Ich kann dir helfen mit:\n\nInhalte einfügen\nGeschichten erstellen\nTexte erweitern\n\nSage einfach "erstelle eine Geschichte" und wir legen los!',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Story mode
  const [storyMode, setStoryMode] = useState(false);
  const [currentStory, setCurrentStory] = useState<NovizinStory | null>(null);
  const [versions, setVersions] = useState<NovizinVersion[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save
  useEffect(() => {
    if (storyMode && currentStory) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        saveStory();
      }, config?.autoSaveInterval || 1000);

      return () => {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
      };
    }
  }, [currentStory?.content, currentStory?.title, currentStory?.tags, storyMode]);

  const saveStory = async () => {
    if (!currentStory) return;

    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE}/stories/${currentStory.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          title: currentStory.title,
          content: currentStory.content,
          tags: currentStory.tags,
          createdAt: currentStory.createdAt
        })
      });

      if (response.ok) {
        setLastSaved(new Date());
        await loadVersions(currentStory.id);
      }
    } catch (error) {
      console.error('Novizin: Error saving story:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const loadVersions = async (storyId: string) => {
    try {
      const response = await fetch(`${API_BASE}/stories/${storyId}/versions`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });

      if (response.ok) {
        const data = await response.json();
        setVersions(data.versions || []);
      }
    } catch (error) {
      console.error('Novizin: Error loading versions:', error);
    }
  };

  const restoreVersion = async (timestamp: number) => {
    if (!currentStory) return;

    try {
      const response = await fetch(
        `${API_BASE}/stories/${currentStory.id}/restore/${timestamp}`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCurrentStory(data.story);
        
        addMessage({
          role: 'assistant',
          content: `✅ Version vom ${new Date(timestamp).toLocaleString('de-DE')} wurde wiederhergestellt!`
        });
      }
    } catch (error) {
      console.error('Novizin: Error restoring version:', error);
    }
  };

  const createNewStory = () => {
    const newStory: NovizinStory = {
      id: `story-${Date.now()}`,
      title: 'Neue Geschichte',
      content: '',
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    setCurrentStory(newStory);
    setStoryMode(true);
    setVersions([]);

    addMessage({
      role: 'assistant',
      content: 'Neue Geschichte erstellt! Schreibe einfach los. Ich speichere automatisch alle Sekunden und halte Versionen für 3 Tage.\n\nDu kannst mich auch bitten die Geschichte zu erweitern, z.B. "Erweitere den Anfang" oder "Füge einen spannenden Twist hinzu".'
    });
  };

  const exitStoryMode = () => {
    setStoryMode(false);
    setCurrentStory(null);
    setVersions([]);
  };

  const addMessage = (msg: Omit<NovizinMessage, 'id' | 'timestamp'>) => {
    const message: NovizinMessage = {
      ...msg,
      id: messages.length,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  const sendMessage = async (input: string, veniceApiKey?: string): Promise<string> => {
    const userMessage: NovizinMessage = {
      id: messages.length,
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Check for story creation command
      if (input.toLowerCase().includes('geschichte erstellen') || 
          input.toLowerCase().includes('neue geschichte')) {
        createNewStory();
        return 'Neue Geschichte erstellt!';
      }

      // Story mode - AI edits/expands
      if (storyMode && currentStory) {
        const apiKey = veniceApiKey || config?.veniceApiKey;
        if (!apiKey) {
          throw new Error('Venice API key required');
        }

        const response = await fetch('https://api.venice.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b',
            messages: [
              {
                role: 'system',
                content: 'Du bist Novizin, eine Story-Assistentin. Du hilfst beim Schreiben und Erweitern von Geschichten. Sei kreativ, präzise und narrativ stark.'
              },
              {
                role: 'user',
                content: `Aktuelle Geschichte:\n\nTitel: ${currentStory.title}\n\nInhalt:\n${currentStory.content}\n\n---\n\nAnfrage: ${input}`
              }
            ],
            temperature: 0.8,
            max_tokens: 1500
          })
        });

        if (!response.ok) {
          throw new Error('Venice AI request failed');
        }

        const data = await response.json();
        const assistantContent = data.choices[0]?.message?.content || 'Keine Antwort erhalten.';

        addMessage({
          role: 'assistant',
          content: assistantContent
        });

        return assistantContent;
      } else {
        // Regular chat mode
        addMessage({
          role: 'assistant',
          content: 'Möchtest du eine Geschichte erstellen? Sage "Erstelle eine Geschichte" um zu beginnen!'
        });

        return 'Möchtest du eine Geschichte erstellen?';
      }
    } catch (error) {
      console.error('Novizin: Error sending message:', error);
      const errorMsg = `Fehler: ${error}`;
      
      addMessage({
        role: 'assistant',
        content: errorMsg
      });

      return errorMsg;
    } finally {
      setIsLoading(false);
    }
  };

  const updateStory = (updates: Partial<NovizinStory>) => {
    if (!currentStory) return;
    setCurrentStory({ ...currentStory, ...updates, updatedAt: Date.now() });
  };

  return {
    // State
    messages,
    isLoading,
    storyMode,
    currentStory,
    versions,
    isSaving,
    lastSaved,

    // Actions
    sendMessage,
    createNewStory,
    exitStoryMode,
    updateStory,
    saveStory,
    restoreVersion,
    loadVersions
  };
}

/**
 * Helper: Expand text with Novizin
 */
export async function expandTextWithNovizin(
  text: string,
  direction: string,
  veniceApiKey: string
): Promise<string> {
  try {
    const response = await fetch('https://api.venice.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${veniceApiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b',
        messages: [
          {
            role: 'system',
            content: 'Du bist Novizin, eine Story-Assistentin. Erweitere den Text kreativ und passend.'
          },
          {
            role: 'user',
            content: `Erweitere diesen Text ${direction}:\n\n${text}`
          }
        ],
        temperature: 0.8,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error('Venice AI request failed');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Novizin: Error expanding text:', error);
    throw error;
  }
}

/**
 * Helper: Insert content suggestion
 */
export async function getContentSuggestion(
  context: string,
  requestType: string,
  veniceApiKey: string
): Promise<string> {
  try {
    const response = await fetch('https://api.venice.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${veniceApiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b',
        messages: [
          {
            role: 'system',
            content: 'Du bist Novizin, eine Story-Assistentin. Gib kreative Vorschläge für Story-Inhalte.'
          },
          {
            role: 'user',
            content: `Kontext: ${context}\n\nAnfrage: ${requestType}`
          }
        ],
        temperature: 0.8,
        max_tokens: 800
      })
    });

    if (!response.ok) {
      throw new Error('Venice AI request failed');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Novizin: Error getting suggestion:', error);
    throw error;
  }
}