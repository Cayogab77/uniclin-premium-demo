// Injeta o HTML do App (renderizado no build) em dist/index.html: o hero aparece antes do JavaScript.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { render } = await import(pathToFileURL(path.join(ROOT, 'dist-ssr/entry-server.js')).href);
const alvo = path.join(ROOT, 'dist/index.html');
const html = fs.readFileSync(alvo, 'utf8');
if (!html.includes('<div id="root"></div>')) throw new Error('marcador <div id="root"></div> não encontrado');
fs.writeFileSync(alvo, html.replace('<div id="root"></div>', `<div id="root">${render()}</div>`));
fs.rmSync(path.join(ROOT, 'dist-ssr'), { recursive: true, force: true });
console.log('prerender: dist/index.html com HTML estático do App');
