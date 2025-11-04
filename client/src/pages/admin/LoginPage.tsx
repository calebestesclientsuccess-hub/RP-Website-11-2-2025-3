import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet-async";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasUsers, setHasUsers] = useState<boolean | null>(null);
  const { login, user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const checkUsers = async () => {
      try {
        const response = await fetch("/api/auth/has-users");
        const data = await response.json();
        setHasUsers(data.hasUsers);
      } catch (error) {
        console.error("Error checking for users:", error);
      }
    };
    checkUsers();
  }, []);

  if (user) {
    setLocation("/admin");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(username, password);
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
      setLocation("/admin");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Login | CMS</title>
        <meta name="description" content="Login to your CMS admin dashboard to manage your content." />
      </Helmet>
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle data-testid="text-login-title">Admin Login</CardTitle>
            <CardDescription>Enter your credentials to access the CMS dashboard</CardDescription>
          </CardHeader>
          <CardContent>
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
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  data-testid="input-password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-login">
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>
          {hasUsers === false && (
            <CardFooter className="flex-col gap-2 border-t pt-4">
              <p className="text-sm text-center text-muted-foreground" data-testid="text-first-time-message">
                Don't have an account?
              </p>
              <Link href="/admin/register">
                <Button variant="outline" className="w-full" data-testid="link-create-account">
                  Create Your Admin Account
                </Button>
              </Link>
              <p className="text-xs text-center text-muted-foreground" data-testid="text-admin-only">
                This is for CMS administrators only
              </p>
            </CardFooter>
          )}
        </Card>
      </div>
    </>
  );
}
