import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const ext = path.join(root, 'dist', 'chrome')
const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const PORT = 9335
const HTTP = 8766

function serve() {
  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      const file = path.join(root, 'e2e', req.url === '/' ? 'page.html' : req.url.slice(1))
      try {
        const body = await readFile(file)
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
        res.end(body)
      } catch {
        res.writeHead(404)
        res.end()
      }
    })
    server.listen(HTTP, '127.0.0.1', () => resolve(server))
  })
}

async function main() {
  const profile = await mkdtemp(path.join(tmpdir(), 'translator-e2e-'))
  const server = await serve()
  const child = spawn(
    chrome,
    [
      `--user-data-dir=${profile}`,
      `--remote-debugging-port=${PORT}`,
      `--disable-extensions-except=${ext}`,
      `--load-extension=${ext}`,
      '--disable-features=DisableLoadExtensionCommandLineSwitch',
      '--no-first-run',
      '--no-default-browser-check',
      `http://127.0.0.1:${HTTP}/`,
    ],
    { stdio: 'ignore' },
  )
  console.log(`e2e pad at http://127.0.0.1:${HTTP}/`)
  console.log(`extension: ${ext}`)
  process.on('SIGINT', () => {
    child.kill()
    server.close()
    process.exit(0)
  })
}

await main()
