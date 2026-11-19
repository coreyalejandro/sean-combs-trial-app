// Tiny static server for ./out, used by Playwright. Serves /day/1/ as out/day/1/index.html.
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve('out')
const port = Number(process.argv[2] || 4173)
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.txt': 'text/plain', '.ico': 'image/x-icon',
  '.bin': 'application/octet-stream',
}

http.createServer((req, res) => {
  const url = decodeURIComponent((req.url || '/').split('?')[0])
  let file = path.join(root, url)
  if (!file.startsWith(root)) { res.writeHead(403); res.end(); return }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html')
  if (!fs.existsSync(file)) {
    res.writeHead(404, { 'content-type': types['.html'] })
    const nf = path.join(root, '404.html')
    res.end(fs.existsSync(nf) ? fs.readFileSync(nf) : 'Not found')
    return
  }
  res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' })
  fs.createReadStream(file).pipe(res)
}).listen(port, '127.0.0.1', () => console.log(`serving ${root} on http://127.0.0.1:${port}`))
