import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { Inter, Pinyon_Script } from "next/font/google";

import { ColorSchemeSwitcher } from "@/components/color-scheme-switcher";
import { siteContent } from "@/lib/site-content";
import { COLOR_SCHEME } from "@/lib/theme";

import "./variables.css";
import "./globals.css";

const bodyFont = Inter({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin", "cyrillic"],
  variable: "--font-body",
  display: "swap",
  adjustFontFallback: true,
});

const titleFont = Pinyon_Script({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-title",
  display: "swap",
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: siteContent.seo.title,
  description: siteContent.seo.description,
  applicationName: siteContent.seo.title,
  keywords: [
    "Blooming Diva",
    "Blooming Diva Photo Day",
    "photo day Warsaw",
    "film photography Warsaw",
    "editorial photoshoot",
    "makeup and styling Warsaw",
    "women's photo session",
    "creative photoshoot Warsaw",
    "STUDIO ISKRA",
  ],
  manifest: "/site.webmanifest",
  openGraph: {
    title: siteContent.seo.title,
    description: siteContent.seo.description,
    type: "website",
    locale: "ru_RU",
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
    <html lang="ru" data-color-scheme={COLOR_SCHEME} suppressHydrationWarning>
      <body className={`${bodyFont.variable} ${titleFont.variable}`}>
        {children}
        <ColorSchemeSwitcher />
        <Analytics />
      </body>
    </html>
  );
}
