/** Remote JSON API (JSONPlaceholder). */

const API = "https://jsonplaceholder.typicode.com";

type JsonUser = { id: number; username?: string; email?: string };

function fieldCheckMessage(status: number): string {
  if (status >= 500) {
    return "Server error while checking this field. Try again.";
  }
  if (status >= 400) {
    return "Could not verify this field. Check your input and try again.";
  }
  return "Unexpected response while checking. Try again.";
}

function submitMessage(status: number): string {
  if (status >= 500) {
    return "Server error while saving. Your entries are kept — try again.";
  }
  if (status === 408) {
    return "Request timed out. Your entries are kept — try again.";
  }
  if (status >= 400) {
    return "The server rejected this submission. Review your input and try again.";
  }
  return "Could not save. Your entries are kept — try again.";
}

export async function validateUsernameRemote(
  username: string,
  signal: AbortSignal,
): Promise<{ ok: boolean; message?: string }> {
  const q = username.trim();
  if (q.length === 0) {
    return { ok: false, message: "Username is required." };
  }
  const url = `${API}/users?username=${encodeURIComponent(q)}`;
  const res = await fetch(url, { signal });
  if (!res.ok) {
    return { ok: false, message: fieldCheckMessage(res.status) };
  }
  const users = (await res.json()) as JsonUser[];
  if (users.length > 0) {
    return {
      ok: false,
      message: "This username is already registered. Pick another.",
    };
  }
  return { ok: true };
}

export async function validateEmailRemote(
  email: string,
  signal: AbortSignal,
): Promise<{ ok: boolean; message?: string }> {
  const q = email.trim();
  if (q.length === 0) {
    return { ok: false, message: "Email is required." };
  }
  const url = `${API}/users?email=${encodeURIComponent(q)}`;
  const res = await fetch(url, { signal });
  if (!res.ok) {
    return { ok: false, message: fieldCheckMessage(res.status) };
  }
  const users = (await res.json()) as JsonUser[];
  if (users.length > 0) {
    return {
      ok: false,
      message: "This email is already in use. Use a different address.",
    };
  }
  return { ok: true };
}

export type SubmitPayload = {
  title: string;
  body: string;
  userId: number;
};

export async function submitPostRemote(
  payload: SubmitPayload,
  signal: AbortSignal,
): Promise<{ ok: true; id: number } | { ok: false; message: string }> {
  const res = await fetch(`${API}/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: payload.title.trim(),
      body: payload.body.trim(),
      userId: payload.userId,
    }),
    signal,
  });
  if (!res.ok) {
    return { ok: false, message: submitMessage(res.status) };
  }
  const data = (await res.json()) as { id?: number };
  if (typeof data.id !== "number") {
    return { ok: false, message: "Invalid server response. Try again." };
  }
  return { ok: true, id: data.id };
}
