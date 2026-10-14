/* src/hooks/useGeminiChat.tsx - Hook Google IA com Liquid Glass */
import { GoogleGenAI } from "@google/genai";

export interface Message {
  id: string;
  text: string;
  role: "user" | "assistant";
  timestamp: Date;
}

export interface GeminiConfig {
  apiKey: string;
  model?: string;
}

export function useGeminiChat(config: GeminiConfig) {
  const ai = new GoogleGenAI({ apiKey: config.apiKey });
  const model = config.model || "gemini-1.5-flash";
  const messages: Message[] = [];

  const sendMessage = async (userText: string): Promise<string> => {
    messages.push({ id: Date.now().toString(), text: userText, role: "user", timestamp: new Date() });

    try {
      const response = await ai.models.generateContent({
        model,
        contents: messages.map((m) => `${m.role}: ${m.text}`).join("\n"),
      });

      const aiReply = response.text || "Desculpe, não consegui gerar uma resposta.";
      
      messages.push({ id: Date.now().toString() + 1, text: aiReply, role: "assistant", timestamp: new Date() });
      return aiReply;
    } catch (error) {
      console.error("Erro Gemini:", error);
      return "Erro ao comunicar com a IA.";
    }
  };

  return { messages, sendMessage };
}