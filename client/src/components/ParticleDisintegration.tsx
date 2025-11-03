import { useEffect, useRef, useCallback } from 'react';
import { ANIMATION_CONFIG } from '@/lib/animationConfig';

/**
 * ParticleDisintegration: Canvas-based particle effects
 * 
 * Creates falling particles from text with leaf-like physics.
 * Particles spawn from text position with gentle sway and gravity.
 * 
 * Physics:
 * - Gentle gravity pulls particles down
 * - Horizontal sway creates leaf-like motion
 * - Air resistance for organic movement
 * - Particles glow target element when approaching
 * 
 * Triggers: When isActive prop becomes true
 * Duration: 6-9 seconds (configurable)
 * Dependencies: Canvas API, requestAnimationFrame
 */

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
    const config = ANIMATION_CONFIG.particles;
    const drift = (Math.random() - 0.5) * 0.5;
    
    return {
      x,
      y,
      vx: drift,
      vy: 0,
      size: Math.random() * (config.size.max - config.size.min) + config.size.min,
      alpha: 1,
      color: `hsl(0, ${config.color.saturation.min + Math.random() * (config.color.saturation.max - config.color.saturation.min)}%, ${config.color.lightness.min + Math.random() * (config.color.lightness.max - config.color.lightness.min)}%)`,
      life: delay,
      maxLife: config.lifespan.min + Math.random() * (config.lifespan.max - config.lifespan.min),
    };
  }, []);

  const initParticles = useCallback(() => {
    if (!textElement || !canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const rect = textElement.getBoundingClientRect();
    
    const particles: Particle[] = [];
    const config = ANIMATION_CONFIG.particles;

    // Create particles in a grid pattern across the text bounds
    const particleCount = Math.floor((rect.width / config.spacing) * (rect.height / config.spacing));
    
    for (let y = 0; y < rect.height; y += config.spacing) {
      for (let x = 0; x < rect.width; x += config.spacing) {
        // Create particle with left-to-right delay for wave effect
        const delay = (x / rect.width) * duration;
        particles.push(createParticle(rect.left + x, rect.top + y, delay));
      }
    }

    particlesRef.current = particles;
    
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
        
        const config = ANIMATION_CONFIG.particles;
        
        // Update physics with gentle leaf-like motion
        particle.vy += config.gravity;
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Add slight horizontal sway like leaves
        particle.vx += Math.sin(particleAge * config.sway.frequency) * config.sway.amplitude;
        
        // Air resistance for more organic motion
        particle.vx *= config.airResistance.horizontal;
        particle.vy *= config.airResistance.vertical;
        
        // Calculate alpha based on life
        particle.alpha = Math.max(0, 1 - (particleAge / particle.maxLife));

        // Check if particle is near target text for glow effect
        if (targetRect && glowTargetRef.current) {
          const dist = Math.abs(particle.y - targetRect.top);
          if (dist < config.targetGlow.distance) {
            const glowIntensity = (config.targetGlow.distance - dist) / config.targetGlow.distance * particle.alpha;
            glowTargetRef.current.style.filter = `drop-shadow(0 0 ${glowIntensity * config.targetGlow.intensity}px rgba(239, 68, 68, ${glowIntensity * config.targetGlow.opacityMultiplier}))`;
          }
        }

        // Draw particle with enhanced glow
        ctx.save();
        ctx.globalAlpha = particle.alpha;
        ctx.fillStyle = particle.color;
        ctx.shadowBlur = config.shadowBlur;
        ctx.shadowColor = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw inner bright core
        ctx.shadowBlur = config.shadowBlur / 3;
        ctx.fillStyle = `hsl(0, 100%, 70%)`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * config.coreSize, 0, Math.PI * 2);
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
    if (isActive && textElement) {
      initParticles();
      startTimeRef.current = 0;
      animationRef.current = requestAnimationFrame(animate);
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