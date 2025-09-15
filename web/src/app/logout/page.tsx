"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    localStorage.removeItem("token");
    // Add any other cleanup logic here
    router.replace("/login"); // Redirect to login page
  }, [router]);

  return <div>Logging out...</div>;
}
