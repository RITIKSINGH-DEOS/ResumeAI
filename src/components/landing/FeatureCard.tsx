import { cn } from "@/lib/cn";

export type FeatureCardVariant = "default" | "featured" | "pro";

export type FeatureCardProps = {
  tag: string;
  title: string;
  description: string;
  icon: string;
  variant?: FeatureCardVariant;
  className?: string;
};

/** Matches `PricingSection` card chrome: Free tier = frosted neutral; Pro tier = orange border + soft glow */
export function FeatureCard({
  tag,
  title,
  description,
  icon,
  variant = "default",
  className,
}: FeatureCardProps) {
  const isAccent = variant === "featured" || variant === "pro";

  return (
    <div
      className={cn(
        "group relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl p-5 transition-all duration-300 ease-out will-change-transform sm:p-6",
        "motion-safe:hover:-translate-y-1 motion-reduce:hover:translate-y-0",
        "active:scale-[0.99] active:duration-150",
        !isAccent &&
          "border border-white/[0.08] bg-white/[0.04] hover:border-white/[0.14] motion-safe:hover:scale-[1.02] hover:shadow-[0_0_28px_rgba(0,0,0,0.35),0_18px_36px_-14px_rgba(0,0,0,0.45)]",
        isAccent &&
          "border border-orange-500/40 bg-gradient-to-b from-orange-500/[0.08] to-transparent shadow-[0_0_50px_-18px_rgba(249,115,22,0.35)] hover:border-orange-400/60 motion-safe:hover:scale-[1.03] hover:shadow-[0_0_48px_-12px_rgba(249,115,22,0.42),0_22px_44px_-18px_rgba(0,0,0,0.55)]",
        "motion-reduce:hover:scale-100",
        className
      )}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center self-start rounded-xl text-[1.35rem] leading-none transition-transform duration-200 motion-safe:group-hover:scale-105 sm:h-11 sm:w-11 sm:text-[1.5rem]",
            !isAccent && "bg-white/[0.06] ring-1 ring-inset ring-white/10",
            isAccent && "bg-orange-500/15 ring-1 ring-inset ring-orange-500/25"
          )}
          aria-hidden
        >
          {icon}
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500 transition-colors duration-200 group-hover:text-zinc-400">
            {tag}
          </p>
          <h3 className="text-base font-semibold leading-snug tracking-tight text-white sm:text-lg">{title}</h3>
          <p
            className="line-clamp-2 text-sm leading-relaxed text-zinc-400 transition-colors duration-200 group-hover:text-zinc-300"
            title={description}
          >
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
