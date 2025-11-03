import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Search, Rocket, TrendingUp, Target, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ANIMATION_CONFIG, prefersReducedMotion } from '@/lib/animationConfig';

gsap.registerPlugin(ScrollTrigger);

/**
 * BuildAndRampTimeline: Vertical timeline with scroll reveals
 * 
 * Shows 5-month GTM system build process with sequential reveals.
 * Each step fades in and connecting lines draw as user scrolls.
 * 
 * Animation:
 * - Steps: Fade up from 50px offset with 0.8s duration
 * - Lines: Draw from top to bottom with 0.6s duration
 * - Triggers at 85% viewport for natural reveal timing
 * 
 * Triggers: Individual ScrollTriggers per step
 * Dependencies: GSAP, ScrollTrigger
 */

const timelineSteps = [
  {
    id: 'month-1',
    month: 'Month 1',
    icon: Search,
    title: 'Audit & Build',
    subtitle: 'Foundation Phase',
    color: '#9F8FFF',
    colorClass: 'text-community',
    details: [
      'GTM Leverage Audit: Deep dive into ICP, positioning, and current GTM motion',
      'Design Impact Selling OS v1: Your proprietary playbook and strategic framework',
      'Build Signal Factory: AI-powered tech stack integration and data enrichment',
    ],
  },
  {
    id: 'month-2',
    month: 'Month 2',
    icon: Rocket,
    title: 'Activation & Test',
    subtitle: 'Launch Phase',
    color: '#ef233c',
    colorClass: 'text-primary',
    details: [
      'Activate your Fully Loaded BDR Pod with trained operators',
      'Test playbook against market with real prospect conversations',
      'Book first qualified meetings for data collection and iteration',
    ],
  },
  {
    id: 'month-3',
    month: 'Month 3',
    icon: TrendingUp,
    title: 'Approaching Quota',
    subtitle: 'Optimization Phase',
    color: '#42349c',
    colorClass: 'text-purple-dark',
    details: [
      'GTM Engine humming: Systems optimized, playbook refined',
      'Hitting stride: Consistent meeting velocity and quality',
      'Performance at or near 20 SQOs per SDR monthly',
    ],
  },
  {
    id: 'month-4',
    month: 'Month 4',
    icon: Target,
    title: 'Hitting Quota',
    subtitle: 'Proven Asset Phase',
    color: '#2e294e',
    colorClass: 'text-indigo',
    details: [
      'Asset proven: Complete system validated and reliable',
      'System delivering consistently: 20+ SQO/SDR quota achieved',
      'Your GTM Engine is now a predictable revenue generator',
    ],
  },
  {
    id: 'month-5-plus',
    month: 'Month 5+',
    icon: Zap,
    title: 'The Guarantee Unlocks',
    subtitle: 'Guaranteed Performance',
    color: '#9F8FFF',
    colorClass: 'text-community',
    details: [
      'Quota now guaranteed every month (except December)',
      'Focus shifts to scaling beyond quota and expanding capacity',
      'Your asset compounds: Better data, better targeting, better results',
    ],
  },
];

export default function BuildAndRampTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<(HTMLDivElement | null)[]>([]);
  const linesRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const config = ANIMATION_CONFIG.timeline;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) {
        gsap.set(stepsRef.current, { opacity: 1, y: 0 });
        gsap.set(linesRef.current, { scaleY: 1 });
        return;
      }

      stepsRef.current.forEach((step, index) => {
        if (!step) return;

        gsap.fromTo(
          step,
          { opacity: 0, y: config.step.initialOffset },
          {
            opacity: 1,
            y: 0,
            duration: config.step.duration,
            ease: config.step.easing,
            scrollTrigger: {
              trigger: step,
              start: config.step.scrollTrigger.start,
              end: config.step.scrollTrigger.end,
              toggleActions: 'play none none reverse',
            },
          }
        );

        const line = linesRef.current[index];
        if (line) {
          gsap.fromTo(
            line,
            { scaleY: 0, transformOrigin: 'top' },
            {
              scaleY: 1,
              duration: config.line.duration,
              ease: config.line.easing,
              scrollTrigger: {
                trigger: step,
                start: config.line.scrollTrigger.start,
                end: config.line.scrollTrigger.end,
                toggleActions: 'play none none reverse',
              },
            }
          );
        }
      });
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative py-12" data-testid="build-ramp-timeline">
      <div className="max-w-5xl mx-auto">
        <div className="relative">
          {timelineSteps.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === timelineSteps.length - 1;

            return (
              <div key={step.id} className="relative">
                <div
                  ref={(el) => (stepsRef.current[index] = el)}
                  className="flex gap-6 mb-12"
                  data-testid={`timeline-step-${step.id}`}
                >
                  <div className="flex flex-col items-center">
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0 border-2"
                      style={{
                        backgroundColor: step.color + '20',
                        borderColor: step.color,
                      }}
                      data-testid={`timeline-icon-${step.id}`}
                    >
                      <Icon className="w-9 h-9" style={{ color: step.color }} />
                    </div>

                    {!isLast && (
                      <div
                        ref={(el) => (linesRef.current[index] = el)}
                        className="w-0.5 h-40 mt-4"
                        style={{ backgroundColor: step.color + '40' }}
                        data-testid={`timeline-line-${step.id}`}
                      />
                    )}
                  </div>

                  <div className="flex-1 pt-2">
                    <Badge 
                      variant="secondary" 
                      className="mb-3"
                      data-testid={`badge-month-${step.id}`}
                    >
                      {step.month}
                    </Badge>
                    <h3 className={`text-3xl font-bold mb-2 ${step.colorClass}`}>
                      {step.title}
                    </h3>
                    <p className="text-lg font-semibold text-muted-foreground mb-4">
                      {step.subtitle}
                    </p>
                    <Card className="p-6 bg-card/50">
                      <ul className="space-y-3">
                        {step.details.map((detail, detailIndex) => (
                          <li 
                            key={detailIndex} 
                            className="flex gap-3 text-muted-foreground leading-relaxed"
                            data-testid={`timeline-detail-${step.id}-${detailIndex}`}
                          >
                            <span className="text-primary font-bold mt-1">•</span>
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
