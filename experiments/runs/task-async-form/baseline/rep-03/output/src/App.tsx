import { useCallback, useState, type FormEvent } from "react";
import {
  submitFormRemote,
  validateUsernameRemote,
  type SubmitPayload,
} from "./mockApi";
import "./index.css";

type UsernameFieldStatus =
  | { state: "idle" }
  | { state: "checking" }
  | { state: "invalid"; message: string }
  | { state: "valid" };

export default function App() {
  const [username, setUsername] = useState("");
  const [note, setNote] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<UsernameFieldStatus>({
    state: "idle",
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const runUsernameValidation = useCallback(async (value: string) => {
    setSubmitSuccess(false);
    setSubmitError(null);
    if (value.trim() === "") {
      setUsernameStatus({ state: "idle" });
      return;
    }
    setUsernameStatus({ state: "checking" });
    const result = await validateUsernameRemote(value);
    if (result.ok) {
      setUsernameStatus({ state: "valid" });
    } else {
      setUsernameStatus({ state: "invalid", message: result.message });
    }
  }, []);

  const onUsernameBlur = () => {
    void runUsernameValidation(username);
  };

  const onUsernameChange = (next: string) => {
    setUsername(next);
    setSubmitSuccess(false);
    setSubmitError(null);
    if (usernameStatus.state === "valid" || usernameStatus.state === "invalid") {
      setUsernameStatus({ state: "idle" });
    }
  };

  const canSubmit =
    usernameStatus.state === "valid" && !submitting && !submitSuccess;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!canSubmit) return;
    setSubmitting(true);
    const payload: SubmitPayload = { username: username.trim(), note };
    const result = await submitFormRemote(payload);
    setSubmitting(false);
    if (result.ok) {
      setSubmitSuccess(true);
    } else {
      setSubmitError(result.message);
      setUsernameStatus({ state: "invalid", message: result.message });
    }
  };

  return (
    <main className="wrap">
      <h1>Register</h1>
      <p className="hint">
        Username <code>taken</code> fails async validation; pick another value,
        blur the field, then submit.
      </p>
      <form onSubmit={(e) => void onSubmit(e)}>
        <label className="field">
          <span>Username</span>
          <input
            name="username"
            autoComplete="username"
            value={username}
            onChange={(e) => onUsernameChange(e.target.value)}
            onBlur={onUsernameBlur}
            aria-invalid={usernameStatus.state === "invalid"}
            aria-describedby="username-help username-status"
          />
          <small id="username-help" className="help">
            Validation runs on blur (mock remote API).
          </small>
          <div id="username-status" className="status" role="status">
            {usernameStatus.state === "checking" && <span>Checking…</span>}
            {usernameStatus.state === "invalid" && (
              <span className="err">{usernameStatus.message}</span>
            )}
            {usernameStatus.state === "valid" && (
              <span className="ok">Username is available.</span>
            )}
          </div>
        </label>

        <label className="field">
          <span>Note</span>
          <textarea
            name="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
          />
        </label>

        {submitError && <p className="err">{submitError}</p>}
        {submitSuccess && (
          <p className="ok" role="status">
            Submitted successfully (mock API).
          </p>
        )}

        <button type="submit" disabled={!canSubmit}>
          {submitting ? "Submitting…" : "Submit"}
        </button>
      </form>
    </main>
  );
}
