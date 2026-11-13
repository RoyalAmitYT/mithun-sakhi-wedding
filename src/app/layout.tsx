import type { Metadata, Viewport } from "next";
import dynamic from "next/dynamic";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { getSiteUrl } from "@/lib/site-url";
import { MotionProvider, SmoothScrollProvider } from "@/components/motion";
import { AudioProvider } from "@/components/audio";
import { PetalCanvas } from "@/components/effects";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

const FloatingMusicPlayer = dynamic(
  () =>
    import("@/components/audio/floating-music-player").then(
      (m) => m.FloatingMusicPlayer
    )
);

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Mithun & Sakhi — Wedding Celebration",
    template: "%s | Mithun & Sakhi Wedding",
  },
  description:
    "Official wedding celebration website for Mithun Gorain and Sakhi Gorain. 19–22 November 2026, Purulia, West Bengal.",
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Mithun & Sakhi Wedding",
    title: "Mithun & Sakhi — Wedding Celebration",
    description:
      "Official wedding celebration website for Mithun Gorain and Sakhi Gorain. 19–22 November 2026, Purulia, West Bengal.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mithun & Sakhi — Wedding Celebration",
    description:
      "Official wedding celebration website for Mithun Gorain and Sakhi Gorain. 19–22 November 2026, Purulia, West Bengal.",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${manrope.variable}`}>
      <head>
        <link
          rel="preload"
          as="image"
          type="image/avif"
          href="/images/hero-portrait-mobile.avif"
          media="(max-width: 768px)"
          fetchPriority="high"
        />
        <link
          rel="preload"
          as="image"
          type="image/avif"
          href="/images/hero-portrait-desktop.avif"
          media="(min-width: 769px)"
          fetchPriority="high"
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans antialiased overflow-x-clip">
        <MotionProvider>
          <SmoothScrollProvider>
            <AudioProvider>
              <ToastProvider>
                {children}
                <FloatingMusicPlayer />
                <PetalCanvas />
              </ToastProvider>
            </AudioProvider>
          </SmoothScrollProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
