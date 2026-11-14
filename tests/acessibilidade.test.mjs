/* Conta Fácil 1.0 · varredura automática de acessibilidade (WCAG 2.2 A e AA) nas telas do app, nos temas claro e escuro.
   Usa o axe-core pelo pacote de desenvolvimento @axe-core/playwright (npm install). Sem ele, o teste é pulado com aviso:
   não conta como aprovado. Substitui, neste app, comum/testes/acessibilidade.test.mjs, que procura os Ajustes na barra do Kit. */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { preparar, aparelho } from '../comum/testes/ambiente.mjs';

const ETIQUETAS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
async function carregarAxe() {
  for (const m of [process.env.AXE_MODULE, '@axe-core/playwright'].filter(Boolean)) { try { const x = await import(m); return x.AxeBuilder || x.default; } catch {} }
  return null;
}
let amb, AxeBuilder;
before(async () => { AxeBuilder = await carregarAxe(); if (AxeBuilder) amb = await preparar(); });
after(async () => { await amb?.encerrar(); });
const resumo = v => v.map(x => `${x.id} (${x.impact}): ${x.help} → ${x.nodes.slice(0, 3).map(n => n.target.join(' ')).join(' | ')}`).join('\n');
async function varrer(page, onde) {
  const r = await new AxeBuilder({ page }).withTags(ETIQUETAS).analyze();
  assert.equal(r.violations.length, 0, `acessibilidade em ${onde}:\n${resumo(r.violations)}`);
}

for (const tema of ['light', 'dark']) {
  test(`acessibilidade (WCAG 2.2 AA): abertura, telas principais e Ajustes, tema ${tema === 'light' ? 'claro' : 'escuro'}`, async t => {
    if (!AxeBuilder) { t.skip('axe não instalado: rode npm install (pacote @axe-core/playwright)'); return; }
    const a = await aparelho(amb, { viewport: { width: 390, height: 844 }, antes: () => { window.CF_TESTE_ABERTURA = true; } });
    const p = a.page, nome = tema === 'light' ? 'claro' : 'escuro';
    await p.emulateMedia({ colorScheme: tema, reducedMotion: 'reduce' });
    await p.locator('.abertura').waitFor();
    await varrer(p, `abertura (${nome})`);
    await p.click('#ab-pular'); await p.locator('.abertura').waitFor({ state: 'detached' });
    await varrer(p, `Início (${nome})`);
    await p.click('#ini-ex'); await p.locator('.cmd-una').waitFor();
    await varrer(p, `Comanda (${nome})`);
    await p.click('#fechar-cmd'); await p.locator('.fc-slide').first().waitFor();
    await varrer(p, `Fechar a comanda (${nome})`);
    await p.click('#fc-volta');
    for (const [id, tela] of [['historico', 'Histórico'], ['tampinhas', 'Tampinhas'], ['mais', 'Mais']]) { await p.click('#tab-' + id); await p.waitForTimeout(300); await varrer(p, `${tela} (${nome})`); }
    await p.locator('#view [data-ir="cadastros"]').click(); await p.waitForTimeout(300);
    await varrer(p, `Cadastros (${nome})`);
    await p.click('#tab-mais'); await p.locator('#view [data-kf="ajustes"]').click(); await p.locator('.kf-aj-h').waitFor();
    await varrer(p, `Ajustes (${nome})`);
    await a.fechar();
  });
}
