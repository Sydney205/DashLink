import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      <header className="flex items-center justify-between p-6 border-b-2 border-border bg-card">
        <Logo />
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="font-bold text-base">Login</Button>
          </Link>
          <Link href="/signup">
            <Button className="font-bold text-base hidden sm:flex">Get Started</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center p-6 pb-20 relative z-0">
        <div className="absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.1] -z-10" />
        
        <div className="max-w-3xl space-y-8 mt-12 md:mt-24">
          <div className="inline-block px-4 py-2 border-2 border-border bg-card text-sm font-bold brutal-shadow-sm mb-4">
            Link management for the precise.
          </div>
          
          <h2 className="text-5xl md:text-7xl font-black leading-tight tracking-tight">
            Tidy links.<br />
            <span className="text-primary underline decoration-border decoration-4 underline-offset-[12px]">Trustworthy clicks.</span>
          </h2>
          
          <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
            Stop sharing raw, random strings. Create clean, trackable short links and QR codes that feel like a well-made pocket tool. Fast, precise, and a little playful.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto font-black text-lg">
                Start building links
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto font-bold text-lg">
                View your dashboard
              </Button>
            </Link>
          </div>
        </div>

        <div className="w-full max-w-4xl mt-24">
          <div className="bg-card border-2 border-border brutal-shadow-lg p-2 rounded-none transform rotate-1 hover:rotate-0 transition-transform duration-300">
            <div className="border-2 border-border p-6 bg-background flex flex-col md:flex-row items-center gap-8 justify-between">
              <div className="flex-1 text-left space-y-4 w-full">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive border-2 border-border" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400 border-2 border-border" />
                  <div className="w-3 h-3 rounded-full bg-green-400 border-2 border-border" />
                </div>
                <div className="font-mono text-sm p-4 bg-card border-2 border-border text-muted-foreground w-full">
                  https://dash.link/<span className="text-primary font-bold">my-new-project</span>
                </div>
                <div className="h-4 bg-muted w-3/4" />
                <div className="h-4 bg-muted w-1/2" />
              </div>
              <div className="w-48 h-48 bg-white border-2 border-border brutal-shadow-sm flex items-center justify-center shrink-0">
                <div className="w-32 h-32 bg-black flex items-center justify-center p-2">
                  <div className="w-full h-full border-4 border-white border-dashed" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t-2 border-border bg-card p-6 text-center text-sm font-semibold text-muted-foreground">
        © {new Date().getFullYear()} DashLink. Built with passion
      </footer>
    </div>
  );
}
