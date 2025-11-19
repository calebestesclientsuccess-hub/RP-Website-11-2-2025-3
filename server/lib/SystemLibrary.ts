/**
 * SystemLibrary.ts - High-Quality GSAP Animation Templates
 * 
 * This library contains 15-20 production-ready animation templates
 * for AI-powered portfolio generation. Each template showcases
 * different scroll-based storytelling techniques with optimized
 * GSAP animations.
 */

import { nanoid } from 'nanoid';

// Types matching the schema structure
interface DirectorConfig {
  // Animation & Timing
  entryDuration?: number;
  exitDuration?: number;
  entryDelay?: number;
  exitDelay?: number;
  backgroundColor?: string;
  textColor?: string;
  gradientColors?: string[];
  gradientDirection?: string;
  
  // Typography
  headingSize?: "4xl" | "5xl" | "6xl" | "7xl" | "8xl";
  bodySize?: "base" | "lg" | "xl" | "2xl";
  fontWeight?: "normal" | "medium" | "semibold" | "bold";
  alignment?: "left" | "center" | "right";
  
  // Scroll Effects
  scrollSpeed?: "slow" | "normal" | "fast";
  parallaxIntensity?: number;
  animationDuration?: number;
  animationEasing?: string;
  fadeOnScroll?: boolean;
  scaleOnScroll?: boolean;
  blurOnScroll?: boolean;
}

interface SceneConfig {
  type: "text" | "image" | "video" | "split" | "gallery" | "quote" | "fullscreen";
  content: any;
  director?: DirectorConfig;
}

export interface SystemTemplate {
  id: string;
  name: string;
  description: string;
  category: "hero" | "testimonial" | "gallery" | "split" | "text" | "media" | "stats" | "timeline" | "cta" | "about" | "comparison" | "other";
  tags: string[];
  sceneConfig: SceneConfig;
  contentRequirements?: string;
  previewImageUrl?: string;
}

// =====================================================
// HERO SCENE TEMPLATES (3 variants)
// =====================================================

const heroTemplates: SystemTemplate[] = [
  {
    id: `tmpl_hero_impact_${nanoid(6)}`,
    name: "Epic Hero Impact",
    description: "Full-screen cinematic entrance with dramatic text reveal and parallax background. Best for making a bold first impression.",
    category: "hero",
    tags: ["hero", "impact", "parallax", "cinematic", "entrance"],
    contentRequirements: "Requires a powerful headline (5-7 words) and compelling subheading. Works best with high-contrast imagery.",
    sceneConfig: {
      type: "fullscreen",
      content: {
        media: "placeholder-hero-bg.jpg",
        mediaType: "image"
      },
      director: {
        entryDuration: 3.0,        // Premium dramatic entrance
        exitDuration: 1.8,         // Smooth exit
        entryDelay: 0.4,           // Build anticipation
        entryEffect: "zoom-in",    // Cinematic zoom
        exitEffect: "scale-blur",  // Premium exit
        backgroundColor: "#000000",
        textColor: "#ffffff",
        parallaxIntensity: 0.8,
        animationEasing: "power3.out",  // Dramatic easing
        scrollSpeed: "slow",       // Smooth scrolling
        fadeOnScroll: true,
        scaleOnScroll: true,
        blurOnScroll: false,
        headingSize: "8xl",
        alignment: "center"
      }
    }
  },
  {
    id: `tmpl_hero_reveal_${nanoid(6)}`,
    name: "Progressive Hero Reveal",
    description: "Layered text animation with staggered word reveals and subtle parallax. Creates anticipation and guides the eye.",
    category: "hero",
    tags: ["hero", "text-reveal", "stagger", "minimal", "elegant"],
    contentRequirements: "Needs a headline that can be split into impactful words or phrases. Subheading should support the main message.",
    sceneConfig: {
      type: "text",
      content: {
        heading: "Transform Your Vision Into Reality",
        headingLevel: "h1",
        body: "We craft digital experiences that inspire, engage, and deliver measurable results for forward-thinking brands.",
        metaDescription: "Transform your vision into reality with our digital experiences"
      },
      director: {
        entryDuration: 2.4,        // Perfect pacing for text reveal
        exitDuration: 1.5,         
        entryDelay: 0.3,           // Slight delay for anticipation
        entryEffect: "slide-up",   // Elegant slide entrance
        backgroundColor: "#0a0a0a",
        textColor: "#f5f5f5",
        gradientColors: ["#1a1a2e", "#16213e"],
        gradientDirection: "to-bottom",
        headingSize: "7xl",
        bodySize: "xl",
        fontWeight: "bold",
        alignment: "center",
        parallaxIntensity: 0.3,
        animationEasing: "power2.inOut",  // Smooth transitions
        scrollSpeed: "normal",
        fadeOnScroll: true,
        scaleOnScroll: false
      }
    }
  },
  {
    id: `tmpl_hero_split_${nanoid(6)}`,
    name: "Split Hero Dynamic",
    description: "Side-by-side layout with contrasting content areas and synchronized animations. Perfect for showing transformation or comparison.",
    category: "hero",
    tags: ["hero", "split", "contrast", "dynamic", "modern"],
    contentRequirements: "Works best with a strong visual on one side and concise, impactful text on the other.",
    sceneConfig: {
      type: "split",
      content: {
        media: "placeholder-hero-visual.jpg",
        heading: "Elevate Your Brand",
        body: "From concept to launch, we transform ambitious ideas into exceptional digital products that users love."
      },
      director: {
        entryDuration: 2.6,        // Dramatic split reveal
        exitDuration: 1.6,         
        entryDelay: 0.2,           
        entryEffect: "slide-right", // Side entrance
        backgroundColor: "#ffffff",
        textColor: "#1a1a1a",
        headingSize: "6xl",
        bodySize: "lg",
        alignment: "left",
        parallaxIntensity: 0.5,
        animationEasing: "power2.inOut",  // Smooth split animation
        scrollSpeed: "normal",
        fadeOnScroll: false,
        scaleOnScroll: true
      }
    }
  }
];

