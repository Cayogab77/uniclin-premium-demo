// Testes de interface reais (Playwright + Chromium), sobre o build de produção.
// Uso: npm run build && npm run e2e      Evidências: docs/evidencias/
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright'); // Playwright do ambiente (fora das dependências do site)
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EVID = path.join(ROOT, 'docs/evidencias');
fs.mkdirSync(EVID, { recursive: true });
const PORT = 4180;
const URL = `http://127.0.0.1:${PORT}/`;

const resultados = [];
let falhas = 0;
async function caso(nome, fn) {
  try { await fn(); resultados.push(`PASSOU  ${nome}`); }
  catch (e) { falhas++; resultados.push(`FALHOU  ${nome}: ${e.message.split('\n')[0]}`); }
}
const ok = (cond, msg) => { if (!cond) throw new Error(msg); };

const servidor = spawn('npx', ['vite', 'preview', '--host', '127.0.0.1', '--port', String(PORT), '--strictPort'], { cwd: ROOT, stdio: 'ignore' });
for (let i = 0; i < 50; i++) { try { await fetch(URL); break; } catch { await new Promise((r) => setTimeout(r, 200)); } }

const browser = await chromium.launch();
const errosConsole = [];
async function abrir(w, h, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: opts.reduced ? 'reduce' : 'no-preference', timezoneId: 'America/Sao_Paulo', ...opts.ctx });
  const p = await ctx.newPage();
  p.on('console', (m) => { if (m.type() === 'error') errosConsole.push(`[${w}] ${m.text()}`); });
  p.on('pageerror', (e) => errosConsole.push(`[${w}] ${e.message}`));
  if (opts.relogio) await p.clock.setFixedTime(opts.relogio);
  await p.goto(URL, { waitUntil: 'networkidle' });
  return { ctx, p };
}

// 1. larguras: sem rolagem horizontal, nada fora da tela
for (const [w, h] of [[360, 740], [390, 844], [768, 1024], [1440, 900]]) {
  await caso(`largura ${w}px: sem scroll horizontal e sem elementos fora da tela`, async () => {
    const { ctx, p } = await abrir(w, h);
    const H = await p.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < H; y += h) { await p.evaluate((y) => scrollTo(0, y), y); await p.waitForTimeout(60); }
    const r = await p.evaluate(() => {
      const fora = [...document.querySelectorAll('main *, header *, footer *')].filter((el) => {
        const b = el.getBoundingClientRect(); const cs = getComputedStyle(el);
        return b.width > 0 && cs.visibility !== 'hidden' && !el.closest('dialog') && !el.closest('.hero__circulo') && (b.right > innerWidth + 1 || b.left < -1);
      }).map((el) => el.className || el.tagName);
      return { sx: document.documentElement.scrollWidth - innerWidth, fora: fora.slice(0, 5) };
    });
    ok(r.sx === 0, `scrollWidth excede em ${r.sx}px`);
    ok(r.fora.length === 0, `fora da tela: ${r.fora.join(', ')}`);
    await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(900);
    await p.screenshot({ path: path.join(EVID, `inicio-${w}.png`) });
    await ctx.close();
  });
}

// 2. menu móvel: abre, foco dentro, Esc fecha e devolve o foco; link navega
await caso('menu móvel: abrir, Esc, foco devolvido, navegação', async () => {
  const { ctx, p } = await abrir(390, 844);
  const botao = p.locator('.topo__menu');
  await botao.click();
  ok(await p.locator('dialog.menu-movel[open]').isVisible(), 'menu não abriu');
  ok(await p.evaluate(() => !!document.activeElement?.closest('dialog')), 'foco não entrou no menu');
  await p.waitForTimeout(500);
  await p.screenshot({ path: path.join(EVID, 'menu-movel-390.png') });
  await p.keyboard.press('Escape');
  ok(!(await p.locator('dialog.menu-movel[open]').count()), 'Esc não fechou');
  ok(await p.evaluate(() => document.activeElement?.classList.contains('topo__menu')), 'foco não voltou ao botão Menu');
  await botao.click();
  await p.locator('dialog.menu-movel a', { hasText: 'Equipe' }).click();
  await p.waitForFunction(() => Math.abs(document.getElementById('equipe').getBoundingClientRect().top - 88) < 4, null, { timeout: 5000 })
    .catch(() => {});
  const topo = await p.evaluate(() => document.getElementById('equipe').getBoundingClientRect().top);
  ok(Math.abs(topo - 88) < 4, `não rolou até Equipe (top=${topo}; esperado 88, abaixo do cabeçalho)`);
  await ctx.close();
});

