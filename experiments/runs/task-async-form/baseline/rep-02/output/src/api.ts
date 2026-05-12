/** Simulated remote API with network-like delays. */

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Async server-side rule: token must be exactly "ACCEPT". */
export async function validateTokenRemote(token: string): Promise<{
  ok: boolean;
  message?: string;
}> {
  await delay(450);
  const trimmed = token.trim();
  if (trimmed.length === 0) {
    return { ok: false, message: "Token is required (server)." };
  }
  if (trimmed !== "ACCEPT") {
    return {
      ok: false,
      message: 'Server rejects this token. Use the value "ACCEPT".',
    };
  }
  return { ok: true };
}

export type SubmitPayload = { name: string; token: string };

export async function submitFormRemote(
  payload: SubmitPayload,
): Promise<{ ok: true } | { ok: false; message: string }> {
  await delay(500);
  const tokenCheck = await validateTokenRemote(payload.token);
  if (!tokenCheck.ok) {
    return { ok: false, message: tokenCheck.message ?? "Invalid token." };
  }
  if (!payload.name.trim()) {
    return { ok: false, message: "Name required." };
  }
  return { ok: true };
}
