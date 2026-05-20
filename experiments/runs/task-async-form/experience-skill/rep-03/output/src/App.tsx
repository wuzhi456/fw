import { useCallback, useEffect, useId, useRef, useState } from 'react'
import './App.css'
import {
  setFailNextSubmitWith500,
  submitProfileRemote,
  validateUsernameRemote,
  type SubmitBody,
} from './remoteApi.ts'

type UsernameRemoteState =
  | { kind: 'idle' }
  | { kind: 'pending' }
  | { kind: 'valid' }
  | { kind: 'invalid'; message: string }

function useDebouncedUsernameValidation(username: string, enabled: boolean) {
  const [state, setState] = useState<UsernameRemoteState>({ kind: 'idle' })
  const serial = useRef(0)

  useEffect(() => {
    if (!enabled) {
      serial.current += 1
      const idleId = window.setTimeout(() => {
        setState({ kind: 'idle' })
      }, 0)
      return () => window.clearTimeout(idleId)
    }

    const controller = new AbortController()
    const token = ++serial.current

    const t = window.setTimeout(() => {
      void (async () => {
        setState({ kind: 'pending' })
        try {
          const res = await validateUsernameRemote(username, controller.signal)
          if (token !== serial.current) return
          if (res.valid) {
            setState({ kind: 'valid' })
          } else {
            setState({ kind: 'invalid', message: res.message })
          }
        } catch (e) {
          if (e instanceof DOMException && e.name === 'AbortError') return
          if (token !== serial.current) return
          setState({
            kind: 'invalid',
            message: 'Could not verify username. Check your connection and try again.',
          })
        }
      })()
    }, 380)

    return () => {
      window.clearTimeout(t)
      controller.abort()
    }
  }, [enabled, username])

  return state
}

