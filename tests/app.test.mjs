/* Conta Fácil · testes do app (npm test). Rodam num Chromium, sem internet:
   o GitHub (sincronização) e o Firestore (avaliações) são simulados por comum/testes/ambiente.mjs. */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { preparar, aparelho, githubFalso, firestoreFalso, semRolagemLateral, conferirTopo, guiasAjustes, GUIAS_COMUNS, TOKEN_TESTE, RAIZ } from '../comum/testes/ambiente.mjs';

let amb, versao;
before(async () => { amb = await preparar(); versao = JSON.parse(await readFile(RAIZ + '/package.json', 'utf8')).version; });
after(async () => { await amb?.encerrar(); });
const esperar = async (cond, ms = 8000) => { const fim = Date.now() + ms; while (Date.now() < fim) { if (await cond()) return true; await new Promise(r => setTimeout(r, 50)); } return false; };
const TELAS = [[{ width: 320, height: 568 }, 'celular mínimo (zoom 400%)'], [{ width: 360, height: 740 }, 'celular pequeno'], [{ width: 390, height: 844 }, 'celular'], [{ width: 820, height: 1180 }, 'tablet'], [{ width: 1440, height: 900 }, 'computador']];
const nav = (p, id) => p.locator(`#kf-nav-${id}, #kf-trilho-${id}`).locator('visible=true').first().click();
const semErros = a => assert.deepEqual(a.erros, [], 'erros no console');
// a janela nasce abaixo da tela e sobe: espera ela chegar ao lugar
const assentar = p => p.waitForFunction(() => { const d = [...document.querySelectorAll('.kf-dlg')].find(x => !x.closest('#kf-saidas')); return d && d.getAnimations().length === 0; });
// o teclado do celular: a área visível encolhe (é assim que o navegador avisa) sem a página mudar de tamanho
const TECLADO = 336;
const teclado = (p, on) => p.evaluate(([on, T]) => { const vv = window.visualViewport; if (!window.__kb) { window.__kb = { on: false }; Object.defineProperty(vv, 'height', { get: () => innerHeight - (window.__kb.on ? T : 0), configurable: true }); } window.__kb.on = on; vv.dispatchEvent(new Event('resize')); }, [on, TECLADO]);

/* cria uma comanda salva usando as próprias funções do app */
const salvarComanda = (p, local, nomes, item) => p.evaluate(([local, nomes, item]) => {
  const d = blankDraft(); d.place = local;
  d.people = nomes.map(newPerson);
  d.items = [{ id: newId(), o: 1, name: item.nome, qty: item.qtd, price: item.preco, fq: 0, mode: 'equal', lk: true, a: Object.fromEntries(d.people.map(x => [x.id, 1])) }];
  d.active = true; draft = d; saveDraft(); saveBill();
  document.querySelector('#festa-ok')?.click();
}, [local, nomes, item]);
/* monta uma mesa pela tela, como a pessoa faria */
async function abrirMesa(p, local, nomes) {
  await p.fill('#ini-local', local); await p.click('#ini-form button[type=submit]');
  await p.click('#add-pessoa');
  for (const n of nomes) { await p.fill('#pn-nome', n); await p.click('#pn-form button[type=submit]'); }
  await p.click('.kf-dlg [data-kf-fechar]');
}
async function lancar(p, nome, centavos, { qtd, so, individual } = {}) {
  await p.click('#it-novo');
  await p.fill('#pr-nome', nome);
  if (qtd) await p.fill('#pr-qtd', String(qtd));
  await p.locator('#pr-preco').pressSequentially(String(centavos));
  if (individual) { await p.click('[data-lc-modo="units"]'); for (const [n, q] of individual) { const id = await p.evaluate(n => draft.people.find(x => x.name === n).id, n); for (let k = 0; k < q; k++) await p.click(`[data-lc-un="${id}"][data-dir="1"]`); } }
  if (so) for (const id of await p.evaluate(so => draft.people.filter(x => !so.includes(x.name)).map(x => x.id), so)) await p.click(`[data-lc-ck="${id}"]`);
  await p.click('#lc-ok');
  await p.locator('.kf-ov').waitFor({ state: 'detached' });
}

test('abre sem erros em celular, tablet e computador, sem rolagem lateral, com uma navegação só', async () => {
  for (const [viewport, nome] of TELAS) {
    const a = await aparelho(amb, { viewport });
    await a.page.locator('#view .imp').waitFor();
    assert.equal(await a.page.getAttribute('html', 'lang'), 'pt-BR');
    assert.ok(await semRolagemLateral(a.page), `rolagem lateral no ${nome}`);
    const topo = await conferirTopo(a.page);
    assert.equal(topo.estado, 'desligada', `nuvem no ${nome}`);
    const navs = await a.page.evaluate(() => ['.kf-nav', '.kf-trilho'].filter(q => document.querySelector(q).getClientRects().length));
    assert.deepEqual(navs, [viewport.width >= 1024 ? '.kf-trilho' : '.kf-nav'], `navegação no ${nome}`);
    for (const t of ['historico', 'tampinhas', 'mais']) { await nav(a.page, t); assert.ok(await semRolagemLateral(a.page), `rolagem lateral em ${t} no ${nome}`); }
    await a.page.locator('#view [data-ir="cadastros"]').click(); assert.ok(await semRolagemLateral(a.page), `rolagem lateral nos Cadastros no ${nome}`);
    semErros(a); await a.fechar();
  }
});

test('zoom liberado e alvos de toque da navegação com 44 px ou mais', async () => {
  const a = await aparelho(amb);
  const vp = await a.page.getAttribute('meta[name=viewport]', 'content');
  assert.ok(!/user-scalable\s*=\s*no|maximum-scale/.test(vp), 'o zoom não pode ser travado');
  const pequenos = await a.page.evaluate(() => [...document.querySelectorAll('.kf-nav-it, .kf-topo-btn, .marca')].filter(e => e.getClientRects().length).map(e => e.getBoundingClientRect()).filter(r => r.width < 44 || r.height < 44).length);
  assert.equal(pequenos, 0);
  await a.fechar();
});

test('abertura: aparece na primeira vez, a demonstração recalcula, guarda o nome e não volta sozinha', async () => {
  const a = await aparelho(amb, { antes: () => { window.CF_TESTE_ABERTURA = true; } });
  const p = a.page;
  await p.locator('.kf-abertura').waitFor();
  assert.match(await p.textContent('#kf-ab-t'), /sem calculadora/);
  await p.click('#kf-ab-prox');
  assert.match(await p.textContent('.ab-demo-r'), /Entre todos · R\$\s14,00 cada/);
  await p.click('[data-ab-p="Carla"]');
  assert.match(await p.textContent('.ab-demo-r'), /Entre 2 · R\$\s21,00 cada/);
  await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowRight');
  await p.fill('#ab-eu', 'Bruno');
  await p.click('#kf-ab-prox');
  await p.locator('.kf-abertura').waitFor({ state: 'detached' });
  assert.equal(await p.evaluate(() => catalog.me), 'Bruno');
  // quem disse o nome na apresentação já recebe a primeira tampinha; ao fechar, segue para a nova comanda
  await p.locator('.tn').waitFor(); assert.match(await p.textContent('.tn-nome'), /Prazer, eu/);
  await p.click('#tn-ok');
  await p.locator('#nc-local').waitFor(); // a última tela leva direto à nova comanda
  await p.reload(); await p.locator('#view .imp').waitFor();
  assert.equal(await p.locator('.kf-abertura').count(), 0, 'a abertura não pode voltar sozinha');
  assert.match(await p.textContent('.saudacao'), /Bruno/);
  // dá para rever nos Ajustes (um lugar só)
  await p.keyboard.press('Escape'); await nav(p, 'mais');
  assert.equal(await p.locator('#ma-abertura').count(), 0);
  await p.locator('#view [data-kf="ajustes"]').click(); await p.locator('#view .kf-aj-lista [data-kf-aj-ir="comandas"]').click(); await p.click('#aj-abertura');
  await p.locator('.kf-abertura').waitFor(); await p.keyboard.press('Escape');
  await p.locator('.kf-abertura').waitFor({ state: 'detached' });
  semErros(a); await a.fechar();
});

test('fluxo completo: mesa, pedidos numa janela só, pago, fechar, salvar com festa e Desfazer', async () => {
  const a = await aparelho(amb, { toque: true });
  const p = a.page;
  await abrirMesa(p, 'Cantina do Teste', ['Ana', 'Bruno', 'Carla']);
  await lancar(p, 'Porção de fritas', 4200);                                   // entre todos
  await lancar(p, 'Suco', 1000, { qtd: 3, individual: [['Ana', 2], ['Bruno', 1]] }); // individual
  await lancar(p, 'Pudim', 2200, { so: ['Carla'] });                        // só uma pessoa
  const c = await p.evaluate(() => { const c = compute(draft); return { total: c.total, por: draft.people.map(x => c.per[x.id].total), abertos: c.openItems.length }; });
  // consumo: Ana 14+20, Bruno 14+10, Carla 14+22; serviço de 10% em cada um
  assert.deepEqual(c.por, [3740, 2640, 3960]); assert.equal(c.total, 10340); assert.equal(c.abertos, 0);
  assert.match(await p.textContent('.cu-total'), /103,40/);
  // o item novo entra no fim da lista
  assert.match(await p.locator('.items > *').last().textContent(), /Pudim/);
  // com a comanda aberta não há como marcar pago: só depois de fechar
  const ana = await p.evaluate(() => draft.people[0].id);
  await p.click(`[data-unit="${ana}"]`);
  assert.equal(await p.locator('#view [data-pa-pago]').count(), 0, 'marcar como pago só aparece depois de fechar a comanda');
  // fechar: a mesa primeiro, depois um cupom por pessoa; no cupom da Ana, marcar como pago
  await p.click('#fechar-cmd');
  assert.match(await p.textContent('#fc-cont'), /1 de 4 · Mesa/);
  await p.click('#fc-prox'); assert.match(await p.textContent('#fc-cont'), /2 de 4 · Ana/);
  await p.click('.fc-slide[aria-hidden="false"] [data-fc-pago="marcar"]');
  assert.equal(await p.locator('.fc-slide[aria-hidden="false"] .selo-pago').count(), 1, 'o cupom ganha o carimbo na hora');
  assert.match(await p.textContent('.fc-slide >> nth=0'), /FALTA PAGAR\s*R\$\s66,00/);
  assert.match(await p.textContent('#view .cu-falta'), /66,00/);
  await p.click('#fc-salvar');
  await p.locator('.festa').waitFor();
  assert.match(await p.textContent('.festa'), /Conta fechada/);
  assert.equal(await p.evaluate(() => bills.length), 1);
  assert.ok(await p.locator('.festa-tampa').count() >= 1, 'a primeira comanda rende tampinha');
  // desfazer devolve a comanda aberta e tira do histórico
  await p.click('#festa-des');
  assert.deepEqual(await p.evaluate(() => [bills.length, draft.active, draft.items.length, tab]), [0, true, 3, 'comanda']);
  await p.click('#fechar-cmd'); await p.click('#fc-salvar'); await p.click('#festa-ok');
  assert.deepEqual(await p.evaluate(() => [bills.length, draft.active, tab, bills[0].pagos && Object.keys(bills[0].pagos).length]), [1, false, 'inicio', 1]);
  // histórico: a comanda abre com os cupons
  await nav(p, 'historico');
  assert.match(await p.textContent('.retro-num'), /103,40/);
  await p.click('[data-bill]');
  assert.equal(await p.locator('.kf-dlg .receipt').count(), 3);
  semErros(a); await a.fechar();
});

test('comanda de exemplo: as contas batem e nada é salvo', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await p.click('#ini-ex');
  const c = await p.evaluate(() => { const c = compute(draft); return { total: c.total, unidades: c.units.map(u => [u.name, u.total]), aberto: c.openItems.length }; });
  assert.equal(c.total, 28090);
  assert.deepEqual(c.unidades, [['Ana + Bruno', 14127], ['Carla', 9967], ['Diego', 3996]]);
  await p.reload(); await p.locator('#view .imp').waitFor();
  assert.deepEqual(await p.evaluate(() => [draft.active, bills.length, localStorage.getItem('contafacil.draft')]), [false, 0, null]);
  semErros(a); await a.fechar();
});

