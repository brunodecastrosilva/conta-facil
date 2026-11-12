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
const TELAS = [[{ width: 320, height: 568 }, 'celular mínimo (zoom 400%)'], [{ width: 360, height: 740 }, 'celular pequeno'], [{ width: 390, height: 844 }, 'celular'], [{ width: 820, height: 1180 }, 'tablet'], [{ width: 1440, height: 900 }, 'computador']];

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
    await guia(a.page, 'preferencias');
    assert.ok(await semRolagemLateral(a.page), `rolagem lateral em Preferências no ${nome}`);
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

test('Ajustes: só as guias comuns, na ordem do padrão, e o Voltar do navegador', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await p.click('#tab-historico');
  await abrirAjustesPelaNav(p);
  assert.deepEqual(await guiasAjustes(p), { comuns: GUIAS_COMUNS, produto: [] });
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
  await p.click('.kf-aj-lista [data-kf-aj-ir="preferencias"]');
  assert.ok(await p.locator('#kf-aj-preferencias').isVisible());
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
  // o Kit aceita uma mensagem por minuto em cada aparelho: o teste apaga essa marca para mandar a segunda agora
  await p.evaluate(() => localStorage.removeItem('kitfacil.conta-facil.envios'));
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

test('guia em vídeo: um só, só com o ponteiro, avança sozinho, pausa, volta e avança, sem tocar nos dados reais', async () => {
  const a = await aparelho(amb, { toque: true });
  const p = a.page;
  // o exemplo não abre o guia sozinho; o guia começa pelo botão Guia do exemplo
  await p.click('#go-example');
  await p.waitForTimeout(600);
  assert.equal(await p.locator('.kf-gv').count(), 0, 'o exemplo abriu o guia sozinho');
  await p.click('#ex-guide');
  await p.locator('.kf-gv-player').waitFor();
  // sem destaque e sem escurecer: só o ponteiro e o player, com o título da etapa e nenhum texto a mais
  assert.equal(await p.locator('.kf-guia-furo, .kf-guia-cartao').count(), 0);
  assert.equal(await p.evaluate(() => getComputedStyle(document.querySelector('.kf-gv')).backgroundColor), 'rgba(0, 0, 0, 0)');
  assert.equal(await p.locator('.kf-gv-player p').count(), 0, 'o player tem texto além do título');
  assert.deepEqual(await p.locator('.kf-gv-ctl button').evaluateAll(bs => bs.map(b => b.getAttribute('aria-label'))), ['Voltar uma etapa', 'Pausar', 'Avançar uma etapa', 'Fechar guia']);
  const titulo = () => p.locator('.kf-gv-titulo').innerText();
  const etapa = () => p.locator('.kf-gv-n').innerText();
  assert.equal(await etapa(), '1/' + await p.evaluate(() => KitFacil.guia.passos(1).length));
  // os títulos dizem o que fazer, sem texto de apoio
  const passos = await p.evaluate(() => KitFacil.guia.passos(1).map(x => ({ t: x.t, d: x.d || '' })));
  for (const x of passos) { assert.equal(x.d, ''); assert.ok(x.t.length <= 50, x.t); }
  // avança sozinho: a etapa 1 abre a comanda e a 2 começa sem ninguém tocar
  await esperar(async () => (await etapa()).startsWith('2/'), 30000);
  assert.equal(await p.evaluate(() => draft.place), 'Bar do Zé');
  // o ponteiro não cobre o texto que está sendo digitado
  await esperar(() => p.evaluate(() => document.querySelector('#person-name')?.value.length > 0), 15000);
  const ponta = await p.evaluate(() => { const f = document.querySelector('#person-name').getBoundingClientRect(), m = document.querySelector('.kf-gv-ponteiro').getBoundingClientRect(); return m.left > f.left + f.width / 2; });
  assert.ok(ponta, 'o ponteiro cobre o texto digitado');
  // pausar: tocar na tela pausa e nada anda; tocar de novo continua
  await p.mouse.click(5, 300);
  assert.equal(await p.locator('.kf-gv-pp').getAttribute('aria-label'), 'Continuar');
  const antes = await p.evaluate(() => draft.people.length + '|' + document.querySelector('#person-name').value);
  await p.waitForTimeout(2500);
  assert.equal(await p.evaluate(() => draft.people.length + '|' + document.querySelector('#person-name').value), antes, 'o guia andou pausado');
  await p.click('.kf-gv-pp');
  assert.equal(await p.locator('.kf-gv-pp').getAttribute('aria-label'), 'Pausar');
  // avançar para uma etapa ainda não vista faz as do meio na hora: na 4, os três pedidos já estão lançados
  await p.click('[data-gv="avancar"]'); await p.click('[data-gv="avancar"]');
  await esperar(async () => (await etapa()).startsWith('4/'), 20000);
  await esperar(() => p.evaluate(() => draft.items.length === 3), 20000);
  const demo = await p.evaluate(() => ({ ex: draft.isExample, pessoas: draft.people.map(x => x.name).join(), itens: draft.items.map(x => x.name + ':' + x.mode).sort().join() }));
  assert.deepEqual(demo, { ex: true, pessoas: 'Ana,Bruno,Carla,Diego', itens: 'Caipirinha:equal,Chopp:units,Porção de fritas:equal' });
  assert.equal(await p.evaluate(() => Object.keys(draft.items.find(x => x.name === 'Caipirinha').a).length), 2, 'a caipirinha não ficou só com Carla e Diego');
  // voltar: a etapa 3 recomeça do estado em que começou (sem pedidos)
  await p.click('[data-gv="voltar"]');
  await esperar(async () => (await etapa()).startsWith('3/'), 10000);
  assert.equal(await p.evaluate(() => draft.items.length), 0);
  assert.match(await titulo(), /pedido/i);
  // com a janela de lançar aberta, o player não cobre a janela
  await p.locator('.kf-ov [data-lc-modo]').first().waitFor({ timeout: 40000 });
  await p.waitForTimeout(700);
  const cobre = await p.evaluate(() => { const c = document.querySelector('.kf-gv-player').getBoundingClientRect(), d = document.querySelector('.kf-ov .kf-dlg').getBoundingClientRect(); return Math.max(0, Math.min(c.bottom, d.bottom) - Math.max(c.top, d.top)); });
  assert.ok(cobre < 60, `o player cobre ${Math.round(cobre)} px da janela de lançar`);
  // Esc fecha o guia (e a janela que ele abriu)
  await p.keyboard.press('Escape');
  await esperar(() => p.evaluate(() => !document.querySelector('.kf-gv') && !KitFacil.dialogo.aberto()), 5000);
  await p.click('#tab-inicio');
  await p.click('#end-example');
  assert.equal(await p.evaluate(() => draft.isExample), false);
  assert.equal(await p.evaluate(() => bills.length), 0, 'a demonstração salvou algo');
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

test('lançar pergunta como dividir; item novo no topo; Alterar troca o modo; turma e "quem é você" em lista', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await p.fill('input[placeholder="Nome do local"]', 'Bar do Teste'); await p.keyboard.press('Enter');
  for (const n of ['Ana', 'Bia', 'Caio']) { await p.fill('#person-name', n); await p.keyboard.press('Enter'); }
  const lancar = async (nome, qtd, preco) => { await p.fill('#item-name', nome); await p.fill('#item-qty', String(qtd)); await p.click('#item-price'); await p.keyboard.type(preco); await p.locator('#item-form button[type=submit]').click(); await p.locator('[data-lc-modo]').first().waitFor(); };
  // entre todos: confirmado e automático
  await lancar('Chopp', 3, '1290');
  // mesmo desenho do Alterar: "Tipo de consumo", Compartilhado ou Individual, com todos já marcados
  assert.deepEqual(await p.locator('[data-lc-modo]').allInnerTexts(), ['Compartilhado', 'Individual']);
  assert.match(await p.locator('.kf-dlg, .sheet').last().innerText(), /Tipo de consumo/i);
  assert.equal(await p.locator('[data-lc-ck][aria-pressed="true"]').count(), 3);
  await p.click('#lc-ok');
  assert.ok(await esperar(() => p.evaluate(() => draft.items.length === 1 && draft.items[0].lk && draft.items[0].auto)), 'o item não entrou confirmado');
  assert.equal(await p.locator('#tab-comanda .badge').count(), 0, 'número na aba Comanda sem item esperando');
  // consumo individual: escolhe a pessoa na lista
  await lancar('Água', 1, '500');
  await p.click('[data-lc-modo="units"]'); await p.click('[data-lc-un][data-dir="1"][aria-label$="Bia"]'); await p.click('#lc-ok');
  assert.ok(await esperar(() => p.evaluate(() => { const it = draft.items.find(x => x.name === 'Água'); return it && it.lk && Object.keys(it.a).length === 1; })), 'o consumo individual não ficou só com Bia');
  // o mais recente fica no topo, e o rodapé diz de quem é
  assert.equal(await p.locator('.items .item .item-name').first().innerText(), 'Água');
  assert.match(await p.locator('.items .item').first().locator('.share').last().innerText(), /Consumo individual/);
  assert.equal(await p.evaluate(() => draft.items.find(x => x.name === 'Água').mode), 'units', 'consumo individual não ficou por unidade');
  // consumo individual com 3 unidades: distribui na própria janela
  await lancar('Chopp preto', 3, '1500');
  await p.click('[data-lc-modo="units"]');
  assert.ok(await p.locator('#lc-ok').isDisabled());
  // o botão +1 continua o mesmo elemento depois do toque (o destaque do guia não se perde)
  const mais = p.locator('[data-lc-un][data-dir="1"]').nth(0), antes = await mais.elementHandle();
  await mais.click(); assert.ok(await antes.evaluate(e => e.isConnected), 'o +1 foi redesenhado');
  await mais.click(); await p.locator('[data-lc-un][data-dir="1"]').nth(2).click();
  await p.click('#lc-ok');
  assert.ok(await esperar(() => p.evaluate(() => { const it = draft.items.find(x => x.name === 'Chopp preto'); return it && it.mode === 'units' && it.lk && Object.values(it.a).join() === '2,1'; })), 'as unidades não ficaram 2 e 1');
  // o resumo aparece uma vez só no item compartilhado
  assert.equal(await p.evaluate(() => (document.querySelector(`[data-item="${draft.items.find(x => x.name === 'Chopp').id}"]`).innerText.match(/ cada/g) || []).length), 1, 'o resumo do item aparece repetido');
  // entre alguns: marca na lista e lança
  await lancar('Porção', 1, '4200');
  await p.click('[data-lc-ck]:has-text("Bia")'); await p.click('#lc-ok');
  assert.ok(await esperar(() => p.evaluate(() => { const it = draft.items.find(x => x.name === 'Porção'); return it && Object.keys(it.a).length === 2 && !it.auto; })), 'entre alguns não marcou Ana e Caio');
  // quem chega depois entra só no item "entre todos"
  await p.fill('#person-name', 'Duda'); await p.keyboard.press('Enter');
  assert.ok(await esperar(() => p.evaluate(() => Object.keys(draft.items.find(x => x.name === 'Chopp').a).length === 4 && Object.keys(draft.items.find(x => x.name === 'Porção').a).length === 2)), 'Duda entrou no item errado');
  // quem consumiu em lista vertical, sem chips lado a lado
  assert.equal(await p.locator('.items .chip').count(), 0, 'ainda há chips nos itens');
  assert.ok(await p.locator('.items .ck-row').count() >= 4);
  // Alterar troca o modo de divisão: Por unidade pede a distribuição
  await p.click('.item:has(.item-name:text-is("Chopp")) .item-name'); await p.click('.item:has(.item-name:text-is("Chopp")) [data-rename]');
  assert.deepEqual(await p.locator('[data-rn-modo]').allInnerTexts(), ['Compartilhado', 'Individual']);
  await p.click('[data-rn-modo="units"]'); await p.click('button[form="rn-form"]');
  assert.ok(await esperar(() => p.evaluate(() => { const it = draft.items.find(x => x.name === 'Chopp'); return it.mode === 'units' && !it.lk; })), 'Alterar não passou para consumo individual');
  assert.equal(await p.locator('#tab-comanda .badge').innerText(), '1');
  // quem é você, em lista suspensa
  await escolher(p, '#sou-sel', 'Bia');
  assert.equal(await p.evaluate(() => catalog.me), 'Bia');
  // turma no cadastro entra inteira na mesa, pela lista suspensa
  await p.evaluate(() => { catalog.people = [{ name: 'Edu', pix: '' }, { name: 'Fê', pix: '' }]; catalog.groups = [{ id: 'g1', name: 'Futebol', members: ['Edu', 'Fê'] }]; store.saveCatalog(); render(); });
  await escolher(p, '#turma-sel', 'Futebol · 2 pessoas a pôr');
  assert.ok(await esperar(() => p.evaluate(() => ['Edu', 'Fê'].every(n => draft.people.some(x => x.name === n)))), 'a turma não entrou na mesa');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('Pagamento: segurar um nome não rola a tela sozinho; arrastar junta no mesmo cupom', async () => {
  const a = await aparelho(amb, { viewport: { width: 390, height: 844 }, toque: true });
  const p = a.page;
  await p.evaluate(() => enterExample(true)); await p.waitForTimeout(300);
  await p.evaluate(() => document.querySelector('#tab-fechar').click()); await p.waitForTimeout(400);
  const pos = await p.evaluate(() => { const bs = [...document.querySelectorAll('#groups-card [data-unit]')]; bs[0].scrollIntoView({ block: 'center' }); const r = i => { const q = bs[i].getBoundingClientRect(); return { x: q.left + 40, y: q.top + 18 }; }; return { a: r(0), b: r(1), n: bs.length }; });
  const cdp = await p.context().newCDPSession(p);
  const y0 = await p.evaluate(() => scrollY);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: pos.a.x, y: pos.a.y }] });
  await p.waitForTimeout(900);
  assert.equal(await p.evaluate(() => scrollY), y0, 'a tela rolou só de segurar o nome');
  for (let i = 1; i <= 10; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: pos.a.x + (pos.b.x - pos.a.x) * i / 10, y: pos.a.y + (pos.b.y - pos.a.y) * i / 10 }] }); await p.waitForTimeout(25); }
  await p.waitForTimeout(200);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  assert.ok(await esperar(() => p.evaluate(n => document.querySelectorAll('#groups-card [data-unit]').length === n - 1, pos.n)), 'arrastar não juntou no mesmo cupom');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('Fechar: serviço com % ou R$; desligar o serviço de alguém abre a janela; resumo em lista', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await p.evaluate(() => enterExample(true)); await p.waitForTimeout(300);
  await p.evaluate(() => document.querySelector('#tab-fechar').click()); await p.waitForTimeout(300);
  assert.equal(await p.evaluate(() => getComputedStyle(document.querySelector('.sum-grid')).flexDirection), 'column', 'resumo ainda lado a lado');
  if (await p.locator('#svc-mudar').count()) await p.click('#svc-mudar');
  assert.deepEqual(await p.locator('[data-svcmode]').allInnerTexts(), ['%', 'R$']);
  assert.match(await p.inputValue('#svc-pct'), /^10/);
  await p.click('[data-svcmode="fixed"]');
  assert.ok(await p.locator('#svc-fixed').isVisible());
  assert.equal(await p.locator('[data-policy]').count(), 0, 'a escolha de quem não paga ainda está em Taxa de serviço');
  const sw = p.locator('[data-pay-svc]:checked').first();
  await sw.evaluate(el => el.click());
  await p.locator('[data-pol="redistribute"]').waitFor();
  await p.click('[data-pol="redistribute"]');
  assert.equal(await p.evaluate(() => draft.service.policy), 'redistribute');
  // sem "Quem vai pagar a conta?"; o atalho junta todos num cupom com quem paga
  assert.equal(await p.locator('[data-paymode]').count(), 0);
  await p.click('#pay-todos'); await p.click('[data-pt]:has-text("Carla")');
  assert.ok(await esperar(() => p.evaluate(() => draft.groups.length === 1 && draft.groups[0].members.length === draft.people.length && draft.groups[0].payers.length === 1)), 'o atalho não montou o cupom de todos');
  assert.equal(await p.locator('#groups-card [data-unit]').count(), 1);
  await p.click('#pay-separar');
  assert.ok(await esperar(() => p.evaluate(() => draft.groups.length === 0)));
  // desconto com os rótulos novos
  assert.equal(await p.evaluate(() => [...document.querySelectorAll('[data-dsat]')].map(b => b.textContent).join(' | ') || 'sem desconto'), await p.evaluate(() => [...document.querySelectorAll('[data-dsat]')].length ? 'No valor total da comanda | Apenas no valor do consumo' : 'sem desconto'));
  assert.deepEqual(a.erros, []);
  await a.fechar();
});


