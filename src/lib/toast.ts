import type { CSSProperties } from "react";
import toast from "react-hot-toast";

const baseStyle: CSSProperties = {
  background: "#18181b",
  color: "#fafafa",
  borderRadius: "0.5rem",
  boxShadow: "0 12px 40px -12px rgba(0, 0, 0, 0.55)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  fontSize: "14px",
  padding: "12px 16px",
  maxWidth: "min(100vw - 2rem, 22rem)",
};

/** Orange accent — same as login success (`successToast`). */
const brandAccentStyle: CSSProperties = {
  ...baseStyle,
  borderLeft: "3px solid #f97316",
};

export function successToast(message: string) {
  return toast.success(message, {
    duration: 3500,
    position: "top-right",
    style: brandAccentStyle,
  });
}

/** Same chrome as login success; no success icon — for neutral notices (e.g. invalid upload). */
export function brandToast(message: string, options?: { id?: string }) {
  return toast(message, {
    ...(options?.id != null ? { id: options.id } : {}),
    duration: 4000,
    position: "top-right",
    style: brandAccentStyle,
  });
}

export function errorToast(message: string) {
  return toast.error(message, {
    duration: 5000,
    position: "top-right",
    style: brandAccentStyle,
  });
}

/** Long-running operations: show immediately; replace with success/error when done (same `id`). */
export function loadingToast(message: string) {
  return toast.loading(message, {
    position: "top-right",
    style: brandAccentStyle,
  });
}

export function replaceLoadingWithSuccess(id: string, message: string) {
  toast.success(message, {
    id,
    duration: 3500,
    position: "top-right",
    style: brandAccentStyle,
  });
}

export function replaceLoadingWithError(id: string, message: string) {
  toast.error(message, {
    id,
    duration: 5000,
    position: "top-right",
    style: brandAccentStyle,
  });
}
