/* Conta Fácil · moldura (navegação e troca de tela), Ajustes, abertura (onboarding), guia e arranque do app. */

/* ---------- navegação ---------- */
const TELAS = { inicio: viewInicio, comanda: viewComanda, historico: viewHistorico, tampinhas: viewTampinhas, cadastros: viewCadastros, mais: viewMais };
const TITULOS = { inicio: 'Início', comanda: 'Comanda', historico: 'Histórico', tampinhas: 'Tampinhas', cadastros: 'Cadastros', mais: 'Mais', ajustes: 'Ajustes' };
function irPara(t, { topo = true } = {}) {
  if (t === 'comanda' && !draft.active) { novaComandaSheet(); return; }
  if (t === 'ajustes') { abrirAjustes(); return; }
  sairDosAjustes();
  closeSheet(true);
  tab = t;
  render({ anchor: false });
  if (topo) window.scrollTo({ top: 0 });
}
// a barra de baixo e o trilho são os do Kit (KitFacil.nav.barra e .trilho): a comanda no centro, "Mais" por último
function pintarNav() {
  const ativa = draft.active, abertos = ativa && !draft.isExample ? draft.items.filter(it => !it.lk).length : 0;
  const selo = abertos ? `<span class="kf-nav-selo"><span aria-hidden="true">${abertos}</span><span class="kf-so-leitor">, ${plural(abertos, 'item espera', 'itens esperam')} a divisão</span></span>` : '';
  const quarto = jogoLigado() ? { id: 'tampinhas', rotulo: 'Tampinhas', icone: I.tampa } : { id: 'cadastros', rotulo: 'Cadastros', icone: I.users };
  const naMais = tab === 'mais' || (tab === 'cadastros' && quarto.id !== 'cadastros');
  const it = (id, rotulo, icone) => ({ id, rotulo, icone, atual: tab === id });
  const html = KitFacil.nav.barra({ itens: [it('inicio', 'Início', I.home), it('historico', 'Histórico', I.clock), { ...quarto, atual: tab === quarto.id }],
    centro: { id: 'comanda', rotulo: ativa ? 'Comanda' : 'Nova', nome: ativa ? 'Comanda' + (draft.place ? ' de ' + draft.place : '') : 'Nova comanda', icone: ativa ? I.receipt : I.plus, atual: tab === 'comanda', selo },
    mais: { atual: naMais } });
  const nav = $('#tabs'); if (nav.dataset.h !== html) { nav.innerHTML = html; nav.dataset.h = html; }
  const lado = KitFacil.nav.trilho({ destaque: { id: 'comanda', rotulo: ativa ? (draft.place || 'Comanda aberta') : 'Nova comanda', icone: ativa ? I.receipt : I.plus, atual: tab === 'comanda', selo },
    itens: [it('inicio', 'Início', I.home), it('historico', 'Histórico', I.clock), ...(jogoLigado() ? [it('tampinhas', 'Tampinhas', I.tampa)] : []), it('cadastros', 'Cadastros', I.users)],
    mais: { atual: tab === 'mais' } });
  const t = $('#trilho'); if (t.dataset.h !== lado) { t.innerHTML = lado; t.dataset.h = lado; }
}
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-ir], [data-kf-ir]'); if (!b) return;
  e.preventDefault(); irPara(b.dataset.ir || b.dataset.kfIr);
});
$('#marca').addEventListener('click', () => irPara('inicio'));

/* ---------- desenhar a tela ---------- */
function render(opts = {}) {
  let anc = null;
  if (opts.anchor !== false) {
    const t = lastPress.target;
    const from = opts.anchor?.from || (Date.now() - lastPress.at < 900 && t?.closest?.('#view') ? anchorKey(t) : null);
    const el = from && $(from);
    if (el) anc = { to: opts.anchor?.to || from, y: el.getBoundingClientRect().top };
  }
  // ao receber mudanças de outras pessoas, mantém o que você está digitando
  let keep = null, focusId = null, sel = null;
  if (opts.preserve) {
    keep = {}; $$('#view input[data-keep]').forEach(i => keep[i.id] = i.value);
    const a = document.activeElement; if (a && a.id && a.closest('#view')) { focusId = a.id; try { sel = [a.selectionStart, a.selectionEnd]; } catch {} }
  }
  if (tab === 'fechar') tab = 'comanda';
  if (!draft.active && tab === 'comanda') tab = 'inicio';
  if (tab === 'tampinhas' && !jogoLigado()) tab = 'mais';
  if (!TELAS[tab] && tab !== 'ajustes') tab = 'inicio';
  pintarNav();
  const v = $('#view'), fn = tab === 'ajustes' ? viewAjustes : TELAS[tab];
  $('.wrap').classList.toggle('largo', tab === 'ajustes');
  const trocou = v.dataset.telaAtual !== tab; v.dataset.telaAtual = tab;
  const desenhar = () => { v.innerHTML = `<section class="view view-${tab}">${tab === 'comanda' ? '<h1 class="so-leitor">Comanda</h1>' : ''}${fn.html()}</section>`; fn.bind(v); };
  // na mesma tela, o que abre e o que recolhe ganha movimento; ao trocar de tela, vale a entrada da tela
  if (trocou) desenhar(); else comMovimento(v, desenhar);
  document.body.dataset.tela = tab;
  if (trocou) { KitFacil.movimento.entrar(v, { de: 'tela' }); document.title = tab === 'inicio' ? 'Conta Fácil' : `${TITULOS[tab]} · Conta Fácil`; }
  prepFields(v);
  renderSync();
  if (keep) {
    Object.entries(keep).forEach(([id, val]) => { const i = document.getElementById(id); if (i) i.value = val; });
    if (focusId) { const f = document.getElementById(focusId); if (f) { f.focus({ preventScroll: true }); try { sel && f.setSelectionRange(sel[0], sel[1]); } catch {} } }
  }
  if (anc) { const el = $(anc.to); if (el) { const dy = el.getBoundingClientRect().top - anc.y; if (Math.abs(dy) > 1) window.scrollBy(0, dy); } }
  mostrarItemNovo();
  clearTimeout(render.t); render.t = setTimeout(() => { if (!draft.isExample) jogoConferir({ silencioso: guiaAtivo() }); tampaFilaMostrar(); }, 700);
}
// a barra de cima ganha uma linha quando a tela rola
addEventListener('scroll', () => $('#barra').classList.toggle('rolou', scrollY > 4), { passive: true });

