import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

interface AnimatedCounterProps {
  value: string;
  className?: string;
  duration?: number;
}

export function AnimatedCounter({ value, className = "", duration = 1.5 }: AnimatedCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    if (!isInView) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      setDisplayValue(value);
      return;
    }

    const hasPercentage = value.includes('%');
    const hasPlus = value.includes('+');
    const hasX = value.includes('x');
    const hasZero = value.toLowerCase() === 'zero';
    const hasRange = value.includes('-') && hasX;

    if (hasZero) {
      setDisplayValue(value);
      return;
    }

    // Parse the value to extract numeric parts
    let firstNum = 0;
    let secondNum = 0;

    if (hasRange) {
      const parts = value.split('-');
      firstNum = parseInt(parts[0]);
      secondNum = parseInt(parts[1].replace(/[^0-9]/g, ''));
      
      if (isNaN(firstNum) || isNaN(secondNum)) {
        setDisplayValue(value);
        return;
      }
    } else {
      firstNum = parseInt(value.replace(/[^0-9]/g, ''));
      if (isNaN(firstNum)) {
        setDisplayValue(value);
        return;
      }
    }

    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      let formatted = '';
      
      if (hasRange) {
        const currentFirst = Math.floor(easeOutQuart * firstNum);
        const currentSecond = Math.floor(easeOutQuart * secondNum);
        formatted = `${currentFirst}-${currentSecond}x`;
      } else if (hasX) {
        const currentValue = Math.floor(easeOutQuart * firstNum);
        formatted = `${currentValue}x`;
      } else if (hasPercentage) {
        const currentValue = Math.floor(easeOutQuart * firstNum);
        formatted = `${currentValue}%`;
      } else {
        const currentValue = Math.floor(easeOutQuart * firstNum);
        formatted = currentValue.toString();
      }
      
      if (hasPlus && progress === 1) {
        formatted += '+';
      }

      setDisplayValue(formatted);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    animate();
  }, [isInView, value, duration]);

  return (
    <div ref={ref} className={className}>
      {displayValue}
    </div>
  );
}
