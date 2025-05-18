import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import NavbarWrapper from "@/components/layout/navbar-wrapper";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { NextIntlClientProvider } from 'next-intl';
import { useMessages } from 'next-intl';
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LRC-Webkit - Online LRC Editor",
  description: "A powerful online LRC editor with real-time timestamp marking, keyboard shortcuts, and multi-language support. Edit and create LRC files easily.",
  keywords: "LRC editor, lyrics editor, music lyrics, timestamp, audio sync, Next.js, React",
  authors: [{ name: "lzw10168" }],
  creator: "lzw10168",
  publisher: "lzw10168",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://lrc.gooooood.top/",
    siteName: "LRC-Webkit",
    title: "LRC-Webkit - Online LRC Editor",
    description: "A powerful online LRC editor with real-time timestamp marking, keyboard shortcuts, and multi-language support.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LRC-Webkit Preview"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "LRC-Webkit - Online LRC Editor",
    description: "A powerful online LRC editor with real-time timestamp marking, keyboard shortcuts, and multi-language support.",
    images: ["/og-image.png"]
  },
  viewport: "width=device-width, initial-scale=1",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" }
  ]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = useMessages();

  return (
    <html lang="pt-br" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.className)}>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <NavbarWrapper />
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
