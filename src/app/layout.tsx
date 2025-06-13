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
  title: "Height Comparison Tool – Compare Heights Online, Celebrities & More",
  description: "Visually compare heights of people, celebrities, and objects. Use our free online height comparison chart, difference calculator, and conversion tool. No registration needed.",
  keywords: "height comparison, height chart, compare heights, celebrity height, height difference calculator, height conversion, online height tool",
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
    title: "Height Comparison Tool – Compare Heights Online, Celebrities & More",
    description: "Visually compare heights of people, celebrities, and objects. Use our free online height comparison chart, difference calculator, and conversion tool.",
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
    title: "Height Comparison Tool – Compare Heights Online, Celebrities & More",
    description: "Visually compare heights of people, celebrities, and objects. Use our free online height comparison chart, difference calculator, and conversion tool.",
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
    'mobile-web-app-capable': 'yes',
    'viewport': 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Prevent Web3 wallet injection errors
              (function() {
                if (typeof window !== 'undefined') {
                  // Override console.error to filter Web3 errors
                  const originalConsoleError = console.error;
                  console.error = function(...args) {
                    const message = args.join(' ');
                    if (message.includes('ethereum') || message.includes('selectedAddress') || message.includes('web3')) {
                      return; // Suppress Web3 errors
                    }
                    originalConsoleError.apply(console, args);
                  };
                  
                  // Early error handler
                  window.addEventListener('error', function(e) {
                    if (e.message && (e.message.includes('ethereum') || e.message.includes('selectedAddress') || e.message.includes('web3'))) {
                      e.preventDefault();
                      return false;
                    }
                  });
                }
              })();
            `,
          }}
        />
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
