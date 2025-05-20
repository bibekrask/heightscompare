import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import JsonLd from "@/components/JsonLd";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
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
  title: "Height Comparison Tool | Compare Heights Visually",
  description: "Free online height comparison tool. Compare heights of people, celebrities, and objects visually. Easy-to-use interface with accurate measurements in cm and feet/inches.",
  keywords: "height comparison, height calculator, compare heights, height visualization, height chart, height converter, cm to feet, height measurement",
  authors: [{ name: "HeightsCompare.com" }],
  creator: "HeightsCompare.com",
  publisher: "HeightsCompare.com",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.heightscompare.com",
    title: "Height Comparison Tool | Compare Heights Visually",
    description: "Free online height comparison tool. Compare heights of people, celebrities, and objects visually. Easy-to-use interface with accurate measurements in cm and feet/inches.",
    siteName: "HeightsCompare.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Height Comparison Tool | Compare Heights Visually",
    description: "Free online height comparison tool. Compare heights of people, celebrities, and objects visually. Easy-to-use interface with accurate measurements in cm and feet/inches.",
    creator: "@heightcompare",
  },
  viewport: "width=device-width, initial-scale=1",
  verification: {
    google: "google-site-verification=jbdSDSzuQyDBOUwF5EpcDVKguxLKoQrqIqNACGhIaCU",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <JsonLd />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Breadcrumbs />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
