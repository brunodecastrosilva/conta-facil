/* Conta Fácil · níveis, tampinhas, festa de fechamento e a garrafa.
   Quase tudo é derivado do histórico e dos cadastros (que sincronizam); só algumas marcas ficam neste aparelho.
   Nada aqui premia gastar ou beber mais: as tampinhas reconhecem o uso do app. */

/* ---------- estado ---------- */
let jogo = { flags: {}, vistas: {}, off: false, pronto: false, ...(LS.get('jogo', null) || {}) };
const jogoSalvar = () => LS.set('jogo', jogo);
const jogoLigado = () => !jogo.off;
const semMovimento = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; } };
// vibração curta, só depois de um toque (o navegador recusa antes disso)
const vibrar = p => { try { if (navigator.vibrate && (!navigator.userActivation || navigator.userActivation.hasBeenActive)) navigator.vibrate(p); } catch {} };
function jogoMarcar(flag) {
  if (jogo.flags[flag]) return;
  jogo.flags[flag] = Date.now(); jogoSalvar();
  setTimeout(() => jogoConferir(), 400);
}

/* ---------- níveis ---------- */
const NIVEIS = [
  { nome: 'Recém-chegado', xp: 0 },
  { nome: 'Freguês', xp: 100 },
  { nome: 'Da casa', xp: 300 },
  { nome: 'Habitué', xp: 650 },
  { nome: 'Sócio do balcão', xp: 1200 },
  { nome: 'Lenda do boteco', xp: 2200 },
];
const XP = { comanda: 40, pessoa: 5, pessoasMax: 40, tampinha: 60 };

/* ---------- tampinhas ---------- */
const ESMALTES = { ambar: ['#F2B33D', '#B97A0E'], verde: ['#2E8B5C', '#14432E'], vermelho: ['#D9483B', '#8F231A'], petroleo: ['#2A8C99', '#144B54'], vinho: ['#A4486E', '#5E2340'], grafite: ['#55635B', '#26312B'] };
const TAMPINHAS = [
  { id: 'primeira', nome: 'Primeira rodada', como: 'Salve a sua primeira comanda.', cor: 'ambar', ic: 'receipt', ok: s => s.n >= 1 },
  { id: 'voce', nome: 'Prazer, eu', como: 'Diga quem é você nas comandas.', cor: 'verde', ic: 'user', ok: s => s.eu },
  { id: 'pix', nome: 'Pix na mão', como: 'Cadastre a chave Pix de alguém.', cor: 'petroleo', ic: 'qr', ok: s => s.pix > 0 },
  { id: 'juntos', nome: 'Na mesma conta', como: 'Salve uma comanda com cupom compartilhado.', cor: 'vinho', ic: 'users', ok: s => s.grupos > 0 },
  { id: 'mesa-cheia', nome: 'Mesa cheia', como: 'Salve uma comanda com 6 pessoas ou mais.', cor: 'vermelho', ic: 'mesa', ok: s => s.maxPessoas >= 6, prog: s => [Math.min(s.maxPessoas, 6), 6] },
  { id: 'cortesia', nome: 'Por conta da casa', como: 'Salve uma comanda com uma cortesia.', cor: 'ambar', ic: 'presente', ok: s => s.cortesias > 0 },
  { id: 'quitada', nome: 'Tudo pago', como: 'Salve uma comanda com todos marcados como pagos.', cor: 'verde', ic: 'check', ok: s => s.quitadas > 0 },
  { id: 'turma', nome: 'Tem turma', como: 'Crie uma turma nos Cadastros.', cor: 'petroleo', ic: 'turma', ok: s => s.turmas > 0 },
  { id: 'ao-vivo', nome: 'Ao vivo', como: 'Compartilhe uma comanda ao vivo com a mesa.', cor: 'vermelho', ic: 'live', ok: s => !!s.flags.aoVivo },
  { id: 'garrafa', nome: 'Girou a garrafa', como: 'Gire a garrafa para sortear alguém da mesa.', cor: 'vinho', ic: 'garrafa', ok: s => !!s.flags.garrafa },
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
  live: '<circle cx="12" cy="12" r="1.6"/><path d="M15.2 8.8a4.5 4.5 0 0 1 0 6.4M8.8 15.2a4.5 4.5 0 0 1 0-6.4M17.5 6.5a7.8 7.8 0 0 1 0 11M6.5 17.5a7.8 7.8 0 0 1 0-11"/>',
  garrafa: '<path d="M10.6 5h2.8v3.2l1.6 2.4V18a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-7.400l1.600-2.400z"/><path d="M9.200 13.5h5.600"/>',
  livro: '<path d="M6.5 6.5c2-.8 3.800-.6 5.500.5 1.700-1.100 3.500-1.300 5.500-.5v10.500c-2-.8-3.800-.600-5.500.5-1.700-1.100-3.500-1.300-5.500-.5zM12 7v10.500"/>',
  nuvem: '<path d="M8.300 17.500a3.300 3.300 0 0 1-.4-6.600 4.300 4.300 0 0 1 8.300-.6 3.600 3.600 0 0 1-.5 7.200z"/>',
  pino: '<path d="M12 19s-4.800-4.300-4.800-8a4.800 4.800 0 0 1 9.600 0c0 3.700-4.800 8-4.800 8z"/><circle cx="12" cy="11" r="1.700"/>',
  coracao: '<path d="M12 18s-5.500-3.400-5.500-7.300A3 3 0 0 1 12 9.300a3 3 0 0 1 5.500 1.400C17.500 14.600 12 18 12 18z"/>',
  dez: '<path d="M8 9l1.800-1.300V17M13.200 10.200a2.300 2.300 0 0 1 4.600 0v4.100a2.300 2.300 0 0 1-4.600 0z"/>',
  estrela: '<path d="m12 6 1.800 3.800 4.100.5-3 2.900.8 4.100L12 15.300 8.300 17.300l.8-4.100-3-2.900 4.100-.5z"/>',
};
// borda de tampinha: 21 dentes, como a de garrafa
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
  let i = 0; while (i + 1 < NIVEIS.length && s.xp >= NIVEIS[i + 1].xp) i++;
  s.nivel = i + 1; s.nivelNome = NIVEIS[i].nome;
  const prox = NIVEIS[i + 1];
  s.prox = prox ? { nome: prox.nome, falta: prox.xp - s.xp, pct: Math.round((s.xp - NIVEIS[i].xp) / (prox.xp - NIVEIS[i].xp) * 100) } : null;
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
  if (festaAberta || KitFacil.dialogo.aberto() || KitFacil.guia.ativo() || (typeof aberturaAtiva === 'function' && aberturaAtiva())) { tampaFila.push(...novas); return novas; }
  tampaNova(novas);
  return novas;
}
let tampaFila = [];
function tampaFilaMostrar() { if (!tampaFila.length || festaAberta || KitFacil.dialogo.aberto()) return; const l = tampaFila; tampaFila = []; tampaNova(l); }

