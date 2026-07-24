"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";

type GoogleSignInButtonProps = {
  className?: string;
  children?: React.ReactNode;
  /**
   * Use Clerk’s sign-up flow (new accounts). Default uses sign-in (existing + new via OAuth).
   * Use on `/sign-up` so the modal opens on the registration path.
   */
  signUp?: boolean;
};

export function GoogleSignInButton({ className, children, signUp = false }: GoogleSignInButtonProps) {
  const hasKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const defaultLabel = "Continue with Google";

  if (!hasKey) {
    return (
      <button type="button" className={className} disabled title="Add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY">
        {children ?? defaultLabel}
      </button>
    );
  }

  const btn = (
    <button type="button" className={className}>
      {children ?? defaultLabel}
    </button>
  );

  if (signUp) {
    return (
      <SignUpButton mode="modal" forceRedirectUrl="/" signInForceRedirectUrl="/">
        {btn}
      </SignUpButton>
    );
  }

  return (
    <SignInButton mode="modal" forceRedirectUrl="/" signUpForceRedirectUrl="/">
      {btn}
    </SignInButton>
  );
}

/** Dedicated sign-up CTA — same Google OAuth, Clerk sign-up flow. */
export function GoogleSignUpButton(props: Omit<GoogleSignInButtonProps, "signUp">) {
  return <GoogleSignInButton {...props} signUp />;
}
