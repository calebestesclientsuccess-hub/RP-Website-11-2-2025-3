import { useEffect, useState } from 'react';

interface AnimatedGradientMeshProps {
  className?: string;
  intensity?: 'subtle' | 'medium' | 'vibrant';
  speed?: 'slow' | 'medium' | 'fast';
}

export function AnimatedGradientMesh({ 
  className = '', 
  intensity = 'subtle',
  speed = 'slow' 
}: AnimatedGradientMeshProps) {
  const [isLowPerformance, setIsLowPerformance] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Check for low performance devices
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // Check device capabilities
    if (isMobile) {
      setIsLowPerformance(true);
    } else if ('deviceMemory' in navigator && 'hardwareConcurrency' in navigator) {
      const memory = (navigator as any).deviceMemory;
      const cores = navigator.hardwareConcurrency;
      // Consider low performance if < 4GB RAM or < 4 cores
      setIsLowPerformance(memory < 4 || cores < 4);
    }
  }, []);

  const intensityClass = intensity === 'subtle' ? 'opacity-30' :
                         intensity === 'medium' ? 'opacity-50' :
                         'opacity-70';

  if (!isClient) return null;

  // Static gradient for low performance devices
  if (isLowPerformance) {
    return (
      <div 
        className={`absolute inset-0 overflow-hidden ${className}`}
        aria-hidden="true"
      >
        <div 
          className={`absolute inset-0 ${intensityClass}`}
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

  // Animated gradient for capable devices
  return (
    <div 
      className={`absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {/* Primary animated gradient layer */}
      <div 
        className={`gradient-mesh-layer gradient-mesh-${speed} ${intensityClass}`}
      />
      
      {/* Secondary gradient layer for depth */}
      <div 
        className={`gradient-mesh-layer-secondary gradient-mesh-${speed}-secondary ${intensityClass}`}
      />
      
      {/* Aurora-style overlay */}
      <div 
        className="gradient-mesh-aurora"
      />
    </div>
  );
}