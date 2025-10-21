import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t-4 border-primary bg-card mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-6 w-6 text-primary retro-glow" />
              <span className="text-xl font-bold uppercase text-primary">LinguaNews</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Learn languages through live news articles and song lyrics with AI-powered translations.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-bold uppercase mb-4 text-primary">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="text-foreground hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-bold uppercase mb-4 text-primary">Product</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/pricing" className="text-foreground hover:text-primary transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/" className="text-foreground hover:text-primary transition-colors">
                  News
                </Link>
              </li>
              <li>
                <Link href="/lyrics" className="text-foreground hover:text-primary transition-colors">
                  Lyrics
                </Link>
              </li>
              <li>
                <Link href="/flashcards" className="text-foreground hover:text-primary transition-colors">
                  Flashcards
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t-2 border-muted text-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} LinguaNews. All rights reserved. Made with 💜 for language learners.
          </p>
        </div>
      </div>
    </footer>
  );
}

