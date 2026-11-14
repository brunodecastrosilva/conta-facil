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
const nav = (p, id) => p.locator(`#tab-${id}, #trilho-${id}`).locator('visible=true').first().click();
const semErros = a => assert.deepEqual(a.erros, [], 'erros no console');

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
  await p.click('#pn-ok');
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
  const pequenos = await a.page.evaluate(() => [...document.querySelectorAll('.nav-it, .kf-topo-btn, .marca')].filter(e => e.getClientRects().length).map(e => e.getBoundingClientRect()).filter(r => r.width < 44 || r.height < 44).length);
  assert.equal(pequenos, 0);
  await a.fechar();
});

test('abertura: aparece na primeira vez, a demonstração recalcula, guarda o nome e não volta sozinha', async () => {
  const a = await aparelho(amb, { antes: () => { window.CF_TESTE_ABERTURA = true; } });
  const p = a.page;
  await p.locator('.abertura').waitFor();
  assert.match(await p.textContent('#ab-t'), /sem calculadora/);
  await p.click('#ab-prox');
  assert.match(await p.textContent('.ab-demo-r'), /Entre todos · R\$\s14,00 cada/);
  await p.click('[data-ab-p="Carla"]');
  assert.match(await p.textContent('.ab-demo-r'), /Entre 2 · R\$\s21,00 cada/);
  await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowRight');
  await p.fill('#ab-eu', 'Bruno');
  await p.click('#ab-prox');
  await p.locator('.abertura').waitFor({ state: 'detached' });
  assert.equal(await p.evaluate(() => catalog.me), 'Bruno');
  await p.locator('#nc-local').waitFor(); // a última tela leva direto à nova comanda
  await p.reload(); await p.locator('#view .imp').waitFor();
  assert.equal(await p.locator('.abertura').count(), 0, 'a abertura não pode voltar sozinha');
  assert.match(await p.textContent('.saudacao'), /Bruno/);
  // dá para rever nos Ajustes (um lugar só)
  await p.keyboard.press('Escape'); await nav(p, 'mais');
  assert.equal(await p.locator('#ma-abertura').count(), 0);
  await p.locator('#view [data-kf="ajustes"]').click(); await p.locator('#view .kf-aj-lista [data-kf-aj-ir="comandas"]').click(); await p.click('#aj-abertura');
  await p.locator('.abertura').waitFor(); await p.keyboard.press('Escape');
  await p.locator('.abertura').waitFor({ state: 'detached' });
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
  // marcar a Ana como paga: o topo mostra o que falta
  const ana = await p.evaluate(() => draft.people[0].id);
  await p.click(`[data-unit="${ana}"]`); await p.click(`[data-pa="${ana}"] [data-pa-pago]`);
  assert.match(await p.textContent('.cu-falta'), /66,00/);
  // fechar: a mesa primeiro, depois um cupom por pessoa
  await p.click('#fechar-cmd');
  assert.match(await p.textContent('#fc-cont'), /1 de 4 · Mesa/);
  await p.click('#fc-prox'); assert.match(await p.textContent('#fc-cont'), /2 de 4 · Ana/);
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
  await p.click('#cm-pe');
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
    return { cod, crcOk: crc16(cod.slice(0, -4)) === cod.slice(-4), cpf: normPixKey('529.982.247-25'), tel: normPixKey('(11) 98888-7777') };
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
  const o3d = p.locator('.kf-dlg .o3d'); await o3d.waitFor();
  assert.ok(await p.locator('.kf-dlg .o3d-saia').count() >= 42, 'a saia da tampinha tem os gomos');
  const giro = () => p.evaluate(() => document.querySelector('.kf-dlg .o3d-eixo').style.transform);
  const g0 = await giro(), cx = await o3d.boundingBox();
  await p.mouse.move(cx.x + cx.width / 2 - 50, cx.y + cx.height / 2); await p.mouse.down(); await p.mouse.move(cx.x + cx.width / 2 + 60, cx.y + cx.height / 2, { steps: 6 }); await p.mouse.up();
  const g1 = await giro(); assert.notEqual(g1, g0, 'arrastar deveria girar a tampinha');
  await o3d.focus(); await p.keyboard.press('ArrowRight');
  assert.notEqual(await giro(), g1, 'a seta deveria girar a tampinha');
  await p.click('#tp-ok');
  await p.click('#tp-sorteio'); await p.click('#gf-go');
  assert.match(await p.textContent('#gf-res'), /Saiu /);
  await p.keyboard.press('Escape');
  assert.ok(await esperar(() => p.evaluate(() => !!jogo.flags.sorteio)));
  // desligar: a navegação troca Tampinhas por Cadastros e a festa não aparece
  await p.keyboard.press('Escape');
  await p.evaluate(() => { jogo.off = true; jogoSalvar(); render(); });
  assert.equal(await p.locator('#tab-tampinhas').count(), 0); assert.equal(await p.locator('#tab-cadastros').count(), 1);
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
  await p.locator('#guia-doca').waitFor();
  // a demonstração começa do zero na tela, e o que é de verdade continua guardado
  assert.deepEqual(await p.evaluate(() => [bills.length, catalog.people.length, JSON.parse(localStorage.getItem('contafacil.bills')).length, comReais(() => pacoteSync(true)).bills[0].place]), [0, 0, 1, 'Cantina Real']);
  // a janela fica entre o conteúdo e a barra de baixo, sem cobrir nenhum dos dois
  const g = await p.evaluate(() => { const r = q => document.querySelector(q).getBoundingClientRect(); const d = r('#guia-doca'), n = r('.kf-nav.nav'); return { fundo: d.bottom, nav: n.top, navFundo: n.bottom, alt: innerHeight, moldura: document.querySelector('.gm-tempo').getAttribute('d') }; });
  assert.ok(Math.abs(g.fundo - g.nav) <= 1, 'a janela do guia encosta na barra de baixo, sem cobrir'); assert.ok(Math.abs(g.navFundo - g.alt) <= 1); assert.match(g.moldura, /^M/);
  // primeiro passo: pisca, a moldura esvazia (contagem) e só então o passo acontece
  assert.equal(await p.evaluate(() => guia.fase), 'conta');
  assert.ok(await esperar(() => p.evaluate(() => { const o = +document.querySelector('.gm-tempo').style.strokeDashoffset; return o < 0 && o > -1; })), 'a contagem na moldura não andou');
  assert.ok(await esperar(() => p.evaluate(() => guia.i >= 2 && draft.people.length === 4), 60000), 'o guia não montou a mesa');
  // com uma janela aberta, ela termina acima da janela do guia
  assert.ok(await esperar(() => p.evaluate(() => { const d = document.querySelector('.kf-dlg'), g = document.querySelector('#guia-doca'); return !!d && d.getBoundingClientRect().bottom <= g.getBoundingClientRect().top + 1; }), 30000), 'janela por baixo do guia');
  // voltar um passo refaz o passo; depois, pulando, o guia chega ao fim sem tropeçar
  await p.click('#guia-volta');
  assert.ok(await esperar(() => p.evaluate(() => guia.fase === 'conta')));
  const fim = Date.now() + 150000;
  while (Date.now() < fim && await p.evaluate(() => !!guia)) { await p.evaluate(() => { if (guia && !guia.rapido) document.querySelector('#guia-pula').click(); }); await new Promise(r => setTimeout(r, 120)); }
  assert.equal(await p.evaluate(() => !!guia), false, 'o guia não chegou ao fim');
  assert.deepEqual(await p.evaluate(() => window.__avisos.filter(x => /guia/.test(x))), [], 'algum passo do guia falhou');
  assert.deepEqual(await p.evaluate(() => [bills.length, bills[0].place, catalog.people.length, tab, draft.active, semSalvar, !!dadosReais, !!jogo.flags.guia, JSON.parse(localStorage.getItem('contafacil.bills')).length, document.querySelectorAll('#guia-doca, #guia-escudo, #guia-dedo, .festa, .kf-dlg').length]),
    [1, 'Cantina Real', 2, 'inicio', false, false, false, true, 1, 0]);
  // sair no meio (Esc) também devolve tudo
  await nav(p, 'mais'); await p.click('#ma-guia');
  assert.ok(await esperar(() => p.evaluate(() => !!guia && guia.i >= 1 && draft.active), 30000));
  await p.keyboard.press('Escape');
  assert.deepEqual(await p.evaluate(() => [!!guia, bills.length, bills[0].place, tab, draft.active]), [false, 1, 'Cantina Real', 'inicio', false]);
  semErros(a); await a.fechar();
});

