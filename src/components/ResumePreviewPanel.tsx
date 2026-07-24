"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { parseResumeSections, type ResumeSection } from "@/lib/formatResumeText";

/** Lines that look like resume section headers (fallback when parsing yields one block). */
const SECTION_LINE_RE =
  /^(#{1,3}\s*)?(Summary|Objective|Contact|Experience|Work Experience|Professional Experience|Internship|Education|Skills|Technical Skills|Projects|Achievements|Certifications?|Publications|References)\s*$/i;

function isBulletLine(line: string): boolean {
  const s = line.trimStart();
  return /^[•\-\*▸▹]\s/.test(s) || s.startsWith("•");
}

function stripBullet(line: string): string {
  return line.replace(/^\s*[•\-\*▸▹]\s*/, "").trim();
}

function SectionBlock({ section }: { section: ResumeSection }) {
  const blocks: { type: "ul" | "p"; items: string[] }[] = [];
  let buf: string[] = [];
  let mode: "ul" | "p" = "p";

  const flush = () => {
    if (buf.length === 0) return;
    blocks.push({ type: mode, items: [...buf] });
    buf = [];
  };

  for (const raw of section.lines) {
    const line = raw.trimEnd();
    if (!line) {
      flush();
      continue;
    }
    const bullet = isBulletLine(line);
    const nextMode: "ul" | "p" = bullet ? "ul" : "p";
    if (buf.length && nextMode !== mode) flush();
    mode = nextMode;
    buf.push(bullet ? stripBullet(line) : line);
  }
  flush();

  return (
    <div className="border-l-2 border-orange-500/70 pl-3">
      <h3 className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-orange-400">
        {section.title}
      </h3>
      <div className="space-y-2 text-[11px] leading-relaxed sm:text-xs">
        {blocks.map((b, i) =>
          b.type === "ul" ? (
            <ul key={i} className="list-disc space-y-1.5 pl-4 text-zinc-300 marker:text-orange-400">
              {b.items.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          ) : (
            <div key={i} className="space-y-1.5 text-zinc-300">
              {b.items.map((para, j) => (
                <p key={j}>{para}</p>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

function FallbackResumeLines({ text }: { text: string }) {
  return (
    <div className="space-y-1 font-mono text-[11px] leading-relaxed">
      {text.split("\n").map((line, i) => {
        const trimmed = line.trim();
        const isHeader = trimmed.length > 0 && trimmed.length < 90 && SECTION_LINE_RE.test(trimmed);
        return (
          <p
            key={i}
            className={
              isHeader
                ? "font-semibold text-orange-400"
                : /^[•\-\*]\s/.test(line.trimStart())
                  ? "text-zinc-300"
                  : "text-zinc-400"
            }
          >
            {line || "\u00a0"}
          </p>
        );
      })}
    </div>
  );
}

type ResumePreviewPanelProps = {
  text: string;
  /** Use on resume editor: flush top, no outer motion offset */
  embedded?: boolean;
};

/**
 * Sectioned, terminal-adjacent preview — bullets grouped; less bulky than raw paste.
 */
export function ResumePreviewPanel({ text, embedded }: ResumePreviewPanelProps) {
  const sections = useMemo(() => {
    const t = text.trim();
    if (!t) return [];
    return parseResumeSections(t);
  }, [text]);

  if (!text.trim()) return null;

  const shellClass = embedded
    ? "mt-0 overflow-hidden rounded-2xl border border-orange-500/20 bg-[#0a0a0a] shadow-[0_0_0_1px_rgba(249,115,22,0.08)_inset,0_24px_60px_-28px_rgba(249,115,22,0.2)]"
    : "mt-4 overflow-hidden rounded-xl border border-orange-500/25 bg-zinc-950/80 shadow-[0_12px_40px_-16px_rgba(249,115,22,0.15)]";

  const inner = (
    <>
      <div className="flex items-center justify-between border-b border-orange-500/20 bg-orange-500/[0.06] px-3 py-2 sm:px-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-orange-300 sm:text-[11px]">extracted_resume.md</span>
        </div>
        <span className="text-[10px] text-orange-400/80">preview</span>
      </div>
      <div className="max-h-[min(420px,55vh)] overflow-y-auto overscroll-contain px-3 py-3 sm:px-4 sm:py-4">
        <p className="mb-3 font-mono text-[10px] text-orange-400/60">
          Sections + bullets detected from your file — same text as analysis, easier to scan.
        </p>
        <div className="space-y-5 font-mono">
          {sections.length === 0 ? (
            <FallbackResumeLines text={text} />
          ) : (
            sections.map((sec, idx) => <SectionBlock key={`${sec.title}-${idx}`} section={sec} />)
          )}
        </div>
      </div>
    </>
  );

  if (embedded) {
    return <div className={shellClass}>{inner}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
      className={shellClass}
    >
      {inner}
    </motion.div>
  );
}
