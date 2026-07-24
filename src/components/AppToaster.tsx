"use client";

import { Toaster } from "react-hot-toast";

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      containerStyle={{ top: 16, right: 16 }}
      toastOptions={{
        duration: 4000,
        className: "!font-sans !text-sm",
        style: {
          background: "#18181b",
          color: "#fafafa",
          borderRadius: "0.5rem",
          boxShadow: "0 12px 40px -12px rgba(0, 0, 0, 0.55)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderLeft: "3px solid #f97316",
        },
        success: {
          iconTheme: {
            primary: "#f97316",
            secondary: "#18181b",
          },
        },
        error: {
          iconTheme: {
            primary: "#f97316",
            secondary: "#18181b",
          },
        },
      }}
    />
  );
}