test('barra de baixo colada ao pé da tela e baixa; quantidade e valor lado a lado; o papel sai da fenda', async () => {
  const a = await aparelho(amb, { viewport: { width: 393, height: 760 } });
  const p = a.page;
  const n = await p.evaluate(() => { const r = document.querySelector('.kf-nav.nav').getBoundingClientRect(), b = document.querySelector('.nav-bola').getBoundingClientRect(); return { alt: r.height, fundo: innerHeight - r.bottom, topo: innerHeight - Math.min(r.top, b.top) }; });
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
  assert.deepEqual(await p.evaluate(() => [...document.querySelectorAll('#view .lin b')].map(b => b.textContent)), ['Cadastros', 'Sortear alguém da mesa', 'Ajustes', 'Ver o guia', 'Abrir a comanda de exemplo']);
  await p.click('#topo-presente');
  const o3d = p.locator('.kf-dlg .o3d[data-o3d="presente"]'); await o3d.waitFor();
  const giro = () => p.evaluate(() => document.querySelector('.kf-dlg .o3d-eixo').style.transform);
  await o3d.focus(); const g0 = await giro(); await p.keyboard.press('ArrowLeft');
  assert.notEqual(await giro(), g0);
  assert.equal(await p.locator('.kf-dlg .kf-dlg-pe button').count(), 1); assert.match(await p.textContent('#ap-copiar'), /Copiar código Pix/);
  await p.keyboard.press('Escape');
  const proibidas = /chopp|cerveja|caipirinha|garrafa|boteco|vinho|cacha[çc]a|u[íi]sque|whisky|vodca|vodka|drinque|drink|bebida|rodada/i;
  for (const arq of ['app.js', 'jogo.js', 'telas.js', 'casca.js', 'index.html', 'manifest.webmanifest', 'estilo.css']) {
    const txt = (await readFile(RAIZ + '/' + arq, 'utf8')).split('\n').filter(l => !/(flags|vistas)\.garrafa/.test(l)).join('\n');
    const m = txt.match(proibidas); assert.equal(m, null, `${arq} ainda fala de "${m && m[0]}"`);
  }
  semErros(a); await a.fechar();
});
