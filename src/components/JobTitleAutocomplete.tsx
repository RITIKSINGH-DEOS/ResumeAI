"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { JOB_TITLE_SUGGESTIONS } from "@/data/jobTitleSuggestions";

type JobTitleAutocompleteProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
};

const MAX_SUGGESTIONS = 10;

export function JobTitleAutocomplete({
  value,
  onChange,
  disabled,
  placeholder,
  className = "",
}: JobTitleAutocompleteProps) {
  const id = useId();
  const listId = `${id}-listbox`;
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);

  const filtered = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (q.length < 1) return [];
    return JOB_TITLE_SUGGESTIONS.filter((t) => t.toLowerCase().includes(q)).slice(0, MAX_SUGGESTIONS);
  }, [value]);

  useEffect(() => {
    setHighlight(0);
  }, [filtered.length, value]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const pick = useCallback(
    (title: string) => {
      onChange(title);
      setOpen(false);
      inputRef.current?.focus();
    },
    [onChange]
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && filtered.length > 0 && value.trim().length >= 1 && e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (!open || filtered.length === 0) return;
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((i) => (i + 1) % filtered.length);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((i) => (i - 1 + filtered.length) % filtered.length);
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      pick(filtered[highlight] ?? filtered[0]);
    }
  };

  const showList = open && !disabled && filtered.length > 0 && value.trim().length >= 1;

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        id={id}
        type="text"
        role="combobox"
        aria-expanded={showList}
        aria-controls={showList ? listId : undefined}
        aria-autocomplete="list"
        autoComplete="off"
        className={className}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          if (value.trim().length >= 1) setOpen(true);
        }}
        onKeyDown={onKeyDown}
      />
      {showList ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[min(240px,40vh)] overflow-auto rounded-lg border border-white/15 bg-zinc-950/98 py-1 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.85)] backdrop-blur-md"
        >
          {filtered.map((title, i) => (
            <li key={title} role="option" aria-selected={i === highlight}>
              <button
                type="button"
                className={`flex w-full px-3 py-2 text-left text-sm transition-colors ${
                  i === highlight ? "bg-orange-500/20 text-white" : "text-zinc-300 hover:bg-white/[0.06]"
                }`}
                onMouseEnter={() => setHighlight(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(title)}
              >
                {title}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
