/**
 * Hugging Face Inference API (server-side) — used for free-tier users when Pro uses Gemini.
 * https://huggingface.co/docs/inference-providers/index
 *
 * Set HUGGINGFACE_API_TOKEN (required for free tier). Optionally override the model with
 * HUGGINGFACE_MODEL (Inference API availability varies by model and account).
 */

const HF_INFERENCE_BASE = "https://router.huggingface.co/hf-inference/models";
const HF_OPENAI_CHAT_URL = "https://router.huggingface.co/v1/chat/completions";

/** Default HF model for free / anonymous users when HUGGINGFACE_MODEL is unset. */
export const HUGGINGFACE_DEFAULT_MODEL = "meta-llama/Llama-3.1-8B-Instruct";

export function getHuggingFaceToken(): string | null {
  return process.env.HUGGINGFACE_API_TOKEN?.trim() || null;
}

export function getHuggingFaceModel(): string {
  return process.env.HUGGINGFACE_MODEL?.trim() || HUGGINGFACE_DEFAULT_MODEL;
}

function buildCombinedPrompt(systemInstruction: string | undefined, userPrompt: string): string {
  if (systemInstruction?.trim()) {
    return `${systemInstruction.trim()}\n\n---\n\n${userPrompt}`;
  }
  return userPrompt;
}

function extractGeneratedText(data: unknown): string | null {
  if (Array.isArray(data)) {
    const first = data[0] as Record<string, unknown> | undefined;
    if (first && typeof first.generated_text === "string") return first.generated_text.trim();
    if (first && typeof first.summary_text === "string") return first.summary_text.trim();
  }
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    if (typeof o.generated_text === "string") return o.generated_text.trim();
    if (Array.isArray(o.choices) && o.choices[0]) {
      const c = o.choices[0] as { text?: string; message?: { content?: string } };
      if (typeof c.text === "string") return c.text.trim();
      if (typeof c.message?.content === "string") return c.message.content.trim();
    }
  }
  return null;
}

// export async function huggingfaceGenerateText(opts: {
//   systemInstruction?: string;
//   userPrompt: string;
//   maxNewTokens?: number;
// }): Promise<string> {
//   const token = getHuggingFaceToken();
//   const model = getHuggingFaceModel();
//   if (!token) throw new Error("HUGGINGFACE_API_TOKEN is not set");

//   const inputs = buildCombinedPrompt(opts.systemInstruction, opts.userPrompt);
//   const maxNew = Math.min(Math.max(opts.maxNewTokens ?? 2048, 64), 4096);

//   const primaryUrl = `${HF_INFERENCE_BASE}/${encodeURIComponent(model)}`;
//   const primaryRes = await fetch(primaryUrl, {
//     method: "POST",
//     headers: {
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       inputs,
//       parameters: {
//         max_new_tokens: maxNew,
//         return_full_text: false,
//         temperature: 0.4,
//       },
//       options: { wait_for_model: true },
//     }),
//   });

//   const primaryData: unknown = await primaryRes.json().catch(() => ({}));
//   if (primaryRes.ok) {
//     const text = extractGeneratedText(primaryData);
//     if (text) return text;
//   }

//   const fallbackRes = await fetch(HF_OPENAI_CHAT_URL, {
//     method: "POST",
//     headers: {
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       model,
//       messages: [
//         ...(opts.systemInstruction?.trim()
//           ? [{ role: "system", content: opts.systemInstruction.trim() }]
//           : []),
//         { role: "user", content: opts.userPrompt },
//       ],
//       max_tokens: maxNew,
//       temperature: 0.4,
//     }),
//   });
//   const fallbackData: unknown = await fallbackRes.json().catch(() => ({}));
//   if (fallbackRes.ok) {
//     const text = extractGeneratedText(fallbackData);
//     if (text) return text;
//   }

//   // Prefer clearer status/message from primary failure when available.
//   const badRes = !primaryRes.ok ? primaryRes : fallbackRes;
//   const badData = !primaryRes.ok ? primaryData : fallbackData;
//   const errBody = badData as { error?: string; estimated_time?: number };
//   const msg = errBody.error ?? badRes.statusText;
//   if (badRes.status === 404) {
//     throw new Error(
//       `Hugging Face model not available on Inference Providers (${model}). ` +
//         `Set HUGGINGFACE_MODEL to a provider-backed model and try again.`
//     );
//   }
//   if (badRes.status === 403) {
//     throw new Error(
//       "Hugging Face token lacks Inference Providers permission. " +
//         "Create a token with 'Make calls to Inference Providers'."
//     );
//   }
//   throw new Error(`Hugging Face inference failed (${badRes.status}): ${msg}`);
// }

export async function huggingfaceGenerateText(opts: {
  systemInstruction?: string;
  userPrompt: string;
  maxNewTokens?: number;
}): Promise<string> {
  const token = getHuggingFaceToken();
  const model = getHuggingFaceModel();
  if (!token) throw new Error("HUGGINGFACE_API_TOKEN is not set");

  const maxNew = Math.min(Math.max(opts.maxNewTokens ?? 2048, 64), 4096);

  // 1. Primary: modern Hugging Face router chat completions endpoint (OpenAI compatible)
  const chatRes = await fetch(HF_OPENAI_CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        ...(opts.systemInstruction?.trim()
          ? [{ role: "system", content: opts.systemInstruction.trim() }]
          : []),
        { role: "user", content: opts.userPrompt },
      ],
      max_tokens: maxNew,
      temperature: 0.4,
    }),
  });

  const chatData: unknown = await chatRes.json().catch(() => ({}));
  if (chatRes.ok) {
    const text = extractGeneratedText(chatData);
    if (text) return text;
  }

  // 2. Fallback: legacy text-generation endpoint
  const inputs = buildCombinedPrompt(opts.systemInstruction, opts.userPrompt);
  const legacyUrl = `${HF_INFERENCE_BASE}/${encodeURIComponent(model)}`;
  const legacyRes = await fetch(legacyUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs,
      parameters: {
        max_new_tokens: maxNew,
        return_full_text: false,
        temperature: 0.4,
      },
      options: { wait_for_model: true },
    }),
  });

  const legacyData: unknown = await legacyRes.json().catch(() => ({}));
  if (legacyRes.ok) {
    const text = extractGeneratedText(legacyData);
    if (text) return text;
  }

  // Choose the clearer error message from the chat endpoint or fallback
  const badRes = !chatRes.ok ? chatRes : legacyRes;
  const badData = !chatRes.ok ? chatData : legacyData;
  const errBody = badData as { error?: string | { message?: string }; estimated_time?: number };
  const rawMsg =
    typeof errBody.error === "object" && errBody.error?.message
      ? errBody.error.message
      : typeof errBody.error === "string"
        ? errBody.error
        : badRes.statusText;
  const msg = rawMsg || "Inference failed";

  if (badRes.status === 404) {
    throw new Error(
      `Hugging Face model not available on Inference Providers (${model}). ` +
        `Set HUGGINGFACE_MODEL to a provider-backed model and try again.`
    );
  }
  if (badRes.status === 403) {
    throw new Error(
      "Hugging Face token lacks Inference Providers permission. " +
        "Create a token with 'Make calls to Inference Providers'."
    );
  }
  throw new Error(`Hugging Face inference failed (${badRes.status}): ${msg}`);
}
