import type { UnifiedApiError } from "./types";

export type RetryOptions = {
  maxAttempts: number;
  baseDelayMs: number;
  timeoutMs: number;
};

const defaultRetry: RetryOptions = {
  maxAttempts: 3,
  baseDelayMs: 400,
  timeoutMs: 8_000,
};

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(t);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });
}

function classifyFromMockResult<T>(
  result: T | UnifiedApiError,
): { ok: true; data: T } | { ok: false; error: UnifiedApiError } {
  if (result && typeof result === "object" && "kind" in result) {
    return { ok: false, error: result as UnifiedApiError };
  }
  return { ok: true, data: result as T };
}

/**
 * Wraps async mock calls with timeout, retries for retryable unified errors,
 * and maps thrown AbortError to a stable unified shape for the UI layer.
 */
export async function runWithRetry<T>(
  op: (signal: AbortSignal) => Promise<T | UnifiedApiError>,
  opts: Partial<RetryOptions> = {},
): Promise<{ ok: true; data: T } | { ok: false; error: UnifiedApiError }> {
  const { maxAttempts, baseDelayMs, timeoutMs } = { ...defaultRetry, ...opts };

  let lastError: UnifiedApiError | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const raw = await op(controller.signal);
      clearTimeout(timer);
      const classified = classifyFromMockResult<T>(raw);
      if (!classified.ok) {
        lastError = classified.error;
        if (!classified.error.retryable) return classified;
        if (attempt < maxAttempts) {
          await sleep(baseDelayMs * attempt, controller.signal).catch(() => {});
          continue;
        }
        return classified;
      }
      return classified;
    } catch (e) {
      clearTimeout(timer);
      if (e instanceof DOMException && e.name === "AbortError") {
        lastError = {
          kind: "timeout",
          message: "Request timed out. Check your connection and try again.",
          retryable: attempt < maxAttempts,
        };
        if (attempt < maxAttempts) {
          await sleep(baseDelayMs * attempt).catch(() => {});
          continue;
        }
        return { ok: false, error: lastError };
      }
      const net: UnifiedApiError = {
        kind: "network",
        message: "Network error. Try again shortly.",
        retryable: attempt < maxAttempts,
      };
      lastError = net;
      if (attempt < maxAttempts) {
        await sleep(baseDelayMs * attempt).catch(() => {});
        continue;
      }
      return { ok: false, error: net };
    }
  }

  return {
    ok: false,
    error: lastError ?? {
      kind: "network",
      message: "Unexpected failure",
      retryable: false,
    },
  };
}

export function userMessageForError(err: UnifiedApiError): string {
  switch (err.kind) {
    case "client_4xx":
      return err.status === 409
        ? "Conflict with existing data. Fix highlighted fields."
        : "Request was rejected. Correct the form and try again.";
    case "server_5xx":
      return "Server error. We will retry automatically when possible.";
    case "timeout":
      return "The server took too long to respond. Retrying may help.";
    case "network":
      return "Connection problem. Check your network and retry.";
    default:
      return err.message;
  }
}
