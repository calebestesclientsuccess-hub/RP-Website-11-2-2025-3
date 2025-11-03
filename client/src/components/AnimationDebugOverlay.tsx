import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Info } from 'lucide-react';
import { ANIMATION_CONFIG } from '@/lib/animationConfig';

/**
 * AnimationDebugOverlay: Development debugging tool
 * 
 * Activated by adding ?debug=true to URL
 * Shows current animation config values and performance tier info
 * 
 * Usage: Add to App.tsx root component
 */
export function AnimationDebugOverlay() {
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check for ?debug=true in URL
    const params = new URLSearchParams(window.location.search);
    setIsDebugMode(params.get('debug') === 'true');
  }, []);

  if (!isDebugMode || !isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999]" data-testid="animation-debug-overlay">
      <Card className="w-96 max-h-[600px] overflow-auto p-4 bg-background/95 backdrop-blur-sm border-2 border-primary">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-sm">Animation Debug Mode</h3>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={() => setIsVisible(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-3 text-xs">
          {/* Performance Tier */}
          <div>
            <Badge variant="secondary" className="mb-2">Performance</Badge>
            <div className="pl-2 space-y-1 text-muted-foreground">
              <div>Cores: {navigator.hardwareConcurrency || 'unknown'}</div>
              <div>Memory: {(navigator as any).deviceMemory || 'unknown'}GB</div>
              <div>Connection: {(navigator as any).connection?.effectiveType || 'unknown'}</div>
            </div>
          </div>

          {/* Reduced Motion */}
          <div>
            <Badge variant="secondary" className="mb-2">Accessibility</Badge>
            <div className="pl-2 text-muted-foreground">
              Reduced Motion: {window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'ON' : 'OFF'}
            </div>
          </div>

          {/* ScrollScaleReveal Config */}
          <div>
            <Badge variant="secondary" className="mb-2">ScrollScaleReveal</Badge>
            <div className="pl-2 space-y-1 text-muted-foreground font-mono">
              <div>Scroll Distance: {ANIMATION_CONFIG.scrollScale.scrollDistanceMultiplier}x viewport</div>
              <div>Growth Phase: {ANIMATION_CONFIG.scrollScale.phases.growth}</div>
              <div>Crossfade Phase: {ANIMATION_CONFIG.scrollScale.phases.crossfade}</div>
              <div>Friction Phase: {ANIMATION_CONFIG.scrollScale.phases.friction}</div>
              <div>Pulse Trigger: {(ANIMATION_CONFIG.scrollScale.pulse.triggerProgress * 100).toFixed(0)}%</div>
            </div>
          </div>

          {/* OrbitalPowers Config */}
          <div>
            <Badge variant="secondary" className="mb-2">OrbitalPowers</Badge>
            <div className="pl-2 space-y-1 text-muted-foreground font-mono">
              <div>Initial Speed: {ANIMATION_CONFIG.orbital.initialSpeed} deg/frame</div>
              <div>Decay Rate: {ANIMATION_CONFIG.orbital.decayRate}</div>
              <div>Expansion Factor: {ANIMATION_CONFIG.orbital.expansionFactor}</div>
              <div>Golden Ratio: {ANIMATION_CONFIG.orbital.goldenRatio}</div>
              <div>Video Slowdown: -{ANIMATION_CONFIG.orbital.videoSlowdownOffset}s</div>
            </div>
          </div>

          {/* Particles Config */}
          <div>
            <Badge variant="secondary" className="mb-2">Particles</Badge>
            <div className="pl-2 space-y-1 text-muted-foreground font-mono">
              <div>Spacing: {ANIMATION_CONFIG.particles.spacing}px</div>
              <div>Gravity: {ANIMATION_CONFIG.particles.gravity}</div>
              <div>Lifespan: {ANIMATION_CONFIG.particles.lifespan.min}-{ANIMATION_CONFIG.particles.lifespan.max}ms</div>
              <div>Size: {ANIMATION_CONFIG.particles.size.min}-{ANIMATION_CONFIG.particles.size.max}px</div>
            </div>
          </div>

          {/* Timeline Config */}
          <div>
            <Badge variant="secondary" className="mb-2">Timeline</Badge>
            <div className="pl-2 space-y-1 text-muted-foreground font-mono">
              <div>Step Duration: {ANIMATION_CONFIG.timeline.step.duration}s</div>
              <div>Line Duration: {ANIMATION_CONFIG.timeline.line.duration}s</div>
              <div>Step Offset: {ANIMATION_CONFIG.timeline.step.initialOffset}px</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pt-2 border-t">
            <div className="text-muted-foreground">
              <strong>URL:</strong> {window.location.href}
            </div>
            <div className="mt-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full text-xs"
                onClick={() => {
                  window.location.href = window.location.pathname;
                }}
              >
                Exit Debug Mode
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