/* ---------- tampinha nova: cai, gira e assenta ---------- */
function tampaNova(lista) {
  const t = lista[0], resto = lista.slice(1);
  vibrar([18, 40, 18]);
  openSheet({ title: 'Tampinha nova', body: `<div class="tn"><div class="tampa-3d cai" aria-hidden="true"><div class="tampa-giro"><span class="tampa-frente">${tampaSVG(t)}</span><span class="tampa-verso"></span></div></div>
      <b class="tn-nome">${esc(t.nome)}</b><p class="hint">${esc(t.como.replace(/\.$/, ''))}: feito. +${XP.tampinha} pontos.</p>
      ${resto.length ? `<p class="tn-mais">E mais ${plural(resto.length, 'tampinha', 'tampinhas')}: ${esc(resto.map(x => x.nome).join(', '))}.</p>` : ''}</div>`,
    foot: `<button type="button" class="btn ghost" id="tn-ver">Ver a coleção</button><button type="button" class="btn" id="tn-ok">Boa</button>`,
    onMount: s => { $('#tn-ok', s).onclick = () => closeSheet(); $('#tn-ver', s).onclick = () => { closeSheet(true); irPara('tampinhas'); }; } });
}
function tampaSheet(t) {
  const s = jogoEstado(), tem = s.ganhas.includes(t.id), p = t.prog && !tem ? t.prog(s) : null, quando = jogo.vistas[t.id];
  openSheet({ title: t.nome, body: `<div class="tn"><button type="button" class="tampa-3d ${tem ? '' : 'presa'}" id="tp-gira" aria-label="Girar a tampinha"><div class="tampa-giro"><span class="tampa-frente">${tampaSVG(t, { apagada: !tem })}</span><span class="tampa-verso"></span></div></button>
      <p class="tn-como">${esc(t.como)}</p>
      ${tem ? `<p class="hint">Na coleção${quando ? ' desde ' + fmtDate(quando) : ''}.</p>` : p ? `<div class="barra-xp" role="img" aria-label="${p[0]} de ${p[1]}"><i style="width:${Math.round(p[0] / p[1] * 100)}%"></i></div><p class="hint">${p[0]} de ${p[1]}</p>` : '<p class="hint">Ainda não está na coleção.</p>'}</div>`,
    foot: `<button type="button" class="btn" id="tp-ok">Fechar</button>`,
    onMount: d => { $('#tp-ok', d).onclick = () => closeSheet(); const g = $('#tp-gira', d); g.onclick = () => { g.classList.remove('gira'); void g.offsetWidth; g.classList.add('gira'); }; } });
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
        return `<li><button type="button" class="tampa ${tem ? 'tem' : ''}" data-tampa="${t.id}" aria-label="${esc(t.nome)}: ${tem ? 'na coleção' : 'falta ganhar. ' + esc(t.como)}">${tampaSVG(t, { apagada: !tem })}<span class="tampa-nome">${esc(t.nome)}</span>${p ? `<span class="tampa-prog">${p[0]}/${p[1]}</span>` : ''}</button></li>`; }).join('')}</ul>
      <button type="button" class="card garrafa-card" id="tp-garrafa"><span class="garrafa-mini" aria-hidden="true">${GARRAFA_SVG}</span><span class="lin-tx"><b>Girar a garrafa</b><small>Sorteie alguém da mesa: quem busca a próxima rodada, quem escolhe o lugar.</small></span>${I.next}</button>`;
  },
  bind(v) {
    $$('[data-tampa]', v).forEach(b => b.addEventListener('click', () => tampaSheet(TAMPINHAS.find(t => t.id === b.dataset.tampa))));
    $('#tp-garrafa', v).addEventListener('click', () => garrafaSheet());
  },
};

/* ---------- girar a garrafa ---------- */
const GARRAFA_SVG = `<svg viewBox="0 0 60 200"><defs><linearGradient id="gf-v" x1="0" x2="1"><stop offset="0" stop-color="#7A4A12"/><stop offset=".35" stop-color="#B9761E"/><stop offset=".6" stop-color="#8B5514"/><stop offset="1" stop-color="#5A360B"/></linearGradient></defs>
  <rect x="23" y="2" width="14" height="9" rx="2.500" fill="#D3931A"/><path d="M24 11h12v34c0 10 12 16 12 32v108a11 11 0 0 1-11 11H23a11 11 0 0 1-11-11V77c0-16 12-22 12-32z" fill="url(#gf-v)"/>
  <rect x="13" y="98" width="34" height="50" rx="3" fill="#FFFDF5"/><path d="M19 111h22M19 121h22M19 131h13" stroke="#D3931A" stroke-width="3.400" stroke-linecap="round"/><path d="M18 60c0 10-2 14-2 24v90" stroke="#fff" stroke-opacity=".28" stroke-width="3" stroke-linecap="round" fill="none"/></svg>`;
function garrafaSheet() {
  const naMesa = draft.active && !draft.isExample ? draft.people.map(p => p.name) : draft.isExample ? draft.people.map(p => p.name) : [];
  const base = naMesa.length >= 2 ? naMesa : [...catalog.people].sort((a, b) => (b.last || 0) - (a.last || 0)).slice(0, 8).map(p => p.name);
  let nomes = base.slice(0, 10), ang = 0, girando = false;
  const roda = () => { const n = nomes.length; return nomes.map((nm, i) => { const a = (360 / n) * i; return `<span class="gf-nome" data-i="${i}" style="--a:${a}deg"><span>${esc(nm.split(' ')[0])}</span></span>`; }).join(''); };
  openSheet({ title: 'Girar a garrafa', onClose: () => setTimeout(tampaFilaMostrar, 500), body: `<div class="gf">
      ${nomes.length >= 2 ? `<div class="gf-mesa" id="gf-mesa"><div class="gf-roda" id="gf-roda">${roda()}</div><div class="gf-garrafa" id="gf-garrafa" aria-hidden="true">${GARRAFA_SVG}</div></div>
      <p class="gf-res" id="gf-res" role="status" aria-live="polite">${naMesa.length >= 2 ? 'Quem está na mesa entra no sorteio.' : 'Entram as pessoas dos seus cadastros.'}</p>`
      : `<div class="vazio">${ILU.mesa}<b>Falta gente na mesa</b><p>Abra uma comanda com duas pessoas ou mais, ou cadastre pessoas, e a garrafa gira.</p></div>`}</div>`,
    foot: nomes.length >= 2 ? `<button type="button" class="btn ghost" id="gf-x">Fechar</button><button type="button" class="btn chopp" id="gf-go">Girar</button>` : `<button type="button" class="btn" id="gf-x">Fechar</button>`,
    onMount: s => {
      $('#gf-x', s).onclick = () => closeSheet();
      const go = $('#gf-go', s); if (!go) return;
      const g = $('#gf-garrafa', s), res = $('#gf-res', s);
      go.onclick = () => {
        if (girando) return; girando = true; go.setAttribute('aria-disabled', 'true');
        const n = nomes.length, i = Math.floor(Math.random() * n), alvo = (360 / n) * i;
        $$('.gf-nome', s).forEach(e => e.classList.remove('vez'));
        const voltas = semMovimento() ? 0 : 4 + Math.floor(Math.random() * 3);
        ang = Math.ceil(ang / 360) * 360 + voltas * 360 + alvo;
        g.style.transition = semMovimento() ? 'none' : `transform ${3.2 + voltas * .18}s cubic-bezier(.12,.72,.14,1)`;
        g.style.transform = `translate(-50%,-50%) rotate(${ang}deg)`;
        res.textContent = 'Girando…';
        const fim = () => { if (!go.isConnected) return; girando = false; go.removeAttribute('aria-disabled'); go.textContent = 'Girar de novo'; $(`.gf-nome[data-i="${i}"]`, s)?.classList.add('vez'); res.innerHTML = `A garrafa parou em <b>${esc(nomes[i])}</b>.`; vibrar(30); jogoMarcar('garrafa'); };
        if (semMovimento()) fim(); else setTimeout(fim, (3.2 + voltas * .18) * 1000 + 60);
      };
    } });
}

/* ---------- festa de fechamento ---------- */
let festaAberta = false;
function confete(caixa, n = 34) {
  if (semMovimento()) return;
  const cores = ['#F2B33D', '#D9483B', '#2E8B5C', '#FFFDF5', '#2A8C99', '#A4486E'];
  let h = '';
  for (let i = 0; i < n; i++) { const tira = i % 3 === 0; h += `<i class="cf ${tira ? 'tira' : ''}" style="left:${(Math.random() * 100).toFixed(1)}%;background:${cores[i % cores.length]};--d:${(Math.random() * .9).toFixed(2)}s;--t:${(2.2 + Math.random() * 1.6).toFixed(2)}s;--x:${(Math.random() * 120 - 60).toFixed(0)}px;--r:${(Math.random() * 720 - 360).toFixed(0)}deg"></i>`; }
  const el = document.createElement('div'); el.className = 'confete'; el.setAttribute('aria-hidden', 'true'); el.innerHTML = h; caixa.appendChild(el);
  setTimeout(() => el.remove(), 4600);
}
// antes = estado do jogo antes de salvar; bill = a comanda salva
function festa(bill, antes, { desfazer } = {}) {
  if (!jogoLigado()) return false;
  const s = jogoEstado(), novas = jogoConferir({ silencioso: true }), ganho = s.xp - antes.xp, subiu = s.nivel > antes.nivel;
  const raiz = $('#festa'); if (!raiz) return false;
  festaAberta = true;
  const de = antes.prox ? antes.prox.pct : 100, para = subiu ? 100 : (s.prox ? s.prox.pct : 100);
  raiz.innerHTML = `<div class="festa" role="dialog" aria-modal="true" aria-labelledby="festa-t"><div class="festa-in">
      <div class="imp festa-imp" aria-hidden="true"><div class="imp-boca"></div><div class="imp-saida"><div class="papel imp-papel sai"><span class="mono fp-marca">CONTA FÁCIL</span><span class="mono fp-local">${esc(bill.place || 'Comanda')}</span><span class="fp-linha"></span><span class="mono fp-tot"><span>TOTAL</span><span>${BRL(bill.total)}</span></span><span class="fp-carimbo">SALVA</span></div></div></div>
      <h2 class="festa-t" id="festa-t" tabindex="-1">Conta fechada</h2>
      <p class="festa-sub">${esc(bill.place || 'A comanda')} entrou no histórico: ${plural(bill.people.length, 'pessoa', 'pessoas')}, ${BRL(bill.total)}.</p>
      <div class="festa-xp"><div class="festa-xp-l">${bolachaHTML(s)}<span class="nivel-tx"><b>${subiu ? `Nível ${s.nivel}: ${esc(s.nivelNome)}` : esc(s.nivelNome)}</b><div class="barra-xp"><i id="festa-barra" style="width:${Math.max(4, de)}%"></i></div><small>+${ganho} pontos${s.prox ? ` · faltam ${s.prox.falta} para ${esc(s.prox.nome)}` : ''}</small></span></div></div>
      ${novas.length ? `<div class="festa-tampas">${novas.map((t, i) => `<span class="festa-tampa" style="--i:${i}">${tampaSVG(t)}<small>${esc(t.nome)}</small></span>`).join('')}</div>` : ''}
      <div class="festa-acoes"><button type="button" class="btn chopp bloco" id="festa-ok">Concluir</button>${desfazer ? `<button type="button" class="btn link" id="festa-des">Desfazer e voltar à comanda</button>` : ''}</div>
    </div></div>`;
  const cx = $('.festa', raiz), ant = document.activeElement;
  const fechar = () => { festaAberta = false; raiz.innerHTML = ''; document.removeEventListener('keydown', tecla, true); try { ant && ant.focus && ant.focus({ preventScroll: true }); } catch {} };
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
