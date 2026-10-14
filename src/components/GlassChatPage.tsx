export default function GlassChatPage() {
  return /*#__PURE__*/ (
    <div className="glass-morphism max-w-full max-h-full p-6 flex flex-col items-center gap-4">
      <h2 className="glass-text text-2xl font-bold">Chat IA Liquid Glass</h2>
      <div className="glass-morphism p-6 max-w-lg rounded-2xl flex-1 flex flex-col items-start gap-4 overflow-y-auto">
        {/* Messages area */}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Digite sua mensagem..."
          className="glass-morphism px-4 py-2 rounded-xl flex-1 outline-none"
        />
        <button className="glass-button text-sm">Enviar</button>
      </div>
    </div>
  );
}