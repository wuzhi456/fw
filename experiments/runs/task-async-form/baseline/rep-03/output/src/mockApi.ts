/**
 * Mock remote API: async field validation and form submission.
 */

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type ValidateUsernameResult =
  | { ok: true }
  | { ok: false; message: string };

/** Simulates server-side uniqueness check. Value "taken" fails until changed. */
export async function validateUsernameRemote(
  username: string,
): Promise<ValidateUsernameResult> {
  await delay(450);
  const trimmed = username.trim();
  if (trimmed.length === 0) {
    return { ok: false, message: "Username is required." };
  }
  if (trimmed.length < 2) {
    return { ok: false, message: "Username must be at least 2 characters." };
  }
  if (trimmed.toLowerCase() === "taken") {
    return { ok: false, message: "That username is already taken." };
  }
  return { ok: true };
}

export type SubmitPayload = { username: string; note: string };

export type SubmitResult =
  | { ok: true }
  | { ok: false; message: string };

export async function submitFormRemote(
  payload: SubmitPayload,
): Promise<SubmitResult> {
  await delay(350);
  const usernameCheck = await validateUsernameRemote(payload.username);
  if (!usernameCheck.ok) {
    return { ok: false, message: usernameCheck.message };
  }
  return { ok: true };
}
