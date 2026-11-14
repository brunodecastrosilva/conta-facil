/* Conta Fácil · níveis, tampinhas (em 3D), festa de fechamento e o sorteio da mesa.
   Quase tudo é derivado do histórico e dos cadastros (que sincronizam); só algumas marcas ficam neste aparelho.
   Nada aqui premia gastar ou beber mais: as tampinhas reconhecem o uso do app. */

/* ---------- estado ---------- */
let jogo = { flags: {}, vistas: {}, off: false, pronto: false, ...(LS.get('jogo', null) || {}) };
// a 1.0 chamava o sorteio de outro nome
if (jogo.flags.garrafa) { jogo.flags.sorteio = jogo.flags.garrafa; delete jogo.flags.garrafa; }
if (jogo.vistas.garrafa) { jogo.vistas.sorteio = jogo.vistas.garrafa; delete jogo.vistas.garrafa; }
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
  { id: 'ao-vivo', nome: 'Ao vivo', como: 'Compartilhe uma comanda ao vivo com a mesa.', cor: 'vermelho', ic: 'live', ok: s => !!s.flags.aoVivo },
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
  live: '<circle cx="12" cy="12" r="1.6"/><path d="M15.2 8.8a4.5 4.5 0 0 1 0 6.4M8.8 15.2a4.5 4.5 0 0 1 0-6.4M17.5 6.5a7.8 7.8 0 0 1 0 11M6.5 17.5a7.8 7.8 0 0 1 0-11"/>',
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
  if (festaAberta || KitFacil.dialogo.aberto() || (typeof guiaAtivo === 'function' && guiaAtivo() && !guiaDeixaTampa) || (typeof aberturaAtiva === 'function' && aberturaAtiva())) { tampaFila.push(...novas); return novas; }
  tampaNova(novas);
  return novas;
}
let tampaFila = [];
function tampaFilaMostrar() { if (!tampaFila.length || festaAberta || KitFacil.dialogo.aberto()) return; const l = tampaFila; tampaFila = []; tampaNova(l); }

/* ---------- objetos em 3D que giram com o dedo (tampinha e presente) ----------
   São desenhados num <canvas>, face por face, de trás para a frente, com a luz recalculada a cada giro.
   (A primeira versão montava as faces com CSS 3D; no iPhone as faces trocavam de ordem enquanto giravam e a tampinha piscava.) */
