import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve(process.env.PREVIEW_DIR || 'dist');
const port = Number(process.env.PORT || 4174);
const prefix = `/${(process.env.PREVIEW_PREFIX || '').replace(/^\/+|\/+$/g, '')}`.replace(/\/$/, '');
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css', '.js':'text/javascript', '.png':'image/png', '.svg':'image/svg+xml', '.ico':'image/x-icon', '.woff2':'font/woff2', '.xml':'application/xml', '.txt':'text/plain' };
const server = createServer(async (req, res) => {
  const notFound = async () => {
    res.writeHead(404, { 'Content-Type':'text/html; charset=utf-8' });
    res.end(req.method === 'HEAD' ? undefined : await readFile(resolve(root, '404.html')));
  };
  try {
    const url = new URL(req.url, 'http://localhost');
    const pathname = decodeURIComponent(url.pathname);
    if (prefix && pathname !== prefix && !pathname.startsWith(`${prefix}/`)) { await notFound(); return; }
    const path = pathname.slice(prefix.length) || '/';
    let file = resolve(root, `.${path}`);
    if (file !== root && !file.startsWith(root + sep)) { res.writeHead(403).end(); return; }
    try {
      if ((await stat(file)).isDirectory()) {
        if (!url.pathname.endsWith('/')) { res.writeHead(301, { Location: `${url.pathname}/${url.search}` }).end(); return; }
        file = resolve(file, 'index.html');
      }
      await stat(file);
    } catch { await notFound(); return; }
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type':types[extname(file)] || 'application/octet-stream', 'Cache-Control':'no-store' });
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch { res.writeHead(400).end('Unable to serve this request.'); }
});
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
server.listen(port, '127.0.0.1', () => console.log(`RelayByte preview: http://127.0.0.1:${port}${prefix}/`));