// =====================================================
// FEATURE GRID TEMPLATES (2 variants)
// =====================================================

const featureTemplates: SystemTemplate[] = [
  {
    id: `tmpl_feature_stagger_${nanoid(6)}`,
    name: "Staggered Feature Grid",
    description: "Product showcase with cascading reveal animations. Each item animates in sequence creating a wave effect.",
    category: "gallery",
    tags: ["features", "grid", "stagger", "showcase", "products"],
    contentRequirements: "Requires 4-8 feature items with consistent aspect ratio images. Each needs a title and brief description.",
    sceneConfig: {
      type: "gallery",
      content: {
        images: [
          { url: "placeholder-feature-1.jpg", alt: "Feature 1: Speed & Performance" },
          { url: "placeholder-feature-2.jpg", alt: "Feature 2: Security First" },
          { url: "placeholder-feature-3.jpg", alt: "Feature 3: Scalable Architecture" },
          { url: "placeholder-feature-4.jpg", alt: "Feature 4: User Experience" }
        ]
      },
      director: {
        entryDuration: 1.8,        // Smooth gallery reveal
        entryDelay: 0.12,          // Stagger effect for cards
        exitDuration: 1.2,
        entryEffect: "slide-up",   // Cards slide up
        backgroundColor: "#f8f9fa",
        parallaxIntensity: 0.2,
        animationEasing: "power2.out",  // Natural movement
        scrollSpeed: "normal",
        fadeOnScroll: true,
        scaleOnScroll: false
      }
    }
  },
  {
    id: `tmpl_feature_hover_${nanoid(6)}`,
    name: "Interactive Feature Cards",
    description: "Service grid with hover-triggered depth effects and smooth transitions. Encourages exploration through interaction.",
    category: "gallery",
    tags: ["features", "interactive", "hover", "cards", "services"],
    contentRequirements: "Best with 3-6 services. Each needs an icon/image, title, and expandable description.",
    sceneConfig: {
      type: "gallery",
      content: {
        images: [
          { url: "placeholder-service-1.jpg", alt: "Consulting & Strategy" },
          { url: "placeholder-service-2.jpg", alt: "Design & Development" },
          { url: "placeholder-service-3.jpg", alt: "Growth & Optimization" }
        ]
      },
      director: {
        entryDuration: 2.0,        // Elegant entrance
        exitDuration: 1.2,
        entryDelay: 0.1,
        entryEffect: "zoom-in",    // Cards zoom in
        backgroundColor: "#ffffff",
        textColor: "#2d3748",
        parallaxIntensity: 0.0,    // No parallax for interactive elements
        animationEasing: "circ.out",  // Snappy for interactivity
        scrollSpeed: "normal",
        fadeOnScroll: false,
        scaleOnScroll: false
      }
    }
  }
];

