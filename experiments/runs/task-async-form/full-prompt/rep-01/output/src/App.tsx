import {
  useCallback,
  useId,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import { FormErrorBoundary } from './FormErrorBoundary';
import {
  submitRegistrationRemote,
  validateUsernameRemote,
  type SubmitResult,
  type ValidateUsernameResult,
} from './mockRemoteApi';
import './App.css';

type RemoteState =
  | { kind: 'idle' }
  | { kind: 'loading'; forValue: string }
  | { kind: 'valid'; forValue: string }
  | { kind: 'invalid'; forValue: string; message: string }
  | {
      kind: 'error';
      forValue: string;
      message: string;
      code: '4xx' | '5xx' | 'timeout';
      retryable: boolean;
    };

function mapRemote(
  raw: ValidateUsernameResult,
  forValue: string,
): Exclude<RemoteState, { kind: 'idle' } | { kind: 'loading' }> {
  if (raw.status === 'valid') return { kind: 'valid', forValue };
  if (raw.status === 'invalid')
    return { kind: 'invalid', forValue, message: raw.message };
  return {
    kind: 'error',
    forValue,
    message: raw.message,
    code: raw.code,
    retryable: raw.retryable,
  };
}

function RegistrationForm() {
  const displayNameId = useId();
  const usernameId = useId();
  const displayDescId = useId();
  const usernameDescId = useId();
  const submitStatusId = useId();

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [remote, setRemote] = useState<RemoteState>({ kind: 'idle' });
  const [submitting, setSubmitting] = useState(false);
  const [submitBanner, setSubmitBanner] = useState<SubmitResult | null>(null);

  const runIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const usernameInputRef = useRef<HTMLInputElement | null>(null);
  const usernameRef = useRef(username);
  usernameRef.current = username;

  const trimmedUser = username.trim();
  const effectiveRemote: RemoteState =
    remote.kind === 'idle' || remote.kind === 'loading'
      ? remote
      : remote.forValue === trimmedUser
        ? remote
        : { kind: 'idle' };

  const runRemoteCheck = useCallback(async (value: string) => {
    const forValue = value.trim();
    runIdRef.current += 1;
    const runId = runIdRef.current;
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    if (forValue.length === 0) {
      setRemote({ kind: 'idle' });
      return;
    }

    setRemote({ kind: 'loading', forValue });

    try {
      const result = await validateUsernameRemote(value, ac.signal);
      if (runId !== runIdRef.current) return;
      if (usernameRef.current.trim() !== forValue) return;
      setRemote(mapRemote(result, forValue));
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
      if (runId !== runIdRef.current) return;
      if (usernameRef.current.trim() !== forValue) return;
      setRemote({
        kind: 'error',
        forValue,
        message: 'Unexpected error while contacting the server.',
        code: '5xx',
        retryable: true,
      });
    }
  }, []);

  const scheduleDebouncedCheck = (value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      void runRemoteCheck(value);
    }, 320);
  };

  const onUsernameChange = (value: string) => {
    setUsername(value);
    setSubmitBanner(null);
    scheduleDebouncedCheck(value);
  };

  const onUsernameBlur = (value: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    void runRemoteCheck(value);
  };

  const submitAllowed =
    displayName.trim().length > 0 &&
    effectiveRemote.kind === 'valid' &&
    !submitting;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!submitAllowed) return;
    setSubmitting(true);
    setSubmitBanner(null);
    const idempotencyKey = crypto.randomUUID();
    const ac = new AbortController();
    try {
      const res = await submitRegistrationRemote(
        { displayName, username },
        { signal: ac.signal, idempotencyKey },
      );
      setSubmitBanner(res);
      if (res.ok) {
        setDisplayName('');
        setUsername('');
        setRemote({ kind: 'idle' });
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setSubmitBanner({
        ok: false,
        code: '5xx',
        message: 'Submit interrupted or failed unexpectedly.',
        retryable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const retryValidation = () => {
    void runRemoteCheck(username);
  };

  const focusUsername = () => usernameInputRef.current?.focus();

  return (
    <div className="app-shell">
      <header className="page-header">
        <h1>Registration</h1>
        <p className="lede">
          Display name is checked locally. Username is validated asynchronously against a mock
          remote API before submit is enabled.
        </p>
      </header>

      {displayName === '' && username === '' && submitBanner === null && (
        <section className="panel empty-panel" aria-labelledby="empty-heading">
          <h2 id="empty-heading">Get started</h2>
          <p className="muted">No data loaded yet. Enter your display name to begin.</p>
          <button type="button" className="btn primary" onClick={focusUsername}>
            Go to display name
          </button>
        </section>
      )}

      <FormErrorBoundary>
        <form className="panel form-panel" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor={displayNameId}>Display name</label>
            <input
              id={displayNameId}
              name="displayName"
              type="text"
              autoComplete="name"
              aria-describedby={displayDescId}
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                setSubmitBanner(null);
              }}
            />
            <p id={displayDescId} className="hint">
              Required. Use <code className="kbd">FAIL_SUBMIT_500</code> as display name to
              simulate a recoverable submit error (input is kept).
            </p>
          </div>

          <div className="field">
            <label htmlFor={usernameId}>Username (remote check)</label>
            <input
              ref={usernameInputRef}
              id={usernameId}
              name="username"
              type="text"
              autoComplete="username"
              aria-describedby={usernameDescId}
              aria-invalid={
                effectiveRemote.kind === 'invalid' || effectiveRemote.kind === 'error'
              }
              value={username}
              onChange={(e) => onUsernameChange(e.target.value)}
              onBlur={(e) => onUsernameBlur(e.target.value)}
            />
            <div id={usernameDescId} className="field-feedback">
              {effectiveRemote.kind === 'idle' && (
                <p className="hint">
                  Try <code className="kbd">taken</code> to see a server rejection, then fix it.
                  Debounced check while typing; stale responses are ignored when the value changes.
                </p>
              )}
              {effectiveRemote.kind === 'loading' && (
                <p className="status loading" role="status">
                  Checking username…
                </p>
              )}
              {effectiveRemote.kind === 'valid' && (
                <p className="status ok" role="status">
                  Username is available.
                </p>
              )}
              {effectiveRemote.kind === 'invalid' && (
                <p className="status bad" role="alert">
                  {effectiveRemote.message}
                </p>
              )}
              {effectiveRemote.kind === 'error' && (
                <div className="inline-error" role="alert">
                  <p className="status bad">
                    {effectiveRemote.message}{' '}
                    <span className="code-pill">{effectiveRemote.code}</span>
                  </p>
                  {effectiveRemote.retryable && (
                    <button
                      type="button"
                      className="btn linkish"
                      onClick={retryValidation}
                    >
                      Retry check
                    </button>
                  )}
                </div>
              )}
            </div>
            <p className="hint subtle">
              Simulated signals: <code className="kbd">err500</code> (retryable),{' '}
              <code className="kbd">err400</code> (fix value), <code className="kbd">errtimeout</code>{' '}
              (slow path).
            </p>
          </div>

          <div className="actions">
            <button
              type="submit"
              className="btn primary"
              disabled={!submitAllowed}
              aria-busy={submitting}
            >
              {submitting ? 'Submitting…' : 'Submit'}
            </button>
          </div>
        </form>
      </FormErrorBoundary>

      <div id={submitStatusId} className="submit-region" aria-live="polite">
        {submitBanner && !submitBanner.ok && (
          <section className="panel banner error-banner">
            <p>{submitBanner.message}</p>
            <p className="muted">
              Your fields stay filled so you can edit and retry. New submit uses a fresh
              idempotency key.
            </p>
            {submitBanner.retryable && (
              <button
                type="button"
                className="btn secondary"
                onClick={() => {
                  const form = document.querySelector('.form-panel');
                  form?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Back to form
              </button>
            )}
          </section>
        )}
        {submitBanner && submitBanner.ok && (
          <section className="panel banner ok-banner">
            <h2>Submitted</h2>
            <p>
              Confirmation id:{' '}
              <span className="mono-clip" title={submitBanner.confirmationId}>
                {submitBanner.confirmationId}
              </span>
            </p>
          </section>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return <RegistrationForm />;
}
