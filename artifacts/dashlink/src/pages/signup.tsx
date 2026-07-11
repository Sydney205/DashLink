import { useLocation, Link } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSignup } from '@workspace/api-client-react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { setAuthToken } from '@/lib/auth';
import { signupSchema } from '@/lib/schemas';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/logo';

export function SignupPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const signupMutation = useSignup();
  
  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = (values: z.infer<typeof signupSchema>) => {
    signupMutation.mutate({ data: values }, {
      onSuccess: (res) => {
        setAuthToken(res.accessToken);
        toast({
          title: "Account created!",
          description: "Welcome to DashLink.",
        });
        setLocation('/dashboard');
      },
      onError: (err: any) => {
        toast({
          variant: "destructive",
          title: "Signup failed",
          description: err.message || "An error occurred.",
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative z-0">
      <div className="absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.1] -z-10" />
      
      <Link href="/" className="absolute top-8 left-8">
        <Logo />
      </Link>

      <Card className="w-full max-w-md brutal-shadow-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl">Create Account</CardTitle>
          <CardDescription className="text-base font-medium">
            Start managing your short links today.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Email</FormLabel>
                    <FormControl>
                      <Input placeholder="name@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full font-bold text-lg" disabled={signupMutation.isPending}>
                {signupMutation.isPending ? "Creating account..." : "Sign Up"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="justify-center">
          <div className="text-sm font-medium">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline underline-offset-4 font-bold">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