test('tablet deitado e computador: a janela fica no centro da área do app, à direita do trilho; cupons centralizados', async () => {
  const a = await aparelho(amb, { viewport: { width: 1152, height: 720 } });
  const p = a.page;
  await p.click('#go-example');
  await p.waitForTimeout(400);
  await p.click('#trilho-comanda');
  await p.fill('#item-name', 'Chopp'); await p.click('#item-price'); await p.keyboard.type('1290');
  await p.locator('#item-form button[type=submit]').click();
  await p.locator('.kf-ov .kf-dlg').waitFor();
  const centro = await p.evaluate(() => { const d = document.querySelector('.kf-ov .kf-dlg').getBoundingClientRect(), v = document.querySelector('#view').getBoundingClientRect(); return Math.abs((d.left + d.right) / 2 - (v.left + v.right) / 2); });
  assert.ok(centro < 4, `janela fora do centro da área do app (${Math.round(centro)} px)`);
  await p.evaluate(() => KitFacil.dialogo.fechar(true)); await p.waitForTimeout(400);
  await p.click('#trilho-fechar');
  const cup = await p.evaluate(() => { const w = [...document.querySelectorAll('.receipt-wrap')].map(e => e.getBoundingClientRect()), r = document.querySelector('.receipts').getBoundingClientRect(); return { largura: Math.max(...w.map(x => x.width)), lado: w.length > 1 && Math.abs(w[0].top - w[1].top) < 2, folgaEsq: w[0].left - r.left, folgaDir: r.right - Math.max(...w.map(x => x.right)) }; });
  assert.ok(cup.largura <= 360, `cupom largo demais (${cup.largura} px)`);
  assert.ok(cup.lado, 'em tela larga, os cupons deviam ficar dois por linha');
  assert.ok(Math.abs(cup.folgaEsq - cup.folgaDir) < 4, 'cupons fora do centro');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});
