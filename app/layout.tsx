import type { Metadata } from "next";
import { Space_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Loader2 } from "lucide-react";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
import { AuthGuard } from "@/components/auth-guard";
import { ToastProvider } from "@/components/toast-provider";
import { ErrorBoundary } from "@/components/error-boundary";

const spaceMono = Space_Mono({ 
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "LinguaNews - Learn Languages Through News & Lyrics",
  description: "Learn languages through live news articles and song lyrics with AI-powered translations and vocabulary extraction",
  keywords: "language learning, news, lyrics, translation, vocabulary, flashcards, spotify",
};

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen retro-grid">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto retro-glow" />
        <p className="mt-4 text-sm uppercase tracking-wider text-primary">Loading...</p>
      </div>
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={spaceMono.className}>
        <ErrorBoundary>
          <ThemeProvider>
            <AuthProvider>
              <ToastProvider />
              <div className="retro-grid min-h-screen flex flex-col">
                <div className="relative" style={{ zIndex: 100 }}>
                  <Navigation />
                </div>
                <main className="flex-1 relative" style={{ zIndex: 1 }}>
                  <Suspense fallback={<LoadingFallback />}>
                    {children}
                  </Suspense>
                </main>
                <Footer />
              </div>
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

