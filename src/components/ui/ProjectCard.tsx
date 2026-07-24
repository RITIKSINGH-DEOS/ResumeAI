"use client";

import { SurfaceCard } from "@/components/ui/SurfaceCard";

type ProjectCardProps = {
  /** Short portfolio / project suggestions (from ATS gap analysis) */
  ideas: string[];
};

export function ProjectCard({ ideas }: ProjectCardProps) {
  if (!ideas.length) return null;

  return (
    <SurfaceCard
      eyebrow="Portfolio"
      title="Project ideas"
      titleIcon={<span className="text-violet-400">◇</span>}
      hoverLift
    >
      <ul className="list-outside list-disc space-y-2.5 pl-5 text-sm leading-relaxed text-zinc-300 marker:text-orange-400/90">
        {ideas.slice(0, 5).map((line, i) => (
          <li key={i} className="pl-1">
            {line}
          </li>
        ))}
      </ul>
    </SurfaceCard>
  );
}
