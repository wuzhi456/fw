import {
  type FormEvent,
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  submitPostRemote,
  validateEmailRemote,
  validateUsernameRemote,
} from "./api";

type FieldRemote = "idle" | "checking" | "valid" | "invalid";

const DEBOUNCE_MS = 400;

function isAbortError(e: unknown): boolean {
  return e instanceof DOMException && e.name === "AbortError";
}

export function AsyncRemoteForm() {
  const baseId = useId();
  const errTitle = `${baseId}-title-err`;
  const errUser = `${baseId}-user-err`;
  const errEmail = `${baseId}-email-err`;

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [usernameRemote, setUsernameRemote] = useState<FieldRemote>("idle");
  const [usernameMsg, setUsernameMsg] = useState<string | null>(null);
  const [emailRemote, setEmailRemote] = useState<FieldRemote>("idle");
  const [emailMsg, setEmailMsg] = useState<string | null>(null);

  const [titleTouched, setTitleTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitOk, setSubmitOk] = useState<string | null>(null);

  const submitGuard = useRef(false);

  const debounceUser = useRef<ReturnType<typeof setTimeout>>();
  const debounceEmail = useRef<ReturnType<typeof setTimeout>>();
  const abortUser = useRef<AbortController | null>(null);
  const abortEmail = useRef<AbortController | null>(null);
  const seqUser = useRef(0);
  const seqEmail = useRef(0);

  const titleError = useMemo(() => {
    const t = title.trim();
    if (!titleTouched && t.length === 0) return null;
    if (t.length < 3) return "Title must be at least 3 characters.";
    return null;
  }, [title, titleTouched]);

  const canSubmit = useMemo(() => {
    if (submitting) return false;
    if (title.trim().length < 3) return false;
    if (titleError) return false;
    if (usernameRemote !== "valid" || emailRemote !== "valid") return false;
    return true;
  }, [submitting, title, titleError, usernameRemote, emailRemote]);

  const runUsernameValidate = useCallback(async (raw: string) => {
    const v = raw.trim();
    const mySeq = ++seqUser.current;
    abortUser.current?.abort();
    if (!v) {
      setUsernameRemote("idle");
      setUsernameMsg(null);
      return;
    }
    const ac = new AbortController();
    abortUser.current = ac;
    setUsernameRemote("checking");
    setUsernameMsg(null);
    try {
      const r = await validateUsernameRemote(v, ac.signal);
      if (mySeq !== seqUser.current) return;
      if (r.ok) {
        setUsernameRemote("valid");
      } else {
        setUsernameRemote("invalid");
        setUsernameMsg(r.message ?? "Invalid.");
      }
    } catch (e) {
      if (mySeq !== seqUser.current || isAbortError(e)) return;
      setUsernameRemote("invalid");
      setUsernameMsg(
        "Network error while checking username. Check your connection and retry.",
      );
    }
  }, []);

  const runEmailValidate = useCallback(async (raw: string) => {
    const v = raw.trim();
    const mySeq = ++seqEmail.current;
    abortEmail.current?.abort();
    if (!v) {
      setEmailRemote("idle");
      setEmailMsg(null);
      return;
    }
    const ac = new AbortController();
    abortEmail.current = ac;
    setEmailRemote("checking");
    setEmailMsg(null);
    try {
      const r = await validateEmailRemote(v, ac.signal);
      if (mySeq !== seqEmail.current) return;
      if (r.ok) {
        setEmailRemote("valid");
      } else {
        setEmailRemote("invalid");
        setEmailMsg(r.message ?? "Invalid.");
      }
    } catch (e) {
      if (mySeq !== seqEmail.current || isAbortError(e)) return;
      setEmailRemote("invalid");
      setEmailMsg(
        "Network error while checking email. Check your connection and retry.",
      );
    }
  }, []);

  const scheduleUsername = useCallback(
    (raw: string) => {
      if (debounceUser.current) clearTimeout(debounceUser.current);
      debounceUser.current = setTimeout(() => {
        void runUsernameValidate(raw);
      }, DEBOUNCE_MS);
    },
    [runUsernameValidate],
  );

  const scheduleEmail = useCallback(
    (raw: string) => {
      if (debounceEmail.current) clearTimeout(debounceEmail.current);
      debounceEmail.current = setTimeout(() => {
        void runEmailValidate(raw);
      }, DEBOUNCE_MS);
    },
    [runEmailValidate],
  );

  const flushUsername = useCallback(
    (raw: string) => {
      if (debounceUser.current) clearTimeout(debounceUser.current);
      void runUsernameValidate(raw);
    },
    [runUsernameValidate],
  );

  const flushEmail = useCallback(
    (raw: string) => {
      if (debounceEmail.current) clearTimeout(debounceEmail.current);
      void runEmailValidate(raw);
    },
    [runEmailValidate],
  );

  const runRemoteSave = useCallback(async () => {
    const t = title.trim();
    const ac = new AbortController();
    const to = window.setTimeout(() => ac.abort(), 25_000);
    try {
      const res = await submitPostRemote(
        { title: t, body, userId: 1 },
        ac.signal,
      );
      if (res.ok) {
        setSubmitOk(`Saved (remote API returned id ${res.id}).`);
      } else {
        setSubmitError(res.message);
      }
    } catch (err) {
      if (isAbortError(err)) {
        setSubmitError(
          "Request timed out or was cancelled. Your entries are kept — try again.",
        );
      } else {
        setSubmitError(
          "Network error while saving. Your entries are kept — try again.",
        );
      }
    } finally {
      window.clearTimeout(to);
    }
  }, [title, body]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit || submitGuard.current) return;
    submitGuard.current = true;
    setSubmitting(true);
    setSubmitError(null);
    setSubmitOk(null);
    setTitleTouched(true);
    if (title.trim().length < 3) {
      setSubmitting(false);
      submitGuard.current = false;
      return;
    }
    try {
      await runRemoteSave();
    } finally {
      setSubmitting(false);
      submitGuard.current = false;
    }
  }

  async function retrySubmit() {
    setSubmitError(null);
    setSubmitOk(null);
    setTitleTouched(true);
    if (title.trim().length < 3) return;
    if (usernameRemote !== "valid" || emailRemote !== "valid") return;
    if (submitGuard.current) return;
    submitGuard.current = true;
    setSubmitting(true);
    try {
      await runRemoteSave();
    } finally {
      setSubmitting(false);
      submitGuard.current = false;
    }
  }

  return (
    <form className="remote-form" onSubmit={handleSubmit} noValidate>
      <header className="remote-form__header">
        <h1 className="remote-form__title">Create post</h1>
        <p className="remote-form__lede hint">
          Username and email are checked against{" "}
          <span className="remote-form__mono">jsonplaceholder.typicode.com</span>{" "}
          before submit is enabled. Try a unique username (e.g.{" "}
          <span className="remote-form__mono">myalias_9f2k</span>) and email not
          in the sample dataset; fix taken usernames like{" "}
          <span className="remote-form__mono">Bret</span> to proceed.
        </p>
      </header>

      <label className="field">
        <span className="field__label">Title</span>
        <input
          className="field__input"
          value={title}
          aria-invalid={Boolean(titleError)}
          aria-describedby={titleError ? errTitle : undefined}
          onBlur={() => setTitleTouched(true)}
          onChange={(e) => {
            setTitle(e.target.value);
            setSubmitOk(null);
          }}
          autoComplete="off"
        />
        {titleError && (
          <span className="error" id={errTitle} role="status">
            {titleError}
          </span>
        )}
      </label>

      <label className="field">
        <span className="field__label">Body (optional)</span>
        <textarea
          className="field__input field__input--body"
          value={body}
          rows={4}
          onChange={(e) => setBody(e.target.value)}
        />
      </label>

      <label className="field">
        <span className="field__label">Username</span>
        <input
          className="field__input"
          value={username}
          aria-busy={usernameRemote === "checking"}
          aria-invalid={usernameRemote === "invalid"}
          aria-describedby={
            usernameMsg ? errUser : usernameRemote === "checking"
              ? `${baseId}-user-busy`
              : undefined
          }
          onChange={(e) => {
            const v = e.target.value;
            setUsername(v);
            setUsernameRemote("idle");
            setUsernameMsg(null);
            setSubmitOk(null);
            scheduleUsername(v);
          }}
          onBlur={(e) => flushUsername(e.target.value)}
          autoComplete="username"
        />
        {usernameRemote === "checking" && (
          <span className="hint" id={`${baseId}-user-busy`}>
            Checking with server…
          </span>
        )}
        {usernameRemote === "valid" && (
          <span className="hint hint--ok">Username is available.</span>
        )}
        {usernameMsg && (
          <span className="error" id={errUser} role="status">
            {usernameMsg}
          </span>
        )}
      </label>

      <label className="field">
        <span className="field__label">Email</span>
        <input
          className="field__input"
          type="email"
          value={email}
          aria-busy={emailRemote === "checking"}
          aria-invalid={emailRemote === "invalid"}
          aria-describedby={
            emailMsg ? errEmail : emailRemote === "checking"
              ? `${baseId}-email-busy`
              : undefined
          }
          onChange={(e) => {
            const v = e.target.value;
            setEmail(v);
            setEmailRemote("idle");
            setEmailMsg(null);
            setSubmitOk(null);
            scheduleEmail(v);
          }}
          onBlur={(e) => flushEmail(e.target.value)}
          autoComplete="email"
        />
        {emailRemote === "checking" && (
          <span className="hint" id={`${baseId}-email-busy`}>
            Checking with server…
          </span>
        )}
        {emailRemote === "valid" && (
          <span className="hint hint--ok">Email is available.</span>
        )}
        {emailMsg && (
          <span className="error" id={errEmail} role="status">
            {emailMsg}
          </span>
        )}
      </label>

      <div className="remote-form__actions">
        <button type="submit" disabled={!canSubmit}>
          {submitting ? "Submitting…" : "Submit to API"}
        </button>
      </div>

      {submitError && (
        <div className="banner banner--error" role="status">
          <span className="banner__text">{submitError}</span>
          <button type="button" className="banner__action" onClick={retrySubmit}>
            Retry submit
          </button>
        </div>
      )}

      {submitOk && (
        <div className="banner banner--ok" role="status">
          <p className="banner__text">{submitOk}</p>
          <button
            type="button"
            className="banner__action"
            onClick={() => {
              setTitle("");
              setBody("");
              setUsername("");
              setEmail("");
              setUsernameRemote("idle");
              setEmailRemote("idle");
              setUsernameMsg(null);
              setEmailMsg(null);
              setSubmitOk(null);
              setTitleTouched(false);
            }}
          >
            Start another
          </button>
        </div>
      )}
    </form>
  );
}
