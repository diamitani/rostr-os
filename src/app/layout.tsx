import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ROSTR OS — AI-Native Project OS",
  description:
    "Open-source project management powered by the ROSTR framework — PAL, NPAO, 4Ds, and JTBD. The best AI personalization tool for custom to-do lists across all orgs, business tasks, and projects.",
  keywords: ["ROSTR", "project management", "NPAO", "PAL", "4Ds", "JTBD", "AI to-do", "open source"],
  openGraph: {
    title: "ROSTR OS — AI-Native Project OS",
    description: "Open-source Asana alternative powered by AI. NPAO task prioritization, 4Ds lifecycle, PAL AI intake.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
