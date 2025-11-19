// Simplified ProtectedRoute for demo mode - always allows access
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // In demo mode, all routes are accessible
  return <>{children}</>;
}