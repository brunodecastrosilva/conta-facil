/* Conta Fácil · níveis, tampinhas (em 3D), festa de fechamento e o sorteio da mesa.
   Quase tudo é derivado do histórico e dos cadastros (que sincronizam); só algumas marcas ficam neste aparelho.
   Nada aqui premia gastar ou beber mais: as tampinhas reconhecem o uso do app. */

/* ---------- estado ---------- */
let jogo = { flags: {}, vistas: {}, off: false, pronto: false, ...(LS.get('jogo', null) || {}) };
const jogoSalvar = () => LS.set('jogo', jogo);
const jogoLigado = () => !jogo.off;
const semMovimento = () => KitFacil.movimento.reduzido();
const vibrar = p => KitFacil.jogo.vibrar(p);
function jogoMarcar(flag) {
  if (jogo.flags[flag]) return;
  jogo.flags[flag] = Date.now(); jogoSalvar();
  setTimeout(() => jogoConferir({ silencioso: typeof guiaAtivo === 'function' && guiaAtivo() }), 400); // no guia, a demonstração não abre janela de tampinha
}

/* ---------- níveis ---------- */
const NIVEIS = [
  { nome: 'Recém-chegado', xp: 0 },
  { nome: 'Freguês', xp: 100 },
  { nome: 'Da casa', xp: 300 },
  { nome: 'Habitué', xp: 650 },
  { nome: 'Sócio da casa', xp: 1200 },
  { nome: 'Lenda da mesa', xp: 2200 },
];
const XP = { comanda: 40, pessoa: 5, pessoasMax: 40, tampinha: 60 };

