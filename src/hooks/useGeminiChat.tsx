import { useState, useCallback } from 'react';

export interface Message {
  id: string;
  text: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface GeminiConfig {
  apiKey?: string;
  model?: string;
  apiUrl?: string;
}

export function useGeminiChat(config: GeminiConfig = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (userText: string): Promise<string> => {
      if (!userText.trim()) return '';

      const userMessage: Message = {
        id: Date.now().toString(),
        text: userText,
        role: 'user',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      try {
        let aiReply = '';

        // Prioridade 1: Proxy seguro via servidor backend para não expor a chave
        const endpoint = config.apiUrl || '/api/chat-skin';
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userText }),
        });

        if (response.ok) {
          const data = await response.json();
          aiReply = data.reply || data.text || 'Resposta recebida com sucesso.';
        } else {
          // Fallback gracioso amigável
          aiReply =
            'Olá! Sou o assistente especialista em biotecnologia ozonizada da Ozonteck. Em que posso te ajudar hoje na sua rotina de cuidados dérmicos?';
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: aiReply,
          role: 'assistant',
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        return aiReply;
      } catch (err: any) {
        console.warn('[useGeminiChat] Erro na comunicação:', err);
        const fallbackText =
          'Nosso consultor executivo Antonio Gonçalo está disponível no WhatsApp para atendimento imediato e personalizado.';
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            text: fallbackText,
            role: 'assistant',
            timestamp: new Date(),
          },
        ]);
        return fallbackText;
      } finally {
        setIsLoading(false);
      }
    },
    [config.apiUrl]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return { messages, sendMessage, isLoading, error, clearMessages };
}