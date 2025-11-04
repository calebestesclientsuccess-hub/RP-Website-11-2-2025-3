import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet-async";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/auth/forgot-password", { email });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset email");
      }

      setEmailSent(true);
      toast({
        title: "Email Sent",
        description: data.message,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Forgot Password | CMS</title>
        <meta name="description" content="Reset your admin password to regain access to your CMS dashboard." />
      </Helmet>
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle data-testid="text-forgot-password-title">Reset Your Password</CardTitle>
            <CardDescription>
              Enter your email address and we'll send you a link to reset your password
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!emailSent ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="admin@example.com"
                      className="pl-9"
                      data-testid="input-email"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground" data-testid="text-email-hint">
                    This should be the email address associated with your admin account
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-send-reset-link">
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            ) : (
              <Alert data-testid="alert-email-sent">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-semibold mb-2">Check your email</p>
                  <p className="text-sm">
                    We've sent a password reset link to <strong>{email}</strong>. 
                    The link will expire in 1 hour.
                  </p>
                  <p className="text-sm mt-2 text-muted-foreground">
                    Didn't receive the email? Check your spam folder or try again.
                  </p>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-2 border-t pt-4">
            <Link href="/admin/login" className="w-full">
              <Button variant="outline" className="w-full gap-2" data-testid="link-back-to-login">
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Button>
            </Link>
            {emailSent && (
              <Button
                variant="ghost"
                onClick={() => {
                  setEmailSent(false);
                  setEmail("");
                }}
                className="w-full"
                data-testid="button-try-different-email"
              >
                Try a different email
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