/* ---------- tampinhas ---------- */
const ESMALTES = { ambar: ['#F2B33D', '#B97A0E'], verde: ['#2E8B5C', '#14432E'], vermelho: ['#D9483B', '#8F231A'], petroleo: ['#2A8C99', '#144B54'], ameixa: ['#A4486E', '#5E2340'], grafite: ['#55635B', '#26312B'] };
const TAMPINHAS = [
  { id: 'primeira', nome: 'Primeira comanda', como: 'Salve a sua primeira comanda.', cor: 'ambar', ic: 'receipt', ok: s => s.n >= 1 },
  { id: 'voce', nome: 'Prazer, eu', como: 'Diga quem é você nas comandas.', cor: 'verde', ic: 'user', ok: s => s.eu },
  { id: 'pix', nome: 'Pix na mão', como: 'Cadastre a chave Pix de alguém.', cor: 'petroleo', ic: 'qr', ok: s => s.pix > 0 },
  { id: 'juntos', nome: 'Na mesma conta', como: 'Salve uma comanda com cupom compartilhado.', cor: 'ameixa', ic: 'users', ok: s => s.grupos > 0 },
  { id: 'mesa-cheia', nome: 'Mesa cheia', como: 'Salve uma comanda com 6 pessoas ou mais.', cor: 'vermelho', ic: 'mesa', ok: s => s.maxPessoas >= 6, prog: s => [Math.min(s.maxPessoas, 6), 6] },
  { id: 'cortesia', nome: 'Por conta da casa', como: 'Salve uma comanda com uma cortesia.', cor: 'ambar', ic: 'presente', ok: s => s.cortesias > 0 },
  { id: 'quitada', nome: 'Tudo pago', como: 'Salve uma comanda com todos marcados como pagos.', cor: 'verde', ic: 'check', ok: s => s.quitadas > 0 },
  { id: 'turma', nome: 'Tem turma', como: 'Crie uma turma nos Cadastros.', cor: 'petroleo', ic: 'turma', ok: s => s.turmas > 0 },
  { id: 'sorteio', nome: 'Dedo de sorte', como: 'Sorteie alguém da mesa.', cor: 'ameixa', ic: 'sorteio', ok: s => !!s.flags.sorteio },
  { id: 'guia', nome: 'Leu a comanda', como: 'Veja o guia do app até o fim.', cor: 'grafite', ic: 'livro', ok: s => !!s.flags.guia },
  { id: 'nuvem', nome: 'Em todo lugar', como: 'Ligue a sincronização entre aparelhos.', cor: 'petroleo', ic: 'nuvem', ok: s => s.sync },
  { id: 'explorador', nome: 'Explorador', como: 'Salve comandas em 5 lugares diferentes.', cor: 'verde', ic: 'pino', ok: s => s.lugares >= 5, prog: s => [Math.min(s.lugares, 5), 5] },
  { id: 'fiel', nome: 'Cliente fiel', como: 'Salve 5 comandas no mesmo lugar.', cor: 'ambar', ic: 'coracao', ok: s => s.maxLugar >= 5, prog: s => [Math.min(s.maxLugar, 5), 5] },
  { id: 'dez', nome: 'Dez comandas', como: 'Salve 10 comandas.', cor: 'vermelho', ic: 'dez', ok: s => s.n >= 10, prog: s => [Math.min(s.n, 10), 10] },
  { id: 'prata', nome: 'Prata da casa', como: 'Salve 25 comandas.', cor: 'grafite', ic: 'estrela', ok: s => s.n >= 25, prog: s => [Math.min(s.n, 25), 25] },
];
const TAMPA_IC = {
  receipt: '<path d="M8 5h8v14l-1.4-1-1.3 1-1.3-1-1.3 1-1.3-1L8 19z"/><path d="M10.2 9h3.6M10.2 12h3.6"/>',
  user: '<circle cx="12" cy="9.5" r="2.8"/><path d="M6.8 18c.6-2.6 2.6-4 5.2-4s4.6 1.4 5.2 4"/>',
  qr: '<rect x="6" y="6" width="4.6" height="4.6" rx="1"/><rect x="13.4" y="6" width="4.6" height="4.6" rx="1"/><rect x="6" y="13.4" width="4.6" height="4.6" rx="1"/><path d="M13.6 13.6h2v2h-2zM18 13.6v.01M13.6 18v.01M16 18h2v-2"/>',
  users: '<circle cx="9.5" cy="9.5" r="2.4"/><circle cx="15.3" cy="10.3" r="1.9"/><path d="M5.2 17.6c.5-2.3 2.1-3.5 4.3-3.5s3.8 1.2 4.3 3.5M15.3 14.2c1.8 0 3 1 3.5 2.8"/>',
  mesa: '<ellipse cx="12" cy="10" rx="6.5" ry="2.6"/><path d="M12 12.6V18M8.5 18h7"/>',
  presente: '<rect x="6.5" y="10.5" width="11" height="7.5" rx="1"/><path d="M5.5 8h13v2.5h-13zM12 8v10M12 8c-1.2-3-4.4-2.4-3.6-.6.5 1 2.2.9 3.6.6zm0 0c1.2-3 4.4-2.4 3.6-.6-.5 1-2.2.9-3.6.6z"/>',
  check: '<path d="m7 12.4 3.4 3.4L17 8.6"/>',
  turma: '<circle cx="12" cy="8.6" r="2.2"/><circle cx="7" cy="11" r="1.7"/><circle cx="17" cy="11" r="1.7"/><path d="M8.2 17.8c.5-2.2 1.9-3.4 3.8-3.4s3.3 1.2 3.8 3.4"/>',
  sorteio: '<circle cx="12" cy="12" r="6.500"/><path d="M12 12l2.800-4.200M12 12h.01"/><path d="M12 3.600v1.400M20.400 12H19M12 20.400V19M3.600 12H5"/>',
  livro: '<path d="M6.5 6.5c2-.8 3.800-.6 5.500.5 1.700-1.100 3.500-1.300 5.500-.5v10.500c-2-.8-3.800-.600-5.500.5-1.700-1.100-3.500-1.300-5.500-.5zM12 7v10.500"/>',
  nuvem: '<path d="M8.300 17.500a3.300 3.300 0 0 1-.4-6.600 4.300 4.300 0 0 1 8.300-.6 3.600 3.600 0 0 1-.5 7.200z"/>',
  pino: '<path d="M12 19s-4.800-4.300-4.800-8a4.800 4.800 0 0 1 9.600 0c0 3.700-4.800 8-4.800 8z"/><circle cx="12" cy="11" r="1.700"/>',
  coracao: '<path d="M12 18s-5.500-3.400-5.500-7.300A3 3 0 0 1 12 9.300a3 3 0 0 1 5.500 1.400C17.500 14.600 12 18 12 18z"/>',
  dez: '<path d="M8 9l1.800-1.300V17M13.200 10.200a2.300 2.300 0 0 1 4.600 0v4.100a2.300 2.300 0 0 1-4.600 0z"/>',
  estrela: '<path d="m12 6 1.800 3.800 4.100.5-3 2.900.8 4.100L12 15.300 8.300 17.300l.8-4.100-3-2.900 4.100-.5z"/>',
};
// borda de tampinha: 21 dentes
const TAMPA_BORDA = (() => {
  const n = 21, R = 49, r = 44.5, pts = [];
  for (let i = 0; i < n * 2; i++) { const a = (Math.PI * i) / n - Math.PI / 2, q = i % 2 ? r : R; pts.push([(50 + q * Math.cos(a)).toFixed(2), (50 + q * Math.sin(a)).toFixed(2)]); }
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i <= pts.length; i++) { const p = pts[i % pts.length], ant = pts[i - 1], a = (Math.PI * (i - .5)) / n - Math.PI / 2, q = (i % 2 ? 47.9 : 45.800); d += `Q${(50 + q * Math.cos(a)).toFixed(2)} ${(50 + q * Math.sin(a)).toFixed(2)} ${p[0]} ${p[1]}`; void ant; }
  return d + 'Z';
})();
let tampaSeq = 0;
function tampaSVG(t, { apagada = false, rotulo = false } = {}) {
  const [c1, c2] = apagada ? ['#B9C4BC', '#8E9A92'] : ESMALTES[t.cor] || ESMALTES.ambar, k = 'tp' + (tampaSeq++);
  return `<svg class="tampa-svg${apagada ? ' apagada' : ''}" viewBox="0 0 100 100" ${rotulo ? `role="img" aria-label="${esc(t.nome)}"` : 'aria-hidden="true"'}>
    <defs><radialGradient id="${k}a" cx="35%" cy="28%" r="80%"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient>
    <linearGradient id="${k}b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
    <path d="${TAMPA_BORDA}" fill="${c2}"/><path d="${TAMPA_BORDA}" fill="url(#${k}a)" transform="translate(50 50) scale(.955) translate(-50 -50)"/>
    <circle cx="50" cy="50" r="35.5" fill="url(#${k}a)" stroke="rgba(0,0,0,.22)" stroke-width="1"/>
    <circle cx="50" cy="50" r="35" fill="url(#${k}b)"/>
    <circle cx="50" cy="50" r="30.500" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1" stroke-dasharray="1.500 3.200"/>
    <g transform="translate(20 20) scale(2.500)" fill="none" stroke="${apagada ? '#EEF2EF' : '#FFFDF5'}" stroke-width="1.700" stroke-linecap="round" stroke-linejoin="round">${TAMPA_IC[t.ic] || TAMPA_IC.estrela}</g>
  </svg>`;
}