// 3. busca, filtros, estado vazio e acordeão
await caso('especialidades: busca, filtro, vazio, acordeão', async () => {
  const { ctx, p } = await abrir(1440, 900);
  const busca = p.getByLabel('Buscar área');
  await busca.fill('cabelo');
  ok((await p.locator('.area').count()) === 1, 'busca "cabelo" deveria achar 1 área');
  ok((await p.locator('.area__nome').first().textContent()) === 'Farmácia e tricologia', 'área errada');
  await busca.fill('');
  await p.getByRole('button', { name: 'Odontologia', exact: true }).first().click();
  ok((await p.locator('.area').count()) === 2, 'filtro Odontologia deveria mostrar 2');
  await busca.fill('exame');
  ok(await p.locator('.vazio').isVisible(), 'estado vazio não apareceu');
  await p.locator('.vazio').screenshot({ path: path.join(EVID, 'busca-vazia.png') });
  await p.getByRole('button', { name: 'Limpar busca' }).click();
  ok((await p.locator('.area').count()) === 9, 'limpar deveria voltar a 9');
  const cab = p.locator('.area__cab button').first();
  await cab.click();
  ok((await cab.getAttribute('aria-expanded')) === 'true', 'acordeão não abriu');
  await p.evaluate(() => scrollTo(0, document.getElementById('especialidades').offsetTop - 80));
  await p.waitForTimeout(300);
  await p.screenshot({ path: path.join(EVID, 'especialidades-1440.png') });
  await ctx.close();
});

// 4. perfil (modal): abre, Esc fecha, foco volta; Luana sem foto; sem Indyra/Lizandra
await caso('equipe: perfis em modal com foco gerenciado; elenco correto', async () => {
  const { ctx, p } = await abrir(1440, 900);
  const nomes = await p.locator('.pessoa__nome').allTextContents();
  ok(nomes.length === 6, `esperava 6 profissionais, achei ${nomes.length}`);
  ok(!(await p.content()).match(/Indyra|Lizandra/), 'nome que não deveria aparecer');
  ok(await p.locator('.pessoa', { hasText: 'Dra. Luana' }).locator('.retrato--monograma').isVisible(), 'Luana deveria ter monograma');
  const card = p.locator('.pessoa', { hasText: 'Dr. Solario Neto' });
  await card.click();
  const dlg = p.locator('dialog.perfil[open]');
  ok(await dlg.isVisible(), 'perfil não abriu');
  ok((await dlg.textContent()).includes('RQE'), 'perfil do Dr. Solario deveria citar a pendência do RQE');
  await dlg.screenshot({ path: path.join(EVID, 'perfil-1440.png') });
  await p.keyboard.press('Escape');
  ok(!(await p.locator('dialog.perfil[open]').count()), 'Esc não fechou o perfil');
  ok(await p.evaluate(() => document.activeElement?.textContent?.includes('Solario')), 'foco não voltou ao cartão');
  await ctx.close();
});

