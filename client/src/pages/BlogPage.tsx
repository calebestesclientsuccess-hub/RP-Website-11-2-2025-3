import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  Calendar, 
  Clock, 
  ArrowRight, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target,
  Briefcase,
  Zap,
  BookOpen,
  Brain,
  AlertTriangle,
  TrendingDown,
  ShieldAlert,
  AlertCircle,
  Cog,
  Lightbulb,
  Play,
  FileText,
  Video,
  Youtube,
  Film
} from "lucide-react";
import { useState, useMemo } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import type { BlogPost, VideoPost } from "@shared/schema";
import { format } from "date-fns";

type CombinedPost = (BlogPost & { type: 'article' }) | (VideoPost & { type: 'video' });

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [contentType, setContentType] = useState<'all' | 'articles' | 'videos'>('all');

  // Fetch blog posts
  const { data: blogPosts, isLoading: blogLoading, error: blogError } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog-posts'],
  });

  // Fetch video posts
  const { data: videoPosts, isLoading: videoLoading, error: videoError } = useQuery<VideoPost[]>({
    queryKey: ['/api/video-posts'],
  });

  // Filter and combine posts
  const combinedPosts = useMemo(() => {
    const now = new Date();
    const posts: CombinedPost[] = [];

    // Filter and add blog posts
    if (blogPosts) {
      const publishedBlogs = blogPosts.filter(post => {
        // Check if published OR (scheduled and time has passed)
        if (post.published) return true;
        if (post.scheduledFor && new Date(post.scheduledFor) <= now) return true;
        return false;
      });
      posts.push(...publishedBlogs.map(post => ({ ...post, type: 'article' as const })));
    }

    // Filter and add video posts
    if (videoPosts) {
      const publishedVideos = videoPosts.filter(post => {
        if (post.published) return true;
        if (post.scheduledFor && new Date(post.scheduledFor) <= now) return true;
        return false;
      });
      posts.push(...publishedVideos.map(post => ({ ...post, type: 'video' as const })));
    }

    // Sort by publishedAt (most recent first)
    return posts.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  }, [blogPosts, videoPosts]);

  // Extract dynamic categories from posts
  const categories = useMemo(() => {
    const categoryMap = new Map<string, number>();
    
    combinedPosts.forEach(post => {
      if (post.category) {
        categoryMap.set(post.category, (categoryMap.get(post.category) || 0) + 1);
      }
    });

    const categoryIcons: Record<string, any> = {
      "Hiring & Costs": DollarSign,
      "Team Performance": Users,
      "GTM Strategy": Target,
      "Sales Methodology": Brain,
      "Guides": BookOpen,
      "Strategy": Lightbulb,
    };

    const categoryList = Array.from(categoryMap.entries()).map(([name, count]) => ({
      name,
      icon: categoryIcons[name] || BookOpen,
      count,
    }));

    return [
      { name: "All", icon: BookOpen, count: combinedPosts.length },
      ...categoryList.sort((a, b) => b.count - a.count)
    ];
  }, [combinedPosts]);

  // Filter posts based on category, search, and content type
  const filteredPosts = useMemo(() => {
    return combinedPosts.filter(post => {
      // Content type filter
      if (contentType === 'articles' && post.type !== 'article') return false;
      if (contentType === 'videos' && post.type !== 'video') return false;

      // Category filter
      const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
      
      // Search filter
      const matchesSearch = searchQuery === "" || 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.type === 'article' && post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (post.type === 'video' && post.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesCategory && matchesSearch;
    });
  }, [combinedPosts, selectedCategory, searchQuery, contentType]);

  // Featured posts (3 most recent)
  const featuredPosts = useMemo(() => filteredPosts.slice(0, 3), [filteredPosts]);
  const regularPosts = useMemo(() => filteredPosts.slice(3), [filteredPosts]);

  const isLoading = blogLoading || videoLoading;
  const error = blogError || videoError;

  // 5 Strategic Content Hubs - SEO Cluster Architecture
  const contentHubs = useMemo(() => [
    {
      name: "Theme 1: The Internal Hire Trap",
      subtitle: "The $198k Mistake",
      slug: "hire-cold-callers",
      targetKeyword: "hire cold callers",
      description: "The forensic deconstruction of the $198,000 Liability. Why the 'Hiring Drag,' 'Management Tax,' and 'Lone Wolf Fallacy' are costing you revenue.",
      icon: TrendingDown,
      articleCount: combinedPosts.filter(p => p.category === "Hiring & Costs").length
    },
    {
      name: "Theme 2: The Outsourcing Trap",
      subtitle: "The Shell Game",
      slug: "b2b-appointment-setting",
      targetKeyword: "b2b appointment setting services",
      description: "How to spot the 'Black Box Problem,' 'Zero-IP Trap,' and 'Activity Mirage' from commodity agencies (the 93% that fail).",
      icon: ShieldAlert,
      articleCount: combinedPosts.filter(p => p.category === "GTM Strategy").length
    },
    {
      name: "Theme 3: The Symptom",
      subtitle: "Underperforming Team",
      slug: "underperforming-sales-team",
      targetKeyword: "underperforming sales team",
      description: "How to diagnose if you have a talent problem or a system problem. This hub contains the '5 Red Flags' and diagnostics for fixing a broken, siloed pipeline.",
      icon: AlertCircle,
      articleCount: combinedPosts.filter(p => p.category === "Team Performance").length
    },
    {
      name: "Theme 4: The Solution",
      subtitle: "The Revenue Engine",
      slug: "allbound",
      targetKeyword: "allbound",
      description: "The blueprint for the 'Fullstack' asset. How to combine the 'Pod Architecture,' 'Signal Factory,' and 'Impact Selling OS' into one 'Allbound' system.",
      icon: Cog,
      articleCount: combinedPosts.filter(p => p.type === 'video').length
    },
    {
      name: "Theme 5: The Methodology",
      subtitle: "Impact Selling OS",
      slug: "sales-agency",
      targetKeyword: "sales agency",
      description: "The 'software' for the 'hardware.' How our 'verb-based' OS and 'Scene Partner' mindset turns reps into Operators.",
      icon: Brain,
      articleCount: combinedPosts.filter(p => p.category === "Sales Methodology").length
    }
  ], [combinedPosts]);

  return (
    <div className="min-h-screen">
      <SEO 
        title="The Lone Wolf Trap: Why SDR Outsourcing Fails When You Need Scale - Revenue Party Blog"
        description="An open-source library of strategic frameworks, financial models, and execution playbooks to build high-performance revenue engines. Deconstruct the hidden costs of traditional GTM."
        keywords="hire cold callers, b2b appointment setting services, underperforming sales team, allbound, sales agency, GTM blog, SDR outsourcing, BDR hiring costs, revenue generation system"
        canonical="/blog"
      />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="max-w-4xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" data-testid="heading-blog">
              The Lone Wolf Trap: Why SDR Outsourcing Fails When You Need Scale
            </h1>
            <p className="text-xl text-muted-foreground mb-4" data-testid="text-blog-subtitle">
              Stop renting reps. Start building revenue assets.
            </p>
            <p className="text-lg text-muted-foreground/80 mb-8 max-w-3xl" data-testid="text-blog-body">
              This isn't a blog. It's an open-source library of the strategic frameworks, financial models, and execution playbooks we use to build high-performance revenue engines. We deconstruct the hidden costs of traditional GTM and provide a clear blueprint for systematic scale.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Search articles, topics, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-6 text-lg"
                data-testid="input-blog-search"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.name}
                  variant={selectedCategory === category.name ? "default" : "outline"}
                  size="sm"
                  className="gap-2"
                  onClick={() => setSelectedCategory(category.name)}
                  data-testid={`button-category-${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Icon className="h-4 w-4" />
                  {category.name}
                  <Badge variant="secondary" className="ml-1">
                    {category.count}
                  </Badge>
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5 Strategic Content Hubs - SEO Cluster Navigation */}
      <section className="py-16 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-card/30 to-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="heading-content-hubs">
              5 Strategic Content Hubs
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Navigate our SEO cluster architecture. Each hub is a forensic deep-dive into the systems that drive (or destroy) revenue growth.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contentHubs.map((hub, index) => {
              const Icon = hub.icon;
              return (
                <motion.div
                  key={hub.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={index === 4 ? "md:col-span-2 lg:col-span-1 lg:col-start-2" : ""}
                >
                  <Card 
                    className="p-6 hover-elevate cursor-pointer group h-full"
                    data-testid={`card-hub-${hub.slug}`}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-3 bg-primary/10 rounded-md group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <Badge variant="outline" className="mb-2">
                          {hub.targetKeyword}
                        </Badge>
                        <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">
                          {hub.name}
                        </h3>
                        <p className="text-sm font-semibold text-primary/70">
                          {hub.subtitle}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      {hub.description}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t">
                      <Badge variant="secondary">{hub.articleCount} articles</Badge>
                      <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Resources */}
      <section className="py-16 px-4 md:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="heading-resource-guides">
              Featured Resource Guides
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              In-depth guides to help you navigate the modern GTM landscape
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Card 1: Internal Trap */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Link href="/resources/how-to-build-sdr-team-guide">
                <Card 
                  className="p-6 hover-elevate cursor-pointer group h-full"
                  data-testid="card-resource-sdr-team"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-destructive/10 rounded-md group-hover:bg-destructive/20 transition-colors">
                      <AlertTriangle className="h-6 w-6 text-destructive" />
                    </div>
                    <div className="flex-1">
                      <Badge variant="destructive" className="mb-3">
                        Internal Trap
                      </Badge>
                      <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                        How to Build an SDR Team
                      </h3>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    The complete guide to building an internal SDR team in 2025. Learn the real costs, hidden traps, and whether it's right for your stage.
                  </p>
                  <div className="flex items-center justify-end pt-4 border-t">
                    <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
                  </div>
                </Card>
              </Link>
            </motion.div>

            {/* Card 2: Agency Trap */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Link href="/resources/sdr-outsourcing-companies-guide">
                <Card 
                  className="p-6 hover-elevate cursor-pointer group h-full"
                  data-testid="card-resource-outsourcing"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-primary/10 rounded-md group-hover:bg-primary/20 transition-colors">
                      <ShieldAlert className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <Badge variant="outline" className="mb-3">
                        Agency Trap
                      </Badge>
                      <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                        SDR Outsourcing Companies Guide
                      </h3>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    How to evaluate SDR outsourcing providers. The 3-trap buyer's checklist and what 93% of agencies won't tell you.
                  </p>
                  <div className="flex items-center justify-end pt-4 border-t">
                    <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
                  </div>
                </Card>
              </Link>
            </motion.div>

            {/* Card 3: Solution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link href="/resources/guide-to-sales-as-a-service">
                <Card 
                  className="p-6 hover-elevate cursor-pointer group h-full"
                  data-testid="card-resource-sales-service"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-primary/10 rounded-md group-hover:bg-primary/20 transition-colors">
                      <Cog className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <Badge variant="default" className="mb-3">
                        Solution
                      </Badge>
                      <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                        Guide to Sales as a Service
                      </h3>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    What is Sales as a Service? The new category that combines the best of internal teams and agencies without the traps.
                  </p>
                  <div className="flex items-center justify-end pt-4 border-t">
                    <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
                  </div>
                </Card>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content Type Filter */}
      <section className="py-8 px-4 md:px-6 lg:px-8 bg-card/50 border-y">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-2xl font-bold" data-testid="heading-content">
              Latest Content
            </h2>
            <div className="flex gap-2">
              <Button
                variant={contentType === 'all' ? "default" : "outline"}
                size="sm"
                onClick={() => setContentType('all')}
                data-testid="button-filter-all"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                All
              </Button>
              <Button
                variant={contentType === 'articles' ? "default" : "outline"}
                size="sm"
                onClick={() => setContentType('articles')}
                data-testid="button-filter-articles"
              >
                <FileText className="h-4 w-4 mr-2" />
                Articles
              </Button>
              <Button
                variant={contentType === 'videos' ? "default" : "outline"}
                size="sm"
                onClick={() => setContentType('videos')}
                data-testid="button-filter-videos"
              >
                <Video className="h-4 w-4 mr-2" />
                Videos
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Loading State */}
      {isLoading && (
        <section className="py-12 px-4 md:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="p-6" data-testid={`skeleton-card-${i}`}>
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Error State */}
      {error && (
        <section className="py-12 px-4 md:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <Card className="p-12 text-center border-destructive" data-testid="error-state">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Failed to Load Content</h3>
              <p className="text-muted-foreground mb-4">
                We encountered an error while fetching blog posts and videos. Please try again later.
              </p>
              <Button onClick={() => window.location.reload()} data-testid="button-retry">
                Retry
              </Button>
            </Card>
          </div>
        </section>
      )}

      {/* Content Sections */}
      {!isLoading && !error && (
        <>
          {/* Featured Posts (3 most recent) */}
          {featuredPosts.length > 0 && (
            <section className="py-12 px-4 md:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold mb-8" data-testid="heading-featured">
                  Featured Posts
                </h2>
                <div className="grid lg:grid-cols-3 gap-6">
                  {featuredPosts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      {post.type === 'article' ? (
                        <Link href={`/blog/${post.slug}`}>
                          <Card className="h-full hover-elevate group cursor-pointer" data-testid={`card-featured-blog-${post.id}`}>
                            <CardHeader className="gap-2 space-y-0 pb-3">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="default">Featured</Badge>
                                {post.category && <Badge variant="outline">{post.category}</Badge>}
                              </div>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-3 flex-1">
                              {post.featuredImage && (
                                <div className="aspect-video rounded-md overflow-hidden bg-muted">
                                  <img 
                                    src={post.featuredImage} 
                                    alt={post.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                </div>
                              )}
                              <h3 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-2">
                                {post.title}
                              </h3>
                              <p className="text-muted-foreground text-sm line-clamp-3 flex-grow">
                                {post.excerpt}
                              </p>
                            </CardContent>
                            <CardFooter className="flex-col gap-3">
                              <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
                                <span>{post.author}</span>
                                <span>{format(new Date(post.publishedAt), 'MMM d, yyyy')}</span>
                              </div>
                              <Button variant="outline" className="w-full" data-testid="button-read-more">
                                Read More <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                            </CardFooter>
                          </Card>
                        </Link>
                      ) : (
                        <Card className="h-full hover-elevate group cursor-pointer" data-testid={`card-featured-video-${post.id}`}>
                          <CardHeader className="gap-2 space-y-0 pb-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="default">Featured</Badge>
                              {post.category && <Badge variant="outline">{post.category}</Badge>}
                              {post.platform && (
                                <Badge variant="secondary" className="gap-1">
                                  {post.platform === 'YouTube' ? <Youtube className="h-3 w-3" /> : <Film className="h-3 w-3" />}
                                  {post.platform}
                                </Badge>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="flex flex-col gap-3 flex-1">
                            <div className="relative aspect-video rounded-md overflow-hidden bg-muted">
                              <img 
                                src={post.thumbnailUrl} 
                                alt={post.title}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                                <Play className="h-12 w-12 text-white" />
                              </div>
                              {post.duration && (
                                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                                  {post.duration}
                                </div>
                              )}
                            </div>
                            <h3 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-2">
                              {post.title}
                            </h3>
                            <p className="text-muted-foreground text-sm line-clamp-3 flex-grow">
                              {post.description}
                            </p>
                          </CardContent>
                          <CardFooter className="flex-col gap-3">
                            <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
                              <span>{post.author}</span>
                              <span>{format(new Date(post.publishedAt), 'MMM d, yyyy')}</span>
                            </div>
                            <Button variant="outline" className="w-full" data-testid="button-watch-now">
                              Watch Now <Play className="ml-2 h-4 w-4" />
                            </Button>
                          </CardFooter>
                        </Card>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Regular Posts Grid */}
          {regularPosts.length > 0 && (
            <section className="py-12 px-4 md:px-6 lg:px-8 bg-background">
              <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold mb-8" data-testid="heading-all-posts">
                  All Posts
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularPosts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: Math.min(index * 0.05, 0.6) }}
                    >
                      {post.type === 'article' ? (
                        <Link href={`/blog/${post.slug}`}>
                          <Card className="h-full hover-elevate group cursor-pointer" data-testid={`card-blog-${post.id}`}>
                            <CardHeader className="gap-2 space-y-0 pb-3">
                              {post.category && <Badge variant="outline">{post.category}</Badge>}
                            </CardHeader>
                            <CardContent className="flex flex-col gap-3 flex-1">
                              {post.featuredImage && (
                                <div className="aspect-video rounded-md overflow-hidden bg-muted">
                                  <img 
                                    src={post.featuredImage} 
                                    alt={post.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                </div>
                              )}
                              <h3 className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-2">
                                {post.title}
                              </h3>
                              <p className="text-muted-foreground text-sm line-clamp-3 flex-grow">
                                {post.excerpt}
                              </p>
                            </CardContent>
                            <CardFooter className="flex-col gap-3">
                              <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {format(new Date(post.publishedAt), 'MMM d')}
                                </span>
                                <span>{post.author}</span>
                              </div>
                              <Button variant="ghost" size="sm" className="w-full" data-testid="button-read-article">
                                Read More <ArrowRight className="ml-2 h-3 w-3" />
                              </Button>
                            </CardFooter>
                          </Card>
                        </Link>
                      ) : (
                        <Card className="h-full hover-elevate group cursor-pointer" data-testid={`card-video-${post.id}`}>
                          <CardHeader className="gap-2 space-y-0 pb-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              {post.category && <Badge variant="outline">{post.category}</Badge>}
                              {post.platform && (
                                <Badge variant="secondary" className="gap-1">
                                  {post.platform === 'YouTube' ? <Youtube className="h-3 w-3" /> : <Film className="h-3 w-3" />}
                                  {post.platform}
                                </Badge>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="flex flex-col gap-3 flex-1">
                            <div className="relative aspect-video rounded-md overflow-hidden bg-muted">
                              <img 
                                src={post.thumbnailUrl} 
                                alt={post.title}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                                <Play className="h-10 w-10 text-white" />
                              </div>
                              {post.duration && (
                                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                                  {post.duration}
                                </div>
                              )}
                            </div>
                            <h3 className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-2">
                              {post.title}
                            </h3>
                            <p className="text-muted-foreground text-sm line-clamp-3 flex-grow">
                              {post.description}
                            </p>
                          </CardContent>
                          <CardFooter className="flex-col gap-3">
                            <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(post.publishedAt), 'MMM d')}
                              </span>
                              <span>{post.author}</span>
                            </div>
                            <Button variant="ghost" size="sm" className="w-full" data-testid="button-watch-video">
                              Watch Now <Play className="ml-2 h-3 w-3" />
                            </Button>
                          </CardFooter>
                        </Card>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Empty State */}
          {filteredPosts.length === 0 && !isLoading && !error && (
            <section className="py-16 px-4 md:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                <Card className="p-12 text-center" data-testid="empty-state">
                  <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">No Posts Found</h3>
                  <p className="text-muted-foreground mb-6">
                    {searchQuery || selectedCategory !== "All" || contentType !== 'all'
                      ? "No posts match your current filters. Try adjusting your search criteria."
                      : "No published posts available at this time. Check back soon!"}
                  </p>
                  {(searchQuery || selectedCategory !== "All" || contentType !== 'all') && (
                    <Button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory("All");
                        setContentType('all');
                      }}
                      data-testid="button-clear-filters"
                    >
                      Clear Filters
                    </Button>
                  )}
                </Card>
              </div>
            </section>
          )}
        </>
      )}

      {/* CTA Section */}
      <section className="py-16 px-4 md:px-6 lg:px-8 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4" data-testid="heading-blog-cta">
            Ready to Build Your Revenue Engine?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Stop reading about it. Start building it. Get a complete GTM audit and blueprint in 60 minutes.
          </p>
          <Button size="lg" asChild data-testid="button-blog-cta">
            <Link href="/audit">
              Schedule GTM Audit
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}