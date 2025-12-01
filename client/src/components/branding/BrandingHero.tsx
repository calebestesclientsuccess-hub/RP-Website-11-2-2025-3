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
            <div>Your Brand Drives Sales</div>
            <div className="gradient-text gradient-hero">Or Kills Them</div>
          </h1>
        </motion.div>
      </div>
    </section>
  );
}
