export default function Loading() {
  return (
    <div className="container mx-auto animate-pulse px-4 py-8">
      <div className="mb-8 flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-purple-100" />
        <div className="space-y-2">
          <div className="h-8 w-56 rounded-lg bg-purple-100" />
          <div className="h-4 w-40 rounded bg-slate-100" />
        </div>
      </div>
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-slate-100" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="h-48 rounded-2xl bg-slate-100" />
          <div className="h-40 rounded-2xl bg-slate-100" />
        </div>
        <div className="h-64 rounded-2xl bg-slate-100" />
      </div>
    </div>
  );
}
