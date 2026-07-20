import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-6">
            <Skeleton className="h-6 w-40 rounded-full" />
            <Skeleton className="h-14 w-full max-w-lg" />
            <Skeleton className="h-14 w-4/5 max-w-md" />
            <Skeleton className="h-5 w-full max-w-xl" />
            <Skeleton className="h-5 w-5/6 max-w-lg" />

            <div className="flex gap-4 pt-4">
              <Skeleton className="h-12 w-44 rounded-xl" />
              <Skeleton className="h-12 w-44 rounded-xl" />
            </div>
          </div>

          <Skeleton className="h-[500px] w-full rounded-3xl" />
        </div>
      </section>

      {/* Contact Cards */}
      <section className="container mx-auto -mt-10 px-6">
        <div className="grid gap-6 rounded-3xl bg-card p-6 shadow-lg md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex gap-4">
              <Skeleton className="h-16 w-16 rounded-2xl" />

              <div className="flex-1 space-y-3">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Form + Map */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid gap-10 lg:grid-cols-2">
          <Skeleton className="h-[650px] rounded-3xl" />
          <Skeleton className="h-[650px] rounded-3xl" />
        </div>
      </section>

      {/* Newsletter */}
      <section className="container mx-auto px-6 pb-20">
        <Skeleton className="h-60 rounded-3xl" />
      </section>
    </main>
  );
}