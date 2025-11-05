import Link from "next/link";
import { Footer } from "./Footer";

interface AuthLayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

export function AuthLayout({ children, showFooter = true }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-lg font-bold">AI</span>
              </div>
              <span className="text-xl font-semibold text-foreground">AI Lab</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/auth"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1">{children}</main>
      
      {showFooter && <Footer />}
    </div>
  );
}

