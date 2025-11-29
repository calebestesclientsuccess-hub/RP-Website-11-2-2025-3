import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Helmet } from "react-helmet-async";
import { Info, Mail, ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to admin if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/admin");
    }
  }, [user, setLocation]);

  // Add noindex meta
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>Admin Access Request | CMS</title>
        <meta name="description" content="Request admin access to the CMS dashboard." />
      </Helmet>
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle data-testid="text-register-title">Admin Access Request</CardTitle>
            <CardDescription>Registration is invitation-only</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert data-testid="alert-invitation-only">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <p className="font-semibold mb-2">Admin accounts are created by invitation only</p>
                <p className="text-sm">
                  Self-registration is not available. If you need admin access to manage content, 
                  please contact our team.
                </p>
              </AlertDescription>
            </Alert>
            
            <div className="flex flex-col items-center gap-4 py-4">
              <Mail className="h-12 w-12 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  To request access, please email:
                </p>
                <a 
                  href="mailto:hello@revenueparty.com" 
                  className="text-lg font-medium text-primary hover:underline"
                  data-testid="link-contact-email"
                >
                  hello@revenueparty.com
                </a>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-2 border-t pt-4">
            <Link href="/admin/login" className="w-full">
              <Button variant="outline" className="w-full gap-2" data-testid="link-back-to-login">
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Button>
            </Link>
            <p className="text-xs text-center text-muted-foreground mt-2">
              Already have an account? Use the login page above.
            </p>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
