import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { LandingPage } from '@/pages/landing';
import { LoginPage } from '@/pages/login';
import { SignupPage } from '@/pages/signup';
import { Dashboard } from '@/pages/dashboard';
import { NewLink } from '@/pages/dashboard/new';
import { EditLink } from '@/pages/dashboard/edit';
import { RedirectPage } from '@/pages/redirect';
import '@/lib/auth'; // Ensure token getter is set up

const queryClient = new QueryClient();

function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background flex-col p-6 text-center gap-6">
      <div className="w-24 h-24 bg-card border-4 border-border brutal-shadow-lg flex items-center justify-center text-4xl font-black text-foreground">
        404
      </div>
      <h1 className="text-4xl font-black text-foreground">
        Page not found
      </h1>
      <p className="text-muted-foreground font-medium text-lg max-w-sm">
        We looked everywhere, but couldn't find what you were looking for.
      </p>
      <a href="/" className="px-8 py-3 bg-primary text-primary-foreground font-bold border-2 border-border brutal-shadow-sm hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_hsl(var(--border))] transition-all">
        Go Home
      </a>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/signup" component={SignupPage} />
      
      {/* Dashboard Routes */}
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/dashboard/new" component={NewLink} />
      <Route path="/dashboard/edit/:shortId" component={EditLink} />
      
      {/* Redirect Route - Catches /:shortId */}
      <Route path="/:shortId" component={RedirectPage} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <Router />
      </WouterRouter>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
