import React from 'react';

interface LiquidGlassCardProps {
  className?: string;
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function LiquidGlassCard({
  className = '',
  children,
  title,
  subtitle,
}: LiquidGlassCardProps) {
  return (
    <div className={`liquid-glass p-6 rounded-2xl ${className}`.trim()}>
      {title && (
        <h3 className="glass-text text-lg font-semibold tracking-tight mb-2">
          {title}
        </h3>
      )}
      {subtitle && (
        <p className="glass-subtext text-xs text-slate-300 font-light mb-4">
          {subtitle}
        </p>
      )}
      {children}
    </div>
  );
}