const cor2rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const tom = (rgb, k) => `rgb(${rgb.map(v => Math.max(0, Math.min(255, Math.round(v * k)))).join(',')})`;
const mistura = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
function tampa3dHTML(t, { apagada = false, D = 172 } = {}) {
  return `<div class="o3d" data-o3d="tampa" data-tampa="${esc(t.id)}" ${apagada ? 'data-apagada="1"' : ''} data-d="${D}" tabindex="0" role="img" aria-label="Tampinha ${esc(t.nome)}. Deslize o dedo ou use as setas para girar." style="width:${D + 44}px;height:${D + 44}px"><canvas aria-hidden="true"></canvas></div>`;
}
function presente3dHTML({ L = 112 } = {}) {
  return `<div class="o3d" data-o3d="presente" data-d="${L}" tabindex="0" role="img" aria-label="Presente. Deslize o dedo ou use as setas para girar." style="width:${L * 2}px;height:${L * 2}px"><canvas aria-hidden="true"></canvas></div>`;
}
// o desenho de um ícone (trechos de SVG na grade de 24) vira caminhos de canvas
function caminhosDoIcone(svg) {
  const doc = new DOMParser().parseFromString(`<svg xmlns="http://www.w3.org/2000/svg">${svg}</svg>`, 'image/svg+xml'), out = [];
  const n = (el, a) => parseFloat(el.getAttribute(a)) || 0;
  for (const el of doc.documentElement.children) {
    const p = new Path2D();
    if (el.tagName === 'path') p.addPath(new Path2D(el.getAttribute('d')));
    else if (el.tagName === 'circle') p.arc(n(el, 'cx'), n(el, 'cy'), n(el, 'r'), 0, Math.PI * 2);
    else if (el.tagName === 'ellipse') p.ellipse(n(el, 'cx'), n(el, 'cy'), n(el, 'rx'), n(el, 'ry'), 0, 0, Math.PI * 2);
    else if (el.tagName === 'rect') { const x = n(el, 'x'), y = n(el, 'y'), w = n(el, 'width'), h = n(el, 'height'), r = n(el, 'rx'); if (p.roundRect) p.roundRect(x, y, w, h, r); else p.rect(x, y, w, h); }
    else continue;
    out.push(p);
  }
  return out;
}
/* a tampinha: disco de esmalte, ombro, saia de 21 gomos e, pelo avesso, o metal com o forro */
function cenaTampa(o) {
  const t = TAMPINHAS.find(x => x.id === o.dataset.tampa) || TAMPINHAS[0], apagada = !!o.dataset.apagada;
  const [c1, c2] = (apagada ? ['#C3CCC6', '#8E9A92'] : ESMALTES[t.cor] || ESMALTES.ambar).map(cor2rgb);
  const R = +o.dataset.d / 2, T = R * 0.4, r0 = R * 0.75, r1 = R * 0.83, zt = T / 2, zo = T / 2 - T * 0.24, zb = -T / 2, N = 42;
  const METAL = [198, 205, 201], base = mistura(c1, c2, 0.3), faces = [];
  const pt = (r, a, z) => [r * Math.cos(a), r * Math.sin(a), z];
  const normal = (a, b, c) => { const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]], n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]], m = Math.hypot(...n) || 1; return n.map(x => x / m); };
  for (let i = 0; i < N; i++) {
    const a0 = 2 * Math.PI * i / N, a1 = 2 * Math.PI * (i + 1) / N, rr = k => (k % 2 ? R * 0.925 : R);
    // ombro (do disco até o começo da saia) e gomo da saia (do ombro até a borda, que entra e sai)
    const ombro = [pt(r0, a0, zt), pt(r0, a1, zt), pt(r1, a1, zo), pt(r1, a0, zo)], gomo = [pt(r1, a0, zo), pt(r1, a1, zo), pt(rr(i + 1), a1, zb), pt(rr(i), a0, zb)];
    for (const [p, k] of [[ombro, 1.06], [gomo, i % 2 ? 0.94 : 1.03]]) {
      let n = normal(p[0], p[1], p[2]); const am = (a0 + a1) / 2;
      if (n[0] * Math.cos(am) + n[1] * Math.sin(am) + n[2] < 0) n = n.map(x => -x); // a normal aponta para fora
      faces.push({ p, n, fora: base.map(v => v * k), dentro: METAL.map(v => v * (k > 1 ? 1 : 0.93)) });
    }
  }
  const icone = caminhosDoIcone(TAMPA_IC[t.ic] || TAMPA_IC.estrela), circ = (r, z) => Array.from({ length: 40 }, (_, i) => pt(r, 2 * Math.PI * i / 40, z));
  // frente: o esmalte com o desenho. O pincel recebe o plano do disco já inclinado e desenha como se estivesse de frente.
  faces.push({ p: circ(r0, zt), n: [0, 0, 1], plano: zt, pinta: (g, luz) => {
    const gr = g.createRadialGradient(-r0 * 0.3, -r0 * 0.38, r0 * 0.05, 0, 0, r0 * 1.05); gr.addColorStop(0, tom(c1, 0.72 + 0.4 * luz)); gr.addColorStop(1, tom(c2, 0.72 + 0.4 * luz));
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r0 + 0.6, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(0,0,0,.2)'; g.lineWidth = r0 * 0.035; g.beginPath(); g.arc(0, 0, r0 * 0.955, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = r0 * 0.022; g.setLineDash([r0 * 0.035, r0 * 0.07]); g.beginPath(); g.arc(0, 0, r0 * 0.8, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
    const s = r0 * 1.44 / 24; g.save(); g.translate(-12 * s, -12 * s); g.scale(s, s);
    g.strokeStyle = '#FFFDF5'; g.lineWidth = 1.7; g.lineCap = g.lineJoin = 'round'; icone.forEach(c => g.stroke(c)); g.restore();
    // brilho: uma mancha clara que corre pelo esmalte conforme a tampinha vira
    const bx = -r0 * (0.25 + 0.5 * luz), br = g.createRadialGradient(bx, -r0 * 0.45, 0, bx, -r0 * 0.45, r0 * 0.8); br.addColorStop(0, `rgba(255,255,255,${(0.1 + 0.42 * luz).toFixed(3)})`); br.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = br; g.beginPath(); g.arc(0, 0, r0, 0, Math.PI * 2); g.fill();
  } });
  // avesso: o fundo de metal e o forro claro, no centro
  faces.push({ p: circ(r1 * 0.985, zo - 0.5), n: [0, 0, -1], plano: zo - 0.5, pinta: (g, luz) => {
    const ra = r1 * 0.985, k = 0.62 + 0.5 * luz;
    g.fillStyle = tom(METAL, k); g.beginPath(); g.arc(0, 0, ra + 0.6, 0, Math.PI * 2); g.fill();
    g.strokeStyle = tom(METAL, k * 0.78); g.lineWidth = ra * 0.05; g.beginPath(); g.arc(0, 0, ra * 0.86, 0, Math.PI * 2); g.stroke();
    const gr = g.createRadialGradient(-ra * 0.2, -ra * 0.25, 0, 0, 0, ra * 0.62); gr.addColorStop(0, tom([252, 252, 250], k + 0.12)); gr.addColorStop(1, tom([214, 220, 216], k + 0.12));
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, ra * 0.62, 0, Math.PI * 2); g.fill();
  } });
  return { faces, incl: -0.2, escala: 1, dy: 0 };
}
/* o presente: caixa, tampa, fita em cruz e laço */
function cenaPresente(o) {
  const L = +o.dataset.d, A = L * 0.8, tl = L * 1.08, ta = L * 0.24, h = L / 2, ht = tl / 2, faces = [];
  const PAPEL = [29, 90, 59], TAMPA = [40, 122, 80], FITA = [242, 179, 61], yb = A / 2 + ta * 0.42, y0 = yb - A, yt0 = y0 + 2, yt1 = yt0 - ta, fw = L * 0.09;
  // quatro lados de uma caixa (meia largura m, do alto y1 até a base y2), cada um com a faixa da fita no meio
  const lados = (m, y1, y2, cor, camada) => [[0, 0, 1], [1, 0, 0], [0, 0, -1], [-1, 0, 0]].forEach(n => {
    const t = [n[2], 0, -n[0]], q = (s, y, e = 0) => [n[0] * (m + e) + t[0] * s, y, n[2] * (m + e) + t[2] * s];
    faces.push({ p: [q(-m, y1), q(m, y1), q(m, y2), q(-m, y2)], n, fora: cor, camada });
    faces.push({ p: [q(-fw, y1, 0.4), q(fw, y1, 0.4), q(fw, y2, 0.4), q(-fw, y2, 0.4)], n, fora: FITA, amb: 0.8, camada: camada + 0.1 });
  });
  lados(h, y0, yb, PAPEL, 0);
  lados(ht, yt1, yt0, TAMPA, 2);
  const topo = (m, y, cor, camada) => faces.push({ p: [[-m, y, -m], [m, y, -m], [m, y, m], [-m, y, m]], n: [0, -1, 0], fora: cor, camada });
  topo(ht, yt1, TAMPA.map(v => v * 1.08), 2);
  faces.push({ p: [[-fw, yt1 - 0.4, -ht], [fw, yt1 - 0.4, -ht], [fw, yt1 - 0.4, ht], [-fw, yt1 - 0.4, ht]], n: [0, -1, 0], fora: FITA, amb: 0.8, camada: 2.1 });
  faces.push({ p: [[-ht, yt1 - 0.4, -fw], [ht, yt1 - 0.4, -fw], [ht, yt1 - 0.4, fw], [-ht, yt1 - 0.4, fw]], n: [0, -1, 0], fora: FITA, amb: 0.8, camada: 2.1 });
  // laço: quatro alças (duas em cada plano) e o nó
  const alca = (dir, lado) => { const p = []; for (let i = 0; i <= 22; i++) { const a = 2 * Math.PI * i / 22, u = lado * L * 0.27 * (1 - Math.cos(a)) * 0.9, v = -L * 0.2 * Math.sin(a) * (1 + 0.25 * Math.cos(a)) - L * 0.1 * (1 - Math.cos(a)); p.push([dir[0] * u, yt1 + v, dir[1] * u]); } return p; };
  for (const dir of [[0.92, 0.38], [-0.38, 0.92]]) for (const lado of [1, -1]) faces.push({ p: alca(dir, lado), n: [-dir[1], 0, dir[0]], fora: FITA, dentro: FITA.map(v => v * 0.86), amb: 0.82, traco: L * 0.07, camada: 3 });
  faces.push({ p: Array.from({ length: 14 }, (_, i) => [L * 0.07 * Math.cos(2 * Math.PI * i / 14), yt1 - L * 0.045 + L * 0.05 * Math.sin(2 * Math.PI * i / 14), 0]), n: [0, 0, 1], fora: FITA.map(v => v * 0.9), dentro: FITA.map(v => v * 0.9), amb: 0.9, sempre: true, camada: 4 });
  return { faces, incl: -0.42, escala: 0.9, dy: L * 0.2 };
}
function pintar3d(cv, cena, ang) {
  const g = cv.getContext('2d'), dpr = cv._dpr, W = cv.width / dpr, H = cv.height / dpr, cx = W / 2, cy = H / 2 + cena.dy, e = cena.escala;
  const ca = Math.cos(ang), sa = Math.sin(ang), ct = Math.cos(cena.incl), st = Math.sin(cena.incl), LUZ = [-0.38, -0.62, 0.69];
  const gira = ([x, y, z]) => { const x1 = x * ca + z * sa, z1 = -x * sa + z * ca; return [x1, y * ct - z1 * st, y * st + z1 * ct]; };
  g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
  // sombra no chão
  const sg = g.createRadialGradient(cx, H - 13, 0, cx, H - 13, W * 0.34); sg.addColorStop(0, 'rgba(6,20,13,.3)'); sg.addColorStop(1, 'rgba(6,20,13,0)');
  g.save(); g.translate(0, (H - 13) * 0.76); g.scale(1, 0.24); g.fillStyle = sg; g.beginPath(); g.arc(cx, H - 13, W * 0.34, 0, Math.PI * 2); g.fill(); g.restore();
  const vis = [];
  for (const f of cena.faces) {
    const n = gira(f.n), frente = n[2] >= 0;
    if (!frente && !f.dentro && !f.sempre) continue; // face de um lado só, de costas: não aparece
    const q = f.p.map(gira); let z = 0; for (const p of q) z += p[2];
    vis.push({ f, q, z: z / q.length, frente, luz: Math.max(0, (frente ? 1 : -1) * (n[0] * LUZ[0] + n[1] * LUZ[1] + n[2] * LUZ[2])) });
  }
  vis.sort((a, b) => (a.f.camada || 0) - (b.f.camada || 0) || a.z - b.z);
  for (const { f, q, frente, luz } of vis) {
    if (f.pinta) { // disco com desenho: o pincel trabalha no plano do disco
      const o = gira([0, 0, f.plano]), u = gira([1, 0, 0]), v = gira([0, 1, 0]);
      g.save(); g.transform(u[0] * e, u[1] * e, v[0] * e, v[1] * e, cx + o[0] * e, cy + o[1] * e); f.pinta(g, luz); g.restore();
      continue;
    }
    const amb = f.amb || 0.58, cor = tom(frente ? f.fora : f.dentro, amb + (1.2 - amb) * luz);
    g.beginPath(); q.forEach((p, i) => (i ? g.lineTo(cx + p[0] * e, cy + p[1] * e) : g.moveTo(cx + p[0] * e, cy + p[1] * e))); g.closePath();
    if (f.traco) { g.strokeStyle = tom(frente ? f.fora : f.dentro, 0.62); g.lineWidth = (f.traco + 2.4) * e; g.lineJoin = 'round'; g.stroke(); g.strokeStyle = cor; g.lineWidth = f.traco * e; g.stroke(); } // alça do laço: fita com contorno
    else { g.fillStyle = cor; g.fill(); g.strokeStyle = cor; g.lineWidth = 0.7; g.stroke(); } // o traço da mesma cor fecha as frestas entre as faces
  }
}
// liga o giro: arrastar na horizontal, inércia ao soltar, setas do teclado
function girar3d(raiz, { auto = true, inicio = -0.5 } = {}) {
  const o = raiz.matches && raiz.matches('.o3d') ? raiz : raiz.querySelector('.o3d'); if (!o || o.dataset.ligado) return null;
  o.dataset.ligado = '1';
  const cv = o.querySelector('canvas'), cena = o.dataset.o3d === 'tampa' ? cenaTampa(o) : cenaPresente(o), parado = semMovimento();
  const medir = () => { const dpr = Math.min(3, window.devicePixelRatio || 1), w = o.clientWidth, h = o.clientHeight; cv._dpr = dpr; cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); };
  medir();
  const ATRITO = 0.9955; // quanto do giro sobra a cada milissegundo
  let ang = inicio, vel = 0, arr = null, raf = 0, sozinho = auto && !parado, t0 = 0;
  const pintar = () => { o.dataset.ang = ang.toFixed(3); pintar3d(cv, cena, ang); };
  const quadro = t => {
    raf = 0; const dt = Math.min(48, t - (t0 || t)); t0 = t;
    if (arr) return;
    if (Math.abs(vel) > 0.0004) { const f = Math.pow(ATRITO, dt); ang += vel * (1 - f) / -Math.log(ATRITO); vel *= f; }
    else if (sozinho) ang += 0.0007 * dt;
    else { vel = 0; pintar(); return; }
    pintar(); if (o.isConnected) raf = requestAnimationFrame(quadro);
  };
  const andar = () => { if (!raf && o.isConnected) { t0 = 0; raf = requestAnimationFrame(quadro); } };
  o.addEventListener('pointerdown', e => { if (e.button > 0) return; sozinho = false; arr = { x: e.clientX, t: performance.now(), v: 0 }; vel = 0; o.classList.add('pegou'); try { o.setPointerCapture(e.pointerId); } catch {} });
  o.addEventListener('pointermove', e => { if (!arr) return; const agora = performance.now(), dx = e.clientX - arr.x, dt = Math.max(1, agora - arr.t); ang += dx * 0.0115; arr.v = arr.v * 0.6 + (dx * 0.0115 / dt) * 0.4; arr.x = e.clientX; arr.t = agora; pintar(); });
  const soltar = () => { if (!arr) return; vel = parado ? 0 : Math.max(-0.02, Math.min(0.02, arr.v)); arr = null; o.classList.remove('pegou'); andar(); };
  o.addEventListener('pointerup', soltar); o.addEventListener('pointercancel', soltar);
  o.addEventListener('keydown', e => { if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return; e.preventDefault(); sozinho = false; vel = 0; ang += e.key === 'ArrowRight' ? 0.3 : -0.3; pintar(); });
  pintar(); andar();
  // dá um peteleco que faz o objeto dar `voltas` e parar de frente, um pouco de lado (no ângulo `fim`)
  const peteleco = (voltas = 2, fim = -0.4) => { sozinho = false; const total = voltas * 2 * Math.PI + fim - ang; vel = (total + 0.0004 / -Math.log(ATRITO)) * -Math.log(ATRITO); andar(); };
  return { girar: v => { sozinho = false; vel = v; andar(); }, peteleco, angulo: () => ang };
}

