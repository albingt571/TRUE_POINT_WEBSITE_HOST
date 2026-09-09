import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

// Load GROQ_API_KEY from .env.local for local development
function getGroqKey() {
  const envPath = resolve(process.cwd(), '.env.local')
  if (!existsSync(envPath)) return ''
  const content = readFileSync(envPath, 'utf-8')
  const match = content.match(/^GROQ_API_KEY=(.+)$/m)
  return match ? match[1].trim() : ''
}

// Custom Vite plugin that intercepts /api/chat and proxies to Groq with the API key
function groqProxyPlugin() {
  const groqKey = getGroqKey()

  return {
    name: 'groq-proxy',
    configureServer(server) {
      server.middlewares.use('/api/chat', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        // Read the request body
        const chunks = []
        for await (const chunk of req) {
          chunks.push(chunk)
        }
        const body = Buffer.concat(chunks).toString()

        try {
          const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${groqKey}`
            },
            body
          })

          const data = await groqRes.text()
          res.statusCode = groqRes.status
          res.setHeader('Content-Type', 'application/json')
          res.end(data)
        } catch (err) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: 'Proxy error: ' + err.message }))
        }
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), groqProxyPlugin()],
})
