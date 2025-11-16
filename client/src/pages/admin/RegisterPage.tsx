import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet-async";
import { Info, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

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

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength | null>(null);
  const [isCheckingStrength, setIsCheckingStrength] = useState(false);
  const { register, user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Check password strength on change
  useEffect(() => {
    if (!password) {
      setPasswordStrength(null);
      return;
    }

    const checkStrength = async () => {
      setIsCheckingStrength(true);
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
      } finally {
        setIsCheckingStrength(false);
      }
    };

    const debounce = setTimeout(checkStrength, 300);
    return () => clearTimeout(debounce);
  }, [password]);

  if (user) {
    setLocation("/admin");
    return null;
  }

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
      await register(username, email, password);
      toast({
        title: "Success!",
        description: "Welcome to your CMS Dashboard! Redirecting...",
      });
      setTimeout(() => {
        setLocation("/admin/welcome");
      }, 500);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Registration | CMS</title>
        <meta name="description" content="Create your admin account to access the CMS dashboard and manage your content." />
      </Helmet>
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle data-testid="text-register-title">Create Your Admin Account</CardTitle>
            <CardDescription>First-time setup for CMS administrators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert data-testid="alert-first-time-setup">
              <Info className="h-4 w-4" />
              <AlertDescription>
                This is a one-time setup to create your first admin account. You'll be able to manage blog posts, videos, and configure your site's widgets.
              </AlertDescription>
            </Alert>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  placeholder="Enter your username"
                  data-testid="input-username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="admin@example.com"
                  data-testid="input-email"
                />
                <p className="text-xs text-muted-foreground" data-testid="text-email-hint">
                  You'll use this email for password recovery
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  data-testid="input-password"
                  aria-describedby="password-strength password-requirements"
                />
                
                {password && passwordStrength && (
                  <div className="space-y-2" id="password-strength" aria-live="polite">
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
                
                <p className="text-xs text-muted-foreground" id="password-requirements" data-testid="text-password-hint">
                  Must include: lowercase, uppercase, number, and be at least 8 characters
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  data-testid="input-confirm-password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-register">
                {isLoading ? "Creating account..." : "Create Admin Account"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
