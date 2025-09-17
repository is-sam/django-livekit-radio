"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "../(auth)/AuthProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import RadioLogs from "../../components/RadioLogs";

export default function AdminPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && user !== null && !user.is_admin) {
      router.replace("/");
    }
  }, [isAuthenticated, user, router]);

  if (user === null) {
    return (
      <ProtectedRoute>
        <main className="flex h-full min-h-[60vh] w-full items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading…</p>
        </main>
      </ProtectedRoute>
    );
  }

  if (!user.is_admin) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Admin dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Monitor recent connection activity across all frequencies.
          </p>
        </div>
        <RadioLogs />
      </div>
    </ProtectedRoute>
  );
}
