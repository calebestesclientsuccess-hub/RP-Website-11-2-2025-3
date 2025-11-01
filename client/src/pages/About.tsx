import { SEO } from "@/components/SEO";

export default function About() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SEO 
        title="Why Revenue Party - Community + Competition = Culture"
        description="Our culture is your competitive advantage. Elite BDRs in collaborative pods with transparent competition drive exceptional results."
        keywords="Revenue Party, GTM consultancy, sales culture, elite BDRs"
        canonical="/why-us"
      />
      <h1 className="text-4xl font-bold" data-testid="heading-why-us">
        Why Revenue Party? ("Why Us?")
      </h1>
    </div>
  );
}
