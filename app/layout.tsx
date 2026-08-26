import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";

const displayFont = Cormorant_Garamond({
  display: "swap",
  subsets: ["cyrillic", "latin", "latin-ext"],
  variable: "--font-display",
  weight: ["400", "500", "600"],
});

const bodyFont = Manrope({
  display: "swap",
  subsets: ["cyrillic", "latin", "latin-ext"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  referrer: "no-referrer",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nocache: true,
    nosnippet: true,
    noimageindex: true,
    "max-snippet": 0,
    "max-image-preview": "none",
    "max-video-preview": 0,
    googleBot: {
      index: false,
      follow: false,
      noarchive: true,
      nocache: true,
      nosnippet: true,
      noimageindex: true,
      "max-snippet": 0,
      "max-image-preview": "none",
      "max-video-preview": 0,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f5f0e8",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="uz">
      <body className={`${displayFont.variable} ${bodyFont.variable}`}>
        {children}
      </body>
    </html>
  );
}