test('juntar e separar pelo atalho da pessoa; conta da mesa com serviço, couvert e desconto', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await abrirMesa(p, 'Bar', ['Ana', 'Bruno']);
  await lancar(p, 'Pizza', 10000);
  const [ana, bruno] = await p.evaluate(() => draft.people.map(x => x.id));
  await p.click(`[data-unit="${ana}"]`); await p.click(`[data-pa="${ana}"] [data-pa-juntar]`); await p.click(`[data-pa="${ana}"] [data-pa-alvo="p:${bruno}"]`);
  assert.deepEqual(await p.evaluate(() => compute(draft).units.map(u => [u.name, u.total])), [['Bruno + Ana', 11000]]);
  await p.evaluate(() => KitFacil.avisar && document.querySelector('.kf-toast button')?.click()); // Desfazer
  assert.equal(await p.evaluate(() => compute(draft).units.length), 2);
  // conta da mesa
  await p.click('#cm-pe'); await assentar(p);
  await p.locator('[data-cm="svc"]').uncheck({ force: true });
  assert.equal(await p.evaluate(() => compute(draft).total), 10000);
  await p.locator('[data-cm="cv"]').check({ force: true });           // couvert de R$ 15,00 por pessoa
  assert.equal(await p.evaluate(() => compute(draft).total), 13000);
  await p.locator('[data-cm="ds"]').check({ force: true });
  await p.locator('#cm-ds').pressSequentially('1000'); await p.locator('#cm-ds').blur();
  assert.equal(await p.evaluate(() => compute(draft).total), 12000); // desconto de R$ 10,00 no total
  semErros(a); await a.fechar();
});

test('Pix: chave no cadastro vira copia e cola válido, com QR code', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  const r = await p.evaluate(() => {
    const cod = pixPayload('ana@exemplo.com.br', 'Ana Souza', 1234);
    return { cod, crcOk: (t => { let c = 0xFFFF; for (let i = 0; i < t.length; i++) { c ^= t.charCodeAt(i) << 8; for (let j = 0; j < 8; j++) c = c & 0x8000 ? ((c << 1) ^ 0x1021) & 0xFFFF : (c << 1) & 0xFFFF; } return c.toString(16).toUpperCase().padStart(4, '0'); })(cod.slice(0, -4)) === cod.slice(-4), cpf: normPixKey('529.982.247-25'), tel: normPixKey('(11) 98888-7777') };
  });
  assert.ok(r.crcOk); assert.match(r.cod, /^000201.*br\.gov\.bcb\.pix.*540512\.34.*5802BR.*6304[0-9A-F]{4}$/);
  assert.equal(r.cpf, '52998224725'); assert.equal(r.tel, '+5511988887777');
  semErros(a); await a.fechar();
});

test('tampinhas e níveis: nascem do histórico, a tampinha gira em 3D, o sorteio funciona, e dá para desligar', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  assert.deepEqual(await p.evaluate(() => { const s = jogoEstado(); return [s.nivel, s.ganhas.length]; }), [1, 0]);
  await salvarComanda(p, 'Cantina A', ['Ana', 'Bruno', 'Carla', 'Diego', 'Edu', 'Fabi'], { nome: 'Suco', qtd: 6, preco: 1000 });
  const s = await p.evaluate(() => { const s = jogoEstado(); return { ganhas: s.ganhas, xp: s.xp, nivel: s.nivel }; });
  assert.deepEqual(s.ganhas, ['primeira', 'mesa-cheia']); assert.equal(s.xp, 40 + 30 + 120); assert.equal(s.nivel, 2);
  await nav(p, 'tampinhas');
  assert.equal(await p.locator('.tampa.tem').count(), 2);
  // a tampinha é um objeto 3D: arrastar de lado gira, e as setas do teclado também
  await p.emulateMedia({ reducedMotion: 'reduce' });
  await p.click('[data-tampa="primeira"]');
  const o3d = p.locator('.kf-dlg .kf-o3d'); await o3d.waitFor();
  // malha 3D de verdade (WebGL; sem ele, canvas comum): tem tinta e não tem faces de CSS soltas na página, que piscavam no iPhone
  assert.equal(await p.locator('.kf-dlg .kf-o3d-saia, .kf-dlg .kf-o3d-eixo').count(), 0);
  assert.match(await p.getAttribute('.kf-dlg .kf-o3d', 'data-motor'), /^(webgl|canvas)$/);
  assert.ok(await p.evaluate(() => { const c = document.querySelector('.kf-dlg .kf-o3d canvas'), t = document.createElement('canvas'); t.width = c.width; t.height = c.height; const g = t.getContext('2d'); g.drawImage(c, 0, 0);
    const d = g.getImageData(0, 0, t.width, t.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 200) n++; return n > t.width * t.height * 0.2; }), 'a tampinha deveria estar desenhada');
  const giro = () => p.evaluate(() => document.querySelector('.kf-dlg .kf-o3d').dataset.ang);
  const g0 = await giro(), cx = await o3d.boundingBox();
  await p.mouse.move(cx.x + cx.width / 2 - 50, cx.y + cx.height / 2); await p.mouse.down(); await p.mouse.move(cx.x + cx.width / 2 + 60, cx.y + cx.height / 2, { steps: 6 }); await p.mouse.up();
  const g1 = await giro(); assert.notEqual(g1, g0, 'arrastar deveria girar a tampinha');
  await o3d.focus(); await p.keyboard.press('ArrowRight');
  assert.notEqual(await giro(), g1, 'a seta deveria girar a tampinha');
  await p.click('#tp-ok');
  // sorteio: quem entra é escolha de quem sorteia (sem mesa aberta, ninguém vem marcado)
  await p.click('#tp-sorteio'); await p.locator('#gf-quem').waitFor();
  assert.equal(await p.locator('#gf-quem [aria-pressed="true"]').count(), 0); assert.ok(await p.locator('#gf-go').isDisabled(), 'sem duas pessoas não há sorteio');
  const cand = await p.locator('#gf-quem [data-gf-n]').count(); assert.ok(cand >= 2, 'as pessoas dos cadastros são oferecidas');
  await p.click('#gf-quem [data-gf-n] >> nth=0'); await p.click('#gf-quem [data-gf-n] >> nth=1');
  await p.fill('#gf-novo', 'Visitante'); await p.press('#gf-novo', 'Enter');
  assert.equal(await p.locator('#gf-roda .gf-nome').count(), 3, 'a roda mostra só quem foi escolhido, mais o nome avulso');
  await p.click('#gf-quem [data-gf-n="Visitante"]'); assert.equal(await p.locator('#gf-roda .gf-nome').count(), 2);
  const escolhidos = await p.locator('#gf-quem [aria-pressed="true"]').allTextContents();
  await p.click('#gf-go');
  assert.match(await p.textContent('#gf-res'), /Saiu /); assert.ok(escolhidos.includes((await p.textContent('#gf-res b')).trim()), 'quem sai está entre os escolhidos');
  await p.keyboard.press('Escape');
  assert.ok(await esperar(() => p.evaluate(() => !!jogo.flags.sorteio)));
  // desligar: a navegação troca Tampinhas por Cadastros e a festa não aparece
  await p.keyboard.press('Escape');
  await p.evaluate(() => { jogo.off = true; jogoSalvar(); render(); });
  assert.equal(await p.locator('#kf-nav-tampinhas').count(), 0); assert.equal(await p.locator('#kf-nav-cadastros').count(), 1);
  await p.evaluate(() => { const d = blankDraft(); d.place = 'Cantina B'; d.people = ['Ana'].map(newPerson); d.items = [{ id: newId(), o: 1, name: 'Água', qty: 1, price: 500, fq: 0, mode: 'equal', lk: true, a: { [d.people[0].id]: 1 } }]; d.active = true; draft = d; saveBill(); });
  assert.equal(await p.locator('.festa').count(), 0);
  assert.match(await p.textContent('.kf-toast'), /Comanda salva no histórico/);
  semErros(a); await a.fechar();
});

test('Cadastros: pessoa com Pix, turma que entra na comanda nova e preço por lugar', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await salvarComanda(p, 'Cantina A', ['Ana', 'Bruno'], { nome: 'Suco', qtd: 2, preco: 1290 });
  await nav(p, 'mais'); await p.locator('#view [data-ir="cadastros"]').click();
  await p.click('#cad-pessoa'); await p.fill('#np-nome', 'Carla'); await p.fill('#np-pix', 'carla@exemplo.com.br'); await p.click('.kf-dlg-pe button[type=submit]');
  assert.equal(await p.evaluate(() => catalog.people.find(x => x.name === 'Carla').pix), 'carla@exemplo.com.br');
  await p.click('[data-cad="turmas"]'); await p.click('#cad-turma'); await p.fill('#tg-nome', 'Futebol');
  await p.click('[data-tg="Ana"]'); await p.click('[data-tg="Carla"]'); await p.click('.kf-dlg-pe button[type=submit]');
  await p.click('[data-cad="produtos"]');
  assert.match(await p.inputValue('[data-pprod="Suco"]'), /R\$\s12,90/);
  // nova comanda já com a turma
  await nav(p, 'comanda'); await p.click('[data-nc-turma]'); await p.fill('#nc-local', 'Cantina A'); await p.click('.kf-dlg-pe button[type=submit]');
  assert.deepEqual(await p.evaluate(() => draft.people.map(x => x.name)), ['Ana', 'Carla']);
  // o preço do lugar já vem sugerido
  await p.click('#it-novo'); await p.fill('#pr-nome', 'Suco');
  assert.match(await p.inputValue('#pr-preco'), /R\$\s12,90/);
  semErros(a); await a.fechar();
});

test('dados da versão 0.5.0 continuam valendo: histórico, cadastros e comanda aberta', async () => {
  const a = await aparelho(amb, { antes: () => {
    if (localStorage.getItem('contafacil.bills')) return;
    const p = (id, name) => ({ id, name, payService: true, payCouvert: true, o: 1 });
    const conta = { id: 'b1', place: 'Cantina Antiga', createdAt: 1790000000000, closedAt: 1790000000000, savedAt: 1790000000000, people: [p('a', 'Ana'), p('b', 'Bruno')],
      items: [{ id: 'i1', o: 1, name: 'Suco', qty: 4, price: 1000, fq: 0, mode: 'equal', lk: true, a: { a: 1, b: 1 } }],
      service: { enabled: true, mode: 'pct', pct: 10, fixed: 0, policy: 'discount' }, couvert: { enabled: false, value: 1500 }, discount: { enabled: false, label: 'Desconto', mode: 'value', value: 0, pct: 10, at: 'after' },
      payMode: 'none', payer: '', custom: {}, cover: {}, groups: [], total: 4400 };
    localStorage.setItem('contafacil.bills', JSON.stringify([conta]));
    localStorage.setItem('contafacil.catalog', JSON.stringify({ me: 'Ana', people: [{ name: 'Ana', pix: 'ana@exemplo.com.br' }, { name: 'Bruno' }], products: [{ name: 'Suco', price: 1000, prices: {} }], groups: [] }));
    localStorage.setItem('contafacil.draft', JSON.stringify({ ...conta, id: 'd1', place: 'Mesa aberta', savedAt: null, closedAt: undefined, active: true }));
    localStorage.setItem('kitfacil.conta-facil.visto', '"0.5.0"');
  } });
  const p = a.page;
  await p.locator('#view .imp').waitFor();
  assert.deepEqual(await p.evaluate(() => [bills.length, catalog.me, draft.active, draft.place, compute(draft).total]), [1, 'Ana', true, 'Mesa aberta', 4400]);
  assert.match(await p.textContent('.imp-papel'), /Mesa aberta/);
  assert.equal(await p.locator('.tira').count(), 1);
  // quem já usava chega com as tampinhas que o histórico garante, sem janela
  assert.deepEqual(await p.evaluate(() => jogoEstado().ganhas), ['primeira', 'voce', 'pix']);
  assert.equal(await p.locator('.kf-ov').count(), 0);
  semErros(a); await a.fechar();
});

test('Ajustes: guias comuns do Kit, a guia do app e o Voltar do navegador', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await nav(p, 'mais'); await p.locator('#view [data-kf="ajustes"]').click();
  await p.locator('.kf-aj-h').waitFor();
  const g = await guiasAjustes(p);
  assert.deepEqual(g.comuns, GUIAS_COMUNS); assert.deepEqual(g.produto, ['Tampinhas e apresentação']);
  await p.goBack();
  assert.ok(await esperar(() => p.evaluate(() => tab === 'mais')));
  semErros(a); await a.fechar();
});

