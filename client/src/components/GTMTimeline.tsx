import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Users, BookOpen, Brain, Boxes, TrendingUp } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const timelineSteps = [
  {
    id: 'talent',
    icon: Users,
    title: 'Elite Talent',
    description: 'Top-tier BDRs and SDRs who know how to convert prospects into conversations',
    color: '#9F8FFF',
    colorClass: 'text-community',
  },
  {
    id: 'framework',
    icon: BookOpen,
    title: 'Strategic Framework',
    description: 'Proven playbooks and methodologies that turn conversations into qualified opportunities',
    color: '#ef233c',
    colorClass: 'text-primary',
  },
  {
    id: 'ai',
    icon: Brain,
    title: 'AI-Powered by Humans',
    description: 'Intelligence-augmented workflows that maximize efficiency without losing the human touch',
    color: '#42349c',
    colorClass: 'text-purple-dark',
  },
  {
    id: 'stack',
    icon: Boxes,
    title: 'Complete Tech Stack',
    description: 'Fully integrated martech infrastructure that captures, tracks, and optimizes every interaction',
    color: '#2e294e',
    colorClass: 'text-indigo',
  },
];

export default function GTMTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<(HTMLDivElement | null)[]>([]);
  const linesRef = useRef<(HTMLDivElement | null)[]>([]);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (prefersReducedMotion) {
        gsap.set(stepsRef.current, { opacity: 1, y: 0 });
        gsap.set(linesRef.current, { scaleY: 1 });
        gsap.set(resultRef.current, { opacity: 1, y: 0 });
        return;
      }

      stepsRef.current.forEach((step, index) => {
        if (!step) return;

        gsap.fromTo(
          step,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: step,
              start: 'top 85%',
              end: 'top 65%',
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
              duration: 0.6,
              ease: 'power2.inOut',
              scrollTrigger: {
                trigger: step,
                start: 'center 75%',
                end: 'center 55%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        }
      });

      if (resultRef.current) {
        gsap.fromTo(
          resultRef.current,
          { opacity: 0, y: 50, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1,
            ease: 'back.out(1.2)',
            scrollTrigger: {
              trigger: resultRef.current,
              start: 'top 85%',
              end: 'top 65%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative py-24 px-4" data-testid="gtm-timeline">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            The Complete <span className="text-primary">GTM Machine</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Not just pieces. Not just tools. A complete system working together to generate qualified pipeline.
          </p>
        </div>

        <div className="relative">
          {timelineSteps.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === timelineSteps.length - 1;

            return (
              <div key={step.id} className="relative">
                <div
                  ref={(el) => (stepsRef.current[index] = el)}
                  className="flex gap-6 mb-8"
                  data-testid={`timeline-step-${step.id}`}
                >
                  <div className="flex flex-col items-center">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 border-2"
                      style={{
                        backgroundColor: step.color + '20',
                        borderColor: step.color,
                      }}
                      data-testid={`timeline-icon-${step.id}`}
                    >
                      <Icon className="w-7 h-7" style={{ color: step.color }} />
                    </div>

                    {!isLast && (
                      <div
                        ref={(el) => (linesRef.current[index] = el)}
                        className="w-0.5 h-32 mt-4"
                        style={{ backgroundColor: step.color + '40' }}
                        data-testid={`timeline-line-${step.id}`}
                      />
                    )}
                  </div>

                  <div className="flex-1 pt-2">
                    <h3 className={`text-2xl font-bold mb-2 ${step.colorClass}`}>
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground text-lg">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          <div
            ref={resultRef}
            className="relative mt-12 p-8 rounded-lg border-2 border-primary bg-primary/5"
            data-testid="timeline-result"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <div>
                <div className="text-5xl font-bold text-primary mb-1">20+</div>
                <div className="text-xl font-semibold">Qualified Appointments</div>
              </div>
            </div>
            <p className="text-lg text-muted-foreground">
              Every month, like clockwork. That's what happens when all four components work together seamlessly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
