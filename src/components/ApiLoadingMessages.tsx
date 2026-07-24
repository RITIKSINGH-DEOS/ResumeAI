"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { API_LOADING_MESSAGES, API_LOADING_ROTATE_MS } from "@/lib/apiLoadingMessages";

type ApiLoadingMessagesProps = {
  loading: boolean;
  className?: string;
};

export function ApiLoadingMessages({ loading, className = "" }: ApiLoadingMessagesProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!loading) {
      setIndex(0);
      return;
    }

    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % API_LOADING_MESSAGES.length);
    }, API_LOADING_ROTATE_MS);

    return () => window.clearInterval(id);
  }, [loading]);

  if (!loading) return null;

  return (
    <div
      className={`min-h-[2.5rem] text-center text-sm leading-relaxed text-zinc-300 ${className}`}
      role="status"
      aria-live="polite"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="mx-auto max-w-md"
        >
          {API_LOADING_MESSAGES[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
