import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Clock,
  FileText,
  Flag,
  Loader2,
  MapPin,
  Share2,
  TrendingUp,
} from "lucide-react";
import { IssuesMap } from "@/components/issues-map";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  useInfiniteReports,
  useNewReportsCheck,
  useReportStats,
} from "@/lib/hooks/use-reports";
import { ReportDialog } from "@/components/report-dialog";
import { useQueryClient } from "@tanstack/react-query";
import type { ReportStatus } from "@/lib/queries/sanity-reports";

const statusConfig: Record<
  ReportStatus,
  { label: string; icon: typeof Clock; className: string }
> = {
  reported: {
    label: "Reported",
    icon: Flag,
    className: "border-destructive/30 bg-destructive/10 text-destructive",
  },
  "under-review": {
    label: "Under Review",
    icon: Clock,
    className: "border-primary/30 bg-primary/10 text-primary",
  },
  resolved: {
    label: "Resolved",
    icon: CheckCircle2,
    className: "border-accent bg-accent text-accent-foreground",
  },
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatRelativeDate(dateString: string | null): string {
  if (!dateString) return "";

  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();

  if (Number.isNaN(diffMs) || diffMs < 0) return "Now";

  const minute = 60_000;
  const hour = 3_600_000;
  const day = 86_400_000;

  if (diffMs < minute) return "Now";
  if (diffMs < hour) return `${Math.floor(diffMs / minute)}m`;
  if (diffMs < day) return `${Math.floor(diffMs / hour)}h`;
  return `${Math.floor(diffMs / day)}d`;
}

export function ReportIssuePage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sharingId, setSharingId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    data,
    isLoading: isLoadingReports,
    error: reportsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteReports();
  const { data: stats, isLoading: isLoadingStats } = useReportStats();

  const reports = useMemo(() => data?.reports ?? [], [data?.reports]);
  const totalReports = data?.total ?? 0;
  const trackedReportTime = reports[0]?.dateReported ?? null;
  const { data: newReportsCheck } = useNewReportsCheck(
    reports.length > 0 ? trackedReportTime : null,
  );

  const topCategories = useMemo(() => {
    const categoryMap = new Map<string, number>();

    reports.forEach((report) => {
      const categoryName = report.category?.name;
      if (!categoryName) return;
      categoryMap.set(categoryName, (categoryMap.get(categoryName) ?? 0) + 1);
    });

    return [...categoryMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  }, [reports]);

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    const loadMoreElement = loadMoreRef.current;
    if (!loadMoreElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          fetchNextPage();
        }
      },
      {
        rootMargin: "800px 0px",
      },
    );

    observer.observe(loadMoreElement);

    return () => observer.disconnect();
  }, [
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    reports.length,
  ]);

  const handleReportSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["reports"] });
    queryClient.invalidateQueries({ queryKey: ["reports", "stats"] });
  };

  const handleNewReportsClick = async () => {
    await queryClient.resetQueries({ queryKey: ["reports", "infinite"] });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleShare = async (reportId: string, reportTitle: string) => {
    if (typeof window === "undefined") return;

    const shareUrl = `${window.location.origin}/report-issue#${reportId}`;
    const shareText = "Track this local issue on Ullatchi";

    try {
      setSharingId(reportId);

      if (navigator.share) {
        await navigator.share({
          title: reportTitle,
          text: shareText,
          url: shareUrl,
        });
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      }
    } catch {
      return;
    } finally {
      setSharingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="container mx-auto px-0 py-0 md:px-4 md:py-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[260px_minmax(0,1fr)_320px]">
          <aside className="hidden xl:block">
            <div className="sticky top-24 space-y-4">
              <Card>
                <CardHeader className="space-y-2">
                  <CardTitle className="text-xl">Ullatchi Pulse</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Report local issues and track how quickly they get resolved.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button size="lg" className="w-full" onClick={() => setDialogOpen(true)}>
                    Report Issue
                  </Button>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span>Live reports</span>
                      <span className="font-semibold text-foreground">{totalReports}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Resolution rate</span>
                      <span className="font-semibold text-foreground">
                        {stats?.resolutionRate ?? 0}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">How It Works</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>1. Share what happened and where</p>
                  <p>2. Ullatchi verifies and publishes</p>
                  <p>3. Community tracks progress in real time</p>
                </CardContent>
              </Card>
            </div>
          </aside>

          <section className="min-h-[70vh] border-y bg-background md:rounded-xl md:border">
            <header className="sticky top-16 z-10 border-b bg-background/95 backdrop-blur">
              <div className="flex flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
                <div>
                  <h1 className="text-2xl font-bold md:text-3xl">Report Feed</h1>
                  <p className="text-sm text-muted-foreground md:text-base">
                    A live stream of local issues from your community.
                  </p>
                </div>
                <Button size="lg" className="w-full md:w-auto" onClick={() => setDialogOpen(true)}>
                  Report Issue
                </Button>
              </div>
            </header>

            {isLoadingReports && (
              <div className="flex min-h-[260px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}

            {reportsError && (
              <div className="px-4 py-12 text-center md:px-6">
                <p className="text-destructive">
                  Failed to load reports. Please try again later.
                </p>
              </div>
            )}

            {!isLoadingReports && !reportsError && reports.length === 0 && (
              <div className="px-4 py-16 text-center md:px-6">
                <p className="text-muted-foreground">No issues have been reported yet.</p>
              </div>
            )}

            {!isLoadingReports && !reportsError && reports.length > 0 && (
              <div className="divide-y">
                {newReportsCheck && newReportsCheck.length > 0 && (
                  <div className="sticky top-18 z-10 border-b bg-background/95 px-4 py-3 backdrop-blur md:px-6">
                    <button
                      type="button"
                      onClick={handleNewReportsClick}
                      className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {newReportsCheck.length === 1
                        ? "1 new report"
                        : `${newReportsCheck.length} new reports`}
                    </button>
                  </div>
                )}
                {reports.map((report) => {
                  const statusInfo = statusConfig[report.status];
                  const StatusIcon = statusInfo.icon;
                  const isSharing = sharingId === report._id;

                  return (
                    <article key={report._id} id={report._id} className="px-4 py-5 md:px-6 md:py-6">
                      <div className="flex items-start gap-3 md:gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Flag className="h-5 w-5" />
                        </div>

                        <div className="min-w-0 flex-1 space-y-3">
                          <div className="space-y-2">
                            <h2 className="text-lg font-semibold leading-tight md:text-xl">
                              {report.title}
                            </h2>

                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground md:text-sm">
                              {report.location && (
                                <span className="inline-flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5" />
                                  {report.location.name}
                                </span>
                              )}
                              {report.category && (
                                <span className="inline-flex items-center gap-1">
                                  <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                                  {report.category.name}
                                </span>
                              )}
                              {report.dateReported && (
                                <span className="inline-flex items-center gap-1">
                                  <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                                  {formatRelativeDate(report.dateReported)} ·{" "}
                                  {formatDate(report.dateReported)}
                                </span>
                              )}
                            </div>
                          </div>

                          {report.description && (
                            <p className="text-sm leading-relaxed text-foreground/90 md:text-base">
                              {report.description}
                            </p>
                          )}

                          {report.imageUrl && (
                            <div className="overflow-hidden rounded-xl border bg-muted/30">
                              <img
                                src={report.imageUrl}
                                alt={report.imageAlt || report.title}
                                className="h-56 w-full object-cover md:h-72"
                              />
                            </div>
                          )}

                          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                            <Badge variant="outline" className={cn("border", statusInfo.className)}>
                              <StatusIcon className="mr-1 h-3.5 w-3.5" />
                              {statusInfo.label}
                            </Badge>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleShare(report._id, report.title)}
                              disabled={isSharing}
                            >
                              {isSharing ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Share2 className="mr-2 h-4 w-4" />
                              )}
                              Share
                            </Button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}

                <div ref={loadMoreRef} className="flex items-center justify-center px-4 py-8 md:px-6">
                  {hasNextPage ? (
                    isFetchingNextPage ? (
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    ) : (
                      <p className="text-sm text-muted-foreground">Loading more issues...</p>
                    )
                  ) : (
                    <p className="text-sm text-muted-foreground">You&apos;re all caught up.</p>
                  )}
                </div>
              </div>
            )}
          </section>

          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-4">
              <Card className="bg-primary text-primary-foreground">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-primary-foreground">Community Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingStats ? (
                    <div className="flex items-center justify-center py-3">
                      <Loader2 className="h-5 w-5 animate-spin text-primary-foreground/80" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <FileText className="h-7 w-7 text-primary-foreground/70" />
                        <div>
                          <p className="text-xl font-bold leading-none">{stats?.total ?? 0}</p>
                          <p className="text-xs text-primary-foreground/75">Total reported</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-7 w-7 text-primary-foreground/70" />
                        <div>
                          <p className="text-xl font-bold leading-none">{stats?.resolved ?? 0}</p>
                          <p className="text-xs text-primary-foreground/75">Resolved</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <TrendingUp className="h-7 w-7 text-primary-foreground/70" />
                        <div>
                          <p className="text-xl font-bold leading-none">
                            {stats?.resolutionRate ?? 0}%
                          </p>
                          <p className="text-xs text-primary-foreground/75">Resolution rate</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Top Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  {topCategories.length > 0 ? (
                    <div className="space-y-2">
                      {topCategories.map(([categoryName, count]) => (
                        <div key={categoryName} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{categoryName}</span>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Categories will appear as reports come in.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Issues Map</CardTitle>
                </CardHeader>
                <CardContent>
                  <IssuesMap reports={reports} />
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </div>

      <ReportDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleReportSuccess}
      />
    </div>
  )
}
