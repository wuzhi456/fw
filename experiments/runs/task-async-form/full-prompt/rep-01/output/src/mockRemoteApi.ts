/** In-memory mock of a remote API (no real network). */

export type ValidateUsernameResult =
  | { status: 'valid' }
  | { status: 'invalid'; message: string }
  | {
      status: 'error';
      message: string;
      code: '4xx' | '5xx' | 'timeout';
      retryable: boolean;
    };

export type SubmitPayload = {
  displayName: string;
  username: string;
};

export type SubmitResult =
  | { ok: true; confirmationId: string }
  | {
      ok: false;
      message: string;
      code: '4xx' | '5xx' | 'timeout';
      retryable: boolean;
    };

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const id = window.setTimeout(resolve, ms);
    const onAbort = () => {
      window.clearTimeout(id);
      reject(new DOMException('Aborted', 'AbortError'));
    };
    if (signal?.aborted) onAbort();
    else signal?.addEventListener('abort', onAbort, { once: true });
  });
}

const processedIdempotencyKeys = new Map<string, SubmitResult>();

/**
 * Async server-side username check. Honors AbortSignal (navigation / value churn).
 * Query signature for stale guards: `${username}` (caller adds generation).
 */
export async function validateUsernameRemote(
  username: string,
  signal?: AbortSignal,
): Promise<ValidateUsernameResult> {
  const u = username.trim().toLowerCase();
  try {
    await delay(420, signal);
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw e;
    throw e;
  }

  if (u.length === 0) {
    return { status: 'invalid', message: 'Username is required (server).' };
  }
  if (u === 'taken' || u === 'admin') {
    return {
      status: 'invalid',
      message: 'This username is already registered. Pick another.',
    };
  }
  if (u === 'err400') {
    return {
      status: 'error',
      code: '4xx',
      message: 'Request could not be processed (simulated 4xx). Fix the value and try again.',
      retryable: false,
    };
  }
  if (u === 'err500') {
    return {
      status: 'error',
      code: '5xx',
      message: 'Server error while checking username (simulated). You can retry.',
      retryable: true,
    };
  }
  if (u === 'errtimeout') {
    await delay(120, signal);
    return {
      status: 'error',
      code: 'timeout',
      message: 'Username check timed out (simulated). Try again.',
      retryable: true,
    };
  }
  return { status: 'valid' };
}

/**
 * Form submit. Idempotent per key: same key returns the same success without re-processing.
 */
export async function submitRegistrationRemote(
  payload: SubmitPayload,
  options: { signal?: AbortSignal; idempotencyKey: string },
): Promise<SubmitResult> {
  const cached = processedIdempotencyKeys.get(options.idempotencyKey);
  if (cached) return cached;

  try {
    await delay(520, options.signal);
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw e;
    throw e;
  }

  const name = payload.displayName.trim();
  const user = payload.username.trim().toLowerCase();

  if (name.length === 0) {
    return {
      ok: false,
      code: '4xx',
      message: 'Display name is required.',
      retryable: false,
    };
  }

  if (user === 'taken' || user === 'admin') {
    return {
      ok: false,
      code: '4xx',
      message: 'Username still conflicts with server rules.',
      retryable: false,
    };
  }

  const tokenCheck = await validateUsernameRemote(payload.username, options.signal);
  if (tokenCheck.status === 'invalid') {
    return {
      ok: false,
      code: '4xx',
      message: tokenCheck.message,
      retryable: false,
    };
  }
  if (tokenCheck.status === 'error') {
    return {
      ok: false,
      code: tokenCheck.code,
      message: tokenCheck.message,
      retryable: tokenCheck.retryable,
    };
  }

  if (name.toLowerCase() === 'fail_submit_500') {
    const err: SubmitResult = {
      ok: false,
      code: '5xx',
      message: 'Submit failed due to a simulated server error. Your input is preserved; retry.',
      retryable: true,
    };
    return err;
  }

  const ok: SubmitResult = {
    ok: true,
    confirmationId: `reg_${crypto.randomUUID()}`,
  };
  processedIdempotencyKeys.set(options.idempotencyKey, ok);
  return ok;
}
