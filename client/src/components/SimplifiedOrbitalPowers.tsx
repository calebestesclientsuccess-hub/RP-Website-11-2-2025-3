import { useEffect, useRef, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Target, Settings, Users, Wrench, Trophy, ChevronLeft, ChevronRight, Play, Zap } from "lucide-react";
import { gsap } from 'gsap';
import { prefersReducedMotion } from "@/lib/animationConfig";
import { cn } from "@/lib/utils";

// Add CSS keyframes for smooth transitions and cinematic effects
const cinematicKeyframes = `
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes cinematicPulse {
  0%, 100% {
    transform: scale(1) translateZ(0);
    box-shadow: 
      0 0 20px rgba(255, 255, 255, 0.4),
      0 0 40px rgba(255, 255, 255, 0.2),
      0 0 60px rgba(255, 255, 255, 0.1);
  }
  25% {
    transform: scale(1.08) translateZ(0);
    box-shadow: 
      0 0 30px rgba(255, 255, 255, 0.6),
      0 0 60px rgba(255, 255, 255, 0.4),
      0 0 90px rgba(255, 255, 255, 0.2);
  }
  50% {
    transform: scale(1.12) translateZ(0);
    box-shadow: 
      0 0 40px rgba(255, 255, 255, 0.8),
      0 0 80px rgba(255, 255, 255, 0.5),
      0 0 120px rgba(255, 255, 255, 0.3);
  }
  75% {
    transform: scale(1.08) translateZ(0);
    box-shadow: 
      0 0 30px rgba(255, 255, 255, 0.6),
      0 0 60px rgba(255, 255, 255, 0.4),
      0 0 90px rgba(255, 255, 255, 0.2);
  }
}

@keyframes spotlightGlow {
  0%, 100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.9;
  }
}

@keyframes orbital-badge-pre-pulse {
  0% {
    transform: scale(1);
    filter: brightness(1);
  }
  50% {
    transform: scale(1.15);
    filter: brightness(1.3);
  }
  100% {
    transform: scale(1.12);
    filter: brightness(1.2);
  }
}

@keyframes orbital-badge-pulse {
  0%, 100% {
    transform: scale(1.12);
    filter: brightness(1.15);
  }
  50% {
    transform: scale(1.18);
    filter: brightness(1.25);
  }
}

.cinematic-highlight {
  animation: cinematicPulse 1.5s ease-in-out infinite;
  position: relative;
  z-index: 50;
}

.cinematic-highlight::before {
  content: '';
  position: absolute;
  inset: -20px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
  animation: spotlightGlow 1.5s ease-in-out infinite;
  pointer-events: none;
}
`;

interface Power {
  id: string;
  title: string;
  icon: JSX.Element;
  color: string;
  glowColor: string;
  bgColor: string;
  angle: number;
  description: string;
  details: string[];
  content: {
    whatItIs: string;
    value: string;
    inHouseCost: string;
  };
}

