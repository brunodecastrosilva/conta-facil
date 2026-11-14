/* Conta Fácil 1.0 · testes do app (npm test). Rodam num Chromium, sem internet:
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
  // dá para rever em Mais
  await p.keyboard.press('Escape'); await nav(p, 'mais'); await p.click('#ma-abertura');
  await p.locator('.abertura').waitFor(); await p.keyboard.press('Escape');
  await p.locator('.abertura').waitFor({ state: 'detached' });
  semErros(a); await a.fechar();
});

test('fluxo completo: mesa, pedidos numa janela só, pago, fechar, salvar com festa e Desfazer', async () => {
  const a = await aparelho(amb, { toque: true });
  const p = a.page;
  await abrirMesa(p, 'Bar do Teste', ['Ana', 'Bruno', 'Carla']);
  await lancar(p, 'Porção de fritas', 4200);                                   // entre todos
  await lancar(p, 'Chopp', 1000, { qtd: 3, individual: [['Ana', 2], ['Bruno', 1]] }); // individual
  await lancar(p, 'Caipirinha', 2200, { so: ['Carla'] });                        // só uma pessoa
  const c = await p.evaluate(() => { const c = compute(draft); return { total: c.total, por: draft.people.map(x => c.per[x.id].total), abertos: c.openItems.length }; });
  // consumo: Ana 14+20, Bruno 14+10, Carla 14+22; serviço de 10% em cada um
  assert.deepEqual(c.por, [3740, 2640, 3960]); assert.equal(c.total, 10340); assert.equal(c.abertos, 0);
  assert.match(await p.textContent('.cu-total'), /103,40/);
  // o item novo entra no fim da lista
  assert.match(await p.locator('.items > *').last().textContent(), /Caipirinha/);
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

test('tampinhas e níveis: nascem do histórico, a garrafa sorteia, e dá para desligar nos Ajustes', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  assert.deepEqual(await p.evaluate(() => { const s = jogoEstado(); return [s.nivel, s.ganhas.length]; }), [1, 0]);
  await salvarComanda(p, 'Bar A', ['Ana', 'Bruno', 'Carla', 'Diego', 'Edu', 'Fabi'], { nome: 'Chopp', qtd: 6, preco: 1000 });
  const s = await p.evaluate(() => { const s = jogoEstado(); return { ganhas: s.ganhas, xp: s.xp, nivel: s.nivel }; });
  assert.deepEqual(s.ganhas, ['primeira', 'mesa-cheia']); assert.equal(s.xp, 40 + 30 + 120); assert.equal(s.nivel, 2);
  await nav(p, 'tampinhas');
  assert.equal(await p.locator('.tampa.tem').count(), 2);
  await p.click('#tp-garrafa'); await p.emulateMedia({ reducedMotion: 'reduce' }); await p.click('#gf-go');
  assert.match(await p.textContent('#gf-res'), /A garrafa parou em/);
  await p.keyboard.press('Escape');
  assert.ok(await esperar(() => p.evaluate(() => !!jogo.flags.garrafa)));
  // desligar: a navegação troca Tampinhas por Cadastros e a festa não aparece
  await p.keyboard.press('Escape');
  await p.evaluate(() => { jogo.off = true; jogoSalvar(); render(); });
  assert.equal(await p.locator('#tab-tampinhas').count(), 0); assert.equal(await p.locator('#tab-cadastros').count(), 1);
  await p.evaluate(() => { const d = blankDraft(); d.place = 'Bar B'; d.people = ['Ana'].map(newPerson); d.items = [{ id: newId(), o: 1, name: 'Água', qty: 1, price: 500, fq: 0, mode: 'equal', lk: true, a: { [d.people[0].id]: 1 } }]; d.active = true; draft = d; saveBill(); });
  assert.equal(await p.locator('.festa').count(), 0);
  assert.match(await p.textContent('.kf-toast'), /Comanda salva no histórico/);
  semErros(a); await a.fechar();
});

test('Cadastros: pessoa com Pix, turma que entra na comanda nova e preço por lugar', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await salvarComanda(p, 'Bar A', ['Ana', 'Bruno'], { nome: 'Chopp', qtd: 2, preco: 1290 });
  await nav(p, 'mais'); await p.locator('#view [data-ir="cadastros"]').click();
  await p.click('#cad-pessoa'); await p.fill('#np-nome', 'Carla'); await p.fill('#np-pix', 'carla@exemplo.com.br'); await p.click('.kf-dlg-pe button[type=submit]');
  assert.equal(await p.evaluate(() => catalog.people.find(x => x.name === 'Carla').pix), 'carla@exemplo.com.br');
  await p.click('[data-cad="turmas"]'); await p.click('#cad-turma'); await p.fill('#tg-nome', 'Futebol');
  await p.click('[data-tg="Ana"]'); await p.click('[data-tg="Carla"]'); await p.click('.kf-dlg-pe button[type=submit]');
  await p.click('[data-cad="produtos"]');
  assert.match(await p.inputValue('[data-pprod="Chopp"]'), /R\$\s12,90/);
  // nova comanda já com a turma
  await nav(p, 'comanda'); await p.click('[data-nc-turma]'); await p.fill('#nc-local', 'Bar A'); await p.click('.kf-dlg-pe button[type=submit]');
  assert.deepEqual(await p.evaluate(() => draft.people.map(x => x.name)), ['Ana', 'Carla']);
  // o preço do lugar já vem sugerido
  await p.click('#it-novo'); await p.fill('#pr-nome', 'Chopp');
  assert.match(await p.inputValue('#pr-preco'), /R\$\s12,90/);
  semErros(a); await a.fechar();
});

test('dados da versão 0.5.0 continuam valendo: histórico, cadastros e comanda aberta', async () => {
  const a = await aparelho(amb, { antes: () => {
    if (localStorage.getItem('contafacil.bills')) return;
    const p = (id, name) => ({ id, name, payService: true, payCouvert: true, o: 1 });
    const conta = { id: 'b1', place: 'Boteco Antigo', createdAt: 1790000000000, closedAt: 1790000000000, savedAt: 1790000000000, people: [p('a', 'Ana'), p('b', 'Bruno')],
      items: [{ id: 'i1', o: 1, name: 'Chopp', qty: 4, price: 1000, fq: 0, mode: 'equal', lk: true, a: { a: 1, b: 1 } }],
      service: { enabled: true, mode: 'pct', pct: 10, fixed: 0, policy: 'discount' }, couvert: { enabled: false, value: 1500 }, discount: { enabled: false, label: 'Desconto', mode: 'value', value: 0, pct: 10, at: 'after' },
      payMode: 'none', payer: '', custom: {}, cover: {}, groups: [], total: 4400 };
    localStorage.setItem('contafacil.bills', JSON.stringify([conta]));
    localStorage.setItem('contafacil.catalog', JSON.stringify({ me: 'Ana', people: [{ name: 'Ana', pix: 'ana@exemplo.com.br' }, { name: 'Bruno' }], products: [{ name: 'Chopp', price: 1000, prices: {} }], groups: [] }));
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
  assert.deepEqual(g.comuns, GUIAS_COMUNS); assert.deepEqual(g.produto, ['Comandas e tampinhas']);
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
  await salvarComanda(A.page, 'Bar do Teste', ['Ana', 'Bruno'], { nome: 'Chopp', qtd: 2, preco: 1290 });
  for (const x of [A, B]) {
    await x.page.click('[data-kf-nuvem]'); await x.page.click('.kf-dlg [data-kf="sync-ativar"]');
    await x.page.fill('#kf-token', TOKEN_TESTE); await x.page.click('[data-kf-conectar]');
    assert.ok(await esperar(() => x.page.evaluate(() => SY.ligada() && SY.estado.lastSync > 0)), 'não sincronizou');
  }
  const arq = gh.arquivo('conta-facil.json');
  assert.ok(arq && !/Bar do Teste/.test(arq.conteudo), 'o gist deveria estar criptografado');
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

test('guia: roda numa demonstração, sem tocar nos dados reais', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await salvarComanda(p, 'Bar Real', ['Ana', 'Bruno'], { nome: 'Chopp', qtd: 2, preco: 1290 });
  await p.emulateMedia({ reducedMotion: 'reduce' });
  await p.click('#ini-guia');
  assert.ok(await esperar(() => p.evaluate(() => KitFacil.guia.ativo() && draft.isExample && draft.people.length === 4), 30000), 'o guia não montou a mesa de demonstração');
  await p.keyboard.press('Escape');
  assert.ok(await esperar(() => p.evaluate(() => !KitFacil.guia.ativo() && !draft.isExample && tab === 'inicio')));
  assert.deepEqual(await p.evaluate(() => [bills.length, bills[0].place, catalog.people.length]), [1, 'Bar Real', 2]);
  semErros(a); await a.fechar();
});
