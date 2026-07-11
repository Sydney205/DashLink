import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateLink, getListLinksQueryKey, getGetLinkSummaryQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardLayout } from '@/components/layout';
import { linkSchema } from '@/lib/schemas';
import { useToast } from '@/hooks/use-toast';

export function NewLink() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createMutation = useCreateLink();

  const form = useForm<z.infer<typeof linkSchema>>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      originalUrl: '',
      title: '',
      description: '',
      shortId: '',
    },
  });

  const onSubmit = (values: z.infer<typeof linkSchema>) => {
    // If shortId is empty string, don't send it so the backend generates one
    const payload = { ...values };
    if (!payload.shortId) delete payload.shortId;
    if (!payload.title) delete payload.title;
    if (!payload.description) delete payload.description;

    createMutation.mutate({ data: payload }, {
      onSuccess: () => {
        toast({ title: "Success!", description: "Short link created." });
        queryClient.invalidateQueries({ queryKey: getListLinksQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetLinkSummaryQueryKey() });
        setLocation('/dashboard');
      },
      onError: (err: any) => {
        toast({ 
          variant: "destructive", 
          title: "Error", 
          description: err.message || "Could not create link. Try a different custom code." 
        });
      }
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <Button 
          variant="ghost" 
          className="mb-6 gap-2 font-bold px-0 hover:bg-transparent"
          onClick={() => setLocation('/dashboard')}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Create Short Link</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="originalUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Destination URL <span className="text-primary">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="https://very-long-url.com/something/complex" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shortId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Custom Back-half (Optional)</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-0">
                          <div className="h-12 flex items-center px-4 bg-muted border-2 border-r-0 border-input font-mono text-muted-foreground whitespace-nowrap">
                            dash.link/
                          </div>
                          <Input 
                            placeholder="my-campaign" 
                            className="font-mono rounded-l-none focus-visible:z-10" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Leave blank for a random short code.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-4 border-t-2 border-border border-dashed space-y-6">
                  <h4 className="font-bold text-lg">Optional Details</h4>
                  
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Product Launch Page" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description / Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Used for the Q3 marketing campaign in newsletter..." 
                            className="resize-none"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="pt-4">
                  <Button size="lg" type="submit" className="w-full font-bold text-lg" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Creating..." : "Create Short Link"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
