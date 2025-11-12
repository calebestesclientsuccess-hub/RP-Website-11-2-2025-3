import { db } from "../server/db";
import { testimonials } from "../shared/schema";

const sampleTestimonials = [
  {
    name: "Clifton Steele",
    title: "CEO",
    company: "Techtronics",
    quote: "We needed to scale, and hiring more reps wasn't working. Revenue Party came in and built the actual system, the architecture, we've been missing. Our pipeline is up 3x, yes, but the real win is that we finally have a scalable asset. We own the process, we own the IP. It's ours.",
    rating: 5,
    featured: true,
    avatarUrl: null,
    metrics: "3x pipeline in 60 days",
    industry: "B2B SaaS",
    companySize: "50-100",
  },
  {
    name: "Daniel Robinson",
    title: "CEO",
    company: "SEO My Clicks",
    quote: "We lit a lot of money on fire with two bad SDR hires back-to-back. I was done gambling on 'superstars.' Revenue Party was a different conversation. They talked about process and transparency. Now, we just have a system that works. We see 20+ qualified meetings hit the board every month, and I can actually see the data. It's just... predictable.",
    rating: 5,
    featured: true,
    avatarUrl: null,
    metrics: "20+ SQOs monthly",
    industry: "Data Analytics",
    companySize: "20-50",
  },
  {
    name: "Samuel Jacobs",
    title: "CTO",
    company: "Transition Analytica",
    quote: "Our product isn't simple. The value prop is highly technical and the sales cycle is long. You can't just throw a new rep at it and hope they learn. It doesn't work. Revenue Party was the first group that didn't talk about 'reps.' They talked about 'architecture.' They built a methodical GTM system that can actually handle our complexity. It's the only outbound model that has ever stuck.",
    rating: 5,
    featured: true,
    avatarUrl: null,
    metrics: "14-day ramp time",
    industry: "Cloud Infrastructure",
    companySize: "100-200",
  },
  {
    name: "Ellie Cohen",
    title: "CFO",
    company: "Get ADA Alert",
    quote: "Our old GTM model was a black hole. The volatility was the biggest issue. We were constantly hiring and training, and the cost-per-lead was all over the place. It made forecasting impossible. Revenue Party's model stabilized the entire operation. Our costs are 60% lower, but more importantly, they're predictable. I can finally build a financial plan that trusts the pipeline.",
    rating: 5,
    featured: true,
    avatarUrl: null,
    metrics: "60% cost savings",
    industry: "Marketing Tech",
    companySize: "30-50",
  },
];

async function seedTestimonials() {
  try {
    console.log("Seeding testimonials...");
    
    // Delete existing testimonials first
    console.log("Deleting existing testimonials...");
    await db.delete(testimonials);
    console.log("✓ Cleared existing testimonials");
    
    // Insert new testimonials
    for (const testimonial of sampleTestimonials) {
      await db.insert(testimonials).values(testimonial);
      console.log(`✓ Added testimonial from ${testimonial.name}`);
    }
    
    console.log("\n✓ Successfully seeded all testimonials!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding testimonials:", error);
    process.exit(1);
  }
}

seedTestimonials();