/* ---------- Ajustes (guias do Kit Fácil, mais as do Conta Fácil) ---------- */
let tabAntesAjustes = 'inicio';
function abrirAjustes() {
  if (tab === 'ajustes') return;
  tabAntesAjustes = tab; tab = 'ajustes';
  try { history.pushState({ ajustes: true }, ''); } catch {}
  closeSheet(); render({ anchor: false }); window.scrollTo({ top: 0 });
}
function fecharAjustes() {
  if (tab !== 'ajustes') return;
  if (history.state && history.state.ajustes) { history.go(history.state.kfAjPush ? -2 : -1); return; }
  tab = tabAntesAjustes; render({ anchor: false }); window.scrollTo({ top: 0 });
}
function sairDosAjustes() { if (tab === 'ajustes' && history.state && history.state.ajustes) { tab = tabAntesAjustes; history.go(history.state.kfAjPush ? -2 : -1); } }
window.addEventListener('popstate', () => { if (tab === 'ajustes' && !(history.state && history.state.ajustes)) { tab = tabAntesAjustes; closeSheet(); render({ anchor: false }); window.scrollTo({ top: 0 }); } });
const viewAjustes = {
  html() {
    const pessoas = [...catalog.people].sort(ordemNome), s = jogoEstado();
    const chave = (id, on, titulo, sub) => `<label class="aj-chave"><span class="lin-tx"><b>${titulo}</b><small>${sub}</small></span><span class="kf-chave"><input type="checkbox" id="${id}" ${on ? 'checked' : ''}><span class="kf-chave-trilho"></span></span></label>`;
    return KitFacil.ajustes.html({
      extras: {
        conta: `<div class="kf-bloco"><h3>Você nas comandas</h3>
          <form id="aj-me-f" class="field" autocomplete="off"><label for="aj-me">Seu nome</label>
            <div class="aj-me-l"><input id="aj-me" type="text" class="kf-entrada" list="aj-me-lista" autocapitalize="words" maxlength="40" placeholder="Seu nome ou apelido" value="${esc(catalog.me || '')}" enterkeyhint="done"><button type="submit" class="btn small">Salvar</button></div>
            <datalist id="aj-me-lista">${pessoas.map(p => `<option value="${esc(p.name)}"></option>`).join('')}</datalist></form></div>`,
      },
      resumos: { conta: catalog.me ? `Você é ${catalog.me}` : undefined, preferencias: 'Idioma e instalação do app' },
      produto: [{ id: 'comandas', titulo: 'Tampinhas e apresentação', icone: '<path d="M6 3.500h12v17l-3-2-3 2-3-2-3 2z"/><path d="M9.500 8.500h5M9.500 12.500h5"/>', resumo: jogoLigado() ? `Nível ${s.nivel} · ${s.ganhas.length} de ${TAMPINHAS.length} tampinhas` : 'Tampinhas desligadas',
        html: `<div class="kf-bloco"><h3>Tampinhas e níveis</h3>${chave('aj-jogo', jogoLigado(), 'Mostrar tampinhas e níveis', 'Desligado, o app fica só com as comandas. Nada é apagado.')}</div>
          <div class="kf-bloco"><h3>Apresentação</h3><p class="kf-ajuda">As telas que aparecem na primeira vez que o app abre. O guia e a comanda de exemplo ficam em Mais.</p><button type="button" class="kf-btn kf-sec" id="aj-abertura">Rever a apresentação</button></div>` }],
    });
  },
  bind(v) {
    KitFacil.ajustes.ligar(v);
    $('#aj-me-f', v)?.addEventListener('submit', e => { e.preventDefault(); const el = $('#aj-me', v), eu = definirEu(el.value); el.value = eu; el.blur();
      KitFacil.ajustes.resumo('conta', eu ? `Você é ${eu}` : 'Sem cadastro · dados neste aparelho'); KitFacil.avisar(eu ? `Pronto: você é ${eu}.` : 'Nome desmarcado.'); jogoConferir(); });
    $('#aj-jogo', v)?.addEventListener('change', e => { jogo.off = !e.target.checked; jogoSalvar(); pintarNav(); const s = jogoEstado(); KitFacil.ajustes.resumo('comandas', jogoLigado() ? `Nível ${s.nivel} · ${s.ganhas.length} de ${TAMPINHAS.length} tampinhas` : 'Tampinhas desligadas'); KitFacil.avisar(jogoLigado() ? 'Tampinhas e níveis ligados.' : 'Tampinhas e níveis desligados.'); });
    $('#aj-abertura', v)?.addEventListener('click', () => aberturaAbrir({ rever: true }));
  },
};

/* ---------- janelas: o mecanismo único (nascer, acompanhar o teclado, mudar de altura, trocar e sair pelo pé) é o
   do Kit Fácil 0.7.0, que veio daqui (Código, Art. 68, § 3º) ---------- */

/* ---------- abertura (onboarding) ---------- */
// figura de um QR code para a apresentação: os três cantos, as linhas de sincronia e um miolo de módulos (não é um código de verdade)
const QR_FIGURA = (() => { const N = 25, on = new Set(), k = (x, y) => x + ',' + y, canto = (cx, cy) => { for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) if (x === 0 || x === 6 || y === 0 || y === 6 || (x > 1 && x < 5 && y > 1 && y < 5)) on.add(k(cx + x, cy + y)); };
  const livre = (x, y) => !((x < 8 && y < 8) || (x > N - 9 && y < 8) || (x < 8 && y > N - 9));
  canto(0, 0); canto(N - 7, 0); canto(0, N - 7);
  for (let i = 8; i < N - 8; i += 2) { on.add(k(i, 6)); on.add(k(6, i)); }
  for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) if (x === 0 || x === 4 || y === 0 || y === 4 || (x === 2 && y === 2)) on.add(k(N - 9 + x, N - 9 + y));
  let s = 20261114; const rnd = () => (s = (s * 1103515245 + 12345) >>> 0, (s >>> 16) / 65536);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (livre(x, y) && x !== 6 && y !== 6 && !(x > N - 10 && x < N - 4 && y > N - 10 && y < N - 4) && rnd() < 0.47) on.add(k(x, y));
  let d = ''; for (const p of on) { const [x, y] = p.split(','); d += `M${x} ${y}h1v1h-1z`; }
  return `<svg class="ab-qr" viewBox="-2 -2 ${N + 4} ${N + 4}" aria-hidden="true" shape-rendering="crispEdges"><rect x="-2" y="-2" width="${N + 4}" height="${N + 4}" rx="1.500" fill="#fff"/><path d="${d}" fill="#24221C"/></svg>`; })();
