import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface NovizinChatProps {
  onClose?: () => void;
}

export function NovizinChat({ onClose }: NovizinChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Guten Tag. Ich bin Novizin, deine Assistentin für Recherche und Wissensverwaltung. Wie kann ich behilflich sein?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // TODO: Implement Novizin AI integration
      const response = await fetch('/api/novizin/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, history: messages })
      });

      if (!response.ok) throw new Error('Novizin response failed');

      const data = await response.json();
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error communicating with Novizin:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Entschuldigung, ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#FAF8F3]">
      {/* Header */}
      <div className="border-b border-[#8B3A3A]/20 p-4">
        <h3 className="text-lg font-semibold text-[#8B3A3A]">Novizin - Recherche Assistentin</h3>
        <p className="text-sm text-[#8B3A3A]/60">Wissensverwaltung & Bibliothek</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-[#8B3A3A] text-white'
                  : 'bg-white border border-[#8B3A3A]/20 text-[#8B3A3A]'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <span className="text-xs opacity-60 mt-1 block">
                {message.timestamp.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-[#8B3A3A]/20 rounded-lg p-3">
              <Loader2 className="w-4 h-4 text-[#8B3A3A] animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[#8B3A3A]/20 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Stelle Novizin eine Frage..."
            className="flex-1 px-4 py-2 border border-[#8B3A3A]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B3A3A]/30 bg-white text-[#8B3A3A]"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-[#8B3A3A] text-white rounded-lg hover:bg-[#8B3A3A]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
