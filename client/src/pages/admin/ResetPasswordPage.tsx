import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet-async";
import { CheckCircle, AlertCircle, Lock, XCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface PasswordStrength {
  valid: boolean;
  score: number;
  errors: string[];
  suggestions: string[];
}

const getStrengthLabel = (score: number): string => {
  switch (score) {
    case 0:
    case 1:
      return 'Weak';
    case 2:
      return 'Fair';
    case 3:
      return 'Good';
    case 4:
      return 'Strong';
    default:
      return 'Unknown';
  }
};

const getStrengthColor = (score: number): string => {
  switch (score) {
    case 0:
    case 1:
      return 'bg-red-500';
    case 2:
      return 'bg-yellow-500';
    case 3:
      return 'bg-blue-500';
    case 4:
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
};

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
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength | null>(null);
  const { toast } = useToast();

  // Verify token on mount
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

  // Check password strength on change
  useEffect(() => {
    if (!password) {
      setPasswordStrength(null);
      return;
    }

    const checkStrength = async () => {
      try {
        const response = await fetch('/api/auth/check-password-strength', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        });
        const data = await response.json();
        setPasswordStrength(data);
      } catch (error) {
        console.error('Failed to check password strength:', error);
      }
    };

    const debounce = setTimeout(checkStrength, 300);
    return () => clearTimeout(debounce);
  }, [password]);

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

    // Client-side validation - check minimum length
    if (password.length < 12) {
      toast({
        title: "Error",
        description: "Password must be at least 12 characters",
        variant: "destructive",
      });
      return;
    }

    // Check if password meets strength requirements
    if (passwordStrength && !passwordStrength.valid) {
      toast({
        title: "Error",
        description: "Password does not meet security requirements",
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
        // Handle validation errors from server
        if (data.details && Array.isArray(data.details)) {
          throw new Error(data.details.join('. '));
        }
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
                      minLength={12}
                      placeholder="At least 12 characters"
                      className="pl-9"
                      data-testid="input-password"
                      aria-describedby="password-strength password-requirements"
                    />
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {password && passwordStrength && (
                    <div className="space-y-2 mt-2" id="password-strength" aria-live="polite">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Password Strength:</span>
                        <span className={`font-medium ${
                          passwordStrength.score >= 3 ? 'text-green-600' : 
                          passwordStrength.score >= 2 ? 'text-yellow-600' : 
                          'text-red-600'
                        }`}>
                          {getStrengthLabel(passwordStrength.score)}
                        </span>
                      </div>
                      <Progress 
                        value={(passwordStrength.score / 4) * 100} 
                        className={getStrengthColor(passwordStrength.score)}
                      />
                      
                      {passwordStrength.errors.length > 0 && (
                        <div className="space-y-1">
                          {passwordStrength.errors.map((error, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-sm text-red-600">
                              <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                              <span>{error}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {passwordStrength.suggestions.length > 0 && (
                        <div className="space-y-1">
                          {passwordStrength.suggestions.map((suggestion, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-sm text-yellow-600">
                              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                              <span>{suggestion}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
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
                      minLength={12}
                      placeholder="Re-enter your password"
                      className="pl-9"
                      data-testid="input-confirm-password"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground" id="password-requirements" data-testid="text-password-hint">
                    Must be at least 12 characters with uppercase, lowercase, and numbers
                  </p>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || (passwordStrength && !passwordStrength.valid)} 
                  data-testid="button-reset-password"
                >
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
