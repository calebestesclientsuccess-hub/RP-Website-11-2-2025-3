
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Brain, Wrench, Users, Target, DollarSign, TrendingUp } from "lucide-react";

interface SimplifiedOrbitalPowersProps {
  videoSrc: string;
  videoRef: React.RefObject<HTMLVideoElement>;
}

export function SimplifiedOrbitalPowers({ videoSrc, videoRef }: SimplifiedOrbitalPowersProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedIcon, setSelectedIcon] = useState(0);
  const [orbitRotation, setOrbitRotation] = useState(0);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [hasVideoEnded, setHasVideoEnded] = useState(false);
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  const orbitAnimationRef = useRef<gsap.core.Tween | null>(null);
  const autoSwitchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const prefersReducedMotion = () => {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  };

  const icons = [
    { Icon: Brain, label: "AI Architect", color: "text-[#10b981]", bgColor: "bg-[#10b981]/10" },
    { Icon: Wrench, label: "Operating System", color: "text-orange-500", bgColor: "bg-orange-500/10" },
    { Icon: Users, label: "Elite SDRs", color: "text-blue-500", bgColor: "bg-blue-500/10" },
    { Icon: Target, label: "Signal Factory", color: "text-purple-500", bgColor: "bg-purple-500/10" },
    { Icon: DollarSign, label: "Revenue Architecture", color: "text-yellow-500", bgColor: "bg-yellow-500/10" },
    { Icon: TrendingUp, label: "GTM Leverage", color: "text-pink-500", bgColor: "bg-pink-500/10" },
  ];

  const startInitialRotation = () => {
    if (prefersReducedMotion() || animationComplete) {
      return;
    }

    if (orbitAnimationRef.current?.isActive()) {
      return;
    }

    if (orbitAnimationRef.current) {
      orbitAnimationRef.current.kill();
    }

    const rotationObj = { value: orbitRotation };

    orbitAnimationRef.current = gsap.to(rotationObj, {
      value: 720,
      duration: 12,
      ease: "none",
      onUpdate: () => {
        setOrbitRotation(rotationObj.value);
      },
      onComplete: () => {
        setAnimationComplete(true);
        setOrbitRotation(0);
      },
    });
  };

  useEffect(() => {
    if (prefersReducedMotion()) {
      setAnimationComplete(true);
      return;
    }

    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const initAnimation = () => {
      if (!mounted) return;
      
      if (!orbitAnimationRef.current || !orbitAnimationRef.current.isActive()) {
        startInitialRotation();
      }
    };

    timeoutId = setTimeout(initAnimation, 300);

    return () => {
      mounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (orbitAnimationRef.current) {
        orbitAnimationRef.current.kill();
        orbitAnimationRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleVideoEnd = () => {
      setHasVideoEnded(true);
    };

    video.addEventListener("ended", handleVideoEnd);

    return () => {
      video.removeEventListener("ended", handleVideoEnd);
    };
  }, [videoRef]);

  useEffect(() => {
    if (!hasVideoEnded || userHasInteracted || !animationComplete) return;

    const cycleIcons = () => {
      setSelectedIcon((prev) => (prev + 1) % icons.length);
      autoSwitchTimeoutRef.current = setTimeout(cycleIcons, 7500);
    };

    autoSwitchTimeoutRef.current = setTimeout(cycleIcons, 7500);

    return () => {
      if (autoSwitchTimeoutRef.current) {
        clearTimeout(autoSwitchTimeoutRef.current);
      }
    };
  }, [hasVideoEnded, userHasInteracted, animationComplete, icons.length]);

  const handleIconClick = (index: number) => {
    setUserHasInteracted(true);
    setSelectedIcon(index);
    
    if (autoSwitchTimeoutRef.current) {
      clearTimeout(autoSwitchTimeoutRef.current);
      autoSwitchTimeoutRef.current = null;
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black/5 dark:bg-white/5">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          muted
          playsInline
          preload="auto"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>

        {!animationComplete && (
          <div className="absolute inset-0 pointer-events-none">
            {icons.map((item, index) => {
              const { Icon, color } = item;
              const angle = (orbitRotation + (index * 360) / icons.length) * (Math.PI / 180);
              const radius = Math.min(containerRef.current?.offsetWidth || 400, 400) * 0.35;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;

              return (
                <div
                  key={index}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{
                    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                  }}
                >
                  <div className={`p-3 rounded-full bg-background/95 backdrop-blur-sm border-2 border-border shadow-lg ${color}`}>
                    <Icon className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {animationComplete && (
        <div className="mt-8 grid grid-cols-3 md:grid-cols-6 gap-4">
          {icons.map((item, index) => {
            const { Icon, label, color, bgColor } = item;
            const isSelected = selectedIcon === index;

            return (
              <button
                key={index}
                onClick={() => handleIconClick(index)}
                className={`group flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300 ${
                  isSelected
                    ? `${bgColor} scale-105 shadow-lg`
                    : "bg-background/50 hover:bg-background/80 opacity-60 hover:opacity-100"
                }`}
              >
                <div className={`${color} transition-transform duration-300 ${isSelected ? "orbital-badge-animation" : ""}`}>
                  <Icon className="w-8 h-8 md:w-10 md:h-10" />
                </div>
                <span className={`text-xs md:text-sm font-medium text-center ${color}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
