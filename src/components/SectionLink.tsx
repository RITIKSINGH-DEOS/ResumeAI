"use client";

import Link from "next/link";

type SectionLinkProps = {
  section: "features" | "pricing";
  className?: string;
  children: React.ReactNode;
};

/** Nav / footer links → `/features` or `/pricing` (alag pages). */
export function SectionLink({ section, className, children }: SectionLinkProps) {
  const href = section === "features" ? "/features" : "/pricing";
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