// 5. agendamento demonstrativo: escolha, prévia, cópia, sem envio
for (const [w, h] of [[1440, 900], [390, 844]]) {
  await caso(`agendamento ${w}px: área → profissional → prévia → copiar; WhatsApp desativado`, async () => {
    const { ctx, p } = await abrir(w, h, { ctx: { permissions: ['clipboard-read', 'clipboard-write'] } });
    await p.locator('#agendar').scrollIntoViewIfNeeded();
    await p.locator('#agendar label.opcao', { hasText: /^Odontologia$/ }).click();
    const previa = p.locator('.previa');
    ok((await previa.textContent()) === 'Olá! Gostaria de informações sobre atendimento de odontologia com Dra. Ana Theresa Queiroz.', `prévia inesperada: ${await previa.textContent()}`);
    await p.locator('#agendar label.opcao', { hasText: 'Sem preferência' }).click();
    ok((await previa.textContent()).endsWith('atendimento de odontologia.'), 'sem preferência não atualizou');
    await p.locator('#agendar label.opcao', { hasText: 'Dra. Ana Theresa Queiroz' }).click();
    await p.getByRole('button', { name: 'Copiar mensagem' }).click();
    await p.waitForTimeout(200);
    const clip = await p.evaluate(() => navigator.clipboard.readText());
    ok(clip.startsWith('Olá! Gostaria de informações'), 'área de transferência sem a mensagem');
    ok((await p.locator('.previa__status').textContent()).includes('copiada'), 'sem confirmação de cópia');
    ok(await p.getByRole('button', { name: 'Abrir WhatsApp' }).isDisabled(), 'WhatsApp deveria estar desativado');
    ok(!(await p.locator('a[href*="wa.me"]').count()), 'não deve haver link real para wa.me');
    ok(!(await p.locator('#agendar input[type=text], #agendar input[type=tel], #agendar textarea').count()), 'não deve pedir dados pessoais');
    await p.locator('.passo--previa').scrollIntoViewIfNeeded();
    await p.evaluate(() => scrollBy(0, Math.min(200, innerHeight / 4)));
    await p.waitForTimeout(300);
    await p.screenshot({ path: path.join(EVID, `agendamento-${w}.png`) });
    await ctx.close();
  });
}

// 6. área sem profissional: mensagem coerente
await caso('agendamento: área sem profissional informado', async () => {
  const { ctx, p } = await abrir(1440, 900);
  await p.locator('#agendar label.opcao', { hasText: 'Ultrassonografia' }).click();
  ok((await p.locator('#agendar').textContent()).includes('ainda não informou o profissional'), 'faltou aviso de profissional não informado');
  await ctx.close();
});

// 7. horário com relógio fixo (instantes em America/Fortaleza; o navegador em outro fuso)
const casosHora = [
  ['2026-11-23T11:59:00-03:00', 'até 12h'], ['2026-11-23T12:00:00-03:00', 'hoje, às 14h'], ['2026-11-23T14:00:00-03:00', 'até 18h'],
  ['2026-11-27T18:00:00-03:00', 'amanhã, às 08h'], ['2026-11-28T09:00:00-03:00', 'até 12h'], ['2026-11-29T10:00:00-03:00', 'Domingo sem horário informado'],
];
for (const [iso, esperado] of casosHora) {
  await caso(`horário ${iso}: "${esperado}"`, async () => {
    const { ctx, p } = await abrir(1440, 900, { relogio: new Date(iso) });
    const t = await p.locator('#visite .status').textContent();
    ok(t.includes(esperado), `obtido: ${t}`);
    await ctx.close();
  });
}

// 8. movimento reduzido: ambientes em grade estática, nada escondido
await caso('movimento reduzido: ambientes estáticos e conteúdo visível', async () => {
  const { ctx, p } = await abrir(1440, 900, { reduced: true });
  ok(await p.locator('#ambientes.amb--estatico').count() === 1, 'ambientes deveriam ficar estáticos');
  ok((await p.locator('.selo-ilustrativa').count()) === 4, 'cada imagem conceitual deve ter o selo');
  const op = await p.evaluate(() => getComputedStyle(document.querySelector('.hero__titulo')).opacity);
  ok(op === '1', `título do hero escondido (opacity ${op})`);
  await ctx.close();
});

