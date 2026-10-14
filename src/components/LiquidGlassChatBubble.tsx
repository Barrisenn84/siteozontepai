import React from 'react';

interface LiquidGlassChatBubbleProps {
  message: string;
  isUser: boolean;
  className?: string;
}

export default function LiquidGlassChatBubble({
  message,
  isUser,
  className = '',
}: LiquidGlassChatBubbleProps) {
  const alignmentClass = isUser
    ? 'self-end ml-auto bg-bio-glow/15 border-bio-glow/40 text-white'
    : 'self-start mr-auto bg-ozone-900/70 border-white/15 text-slate-200';

  return (
    <div
      className={`liquid-glass max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${alignmentClass} ${className}`.trim()}
    >
      <span className="glass-text">{message}</span>
    </div>
  );
}