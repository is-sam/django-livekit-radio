"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface UserData {
  id: string;
  username: string;
  email?: string;
  is_admin?: boolean;
}

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  user: UserData | null;
  isLoading: boolean;
  setAuthToken: (token: string | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  isAuthenticated: false,
  user: null,
  isLoading: true,
  setAuthToken: () => {},
  logout: () => {},
});

function isJwtExpired(token: string | null): boolean {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setAuthToken = (value: string | null) => {
    if (typeof window !== "undefined") {
      if (value) {
        localStorage.setItem("token", value);
      } else {
        localStorage.removeItem("token");
      }
    }
    setToken(value);
    if (!value) {
      setUser(null);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const storedToken = localStorage.getItem("token");
    if (!storedToken || isJwtExpired(storedToken)) {
      if (storedToken) {
        localStorage.removeItem("token");
      }
      setToken(null);
      setIsLoading(false);
      return;
    }
    setToken(storedToken);
  }, []);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        setUser(data);
      })
      .catch(() => {
        if (cancelled) return;
        setAuthToken(null);
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const logout = () => {
    setAuthToken(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, user, isLoading, setAuthToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
