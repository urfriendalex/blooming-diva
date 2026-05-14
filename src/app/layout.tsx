import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { Inter } from "next/font/google";

import { siteContent } from "@/lib/site-content";

import "./variables.css";
import "./globals.css";

const bodyFont = Inter({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin", "cyrillic"],
  variable: "--font-body",
  display: "swap",
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: siteContent.seo.title,
  description: siteContent.seo.description,
  applicationName: siteContent.seo.title,
  keywords: [
    "Blooming Diva",
    "photo day Warsaw",
    "editorial photoshoot",
    "personal branding photoshoot",
    "makeup and styling Warsaw",
    "women's photo session",
    "creative photoshoot Warsaw",
    "soft editorial photography",
  ],
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: ["/favicon.ico"],
  },
  openGraph: {
    title: siteContent.seo.title,
    description: siteContent.seo.description,
    type: "website",
    locale: "en_US",
    siteName: siteContent.seo.title,
  },
  twitter: {
    card: "summary_large_image",
    title: siteContent.seo.title,
    description: siteContent.seo.description,
  },
  category: "photography",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={bodyFont.variable}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
