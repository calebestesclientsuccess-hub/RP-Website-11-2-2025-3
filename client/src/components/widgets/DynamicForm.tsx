import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { widgetVariants } from "@/lib/widgetVariants";
import type { FormConfig } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface DynamicFormProps {
  config: FormConfig;
  onSubmit?: (data: Record<string, any>) => void;
  className?: string;
  theme?: "light" | "dark" | "auto";
  size?: "small" | "medium" | "large";
}

export function DynamicForm({ config, onSubmit, className, theme, size }: DynamicFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();

  const formSchema = z.object(
    config.fields.reduce((acc, field) => {
      let fieldSchema: z.ZodTypeAny;

      switch (field.type) {
        case "email":
          fieldSchema = z.string().email("Please enter a valid email address");
          break;
        case "number":
          fieldSchema = z.coerce.number();
          if (field.validation?.min !== undefined) {
            fieldSchema = (fieldSchema as z.ZodNumber).min(
              field.validation.min,
              field.validation.message || `Minimum value is ${field.validation.min}`
            );
          }
          if (field.validation?.max !== undefined) {
            fieldSchema = (fieldSchema as z.ZodNumber).max(
              field.validation.max,
              field.validation.message || `Maximum value is ${field.validation.max}`
            );
          }
          break;
        case "tel":
          fieldSchema = z.string();
          if (field.validation?.pattern) {
            fieldSchema = fieldSchema.regex(
              new RegExp(field.validation.pattern),
              field.validation.message || "Invalid phone number format"
            );
          }
          break;
        case "checkbox":
          fieldSchema = z.boolean();
          break;
        default:
          fieldSchema = z.string();
          if (field.validation?.min !== undefined) {
            fieldSchema = (fieldSchema as z.ZodString).min(
              field.validation.min,
              field.validation.message || `Minimum length is ${field.validation.min}`
            );
          }
          if (field.validation?.max !== undefined) {
            fieldSchema = (fieldSchema as z.ZodString).max(
              field.validation.max,
              field.validation.message || `Maximum length is ${field.validation.max}`
            );
          }
          if (field.validation?.pattern) {
            fieldSchema = (fieldSchema as z.ZodString).regex(
              new RegExp(field.validation.pattern),
              field.validation.message || "Invalid format"
            );
          }
      }

      if (!field.required && field.type !== "checkbox") {
        fieldSchema = fieldSchema.optional();
      } else if (field.required && field.type !== "checkbox") {
        if (field.type === "number") {
          fieldSchema = (fieldSchema as z.ZodNumber);
        } else {
          fieldSchema = (fieldSchema as z.ZodString).min(1, `${field.label} is required`);
        }
      }

      acc[field.name] = fieldSchema;
      return acc;
    }, {} as Record<string, z.ZodTypeAny>)
  );

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: config.fields.reduce((acc, field) => {
      acc[field.name] = field.type === "checkbox" ? false : "";
      return acc;
    }, {} as Record<string, any>),
  });

  const handleSubmit = async (data: Record<string, any>) => {
    setIsSubmitting(true);
    try {
      // If custom onSubmit is provided, use it
      if (onSubmit) {
        await onSubmit(data);
      } else {
        // Default behavior: save to unified leads table
        const email = data.email || data.workEmail || data.contactEmail || "";
        const name = data.name || data.fullName || `${data.firstName || ""} ${data.lastName || ""}`.trim();
        const phone = data.phone || data.phoneNumber || data.tel || "";
        const company = data.company || data.companyName || "";
        
        await apiRequest("POST", "/api/leads/capture", {
          email,
          name: name || undefined,
          company: company || undefined,
          phone: phone || undefined,
          source: "dynamic-form",
          pageUrl: window.location.pathname,
          formData: JSON.stringify(data),
        });
      }
      
      setShowSuccess(true);
      form.reset();
      setTimeout(() => setShowSuccess(false), 5000);
      
      toast({
        title: "Success!",
        description: config.successMessage || "Thank you! We'll be in touch soon.",
      });
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit form. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={cn(widgetVariants({ theme, size }), "w-full", className)}>
      <CardHeader>
        <CardTitle>{config.title}</CardTitle>
        {config.description && (
          <CardDescription>{config.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {config.fields.map((field) => (
              <FormField
                key={field.name}
                control={form.control}
                name={field.name}
                render={({ field: formField }) => (
                  <FormItem>
                    {field.type !== "checkbox" && (
                      <FormLabel>
                        {field.label}
                        {field.required && <span className="text-destructive ml-1">*</span>}
                      </FormLabel>
                    )}
                    <FormControl>
                      <>
                        {(field.type === "text" ||
                          field.type === "email" ||
                          field.type === "tel" ||
                          field.type === "number") && (
                          <Input
                            {...formField}
                            type={field.type}
                            placeholder={field.placeholder}
                            data-testid={`input-${field.name}`}
                          />
                        )}

                        {field.type === "textarea" && (
                          <Textarea
                            {...formField}
                            placeholder={field.placeholder}
                            data-testid={`textarea-${field.name}`}
                          />
                        )}

                        {field.type === "select" && field.options && (
                          <Select
                            onValueChange={formField.onChange}
                            defaultValue={formField.value}
                          >
                            <SelectTrigger data-testid={`select-${field.name}`}>
                              <SelectValue placeholder={field.placeholder || "Select an option"} />
                            </SelectTrigger>
                            <SelectContent>
                              {field.options.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                  data-testid={`select-option-${option.value}`}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}

                        {field.type === "checkbox" && (
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={formField.value}
                              onCheckedChange={formField.onChange}
                              data-testid={`checkbox-${field.name}`}
                            />
                            <FormLabel className="!mt-0 cursor-pointer">
                              {field.label}
                              {field.required && <span className="text-destructive ml-1">*</span>}
                            </FormLabel>
                          </div>
                        )}

                        {field.type === "radio" && field.options && (
                          <RadioGroup
                            onValueChange={formField.onChange}
                            defaultValue={formField.value}
                            data-testid={`radio-${field.name}`}
                          >
                            {field.options.map((option) => (
                              <div
                                key={option.value}
                                className="flex items-center space-x-2"
                              >
                                <RadioGroupItem
                                  value={option.value}
                                  id={`${field.name}-${option.value}`}
                                  data-testid={`radio-option-${option.value}`}
                                />
                                <FormLabel
                                  htmlFor={`${field.name}-${option.value}`}
                                  className="!mt-0 cursor-pointer font-normal"
                                >
                                  {option.label}
                                </FormLabel>
                              </div>
                            ))}
                          </RadioGroup>
                        )}
                      </>
                    </FormControl>
                    <FormMessage data-testid={`error-${field.name}`} />
                  </FormItem>
                )}
              />
            ))}

            {showSuccess && (
              <div
                className="p-4 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                data-testid="success-message"
              >
                <p className="text-sm text-green-800 dark:text-green-200">
                  {config.successMessage}
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              data-testid="button-submit"
              className="w-full"
            >
              {isSubmitting ? "Submitting..." : config.submitButtonText}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
