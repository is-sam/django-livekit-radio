"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function RadioApp() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  return (
    <main className={styles.center}>
      <h1>Radio Chat 2</h1>
      <p>Welcome! The radio interface will be here soon.</p>
    </main>
  );
}
