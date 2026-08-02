export default function ShopPageSkeleton() {
  return (
    <main className="mx-auto max-w-7xl animate-pulse px-4 pb-24 pt-6 sm:px-6 lg:pb-14 lg:pt-10">
      <div className="mb-4 h-9 w-64 rounded-xl bg-gray-200" />
      <div className="mb-6 flex gap-2 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-8 w-24 shrink-0 rounded-full bg-gray-200" />
        ))}
      </div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="h-8 w-48 rounded bg-gray-200" />
        <div className="h-10 w-80 rounded bg-gray-200" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="hidden h-[600px] rounded-2xl bg-gray-200 lg:block" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {[...Array(15)].map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-xl bg-gray-200" />
          ))}
        </div>
      </div>
    </main>
  );
}
