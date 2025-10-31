import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface CinematicTextTransformProps {
  onComplete?: () => void;
}

export default function CinematicTextTransform({ onComplete }: CinematicTextTransformProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const oldTextRef = useRef<HTMLDivElement>(null);
  const newTextRef = useRef<HTMLDivElement>(null);
  const pulseRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    size: number;
    brightness: number;
  }>>([]);

  useEffect(() => {
    const container = containerRef.current;
    const oldText = oldTextRef.current;
    const newText = newTextRef.current;
    const pulse = pulseRef.current;
    const canvas = canvasRef.current;
    
    if (!container || !oldText || !newText || !pulse || !canvas) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      gsap.set(oldText, { opacity: 0 });
      gsap.set(newText, { opacity: 1 });
      if (onComplete) onComplete();
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match container
    const updateCanvasSize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Custom premium easing curves
    const cinematicEase = "cubic-bezier(0.4, 0.0, 0.2, 1)"; // Material Design deceleration
    const softEase = "cubic-bezier(0.25, 0.46, 0.45, 0.94)"; // Soft ease out

    // Main animation timeline (2.2 seconds total)
    const tl = gsap.timeline({
      onComplete: () => {
        if (onComplete) onComplete();
      }
    });

    // PHASE 1: Dissolution (0.9s)
    // Old text elegantly fades with subtle particle shimmer
    tl.to(oldText, {
      opacity: 0,
      duration: 0.9,
      ease: cinematicEase,
      onUpdate: function() {
        const progress = this.progress();
        
        // Generate subtle shimmer particles during dissolution
        if (progress > 0.2 && progress < 0.8 && Math.random() > 0.85) {
          const rect = oldText.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          
          particlesRef.current.push({
            x: (rect.left - containerRect.left) + rect.width * Math.random(),
            y: (rect.top - containerRect.top) + rect.height * Math.random(),
            vx: (Math.random() - 0.5) * 0.5,
            vy: -Math.random() * 0.8 - 0.3,
            life: 1,
            size: Math.random() * 2 + 0.5,
            brightness: Math.random() * 30 + 50
          });
        }
      }
    })
    
    // PHASE 2: The Beat (0.3s)
    // Brief pause with subtle pulse to hold attention
    .to(pulse, {
      scale: 1.05,
      opacity: 0.3,
      duration: 0.15,
      ease: "power2.out"
    }, "+=0.05")
    .to(pulse, {
      scale: 1,
      opacity: 0,
      duration: 0.15,
      ease: "power2.in"
    })
    
    // PHASE 3: The Reveal (0.8s)
    // New message fades in with authority
    .fromTo(newText, {
      opacity: 0,
      y: 10
    }, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: softEase
    }, "-=0.1");

    // Particle animation loop
    let animationFrameId: number;
    const animateParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const particles = particlesRef.current;
      const updated = particles
        .map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          vy: particle.vy + 0.01, // subtle gravity
          life: particle.life - 0.008
        }))
        .filter(p => p.life > 0);
      
      particlesRef.current = updated;
      
      // Draw particles with subtle shimmer effect
      updated.forEach(particle => {
        ctx.save();
        ctx.globalAlpha = particle.life * 0.6; // More subtle opacity
        
        // Soft glow
        ctx.shadowBlur = 8;
        ctx.shadowColor = `hsla(0, 0%, ${particle.brightness}%, ${particle.life * 0.4})`;
        
        // Draw particle
        ctx.fillStyle = `hsl(0, 0%, ${particle.brightness}%)`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      });
      
      animationFrameId = requestAnimationFrame(animateParticles);
    };
    
    animationFrameId = requestAnimationFrame(animateParticles);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      cancelAnimationFrame(animationFrameId);
      tl.kill();
    };
  }, [onComplete]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full max-w-5xl mx-auto py-12"
      data-testid="cinematic-text-transform"
    >
      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 10 }}
      />
      
      {/* Old text that dissolves */}
      <div
        ref={oldTextRef}
        className="relative text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-center text-foreground leading-tight"
        data-testid="old-text"
      >
        You need more than another salesperson
      </div>
      
      {/* Subtle pulse during "the beat" */}
      <div
        ref={pulseRef}
        className="absolute inset-0 rounded-full opacity-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          filter: 'blur(40px)'
        }}
      />
      
      {/* New text that reveals */}
      <div
        ref={newTextRef}
        className="absolute inset-0 flex items-center justify-center opacity-0"
        data-testid="new-text"
      >
        <div className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-center leading-tight">
          <span className="text-foreground">You need a </span>
          <span className="text-primary font-extrabold">system</span>
        </div>
      </div>
    </div>
  );
}
