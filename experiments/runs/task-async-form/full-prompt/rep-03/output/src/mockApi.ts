/** Simulated remote API with latency and abort support. */

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

const TAKEN_USERNAMES = new Set(['admin', 'taken'])

export type RemoteOk = { ok: true }
export type RemoteErr = { ok: false; message: string }

function isAbort(e: unknown): boolean {
  return e instanceof DOMException && e.name === 'AbortError'
}

export async function validateUsernameRemote(
  username: string,
  signal: AbortSignal,
): Promise<RemoteOk | RemoteErr> {
  await delay(380)
  if (signal.aborted) throw new DOMException('Aborted', 'AbortError')
  const u = username.trim().toLowerCase()
  if (u.length < 2) {
    return { ok: false, message: 'Username must be at least 2 characters.' }
  }
  if (TAKEN_USERNAMES.has(u)) {
    return { ok: false, message: 'That username is already taken.' }
  }
  return { ok: true }
}

const VALID_INVITE = 'VALID2026'

export async function validateInviteRemote(
  code: string,
  signal: AbortSignal,
): Promise<RemoteOk | RemoteErr> {
  await delay(320)
  if (signal.aborted) throw new DOMException('Aborted', 'AbortError')
  if (code.trim() !== VALID_INVITE) {
    return {
      ok: false,
      message: `Invite code rejected by server (use ${VALID_INVITE} for this demo).`,
    }
  }
  return { ok: true }
}

export type RegistrationPayload = { username: string; inviteCode: string }

let failNextSubmitOnce = true

export type SubmitResult =
  | { ok: true }
  | { ok: false; kind: 'server' | 'network'; message: string }

export async function submitRegistration(
  _payload: RegistrationPayload,
  signal: AbortSignal,
): Promise<SubmitResult> {
  await delay(480)
  if (signal.aborted) throw new DOMException('Aborted', 'AbortError')
  if (failNextSubmitOnce) {
    failNextSubmitOnce = false
    return {
      ok: false,
      kind: 'server',
      message: 'Server busy (simulated). Your entries are kept — try again.',
    }
  }
  return { ok: true }
}

export function resetSubmitDemoState(): void {
  failNextSubmitOnce = true
}

export { isAbort, VALID_INVITE }
