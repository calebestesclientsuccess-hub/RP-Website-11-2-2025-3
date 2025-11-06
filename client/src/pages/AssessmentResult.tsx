import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Download, Loader2, Star } from "lucide-react";
import { Helmet } from "react-helmet-async";

// Validate if a URL is a valid HTTP/HTTPS URL
const isValidUrl = (url: string | null | undefined): boolean => {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

interface AssessmentResultResponse {
  assessment: {
    id: string;
    title: string;
    description: string | null;
  };
  bucket: {
    id: string;
    bucketName: string;
    bucketKey: string;
    title: string;
    content: string;
    pdfUrl: string | null;
  };
  score: number | null;
  response: {
    id: string;
    sessionId: string;
    name: string | null;
    email: string | null;
    company: string | null;
  };
}

export default function AssessmentResult() {
  const { sessionId } = useParams<{ sessionId: string }>();

  const { data, isLoading, error } = useQuery<AssessmentResultResponse>({
    queryKey: [`/api/configurable-assessments/results/${sessionId}`],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-3xl mx-4">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Loading your results...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-3xl mx-4">
          <CardContent className="py-12 text-center">
            <div className="text-destructive font-semibold mb-2">Results Not Found</div>
            <p className="text-muted-foreground">
              We couldn't find your assessment results. The link may be invalid or expired.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { assessment, bucket, score, response } = data;
  
  // Validate PDF URL before showing download buttons
  const hasValidPdfUrl = isValidUrl(bucket.pdfUrl);

  return (
    <>
      <Helmet>
        <title>{bucket.title} | {assessment.title} Results</title>
        <meta name="description" content={`Your ${assessment.title} results: ${bucket.title}`} />
      </Helmet>

      <div className="min-h-screen bg-background py-8 md:py-16">
        <div className="max-w-4xl mx-auto px-4">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
              <CheckCircle2 className="h-8 w-8" data-testid="icon-success" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-result-heading">
              Assessment Complete!
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Thank you for completing the {assessment.title}. Here are your personalized results.
            </p>
          </div>

          {/* Personal Info Card */}
          {response.name && (
            <Card className="mb-6" data-testid="card-personal-info">
              <CardContent className="py-4">
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium text-foreground">Name:</span> {response.name}
                  </div>
                  {response.email && (
                    <>
                      <Separator orientation="vertical" className="h-4" />
                      <div>
                        <span className="font-medium text-foreground">Email:</span> {response.email}
                      </div>
                    </>
                  )}
                  {response.company && (
                    <>
                      <Separator orientation="vertical" className="h-4" />
                      <div>
                        <span className="font-medium text-foreground">Company:</span> {response.company}
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Result Card */}
          <Card className="border-2 mb-6" data-testid="card-result">
            <CardHeader className="border-b bg-muted/30">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-2xl md:text-3xl mb-2" data-testid="text-result-title">
                    {bucket.title}
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" data-testid="badge-bucket-name">
                      {bucket.bucketName}
                    </Badge>
                    {score !== null && (
                      <Badge variant="outline" className="gap-1" data-testid="badge-score">
                        <Star className="h-3 w-3" />
                        Score: {score}
                      </Badge>
                    )}
                  </div>
                </div>
                
                {hasValidPdfUrl && (
                  <Button
                    asChild
                    variant="default"
                    size="lg"
                    className="gap-2"
                    data-testid="button-download-pdf"
                  >
                    <a href={bucket.pdfUrl!} download target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4" />
                      Download PDF
                    </a>
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              {/* Result Content */}
              <div 
                className="prose prose-slate dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: bucket.content }}
                data-testid="content-result"
              />
            </CardContent>
          </Card>

          {/* CTA Card */}
          <Card className="border-2 bg-muted/30" data-testid="card-next-steps">
            <CardHeader>
              <CardTitle>What's Next?</CardTitle>
              <CardDescription>
                We've sent a copy of your results to {response.email || "your email"}.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Based on your results, we recommend taking the following actions:
              </p>
              <div className="flex flex-wrap gap-3">
                {hasValidPdfUrl && (
                  <Button variant="outline" asChild data-testid="button-download-pdf-secondary">
                    <a href={bucket.pdfUrl!} download target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-2" />
                      Save Results PDF
                    </a>
                  </Button>
                )}
                <Button variant="outline" asChild data-testid="button-home">
                  <a href="/">
                    Return to Home
                  </a>
                </Button>
                <Button variant="outline" asChild data-testid="button-contact">
                  <a href="/contact">
                    Schedule a Consultation
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Footer Note */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              Session ID: <code className="text-xs bg-muted px-2 py-1 rounded">{sessionId}</code>
            </p>
            <p className="mt-2">
              Keep this link to access your results later.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
