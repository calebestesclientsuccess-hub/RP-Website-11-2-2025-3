
import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "./input"

export interface MobileInputProps extends React.ComponentProps<"input"> {
  autoAdvance?: boolean;
  nextFieldRef?: React.RefObject<HTMLInputElement>;
  inputMode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';
}

const MobileInput = React.forwardRef<HTMLInputElement, MobileInputProps>(
  ({ className, type, autoAdvance = false, nextFieldRef, inputMode, onKeyDown, onChange, ...props }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Call custom onKeyDown if provided
      onKeyDown?.(e);
      
      // Auto-advance on Enter key
      if (e.key === 'Enter' && autoAdvance && nextFieldRef?.current) {
        e.preventDefault();
        nextFieldRef.current.focus();
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      
      // Auto-advance for specific input types when complete
      if (autoAdvance && nextFieldRef?.current) {
        const maxLength = e.target.maxLength;
        if (maxLength > 0 && e.target.value.length >= maxLength) {
          nextFieldRef.current.focus();
        }
      }
    };

    return (
      <Input
        ref={ref}
        type={type}
        inputMode={inputMode}
        className={cn("touch-target min-h-11", className)}
        onKeyDown={handleKeyDown}
        onChange={handleChange}
        {...props}
      />
    )
  }
)
MobileInput.displayName = "MobileInput"

export { MobileInput }