const aberturaAtiva = () => KitFacil.abertura.ativa();
function aberturaAbrir({ rever = false } = {}) {
  if (aberturaAtiva()) return;
  const veterano = bills.length > 0 || catalog.people.length > 0;
  const DEMO = { nome: 'Porção de fritas', preco: 4200, gente: ['Ana', 'Bruno', 'Carla'] };
  const marcados = new Set(DEMO.gente); let tocouDemo = false;
  const demoHTML = () => { const n = marcados.size, parte = n ? allocate(DEMO.preco, [...marcados].map(() => 1)) : [];
    let k = 0; return `<div class="papel topo-serrilha ab-demo"><div class="mono ab-demo-item"><span>1× ${DEMO.nome}</span><span>${BRL(DEMO.preco).replace('R$', '').trim()}</span></div>
      ${DEMO.gente.map(g => { const on = marcados.has(g), v = on ? parte[k++] : 0; return `<button type="button" class="ab-demo-p mono ${on ? 'on' : ''}" data-ab-p="${g}" aria-pressed="${on}"><span class="ab-box" aria-hidden="true">${on ? '✓' : ''}</span><span>${g}</span><span class="ab-v">${on ? BRL(v).replace('R$', '').trim() : 'não dividiu'}</span></button>`; }).join('')}
      <p class="mono ab-demo-r" role="status">${n ? (n === DEMO.gente.length ? 'Entre todos' : n === 1 ? 'Só uma pessoa paga' : `Entre ${n}`) + ` · ${BRL(Math.round(DEMO.preco / n))} cada` : 'Marque quem dividiu'}</p></div>`; };
  const s = jogoEstado();
  const telas = [
    { arte: `<div class="imp ab-imp"><div class="imp-boca"></div><div class="imp-saida"><div class="papel imp-papel sai"><span class="mono fp-marca">CONTA FÁCIL</span><span class="mono fp-local">Cantina da Praça</span><span class="fp-linha"></span>
        <span class="mono ab-l"><span>Ana</span><span>77,09</span></span><span class="mono ab-l"><span>Bruno</span><span>64,18</span></span><span class="mono ab-l"><span>Carla</span><span>99,67</span></span><span class="mono fp-tot"><span>TOTAL</span><span>R$ 240,94</span></span></div></div></div>`,
      titulo: veterano && !rever ? 'O Conta Fácil está de cara nova' : 'A conta da mesa, sem calculadora',
      texto: veterano && !rever ? 'Suas comandas, cadastros e chaves Pix continuam aqui. A mesa agora é uma comanda só, de papel.' : 'Cada um paga o que consumiu. O app soma serviço, couvert e desconto e diz quanto é de cada pessoa.' },
    { arte: () => demoHTML(), falada: true, titulo: 'Marque quem consumiu', texto: 'Experimente: toque num nome para tirar ou pôr alguém na divisão. A parte de cada um muda na hora.' },
    { arte: `<div class="ab-leque"><div class="papel ab-cupom c1"><span class="mono">Carla</span><span class="fp-linha"></span><span class="mono ab-l"><span>Total</span><span>99,67</span></span></div>
        <div class="papel ab-cupom c3"><span class="mono">Bruno</span><span class="fp-linha"></span><span class="mono ab-l"><span>Total</span><span>64,18</span></span><span class="fp-carimbo">PAGO</span></div>
        <div class="papel ab-cupom c2"><span class="mono">Ana</span><span class="fp-linha"></span><span class="mono ab-l"><span>Total</span><span>77,09</span></span>${QR_FIGURA}<span class="mono ab-pix">Pix copia e cola</span></div></div>`,
      titulo: 'Um cupom para cada pessoa', texto: 'Feche a comanda e mande o cupom de cada um, com o Pix copia e cola e o QR code. Marque quem já pagou.' },
    { arte: `<div class="ab-tampas">${['primeira', 'pix', 'mesa-cheia', 'ao-vivo', 'explorador'].map((id, k) => `<span class="ab-tampa" style="--i:${k}">${tampaSVG(TAMPINHAS.find(t => t.id === id))}</span>`).join('')}</div>`,
      titulo: veterano ? `Você já chega com ${plural(s.ganhas.length, 'tampinha', 'tampinhas')}` : 'Junte tampinhas pelo caminho',
      texto: 'Usar o app rende tampinhas e níveis. É só uma brincadeira, e dá para desligar nos Ajustes.',
      extra: catalog.me ? '' : `<div class="field ab-nome"><label for="ab-eu">Como chamam você na mesa? (opcional)</label><input id="ab-eu" class="kf-entrada" type="text" autocapitalize="words" autocomplete="off" maxlength="40" placeholder="Seu nome ou apelido"></div>` },
  ];
  KitFacil.abertura.abrir({ telas, rever, rotulo: 'Apresentação do Conta Fácil',
    fim: () => rever ? 'Concluir' : draft.active ? 'Começar a usar' : 'Abrir uma comanda',
    extra: { rotulo: 'Ver uma comanda de exemplo', mostrar: () => !rever && !draft.active },
    aoMontar: (el, { redesenharArte }) => {
      el.addEventListener('click', e => { const b = e.target.closest('[data-ab-p]'); if (!b) return; const g = b.dataset.abP; marcados.has(g) ? marcados.delete(g) : marcados.add(g); tocouDemo = true; redesenharArte(); $(`[data-ab-p="${g}"]`, el)?.focus({ preventScroll: true }); });
    },
    aoFechar: ({ como, ultima, el }) => {
      const inp = $('#ab-eu', el), nome = inp ? inp.value.trim() : '';
      const disseQuemE = !!nome && !catalog.me && !!definirEu(nome);
      if (tocouDemo || ultima) jogo.flags.abertura = jogo.flags.abertura || Date.now();
      jogoSalvar(); jogoConferir({ silencioso: true });
      render({ anchor: false });
      const depois = como === 'extra' ? () => enterExample() : como === 'fim' && !rever && !draft.active ? () => novaComandaSheet() : null;
      // quem disse o nome na apresentação já vê a primeira tampinha ("Prazer, eu"); o que vinha depois espera a janela fechar
      const t = disseQuemE && jogoLigado() && TAMPINHAS.find(x => x.id === 'voce');
      return () => { if (t) setTimeout(() => tampaNova([t], () => { depois && depois(); }), semMovimento() ? 0 : 320); else depois && depois(); };
    } });
}

