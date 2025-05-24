import type { Metadata } from "next";
import { Inter, Poppins, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import JsonLd from "@/components/JsonLd";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
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
        className={`${inter.variable} ${poppins.variable} ${jetbrainsMono.variable} font-poppins antialiased min-h-screen flex flex-col`}
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
