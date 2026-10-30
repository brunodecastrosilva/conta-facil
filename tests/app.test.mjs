/* Conta Fácil · testes do app (npm test). Rodam num Chromium, sem internet:
   o GitHub (sincronização) e o Firestore (avaliações) são simulados por comum/testes/ambiente.mjs. */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { preparar, aparelho, githubFalso, firestoreFalso, semRolagemLateral, conferirTopo, conferirNavAjustes, abrirAjustesPelaNav, irPelaNav, guiasAjustes, GUIAS_COMUNS, TOKEN_TESTE, RAIZ, escolher } from '../comum/testes/ambiente.mjs';

let amb, versao;
before(async () => { amb = await preparar(); versao = JSON.parse(await readFile(RAIZ + '/package.json', 'utf8')).version; });
after(async () => { await amb?.encerrar(); });
const esperar = async (cond, ms = 8000) => { const fim = Date.now() + ms; while (Date.now() < fim) { if (await cond()) return true; await new Promise(r => setTimeout(r, 50)); } return false; };
// Ajustes fica na navegação: barra de baixo (celular e tablet) ou pé do trilho (computador)
const AJ = '.kf-nav [data-kf="ajustes"]:visible, .kf-trilho [data-kf="ajustes"]:visible';
/* abre uma guia dos Ajustes (no celular, a lista vira a guia aberta) */
const guia = async (p, id) => { if (!(await p.locator('[data-kf-aj]').count())) await abrirAjustesPelaNav(p); await p.click(`.kf-aj-lista [data-kf-aj-ir="${id}"]`); await p.locator(`#kf-aj-${id}.kf-aberta, [data-kf-aj][data-ativa="${id}"]`).first().waitFor(); };
const TELAS = [[{ width: 360, height: 740 }, 'celular pequeno'], [{ width: 390, height: 844 }, 'celular'], [{ width: 820, height: 1180 }, 'tablet'], [{ width: 1440, height: 900 }, 'computador']];

/* cria uma comanda salva usando as próprias funções do app */
const salvarComanda = (p, local, nomes, item) => p.evaluate(([local, nomes, item]) => {
  const d = blankDraft(); d.place = local;
  d.people = nomes.map(newPerson);
  d.items = [{ id: newId(), o: 1, name: item.nome, qty: item.qtd, price: item.preco, fq: 0, mode: 'equal', lk: true, a: Object.fromEntries(d.people.map(x => [x.id, 1])) }];
  d.active = true; draft = d; saveDraft(); saveBill();
}, [local, nomes, item]);

test('abre sem erros em celular, tablet e computador, sem rolagem lateral', async () => {
  for (const [viewport, nome] of TELAS) {
    const a = await aparelho(amb, { viewport });
    await a.page.locator('#view .hero').waitFor();
    assert.equal(await a.page.getAttribute('html', 'lang'), 'pt-BR');
    assert.ok(await semRolagemLateral(a.page), `rolagem lateral no ${nome}`);
    const topo = await conferirTopo(a.page);
    assert.deepEqual(topo.erros, [], `área superior no ${nome}`);
    assert.equal(topo.estado, 'desligada');
    // uma só navegação visível: barra de baixo no celular e no tablet, trilho lateral no computador
    const navs = await a.page.evaluate(() => ['.kf-nav', '.kf-trilho'].filter(q => document.querySelector(q).getClientRects().length));
    assert.deepEqual(navs, [viewport.width >= 1024 ? '.kf-trilho' : '.kf-nav'], `navegação no ${nome}`);
    const navAj = await conferirNavAjustes(a.page);
    assert.deepEqual(navAj.erros, [], `Ajustes na navegação no ${nome}`);
    await abrirAjustesPelaNav(a.page);
    await a.page.locator('.kf-aj-h').waitFor();
    assert.ok(await semRolagemLateral(a.page), `rolagem lateral nos Ajustes no ${nome}`);
    await guia(a.page, 'comandas');
    assert.ok(await semRolagemLateral(a.page), `rolagem lateral na guia Comandas no ${nome}`);
    assert.deepEqual(a.erros, [], `erros no ${nome}`);
    await a.fechar();
  }
});

test('zoom liberado para quem precisa ampliar a tela', async () => {
  const a = await aparelho(amb);
  const vp = await a.page.getAttribute('meta[name="viewport"]', 'content');
  assert.doesNotMatch(vp, /maximum-scale|user-scalable/);
  assert.equal(await a.page.evaluate(() => getComputedStyle(document.documentElement).touchAction), 'manipulation');
  await a.fechar();
});