/* ---------- o que o histórico diz ---------- */
let jogoMemo = { chave: '', s: null };
function jogoEstado() {
  const chave = bills.length + ':' + (bills[0]?.id || '') + ':' + (bills[0]?.savedAt || '') + ':' + catalog.people.length + ':' + (catalog.groups || []).length + ':' + (catalog.me || '') + ':' + Object.keys(jogo.flags).length + ':' + catalog.people.filter(p => p.pix).length + ':' + (SY && SY.ligada() ? 1 : 0);
  if (jogoMemo.chave === chave) return jogoMemo.s;
  const lugares = {}; let maxPessoas = 0, grupos = 0, cortesias = 0, quitadas = 0, xpPessoas = 0;
  bills.forEach(b => {
    const pk = placeKey(b.place); if (pk) lugares[pk] = (lugares[pk] || 0) + 1;
    const n = (b.people || []).length; maxPessoas = Math.max(maxPessoas, n);
    xpPessoas += Math.min(XP.pessoasMax, n * XP.pessoa);
    if ((b.groups || []).some(g => (g.members || []).length > 1)) grupos++;
    if ((b.items || []).some(i => (i.fq || 0) > 0)) cortesias++;
    if (n && b.pagos && b.people.every(p => b.pagos[p.id])) quitadas++;
  });
  const s = { n: bills.length, lugares: Object.keys(lugares).length, maxLugar: Math.max(0, ...Object.values(lugares)), maxPessoas, grupos, cortesias, quitadas, xpPessoas,
    pix: catalog.people.filter(p => p.pix).length, turmas: (catalog.groups || []).length, eu: !!catalog.me, flags: jogo.flags, sync: !!(SY && SY.ligada()) };
  s.ganhas = TAMPINHAS.filter(t => { try { return !!t.ok(s); } catch { return false; } }).map(t => t.id);
  s.xp = s.n * XP.comanda + s.xpPessoas + s.ganhas.length * XP.tampinha;
  const nv = KitFacil.jogo.nivel(s.xp, NIVEIS);
  s.nivel = nv.nivel; s.nivelNome = nv.nome; s.prox = nv.prox;
  jogoMemo = { chave, s };
  return s;
}
// tampinhas ganhas que a pessoa ainda não viu
function jogoNovas() { const s = jogoEstado(); return TAMPINHAS.filter(t => s.ganhas.includes(t.id) && !jogo.vistas[t.id]); }
function jogoConferir({ silencioso = false } = {}) {
  if (draft.isExample && !jogo.pronto) return [];
  const novas = jogoNovas(); if (!novas.length) { if (!jogo.pronto) { jogo.pronto = true; jogoSalvar(); } return []; }
  const agora = Date.now(); novas.forEach(t => { jogo.vistas[t.id] = agora; });
  const primeira = !jogo.pronto; jogo.pronto = true; jogoSalvar();
  // quem já usava o app chega com as tampinhas que o histórico garante, sem uma janela para cada uma
  if (silencioso || primeira || !jogoLigado()) return novas;
  if (festaAberta || KitFacil.dialogo.aberto() || (typeof guiaAtivo === 'function' && guiaAtivo() && !guiaDeixaTampa) || (typeof aberturaAtiva === 'function' && aberturaAtiva())) { tampaFila.push(...novas); return novas; }
  tampaNova(novas);
  return novas;
}
let tampaFila = [];
function tampaFilaMostrar() { if (!tampaFila.length || festaAberta || KitFacil.dialogo.aberto() || (typeof guiaAtivo === 'function' && guiaAtivo())) return; const l = tampaFila; tampaFila = []; tampaNova(l); }

