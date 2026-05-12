import {
  Component,
  type ErrorInfo,
  type FormEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import './App.css'
import {
  isAbort,
  submitRegistration,
  validateInviteRemote,
  validateUsernameRemote,
  VALID_INVITE,
} from './mockApi'

type FieldStatus = 'idle' | 'pending' | 'ok' | 'error'

type Validator = (
  value: string,
  signal: AbortSignal,
) => Promise<{ ok: true } | { ok: false; message: string }>

function useRemoteValidatedField(validate: Validator, debounceMs: number) {
  const [value, setValue] = useState('')
  const [status, setStatus] = useState<FieldStatus>('idle')
  const [message, setMessage] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const clearDebounceAndRequest = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
    }
    abortRef.current?.abort()
    abortRef.current = null
  }, [])

  useEffect(() => () => clearDebounceAndRequest(), [clearDebounceAndRequest])

  const runValidation = useCallback(
    (raw: string) => {
      const trimmed = raw.trim()
      if (!trimmed) {
        setStatus('idle')
        setMessage('')
        return
      }
      setStatus('pending')
      abortRef.current?.abort()
      const ac = new AbortController()
      abortRef.current = ac
      validate(trimmed, ac.signal)
        .then((res) => {
          if (ac.signal.aborted) return
          if (res.ok) {
            setStatus('ok')
            setMessage('')
          } else {
            setStatus('error')
            setMessage(res.message)
          }
        })
        .catch((e: unknown) => {
          if (isAbort(e)) return
          setStatus('error')
          setMessage('Request failed. You can retry from the field actions.')
        })
    },
    [validate],
  )

  const onBlur = useCallback(() => {
    clearDebounceAndRequest()
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null
      runValidation(value)
    }, debounceMs)
  }, [clearDebounceAndRequest, debounceMs, runValidation, value])

  const onChange = useCallback(
    (next: string) => {
      clearDebounceAndRequest()
      setValue(next)
      setStatus('idle')
      setMessage('')
    },
    [clearDebounceAndRequest],
  )

  const retry = useCallback(() => {
    clearDebounceAndRequest()
    runValidation(value)
  }, [clearDebounceAndRequest, runValidation, value])

  return { value, onChange, onBlur, status, message, retry }
}

type BoundaryProps = { children: ReactNode }
type BoundaryState = { err: Error | null }

class FormSectionBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { err: null }

  static getDerivedStateFromError(err: Error): BoundaryState {
    return { err }
  }

  override componentDidCatch(err: Error, info: ErrorInfo) {
    console.error('Form section error', err, info.componentStack)
  }

  override render() {
    if (this.state.err) {
      return (
        <div className="boundary-fallback" role="alert">
          This section hit an unexpected error. Reload the page to continue.
        </div>
      )
    }
    return this.props.children
  }
}

function statusClass(s: FieldStatus): string {
  if (s === 'pending') return 'pending'
  if (s === 'error') return 'error'
  if (s === 'ok') return 'ok'
  return ''
}

function statusText(s: FieldStatus, msg: string): string {
  if (s === 'pending') return 'Checking with server…'
  if (s === 'error') return msg
  if (s === 'ok') return 'Passed server validation.'
  return ''
}

export default function App() {
  const user = useRemoteValidatedField(validateUsernameRemote, 300)
  const invite = useRemoteValidatedField(validateInviteRemote, 300)
  const [submitting, setSubmitting] = useState(false)
  const [submitBanner, setSubmitBanner] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const submitAbortRef = useRef<AbortController | null>(null)

  useEffect(
    () => () => {
      submitAbortRef.current?.abort()
    },
    [],
  )

  const canSubmit =
    user.status === 'ok' &&
    invite.status === 'ok' &&
    !submitting &&
    !done

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitBanner(null)
    submitAbortRef.current?.abort()
    const ac = new AbortController()
    submitAbortRef.current = ac
    setSubmitting(true)
    try {
      const res = await submitRegistration(
        { username: user.value.trim(), inviteCode: invite.value.trim() },
        ac.signal,
      )
      if (ac.signal.aborted) return
      if (res.ok) {
        setDone(true)
      } else {
        setSubmitBanner(res.message)
      }
    } catch (err) {
      if (!isAbort(err)) {
        setSubmitBanner('Network error while submitting. Try again.')
      }
    } finally {
      if (!ac.signal.aborted) setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="app-shell">
        <div className="card">
          <h1>Registered</h1>
          <div className="success" role="status">
            <h2>Submission complete</h2>
            <p>
              Username <strong>{user.value.trim()}</strong> was accepted by the
              mock API.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <div className="card">
        <h1>Create account</h1>
        <p className="lede">
          Remote fields must pass server validation before submit. Adjust values
          if the server rejects them, then try again.
        </p>

        <FormSectionBoundary>
          <form onSubmit={onSubmit} noValidate>
            <div className="field">
              <label htmlFor="username">Username</label>
              <div className="field-row">
                <input
                  id="username"
                  name="username"
                  autoComplete="username"
                  value={user.value}
                  onChange={(e) => user.onChange(e.target.value)}
                  onBlur={user.onBlur}
                  aria-invalid={user.status === 'error'}
                  aria-describedby="username-status"
                />
                {user.status === 'error' ? (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={user.retry}
                  >
                    Retry
                  </button>
                ) : null}
              </div>
              <p className="meta">
                Demo rule: names <code>admin</code> or <code>taken</code> are
                unavailable.
              </p>
              <div
                id="username-status"
                className={`status ${statusClass(user.status)}`}
                role="status"
              >
                {statusText(user.status, user.message)}
              </div>
            </div>

            <div className="field">
              <label htmlFor="invite">Invite code</label>
              <div className="field-row">
                <input
                  id="invite"
                  name="invite"
                  autoComplete="off"
                  value={invite.value}
                  onChange={(e) => invite.onChange(e.target.value)}
                  onBlur={invite.onBlur}
                  aria-invalid={invite.status === 'error'}
                  aria-describedby="invite-status"
                />
                {invite.status === 'error' ? (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={invite.retry}
                  >
                    Retry
                  </button>
                ) : null}
              </div>
              <p className="meta">
                Server accepts only <code>{VALID_INVITE}</code> in this demo.
              </p>
              <div
                id="invite-status"
                className={`status ${statusClass(invite.status)}`}
                role="status"
              >
                {statusText(invite.status, invite.message)}
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
              {submitting ? 'Submitting…' : 'Submit'}
            </button>
          </form>
        </FormSectionBoundary>

        {submitBanner ? (
          <div className="banner" role="alert">
            {submitBanner}
          </div>
        ) : null}
      </div>
    </div>
  )
}
