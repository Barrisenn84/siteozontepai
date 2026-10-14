import React, { useState } from 'react';
import { useGeminiChat } from '../hooks/useGeminiChat';
import LiquidGlassChatBubble from './LiquidGlassChatBubble';

export default function GlassChatPage() {
  const { messages, sendMessage, isLoading } = useGeminiChat();
  const [inputVal, setInputVal] = useState('');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isLoading) return;
    const text = inputVal;
    setInputVal('');
    await sendMessage(text);
  };

  return (
    <div className="liquid-glass w-full max-w-xl mx-auto p-6 flex flex-col gap-5 rounded-3xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="glass-text text-xl font-bold tracking-tight">
            Consultoria IA O3 · Liquid Glass
          </h2>
          <p className="glass-subtext text-xs mt-0.5 text-slate-300">
            Tire suas dúvidas sobre ozonioterapia e produtos Ozonteck
          </p>
        </div>
        <div className="w-3 h-3 rounded-full bg-bio-glow shadow-[0_0_10px_#00E5BE] animate-pulse"></div>
      </div>

      <div className="flex flex-col gap-3 min-h-[320px] max-h-[460px] overflow-y-auto p-2 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="m-auto text-center p-6 text-slate-400 text-sm">
            <span className="text-2xl block mb-2">🌿</span>
            Envie sua dúvida ou descreva sua pele para receber orientações exclusivas.
          </div>
        ) : (
          messages.map((m) => (
            <LiquidGlassChatBubble
              key={m.id}
              message={m.text}
              isUser={m.role === 'user'}
            />
          ))
        )}
        {isLoading && (
          <div className="self-start text-xs text-bio-glow/80 font-mono animate-pulse pl-2">
            Ozonteck IA processando recomendação...
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="flex gap-2.5 pt-2">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Ex: Como usar o óleo ozonizado para rejuvenescimento?"
          className="liquid-glass px-4 py-2.5 rounded-xl flex-1 text-sm text-white placeholder-slate-400 outline-none focus:border-bio-glow/60 transition-colors"
        />
        <button
          type="submit"
          disabled={isLoading || !inputVal.trim()}
          className="glass-button px-5 py-2.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLoading ? '...' : 'Enviar'}
        </button>
      </form>
    </div>
  );
}