// 9. ambientes: capítulos revelados com a rolagem e selo visível
await caso('ambientes: capítulos com rolagem e selo de imagem ilustrativa', async () => {
  const { ctx, p } = await abrir(1440, 900);
  const { top, tot } = await p.evaluate(() => { const el = document.getElementById('ambientes'); return { top: el.offsetTop, tot: el.offsetHeight - innerHeight }; });
  await p.evaluate((y) => scrollTo(0, y), top + tot); await p.waitForTimeout(500);
  ok((await p.locator('.cap__painel h3').textContent()) === 'Sala de estética', 'último capítulo não ativado');
  ok(await p.locator('.amb__palco .selo-ilustrativa').isVisible(), 'selo não visível');
  await p.screenshot({ path: path.join(EVID, 'ambientes-1440.png') });
  await ctx.close();
});

// 10. rota em prévia, aviso de demonstração e noindex
await caso('visite: prévia da rota sem mapa; aviso e noindex presentes', async () => {
  const { ctx, p } = await abrir(1440, 900);
  await p.getByRole('button', { name: 'Ver prévia da rota' }).click();
  ok(await p.locator('.rota').isVisible(), 'prévia da rota não abriu');
  ok(await p.getByRole('button', { name: 'Abrir rota no mapa' }).isDisabled(), 'rota deveria estar desativada');
  ok((await p.locator('.aviso-demo').textContent()).includes('não é o site oficial'), 'aviso de demonstração ausente');
  ok((await p.locator('meta[name=robots]').getAttribute('content')).includes('noindex'), 'noindex ausente');
  const externos = await p.evaluate(() => performance.getEntriesByType('resource').map((r) => new URL(r.name).host).filter((h) => h !== location.host));
  ok(externos.length === 0, `requisições externas: ${[...new Set(externos)].join(', ')}`);
  await ctx.close();
});

// 11. teclado: pular para o conteúdo e foco visível
await caso('teclado: skip link é o primeiro Tab e tem foco visível', async () => {
  const { ctx, p } = await abrir(1440, 900);
  await p.keyboard.press('Tab');
  const r = await p.evaluate(() => { const a = document.activeElement; const cs = getComputedStyle(a); return { cls: a.className, vis: a.getBoundingClientRect().top >= 0, outline: cs.outlineStyle }; });
  ok(r.cls.includes('pular') && r.vis, 'primeiro Tab não foi para o skip link visível');
  await ctx.close();
});

// 12. acessibilidade automática (axe-core, WCAG 2.1 AA) em desktop e celular
for (const [w, h] of [[1440, 900], [390, 844]]) {
  await caso(`axe-core WCAG A/AA ${w}px sem violações`, async () => {
    const { ctx, p } = await abrir(w, h, { reduced: true });
    await p.addScriptTag({ path: require.resolve('axe-core/axe.min.js', { paths: [ROOT] }) });
    const v = await p.evaluate(async () => (await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] })).violations.map((x) => `${x.id} (${x.nodes.length}): ${x.nodes[0]?.target}`));
    fs.writeFileSync(path.join(EVID, `axe-${w}.json`), JSON.stringify(v, null, 2));
    ok(v.length === 0, v.join(' | '));
    await ctx.close();
  });
}

await caso('console sem erros em todas as execuções', async () => { ok(errosConsole.length === 0, errosConsole.slice(0, 3).join(' | ')); });

await browser.close();
servidor.kill();
const texto = resultados.join('\n') + `\n\nResumo: ${resultados.length - falhas} passaram, ${falhas} falharam.\n`;
fs.writeFileSync(path.join(EVID, 'e2e-resultado.txt'), texto);
console.log(texto);
process.exit(falhas ? 1 : 0);