/* ---------- presente: a janela do apoio (presente em 3D, convite, QR code e Copiar código Pix) é a do Kit ---------- */

/* ---------- guia: o app faz cada passo na tela, do começo ao fim, numa demonstração que não grava nada ----------
   O motor (janela fixa acima da barra, contagem, dedo, anel e as mãos) é o do Kit (KitFacil.guia.demonstrar); aqui ficam
   o roteiro, a troca dos dados reais pelos da demonstração e a mão própria de arrastar um nome sobre outro cupom. */
let guiaDeixaTampa = false;
const guiaAtivo = () => KitFacil.guia.emDemonstracao();
const dorme = ms => new Promise(r => setTimeout(r, ms));
const quadro = () => new Promise(r => requestAnimationFrame(r));
const guiaFoto = () => JSON.stringify({ draft, bills, catalog, jogo, tab, cadAba, pesAberto, itemAberto });
const guiaSemAviso = () => $$('.kf-toast').forEach(e => { e.hidden = true; });
function guiaLimparTela() { $('#festa-ok')?.click(); closeSheet(true); guiaSemAviso(); guiaDeixaTampa = false; tampaFila = []; }
function guiaZerarTela() { canAberto = ''; canValor = ''; barraDe = null; pending = {}; itPend = {}; pesJuntando = false; pesSvc = false; pesCv = false; if (drag.on) dragEnd(false); jogoMemo.chave = ''; cacheBills = new WeakMap(); }
function guiaIniciar() {
  if (guiaAtivo() || aberturaAtiva()) return;
  if (draft.live) { KitFacil.avisar('Saia da comanda ao vivo antes de ver o guia.'); return; }
  KitFacil.guia.demonstrar({
    passos: GUIA,
    comecar: () => {
      sairDosAjustes(); closeSheet(true);
      // os dados de verdade ficam guardados na memória; a demonstração começa do zero e nada dela é gravado
      dadosReais = { bills, catalog, jogo, draft };
      semSalvar = true;
      bills = []; catalog = fixCatalog({}); jogo = { flags: {}, vistas: {}, off: jogo.off, pronto: true };
      draft = blankDraft(); pesAberto = null; itemAberto = null; tab = 'inicio'; cadAba = 'pessoas'; tampaFila = []; guiaZerarTela();
      render({ anchor: false }); window.scrollTo({ top: 0 });
    },
    foto: guiaFoto,
    limpar: guiaLimparTela,
    restaurar: f => {
      if (tab === 'ajustes') sairDosAjustes();
      const o = JSON.parse(f);
      draft = o.draft; bills = o.bills; catalog = o.catalog; jogo = o.jogo; tab = o.tab; cadAba = o.cadAba; pesAberto = o.pesAberto; itemAberto = o.itemAberto;
      guiaZerarTela(); render({ anchor: false }); window.scrollTo({ top: 0 });
    },
    terminar: ({ concluiu }) => {
      if (tab === 'ajustes') sairDosAjustes();
      const r = dadosReais; dadosReais = null; semSalvar = false;
      bills = r.bills; catalog = r.catalog; jogo = r.jogo; draft = r.draft.isExample ? loadRealDraft() : r.draft;
      pesAberto = null; itemAberto = null; cadAba = 'pessoas'; tab = 'inicio'; guiaZerarTela();
      render({ anchor: false }); window.scrollTo({ top: 0 });
      if (concluiu) { jogoMarcar('guia'); KitFacil.avisar('Guia concluído. Para rever, toque em Mais e em Ver o guia.'); }
    },
    // na comanda, o cabeçalho de papel também fica preso no alto
    cabecalhoFixo: () => $('#view .cu-cab'),
    // segura um nome e arrasta sobre outro cupom: o atalho de juntar, feito com o mesmo código do dedo de verdade
    maos: m => {
      return {
      arrastarAte: async (qDe, qPara) => {
        const de = await m.acha(qDe); await m.levar(de); m.vivo();
        const r = de.getBoundingClientRect(), x0 = r.left + Math.min(96, r.width / 3), y0 = r.top + r.height / 2;
        m.por(x0, y0); await m.espera(320); m.vivo();
        const src = dragSource(de); if (!src) throw new Error('guia: não deu para arrastar ' + qDe);
        const escudo = $('#kf-gu-escudo');
        m.dedo.style.transition = 'opacity .2s'; m.dedo.classList.add('kf-toca'); await m.espera(420); m.vivo(); // o toque demorado que levanta o cupom
        if (escudo) escudo.style.pointerEvents = 'none'; // o destino é achado pelo ponto da tela: o escudo não pode ficar na frente
        drag.pend = { ...src, x: x0, y: y0 }; dragStart(x0, y0);
        try {
          await m.espera(380);
          const para = await m.acha(qPara), rp = para.getBoundingClientRect(), x1 = rp.left + Math.min(150, rp.width / 2), y1 = rp.top + rp.height / 2;
          const n = m.rapido() || semMovimento() ? 3 : 46;
          for (let k = 1; k <= n; k++) { m.vivo(); const f = 0.5 - Math.cos(Math.PI * k / n) / 2, x = x0 + (x1 - x0) * f, y = y0 + (y1 - y0) * f; dragMove(x, y); m.por(x, y); await quadro(); }
          await m.espera(520);
        } finally { dragEnd(true); if (escudo) escudo.style.pointerEvents = ''; m.dedo.classList.remove('kf-toca'); m.dedo.style.transition = ''; }
        await dorme(380); m.vivo(); await m.espera(800);
      },
      };
    },
  });
}
const demoId = n => draft.people.find(p => p.name === n)?.id || '';
const demoItem = n => draft.items.find(x => x.name === n)?.id || '';
const demoUn = n => { const c = compute(draft); return c.unitOf[demoId(n)] || ''; };
const navQ = t => `#kf-nav-${t}, #kf-trilho-${t}`;
// abre a linha de uma pessoa (ou de um pedido) se ainda estiver fechada
async function demoAbrir(m, q) { const sm = await m.acha(q); if (!sm.parentElement.open) { await m.tocar(sm); await m.espera(450); } }
// lança um pedido na janela de lançar: nome, quantidade (pelo +), valor e a divisão
async function demoLancar(m, { nome, mais = 0, preco, individual, fora, olhar }) {
  await m.tocar('#it-novo'); await m.acha('#pr-nome');
  await m.digitar('#pr-nome', nome);
  for (let k = 0; k < mais; k++) await m.tocar('[data-kf-passo="1"]', { depois: 160 });
  await m.digitar('#pr-preco', preco, { ritmo: 110 });
  // a lista de quem dividiu sobe para o alto da janela: assim todos os nomes ficam à vista
  if (individual || fora || olhar) await m.rolar('#lc-modo', 34);
  if (olhar) await m.apontar(olhar, 1500);
  if (individual) { await m.tocar('[data-lc-modo="units"]'); for (const [n, q] of individual) for (let k = 0; k < q; k++) await m.tocar(`[data-lc-un="${demoId(n)}"][data-dir="1"]`, { depois: 200 }); }
  for (const n of fora || []) await m.tocar(`[data-lc-ck="${demoId(n)}"]`, { depois: 260 });
  if (fora) await m.apontar('#lc-resumo', 1300);
  await m.espera(400);
  await m.tocar('#lc-ok'); await m.some('#pr-nome'); await m.espera(700);
}
// vai para uma tela da barra de baixo; se ela já está aberta, não toca de novo
async function demoIr(m, t) { if (tab !== t || (t === 'mais' && !$('#view #ma-sorteio'))) await m.tocar(navQ(t)); }
// abre os Cadastros (em Mais) na aba pedida, tocando só no que falta
async function demoCadastros(m, aba) {
  if (!$('#view [data-cad]')) { await demoIr(m, 'mais'); await m.tocar('#view [data-ir="cadastros"]'); }
  if (aba && cadAba !== aba) await m.tocar(`#view [data-cad="${aba}"]`);
}
// a comanda fechada (canhotos) está na tela? Se não, o passo fecha a comanda como a pessoa faria
async function demoFechada(m) { if (!draft.fechada) { await m.tocar('#fechar-cmd'); await m.acha('#cf'); await m.espera(1600); } }
// o canhoto de uma pessoa (pelo cupom em que ela está) e o toque que o abre, se ainda estiver fechado
const demoCan = nome => { const u = compute(draft).units.find(x => x.members.includes(demoId(nome))); return `#view [data-can="${u ? u.id : ''}"]`; };
async function demoAbrirCan(m, can) { if ($(`${can} [data-can-abre]`)?.getAttribute('aria-expanded') !== 'true') { await m.tocar(`${can} [data-can-abre]`); await m.acha(`${can} .cf-dentro`); await m.espera(700); } }
// Ver cupom, no canhoto aberto: a janela mostra o cupom, e toda a área de pagamento fica à vista num anel só (o título
// PAGAMENTO e as linhas dele; destaque de área do Kit 0.9.0). Depois, a janela fecha
async function demoVerPagamento(m, can, ms = 2400) {
  await m.tocar(`${can} [data-can-cupom]`); await m.acha('.kf-dlg .receipt'); await m.espera(700);
  const s = $$('.kf-dlg .rc-section').filter(e => /PAGAMENTO/.test(e.textContent) && !e.closest('#kf-saidas')).pop();
  if (!s) await m.apontar('.kf-dlg .receipt', ms);
  else { const L = [s]; for (let e = s.nextElementSibling; e && e.matches('.rc-line, .rc-detail'); e = e.nextElementSibling) L.push(e); await m.rolar(s, 46); await m.apontar(L, ms); }
  await m.fechar(); await m.some('.kf-dlg .receipt');
}
// toca e não deixa o aviso com Desfazer aparecer por cima do dedo: no guia, o aviso some assim que nasce
async function demoTocarSemAviso(m, q, ms = 700) { await m.tocar(q, { depois: 0 }); for (let t = 0; t < ms; t += 60) { guiaSemAviso(); await m.espera(60); } guiaSemAviso(); }
/* O roteiro. Todo passo faz a ação de verdade na demonstração (não só aponta) e termina com as janelas fechadas. */
const GUIA = [
  { t: 'Comece pelo nome do lugar', d: 'No Início, escreva onde você está e toque em Abrir comanda.',
    acao: async m => { await m.digitar('#ini-local', 'Cantina da Praça'); await m.tocar('#ini-form button[type=submit]'); await m.acha('#add-pessoa'); } },
  { t: 'Ponha as pessoas na mesa', d: 'Escreva o nome de cada um e toque em Adicionar. Quem tem cadastro é sugerido.',
    acao: async m => { await m.tocar('#add-pessoa'); for (const n of ['Ana', 'Bruno', 'Carla', 'Diego']) { await m.digitar('#pn-nome', n, { ritmo: 70 }); await m.tocar('#pn-add', { depois: 260 }); } await m.fechar(); await m.some('#pn-nome'); } },
  { t: 'Lance o primeiro pedido', d: 'Produto, quantidade e valor numa janela só. O item já entra dividido entre todos.',
    acao: async m => { await demoLancar(m, { nome: 'Porção de fritas', preco: '4200', olhar: '.kf-dlg .ck-list' }); } },
  { t: 'Consumo individual', d: 'Cada um pediu o seu? Escolha Individual e diga quantas unidades são de cada pessoa.',
    acao: async m => { await demoLancar(m, { nome: 'Suco de laranja', mais: 2, preco: '900', individual: [['Ana', 2], ['Bruno', 1]] }); } },
  { t: 'Só alguns dividiram', d: 'Desmarque quem ficou de fora. O valor é repartido só entre os marcados.',
    acao: async m => { await demoLancar(m, { nome: 'Pudim', preco: '1800', fora: ['Ana', 'Bruno'] }); } },
  { t: 'Altere um pedido', d: 'Toque no pedido e em Alterar para corrigir o nome, o valor ou quem dividiu.',
    acao: async m => { const it = demoItem('Porção de fritas'); await demoAbrir(m, `[data-item="${it}"] .it-lin`); await m.tocar(`[data-item="${it}"] [data-it-alt]`); await m.acha('#pr-preco'); await m.digitar('#pr-preco', '4500', { ritmo: 110 }); await m.espera(500); await m.tocar('#lc-ok'); await m.some('#pr-nome'); await m.apontar(`[data-item="${it}"] .it-lin`, 1200); await m.tocar(`[data-item="${it}"] .it-lin`); } },
  { t: 'Mais uma unidade e cortesia', d: 'Com o pedido aberto, some unidades e marque cortesias. Depois, toque em Salvar.',
    acao: async m => { const it = demoItem('Suco de laranja'); await demoAbrir(m, `[data-item="${it}"] .it-lin`); await m.tocar(`[data-it-u="${it}"][data-p="${demoId('Carla')}"][data-dir="1"]`); await m.tocar(`[data-it-fq="${it}"][data-dir="1"]`); await m.apontar(`[data-item="${it}"] .pending-bar`, 1500); await m.tocar(`[data-it-ok="${it}"]`); await m.espera(600); await m.tocar(`[data-item="${it}"] .it-lin`); } },
  { t: 'A parte de cada pessoa', d: 'A comanda soma na hora. Toque num nome para ver os atalhos dessa pessoa.',
    acao: async m => { const u = demoUn('Diego'); await m.tocar(`summary[data-unit="${u}"]`); await m.espera(500); await m.apontar(`[data-pa="${u}"]`, 1700); } },
  { t: 'Quem não paga o serviço', d: 'Desligue o serviço de alguém e escolha: ninguém paga a parte ou os outros dividem.',
    acao: async m => { const u = demoUn('Diego'); await demoAbrir(m, `summary[data-unit="${u}"]`); await m.tocar(`[data-pa="${u}"] [data-pa-svc]`); await m.acha('[data-pol="redistribute"]'); await m.espera(500); await m.apontar('[data-pol="discount"]', 1300); await m.apontar('[data-pol="redistribute"]', 1300); await m.tocar('[data-pol="redistribute"]', { depois: 500 }); await m.tocar('#pol-ok'); await m.some('[data-pol]'); await m.apontar(`summary[data-unit="${demoUn('Diego')}"]`, 1400); } },
  { t: 'O cupom de cada um', d: 'Ver cupom mostra a conta da pessoa, pronta para compartilhar.',
    acao: async m => { const u = demoUn('Diego'); await demoAbrir(m, `summary[data-unit="${u}"]`); await m.tocar(`[data-pa="${u}"] [data-pa-cupom]`); await m.acha('#cp-share'); await m.apontar('.kf-dlg .cupom-1', 1700); await m.apontar('#cp-share', 1300); await m.fechar(); await m.some('#cp-share');
      // o cartão do Diego se recolhe antes do próximo passo
      const sm = await m.acha(`summary[data-unit="${demoUn('Diego')}"]`); if (sm.parentElement.open) { await m.tocar(sm); await m.espera(500); } } },
  { t: 'Mude o nome ou tire da mesa', d: 'Chegou mais alguém? Em Editar, corrija o nome ou tire a pessoa da mesa.',
    acao: async m => { await m.tocar('#add-pessoa'); await m.digitar('#pn-nome', 'Eva', { ritmo: 70 }); await m.tocar('#pn-add', { depois: 260 }); guiaSemAviso(); await m.fechar(); await m.some('#pn-nome');
      await demoAbrir(m, `summary[data-unit="${demoUn('Eva')}"]`); await m.tocar(`[data-pa="${demoUn('Eva')}"] [data-pa-mais]`); await m.digitar('#cs-nome', 'Evelyn', { ritmo: 70 }); await m.tocar('#cs-ok'); await m.some('#cs-nome'); await m.espera(700);
      await demoAbrir(m, `summary[data-unit="${demoUn('Evelyn')}"]`); await m.tocar(`[data-pa="${demoUn('Evelyn')}"] [data-pa-mais]`); guiaSemAviso(); await m.tocar('#cs-rm'); await m.acha('.kf-dlg [data-kf-ok]'); await m.espera(700); await m.tocar('.kf-dlg [data-kf-ok]'); await m.some('.kf-dlg [data-kf-ok]'); await m.espera(600); } },
  { t: 'Um cupom para duas pessoas', d: 'Juntar põe duas pessoas no mesmo cupom: bom para casal ou para quem divide tudo.',
    acao: async m => { const u = demoUn('Diego'); await demoAbrir(m, `summary[data-unit="${u}"]`); await m.tocar(`[data-pa="${u}"] [data-pa-juntar]`); await m.tocar(`[data-pa="${u}"] [data-pa-alvo="p:${demoId('Carla')}"]`); await m.apontar('summary.dv-grupo', 1600); } },
  { t: 'Arraste para juntar', d: 'O atalho: segure um nome e arraste sobre outro. Os dois ficam no mesmo cupom.',
    acao: async m => { await m.arrastarAte(`summary[data-unit="${demoUn('Bruno')}"]`, `[data-unit="${demoUn('Carla')}"]`); await m.apontar('summary.dv-grupo', 1500); } },
  { t: 'Separe quando quiser', d: 'O cupom compartilhado mostra a parte de cada um. Separar desfaz a união.',
    acao: async m => { const u = demoUn('Carla'); await demoAbrir(m, `summary[data-unit="${u}"]`); await m.apontar(`summary[data-unit="${u}"]`, 1300); await m.tocar(`[data-pa="${u}"] [data-pa-desfaz]`); await m.espera(500); guiaSemAviso();
      for (const n of ['Bruno', 'Carla', 'Diego']) await m.apontar(`summary[data-unit="${demoUn(n)}"]`, 800); } },
  { t: 'Comanda ao vivo', d: 'Compartilhe a comanda: cada pessoa lança pelo próprio celular.', se: () => !!store.db,
    acao: async m => { await m.apontar('#live-start', 2200, { opcional: true, prazo: 1200 }); } },
  { t: 'Serviço, couvert e desconto', d: 'Toque no total para abrir a conta da mesa. Aqui entram couvert e desconto.',
    acao: async m => { const bloco = async k => (await m.acha(`.kf-dlg [data-cm="${k}"]`)).closest('.cm-bloco');
      // liga a chave, espera a opção abrir e só então a destaca inteira, já à vista na janela; depois escreve o valor
      await m.tocar('#cm-pe'); await m.apontar(await bloco('svc'), 1500);
      await m.tocar('.kf-dlg [data-cm="cv"]'); await m.acha('#cm-cv'); await m.espera(750); await m.apontar(await bloco('cv'), 1600); await m.digitar('#cm-cv', '500', { ritmo: 120 }); await m.espera(500);
      await m.tocar('.kf-dlg [data-cm="ds"]'); await m.acha('#cm-ds'); await m.espera(750); await m.apontar(await bloco('ds'), 1600); await m.digitar('#cm-ds', '800', { ritmo: 120 }); await m.espera(900); await m.fechar(); await m.apontar('#cmd-conta', 1500); } },
  // fechar não abre janela: a própria comanda vira um canhoto por pessoa (1.12.0). Os passos seguintes partem da comanda fechada.
  { t: 'Feche a comanda', d: 'O papel vira um canhoto por pessoa, e o cupom da mesa abre com um toque. Para voltar, Reabrir a comanda.',
    acao: async m => { await m.tocar('#fechar-cmd'); await m.acha('#cf'); await m.espera(1700); await m.apontar('#view .cf-cab', 1800); await m.apontar('#cf-cans', 1800);
      await m.tocar('#cf-mesa-cupom'); await m.acha('.kf-dlg .receipt'); await m.espera(1800); await m.fechar(); await m.some('.kf-dlg .receipt'); } },
  { t: 'Receba de cada um', d: 'Marque quem pagou: o canhoto leva o carimbo. Aberto, ele tem o cupom, o Pix e o valor diferente.',
    acao: async m => { await demoFechada(m);
      // na demonstração, Bruno é "você" e tem chave Pix: é ela que aparece em Receber com Pix
      if (!draft.demoEu) { draft.demoEu = 'Bruno'; draft.demoPix = { ...(draft.demoPix || {}), Bruno: 'bruno@exemplo.com.br' }; render({ anchor: false }); await m.espera(300); }
      const ana = demoCan('Ana'), carla = demoCan('Carla');
      await demoTocarSemAviso(m, `${ana} [data-can-pago="marcar"]`, 900); await m.apontar('#view .cf-rec', 1700);
      await demoAbrirCan(m, ana); await m.rolar(`${ana} .cf-saiu`, 46); await demoTocarSemAviso(m, `${ana} .cf-saiu .kf-chave`, 900);
      // segue para o canhoto da Carla: o Pix, o campo do valor, quem cobre, o cupom e a volta ao valor da conta
      await demoAbrirCan(m, carla); await m.rolar(`${carla} [data-can-pix]`, 46); await m.apontar(`${carla} [data-can-pix]`, 1700);
      await m.tocar(`${carla} [data-can-valor]`); await m.acha(`${carla} [data-can-custom]`); await m.rolar(`${carla} [data-can-custom]`, 46);
      await m.digitar(`${carla} [data-can-custom]`, '4000', { ritmo: 120 }); await m.espera(700);
      await demoTocarSemAviso(m, `${carla} [data-can-cobre="${demoId('Bruno')}"]`, 600);
      await demoVerPagamento(m, carla, 2600);
      await m.rolar(`${carla} [data-can-custom]`, 46); await demoTocarSemAviso(m, `${carla} [data-can-conta]`, 800); await m.espera(500); } },
  { t: 'A conta de quem já pagou mudou', d: 'Reabra a comanda e tire o desconto: Ana já tinha pago. Ao fechar de novo, receba a diferença ou diga quem cobre.',
    acao: async m => { if (draft.fechada) { await demoTocarSemAviso(m, '#cf-reabrir', 700); await m.acha('#cm-pe'); }
      await m.tocar('#cm-pe'); await m.acha('.kf-dlg [data-cm="ds"]'); await m.espera(500); await m.tocar('.kf-dlg [data-cm="ds"]'); await m.rolar('.kf-dlg .aviso-pago', 6); await m.apontar('.kf-dlg .aviso-pago', 2200, { opcional: true, prazo: 800 }); await m.fechar();
      // a diferença é assunto da comanda fechada: fecha de novo, e o canhoto da Ana diz quanto falta
      await demoFechada(m); const ana = demoCan('Ana'); await m.apontar(`${ana} .cf-obs`, 2000);
      await demoAbrirCan(m, ana); await demoTocarSemAviso(m, `${ana} [data-can-difcobre="${demoId('Bruno')}"]`, 700); await demoVerPagamento(m, ana, 2600); await m.espera(400); } },
  { t: 'Salve no Histórico', d: 'Salvar encerra a comanda e guarda tudo. Se foi cedo demais, dá para desfazer.',
    acao: async m => { await demoFechada(m); await m.acha('#cf-salvar'); await m.espera(600); await m.tocar('#cf-salvar'); const ok = await m.acha('#festa-ok', { opcional: true, prazo: 2500 }); if (ok) { await m.espera(3600); await m.tocar('#festa-ok'); await m.some('#festa-ok'); } else await m.espera(1600); } },
  { t: 'Tampinhas e níveis', d: 'Cada comanda salva rende pontos. As tampinhas que você ganha ficam na coleção.', se: () => jogoLigado(),
    acao: async m => { await demoIr(m, 'tampinhas'); await m.apontar('#view .nivel-card', 1700); await m.apontar('#view [data-tampa="primeira"]', 1300); } },
  { t: 'Gire a tampinha', d: 'Toque numa tampinha e deslize o dedo sobre ela: ela gira nas suas mãos.', se: () => jogoLigado(),
    acao: async m => { await demoIr(m, 'tampinhas'); await m.tocar('#view [data-tampa="primeira"]'); await m.acha('.kf-dlg .kf-o3d'); await m.espera(600); await m.arrastar('.kf-dlg .kf-o3d', 150); await m.arrastar('.kf-dlg .kf-o3d', -230, { dur: 1300 }); await m.tocar('#tp-ok'); await m.some('#tp-ok'); } },
  { t: 'Histórico e gastos', d: 'As comandas salvas ficam aqui, mês a mês, com o resumo de quanto se gastou.',
    acao: async m => { await demoIr(m, 'historico'); await m.apontar('#view .retro', 1700, { opcional: true }); await m.apontar('#view .hist-mes', 1500); } },
  { t: 'Repita uma comanda', d: 'Toque numa comanda salva para rever os cupons. Repetir abre outra igual.',
    acao: async m => { await demoIr(m, 'historico'); await m.tocar('#view .hist-mes [data-bill]'); await m.acha('#sh-reuse'); await m.espera(900); await m.apontar('.kf-dlg .receipts .cupom-1', 1500); await m.apontar('#sh-edit', 1100); await m.tocar('#sh-reuse'); await m.acha('#add-pessoa'); await m.espera(900); } },
  { t: 'Exclua uma comanda', d: 'Abriu sem querer? Excluir comanda fica logo abaixo de Fechar comanda.',
    acao: async m => { await demoIr(m, 'comanda'); await m.tocar('#cmd-excluir'); await m.acha('.kf-dlg [data-kf-ok]'); await m.espera(800); await m.tocar('.kf-dlg [data-kf-ok]'); await m.some('.kf-dlg [data-kf-ok]'); await m.espera(900); } },
  { t: 'Cadastros: pessoas e Pix', d: 'Em Mais, os Cadastros guardam as pessoas. Com a chave Pix, o cupom leva copia e cola.',
    acao: async m => { await demoCadastros(m, 'pessoas'); await m.tocar('#view [data-pes-ed]'); await m.digitar('#np-pix', 'ana@exemplo.com.br', { ritmo: 45 }); await m.tocar('.kf-dlg-pe button[type=submit]'); await m.some('#np-pix'); await m.espera(900); } },
  { t: 'Turmas', d: 'Monte uma turma com quem sai junto. Na próxima comanda, todos entram de uma vez.',
    acao: async m => { await demoCadastros(m, 'turmas'); await m.tocar('#cad-turma'); await m.digitar('#tg-nome', 'Amigos da praça', { ritmo: 50 }); for (const n of ['Ana', 'Bruno', 'Carla']) await m.tocar(`.kf-dlg [data-tg="${n}"]`, { depois: 220 }); await m.tocar('.kf-dlg-pe button[type=submit]'); await m.some('#tg-nome'); await m.apontar('#view .cad-card .lin', 1500, { opcional: true }); } },
  { t: 'Produtos e preços', d: 'O app lembra o preço de cada produto em cada lugar e sugere na hora de lançar.',
    acao: async m => { await demoCadastros(m, 'produtos'); await m.apontar('#view .cad-card', 2200, { opcional: true }); } },
  { t: 'Sorteie alguém da mesa', d: 'Quem escolhe o próximo lugar? Marque quem entra e o ponteiro para num nome.',
    acao: async m => { await demoIr(m, 'mais'); await m.tocar('#ma-sorteio'); await m.acha('#gf-quem'); for (const n of ['Ana', 'Bruno', 'Carla']) await m.tocar(`[data-gf-n="${n}"][aria-pressed="false"]`, { depois: 220, opcional: true, prazo: 500 }); await m.tocar('#gf-go', { depois: 0 });
      // o dedo sai da frente e a roda vem para o alto da janela: o que se vê é o ponteiro girando até parar num nome
      // a roda fica inteira à vista, com o nome do alto (o primeiro da lista) e a linha do resultado; o guia não destaca quem saiu
      m.sumir(); await m.rolar('#gf-mesa', 52); await m.espera(5200); await m.espera(2000); await m.tocar('#gf-x'); await m.some('#gf-x'); } },
  { t: 'Ajustes', d: 'Seu nome, sincronização, cópia de segurança, aparência e privacidade.',
    acao: async m => { await demoIr(m, 'mais'); await m.tocar('#view [data-kf="ajustes"]'); await m.acha('#view [data-kf-aj-ir]'); await m.espera(700); const L = $$('#view .kf-aj-lista [data-kf-aj-ir]').filter(e => e.getClientRects().length); for (const el of L.slice(0, 4)) await m.apontar(el, 850); } },
  { t: 'A nuvem', d: 'Mostra se os seus aparelhos estão sincronizados. Toque para ver os detalhes.',
    acao: async m => { await m.tocar('#barra [data-kf-nuvem]'); await m.acha('.kf-dlg'); await m.espera(2000); await m.fechar(); } },
  { t: 'Avaliação e problemas', d: 'O balão recebe a sua nota e os relatos de problema. Tudo chega ao criador do app.',
    acao: async m => { await m.tocar('#barra [data-kf="feedback"]'); await m.acha('.kf-dlg'); await m.espera(2000); await m.fechar(); } },
  { t: 'Um presente para o criador', d: 'O app é gratuito. Gostou? Mande um presente pelo Pix: QR code ou código.', se: () => KitFacil.apoio.ativo(),
    acao: async m => { await m.tocar('#barra [data-kf-presente]'); await m.acha('.kf-dlg [data-kf-qr]'); await m.espera(900); await m.apontar('.kf-dlg [data-kf-qr]', 2200); await m.apontar('.kf-dlg [data-kf-pix-codigo]', 1800); await m.fechar(); } },
  { t: 'Pronto, é isso', d: 'A demonstração some; os seus dados ficam. Para treinar, há a comanda de exemplo.',
    acao: async m => { await m.tocar(navQ('inicio')); await m.espera(2000); } },
];

