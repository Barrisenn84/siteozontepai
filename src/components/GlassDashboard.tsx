import React from 'react';
import LiquidGlassCard from './LiquidGlassCard';
import GlassChatPage from './GlassChatPage';

export default function GlassDashboard() {
  return (
    <div className="w-full min-h-screen py-10 px-4 sm:px-6 md:px-10 flex flex-col items-center gap-8 bg-ozone-950 text-white selection:bg-bio-glow selection:text-ozone-950">
      {/* Header Liquid Glass */}
      <div className="liquid-glass w-full max-w-5xl p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-bio-glow/30 to-ozone-900 border border-bio-glow/50 flex items-center justify-center shadow-lg shadow-bio-glow/20">
            <span className="font-display font-extrabold text-bio-glow text-lg">O₃</span>
          </div>
          <div>
            <h1 className="glass-text text-lg sm:text-xl font-bold tracking-tight">
              Ozonteck Internacional · Painel Executivo
            </h1>
            <p className="glass-subtext text-xs text-bio-glow font-mono uppercase tracking-wider">
              Antonio Gonçalo · Consultor Executivo & Distribuidor
            </p>
          </div>
        </div>

        <a
          href="https://wa.me/5581997240477?text=Ol%C3%A1!%20Desejo%20uma%20Consultoria%20VIP%20com%20o%20Especialista%20Ozonteck."
          target="_blank"
          rel="noopener noreferrer"
          className="glass-button text-xs font-semibold py-2.5 px-5 bg-bio-glow text-ozone-950 hover:bg-white transition-all shadow-md shadow-bio-glow/30"
        >
          Atendimento VIP WhatsApp
        </a>
      </div>

      {/* Grid de Métricas Liquid Glass */}
      <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-3 gap-5">
        <LiquidGlassCard
          title="+60.000m² Complexo"
          subtitle="Fábrica própria e laboratórios de alta pureza"
        >
          <div className="text-2xl font-display font-bold text-bio-glow">
            100% Ozonizado
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard
          title="+300 Centros (CDs)"
          subtitle="Distribuição ágil e pronta entrega nacional"
        >
          <div className="text-2xl font-display font-bold text-white">
            Logística VIP
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard
          title="Alta Perfumaria"
          subtitle="Até 16h de fixação parfum com prestígio"
        >
          <div className="text-2xl font-display font-bold text-gold-royal">
            Linha Presidente
          </div>
        </LiquidGlassCard>
      </div>

      {/* Chat Interativo Liquid Glass */}
      <div className="w-full max-w-5xl">
        <GlassChatPage />
      </div>
    </div>
  );
}