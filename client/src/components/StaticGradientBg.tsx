/**
 * StaticGradientBg: Simple static gradient background
 * Replaces complex animated gradient mesh for better performance
 */
export function StaticGradientBg({ className = "" }: { className?: string }) {
  return (
    <div 
      className={`absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <div 
        className="absolute inset-0 opacity-60"
        style={{
          background: `
            radial-gradient(
              ellipse at 30% 30%,
              hsl(var(--primary) / 0.15),
              transparent 50%
            ),
            radial-gradient(
              ellipse at 70% 70%,
              hsl(var(--community) / 0.15),
              transparent 50%
            )
          `,
        }}
      />
    </div>
  );
}