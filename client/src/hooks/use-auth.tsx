import { createContext, useContext } from "react";

// Mock user for demo mode - always logged in
const DEMO_USER = {
  id: 'demo_user_01',
  username: 'demo_user'
};

interface User {
  id: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo mode auth provider - always returns demo user, no real authentication
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Mock functions that do nothing in demo mode
  const login = async (username: string, password: string) => {
    console.log('Demo mode - login not required');
  };

  const register = async (username: string, email: string, password: string) => {
    console.log('Demo mode - registration not required');
  };

  const logout = async () => {
    console.log('Demo mode - logout not required');
  };

  return (
    <AuthContext.Provider value={{ 
      user: DEMO_USER, // Always logged in as demo user
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
