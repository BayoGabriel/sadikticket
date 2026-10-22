import { Skeleton } from "@/components/admin/ui/Skeleton";

export default function AdminLoading() {
  return (
    <div aria-busy="true">
      <Skeleton className="mb-2 h-8 w-56" />
      <Skeleton className="mb-6 h-4 w-80" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <Skeleton className="mt-4 h-72" />
    </div>
  );
}
