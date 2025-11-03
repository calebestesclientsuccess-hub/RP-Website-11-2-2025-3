import { ChevronDown } from 'lucide-react';

/**
 * SimpleBridgeSection: Clean, static transition section
 * No scroll pinning, no particle effects, just clear messaging
 */
export default function SimpleBridgeSection() {
  return (
    <section className="relative py-32 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-background to-background/95">
      <div className="max-w-4xl mx-auto text-center space-y-12">
        {/* The transformation message */}
        <div className="space-y-6">
          <p className="text-2xl md:text-3xl text-muted-foreground animate-fade-in">
            You need more than another salesperson
          </p>
          <h2 className="text-5xl md:text-7xl font-bold text-primary animate-fade-in animation-delay-200">
            You need a system
          </h2>
        </div>

        {/* Simple bouncing arrow */}
        <div className="flex justify-center pt-8 animate-bounce">
          <ChevronDown className="w-8 h-8 text-muted-foreground" />
        </div>
      </div>
    </section>
  );
}