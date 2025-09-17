import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

import NavBar from "@/components/NavBar";
import { cn } from "@/lib/utils";
import { AuthProvider } from "./(auth)/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Django LiveKit Radio",
  description: "Lightweight client for the LiveKit-powered radio experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 bg-fixed bg-no-repeat font-sans text-foreground antialiased",
          geistSans.variable,
          geistMono.variable,
        )}
      >
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <NavBar />
            <main className="flex-1 pt-16">
              <div className="container mx-auto max-w-6xl px-6 pb-8 sm:px-8">
                {children}
              </div>
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