// =====================================================
// TESTIMONIAL TEMPLATES (2 variants)
// =====================================================

const testimonialTemplates: SystemTemplate[] = [
  {
    id: `tmpl_testimonial_fade_${nanoid(6)}`,
    name: "Elegant Quote Fade",
    description: "Customer testimonial with smooth cross-fade transitions and subtle emphasis animations.",
    category: "testimonial",
    tags: ["testimonial", "quote", "fade", "elegant", "social-proof"],
    contentRequirements: "Requires impactful customer quote (50-100 words) and attribution with name/role/company.",
    sceneConfig: {
      type: "quote",
      content: {
        quote: "Working with this team transformed our digital presence. The results exceeded our expectations in every way.",
        author: "Sarah Chen, CEO at TechVentures"
      },
      director: {
        entryDuration: 2.2,        // Give quotes weight and importance
        exitDuration: 1.6,
        entryDelay: 0.4,           // Build anticipation
        entryEffect: "fade",       // Elegant fade for quotes
        backgroundColor: "#fafafa",
        textColor: "#1a202c",
        headingSize: "5xl",
        alignment: "center",
        animationEasing: "power2.inOut",  // Smooth, professional
        scrollSpeed: "slow",       // Slower for readability
        fadeOnScroll: true,
        scaleOnScroll: false,
        parallaxIntensity: 0.1
      }
    }
  },
  {
    id: `tmpl_testimonial_carousel_${nanoid(6)}`,
    name: "Story Carousel",
    description: "Multiple customer stories with sliding transitions and progress indicators. Great for showcasing diverse success.",
    category: "testimonial",
    tags: ["testimonial", "carousel", "stories", "slider", "multiple"],
    contentRequirements: "Best with 3-5 testimonials. Each needs quote, attribution, and optional company logo.",
    sceneConfig: {
      type: "text",
      content: {
        heading: "What Our Clients Say",
        headingLevel: "h2",
        body: "Discover how we've helped businesses like yours achieve extraordinary results through innovative digital solutions."
      },
      director: {
        entryDuration: 1.8,        // Smooth carousel timing
        exitDuration: 1.2,
        entryDelay: 0.2,
        entryEffect: "slide-up",   // Elegant entrance
        backgroundColor: "#f7fafc",
        textColor: "#2d3748",
        headingSize: "5xl",
        bodySize: "lg",
        alignment: "center",
        animationEasing: "power2.inOut",  // Smooth transitions
        scrollSpeed: "normal",
        fadeOnScroll: false,
        parallaxIntensity: 0.0
      }
    }
  }
];

// =====================================================
// STATS/METRICS TEMPLATES (2 variants)
// =====================================================

const statsTemplates: SystemTemplate[] = [
  {
    id: `tmpl_stats_counter_${nanoid(6)}`,
    name: "Animated Metrics Dashboard",
    description: "Number counters that animate when scrolled into view. Perfect for highlighting achievements and impact.",
    category: "stats",
    tags: ["stats", "metrics", "counter", "numbers", "achievements"],
    contentRequirements: "Needs 3-4 key metrics with numbers, labels, and optional context or comparison.",
    sceneConfig: {
      type: "text",
      content: {
        heading: "Results That Matter",
        headingLevel: "h2",
        body: "Over 500+ projects delivered • 98% client satisfaction • 10x average ROI • 24/7 dedicated support"
      },
      director: {
        entryDuration: 2.4,        // Time for number counting
        exitDuration: 1.2,
        entryDelay: 0.15,
        entryEffect: "slide-up",   // Numbers slide up
        exitEffect: "fade",
        backgroundColor: "#1a1a1a",
        textColor: "#ffffff",
        gradientColors: ["#2d3748", "#1a202c"],
        gradientDirection: "to-right",
        headingSize: "6xl",
        bodySize: "xl",
        alignment: "center",
        animationEasing: "circ.out",  // Snappy for numbers
        scrollSpeed: "normal",
        fadeOnScroll: true,
        scaleOnScroll: true,
        parallaxIntensity: 0.3
      }
    }
  },
  {
    id: `tmpl_stats_visual_${nanoid(6)}`,
    name: "Data Visualization Scene",
    description: "Charts and graphs that build progressively on scroll. Ideal for presenting complex data simply.",
    category: "stats",
    tags: ["stats", "charts", "data", "visualization", "infographic"],
    contentRequirements: "Requires data points that can be visualized as bars, lines, or pie charts with clear labels.",
    sceneConfig: {
      type: "image",
      content: {
        url: "placeholder-data-viz.svg",
        alt: "Company growth metrics showing 300% increase in revenue over 3 years",
        title: "Growth Trajectory"
      },
      director: {
        entryDuration: 2.2,        // Progressive build
        exitDuration: 1.4,
        entryDelay: 0.2,
        entryEffect: "zoom-in",    // Charts zoom in
        backgroundColor: "#ffffff",
        textColor: "#4a5568",
        animationEasing: "power2.out",
        scrollSpeed: "normal",
        fadeOnScroll: true,
        scaleOnScroll: false,
        parallaxIntensity: 0.2
      }
    }
  }
];