test('balão: a avaliação sai com o nome do app, a versão e a tela', async () => {
  const fs = firestoreFalso();
  const a = await aparelho(amb, { firestore: fs });
  const p = a.page;
  await p.click('.kf-topo [data-kf="feedback"]'); await p.click('.kf-dlg [data-kf="avaliar"]');
  await p.click('label[for="kf-n5"]');
  await p.fill('#kf-msg', 'Dividir a conta ficou fácil.');
  await p.click('[data-kf-enviar]');
  await p.locator('text=Recebemos sua mensagem').waitFor();
  assert.equal(fs.estado.docs.size, 1, 'a avaliação não chegou');
  const d = [...fs.estado.docs.values()][0].dados;
  assert.equal(d.app, 'conta-facil'); assert.equal(d.versao, versao); assert.equal(d.nota.__int ?? d.nota, 5); assert.equal(d.tela, 'inicio');
  await a.fechar();
});

test('sincronização: histórico e cadastros passam de um aparelho para o outro', async () => {
  const gh = githubFalso();
  const A = await aparelho(amb, { github: gh }), B = await aparelho(amb, { github: gh });
  await salvarComanda(A.page, 'Cantina do Teste', ['Ana', 'Bruno'], { nome: 'Suco', qtd: 2, preco: 1290 });
  for (const x of [A, B]) {
    await x.page.click('[data-kf-nuvem]'); await x.page.click('.kf-dlg [data-kf="sync-ativar"]');
    await x.page.fill('#kf-token', TOKEN_TESTE); await x.page.click('[data-kf-conectar]');
    assert.ok(await esperar(() => x.page.evaluate(() => SY.ligada() && SY.estado.lastSync > 0)), 'não sincronizou');
  }
  const arq = gh.arquivo('conta-facil.json');
  assert.ok(arq && !/Cantina do Teste/.test(arq.conteudo), 'o gist deveria estar criptografado');
  assert.ok(await esperar(() => B.page.evaluate(() => bills.length === 1 && catalog.people.length === 2)), 'B não recebeu o histórico de A');
  await A.fechar(); await B.fechar();
});

test('comanda ao vivo: sem conexão o app avisa e a comanda continua só no aparelho', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await abrirMesa(p, 'Bar', ['Ana']);
  assert.ok(await esperar(() => p.evaluate(() => store.ready)));
  assert.equal(await p.locator('#live-start').count(), 0, 'sem Firebase, a oferta de comanda ao vivo não aparece');
  await p.evaluate(() => entrarAoVivo('abc')); assert.match(await p.textContent('.kf-toast'), /Código inválido/);
  await a.fechar();
});

test('guia: janela fixa num espaço só dela, do começo ao fim, sem tocar nos dados reais', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await salvarComanda(p, 'Cantina Real', ['Ana', 'Bruno'], { nome: 'Suco', qtd: 2, preco: 1290 });
  await p.evaluate(() => { window.__avisos = []; const w = console.warn; console.warn = (...x) => { window.__avisos.push(x.map(v => (v && v.message) || String(v)).join(' ')); w(...x); }; });
  await nav(p, 'mais'); await p.click('#ma-guia');
  await p.locator('#kf-gu-doca').waitFor();
  // a demonstração começa do zero na tela, e o que é de verdade continua guardado
  assert.deepEqual(await p.evaluate(() => [bills.length, catalog.people.length, JSON.parse(localStorage.getItem('contafacil.bills')).length, comReais(() => pacoteSync(true)).bills[0].place]), [0, 0, 1, 'Cantina Real']);
  // a janela fica entre o conteúdo e a barra de baixo, sem cobrir nenhum dos dois
  const g = await p.evaluate(() => { const r = q => document.querySelector(q).getBoundingClientRect(); const d = r('#kf-gu-doca'), n = r('.kf-nav.nav'); return { fundo: d.bottom, nav: n.top, navFundo: n.bottom, alt: innerHeight, moldura: document.querySelector('.kf-gu-m-tempo').getAttribute('d') }; });
  assert.ok(Math.abs(g.fundo - g.nav) <= 1, 'a janela do guia encosta na barra de baixo, sem cobrir');
  assert.ok(await p.evaluate(() => { const b = document.querySelector('.kf-nav-bola').getBoundingClientRect(), e = document.elementFromPoint(b.left + b.width / 2, b.top + 3); return !!e && !!e.closest('.kf-nav'); }), 'a faixa do guia não pode comer o botão do meio'); assert.ok(Math.abs(g.navFundo - g.alt) <= 1); assert.match(g.moldura, /^M/);
  // primeiro passo: pisca, a moldura esvazia (contagem) e só então o passo acontece
  assert.equal(await p.evaluate(() => KitFacil.guia.estado().fase), 'conta');
  assert.ok(await esperar(() => p.evaluate(() => { const o = +document.querySelector('.kf-gu-m-tempo').style.strokeDashoffset; return o < 0 && o > -1; })), 'a contagem na moldura não andou');
  assert.ok(await esperar(() => p.evaluate(() => KitFacil.guia.estado()?.i >= 2 && draft.people.length === 4), 60000), 'o guia não montou a mesa');
  // com uma janela aberta, ela termina acima da janela do guia
  assert.ok(await esperar(() => p.evaluate(() => { const d = document.querySelector('.kf-dlg'), g = document.querySelector('#kf-gu-doca'); return !!d && d.getBoundingClientRect().bottom <= g.getBoundingClientRect().top + 1; }), 30000), 'janela por baixo do guia');
  // o destaque é um anel solto, por cima de tudo: não pode ser cortado pela caixa em que o alvo está
  assert.deepEqual(await p.evaluate(() => { const a = document.querySelector('#kf-gu-anel'), s = getComputedStyle(a); return [s.position, a.parentElement === document.body]; }), ['fixed', true]);
  // voltar um passo refaz o passo inteiro, em qualquer ponto do guia; pulando, o guia chega ao fim sem tropeçar
  await p.click('#kf-gu-volta');
  assert.ok(await esperar(() => p.evaluate(() => KitFacil.guia.estado()?.fase === 'conta')));
  const fim = Date.now() + 400000, voltou = new Set();
  while (Date.now() < fim && await p.evaluate(() => !!KitFacil.guia.estado())) {
    const e = await p.evaluate(() => KitFacil.guia.estado());
    // ao chegar a cada passo, volta para o anterior (que é refeito do começo) e só então segue
    if (e && e.fase === 'conta' && e.i >= 1 && !voltou.has(e.i)) { voltou.add(e.i); await p.evaluate(() => KitFacil.guia.estado() && document.querySelector('#kf-gu-volta').click()); }
    else await p.evaluate(() => { const g = KitFacil.guia.estado(); if (g && !g.rapido && g.fase === 'conta') document.querySelector('#kf-gu-pula').click(); });
    await new Promise(r => setTimeout(r, 90));
  }
  assert.ok(voltou.size >= 30, 'o teste deveria ter voltado em todos os passos: ' + voltou.size);
  assert.equal(await p.evaluate(() => !!KitFacil.guia.estado()), false, 'o guia não chegou ao fim');
  assert.deepEqual(await p.evaluate(() => window.__avisos.filter(x => /guia/.test(x))), [], 'algum passo do guia falhou');
  assert.deepEqual(await p.evaluate(() => [bills.length, bills[0].place, catalog.people.length, tab, draft.active, semSalvar, !!dadosReais, !!jogo.flags.guia, JSON.parse(localStorage.getItem('contafacil.bills')).length, document.querySelectorAll('#kf-gu-doca, #kf-gu-escudo, #kf-gu-dedo, .festa, .kf-dlg').length]),
    [1, 'Cantina Real', 2, 'inicio', false, false, false, true, 1, 0]);
  // sair no meio (Esc) também devolve tudo
  await nav(p, 'mais'); await p.click('#ma-guia');
  assert.ok(await esperar(() => p.evaluate(() => KitFacil.guia.estado()?.i >= 1 && draft.active), 30000));
  await p.keyboard.press('Escape');
  assert.deepEqual(await p.evaluate(() => [!!KitFacil.guia.estado(), bills.length, bills[0].place, tab, draft.active]), [false, 1, 'Cantina Real', 'inicio', false]);
  semErros(a); await a.fechar();
});

test('barra de baixo colada ao pé da tela e baixa; quantidade e valor lado a lado; o papel sai da fenda', async () => {
  const a = await aparelho(amb, { viewport: { width: 393, height: 760 } });
  const p = a.page;
  const n = await p.evaluate(() => { const r = document.querySelector('.kf-nav.nav').getBoundingClientRect(), b = document.querySelector('.kf-nav-bola').getBoundingClientRect(); return { alt: r.height, fundo: innerHeight - r.bottom, topo: innerHeight - Math.min(r.top, b.top) }; });
  assert.ok(n.fundo <= 1 && n.alt <= 64 && n.topo <= 74, 'a barra de baixo está alta: ' + JSON.stringify(n));
  // a saída do papel começa dentro da fenda escura e fica por cima da borda de baixo da impressora
  const imp = await p.evaluate(() => { const b = document.querySelector('#view .imp-boca').getBoundingClientRect(), s = document.querySelector('#view .imp-saida'), r = s.getBoundingClientRect(); return { dentro: r.top > b.top + 8 && r.top < b.bottom - 8, z: +getComputedStyle(s).zIndex > +getComputedStyle(document.querySelector('#view .imp-boca')).zIndex, estreito: r.left > b.left + 12 && r.right < b.right - 12 }; });
  assert.deepEqual(imp, { dentro: true, z: true, estreito: true });
  await abrirMesa(p, 'Cantina do Teste', ['Ana', 'Bruno']);
  await p.click('#it-novo');
  const l = await p.evaluate(() => { const q = document.querySelector('#pr-qtd').closest('.field').getBoundingClientRect(), v = document.querySelector('#pr-preco').getBoundingClientRect(); return v.left > q.right && Math.abs(v.bottom - q.bottom) < 6; });
  assert.ok(l, 'quantidade e valor deveriam ficar lado a lado');
  semErros(a); await a.fechar();
});

test('ícones do alto na mesma cor; Mais sem repetições; presente em 3D que gira; nada de bebida alcoólica no app', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  const cores = await p.evaluate(() => [...document.querySelectorAll('#barra .kf-topo-btn > svg')].map(s => getComputedStyle(s).color + '|' + getComputedStyle(s).strokeWidth));
  assert.equal(cores.length, 3); assert.equal(new Set(cores).size, 1, 'os três ícones do alto têm a mesma cor e o mesmo traço: ' + cores.join(' '));
  await nav(p, 'mais');
  assert.deepEqual(await p.evaluate(() => [...document.querySelectorAll('#view .lin b')].map(b => b.textContent)), ['Cadastros', 'Sortear alguém da mesa', 'Ver o guia', 'Abrir a comanda de exemplo', 'Ajustes']);
  await p.click('#barra [data-kf-presente]');
  const o3d = p.locator('.kf-dlg .kf-o3d[data-o3d="presente"]'); await o3d.waitFor();
  const giro = () => p.evaluate(() => document.querySelector('.kf-dlg .kf-o3d').dataset.ang);
  await p.emulateMedia({ reducedMotion: 'reduce' }); await p.keyboard.press('Escape'); await p.click('#barra [data-kf-presente]'); await o3d.waitFor();
  await o3d.focus(); const g0 = await giro(); await p.keyboard.press('ArrowLeft');
  assert.notEqual(await giro(), g0);
  assert.equal(await p.locator('.kf-dlg .kf-dlg-pe button').count(), 1); assert.match(await p.textContent('.kf-dlg [data-kf-pix-codigo]'), /Copiar código Pix/);
  await p.keyboard.press('Escape');
  const proibidas = /chopp|cerveja|caipirinha|garrafa|boteco|vinho|cacha[çc]a|u[íi]sque|whisky|vodca|vodka|drinque|drink|bebida|rodada/i;
  for (const arq of ['app.js', 'jogo.js', 'telas.js', 'casca.js', 'index.html', 'manifest.webmanifest', 'estilo.css']) {
    const txt = await readFile(RAIZ + '/' + arq, 'utf8');
    const m = txt.match(proibidas); assert.equal(m, null, `${arq} ainda fala de "${m && m[0]}"`);
  }
  semErros(a); await a.fechar();
});

