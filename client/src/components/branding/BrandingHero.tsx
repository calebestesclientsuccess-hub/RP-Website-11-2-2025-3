import { motion } from "framer-motion";

export function BrandingHero() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" data-testid="heading-branding-hero">
            Your Brand Is Driving Sales, Or Killing Them.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Meet Mariya Tamkeen, our Brand Strategist and Creative Director. 
            See how she transforms GTM positioning into revenue.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
