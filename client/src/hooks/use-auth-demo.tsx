import { createContext, useContext } from "react";

// Mock user for demo mode
const DEMO_USER = {
  id: 'demo_user_01',
  username: 'demo_user',
  email: 'demo@example.com',
  tenantId: 'demo_tenant_01'
};

interface AuthContextType {
  user: typeof DEMO_USER;
  isLoading: boolean;
  login: () => Promise<void>;
  register: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simplified auth provider for demo mode - always returns demo user
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Mock functions that do nothing - no real auth
  const login = async () => {
    console.log('Demo mode - login not required');
  };

  const register = async () => {
    console.log('Demo mode - registration not required');
  };

  const logout = async () => {
    console.log('Demo mode - logout not required');
  };

  return (
    <AuthContext.Provider value={{ 
      user: DEMO_USER, 
      isLoading: false, // Never loading in demo mode
      login, 
      register, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}