"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuthRedirect } from "../useAuthRedirect";
import { useAuth } from "@/app/(auth)/AuthProvider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FieldErrors {
  username?: string;
  password?: string;
  [key: string]: string | undefined;
}

export default function Login() {
  useAuthRedirect();
  const router = useRouter();
  const { setAuthToken } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setFormError("");
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok && data.access) {
        setAuthToken(data.access);
        router.push("/");
      } else {
        if (typeof data === "object" && data !== null && !Array.isArray(data)) {
          const nextFieldErrors: FieldErrors = {};
          Object.entries(data).forEach(([field, message]) => {
            if (Array.isArray(message)) {
              nextFieldErrors[field] = message.join("\\n");
            } else if (message) {
              nextFieldErrors[field] = String(message);
            }
          });
          setFieldErrors(nextFieldErrors);
          if (data.detail) {
            setFormError(data.detail);
          } else if (Object.keys(nextFieldErrors).length === 0) {
            setFormError("Login failed");
          }
        } else {
          setFormError(typeof data === "string" ? data : "Login failed");
        }
      }
    } catch {
      setFormError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex min-h-[60vh] items-center justify-center py-10">
      <Card className="w-full max-w-md border-white/10 bg-slate-900/70 text-white shadow-2xl backdrop-blur">
        <CardHeader className="space-y-3">
          <CardTitle className="text-2xl font-semibold">Sign in</CardTitle>
          <CardDescription className="text-slate-200/70">
            Welcome back. Enter your credentials to access the radio console.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
                autoComplete="username"
                placeholder="radio-operator"
                className={cn(
                  fieldErrors.username &&
                    "border-destructive text-destructive placeholder:text-destructive/60 focus-visible:ring-destructive"
                )}
              />
              {fieldErrors.username && (
                <p className="text-sm text-destructive">{fieldErrors.username}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className={cn(
                  fieldErrors.password &&
                    "border-destructive text-destructive placeholder:text-destructive/60 focus-visible:ring-destructive"
                )}
              />
              {fieldErrors.password && (
                <p className="text-sm text-destructive">{fieldErrors.password}</p>
              )}
            </div>
            {formError && (
              <Alert variant="destructive" className="border-destructive bg-destructive/10">
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" disabled={loading} className="w-full bg-cyan-500 text-slate-950 hover:bg-cyan-400">
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 text-sm text-muted-foreground">
          <span>
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-cyan-300 hover:text-cyan-200">
              Create one
            </Link>
          </span>
        </CardFooter>
      </Card>
    </section>
  );
}
