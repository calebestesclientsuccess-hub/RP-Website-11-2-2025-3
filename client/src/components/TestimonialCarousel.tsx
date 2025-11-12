import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Testimonial } from '@shared/schema';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { trackTestimonialInteraction } from '@/lib/analytics';

export default function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { data: testimonials = [], isLoading, isError, refetch } = useQuery<Testimonial[]>({
    queryKey: ['/api/testimonials?featured=true'],
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });

  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Only start auto-rotation if we have multiple testimonials and not paused
    if (testimonials.length > 1 && !isPaused) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      }, 8000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [testimonials.length, isPaused]);

  const handlePrevious = () => {
    const newIndex = currentIndex === 0 ? testimonials.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    trackTestimonialInteraction('previous', newIndex);
  };

  const handleNext = () => {
    const newIndex = (currentIndex + 1) % testimonials.length;
    setCurrentIndex(newIndex);
    trackTestimonialInteraction('next', newIndex);
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
    trackTestimonialInteraction('dot_click', index);
  };

  // Show loading skeleton while fetching testimonials
  if (isLoading) {
    return (
      <div className="relative max-w-4xl mx-auto">
        <Card className="p-8 md:p-12">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-muted rounded-full animate-pulse" />
            <div className="space-y-2">
              <div className="h-6 bg-muted rounded animate-pulse" />
              <div className="h-6 bg-muted rounded animate-pulse w-3/4" />
            </div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-muted rounded-full animate-pulse" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Show error state with retry option
  if (isError) {
    return (
      <div className="relative max-w-4xl mx-auto">
        <Card className="p-8 md:p-12 text-center">
          <p className="text-muted-foreground mb-4">
            Unable to load testimonials. Please try again.
          </p>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  // Don't render if no testimonials available
  if (testimonials.length === 0) {
    return null;
  }

  const currentTestimonial = testimonials[currentIndex];

  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Revenue Party GTM Engine",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": testimonials.length,
      "bestRating": "5",
      "worstRating": "1"
    },
    "review": testimonials.map((t) => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": t.name
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": t.rating || 5
      },
      "reviewBody": t.quote
    }))
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(schemaMarkup)}
        </script>
      </Helmet>
      
      <div 
        className="relative max-w-4xl mx-auto"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <Card className="p-8 md:p-12 relative overflow-visible">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="relative z-10"
            >
              <Quote className="w-12 h-12 text-primary/20 mb-6" aria-hidden="true" />
              
              <blockquote className="mb-8">
                <p className="text-xl md:text-2xl leading-relaxed mb-2" data-testid={`text-testimonial-quote-${currentIndex}`}>
                  "{currentTestimonial.quote}"
                </p>
                
                <div className="flex gap-1 mt-4" role="img" aria-label={`${currentTestimonial.rating} out of 5 stars`}>
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-5 h-5 ${
                        i < (currentTestimonial.rating || 5) 
                          ? 'fill-primary text-primary' 
                          : 'text-muted-foreground'
                      }`}
                      aria-hidden="true"
                    />
                  ))}
                </div>
              </blockquote>
              
              <div className="flex items-center gap-4">
                <Avatar className="w-14 h-14">
                  <AvatarImage src={currentTestimonial.avatarUrl || undefined} alt={`${currentTestimonial.name}'s avatar`} />
                  <AvatarFallback>
                    {currentTestimonial.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-lg" data-testid={`text-testimonial-author-${currentIndex}`}>
                    {currentTestimonial.name}
                  </p>
                  <p className="text-muted-foreground">
                    {currentTestimonial.title} at {currentTestimonial.company}
                  </p>
                  {currentTestimonial.metrics && (
                    <p className="text-sm gradient-text gradient-hero mt-1 font-semibold">
                      {currentTestimonial.metrics}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {testimonials.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20"
                onClick={handlePrevious}
                data-testid="button-testimonial-prev"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20"
                onClick={handleNext}
                data-testid="button-testimonial-next"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>

              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-2" role="tablist" aria-label="Testimonial navigation">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    role="tab"
                    aria-selected={index === currentIndex}
                    aria-label={`View testimonial ${index + 1}`}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentIndex 
                        ? 'w-8 bg-primary' 
                        : 'bg-muted-foreground/30 hover-elevate'
                    }`}
                    onClick={() => handleDotClick(index)}
                    data-testid={`dot-testimonial-${index}`}
                  />
                ))}
              </div>
            </>
          )}
        </Card>
      </div>
    </>
  );
}
