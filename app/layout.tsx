import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider, ThemeScript } from "@/components/providers/ThemeProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ErrorBoundary } from "@/components/error-boundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Lab - Build Intelligent Applications",
  description: "The next generation AI workspace for building intelligent applications. Create, collaborate, and innovate with cutting-edge AI tools.",
  keywords: ["AI", "Machine Learning", "Workspace", "React Flow", "AI Development", "Collaboration"],
  authors: [{ name: "AI Lab" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#1a73e8",
  openGraph: {
    title: "AI Lab - Build Intelligent Applications",
    description: "The next generation AI workspace for building intelligent applications.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <QueryProvider>
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