test('abrir e recolher: o título tocado fica à vista, uma linha aberta por vez, e tudo que abre tem movimento', async () => {
  const a = await aparelho(amb, { viewport: { width: 393, height: 700 } });
  const p = a.page;
  await p.evaluate(() => { newBillAt('Cantina do Teste', ['Ana', 'Bruno', 'Carla', 'Diego']); const d = draft, t = Object.fromEntries(d.people.map(x => [x.id, 1]));
    d.items = ['Fritas', 'Suco', 'Pudim', 'Café', 'Água', 'Torta'].map((n, i) => ({ id: newId(), o: i + 1, name: n, qty: 1, price: 1000 + i * 100, fq: 0, mode: 'equal', lk: true, a: { ...t } }));
    d.groups = [{ id: newId(), members: [d.people[0].id, d.people[1].id], payers: [d.people[0].id] }]; commit(); });
  const cab = () => p.evaluate(() => document.querySelector('.cu-cab').getBoundingClientRect().bottom);
  const topo = q => p.evaluate(q => document.querySelector(q).getBoundingClientRect().top, q);
  const itens = await p.evaluate(() => draft.items.map(i => i.id));
  // abre o primeiro pedido e depois o quinto (com o primeiro aberto acima dele): o título do quinto não sai do lugar
  await p.click(`[data-item="${itens[0]}"] .it-lin`); await p.waitForTimeout(700);
  await p.evaluate(q => document.querySelector(q).scrollIntoView({ block: 'center' }), `[data-item="${itens[4]}"] .it-lin`); await p.waitForTimeout(200);
  const y0 = await topo(`[data-item="${itens[4]}"] .it-lin`);
  await p.click(`[data-item="${itens[4]}"] .it-lin`); await p.waitForTimeout(1300);
  const y1 = await topo(`[data-item="${itens[4]}"] .it-lin`);
  assert.ok(y1 >= await cab(), 'o título do pedido aberto ficou coberto pelo cabeçalho'); assert.ok(y1 <= y0 + 2, 'o título deveria ficar onde estava (ou subir só o necessário)');
  assert.deepEqual(await p.evaluate(() => [...document.querySelectorAll('details.item-d')].filter(d => d.open).length), 1);
  // "Paga serviço" de um cupom compartilhado: abre crescendo e recolhe encolhendo
  await p.evaluate(() => scrollTo(0, 0));
  const grupo = await p.evaluate(() => compute(draft).units.find(u => u.members.length > 1).id);
  await p.click(`summary[data-unit="${grupo}"]`); await p.waitForTimeout(700);
  assert.ok(await topo(`summary[data-unit="${grupo}"]`) >= await cab(), 'o título do cupom aberto ficou coberto');
  await p.click('[data-pa-svcabre]');
  assert.ok(await p.evaluate(() => document.querySelector('.pa-sub').getAnimations().length > 0), 'a lista de Paga serviço deveria abrir com movimento');
  await p.waitForTimeout(400);
  await p.click('[data-pa-svcabre]');
  assert.equal(await p.locator('.kf-exp-fantasma').count(), 1, 'ao recolher, o trecho encolhe antes de sumir');
  assert.ok(await esperar(async () => await p.locator('.kf-exp-fantasma').count() === 0));
  // "Ver cupom" só nos atalhos da pessoa: não se repete em Editar nem no cupom compartilhado
  await p.click(`[data-pa="${grupo}"] [data-pa-mais]`); await p.locator('.kf-dlg').waitFor();
  assert.equal(await p.locator('.kf-dlg >> text=Ver cupom').count(), 0);
  await p.click('.kf-dlg [data-gs-p] >> nth=0'); await p.locator('#cs-nome').waitFor();
  assert.equal(await p.locator('.kf-dlg >> text=Ver cupom').count(), 0);
  await p.keyboard.press('Escape');
  assert.equal(await p.locator('#view >> text=Ver cupom >> visible=true').count(), 1);
  semErros(a); await a.fechar();
});

test('quem já pagou: o valor fica guardado e o app mostra falta ou troco quando a conta muda depois', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await p.evaluate(() => { newBillAt('Cantina do Teste', ['Ana', 'Bruno', 'Carla']); const d = draft, t = Object.fromEntries(d.people.map(x => [x.id, 1]));
    d.service.enabled = false;
    d.items = [{ id: newId(), o: 1, name: 'Fritas', qty: 1, price: 6000, fq: 0, mode: 'equal', lk: true, a: { ...t } }]; commit(); });
  const estado = () => p.evaluate(() => { const c = compute(draft), u = c.units[0], x = contaPaga(draft, u, c); return [x.estado, x.pago, x.falta, x.troco, faltaReceber(draft, c), trocoDevolver(draft, c)]; });
  const ana = await p.evaluate(() => draft.people[0].id);
  await p.click('#fechar-cmd'); await p.click('#fc-prox'); await p.click('.fc-slide[aria-hidden="false"] [data-fc-pago="marcar"]'); await p.click('#fc-volta');
  assert.deepEqual(await estado(), ['pago', 2000, 0, 0, 4000, 0]);
  await p.click(`summary[data-unit="${ana}"]`);
  assert.equal(await p.locator(`[data-pa="${ana}"] [data-pa-pago="desmarcar"]`).count(), 1, 'quem já está marcado pode ser desmarcado pela comanda');
  // 1) desconto depois do pagamento: a conta de Ana cai e o app manda devolver
  await p.click('#cm-pe'); await assentar(p); await p.locator('[data-cm="ds"]').click({ force: true });
  const campo = p.locator('.kf-dlg [data-kf-exp="cm-ds"] input[data-kf-dinheiro]'); await campo.click(); await campo.pressSequentially('900'); await p.keyboard.press('Tab');
  assert.match(await p.textContent('.kf-dlg .aviso-pago'), /Ana pagou R\$\s20,00 e a conta agora é R\$\s17,00: devolver R\$\s3,00/);
  await p.click('.kf-dlg [data-kf-fechar]');
  assert.deepEqual(await estado(), ['troco', 2000, 0, 300, 3400, 300]);
  assert.match(await p.textContent('#view .aviso-pago'), /devolver R\$\s3,00/); assert.match(await p.textContent('#cmd-conta + .cu-falta, .cu-falta'), /devolver/);
  // salvar com diferença: o app pergunta antes
  await p.evaluate(() => saveBill()); await p.locator('text=Salvar com diferença?').waitFor(); await p.keyboard.press('Escape');
  assert.equal(await p.evaluate(() => bills.length), 0);
  // acertar: "Devolvi" registra o valor novo
  await p.click('#view [data-ap-acerta]');
  assert.deepEqual(await estado(), ['pago', 1700, 0, 0, 3400, 0]); assert.equal(await p.locator('#view .aviso-pago:not(.kf-exp-fantasma)').count(), 0);
  // 2) item novo: quem já pagou fica de fora, com aviso; se marcar, volta a dever
  await p.click('#it-novo'); await p.fill('#pr-nome', 'Pudim'); await p.locator('#pr-preco').pressSequentially('1000');
  assert.deepEqual(await p.evaluate(() => [...document.querySelectorAll('[data-lc-ck]')].map(b => b.getAttribute('aria-pressed'))), ['false', 'true', 'true']);
  assert.match(await p.textContent('#lc-pagou'), /Ana já pagou e ficou de fora/);
  await p.click(`[data-lc-ck="${ana}"]`); assert.match(await p.textContent('#lc-pagou'), /volta a dever/);
  await p.click('#lc-ok'); await p.locator('.kf-ov').waitFor({ state: 'detached' });
  const e2 = await estado(); assert.equal(e2[0], 'falta'); assert.ok(e2[2] > 0 && e2[2] === e2[4] - (await p.evaluate(() => { const c = compute(draft); return c.units[1].total + c.units[2].total; })));
  assert.match(await p.textContent(`summary[data-unit="${ana}"]`), /pagou 17,00 · falta/);
  await p.click(`[data-pa="${ana}"] [data-pa-pago="acertar"]`);
  assert.equal((await estado())[0], 'pago');
  // 3) pessoa nova num item "entre todos": a parte de quem pagou cai e vira troco
  await p.evaluate(() => { addPessoa('Diego'); });
  assert.equal((await estado())[0], 'troco');
  // 4) registros antigos (só "pago", sem valor) passam a guardar o valor
  await p.evaluate(() => { draft.pagos = { [draft.people[1].id]: true }; commit(); });
  assert.equal(await p.evaluate(() => typeof draft.pagos[draft.people[1].id].v), 'number');
  // 5) remover quem já pagou: o aviso fala do pagamento
  await p.evaluate(() => removerPessoa(draft.people[1].id)); assert.match(await p.textContent('.kf-dlg'), /já pagou/); await p.keyboard.press('Escape');
  semErros(a); await a.fechar();
});

test('Início: excluir a comanda em andamento; nomes na mesa sem perder o foco; escurecido de tela cheia', async () => {
  const a = await aparelho(amb, { toque: true });
  const p = a.page;
  await p.fill('#ini-local', 'Cantina do Teste'); await p.click('#ini-form button[type=submit]');
  await p.click('#add-pessoa');
  // nenhuma janela abre com a caixa de texto selecionada: o foco vai para a janela, e o teclado só sobe quando a pessoa toca no campo
  await p.waitForTimeout(700);
  assert.deepEqual(await p.evaluate(() => [document.activeElement.classList.contains('kf-dlg'), !!document.querySelector('.kf-dlg [autofocus]:is(input, textarea)'), !!document.querySelector('.kf-dlg > .kf-dlg-pe')]), [true, false, false], 'a janela abre sem campo selecionado e sem o botão Pronto');
  await p.click('#pn-nome');
  for (const n of ['Ana', 'Bruno']) { await p.keyboard.type(n); await p.keyboard.press('Enter'); assert.equal(await p.evaluate(() => document.activeElement.id), 'pn-nome', 'o foco fica no campo entre um nome e outro'); }
  assert.equal(await p.evaluate(() => draft.people.length), 2);
  const esc = await p.evaluate(() => { const s = getComputedStyle(document.querySelector('.kf-ov'), '::before'); return [s.position, parseFloat(s.top) < 0, s.backgroundColor !== 'rgba(0, 0, 0, 0)']; });
  assert.deepEqual(esc, ['fixed', true, true]);
  await p.click('.kf-dlg [data-kf-fechar]');
  await nav(p, 'inicio');
  await p.click('#ini-excluir'); await p.locator('text=Excluir esta comanda?').waitFor(); await p.click('.kf-dlg [data-kf-ok]');
  assert.equal(await p.evaluate(() => draft.active), false);
  await p.locator('.kf-toast button').click(); // Desfazer
  assert.equal(await p.evaluate(() => draft.active && draft.people.length), 2);
  await a.fechar();
});

test('objetos 3D voltam a girar sozinhos depois que a pessoa para de mexer', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await p.evaluate(() => tampaSheet(TAMPINHAS[0]));
  const o3d = p.locator('.kf-dlg .kf-o3d'); await o3d.waitFor();
  const ang = () => p.evaluate(() => +document.querySelector('.kf-dlg .kf-o3d').dataset.ang);
  await o3d.focus(); await p.keyboard.press('ArrowRight');
  const a0 = await ang(); await new Promise(r => setTimeout(r, 500));
  assert.equal(await ang(), a0, 'logo depois de mexer, o objeto fica onde a pessoa deixou');
  await new Promise(r => setTimeout(r, 2200));
  assert.ok(await ang() > a0 + 0.2, 'depois de um instante parado, o objeto deveria voltar a girar, no mesmo sentido');
  // o laço do presente não atravessa a caixa: as pontas ficam deitadas sobre a tampa, sem passar da beirada
  assert.ok(await p.evaluate(() => { const M = KitFacil.jogo._malhaPresente(document.documentElement).M; let ok = true; for (let i = 0; i < M.p.length; i += 3) { const x = M.p[i], y = M.p[i + 1], z = M.p[i + 2], fita = M.c[i] > 0.8 && M.m[(i / 3) * 4 + 2] > 0.2; if (fita && y > 0.36 && (Math.abs(x) > 0.56 || Math.abs(z) > 0.56)) ok = false; } return ok; }), 'há fita passando da beirada da tampa');
  semErros(a); await a.fechar();
});

