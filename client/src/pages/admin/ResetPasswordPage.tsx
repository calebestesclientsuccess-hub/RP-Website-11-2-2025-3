import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet-async";
import { CheckCircle, AlertCircle, Lock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function ResetPasswordPage() {
  const [, params] = useRoute("/admin/reset-password/:token");
  const token = params?.token || "";
  const [, setLocation] = useLocation();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [tokenError, setTokenError] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setTokenError("Invalid reset link");
        setIsVerifying(false);
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify-reset-token/${token}`);
        const data = await response.json();

        if (response.ok && data.valid) {
          setIsValidToken(true);
        } else {
          setTokenError(data.error || "This reset link is invalid or has expired");
        }
      } catch (error) {
        setTokenError("Failed to verify reset link");
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/auth/reset-password", {
        token,
        password,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      setResetSuccess(true);
      toast({
        title: "Success",
        description: "Your password has been reset successfully",
      });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        setLocation("/admin/login");
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reset password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Reset Password | CMS</title>
        <meta name="description" content="Create a new password for your admin account." />
      </Helmet>
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle data-testid="text-reset-password-title">Create New Password</CardTitle>
            <CardDescription>
              Enter your new password below
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isVerifying ? (
              <div className="text-center py-8" data-testid="loading-verification">
                <p className="text-muted-foreground">Verifying reset link...</p>
              </div>
            ) : !isValidToken ? (
              <Alert variant="destructive" data-testid="alert-invalid-token">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-semibold mb-2">Invalid Reset Link</p>
                  <p className="text-sm">{tokenError}</p>
                  <p className="text-sm mt-2">
                    Please request a new password reset link.
                  </p>
                </AlertDescription>
              </Alert>
            ) : resetSuccess ? (
              <Alert data-testid="alert-reset-success">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-semibold mb-2">Password Reset Successful</p>
                  <p className="text-sm">
                    Your password has been updated. Redirecting to login...
                  </p>
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      placeholder="At least 8 characters"
                      className="pl-9"
                      data-testid="input-password"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      placeholder="Re-enter your password"
                      className="pl-9"
                      data-testid="input-confirm-password"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground" data-testid="text-password-hint">
                    Password must be at least 8 characters long
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-reset-password">
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
