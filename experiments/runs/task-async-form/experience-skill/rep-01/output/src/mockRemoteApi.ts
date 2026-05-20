import type { FieldKey, UnifiedApiError } from "./types";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** In-memory idempotency + conflict simulation for the mock server */
const idempotentResults = new Map<string, { at: number; payload: unknown }>();
let submitAttemptCount = 0;

export async function mockValidateUsername(
  username: string,
  signal?: AbortSignal,
): Promise<{ valid: boolean; message?: string }> {
  await delay(450);
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
  const u = username.trim().toLowerCase();
  if (u.length < 2) return { valid: false, message: "At least 2 characters" };
  if (u === "admin") return { valid: false, message: "Username is reserved" };
  return { valid: true };
}

export async function mockValidateEmail(
  email: string,
  signal?: AbortSignal,
): Promise<{ valid: boolean; message?: string }> {
  await delay(350);
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
  const e = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))
    return { valid: false, message: "Invalid email shape" };
  if (!e.endsWith(".com"))
    return { valid: false, message: "Server only accepts .com addresses" };
  return { valid: true };
}

export type SubmitBody = Record<FieldKey, string> & {
  idempotencyKey: string;
};

export type SubmitSuccess = { ok: true; serverUpdatedAt: number };

export async function mockSubmit(
  body: SubmitBody,
  signal?: AbortSignal,
): Promise<SubmitSuccess | UnifiedApiError> {
  await delay(500);
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

  const cached = idempotentResults.get(body.idempotencyKey);
  if (cached && Date.now() - cached.at < 60_000) {
    return cached.payload as SubmitSuccess;
  }

  submitAttemptCount += 1;
  // First live attempt fails with 503 to exercise retry + recovery paths
  if (submitAttemptCount === 1) {
    const err: UnifiedApiError = {
      kind: "server_5xx",
      status: 503,
      message: "Upstream temporarily unavailable",
      retryable: true,
    };
    return err;
  }

  // Second attempt: return field-level conflict for email if unchanged from seeded value
  if (body.email === "taken@example.com") {
    const err: UnifiedApiError = {
      kind: "client_4xx",
      status: 409,
      message: "Email already registered",
      fieldErrors: { email: "This email is already in use" },
      retryable: false,
    };
    return err;
  }

  const success: SubmitSuccess = {
    ok: true,
    serverUpdatedAt: Date.now(),
  };
  idempotentResults.set(body.idempotencyKey, {
    at: Date.now(),
    payload: success,
  });
  return success;
}

export function resetMockServerState(): void {
  idempotentResults.clear();
  submitAttemptCount = 0;
}
