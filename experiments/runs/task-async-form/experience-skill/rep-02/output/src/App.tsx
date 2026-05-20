import {
  type FormEvent,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'
import './App.css'

type HandleValidation =
  | { status: 'idle' }
  | { status: 'pending' }
  | { status: 'valid' }
  | { status: 'invalid'; message: string }

type SubmitBanner =
  | { kind: 'idle' }
  | { kind: 'network'; message: string }
  | { kind: 'field'; fields: Record<string, string[]> }
  | { kind: 'success'; detail: string }

const VALIDATE_DEBOUNCE_MS = 400

function parseSubmitErrorPayload(
  status: number,
  raw: unknown,
): { banner: SubmitBanner; fieldErrors: Record<string, string> } {
  if (status === 422 && raw && typeof raw === 'object') {
    const errors = (raw as { errors?: Record<string, unknown> }).errors
    if (errors && typeof errors === 'object') {
      const fields: Record<string, string[]> = {}
      const flat: Record<string, string> = {}
      for (const [key, val] of Object.entries(errors)) {
        if (Array.isArray(val) && val.every((v) => typeof v === 'string')) {
          fields[key] = val as string[]
          flat[key] = (val as string[])[0] ?? ''
        }
      }
      if (Object.keys(fields).length > 0) {
        return { banner: { kind: 'field', fields }, fieldErrors: flat }
      }
    }
  }
  const message =
    raw &&
    typeof raw === 'object' &&
    'message' in raw &&
    typeof (raw as { message: unknown }).message === 'string'
      ? (raw as { message: string }).message
      : status >= 500
        ? 'Server error. You can retry without losing your draft.'
        : 'Submit failed. You can retry.'
  return { banner: { kind: 'network', message }, fieldErrors: {} }
}

export default function App() {
  const handleId = useId()
  const noteId = useId()
  const handleErrorId = `${handleId}-error`
  const noteErrorId = `${noteId}-error`

  const [handle, setHandle] = useState('')
  const [note, setNote] = useState('')

  const [handleValidation, setHandleValidation] = useState<HandleValidation>({ status: 'idle' })
  const [noteServerError, setNoteServerError] = useState<string | null>(null)

  const [submitPhase, setSubmitPhase] = useState<'idle' | 'submitting'>('idle')
  const [submitBanner, setSubmitBanner] = useState<SubmitBanner>({ kind: 'idle' })

  const validateSeq = useRef(0)
  const validateAbortRef = useRef<AbortController | null>(null)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleIsValid = handleValidation.status === 'valid'

  const canSubmit =
    handleIsValid && submitPhase === 'idle' && handle.trim().length >= 2

  const runRemoteHandleValidate = useCallback(async (value: string) => {
    validateAbortRef.current?.abort()
    const controller = new AbortController()
    validateAbortRef.current = controller
    const seq = ++validateSeq.current

    const trimmed = value.trim()
    if (trimmed.length < 2) {
      setHandleValidation({ status: 'invalid', message: 'Handle must be at least 2 characters.' })
      return
    }

    setHandleValidation({ status: 'pending' })

    try {
      const res = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: 'handle', value: trimmed }),
        signal: controller.signal,
      })
      const body: unknown = await res.json().catch(() => null)
      if (seq !== validateSeq.current) return
      if (!res.ok) {
        setHandleValidation({ status: 'invalid', message: 'Could not validate handle.' })
        return
      }
      const ok = body && typeof body === 'object' && 'ok' in body && (body as { ok: boolean }).ok
      if (ok) {
        setHandleValidation({ status: 'valid' })
        return
      }
      const message =
        body &&
        typeof body === 'object' &&
        'message' in body &&
        typeof (body as { message: unknown }).message === 'string'
          ? (body as { message: string }).message
          : 'Handle is not available.'
      setHandleValidation({ status: 'invalid', message })
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      if (seq !== validateSeq.current) return
      setHandleValidation({ status: 'invalid', message: 'Validation request failed.' })
    }
  }, [])

  const scheduleRemoteHandleValidate = useCallback(
    (value: string) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      debounceTimerRef.current = setTimeout(() => {
        debounceTimerRef.current = null
        void runRemoteHandleValidate(value)
      }, VALIDATE_DEBOUNCE_MS)
    },
    [runRemoteHandleValidate],
  )

  useEffect(() => {
    return () => {
      validateAbortRef.current?.abort()
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    }
  }, [])

  const onHandleChange = (next: string) => {
    setHandle(next)
    setSubmitBanner({ kind: 'idle' })
    const trimmed = next.trim()
    if (trimmed.length < 2) {
      validateAbortRef.current?.abort()
      setHandleValidation({ status: 'invalid', message: 'Handle must be at least 2 characters.' })
      return
    }
    setHandleValidation({ status: 'pending' })
    scheduleRemoteHandleValidate(next)
  }

  const onHandleBlur = () => {
    void runRemoteHandleValidate(handle)
  }

  const onNoteChange = (next: string) => {
    setNote(next)
    setNoteServerError(null)
    setSubmitBanner({ kind: 'idle' })
  }

  const submitInFlight = useRef(false)

  const performSubmit = useCallback(async () => {
    if (submitInFlight.current || !handleIsValid) return
    submitInFlight.current = true
    setSubmitPhase('submitting')
    setSubmitBanner({ kind: 'idle' })

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle: handle.trim(), note }),
      })
      const raw: unknown = await res.json().catch(() => null)
      if (res.ok) {
        setSubmitBanner({
          kind: 'success',
          detail: 'Submitted successfully.',
        })
        setNoteServerError(null)
        return
      }
      const { banner, fieldErrors } = parseSubmitErrorPayload(res.status, raw)
      setSubmitBanner(banner)
      if (fieldErrors.note) {
        setNoteServerError(fieldErrors.note)
      } else {
        setNoteServerError(null)
      }
    } catch {
      setSubmitBanner({
        kind: 'network',
        message: 'Network error. Check your connection and retry.',
      })
    } finally {
      submitInFlight.current = false
      setSubmitPhase('idle')
    }
  }, [handle, handleIsValid, note])

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    void performSubmit()
  }

  const noteDescribedBy = useMemo(() => {
    const ids: string[] = []
    if (noteServerError) ids.push(noteErrorId)
    return ids.length ? ids.join(' ') : undefined
  }, [noteErrorId, noteServerError])

  const handleDescribedBy = useMemo(() => {
    const ids: string[] = []
    if (handleValidation.status === 'invalid') ids.push(handleErrorId)
    return ids.length ? ids.join(' ') : undefined
  }, [handleErrorId, handleValidation])

  return (
    <div className="app">
      <h1>Register</h1>
      <p className="lede">
        The handle is checked remotely. Use anything except <code>reserved</code> (taken). The
        first successful submit after fixing validation may return a recoverable server error—use{' '}
        <strong>Retry</strong>.
      </p>

      <form className="form-card" onSubmit={onSubmit} noValidate>
        <div className="field">
          <label htmlFor={handleId}>Handle</label>
          <input
            id={handleId}
            name="handle"
            value={handle}
            onChange={(e) => onHandleChange(e.target.value)}
            onBlur={onHandleBlur}
            autoComplete="username"
            aria-invalid={handleValidation.status === 'invalid'}
            aria-busy={handleValidation.status === 'pending'}
            aria-describedby={handleDescribedBy}
          />
          <div className="field-meta" aria-live="polite">
            {handleValidation.status === 'pending' ? (
              <span className="pending">Checking availability…</span>
            ) : null}
            {handleValidation.status === 'invalid' ? (
              <span className="error" id={handleErrorId} role="alert">
                {handleValidation.message}
              </span>
            ) : null}
            {handleValidation.status === 'valid' ? (
              <span className="pending">Handle looks available.</span>
            ) : null}
          </div>
        </div>

        <div className="field">
          <label htmlFor={noteId}>Note</label>
          <input
            id={noteId}
            name="note"
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            autoComplete="off"
            aria-invalid={Boolean(noteServerError)}
            aria-describedby={noteDescribedBy}
          />
          {noteServerError ? (
            <div className="field-meta">
              <span className="error" id={noteErrorId} role="alert">
                {noteServerError}
              </span>
            </div>
          ) : null}
        </div>

        <div className="actions">
          <button
            type="submit"
            disabled={!canSubmit}
            aria-busy={submitPhase === 'submitting'}
          >
            {submitPhase === 'submitting' ? 'Submitting…' : 'Submit'}
          </button>
          {(submitBanner.kind === 'network' || submitBanner.kind === 'field') && (
            <button
              type="button"
              className="secondary"
              onClick={() => void performSubmit()}
              disabled={!canSubmit}
            >
              Retry submit
            </button>
          )}
        </div>

        <p className="hint">
          Demo 422: put <code>FORBIDDEN</code> in the note, submit, then remove it and submit again
          (then retry if you hit the simulated 500).
        </p>
      </form>

      {submitBanner.kind === 'network' ? (
        <div className="banner error" role="status">
          {submitBanner.message}
        </div>
      ) : null}
      {submitBanner.kind === 'field' ? (
        <div className="banner error" role="status">
          Fix the highlighted fields and try again.
        </div>
      ) : null}
      {submitBanner.kind === 'success' ? (
        <div className="banner success" role="status">
          {submitBanner.detail}
        </div>
      ) : null}
    </div>
  )
}
