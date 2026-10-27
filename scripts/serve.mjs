import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve(process.env.PREVIEW_DIR || 'dist');
const port = Number(process.env.PORT || 4174);
const prefix = `/${(process.env.PREVIEW_PREFIX || '').replace(/^\/+|\/+$/g, '')}`.replace(/\/$/, '');
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css', '.js':'text/javascript', '.png':'image/png', '.svg':'image/svg+xml', '.ico':'image/x-icon', '.woff2':'font/woff2', '.xml':'application/xml', '.txt':'text/plain', '.webp':'image/webp', '.jpg':'image/jpeg', '.mp4':'video/mp4', '.vtt':'text/vtt; charset=utf-8' };
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
    const headers = { 'Content-Type':types[extname(file)] || 'application/octet-stream', 'Cache-Control':'no-store', 'Accept-Ranges':'bytes' };
    if (req.headers.range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      let start = 0, end = data.length - 1;
      if (match && (match[1] || match[2])) {
        start = match[1] ? Number(match[1]) : Math.max(0, data.length - Number(match[2]));
        end = match[1] && match[2] ? Math.min(Number(match[2]), data.length - 1) : end;
      }
      if (!match || !(match[1] || match[2]) || start > end || start >= data.length) {
        res.writeHead(416, { ...headers, 'Content-Range': `bytes */${data.length}` }).end(); return;
      }
      res.writeHead(206, { ...headers, 'Content-Range': `bytes ${start}-${end}/${data.length}`, 'Content-Length': end-start+1 });
      res.end(req.method === 'HEAD' ? undefined : data.subarray(start, end+1)); return;
    }
    res.writeHead(200, { ...headers, 'Content-Length': data.length });
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch { res.writeHead(400).end('Unable to serve this request.'); }
});
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
server.listen(port, '127.0.0.1', () => console.log(`RelayByte preview: http://127.0.0.1:${port}${prefix}/`));
