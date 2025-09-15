"use client";
import { useEffect, useState } from "react";

interface Log {
  id: number;
  username: string;
  frequency: number;
  joined_at: string;
}

export default function RadioLogs() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/radio/logs/room-joins`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => {
        setLogs(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load logs");
        setLoading(false);
      });
  }, []);

  if (loading) return <p style={{ textAlign: "center", color: "#38bdf8" }}>Loading logs...</p>;
  if (error) return <p style={{ textAlign: "center", color: "#ef4444" }}>{error}</p>;

  return (
    <section style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div style={{ background: "#101a3c", borderRadius: "18px", boxShadow: "0 4px 24px #0006", padding: "2rem 2.5rem", minWidth: "420px", maxWidth: "90vw" }}>
        <h2 style={{ textAlign: "center", color: "#38bdf8", fontSize: "2rem", fontWeight: 700, marginBottom: "1.5rem" }}>Radio Logs</h2>
        {logs.length === 0 ? (
          <p style={{ color: "#fff", textAlign: "center" }}>No logs found.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0", background: "#0a1124", borderRadius: "12px", overflow: "hidden" }}>
            <thead>
              <tr style={{ background: "#182040" }}>
                <th style={{ color: "#38bdf8", fontWeight: 600, padding: "0.75rem 1rem", textAlign: "left" }}>User</th>
                <th style={{ color: "#38bdf8", fontWeight: 600, padding: "0.75rem 1rem", textAlign: "left" }}>Frequency</th>
                <th style={{ color: "#38bdf8", fontWeight: 600, padding: "0.75rem 1rem", textAlign: "left" }}>Joined At</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} style={{ borderBottom: "1px solid #222", transition: "background 0.2s" }}>
                  <td style={{ color: "#fff", padding: "0.7rem 1rem" }}>{log.username}</td>
                  <td style={{ color: "#fff", padding: "0.7rem 1rem" }}>{log.frequency}</td>
                  <td style={{ color: "#fff", padding: "0.7rem 1rem" }}>{new Date(log.joined_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