export default function App() {
  const usernameFieldId = useId()
  const usernameErrorId = `${usernameFieldId}-error`
  const usernameHintId = `${usernameFieldId}-hint`

  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [usernameDirty, setUsernameDirty] = useState(false)

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [globalBanner, setGlobalBanner] = useState<null | { tone: 'error' | 'success'; text: string }>(
    null,
  )
  const [recoverable, setRecoverable] = useState<null | { message: string; idempotencyKey: string }>(
    null,
  )

  const [optimisticPreview, setOptimisticPreview] = useState<null | {
    displayName: string
    username: string
  }>(null)
  const [committedPreview, setCommittedPreview] = useState<null | {
    displayName: string
    username: string
    recordId: string
  }>(null)

  const [simulate500, setSimulate500] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const submittingLock = useRef(false)
  const recoverableRef = useRef(recoverable)

  useEffect(() => {
    recoverableRef.current = recoverable
  }, [recoverable])

  const usernameValidationEnabled = usernameDirty && username.trim().length > 0
  const usernameRemote = useDebouncedUsernameValidation(username, usernameValidationEnabled)

  useEffect(() => {
    setFailNextSubmitWith500(simulate500)
  }, [simulate500])

  const canSubmit =
    displayName.trim().length > 0 &&
    password.length > 0 &&
    username.trim().length > 0 &&
    usernameRemote.kind === 'valid' &&
    !submitting

  const runSubmit = useCallback(async (body: SubmitBody, idempotencyKey: string) => {
    const controller = new AbortController()
    const result = await submitProfileRemote(body, { idempotencyKey }, controller.signal)

    if (result.ok) {
      setFieldErrors({})
      setRecoverable(null)
      setGlobalBanner({
        tone: 'success',
        text: `Saved (record ${result.recordId}). Username was checked on the server before submit.`,
      })
      setCommittedPreview({
        displayName: body.displayName.trim(),
        username: body.username.trim(),
        recordId: result.recordId,
      })
      setOptimisticPreview(null)
      return
    }

    setOptimisticPreview(null)

    if (result.status === 422) {
      setFieldErrors(result.fieldErrors)
      setRecoverable(null)
      setGlobalBanner({
        tone: 'error',
        text: 'Some fields need attention. Your other answers were kept.',
      })
      return
    }

    setFieldErrors({})
    setRecoverable({
      message: result.message,
      idempotencyKey,
    })
    setGlobalBanner({
      tone: 'error',
      text: result.message,
    })
  }, [])

  const performSubmit = useCallback(
    async (isRetry: boolean) => {
      if (submittingLock.current) return
      if (!canSubmit) return
      if (isRetry && !recoverableRef.current) return

      const idempotencyKey =
        isRetry && recoverableRef.current
          ? recoverableRef.current.idempotencyKey
          : crypto.randomUUID()

      if (!isRetry) {
        setRecoverable(null)
      }

      submittingLock.current = true
      setSubmitting(true)
      setGlobalBanner(null)

      const body: SubmitBody = {
        displayName,
        username,
        password,
      }

      setCommittedPreview(null)
      setOptimisticPreview({
        displayName: body.displayName.trim(),
        username: body.username.trim(),
      })

      try {
        await runSubmit(body, idempotencyKey)
      } finally {
        submittingLock.current = false
        setSubmitting(false)
      }
    },
    [canSubmit, displayName, password, runSubmit, username],
  )

  const usernameAriaInvalid = usernameRemote.kind === 'invalid'
  const usernameDescribedBy =
    [usernameRemote.kind === 'invalid' ? usernameErrorId : '', usernameHintId].filter(Boolean).join(' ') ||
    undefined

  return (
    <div className="layout">
      <section className="panel">
        <h1>Profile form</h1>
        <p className="lede">
          Username is validated remotely (debounced). Submit stays disabled until the server agrees. Try
          username <code>taken</code> first, then change it to something else.
        </p>

        <form
          className="form-grid"
          onSubmit={(e) => {
            e.preventDefault()
            void performSubmit(false)
          }}
          noValidate
        >
          <div className="field">
            <label htmlFor="displayName">Display name</label>
            <input
              id="displayName"
              name="displayName"
              autoComplete="name"
              value={displayName}
              onChange={(ev) => setDisplayName(ev.target.value)}
              aria-invalid={Boolean(fieldErrors.displayName)}
              aria-describedby={fieldErrors.displayName ? 'displayName-error' : undefined}
            />
            {fieldErrors.displayName ? (
              <div className="field-meta error" id="displayName-error" role="alert">
                {fieldErrors.displayName}
              </div>
            ) : null}
          </div>

          <div className="field">
            <label htmlFor={usernameFieldId}>Username</label>
            <input
              id={usernameFieldId}
              name="username"
              autoComplete="username"
              value={username}
              onChange={(ev) => {
                setUsernameDirty(true)
                setUsername(ev.target.value)
              }}
              aria-invalid={usernameAriaInvalid}
              aria-busy={usernameRemote.kind === 'pending'}
              aria-describedby={usernameDescribedBy}
            />
            <div className="field-meta">
              {usernameRemote.kind === 'pending' ? (
                <span className="pending" aria-live="polite">
                  Checking availability…
                </span>
              ) : null}
              {usernameRemote.kind === 'invalid' ? (
                <span className="error" id={usernameErrorId} role="alert">
                  {usernameRemote.message}
                </span>
              ) : null}
            </div>
            <p className="hint" id={usernameHintId}>
              Remote uniqueness check is debounced; rapid typing only applies the latest result.
            </p>
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? 'password-error' : undefined}
            />
            {fieldErrors.password ? (
              <div className="field-meta error" id="password-error" role="alert">
                {fieldErrors.password}
              </div>
            ) : (
              <div className="field-meta hint">Use at least 8 characters to pass server validation.</div>
            )}
          </div>

          <div className="actions">
            <button
              type="submit"
              className="primary"
              disabled={!canSubmit}
              aria-busy={submitting}
            >
              {submitting ? 'Submitting…' : 'Submit'}
            </button>
            {recoverable ? (
              <button
                type="button"
                className="ghost"
                disabled={submitting}
                onClick={() => {
                  void performSubmit(true)
                }}
              >
                Retry submit
              </button>
            ) : null}
          </div>
        </form>

        {globalBanner ? (
          <p className={`banner ${globalBanner.tone}`} role="status" style={{ marginTop: '1rem' }}>
            {globalBanner.text}
          </p>
        ) : null}
      </section>

      <section className="panel preview" data-stale={Boolean(optimisticPreview)}>
        <h2>Published preview</h2>
        <p className="hint" style={{ marginTop: 0 }}>
          Optimistic: shows your intended profile while the request is in flight; rolls back on errors
          (state-optimistic-rollback).
        </p>
        {committedPreview ? (
          <dl>
            <div>
              <dt>Display name</dt>
              <dd>{committedPreview.displayName}</dd>
            </div>
            <div>
              <dt>Username</dt>
              <dd>{committedPreview.username}</dd>
            </div>
            <div>
              <dt>Record</dt>
              <dd>{committedPreview.recordId}</dd>
            </div>
          </dl>
        ) : optimisticPreview ? (
          <dl>
            <div>
              <dt>Display name</dt>
              <dd>{optimisticPreview.displayName}</dd>
            </div>
            <div>
              <dt>Username</dt>
              <dd>{optimisticPreview.username}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>Pending server confirmation…</dd>
            </div>
          </dl>
        ) : (
          <p className="hint" style={{ margin: 0 }}>
            Nothing published yet.
          </p>
        )}
      </section>

      <section className="panel dev">
        <p className="hint" style={{ marginTop: 0 }}>
          Developer controls (async-retry-recover demo): simulate one 500 on the next submit, then retry
          without losing the form.
        </p>
        <label>
          <input
            type="checkbox"
            checked={simulate500}
            onChange={(ev) => setSimulate500(ev.target.checked)}
          />
          Fail next submit with HTTP 500 once
        </label>
      </section>
    </div>
  )
}
