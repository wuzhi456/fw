/**
 * Mock remote API (in-memory). Mirrors fetch-style cancellation via AbortSignal.
 * Injected productization: form-submit-recovery (422/500 shapes), async-retry-recover (500 + retry),
 * duplicate-submit idempotency key is accepted for future server dedupe.
 */

export type SubmitBody = {
  displayName: string
  username: string
  password: string
}

export type SubmitSuccess = { ok: true; recordId: string }
export type Submit422 = { ok: false; status: 422; fieldErrors: Record<string, string> }
export type Submit500 = { ok: false; status: 500; message: string }
export type SubmitResult = SubmitSuccess | Submit422 | Submit500

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const id = window.setTimeout(() => {
      if (signal.aborted) {
        reject(new DOMException('Aborted', 'AbortError'))
        return
      }
      resolve()
    }, ms)
    const onAbort = () => {
      window.clearTimeout(id)
      reject(new DOMException('Aborted', 'AbortError'))
    }
    signal.addEventListener('abort', onAbort, { once: true })
  })
}

let failNextSubmitWith500 = false

/** Dev/demo hook: next submit returns 500 once so retry can be exercised. */
export function setFailNextSubmitWith500(value: boolean) {
  failNextSubmitWith500 = value
}

let submitSerial = 0

export async function validateUsernameRemote(
  raw: string,
  signal: AbortSignal,
): Promise<{ valid: true } | { valid: false; message: string }> {
  await sleep(300 + Math.floor(Math.random() * 140), signal)
  const u = raw.trim().toLowerCase()
  if (u.length === 0) {
    return { valid: false, message: 'Username is required.' }
  }
  if (u.length < 2) {
    return { valid: false, message: 'Use at least 2 characters.' }
  }
  if (u === 'taken' || u === 'admin' || u.endsWith('@reserved')) {
    return { valid: false, message: 'That username is already taken.' }
  }
  return { valid: true }
}

export async function submitProfileRemote(
  body: SubmitBody,
  opts: { idempotencyKey: string },
  signal: AbortSignal,
): Promise<SubmitResult> {
  await sleep(420, signal)
  submitSerial += 1
  void opts.idempotencyKey

  if (failNextSubmitWith500) {
    failNextSubmitWith500 = false
    return {
      ok: false,
      status: 500,
      message:
        'Temporary server error (simulated). Your answers stay in the form — you can retry safely.',
    }
  }

  if (body.password.length > 0 && body.password.length < 8) {
    return {
      ok: false,
      status: 422,
      fieldErrors: {
        password: 'Password must be at least 8 characters.',
      },
    }
  }

  return { ok: true, recordId: `rec_${submitSerial.toString(36)}` }
}
