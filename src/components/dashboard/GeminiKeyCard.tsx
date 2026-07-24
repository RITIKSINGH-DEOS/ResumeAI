"use client";

import { useState, useEffect } from "react";
import { getUserGeminiKey, setUserGeminiKey, removeUserGeminiKey } from "@/lib/userGeminiKey";

export function GeminiKeyCard() {
  const [key, setKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const existing = getUserGeminiKey();
    if (existing) {
      setKey(existing);
      setSaved(true);
    }
  }, []);

  const handleSave = () => {
    if (!key.trim()) return;
    setUserGeminiKey(key.trim());
    setSaved(true);
  };

  const handleRemove = () => {
    removeUserGeminiKey();
    setKey("");
    setSaved(false);
    setShow(false);
  };

  const masked = key ? `${key.slice(0, 6)}${"•".repeat(Math.max(0, key.length - 10))}${key.slice(-4)}` : "";

  return (
    <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-semibold tracking-tight text-white">Gemini API Key</h3>
        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
          Free
        </span>
      </div>

      <p className="mt-2 text-xs leading-relaxed text-zinc-400">
        Add your own{" "}
        <a
          href="https://aistudio.google.com/apikey"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-orange-400/90 underline-offset-2 hover:underline"
        >
          Google AI Studio
        </a>{" "}
        API key to unlock <span className="font-medium text-orange-400/90">Gemini-powered analysis</span> for free — no Pro plan needed.
      </p>

      {saved ? (
        <div className="mt-3">
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-2.5">
            <span className="text-xs text-emerald-400">✓ Key saved</span>
            <span className="flex-1 truncate font-mono text-[11px] text-zinc-500">
              {show ? key : masked}
            </span>
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="shrink-0 text-[11px] font-medium text-zinc-400 hover:text-white"
            >
              {show ? "Hide" : "Show"}
            </button>
          </div>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={handleRemove}
              className="rounded-lg border border-red-500/25 bg-red-500/[0.08] px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/[0.15]"
            >
              Remove key
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3">
          <div className="flex gap-2">
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="AIzaSy..."
              className="flex-1 rounded-lg border border-white/15 bg-black/30 px-3 py-2 font-mono text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-orange-500/40 focus:ring-2 focus:ring-orange-500/20"
            />
            <button
              type="button"
              onClick={handleSave}
              disabled={!key.trim()}
              className="shrink-0 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:brightness-110 disabled:opacity-40"
            >
              Save
            </button>
          </div>
          <p className="mt-1.5 text-[10px] text-zinc-600">
            Your key is stored in this browser only. It is sent to our server per-request to call Gemini, but never saved or logged.
          </p>
        </div>
      )}
    </div>
  );
}
