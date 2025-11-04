import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Helmet } from "react-helmet-async";
import { FileText, Video, Settings, Calendar, CheckCircle2 } from "lucide-react";

export default function WelcomePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (!user) {
    setLocation("/admin/login");
    return null;
  }

  const features = [
    {
      icon: FileText,
      title: "Manage Blog Posts",
      description: "Create and edit blog posts with our powerful rich text editor. Format your content, add images, and create engaging articles.",
      testId: "feature-blog-posts",
    },
    {
      icon: Video,
      title: "Manage Video Posts",
      description: "Upload and organize video content for your site. Perfect for tutorials, demos, and multimedia storytelling.",
      testId: "feature-video-posts",
    },
    {
      icon: Settings,
      title: "Configure Floating Widget",
      description: "Customize the floating widget that appears on your site. Choose between Assessment or Calculator modes to engage your visitors.",
      testId: "feature-widget-config",
    },
    {
      icon: Calendar,
      title: "Schedule Content",
      description: "Plan ahead by scheduling blog posts and videos for future publishing. Set publish dates and let the CMS handle the rest.",
      testId: "feature-schedule-content",
    },
  ];

  return (
    <>
      <Helmet>
        <title>Welcome | CMS Dashboard</title>
        <meta name="description" content="Welcome to your CMS Dashboard. Learn about all the features available to manage your content." />
      </Helmet>
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-4xl w-full space-y-8">
          <Card>
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="rounded-full bg-primary/10 p-3">
                  <CheckCircle2 className="h-12 w-12 text-primary" data-testid="icon-success" />
                </div>
              </div>
              <CardTitle className="text-3xl" data-testid="text-welcome-title">
                Welcome to your CMS Dashboard!
              </CardTitle>
              <CardDescription className="text-lg" data-testid="text-welcome-subtitle">
                Your admin account has been created successfully. You're all set to start managing your content.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4" data-testid="text-features-heading">
                  What you can do with your CMS:
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {features.map((feature) => {
                    const Icon = feature.icon;
                    return (
                      <div
                        key={feature.testId}
                        className="flex gap-4 p-4 rounded-lg border hover-elevate"
                        data-testid={feature.testId}
                      >
                        <div className="flex-shrink-0">
                          <div className="rounded-full bg-primary/10 p-2">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-semibold">{feature.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  size="lg"
                  onClick={() => setLocation("/admin")}
                  data-testid="button-go-to-dashboard"
                >
                  Go to Dashboard
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setLocation("/admin/blog-posts/new")}
                  data-testid="button-create-first-post"
                >
                  Create Your First Blog Post
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
