import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { MapPin, Briefcase, Clock, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { JobPosting } from "@shared/schema";

export default function Careers() {
  const { data: jobs, isLoading, isError } = useQuery<JobPosting[]>({
    queryKey: ["/api/job-postings?active=true"],
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-16 max-w-6xl">
        <div className="relative mb-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-community/10 via-primary/5 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <Badge variant="community" className="mb-4">Join Our Team</Badge>
            <h1 className="text-5xl font-bold mb-4" data-testid="text-careers-title">
              Join the Revenue <span className="text-community">Party</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl" data-testid="text-careers-subtitle">
              We're building the future of B2B go-to-market. If you're obsessed with systems, scale, and results—let's talk.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted rounded w-full mb-2" />
                  <div className="h-4 bg-muted rounded w-5/6" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : isError ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground" data-testid="text-error">
                Unable to load job postings at this time. Please try again later.
              </p>
            </CardContent>
          </Card>
        ) : jobs && jobs.length > 0 ? (
          <div className="space-y-6">
            {jobs.map((job) => (
              <Link key={job.id} href={`/careers/${job.id}`} data-testid={`link-job-${job.id}`}>
                <Card className="hover-elevate cursor-pointer transition-all duration-300 group">
                  <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors" data-testid={`text-title-${job.id}`}>
                          {job.title}
                        </h2>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4" />
                            <span data-testid={`text-department-${job.id}`}>{job.department}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span data-testid={`text-location-${job.id}`}>{job.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span data-testid={`text-type-${job.id}`}>{job.type}</span>
                          </div>
                        </div>
                      </div>
                      {job.active && (
                        <Badge variant="secondary">Open</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4 line-clamp-3" data-testid={`text-description-${job.id}`}>
                      {job.description.split('\n\n')[0]}
                    </p>
                    <div className="flex items-center gap-2 text-primary font-medium group-hover:gap-3 transition-all">
                      View Position
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground" data-testid="text-no-jobs">
                No open positions at the moment. Check back soon!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