// =====================================================
// TIMELINE TEMPLATE (1 variant)
// =====================================================

const timelineTemplate: SystemTemplate = {
  id: `tmpl_timeline_journey_${nanoid(6)}`,
  name: "Journey Timeline",
  description: "Company history or project milestones with scroll-triggered progressive reveals. Each point tells part of the story.",
  category: "timeline",
  tags: ["timeline", "history", "milestones", "journey", "progress"],
  contentRequirements: "Needs 4-8 milestone events with dates, titles, and brief descriptions. Optional images for key moments.",
  sceneConfig: {
    type: "text",
    content: {
      heading: "Our Journey of Innovation",
      headingLevel: "h2",
      body: "2019: Founded with a vision • 2020: First major client • 2021: Team of 50 • 2022: Global expansion • 2023: Industry leader"
    },
    director: {
      entryDuration: 2.0,        // Progressive timeline reveal
      exitDuration: 1.2,
      entryDelay: 0.3,
      entryEffect: "slide-up",   // Timeline points slide up
      backgroundColor: "#f8f9fa",
      textColor: "#2b2d42",
      headingSize: "5xl",
      bodySize: "lg",
      alignment: "left",
      animationEasing: "power2.out",  // Smooth progression
      scrollSpeed: "slow",       // Slow for readability
      fadeOnScroll: true,
      scaleOnScroll: false,
      parallaxIntensity: 0.4
    }
  }
};

// =====================================================
// GALLERY TEMPLATES (2 variants)
// =====================================================

const galleryTemplates: SystemTemplate[] = [
  {
    id: `tmpl_gallery_parallax_${nanoid(6)}`,
    name: "Parallax Gallery",
    description: "Image showcase with depth-creating parallax scrolling. Each image moves at different speeds for visual interest.",
    category: "gallery",
    tags: ["gallery", "parallax", "images", "portfolio", "showcase"],
    contentRequirements: "Works best with 6-12 high-quality images. Mix of aspect ratios creates dynamic layout.",
    sceneConfig: {
      type: "gallery",
      content: {
        images: [
          { url: "placeholder-gallery-1.jpg", alt: "Project showcase 1" },
          { url: "placeholder-gallery-2.jpg", alt: "Project showcase 2" },
          { url: "placeholder-gallery-3.jpg", alt: "Project showcase 3" },
          { url: "placeholder-gallery-4.jpg", alt: "Project showcase 4" },
          { url: "placeholder-gallery-5.jpg", alt: "Project showcase 5" },
          { url: "placeholder-gallery-6.jpg", alt: "Project showcase 6" }
        ]
      },
      director: {
        entryDuration: 2.0,        // Smooth parallax entrance
        exitDuration: 1.4,
        entryDelay: 0.15,          // Stagger for gallery items
        entryEffect: "slide-up",   // Images slide up
        backgroundColor: "#000000",
        parallaxIntensity: 0.6,
        animationEasing: "power2.inOut",  // Natural movement
        scrollSpeed: "slow",       // Smooth parallax
        fadeOnScroll: false,
        scaleOnScroll: true
      }
    }
  },
  {
    id: `tmpl_gallery_zoom_${nanoid(6)}`,
    name: "Zoom Gallery",
    description: "Images that scale and focus on hover/scroll. Creates an immersive exploration experience.",
    category: "gallery",
    tags: ["gallery", "zoom", "focus", "interactive", "immersive"],
    contentRequirements: "Requires 4-8 images with consistent quality. Best with images that have interesting details to explore.",
    sceneConfig: {
      type: "gallery",
      content: {
        images: [
          { url: "placeholder-zoom-1.jpg", alt: "Detailed view 1" },
          { url: "placeholder-zoom-2.jpg", alt: "Detailed view 2" },
          { url: "placeholder-zoom-3.jpg", alt: "Detailed view 3" },
          { url: "placeholder-zoom-4.jpg", alt: "Detailed view 4" }
        ]
      },
      director: {
        entryDuration: 2.2,        // Immersive zoom timing
        exitDuration: 1.6,
        entryDelay: 0.2,
        entryEffect: "zoom-in",    // Images zoom in
        exitEffect: "scale-blur",  // Blur on exit
        backgroundColor: "#0a0a0a",
        textColor: "#ffffff",
        animationEasing: "power3.inOut",  // Dramatic zoom
        scrollSpeed: "slow",       // Smooth zoom control
        fadeOnScroll: true,
        scaleOnScroll: true,
        blurOnScroll: true,
        parallaxIntensity: 0.3
      }
    }
  }
];

