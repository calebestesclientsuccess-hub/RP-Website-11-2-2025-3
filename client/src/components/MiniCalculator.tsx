import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";

export function MiniCalculator() {
  const [acv, setAcv] = useState([50000]);
  const [closeRate, setCloseRate] = useState([30]);
  const [displayedLine1, setDisplayedLine1] = useState("");
  const [displayedLine2, setDisplayedLine2] = useState("");
  const [isGlowing, setIsGlowing] = useState(false);
  
  const line1Text = "240 Qualified Meetings";
  const line2Text = "(and they actually show up)";

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      // Show final text immediately for users who prefer reduced motion
      setDisplayedLine1(line1Text);
      setDisplayedLine2(line2Text);
      setIsGlowing(true);
      return;
    }

    let typingInterval: NodeJS.Timeout | null = null;
    const startDelay = setTimeout(() => {
      let currentIndex = 0;
      const totalLength = line1Text.length + line2Text.length;
      
      typingInterval = setInterval(() => {
        if (currentIndex <= totalLength) {
          if (currentIndex <= line1Text.length) {
            setDisplayedLine1(line1Text.slice(0, currentIndex));
          } else {
            setDisplayedLine1(line1Text);
            setDisplayedLine2(line2Text.slice(0, currentIndex - line1Text.length));
          }
          currentIndex++;
        } else {
          if (typingInterval) clearInterval(typingInterval);
          setIsGlowing(true);
        }
      }, 50);
    }, 800);

    return () => {
      clearTimeout(startDelay);
      if (typingInterval) clearInterval(typingInterval);
    };
  }, []);

  const appointmentsPerYear = 20 * 12; // 20 per month * 12 months
  const potentialRevenue = Math.round(
    (appointmentsPerYear * (closeRate[0] / 100) * acv[0])
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl md:text-2xl font-semibold text-center tracking-wide" data-testid="text-calculator-title">
        <div>{displayedLine1}</div>
        <div>
          {displayedLine2}
          {(!displayedLine2 || displayedLine2.length < line2Text.length) && (
            <span className="animate-pulse">|</span>
          )}
        </div>
      </h3>
      <Card className={`p-6 md:p-8 bg-card/50 backdrop-blur-sm border-2 shadow-lg transition-all duration-1000 ${
        isGlowing 
          ? 'border-primary shadow-[0_0_30px_rgba(239,35,60,0.5)] animate-pulse-glow' 
          : 'border-primary/20'
      }`}>
        <div className="space-y-6">
          {/* ACV Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-foreground">
                Average Revenue Per New Client (annually)
              </label>
              <span className="text-lg font-bold text-primary font-mono" data-testid="text-acv-value">
                {formatCurrency(acv[0])}
              </span>
            </div>
            <Slider
              value={acv}
              onValueChange={setAcv}
              min={10000}
              max={500000}
              step={5000}
              className="w-full slider-glow"
              data-testid="input-acv-slider"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>$10k</span>
              <span>$500k</span>
            </div>
          </div>

          {/* Close Rate Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-foreground">
                Average Close Rate from Qualified Appointment
              </label>
              <span className="text-lg font-bold text-primary font-mono" data-testid="text-close-rate-value">
                {closeRate[0]}%
              </span>
            </div>
            <Slider
              value={closeRate}
              onValueChange={setCloseRate}
              min={5}
              max={100}
              step={5}
              className="w-full slider-glow"
              data-testid="input-close-rate-slider"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Output */}
          <div className="pt-6 border-t border-border">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Potential New Revenue This Year
              </p>
              <p className="text-4xl md:text-5xl font-bold text-primary font-mono tracking-tight" data-testid="text-potential-revenue">
                {formatCurrency(potentialRevenue)}
              </p>
              <p className="text-xs text-muted-foreground">
                Based on 20 qualified appointments per month
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
