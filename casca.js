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
    const chave = (id, on, titulo, sub) => `<label class="aj-chave"><span class="lin-tx"><b>${titulo}</b><small>${sub}</small></span><span class="switch"><input type="checkbox" id="${id}" ${on ? 'checked' : ''}><span class="track"></span></span></label>`;
    return KitFacil.ajustes.html({
      extras: {
        conta: `<div class="kf-bloco"><h3>Você nas comandas</h3>
          <p class="kf-ajuda">Escolha o seu nome entre as pessoas cadastradas. O Início e o Histórico usam essa escolha para mostrar os seus gastos e com quem você mais sai.</p>
          ${pessoas.length ? `<div class="field"><label for="aj-me">Seu nome</label><select id="aj-me" class="kf-entrada"><option value="">Não escolhido</option>${pessoas.map(p => `<option value="${esc(p.name)}" ${norm(p.name) === norm(catalog.me) ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select></div>`
            : '<p class="kf-ajuda">Ainda não há pessoas cadastradas. Elas entram nos Cadastros quando você salva a primeira comanda.</p>'}</div>`,
      },
      resumos: { conta: catalog.me ? `Você é ${catalog.me}` : undefined, preferencias: 'Idioma e instalação do app' },
      produto: [{ id: 'comandas', titulo: 'Tampinhas e apresentação', icone: '<path d="M6 3.500h12v17l-3-2-3 2-3-2-3 2z"/><path d="M9.500 8.500h5M9.500 12.500h5"/>', resumo: jogoLigado() ? `Nível ${s.nivel} · ${s.ganhas.length} de ${TAMPINHAS.length} tampinhas` : 'Tampinhas desligadas',
        html: `<div class="kf-bloco"><h3>Tampinhas e níveis</h3>${chave('aj-jogo', jogoLigado(), 'Mostrar tampinhas e níveis', 'Desligado, o app fica só com as comandas. Nada é apagado.')}</div>
          <div class="kf-bloco"><h3>Apresentação</h3><p class="kf-ajuda">As telas que aparecem na primeira vez que o app abre. O guia e a comanda de exemplo ficam em Mais.</p><button type="button" class="kf-btn kf-sec" id="aj-abertura">Rever a apresentação</button></div>` }],
    }).replace(/(<div class="kf-apoio-sobre">)[\s\S]*?(<p class="kf-ajuda">)/, '$1' + PRESENTE_MINI + '$2');
  },
  bind(v) {
    KitFacil.ajustes.ligar(v);
    $('#aj-me', v)?.addEventListener('change', e => { catalog.me = e.target.value; store.saveCatalog(); KitFacil.ajustes.resumo('conta', catalog.me ? `Você é ${catalog.me}` : 'Sem cadastro · dados neste aparelho'); toast(catalog.me ? `Pronto: você é ${catalog.me}.` : 'Nome desmarcado.'); });
    $('#aj-jogo', v)?.addEventListener('change', e => { jogo.off = !e.target.checked; jogoSalvar(); pintarNav(); const s = jogoEstado(); KitFacil.ajustes.resumo('comandas', jogoLigado() ? `Nível ${s.nivel} · ${s.ganhas.length} de ${TAMPINHAS.length} tampinhas` : 'Tampinhas desligadas'); toast(jogoLigado() ? 'Tampinhas e níveis ligados.' : 'Tampinhas e níveis desligados.'); });
    $('#aj-abertura', v)?.addEventListener('click', () => aberturaAbrir({ rever: true }));
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
    { arte: `<div class="imp ab-imp"><div class="imp-boca"></div><div class="imp-saida"><div class="papel imp-papel sai"><span class="mono fp-marca">CONTA FÁCIL</span><span class="mono fp-local">Cantina da Praça</span><span class="fp-linha"></span>
        <span class="mono ab-l"><span>Ana</span><span>77,09</span></span><span class="mono ab-l"><span>Bruno</span><span>64,18</span></span><span class="mono ab-l"><span>Carla</span><span>99,67</span></span><span class="mono fp-tot"><span>TOTAL</span><span>R$ 240,94</span></span></div></div></div>`,
      t: veterano && !rever ? 'O Conta Fácil está de cara nova' : 'A conta da mesa, sem calculadora',
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
      <div class="ab-pe"><button type="button" class="btn ghost" id="ab-volta">Voltar</button><button type="button" class="btn ambar" id="ab-prox">Continuar</button></div>
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

/* ---------- presente: o apoio ao criador, com o presente em 3D ---------- */
const PRESENTE_MINI = `<svg class="presente-mini" viewBox="0 0 48 48" aria-hidden="true"><path d="M24 20 6 14v22l18 8z" fill="#17492F"/><path d="M24 20l18-6v22l-18 8z" fill="#1D5A3B"/><path d="M4 10l20 6 20-6-20-6z" fill="#2A7B52"/><path d="M4 10v6l20 6v-6z" fill="#1D5A3B"/><path d="M44 10v6l-20 6v-6z" fill="#24704A"/>
  <path d="M13 12.700v25.800l4 1.400V14zM31 14v25.900l4-1.400V12.700z" fill="#F2B33D"/><path d="M11.500 7.800 31 14l4-1.300L15.500 6.500zM36.500 7.800 17 14l-4-1.300 19.500-6.200z" fill="#F7C65A"/><path d="M24 9c-3-6-10-5-8-1 1.200 2.200 5 1.800 8 1zm0 0c3-6 10-5 8-1-1.200 2.200-5 1.800-8 1z" fill="#F2B33D" stroke="#B97A0E" stroke-width="1.200" stroke-linejoin="round"/></svg>`;
function apoioSheet() {
  if (!KitFacil.apoio.ativo()) return;
  const codigo = KitFacil.apoio.codigo();
  openSheet({ title: 'Mande um presente para o criador!', body: `<div class="ap">${presente3dHTML()}<p class="tn-dica" aria-hidden="true">Deslize o dedo para girar</p>
      <p class="ap-tx">Gostando do Conta Fácil? O app é gratuito e feito por uma pessoa só. Se ele ajuda você, mande um presente pelo Pix. Qualquer valor ajuda.</p>
      <div class="ap-qr" id="ap-qr" role="img" aria-label="QR code do Pix do criador"><span class="hint">Preparando o QR code…</span></div>
      <p class="hint">Abra o app do seu banco, escolha <b>Pix</b> e leia o QR code, ou copie o código e cole em <b>Pix copia e cola</b>. É opcional: o app continua igual para todos.</p></div>`,
    foot: `<button type="button" class="btn" id="ap-copiar">${I.copy}Copiar código Pix</button>`,
    onMount: s => {
      girar3d(s);
      $('#ap-copiar', s).onclick = () => copyText(codigo, 'Código Pix copiado. Cole no app do seu banco.');
      const cx = $('#ap-qr', s);
      qrMatrix(codigo).then(m => { if (!cx.isConnected) return; const c = document.createElement('canvas'); c.width = c.height = 480; drawQR(c.getContext('2d'), m, 0, 0, 480); cx.innerHTML = ''; cx.appendChild(c); })
        .catch(() => { if (cx.isConnected) cx.innerHTML = '<span class="hint">Sem internet para mostrar o QR code agora. Use o botão Copiar código Pix.</span>'; });
    } });
}
// o presente abre sempre a janela do app, de onde quer que venha o toque (barra de cima ou Sobre o aplicativo)
window.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-kf="apoio"]'); if (!b) return; e.preventDefault(); e.stopImmediatePropagation(); apoioSheet(); }, true);
// barra de cima: nuvem, presente e balão, os três no mesmo traço e na mesma cor
function topoHTML() {
  const presente = KitFacil.apoio.ativo() ? `<button type="button" class="kf-topo-btn" id="topo-presente" data-kf="apoio" aria-label="Mande um presente para o criador" title="Mande um presente para o criador">${I.presente}</button>` : '';
  return KitFacil.topo.html({ principal: false }).replace(/(<button type="button" class="kf-topo-btn[^>]*data-kf="feedback")/, presente + '$1');
}

/* ---------- guia: o app faz cada passo na tela, do começo ao fim, numa demonstração que não grava nada ----------
   A janela do guia tem um lugar só dela, acima da barra de baixo: não cobre nada e não sai do lugar.
   Antes de cada passo ela pisca e a moldura se esvazia no sentido do relógio; só então o passo acontece. */
Object.assign(I, {
  pausa: ic('<path d="M9 5.500v13M15 5.500v13"/>'), tocar: ic('<path d="M8 5.500v13l10.500-6.500z"/>'),
  anterior: ic('<path d="M18 6v12l-8.500-6zM6.500 6v12"/>'), seguinte: ic('<path d="M6 6v12l8.500-6zM17.500 6v12"/>'),
});
let guia = null, guiaDeixaTampa = false;
const guiaAtivo = () => !!guia;
const GUIA_CANCELA = { cancelado: true };
const dorme = ms => new Promise(r => setTimeout(r, ms));
const quadro = () => new Promise(r => requestAnimationFrame(r));
const guiaFoto = () => JSON.stringify({ draft, bills, catalog, jogo, tab, cadAba, pesAberto, itemAberto });
function guiaLimparTela() { $('#festa-ok')?.click(); closeSheet(true); guiaDeixaTampa = false; tampaFila = []; $('#guia-dedo')?.classList.remove('ver'); }
function guiaZerarTela() { pending = {}; itPend = {}; pesJuntando = false; pesSvc = false; jogoMemo.chave = ''; cacheBills = new WeakMap(); }
function guiaRestaurar(f) {
  guiaLimparTela(); if (tab === 'ajustes') sairDosAjustes();
  const o = JSON.parse(f);
  draft = o.draft; bills = o.bills; catalog = o.catalog; jogo = o.jogo; tab = o.tab; cadAba = o.cadAba; pesAberto = o.pesAberto; itemAberto = o.itemAberto;
  guiaZerarTela(); render({ anchor: false }); window.scrollTo({ top: 0 });
}
function guiaIniciar() {
  if (guia || aberturaAtiva()) return;
  if (draft.live) { toast('Saia da comanda ao vivo antes de ver o guia.'); return; }
  sairDosAjustes(); closeSheet(true);
  // os dados de verdade ficam guardados na memória; a demonstração começa do zero e nada dela é gravado
  dadosReais = { bills, catalog, jogo, draft };
  semSalvar = true;
  bills = []; catalog = fixCatalog({}); jogo = { flags: {}, vistas: {}, off: jogo.off, pronto: true };
  draft = blankDraft(); pesAberto = null; itemAberto = null; tab = 'inicio'; cadAba = 'pessoas'; tampaFila = []; guiaZerarTela();
  guia = { i: 0, passos: GUIA.filter(p => !p.se || p.se()), fotos: [], pausado: false, rapido: false, tk: null, fase: '' };
  guiaMontar();
  render({ anchor: false }); window.scrollTo({ top: 0 });
  guiaRodar();
}
function guiaParar({ concluiu = false } = {}) {
  const g = guia; if (!g) return;
  guia = null;
  guiaLimparTela(); if (tab === 'ajustes') sairDosAjustes();
  ['#guia-doca', '#guia-escudo', '#guia-dedo'].forEach(q => $(q)?.remove());
  document.body.classList.remove('com-guia');
  document.removeEventListener('keydown', guiaTecla, true); removeEventListener('resize', guiaMoldura);
  const r = dadosReais; dadosReais = null; semSalvar = false;
  bills = r.bills; catalog = r.catalog; jogo = r.jogo; draft = r.draft.isExample ? loadRealDraft() : r.draft;
  pesAberto = null; itemAberto = null; cadAba = 'pessoas'; tab = 'inicio'; guiaZerarTela();
  render({ anchor: false }); window.scrollTo({ top: 0 });
  if (concluiu) { jogoMarcar('guia'); toast('Guia concluído. Para rever, toque em Mais e em Ver o guia.'); }
}
function guiaTecla(e) { if (guia && e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); guiaParar(); } }
function guiaMoldura() {
  const cx = $('.guia-cx'); if (!cx) return;
  const w = cx.clientWidth, h = cx.clientHeight, r = 19, a = 1.5;
  // a moldura começa no alto, no meio, e anda no sentido do relógio
  const d = `M${w / 2} ${a}H${w - r}A${r - a} ${r - a} 0 0 1 ${w - a} ${r}V${h - r}A${r - a} ${r - a} 0 0 1 ${w - r} ${h - a}H${r}A${r - a} ${r - a} 0 0 1 ${a} ${h - r}V${r}A${r - a} ${r - a} 0 0 1 ${r} ${a}Z`;
  $$('.guia-moldura path', cx).forEach(p => p.setAttribute('d', d));
}
function guiaMontar() {
  document.body.classList.add('com-guia');
  const esc0 = document.createElement('div'); esc0.id = 'guia-escudo'; esc0.className = 'guia-escudo'; esc0.setAttribute('aria-hidden', 'true');
  const doca = document.createElement('section'); doca.id = 'guia-doca'; doca.className = 'guia-doca'; doca.setAttribute('aria-label', 'Guia do app');
  doca.innerHTML = `<div class="guia-cx"><svg class="guia-moldura" aria-hidden="true"><path class="gm-trilho"/><path class="gm-tempo" pathLength="1" stroke-dasharray="1 1"/></svg>
      <div class="guia-tx" aria-live="polite"><p class="guia-t" id="guia-t"></p><p class="guia-d" id="guia-d"></p></div>
      <div class="guia-pe"><span class="guia-n"><span id="guia-n"></span><i aria-hidden="true"><b id="guia-prog"></b></i></span>
        <button type="button" class="guia-b" id="guia-volta" aria-label="Voltar um passo">${I.anterior}</button>
        <button type="button" class="guia-b pri" id="guia-pausa" aria-label="Pausar o guia">${I.pausa}</button>
        <button type="button" class="guia-b" id="guia-pula" aria-label="Pular para o próximo passo">${I.seguinte}</button>
        <button type="button" class="guia-b" id="guia-sai" aria-label="Sair do guia">${I.x}</button></div></div>`;
  const dedo = document.createElement('div'); dedo.id = 'guia-dedo'; dedo.className = 'guia-dedo'; dedo.setAttribute('aria-hidden', 'true');
  document.body.append(esc0, doca, dedo);
  $('#guia-volta').onclick = () => { const g = guia; if (!g) return; g.i = g.fase === 'acao' ? g.i : Math.max(0, g.i - 1); g.rapido = false; g.pausado = false; g.tk = {}; guiaRestaurar(g.fotos[g.i]); };
  $('#guia-pausa').onclick = () => { const g = guia; if (!g) return; g.pausado = !g.pausado; guiaPintar(); };
  $('#guia-pula').onclick = () => { const g = guia; if (!g) return; g.pausado = false; g.rapido = true; guiaPintar(); };
  $('#guia-sai').onclick = () => guiaParar();
  document.addEventListener('keydown', guiaTecla, true); addEventListener('resize', guiaMoldura);
  guiaMoldura();
}
function guiaPintar() {
  const g = guia; if (!g) return;
  const p = g.passos[g.i], n = g.passos.length;
  if ($('#guia-t').textContent !== p.t) { $('#guia-t').textContent = p.t; $('#guia-d').textContent = p.d; }
  $('#guia-n').textContent = `${g.i + 1} de ${n}`; $('#guia-prog').style.width = Math.round((g.i + 1) / n * 100) + '%';
  const b = $('#guia-pausa'); b.innerHTML = g.pausado ? I.tocar : I.pausa; b.setAttribute('aria-label', g.pausado ? 'Continuar o guia' : 'Pausar o guia');
  $('#guia-volta').disabled = g.i === 0 && g.fase !== 'acao';
}
// a janela pisca para chamar a atenção; depois a moldura se esvazia como um relógio e o passo começa
async function guiaContagem(g, tk, p) {
  const vivo = () => { if (guia !== g || g.tk !== tk) throw GUIA_CANCELA; };
  const cx = $('.guia-cx'), tempo = $('.gm-tempo');
  tempo.style.strokeDashoffset = '0'; tempo.style.opacity = '1';
  cx.classList.remove('pisca'); void cx.offsetWidth; cx.classList.add('pisca');
  const dur = Math.min(3800, 1900 + (p.t.length + p.d.length) * 17);
  let t = -900, ult = performance.now();
  while (t < dur && !g.rapido) {
    await quadro(); vivo();
    const agora = performance.now(); if (!g.pausado) t += Math.min(100, agora - ult); ult = agora;
    if (t > 0) tempo.style.strokeDashoffset = String(-Math.min(1, t / dur));
  }
  cx.classList.remove('pisca'); tempo.style.strokeDashoffset = '-1'; tempo.style.opacity = '0';
}
// as mãos do guia: acham o alvo, trazem para a área livre da tela, levam o dedo até ele e tocam, escrevem ou arrastam
function guiaMaos(g, tk) {
  const dedo = $('#guia-dedo');
  const vivo = () => { if (guia !== g || g.tk !== tk) throw GUIA_CANCELA; };
  const espera = async ms => { let t = ms; for (;;) { vivo(); if (g.pausado) { await dorme(60); continue; } if (g.rapido || t <= 0) return; const d = Math.min(50, t); await dorme(d); t -= d; } };
  const acha = async (q, { prazo = 3500, opcional = false } = {}) => {
    const fim = Date.now() + prazo;
    for (;;) {
      vivo();
      const el = typeof q === 'string' ? $$(q).find(e => e.getClientRects().length && !e.closest('#kf-saidas')) : (q && q.isConnected ? q : null);
      if (el) return el;
      if (Date.now() > fim) { if (opcional) return null; throw new Error('guia: não achei ' + q); }
      await dorme(40);
    }
  };
  const some = async (q, prazo = 2500) => { const fim = Date.now() + prazo; while (Date.now() < fim) { vivo(); if (!$$(q).some(e => e.getClientRects().length && !e.closest('#kf-saidas'))) return; await dorme(40); } };
  const suave = () => (g.rapido || semMovimento() ? 'auto' : 'smooth');
  const mostrar = async el => {
    if (el.closest('.kf-nav, .kf-barra, .kf-trilho')) return;
    const r = el.getBoundingClientRect(), topo = ($('#barra')?.getBoundingClientRect().bottom || 0) + 10, fundo = ($('#guia-doca')?.getBoundingClientRect().top || innerHeight) - 12;
    if (r.top >= topo && r.bottom <= fundo) return;
    if (el.closest('.kf-dlg, .festa')) el.scrollIntoView({ block: 'center', behavior: suave() });
    else window.scrollBy({ top: r.top + Math.min(r.height, fundo - topo) / 2 - (topo + fundo) / 2, behavior: suave() });
    await espera(480);
  };
  const por = (x, y) => { dedo.style.transform = `translate(${Math.round(x)}px,${Math.round(y)}px)`; };
  const levar = async el => {
    await mostrar(el); vivo();
    const r = el.getBoundingClientRect();
    dedo.classList.add('ver'); por(Math.max(20, Math.min(innerWidth - 20, r.left + r.width / 2)), r.top + Math.min(r.height / 2, 80));
    await espera(620);
  };
  const tocar = async (q, { clique = true, depois = 480, ...o } = {}) => {
    const el = await acha(q, o); if (!el) return null;
    await levar(el); vivo();
    dedo.classList.add('toca'); await espera(170); vivo();
    if (clique && el.isConnected) el.click();
    await espera(210); dedo.classList.remove('toca'); await espera(depois);
    return el;
  };
  const valor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
  const digitar = async (q, texto, { ritmo = 55 } = {}) => {
    const el = await acha(q); await levar(el); vivo();
    dedo.classList.add('toca'); await espera(150); dedo.classList.remove('toca');
    el.classList.add('guia-escreve');
    try {
      valor.call(el, '');
      for (const ch of texto) { vivo(); valor.call(el, el.value + ch); el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: ch })); await espera(ritmo); }
      el.dispatchEvent(new Event('change', { bubbles: true }));
    } finally { el.classList.remove('guia-escreve'); }
    await espera(280);
  };
  const apontar = async (q, ms = 1400, o) => {
    const el = await acha(q, o); if (!el) return null;
    await levar(el); el.classList.add('guia-olha');
    try { await espera(ms); } finally { el.classList.remove('guia-olha'); }
    return el;
  };
  // arrasta o dedo de lado sobre um objeto (é assim que a tampinha e o presente giram)
  const arrastar = async (q, dx, { dur = 1000 } = {}) => {
    const el = await acha(q); await levar(el); vivo();
    const r = el.getBoundingClientRect(), y = r.top + r.height / 2, x0 = r.left + r.width / 2 - dx / 2;
    const ev = (tipo, x) => el.dispatchEvent(new PointerEvent(tipo, { bubbles: true, clientX: x, clientY: y, pointerId: 77, pointerType: 'touch', isPrimary: true, button: 0 }));
    por(x0, y); await espera(380); vivo();
    dedo.style.transition = 'opacity .2s'; dedo.classList.add('toca'); ev('pointerdown', x0);
    try {
      const n = g.rapido || semMovimento() ? 3 : Math.max(8, Math.round(dur / 16));
      for (let k = 1; k <= n; k++) { vivo(); const x = x0 + dx * (0.5 - Math.cos(Math.PI * k / n) / 2); ev('pointermove', x); por(x, y); await quadro(); }
    } finally { ev('pointerup', x0 + dx); dedo.classList.remove('toca'); dedo.style.transition = ''; }
    await espera(900);
  };
  return { espera, acha, some, tocar, digitar, apontar, arrastar, vivo, sumir: () => dedo.classList.remove('ver') };
}
async function guiaRodar() {
  const g = guia;
  while (guia === g && g.i < g.passos.length) {
    const tk = g.tk = {}, p = g.passos[g.i], m = guiaMaos(g, tk);
    try {
      if (!g.fotos[g.i]) g.fotos[g.i] = guiaFoto();
      g.fase = 'conta'; guiaPintar();
      await guiaContagem(g, tk, p);
      g.fase = 'acao'; guiaPintar();
      await p.acao(m);
      await m.espera(700); m.sumir();
    } catch (e) {
      if (guia !== g) return;
      if (e === GUIA_CANCELA) continue; // voltou um passo: o laço recomeça no passo escolhido
      console.warn('guia', e);
    }
    if (guia !== g) return;
    g.rapido = false;
    if (g.tk === tk) g.i++;
  }
  if (guia === g) guiaParar({ concluiu: true });
}
const demoId = n => draft.people.find(p => p.name === n)?.id || '';
const demoItem = n => draft.items.find(x => x.name === n)?.id || '';
const navQ = t => `#tab-${t}, #trilho-${t}`;
// lança um pedido na janela de lançar: nome, quantidade (pelo +), valor e a divisão
async function demoLancar(m, { nome, mais = 0, preco, individual, fora, olhar }) {
  await m.tocar('#it-novo'); await m.acha('#pr-nome');
  await m.digitar('#pr-nome', nome);
  for (let k = 0; k < mais; k++) await m.tocar('[data-pr-step="1"]', { depois: 160 });
  await m.digitar('#pr-preco', preco, { ritmo: 110 });
  if (olhar) await m.apontar(olhar, 1500);
  if (individual) { await m.tocar('[data-lc-modo="units"]'); for (const [n, q] of individual) for (let k = 0; k < q; k++) await m.tocar(`[data-lc-un="${demoId(n)}"][data-dir="1"]`, { depois: 200 }); }
  for (const n of fora || []) await m.tocar(`[data-lc-ck="${demoId(n)}"]`, { depois: 240 });
  await m.espera(500);
  await m.tocar('#lc-ok'); await m.some('#pr-nome'); await m.espera(700);
}
const GUIA = [
  { t: 'Comece pelo nome do lugar', d: 'No Início, escreva onde você está e toque em Abrir comanda.',
    acao: async m => { await m.digitar('#ini-local', 'Cantina da Praça'); await m.tocar('#ini-form button[type=submit]'); await m.acha('#add-pessoa'); } },
  { t: 'Ponha as pessoas na mesa', d: 'Toque em Pessoa e escreva o nome de cada um. Quem já tem cadastro aparece como sugestão.',
    acao: async m => { await m.tocar('#add-pessoa'); for (const n of ['Ana', 'Bruno', 'Carla', 'Diego']) { await m.digitar('#pn-nome', n, { ritmo: 70 }); await m.tocar('#pn-form button[type=submit]', { depois: 260 }); } await m.tocar('#pn-ok'); await m.some('#pn-nome'); } },
  { t: 'Lance o primeiro pedido', d: 'Produto, quantidade e valor numa janela só. O item já entra dividido entre todos.',
    acao: async m => { await demoLancar(m, { nome: 'Porção de fritas', preco: '4200', olhar: '.kf-dlg .ck-list' }); } },
  { t: 'Consumo individual', d: 'Cada um pediu o seu? Escolha Individual e diga quantas unidades são de cada pessoa.',
    acao: async m => { await demoLancar(m, { nome: 'Suco de laranja', mais: 2, preco: '900', individual: [['Ana', 2], ['Bruno', 1]] }); } },
  { t: 'Só alguns dividiram', d: 'Desmarque quem ficou de fora. O valor é repartido só entre os marcados.',
    acao: async m => { await demoLancar(m, { nome: 'Pudim', preco: '1800', fora: ['Ana', 'Bruno'] }); } },
  { t: 'Confira ou altere um pedido', d: 'Toque num pedido para ver quem dividiu. Em Alterar, mude o que precisar.',
    acao: async m => { const it = demoItem('Porção de fritas'); await m.tocar(`[data-item="${it}"] .it-lin`); await m.espera(700); await m.apontar(`[data-item="${it}"] [data-it-alt]`); await m.tocar(`[data-item="${it}"] .it-lin`); } },
  { t: 'A parte de cada pessoa', d: 'A comanda soma na hora. Toque num nome para ver os atalhos dessa pessoa.',
    acao: async m => { const u = demoId('Diego'); await m.tocar(`summary[data-unit="${u}"]`); await m.espera(500); await m.apontar(`[data-pa="${u}"] [data-pa-cupom]`); await m.apontar(`[data-pa="${u}"] [data-pa-mais]`, 1100); } },
  { t: 'Um cupom para duas pessoas', d: 'Juntar une os dois num cupom só. Arrastar um nome sobre o outro faz o mesmo.',
    acao: async m => { const u = demoId('Diego'); await m.tocar(`[data-pa="${u}"] [data-pa-juntar]`); await m.tocar(`[data-pa="${u}"] [data-pa-alvo="p:${demoId('Carla')}"]`); await m.apontar('summary.dv-grupo', 1500); } },
  { t: 'Marque quem já pagou', d: 'O carimbo PAGO aparece no nome, e o total mostra quanto ainda falta receber.',
    acao: async m => { const u = demoId('Ana'); await m.tocar(`summary[data-unit="${u}"]`); await m.tocar(`[data-pa="${u}"] [data-pa-pago]`); await m.apontar('#cmd-conta', 1500); } },
  { t: 'Serviço, couvert e desconto', d: 'Toque no total para abrir a conta da mesa e ligar ou ajustar cada um.',
    acao: async m => { await m.tocar('#cm-pe'); await m.acha('#cm-ok'); for (const k of ['svc', 'cv', 'ds']) { const i = await m.acha(`[data-cm="${k}"]`); await m.apontar(i.closest('.cm-bloco'), 1200); } await m.tocar('#cm-ok'); await m.some('#cm-ok'); } },
  { t: 'Comanda ao vivo', d: 'Compartilhe a comanda: cada pessoa lança os pedidos pelo próprio celular.', se: () => !!store.db,
    acao: async m => { await m.apontar('#live-start', 2000, { opcional: true, prazo: 1200 }); } },
  { t: 'Feche a comanda', d: 'Na hora de pagar, toque em Fechar. O primeiro cupom é o resumo da mesa.',
    acao: async m => { await m.tocar('#fechar-cmd'); await m.acha('#fc-prox'); await m.espera(1400); } },
  { t: 'Um cupom para cada pessoa', d: 'Passe os cupons. Copie o texto com o Pix ou gere um PDF para mandar.',
    acao: async m => { await m.tocar('#fc-prox', { depois: 1000 }); await m.tocar('#fc-prox', { depois: 1000 }); await m.apontar('[data-fc-copiar="2"]', 1200); await m.apontar('[data-fc-pdf="2"]', 1200); } },
  { t: 'Salve no Histórico', d: 'Salvar encerra a comanda e guarda tudo. Se foi cedo demais, dá para desfazer.',
    acao: async m => { await m.tocar('#fc-salvar'); const ok = await m.acha('#festa-ok', { opcional: true, prazo: 2500 }); if (ok) { await m.espera(3200); await m.apontar('.festa-xp', 1600); await m.tocar('#festa-ok'); } else await m.espera(1600); } },
  { t: 'Tampinhas e níveis', d: 'Cada comanda salva rende pontos. As tampinhas que você ganha ficam na coleção.', se: () => jogoLigado(),
    acao: async m => { await m.tocar(navQ('tampinhas')); await m.apontar('#view .nivel-card', 1700); await m.apontar('#view [data-tampa="primeira"]', 1300); } },
  { t: 'Gire a tampinha', d: 'Toque numa tampinha e deslize o dedo sobre ela: ela gira nas suas mãos.', se: () => jogoLigado(),
    acao: async m => { await m.tocar('#view [data-tampa="primeira"]'); await m.acha('.kf-dlg .o3d'); await m.espera(600); await m.arrastar('.kf-dlg .o3d', 150); await m.arrastar('.kf-dlg .o3d', -230, { dur: 1300 }); await m.tocar('#tp-ok'); await m.some('#tp-ok'); } },
  { t: 'Histórico e gastos', d: 'As comandas salvas ficam aqui, mês a mês, com o resumo de quanto se gastou.',
    acao: async m => { await m.tocar(navQ('historico')); await m.apontar('#view .retro', 1700, { opcional: true }); await m.apontar('#view .hist-mes', 1500); } },
  { t: 'Reabra uma comanda salva', d: 'Toque numa comanda para rever os cupons, mandar de novo ou corrigir.',
    acao: async m => { await m.tocar('#view .hist-mes [data-bill]'); await m.acha('#sh-edit'); await m.espera(900); await m.apontar('#sh-pdf', 1100); await m.apontar('#sh-edit', 1100); await m.tocar('.kf-dlg [data-kf-fechar]'); await m.some('#sh-edit'); } },
  { t: 'Cadastros', d: 'Em Mais, os Cadastros guardam as pessoas e a chave Pix de cada uma.',
    acao: async m => { await m.tocar(navQ('mais')); await m.tocar('#view [data-ir="cadastros"]'); await m.apontar('#view .cad-card .lin', 1700, { opcional: true }); } },
  { t: 'Turmas e produtos', d: 'Monte turmas para abrir a mesa de uma vez. Os preços ficam guardados por lugar.',
    acao: async m => { await m.tocar('#view [data-cad="turmas"]'); await m.espera(1300); await m.tocar('#view [data-cad="produtos"]'); await m.apontar('#view .cad-card .lin, #view .cad-card li', 1700, { opcional: true }); } },
  { t: 'Sorteie alguém da mesa', d: 'Quem escolhe o próximo lugar? O ponteiro gira e para num nome.',
    acao: async m => { await m.tocar(navQ('mais')); await m.tocar('#ma-sorteio'); await m.tocar('#gf-go'); await m.espera(5600); await m.tocar('#gf-x'); await m.some('#gf-x'); } },
  { t: 'Ajustes', d: 'Sincronização entre aparelhos, cópia de segurança, aparência e privacidade.',
    acao: async m => { await m.tocar('#view [data-kf="ajustes"]'); await m.acha('#view [data-kf-aj-ir]'); await m.espera(600); for (const el of $$('#view .kf-aj-lista [data-kf-aj-ir]').filter(e => e.getClientRects().length).slice(0, 3)) await m.apontar(el, 900); } },
  { t: 'No alto da tela', d: 'A nuvem sincroniza, o presente apoia o criador e o balão recebe a sua avaliação.',
    acao: async m => { await m.apontar('#barra [data-kf-nuvem]', 1300); await m.apontar('#topo-presente', 1300, { opcional: true, prazo: 600 }); await m.apontar('#barra [data-kf="feedback"]', 1300); } },
  { t: 'Um presente para o criador', d: 'O app é gratuito. Quem quiser apoiar manda um Pix. O presente também gira com o dedo.', se: () => KitFacil.apoio.ativo(),
    acao: async m => { await m.tocar('#topo-presente'); await m.acha('.kf-dlg .o3d'); await m.espera(700); await m.arrastar('.kf-dlg .o3d', 190, { dur: 1300 }); await m.tocar('.kf-dlg [data-kf-fechar]'); await m.some('.kf-dlg .o3d'); } },
  { t: 'Pronto, é isso', d: 'A demonstração some agora. Os seus dados continuam como estavam.',
    acao: async m => { await m.tocar(navQ('inicio')); await m.espera(1600); } },
];

/* ---------- arranque ---------- */
if (draft.live) { draft.isExample = false; draft.active = true; }
if (backfillPrices()) LS.set('catalog', catalog);
$('#topo').outerHTML = topoHTML();
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
