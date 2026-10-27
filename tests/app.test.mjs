/* Conta Fácil · testes do app (npm test). Rodam num Chromium, sem internet:
   o GitHub (sincronização) e o Firestore (avaliações) são simulados por comum/testes/ambiente.mjs. */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { preparar, aparelho, githubFalso, firestoreFalso, semRolagemLateral, TOKEN_TESTE, RAIZ } from '../comum/testes/ambiente.mjs';

let amb, versao;
before(async () => { amb = await preparar(); versao = JSON.parse(await readFile(RAIZ + '/package.json', 'utf8')).version; });
after(async () => { await amb?.encerrar(); });
const esperar = async (cond, ms = 8000) => { const fim = Date.now() + ms; while (Date.now() < fim) { if (await cond()) return true; await new Promise(r => setTimeout(r, 50)); } return false; };
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
    await a.page.click('#go-ajustes');
    await a.page.locator('.aj-head h2').waitFor();
    assert.ok(await semRolagemLateral(a.page), `rolagem lateral nos Ajustes no ${nome}`);
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

test('Ajustes: seções do padrão, versão, e o Voltar do navegador fecha a tela', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await p.click('#tab-historico');
  await p.click('#go-ajustes');
  const t = await p.textContent('#view');
  for (const s of ['Usar em vários aparelhos', 'Aparência', 'Cópia de segurança', 'Ajude a melhorar', 'Sobre e privacidade', `Conta Fácil ${versao}`]) assert.ok(t.includes(s), `falta "${s}" nos Ajustes`);
  assert.equal(await p.getAttribute('#go-ajustes', 'aria-current'), 'page');
  await p.goBack();
  assert.ok(await esperar(async () => (await p.getAttribute('#tab-historico', 'aria-selected')) === 'true'), 'o Voltar não voltou para o Histórico');
  await p.click('#go-ajustes');
  await p.click('#aj-voltar');
  assert.ok(await esperar(async () => (await p.getAttribute('#tab-historico', 'aria-selected')) === 'true'));
  await p.click('#go-ajustes');
  await p.click('#tab-cadastros');
  assert.equal(await p.getAttribute('#tab-cadastros', 'aria-selected'), 'true');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('avaliação: sai do app com o nome do app, a versão e a tela', async () => {
  const fs = firestoreFalso();
  const a = await aparelho(amb, { firestore: fs });
  const p = a.page;
  await p.click('#go-ajustes');
  await p.click('#view [data-kf="avaliar"]');
  await p.click('label[for="kf-n5"]');
  await p.click('.kf-opcao:has-text("Elogio")');
  await p.fill('#kf-msg', 'Dividir a conta ficou fácil.');
  await p.click('[data-kf-enviar]');
  await p.locator('text=Recebemos sua mensagem').waitFor();
  const [doc] = [...fs.estado.docs.values()];
  assert.equal(doc.dados.app, 'conta-facil');
  assert.equal(doc.dados.versao, versao);
  assert.equal(doc.dados.tela, 'ajustes');
  assert.equal(doc.dados.tipo, 'elogio');
  assert.equal(fs.estado.recusas.length, 0);
  await a.fechar();
});

test('tema escuro escolhido nos Ajustes vale para o app todo', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  const claro = await p.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await p.click('#go-ajustes');
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
  await A.page.click('#go-ajustes');
  await A.page.click('#aj-sync [data-kf="sync-ativar"]');
  await A.page.fill('#kf-token', TOKEN_TESTE);
  await A.page.click('[data-kf-conectar]');
  assert.ok(await esperar(() => A.page.evaluate(() => SY.ligada() && SY.estado.lastSync > 0)), 'A não sincronizou');
  assert.match(await A.page.textContent('#sync'), /Sincronizado/);
  const arq = gh.arquivo('conta-facil.json');
  assert.ok(arq && !/Bar do Teste/.test(arq.conteudo), 'o gist deveria estar criptografado');

  await salvarComanda(B.page, 'Restaurante B', ['Carla'], { nome: 'Suco', qtd: 1, preco: 900 });
  await B.page.click('#go-ajustes');
  await B.page.click('#aj-sync [data-kf="sync-ativar"]');
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
  await p.click('#go-ajustes');
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#bk-baixar')]);
  assert.match(dl.suggestedFilename(), /^conta-facil-copia-\d{4}-\d{2}-\d{2}\.json$/);
  const caminho = await dl.path();
  const copia = JSON.parse(await readFile(caminho, 'utf8'));
  assert.equal(copia.formato, 'copia-facil');
  assert.equal(copia.app, 'conta-facil');
  assert.equal(copia.dados.bills.length, 1);
  await p.evaluate(() => { bills = []; store.saveBill(); catalog.people = []; store.saveCatalog(); render(); });
  await p.setInputFiles('#bk-file', caminho);
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
