"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { getUserPlanLabel, isPremiumPublicMetadata } from "@/lib/clerkPremium";

/** Razorpay brand blue (marketing / checkout alignment) */
const RZP_BLUE = "#3395FF";

/**
 * Clerk avatar: Pro = Razorpay blue ring + pulsing blur halo + layered box-shadow glow. Free = neutral ring.
 */
export function NavbarUserButton() {
  const { user } = useUser();
  const meta = user?.publicMetadata as Record<string, unknown> | undefined;
  const isPro = isPremiumPublicMetadata(meta);
  const planLabel = getUserPlanLabel(meta);

  return (
    <div className="flex items-center gap-2">
      {/* Pro: Rzp blue ring + blurred halo + layered glow (Free: sky-tinted ring) */}
      <div className="relative shrink-0">
        {isPro ? (
          <span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-[52px] w-[52px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#3395FF]/35 blur-[16px] animate-pulse"
          />
        ) : null}
        <div
          className={
            isPro
              ? "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#3395FF] to-[#2563eb] p-[2px] shadow-[0_0_12px_rgba(51,149,255,0.5),0_0_24px_rgba(51,149,255,0.32),0_0_40px_rgba(51,149,255,0.18),0_0_56px_rgba(51,149,255,0.08)]"
              : "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-1 ring-sky-700/50 ring-offset-2 ring-offset-black"
          }
          title={isPro ? "Pro plan" : "Free plan"}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-black [&_.cl-userButtonAvatarImage]:h-full [&_.cl-userButtonAvatarImage]:w-full [&_.cl-userButtonAvatarImage]:object-cover">
            <UserButton
              appearance={{
                variables: {
                  colorPrimary: isPro ? RZP_BLUE : "#f97316",
                  colorTextOnPrimaryBackground: isPro ? "#0f172a" : "#431407",
                },
                elements: {
                  userButtonAvatarBox:
                    "h-9 w-9 !h-9 !w-9 !min-h-[36px] !min-w-[36px] shrink-0 rounded-full !border-0 !shadow-none",
                  userButtonTrigger:
                    "rounded-full !p-0 !outline-none focus:!shadow-none focus-visible:!ring-0 focus-visible:!ring-offset-0",
                },
              }}
            />
          </div>
        </div>
      </div>
      <span className="sr-only">Current plan: {planLabel}</span>
    </div>
  );
}
