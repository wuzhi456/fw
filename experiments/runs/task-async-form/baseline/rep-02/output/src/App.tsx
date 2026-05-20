import { FormEvent, useCallback, useMemo, useState } from "react";
import { submitFormRemote, validateTokenRemote } from "./api";

type TokenValidation =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "invalid"; message: string }
  | { status: "valid" };

export function App() {
  const [name, setName] = useState("");
  const [token, setToken] = useState("");
  const [tokenValidation, setTokenValidation] = useState<TokenValidation>({
    status: "idle",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    if (submitting) return false;
    if (tokenValidation.status !== "valid") return false;
    return name.trim().length > 0;
  }, [name, submitting, tokenValidation.status]);

  const runTokenValidation = useCallback(async (value: string) => {
    setTokenValidation({ status: "checking" });
    const result = await validateTokenRemote(value);
    if (result.ok) {
      setTokenValidation({ status: "valid" });
    } else {
      setTokenValidation({
        status: "invalid",
        message: result.message ?? "Invalid.",
      });
    }
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setSubmitMessage(null);
    const res = await submitFormRemote({ name: name.trim(), token });
    setSubmitting(false);
    if (res.ok) {
      setSubmitMessage("Submitted successfully.");
    } else {
      setSubmitMessage(res.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h1 style={{ margin: "0 0 0.5rem", fontSize: "1.1rem" }}>
        Remote form
      </h1>
      <p className="hint">
        The token is checked on the server (mocked). Submit stays disabled
        until the server accepts the token.
      </p>

      <label>
        Name
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
        />
      </label>

      <label>
        Server token
        <input
          value={token}
          onChange={(e) => {
            setToken(e.target.value);
            setTokenValidation({ status: "idle" });
            setSubmitMessage(null);
          }}
          onBlur={() => {
            void runTokenValidation(token);
          }}
          autoComplete="off"
        />
      </label>
      {tokenValidation.status === "checking" && (
        <span className="hint">Checking with server…</span>
      )}
      {tokenValidation.status === "invalid" && (
        <span className="error">{tokenValidation.message}</span>
      )}
      {tokenValidation.status === "valid" && (
        <span className="hint">Token accepted by server.</span>
      )}

      <button type="submit" disabled={!canSubmit}>
        {submitting ? "Submitting…" : "Submit"}
      </button>

      {submitMessage && <div className="success">{submitMessage}</div>}
    </form>
  );
}
