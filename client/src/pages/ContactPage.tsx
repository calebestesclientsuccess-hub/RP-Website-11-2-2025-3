import { Breadcrumbs } from "@/components/Breadcrumbs";

export default function ContactPage() {
  return (
    <>
      <Breadcrumbs items={[]} currentPage="Contact Us" />
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-4xl font-bold" data-testid="heading-contact">
          Contact Us / Careers
        </h1>
      </div>
    </>
  );
}
