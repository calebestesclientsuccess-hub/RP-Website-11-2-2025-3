import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Sparkles, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface ProgressStep {
  id: number;
  message: string;
  duration: number;
}

interface StreamingProgressProps {
  steps?: ProgressStep[];
  onError?: (error: Error) => void;
  onComplete?: () => void;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
}

const defaultSteps: ProgressStep[] = [
  { id: 1, message: "Analyzing your content...", duration: 3000 },
  { id: 2, message: "Identifying key themes and narratives...", duration: 2500 },
  { id: 3, message: "Selecting perfect animation templates...", duration: 3000 },
  { id: 4, message: "Applying your brand personality...", duration: 2000 },
  { id: 5, message: "Crafting compelling copy...", duration: 2500 },
  { id: 6, message: "Optimizing scroll interactions...", duration: 2000 },
  { id: 7, message: "Finalizing your portfolio...", duration: 1500 }
];

const refinementMessages = [
  "Polishing animations...",
  "Fine-tuning transitions...",
  "Perfecting visual hierarchy...",
  "Optimizing performance...",
  "Adding finishing touches..."
];

export function StreamingProgress({
  steps = defaultSteps,
  onError,
  onComplete,
  isError = false,
  errorMessage,
  onRetry
}: StreamingProgressProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [displayMessage, setDisplayMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [refinementIndex, setRefinementIndex] = useState(0);
  const [showRefinement, setShowRefinement] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const typingRef = useRef<NodeJS.Timeout>();

  // Typewriter effect
  useEffect(() => {
    if (!isError && !isComplete) {
      const currentStep = showRefinement 
        ? { message: refinementMessages[refinementIndex] }
        : steps[currentStepIndex];

      if (!currentStep) return;

      setIsTyping(true);
      setDisplayMessage("");
      
      const message = currentStep.message;
      let charIndex = 0;

      const typeNextChar = () => {
        if (charIndex < message.length) {
          setDisplayMessage(message.slice(0, charIndex + 1));
          charIndex++;
          typingRef.current = setTimeout(typeNextChar, 30);
        } else {
          setIsTyping(false);
        }
      };

      typeNextChar();

      return () => {
        if (typingRef.current) {
          clearTimeout(typingRef.current);
        }
      };
    }
  }, [currentStepIndex, steps, refinementIndex, showRefinement, isError, isComplete]);

  // Progress through steps
  useEffect(() => {
    if (!isError && !isComplete && !showRefinement) {
      const currentStep = steps[currentStepIndex];
      if (!currentStep) return;

      timeoutRef.current = setTimeout(() => {
        // Mark current step as completed
        setCompletedSteps(prev => [...prev, currentStep.id]);

        if (currentStepIndex < steps.length - 1) {
          // Move to next step
          setCurrentStepIndex(currentStepIndex + 1);
        } else if (currentStepIndex === steps.length - 1) {
          // All steps completed, either complete or show refinement
          if (!onComplete) {
            // If no onComplete callback, loop through refinement messages
            setShowRefinement(true);
          } else {
            // Show completion animation then callback
            setIsComplete(true);
            setTimeout(() => {
              onComplete();
            }, 1500);
          }
        }
      }, currentStep.duration);

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, [currentStepIndex, steps, onComplete, isError, isComplete, showRefinement]);

  // Refinement message cycling
  useEffect(() => {
    if (showRefinement && !isError) {
      const cycleRefinement = () => {
        setRefinementIndex((prev) => (prev + 1) % refinementMessages.length);
      };

      const interval = setInterval(cycleRefinement, 2500);
      return () => clearInterval(interval);
    }
  }, [showRefinement, isError]);

  // Success celebration animation
  const celebrationVariants = {
    initial: { scale: 0, rotate: -180 },
    animate: { 
      scale: 1, 
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 10
      }
    },
    exit: { scale: 0, opacity: 0 }
  };

  // Animated dots
  const dotVariants = {
    initial: { opacity: 0.3 },
    animate: (i: number) => ({
      opacity: [0.3, 1, 0.3],
      scale: [1, 1.2, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        delay: i * 0.2,
        ease: "easeInOut"
      }
    })
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
    >
      <Card className={cn(
        "w-full max-w-lg p-8 shadow-2xl",
        isError && "border-destructive"
      )}>
        <AnimatePresence mode="wait">
          {isComplete ? (
            // Success state
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <motion.div
                variants={celebrationVariants}
                initial="initial"
                animate="animate"
                className="inline-flex items-center justify-center w-20 h-20 mb-4 bg-primary/10 rounded-full"
              >
                <Check className="w-10 h-10 text-primary" />
              </motion.div>
              <h3 className="text-2xl font-bold mb-2">Portfolio Ready!</h3>
              <p className="text-muted-foreground">
                Your stunning portfolio has been generated successfully
              </p>
            </motion.div>
          ) : isError ? (
            // Error state
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 mb-4 bg-destructive/10 rounded-full">
                <AlertCircle className="w-10 h-10 text-destructive" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Generation Failed</h3>
              <p className="text-muted-foreground mb-4">
                {errorMessage || "Something went wrong while generating your portfolio"}
              </p>
              {onRetry && (
                <Button onClick={onRetry} variant="default">
                  Try Again
                </Button>
              )}
            </motion.div>
          ) : (
            // Progress state
            <motion.div
              key="progress"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Header */}
              <div className="flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-primary mr-3" />
                <h2 className="text-2xl font-bold">Creating Your Portfolio</h2>
              </div>

              {/* Animated dots */}
              <div className="flex justify-center mb-8">
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    custom={i}
                    variants={dotVariants}
                    initial="initial"
                    animate="animate"
                    className="w-3 h-3 mx-1 bg-primary rounded-full"
                  />
                ))}
              </div>

              {/* Current message with typewriter effect */}
              <div className="mb-6 min-h-[2rem]">
                <p className="text-lg text-center font-medium">
                  {displayMessage}
                  {isTyping && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="inline-block w-0.5 h-5 ml-1 bg-primary"
                    />
                  )}
                </p>
              </div>

              {/* Completed steps */}
              <div className="space-y-2">
                {steps.map((step) => {
                  const isCompleted = completedSteps.includes(step.id);
                  const isCurrent = steps[currentStepIndex]?.id === step.id && !showRefinement;
                  
                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ 
                        opacity: isCompleted || isCurrent ? 1 : 0.3,
                        x: 0
                      }}
                      transition={{ duration: 0.3 }}
                      className={cn(
                        "flex items-center gap-3 text-sm",
                        isCompleted && "text-muted-foreground",
                        isCurrent && "text-foreground font-medium"
                      )}
                    >
                      <div className="relative w-5 h-5">
                        {isCompleted ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <Check className="w-5 h-5 text-primary" />
                          </motion.div>
                        ) : isCurrent ? (
                          <motion.div
                            className="w-5 h-5 border-2 border-primary rounded-full"
                            animate={{
                              scale: [1, 1.2, 1],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                        ) : (
                          <div className="w-5 h-5 border-2 border-muted-foreground/30 rounded-full" />
                        )}
                      </div>
                      <span>{step.message}</span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Estimated time (fake but realistic) */}
              {!showRefinement && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="mt-6 text-center text-sm text-muted-foreground"
                >
                  Estimated time remaining: {
                    Math.max(
                      0,
                      Math.ceil(
                        steps
                          .slice(currentStepIndex)
                          .reduce((acc, step) => acc + step.duration, 0) / 1000
                      )
                    )
                  } seconds
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}