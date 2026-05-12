import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => chunks.push(chunk as Buffer))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

function mockApiPlugin(): Plugin {
  const attach = (middlewares: {
    use: (fn: (req: IncomingMessage, res: ServerResponse, next: () => void) => void) => void
  }) => {
    middlewares.use(
      async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        const url = req.url?.split('?')[0] ?? ''

        if (req.method === 'POST' && url === '/api/validate-code') {
          try {
            await delay(350)
            const raw = await readBody(req)
            const parsed = JSON.parse(raw) as { code?: unknown }
            const code =
              typeof parsed.code === 'string' ? parsed.code.trim() : ''
            const valid = code.toLowerCase() === 'alpha'
            sendJson(res, 200, {
              valid,
              message: valid
                ? null
                : 'Mock server accepts only the code "alpha".',
            })
          } catch {
            sendJson(res, 400, { valid: false, message: 'Invalid JSON body.' })
          }
          return
        }

        if (req.method === 'POST' && url === '/api/submit') {
          try {
            await delay(400)
            const raw = await readBody(req)
            const data = JSON.parse(raw) as Record<string, unknown>
            if (typeof data.code !== 'string' || data.code.trim().toLowerCase() !== 'alpha') {
              sendJson(res, 400, { ok: false, error: 'Code failed server check.' })
              return
            }
            sendJson(res, 201, { ok: true, received: data })
          } catch {
            sendJson(res, 400, { ok: false, error: 'Invalid JSON body.' })
          }
          return
        }

        next()
      },
    )
  }

  return {
    name: 'mock-remote-api',
    configureServer(server) {
      attach(server.middlewares)
    },
    configurePreviewServer(server) {
      attach(server.middlewares)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), mockApiPlugin()],
})
