import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { AppProvider } from "@/lib/store";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Benefits Navigator — Find every benefit you qualify for",
  description:
    "Answer a few questions and get a prioritized action plan for SNAP, Medicaid, CHIP, LIHEAP, WIC and TANF — with documents, where to apply, and a clear view of the benefits cliff.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <AppProvider>
          <SiteNav />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </AppProvider>
      </body>
    </html>
  );
}
