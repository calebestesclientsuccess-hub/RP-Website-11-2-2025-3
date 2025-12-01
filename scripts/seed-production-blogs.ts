import { db } from "../server/db";
import { blogPosts } from "../shared/schema";
import { eq, and } from "drizzle-orm";

export const PRODUCTION_BLOGS = [
  {
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
];

export async function seedProductionBlogs(tenantId: string) {
  console.log("📝 Seeding production blog posts...");
  
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const blog of PRODUCTION_BLOGS) {
    const existing = await db.query.blogPosts.findFirst({
      where: and(
        eq(blogPosts.tenantId, tenantId),
        eq(blogPosts.slug, blog.slug)
      ),
    });

    if (existing) {
      // Update content if it exists
      await db.update(blogPosts)
        .set({
          ...blog,
          updatedAt: new Date(),
        })
        .where(eq(blogPosts.id, existing.id));
      console.log(`  ⬆️  Updated: ${blog.title}`);
      updated++;
    } else {
      await db.insert(blogPosts).values({
        ...blog,
        tenantId,
      });
      console.log(`  ✅ Created: ${blog.title}`);
      created++;
    }
  }

  console.log(`\n📊 Summary: ${created} created, ${updated} updated, ${skipped} skipped`);
  return { created, updated, skipped };
}

// Can be run standalone
if (import.meta.url === `file://${process.argv[1]}`) {
  const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID || "revenueparty-default";
  
  seedProductionBlogs(DEFAULT_TENANT_ID)
    .then((result) => {
      console.log(`\n✅ Blog posts seeding complete!`);
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seed failed:", error);
      process.exit(1);
    });
}

