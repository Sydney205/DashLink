import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useGetCurrentUser } from '@workspace/api-client-react';
import { Logo } from '@/components/logo';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const { data: user, isLoading, isError } = useGetCurrentUser({
    query: {
      retry: false,
    }
  });

  useEffect(() => {
    if (!isLoading && (isError || !user)) {
      setLocation('/login');
    }
  }, [isLoading, isError, user, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-bold animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b-2 border-border bg-card px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <Logo size="sm" />
        <div className="flex items-center gap-4">
          <div className="text-sm font-semibold text-muted-foreground hidden sm:block">
            {user.email}
          </div>
          <button 
            onClick={() => {
              localStorage.removeItem('dashlink_auth_token');
              window.location.href = '/login';
            }}
            className="text-sm font-bold underline hover:text-primary transition-colors"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="flex-1 w-full max-w-5xl mx-auto p-6 md:p-10">
        {children}
      </main>
    </div>
  );
}
