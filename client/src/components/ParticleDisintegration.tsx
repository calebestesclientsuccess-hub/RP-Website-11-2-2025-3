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
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 2 + 0.5;
    
    return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.abs(Math.sin(angle)) * speed * 0.5, // Bias downward
      size: Math.random() * 3 + 1,
      alpha: 1,
      color: `hsl(0, 85%, ${50 + Math.random() * 20}%)`, // Red with variation
      life: delay,
      maxLife: 2000 + Math.random() * 1000, // Particles live 2-3 seconds
    };
  }, []);

  const initParticles = useCallback(() => {
    if (!textElement || !canvasRef.current) {
      console.log('Cannot initialize particles:', { textElement: !!textElement, canvas: !!canvasRef.current });
      return;
    }

    const canvas = canvasRef.current;
    const rect = textElement.getBoundingClientRect();
    
    // If text is off-screen, use viewport center as position
    const isOffScreen = rect.top < -window.innerHeight || rect.top > window.innerHeight * 2;
    const adjustedTop = isOffScreen ? window.innerHeight / 2 - rect.height / 2 : rect.top;
    const adjustedLeft = isOffScreen ? window.innerWidth / 2 - rect.width / 2 : rect.left;
    
    console.log('Initializing particles for text element:', { 
      text: textElement.innerText, 
      rect: { width: rect.width, height: rect.height, top: rect.top, left: rect.left },
      adjusted: { top: adjustedTop, left: adjustedLeft, wasOffScreen: isOffScreen }
    });
    const particles: Particle[] = [];

    // Sample text to create particles
    const ctx = document.createElement('canvas').getContext('2d');
    if (!ctx) return;

    ctx.canvas.width = rect.width;
    ctx.canvas.height = rect.height;
    ctx.fillStyle = '#ef4444';
    ctx.font = window.getComputedStyle(textElement).font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(textElement.innerText, rect.width / 2, rect.height / 2);

    const imageData = ctx.getImageData(0, 0, rect.width, rect.height);
    const data = imageData.data;

    // Create particles from text pixels
    for (let y = 0; y < rect.height; y += 4) {
      for (let x = 0; x < rect.width; x += 4) {
        const index = (y * rect.width + x) * 4;
        const alpha = data[index + 3];
        
        if (alpha > 128) {
          // Create particle with left-to-right delay
          const delay = (x / rect.width) * duration;
          particles.push(createParticle(adjustedLeft + x, adjustedTop + y, delay));
        }
      }
    }

    particlesRef.current = particles;
    console.log(`Created ${particles.length} particles for disintegration`);
    
    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '100';

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
        
        // Update physics
        particle.vy += 0.15; // Gravity
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Add slight horizontal drift
        particle.vx += (Math.random() - 0.5) * 0.1;
        
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

        // Draw particle with glow
        ctx.save();
        ctx.globalAlpha = particle.alpha;
        ctx.fillStyle = particle.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
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