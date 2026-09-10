import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* 5 KPI Cards Grid Skeleton */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="border-border/60 bg-card/60 shadow-none">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-9 w-9 rounded-md shrink-0" />
              </div>
              <div className="mt-3 space-y-2">
                <Skeleton className="h-7 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Charts Grid Skeleton */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="border-border/60 bg-card/60 shadow-none">
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-3.5 w-48" />
            </CardHeader>
            <CardContent className="pt-4">
              <Skeleton className="h-[220px] w-full rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Business Insights Grid Skeleton */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="border-border/60 bg-card/60 shadow-none">
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3.5 w-44" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-12 w-full rounded-md" />
              <Skeleton className="h-12 w-full rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