const powers: Power[] = [
  {
    id: "ai-architect",
    title: "AI Architect",
    icon: <Brain className="w-6 h-6" style={{ color: '#5E4DB8' }} />,
    color: "text-violet-blue",
    glowColor: "rgba(94, 77, 184, 0.4)",
    bgColor: "94, 77, 184",
    angle: 0,
    description: "Intelligent systems that research, personalize, and optimize at scale.",
    details: [
      "AI-powered prospect research",
      "Automated personalization engine",
      "Message optimization & A/B testing"
    ],
    content: {
      whatItIs: "An advanced AI-powered system that automates prospect research, message personalization, and campaign optimization using machine learning algorithms.",
      value: "Increases response rates by 3x through hyper-personalization at scale, saving 15+ hours per week on manual research and writing.",
      inHouseCost: "$180,000/yr (AI engineer) + $50,000/yr (tools & infrastructure)"
    }
  },
  {
    id: "gtm-strategist",
    title: "GTM Strategist",
    icon: <Target className="w-6 h-6" style={{ color: '#ef233c' }} />,
    color: "text-primary",
    glowColor: "rgba(239, 35, 60, 0.4)",
    bgColor: "239, 35, 60",
    angle: 60,
    description: "Expert strategists who design and refine your entire revenue playbook.",
    details: [
      "ICP & persona development",
      "Messaging & positioning strategy",
      "Multi-channel campaign design"
    ],
    content: {
      whatItIs: "Senior GTM experts with 10+ years experience designing and executing revenue strategies for B2B SaaS companies from Series A to IPO.",
      value: "Reduces time to product-market fit by 6-12 months. Increases pipeline velocity by 40% through proven frameworks.",
      inHouseCost: "$250,000/yr (VP of Marketing) + $150,000/yr (Strategy Consultant)"
    }
  },
  {
    id: "revops",
    title: "RevOps",
    icon: <Settings className="w-6 h-6" style={{ color: '#D25A28' }} />,
    color: "text-burnt-orange",
    glowColor: "rgba(210, 90, 40, 0.4)",
    bgColor: "210, 90, 40",
    angle: 120,
    description: "Full revenue operations management ensuring seamless system performance.",
    details: [
      "CRM & tool optimization",
      "Data hygiene & reporting",
      "Process automation & workflows"
    ],
    content: {
      whatItIs: "Complete revenue operations management including CRM optimization, data orchestration, and process automation across all GTM systems.",
      value: "Eliminates 20+ hours/week of manual tasks, improves data accuracy to 99%, and provides real-time performance visibility.",
      inHouseCost: "$140,000/yr (RevOps Manager) + $30,000/yr (tools & integrations)"
    }
  },
  {
    id: "coach",
    title: "Elite Coach",
    icon: <Users className="w-6 h-6" style={{ color: '#9F8FFF' }} />,
    color: "text-community",
    glowColor: "rgba(159, 143, 255, 0.4)",
    bgColor: "159, 143, 255",
    angle: 180,
    description: "World-class coaching that elevates your BDRs to top 1% performance.",
    details: [
      "Daily skill development",
      "Real-time call coaching",
      "Performance analytics & feedback"
    ],
    content: {
      whatItIs: "Elite sales coaches who've trained top 1% BDRs at companies like Salesforce, MongoDB, and Snowflake, providing daily 1:1 and group coaching.",
      value: "Accelerates ramp time from 3 months to 3 weeks. Increases meeting conversion rates by 2.5x through proven methodologies.",
      inHouseCost: "$175,000/yr (Sales Enablement Manager) + $60,000/yr (training programs)"
    }
  },
  {
    id: "tools",
    title: "Tech Stack",
    icon: <Wrench className="w-6 h-6" style={{ color: '#4CAF50' }} />,
    color: "text-signal-green",
    glowColor: "rgba(76, 175, 80, 0.4)",
    bgColor: "76, 175, 80",
    angle: 240,
    description: "Best-in-class tools integrated and optimized for maximum efficiency.",
    details: [
      "Multi-channel outreach platform",
      "Intent data & enrichment",
      "Advanced analytics dashboard"
    ],
    content: {
      whatItIs: "Pre-integrated stack of 15+ enterprise tools including Outreach, ZoomInfo, 6sense, Gong, and custom automation platforms.",
      value: "Saves $200,000+ in annual tool costs through volume licensing. Eliminates 3-month implementation timeline.",
      inHouseCost: "$120,000/yr (tools) + $50,000 (implementation) + $30,000/yr (maintenance)"
    }
  },
  {
    id: "community",
    title: "Community & Competition",
    icon: <Trophy className="w-6 h-6" style={{ color: '#C41E58' }} />,
    color: "text-magenta-rose",
    glowColor: "rgba(196, 30, 88, 0.4)",
    bgColor: "196, 30, 88",
    angle: 300,
    description: "A culture of collaboration and healthy competition that drives results.",
    details: [
      "Peer learning & knowledge sharing",
      "Gamified performance tracking",
      "Team challenges & rewards"
    ],
    content: {
      whatItIs: "Private community of 500+ elite BDRs sharing tactics, templates, and strategies with gamified challenges and monthly competitions.",
      value: "Increases team performance by 35% through peer learning. Reduces turnover by 50% through engagement and culture.",
      inHouseCost: "$100,000/yr (Community Manager) + $50,000/yr (platform & rewards)"
    }
  }
];

interface SimplifiedOrbitalPowersProps {
  videoSrc: string;
  videoRef: React.RefObject<HTMLVideoElement>;
}

/**
 * SimplifiedOrbitalPowers: Interactive orbital badges with engagement features
 */
import VideoSchema from "@/components/VideoSchema";

