import { useState, useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { widgetVariants } from '@/lib/widgetVariants';
import type { Testimonial } from '@shared/schema';

interface TestimonialCarouselProps {
  className?: string;
  theme?: "light" | "dark" | "auto";
  size?: "small" | "medium" | "large";
}

export default function TestimonialCarousel({ className, theme, size }: TestimonialCarouselProps) {
  const { data: testimonials, isLoading, error, refetch } = useQuery<Testimonial[]>({
    queryKey: ['/api/testimonials'],
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'center' },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };
    
    emblaApi.on('select', onSelect);
    onSelect();
    
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  if (isLoading) {
    return (
      <div className={className} data-testid="testimonial-carousel-loading">
        <Card className={cn(widgetVariants({ theme, size }))}>
          <CardContent className="p-8">
            <Skeleton className="h-8 w-8 rounded-full mb-4" />
            <Skeleton className="h-24 w-full mb-4" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className} data-testid="testimonial-carousel-error">
        <Card className={cn(widgetVariants({ theme, size }))}>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-3">
              Failed to load testimonials
            </p>
            <button
              onClick={() => refetch()}
              className="text-sm text-primary hover:underline"
              data-testid="button-retry-testimonials"
            >
              Try again
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!testimonials || testimonials.length === 0) {
    return (
      <div className={className} data-testid="testimonial-carousel-empty">
        <Card className={cn(widgetVariants({ theme, size }))}>
          <CardContent className="p-8 text-center text-muted-foreground">
            No testimonials found
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={className} data-testid="testimonial-carousel">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="flex-[0_0_100%] min-w-0"
              data-testid={`testimonial-slide-${index}`}
            >
              <Card className={cn(widgetVariants({ theme, size }))}>
                <CardContent className="p-8 md:p-12">
                  <Quote 
                    className="h-10 w-10 text-primary/20 mb-4" 
                    aria-hidden="true"
                    data-testid={`icon-quote-${index}`}
                  />
                  
                  <blockquote className="mb-6">
                    <p 
                      className="text-lg md:text-xl leading-relaxed mb-4"
                      data-testid={`text-quote-${index}`}
                    >
                      "{testimonial.quote}"
                    </p>
                    
                    <div className="flex gap-1 mb-4" data-testid={`rating-${index}`}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < testimonial.rating
                              ? 'fill-primary text-primary'
                              : 'text-muted-foreground'
                          }`}
                          aria-hidden="true"
                          data-testid={`star-${index}-${i}`}
                        />
                      ))}
                    </div>
                  </blockquote>

                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12" data-testid={`avatar-${index}`}>
                      <AvatarImage 
                        src={testimonial.avatarUrl || undefined} 
                        alt={testimonial.name}
                      />
                      <AvatarFallback>
                        {testimonial.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <p 
                        className="font-semibold"
                        data-testid={`text-name-${index}`}
                      >
                        {testimonial.name}
                      </p>
                      <p 
                        className="text-sm text-muted-foreground"
                        data-testid={`text-title-${index}`}
                      >
                        {testimonial.title} at {testimonial.company}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {testimonials.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`h-2 rounded-full transition-all ${
                index === selectedIndex
                  ? 'w-8 bg-primary'
                  : 'w-2 bg-muted-foreground/30 hover-elevate'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
              data-testid={`dot-${index}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