// =====================================================
// TEXT REVEAL TEMPLATES (2 variants)
// =====================================================

const textRevealTemplates: SystemTemplate[] = [
  {
    id: `tmpl_text_word_${nanoid(6)}`,
    name: "Word-by-Word Reveal",
    description: "Story sections where words appear sequentially, building anticipation and controlling reading pace.",
    category: "text",
    tags: ["text", "reveal", "words", "storytelling", "narrative"],
    contentRequirements: "Best with 50-150 word passages. Strong narrative or persuasive copy works best.",
    sceneConfig: {
      type: "text",
      content: {
        heading: "The Story Unfolds",
        headingLevel: "h2",
        body: "Every great achievement begins with a single step. We believe in the power of ideas, nurtured through collaboration, refined through iteration, and brought to life through dedication. This is how transformation happens.",
        metaDescription: "Discover how great achievements begin with innovative ideas and dedicated collaboration"
      },
      director: {
        entryDuration: 1.5,        // Readable word reveal
        exitDuration: 1.0,
        entryDelay: 0.08,          // Words appear in sequence
        entryEffect: "fade-up",    // Words fade up
        backgroundColor: "#ffffff",
        textColor: "#1a1a1a",
        headingSize: "5xl",
        bodySize: "xl",
        fontWeight: "normal",
        alignment: "center",
        animationEasing: "power2.out",  // Natural word flow
        scrollSpeed: "normal",
        fadeOnScroll: true,
        scaleOnScroll: false,
        parallaxIntensity: 0.2
      }
    }
  },
  {
    id: `tmpl_text_typewriter_${nanoid(6)}`,
    name: "Typewriter Effect",
    description: "Text that appears letter by letter, mimicking typing. Creates focus and adds personality.",
    category: "text",
    tags: ["text", "typewriter", "typing", "effect", "personality"],
    contentRequirements: "Works best with short, punchy statements (20-40 words). Great for taglines or key messages.",
    sceneConfig: {
      type: "text",
      content: {
        heading: "We Build Digital Excellence",
        headingLevel: "h2",
        body: "One pixel at a time. One line of code at a time. One happy customer at a time.",
        metaDescription: "Building digital excellence through meticulous attention to detail"
      },
      director: {
        entryDuration: 1.2,        // Typewriter effect timing
        exitDuration: 0.8,
        entryDelay: 0.03,          // Letter by letter delay
        entryEffect: "typewriter",  // Custom typewriter
        backgroundColor: "#1a1a1a",
        textColor: "#00ff00", // Terminal green for typewriter effect
        headingSize: "6xl",
        bodySize: "lg",
        fontWeight: "medium",
        alignment: "left",
        animationEasing: "steps(20)",  // Typewriter stepping
        scrollSpeed: "normal",
        fadeOnScroll: false,
        scaleOnScroll: false,
        parallaxIntensity: 0.0
      }
    }
  }
];

// =====================================================
// VIDEO BACKGROUND TEMPLATE (1 variant)
// =====================================================

