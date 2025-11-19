import { db } from "./db";
import { tenants, blogPosts, videoPosts, widgetConfig, testimonials, jobPostings } from "@shared/schema";
import { DEFAULT_TENANT_ID } from "./middleware/tenant";

async function seed() {
  console.log("Seeding database...");

  // Seed default tenant
  await db.insert(tenants).values([
    {
      id: DEFAULT_TENANT_ID,
      name: "Revenue Party",
      slug: "revenueparty",
    },
  ]);

  // Seed blog posts
  await db.insert(blogPosts).values([
    {
      tenantId: DEFAULT_TENANT_ID,
      title: "The Complete Guide to Building a GTM Engine That Actually Works",
      slug: "complete-guide-gtm-engine",
      excerpt: "Most B2B companies approach GTM like they're assembling IKEA furniture without the instructions. Here's how to build a revenue generation system that compounds over time.",
      content: `# The Complete Guide to Building a GTM Engine That Actually Works

Most B2B companies approach go-to-market like they're assembling IKEA furniture without the instructions. They hire a SDR, buy some software, and hope the pipeline materializes.

It doesn't.

## Why Traditional GTM Fails

The problem isn't effort—it's architecture. Most teams are optimizing individual components (better emails! more calls! new tech stack!) without understanding how those components should work together as a system.

## The Three Core Components

A working GTM engine has three interlocking systems:

1. **Elite Talent**: Not just "an SDR" but someone trained in a repeatable methodology
2. **Tech Stack**: Integrated tools for data, outreach, and analytics
3. **Strategic Framework**: Weekly optimization loops that compound results

When these three systems interlock properly, you get predictable pipeline generation. Not hope. Not heroics. Just math.

## Implementation Timeline

Week 1-2: Audit & Design
Week 3-4: Pod Activation
Week 5+: Optimization & Scale

The difference between companies that win and companies that struggle isn't talent or budget. It's system design.`,
      author: "Revenue Party Team",
      published: true,
    },
    {
      tenantId: DEFAULT_TENANT_ID,
      title: "Why Your SDR Isn't Hitting Quota (And It's Not Their Fault)",
      slug: "why-bdrs-miss-quota",
      excerpt: "If your SDR is struggling, the problem probably isn't the SDR. It's the invisible infrastructure they need to succeed.",
      content: `# Why Your SDR Isn't Hitting Quota (And It's Not Their Fault)

You hired a great SDR. Smart, hungry, coachable. Three months in, they're at 40% of quota and you're wondering what went wrong.

Here's what actually happened: You asked them to build a house without tools.

## The Missing Infrastructure

Most companies give their SDRs:
- A list (maybe)
- A CRM login
- A "just figure it out" mandate

What they actually need:
- **Data infrastructure**: Not just names, but buying signals
- **Strategic framework**: Not just "make calls" but when, to whom, and why
- **Technology stack**: Integrated tools that multiply effort
- **Coaching loops**: Weekly optimization, not quarterly reviews

## The Math Problem

An SDR making 50 calls a day with 2% connect rate and 10% conversion gets:
- 1 qualified appointment per day
- ~20 per month

The same SDR with proper infrastructure:
- Better targeting → 5% connect rate
- Better messaging → 15% conversion
- Result: 3.75 appointments per day, 75+ per month

Same person. Different system.

## What Actually Works

The companies hitting SDR quotas consistently aren't hiring better. They're architecting better.

They deploy SDRs as part of a complete system—talent plus tech plus strategy—not as solo operators hoping to figure it out.`,
      author: "Revenue Party Team",
      published: true,
    },
    {
      tenantId: DEFAULT_TENANT_ID,
      title: "The Signal Factory: How AI Finds Your Next Customer Before They Know They're Shopping",
      slug: "signal-factory-ai-buying-signals",
      excerpt: "The best time to reach a prospect is before they enter their buying journey. Here's how modern AI finds those invisible signals.",
      content: `# The Signal Factory: Finding Buyers Before They're Shopping

Traditional prospecting waits for intent signals: job postings, funding rounds, technology changes.

By then, you're competing with 47 other vendors who saw the same signal.

## Private Buying Signals

The future of B2B prospecting isn't public intent data. It's private signal detection:

- **Technical debt accumulation**: Systems showing strain before breaking
- **Team composition shifts**: Headcount patterns that predict buying
- **Engagement micro-patterns**: Small behavioral changes that compound

These signals appear 3-6 months before traditional intent data. They're invisible to competitors using standard tools.

## How It Works

Our Signal Factory combines:
1. **Data aggregation**: 40+ sources per account
2. **Pattern recognition**: ML models trained on closed-won deals
3. **Signal prioritization**: Predictive scoring that actually predicts

The output: A daily feed of accounts entering their buying window, before they know they're shopping.

## The Competitive Advantage

When you reach prospects before the RFP process starts, you're not selling—you're educating. You're not competing—you're defining the category.

That's the difference between winning 15% of deals and winning 60%.`,
      author: "Revenue Party Team",
      published: true,
    },
  ]);

  // Seed testimonials
  await db.insert(testimonials).values([
    {
      tenantId: DEFAULT_TENANT_ID,
      name: "Sarah Chen",
      title: "VP of Sales",
      company: "TechFlow",
      quote: "We went from 2-3 qualified meetings per month to 20+ in the first 60 days. The system just works.",
      rating: 5,
      featured: true,
    },
    {
      tenantId: DEFAULT_TENANT_ID,
      name: "Marcus Johnson",
      title: "Founder & CEO",
      company: "DataPulse",
      quote: "Finally, predictable pipeline. The GTM engine delivered exactly what they promised—and the ROI is insane.",
      rating: 5,
      featured: true,
    },
    {
      tenantId: DEFAULT_TENANT_ID,
      name: "Emily Rodriguez",
      title: "Head of Growth",
      company: "CloudScale",
      quote: "Revenue Party built us a complete revenue system in 2 weeks. What took our competitors 6 months to figure out.",
      rating: 5,
      featured: true,
    },
    {
      tenantId: DEFAULT_TENANT_ID,
      name: "David Kim",
      title: "CRO",
      company: "SalesTech Inc",
      quote: "The Signal Factory is incredible. We're reaching prospects before our competitors even know they exist.",
      rating: 5,
      featured: false,
    },
  ]);

  // Seed job postings
  await db.insert(jobPostings).values([
    {
      tenantId: DEFAULT_TENANT_ID,
      title: "Senior GTM Strategist",
      department: "Strategy",
      location: "Remote (US)",
      type: "Full-time",
      description: `We're looking for an experienced GTM strategist who can architect revenue systems for fast-growing B2B companies.

You'll work directly with founders and revenue leaders to design, deploy, and optimize complete GTM engines. This isn't execution work—it's system architecture.

**What you'll do:**
- Lead GTM strategy engagements from audit to optimization
- Design complete revenue systems (talent + tech + strategy)
- Manage multiple client engagements simultaneously
- Build playbooks that scale across different industries

**Impact:**
You'll be responsible for designing systems that generate millions in pipeline for our clients. Your strategic decisions directly impact client revenue.`,
      requirements: `**Required:**
- 5+ years in B2B sales or GTM roles
- Experience designing and implementing sales processes
- Deep understanding of modern GTM tech stacks
- Track record of hitting/exceeding revenue targets

**Preferred:**
- Management consulting background
- Experience with AI/ML tools for sales
- Strong analytical and systems thinking skills
- Excellent written and verbal communication`,
      active: true,
    },
    {
      tenantId: DEFAULT_TENANT_ID,
      title: "Elite SDR (Client Deployment)",
      department: "Client Success",
      location: "Remote (US)",
      type: "Full-time",
      description: `We deploy you as part of a Fully Loaded SDR Pod into high-growth B2B companies.

This isn't a typical SDR role. You'll operate as a strategic extension of the client's revenue team, with full infrastructure support from our team.

**What makes this different:**
- You're deployed with complete tech stack (we cover licenses)
- Strategic support from dedicated GTM strategists
- Access to our proprietary Signal Factory for targeting
- Weekly coaching and optimization loops

**What you'll do:**
- Generate qualified pipeline for fast-growing B2B clients
- Execute strategic outbound campaigns
- Collaborate with client sales teams
- Contribute to playbook development`,
      requirements: `**Required:**
- 2+ years of B2B sales/SDR experience
- Proven track record of hitting quota
- Excellent written and verbal communication
- Self-directed and highly organized

**Preferred:**
- Experience in SaaS or technology sales
- Familiarity with modern sales tech stacks
- Strong analytical mindset
- Coachable and growth-oriented`,
      active: true,
    },
    {
      tenantId: DEFAULT_TENANT_ID,
      title: "Revenue Operations Analyst",
      department: "Operations",
      location: "Remote (US)",
      type: "Full-time",
      description: `We're building the data infrastructure that powers our Signal Factory and client GTM engines.

You'll work on data pipelines, analytics systems, and the tools that help our strategists make better decisions.

**What you'll build:**
- Data pipelines aggregating 40+ sources per account
- Analytics dashboards for client performance tracking
- Predictive models for signal prioritization
- Integration systems connecting client tech stacks

**Impact:**
Your work directly improves the quality of signals we deliver and the performance of deployed SDR Pods.`,
      requirements: `**Required:**
- 3+ years in revenue operations or data analytics
- Strong SQL and data manipulation skills
- Experience with CRM systems (Salesforce, HubSpot, etc.)
- Understanding of B2B sales metrics and KPIs

**Preferred:**
- Python or similar programming language
- Experience with ML/AI tools
- Background in sales or GTM roles
- System architecture thinking`,
      active: true,
    },
  ]);

  console.log("✅ Database seeded successfully!");
}

seed().catch((error) => {
  console.error("Error seeding database:", error);
  process.exit(1);
});