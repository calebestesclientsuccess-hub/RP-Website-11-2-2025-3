import { useEffect, useRef, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  life: number;
  maxLife: number;
}

interface ParticleDisintegrationProps {
  isActive: boolean;
  textElement: HTMLElement | null;
  onComplete?: () => void;
  duration?: number;
}

export default function ParticleDisintegration({ 
  isActive, 
  textElement,
  onComplete,
  duration = 1500 
}: ParticleDisintegrationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const glowTargetRef = useRef<HTMLElement | null>(null);

  const createParticle = useCallback((x: number, y: number, delay: number = 0): Particle => {
    // Create gentle horizontal drift for leaf-like motion
    const drift = (Math.random() - 0.5) * 0.5;
    
    return {
      x,
      y,
      vx: drift, // Subtle horizontal sway
      vy: 0, // Start with no vertical velocity, gravity will pull down
      size: Math.random() * 4 + 2, // Larger particles (2-6px)
      alpha: 1,
      color: `hsl(0, ${90 + Math.random() * 10}%, ${55 + Math.random() * 15}%)`, // Brighter red with variation
      life: delay,
      maxLife: 6000 + Math.random() * 3000, // Particles live 6-9 seconds for graceful fall
    };
  }, []);

  const initParticles = useCallback(() => {
    if (!textElement || !canvasRef.current) {
      console.log('Cannot initialize particles:', { textElement: !!textElement, canvas: !!canvasRef.current });
      return;
    }

    const canvas = canvasRef.current;
    const rect = textElement.getBoundingClientRect();
    
    console.log('Initializing particles for text element:', { 
      text: textElement.innerText, 
      rect: { width: rect.width, height: rect.height, top: rect.top, left: rect.left }
    });
    const particles: Particle[] = [];

    // Create particles in a grid pattern across the text bounds
    // Use tighter spacing for denser, more dramatic particle field
    const particleSpacing = 4;
    const particleCount = Math.floor((rect.width / particleSpacing) * (rect.height / particleSpacing));
    
    for (let y = 0; y < rect.height; y += particleSpacing) {
      for (let x = 0; x < rect.width; x += particleSpacing) {
        // Create particle with left-to-right delay for wave effect
        const delay = (x / rect.width) * duration;
        particles.push(createParticle(rect.left + x, rect.top + y, delay));
      }
    }

    particlesRef.current = particles;
    console.log(`Created ${particles.length} particles for disintegration (grid-based, expected ~${particleCount})`);
    
    // Set canvas size and position
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '0'; // At base stacking level so sections render above it

    // Find the target element for glow effect
    const targetSection = document.querySelector('[data-testid="section-fullstack-sales-unit"]');
    if (targetSection) {
      glowTargetRef.current = targetSection as HTMLElement;
    }
  }, [textElement, createParticle, duration]);

  const animate = useCallback((timestamp: number) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }

    const elapsed = timestamp - startTimeRef.current;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let activeParticles = 0;
    const targetRect = glowTargetRef.current?.getBoundingClientRect();

    particlesRef.current.forEach((particle) => {
      // Skip particles that haven't started yet
      if (elapsed < particle.life) return;

      const particleAge = elapsed - particle.life;
      
      if (particleAge < particle.maxLife) {
        activeParticles++;
        
        // Update physics with gentle leaf-like motion
        particle.vy += 0.08; // Gentle gravity
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Add slight horizontal sway like leaves
        particle.vx += Math.sin(particleAge * 0.002) * 0.02;
        
        // Air resistance for more organic motion
        particle.vx *= 0.995;
        particle.vy *= 0.998;
        
        // Calculate alpha based on life
        particle.alpha = Math.max(0, 1 - (particleAge / particle.maxLife));

        // Check if particle is near target text for glow effect
        if (targetRect && glowTargetRef.current) {
          const dist = Math.abs(particle.y - targetRect.top);
          if (dist < 50) {
            // Add glow to target element
            const glowIntensity = (50 - dist) / 50 * particle.alpha;
            glowTargetRef.current.style.filter = `drop-shadow(0 0 ${glowIntensity * 20}px rgba(239, 68, 68, ${glowIntensity * 0.5}))`;
          }
        }

        // Draw particle with enhanced glow
        ctx.save();
        ctx.globalAlpha = particle.alpha;
        ctx.fillStyle = particle.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw inner bright core
        ctx.shadowBlur = 5;
        ctx.fillStyle = `hsl(0, 100%, 70%)`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });

    // Continue animation if particles are active
    if (activeParticles > 0) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      // Animation complete
      if (glowTargetRef.current) {
        glowTargetRef.current.style.filter = '';
      }
      onComplete?.();
    }
  }, [onComplete]);

  useEffect(() => {
    console.log('ParticleDisintegration effect:', { isActive, hasTextElement: !!textElement });
    if (isActive && textElement) {
      initParticles();
      startTimeRef.current = 0;
      animationRef.current = requestAnimationFrame(animate);
      console.log('Started particle animation');
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (glowTargetRef.current) {
        glowTargetRef.current.style.filter = '';
      }
    };
  }, [isActive, textElement, initParticles, animate]);

  return isActive ? <canvas ref={canvasRef} /> : null;
}