"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { authApi, setAuthToken, isBackendConfigured } from "@/lib/api";

interface User {
  email: string;
  name: string;
  country?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string, country?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_KEY = "crisis_intel_users";
const SESSION_KEY = "crisis_intel_session";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isBackendConfigured()) {
      authApi
        .getSession()
        .then((session) => {
          if (session?.user) setUser(session.user);
        })
        .catch(() => setUser(null))
        .finally(() => setIsLoading(false));
    } else {
      const session = localStorage.getItem(SESSION_KEY);
      if (session) {
        try {
          const { email, name, country } = JSON.parse(session);
          setUser({ email, name, country });
        } catch {
          localStorage.removeItem(SESSION_KEY);
        }
      }
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      if (isBackendConfigured()) {
        try {
          const res = await authApi.login({ email, password });
          if (!res.success) return { success: false, error: res.error };
          if (res.token) setAuthToken(res.token);
          if (res.user) setUser(res.user);
          return { success: true };
        } catch (err: unknown) {
          const message = err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : "Login failed";
          return { success: false, error: message };
        }
      }
      const usersJson = localStorage.getItem(USERS_KEY);
      const users = usersJson ? JSON.parse(usersJson) : [];
      const found = users.find(
        (u: { email: string; password: string }) =>
          u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );
      if (!found) return { success: false, error: "Invalid email or password" };
      const session = { email: found.email, name: found.name, country: found.country };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      setUser(session);
      return { success: true };
    },
    []
  );

  const signup = useCallback(
    async (email: string, password: string, name: string, country?: string) => {
      if (isBackendConfigured()) {
        try {
          const res = await authApi.signup({ email, password, name, country });
          if (!res.success) return { success: false, error: res.error };
          if (res.token) setAuthToken(res.token);
          if (res.user) setUser(res.user);
          return { success: true };
        } catch (err: unknown) {
          const message = err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : "Signup failed";
          return { success: false, error: message };
        }
      }
      const usersJson = localStorage.getItem(USERS_KEY);
      const users = usersJson ? JSON.parse(usersJson) : [];
      const exists = users.some(
        (u: { email: string }) => u.email.toLowerCase() === email.toLowerCase()
      );
      if (exists) return { success: false, error: "An account with this email already exists" };
      if (password.length < 6) return { success: false, error: "Password must be at least 6 characters" };
      users.push({ email, password, name, country: country || "" });
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      const session = { email, name, country: country || "" };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      setUser(session);
      return { success: true };
    },
    []
  );

  const logout = useCallback(() => {
    if (isBackendConfigured()) authApi.logout().catch(() => {});
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