/* ---------- objetos em 3D que giram com o dedo: peça opcional do Kit (comum/kit-jogo.js, KitFacil.jogo) ---------- */
Object.assign(KitFacil.jogo.icones, TAMPA_IC);
const tampa3dHTML = (t, { apagada = false, D = 172 } = {}) => KitFacil.jogo.tampaHTML({ id: t.id, nome: t.nome, cores: ESMALTES[t.cor] || ESMALTES.ambar, icone: TAMPA_IC[t.ic] ? t.ic : 'estrela', apagada, D });
const girar3d = (raiz, o) => KitFacil.jogo.girar(raiz, o);

/* ---------- tampinha nova: cai girando e assenta; ficha da tampinha ---------- */
function tampaNova(lista, aoFechar) {
  const t = lista[0], resto = lista.slice(1);
  vibrar([18, 40, 18]);
  openSheet({ title: 'Tampinha nova', onClose: () => { if (aoFechar) aoFechar(); else setTimeout(tampaFilaMostrar, 500); }, body: `<div class="tn"><div class="o3d-cai">${tampa3dHTML(t)}</div>
      <b class="tn-nome">${esc(t.nome)}</b><p class="hint">${esc(t.como.replace(/\.$/, ''))}: feito. +${XP.tampinha} pontos.</p>
      ${resto.length ? `<p class="tn-mais">E mais ${plural(resto.length, 'tampinha', 'tampinhas')}: ${esc(resto.map(x => x.nome).join(', '))}.</p>` : ''}</div>`,
    foot: `<button type="button" class="btn ghost" id="tn-ver">Ver a coleção</button><button type="button" class="btn" id="tn-ok">Boa</button>`,
    onMount: s => { const g = girar3d(s, { auto: false, inicio: semMovimento() ? -0.4 : 0 }); if (g && !semMovimento()) g.peteleco(2); $('#tn-ok', s).onclick = () => closeSheet(); $('#tn-ver', s).onclick = () => { closeSheet(true); irPara('tampinhas'); }; } });
}
function tampaSheet(t) {
  const s = jogoEstado(), tem = s.ganhas.includes(t.id), p = t.prog && !tem ? t.prog(s) : null, quando = jogo.vistas[t.id];
  openSheet({ title: t.nome, body: `<div class="tn">${tampa3dHTML(t, { apagada: !tem })}<p class="tn-dica" aria-hidden="true">Deslize o dedo para girar</p>
      <p class="tn-como">${esc(t.como)}</p>
      ${tem ? `<p class="hint">Na coleção${quando ? ' desde ' + fmtDate(quando) : ''}.</p>` : p ? `<div class="barra-xp" role="img" aria-label="${p[0]} de ${p[1]}"><i style="width:${Math.round(p[0] / p[1] * 100)}%"></i></div><p class="hint">${p[0]} de ${p[1]}</p>` : '<p class="hint">Ainda não está na coleção.</p>'}</div>`,
    foot: `<button type="button" class="btn" id="tp-ok">Fechar</button>`,
    onMount: d => { $('#tp-ok', d).onclick = () => closeSheet(); girar3d(d); } });
}

