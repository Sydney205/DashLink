import { useEffect, useRef } from 'react';
import { useLocation, useParams } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  useGetLink, 
  useUpdateLink, 
  getGetLinkQueryKey, 
  getListLinksQueryKey,
  getGetLinkSummaryQueryKey
} from '@workspace/api-client-react';
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

export function EditLink() {
  const [, setLocation] = useLocation();
  const params = useParams<{ shortId: string }>();
  const shortId = params.shortId || '';
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: link, isLoading, isError } = useGetLink(shortId, {
    query: {
      enabled: !!shortId,
    }
  });
  
  const updateMutation = useUpdateLink();

  const form = useForm<z.infer<typeof linkSchema>>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      originalUrl: '',
      title: '',
      description: '',
      shortId: '',
    },
  });

  const initialized = useRef(false);

  useEffect(() => {
    if (link && !initialized.current) {
      form.reset({
        originalUrl: link.originalUrl,
        title: link.title || '',
        description: link.description || '',
        shortId: link.shortId,
      });
      initialized.current = true;
    }
  }, [link, form]);

  const onSubmit = (values: z.infer<typeof linkSchema>) => {
    // Only include fields that changed, plus always pass shortId? We should just pass what changed, or pass all.
    // The backend expects LinkUpdate.
    const payload = { ...values };
    if (payload.shortId === '') delete payload.shortId;

    updateMutation.mutate({ shortId, data: payload }, {
      onSuccess: (updatedLink) => {
        toast({ title: "Saved!", description: "Link updated successfully." });
        queryClient.invalidateQueries({ queryKey: getGetLinkQueryKey(updatedLink.shortId) });
        queryClient.invalidateQueries({ queryKey: getListLinksQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetLinkSummaryQueryKey() });
        setLocation('/dashboard');
      },
      onError: (err: any) => {
        toast({ 
          variant: "destructive", 
          title: "Error", 
          description: err.message || "Could not update link. Code might be taken." 
        });
      }
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20 font-bold animate-pulse text-xl">
          Loading link...
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !link) {
    return (
      <DashboardLayout>
        <div className="text-center py-20 space-y-4">
          <h2 className="text-2xl font-black">Link not found</h2>
          <Button onClick={() => setLocation('/dashboard')}>Back to Dashboard</Button>
        </div>
      </DashboardLayout>
    );
  }

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
            <CardTitle className="text-3xl">Edit Short Link</CardTitle>
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
                      <FormLabel className="text-base">Custom Back-half</FormLabel>
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
                        Changing this will break existing links using the old code.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-4 border-t-2 border-border border-dashed space-y-6">
                  <h4 className="font-bold text-lg">Details</h4>
                  
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

                <div className="pt-4 flex gap-4">
                  <Button size="lg" type="submit" className="flex-1 font-bold text-lg" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button 
                    size="lg" 
                    type="button" 
                    variant="outline" 
                    className="font-bold text-lg" 
                    onClick={() => setLocation('/dashboard')}
                  >
                    Cancel
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
