import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface UserData {
  id: string;
  username: string;
  email?: string;
}

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  user: UserData | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  isAuthenticated: false,
  user: null,
  logout: () => {},
});

function isJwtExpired(token: string | null): boolean {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken || isJwtExpired(storedToken)) {
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
      router.push("/login");
    } else {
      setToken(storedToken);
    }
  }, [router]);

  useEffect(() => {
    if (token && !user) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => setUser(data))
        .catch(() => setUser(null));
    } else if (!token) {
      setUser(null);
    }
  }, [token, user]);

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, user, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
