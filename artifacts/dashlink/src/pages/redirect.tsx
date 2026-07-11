import { useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { useResolveLink } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';

export function RedirectPage() {
  const params = useParams<{ shortId: string }>();
  const shortId = params.shortId;

  const { data: resolved, isLoading, isError } = useResolveLink(shortId || '', {
    query: {
      enabled: !!shortId,
      retry: false, // don't retry on 404
    }
  });

  useEffect(() => {
    if (resolved?.originalUrl) {
      window.location.href = resolved.originalUrl;
    }
  }, [resolved]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-8" />
        <h1 className="text-3xl font-black mb-2">Redirecting...</h1>
        <p className="text-muted-foreground font-medium text-lg">Taking you to your destination.</p>
      </div>
    );
  }

  if (isError || !resolved) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-6">
          <div className="w-20 h-20 bg-destructive border-2 border-border brutal-shadow text-destructive-foreground flex items-center justify-center text-4xl font-black mx-auto transform -rotate-6">
            ?
          </div>
          <h1 className="text-4xl font-black leading-tight">Link not found</h1>
          <p className="text-muted-foreground font-medium text-lg">
            This short link doesn't exist or has been deleted.
          </p>
          <div className="pt-8">
            <Link href="/">
              <Button size="lg" className="font-bold text-lg w-full sm:w-auto">
                Go to DashLink
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Fallback while waiting for window.location to take over
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-3xl font-black mb-2">Almost there...</h1>
      <p className="text-muted-foreground font-medium text-lg">
        If you are not redirected automatically,{' '}
        <a href={resolved.originalUrl} className="text-primary underline font-bold">click here</a>.
      </p>
    </div>
  );
}
