/* Conta Fácil · moldura (navegação e troca de tela), Ajustes, abertura (onboarding), guia e arranque do app. */

/* ---------- navegação ---------- */
const TELAS = { inicio: viewInicio, comanda: viewComanda, historico: viewHistorico, tampinhas: viewTampinhas, cadastros: viewCadastros, mais: viewMais };
const TITULOS = { inicio: 'Início', comanda: 'Comanda', historico: 'Histórico', tampinhas: 'Tampinhas', cadastros: 'Cadastros', mais: 'Mais', ajustes: 'Ajustes' };
function irPara(t, { topo = true } = {}) {
  if (t === 'comanda' && !draft.active) { novaComandaSheet(); return; }
  if (t === 'ajustes') { abrirAjustes(); return; }
  sairDosAjustes();
  closeSheet(true);
  tab = t; pickSel = null; selPay = null;
  render({ anchor: false });
  if (topo) window.scrollTo({ top: 0 });
}
function pintarNav() {
  const ativa = draft.active, abertos = ativa && !draft.isExample ? draft.items.filter(it => !it.lk).length : 0;
  const selo = abertos ? `<span class="nav-selo"><span aria-hidden="true">${abertos}</span><span class="so-leitor">, ${plural(abertos, 'item espera', 'itens esperam')} a divisão</span></span>` : '';
  const quarto = jogoLigado() ? ['tampinhas', I.tampa, 'Tampinhas'] : ['cadastros', I.users, 'Cadastros'];
  const naMais = tab === 'mais' || tab === 'ajustes' || (tab === 'cadastros' && quarto[0] !== 'cadastros');
  const it = (id, ic, rot, on) => `<button type="button" class="nav-it" data-ir="${id}" id="tab-${id}" ${on ? 'aria-current="page"' : ''}>${ic}<span>${rot}</span></button>`;
  const html = `${it('inicio', I.home, 'Início', tab === 'inicio')}${it('historico', I.clock, 'Histórico', tab === 'historico')}
    <button type="button" class="nav-it nav-centro" data-ir="comanda" id="tab-comanda" ${tab === 'comanda' ? 'aria-current="page"' : ''} aria-label="${ativa ? 'Comanda' + (draft.place ? ' de ' + esc(draft.place) : '') : 'Nova comanda'}"><span class="nav-bola">${ativa ? I.receipt : I.plus}</span>${selo}<span class="nav-rot">${ativa ? 'Comanda' : 'Nova'}</span></button>
    ${it(quarto[0], quarto[1], quarto[2], tab === quarto[0])}${it('mais', I.mais, 'Mais', naMais)}`;
  const nav = $('#tabs'); if (nav.dataset.h !== html) { nav.innerHTML = html; nav.dataset.h = html; }
  const tr = (id, ic, rot, on, extra = '') => `<button type="button" class="trilho-it ${extra}" data-ir="${id}" id="trilho-${id}" ${on ? 'aria-current="page"' : ''}>${ic}<span>${rot}</span>${id === 'comanda' ? selo.replace('nav-selo', 'nav-selo') : ''}</button>`;
  const lado = `${tr('comanda', ativa ? I.receipt : I.plus, ativa ? (draft.place ? esc(draft.place) : 'Comanda aberta') : 'Nova comanda', tab === 'comanda', 'destaque')}
    ${tr('inicio', I.home, 'Início', tab === 'inicio')}${tr('historico', I.clock, 'Histórico', tab === 'historico')}${jogoLigado() ? tr('tampinhas', I.tampa, 'Tampinhas', tab === 'tampinhas') : ''}${tr('cadastros', I.users, 'Cadastros', tab === 'cadastros')}
    <div class="trilho-fim">${tr('mais', I.mais, 'Mais', tab === 'mais')}<button type="button" class="trilho-it" data-kf="ajustes" id="trilho-ajustes" ${tab === 'ajustes' ? 'aria-current="page"' : ''}>${I.ajustes}<span>Ajustes</span></button></div>`;
  const t = $('#trilho'); if (t.dataset.h !== lado) { t.innerHTML = lado; t.dataset.h = lado; }
}
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-ir]'); if (!b) return;
  e.preventDefault(); irPara(b.dataset.ir);
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
  v.innerHTML = `<section class="view view-${tab}">${tab === 'comanda' ? '<h1 class="so-leitor">Comanda</h1>' : ''}${fn.html()}</section>`;
  fn.bind(v);
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
  if (KitFacil.guia.ativo()) { if (!draft.isExample) KitFacil.guia.parar(); else requestAnimationFrame(() => KitFacil.guia.posicionar()); }
  clearTimeout(render.t); render.t = setTimeout(() => { if (!draft.isExample) jogoConferir(); tampaFilaMostrar(); }, 700);
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
    const chave = (id, on, titulo, sub) => `<label class="aj-chave"><span class="lin-tx"><b>${titulo}</b><small>${sub}</small></span><span class="switch"><input type="checkbox" id="${id}" ${on ? 'checked' : ''}><span class="track"></span></span></label>`;
    return KitFacil.ajustes.html({
      extras: {
        conta: `<div class="kf-bloco"><h3>Você nas comandas</h3>
          <p class="kf-ajuda">Escolha o seu nome entre as pessoas cadastradas. O Início e o Histórico usam essa escolha para mostrar os seus gastos e com quem você mais sai.</p>
          ${pessoas.length ? `<div class="field"><label for="aj-me">Seu nome</label><select id="aj-me" class="kf-entrada"><option value="">Não escolhido</option>${pessoas.map(p => `<option value="${esc(p.name)}" ${norm(p.name) === norm(catalog.me) ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select></div>`
            : '<p class="kf-ajuda">Ainda não há pessoas cadastradas. Elas entram nos Cadastros quando você salva a primeira comanda.</p>'}</div>`,
      },
      resumos: { conta: catalog.me ? `Você é ${catalog.me}` : undefined, preferencias: 'Idioma, guia do app e instalação' },
      produto: [{ id: 'comandas', titulo: 'Comandas e tampinhas', icone: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h3"/>', resumo: jogoLigado() ? `Nível ${s.nivel} · ${s.ganhas.length} de ${TAMPINHAS.length} tampinhas` : 'Tampinhas desligadas',
        html: `<div class="kf-bloco"><h3>Tampinhas e níveis</h3>${chave('aj-jogo', jogoLigado(), 'Mostrar tampinhas e níveis', 'Desligado, o app fica só com as comandas. Nada é apagado.')}</div>
          <div class="kf-bloco"><h3>Aprender a usar</h3><div class="kf-acoes"><button type="button" class="kf-btn kf-sec" id="aj-guia">Ver o guia</button><button type="button" class="kf-btn kf-sec" id="aj-abertura">Rever a apresentação</button><button type="button" class="kf-btn kf-sec" id="aj-exemplo">Abrir a comanda de exemplo</button></div></div>
          <div class="kf-bloco"><h3>Cadastros</h3><p class="kf-ajuda">Pessoas, chaves Pix, turmas e os preços de cada produto em cada lugar.</p><button type="button" class="kf-btn kf-sec" data-ir="cadastros">Abrir os Cadastros</button></div>` }],
    });
  },
  bind(v) {
    KitFacil.ajustes.ligar(v);
    $('#aj-me', v)?.addEventListener('change', e => { catalog.me = e.target.value; store.saveCatalog(); KitFacil.ajustes.resumo('conta', catalog.me ? `Você é ${catalog.me}` : 'Sem cadastro · dados neste aparelho'); toast(catalog.me ? `Pronto: você é ${catalog.me}.` : 'Nome desmarcado.'); });
    $('#aj-jogo', v)?.addEventListener('change', e => { jogo.off = !e.target.checked; jogoSalvar(); pintarNav(); const s = jogoEstado(); KitFacil.ajustes.resumo('comandas', jogoLigado() ? `Nível ${s.nivel} · ${s.ganhas.length} de ${TAMPINHAS.length} tampinhas` : 'Tampinhas desligadas'); toast(jogoLigado() ? 'Tampinhas e níveis ligados.' : 'Tampinhas e níveis desligados.'); });
    $('#aj-guia', v)?.addEventListener('click', () => guiaIniciar());
    $('#aj-abertura', v)?.addEventListener('click', () => aberturaAbrir({ rever: true }));
    $('#aj-exemplo', v)?.addEventListener('click', () => { sairDosAjustes(); enterExample(); });
  },
};

/* ---------- teclado numérico do iPhone: não tem tecla de confirmar; uma barra com OK fica colada em cima dele ---------- */
(() => {
  let toque = false; try { toque = matchMedia('(hover: none) and (pointer: coarse)').matches; } catch {}
  if (!toque) return;
  const html = document.documentElement, vv = window.visualViewport; let bar = null, campo = null;
  const numerico = el => el && el.matches && el.matches('input[inputmode="numeric"], input[inputmode="decimal"], input[type="number"], input[data-money], input[data-pct]');
  const pos = () => { if (!bar || bar.hidden) return; bar.style.top = Math.round(vv ? vv.offsetTop + vv.height - 48 : innerHeight - 48) + 'px'; };
  const esconder = () => { if (bar) bar.hidden = true; html.classList.remove('com-ok'); campo = null; };
  const mostrar = el => {
    if (!bar) { bar = document.createElement('div'); bar.className = 'ok-teclado'; bar.innerHTML = '<button type="button" aria-label="OK, fechar o teclado">OK</button>'; document.body.appendChild(bar);
      bar.addEventListener('pointerdown', e => e.preventDefault());
      bar.firstChild.addEventListener('click', () => { if (campo) { campo.dispatchEvent(new Event('change', { bubbles: true })); campo.blur(); } esconder(); }); }
    campo = el; bar.hidden = false; html.classList.add('com-ok'); pos();
  };
  // a barra só some depois que o dedo solta: se sumisse antes, o botão tocado sairia de baixo do dedo
  let apertado = false;
  document.addEventListener('pointerdown', () => { apertado = true; }, true);
  ['pointerup', 'pointercancel'].forEach(t => document.addEventListener(t, () => { apertado = false; }, true));
  const talvezEsconder = () => { if (apertado) return setTimeout(talvezEsconder, 80); if (!numerico(document.activeElement)) esconder(); };
  document.addEventListener('focusin', e => { if (numerico(e.target)) mostrar(e.target); else talvezEsconder(); });
  document.addEventListener('focusout', () => setTimeout(talvezEsconder, 60));
  if (vv) { vv.addEventListener('resize', pos); vv.addEventListener('scroll', pos); }
})();

/* ---------- abertura (onboarding) ---------- */
let aberturaEl = null;
const aberturaAtiva = () => !!aberturaEl;
function aberturaAbrir({ rever = false } = {}) {
  if (aberturaEl) return;
  const veterano = bills.length > 0 || catalog.people.length > 0;
  const DEMO = { nome: 'Porção de fritas', preco: 4200, gente: ['Ana', 'Bruno', 'Carla'] };
  const marcados = new Set(DEMO.gente); let i = 0, tocouDemo = false;
  const demoHTML = () => { const n = marcados.size, parte = n ? allocate(DEMO.preco, [...marcados].map(() => 1)) : [];
    let k = 0; return `<div class="papel topo-serrilha ab-demo"><div class="mono ab-demo-item"><span>1× ${DEMO.nome}</span><span>${BRL(DEMO.preco).replace('R$', '').trim()}</span></div>
      ${DEMO.gente.map(g => { const on = marcados.has(g), v = on ? parte[k++] : 0; return `<button type="button" class="ab-demo-p mono ${on ? 'on' : ''}" data-ab-p="${g}" aria-pressed="${on}"><span class="ab-box" aria-hidden="true">${on ? '✓' : ''}</span><span>${g}</span><span class="ab-v">${on ? BRL(v).replace('R$', '').trim() : 'não dividiu'}</span></button>`; }).join('')}
      <p class="mono ab-demo-r" role="status">${n ? (n === DEMO.gente.length ? 'Entre todos' : n === 1 ? 'Só uma pessoa paga' : `Entre ${n}`) + ` · ${BRL(Math.round(DEMO.preco / n))} cada` : 'Marque quem dividiu'}</p></div>`; };
  const s = jogoEstado();
  const SLIDES = [
    { arte: `<div class="imp ab-imp"><div class="imp-boca"></div><div class="imp-saida"><div class="papel imp-papel sai"><span class="mono fp-marca">CONTA FÁCIL</span><span class="mono fp-local">Boteco da Esquina</span><span class="fp-linha"></span>
        <span class="mono ab-l"><span>Ana</span><span>77,09</span></span><span class="mono ab-l"><span>Bruno</span><span>64,18</span></span><span class="mono ab-l"><span>Carla</span><span>99,67</span></span><span class="mono fp-tot"><span>TOTAL</span><span>R$ 240,94</span></span></div></div></div>`,
      t: veterano && !rever ? 'O Conta Fácil está de cara nova' : 'A conta do bar, sem calculadora',
      p: veterano && !rever ? 'Suas comandas, cadastros e chaves Pix continuam aqui. A mesa agora é uma comanda só, de papel.' : 'Cada um paga o que consumiu. O app soma serviço, couvert e desconto e diz quanto é de cada pessoa.' },
    { arte: () => demoHTML(), t: 'Marque quem consumiu', p: 'Experimente: toque num nome para tirar ou pôr alguém na divisão. A parte de cada um muda na hora.' },
    { arte: `<div class="ab-leque"><div class="papel ab-cupom c1"><span class="mono">Carla</span><span class="fp-linha"></span><span class="mono ab-l"><span>Total</span><span>99,67</span></span></div>
        <div class="papel ab-cupom c3"><span class="mono">Bruno</span><span class="fp-linha"></span><span class="mono ab-l"><span>Total</span><span>64,18</span></span><span class="fp-carimbo">PAGO</span></div>
        <div class="papel ab-cupom c2"><span class="mono">Ana</span><span class="fp-linha"></span><span class="mono ab-l"><span>Total</span><span>77,09</span></span><span class="ab-qr" aria-hidden="true"></span><span class="mono ab-pix">Pix copia e cola</span></div></div>`,
      t: 'Um cupom para cada pessoa', p: 'Feche a comanda e mande o cupom de cada um, com o Pix copia e cola e o QR code. Marque quem já pagou.' },
    { arte: `<div class="ab-tampas">${['primeira', 'pix', 'mesa-cheia', 'ao-vivo', 'explorador'].map((id, k) => `<span class="ab-tampa" style="--i:${k}">${tampaSVG(TAMPINHAS.find(t => t.id === id))}</span>`).join('')}</div>`,
      t: veterano ? `Você já chega com ${plural(s.ganhas.length, 'tampinha', 'tampinhas')}` : 'Junte tampinhas pelo caminho',
      p: 'Usar o app rende tampinhas e níveis. É só uma brincadeira, e dá para desligar nos Ajustes.',
      extra: catalog.me ? '' : `<div class="field ab-nome"><label for="ab-eu">Como chamam você na mesa? (opcional)</label><input id="ab-eu" type="text" autocapitalize="words" autocomplete="off" maxlength="40" placeholder="Seu nome ou apelido"></div>` },
  ];
  const n = SLIDES.length, ant = document.activeElement;
  const el = document.createElement('div'); el.className = 'abertura'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', 'Apresentação do Conta Fácil');
  el.innerHTML = `<div class="ab-in">
      <div class="ab-topo"><div class="ab-pontos" aria-hidden="true">${SLIDES.map(() => '<i></i>').join('')}</div><button type="button" class="btn link small" id="ab-pular">Pular</button></div>
      <div class="ab-palco" id="ab-palco" aria-live="polite"></div>
      <div class="ab-pe"><button type="button" class="btn ghost" id="ab-volta">Voltar</button><button type="button" class="btn chopp" id="ab-prox">Continuar</button></div>
      <button type="button" class="btn link small ab-ex" id="ab-ex" hidden>Ver uma comanda de exemplo</button>
    </div>`;
  document.body.appendChild(el); aberturaEl = el; document.body.classList.add('com-abertura');
  const palco = $('#ab-palco', el), pontos = $$('.ab-pontos i', el);
  const pintar = (dir = 1) => {
    const sl = SLIDES[i];
    palco.innerHTML = `<div class="ab-slide ${dir > 0 ? 'vem-dir' : 'vem-esq'}"><div class="ab-arte" ${i === 1 ? '' : 'aria-hidden="true"'}>${typeof sl.arte === 'function' ? sl.arte() : sl.arte}</div><h2 class="ab-t" id="ab-t" tabindex="-1">${esc(sl.t)}</h2><p class="ab-p">${esc(sl.p)}</p>${sl.extra || ''}</div>`;
    pontos.forEach((p, k) => p.classList.toggle('on', k === i));
    $('#ab-volta', el).hidden = i === 0;
    $('#ab-prox', el).textContent = i === n - 1 ? (rever ? 'Concluir' : draft.active ? 'Começar a usar' : 'Abrir uma comanda') : 'Continuar';
    $('#ab-ex', el).hidden = !(i === n - 1 && !rever && !draft.active);
    $('#ab-pular', el).hidden = i === n - 1;
    $('#ab-t', el).focus({ preventScroll: true });
  };
  const guardarNome = () => {
    const inp = $('#ab-eu', el); if (!inp) return;
    const nome = inp.value.trim().replace(/\s+/g, ' '); if (!nome) return;
    if (!catalog.people.some(p => norm(p.name) === norm(nome))) catalog.people.push({ name: nome, pix: '' });
    catalog.me = catalog.people.find(p => norm(p.name) === norm(nome)).name; store.saveCatalog();
  };
  const fechar = depois => {
    guardarNome();
    LS.set('abertura', '1'); if (tocouDemo || i === n - 1) jogo.flags.abertura = jogo.flags.abertura || Date.now();
    jogoSalvar(); jogoConferir({ silencioso: true });
    document.removeEventListener('keydown', tecla, true);
    el.classList.add('sai'); document.body.classList.remove('com-abertura');
    setTimeout(() => { el.remove(); }, semMovimento() ? 0 : 260);
    aberturaEl = null; render({ anchor: false });
    try { ant && ant.focus && ant.focus({ preventScroll: true }); } catch {}
    depois && depois();
  };
  const ir = k => { const dir = k > i ? 1 : -1; if (k < 0) return; if (k >= n) return fechar(() => { if (!rever && !draft.active) novaComandaSheet(); }); i = k; pintar(dir); };
  const tecla = e => {
    if (!aberturaEl) return;
    if (e.key === 'Escape') { e.preventDefault(); fechar(); return; }
    if (e.target.matches && e.target.matches('input')) { if (e.key === 'Enter') { e.preventDefault(); ir(i + 1); } return; }
    if (e.key === 'ArrowRight') { e.preventDefault(); ir(Math.min(n - 1, i + 1)); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); ir(i - 1); }
    if (e.key === 'Tab') { const f = $$('button:not([hidden]), input', el).filter(x => x.getClientRects().length); if (!f.length) return; const k = f.indexOf(document.activeElement); e.preventDefault(); f[(k + (e.shiftKey ? f.length - 1 : 1) + f.length) % f.length].focus(); }
  };
  document.addEventListener('keydown', tecla, true);
  $('#ab-prox', el).onclick = () => ir(i + 1);
  $('#ab-volta', el).onclick = () => ir(i - 1);
  $('#ab-pular', el).onclick = () => fechar();
  $('#ab-ex', el).onclick = () => fechar(() => enterExample());
  palco.addEventListener('click', e => { const b = e.target.closest('[data-ab-p]'); if (!b) return; const g = b.dataset.abP; marcados.has(g) ? marcados.delete(g) : marcados.add(g); tocouDemo = true; $('.ab-arte', palco).innerHTML = demoHTML(); $(`[data-ab-p="${g}"]`, palco)?.focus({ preventScroll: true }); });
  // deslizar para o lado troca de tela
  let gx = null;
  palco.addEventListener('touchstart', e => { gx = e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null; }, { passive: true });
  palco.addEventListener('touchend', e => { if (!gx) return; const t = e.changedTouches[0], dx = t.clientX - gx.x, dy = t.clientY - gx.y; gx = null; if (Math.abs(dx) > 56 && Math.abs(dx) > Math.abs(dy) * 1.6) ir(dx < 0 ? Math.min(n - 1, i + 1) : i - 1); }, { passive: true });
  pintar(1);
}

/* ---------- guia: o app faz cada passo na tela, numa comanda de demonstração que não salva nada ---------- */
let guiaAteOFim = false;
function guiaIniciar() {
  if (draft.live) { toast('Saia da comanda ao vivo antes de ver o guia.'); return; }
  guiaAteOFim = false; sairDosAjustes(); closeSheet(true);
  KitFacil.guia.iniciar(1);
}
function guiaFim() {
  if (guiaAteOFim) jogoMarcar('guia');
  guiaAteOFim = false;
  if (draft.isExample) { pending = {}; itPend = {}; pesAberto = null; itemAberto = null; draft = loadRealDraft(); tab = 'inicio'; closeSheet(true); render({ anchor: false }); window.scrollTo({ top: 0 }); }
}
function demoAbrir(lugar) { pending = {}; itPend = {}; draft = { ...blankDraft(), place: lugar, isExample: true, active: true, createdAt: Date.now() }; tab = 'comanda'; render({ anchor: false }); window.scrollTo({ top: 0 }); }
const demoId = n => draft.people.find(p => p.name === n)?.id || '';
const demoItem = n => draft.items.find(x => x.name === n)?.id || '';
const visivel = q => $$(q).find(e => e.getClientRects().length);
async function demoLancar(m, { nome, qtd = 1, preco, individual, so }) {
  await m.tocar('#it-novo'); await m.esperar(500);
  await m.digitar('#pr-nome', nome);
  if (qtd > 1) await m.digitar('#pr-qtd', String(qtd), { lento: 120 });
  await m.digitar('#pr-preco', preco);
  if (individual) { await m.tocar('[data-lc-modo="units"]'); for (const [n, q] of individual) for (let k = 0; k < q; k++) await m.tocar(`[data-lc-un="${demoId(n)}"][data-dir="1"]`); }
  else if (so) for (const p of draft.people) if (!so.includes(p.name)) await m.tocar(`[data-lc-ck="${p.id}"]`);
  await m.tocar('#lc-ok'); await m.esperar(900);
}
const GUIA = [
  { t: 'Abra a comanda com o nome do bar',
    acao: async m => { await m.digitar('#ini-local', 'Bar do Zé'); await m.tocar('#ini-form button[type=submit]', { semClique: true }); demoAbrir('Bar do Zé'); await m.esperar(900); } },
  { t: 'Adicione quem está na mesa',
    acao: async m => { await m.tocar('#add-pessoa'); await m.esperar(500); for (const n of ['Ana', 'Bruno', 'Carla', 'Diego']) { await m.digitar('#pn-nome', n); await m.tocar('#pn-form button[type=submit]'); } await m.tocar('#pn-ok'); await m.esperar(600); } },
  { t: 'Lance cada pedido numa janela só',
    acao: async m => {
      await demoLancar(m, { nome: 'Porção de fritas', preco: '4200' });
      await demoLancar(m, { nome: 'Chopp', qtd: 3, preco: '1290', individual: [['Ana', 2], ['Bruno', 1]] });
      await demoLancar(m, { nome: 'Caipirinha', preco: '2200', so: ['Carla', 'Diego'] });
    } },
  { t: 'Toque num pedido para ver a divisão',
    acao: async m => { const it = demoItem('Porção de fritas'); await m.tocar(`[data-item="${it}"] .it-lin`); await m.esperar(900); await m.apontar(`[data-item="${it}"] [data-it-alt]`); await m.tocar(`[data-item="${it}"] .it-lin`); await m.esperar(500); } },
  { t: 'Toque numa pessoa para ver os atalhos dela',
    acao: async m => { const u = demoId('Diego'); await m.tocar(`[data-unit="${u}"]`); await m.esperar(900); await m.apontar(`[data-pa="${u}"] [data-pa-pago]`); await m.apontar(`[data-pa="${u}"] [data-pa-cupom]`); } },
  { t: 'Junte duas pessoas no mesmo cupom',
    acao: async m => { const u = demoId('Diego'); await m.tocar(`[data-pa="${u}"] [data-pa-juntar]`); await m.esperar(600); await m.tocar(`[data-pa="${u}"] [data-pa-alvo="p:${demoId('Carla')}"]`); await m.esperar(1200); } },
  { t: 'Serviço, couvert e desconto ficam na conta da mesa',
    acao: async m => { await m.tocar('#cm-pe'); await m.esperar(700); await m.apontar('[data-cm="svc"]'); await m.apontar('[data-cm="cv"]'); await m.apontar('[data-cm="ds"]'); await m.tocar('#cm-ok'); await m.esperar(500); } },
  { t: 'Divida a comanda ao vivo com a turma', se: () => !!store.db,
    acao: async m => { await m.apontar('#live-start'); await m.esperar(600); } },
  { t: 'Feche a comanda e veja o cupom de cada um',
    acao: async m => { await m.tocar('#fechar-cmd'); await m.esperar(900); await m.tocar('#fc-prox'); await m.esperar(900); await m.tocar('#fc-prox'); await m.esperar(900); await m.apontar('[data-fc-copiar="2"]'); } },
  { t: 'Salve no histórico para encerrar',
    acao: async m => { await m.tocar('#fc-salvar', { semClique: true }); toast('Na demonstração, nada é salvo.'); await m.esperar(1100); await m.tocar('#fc-volta'); } },
  { t: 'Reveja as comandas e os gastos no Histórico',
    acao: async m => { await m.tocar(visivel('#tab-historico, #trilho-historico')); await m.esperar(900); const a = $$('#view .retro, #view .hist-mes, #view .vazio').filter(e => e.getClientRects().length).slice(0, 2); for (const e of a) await m.apontar(e); } },
  { t: 'Em Mais ficam os Cadastros, os Ajustes e este guia',
    acao: async m => { await m.tocar(visivel('#tab-mais, #trilho-mais')); await m.esperar(900); await m.apontar('#view [data-ir="cadastros"]'); await m.apontar('#ma-guia'); guiaAteOFim = true; await m.esperar(600); } },
];

/* ---------- arranque ---------- */
if (draft.live) { draft.isExample = false; draft.active = true; }
if (backfillPrices()) LS.set('catalog', catalog);
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
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(e => console.warn('sw', e));
