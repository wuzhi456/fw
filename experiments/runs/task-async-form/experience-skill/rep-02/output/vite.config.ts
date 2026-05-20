import react from '@vitejs/plugin-react'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { defineConfig, type Plugin } from 'vite'

/** First non-422 submit simulates a transient 500; later submits succeed if valid. */
let simulateTransientServerErrorOnce = true

function readJsonBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    })
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8')
        resolve(raw ? (JSON.parse(raw) as Record<string, unknown>) : {})
      } catch (err) {
        reject(err)
      }
    })
    req.on('error', reject)
  })
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(body))
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

async function handleApi(req: IncomingMessage, res: ServerResponse) {
  const pathname = new URL(req.url ?? '/', 'http://local').pathname

  if (req.method === 'POST' && pathname === '/api/validate') {
    try {
      const body = await readJsonBody(req)
      await delay(320)
      const field = String(body.field ?? '')
      const value = String(body.value ?? '')
      if (field !== 'handle') {
        sendJson(res, 400, { ok: false, message: 'Unknown field.' })
        return
      }
      const trimmed = value.trim()
      if (trimmed.length < 2) {
        sendJson(res, 200, { ok: false, message: 'Handle must be at least 2 characters.' })
        return
      }
      if (trimmed.toLowerCase() === 'reserved') {
        sendJson(res, 200, { ok: false, message: 'That handle is already taken.' })
        return
      }
      sendJson(res, 200, { ok: true })
    } catch {
      sendJson(res, 400, { ok: false, message: 'Invalid JSON body.' })
    }
    return
  }

  if (req.method === 'POST' && pathname === '/api/submit') {
    try {
      const body = await readJsonBody(req)
      await delay(380)
      const handle = String(body.handle ?? '')
      const note = String(body.note ?? '')
      if (note.includes('FORBIDDEN')) {
        sendJson(res, 422, {
          errors: { note: ['That keyword is not allowed in notes.'] },
        })
        return
      }
      if (simulateTransientServerErrorOnce) {
        simulateTransientServerErrorOnce = false
        sendJson(res, 500, {
          message: 'Temporary server error. You can retry without losing your draft.',
        })
        return
      }
      sendJson(res, 200, { ok: true, received: { handle, note } })
    } catch {
      sendJson(res, 400, { message: 'Invalid JSON body.' })
    }
    return
  }

  res.statusCode = 404
  res.end()
}

type ConnectNext = (err?: unknown) => void

interface ConnectLike {
  use(
    handler: (
      req: IncomingMessage,
      res: ServerResponse,
      next: ConnectNext,
    ) => void,
  ): void
}

function installApiMiddleware(middlewares: ConnectLike) {
  middlewares.use((req, res, next) => {
    const pathname = new URL(req.url ?? '/', 'http://local').pathname
    if (pathname.startsWith('/api/')) {
      void handleApi(req, res)
      return
    }
    next()
  })
}

function apiPlugin(): Plugin {
  return {
    name: 'local-form-api',
    configureServer(server) {
      installApiMiddleware(server.middlewares)
    },
    configurePreviewServer(server) {
      installApiMiddleware(server.middlewares)
    },
  }
}

export default defineConfig({
  plugins: [react(), apiPlugin()],
})
