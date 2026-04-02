import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';

const root = process.argv[2];
const port = Number(process.argv[3] || 4173);

const types = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};

const resolveFile = (urlPath) => {
  const clean = urlPath.split('?')[0];
  const target = clean === '/' || clean === '/djdip' || !extname(clean)
    ? 'index.html'
    : clean.replace(/^\/+/, '');

  const candidate = normalize(join(root, target));
  if (existsSync(candidate)) {
    return candidate;
  }

  return join(root, 'index.html');
};

createServer((req, res) => {
  try {
    const file = resolveFile(req.url || '/');
    const data = readFileSync(file);
    const type = types[extname(file).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type, 'Content-Length': data.length });
    res.end(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(message);
  }
}).listen(port, '127.0.0.1', () => {
  process.stdout.write(`ready:${port}`);
});
