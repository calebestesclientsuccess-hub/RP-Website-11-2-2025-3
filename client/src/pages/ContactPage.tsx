import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEO } from "@/components/SEO";
import { WidgetZone } from "@/components/WidgetZone";
import { Input } from "@/components/ui/input";
import { ValidatedInput, validationRules } from "@/components/ui/validated-input";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  return (
    <>
      <SEO 
        title="Contact Us - Let's Build Your GTM System | Revenue Party"
        description="Ready to escape the hiring trap? Contact us to schedule your free GTM audit and transform your revenue generation."
        keywords="contact Revenue Party, GTM consultation, sales inquiry"
        canonical="/contact"
      />
      <Breadcrumbs items={[]} currentPage="Contact Us" />

      {/* Top Widget Zone */}
      <WidgetZone zone="zone-1" className="my-8" />

      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-4xl font-bold" data-testid="heading-contact">
          Contact Us / Careers
        </h1>
      </div>

      {/* Middle Widget Zone */}
      <WidgetZone zone="zone-11" className="my-8" />

      {/* Bottom Widget Zone */}
      <WidgetZone zone="zone-4" className="my-8" />
    </>
  );
}