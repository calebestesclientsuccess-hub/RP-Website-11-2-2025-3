
import * as React from "react";
import { useState, useEffect } from "react";
import { Check, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "./input";
import { Label } from "./label";

export interface ValidationRule {
  test: (value: string) => boolean;
  message: string;
}

export interface ValidatedInputProps extends Omit<React.ComponentProps<"input">, "onChange"> {
  label: string;
  rules?: ValidationRule[];
  showValidationIcon?: boolean;
  validateOnBlur?: boolean;
  validateOnChange?: boolean;
  onChange?: (value: string, isValid: boolean) => void;
  autoComplete?: string;
  description?: string;
}

export const ValidatedInput = React.forwardRef<HTMLInputElement, ValidatedInputProps>(
  (
    {
      label,
      rules = [],
      showValidationIcon = true,
      validateOnBlur = true,
      validateOnChange = true,
      onChange,
      className,
      ...props
    },
    ref
  ) => {
    const [value, setValue] = useState("");
    const [touched, setTouched] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);
    const [isValid, setIsValid] = useState(false);

    const validate = (val: string): string[] => {
      const newErrors: string[] = [];
      rules.forEach((rule) => {
        if (!rule.test(val)) {
          newErrors.push(rule.message);
        }
      });
      return newErrors;
    };

    useEffect(() => {
      if (touched && validateOnChange) {
        const newErrors = validate(value);
        setErrors(newErrors);
        setIsValid(newErrors.length === 0);
      }
    }, [value, touched, validateOnChange]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setValue(newValue);
      
      if (validateOnChange && touched) {
        const newErrors = validate(newValue);
        setErrors(newErrors);
        const valid = newErrors.length === 0;
        setIsValid(valid);
        onChange?.(newValue, valid);
      } else {
        onChange?.(newValue, true);
      }
    };

    const handleBlur = () => {
      setTouched(true);
      if (validateOnBlur) {
        const newErrors = validate(value);
        setErrors(newErrors);
        const valid = newErrors.length === 0;
        setIsValid(valid);
        onChange?.(value, valid);
      }
    };

    const showError = touched && errors.length > 0;
    const showSuccess = touched && isValid && value.length > 0;

    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={props.id} className="text-sm font-medium">
            {label}
            {props.required && <span className="text-destructive ml-1" aria-label="required">*</span>}
          </Label>
        )}
        
        {description && (
          <p id={`${props.id}-description`} className="text-sm text-muted-foreground">
            {description}
          </p>
        )}
        
        <div className="relative">
          <Input
            ref={ref}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            className={cn(
              "pr-10 transition-colors",
              showError && "border-destructive focus-visible:ring-destructive",
              showSuccess && "border-green-500 focus-visible:ring-green-500",
              className
            )}
            aria-invalid={showError}
            aria-describedby={cn(
              description && `${props.id}-description`,
              showError && `${props.id}-error`
            )}
            aria-required={props.required}
            autoComplete={autoComplete}
            {...props}
          />
          
          {showValidationIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              {showSuccess && (
                <Check className="h-5 w-5 text-green-500 animate-in zoom-in-50 duration-200" aria-hidden="true" />
              )}
              {showError && (
                <X className="h-5 w-5 text-destructive animate-in zoom-in-50 duration-200" aria-hidden="true" />
              )}
            </div>
          )}
        </div>

        {showError && (
          <div
            id={`${props.id}-error`}
            className="flex items-start gap-2 text-sm text-destructive animate-in slide-in-from-top-1 duration-200"
            role="alert"
            aria-live="polite"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1">
              {errors.map((error, index) => (
                <p key={index}>{error}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);

ValidatedInput.displayName = "ValidatedInput";

// Common validation rules
export const validationRules = {
  required: (message = "This field is required"): ValidationRule => ({
    test: (value) => value.trim().length > 0,
    message,
  }),
  email: (message = "Please enter a valid email address"): ValidationRule => ({
    test: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message,
  }),
  minLength: (length: number, message?: string): ValidationRule => ({
    test: (value) => value.length >= length,
    message: message || `Must be at least ${length} characters`,
  }),
  maxLength: (length: number, message?: string): ValidationRule => ({
    test: (value) => value.length <= length,
    message: message || `Must be no more than ${length} characters`,
  }),
  pattern: (regex: RegExp, message: string): ValidationRule => ({
    test: (value) => regex.test(value),
    message,
  }),
  phone: (message = "Please enter a valid phone number"): ValidationRule => ({
    test: (value) => /^[\d\s\-\(\)\+]+$/.test(value) && value.replace(/\D/g, '').length >= 10,
    message,
  }),
};
