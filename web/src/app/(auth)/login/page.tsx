"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthRedirect } from '../useAuthRedirect';
import styles from "../../form.module.css";

export default function Login() {
  useAuthRedirect();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok && data.access) {
        localStorage.setItem("token", data.access);
        router.push("/");
      } else {
        setError(data.detail || "Login failed");
      }
    } catch (err) {
      setError("Network error");
    }
  }

  return (
    <main className={styles.fullscreen}>
      <header className={styles.projectHeader}>
        <h2 className={styles.projectName}>Django Livekit Radio</h2>
      </header>
      <h1 className={styles.title}>Login</h1>
      <form onSubmit={handleLogin} className={styles.form}>
        <input type="text" className={styles.input} placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
        <input type="password" className={styles.input} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit" className={styles.button}>Login</button>
        {error && <p className={styles.error}>{error}</p>}
      </form>
      <p>
        Don't have an account? <a href="/register" className={styles.link}>Register</a>
      </p>
    </main>
  );
}
