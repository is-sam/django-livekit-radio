"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../form.module.css";

export default function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password }),
      });
      const data = await res.json();
      if (res.ok && data.id) {
        setSuccess("Registration successful! You can now login.");
        setTimeout(() => router.push("/login"), 1500);
      } else {
        setError(data.detail || "Registration failed");
      }
    } catch (err) {
      setError("Network error");
    }
  }

  return (
    <main className={styles.fullscreen}>
      <header style={{width: '100%', textAlign: 'center', position: 'absolute', top: '3rem', left: 0, zIndex: 10}}>
  <h2 style={{fontSize: '2.4rem', fontWeight: 800, color: '#fff', letterSpacing: '-2px'}}>Django Livekit Radio</h2>
      </header>
      <h1 className={styles.title}>Register</h1>
      <form onSubmit={handleRegister} className={styles.form}>
        <input type="text" className={styles.input} placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
        <input type="email" className={styles.input} placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" className={styles.input} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit" className={styles.button}>Register</button>
        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}
      </form>
      <p>Already have an account? <a href="/login" className={styles.link}>Login</a></p>
    </main>
  );
}
