import type { Metadata, Viewport } from "next";
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
  keywords: "height comparison tool, height calculator, compare heights visually, height chart maker, celebrity height comparison, height difference calculator, cm to feet converter, height visualization tool, online height comparer, height measurement tool, visual height comparison, height chart generator",
  authors: [{ name: "HeightsCompare.com" }],
  creator: "HeightsCompare.com",
  publisher: "HeightsCompare.com",
  robots: "index, follow",
  alternates: {
    canonical: 'https://www.heightscompare.com',
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.heightscompare.com",
    title: "Height Comparison Tool | Compare Heights Visually",
    description: "Free online height comparison tool. Compare heights of people, celebrities, and objects visually. Easy-to-use interface with accurate measurements in cm and feet/inches.",
    siteName: "HeightsCompare.com",
    images: [
      {
        url: 'https://www.heightscompare.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Height Comparison Tool - Compare Heights Visually',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Height Comparison Tool | Compare Heights Visually",
    description: "Free online height comparison tool. Compare heights of people, celebrities, and objects visually. Easy-to-use interface with accurate measurements in cm and feet/inches.",
    creator: "@heightcompare",
    images: ['https://www.heightscompare.com/og-image.png'],
  },
  verification: {
    google: "google-site-verification=jbdSDSzuQyDBOUwF5EpcDVKguxLKoQrqIqNACGhIaCU",
  },
  other: {
    'theme-color': '#ef4444',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'format-detection': 'telephone=no',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
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
