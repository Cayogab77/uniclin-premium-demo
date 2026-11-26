// Renderiza as cenas de tools/render/scenes.js em PNG (Chromium headless + Three.js).
// Uso: npm run render [-- hero recepcao ...]   saída: tools/render/out/<cena>.png
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright'); // Playwright do ambiente (não é dependência do site)

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = path.join(ROOT, 'tools/render/out');
const JOBS = { hero: [1600, 1800], recepcao: [2000, 1400], odontologia: [2000, 1400], medico: [2000, 1400], estetica: [2000, 1400] };
const pick = process.argv.slice(2).filter((a) => JOBS[a]);
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript' };

const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': TYPES[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
}).listen(0, '127.0.0.1');
await new Promise((r) => server.once('listening', r));
const port = server.address().port;

const exe = process.env.CHROME || fs.readdirSync('/opt/pw-browsers').filter((d) => d.startsWith('chromium-')).map((d) => `/opt/pw-browsers/${d}/chrome-linux64/chrome`).find((f) => fs.existsSync(f));
const browser = await chromium.launch({ executablePath: exe, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
fs.mkdirSync(OUT, { recursive: true });
for (const [name, [w, h]] of Object.entries(JOBS)) {
  if (pick.length && !pick.includes(name)) continue;
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  page.on('console', (m) => { if (m.type() === 'error') console.error(`[${name}]`, m.text()); });
  const t = Date.now();
  await page.goto(`http://127.0.0.1:${port}/tools/render/index.html?scene=${name}&w=${w}&h=${h}`);
  await page.waitForFunction(() => window.__done, null, { timeout: 600000 });
  const status = await page.evaluate(() => window.__done);
  if (status !== 'ok') { console.error(name, status); process.exitCode = 1; continue; }
  const data = await page.evaluate(() => document.querySelector('canvas').toDataURL('image/png'));
  fs.writeFileSync(path.join(OUT, `${name}.png`), Buffer.from(data.split(',')[1], 'base64'));
  console.log(`${name}: ${w}x${h} em ${((Date.now() - t) / 1000).toFixed(1)} s`);
  await page.close();
}
await browser.close(); server.close();