test('Ajustes: guias comuns na ordem do padrão, guia Comandas, e o Voltar do navegador', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await p.click('#tab-historico');
  await abrirAjustesPelaNav(p);
  assert.deepEqual(await guiasAjustes(p), { comuns: GUIAS_COMUNS, produto: ['Comandas'] });
  assert.ok((await p.textContent('#view')).includes(`Conta Fácil ${versao}`), 'falta a versão nos Ajustes');
  assert.equal(await p.locator('.kf-nav [data-kf=\"ajustes\"]').getAttribute('aria-current'), 'page');
  // guia aberta e Voltar (no celular, volta para a lista; de novo, sai dos Ajustes)
  await guia(p, 'sincronizacao');
  await p.goBack();
  assert.ok(await esperar(async () => (await p.getAttribute('[data-kf-aj]', 'data-ativa')) === ''), 'o Voltar não voltou para a lista');
  await guia(p, 'privacidade');
  await p.click('#kf-aj-privacidade [data-kf-aj-voltar]');
  assert.ok(await esperar(async () => (await p.getAttribute('[data-kf-aj]', 'data-ativa')) === ''));
  await p.goBack();
  assert.ok(await esperar(async () => (await p.getAttribute('#tab-historico', 'aria-selected')) === 'true'), 'o Voltar não voltou para o Histórico');
  // tocar em Ajustes numa guia volta para a lista; trocar de aba estando numa guia sai dos Ajustes
  await abrirAjustesPelaNav(p);
  await guia(p, 'aparencia');
  await abrirAjustesPelaNav(p);
  assert.ok(await esperar(async () => (await p.getAttribute('[data-kf-aj]', 'data-ativa')) === ''), 'Ajustes na navegação não voltou para a lista');
  await guia(p, 'aparencia');
  await irPelaNav(p, 'Cadastros');
  assert.equal(await p.getAttribute('#tab-cadastros', 'aria-selected'), 'true');
  await p.waitForTimeout(150);
  assert.equal(await p.getAttribute('#tab-cadastros', 'aria-selected'), 'true', 'o Voltar automático desfez a troca de aba');
  // "Você nas comandas" (guia Conta e perfil) continua escolhendo o nome
  await salvarComanda(p, 'Bar', ['Ana', 'Bruno'], { nome: 'Água', qtd: 1, preco: 500 });
  await guia(p, 'conta');
  await escolher(p, '#aj-me', 'Ana');
  assert.equal(await p.evaluate(() => catalog.me), 'Ana');
  assert.equal(await p.textContent('[data-kf-aj-resumo="conta"]'), 'Você é Ana');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('computador: Ajustes em duas colunas, com o trilho lateral', async () => {
  const a = await aparelho(amb, { viewport: { width: 1440, height: 900 } });
  const p = a.page;
  await p.click('#trilho-historico');
  await abrirAjustesPelaNav(p);
  const lado = await p.evaluate(() => { const l = document.querySelector('.kf-aj-lista').getBoundingClientRect(), s = document.querySelector('.kf-aj-sec.kf-aberta, .kf-aj-sec:first-child').getBoundingClientRect(); return l.right <= s.left && Math.abs(l.top - s.top) < 60; });
  assert.ok(lado, 'lista e guia não estão lado a lado');
  await p.click('.kf-aj-lista [data-kf-aj-ir="comandas"]');
  assert.ok(await p.locator('#kf-aj-comandas').isVisible());
  await p.click('#trilho-historico');
  assert.equal(await p.getAttribute('#trilho-historico', 'aria-selected'), 'true');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('balão: avaliar o app e relatar um problema saem com o nome do app, a versão e a tela', async () => {
  const fs = firestoreFalso();
  const a = await aparelho(amb, { firestore: fs });
  const p = a.page;
  await p.click('#tab-historico');
  await p.click('.kf-topo [data-kf="feedback"]');
  await p.click('.kf-dlg [data-kf="avaliar"]');
  await p.click('label[for="kf-n5"]');
  await p.click('.kf-opcao:has-text("Elogio")');
  await p.fill('#kf-msg', 'Dividir a conta ficou fácil.');
  await p.click('[data-kf-enviar]');
  await p.locator('text=Recebemos sua mensagem').waitFor();
  await p.keyboard.press('Escape');
  await p.click('.kf-topo [data-kf="feedback"]');
  await p.click('.kf-dlg [data-kf="problema"]');
  await p.click('.kf-opcao:has-text("Dados ou sincronização")');
  await p.fill('#kf-msg', 'O total não bateu.');
  await p.click('[data-kf-enviar]');
  await p.locator('text=Recebemos sua mensagem').waitFor();
  const docs = [...fs.estado.docs.values()].map(d => d.dados);
  assert.equal(docs.length, 2);
  for (const d of docs) { assert.equal(d.app, 'conta-facil'); assert.equal(d.versao, versao); assert.equal(d.tela, 'historico'); }
  assert.equal(docs[0].tipo, 'elogio'); assert.deepEqual(docs[0].nota, { __int: 5 });
  assert.equal(docs[1].tipo, 'problema'); assert.equal(docs[1].categoria, 'dados');
  assert.equal(fs.estado.recusas.length, 0);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('tema escuro escolhido nos Ajustes vale para o app todo', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  const claro = await p.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await guia(p, 'aparencia');
  await p.click('[data-kf="tema"][data-v="escuro"]');
  assert.equal(await p.getAttribute('html', 'data-theme'), 'dark');
  assert.notEqual(await p.evaluate(() => getComputedStyle(document.body).backgroundColor), claro);
  await p.reload();
  assert.equal(await p.getAttribute('html', 'data-theme'), 'dark');
  await a.fechar();
});

test('sincronização: histórico e cadastros passam de um aparelho para o outro, inclusive exclusões', async () => {
  const gh = githubFalso();
  const A = await aparelho(amb, { github: gh });
  const B = await aparelho(amb, { github: gh });
  await salvarComanda(A.page, 'Bar do Teste', ['Ana', 'Bruno'], { nome: 'Chopp', qtd: 2, preco: 1290 });
  // pela nuvem do topo
  await A.page.click('[data-kf-nuvem]');
  await A.page.click('.kf-dlg [data-kf="sync-ativar"]');
  await A.page.fill('#kf-token', TOKEN_TESTE);
  await A.page.click('[data-kf-conectar]');
  assert.ok(await esperar(() => A.page.evaluate(() => SY.ligada() && SY.estado.lastSync > 0)), 'A não sincronizou');
  assert.ok(await esperar(async () => (await A.page.getAttribute('[data-kf-nuvem]', 'data-estado')) === 'sincronizado'), 'a nuvem não mostra Sincronizado');
  const arq = gh.arquivo('conta-facil.json');
  assert.ok(arq && !/Bar do Teste/.test(arq.conteudo), 'o gist deveria estar criptografado');

  await salvarComanda(B.page, 'Restaurante B', ['Carla'], { nome: 'Suco', qtd: 1, preco: 900 });
  // pelos Ajustes
  await guia(B.page, 'sincronizacao');
  await B.page.click('#kf-aj-sincronizacao [data-kf="sync-ativar"]');
  await B.page.fill('#kf-token', TOKEN_TESTE);
  await B.page.click('[data-kf-conectar]');
  assert.ok(await esperar(() => B.page.evaluate(() => SY.ligada() && bills.length === 2)), 'B não recebeu o histórico de A');
  await A.page.evaluate(() => SY.agora({ quiet: true }));
  assert.deepEqual(await A.page.evaluate(() => bills.map(b => b.place).sort()), ['Bar do Teste', 'Restaurante B']);
  assert.deepEqual(await A.page.evaluate(() => catalog.people.map(p => p.name).sort()), ['Ana', 'Bruno', 'Carla']);
  assert.equal(await A.page.evaluate(() => catalog.products.find(p => p.name === 'Suco')?.prices && Object.keys(catalog.products.find(p => p.name === 'Suco').prices).length), 1);

  // exclusão no B some no A
  await B.page.evaluate(() => { bills = bills.filter(b => b.place !== 'Bar do Teste'); store.deleteBill(); catalog.people = catalog.people.filter(p => p.name !== 'Bruno'); store.saveCatalog(); });
  await B.page.evaluate(() => SY.agora({ quiet: true }));
  await A.page.evaluate(() => SY.agora({ quiet: true }));
  assert.deepEqual(await A.page.evaluate(() => bills.map(b => b.place)), ['Restaurante B']);
  assert.deepEqual(await A.page.evaluate(() => catalog.people.map(p => p.name).sort()), ['Ana', 'Carla']);
  // a comanda aberta não sincroniza: cada aparelho tem a sua
  await A.page.evaluate(() => { draft = blankDraft(); draft.place = 'Só no A'; draft.active = true; saveDraft(); });
  await A.page.evaluate(() => SY.agora({ quiet: true }));
  await B.page.evaluate(() => SY.agora({ quiet: true }));
  assert.notEqual(await B.page.evaluate(() => draft.place), 'Só no A');
  // sem mudanças, não regrava o gist a cada sincronização
  const antes = gh.estado.chamadas.filter(c => c.startsWith('PATCH')).length;
  await A.page.evaluate(() => SY.agora({ quiet: true }));
  await B.page.evaluate(() => SY.agora({ quiet: true }));
  await A.page.evaluate(() => SY.agora({ quiet: true }));
  assert.equal(gh.estado.chamadas.filter(c => c.startsWith('PATCH')).length, antes, 'gravou o gist sem mudança (vai e volta)');
  assert.deepEqual([...A.erros, ...B.erros], []);
  await A.fechar(); await B.fechar();
});

test('cópia de segurança: baixa e restaura o histórico e os cadastros', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await salvarComanda(p, 'Boteco Cópia', ['Dani', 'Edu'], { nome: 'Porção', qtd: 1, preco: 4000 });
  await guia(p, 'sincronizacao');
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('[data-kf="copia-baixar"]')]);
  assert.match(dl.suggestedFilename(), /^conta-facil-copia-\d{4}-\d{2}-\d{2}\.json$/);
  const caminho = await dl.path();
  const copia = JSON.parse(await readFile(caminho, 'utf8'));
  assert.equal(copia.formato, 'copia-facil');
  assert.equal(copia.app, 'conta-facil');
  assert.equal(copia.dados.bills.length, 1);
  await p.evaluate(() => { bills = []; store.saveBill(); catalog.people = []; store.saveCatalog(); render(); });
  await p.setInputFiles('[data-kf-copia-arquivo]', caminho);
  await p.locator('.kf-dlg >> text=Restaurar a cópia?').waitFor();
  await p.click('[data-kf-ok]');
  assert.ok(await esperar(() => p.evaluate(() => bills.length === 1 && catalog.people.length === 2)));
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('comanda de exemplo e guia continuam funcionando', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await p.click('#go-example');
  await p.locator('.tour-card').waitFor();
  for (let i = 0; i < 6; i++) await p.click('.tour-card [data-tour="1"]');
  await p.click('.tour-x');
  await p.click('#tab-inicio');
  await p.click('#end-example');
  assert.equal(await p.evaluate(() => draft.isExample), false);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('comanda ao vivo: guarda quem criou, vence 30 dias depois de criada e é apagada ao encerrar; recusa do banco não trava', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await p.locator('#view .hero').waitFor();
  const rodar = recusarApagar => p.evaluate(async recusarApagar => {
    const gravacoes = [];
    store.db = { uid: 'aparelho-anfitriao', doc: path => ({
      get: async () => ({ exists: true, data: () => ({}) }),
      set: async d => { gravacoes.push(['set', path, d]); },
      update: async d => { gravacoes.push(['update', path, d]); },
      delete: async () => { if (recusarApagar) throw Object.assign(new Error('negado'), { code: 'permission-denied' }); gravacoes.push(['delete', path]); },
      onSnapshot: () => () => {},
    }) };
    const d = blankDraft(); d.place = 'Bar'; d.people = ['Ana', 'Bia'].map(newPerson); d.active = true; draft = d; saveDraft();
    const antes = Date.now();
    await live.start(); await store.chain;
    const aberta = !!draft.live;
    live.end(); await store.chain;
    const criou = gravacoes.find(g => g[0] === 'set'), prazo = gravacoes.find(g => g[0] === 'update' && g[2].expiraEm);
    const iFechou = gravacoes.findIndex(g => g[0] === 'update' && g[2].closed === true), iApagou = gravacoes.findIndex(g => g[0] === 'delete');
    return { aberta, saiu: !draft.live, hostUid: criou && criou[2].hostUid,
      dias: prazo ? Math.round((prazo[2].expiraEm.getTime() - antes) / 864e5) : null, ehData: !!prazo && prazo[2].expiraEm instanceof Date,
      fechou: iFechou >= 0, apagou: iApagou >= 0, ordem: iApagou > iFechou };
  }, recusarApagar);
  const ok = await rodar(false);
  assert.equal(ok.aberta, true, 'a comanda ao vivo não abriu');
  assert.equal(ok.hostUid, 'aparelho-anfitriao', 'a comanda não guarda quem criou (hostUid)');
  assert.equal(ok.ehData, true, 'expiraEm precisa ser data');
  assert.equal(ok.dias, 30);
  assert.equal(ok.fechou, true, 'a comanda não foi encerrada');
  assert.equal(ok.apagou && ok.ordem, true, 'a comanda não foi apagada depois de encerrada');
  // regra antiga (sem permissão de apagar): fica só encerrada e o app segue normalmente
  const recusado = await rodar(true);
  assert.equal(recusado.fechou, true);
  assert.equal(recusado.apagou, false);
  assert.equal(recusado.saiu, true, 'o anfitrião não saiu da comanda ao vivo');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});
