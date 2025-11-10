import { ChevronDown } from 'lucide-react';

/**
 * SimpleBridgeSection: Clean, static transition section
 * No scroll pinning, no particle effects, just clear messaging
 */
export default function SimpleBridgeSection() {
  return (
    <section className="relative py-56 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-background to-background/95">
      <div className="max-w-5xl mx-auto text-center space-y-20">
        {/* The transformation message */}
        <div className="space-y-10">
          <p className="text-4xl md:text-5xl lg:text-6xl text-muted-foreground animate-fade-in">
            You need more than another salesperson
          </p>
          <h2 className="text-7xl md:text-8xl lg:text-9xl font-bold gradient-text gradient-hero animate-fade-in animation-delay-200">
            You need a system
          </h2>
        </div>

        {/* Simple bouncing arrow - proportionally larger */}
        <div className="flex justify-center pt-16 animate-bounce">
          <ChevronDown className="w-14 h-14 text-muted-foreground" />
        </div>
      </div>
    </section>
  );
}