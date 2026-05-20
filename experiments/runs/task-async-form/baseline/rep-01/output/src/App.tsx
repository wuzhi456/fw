import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import './App.css'

type ValidateResponse = { valid: boolean; message: string | null }

type SubmitSuccess = { ok: true; received: Record<string, unknown> }
type SubmitError = { ok: false; error: string }
type SubmitResponse = SubmitSuccess | SubmitError

export default function App() {
  const [name, setName] = useState('')
  const [code, setCode] = useState('')

  const [codeValid, setCodeValid] = useState<boolean | null>(null)
  const [codeMessage, setCodeMessage] = useState<string | null>(null)
  const [codeChecking, setCodeChecking] = useState(false)

  const [submitState, setSubmitState] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')
  const [submitDetail, setSubmitDetail] = useState<string | null>(null)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const requestIdRef = useRef(0)

  const runValidate = useCallback(async (value: string) => {
    const trimmed = value.trim()
    if (trimmed === '') {
      setCodeValid(null)
      setCodeMessage(null)
      setCodeChecking(false)
      return
    }

    const id = ++requestIdRef.current
    setCodeChecking(true)
    setCodeMessage(null)

    try {
      const res = await fetch('/api/validate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: trimmed }),
      })
      const data = (await res.json()) as ValidateResponse
      if (id !== requestIdRef.current) return

      setCodeValid(Boolean(data.valid))
      setCodeMessage(data.message)
    } catch {
      if (id !== requestIdRef.current) return
      setCodeValid(false)
      setCodeMessage('Network error while validating.')
    } finally {
      if (id === requestIdRef.current) setCodeChecking(false)
    }
  }, [])

  const scheduleValidate = useCallback(
    (value: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null
        void runValidate(value)
      }, 400)
    },
    [runValidate],
  )

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const onCodeChange = (value: string) => {
    setCode(value)
    setCodeValid(null)
    setCodeMessage(null)
    setSubmitState('idle')
    setSubmitDetail(null)
    scheduleValidate(value)
  }

  const onCodeBlur = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
    }
    void runValidate(code)
  }

  const nameOk = name.trim().length > 0
  const canSubmit =
    nameOk && codeValid === true && !codeChecking && submitState !== 'loading'

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    setSubmitState('loading')
    setSubmitDetail(null)

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          code: code.trim(),
        }),
      })
      const data = (await res.json()) as SubmitResponse

      if (res.ok && 'ok' in data && data.ok) {
        setSubmitState('success')
        setSubmitDetail(JSON.stringify(data.received, null, 2))
      } else {
        setSubmitState('error')
        setSubmitDetail(
          'error' in data && typeof data.error === 'string'
            ? data.error
            : `HTTP ${res.status}`,
        )
      }
    } catch {
      setSubmitState('error')
      setSubmitDetail('Network error while submitting.')
    }
  }

  return (
    <main className="form-page">
      <h1>Async validation form</h1>
      <p className="hint">
        The mock server only accepts access code <strong>alpha</strong> (case
        insensitive). Validation runs on blur and while typing (debounced).
      </p>

      <form className="card" onSubmit={onSubmit}>
        <label className="field">
          <span>Name</span>
          <input
            name="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setSubmitState('idle')
              setSubmitDetail(null)
            }}
            autoComplete="name"
            required
          />
        </label>

        <label className="field">
          <span>Access code (async check)</span>
          <input
            name="code"
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            onBlur={onCodeBlur}
            autoComplete="off"
            aria-invalid={codeValid === false}
            aria-describedby="code-help"
          />
          <p id="code-help" className="field-help">
            {codeChecking && <span className="status checking">Checking…</span>}
            {!codeChecking && codeMessage && (
              <span className={codeValid ? 'status ok' : 'status bad'}>
                {codeMessage}
              </span>
            )}
          </p>
        </label>

        <button type="submit" disabled={!canSubmit}>
          {submitState === 'loading' ? 'Submitting…' : 'Submit'}
        </button>
      </form>

      {submitState === 'success' && (
        <section className="banner success" role="status">
          <h2>Success</h2>
          <pre>{submitDetail}</pre>
        </section>
      )}
      {submitState === 'error' && (
        <section className="banner error" role="alert">
          <h2>Error</h2>
          <p>{submitDetail}</p>
        </section>
      )}
    </main>
  )
}
