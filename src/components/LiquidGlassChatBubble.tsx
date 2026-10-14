export default function LiquidGlassChatBubble({
  message,
  isUser,
  className,
}: React.PropsWithChildren<{
  message: string;
  isUser: boolean;
  className?: string;
}>) {
  const sideClass = isUser ? "float-right" : "float-left";
  const marginClass = isUser ? "margin-left: auto; margin-right: 0;" : "margin-left: 0; margin-right: auto;";
  const baseClass = "glass-morphism max-w-[80%] px-4 py-2 rounded-xl";
  const fullClass = baseClass + " " + sideClass + " " + className;

  return (
    <div className={fullClass}>
      <span className="glass-text">{message}</span>
    </div>
  );
}