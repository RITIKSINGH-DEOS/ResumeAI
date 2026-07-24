"use client";

/** Loading state matching editor layout: navbar strip + two-column body. */
export function EditorPageSkeleton() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#0D0D0D]">
      <div className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-3 py-3 sm:px-4 md:px-6">
          <div className="h-5 w-24 animate-pulse rounded-md bg-zinc-800" />
          <div className="mx-auto h-9 flex-1 max-w-md animate-pulse rounded-xl bg-zinc-800/80" />
          <div className="h-9 w-20 animate-pulse rounded-xl bg-zinc-800/70" />
        </div>
      </div>
      <div className="flex-1 px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="space-y-3">
              <div className="h-[420px] animate-pulse rounded-2xl bg-zinc-900/80" />
            </div>
            <div className="space-y-3">
              <div className="h-40 animate-pulse rounded-2xl bg-zinc-900/70" />
              <div className="h-32 animate-pulse rounded-2xl bg-zinc-900/60" />
              <div className="h-32 animate-pulse rounded-2xl bg-zinc-900/50" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