const videoTemplate: SystemTemplate = {
  id: `tmpl_video_ambient_${nanoid(6)}`,
  name: "Ambient Video Background",
  description: "Looping video with overlaid text. Creates atmosphere and movement without distraction.",
  category: "media",
  tags: ["video", "background", "ambient", "atmosphere", "motion"],
  contentRequirements: "Requires high-quality video (MP4/WebM) that loops seamlessly. Text overlay should be concise and legible.",
  sceneConfig: {
    type: "video",
    content: {
      url: "placeholder-ambient-video.mp4",
      poster: "placeholder-video-poster.jpg"
    },
    director: {
      entryDuration: 2.5,        // Cinematic entrance
      exitDuration: 1.8,
      entryDelay: 0.3,           // Build anticipation
      entryEffect: "fade",       // Smooth video fade
      exitEffect: "scale-blur",  // Cinematic exit
      backgroundColor: "#000000",
      textColor: "#ffffff",
      animationEasing: "power3.inOut",  // Cinematic feel
      scrollSpeed: "slow",       // Smooth video experience
      fadeOnScroll: true,
      scaleOnScroll: false,
      parallaxIntensity: 0.0, // Videos shouldn't parallax
      blurOnScroll: true
    }
  }
};

// =====================================================
// CALL-TO-ACTION TEMPLATES (2 variants)
// =====================================================

const ctaTemplates: SystemTemplate[] = [
  {
    id: `tmpl_cta_bold_${nanoid(6)}`,
    name: "Bold CTA Block",
    description: "High-contrast conversion section with animated buttons and urgency indicators.",
    category: "cta",
    tags: ["cta", "conversion", "action", "button", "bold"],
    contentRequirements: "Needs compelling action phrase (3-5 words), benefit statement, and clear button text.",
    sceneConfig: {
      type: "text",
      content: {
        heading: "Ready to Get Started?",
        headingLevel: "h2",
        body: "Join thousands of successful businesses that have transformed their digital presence. Start your journey today.",
        metaDescription: "Start your digital transformation journey today"
      },
      director: {
        entryDuration: 1.0,        // Quick, punchy CTA
        exitDuration: 0.6,
        entryDelay: 0.1,
        entryEffect: "zoom-in",    // Attention-grabbing zoom
        backgroundColor: "#6366f1",
        textColor: "#ffffff",
        gradientColors: ["#6366f1", "#8b5cf6"],
        gradientDirection: "to-right",
        headingSize: "6xl",
        bodySize: "xl",
        fontWeight: "bold",
        alignment: "center",
        animationEasing: "back.out(1.7)",  // Playful bounce
        scrollSpeed: "fast",       // Quick response
        fadeOnScroll: false,
        scaleOnScroll: true,
        parallaxIntensity: 0.0
      }
    }
  },
  {
    id: `tmpl_cta_subtle_${nanoid(6)}`,
    name: "Subtle CTA Flow",
    description: "Gentle conversion prompt that doesn't interrupt the narrative flow. Uses micro-animations for emphasis.",
    category: "cta",
    tags: ["cta", "subtle", "conversion", "gentle", "flow"],
    contentRequirements: "Works with softer language and benefit-focused messaging. Include optional social proof.",
    sceneConfig: {
      type: "split",
      content: {
        media: "placeholder-cta-visual.jpg",
        heading: "Let's Create Something Amazing",
        body: "Schedule a free consultation to explore how we can help achieve your goals."
      },
      director: {
        entryDuration: 1.5,        // Gentle, inviting timing
        exitDuration: 1.2,
        entryDelay: 0.2,
        entryEffect: "fade",       // Soft fade entrance
        backgroundColor: "#fafafa",
        textColor: "#2d3748",
        headingSize: "5xl",
        bodySize: "lg",
        alignment: "left",
        animationEasing: "power2.inOut",  // Smooth, subtle
        scrollSpeed: "normal",
        fadeOnScroll: true,
        scaleOnScroll: false,
        parallaxIntensity: 0.2
      }
    }
  }
];

// =====================================================
// ABOUT/TEAM TEMPLATE (1 variant)
// =====================================================

const aboutTemplate: SystemTemplate = {
  id: `tmpl_about_team_${nanoid(6)}`,
  name: "Team Showcase",
  description: "Team member cards with hover effects revealing bio and social links. Builds trust through transparency.",
  category: "about",
  tags: ["about", "team", "people", "cards", "trust"],
  contentRequirements: "Needs team member photos, names, roles, and brief bios (30-50 words each). Optional social media links.",
  sceneConfig: {
    type: "gallery",
    content: {
      images: [
        { url: "placeholder-team-1.jpg", alt: "John Doe - CEO & Founder" },
        { url: "placeholder-team-2.jpg", alt: "Jane Smith - Creative Director" },
        { url: "placeholder-team-3.jpg", alt: "Mike Johnson - Lead Developer" },
        { url: "placeholder-team-4.jpg", alt: "Sarah Williams - Product Manager" }
      ]
    },
    director: {
      entryDuration: 1.5,
      exitDuration: 1.0,
      entryDelay: 0.1,
      backgroundColor: "#ffffff",
      textColor: "#2d3748",
      animationEasing: "power2.out",
      fadeOnScroll: true,
      scaleOnScroll: false,
      parallaxIntensity: 0.0
    }
  }
};

