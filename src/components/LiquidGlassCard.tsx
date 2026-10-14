export default function LiquidGlassCard({
  className,
  children,
  title,
  subtitle,
}: React.PropsWithChildren<{
  className?: string;
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
}>) {
  const baseClass = "glass-morphism p-6 rounded-2xl";
  const fullClass = baseClass + " " + className;

  return (
    <div className={fullClass}>
      {title && (
        <div className="glass-text text-lg font-medium mb-3">
          {title}
        </div>
      )}
      {subtitle && (
        <div className="glass-subtext text-sm mb-4">
          {subtitle}
        </div>
      )}
      {children}
    </div>
  );
}