/* ---------- tela Tampinhas ---------- */
function bolachaHTML(s, { grande = false } = {}) {
  return `<span class="bolacha ${grande ? 'grande' : ''}" aria-hidden="true"><span class="bolacha-n">${s.nivel}</span><span class="bolacha-t">nível</span></span>`;
}
function nivelHTML(s) {
  return `<div class="nivel-tx"><b>${esc(s.nivelNome)}</b>
    ${s.prox ? `<div class="barra-xp" role="img" aria-label="${s.prox.pct}% do caminho até ${esc(s.prox.nome)}"><i style="width:${Math.max(4, s.prox.pct)}%"></i></div><small>Faltam ${s.prox.falta} pontos para ${esc(s.prox.nome)}</small>`
      : `<div class="barra-xp cheia" role="img" aria-label="Nível máximo"><i style="width:100%"></i></div><small>Nível máximo. ${s.xp} pontos</small>`}</div>`;
}
const viewTampinhas = {
  html() {
    const s = jogoEstado(), ganhas = new Set(s.ganhas);
    const ord = [...TAMPINHAS].sort((a, b) => ganhas.has(b.id) - ganhas.has(a.id));
    return `<header class="tela-cab"><h1 class="tela-t">Tampinhas</h1><p class="tela-sub">Uma coleção que cresce conforme você usa o app.</p></header>
      <div class="card nivel-card grande">${bolachaHTML(s, { grande: true })}${nivelHTML(s)}</div>
      <div class="sec-cab"><h2 class="sec-t">Coleção</h2><span class="hint">${s.ganhas.length} de ${TAMPINHAS.length}</span></div>
      <ul class="tampas">${ord.map(t => { const tem = ganhas.has(t.id), p = t.prog && !tem ? t.prog(s) : null;
        return `<li><button type="button" class="tampa ${tem ? 'tem' : ''}" data-tampa="${t.id}">${tampaSVG(t, { apagada: !tem })}<span class="tampa-nome">${esc(t.nome)}</span>${p ? `<span class="tampa-prog"><span class="so-leitor">: </span>${p[0]}/${p[1]}</span>` : ''}<span class="so-leitor">. ${tem ? 'Na coleção' : 'Falta ganhar. ' + esc(t.como)}</span></button></li>`; }).join('')}</ul>`;
  },
  bind(v) {
    $$('[data-tampa]', v).forEach(b => b.addEventListener('click', () => tampaSheet(TAMPINHAS.find(t => t.id === b.dataset.tampa))));
  },
};

/* ---------- sortear alguém da mesa: um ponteiro gira e para num nome ---------- */
const PONTEIRO_SVG = `<svg viewBox="0 0 60 200" aria-hidden="true"><defs><linearGradient id="pt-v" x1="0" x2="1"><stop offset="0" stop-color="#F7C65A"/><stop offset=".5" stop-color="#F2B33D"/><stop offset="1" stop-color="#B97A0E"/></linearGradient></defs>
  <path d="M30 6 52 62H38v92a8 8 0 0 1-16 0V62H8z" fill="url(#pt-v)" stroke="#8F5C08" stroke-width="2" stroke-linejoin="round"/><circle cx="30" cy="100" r="13" fill="#FFFDF5" stroke="#8F5C08" stroke-width="2"/><circle cx="30" cy="100" r="4.500" fill="#1D5A3B"/></svg>`;
