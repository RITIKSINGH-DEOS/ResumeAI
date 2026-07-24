"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { TemplatePro } from "@/components/templates/TemplatePro";
import { TemplateLatex } from "@/components/templates/TemplateLatex";
import { EMPTY_RESUME, type ResumeData } from "@/components/templates/types";

type TemplateId = "pro" | "latex";

const inputCls =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-orange-500/40 focus:ring-2 focus:ring-orange-500/20";

const labelCls =
  "mb-1.5 block text-xs font-medium text-zinc-400";

const addBtnCls =
  "rounded-full border border-orange-500 bg-transparent px-4 py-1.5 text-xs font-medium text-orange-500 transition-all duration-200 hover:bg-orange-500 hover:text-white";

const sectionHeadCls =
  "text-xs font-semibold uppercase tracking-wider text-orange-400";

/* ─────────────────── Template Selector ─────────────────── */

function TemplateSelector({ onSelect }: { onSelect: (t: TemplateId) => void }) {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#0a0a0a] px-4 py-16 font-sans text-[#f0f0f0]">
      <h1 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">
        Choose a template
      </h1>
      <p className="mb-10 text-sm text-zinc-500">
        You can switch anytime in the builder.
      </p>

      <div className="mx-auto grid w-full max-w-3xl gap-6 sm:grid-cols-2">
        {/* Card – Modern */}
        <div className="group flex flex-col overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] transition-all hover:border-[#f97316]/60">
          {/* Thumbnail */}
          <div className="relative flex h-64 items-start justify-center overflow-hidden border-b border-[#2a2a2a] bg-white">
            <Image src="/template-modern.png" alt="Modern template preview" width={600} height={800} className="w-full object-cover object-top" />
          </div>
          <div className="flex flex-1 flex-col gap-3 p-5">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">Modern</h2>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                Free
              </span>
              <span className="rounded-full border border-[#f97316]/30 bg-[#f97316]/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#f97316]">
                ATS Friendly
              </span>
            </div>
            <p className="text-xs leading-relaxed text-[#666666]">
              Two-column Enhancv-style layout with skill highlights and achievement sidebar.
            </p>
            <button
              type="button"
              onClick={() => onSelect("pro")}
              className="mt-auto rounded-lg bg-[#f97316] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110"
            >
              Use Template
            </button>
          </div>
        </div>

        {/* Card – LaTeX */}
        <div className="group flex flex-col overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] transition-all hover:border-[#f97316]/60">
          <div className="relative flex h-64 items-start justify-center overflow-hidden border-b border-[#2a2a2a] bg-white">
            <Image src="/template-latex.png" alt="LaTeX template preview" width={600} height={800} className="w-full object-cover object-top" />
          </div>
          <div className="flex flex-1 flex-col gap-3 p-5">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">LaTeX</h2>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                Free
              </span>
              <span className="rounded-full border border-[#f97316]/30 bg-[#f97316]/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#f97316]">
                ATS Friendly
              </span>
            </div>
            <p className="text-xs leading-relaxed text-[#666666]">
              Classic Overleaf/LaTeX serif style — single-column, clean horizontal rules.
            </p>
            <button
              type="button"
              onClick={() => onSelect("latex")}
              className="mt-auto rounded-lg bg-[#f97316] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110"
            >
              Use Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── Helpers ─────────────────── */

function updateAt<T>(arr: T[], idx: number, patch: Partial<T>): T[] {
  return arr.map((v, i) => (i === idx ? { ...v, ...patch } : v));
}

function updatePointAt<T extends { points: string[] }>(arr: T[], parentIdx: number, pointIdx: number, value: string): T[] {
  return arr.map((v, i) => {
    if (i !== parentIdx) return v;
    const pts = [...v.points];
    pts[pointIdx] = value;
    return { ...v, points: pts };
  });
}

function addPoint<T extends { points: string[] }>(arr: T[], idx: number): T[] {
  return arr.map((v, i) => (i === idx ? { ...v, points: [...v.points, ""] } : v));
}

/* ─────────────────── Builder ─────────────────── */

export function ResumeBuilderClient() {
  const [template, setTemplate] = useState<TemplateId | null>(null);
  const [data, setData] = useState<ResumeData>(structuredClone(EMPTY_RESUME));
  const previewRef = useRef<HTMLDivElement>(null);

  const p = data.personal;
  const setP = (patch: Partial<ResumeData["personal"]>) =>
    setData((d) => ({ ...d, personal: { ...d.personal, ...patch } }));

  /* ── Print / Download PDF ── */
  const handleDownload = () => {
    const el = previewRef.current;
    if (!el) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${p.name || "Resume"}</title>
<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'DM Sans',sans-serif;background:#fff}
@page{margin:0.35in}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head><body>${el.innerHTML}</body></html>`);
    w.document.close();
    setTimeout(() => {
      w.print();
      w.close();
    }, 600);
  };

  /* ── Selector screen ── */
  if (!template) return <TemplateSelector onSelect={setTemplate} />;

  const ActiveTemplate = template === "pro" ? TemplatePro : TemplateLatex;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#0a0a0a] font-sans text-[#f0f0f0]">
      {/* ── Topbar ── */}
      <header className="sticky top-0 z-20 border-b border-[#2a2a2a] bg-[#141414] px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-4">
            <Link
              href="/"
              className="resume-ai-logo-static shrink-0 text-sm font-semibold tracking-tight sm:text-base"
            >
              <span className="text-[#f0f0f0]">Resume</span>
              <span className="text-[#f97316]">AI</span>
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Template toggle */}
            <div className="flex rounded-full border border-[#2a2a2a] bg-[#0a0a0a] p-1">
              {(["pro", "latex"] as TemplateId[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTemplate(t)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all sm:text-sm ${
                    template === t
                      ? "border border-[#f97316] text-[#f97316]"
                      : "border border-transparent text-[#666666] hover:text-[#f0f0f0]"
                  }`}
                >
                  {t === "pro" ? "Modern" : "LaTeX"}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={handleDownload}
              className="rounded-full bg-[#f97316] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-105"
            >
              Download PDF
            </button>
          </div>
        </div>
      </header>

      {/* ── Main grid ── */}
      <div className="mx-auto grid w-full max-w-7xl flex-1 gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-8 lg:px-6 lg:py-8">
        {/* ── Form panel ── */}
        <div className="min-h-0 space-y-7 bg-[#0a0a0a] pb-24 lg:max-h-[calc(100dvh-80px)] lg:overflow-y-auto lg:pb-8 lg:pr-2">
          {/* Personal */}
          <FormSection title="Personal">
            <Field label="Full name" value={p.name} onChange={(v) => setP({ name: v })} placeholder="Jordan Lee" />
            <Field label="Email" value={p.email} onChange={(v) => setP({ email: v })} placeholder="you@email.com" type="email" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Phone" value={p.phone} onChange={(v) => setP({ phone: v })} placeholder="+1 555 0100" />
              <Field label="Address" value={p.address} onChange={(v) => setP({ address: v })} placeholder="City, Country" />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="LinkedIn" value={p.linkedin} onChange={(v) => setP({ linkedin: v })} placeholder="linkedin.com/in/…" />
              <Field label="GitHub" value={p.github} onChange={(v) => setP({ github: v })} placeholder="github.com/…" />
              <Field label="Portfolio" value={p.portfolio} onChange={(v) => setP({ portfolio: v })} placeholder="yoursite.dev" />
            </div>
          </FormSection>

          {/* Summary */}
          <FormSection title="Summary">
            <textarea
              className={`${inputCls} min-h-[90px] resize-y`}
              value={data.summary}
              onChange={(e) => setData((d) => ({ ...d, summary: e.target.value }))}
              placeholder="Two or three lines about your focus and strengths."
            />
          </FormSection>

          {/* Experience */}
          <FormSection
            title="Experience"
            onAdd={() =>
              setData((d) => ({
                ...d,
                experience: [...d.experience, { company: "", role: "", duration: "", location: "", points: [""] }],
              }))
            }
          >
            {data.experience.map((ex, i) => (
              <Card key={i}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Company" value={ex.company} onChange={(v) => setData((d) => ({ ...d, experience: updateAt(d.experience, i, { company: v }) }))} />
                  <Field label="Role" value={ex.role} onChange={(v) => setData((d) => ({ ...d, experience: updateAt(d.experience, i, { role: v }) }))} />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Duration" value={ex.duration} onChange={(v) => setData((d) => ({ ...d, experience: updateAt(d.experience, i, { duration: v }) }))} placeholder="2022 — Present" />
                  <Field label="Location" value={ex.location} onChange={(v) => setData((d) => ({ ...d, experience: updateAt(d.experience, i, { location: v }) }))} placeholder="San Francisco, CA" />
                </div>
                <PointsList
                  points={ex.points}
                  onChangePoint={(pi, v) => setData((d) => ({ ...d, experience: updatePointAt(d.experience, i, pi, v) }))}
                  onAddPoint={() => setData((d) => ({ ...d, experience: addPoint(d.experience, i) }))}
                />
              </Card>
            ))}
          </FormSection>

          {/* Skills */}
          <FormSection
            title="Skills"
            onAdd={() =>
              setData((d) => ({ ...d, skills: [...d.skills, { category: "", items: [""] }] }))
            }
          >
            {data.skills.map((sk, i) => (
              <Card key={i}>
                <Field
                  label="Category"
                  value={sk.category}
                  onChange={(v) => setData((d) => ({ ...d, skills: updateAt(d.skills, i, { category: v }) }))}
                  placeholder="Languages"
                />
                <PointsList
                  label="Items (one per line)"
                  points={sk.items}
                  onChangePoint={(pi, v) => {
                    setData((d) => {
                      const arr = [...d.skills];
                      const items = [...arr[i].items];
                      items[pi] = v;
                      arr[i] = { ...arr[i], items };
                      return { ...d, skills: arr };
                    });
                  }}
                  onAddPoint={() => {
                    setData((d) => {
                      const arr = [...d.skills];
                      arr[i] = { ...arr[i], items: [...arr[i].items, ""] };
                      return { ...d, skills: arr };
                    });
                  }}
                />
              </Card>
            ))}
          </FormSection>

          {/* Projects */}
          <FormSection
            title="Projects"
            onAdd={() =>
              setData((d) => ({
                ...d,
                projects: [...d.projects, { title: "", tech: "", link: "", date: "", points: [""] }],
              }))
            }
          >
            {data.projects.map((pr, i) => (
              <Card key={i}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Title" value={pr.title} onChange={(v) => setData((d) => ({ ...d, projects: updateAt(d.projects, i, { title: v }) }))} />
                  <Field label="Tech stack" value={pr.tech} onChange={(v) => setData((d) => ({ ...d, projects: updateAt(d.projects, i, { tech: v }) }))} placeholder="React, Node, …" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Link" value={pr.link} onChange={(v) => setData((d) => ({ ...d, projects: updateAt(d.projects, i, { link: v }) }))} placeholder="github.com/…" />
                  <Field label="Date" value={pr.date} onChange={(v) => setData((d) => ({ ...d, projects: updateAt(d.projects, i, { date: v }) }))} placeholder="2024" />
                </div>
                <PointsList
                  points={pr.points}
                  onChangePoint={(pi, v) => setData((d) => ({ ...d, projects: updatePointAt(d.projects, i, pi, v) }))}
                  onAddPoint={() => setData((d) => ({ ...d, projects: addPoint(d.projects, i) }))}
                />
              </Card>
            ))}
          </FormSection>

          {/* Achievements */}
          <FormSection
            title="Achievements"
            onAdd={() =>
              setData((d) => ({
                ...d,
                achievements: [...d.achievements, { title: "", description: "" }],
              }))
            }
          >
            {data.achievements.map((ach, i) => (
              <Card key={i}>
                <Field label="Title" value={ach.title} onChange={(v) => setData((d) => ({ ...d, achievements: updateAt(d.achievements, i, { title: v }) }))} />
                <Field label="Description" value={ach.description} onChange={(v) => setData((d) => ({ ...d, achievements: updateAt(d.achievements, i, { description: v }) }))} />
              </Card>
            ))}
          </FormSection>

          {/* Education */}
          <FormSection
            title="Education"
            onAdd={() =>
              setData((d) => ({
                ...d,
                education: [...d.education, { institute: "", degree: "", cgpa: "", duration: "", location: "" }],
              }))
            }
          >
            {data.education.map((ed, i) => (
              <Card key={i}>
                <Field label="Institute" value={ed.institute} onChange={(v) => setData((d) => ({ ...d, education: updateAt(d.education, i, { institute: v }) }))} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Degree" value={ed.degree} onChange={(v) => setData((d) => ({ ...d, education: updateAt(d.education, i, { degree: v }) }))} />
                  <Field label="CGPA" value={ed.cgpa} onChange={(v) => setData((d) => ({ ...d, education: updateAt(d.education, i, { cgpa: v }) }))} placeholder="9.0" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Duration" value={ed.duration} onChange={(v) => setData((d) => ({ ...d, education: updateAt(d.education, i, { duration: v }) }))} placeholder="2018 — 2022" />
                  <Field label="Location" value={ed.location} onChange={(v) => setData((d) => ({ ...d, education: updateAt(d.education, i, { location: v }) }))} placeholder="City, Country" />
                </div>
              </Card>
            ))}
          </FormSection>
        </div>

        {/* ── Preview panel ── */}
        <div className="hidden lg:block">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-orange-400">
            Live preview
          </p>
          <div
            className="rounded-xl border border-[#2a2a2a] bg-white shadow-[0_24px_60px_-24px_rgba(0,0,0,0.75)] overflow-auto max-h-[calc(100dvh-120px)]"
            ref={previewRef}
          >
            <ActiveTemplate data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────── Small sub-components ────────── */

function FormSection({
  title,
  onAdd,
  children,
}: {
  title: string;
  onAdd?: () => void;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className={sectionHeadCls}>{title}</h2>
        {onAdd && (
          <button type="button" className={addBtnCls} onClick={onAdd}>
            + Add
          </button>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-3 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a]/50 p-4">
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <input
        type={type}
        className={inputCls}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function PointsList({
  points,
  onChangePoint,
  onAddPoint,
  label = "Bullet points",
}: {
  points: string[];
  onChangePoint: (idx: number, value: string) => void;
  onAddPoint: () => void;
  label?: string;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="space-y-2">
        {points.map((pt, i) => (
          <input
            key={i}
            className={inputCls}
            value={pt}
            onChange={(e) => onChangePoint(i, e.target.value)}
            placeholder={`Point ${i + 1}`}
          />
        ))}
      </div>
      <button
        type="button"
        className="mt-2 text-xs font-medium text-[#f97316] hover:underline"
        onClick={onAddPoint}
      >
        + add point
      </button>
    </div>
  );
}
