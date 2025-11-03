import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Mail } from "lucide-react";

interface BlueprintCaptureFormProps {
  path: string;
  q1: string;
  q2?: string;
  customMessage?: string;
}

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type FormData = z.infer<typeof formSchema>;

export function BlueprintCaptureForm({ path, q1, q2, customMessage }: BlueprintCaptureFormProps) {
  const { toast } = useToast();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      return apiRequest("POST", "/api/v1/capture-blueprint", {
        email: data.email,
        path,
        q1,
        q2: q2 || null,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Check your email for your personalized GTM blueprint.",
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="space-y-4" data-testid="form-blueprint-capture">
      {customMessage && (
        <p className="text-lg text-muted-foreground" data-testid="text-custom-message">
          {customMessage}
        </p>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="your.email@company.com"
                      className="pl-10"
                      data-testid="input-email"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={mutation.isPending}
            data-testid="button-submit-blueprint"
          >
            {mutation.isPending ? "Sending..." : "Get Your Personalized Blueprint"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
