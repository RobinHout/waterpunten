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
  title: "Waterpunten Nederland",
  description: "Vind alle gratis openbare drinkwaterpunten in Nederland. Handig voor wandelaars, fietsers en hardlopers.",
  keywords: ["waterpunten", "drinkwater", "nederland", "gratis water", "watertappunt", "hardlopen", "wielrennen"],
  openGraph: {
    title: "Waterpunten Nederland",
    description: "Vind alle gratis openbare drinkwaterpunten in Nederland.",
    type: "website",
    locale: "nl_NL",
    siteName: "Waterpunten Nederland",
  },
  twitter: {
    card: "summary_large_image",
    title: "Waterpunten Nederland",
    description: "Vind alle gratis openbare drinkwaterpunten in Nederland.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