function sorteioSheet() {
  // quem pode entrar: quem está na mesa e as pessoas dos cadastros. Quem entra de fato é escolha de quem sorteia:
  // a mesa já vem marcada (é o caso mais comum) e cada nome liga e desliga com um toque; dá para pôr um nome avulso
  const naMesa = draft.active ? draft.people.map(p => p.name) : [], MAX = 12;
  const lista = []; [...naMesa, ...[...catalog.people].sort((a, b) => (b.last || 0) - (a.last || 0)).map(p => p.name)].forEach(n => { if (!lista.some(x => norm(x) === norm(n))) lista.push(n); });
  const dentro = new Set(naMesa.slice(0, MAX));
  let ang = 0, girando = false;
  const nomes = () => lista.filter(n => dentro.has(n));
  const roda = () => { const L = nomes(), n = L.length; return L.map((nm, i) => `<span class="gf-nome" data-i="${i}" style="--a:${(360 / n) * i}deg"><span>${esc(nm.split(' ')[0])}</span></span>`).join(''); };
  const chips = () => lista.map(n => `<button type="button" class="kf-escolha" data-gf-n="${esc(n)}" aria-pressed="${dentro.has(n)}">${esc(n)}</button>`).join('');
  const frase = () => { const n = nomes().length; return n < 2 ? 'Escolha duas pessoas ou mais.' : `${n} no sorteio.`; };
  openSheet({ title: 'Sortear alguém da mesa', onClose: () => setTimeout(tampaFilaMostrar, 500), body: `<div class="gf">
      <div class="gf-mesa" id="gf-mesa"><div class="gf-roda" id="gf-roda">${roda()}</div><div class="gf-ponteiro" id="gf-ponteiro">${PONTEIRO_SVG}</div></div>
      <p class="gf-res" id="gf-res" role="status" aria-live="polite">${frase()}</p>
      <div class="gf-quem" id="gf-quem" role="group" aria-label="Quem entra no sorteio">${chips()}</div>
      <form class="gf-add" id="gf-add" autocomplete="off"><label class="so-leitor" for="gf-novo">Outro nome</label><input id="gf-novo" type="text" autocapitalize="words" maxlength="40" placeholder="Outro nome" enterkeyhint="done"><button type="submit" class="btn small ghost" aria-label="Pôr este nome no sorteio">${I.plus}</button></form></div>`,
    foot: `<button type="button" class="btn ghost" id="gf-x">Fechar</button><button type="button" class="btn ambar" id="gf-go">Sortear</button>`,
    onMount: s => {
      $('#gf-x', s).onclick = () => closeSheet();
      const go = $('#gf-go', s), g = $('#gf-ponteiro', s), res = $('#gf-res', s), quem = $('#gf-quem', s);
      const pintar = () => { $('#gf-roda', s).innerHTML = roda(); quem.innerHTML = chips(); res.textContent = frase(); go.toggleAttribute('disabled', nomes().length < 2); go.textContent = 'Sortear'; };
      pintar();
      quem.addEventListener('click', e => {
        const b = e.target.closest('[data-gf-n]'); if (!b || girando) return; const n = b.dataset.gfN;
        if (dentro.has(n)) dentro.delete(n); else { if (dentro.size >= MAX) { KitFacil.avisar(`O sorteio leva até ${MAX} pessoas.`); return; } dentro.add(n); }
        pintar();
      });
      $('#gf-add', s).addEventListener('submit', e => {
        e.preventDefault(); if (girando) return;
        const el = $('#gf-novo', s), n = el.value.trim().replace(/\s+/g, ' '); if (!n) return;
        const ja = lista.find(x => norm(x) === norm(n)), nome = ja || n; if (!ja) lista.push(n);
        if (!dentro.has(nome)) { if (dentro.size >= MAX) { KitFacil.avisar(`O sorteio leva até ${MAX} pessoas.`); return; } dentro.add(nome); }
        el.value = ''; pintar();
      });
      go.onclick = () => {
        const L = nomes(), n = L.length; if (girando || n < 2) return; girando = true; go.setAttribute('aria-disabled', 'true');
        const i = Math.floor(Math.random() * n), alvo = (360 / n) * i;
        $$('.gf-nome', s).forEach(e => e.classList.remove('vez'));
        const voltas = semMovimento() ? 0 : 4 + Math.floor(Math.random() * 3), dur = 3.4 + voltas * .2;
        ang = Math.ceil(ang / 360) * 360 + voltas * 360 + alvo;
        g.style.transition = semMovimento() ? 'none' : `transform ${dur}s cubic-bezier(.1,.7,.1,1)`;
        g.style.transform = `translate(-50%,-50%) rotate(${ang}deg)`;
        res.textContent = 'Sorteando…';
        const fim = () => { if (!go.isConnected) return; girando = false; go.removeAttribute('aria-disabled'); go.textContent = 'Sortear de novo'; $(`.gf-nome[data-i="${i}"]`, s)?.classList.add('vez'); res.innerHTML = `Saiu <b>${esc(L[i])}</b>.`; vibrar(30); jogoMarcar('sorteio'); };
        if (semMovimento()) fim(); else setTimeout(fim, dur * 1000 + 60);
      };
    } });
}

