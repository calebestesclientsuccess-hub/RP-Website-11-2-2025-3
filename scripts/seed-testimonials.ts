import { db } from "../server/db";
import { testimonials } from "../shared/schema";

const sampleTestimonials = [
  {
    name: "Sarah Chen",
    title: "VP of Sales",
    company: "TechVenture Inc",
    quote: "Revenue Party built a GTM engine that delivered 3x our pipeline in just 60 days. The system doesn't just work—it compounds. We own all the IP and can scale it whenever we want.",
    rating: 5,
    featured: true,
    avatarUrl: null,
    metrics: "3x pipeline in 60 days",
    industry: "B2B SaaS",
    companySize: "50-100",
  },
  {
    name: "Michael Rodriguez",
    title: "Founder & CEO",
    company: "DataFlow Systems",
    quote: "After burning $198k on two failed SDR hires, we switched to Revenue Party. Now we have a system that actually works—20+ qualified meetings monthly, all tracked, all transparent.",
    rating: 5,
    featured: true,
    avatarUrl: null,
    metrics: "20+ SQOs monthly",
    industry: "Data Analytics",
    companySize: "20-50",
  },
  {
    name: "Jessica Park",
    title: "Chief Revenue Officer",
    company: "CloudScale Partners",
    quote: "The difference is night and day. Instead of managing a revolving door of reps, we have a self-sustaining engine. It ramps in 14 days, not 6 months. Game-changer.",
    rating: 5,
    featured: true,
    avatarUrl: null,
    metrics: "14-day ramp time",
    industry: "Cloud Infrastructure",
    companySize: "100-200",
  },
  {
    name: "David Thompson",
    title: "Head of Growth",
    company: "InnovateTech",
    quote: "Revenue Party's GTM Engine transformed our outbound strategy. We went from sporadic results to predictable pipeline generation. The ROI speaks for itself—60% cost savings vs our old model.",
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
