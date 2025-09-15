"use client";
import { AuthProvider } from "./(auth)/AuthProvider";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
