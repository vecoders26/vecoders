import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

// Serves api/*.js during `npm run dev` the way Vercel does in production, so the
// registration form works locally without `vercel dev`. Supports both handler styles:
// `export default (req, res)` and Web-standard `export async function POST(request)`.
function apiDevServer() {
  return {
    name: 'vecoders-api-dev-server',
    apply: 'serve',
    configureServer(server) {
      // Server-only vars from .env (no VITE_ prefix) for the handlers; never sent to the browser.
      const fileEnv = loadEnv(server.config.mode, server.config.root, '')
      for (const [key, value] of Object.entries(fileEnv)) {
        if (!(key in process.env)) process.env[key] = value
      }

      server.middlewares.use('/api', async (req, res, next) => {
        const name = req.url.split('?')[0].replace(/^\/+|\/+$/g, '')
        const file = path.join(server.config.root, 'api', `${name}.js`)
        if (!/^[a-z0-9-]+$/.test(name) || !fs.existsSync(file)) return next()

        try {
          const mod = await server.ssrLoadModule(file)
          const raw = await readBody(req)

          if (typeof mod[req.method] === 'function') {
            const hasBody = !['GET', 'HEAD'].includes(req.method)
            const request = new Request(`http://${req.headers.host}${req.originalUrl}`, {
              method: req.method,
              headers: Object.entries(req.headers).filter(([, v]) => typeof v === 'string'),
              body: hasBody ? raw : undefined,
            })
            const response = await mod[req.method](request)
            res.writeHead(response.status, Object.fromEntries(response.headers))
            return res.end(Buffer.from(await response.arrayBuffer()))
          }

          if (typeof mod.default !== 'function') {
            res.statusCode = 405
            return res.end()
          }

          req.rawBody = raw
          if ((req.headers['content-type'] || '').includes('application/json')) {
            try {
              req.body = JSON.parse(raw.toString('utf8') || '{}')
            } catch {
              req.body = {}
            }
          }
          res.status = (code) => {
            res.statusCode = code
            return res
          }
          res.json = (data) => {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(data))
            return res
          }
          await mod.default(req, res)
        } catch (err) {
          server.ssrFixStacktrace(err)
          console.error(err)
          if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Dev API handler crashed; see terminal.' }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), apiDevServer()],
})