test('1.7.0: tudo o que abre e fecha dura 600 ms, na mesma curva; nenhuma janela abre com a caixa de texto selecionada', async () => {
  const a = await aparelho(amb, { toque: true });
  const p = a.page;
  const CURVA = 'cubic-bezier(0.45, 0, 0.2, 1)';
  const anims = sel => p.evaluate(sel => { const e = document.querySelector(sel); return e ? e.getAnimations().map(x => { const t = x.effect.getTiming(); return [t.duration, String(t.easing)]; }) : null; }, sel);
  const semCampo = () => p.evaluate(() => { const f = document.activeElement; return !(f && f.matches('input:not([type=checkbox]):not([type=radio]), textarea, select')); });
  assert.deepEqual(await p.evaluate(() => [MOVE.ms, MOVE.css, getComputedStyle(document.documentElement).getPropertyValue('--kf-ms').trim(), getComputedStyle(document.documentElement).getPropertyValue('--kf-curva').trim()]), [600, 'cubic-bezier(0.45,0,0.2,1)', '600ms', 'cubic-bezier(.45,0,.2,1)'], 'um relógio só, igual no código e no CSS');
  // janela da Início (nova comanda), do nome do local, das pessoas, do item e da conta: nenhuma abre com o campo selecionado
  await p.fill('#ini-local', 'Cantina do Teste'); await p.click('#ini-form button[type=submit]');
  await p.locator('#add-pessoa').waitFor();
  for (const abre of ['pessoaNovaSheet', 'localSheet', 'produtoSheet', 'contaSheet']) {
    await p.evaluate(f => window[f] ? window[f]() : eval(f + '()'), abre);
    await p.locator('.kf-dlg').waitFor();
    // nascer: 600 ms, na curva do app
    const n = await anims('.kf-dlg');
    assert.ok(n.length && n.every(x => x[0] === 600 && x[1] === CURVA), `${abre}: a janela nasce em 600 ms (${JSON.stringify(n)})`);
    assert.equal(await p.evaluate(() => getComputedStyle(document.querySelector('.kf-ov'), '::before').animationDuration), '0.6s', `${abre}: o fundo escurece em 600 ms`);
    await assentar(p);
    assert.ok(await semCampo(), `${abre}: abre sem caixa de texto selecionada`);
    // sair: a cópia que desce também leva 600 ms
    await p.click('.kf-dlg [data-kf-fechar]');
    const s = await anims('#kf-saidas .kf-dlg-x');
    assert.ok(s && s.length === 1 && s[0][0] === 600 && s[0][1] === CURVA, `${abre}: a janela sai em 600 ms (${JSON.stringify(s)})`);
    assert.equal(await p.evaluate(() => getComputedStyle(document.querySelector('#kf-saidas .kf-ov'), '::before').animationDuration), '0.6s');
    await p.waitForFunction(() => !document.querySelector('#kf-saidas > *, #kf-saidas > .kf-ov'));
  }
  // Quem está na mesa: sem "Pronto"; o botão Adicionar fica alinhado ao campo, com a lista de sugestões abaixo da linha
  await p.evaluate(() => { catalog.people = [{ id: 'x1', name: 'Rosana' }, { id: 'x2', name: 'Mateus' }]; });
  await p.click('#add-pessoa'); await assentar(p);
  assert.equal(await p.locator('.kf-dlg > .kf-dlg-pe').count(), 0, 'sem botão Pronto: o X fecha');
  await p.click('#pn-nome');
  // no celular a lista espera o teclado assentar; aqui o teclado não vem, e ela abre logo depois
  await p.waitForFunction(() => !document.querySelector('.kf-sg-lista').hidden);
  const lista = await p.evaluate(() => document.querySelector('.kf-sg-lista').getAnimations().map(x => x.effect.getTiming().duration));
  assert.deepEqual(lista, [600], 'a lista de sugestões abre em 600 ms');
  await p.waitForFunction(() => !document.querySelector('.kf-sg-lista').getAnimations().length);
  const al = await p.evaluate(() => { const r = q => document.querySelector(q).getBoundingClientRect(), i = r('#pn-nome'), b = r('#pn-add'), l = r('.kf-sg-lista'); return { topo: Math.abs(i.top - b.top), base: Math.abs(i.bottom - b.bottom), listaAbaixo: l.top >= i.bottom && l.top >= b.bottom, larg: Math.round(l.width) > Math.round(i.width) }; });
  assert.ok(al.topo <= 1 && al.base <= 1 && al.listaAbaixo && al.larg, `Adicionar alinhado ao campo, lista abaixo da linha (${JSON.stringify(al)})`);
  await p.keyboard.type('Ana'); await p.keyboard.press('Enter'); await p.keyboard.type('Bruno'); await p.keyboard.press('Enter');
  await p.click('.kf-dlg [data-kf-fechar]'); await p.waitForFunction(() => !document.querySelector('.kf-dlg'));
  // linha que abre e recolhe, troca de tela e aviso: o mesmo relógio
  await p.click('summary[data-unit]');
  const lin = await p.evaluate(() => document.querySelector('details:has(> summary[data-unit])').getAnimations().map(x => x.effect.getTiming().duration));
  assert.ok(lin.length && lin.every(x => x === 600), `a linha abre em 600 ms (${lin})`);
  await p.evaluate(() => irPara('historico'));
  assert.deepEqual((await anims('#view')).map(x => x[0]), [600], 'a tela troca em 600 ms');
  await p.evaluate(() => KitFacil.avisar('Teste.'));
  assert.equal(await p.evaluate(() => getComputedStyle(document.querySelector('.kf-toast')).animationDuration), '0.6s', 'o aviso aparece em 600 ms');
});

test('janelas: nascem e acompanham o teclado num movimento só, sem saltar nem voltar; no guia ficam paradas; tampinha da Início centrada', async () => {
  const a = await aparelho(amb, { toque: true });
  const p = a.page;
  // Início: a próxima tampinha fica centrada com o texto dela
  const [cy, ty] = await p.evaluate(() => { const r = x => { const b = document.querySelector(x).getBoundingClientRect(); return b.top + b.height / 2; }; return [r('.nivel-prox .tampa-svg'), r('.nivel-prox > span:last-child')]; });
  assert.ok(Math.abs(cy - ty) <= 1.5, `tampinha e texto com o mesmo centro (${cy} e ${ty})`);
  await p.fill('#ini-local', 'Cantina do Teste'); await p.click('#ini-form button[type=submit]');
  const H = await p.evaluate(() => innerHeight);
  const caixa = () => p.evaluate(() => { const d = [...document.querySelectorAll('.kf-dlg')].find(x => !x.closest('#kf-saidas')), r = d.getBoundingClientRect(), f = getComputedStyle(d, '::after'); return { topo: Math.round(r.top), base: Math.round(r.bottom), pe: getComputedStyle(d).paddingBottom, cont: f.content !== 'none' && parseFloat(f.height) > 300 && f.backgroundColor === getComputedStyle(d).backgroundColor }; });
  // filma o topo da janela quadro a quadro durante uma ação e conta as vezes em que ela foi e voltou
  const filmar = async (acao, ms = 800) => {
    await p.evaluate(() => { window.__q = []; window.__on = true; const f = () => { const d = [...document.querySelectorAll('.kf-dlg')].find(x => !x.closest('#kf-saidas')); if (d) __q.push(d.getBoundingClientRect().top); if (__on) requestAnimationFrame(f); }; requestAnimationFrame(f); });
    await acao(); await p.waitForTimeout(ms);
    return p.evaluate(() => { __on = false; let inv = 0; for (let i = 2; i < __q.length; i++) { const x = __q[i - 1] - __q[i - 2], y = __q[i] - __q[i - 1]; if (x * y < -1) inv++; } return { inv, de: Math.round(__q[0]), n: __q.length }; });
  };
  // a janela de pôr pessoas nasce já com o campo em foco: o teclado sobe junto, e ela faz um caminho só até ficar em cima dele
  let f = await filmar(async () => { await p.tap('#add-pessoa'); await p.waitForTimeout(40); await teclado(p, true); });
  assert.equal(f.inv, 0, 'a janela nasce e sobe sem ir e voltar'); assert.ok(f.de >= H - 40, `a janela nasce abaixo da tela (${f.de})`);
  let c = await caixa(); assert.equal(c.base, H - TECLADO, 'a janela termina encostada no teclado'); assert.ok(c.topo >= 0); assert.ok(c.cont, 'a cor da janela continua por trás do teclado'); assert.equal(c.pe, '0px');
  assert.ok(await p.evaluate(() => document.documentElement.classList.contains('kf-tk')));
  for (const n of ['Ana', 'Bruno', 'Carla']) { await p.fill('#pn-nome', n); await p.press('#pn-nome', 'Enter'); }
  f = await filmar(async () => { await p.evaluate(() => document.activeElement.blur()); await p.waitForTimeout(30); await teclado(p, false); });
  assert.equal(f.inv, 0, 'ao fechar o teclado, a janela desce de uma vez'); c = await caixa(); assert.equal(c.base, H);
  await p.click('.kf-dlg [data-kf-fechar]');
  // janela alta com o teclado: cabe inteira acima dele
  await p.click('#it-novo'); await p.locator('.kf-dlg input[data-kf-dinheiro]').first().waitFor(); await assentar(p);
  f = await filmar(async () => { await p.tap('#pr-nome'); await p.waitForTimeout(40); await teclado(p, true); });
  assert.equal(f.inv, 0, 'com o teclado, a janela alta encolhe e sobe sem ir e voltar');
  c = await caixa(); assert.equal(c.base, H - TECLADO); assert.ok(c.topo >= 0, `o título não sobe para fora da tela (topo ${c.topo})`);
  await p.evaluate(() => document.activeElement.blur()); await teclado(p, false); await p.waitForTimeout(500);
  // uma janela no lugar de outra: sem nascer de novo lá de baixo
  f = await filmar(async () => { await p.evaluate(() => confirmSheet('Trocar?', 'Uma janela no lugar da outra.', 'Sim', () => {})); }, 600);
  assert.ok(f.de < H - 100, `a janela que troca de lugar com outra não nasce abaixo da tela (${f.de})`);
  await p.evaluate(() => closeSheet(true));
  // no guia: ligar e desligar o "teclado" não mexe na janela, que fica acima da janela do guia
  await p.evaluate(() => guiaIniciar());
  await esperar(() => p.evaluate(() => KitFacil.guia.estado()?.i === 1 && !!document.querySelector('#pn-nome')), 30000);
  await p.evaluate(() => { if (!KitFacil.guia.estado().pausado) document.querySelector('#kf-gu-pausa').click(); }); await assentar(p);
  const livre = await caixa();
  await p.evaluate(() => document.documentElement.classList.add('kf-teclado')); await teclado(p, true); await p.waitForTimeout(500); const comT = await caixa();
  await p.evaluate(() => document.documentElement.classList.remove('kf-teclado')); await teclado(p, false);
  assert.deepEqual([comT.topo, comT.base, comT.pe], [livre.topo, livre.base, livre.pe], 'a janela do guia fica no mesmo lugar');
  assert.equal(livre.base, await p.evaluate(() => Math.round(document.querySelector('#kf-gu-doca').getBoundingClientRect().top)), 'e termina onde começa a janela do guia');
  await p.evaluate(() => KitFacil.guia.pararDemonstracao());
  semErros(a); await a.fechar();
});

