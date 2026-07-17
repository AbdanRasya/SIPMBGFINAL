import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "../../lib/api";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; role?: string; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("sipmbg_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("sipmbg_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; role?: string; error?: string }> => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data && response.data.id) {
        setUser(response.data);
        localStorage.setItem("sipmbg_user", JSON.stringify(response.data));
        return { success: true, role: response.data.role };
      }
      return { success: false, error: "Email atau password salah." };
    } catch (error: any) {
      const msg = error?.response?.data?.error || "Gagal masuk. Coba lagi.";
      return { success: false, error: msg };
    }
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      if (response.data && response.data.id) {
        setUser(response.data);
        localStorage.setItem("sipmbg_user", JSON.stringify(response.data));
        return { success: true };
      }
      return { success: false, error: "Gagal mendaftar." };
    } catch (error: any) {
      const msg = error?.response?.data?.error || "Gagal mendaftar. Coba lagi.";
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("sipmbg_user");
  };

  const updateUser = (updated: User) => {
    setUser(updated);
    localStorage.setItem("sipmbg_user", JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUser }}>
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
