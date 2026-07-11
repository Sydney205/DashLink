import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { format } from 'date-fns';
import { Copy, Edit2, Link as LinkIcon, MoreHorizontal, Plus, Trash2, TrendingUp } from 'lucide-react';
import { 
  useListLinks, 
  useGetLinkSummary, 
  useDeleteLink, 
  getListLinksQueryKey,
  getGetLinkSummaryQueryKey 
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DashboardLayout } from '@/components/layout';
import { QRCode } from '@/components/qr-code';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: links, isLoading: isLinksLoading } = useListLinks();
  const { data: summary, isLoading: isSummaryLoading } = useGetLinkSummary();
  const deleteMutation = useDeleteLink();

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Copied!",
      description: "Short link copied to clipboard.",
    });
  };

  const handleDelete = (shortId: string) => {
    if (!confirm("Are you sure you want to delete this link?")) return;
    
    deleteMutation.mutate({ shortId }, {
      onSuccess: () => {
        toast({ title: "Deleted", description: "Link removed successfully." });
        queryClient.invalidateQueries({ queryKey: getListLinksQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetLinkSummaryQueryKey() });
      },
      onError: () => {
        toast({ variant: "destructive", title: "Error", description: "Failed to delete link." });
      }
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-4xl font-black tracking-tight">Overview</h2>
            <p className="text-muted-foreground font-medium mt-1">Manage your precise little links.</p>
          </div>
          <Link href="/dashboard/new">
            <Button size="lg" className="font-bold text-lg gap-2 w-full sm:w-auto">
              <Plus className="w-5 h-5" /> Create Link
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-primary" /> Total Links
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-black">
                {isSummaryLoading ? "-" : summary?.totalLinks || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Total Clicks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-black">
                {isSummaryLoading ? "-" : summary?.totalClicks || 0}
              </div>
            </CardContent>
          </Card>
          <Card className="sm:col-span-2 lg:col-span-1 bg-secondary text-secondary-foreground">
            <CardHeader className="pb-2 border-border">
              <CardDescription className="font-bold text-sm uppercase tracking-wider text-secondary-foreground/70">
                Top Performer
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSummaryLoading ? (
                <div className="text-2xl font-black">-</div>
              ) : summary?.mostClicked ? (
                <div>
                  <div className="text-2xl font-black truncate" title={summary.mostClicked.title || summary.mostClicked.shortId}>
                    {summary.mostClicked.title || summary.mostClicked.shortId}
                  </div>
                  <div className="text-sm font-bold mt-2">
                    {summary.mostClicked.clicks} clicks
                  </div>
                </div>
              ) : (
                <div className="text-lg font-bold text-secondary-foreground/50">No data yet</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Links List */}
        <div>
          <h3 className="text-2xl font-black mb-6">Your Links</h3>
          
          {isLinksLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse h-32" />
              ))}
            </div>
          ) : !links || links.length === 0 ? (
            <Card className="p-12 text-center border-dashed border-4 border-muted-foreground/30 bg-transparent shadow-none">
              <div className="mx-auto w-16 h-16 bg-muted border-2 border-border rounded-full flex items-center justify-center mb-4">
                <LinkIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-black mb-2">It's quiet here.</h3>
              <p className="text-muted-foreground font-medium mb-6">
                You haven't created any links yet. Let's fix that.
              </p>
              <Link href="/dashboard/new">
                <Button className="font-bold">Create your first link</Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {links.map((link) => (
                <Card key={link.id} className="overflow-hidden flex flex-col md:flex-row group transition-all hover:-translate-y-1 hover:shadow-lg">
                  <div className="p-6 flex-1 flex flex-col justify-between border-b-2 md:border-b-0 md:border-r-2 border-border">
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-xl font-bold truncate pr-4">
                          {link.title || link.shortId}
                        </h4>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="bg-primary/10 text-primary border-2 border-primary px-2 py-0.5 text-xs font-black brutal-shadow-sm">
                            {link.clicks} CLICKS
                          </span>
                        </div>
                      </div>
                      
                      <div className="font-mono text-sm mb-4 truncate text-muted-foreground" title={link.originalUrl}>
                        {link.originalUrl}
                      </div>

                      {link.description && (
                        <p className="text-sm font-medium text-muted-foreground mb-4 line-clamp-2">
                          {link.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-auto pt-4 border-t-2 border-border/50">
                      <div className="flex items-center gap-2 bg-muted border-2 border-border px-3 py-1 font-mono text-sm font-bold truncate">
                        {link.shortUrl}
                      </div>
                      <Button 
                        variant="secondary" 
                        size="icon"
                        onClick={() => handleCopy(link.shortUrl)}
                        title="Copy short link"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="w-full md:w-64 bg-card flex items-center justify-center p-6 gap-6 md:flex-col relative">
                    <QRCode value={link.shortUrl} size={100} />
                    
                    <div className="absolute top-4 right-4 md:static flex gap-2">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => setLocation(`/dashboard/edit/${link.shortId}`)}
                        title="Edit link"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="icon"
                        onClick={() => handleDelete(link.shortId)}
                        title="Delete link"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
