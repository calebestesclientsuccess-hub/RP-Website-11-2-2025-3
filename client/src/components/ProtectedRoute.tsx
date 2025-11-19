// Demo mode - all routes are accessible without authentication
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // In demo mode, all routes are accessible
  return <>{children}</>;
}
