import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Brain
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";

interface BlogArticle {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  featured?: boolean;
  tags: string[];
  slug: string;
  contentHub?: string;
}

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { name: "All", icon: BookOpen, count: 24 },
    { name: "Hiring & Costs", icon: DollarSign, count: 6 },
    { name: "Team Performance", icon: Users, count: 7 },
    { name: "GTM Strategy", icon: Target, count: 8 },
    { name: "Sales Methodology", icon: Brain, count: 3 }
  ];

  const articles: BlogArticle[] = [
    // Featured Articles
    {
      id: "1",
      title: "The $198k Mistake: The True All-In Cost of Your Next BDR Hire",
      excerpt: "When you factor in recruiting costs, ramp time, management overhead, tech stack, and the 33% failure rate, that 'affordable' BDR hire actually costs you nearly $200k in year one. Here's the math nobody wants to show you.",
      category: "Hiring & Costs",
      readTime: "8 min read",
      date: "Dec 15, 2024",
      featured: true,
      tags: ["BDR costs", "hiring economics", "ROI analysis"],
      slug: "198k-mistake-true-cost-bdr-hire",
      contentHub: "hiring-economics"
    },
    {
      id: "2",
      title: "Why Your SDR Isn't Booking Meetings (And It's Not Their Fault)",
      excerpt: "Your SDR is smart, motivated, and works hard. Yet they're struggling to book meetings. The problem isn't talent—it's the system. Learn why individual contributor models fail at scale.",
      category: "Team Performance",
      readTime: "6 min read",
      date: "Dec 12, 2024",
      featured: true,
      tags: ["SDR performance", "systems thinking", "pipeline generation"],
      slug: "sdr-not-booking-meetings",
      contentHub: "performance-optimization"
    },
    {
      id: "3",
      title: "The Signal Factory: How AI Changes the Outbound Game Forever",
      excerpt: "Stop spraying and praying. The future of outbound is precision targeting based on private buying signals. Learn how AI-powered signal detection creates a 10x improvement in response rates.",
      category: "GTM Strategy",
      readTime: "10 min read",
      date: "Dec 10, 2024",
      featured: true,
      tags: ["AI", "signal detection", "outbound strategy"],
      slug: "signal-factory-ai-outbound",
      contentHub: "ai-powered-gtm"
    },
    // Regular Articles
    {
      id: "4",
      title: "Impact Selling: The Methodology That Creates Urgency Without Pressure",
      excerpt: "Traditional sales methodologies create resistance. Impact Selling creates momentum by focusing on business outcomes, not features. Here's how to implement it in your organization.",
      category: "Sales Methodology",
      readTime: "7 min read",
      date: "Dec 8, 2024",
      tags: ["impact selling", "sales training", "methodology"],
      slug: "impact-selling-methodology",
      contentHub: "sales-methodology"
    },
    {
      id: "5",
      title: "The Management Tax: Why Managing One BDR Costs You $100k+",
      excerpt: "Between hiring, onboarding, daily management, and performance reviews, you're spending 20+ hours per week on a single BDR. That's $100k+ of leadership time. There's a better way.",
      category: "Hiring & Costs",
      readTime: "5 min read",
      date: "Dec 5, 2024",
      tags: ["management overhead", "cost analysis", "efficiency"],
      slug: "management-tax-bdr-costs",
      contentHub: "hiring-economics"
    },
    {
      id: "6",
      title: "From 0 to 20 Meetings: The 30-Day GTM Playbook",
      excerpt: "Most companies take 3-6 months to build a functioning outbound motion. We do it in 30 days. Here's the exact playbook we use to go from zero to pipeline velocity.",
      category: "GTM Strategy",
      readTime: "12 min read",
      date: "Dec 3, 2024",
      tags: ["playbook", "quick wins", "implementation"],
      slug: "30-day-gtm-playbook",
      contentHub: "gtm-playbooks"
    },
    {
      id: "7",
      title: "The Lone Wolf Fallacy: Why Single-Threaded Sales Teams Fail",
      excerpt: "Betting your growth on individual heroes is a losing game. Learn why team-based selling systems outperform lone wolves by 3x, and how to make the transition.",
      category: "Team Performance",
      readTime: "6 min read",
      date: "Nov 30, 2024",
      tags: ["team structure", "scaling", "performance"],
      slug: "lone-wolf-fallacy",
      contentHub: "performance-optimization"
    },
    {
      id: "8",
      title: "Tech Stack Bloat: The Hidden $50k Annual Tax on Your Sales Team",
      excerpt: "The average sales team uses 10+ tools that don't talk to each other. This fragmentation costs you $50k+ annually in licenses, integration, and lost productivity. Here's how to fix it.",
      category: "GTM Strategy",
      readTime: "8 min read",
      date: "Nov 28, 2024",
      tags: ["tech stack", "tools", "optimization"],
      slug: "tech-stack-bloat",
      contentHub: "sales-operations"
    },
    {
      id: "9",
      title: "The Ramp Time Myth: Why Your New BDR Won't Be Productive for 6 Months",
      excerpt: "Industry average ramp time for a new BDR is 3-6 months. That's $75k-$100k in salary before they book their first qualified meeting. Learn how to cut this to 2 weeks.",
      category: "Hiring & Costs",
      readTime: "7 min read",
      date: "Nov 25, 2024",
      tags: ["onboarding", "ramp time", "productivity"],
      slug: "ramp-time-myth",
      contentHub: "hiring-economics"
    },
    {
      id: "10",
      title: "Data Enrichment at Scale: The Competitive Advantage Nobody Talks About",
      excerpt: "Clean, enriched data is the difference between 2% and 20% response rates. Learn how to build a data enrichment engine that gives you an unfair advantage.",
      category: "GTM Strategy",
      readTime: "9 min read",
      date: "Nov 22, 2024",
      tags: ["data", "enrichment", "competitive advantage"],
      slug: "data-enrichment-scale",
      contentHub: "data-operations"
    },
    {
      id: "11",
      title: "The Weekly Strategy Session: How 2 Hours Can 10x Your Pipeline",
      excerpt: "Most sales teams meet to review numbers. High-performance teams meet to optimize strategy. Learn the exact framework for weekly sessions that drive continuous improvement.",
      category: "Team Performance",
      readTime: "5 min read",
      date: "Nov 20, 2024",
      tags: ["strategy", "meetings", "optimization"],
      slug: "weekly-strategy-session",
      contentHub: "performance-optimization"
    },
    {
      id: "12",
      title: "Cold Calling is Dead. Long Live Warm Calling.",
      excerpt: "Nobody answers cold calls anymore. But warm calls—powered by intent data and proper timing—have a 40% connect rate. Here's how to make the shift.",
      category: "Sales Methodology",
      readTime: "6 min read",
      date: "Nov 18, 2024",
      tags: ["calling", "outbound", "strategy"],
      slug: "warm-calling-strategy",
      contentHub: "sales-methodology"
    }
  ];

  // Filter articles based on category and search
  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === "All" || article.category === selectedCategory;
    const matchesSearch = searchQuery === "" || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredArticles = filteredArticles.filter(a => a.featured);
  const regularArticles = filteredArticles.filter(a => !a.featured);

  // Group articles by content hub for SEO
  const contentHubs = [
    {
      name: "Hiring Economics Hub",
      slug: "hiring-economics",
      description: "Everything you need to know about the true costs of sales hiring",
      articleCount: articles.filter(a => a.contentHub === "hiring-economics").length
    },
    {
      name: "Performance Optimization Hub",
      slug: "performance-optimization",
      description: "Strategies and tactics for maximizing team performance",
      articleCount: articles.filter(a => a.contentHub === "performance-optimization").length
    },
    {
      name: "GTM Playbooks Hub",
      slug: "gtm-playbooks",
      description: "Proven playbooks for go-to-market success",
      articleCount: articles.filter(a => a.contentHub === "gtm-playbooks").length
    },
    {
      name: "Sales Operations Hub",
      slug: "sales-operations",
      description: "Optimize your sales tech stack and processes",
      articleCount: articles.filter(a => a.contentHub === "sales-operations").length
    }
  ];

  return (
    <div className="min-h-screen">
      <SEO 
        title="GTM Blueprints - Revenue Party Blog"
        description="Expert insights on building revenue generation systems, escaping hiring traps, and scaling B2B SaaS sales effectively."
        keywords="GTM blog, sales resources, revenue insights, B2B SaaS, SDR outsourcing, BDR hiring costs"
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
            <p className="text-xl text-muted-foreground mb-8" data-testid="text-blog-subtitle">
              Stop renting reps. Start building revenue assets.
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

      {/* Content Hubs for SEO */}
      <section className="py-8 px-4 md:px-6 lg:px-8 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-6" data-testid="heading-content-hubs">
            Explore Our Content Hubs
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {contentHubs.map((hub) => (
              <Card 
                key={hub.slug} 
                className="p-4 hover-elevate cursor-pointer"
                data-testid={`card-hub-${hub.slug}`}
              >
                <h3 className="font-semibold mb-2">{hub.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{hub.description}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{hub.articleCount} articles</Badge>
                  <ArrowRight className="h-4 w-4 text-primary" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      {featuredArticles.length > 0 && (
        <section className="py-12 px-4 md:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-8" data-testid="heading-featured">
              Featured Articles
            </h2>
            <div className="grid lg:grid-cols-3 gap-6">
              {featuredArticles.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="h-full hover-elevate group cursor-pointer" data-testid={`card-featured-${article.id}`}>
                    <div className="p-6 flex flex-col h-full">
                      <div className="flex items-center gap-2 mb-4">
                        <Badge variant="default">Featured</Badge>
                        <Badge variant="outline">{article.category}</Badge>
                      </div>
                      <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-muted-foreground mb-4 flex-grow">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {article.readTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {article.date}
                          </span>
                        </div>
                        <ArrowRight className="h-4 w-4 group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Regular Articles Grid */}
      <section className="py-12 px-4 md:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-8" data-testid="heading-all-articles">
            All Articles
          </h2>
          {regularArticles.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">
                No articles found matching your search criteria.
              </p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {regularArticles.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: Math.min(index * 0.1, 0.6) }}
                >
                  <Card className="hover-elevate group cursor-pointer" data-testid={`card-article-${article.id}`}>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline">{article.category}</Badge>
                        <span className="text-sm text-muted-foreground">{article.date}</span>
                      </div>
                      <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-muted-foreground mb-4 text-sm">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-2">
                          {article.tags.slice(0, 2).map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {article.readTime}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

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