test('1.4.0: Editar só muda o nome ou tira da mesa; paga por todos e outro valor ficam em Fechar, sem juntar cupons; excluir abaixo de Fechar', async () => {
  const a = await aparelho(amb, { toque: true });
  const p = a.page;
  await abrirMesa(p, 'Bar', ['Ana', 'Bruno', 'Carla']);
  await lancar(p, 'Pizza', 9000);
  const [ana, bruno] = await p.evaluate(() => draft.people.map(x => x.id));
  // Editar: só o nome e Remover da mesa
  await p.click(`[data-unit="${ana}"]`); await p.click(`[data-pa="${ana}"] [data-pa-mais]`); await p.locator('#cs-nome').waitFor();
  assert.equal(await p.locator('.kf-dlg input, .kf-dlg .kf-chave').count(), 1, 'a janela só tem o campo do nome');
  assert.deepEqual(await p.locator('.kf-dlg button:not(.kf-fechar)').allTextContents().then(x => x.map(s => s.trim())), ['Remover da mesa', 'Salvar']);
  await p.fill('#cs-nome', 'Aninha'); await p.click('#cs-ok');
  assert.equal(await p.evaluate(() => draft.people[0].name), 'Aninha');
  // Conta da mesa: sem "paga por todos" e sem excluir; as chaves abrem e fecham sem a janela tremer
  await p.click('#cm-pe'); await p.locator('.kf-dlg [data-cm="svc"]').waitFor(); await p.waitForTimeout(500);
  assert.equal(await p.locator('.kf-dlg [data-cm-todos], .kf-dlg #cm-limpar, .kf-dlg >> text=/xcluir/').count(), 0);
  const tremor = async sel => {
    await p.evaluate(() => { window.__q = []; window.__on = true; const f = () => { const d = [...document.querySelectorAll('.kf-dlg')].find(x => !x.closest('#kf-saidas')); if (d) __q.push(d.getBoundingClientRect().top); if (__on) requestAnimationFrame(f); }; requestAnimationFrame(f); });
    await p.tap(sel); await p.waitForTimeout(900);
    return p.evaluate(() => { __on = false; let inv = 0; for (let i = 2; i < __q.length; i++) { const x = __q[i - 1] - __q[i - 2], y = __q[i] - __q[i - 1]; if (x * y < -1) inv++; } return inv; });
  };
  for (const k of ['cv', 'ds', 'ds', 'svc', 'svc', 'cv']) assert.equal(await tremor(`.kf-dlg label:has([data-cm="${k}"]) .kf-chave`), 0, `a janela não vai e volta ao tocar na chave ${k}`);
  // valor digitado: ao sair do campo, o app não fica preso no modo "teclado aberto" nem com a barra do OK na tela
  const modo = () => p.evaluate(() => [document.documentElement.classList.contains('kf-teclado'), document.querySelectorAll('.ok-teclado').length, document.activeElement.id || document.activeElement.tagName]);
  await p.tap('.kf-dlg label:has([data-cm="cv"]) .kf-chave'); await p.waitForTimeout(500);
  await p.tap('#cm-cv'); await p.waitForTimeout(250); assert.deepEqual(await modo(), [true, 0, 'cm-cv'], 'não há mais barra própria de OK: o teclado do aparelho já tem a tecla de concluir');
  await p.keyboard.type('700'); await p.evaluate(() => document.activeElement.blur()); await p.waitForTimeout(500);
  assert.deepEqual(await modo(), [false, 0, 'BODY']); assert.equal(await p.evaluate(() => draft.couvert.value), 700);
  await p.tap('#cm-cv'); await p.waitForTimeout(250); await p.keyboard.type('900'); await p.keyboard.press('Enter'); await p.waitForTimeout(500);
  assert.deepEqual(await modo(), [false, 0, 'BODY']); assert.equal(await p.evaluate(() => draft.couvert.value), 900);
  // de um campo direto para outro: o segundo continua com o foco depois que a janela é refeita
  await p.tap('#cm-cv'); await p.waitForTimeout(250); await p.keyboard.type('1100'); await p.tap('#cm-svc-pct'); await p.waitForTimeout(500);
  assert.deepEqual(await modo(), [true, 0, 'cm-svc-pct']); assert.equal(await p.evaluate(() => draft.couvert.value), 1100);
  await p.evaluate(() => document.activeElement.blur()); await p.waitForTimeout(450);
  await p.tap('.kf-dlg label:has([data-cm="cv"]) .kf-chave'); await p.waitForTimeout(400);
  await p.click('.kf-dlg [data-kf-fechar]');
  // Excluir comanda fica logo abaixo de Fechar comanda
  assert.equal(await p.evaluate(() => document.querySelector('#fechar-cmd').nextElementSibling?.id), 'cmd-excluir');
  // Fechar: uma pessoa paga a conta de todos, e cada um continua com o seu cupom
  const AQUI = '.fc-slide[aria-hidden="false"]';
  await p.click('#fechar-cmd'); await p.click(`${AQUI} [data-fc-todos]`); await p.click(`${AQUI} [data-fc-quem="${bruno}"]`);
  const s1 = await p.evaluate(([ana, bruno]) => { const c = compute(draft); return { cupons: c.units.length, payer: c.payer, anaPaga: c.per[ana].paid, brunoPaga: c.per[bruno].paid, total: c.total, deve: c.transfers.filter(x => x.to === bruno).length }; }, [ana, bruno]);
  assert.deepEqual(s1, { cupons: 3, payer: bruno, anaPaga: 0, brunoPaga: s1.total, total: s1.total, deve: 2 });
  assert.match(await p.textContent(`${AQUI} .cupom-1`), /Bruno paga a conta/);
  await p.click('#fc-prox'); await p.waitForTimeout(500);
  assert.match(await p.textContent(`${AQUI} .cupom-1`), /Paga para Bruno/);
  await p.click('#fc-ant'); await p.waitForTimeout(500); await p.click(`${AQUI} [data-fc-cada]`);
  assert.equal(await p.evaluate(() => compute(draft).payer), '');
  // pagar outro valor, no cupom da pessoa
  await p.click('#fc-prox'); await p.waitForTimeout(500);
  await p.click(`${AQUI} [data-fc-valor]`); await p.locator(`${AQUI} [data-fc-custom]`).fill('1000'); await p.locator(`${AQUI} [data-fc-custom]`).blur();
  assert.equal(await p.evaluate(ana => draft.custom[ana], ana), 1000);
  assert.match(await p.textContent(`${AQUI} .cupom-1`), /Paga ao local\s*R\$\s10,00/);
  await p.click(`${AQUI} [data-fc-conta]`);
  assert.equal(await p.evaluate(ana => ana in draft.custom, ana), false);
  await p.click('#fc-volta');
  // iPhone: o toque num campo de uma janela dá o foco sem o Safari empurrar a tela (o campo volta ao lugar no quadro seguinte)
  await p.evaluate(() => { window.KF_TESTE_IOS = true; });
  await p.click('#add-pessoa'); await p.locator('#pn-nome').waitFor(); await p.evaluate(() => document.activeElement.blur());
  await p.tap('#pn-nome'); await p.waitForTimeout(120);
  assert.deepEqual(await p.evaluate(() => [document.activeElement.id, document.querySelector('#pn-nome').style.transform]), ['pn-nome', '']);
  await p.evaluate(() => { window.KF_TESTE_IOS = false; closeSheet(true); });
  // excluir pela comanda
  await p.click('#cmd-excluir'); await p.locator('text=Excluir esta comanda?').waitFor(); await p.click('.kf-dlg [data-kf-ok]');
  assert.equal(await p.evaluate(() => draft.active), false);
  semErros(a); await a.fechar();
});

test('1.6.0: quem cobre a diferença, quem já saiu da mesa, botões de Fechar com a mesma largura, Excluir vermelho e o nome nos Ajustes', async () => {
  const a = await aparelho(amb, { toque: true });
  const p = a.page;
  await abrirMesa(p, 'Bar', ['Ana', 'Bruno', 'Carla']);
  await lancar(p, 'Pizza', 9000); // 30,00 de cada um; com 10% de serviço, 33,00
  const [ana, bruno, carla] = await p.evaluate(() => draft.people.map(x => x.id));
  const pagam = () => p.evaluate(() => { const c = compute(draft); return [draft.people.map(x => c.per[x.id].paid), c.transfers.map(t => [c.per[t.from].person.name, c.per[t.to].person.name, t.value])]; });
  // Excluir comanda: mesma largura de Fechar comanda, em vermelho
  const [lf, le, cor] = await p.evaluate(() => { const f = document.querySelector('#fechar-cmd'), e = document.querySelector('#cmd-excluir'), s = getComputedStyle(e).backgroundColor.match(/\d+/g).map(Number); return [Math.round(f.getBoundingClientRect().width), Math.round(e.getBoundingClientRect().width), s]; });
  assert.equal(le, lf, 'Excluir tem a largura de Fechar'); assert.ok(cor[0] > 150 && cor[0] > cor[1] * 1.8 && cor[0] > cor[2] * 1.8, `Excluir é vermelho (${cor})`);
  const AQUI = '.fc-slide[aria-hidden="false"]';
  await p.click('#fechar-cmd'); await assentar(p);
  // todos os botões embaixo do cupom têm a mesma largura (a de Copiar e PDF juntos), também no cupom da mesa
  const larguras = () => p.evaluate(q => { const s = document.querySelector(q), w = e => Math.round(e.getBoundingClientRect().width), ac = s.querySelector('.fc-acoes'); return [w(ac), ...[...s.querySelectorAll('.fc-extra > * > .btn, .fc-extra .fc-todos > .btn')].map(w)]; }, AQUI);
  let L = await larguras(); assert.ok(L.length >= 2 && L.every(x => Math.abs(x - L[0]) <= 1), `no cupom da mesa: ${L}`);
  await p.click('#fc-prox'); await p.waitForTimeout(500);
  L = await larguras(); assert.ok(L.length === 3 && L.every(x => Math.abs(x - L[0]) <= 1), `no cupom da pessoa: ${L}`);
  // Ana paga menos: os outros dividem (padrão) ou uma pessoa cobre
  await p.click(`${AQUI} [data-fc-valor]`); await p.locator(`${AQUI} [data-fc-custom]`).fill('2000'); await p.locator(`${AQUI} [data-fc-custom]`).blur(); await p.waitForTimeout(300);
  assert.match(await p.textContent(`${AQUI} .fc-cobre-t`), /Quem cobre\s*R\$\s13,00/);
  assert.deepEqual((await pagam())[0], [2000, 3950, 3950]);
  await p.click(`${AQUI} [data-fc-cobre="${bruno}"]`);
  assert.deepEqual(await pagam(), [[2000, 4600, 3300], [['Ana', 'Bruno', 1300]]]);
  // Ana paga mais: alguém devolve o excedente (paga menos ao local e acerta com ela)
  await p.locator(`${AQUI} [data-fc-custom]`).fill('4000'); await p.locator(`${AQUI} [data-fc-custom]`).blur(); await p.waitForTimeout(300);
  assert.match(await p.textContent(`${AQUI} .fc-cobre-t`), /Quem devolve\s*R\$\s7,00/);
  await p.click(`${AQUI} [data-fc-cobre="${carla}"]`);
  assert.deepEqual(await pagam(), [[4000, 3300, 2600], [['Carla', 'Ana', 700]]]);
  // com o teclado aberto, Voltar e Salvar não sobem junto; a janela, o campo e o rodapé fazem um caminho só, sem ir e voltar,
  // e no fim não sobra nada do movimento (capa, animações, estilo no rodapé)
  const filmar = async acao => {
    await p.evaluate(sel => { window.__q = []; window.__on = true; const f = () => { const d = [...document.querySelectorAll('.kf-dlg')].find(x => !x.closest('#kf-saidas')), c = document.querySelector(sel); if (d && c) __q.push([d.getBoundingClientRect().top, c.getBoundingClientRect().top]); if (__on) requestAnimationFrame(f); }; requestAnimationFrame(f); }, `${AQUI} [data-fc-custom]`);
    await acao(); await p.waitForTimeout(700);
    return p.evaluate(() => { __on = false; const inv = k => { let n = 0; for (let i = 2; i < __q.length; i++) { const x = __q[i - 1][k] - __q[i - 2][k], y = __q[i][k] - __q[i - 1][k]; if (x * y < -1) n++; } return n; };
      const d = document.querySelector('.kf-dlg'), pe = d.querySelector(':scope > .kf-dlg-pe'), u = __q[__q.length - 1];
      return { janela: inv(0), campo: inv(1), topo: [Math.round(__q[0][0]), Math.round(u[0])], campoFim: Math.round(u[1]), sobra: d.querySelectorAll(':scope > div[aria-hidden]').length + d.getAnimations({ subtree: true }).length, pe: pe.style.cssText, peAlt: Math.round(pe.getBoundingClientRect().height), tk: getComputedStyle(document.documentElement).getPropertyValue('--kf-tk').trim(), alt: innerHeight }; });
  };
  let fk = await filmar(async () => { await p.tap(`${AQUI} [data-fc-custom]`); await p.waitForTimeout(40); await teclado(p, true); });
  assert.deepEqual([fk.janela, fk.campo, fk.sobra, fk.pe, fk.tk], [0, 0, 0, '', TECLADO + 'px'], 'ao abrir o teclado, a janela e o campo sobem num movimento só');
  assert.ok(fk.topo[1] <= fk.topo[0] && fk.topo[1] >= 0, `a janela não sai da tela (${fk.topo})`);
  assert.ok(fk.campoFim > 60 && fk.campoFim < fk.alt - TECLADO - 30, `o campo fica à vista, acima do teclado (${fk.campoFim})`);
  assert.equal(fk.peAlt, 0, 'o rodapé se recolhe enquanto o teclado está aberto');
  fk = await filmar(async () => { await p.evaluate(() => document.activeElement.blur()); await p.waitForTimeout(30); await teclado(p, false); });
  assert.deepEqual([fk.janela, fk.campo, fk.sobra, fk.pe, fk.tk], [0, 0, 0, '', '0px'], 'ao fechar o teclado, a janela e o campo descem num movimento só');
  assert.ok(fk.peAlt > 40, 'e o rodapé volta');
  await p.click(`${AQUI} [data-fc-conta]`);
  assert.deepEqual(await p.evaluate(() => [Object.keys(draft.custom).length, Object.keys(draft.cover).length]), [0, 0]);
  // Bruno paga e vai embora: o cupom dele trava
  await p.click('#fc-prox'); await p.waitForTimeout(500);
  await p.click(`${AQUI} [data-fc-pago="marcar"]`); await p.click(`${AQUI} .fc-saiu .kf-chave`);
  assert.equal(await p.evaluate(b => !!draft.saiu[b], bruno), true);
  await p.click('#fc-volta'); await p.waitForTimeout(400);
  assert.match(await p.textContent(`summary[data-unit="${bruno}"]`), /saiu da mesa/);
  await p.click(`summary[data-unit="${bruno}"]`); await p.waitForTimeout(500);
  assert.deepEqual(await p.locator(`[data-pa="${bruno}"] button`).allTextContents().then(x => x.map(s => s.trim())), ['Ver cupom'], 'quem saiu só tem o cupom');
  // item novo: Bruno aparece travado e fica de fora; "entre todos" vale para quem está na mesa
  await p.click('#it-novo'); await p.locator('#pr-nome').waitFor(); await assentar(p);
  assert.ok(await p.locator(`[data-lc-ck="${bruno}"]`).isDisabled()); assert.equal(await p.getAttribute(`[data-lc-ck="${bruno}"]`, 'aria-pressed'), 'false');
  await p.fill('#pr-nome', 'Suco'); await p.fill('#pr-preco', '600'); await p.locator('#pr-preco').blur(); await p.click('#lc-ok'); await p.waitForTimeout(500);
  const suco = await p.evaluate(() => { const it = draft.items.find(i => i.name === 'Suco'); return [Object.keys(it.a).length, !!it.auto]; });
  assert.deepEqual(suco, [2, true]);
  // chega mais alguém: entra nos itens de todos; a conta de quem já pagou muda, e outra pessoa pode ficar com a diferença
  await p.evaluate(() => addPessoa('Davi')); await p.waitForTimeout(400);
  assert.deepEqual(await p.evaluate(() => draft.items.map(i => Object.keys(i.a).length)), [4, 3]);
  await p.locator('#view .aviso-pago [data-ap-cobre]').waitFor();
  assert.match(await p.textContent('#view .aviso-pago'), /Bruno pagou R\$\s33,00 e a conta agora é R\$\s24,75/);
  await p.click('#view .aviso-pago [data-ap-cobre]'); await assentar(p);
  assert.match(await p.textContent('#fc-cont'), /Bruno/);
  await p.click(`${AQUI} [data-fc-difcobre=""]`); await p.waitForTimeout(300);
  const fim = await p.evaluate(b => { const c = compute(draft); return [contaPaga(draft, c.U[b], c).estado, draft.custom[b], c.per[b].paid, c.transfers.filter(t => t.to === b).reduce((s, t) => s + t.value, 0)]; }, bruno);
  assert.deepEqual(fim, ['pago', 3300, 3300, 825], 'o que Bruno pagou vale; os outros pagam menos ao local e devolvem a diferença a ele');
  await p.click('#fc-volta');
  // Ajustes: o nome se escreve, mesmo sem ter passado pela apresentação
  await nav(p, 'mais'); await p.click('#view [data-kf="ajustes"]'); await p.click('#view [data-kf-aj-ir="conta"]');
  await p.fill('#aj-me', 'Bruno'); await p.press('#aj-me', 'Enter');
  assert.equal(await p.evaluate(() => catalog.me), 'Bruno');
  semErros(a); await a.fechar();
});

