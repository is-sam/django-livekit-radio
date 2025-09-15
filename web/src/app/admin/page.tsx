"use client";

import { useAuth } from "../(auth)/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import PageLayout from "../PageLayout";
import RadioLogs from "../../components/RadioLogs";

export default function AdminPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if user is loaded and not admin
    if (isAuthenticated && user !== null && !user.is_admin) {
      router.replace("/");
    }
  }, [isAuthenticated, user, router]);

  if (user === null) {
    return <main style={{ padding: "2rem" }}><p>Loading...</p></main>;
  }

  if (!user.is_admin) {
    return null;
  }

  return (
    <PageLayout>
      <h1>Admin Page</h1>
      <RadioLogs />
    </PageLayout>
  );
}
