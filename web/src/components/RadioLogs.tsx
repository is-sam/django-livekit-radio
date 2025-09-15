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
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/radio/logs`, {
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

  if (loading) return <p>Loading logs...</p>;
  if (error) return <p>{error}</p>;

  return (
    <section>
      <h2>Radio Logs</h2>
      {logs.length === 0 ? (
        <p>No logs found.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>User</th>
              <th>Frequency</th>
              <th>Joined At</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id}>
                <td>{log.username}</td>
                <td>{log.frequency}</td>
                <td>{new Date(log.joined_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
