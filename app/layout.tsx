import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

/**
 * Minimal shared shell for both halves of the app. It owns nothing but
 * <html>/<body> and the font variables — the public site and the admin panel
 * each bring their own stylesheet and chrome in their route group layout, so
 * their design tokens never collide.
 */

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BOFAST – Attefallshus",
  description:
    "BOFAST är ett privatägt fastighetsbolag som säljer attefallshus i ett 30-tal orter i västra Sverige.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="sv"
      // The admin theme script sets data-theme on <html> before hydration.
      suppressHydrationWarning
      // site.css sets `scroll-behavior: smooth` on <html>; this tells Next's
      // router the smooth scroll is intentional so it doesn't fight it
      // during route transitions. Harmless on admin pages, which don't set
      // that CSS property at all.
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
