import { SEO } from "@/components/SEO";
import { Helmet } from 'react-helmet-async';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { WidgetZone } from "@/components/WidgetZone";
import { 
  Search, 
  Calendar, 
  ArrowRight, 
  Users, 
  DollarSign, 
  Target,
  BookOpen,
  Brain,
  Play,
  FileText,
  Video,
  Youtube,
  Film,
  ArrowUpDown,
  SortAsc,
  SortDesc,
  Lightbulb,
  AlertCircle
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import type { BlogPostSummary, VideoPost } from "@shared/schema";
import { format } from "date-fns";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Placeholder for BlogPostSkeleton component
const BlogPostSkeleton = () => (
  <Card className="p-6" data-testid="skeleton-card">
    <Skeleton className="h-6 w-3/4 mb-4" />
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-2/3 mb-4" />
    <div className="flex gap-2">
      <Skeleton className="h-6 w-20" />
      <Skeleton className="h-6 w-20" />
    </div>
  </Card>
);

type CombinedPost = (BlogPostSummary & { type: 'article' }) | (VideoPost & { type: 'video' });

const ITEMS_PER_PAGE = 12;

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [contentType, setContentType] = useState<'all' | 'articles' | 'videos'>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'title-asc' | 'title-desc'>('date-desc');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch blog posts
  const { data: blogPosts, isLoading: blogLoading, error: blogError } = useQuery<BlogPostSummary[]>({
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

  // Filter and sort posts based on category, search, content type, and sorting
  const filteredPosts = useMemo(() => {
    let filtered = combinedPosts.filter(post => {
      // Content type filter
      if (contentType === 'articles' && post.type !== 'article') return false;
      if (contentType === 'videos' && post.type !== 'video') return false;

      // Category filter
      const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;

      // Search filter - search in title (H1) and category (acts as H2)
      const matchesSearch = searchQuery === "" || 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.category && post.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (post.type === 'article' && post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (post.type === 'video' && post.description.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
        case 'date-desc':
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });
  }, [combinedPosts, selectedCategory, searchQuery, contentType, sortBy]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, contentType, sortBy]);

  // Clamp currentPage if filteredPosts shrinks (e.g., data refresh)
  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filteredPosts.length / ITEMS_PER_PAGE));
    if (currentPage > maxPage) {
      setCurrentPage(maxPage);
    }
  }, [filteredPosts.length, currentPage]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / ITEMS_PER_PAGE));
  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPosts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredPosts, currentPage]);

  const isLoading = blogLoading || videoLoading;
  const error = blogError || videoError;

  return (
    <div className="min-h-screen" id="main-content">
      <SEO 
        title="The Lone Wolf Trap: Why SDR Outsourcing Fails When You Need Scale - Revenue Party Blog"
        description="An open-source library of strategic frameworks, financial models, and execution playbooks to build high-performance revenue engines. Deconstruct the hidden costs of traditional GTM."
        keywords="hire cold callers, b2b appointment setting services, underperforming sales team, allbound, sales agency, GTM blog, SDR outsourcing, BDR hiring costs, revenue generation system"
        canonical="/blog"
      />

      <Helmet>
        <meta property="og:type" content="website" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </Helmet>

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

      {/* Top Widget Zone */}
      <WidgetZone zone="zone-1" className="my-8" />

      {/* Categories Filter */}
      <section className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.name;
              return (
                <Button
                  key={category.name}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  className="gap-2 min-h-[36px]"
                  onClick={() => setSelectedCategory(category.name)}
                  data-testid={`button-category-${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{category.name}</span>
                  <span className={`ml-1 text-xs font-medium px-1.5 py-0.5 rounded-md ${
                    isActive 
                      ? 'bg-primary-foreground/20 text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {category.count}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Middle Widget Zone */}
      <WidgetZone zone="zone-2" className="my-8" />

      {/* Widget Zone 12 */}
      <WidgetZone zone="zone-12" className="my-8" />

      {/* Widget Zone 13 */}
      <WidgetZone zone="zone-13" className="my-8" />

      {/* Content Type Filter and Sorting */}
      <section className="py-8 px-4 md:px-6 lg:px-8 bg-card/50 border-y">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-2xl font-bold" data-testid="heading-content">
              All Content ({filteredPosts.length})
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              {/* Content Type Filter */}
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

              {/* Sorting Options */}
              <div className="flex items-center gap-2 border-l pl-3">
                <span className="text-sm text-muted-foreground hidden sm:inline">Sort:</span>
                <div className="flex gap-2">
                  <Button
                    variant={sortBy === 'date-desc' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSortBy('date-desc')}
                    data-testid="button-sort-date-desc"
                  >
                    <SortDesc className="h-4 w-4 mr-1" />
                    Newest
                  </Button>
                  <Button
                    variant={sortBy === 'date-asc' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSortBy('date-asc')}
                    data-testid="button-sort-date-asc"
                  >
                    <SortAsc className="h-4 w-4 mr-1" />
                    Oldest
                  </Button>
                  <Button
                    variant={sortBy.startsWith('title') ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSortBy(sortBy === 'title-asc' ? 'title-desc' : 'title-asc')}
                    data-testid="button-sort-title"
                  >
                    <ArrowUpDown className="h-4 w-4 mr-1" />
                    A-Z
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Widget Zone */}
      <WidgetZone zone="zone-4" className="my-8" />

      {/* Widget Zone 14 */}
      <WidgetZone zone="zone-14" className="my-8" />

      {/* Loading State */}
      {isLoading && (
        <section className="py-12 px-4 md:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <BlogPostSkeleton key={i} />
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

      {/* All Posts Grid */}
      {!isLoading && !error && filteredPosts.length > 0 && (
        <section className="py-12 px-4 md:px-6 lg:px-8 bg-background">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {paginatedPosts.map((post, index) => (
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
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline">Article</Badge>
                            {post.category && <Badge variant="secondary">{post.category}</Badge>}
                          </div>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3 flex-1">
                          {post.featuredImage && (
                            <div className="aspect-video rounded-md overflow-hidden bg-muted">
                              <img 
                                src={post.featuredImage} 
                                alt={`${post.title} - ${post.category || 'GTM strategy'} guide for B2B sales teams and revenue generation`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
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
                          <Badge variant="outline" className="gap-1">
                            <Video className="h-3 w-3" />
                            Video
                          </Badge>
                          {post.category && <Badge variant="secondary">{post.category}</Badge>}
                          {post.platform && (
                            <Badge variant="default" className="gap-1">
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
                            loading="lazy"
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

      {/* Pagination */}
      {!isLoading && !error && totalPages > 1 && (
        <section 
          className="py-8 px-4 md:px-6 lg:px-8 bg-background border-t"
          aria-label="Articles & Videos pagination"
        >
          <div className="max-w-7xl mx-auto">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) {
                        setCurrentPage((prev) => prev - 1);
                        if (typeof window !== "undefined") {
                          document.getElementById("main-content")?.scrollIntoView({ behavior: "smooth" });
                        }
                      }
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    aria-disabled={currentPage === 1}
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }).map((_, index) => {
                  const pageNumber = index + 1;
                  
                  // Show first page, last page, current page, and pages around current
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          href="#"
                          size="default"
                          isActive={pageNumber === currentPage}
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(pageNumber);
                            if (typeof window !== "undefined") {
                              document.getElementById("main-content")?.scrollIntoView({ behavior: "smooth" });
                            }
                          }}
                          className="cursor-pointer"
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                  
                  // Show ellipsis for gaps
                  if (
                    pageNumber === currentPage - 2 ||
                    pageNumber === currentPage + 2
                  ) {
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }
                  
                  return null;
                })}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) {
                        setCurrentPage((prev) => prev + 1);
                        if (typeof window !== "undefined") {
                          document.getElementById("main-content")?.scrollIntoView({ behavior: "smooth" });
                        }
                      }
                    }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    aria-disabled={currentPage === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
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