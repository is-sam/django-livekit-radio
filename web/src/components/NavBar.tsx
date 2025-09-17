"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, LogOut, Radio, Shield } from "lucide-react";

import { useAuth } from "@/app/(auth)/AuthProvider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function getInitials(name?: string | null) {
  if (!name) return "U";
  const [first, second] = name.split(" ");
  const initials = `${first?.[0] ?? ""}${second?.[0] ?? ""}`.trim();
  if (initials.length === 0) {
    return name.slice(0, 2).toUpperCase();
  }
  return initials.toUpperCase();
}

export default function NavBar() {
  const router = useRouter();
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-6 sm:px-8">
        <Link href="/" className="flex items-center gap-2 text-base font-semibold tracking-tight sm:text-lg">
          <span className="rounded-full bg-cyan-500/10 p-2 text-cyan-400">
            <Radio className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-white">Django LiveKit Radio</span>
        </Link>

        {isAuthenticated && user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 rounded-full px-2 py-1 text-sm font-medium text-white hover:bg-cyan-500/10 hover:text-cyan-100 data-[state=open]:bg-cyan-500/15 data-[state=open]:text-cyan-100"
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-cyan-500/10 text-cyan-400">
                    {getInitials(user.username ?? user.email ?? undefined)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline">
                  {user.username ? user.username : `User #${user.id}`}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 border border-white/10 bg-slate-900/95 text-white shadow-2xl backdrop-blur">
              <DropdownMenuLabel>
                <div className="text-sm font-medium">
                  {user.username ? user.username : `User #${user.id}`}
                </div>
                {user.email && (
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {user.is_admin && (
                <DropdownMenuItem onSelect={() => router.push("/admin")} className="focus:bg-cyan-500/10 focus:text-cyan-100">
                  <Shield className="mr-2 h-4 w-4" aria-hidden="true" />
                  <span>Admin dashboard</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onSelect={logout} className="text-destructive focus:bg-destructive/15 focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="hidden items-center gap-2 sm:flex">
            <Button
              asChild
              size="sm"
              className="border border-cyan-500/40 bg-cyan-500/10 text-cyan-200 transition-colors hover:bg-cyan-500/20 hover:text-cyan-100"
            >
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" aria-hidden="true" />
                Sign in
              </Link>
            </Button>
            <Button asChild size="sm" className="bg-cyan-500 text-slate-950 hover:bg-cyan-400">
              <Link href="/register">Create account</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
