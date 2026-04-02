"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "fisherman" | "compliance" | "citizen" | null;

interface UserProfile {
  name: string;
  role: UserRole;
  avatar: string;
}

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  login: (role: UserRole) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ROLE_DATA: Record<string, UserProfile> = {
  fisherman: { name: "Antony K.", role: "fisherman", avatar: "🛶" },
  compliance: { name: "Inspector Nair", role: "compliance", avatar: "👮" },
  citizen: { name: "Meera Ravi", role: "citizen", avatar: "👩" },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Persist session
    const storedRole = localStorage.getItem("ocean_sentinel_role");
    if (storedRole && ROLE_DATA[storedRole]) {
      setUser(ROLE_DATA[storedRole]);
    }
    setIsLoading(false);
  }, []);

  const login = (role: UserRole) => {
    if (role && ROLE_DATA[role]) {
      const profile = ROLE_DATA[role];
      setUser(profile);
      localStorage.setItem("ocean_sentinel_role", role);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("ocean_sentinel_role");
  };

  return (
    <AuthContext.Provider value={{ user, role: user?.role || null, login, logout, isLoading }}>
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