/* ---------- festa de fechamento ---------- */
let festaAberta = false;
const confete = (caixa, n) => KitFacil.jogo.confete(caixa, n);
// antes = estado do jogo antes de salvar; bill = a comanda salva
function festa(bill, antes, { desfazer } = {}) {
  if (!jogoLigado()) return false;
  const s = jogoEstado(), novas = jogoConferir({ silencioso: true }), ganho = s.xp - antes.xp, subiu = s.nivel > antes.nivel;
  const raiz = $('#festa'); if (!raiz) return false;
  festaAberta = true;
  const de = antes.prox ? antes.prox.pct : 100, para = subiu ? 100 : (s.prox ? s.prox.pct : 100);
  raiz.innerHTML = `<div class="festa" data-kf-tela-cheia role="dialog" aria-modal="true" aria-labelledby="festa-t"><div class="festa-in">
      <div class="imp festa-imp" aria-hidden="true"><div class="imp-boca"></div><div class="imp-saida"><div class="papel imp-papel sai"><span class="mono fp-marca">CONTA FÁCIL</span><span class="mono fp-local">${esc(bill.place || 'Comanda')}</span><span class="fp-linha"></span><span class="mono fp-tot"><span>TOTAL</span><span>${BRL(bill.total)}</span></span><span class="fp-carimbo">SALVA</span></div></div></div>
      <h2 class="festa-t" id="festa-t" tabindex="-1">Conta fechada</h2>
      <p class="festa-sub">${esc(bill.place || 'A comanda')} entrou no histórico: ${plural(bill.people.length, 'pessoa', 'pessoas')}, ${BRL(bill.total)}.</p>
      <div class="festa-xp"><div class="festa-xp-l">${bolachaHTML(s)}<span class="nivel-tx"><b>${subiu ? `Nível ${s.nivel}: ${esc(s.nivelNome)}` : esc(s.nivelNome)}</b><div class="barra-xp"><i id="festa-barra" style="width:${Math.max(4, de)}%"></i></div><small>+${ganho} pontos${s.prox ? ` · faltam ${s.prox.falta} para ${esc(s.prox.nome)}` : ''}</small></span></div></div>
      ${novas.length ? `<div class="festa-tampas">${novas.map((t, i) => `<span class="festa-tampa" style="--i:${i}">${tampaSVG(t)}<small>${esc(t.nome)}</small></span>`).join('')}</div>` : ''}
      <div class="festa-acoes"><button type="button" class="btn ambar bloco" id="festa-ok">Concluir</button>${desfazer ? `<button type="button" class="btn link" id="festa-des">Desfazer e voltar à comanda</button>` : ''}</div>
    </div></div>`;
  const cx = $('.festa', raiz), ant = document.activeElement;
  // a festa fecha clareando, no relógio do app
  const fechar = () => { if (!festaAberta) return; festaAberta = false; document.removeEventListener('keydown', tecla, true); cx.classList.add('sai'); cx.style.pointerEvents = 'none'; setTimeout(() => { if (cx.isConnected && !festaAberta) raiz.innerHTML = ''; }, semMovimento() ? 0 : MOVE.ms); try { ant && ant.focus && ant.focus({ preventScroll: true }); } catch {} };
  const tecla = e => { if (e.key === 'Escape') { e.preventDefault(); fechar(); }
    if (e.key === 'Tab') { const f = $$('button', cx); if (!f.length) return; const i = f.indexOf(document.activeElement); e.preventDefault(); f[(i + (e.shiftKey ? f.length - 1 : 1)) % f.length].focus(); } };
  document.addEventListener('keydown', tecla, true);
  $('#festa-ok', raiz).onclick = fechar;
  $('#festa-des', raiz)?.addEventListener('click', () => { fechar(); desfazer(); });
  requestAnimationFrame(() => { $('#festa-t', raiz)?.focus({ preventScroll: true }); setTimeout(() => { const b = $('#festa-barra', raiz); if (b) b.style.width = Math.max(4, para) + '%'; }, 900); });
  confete(cx);
  vibrar([20, 60, 20]);
  return true;
}