/* puxar a janela pela barrinha (1.8.3/1.8.4) e o cursor parado (1.8.5) são do Kit desde o 0.8.0 (Código, Art. 68). */

/* ---------- arranque ---------- */
if (draft.live) { draft.isExample = false; draft.active = true; }
if (backfillPrices()) LS.set('catalog', catalog);
// barra de cima do Kit: nuvem, presente e balão, os três em traço e na mesma cor
$('#topo').outerHTML = KitFacil.topo.html({ principal: true });
// link de "Conectar outro aparelho" (a chave vem depois do #, que não sai do aparelho)
const linkSync = SY.tokenDoLink();
if (linkSync) try { history.replaceState(null, '', location.pathname + location.search); } catch {}
render();
store.init();
SY.iniciar({ token: linkSync, silencioso: true, textoConfirmar: 'O histórico e os cadastros deste aparelho se juntam aos da nuvem.' });
window.addEventListener('hashchange', () => live.boot());
// a abertura aparece uma vez para quem chega à versão 1.0; quem entra por um convite de comanda ao vivo vai direto para a mesa
if (LS.get('abertura', '') !== '1' && !/^#m[a-z0-9]{6,16}$/.test(location.hash || '') && !linkSync && !(navigator.webdriver && !window.CF_TESTE_ABERTURA)) aberturaAbrir();
else jogoConferir({ silencioso: !jogo.pronto });
// atalho "Nova comanda" do ícone do app (manifesto)
if (/[?&]nova=1/.test(location.search)) { try { history.replaceState(null, '', location.pathname + location.hash); } catch {} if (!draft.active && !aberturaAtiva()) setTimeout(novaComandaSheet, 300); }
try { if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(e => console.warn('sw', e)); } catch (e) { console.warn('sw', e); }