test('1.8.1: caixa de texto nunca é selecionada sozinha (turma na mesa, campo que falta, outro valor, código ao vivo)', async () => {
  const a = await aparelho(amb, { toque: true });
  const p = a.page;
  const campo = () => p.evaluate(() => { const f = document.activeElement; return !!(f && f.matches('input:not([type=checkbox]):not([type=radio]), textarea')) && (f.id || f.name || 'campo'); });
  // Início sem nome: o campo é apontado, não selecionado
  await p.click('#ini-form button[type=submit]');
  assert.equal(await campo(), false, 'local em branco: o campo não é selecionado');
  assert.equal(await p.getAttribute('#ini-local', 'aria-invalid'), 'true', 'o campo que falta fica apontado');
  // comanda ao vivo: abrir o trecho do código não seleciona o campo
  if (await p.locator('#av-abre').count()) { await p.click('#av-abre'); await p.waitForTimeout(200); assert.equal(await campo(), false, 'código da comanda ao vivo: não é selecionado'); }
  await p.evaluate(() => { catalog.groups = [{ id: 'g1', name: 'Pombo', members: ['Bruno', 'Letícia', 'Mateus', 'Rosana'] }]; store.saveCatalog(); });
  await p.fill('#ini-local', 'Cantina do Teste'); await p.click('#ini-form button[type=submit]');
  await p.click('#add-pessoa'); await p.locator('#pn-turma').waitFor({ state: 'attached' }); await assentar(p);
  // pôr uma turma na mesa: as pessoas entram e o campo Nome continua sem seleção
  await p.evaluate(() => { const s = document.querySelector('#pn-turma'); s.value = 'g1'; s.dispatchEvent(new Event('change', { bubbles: true })); });
  await p.waitForTimeout(300);
  assert.equal(await p.evaluate(() => draft.people.length), 4);
  assert.equal(await campo(), false, 'depois da turma, a caixa de texto não é selecionada');
  // quem já estava digitando continua no campo
  await p.click('#pn-nome'); await p.keyboard.type('Ana'); await p.keyboard.press('Enter');
  assert.equal(await campo(), 'pn-nome', 'quem está digitando continua no campo');
  await p.click('.kf-dlg [data-kf-fechar]'); await p.waitForTimeout(700);
  // item sem nome: aponta, não seleciona
  await p.evaluate(() => produtoSheet()); await p.locator('#pr-form').waitFor(); await assentar(p);
  await p.evaluate(() => document.querySelector('#pr-form').requestSubmit());
  assert.equal(await campo(), false, 'item sem nome: o campo não é selecionado');
  // nenhum arquivo do app dá foco a campo por conta própria: só devolve o foco a quem já estava nele (casca.js e a conta da mesa)
  const fs = await import('node:fs');
  const focos = ['app.js', 'telas.js', 'casca.js', 'jogo.js'].flatMap(f => fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8').split('\n').map((l, i) => [f, i + 1, l]).filter(x => /\.focus\(/.test(x[2]) && /(nome|preco|inp|campo|codigo|qtdEl|\bel)\??\.focus\(|\.select\??\.?\(\)/i.test(x[2])));
  assert.deepEqual(focos.map(x => `${x[0]}:${x[1]}`), [], 'sobrou foco automático em caixa de texto');
  await a.fechar?.();
});

test('1.8.2: fechar no X não dá pulo: a cópia que sai tem a altura e o topo da janela, do primeiro ao último quadro', async () => {
  const a = await aparelho(amb, { toque: true });
  const p = a.page;
  await p.evaluate(() => { catalog.groups = [{ id: 'g1', name: 'Pombo', members: ['Bruno', 'Letícia'] }]; store.saveCatalog(); });
  await p.fill('#ini-local', 'Cantina do Teste'); await p.click('#ini-form button[type=submit]');
  await p.locator('#add-pessoa').waitFor();
  for (const abre of ['pessoaNovaSheet', 'localSheet', 'produtoSheet', 'contaSheet']) {
    await p.evaluate(f => eval(f + '()'), abre);
    await p.locator('.kf-dlg').waitFor(); await assentar(p);
    if (abre === 'pessoaNovaSheet') assert.equal(await p.locator('.kf-dlg .kf-esc').count(), 1, 'a janela das pessoas tem a lista de turmas');
    const r = await p.evaluate(() => new Promise(fim => {
      const d = document.querySelector('.kf-dlg'), antes = d.getBoundingClientRect(), q = [];
      d.querySelector('[data-kf-fechar]').click();
      const olhar = () => { const g = document.querySelector('#kf-saidas .kf-dlg-x'); if (!g) return fim({ topo: antes.top, alt: antes.height, q }); const b = g.getBoundingClientRect(); q.push([b.top, g.offsetHeight, g.querySelectorAll('.kf-esc').length - [...g.querySelectorAll('.kf-esc')].filter(x => getComputedStyle(x).display === 'none').length]); requestAnimationFrame(olhar); };
      Promise.resolve().then(() => requestAnimationFrame(olhar));
    }));
    assert.ok(r.q.length > 5, `${abre}: a saída foi filmada`);
    assert.ok(r.q.every(x => Math.abs(x[1] - r.alt) < 1), `${abre}: a cópia mantém a altura da janela (${r.alt} → ${[...new Set(r.q.map(x => x[1]))]})`);
    assert.ok(r.q.every(x => x[0] >= r.topo - 1), `${abre}: o topo nunca sobe ao fechar (${r.topo} → mínimo ${Math.min(...r.q.map(x => x[0]))})`);
    assert.ok(r.q.every((x, i) => !i || x[0] >= r.q[i - 1][0] - 0.5), `${abre}: a janela só desce`);
    await p.waitForTimeout(100);
  }
  semErros(a); await a.fechar();
});

test('1.8.3: puxar a janela pelo cabeçalho: acompanha o dedo, volta se soltar antes e fecha de onde o dedo deixou', async () => {
  const a = await aparelho(amb, { toque: true });
  const p = a.page;
  await p.fill('#ini-local', 'Cantina do Teste'); await p.click('#ini-form button[type=submit]');
  await p.locator('#add-pessoa').waitFor();
  await p.evaluate(() => produtoSheet()); await p.locator('.kf-dlg').waitFor(); await assentar(p);
  // o cabeçalho é a alça: não seleciona texto nem rola a página
  assert.deepEqual(await p.evaluate(() => { const c = getComputedStyle(document.querySelector('.kf-dlg-cab')), pe = getComputedStyle(document.querySelector('.kf-dlg-pe')), x = getComputedStyle(document.querySelector('.kf-dlg-cab .kf-fechar')); return [c.touchAction, c.userSelect || c.webkitUserSelect, pe.touchAction, x.touchAction]; }), ['none', 'none', 'none', 'manipulation']);
  assert.equal(await p.evaluate(() => { const e = new Event('touchmove', { bubbles: true, cancelable: true }); e.touches = e.changedTouches = [{ clientX: 0, clientY: 0, identifier: 1 }]; document.querySelector('.kf-dlg-cab h2').dispatchEvent(e); return e.defaultPrevented; }), true, 'arrastar no cabeçalho não rola a página');
  // 1.8.4: fora da barrinha o dedo não move nada; só rola o conteúdo maior que a janela, e para nas pontas
  const mover = (sel, de, para, prep = '') => p.evaluate(([sel, de, para, prep]) => { if (prep) eval(prep); const el = document.querySelector(sel), t = y => [{ clientX: 50, clientY: y, identifier: 1 }];
    const a = new Event('touchstart', { bubbles: true }); a.touches = a.changedTouches = t(de); el.dispatchEvent(a);
    const e = new Event('touchmove', { bubbles: true, cancelable: true }); e.touches = e.changedTouches = t(para); el.dispatchEvent(e); return e.defaultPrevented; }, [sel, de, para, prep]);
  const cabe = "(() => { const c = document.querySelector('.kf-dlg-corpo'); c.style.maxHeight = ''; c.style.flex = ''; })()", naoCabe = "(() => { const c = document.querySelector('.kf-dlg-corpo'); c.style.maxHeight = '120px'; c.style.flex = 'none'; c.scrollTop = 40; })()";
  assert.equal(await p.evaluate(() => { const c = document.querySelector('.kf-dlg-corpo'); return c.scrollHeight <= c.clientHeight + 1; }), true, 'o conteúdo cabe na janela');
  assert.equal(await mover('.kf-dlg-corpo label', 300, 380, cabe), true, 'conteúdo que cabe: arrastar num rótulo não move nada');
  assert.equal(await mover('.kf-dlg-corpo', 300, 220), true, 'nem para cima');
  assert.equal(await mover('.kf-dlg-pe', 300, 380), true, 'nem pelo rodapé');
  assert.equal(await mover('.kf-dlg-corpo label', 300, 380, naoCabe), false, 'conteúdo maior que a janela: rola');
  assert.equal(await mover('.kf-dlg-corpo label', 300, 220), false, 'rola nos dois sentidos');
  assert.equal(await mover('.kf-dlg-corpo label', 300, 380, "document.querySelector('.kf-dlg-corpo').scrollTop = 0"), true, 'no começo, puxar para baixo não arrasta a página');
  assert.equal(await mover('.kf-dlg-corpo label', 300, 220, "(() => { const c = document.querySelector('.kf-dlg-corpo'); c.scrollTop = c.scrollHeight; })()"), true, 'no fim, empurrar para cima não arrasta a página');
  assert.equal(await mover('#view', 300, 380, cabe), false, 'fora da janela o app não mexe (o fundo é do Kit)');
  const puxar = (dy, passos = 8, ms = 30) => p.evaluate(async ([dy, passos, ms]) => {
    const h = document.querySelector('.kf-dlg-cab h2'), r = h.getBoundingClientRect(), x = r.left + 20, y = r.top + 5;
    const ev = (t, yy) => h.dispatchEvent(new PointerEvent(t, { bubbles: true, cancelable: true, pointerId: 7, pointerType: 'touch', isPrimary: true, clientX: x, clientY: yy, button: t === 'pointermove' ? -1 : 0 }));
    ev('pointerdown', y);
    for (let i = 1; i <= passos; i++) { await new Promise(f => setTimeout(f, ms)); ev('pointermove', y + dy * i / passos); }
    return y + dy;
  }, [dy, passos, ms]);
  const soltar = y => p.evaluate(y => document.querySelector('.kf-dlg-cab h2').dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 7, pointerType: 'touch', clientY: y })), y);
  const topo = () => p.evaluate(() => document.querySelector('.kf-dlg').getBoundingClientRect().top);
  await p.waitForTimeout(750); await assentar(p);
  const t0 = await topo();
  // puxão curto e lento: acompanha o dedo e volta
  let y = await puxar(60, 8, 60);
  assert.ok(Math.abs(await topo() - (t0 + 60)) < 1.5, 'a janela acompanha o dedo');
  await soltar(y); await p.waitForTimeout(450);
  assert.ok(await p.locator('.kf-dlg').count() === 1 && Math.abs(await topo() - t0) < 1, 'soltou antes: a janela volta para o lugar');
  // para cima não sai do lugar
  y = await puxar(-80); assert.ok(Math.abs(await topo() - t0) < 1, 'para cima a janela não se move'); await soltar(y);
  assert.equal(await p.locator('.kf-dlg').count(), 1);
  // puxão longo: fecha, e a cópia desce de onde o dedo deixou, sem voltar ao alto
  y = await puxar(260, 10, 40);
  const r = await p.evaluate(y => new Promise(fim => {
    const q = [];
    document.querySelector('.kf-dlg-cab h2').dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 7, pointerType: 'touch', clientY: y }));
    const olhar = () => { const g = document.querySelector('#kf-saidas .kf-dlg-x'); if (!g) return fim({ q, aberta: document.querySelectorAll('.kf-ov').length - document.querySelectorAll('#kf-saidas .kf-ov').length, alto: innerHeight }); q.push(g.getBoundingClientRect().top); requestAnimationFrame(olhar); };
    Promise.resolve().then(() => requestAnimationFrame(olhar));
  }), y);
  assert.equal(r.aberta, 0, 'puxou bastante: a janela fecha');
  assert.ok(r.q.length > 5 && r.q[0] >= t0 + 259, `a saída parte de onde o dedo deixou (${t0 + 260} → ${r.q[0]})`);
  assert.ok(r.q.every((x, i) => !i || x >= r.q[i - 1] - 0.5) && r.q.at(-1) >= r.alto - 40, 'a janela só desce, até sair da tela');
  // puxão rápido e curto também fecha; no X continua fechando
  await p.waitForTimeout(100); await p.evaluate(() => produtoSheet()); await p.locator('.kf-dlg').waitFor(); await assentar(p);
  y = await puxar(70, 4, 12); await soltar(y); await p.waitForTimeout(100);
  assert.equal(await p.evaluate(() => document.querySelectorAll('.kf-ov').length - document.querySelectorAll('#kf-saidas .kf-ov').length), 0, 'puxão rápido fecha');
  semErros(a); await a.fechar();
});

