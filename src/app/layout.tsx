// src/app/layout.tsx
//
// Root layout — wraps every page in the app.
// Adds: Google fonts, SessionProvider (NextAuth), Sonner toast notifications.

import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono }       from "next/font/google";
import { SessionProvider }          from "next-auth/react";
import { Toaster }                  from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets:  ["latin"],
  display:  "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets:  ["latin"],
  display:  "swap",
});

export const metadata: Metadata = {
  title: {
    default:  "EventSync — Event Operations & Vendor Management",
    template: "%s | EventSync",
  },
  description:
    "The all-in-one platform for planning, managing and delivering exceptional events in India.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)",  color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        <SessionProvider>
          {children}
        </SessionProvider>

        {/* Toast notifications — used with toast() from sonner */}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{ duration: 4000 }}
        />
      </body>
    </html>
  );
}