"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthHeaders } from "@/lib/utils";

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
  setAuthToken: () => { },
  logout: () => { },
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

  const invalidateAuth = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setIsLoading(false);
  };

  const checkTokenValidity = (token: string | null) => {
    if (!token || isJwtExpired(token)) {
      invalidateAuth();
      return false;
    }
    return true;
  };

  const setAuthToken = (token: string | null) => {
    if (!checkTokenValidity(token)) return;

    localStorage.setItem("token", token as string);
    setToken(token);
  };

  useEffect(() => {
    setIsLoading(true);
    const token = localStorage.getItem("token");

    if (!checkTokenValidity(token)) return;

    setToken(token);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const token = localStorage.getItem("token");

    if (!checkTokenValidity(token)) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, { headers: getAuthHeaders() })
      .then((res) => {
        if (res.status === 401) throw new Error("401 Unauthorized");
        return res.ok ? res.json() : null;
      })
      .then((data) => setUser(data))
      .catch(() => {
        invalidateAuth();
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [token]);

  const isAuthenticated = !!token && !isJwtExpired(token);

  const logout = () => {
    setAuthToken(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, user, isLoading, setAuthToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