test('1.8.5: o cursor do campo fica invisível enquanto a janela sobe com o teclado e volta com ela parada', async () => {
  const a = await aparelho(amb, { toque: true });
  const p = a.page;
  await p.fill('#ini-local', 'Cantina do Teste'); await p.click('#ini-form button[type=submit]');
  await p.locator('#add-pessoa').waitFor();
  await p.evaluate(() => produtoSheet()); await p.locator('#pr-form').waitFor(); await assentar(p);
  const campo = await p.evaluate(() => document.querySelector('#pr-form input[type=text], #pr-form input:not([type])').id);
  const cursor = () => p.evaluate(id => { const el = document.getElementById(id); return [document.activeElement === el, getComputedStyle(el).caretColor === 'rgba(0, 0, 0, 0)']; }, campo);
  // toque no campo: enquanto o teclado não chega e a janela sobe, o cursor não é desenhado
  await p.tap('#' + campo); await p.waitForTimeout(40);
  assert.deepEqual(await cursor(), [true, true], 'logo depois do toque o cursor está invisível');
  await teclado(p, true); await p.waitForTimeout(120);
  assert.deepEqual(await cursor(), [true, true], 'com a janela subindo o cursor continua invisível');
  await p.waitForTimeout(700);
  assert.deepEqual(await cursor(), [true, false], 'com a janela parada o cursor aparece');
  // sem foco não sobra marca
  await p.evaluate(() => document.activeElement.blur()); await p.waitForTimeout(50);
  assert.equal(await p.evaluate(() => document.querySelectorAll('.kf-sem-cursor').length), 0);
  semErros(a); await a.fechar();
});

test('1.8.6: com o teclado aberto, o pé da janela se recolhe em toda janela e volta quando o teclado fecha', async () => {
  const a = await aparelho(amb, { toque: true });
  const p = a.page;
  await p.fill('#ini-local', 'Cantina do Teste'); await p.click('#ini-form button[type=submit]');
  await p.locator('#add-pessoa').waitFor();
  await p.evaluate(() => { addPessoa('Ana'); addPessoa('Bruno'); });
  const H = await p.evaluate(() => innerHeight);
  const pe = () => p.evaluate(() => { const d = [...document.querySelectorAll('.kf-dlg')].find(x => !x.closest('#kf-saidas')), e = d.querySelector(':scope > .kf-dlg-pe'), r = e.getBoundingClientRect(); return { some: getComputedStyle(e).display === 'none' || r.height === 0, base: Math.round(d.getBoundingClientRect().bottom) }; });
  for (const [abre, campo] of [['produtoSheet', '#pr-form input'], ['localSheet', '.kf-dlg input']]) {
    await p.evaluate(f => eval(f + '()'), abre); await p.locator('.kf-dlg').waitFor(); await assentar(p);
    if (!(await p.locator('.kf-dlg > .kf-dlg-pe').count())) { await p.click('.kf-dlg [data-kf-fechar]'); await p.waitForTimeout(700); continue; }
    assert.equal((await pe()).some, false, `${abre}: sem teclado o pé aparece`);
    await p.locator(campo).first().tap(); await p.waitForTimeout(40); await teclado(p, true); await p.waitForTimeout(700);
    const c = await pe();
    assert.equal(c.some, true, `${abre}: com o teclado aberto nenhum botão do pé fica à vista`);
    assert.equal(c.base, H - TECLADO, `${abre}: a janela encosta no teclado`);
    await p.evaluate(() => document.activeElement.blur()); await p.waitForTimeout(30); await teclado(p, false); await p.waitForTimeout(700);
    assert.equal((await pe()).some, false, `${abre}: o pé volta quando o teclado fecha`);
    await p.click('.kf-dlg [data-kf-fechar]'); await p.waitForTimeout(700);
  }
  semErros(a); await a.fechar();
});

test('1.8.7: todo botão de exclusão é vermelho, no claro e no escuro, inclusive o da confirmação', async () => {
  const a = await aparelho(amb, { toque: true });
  const p = a.page;
  const VERM = 'rgb(179, 54, 43)';
  // varre a tela: todo botão à vista que exclui, remove ou apaga tem fundo vermelho (ou ícone vermelho, se for só ícone)
  const varrer = () => p.evaluate(VERM => [...document.querySelectorAll('button')].filter(b => b.getClientRects().length && !b.closest('#kf-saidas') && /^(Excluir|Remover|Apagar|Restaurar padrões)/.test((b.textContent.trim() || b.getAttribute('aria-label') || '').trim()))
    .map(b => { const c = getComputedStyle(b), so = !b.textContent.trim(); return [(b.textContent.trim() || b.getAttribute('aria-label')).slice(0, 30), so && b.classList.contains('ic-btn') ? c.color === getComputedStyle(document.documentElement).getPropertyValue('--kf-bad').trim() || /^rgb\((1[5-9]\d|2\d\d), /.test(c.color) : c.backgroundColor === VERM && c.color === 'rgb(255, 255, 255)']; }), VERM);
  const conferir = async (onde, minimo = 1) => { const r = await varrer(); assert.ok(r.length >= minimo, `${onde}: achou ${r.length} botões de exclusão`); assert.deepEqual(r.filter(x => !x[1]).map(x => x[0]), [], `${onde}: botão de exclusão que não é vermelho`); };
  await salvarComanda(p, 'Cantina A', ['Ana', 'Bruno'], { nome: 'Suco', qtd: 2, preco: 1290 });
  await p.fill('#ini-local', 'Cantina do Teste'); await p.click('#ini-form button[type=submit]');
  await p.locator('#add-pessoa').waitFor();
  await p.evaluate(() => { addPessoa('Ana'); addPessoa('Bruno'); draft.items.push({ id: newId(), o: 1, name: 'Suco', qty: 2, price: 1290, fq: 0, mode: 'equal', lk: true, a: Object.fromEntries(draft.people.map(x => [x.id, 1])) }); commit(); });
  for (const tema of ['light', 'dark']) {
    await p.emulateMedia({ colorScheme: tema });
    await nav(p, 'comanda'); await conferir(`comanda (${tema})`);
    await p.locator('.item-d > .it-lin').first().click(); await p.waitForTimeout(700); await conferir(`item aberto (${tema})`, 2);
    await p.locator('[data-it-del]').first().click(); await p.locator('.kf-confirmar').waitFor(); await assentar(p); await conferir(`confirmação de remover item (${tema})`, 1);
    assert.equal(await p.evaluate(() => getComputedStyle(document.querySelector('.kf-confirmar [data-kf-ok]')).backgroundColor), VERM, 'o botão da confirmação é vermelho');
    await p.click('.kf-confirmar [data-kf-cancelar]'); await p.waitForTimeout(700);
    await p.locator('.item-d > .it-lin').first().click(); await p.waitForTimeout(700);
    await p.evaluate(() => editarPessoaSheet(draft.people[0].id)); await p.locator('#cs-rm').waitFor(); await assentar(p); await conferir(`editar pessoa (${tema})`, 1);
    await p.click('.kf-dlg [data-kf-fechar]'); await p.waitForTimeout(700);
    await nav(p, 'inicio'); await conferir(`Início (${tema})`);
    await nav(p, 'mais'); await p.locator('#view [data-ir="cadastros"]').click(); await p.waitForTimeout(300); await conferir(`cadastros (${tema})`, 2);
    await nav(p, 'inicio');
  }
  semErros(a); await a.fechar();
});

test('1.9.1: Avaliação e feedback no padrão do app: opções em linha, sem Fechar no pé, caixa de texto igual aos campos', async () => {
  const a = await aparelho(amb, { toque: true });
  const p = a.page;
  await p.click('#barra [data-kf="feedback"]'); await p.locator('.kf-escolha').first().waitFor(); await assentar(p);
  const r = await p.evaluate(() => [...document.querySelectorAll('.kf-dlg .kf-escolha')].map(b => { const c = getComputedStyle(b), q = b.getBoundingClientRect(), dentro = [...b.querySelectorAll('b, small')].every(t => { const x = t.getBoundingClientRect(); return x.top >= q.top + 4 && x.bottom <= q.bottom - 4; });
    return { raio: c.borderTopLeftRadius, alt: q.height >= 60, dentro, apoio: getComputedStyle(b.querySelector('small')).fontWeight, titulo: getComputedStyle(b.querySelector('b')).fontWeight, seta: !!b.querySelector(':scope > svg') }; }));
  assert.equal(r.length, 2);
  r.forEach(x => assert.deepEqual(x, { raio: '0px', alt: true, dentro: true, apoio: '400', titulo: '700', seta: true }, 'a opção é uma linha do app, com o texto dentro dela'));
  assert.equal(await p.evaluate(() => { const pe = document.querySelector('.kf-dlg > .kf-dlg-pe'); return !pe || getComputedStyle(pe).display === 'none'; }), true, 'sem Fechar no pé: o X fecha');
  await p.click('.kf-escolha[data-kf="problema"]'); await p.locator('#kf-msg').waitFor(); await assentar(p);
  const f = await p.evaluate(() => { const t = getComputedStyle(document.querySelector('#kf-msg')), i = getComputedStyle(document.querySelector('#kf-contato')); return [t.backgroundColor === i.backgroundColor, t.borderTopColor === i.borderTopColor, t.borderTopLeftRadius === i.borderTopLeftRadius, getComputedStyle(document.querySelector('.kf-dlg > .kf-dlg-pe')).display !== 'none']; });
  assert.deepEqual(f, [true, true, true, true], 'a caixa de texto grande é igual ao campo; o pé com Voltar e Enviar continua');
  semErros(a); await a.fechar();
});
