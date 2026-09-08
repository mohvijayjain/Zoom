import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

// Exposed as --font-inter and consumed by tailwind's fontFamily.sans.
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Zoom | Home",
  description: "Zoom web dashboard clone",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