// =====================================================
// COMPARISON TEMPLATE (1 variant)
// =====================================================

const comparisonTemplate: SystemTemplate = {
  id: `tmpl_comparison_split_${nanoid(6)}`,
  name: "Before/After Comparison",
  description: "Interactive split view for showing transformation or comparing options. Slider or toggle interaction.",
  category: "comparison",
  tags: ["comparison", "before-after", "split", "interactive", "transformation"],
  contentRequirements: "Requires two comparable states (images or content blocks) with clear differentiation.",
  sceneConfig: {
    type: "split",
    content: {
      media: "placeholder-before.jpg",
      heading: "See the Transformation",
      body: "Drag the slider to reveal the dramatic difference our solutions can make for your business."
    },
    director: {
      entryDuration: 2.0,
      exitDuration: 1.5,
      backgroundColor: "#f7fafc",
      textColor: "#1a202c",
      headingSize: "5xl",
      bodySize: "lg",
      alignment: "center",
      animationEasing: "power2.inOut",
      fadeOnScroll: false,
      scaleOnScroll: false,
      blurOnScroll: false,
      parallaxIntensity: 0.0
    }
  }
};

// =====================================================
// COMBINE ALL TEMPLATES
// =====================================================

const systemTemplates: SystemTemplate[] = [
  ...heroTemplates,
  ...featureTemplates,
  ...testimonialTemplates,
  ...statsTemplates,
  timelineTemplate,
  ...galleryTemplates,
  ...textRevealTemplates,
  videoTemplate,
  ...ctaTemplates,
  aboutTemplate,
  comparisonTemplate
];

// =====================================================
// EXPORTED FUNCTIONS
// =====================================================

/**
 * Get all system templates
 * @returns Array of all available templates
 */
export function getSystemTemplates(): SystemTemplate[] {
  return systemTemplates;
}

/**
 * Get a specific template by ID
 * @param id Template ID to find
 * @returns Template if found, undefined otherwise
 */
export function getTemplateById(id: string): SystemTemplate | undefined {
  return systemTemplates.find(template => template.id === id);
}

/**
 * Get templates filtered by category
 * @param category Category to filter by
 * @returns Array of templates matching the category
 */
export function getTemplatesByCategory(category: SystemTemplate['category']): SystemTemplate[] {
  return systemTemplates.filter(template => template.category === category);
}

/**
 * Get templates filtered by tags
 * @param tags Array of tags to match (OR operation)
 * @returns Array of templates containing any of the specified tags
 */
export function getTemplatesByTags(tags: string[]): SystemTemplate[] {
  return systemTemplates.filter(template => 
    template.tags.some(tag => tags.includes(tag))
  );
}

/**
 * Get template recommendations based on content type
 * @param contentType Type of content (e.g., "portfolio", "landing", "corporate")
 * @returns Array of recommended templates
 */
export function getRecommendedTemplates(contentType: string): SystemTemplate[] {
  const recommendations: Record<string, string[]> = {
    portfolio: ["hero", "gallery", "about", "testimonial", "cta"],
    landing: ["hero", "features", "stats", "testimonial", "cta"],
    corporate: ["hero", "about", "timeline", "testimonial", "cta"],
    product: ["hero", "features", "comparison", "testimonial", "cta"],
    blog: ["text", "quote", "gallery", "cta"],
  };
  
  const recommendedCategories = recommendations[contentType] || ["hero", "text", "cta"];
  
  return systemTemplates.filter(template => 
    recommendedCategories.includes(template.category)
  );
}

/**
 * Get a random template from a specific category
 * @param category Optional category to filter by
 * @returns Random template
 */
export function getRandomTemplate(category?: SystemTemplate['category']): SystemTemplate {
  const pool = category 
    ? getTemplatesByCategory(category) 
    : systemTemplates;
  
  return pool[Math.floor(Math.random() * pool.length)];
}

// Export the templates array for direct access if needed
export { systemTemplates };

// Export type for use in other modules
export type { SceneConfig, DirectorConfig };