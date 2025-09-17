"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    localStorage.removeItem("token");
    router.replace("/login");
  }, [router]);

  return (
    <section className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
      Logging out…
    </section>
  );
}
