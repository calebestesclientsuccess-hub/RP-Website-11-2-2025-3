export default function AuditPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold" data-testid="heading-audit">
          Schedule GTM Audit
        </h1>
        <p className="text-muted-foreground" data-testid="text-audit-note">
          Note: This page will contain the Calendly/form embed
        </p>
      </div>
    </div>
  );
}
