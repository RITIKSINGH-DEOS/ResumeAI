const STORAGE_KEY = "resumeai-pending-upload-v1";

function parseToFile(raw: string): File | null {
  try {
    const { name, type, dataUrl } = JSON.parse(raw) as {
      name: string;
      type: string;
      dataUrl: string;
    };
    const comma = dataUrl.indexOf(",");
    if (comma === -1) return null;
    const b64 = dataUrl.slice(comma + 1);
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new File([bytes], name, { type: type || "application/octet-stream" });
  } catch {
    return null;
  }
}

/** Store file for next navigation to /resume-analyzing (sessionStorage size limits apply). */
export async function stashPendingResume(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const dataUrl = reader.result as string;
        sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ name: file.name, type: file.type, dataUrl })
        );
        resolve(true);
      } catch {
        resolve(false);
      }
    };
    reader.onerror = () => resolve(false);
    reader.readAsDataURL(file);
  });
}

/** Read pending file without removing (safe for React Strict Mode). */
export function getPendingResumeFile(): File | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  return parseToFile(raw);
}

export function clearPendingResumeStorage(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}
