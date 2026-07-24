"use client";

import { cn } from "@/lib/cn";

type ResumeCodeEditorProps = {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  className?: string;
};

/**
 * Code-editor style resume surface: file chrome + monospace + dark borders.
 */
export function ResumeCodeEditor({ value, onChange, id = "resume-body", className }: ResumeCodeEditorProps) {
  return (
    <div
      className={cn(
        "flex min-h-[min(52vh,560px)] flex-col overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0a0a0a] shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset,0_24px_80px_-32px_rgba(0,0,0,0.9)]",
        className
      )}
    >
      {/* Window chrome */}
      <div className="flex shrink-0 items-center gap-3 border-b border-white/[0.06] bg-[#111111] px-3 py-2.5 sm:px-4">
        <div className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/90" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/90" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/90" />
        </div>
        <div className="flex min-w-0 flex-1 items-center justify-center sm:justify-start">
          <span className="inline-flex items-center gap-2 rounded-lg border border-white/[0.07] bg-black/40 px-2.5 py-1 font-mono text-[11px] text-zinc-400">
            <span className="text-orange-400/90">●</span>
            resume.md
          </span>
        </div>
        <span className="hidden font-mono text-[10px] text-zinc-600 sm:block">{value.length} chars</span>
      </div>

      <label htmlFor={id} className="sr-only">
        Resume content
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck
        placeholder="Paste or edit your resume…"
        className="min-h-[min(44vh,480px)] w-full flex-1 resize-y bg-[#0D0D0D] px-4 py-4 font-mono text-[13px] leading-[1.65] text-zinc-100 outline-none transition-[box-shadow] duration-300 placeholder:text-zinc-600 focus-visible:ring-2 focus-visible:ring-orange-500/25 focus-visible:ring-offset-0 sm:text-sm sm:leading-[1.7]"
      />
    </div>
  );
}