/* ---------- tampinha nova: cai girando e assenta; ficha da tampinha ---------- */
function tampaNova(lista) {
  const t = lista[0], resto = lista.slice(1);
  vibrar([18, 40, 18]);
  openSheet({ title: 'Tampinha nova', onClose: () => setTimeout(tampaFilaMostrar, 500), body: `<div class="tn"><div class="o3d-cai">${tampa3dHTML(t)}</div>
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
        return `<li><button type="button" class="tampa ${tem ? 'tem' : ''}" data-tampa="${t.id}" aria-label="${esc(t.nome)}: ${tem ? 'na coleção' : 'falta ganhar. ' + esc(t.como)}">${tampaSVG(t, { apagada: !tem })}<span class="tampa-nome">${esc(t.nome)}</span>${p ? `<span class="tampa-prog">${p[0]}/${p[1]}</span>` : ''}</button></li>`; }).join('')}</ul>
      <button type="button" class="card lin-card" id="tp-sorteio"><span class="lin-ic ambar">${I.sorteio}</span><span class="lin-tx"><b>Sortear alguém da mesa</b><small>Quem escolhe o próximo lugar, quem divide a sobremesa.</small></span>${I.next}</button>`;
  },
  bind(v) {
    $$('[data-tampa]', v).forEach(b => b.addEventListener('click', () => tampaSheet(TAMPINHAS.find(t => t.id === b.dataset.tampa))));
    $('#tp-sorteio', v).addEventListener('click', () => sorteioSheet());
  },
};

/* ---------- sortear alguém da mesa: um ponteiro gira e para num nome ---------- */
const PONTEIRO_SVG = `<svg viewBox="0 0 60 200" aria-hidden="true"><defs><linearGradient id="pt-v" x1="0" x2="1"><stop offset="0" stop-color="#F7C65A"/><stop offset=".5" stop-color="#F2B33D"/><stop offset="1" stop-color="#B97A0E"/></linearGradient></defs>
  <path d="M30 6 52 62H38v92a8 8 0 0 1-16 0V62H8z" fill="url(#pt-v)" stroke="#8F5C08" stroke-width="2" stroke-linejoin="round"/><circle cx="30" cy="100" r="13" fill="#FFFDF5" stroke="#8F5C08" stroke-width="2"/><circle cx="30" cy="100" r="4.500" fill="#1D5A3B"/></svg>`;
function sorteioSheet() {
  const naMesa = draft.active ? draft.people.map(p => p.name) : [];
  const base = naMesa.length >= 2 ? naMesa : [...catalog.people].sort((a, b) => (b.last || 0) - (a.last || 0)).slice(0, 8).map(p => p.name);
  let nomes = base.slice(0, 10), ang = 0, girando = false;
  const roda = () => { const n = nomes.length; return nomes.map((nm, i) => `<span class="gf-nome" data-i="${i}" style="--a:${(360 / n) * i}deg"><span>${esc(nm.split(' ')[0])}</span></span>`).join(''); };
  openSheet({ title: 'Sortear alguém da mesa', onClose: () => setTimeout(tampaFilaMostrar, 500), body: `<div class="gf">
      ${nomes.length >= 2 ? `<div class="gf-mesa" id="gf-mesa"><div class="gf-roda" id="gf-roda">${roda()}</div><div class="gf-ponteiro" id="gf-ponteiro">${PONTEIRO_SVG}</div></div>
      <p class="gf-res" id="gf-res" role="status" aria-live="polite">${naMesa.length >= 2 ? 'Quem está na mesa entra no sorteio.' : 'Entram as pessoas dos seus cadastros.'}</p>`
      : `<div class="vazio">${ILU.turmas}<b>Falta gente na mesa</b><p>Abra uma comanda com duas pessoas ou mais, ou cadastre pessoas, para sortear.</p></div>`}</div>`,
    foot: nomes.length >= 2 ? `<button type="button" class="btn ghost" id="gf-x">Fechar</button><button type="button" class="btn ambar" id="gf-go">Sortear</button>` : `<button type="button" class="btn" id="gf-x">Fechar</button>`,
    onMount: s => {
      $('#gf-x', s).onclick = () => closeSheet();
      const go = $('#gf-go', s); if (!go) return;
      const g = $('#gf-ponteiro', s), res = $('#gf-res', s);
      go.onclick = () => {
        if (girando) return; girando = true; go.setAttribute('aria-disabled', 'true');
        const n = nomes.length, i = Math.floor(Math.random() * n), alvo = (360 / n) * i;
        $$('.gf-nome', s).forEach(e => e.classList.remove('vez'));
        const voltas = semMovimento() ? 0 : 4 + Math.floor(Math.random() * 3), dur = 3.4 + voltas * .2;
        ang = Math.ceil(ang / 360) * 360 + voltas * 360 + alvo;
        g.style.transition = semMovimento() ? 'none' : `transform ${dur}s cubic-bezier(.1,.7,.1,1)`;
        g.style.transform = `translate(-50%,-50%) rotate(${ang}deg)`;
        res.textContent = 'Sorteando…';
        const fim = () => { if (!go.isConnected) return; girando = false; go.removeAttribute('aria-disabled'); go.textContent = 'Sortear de novo'; $(`.gf-nome[data-i="${i}"]`, s)?.classList.add('vez'); res.innerHTML = `Saiu <b>${esc(nomes[i])}</b>.`; vibrar(30); jogoMarcar('sorteio'); };
        if (semMovimento()) fim(); else setTimeout(fim, dur * 1000 + 60);
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
      <div class="festa-acoes"><button type="button" class="btn ambar bloco" id="festa-ok">Concluir</button>${desfazer ? `<button type="button" class="btn link" id="festa-des">Desfazer e voltar à comanda</button>` : ''}</div>
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
