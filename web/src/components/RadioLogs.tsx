"use client";

import { useEffect, useState } from "react";
import { getAuthHeaders } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";


interface Log {
  id: number;
  username: string;
  frequency: string;
  joined_at: string;
}

interface PaginatedLogs {
  count: number;
  next: string | null;
  previous: string | null;
  results: Log[];
}

export default function RadioLogs() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [count, setCount] = useState<number>(0);
  const [next, setNext] = useState<string | null>(null);
  const [previous, setPrevious] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/radio/logs`, { headers: getAuthHeaders() })
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data: PaginatedLogs) => {
        setLogs(data.results);
        setCount(data.count);
        setNext(data.next);
        setPrevious(data.previous);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load logs");
        setLoading(false);
      });
  }, []);

  const hasEntries = logs.length > 0;

  return (
    <Card className="border-white/10 bg-slate-900/70 text-white shadow-2xl backdrop-blur">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Radio logs</CardTitle>
        <CardDescription className="text-sm text-slate-200/70">
          Historical join events for every LiveKit frequency.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading && (
          <p className="text-sm text-muted-foreground">Loading logs…</p>
        )}
        {!loading && error && (
          <Alert variant="destructive" className="mt-2 border-destructive bg-destructive/10">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {!loading && !error && !hasEntries && (
          <p className="text-sm text-muted-foreground">No logs found.</p>
        )}
        {!loading && !error && hasEntries && (
          <Table className="mt-2 text-slate-200">
            <TableHeader>
              <TableRow className="border-white/5">
                <TableHead>User</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Joined at</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id} className="border-white/5">
                  <TableCell className="font-medium text-white">
                    {log.username ?? `User #${log.id}`}
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-cyan-500/10 text-cyan-300">
                      {Number(log.frequency).toFixed(2)} MHz
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-300/80">
                    {new Date(log.joined_at).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
