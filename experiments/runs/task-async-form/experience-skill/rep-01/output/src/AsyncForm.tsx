import { FormEvent, useMemo, useRef, useState } from "react";
import type { FieldKey, SubmitPhase, UnifiedApiError } from "./types";
import { runWithRetry, userMessageForError } from "./apiClient";
import { mockSubmit, resetMockServerState } from "./mockRemoteApi";
import { useDebouncedValue } from "./useDebouncedValue";
import { useKeyedRemoteValidator } from "./useKeyedRemoteValidator";

const SUBMIT_DEBOUNCE_MS = 550;

export function AsyncForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [usernameBlurEpoch, setUsernameBlurEpoch] = useState(0);
  const [emailTouched, setEmailTouched] = useState(false);

  const debouncedEmail = useDebouncedValue(email, 420);

  const usernameRemote = useKeyedRemoteValidator(
    "username",
    username,
    usernameBlurEpoch > 0,
  );
  const emailRemote = useKeyedRemoteValidator(
    "email",
    debouncedEmail,
    emailTouched && debouncedEmail.trim().length > 0,
  );

  const [submitPhase, setSubmitPhase] = useState<SubmitPhase>("idle");
  const [submitFieldErrors, setSubmitFieldErrors] = useState<
    Partial<Record<FieldKey, string>>
  >({});
  const [toast, setToast] = useState<string | null>(null);

  const idempotencyKeyRef = useRef("");
  const lastSubmitIntentAt = useRef(0);

  const canSubmit = useMemo(() => {
    const usernameOk =
      usernameBlurEpoch > 0 && usernameRemote.status === "valid";
    const emailOk =
      emailTouched &&
      debouncedEmail.trim().length > 0 &&
      emailRemote.status === "valid";
    return (
      usernameOk &&
      emailOk &&
      submitPhase !== "submitting" &&
      usernameRemote.status !== "pending" &&
      emailRemote.status !== "pending"
    );
  }, [
    usernameBlurEpoch,
    usernameRemote.status,
    emailTouched,
    debouncedEmail,
    emailRemote.status,
    submitPhase,
  ]);

  const onUsernameBlur = () => {
    setUsernameBlurEpoch((n) => n + 1);
  };

  const resetAll = () => {
    setUsername("");
    setEmail("");
    setMessage("");
    setUsernameBlurEpoch(0);
    setEmailTouched(false);
    setSubmitPhase("idle");
    setSubmitFieldErrors({});
    setToast(null);
    resetMockServerState();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    if (submitPhase === "submitting") return;

    const now = Date.now();
    if (now - lastSubmitIntentAt.current < SUBMIT_DEBOUNCE_MS) {
      setToast("Please wait a moment before submitting again.");
      return;
    }
    lastSubmitIntentAt.current = now;

    idempotencyKeyRef.current = crypto.randomUUID();
    setSubmitPhase("submitting");
    setSubmitFieldErrors({});
    setToast(null);

    const body = {
      username: username.trim(),
      email: email.trim(),
      message: message.trim(),
      idempotencyKey: idempotencyKeyRef.current,
    };

    const result = await runWithRetry((signal) => mockSubmit(body, signal), {
      maxAttempts: 4,
      baseDelayMs: 300,
      timeoutMs: 12_000,
    });

    if (!result.ok) {
      const err: UnifiedApiError = result.error;
      setSubmitPhase("error");
      setSubmitFieldErrors(err.fieldErrors ?? {});
      setToast(userMessageForError(err));
      return;
    }

    setSubmitPhase("success");
    setToast("Saved successfully.");
  };

  const usernameHint =
    usernameBlurEpoch === 0
      ? "Blur the field to run server validation."
      : usernameRemote.status === "pending"
        ? "Checking with server…"
        : usernameRemote.status === "invalid"
          ? usernameRemote.message
          : "Looks good.";

  const emailHint =
    !emailTouched
      ? "Start typing; validation runs after a short pause."
      : emailRemote.status === "pending"
        ? "Checking with server…"
        : emailRemote.status === "invalid"
          ? emailRemote.message
          : emailRemote.status === "valid"
            ? "Looks good."
            : "Keep typing a complete address.";

  return (
    <section className="panel" aria-labelledby="form-title">
      <h1 id="form-title">Remote-validated form</h1>
      <p className="lede">
        Some fields are checked against a slow mock API before submit is
        enabled. The first submit after a server reset may auto-retry through a
        transient 503.
      </p>

      <form className="stack" onSubmit={handleSubmit} noValidate>
        <label className="field">
          <span>Username</span>
          <input
            name="username"
            autoComplete="username"
            value={username}
            onChange={(ev) => setUsername(ev.target.value)}
            onBlur={onUsernameBlur}
            aria-invalid={usernameRemote.status === "invalid"}
            aria-describedby="username-hint"
          />
          <small id="username-hint" className="hint">
            {usernameHint}
          </small>
          {submitFieldErrors.username ? (
            <p className="error" role="alert">
              {submitFieldErrors.username}
            </p>
          ) : null}
        </label>

        <label className="field">
          <span>Email</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(ev) => {
              setEmailTouched(true);
              setEmail(ev.target.value);
            }}
            aria-invalid={emailRemote.status === "invalid"}
            aria-describedby="email-hint"
          />
          <small id="email-hint" className="hint">
            {emailHint}
          </small>
          {submitFieldErrors.email ? (
            <p className="error" role="alert">
              {submitFieldErrors.email}
            </p>
          ) : null}
        </label>

        <label className="field">
          <span>Message</span>
          <textarea
            name="message"
            rows={3}
            value={message}
            onChange={(ev) => setMessage(ev.target.value)}
            aria-describedby="message-hint"
          />
          <small id="message-hint" className="hint">
            Free text is kept on failure; only server field errors override
            specific inputs.
          </small>
          {submitFieldErrors.message ? (
            <p className="error" role="alert">
              {submitFieldErrors.message}
            </p>
          ) : null}
        </label>

        <div className="row">
          <button
            type="submit"
            disabled={!canSubmit}
            aria-busy={submitPhase === "submitting"}
          >
            {submitPhase === "submitting" ? "Submitting…" : "Submit"}
          </button>
          <button type="button" className="ghost" onClick={resetAll}>
            Reset form and mock server
          </button>
        </div>
      </form>

      {toast ? (
        <div className="toast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}

      {submitPhase === "success" ? (
        <p className="success" role="status">
          Submission completed. You can reset the demo or edit and submit again
          (a new idempotency key will be used).
        </p>
      ) : null}
    </section>
  );
}
