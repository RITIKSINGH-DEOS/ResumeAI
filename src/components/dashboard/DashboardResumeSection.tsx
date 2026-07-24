"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { isPremiumPublicMetadata } from "@/lib/clerkPremium";
import { FREE_PLAN_MAX_RESUMES } from "@/lib/planLimits";
import { errorToast, successToast } from "@/lib/toast";
import type { ResumeRow } from "@/types/supabase";

const ease = [0.25, 0.1, 0.25, 1] as const;

const listContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
};

const listItem = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease },
  },
};

export function DashboardResumeSection() {
  const { user, isLoaded } = useUser();
  const [resumes, setResumes] = useState<ResumeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const reduce = useReducedMotion();
  /** Avoid duplicate toast when sync + Strict Mode or double navigation fire twice. */
  const lastErrorToastRef = useRef<{ msg: string; at: number } | null>(null);

  const toastErrorOnce = useCallback((msg: string) => {
    const now = Date.now();
    const prev = lastErrorToastRef.current;
    if (prev && prev.msg === msg && now - prev.at < 4000) return;
    lastErrorToastRef.current = { msg, at: now };
    errorToast(msg);
  }, []);

  const syncAndFetch = useCallback(async () => {
    if (!user) return;
    const sync = await fetch("/api/users/sync", { method: "POST" });
    if (!sync.ok) {
      const j = (await sync.json().catch(() => ({}))) as { error?: string };
      toastErrorOnce(j.error ?? "Sync failed");
      setLoading(false);
      return;
    }
    const r = await fetch("/api/resumes");
    if (!r.ok) {
      const j = (await r.json().catch(() => ({}))) as { error?: string };
      toastErrorOnce(j.error ?? "Failed to load resumes");
      setLoading(false);
      return;
    }
    const j = (await r.json()) as { resumes?: ResumeRow[] };
    setResumes(j.resumes ?? []);
    setLoading(false);
  }, [user, toastErrorOnce]);

  useEffect(() => {
    if (!isLoaded || !user) return;
    void syncAndFetch();
  }, [isLoaded, user, syncAndFetch]);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      errorToast("PDF only");
      return;
    }
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/resumes/upload", { method: "POST", body: fd });
    setUploading(false);
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      errorToast(j.error ?? "Upload failed");
      return;
    }
    await syncAndFetch();
    successToast("Upload successful");
  };

  const deleteResume = async (resumeId: string) => {
    if (!user) return;
    setDeletingId(resumeId);
    const res = await fetch(`/api/resumes/${resumeId}`, { method: "DELETE" });
    setDeletingId(null);
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      errorToast(j.error ?? "Delete failed");
      return;
    }
    setResumes((prev) => prev.filter((x) => x.id !== resumeId));
    successToast("Resume deleted successfully");
  };

  if (!isLoaded || !user) return null;

  const meta = user.publicMetadata as Record<string, unknown> | undefined;
  const isPro = isPremiumPublicMetadata(meta);
  const freeAtResumeLimit = !isPro && resumes.length >= FREE_PLAN_MAX_RESUMES;

  return (
    <div className="mt-6 min-w-0 space-y-6 border-t border-white/10 pt-6 sm:mt-8 sm:pt-8">
      <div className="min-w-0">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Resumes</h2>
        {!isPro && (
          <p className="mt-2 text-pretty text-xs leading-relaxed text-zinc-500">
            Free plan: {resumes.length}/{FREE_PLAN_MAX_RESUMES} resumes.
            {freeAtResumeLimit ? (
              <>
                {" "}
                Delete a resume to upload another, or{" "}
                <Link href="/pricing" className="font-medium text-sky-400/95 underline-offset-2 hover:underline">
                  upgrade to Pro
                </Link>{" "}
                for unlimited uploads.
              </>
            ) : null}
          </p>
        )}
        <motion.label
          className={
            freeAtResumeLimit
              ? "btn btn-outline mt-4 flex w-full min-h-[44px] cursor-not-allowed justify-center rounded-xl border border-white/10 bg-white/[0.02] text-zinc-500 opacity-60 pointer-events-none sm:inline-flex sm:w-auto sm:min-h-0"
              : "btn btn-outline mt-4 flex w-full min-h-[44px] cursor-pointer justify-center rounded-xl border border-white/15 bg-white/[0.04] text-zinc-200 transition-all duration-300 hover:border-orange-500/40 hover:bg-orange-500/[0.08] sm:inline-flex sm:w-auto sm:min-h-0"
          }
          whileHover={reduce || freeAtResumeLimit ? undefined : { scale: 1.05 }}
          whileTap={reduce || freeAtResumeLimit ? undefined : { scale: 0.97 }}
        >
          {uploading ? (
            <span className="loading loading-spinner loading-sm text-orange-400" />
          ) : freeAtResumeLimit ? (
            "Limit reached"
          ) : (
            "Upload PDF"
          )}
          <input
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={onFile}
            disabled={uploading || freeAtResumeLimit}
          />
        </motion.label>
      </div>

      {loading ? (
        <motion.p
          className="text-sm text-zinc-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, ease }}
        >
          Loading resumes…
        </motion.p>
      ) : resumes.length === 0 ? (
        <motion.p
          className="text-sm text-zinc-500"
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease }}
        >
          No resumes yet.
        </motion.p>
      ) : (
        <motion.ul
          className="space-y-2"
          variants={reduce ? undefined : listContainer}
          initial={reduce ? false : "hidden"}
          animate={reduce ? undefined : "show"}
        >
          {resumes.map((r) => (
            <motion.li
              key={r.id}
              variants={reduce ? undefined : listItem}
              className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-3 transition-all duration-300 hover:border-orange-500/25 sm:px-4"
              whileHover={reduce ? undefined : { scale: 1.01, y: -1 }}
            >
              <div className="flex min-w-0 flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <a
                  href={r.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-w-0 break-words text-orange-400/95 transition-all duration-300 hover:text-orange-300 hover:underline sm:truncate sm:break-normal"
                >
                  {new Date(r.created_at).toLocaleString()} — Open PDF
                </a>
                <button
                  type="button"
                  disabled={deletingId === r.id}
                  onClick={() => void deleteResume(r.id)}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center self-end rounded-lg text-red-500 transition-all duration-300 hover:bg-red-500/15 hover:text-red-400 disabled:opacity-40 sm:h-auto sm:w-auto sm:self-auto sm:p-1.5"
                  aria-label="Delete PDF"
                  title="Delete"
                >
                  {deletingId === r.id ? (
                    <span className="loading loading-spinner loading-xs text-red-400" />
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="shrink-0"
                      aria-hidden
                    >
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      <line x1="10" x2="10" y1="11" y2="17" />
                      <line x1="14" x2="14" y1="11" y2="17" />
                    </svg>
                  )}
                </button>
              </div>
            </motion.li>
          ))}
        </motion.ul>
      )}
    </div>
  );
}
