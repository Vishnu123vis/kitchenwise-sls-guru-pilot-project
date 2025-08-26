import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConfigureAmplifyClientSide from "../components/ConfigureAmplify";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KitchenWise - Your Smart Kitchen Companion",
  description: "Generate recipes based on your pantry items, manage your kitchen inventory, and discover new dishes with AI-powered recipe generation.",
  keywords: ["recipe generator", "kitchen management", "pantry tracker", "AI recipes", "cooking app"],
  authors: [{ name: "KitchenWise Team" }],
  creator: "KitchenWise",
  publisher: "KitchenWise",
  robots: "index, follow",
  openGraph: {
    title: "KitchenWise - Your Smart Kitchen Companion",
    description: "Generate recipes based on your pantry items, manage your kitchen inventory, and discover new dishes with AI-powered recipe generation.",
    type: "website",
    locale: "en_US",
    siteName: "KitchenWise",
  },
  twitter: {
    card: "summary_large_image",
    title: "KitchenWise - Your Smart Kitchen Companion",
    description: "Generate recipes based on your pantry items, manage your kitchen inventory, and discover new dishes with AI-powered recipe generation.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#3B82F6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ConfigureAmplifyClientSide />
        {children}
      </body>
    </html>
  );
}
