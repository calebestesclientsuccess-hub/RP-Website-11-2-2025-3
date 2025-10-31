import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface FlipBurnAnimationProps {
  onComplete?: () => void;
}

export default function FlipBurnAnimation({ onComplete }: FlipBurnAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const burnMaskRef = useRef<HTMLDivElement>(null);
  const backCardRef = useRef<HTMLDivElement>(null);
  const cascadeCardsRef = useRef<HTMLDivElement[]>([]);
  const goldenFrameRef = useRef<HTMLDivElement>(null);
  const embersRef = useRef<HTMLCanvasElement>(null);
  const emberParticlesRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    size: number;
  }>>([]);

  useEffect(() => {
    const container = containerRef.current;
    const card = cardRef.current;
    const text = textRef.current;
    const burnMask = burnMaskRef.current;
    const backCard = backCardRef.current;
    const cascadeCards = cascadeCardsRef.current;
    const goldenFrame = goldenFrameRef.current;
    const canvas = embersRef.current;
    
    if (!container || !card || !text || !burnMask || !backCard || !goldenFrame || !canvas) return;

    // Check for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      // Show final state immediately
      gsap.set(text, { opacity: 0 });
      gsap.set(backCard, { opacity: 1 });
      cascadeCards.forEach(card => gsap.set(card, { opacity: 1, y: 0 }));
      if (onComplete) onComplete();
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Animation timeline
    const tl = gsap.timeline({
      onComplete: () => {
        // Form crown with embers
        if (onComplete) onComplete();
      }
    });

    // Phase 1: Burning effect (0.8s)
    tl.to(burnMask, {
      backgroundPosition: '100% 0',
      duration: 0.8,
      ease: "power2.inOut",
      onUpdate: function() {
        const progress = this.progress();
        
        // Generate ember particles during burn
        if (progress > 0.3 && progress < 0.8 && Math.random() > 0.7) {
          const rect = text.getBoundingClientRect();
          const newEmber = {
            x: rect.left + rect.width * progress,
            y: rect.top + rect.height * 0.5,
            vx: (Math.random() - 0.5) * 2,
            vy: -Math.random() * 3 - 1,
            life: 1,
            size: Math.random() * 3 + 1
          };
          emberParticlesRef.current.push(newEmber);
        }
        
        // Start fading text as it burns
        if (progress > 0.5) {
          gsap.set(text, { opacity: 1 - (progress - 0.5) * 2 });
        }
      }
    })
    
    // Phase 2: Card flip (0.5s) - overlaps with burn end
    .to(card, {
      rotateY: 90,
      duration: 0.25,
      ease: "power2.in",
      transformOrigin: "center center",
      onComplete: () => {
        // Hide front, show back
        gsap.set(card, { opacity: 0 });
        gsap.set(backCard, { opacity: 1, rotateY: -90 });
      }
    }, "-=0.2")
    
    .to(backCard, {
      rotateY: 0,
      duration: 0.25,
      ease: "power2.out",
      transformOrigin: "center center"
    })
    
    // Phase 3: Cards cascade out (0.7s)
    .to(cascadeCards, {
      x: (index) => (index - 1.5) * 120,
      y: 0,
      rotation: (index) => (index - 1.5) * 5,
      opacity: 1,
      scale: 1,
      duration: 0.4,
      stagger: 0.08,
      ease: "back.out(1.5)",
      onComplete: () => {
        // Animate cards coming together to form the message
        gsap.to(cascadeCards, {
          x: 0,
          rotation: 0,
          duration: 0.3,
          stagger: 0.05,
          ease: "power2.inOut"
        });
      }
    }, "+=0.1")
    
    // Phase 4: Golden frame emerges from burnt edges (0.5s)
    .fromTo(goldenFrame, {
      scale: 0.8,
      opacity: 0,
      filter: 'blur(10px)'
    }, {
      scale: 1,
      opacity: 1,
      filter: 'blur(0px)',
      duration: 0.5,
      ease: "power2.out",
    }, "-=0.2")
    
    // Add golden glow pulse
    .to(goldenFrame, {
      boxShadow: '0 0 60px rgba(255, 215, 0, 0.8), inset 0 0 30px rgba(255, 215, 0, 0.3)',
      duration: 0.3,
      yoyo: true,
      repeat: 1,
      ease: "power2.inOut"
    });

    // Animate ember particles
    const animateEmbers = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update particles without triggering React re-renders
      const particles = emberParticlesRef.current;
      const updated = particles
        .map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          vy: particle.vy + 0.05, // gravity
          life: particle.life - 0.01
        }))
        .filter(p => p.life > 0);
      
      // Replace the ref's array with the updated one
      emberParticlesRef.current = updated;
      
      // Draw particles
      updated.forEach(particle => {
        ctx.globalAlpha = particle.life;
        ctx.fillStyle = `hsl(${20 + Math.random() * 20}, 100%, ${50 + particle.life * 30}%)`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Add glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(255, 100, 0, 0.5)';
      });
      
      requestAnimationFrame(animateEmbers);
    };
    
    const animationFrame = requestAnimationFrame(animateEmbers);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      cancelAnimationFrame(animationFrame);
      tl.kill();
    };
  }, [onComplete]);

  const words = ['You', 'need', 'a', 'system'];

  return (
    <div 
      ref={containerRef}
      className="relative w-full max-w-4xl mx-auto"
      style={{ perspective: '1000px', minHeight: '200px' }}
    >
      {/* Ember particles canvas */}
      <canvas
        ref={embersRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 100 }}
      />
      
      {/* Front card with burning text */}
      <div
        ref={cardRef}
        className="relative inline-block"
        data-testid="flip-card-front"
        style={{
          transformStyle: 'preserve-3d',
          transform: 'rotateY(0deg)',
        }}
      >
        {/* Business card background */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-900 dark:to-zinc-800 rounded-lg shadow-2xl" />
        
        {/* Text to be burned */}
        <div
          ref={textRef}
          className="relative text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold px-8 py-6 text-foreground"
        >
          You need more than another salesperson
          
          {/* Burn mask overlay */}
          <div
            ref={burnMaskRef}
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(
                90deg,
                transparent 0%,
                rgba(255, 50, 0, 0.8) 25%,
                rgba(255, 100, 0, 0.9) 30%,
                rgba(255, 150, 0, 0.8) 35%,
                rgba(255, 200, 0, 0.6) 40%,
                transparent 50%
              )`,
              backgroundSize: '200% 100%',
              backgroundPosition: '-100% 0',
              mixBlendMode: 'color-burn',
              filter: 'blur(2px)',
            }}
          />
          
          {/* Burning edge glow */}
          <div
            className="absolute inset-0 pointer-events-none opacity-0"
            style={{
              background: `linear-gradient(
                90deg,
                transparent 0%,
                rgba(255, 100, 0, 0.4) 45%,
                rgba(255, 50, 0, 0.6) 50%,
                rgba(255, 100, 0, 0.4) 55%,
                transparent 100%
              )`,
              filter: 'blur(8px)',
              animation: 'burnGlow 0.8s ease-in-out',
            }}
          />
        </div>
      </div>
      
      {/* Back of card with cascade cards */}
      <div
        ref={backCardRef}
        className="absolute inset-0 opacity-0"
        data-testid="flip-card-back"
        style={{
          transformStyle: 'preserve-3d',
          transform: 'rotateY(0deg)',
        }}
      >
        {/* Cascade cards container */}
        <div className="flex items-center justify-center gap-4 h-full">
          {words.map((word, index) => (
            <div
              key={index}
              ref={el => cascadeCardsRef.current[index] = el!}
              className="absolute bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-800 dark:to-zinc-900 rounded-lg shadow-xl px-6 py-4 opacity-0 scale-0"
              data-testid={`cascade-card-${word}`}
              style={{
                transform: `translateZ(${index * 20}px)`,
                transformOrigin: 'center center',
              }}
            >
              <span className={`text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-extrabold ${
                word === 'system' ? 'text-primary' : 'text-foreground'
              }`}>
                {word}
              </span>
            </div>
          ))}
        </div>
        
        {/* Golden frame that emerges */}
        <div
          ref={goldenFrameRef}
          className="absolute inset-0 rounded-lg pointer-events-none"
          data-testid="golden-frame"
          style={{
            border: '3px solid transparent',
            backgroundImage: `linear-gradient(
              45deg,
              rgba(255, 215, 0, 0.8) 0%,
              rgba(255, 193, 7, 0.9) 25%,
              rgba(255, 160, 0, 0.8) 50%,
              rgba(255, 193, 7, 0.9) 75%,
              rgba(255, 215, 0, 0.8) 100%
            )`,
            backgroundSize: '200% 200%',
            backgroundPosition: '0% 50%',
            animation: 'goldenShimmer 3s ease-in-out infinite',
            WebkitBackgroundClip: 'padding-box, border-box',
            backgroundClip: 'padding-box, border-box',
            backgroundOrigin: 'border-box',
            boxShadow: '0 0 30px rgba(255, 215, 0, 0.4)',
          }}
        />
      </div>
      
      {/* Crown/checkmark that forms above */}
      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 opacity-0" id="crown-container" data-testid="crown-checkmark">
        <svg width="60" height="40" viewBox="0 0 60 40" className="text-primary">
          <path
            d="M10 20 L25 35 L50 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-0"
            style={{
              animation: 'crownDraw 0.5s ease-out 2.3s forwards',
              strokeDasharray: '60',
              strokeDashoffset: '60',
            }}
          />
        </svg>
      </div>
      
    </div>
  );
}