export function SimplifiedOrbitalPowers({ videoSrc, videoRef }: SimplifiedOrbitalPowersProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const badgeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(2);
  const [showInfoBox, setShowInfoBox] = useState(true); // Show by default - don't depend on autoplay
  const [hasPlayed, setHasPlayed] = useState(false);
  const [initialPulse, setInitialPulse] = useState(true);
  const orbitAnimationRef = useRef<gsap.core.Tween | null>(null);
  const [orbitRotation, setOrbitRotation] = useState(0);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [hoveredPower, setHoveredPower] = useState<string | null>(null);
  const [currentPower, setCurrentPower] = useState<string | null>(null);
  const [playbackMode, setPlaybackMode] = useState<'rotating' | 'decelerating' | 'autoTour' | 'manual'>('rotating');
  const tourIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [videoEnded, setVideoEnded] = useState(false);
  const [prePulseActive, setPrePulseActive] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(180); // Default to left position
  const [preVideoPhase, setPreVideoPhase] = useState<'rotating' | 'decelerating' | 'highlighting' | 'ready'>('rotating');
  const [highlightedIconIndex, setHighlightedIconIndex] = useState<number | null>(null);
  const [cinematicReady, setCinematicReady] = useState(false);
  const preVideoTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const autoTourTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const decelerationTweenRef = useRef<gsap.core.Tween | null>(null);
  const orbitRotationRef = useRef(0);
  const selectedPositionRef = useRef(180);

  // Sync refs with state for stable event handler access
  useEffect(() => {
    orbitRotationRef.current = orbitRotation;
  }, [orbitRotation]);

  useEffect(() => {
    selectedPositionRef.current = selectedPosition;
  }, [selectedPosition]);

  // Calculate responsive selection position based on viewport
  useEffect(() => {
    const updateSelectionPosition = () => {
      const isMobile = window.innerWidth < 768;

      if (isMobile) {
        // Mobile: bottom-left (240°) for optimal visibility - 8 o'clock position
        // This aligns with the pre-video sequence and makes icon-to-text correlation clear
        setSelectedPosition(240);
      } else {
        // Desktop/Tablet: left side (180°) - 9 o'clock position
        setSelectedPosition(180);
      }
    };

    updateSelectionPosition();
    window.addEventListener('resize', updateSelectionPosition);
    return () => window.removeEventListener('resize', updateSelectionPosition);
  }, []);

  // Orbital rotation animation - starts when section enters viewport
  useEffect(() => {
    if (prefersReducedMotion() || preVideoPhase !== 'rotating') return;

    const rotationObj = { value: orbitRotation };

    // Faster initial rotation for more dynamic entry (45 seconds per rotation)
    // This will slow down dramatically before video starts
    orbitAnimationRef.current = gsap.to(rotationObj, {
      value: orbitRotation + 360,
      duration: 45,
      ease: "none",
      repeat: -1,
      onUpdate: () => {
        setOrbitRotation(rotationObj.value % 360);
      }
    });

    return () => {
      orbitAnimationRef.current?.kill();
    };
  }, [preVideoPhase]);

  // Handle video end and start deceleration - stable listener with ref-based state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleVideoEnd = () => {
      setVideoEnded(true);
      setPlaybackMode('decelerating');

      if (prefersReducedMotion()) {
        // Skip deceleration, go straight to auto-tour
        setPlaybackMode('autoTour');
        return;
      }

      // Kill the continuous rotation
      if (orbitAnimationRef.current) {
        orbitAnimationRef.current.kill();
      }

      // Kill any existing deceleration tween
      if (decelerationTweenRef.current) {
        decelerationTweenRef.current.kill();
        decelerationTweenRef.current = null;
      }

      // Read current state from refs for stable access
      const currentRotation = orbitRotationRef.current % 360;
      const selectedPos = selectedPositionRef.current;

      // Find which power is currently closest to selected position (responsive)
      let nearestPowerIndex = 0;
      let minDistance = 360;

      powers.forEach((power, idx) => {
        const totalAngle = (power.angle + currentRotation) % 360;
        const distance = Math.abs(totalAngle - selectedPos);
        const wrappedDistance = Math.min(distance, 360 - distance);
        if (wrappedDistance < minDistance) {
          minDistance = wrappedDistance;
          nearestPowerIndex = idx;
        }
      });

      // Always move FORWARD - if we're past the nearest, go to the NEXT one
      const nearestPowerAngle = powers[nearestPowerIndex].angle;
      const nearestTotalAngle = (nearestPowerAngle + currentRotation) % 360;

      let targetPowerIndex = nearestPowerIndex;

      // If nearest power is behind us, move to next power forward
      if (nearestTotalAngle > selectedPos) {
        targetPowerIndex = (nearestPowerIndex + 1) % powers.length;
      }

      // Calculate target rotation using responsive selection position
      const targetPowerAngle = powers[targetPowerIndex].angle;
      let targetRotation = selectedPos - targetPowerAngle;

      // Normalize target rotation
      while (targetRotation < 0) targetRotation += 360;
      while (targetRotation >= 360) targetRotation -= 360;

      // Calculate clockwise-only rotation
      let rotationDiff = targetRotation - currentRotation;
      if (rotationDiff < 0) rotationDiff += 360;

      // Create and store deceleration tween
      decelerationTweenRef.current = gsap.to({ value: 0 }, {
        value: 1,
        duration: 3, // Full 3 seconds for smooth deceleration
        ease: "power3.out",
        onUpdate: function() {
          const progress = this.progress();
          const easedProgress = gsap.parseEase("power3.out")(progress);
          const newRotation = (currentRotation + rotationDiff * easedProgress) % 360;
          setOrbitRotation(newRotation < 0 ? newRotation + 360 : newRotation);
        },
        onComplete: () => {
          setOrbitRotation(targetRotation);
          setSelectedIndex(targetPowerIndex);

          // Wait 1 second before starting auto-tour
          setTimeout(() => {
            setPlaybackMode('autoTour');
          }, 1000);
        }
      });
    };

    video.addEventListener('ended', handleVideoEnd);

    return () => {
      video.removeEventListener('ended', handleVideoEnd);
      // Kill deceleration tween on cleanup
      if (decelerationTweenRef.current) {
        decelerationTweenRef.current.kill();
        decelerationTweenRef.current = null;
      }
    };
  }, [videoRef]);

  // Auto-tour system - rotate through powers with CINEMATIC transitions
  useEffect(() => {
    if (playbackMode !== 'autoTour') {
      // Clear any existing interval
      if (tourIntervalRef.current) {
        clearInterval(tourIntervalRef.current);
        tourIntervalRef.current = null;
      }
      setIsAnimating(false);
      setPrePulseActive(false);
      return;
    }

    if (prefersReducedMotion()) return;

    // CINEMATIC TIMING: Slower, more deliberate pacing
    const ANTICIPATION_DURATION = 400; // Wind-up before rotation (new!)
    const ROTATION_DURATION = 1800; // Slightly faster rotation (was 2000)
    const OVERSHOOT_DURATION = 350; // Subtle overshoot + settle (new!)
    const PAUSE_DURATION = 6000; // Longer contemplation (was 4500) - let it breathe
    const PRE_PULSE_DURATION = 1200; // Longer pre-pulse for emphasis (was 1000)
    const DRAMATIC_BEAT = 180; // Tighter beat (was 250) - tension before release
    const TOTAL_CYCLE = PRE_PULSE_DURATION + DRAMATIC_BEAT + ANTICIPATION_DURATION + ROTATION_DURATION + OVERSHOOT_DURATION + PAUSE_DURATION;

    const performTransition = (currentIndex: number) => {
      setIsAnimating(true);

      const nextIndex = (currentIndex + 1) % powers.length;

      const currentRotation = orbitRotation;
      
      // Calculate rotation to position next badge at selectedPosition
      // This ensures consistent anchoring across all phases (240° mobile, 180° desktop)
      const nextPowerAngle = powers[nextIndex].angle;
      let targetRotation = selectedPosition - nextPowerAngle;
      
      // Normalize target rotation
      while (targetRotation < 0) targetRotation += 360;
      while (targetRotation >= 360) targetRotation -= 360;
      
      // Calculate clockwise rotation increment
      let rotationIncrement = targetRotation - currentRotation;
      if (rotationIncrement < 0) rotationIncrement += 360;

      // Start pre-pulse on the NEXT badge
      setPrePulseActive(true);

      // Kill any existing timeline before creating a new one
      if (autoTourTimelineRef.current) {
        autoTourTimelineRef.current.kill();
      }
      
      // CINEMATIC TIMELINE with anticipation & overshoot
      const timeline = gsap.timeline({
        onComplete: () => {
          setOrbitRotation(targetRotation);
          setSelectedIndex(nextIndex); // Update index only after animation completes
          setPrePulseActive(false);
          setIsAnimating(false);
        }
      });
      
      // Store timeline for cleanup
      autoTourTimelineRef.current = timeline;

      // Pre-pulse (building tension)
      timeline.to({}, { duration: PRE_PULSE_DURATION / 1000 });

      // Dramatic beat (the held breath)
      timeline.to({}, { duration: DRAMATIC_BEAT / 1000 });

      // ANTICIPATION: Subtle counter-rotation (wind-up)
      timeline.to(
        { value: 0 },
        {
          value: 1,
          duration: ANTICIPATION_DURATION / 1000,
          ease: "power2.in", // Accelerate into the wind-up
          onUpdate: function() {
            const progress = this.progress();
            // Counter-rotate 3° backward (like pulling back a slingshot)
            const anticipationRotation = currentRotation - (3 * progress);
            setOrbitRotation(anticipationRotation < 0 ? anticipationRotation + 360 : anticipationRotation);
          }
        }
      );

      // MAIN ROTATION: Fast acceleration, smooth deceleration
      timeline.to(
        { value: 0 },
        {
          value: 1,
          duration: ROTATION_DURATION / 1000,
          ease: "power2.out", // Disney-style ease
          onUpdate: function() {
            const progress = this.progress();
            // Rotate from anticipation point (currentRotation - 3°) to target
            const newRotation = (currentRotation - 3 + (rotationIncrement + 3) * progress) % 360;
            setOrbitRotation(newRotation < 0 ? newRotation + 360 : newRotation);
          }
        }
      );

      // OVERSHOOT & SETTLE: Slight overshoot then elastic settle
      timeline.to(
        { value: 0 },
        {
          value: 1,
          duration: OVERSHOOT_DURATION / 1000,
          ease: "elastic.out(1, 0.5)", // Subtle elastic settle
          onUpdate: function() {
            const progress = this.progress();
            // Overshoot by 2° then settle back
            const overshoot = 2 * (1 - progress);
            const settleRotation = (targetRotation + overshoot) % 360;
            setOrbitRotation(settleRotation < 0 ? settleRotation + 360 : settleRotation);
          }
        }
      );
    };

    // Track the current index in closure
    let currentTourIndex = selectedIndex;

    const runTransition = () => {
      performTransition(currentTourIndex);
      currentTourIndex = (currentTourIndex + 1) % powers.length;
    };

    // LONGER initial pause - let viewers discover the interface
    const INITIAL_PAUSE = 7500; // 7.5 seconds (was 5.5)
    const initialTimeout = setTimeout(() => {
      runTransition();
      // Start interval only AFTER the initial transition completes
      tourIntervalRef.current = setInterval(runTransition, TOTAL_CYCLE);
    }, INITIAL_PAUSE);

    return () => {
      clearTimeout(initialTimeout);
      if (tourIntervalRef.current) {
        clearInterval(tourIntervalRef.current);
        tourIntervalRef.current = null;
      }
      // Kill the active auto-tour timeline
      if (autoTourTimelineRef.current) {
        autoTourTimelineRef.current.kill();
        autoTourTimelineRef.current = null;
      }
      setIsAnimating(false);
      setPrePulseActive(false);
    };
  }, [playbackMode, selectedIndex, selectedPosition, powers]);

  // Manual play handler for when autoplay is blocked
  const handleManualPlay = () => {
    const video = videoRef.current;
    if (!video) return;

    video.play()
      .then(() => {
        setHasPlayed(true);
        setShowPlayButton(false);
        setTimeout(() => setShowInfoBox(true), 1000);
        setTimeout(() => setInitialPulse(false), 3000);
      })
      .catch((error) => {
        console.error('Manual play failed:', error);
      });
  };

  // Cinematic pre-video sequence orchestration
  const executePreVideoSequence = useCallback(() => {
    if (prefersReducedMotion()) {
      // Skip cinematic sequence for reduced motion preference
      const video = videoRef.current;
      if (video) {
        video.play().catch(() => setShowPlayButton(true));
      }
      return;
    }

    // Create a cinematic timeline
    const timeline = gsap.timeline();

    // Phase 1: Deceleration (3 seconds)
    setPreVideoPhase('decelerating');

    // Kill the continuous rotation
    if (orbitAnimationRef.current) {
      orbitAnimationRef.current.kill();
    }

    const currentRotation = orbitRotation;

    // Find the bottom-left icon position for initial highlighting
    // Mobile: 240° (8 o'clock) - easier to see for mobile users
    // Desktop: 225° (7:30 position) - elegant side position
    const bottomLeftAngle = window.innerWidth < 768 ? 240 : 225;

    // Find which power should be at bottom-left using closest match
    let targetPowerIndex = 0;
    let minDistance = 360;
    
    powers.forEach((power, idx) => {
      const totalAngle = (power.angle + currentRotation) % 360;
      const distance = Math.abs(totalAngle - bottomLeftAngle);
      // Handle wraparound (e.g., 350° is close to 10°)
      const wrappedDistance = Math.min(distance, 360 - distance);
      
      if (wrappedDistance < minDistance) {
        minDistance = wrappedDistance;
        targetPowerIndex = idx;
      }
    });

    // Calculate rotation to position target power at bottom-left
    const targetPowerAngle = powers[targetPowerIndex].angle;
    let targetRotation = bottomLeftAngle - targetPowerAngle;
    while (targetRotation < 0) targetRotation += 360;
    while (targetRotation >= 360) targetRotation -= 360;

    // Smooth deceleration to bottom-left position
    timeline.to({ value: currentRotation }, {
      value: targetRotation,
      duration: 3,
      ease: "power3.out",
      onUpdate: function() {
        const progress = this.progress();
        const newRotation = currentRotation + (targetRotation - currentRotation) * progress;
        setOrbitRotation(newRotation % 360);
      }
    });

    // Phase 2: Highlighting (1.5 seconds)
    timeline.call(() => {
      setPreVideoPhase('highlighting');
      setHighlightedIconIndex(targetPowerIndex);
      setPrePulseActive(true);
    });

    timeline.to({}, { duration: 1.5 }); // Hold for pulsating effect

    // Phase 3: Dramatic 360° rotation to bottom-center (2.5 seconds)
    timeline.call(() => {
      setPrePulseActive(false);
    });

    // Use responsive selectedPosition for final anchor position
    // This ensures alignment with the rest of the system (240° mobile, 180° desktop)
    let finalRotation = selectedPosition - targetPowerAngle;

    // Ensure we do almost a full 360° rotation
    if (Math.abs(finalRotation - targetRotation) < 300) {
      finalRotation += 360;
    }

    timeline.to({ value: targetRotation }, {
      value: finalRotation,
      duration: 2.5,
      ease: "power2.inOut",
      onUpdate: function() {
        const progress = this.progress();
        const newRotation = targetRotation + (finalRotation - targetRotation) * progress;
        setOrbitRotation(newRotation % 360);

        // Update selected index when reaching destination
        if (progress > 0.8) {
          setSelectedIndex(targetPowerIndex);
        }
      }
    });

    // Phase 4: Ready and play video
    timeline.call(() => {
      setPreVideoPhase('ready');
      setCinematicReady(true);
      setHighlightedIconIndex(null);

      // Now play the video
      const video = videoRef.current;
      if (video) {
        video.play()
          .then(() => {
            setHasPlayed(true);
            setShowPlayButton(false);
            setVideoError(false);
            setTimeout(() => setShowInfoBox(true), 1000);
            setTimeout(() => setInitialPulse(false), 3000);
          })
          .catch((error) => {
            console.log('Video autoplay prevented:', error);
            setShowPlayButton(true);
          });
      }
    });

    preVideoTimelineRef.current = timeline;
  }, [videoRef, orbitRotation, powers, selectedPosition]);

  // Video play and initial animations
  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;

    // Handle video errors
    const handleError = () => {
      console.error('Video load error:', video.error);
      setVideoError(true);
      setShowPlayButton(false);
    };

    video.addEventListener('error', handleError);

    const attemptPlay = () => {
      // Check for video errors first
      if (video.error) {
        handleError();
        return;
      }

      // Execute cinematic sequence instead of direct play
      executePreVideoSequence();
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasPlayed && !videoError) {
            // Start video immediately when section enters viewport
            attemptPlay();
          }
        });
      },
      { threshold: 0.1 } // Lower threshold for earlier trigger
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      video.removeEventListener('error', handleError);
      observer.disconnect();

      // Cleanup intervals
      if (tourIntervalRef.current) {
        clearInterval(tourIntervalRef.current);
      }
      
      // Cleanup pre-video timeline
      if (preVideoTimelineRef.current) {
        preVideoTimelineRef.current.kill();
        preVideoTimelineRef.current = null;
      }
    };
  }, [hasPlayed, videoError, videoRef, executePreVideoSequence, orbitRotation]);

  // Background color morphing
  useEffect(() => {
    if (!sectionRef.current || prefersReducedMotion()) return;

    const selectedPower = powers[selectedIndex];

    gsap.to(sectionRef.current, {
      background: `radial-gradient(ellipse at top, rgba(${selectedPower.bgColor}, 0.05) 0%, transparent 60%)`,
      duration: 1.2,
      ease: "power3.inOut",
    });
  }, [selectedIndex]);

  // Shared helper to stop ALL competing GSAP timelines
  const stopAllTimelines = () => {
    if (orbitAnimationRef.current) {
      orbitAnimationRef.current.kill();
      orbitAnimationRef.current = null;
    }
    if (autoTourTimelineRef.current) {
      autoTourTimelineRef.current.kill();
      autoTourTimelineRef.current = null;
    }
    if (decelerationTweenRef.current) {
      decelerationTweenRef.current.kill();
      decelerationTweenRef.current = null;
    }
    if (preVideoTimelineRef.current) {
      preVideoTimelineRef.current.kill();
      preVideoTimelineRef.current = null;
    }
    setIsAnimating(false);
    setPrePulseActive(false);
  };

  const handlePrevious = () => {
    stopAllTimelines(); // Kill all competing timelines
    
    const newIndex = (selectedIndex - 1 + powers.length) % powers.length;
    setSelectedIndex(newIndex);
    setInitialPulse(false);
    setCurrentPower(powers[newIndex].id);

    // User interaction cancels auto-tour
    if (playbackMode === 'autoTour') {
      setPlaybackMode('manual');
    }
  };

  const handleNext = () => {
    stopAllTimelines(); // Kill all competing timelines
    
    const newIndex = (selectedIndex + 1) % powers.length;
    setSelectedIndex(newIndex);
    setInitialPulse(false);
    setCurrentPower(powers[newIndex].id);

    // User interaction cancels auto-tour
    if (playbackMode === 'autoTour') {
      setPlaybackMode('manual');
    }
  };

  const handleBadgeClick = (index: number) => {
    stopAllTimelines(); // Kill all competing timelines
    
    setSelectedIndex(index);
    setShowInfoBox(true);
    setInitialPulse(false);
    setCurrentPower(powers[index].id);

    // User interaction cancels auto-tour
    if (playbackMode === 'autoTour') {
      setPlaybackMode('manual');
    }
  };

  const selectedPower = powers[selectedIndex] || powers[0];

  // Dummy variable for videoEl as it's not directly used in the provided original snippet's HTML structure
  // In a real scenario, this would be the actual video element or its container.
  const videoEl = (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{
        width: window.innerWidth < 768 ? 'min(85vw, 320px)' : 'min(90vw, 640px)',
        height: window.innerWidth < 768 ? 'min(35vh, 200px)' : 'min(50vh, 360px)',
        boxShadow: `
          0 0 0 2px rgba(192, 192, 192, 0.3),
          0 0 40px rgba(${selectedPower.bgColor}, 0.3),
          0 0 80px rgba(${selectedPower.bgColor}, 0.2),
          0 0 120px rgba(${selectedPower.bgColor}, 0.15),
          0 0 160px rgba(${selectedPower.bgColor}, 0.1)
        `
      }}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain bg-black"
        muted
        playsInline
        preload="auto"
        controls={false}
        data-testid="orbital-video"
      >
        <source src="/bdr-pod-video.webm" type="video/webm" />
        <source src={videoSrc} type="video/mp4" />
      </video>

      {/* Play button overlay for when autoplay is blocked */}
      {showPlayButton && !videoError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <Button
            size="lg"
            onClick={handleManualPlay}
            className="rounded-full w-20 h-20 shadow-2xl"
            data-testid="button-play-video"
          >
            <Play className="w-10 h-10" />
          </Button>
        </div>
      )}

      {/* Error message when video can't load */}
      {videoError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm p-8">
          <div className="text-center space-y-4">
            <div className="text-4xl">📹</div>
            <p className="text-white font-semibold">Video Unavailable</p>
            <p className="text-white/70 text-sm max-w-xs">
              The video could not be loaded. Please check back later or contact support.
            </p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <style>{cinematicKeyframes}</style>
      <VideoSchema
        name="Your Fullstack Sales Unit - GTM Engine in Action"
        description="Watch how Revenue Party's GTM Engine combines elite BDR pods with AI-powered systems to deliver guaranteed qualified appointments."
        thumbnailUrl="https://revenueparty.com/apple-touch-icon.png"
        uploadDate="2024-10-01"
        duration="PT2M"
        contentUrl={`https://revenueparty.com${videoSrc}`}
      />
      <div
      ref={sectionRef}
      className="transition-all duration-700"
      data-testid="section-orbital-powers"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-1">
            <span className="gradient-text gradient-hero">The Fullstack Sales Unit</span>
          </h2>
          <p className="text-2xl md:text-3xl italic max-w-3xl mx-auto mb-0">
            Elite Sales Talent, equipped and trained by RP Architects.
          </p>
        </div>

        {/* Main Container */}
        <div ref={containerRef} className="relative mx-auto -mt-6" style={{ maxWidth: '900px' }} data-playback-mode={playbackMode} data-selected-index={selectedIndex} data-selected-position={selectedPosition} data-testid="orbital-container">
          {/* Orbital Container - Adjusted height for mobile */}
          <div className="relative mx-auto h-[450px] md:h-[600px] flex items-center justify-center">

            {/* Central Video */}
            <div className="relative z-20">
              {videoEl}
            </div>

            {/* Orbital Badges */}
            <div className="orbital-badges-container absolute inset-0 pointer-events-none">
              {powers.map((power, index) => {
                // Responsive radius for better mobile positioning
                const isMobile = window.innerWidth < 768;
                const radius = isMobile ? 180 : 320; // Smaller radius on mobile
                const totalAngle = power.angle + orbitRotation;
                const angleRad = (totalAngle * Math.PI) / 180;
                const x = Math.cos(angleRad) * radius;
                // Adjust vertical scaling for mobile to ensure bottom positioning
                const yScale = isMobile ? 0.8 : 0.6; // More vertical on mobile
                const y = Math.sin(angleRad) * radius * yScale;

                // Determine if this badge is at the selected position (responsive based on viewport)
                const normalizedAngle = totalAngle % 360;
                // Relaxed threshold to prevent flickering during overshoot/settle (8°)
                const isAtSelectedPosition = !isAnimating && Math.abs(normalizedAngle - selectedPosition) < 8;

                // Determine if this is the NEXT badge (the one about to be selected)
                const nextIndex = (selectedIndex + 1) % powers.length;
                const isNextBadge = index === nextIndex;

                // Pulse logic: exactly one badge pulses at all times
                // During animation: pre-pulse on next badge
                // During pause: sustained pulse on current selected badge
                // Disabled during pre-video phase (cinematic-highlight takes priority)
                const isCinematicPhase = preVideoPhase !== 'ready' && preVideoPhase !== 'rotating';
                const showPrePulse = !isCinematicPhase && isNextBadge && prePulseActive && isAnimating;
                const showSustainedPulse = !isCinematicPhase && index === selectedIndex && !isAnimating;

                return (
                  <div
                    key={power.id}
                    ref={el => badgeRefs.current[index] = el}
                    className="absolute left-1/2 top-1/2 pointer-events-auto"
                    style={{
                      transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                      zIndex: 30
                    }}
                  >
                    <button
                      onClick={() => handleBadgeClick(index)}
                      className="group cursor-pointer relative"
                      data-testid={`power-badge-${power.id}`}
                      onMouseEnter={() => setHoveredPower(power.id)}
                      onMouseLeave={() => setHoveredPower(null)}
                      style={{
                        transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' // Bouncy hover
                      }}
                    >
                      <div
                        className={cn(
                          `
                          relative rounded-full p-3 bg-background/90 backdrop-blur-sm
                          border-2 ${power.color} shadow-lg
                          group-hover:shadow-2xl
                          ${isAtSelectedPosition ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}
                          ${highlightedIconIndex === index ? 'cinematic-highlight' : ''}
                        `,
                        )}
                        style={{
                          boxShadow: highlightedIconIndex === index
                            ? undefined // Let cinematic-highlight CSS handle it
                            : isAtSelectedPosition
                            ? `0 0 30px ${power.glowColor}, 0 0 60px ${power.glowColor}`
                            : `0 0 20px ${power.glowColor}`,
                          animation: highlightedIconIndex === index 
                            ? undefined // Let cinematic-highlight CSS handle it
                            : showPrePulse
                            ? 'orbital-badge-pre-pulse 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)' // Longer, bouncier
                            : showSustainedPulse
                            ? 'orbital-badge-pulse 4s cubic-bezier(0.4, 0, 0.2, 1) infinite' // Slower pulse
                            : 'none',
                          transform: hoveredPower === power.id 
                            ? 'scale(1.15) rotate(5deg)' // Slight rotation on hover
                            : highlightedIconIndex === index
                            ? undefined // Let cinematic-highlight CSS handle it
                            : isAtSelectedPosition 
                            ? 'scale(1.12)' 
                            : 'scale(1)',
                          transition: highlightedIconIndex === index ? undefined : 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                          willChange: (showPrePulse || showSustainedPulse || highlightedIconIndex === index) ? 'transform, filter' : 'auto',
                          backfaceVisibility: 'hidden',
                          WebkitBackfaceVisibility: 'hidden'
                        }}
                      >
                        {power.icon}
                      </div>

                      <div className={`
                        absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap
                        text-sm font-medium ${power.color}
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300
                      `}>
                        {power.title}
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Info Box */}
          {showInfoBox && (
            <Card className="-mt-16 p-6 bg-background/95 backdrop-blur-sm border-2" data-testid="power-info-box">
              <div 
                key={selectedPower.id}
                className="space-y-4"
                style={{
                  animation: 'fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${selectedPower.color}`}
                      style={{ backgroundColor: `${selectedPower.glowColor}20` }}
                    >
                      {selectedPower.icon}
                    </div>
                    <h3 className={`text-2xl font-bold ${selectedPower.color}`}>{selectedPower.title}</h3>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={handlePrevious}
                      className="hover:scale-110 transition-transform"
                      data-testid="button-previous-power"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={handleNext}
                      className="hover:scale-110 transition-transform"
                      data-testid="button-next-power"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                <p className="text-muted-foreground">{selectedPower.description}</p>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold mb-2">What It Is:</h4>
                    <p className="text-sm text-muted-foreground">{selectedPower.content.whatItIs}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">The Value:</h4>
                    <p className="text-sm text-muted-foreground">{selectedPower.content.value}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">In-House Cost:</h4>
                    <p className="text-sm text-muted-foreground">{selectedPower.content.inHouseCost}</p>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  </>
  );
}