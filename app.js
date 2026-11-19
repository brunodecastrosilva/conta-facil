/* Conta Fácil · motor do app: modelo, contas, Pix, cupons, comanda ao vivo, sincronização e a tela da comanda.
   As outras telas ficam em telas.js; níveis e tampinhas, em jogo.js; moldura, abertura e guia, em casca.js. */
const VERSAO = '1.12.4';
const APP_URL = location.origin + location.pathname;

/* ---------- utilidades ---------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const newId = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-5);
const BRL = c => (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const norm = s => String(s || '').trim().toLocaleLowerCase('pt-BR');
const isObj = v => v && typeof v === 'object' && !Array.isArray(v);
const clone = v => JSON.parse(JSON.stringify(v));
let orderSeq = 0;
const nextOrder = () => Date.now() * 100 + (orderSeq++ % 100);
function parseMoney(s) {
  s = String(s ?? '').replace(/[^\d,.]/g, '');
  if (!s) return null;
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  const v = parseFloat(s);
  return isFinite(v) && v >= 0 ? Math.round(v * 100) : null;
}
const moneyInput = c => BRL(c || 0);
const pctStr = n => String(n).replace('.', ',');
const PALETTE = ['#1D5A3B', '#B5651D', '#2F5D8A', '#8A3B5C', '#5B6B1E', '#6A4C93', '#A33A2A', '#1E7A7A'];
function colorFor(name) { let h = 0; for (const ch of norm(name)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return PALETTE[h % PALETTE.length]; }
function initials(name) { const p = String(name).trim().split(/\s+/); return ((p[0]?.[0] || '') + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase(); }
const avatar = name => `<span class="avatar" style="background:${colorFor(name)}">${esc(initials(name))}</span>`;
const fmtDate = ts => new Date(ts).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
const fmtDateTime = ts => new Date(ts).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const plural = (n, s, p) => n + ' ' + (n === 1 ? s : p);
const I = {
  x: '<svg class="i" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  edit: '<svg class="i" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
  trash: '<svg class="i" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>',
  copy: '<svg class="i" viewBox="0 0 24 24"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
  plus: '<svg class="i" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  save: '<svg class="i" viewBox="0 0 24 24"><path d="M5 3h11l3 3v15H5z"/><path d="M8 3v5h8M8 14h8v7H8z"/></svg>',
  ok: '<svg class="i" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg>',
  warn: '<svg class="i" viewBox="0 0 24 24"><path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17h.01"/></svg>',
  home: '<svg class="i" viewBox="0 0 24 24"><path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-5h4v5"/></svg>',
  receipt: '<svg class="i" viewBox="0 0 24 24"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h3"/></svg>',
  calc: '<svg class="i" viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01"/></svg>',
  clock: '<svg class="i" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  users: '<svg class="i" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14c2 .8 3 3 3 6"/></svg>',
  image: '<svg class="i" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/></svg>',
  share: '<svg class="i" viewBox="0 0 24 24"><path d="M12 15V3M7 8l5-5 5 5"/><path d="M5 13v7h14v-7"/></svg>',
  file: '<svg class="i" viewBox="0 0 24 24"><path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4M9 13h6M9 17h6"/></svg>',
  refresh: '<svg class="i" viewBox="0 0 24 24"><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/></svg>',
  lock: '<svg class="i" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
  unlock: '<svg class="i" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.6-1.8"/></svg>',
  live: '<svg class="i" viewBox="0 0 24 24"><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8a6 6 0 0 1 0 8.4M7.8 16.2a6 6 0 0 1 0-8.4M19 5a10 10 0 0 1 0 14M5 19A10 10 0 0 1 5 5"/></svg>',
  paste: '<svg class="i" viewBox="0 0 24 24"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>',
  qr: '<svg class="i" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><path d="M14 14h3v3h-3zM20 14v.01M14 20v.01M17 20h4v-3"/></svg>',
  ajustes: '<svg class="i" viewBox="0 0 24 24"><path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/></svg>',
  download: '<svg class="i" viewBox="0 0 24 24"><path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14"/></svg>',
  upload: '<svg class="i" viewBox="0 0 24 24"><path d="M12 15.5V4.5M7.5 9 12 4.5 16.5 9M5 19.5h14"/></svg>',
  back: '<svg class="i" viewBox="0 0 24 24"><path d="m14.5 6-6 6 6 6"/></svg>',
  check: '<svg class="i" viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  user: '<svg class="i" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>',
  listCheck: '<svg class="i" viewBox="0 0 24 24"><path d="m3.5 6 1.5 1.5 3-3M3.5 12.5l1.5 1.5 3-3M3.5 19l1.5 1.5 3-3M11 6h10M11 12.5h10M11 19h10"/></svg>',
  next: '<svg class="i" viewBox="0 0 24 24"><path d="m9.5 6 6 6-6 6"/></svg>',
};
/* 1.13: linha de uma lista de marcar (no lugar dos chips lado a lado) */
const ckRow = (attrs, nome, on, extra = '') => `<button type="button" class="ck-row ${extra}" ${attrs} aria-pressed="${!!on}"><span class="ck-box">${I.check}</span>${avatar(nome)}<span class="ck-nome">${esc(nome)}</span></button>`;

/* ---------- divisão em centavos (sem erro de arredondamento) ---------- */
function allocate(total, weights) {
  const sum = weights.reduce((a, b) => a + b, 0);
  if (sum <= 0 || total <= 0) return weights.map(() => 0);
  const raw = weights.map(w => total * w / sum);
  const base = raw.map(Math.floor);
  let rem = total - base.reduce((a, b) => a + b, 0);
  const order = raw.map((r, i) => [r - base[i], i]).sort((a, b) => b[0] - a[0] || a[1] - b[1]);
  for (let k = 0; k < rem; k++) base[order[k % order.length][1]]++;
  return base;
}

/* ---------- modelo ---------- */
function blankDraft() {
  return { id: newId(), place: '', createdAt: Date.now(), people: [], items: [],
    service: { enabled: true, mode: 'pct', pct: 10, fixed: 0, policy: 'discount' },
    couvert: { enabled: false, value: 1500 },
    discount: { enabled: false, label: 'Desconto', mode: 'value', value: 0, pct: 10, at: 'after' },
    payMode: 'none', payer: '', custom: {}, cover: {}, groups: [],
    live: null, savedAt: null, isExample: false, active: false, fechada: null };
}
function migrate(d) {
  const hadGroups = Array.isArray(d && d.groups);
  const b = blankDraft();
  d = { ...b, ...d };
  d.service = { ...b.service, ...(d.service || {}) };
  d.couvert = { ...b.couvert, ...(d.couvert || {}) };
  // contas antigas aplicavam o desconto antes do serviço
  d.discount = { ...b.discount, at: 'before', ...(d.discount || {}) };
  delete d.check;
  // "Várias pagaram" virou valor personalizado por pessoa
  if (d.payMode === 'multi') { d.custom = Object.fromEntries(Object.entries(d.paid || {}).filter(([, v]) => v > 0)); d.payMode = 'none'; }
  d.payMode = 'none'; d.payer = ''; // "uma pessoa paga a conta de todos" saiu na 1.12.0: cada um paga o seu
  d.custom = isObj(d.custom) ? d.custom : {};
  d.cover = isObj(d.cover) ? d.cover : {};
  delete d.paid;
  delete d.settled;
  // versões anteriores guardavam "quem paga por quem" em cada pessoa; vira um grupo com responsável
  if (!hadGroups) {
    const ppl = d.people || [], byId = Object.fromEntries(ppl.map(p => [p.id, p]));
    const rootOf = id => { let cur = id; const seen = new Set([id]); while (byId[cur]?.by && byId[byId[cur].by] && !seen.has(byId[cur].by)) { cur = byId[cur].by; seen.add(cur); } return cur; };
    const map = {}; ppl.forEach(p => { const r = rootOf(p.id); (map[r] = map[r] || []).push(p.id); });
    d.groups = Object.entries(map).filter(([, m]) => m.length > 1).map(([r, m]) => ({ id: newId(), members: [r, ...m.filter(x => x !== r)], payers: [r] }));
  }
  if (typeof d.active !== 'boolean') d.active = !d.savedAt && !d.isExample && !!((d.items || []).length || (d.people || []).length);
  d.people = (d.people || []).map((p, i) => ({ payService: true, payCouvert: true, o: i, ...p }));
  d.items = (d.items || []).map((it, i) => {
    const a = it.a ? { ...it.a } : Object.fromEntries((it.assign || []).map(id => [id, 1]));
    const { assign, uneq, free, ...rest } = it;
    const fq = Math.min(it.qty || 1, it.fq ?? (free ? (it.qty || 1) : 0));
    return { o: i, ...rest, fq, mode: it.mode || (uneq ? 'parts' : 'equal'), lk: it.lk ?? Object.keys(a).length > 0, a };
  });
  return d;
}
const newPerson = name => ({ id: newId(), name, payService: true, payCouvert: true, o: nextOrder() });

// grupos válidos: só pessoas que existem, cada uma em um grupo, pelo menos 2 por grupo e 1 responsável
function cleanGroups(d) {
  const ids = new Set(d.people.map(p => p.id)), used = new Set();
  return (d.groups || []).map(g => {
    const members = (g.members || []).filter(m => ids.has(m) && !used.has(m));
    members.forEach(m => used.add(m));
    let payers = (g.payers || []).filter(p => members.includes(p));
    if (!payers.length && members.length) payers = [members[0]];
    return { id: g.id, members, payers };
  }).filter(g => g.members.length > 1);
}
function compute(d) {
  const per = {};
  d.people.forEach(p => per[p.id] = { person: p, lines: [], gross: 0, discount: 0, subtotal: 0, serviceNominal: 0, service: 0, couvert: 0, total: 0, paid: 0, balance: 0 });
  const ids = d.people.map(p => p.id);
  let itemsGross = 0, freeValue = 0; const unassigned = [], incomplete = [];
  d.items.forEach(it => {
    const fq = Math.min(it.fq || 0, it.qty);
    const charged = (it.qty - fq) * it.price, freeVal = fq * it.price;
    itemsGross += charged; freeValue += freeVal;
    const who = ids.filter(id => (it.a[id] || 0) > 0);
    if (!who.length) { if (charged > 0) unassigned.push(it); return; }
    const base = { name: it.name, qty: it.qty, price: it.price, n: who.length, mode: it.mode, fq };
    if (it.mode === 'units') {
      // cada pessoa leva unidades inteiras; a soma precisa ser exatamente a quantidade
      const units = who.reduce((s, id) => s + it.a[id], 0);
      if (units !== it.qty) { incomplete.push({ it, units }); return; }
      const frees = allocate(freeVal, who.map(id => it.a[id]));
      who.forEach((id, i) => {
        const v = it.a[id] * it.price - frees[i];
        per[id].lines.push({ ...base, units: it.a[id], value: v, freeShare: frees[i] });
        per[id].gross += v;
      });
      return;
    }
    const isParts = it.mode === 'parts';
    const w = who.map(id => isParts ? it.a[id] : 1);
    const totalParts = w.reduce((a, b) => a + b, 0);
    const parts = allocate(charged, w), frees = allocate(freeVal, w);
    who.forEach((id, i) => {
      per[id].lines.push({ ...base, uneq: isParts && new Set(w).size > 1, parts: w[i], totalParts, value: parts[i], freeShare: frees[i] });
      per[id].gross += parts[i];
    });
  });
  const openItems = d.items.filter(it => !it.lk);
  const consumoBruto = ids.reduce((a, id) => a + per[id].gross, 0);
  const ds = d.discount, after = ds.at === 'after';
  const discountOf = base => !ds.enabled ? 0 : Math.min(base, ds.mode === 'pct' ? Math.round(base * ds.pct / 100) : ds.value);

  // desconto sobre o consumo: entra antes do serviço
  let discount = after ? 0 : discountOf(consumoBruto);
  allocate(discount, ids.map(id => per[id].gross)).forEach((v, i) => per[ids[i]].discount = v);
  ids.forEach(id => per[id].subtotal = per[id].gross - per[id].discount);
  const consumo = consumoBruto - discount;
  const s = d.service;
  const nominalTotal = !s.enabled ? 0 : (s.mode === 'fixed' ? s.fixed : Math.round(consumo * s.pct / 100));
  allocate(nominalTotal, ids.map(id => per[id].subtotal)).forEach((v, i) => per[ids[i]].serviceNominal = v);
  const payers = ids.filter(id => per[id].person.payService);
  if (s.policy === 'redistribute') allocate(nominalTotal, payers.map(id => per[id].subtotal)).forEach((v, i) => per[payers[i]].service = v);
  else payers.forEach(id => per[id].service = per[id].serviceNominal);
  if (d.couvert.enabled) ids.forEach(id => { if (per[id].person.payCouvert) per[id].couvert = d.couvert.mode === 'pct' ? Math.round(per[id].subtotal * (d.couvert.pct || 0) / 100) : d.couvert.value; });
  ids.forEach(id => { const r = per[id]; r.total = r.subtotal + r.service + r.couvert; });

  // desconto no final: sobre o total já com serviço e couvert, como muitos restaurantes fazem
  if (after) {
    const pre = ids.map(id => per[id].total);
    discount = discountOf(pre.reduce((a, b) => a + b, 0));
    allocate(discount, pre).forEach((v, i) => { per[ids[i]].discount = v; per[ids[i]].total -= v; });
  }
  let service = 0, couvert = 0, total = 0;
  ids.forEach(id => { const r = per[id]; service += r.service; couvert += r.couvert; total += r.total; });
  const skipped = ids.filter(id => !per[id].person.payService && per[id].serviceNominal > 0);
  const skippedValue = skipped.reduce((a, id) => a + per[id].serviceNominal, 0);


  // grupos: quem está no mesmo grupo divide um cupom só; os responsáveis pagam pelo grupo
  const groups = cleanGroups(d);
  const unitOf = {};
  groups.forEach(g => g.members.forEach(m => unitOf[m] = g.id));
  ids.forEach(id => { if (!unitOf[id]) unitOf[id] = id; });
  const mk = (id, members, payers) => {
    const sum = k => members.reduce((a, m) => a + per[m][k], 0);
    const multi = members.length > 1;
    const lines = multi ? members.flatMap(m => [{ header: per[m].person.name, value: per[m].total }, ...per[m].lines]) : per[members[0]].lines;
    const svcPayers = members.filter(m => per[m].person.payService).length, cvPayers = members.filter(m => per[m].person.payCouvert).length;
    const name = members.map(m => per[m].person.name).join(' + ');
    return { id, members, payers, name, lines, gross: sum('gross'), discount: sum('discount'), service: sum('service'), serviceNominal: sum('serviceNominal'),
      couvert: sum('couvert'), total: sum('total'), cvPayers, person: { id, name, payService: svcPayers > 0, payCouvert: cvPayers > 0 }, paid: 0, balance: 0 };
  };
  const units = [];
  ids.forEach(id => {
    const uid = unitOf[id];
    if (units.some(u => u.id === uid)) return;
    const g = groups.find(x => x.id === uid);
    units.push(g ? mk(g.id, g.members, g.payers) : mk(id, [id], [id]));
  });
  const U = Object.fromEntries(units.map(u => [u.id, u]));

  // cada responsável deve uma parte igual do total do seu cupom
  const share = {}; ids.forEach(id => share[id] = 0);
  units.forEach(u => { const sh = allocate(u.total, u.payers.map(() => 1)); u.shares = {}; u.payers.forEach((pid, i) => { share[pid] += sh[i]; u.shares[pid] = sh[i]; }); });
  // quem vai pagar o local: valores personalizados primeiro; o restante fica com quem paga a conta
  // ("Uma pessoa paga") ou é dividido entre os demais na proporção da parte de cada um ("Cada um paga o seu")
  const single = d.payMode === 'single' && per[d.payer] ? d.payer : '';
  // quem está num cupom compartilhado sem pagar não tem valor próprio (vale também para dados antigos ou de outro aparelho)
  const nonPay = new Set(groups.flatMap(g => g.members.filter(m => !g.payers.includes(m))));
  const custom = {};
  Object.entries(d.custom || {}).forEach(([k, v]) => { if (per[k] && k !== single && !nonPay.has(k)) custom[k] = Math.max(0, Math.round(v) || 0); });
  const paidBy = {}, coverOf = {}; ids.forEach(id => paidBy[id] = custom[id] || 0);
  const rest = total - Object.values(custom).reduce((a, b) => a + b, 0);
  if (rest > 0) {
    if (single) paidBy[single] = rest;
    else if (d.payMode !== 'single') {
      const free = ids.filter(id => !(id in custom) && share[id] > 0);
      // quem paga menos que a sua parte pode escolher quem cobre a diferença (e fica devendo a essa pessoa)
      let left = rest;
      // quem paga outro valor pode escolher com quem fica a diferença: quem cobre o que faltou (paga a mais ao local)
      // ou quem devolve o que sobrou (paga a menos ao local). Sem escolha, os outros dividem.
      Object.entries(d.cover || {}).forEach(([x, y]) => {
        const gap = (x in custom) ? share[x] - custom[x] : 0;
        if (!gap || !free.includes(y) || x === y || unitOf[x] === unitOf[y]) return;
        if (gap > 0 ? gap <= left : share[y] + gap >= 0) { coverOf[x] = y; paidBy[y] += gap; left -= gap; }
      });
      // quem já pagou fica com a sua parte: a diferença dos outros é dividida só entre quem ainda vai pagar
      const jaPagou = id => !!(d.pagos && d.pagos[id]), ja = free.filter(jaPagou), aindaNao = free.filter(id => !jaPagou(id));
      if (ja.length && aindaNao.length) {
        ja.forEach(id => { paidBy[id] += share[id]; left -= share[id]; });
        const al = allocate(Math.max(0, left), aindaNao.map(id => share[id])); aindaNao.forEach((id, i) => paidBy[id] += al[i]);
      } else { const al = allocate(left, free.map(id => share[id])); free.forEach((id, i) => paidBy[id] += al[i]); }
    }
  }
  const paidSum = ids.reduce((a, id) => a + paidBy[id], 0);
  const bal = {}; ids.forEach(id => { bal[id] = paidBy[id] - share[id]; per[id].paid = paidBy[id]; per[id].share = share[id]; per[id].balance = bal[id]; per[id].custom = id in custom; per[id].cover = coverOf[id] || ''; });
  // acertos entre pessoas: quem pagou menos que a sua parte passa a diferença a quem pagou mais
  const transfers = [];
  const left = { ...bal };
  Object.entries(coverOf).forEach(([x, y]) => {
    const v = Math.min(-left[x], left[y]);
    if (v > 0) { transfers.push({ from: x, to: y, value: v }); left[x] += v; left[y] -= v; }
  });
  const cred = ids.filter(id => left[id] > 0).map(id => ({ id, v: left[id] })).sort((a, b) => b.v - a.v);
  const debt = ids.filter(id => left[id] < 0).map(id => ({ id, v: -left[id] })).sort((a, b) => b.v - a.v);
  for (let i = 0, j = 0; i < debt.length && j < cred.length;) {
    const v = Math.min(debt[i].v, cred[j].v);
    if (v > 0) transfers.push({ from: debt[i].id, to: cred[j].id, value: v });
    debt[i].v -= v; cred[j].v -= v;
    if (!debt[i].v) i++;
    if (!cred[j].v) j++;
  }
  const payDiff = paidSum - total;
  units.forEach(u => { u.paid = u.members.reduce((a, m) => a + paidBy[m], 0); });
  return { per, ids, units, U, unitOf, groups, payMode: d.payMode, payer: single, itemsGross, consumoBruto, discount, consumo, nominalTotal, service, couvert, total, unassigned, incomplete, openItems, freeCount: d.items.filter(i => i.fq > 0).length, freeValue, discountAfter: after, skipped, skippedValue, payers, transfers, coverOf, paidSum, payDiff, missingPayer: d.payMode === 'single' && !single };
}

/* ---------- formato compartilhado da mesa ao vivo ---------- */
function toShared(d) {
  const people = {}; d.people.forEach((p, i) => people[p.id] = { name: p.name, payService: !!p.payService, payCouvert: !!p.payCouvert, o: p.o ?? i });
  const items = {}; d.items.forEach((it, i) => items[it.id] = { name: it.name, qty: it.qty, price: it.price, fq: it.fq || 0, mode: it.mode || 'equal', lk: !!it.lk, auto: !!it.auto, a: { ...it.a }, o: it.o ?? i });
  return { place: d.place || '', createdAt: d.createdAt, people, items, service: { ...d.service }, couvert: { ...d.couvert },
    discount: { ...d.discount }, payMode: d.payMode, payer: d.payer || '', custom: { ...(d.custom || {}) }, cover: { ...(d.cover || {}) }, groups: clone(d.groups || []) };
}
function fromShared(s, base) {
  const b = blankDraft();
  const people = Object.entries(s.people || {}).filter(([, p]) => isObj(p) && !p._del && p.name)
    .map(([id, p]) => ({ id, name: p.name, payService: p.payService !== false, payCouvert: p.payCouvert !== false, o: p.o || 0 })).sort((x, y) => x.o - y.o);
  const pids = new Set(people.map(p => p.id));
  const items = Object.entries(s.items || {}).filter(([, it]) => isObj(it) && !it._del && it.name)
    .map(([id, it]) => ({ id, name: it.name, qty: it.qty || 1, price: it.price || 0, fq: Math.min(it.qty || 1, it.fq ?? (it.free ? (it.qty || 1) : 0)), mode: it.mode || (it.uneq ? 'parts' : 'equal'), lk: !!it.lk, auto: !!it.auto, o: it.o || 0,
      a: Object.fromEntries(Object.entries(it.a || {}).filter(([k, v]) => v > 0 && pids.has(k))) })).sort((x, y) => x.o - y.o);
  return { ...base, place: s.place || '', createdAt: s.createdAt || base.createdAt, people, items,
    service: { ...b.service, ...(s.service || {}) }, couvert: { ...b.couvert, ...(s.couvert || {}) },
    discount: { ...b.discount, ...(s.discount || {}) },
    payMode: s.payMode === 'single' ? 'single' : 'none', payer: s.payer || '', custom: Object.fromEntries(Object.entries(s.custom || {}).filter(([k, v]) => typeof v === 'number' && v >= 0 && pids.has(k))),
    cover: Object.fromEntries(Object.entries(s.cover || {}).filter(([k, v]) => pids.has(k) && pids.has(v))),
    groups: Array.isArray(s.groups) ? s.groups : Object.values(s.groups || {}) };
}
// patch mínimo: só as folhas que mudaram, para várias pessoas editarem ao mesmo tempo sem se sobrescrever
function diff(a, b) {
  if (isObj(a) && isObj(b)) {
    const p = {}; let any = false;
    for (const k of Object.keys(b)) { const x = diff(a[k], b[k]); if (x !== undefined) { p[k] = x; any = true; } }
    for (const k of Object.keys(a)) if (!(k in b)) { p[k] = isObj(a[k]) ? { _del: true } : null; any = true; }
    return any ? p : undefined;
  }
  return JSON.stringify(a) === JSON.stringify(b) ? undefined : (b === undefined ? null : b);
}

/* ---------- armazenamento ---------- */
// durante o guia, a demonstração mexe em tudo à vontade e nada é gravado no aparelho
let semSalvar = false;
const LS = {
  get(k, def) { try { const v = localStorage.getItem('contafacil.' + k); return v ? JSON.parse(v) : def; } catch { return def; } },
  set(k, v) { if (semSalvar) return; try { localStorage.setItem('contafacil.' + k, JSON.stringify(v)); } catch {} if (k === 'bills' || k === 'catalog') syncTocou(); },
};
// histórico, cadastros e comanda ficam neste aparelho; o Firebase só guarda as comandas ao vivo.
// Com a sincronização ligada (Ajustes), histórico e cadastros também vão, criptografados, para um gist secreto do usuário.
const LIVE_PRAZO_DIAS = 30; // comandas ao vivo nunca encerradas vencem 30 dias depois de criadas; a limpeza mensal apaga as vencidas
const store = {
  mode: 'local', db: null, ready: false, chain: Promise.resolve(),
  queue(fn, onErr) { this.chain = this.chain.then(fn).catch(e => (onErr || (x => console.warn('db', x)))(e)); return this.chain; },
  async init() {
    try {
      const m = await import('./fb.js');
      this.db = await m.connect();
    } catch (e) { console.warn('firebase', e); this.db = null; }
    this.ready = true;
    renderSync(); render({ preserve: true });
    live.boot();
  },
  saveCatalog() { LS.set('catalog', catalog); },
  saveBill() { LS.set('bills', bills); },
  deleteBill() { LS.set('bills', bills); },
};

/* ---------- mesa ao vivo ---------- */
// cada aparelho tem um id fixo; "quem é você" vem da escolha feita no cartão da comanda ao vivo
const DEVICE = (() => { let id = LS.get('device', ''); if (!id) { id = newId() + newId(); LS.set('device', id); } return id; })();
const BEAT_MS = 60000, STALE_MS = 150000;
const isStandalone = () => { try { return navigator.standalone === true || matchMedia('(display-mode: standalone)').matches; } catch { return false; } };
const live = {
  unsub: null, last: null, readOnly: false, closed: false, connecting: false, online: {}, beatTimer: null, tickTimer: null,
  ref(code) { return store.db.doc('mesas/' + code); },
  /* prazo de guarda (política de privacidade): ao encerrar, o anfitrião apaga a comanda do Firebase na hora.
     expiraEm (30 dias depois de criada) é a rede de segurança para comandas nunca encerradas: a limpeza mensal no
     console apaga as vencidas (comum/regras-firestore-feedback.txt). Vai numa gravação à parte: se a regra do banco ainda não aceitar
     o campo, a comanda continua funcionando normalmente. */
  carimbarPrazo(code) {
    const expiraEm = new Date(Date.now() + LIVE_PRAZO_DIAS * 864e5);
    store.queue(() => this.ref(code).update({ expiraEm }), e => console.warn('prazo da comanda ao vivo', e && e.code));
  },
  link() { return APP_URL + '#m' + draft.live.code; },
  available() { return !!store.db; },
  async boot() {
    const m = /^#m([a-z0-9]{6,16})$/.exec(location.hash || '');
    if (m && store.db) {
      const code = m[1];
      if (draft.live?.code === code) return this.subscribe();
      if (isTouch && !isStandalone() && !this.browserOk) return openInAppSheet(code);
      try {
        const snap = await this.ref(code).get();
        if (!snap.exists) { KitFacil.avisar('Essa comanda ao vivo não foi encontrada.'); return draft.live && this.subscribe(); }
        const data = snap.data();
        if (data.closed) { KitFacil.avisar('Essa comanda ao vivo já foi encerrada.'); return draft.live && this.subscribe(); }
        const join = () => { this.stop(); draft = fromShared(data, { ...blankDraft(), active: true, live: { code, host: false } }); this.last = toShared(draft); tab = 'comanda'; saveDraft(); render(); this.subscribe(); KitFacil.avisar('Você entrou na comanda ao vivo.'); };
        draft.live ? join() : confirmReplace(join);
      } catch (e) { console.warn(e); KitFacil.avisar('Não foi possível abrir a comanda ao vivo.'); }
    } else if (draft.live && store.db) this.subscribe();
  },
  async start() {
    if (!store.db) { KitFacil.avisar('A comanda ao vivo precisa de internet. Verifique a conexão e tente de novo.'); return; }
    const code = Array.from({ length: 10 }, () => 'abcdefghjkmnpqrstuvwxyz23456789'[Math.floor(Math.random() * 31)]).join('');
    if (draft.isExample) { KitFacil.avisar('No exemplo, a comanda ao vivo fica desligada.'); return; }
    draft.live = { code, host: true };
    // hostUid: só o aparelho que criou a comanda pode apagá-la (regra do Firestore)
    const body = { ...toShared(draft), closed: false, v: 1, ...(store.db.uid ? { hostUid: store.db.uid } : {}) };
    try {
      await this.ref(code).set(body);
      this.carimbarPrazo(code);
      this.last = toShared(draft);
      saveDraft(); render(); this.subscribe(); window.scrollTo({ top: 0 });
      inviteSheet(); jogoMarcar('aoVivo');
    } catch (e) { console.warn(e); draft.live = null; render(); KitFacil.avisar('Não foi possível criar a comanda ao vivo agora. Tente de novo em instantes.'); }
  },
  async subscribe() {
    if (!draft.live || !store.db || this.unsub) return;
    const code = draft.live.code;
    this.closed = false;
    this.unsub = this.ref(code).onSnapshot(snap => {
      if (!draft.live || draft.live.code !== code) return;
      if (!snap.exists) { this.closed = true; render({ preserve: true }); return; }
      const data = snap.data();
      const wasClosed = this.closed;
      this.closed = !!data.closed;
      this.online = isObj(data.online) ? { ...data.online } : {};
      const next = fromShared(data, draft);
      const nextShared = toShared(next);
      if (JSON.stringify(nextShared) === JSON.stringify(toShared(draft)) && this.last) { this.last = nextShared; if (wasClosed !== this.closed) render({ preserve: true }); else paintPresence(); return; }
      draft = next; this.last = nextShared; saveDraft(); render({ preserve: true });
    }, err => { console.warn('live', err); this.unsub = null; KitFacil.avisar('A conexão com a comanda ao vivo caiu. Toque em Reconectar.'); render({ preserve: true }); });
    this.startBeats();
    render({ preserve: true });
  },
  push() {
    if (!draft.live || !store.db || this.closed) return;
    const now = toShared(draft);
    const patch = this.last ? diff(this.last, now) : now;
    this.last = now;
    if (!patch) return;
    const code = draft.live.code;
    store.queue(() => this.ref(code).update(patch), e => {
      console.warn('live write', e);
      if (e && e.code === 'permission-denied') KitFacil.avisar('Esta comanda ao vivo não aceita mais alterações.');
      else KitFacil.avisar('Não deu para enviar a alteração. Ela será reenviada na próxima mudança.');
      this.last = null;
    });
  },
  stop() { this.offline(); clearInterval(this.beatTimer); clearInterval(this.tickTimer); this.beatTimer = this.tickTimer = null; if (this.unsub) { try { this.unsub(); } catch {} } this.unsub = null; this.online = {}; },
  // presença: um sinal por minuto enquanto o app está aberto na tela; sai na hora ao fechar ou bloquear o celular
  me() { return draft.live ? LS.get('me.' + draft.live.code, '') : ''; },
  beat() {
    if (!draft.live || !store.db || this.closed || document.visibilityState === 'hidden') return;
    const code = draft.live.code, entry = { p: this.me() || '', at: Date.now() };
    this.online[DEVICE] = entry;
    store.queue(() => this.ref(code).update({ online: { [DEVICE]: entry } }), e => console.warn('presença', e));
  },
  offline() {
    if (!draft.live || !store.db || !this.unsub) return;
    const code = draft.live.code; delete this.online[DEVICE];
    try { this.ref(code).update({ online: { [DEVICE]: null } }).catch(() => {}); } catch {}
  },
  startBeats() {
    clearInterval(this.beatTimer); clearInterval(this.tickTimer);
    this.beat();
    this.beatTimer = setInterval(() => this.beat(), BEAT_MS);
    this.tickTimer = setInterval(() => paintPresence(), 30000);
  },
  people() {
    // quem está online agora: um por aparelho; aparelhos sem nome escolhido contam como "sem nome"
    const now = Date.now(), seen = new Set(), named = [], devices = [];
    let anon = 0;
    Object.entries(this.online || {}).forEach(([dev, x]) => {
      if (!x || typeof x.at !== 'number' || now - x.at > STALE_MS) return;
      devices.push(dev);
      const p = x.p && draft.people.find(q => q.id === x.p);
      if (p) { if (!seen.has(p.id)) { seen.add(p.id); named.push({ ...p, you: dev === DEVICE }); } else if (dev === DEVICE) named.find(n => n.id === p.id).you = true; }
      else anon++;
    });
    return { count: devices.length, named, anon, youAnon: devices.includes(DEVICE) && !(this.online[DEVICE] && draft.people.some(q => q.id === this.online[DEVICE].p)) };
  },
  async end() {
    const code = draft.live?.code; const host = draft.live?.host;
    this.stop();
    if (code && host && store.db && !this.closed) {
      // encerra para quem está na mesa e apaga do Firebase; se a regra ainda não deixar apagar, fica só encerrada
      store.queue(() => this.ref(code).update({ closed: true }));
      store.queue(() => this.ref(code).delete(), e => console.warn('apagar a comanda ao vivo', e && e.code));
    }
    draft.live = null; this.last = null; this.closed = false; this.readOnly = false; liveWho = false;
    try { if (location.hash) history.replaceState(null, '', location.pathname + location.search); } catch {}
    commit();
  },
};

// código em dois blocos de cinco, mais fácil de ler em voz alta na mesa
const codeHTML = code => `<b class="code-val" aria-label="${esc(code.split('').join(' '))}">${code.length === 10 ? `<span>${esc(code.slice(0, 5))}</span><span>${esc(code.slice(5))}</span>` : `<span>${esc(code)}</span>`}</b>`;
const codeShort = code => code.length === 10 ? code.slice(0, 5) + ' ' + code.slice(5) : code;
// no iPhone, um link sempre abre no Safari, nunca no app da tela de início: a ponte é o código
function openInAppSheet(code) {
  openSheet({ title: 'Comanda ao vivo', body: `<p class="hint" style="font-size:15px">Tem o Conta Fácil na tela de início? Copie o código, abra o app e cole em <b>Comanda ao vivo</b>, na tela inicial.</p>
    <div class="code-box"><span class="eyebrow">Código</span>${codeHTML(code)}</div>
    <details class="oa-install" data-kf-secao><summary>Ainda não tenho o app</summary><p class="hint">Toque em <b>Compartilhar</b> no Safari e em <b>Adicionar à Tela de Início</b>. Depois, abra o app pelo ícone e entre com o código.</p></details>`,
    foot: `<button class="btn ghost" id="oa-here">Continuar no navegador</button><button class="btn" id="oa-copy">${I.copy}Copiar código</button>`, onMount: s => {
    $('#oa-copy', s).onclick = () => copyText(code, 'Código copiado. Agora abra o app.');
    $('#oa-here', s).onclick = () => { closeSheet(true); live.browserOk = true; live.boot(); };
  } });
}
// convite: QR code para quem está na mesa, link e código para mandar no grupo
function inviteText() {
  return `Comanda ao vivo${draft.place ? ' em ' + draft.place : ''} no Conta Fácil.\nCódigo: ${codeShort(draft.live.code)}\nNo app, cole o código em Comanda ao vivo, na tela inicial. Sem o app, abra o link:`;
}
function inviteSheet() {
  if (!draft.live || draft.isExample) return;
  const code = draft.live.code, link = live.link();
  openSheet({ title: 'Convidar a turma', sub: draft.place || '', body: `<div class="qr-wrap sm"><canvas id="iv-qr" width="400" height="400" aria-label="QR code do convite"></canvas><span class="hint" id="iv-qr-msg">Gerando QR code…</span></div>
    <div class="code-box"><span class="eyebrow">Código</span>${codeHTML(code)}</div>
    ${navigator.share ? `<button class="btn mustard" id="iv-share">${I.share}Enviar convite</button>` : ''}
    <div class="btn-row"><button class="btn ghost" id="iv-link">${I.copy}Copiar link</button><button class="btn ghost" id="iv-code">${I.copy}Copiar código</button></div>`, onMount: async s => {
    $('#iv-link', s).onclick = () => copyText(link, 'Link copiado.');
    $('#iv-code', s).onclick = () => copyText(code, 'Código copiado.');
    $('#iv-share', s)?.addEventListener('click', async () => {
      const text = inviteText();
      try { await navigator.share({ title: 'Conta Fácil', text, url: link }); } catch (e) { if (e && e.name !== 'AbortError') copyText(text + '\n' + link, 'Convite copiado.'); }
    });
    try { const m = await qrMatrix(link); const cv = $('#iv-qr'); if (cv) { drawQR(cv.getContext('2d'), m, 0, 0, 400); $('#iv-qr-msg').hidden = true; } }
    catch { const msg = $('#iv-qr-msg'); if (msg) msg.textContent = 'Não deu para gerar o QR code agora.'; const cv = $('#iv-qr'); if (cv) cv.hidden = true; }
  } });
}
// quem está online, atualizado sem redesenhar a tela
const joinNames = a => a.length < 2 ? (a[0] || '') : a.slice(0, -1).join(', ') + ' e ' + a[a.length - 1];
function presenceHTML() {
  if (!draft.live || !live.unsub || live.closed) return '';
  const { named, anon, youAnon } = live.people();
  const total = named.length + anon;
  if (!total) return '';
  const first = n => esc(n.name.split(' ')[0]);
  const you = named.find(n => n.you), others = named.filter(n => !n.you), meIn = !!(you || youAnon);
  const otherAnon = anon - (youAnon ? 1 : 0);
  const shown = [...(you ? [you] : []), ...others].slice(0, 4);
  const extra = total - shown.length;
  const avs = shown.map(n => avatar(n.name)).join('') + (extra > 0 ? `<span class="avatar lp-more">${!shown.length && extra === 1 ? '?' : '+' + extra}</span>` : '');
  const names = [...(meIn ? ['você'] : []), ...others.map(first)];
  if (otherAnon > 0) names.push(otherAnon === 1 ? '1 sem nome' : otherAnon + ' sem nome');
  const title = total === 1 && meIn ? 'Só você por enquanto' : plural(total, 'pessoa conectada', 'pessoas conectadas');
  const sub = total === 1 && meIn ? '' : cap(joinNames(names));
  return `<span class="lp-avs">${avs}</span><span class="lp-on-txt"><b>${title}</b>${sub ? `<small>${sub}</small>` : ''}</span>`;
}
function paintPresence() {
  const a = $('#live-online'); if (a) a.innerHTML = presenceHTML();
}
document.addEventListener('visibilitychange', () => { if (!draft.live || !live.unsub) return; if (document.visibilityState === 'hidden') live.offline(); else live.beat(); });
window.addEventListener('pagehide', () => live.offline());

/* ---------- estado ---------- */
function exampleDraft() {
  const d = blankDraft(); d.place = 'Cantina da Praça'; d.isExample = true;
  const [a, b, c, e] = ['Ana', 'Bruno', 'Carla', 'Diego'].map(newPerson);
  e.payService = false;
  d.people = [a, b, c, e];
  const all = Object.fromEntries(d.people.map(p => [p.id, 1]));
  d.items = [
    { id: newId(), o: 1, name: 'Suco natural 500 ml', qty: 11, price: 1290, fq: 1, mode: 'units', lk: true, a: { [a.id]: 4, [b.id]: 3, [c.id]: 2, [e.id]: 2 } },
    { id: newId(), o: 2, name: 'Porção de batata com cheddar', qty: 1, price: 3800, fq: 0, mode: 'equal', lk: true, a: { [a.id]: 1, [b.id]: 1, [c.id]: 1 } },
    { id: newId(), o: 3, name: 'Milk-shake', qty: 2, price: 2200, fq: 0, mode: 'equal', lk: true, a: { [c.id]: 1 } },
    { id: newId(), o: 4, name: 'Água com gás', qty: 1, price: 600, fq: 0, mode: 'equal', lk: true, a: { [e.id]: 1 } },
    { id: newId(), o: 5, name: 'Porção de calabresa', qty: 1, price: 4200, fq: 0, mode: 'equal', lk: false, a: { ...all } },
  ];
  d.groups = [{ id: newId(), members: [a.id, b.id], payers: [a.id] }];
  d.demoPix = { Ana: 'ana@exemplo.com.br' }; d.demoEu = 'Ana';
  d.active = true;
  return d;
}
// a comanda de exemplo nunca é gravada: a comanda real continua guardada e volta ao sair do exemplo
const loadRealDraft = () => { const d = migrate(LS.get('draft', null) || blankDraft()); return d.isExample ? blankDraft() : d; };
let draft = loadRealDraft();
const saveDraft = () => { if (!draft.isExample) LS.set('draft', draft); };
function enterExample(semGuia = false) {
  semGuia = semGuia === true;
  if (draft.live) { KitFacil.avisar('Saia da comanda ao vivo antes de abrir o exemplo.'); return; }
  pending = {}; draft = exampleDraft(); tab = 'comanda'; render(); window.scrollTo({ top: 0 });
  // 0.3.0: o exemplo não abre mais o guia sozinho; o guia em vídeo tem a própria demonstração
}
function exitExample() {
  if (!draft.isExample) return;
  KitFacil.guia.pararDemonstracao(); pending = {}; draft = loadRealDraft();
}
const fixCatalog = c => ({ me: '', people: [], products: [], groups: [], ...c, groups: Array.isArray(c?.groups) ? c.groups : [], products: (c?.products || []).map(p => ({ prices: {}, ...p })) });
let catalog = fixCatalog(LS.get('catalog', {}));
let bills = LS.get('bills', []).map(migrate);
let tab = /^#m[a-z0-9]{6,16}$/.test(location.hash || '') ? 'comanda' : 'inicio';

/* ---------- sincronização entre aparelhos (Kit Fácil) ---------- */
// Vão para a nuvem o histórico (comandas salvas) e os cadastros (pessoas, chaves Pix, produtos e preços por local).
// A comanda aberta fica neste aparelho: para usar a mesma comanda em vários celulares, existe a comanda ao vivo.
// Cada registro guarda a hora da última mudança; ao juntar aparelhos, a mudança mais recente vence.
let SY = null, SNAP_SYNC = null, syncAplicando = false;
const chaveBill = b => 'b:' + b.id, chavePessoa = p => 'p:' + norm(p.name), chaveProduto = p => 'r:' + norm(p.name), chaveTurma = g => 'g:' + g.id;
const ordemBills = (a, b) => (b.closedAt || 0) - (a.closedAt || 0) || String(a.id).localeCompare(String(b.id));
const ordemNome = (a, b) => norm(a.name).localeCompare(norm(b.name), 'pt-BR');
// a comanda salva vai sempre no mesmo formato (o mesmo que saveBill grava), para os aparelhos compararem igual
const billSync = b => { const m = migrate(b); delete m.live; delete m.isExample; return m; };
function registrosSync() {
  const m = new Map();
  bills.forEach(b => m.set(chaveBill(b), JSON.stringify(b)));
  catalog.people.forEach(p => m.set(chavePessoa(p), JSON.stringify(p)));
  catalog.products.forEach(p => m.set(chaveProduto(p), JSON.stringify(p)));
  (catalog.groups || []).forEach(g => m.set(chaveTurma(g), JSON.stringify(g)));
  m.set('c:me', JSON.stringify(catalog.me || ''));
  return m;
}
function carimbarSync() {
  if (!SY) return false;
  const atual = registrosSync();
  if (!SNAP_SYNC) { SNAP_SYNC = atual; return false; }
  const agora = Date.now(), st = SY.estado.st, del = SY.estado.del;
  let mudou = false;
  for (const [k, j] of atual) if (SNAP_SYNC.get(k) !== j) { st[k] = agora; delete del[k]; mudou = true; }
  for (const k of SNAP_SYNC.keys()) if (!atual.has(k)) { delete st[k]; del[k] = agora; mudou = true; }
  SNAP_SYNC = atual;
  if (mudou) SY.salvar();
  return mudou;
}
// Durante o guia, a tela mostra uma demonstração (dadosReais guarda o que é de verdade).
// A sincronização continua trabalhando só com os dados reais: troca, faz o serviço e devolve a demonstração.
let dadosReais = null;
function comReais(fn) {
  if (!dadosReais) return fn();
  const demo = { bills, catalog }, era = semSalvar;
  bills = dadosReais.bills; catalog = dadosReais.catalog; semSalvar = false;
  try { return fn(); } finally { dadosReais.bills = bills; dadosReais.catalog = catalog; bills = demo.bills; catalog = demo.catalog; semSalvar = era; }
}
function syncTocou() { if (!SY || syncAplicando) return; if (carimbarSync() && SY.ligada()) SY.agendar(); }
function pacoteSync(soDados) {
  const p = { v: 1, bills: bills.map(billSync).sort(ordemBills), people: [...catalog.people].sort(ordemNome), products: [...catalog.products].sort(ordemNome), ...((catalog.groups || []).length ? { groups: [...catalog.groups].sort(ordemNome) } : {}), me: catalog.me || '' };
  return soDados ? p : { ...p, st: SY.estado.st, del: SY.estado.del };
}
// junta duas listas pela chave; a mudança mais recente vence e, no empate, os dois aparelhos escolhem o mesmo lado
function juntarLista(L, R, chave, st, rs, del) {
  const remoto = new Map(), out = [], vistos = new Set();
  (Array.isArray(R) ? R : []).forEach(x => { if (x && typeof x === 'object') remoto.set(chave(x), x); });
  const lt = k => st[k] || 0, rt = k => rs[k] || 0, dl = k => del[k] || 0;
  for (const x of L) {
    const k = chave(x); if (vistos.has(k)) continue; vistos.add(k);
    const r = remoto.get(k);
    if (r) {
      if (dl(k) && dl(k) >= Math.max(lt(k), rt(k))) { delete st[k]; continue; }
      const vemDeLa = rt(k) > lt(k) || (rt(k) === lt(k) && KitFacil.canon(r) > KitFacil.canon(x));
      out.push(vemDeLa ? r : x);
      if (vemDeLa && rt(k)) st[k] = rt(k);
    } else if (dl(k) && dl(k) >= lt(k)) delete st[k]; // apagado em outro aparelho
    else out.push(x);
  }
  for (const [k, r] of remoto) {
    if (vistos.has(k) || (dl(k) && dl(k) >= rt(k))) continue;
    vistos.add(k); out.push(r);
    if (rt(k)) st[k] = rt(k);
  }
  return out;
}
function aplicarSync(R) {
  const st = { ...SY.estado.st }, del = { ...SY.estado.del }, rs = R.st || {};
  for (const k in (R.del || {})) del[k] = Math.max(del[k] || 0, R.del[k]);
  const corte = Date.now() - 400 * 864e5;
  for (const k in del) if (del[k] < corte) delete del[k];
  const antes = KitFacil.canon(pacoteSync(true));
  let me = catalog.me || '';
  if ('me' in R) {
    const rt = rs['c:me'] || 0, lt = st['c:me'] || 0, rme = String(R.me || '');
    if (rt > lt || (rt === lt && rme > me)) { me = rme; if (rt) st['c:me'] = rt; }
  }
  syncAplicando = true;
  try {
    bills = juntarLista(bills.map(billSync), (Array.isArray(R.bills) ? R.bills : []).filter(b => b && b.id).map(billSync), chaveBill, st, rs, del).sort(ordemBills);
    catalog = fixCatalog({ ...catalog, me,
      people: juntarLista(catalog.people, (Array.isArray(R.people) ? R.people : []).filter(p => p && p.name), chavePessoa, st, rs, del).sort(ordemNome),
      products: juntarLista(catalog.products, (Array.isArray(R.products) ? R.products : []).filter(p => p && p.name), chaveProduto, st, rs, del).sort(ordemNome),
      groups: juntarLista(catalog.groups || [], (Array.isArray(R.groups) ? R.groups : []).filter(g => g && g.id && g.name), chaveTurma, st, rs, del).sort(ordemNome) });
    SY.estado.st = st; SY.estado.del = del;
    LS.set('bills', bills); LS.set('catalog', catalog);
  } finally { syncAplicando = false; }
  SNAP_SYNC = registrosSync(); SY.salvar();
  return antes !== KitFacil.canon(pacoteSync(true));
}
/* O Kit Fácil cuida do que é comum e não aparece no desenho: sincronização, avaliação, apoio, cópia de segurança,
   Ajustes, janelas e avisos. A abertura (onboarding) e o guia são os do próprio app (abertura em casca.js). */
const NOVIDADES = [
  { versao: '1.12.4', itens: [
    'Fechar e reabrir a comanda sem engasgo no começo: o movimento só parte quando a tela nova já está pronta',
  ] },
  { versao: '1.12.3', itens: [
    'Fechar a comanda ficou mais bonito: a tela sobe, o cabeçalho fica parado e cada nome se destaca do papel e vira canhoto',
    'Reabrir a comanda faz o caminho de volta: os canhotos se juntam e a comanda se desenrola de novo',
  ] },
  { versao: '1.12.2', itens: [
    'Fechar comanda em corte invisível: o botão cobre a tela e encolhe até virar o carimbo FECHADA.',
    'O botão Fechar comanda chama a atenção quando a comanda está pronta para fechar.',
    'Ver cupom da mesa abre o cupom, com Compartilhar em PDF. Copiar a comanda saiu.',
    'Reabrir a comanda virou um botão de verdade. O selo PAGO voltou às linhas da comanda aberta.',
  ] },
  { versao: '1.12.1', itens: [
    'Comanda aberta sem pagamento: marcar, desmarcar, carimbo e "falta" ficam só na comanda fechada.',
    'Canhoto aberto com Ver cupom; o cupom é compartilhado em PDF.',
    '"Já saiu da mesa" em linha, com a chave alinhada.',
  ] },
  { versao: '1.12.0', itens: [
    'Fechar a comanda mudou: o papel vira um canhoto por pessoa, sem janela. Para voltar, toque em Reabrir a comanda.',
    'Receber é carimbar: Marcar como pago em cada canhoto, com uma barra que mostra quanto já entrou.',
    'Receber com Pix aparece só quando serve: com a sua chave Pix e enquanto a pessoa não pagou.',
    '"Pagar outro valor" agora se chama "Pagar valor diferente" e fica dentro do canhoto.',
    'Saiu "Uma pessoa paga a conta de todos". A comanda da mesa termina no total.',
  ] },
  { versao: '1.11.1', itens: [
    'Fechar a comanda: no cupom da mesa, "Copiar" copia só a comanda da mesa.',
  ] },
  { versao: '1.11.0', itens: [
    'Pix: chave de celular ou de CPF volta a ser salva. Chave fora do formato é avisada na hora.',
    'Cadastros: o lápis altera a pessoa (nome, Pix e "sou eu") e o produto (nome e preços).',
    'Sortear alguém da mesa fica só em Mais; saiu de Tampinhas.',
    'Quantidade com a mesma aparência das outras caixas de texto.',
    'Quem não paga o serviço: marque a opção e toque em Confirmar; Cancelar desfaz.',
  ] },
  { versao: '1.10.1', itens: [
    'PDF do cupom bem mais leve: o arquivo ficou cerca de 30 vezes menor, com o mesmo desenho.',
  ] },
  { versao: '1.10.0', itens: [
    'Guia: a janela de Fechar a comanda fica aberta de um passo para o outro, sem fechar e abrir de novo.',
    'Janelas que só precisam ser fechadas não têm mais o botão Fechar: o X fecha.',
  ] },
  { versao: '1.9.6', itens: [
    'Guia: na conta da mesa, cada opção é destacada depois de ligada, antes do valor.',
  ] },
  { versao: '1.9.5', itens: [
    'Guia: destaca a área de pagamento inteira do cupom e cada opção da conta da mesa antes de preencher.',
    'Guia: o botão Concluir e a roda do sorteio aparecem inteiros na tela.',
  ] },
  { versao: '1.9.4', itens: [
    'Guia mais direto na hora de fechar a comanda: a janela abre menos vezes, e o guia passou a ter 34 passos.',
  ] },
  { versao: '1.9.3', itens: [
    'Quem chega depois não entra mais sozinho nos itens já lançados: você marca em quais ela entra.',
    'Guia revisado: mostra as duas opções do serviço, o sorteio girando e não toca mais no botão errado.',
  ] },
  { versao: '1.9.2', itens: [
    'A marca no alto da tela agora é o ícone do app, o mesmo de Sobre o aplicativo.',
  ] },
  { versao: '1.9.1', itens: [
    'A janela de Avaliação e feedback foi redesenhada no padrão do app.',
  ] },
  { versao: '1.9.0', itens: [
    'O app passou a usar as peças novas do Kit Fácil 0.8.0, que nasceram aqui. Para você, tudo continua igual.',
  ] },
  { versao: '1.8.7', itens: [
    'Todos os botões de excluir, remover e apagar agora são vermelhos, inclusive o da confirmação.',
  ] },
  { versao: '1.8.6', itens: [
    'Com o teclado aberto, os botões do pé da janela (como Cancelar e Lançar) não sobem mais para cima dele.',
  ] },
  { versao: '1.8.5', itens: [
    'O cursor do campo não aparece mais fora da caixa de texto enquanto a janela sobe com o teclado.',
  ] },
  { versao: '1.8.4', itens: [
    'Arrastar o dedo no meio da janela não move mais a janela: só a barrinha do alto a puxa.',
  ] },
  { versao: '1.8.3', itens: [
    'Puxe a janela para baixo pela barrinha do alto: ela acompanha o dedo e fecha, ou volta se você soltar antes.',
    'Tocar e segurar no alto da janela não seleciona mais o texto nem move a tela.',
  ] },
  { versao: '1.8.2', itens: [
    'Fechar no X: a janela desce sem dar um pulo para cima antes.',
  ] },
  { versao: '1.8.1', itens: [
    'Nenhuma caixa de texto é selecionada sozinha: o teclado só sobe quando você toca no campo.',
    'Pôr uma turma na mesa não abre mais o teclado.',
  ] },
  { versao: '1.8.0', itens: [
    'A janela do presente ficou mais clara: é opcional, e o app continua igual para todos, com presente ou sem.',
    'Em Mais, os Ajustes passaram para o fim, depois do guia e da comanda de exemplo.',
    'Leitores de tela: cada linha da comanda diz primeiro o que está escrito nela.',
  ] },
  { versao: '1.7.0', itens: [
    'Tudo o que abre e fecha no app agora tem o mesmo ritmo: mais calmo, sem aparecer de uma vez.',
    'As janelas fecham descendo pelo pé da tela, do mesmo jeito que abrem.',
    'Nenhuma janela abre com o teclado: ele só sobe quando você toca no campo.',
    'Quem está na mesa: o botão Adicionar fica ao lado do campo, e a janela fecha no X.',
    'Guia na ordem de uso: serviço, couvert e desconto vêm antes de fechar a comanda.',
  ] },
  { versao: '1.6.1', itens: [
    'Sem tranco ao abrir e fechar o teclado: a janela, o campo e os botões sobem e descem juntos, num movimento só.',
    'Com o teclado aberto, o campo que você toca vem sozinho para a parte visível da janela.',
  ] },
  { versao: '1.6.0', itens: [
    'Quem paga outro valor escolhe com quem fica a diferença: quem cobre o que faltou ou quem devolve o que sobrou.',
    'A conta de quem já pagou mudou? Além de receber ou devolver, outra pessoa pode ficar com a diferença.',
    'Quem pagou pode ser marcado como "Já saiu da mesa": o cupom trava e a pessoa não entra em novos pedidos.',
    'No sorteio, você escolhe quem entra, e pode pôr um nome avulso.',
    'Seu nome agora se escreve nos Ajustes; quem se apresenta na abertura já recebe a primeira tampinha.',
    'Excluir comanda em vermelho, da largura de Fechar comanda; botões de Fechar a comanda com a mesma largura.',
    'Abrir um nome ou um pedido na comanda rola a tela num movimento só.',
  ] },
  { versao: '1.5.0', itens: [
    'As janelas nascem do pé da tela e sobem num movimento só, mesmo quando o teclado abre junto: sem saltar nem voltar.',
    'Ao abrir e fechar o teclado, a janela acompanha com suavidade.',
    'Saiu a barra própria de OK do teclado numérico: o teclado do aparelho já tem a tecla de concluir.',
  ] },
  { versao: '1.4.0', itens: [
    'Uma pessoa paga a conta de todos agora fica em Fechar a comanda, e cada um continua com o seu cupom.',
    'Pagar outro valor também foi para Fechar a comanda, no cupom de cada pessoa.',
    'Editar (antes Detalhes) só muda o nome ou tira a pessoa da mesa.',
    'Excluir comanda fica logo abaixo de Fechar comanda.',
    'As chaves de serviço, couvert e desconto não fazem mais a janela tremer.',
    'No iPhone, tocar num campo não empurra mais a tela ao abrir o teclado.',
    'Guia: mostra o atalho de arrastar um nome sobre outro e não repete toques na tela já aberta.',
  ] },
  { versao: '1.3.3', itens: [
    'Marcar como pago agora fica em Fechar a comanda, no cupom de cada pessoa. O carimbo PAGO aparece na hora.',
    'Com o teclado aberto, a janela continua por trás dele e aperta os espaços: nada da comanda aparece no meio.',
    'No guia, a janela de pôr as pessoas na mesa não salta mais a cada nome.',
    'Início: a próxima tampinha ficou centrada com o texto.',
  ] },
  { versao: '1.3.2', itens: [
    'No Início, "Ver o guia" vem antes de "Ver uma comanda de exemplo".',
  ] },
  { versao: '1.3.1', itens: [
    'Presente: laço refeito, com as pontas deitadas sobre a tampa.',
    'Tampinhas e presente voltam a girar sozinhos depois que você solta.',
    'O ícone de Tampinhas tem a mesma silhueta das tampinhas da coleção.',
    'Apresentação: figura de QR code nova e linhas tracejadas que não mudam.',
  ] },
  { versao: '1.3.0', itens: [
    'Guia: cada passo agora faz a ação de verdade (alterar pedido, cortesia, serviço, cupom, juntar e separar, pago, couvert e desconto, repetir e excluir comanda, Pix, turma, sorteio).',
    'Guia: voltar um passo refaz o passo inteiro, e o destaque não aparece mais cortado.',
    'Tampinhas e presente em 3D de verdade: forma lisa, brilho e reflexo.',
    'Fechar a comanda: setas novas para passar os cupons.',
  ] },
  { versao: '1.2.0', itens: [
    'Quem já pagou: o app guarda o valor pago. Se a conta mudar depois (desconto, item novo), ele mostra quanto falta ou quanto devolver.',
    'Ao lançar um item, quem já pagou fica de fora, a menos que você marque.',
    'Abrir uma pessoa ou um pedido não esconde mais o título, e tudo que abre e recolhe tem movimento.',
    'As tampinhas e o presente em 3D não piscam mais ao girar.',
    'Quem está na mesa: o teclado fica aberto entre um nome e outro.',
    'Excluir a comanda em andamento também pelo Início.',
    '"Ver cupom" fica num lugar só: nos atalhos de cada pessoa.',
  ] },
  { versao: '1.1.0', itens: [
    'Guia novo, do começo ao fim: segue a ordem de uso do app, numa janela fixa, com contagem antes de cada passo.',
    'Tampinhas e presente em 3D: deslize o dedo para girar.',
    'A comanda agora sai de dentro da impressora, e as animações ficaram mais naturais.',
    'Ícones redesenhados no mesmo traço; os do alto da tela têm a mesma cor.',
    'Barra de baixo mais baixa, colada ao pé da tela.',
    'Mais enxuto: cada coisa num lugar só.',
    'Ao lançar um item, quantidade e valor ficam lado a lado.',
  ] },
  { versao: '1.0.0', itens: [
    'Conta Fácil de cara nova: a mesa é uma comanda só, de papel, montada em tempo real.',
    'Lançar um item cabe numa janela só: produto, quantidade, preço e quem consumiu.',
    'Fechar a comanda mostra os cupons um por vez, com a mesa primeiro, e salvar tem Desfazer.',
    'Marque quem já pagou: o total mostra quanto ainda falta.',
    'Tampinhas e níveis: uma coleção que cresce conforme você usa o app. Dá para desligar em Ajustes.',
    'Nova apresentação na primeira abertura.',
  ] },
];
// quem chega à 1.0 (novo ou vindo de outra versão) vê a abertura do app; as novidades do Kit ficam para as próximas versões
const ABERTURA_VISTA = LS.get('abertura', '');
if (ABERTURA_VISTA !== '1') { try { localStorage.setItem('kitfacil.conta-facil.visto', JSON.stringify(VERSAO)); } catch {} }
KitFacil.iniciar({
  app: 'conta-facil', nome: 'Conta Fácil', versao: VERSAO, icone: 'icons/icon-192.png',
  resumo: 'Divide a comanda da mesa sem calculadora: cada um paga o que consumiu, com serviço, couvert, desconto e Pix.',
  tela: () => tab, exemploDados: 'as comandas, o histórico, os cadastros e as chaves Pix',
  abrirAjustes: secao => { if (secao || tab !== 'ajustes') abrirAjustes(); else fecharAjustes(); },
  emAjustes: () => tab === 'ajustes',
  novidades: [...NOVIDADES],
  ocupado: () => (typeof aberturaAtiva === 'function' && aberturaAtiva()) || (typeof guiaAtivo === 'function' && guiaAtivo()),
  copia: { descricao: 'Baixe um arquivo com o histórico e os cadastros (e a comanda aberta, se houver).', baixar: () => baixarCopiaConta(), restaurar: f => restaurarCopiaConta(f) },
  privacidade: [
    'As comandas, o histórico, os cadastros (nomes, chaves Pix e preços por local) e as tampinhas ficam guardados neste aparelho.',
    'Comanda ao vivo (opcional): o local, os nomes, os pedidos e os valores da comanda vão para o Firebase (Google), para todos da mesa verem as mudanças na hora. Esses dados são apagados do Firebase assim que o anfitrião encerra a comanda; se ela nunca for encerrada, saem na limpeza mensal, depois de 30 dias. Quem tem o código ou o link entra na comanda: compartilhe só com quem está na mesa.',
  ],
});
KitFacil.tema.iniciar({ chave: 'contafacil.pref', cores: { claro: '#E8EEE7', escuro: '#0B1510' } });
SY = KitFacil.sync.criar({
  app: 'conta-facil', nome: 'Conta Fácil', chave: 'contafacil.sync',
  dados: 'o histórico de comandas e os cadastros (pessoas, chaves Pix e preços)',
  observacao: 'A comanda aberta fica neste aparelho. Para dividir a mesma comanda entre celulares, use a comanda ao vivo.',
  carimbar: () => comReais(carimbarSync), aplicar: R => comReais(() => aplicarSync(R)), pacote: () => comReais(() => pacoteSync(false)),
  mesmo: (a, r) => KitFacil.canon(a) === KitFacil.canon({ v: r.v, bills: r.bills, people: r.people, products: r.products, me: r.me ?? '', st: r.st, del: r.del }),
  redesenhar: () => render({ preserve: true }),
  ocupado: () => KitFacil.dialogo.aberto() || isField(document.activeElement) || (typeof guiaAtivo === 'function' && guiaAtivo()) || (typeof aberturaAtiva === 'function' && aberturaAtiva()),
  textoLigada: () => `Sincronização ligada. ${plural(bills.length, 'comanda salva', 'comandas salvas')} neste aparelho.`,
});
SNAP_SYNC = registrosSync();

function commit(opts = {}) {
  if (draft.live && live.readOnly) { KitFacil.avisar('Você só pode acompanhar esta comanda.'); if (live.last) draft = fromShared(live.last, draft); render(); return; }
  saveDraft();
  if (draft.live) live.push();
  render(opts);
}

/* ---------- zoom ---------- */
// o zoom com dois dedos fica liberado (acessibilidade); o duplo toque não dá zoom (touch-action: manipulation),
// para não atrasar toques rápidos em +1

/* ---------- teclado no celular ---------- */
const isTouch = (() => { try { return matchMedia('(pointer: coarse)').matches; } catch { return false; } })();
const isField = el => el && el.matches && el.matches('input:not([type=checkbox]):not([type=radio]), textarea, select');
/* 1.0: o item recém-lançado entra no fim da lista; a tela rola até ele, no movimento do Kit, e ele pisca uma vez */
let itemNovo = null;
function mostrarItemNovo() {
  if (!itemNovo || tab !== 'comanda') return;
  const id = itemNovo; itemNovo = null;
  requestAnimationFrame(() => {
    const el = $(`#view [data-item="${CSS.escape(id)}"]`); if (!el) return;
    const m = MV(), cab = $('.cu-cab')?.getBoundingClientRect().bottom || $('#barra')?.getBoundingClientRect().bottom || 0;
    const nav = $('.kf-nav'), fundo = nav && nav.getClientRects().length && nav.getBoundingClientRect().top > innerHeight / 2 ? nav.getBoundingClientRect().top : innerHeight;
    const r = el.getBoundingClientRect(), folga = 96; // espaço para o botão "+ Novo item" logo abaixo
    let alvo = null;
    if (r.bottom + folga > fundo) alvo = scrollY + r.bottom + folga - fundo;
    else if (r.top < cab + 8) alvo = scrollY + r.top - cab - 8;
    const piscar = () => { if (m.off) return; el.animate([{ backgroundColor: 'rgba(232,180,80,0)' }, { backgroundColor: 'rgba(232,180,80,.45)', offset: .25 }, { backgroundColor: 'rgba(232,180,80,0)' }], { duration: 1200, easing: 'ease-out' }); };
    if (alvo === null) return piscar();
    alvo = Math.max(0, Math.min(alvo, document.documentElement.scrollHeight - innerHeight));
    if (m.off) { scrollTo(0, alvo); return; }
    const s0 = scrollY, t0 = performance.now(), curva = window.KitFacil?.movimento?.curva || (t => t);
    const passo = agora => { const t = Math.min(1, (agora - t0) / m.ms); scrollTo(0, s0 + (alvo - s0) * curva(t)); if (t < 1) requestAnimationFrame(passo); else piscar(); };
    requestAnimationFrame(passo);
  });
}
/* campos: dinheiro, porcentagem e o comportamento comum (tocar no fundo recolhe o teclado, Enter num campo solto
   confirma, o valor é salvo ao sair do campo) vêm do Kit Fácil 0.7.0 (KitFacil.campo) */
KitFacil.campo.ligar();
const pctFmt = h => KitFacil.campo.porcento.formatar(h);
const pctInput = p => pctFmt(Math.round((p || 0) * 100));
const parsePct = s => KitFacil.campo.porcento.ler(s);
const prepFields = root => KitFacil.campo.preparar(root);

/* ---------- sugestões ao digitar: campo com sugestões do Kit (no lugar da lista do navegador) ---------- */
const fold = s => norm(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const lastPress = { target: null, at: 0 };
document.addEventListener('pointerdown', e => { lastPress.target = e.target; lastPress.at = Date.now(); }, true);
const attachSuggest = (input, getItems, onPick) => KitFacil.sugestoes(input, getItems, onPick);
/* Regra do Bruno (15/11/2026): caixa de texto NUNCA é selecionada sozinha, em janela ou fora dela. Quem seleciona é o
   toque da pessoa. O app só devolve o foco ao campo em que ela já estava digitando, quando a tela é redesenhada.
   Campo que falta preencher é apontado (contorno e aria-invalid), sem receber o foco; o aviso diz o que fazer. */
const apontar = el => KitFacil.apontar(el);   // do Kit desde o 0.8.0

/* ---------- toast & overlay ---------- */
/* avisos e janelas são os do Kit Fácil (iguais nos três apps); mesmos nomes e parâmetros do Elétrica e do Estudo.
   Os botões de ação ficam no pé da janela (foot). onClose roda quando a pessoa fecha (X, Esc, toque fora). */
function openSheet({ title, sub = '', body, foot = '', tall = false, wide = false, onMount, onClose }) {
  return KitFacil.dialogo.abrir({ titulo: title, sub, corpo: body, pe: foot, classe: [tall && 'kf-alto', wide && 'kf-largo'].filter(Boolean).join(' '),
    aoFechar: onClose, aoMontar: dlg => { prepFields(dlg); onMount && onMount(dlg); } });
}
function closeSheet(silent) { KitFacil.dialogo.fechar(silent); }
// confirmação do Kit (Código, Art. 65, VIII): o botão nomeia a ação
// todo botão de exclusão é vermelho; a confirmação que exclui, remove ou apaga já vem vermelha do Kit (0.8.0)
const confirmSheet = (title, text, okLabel, onOk, danger) => KitFacil.dialogo.confirmar({ titulo: title, texto: text, ok: okLabel, perigo: !!danger, aoConfirmar: onOk });

/* ---------- cupom ---------- */
function serviceLabel(b) { return b.service.mode === 'fixed' ? 'Serviço' : `Serviço (${pctStr(b.service.pct)}%)`; }
function lineDetail(l) {
  if (l.fq >= l.qty) return `${l.mode === 'units' ? l.units + ' de ' + l.qty + ' un.' : l.qty + ' un.'} · cortesia`;
  let s;
  if (l.mode === 'units') s = `${l.units} de ${l.qty} un. × ${BRL(l.price)}`;
  else {
    s = `${l.qty} × ${BRL(l.price)}`;
    if (l.uneq) s += ` · ${l.parts} de ${l.totalParts} partes`;
    else if (l.n > 1) s += ` ÷ ${l.n} pessoas`;
  }
  if (l.fq > 0 && l.freeShare > 0) s += ` · sua parte da cortesia (${l.fq} un.) −${BRL(l.freeShare)}`;
  return s;
}
// o que cada pessoa vai fazer: pagar ao local, passar a diferença para alguém ou receber
function planOf(c, pid) {
  const p = c.per[pid], name = id => c.per[id].person.name, L = [];
  if (p.paid > 0) L.push({ k: 'place', v: p.paid, t: c.payer === pid ? `paga a conta: ${BRL(p.paid)}` : `paga ${BRL(p.paid)} ao local` });
  c.transfers.filter(t => t.from === pid).forEach(t => L.push({ k: 'out', v: t.value, to: t.to, t: `paga ${BRL(t.value)} para ${name(t.to)}` }));
  c.transfers.filter(t => t.to === pid).forEach(t => L.push({ k: 'in', v: t.value, from: t.from, t: `recebe ${BRL(t.value)} de ${name(t.from)}` }));
  return L;
}
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
// pagamento no cupom: o que cada pessoa faz com o dinheiro, nas mesmas linhas de valor do cupom
function payRows(r, c) {
  const u = c.U && c.U[r.id]; if (!u) return [];
  const multi = u.members.length > 1, name = pid => c.per[pid].person.name, first = pid => name(pid).split(' ')[0];
  const debts = pixDebts(c).filter(x => x.unit === r.id);
  const rows = [];
  u.members.forEach(pid => planOf(c, pid).forEach(x => {
    const what = x.k === 'place' ? (c.payer === pid ? 'paga a conta' : 'paga ao local') : x.k === 'out' ? 'paga para ' + name(x.to) : 'recebe de ' + name(x.from);
    rows.push({ t: 'pair', left: multi ? first(pid) + ' ' + what : cap(what), right: BRL(x.v), tone: x.k === 'in' ? 'in' : '' });
    const k = x.k === 'out' && pixOf(name(x.to));
    if (k) rows.push({ t: 'detail', text: 'Pix: ' + pixBonita(k), qr: debts.length === 1 ? debts.find(z => z.pid === pid && z.toName === name(x.to)) : null });
  }));
  // quem só paga o próprio total ao local não precisa da seção: o TOTAL já diz tudo
  const plan = !multi && planOf(c, u.members[0]);
  if (plan && plan.length === 1 && plan[0].k === 'place' && c.payer !== u.members[0] && plan[0].v === r.total) return [];
  return rows;
}
// chave Pix guardada no cadastro da pessoa
const pixOf = name => (draft.demoPix && draft.demoPix[name]) || (catalog.people.find(p => norm(p.name) === norm(name))?.pix || '').trim();
// CPF com os dois dígitos de conferência certos (o Kit confere igual por dentro, mas não oferece a conta: Proposta 5)
function cpfValid(d) {
  d = String(d || ''); if (!/^\d{11}$/.test(d) || /^(\d)\1{10}$/.test(d)) return false;
  const dv = n => { let t = 0; for (let i = 0; i < n; i++) t += +d[i] * (n + 1 - i); const r = (t * 10) % 11; return r === 10 ? 0 : r; };
  return dv(9) === +d[9] && dv(10) === +d[10];
}
// 11 dígitos que valem como CPF e também parecem celular (DDD + 9): só a pessoa sabe
function pixAmbiguous(k) {
  k = String(k || '').trim(); const dig = k.replace(/\D/g, '');
  if (!k || k.includes('@') || k.startsWith('+') || /[().]/.test(k) || dig.length !== 11) return false;
  return cpfValid(dig) && dig[2] === '9' && +dig.slice(0, 2) >= 11;
}
// o que há de errado com a chave digitada ('' quando ela serve): o banco recusa o Pix de uma chave fora do formato
function pixErro(k) {
  k = String(k || '').trim(); if (!k) return '';
  if (k.includes('@')) return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(k) ? '' : 'E-mail incompleto. Confira a chave Pix.';
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(k)) return '';
  if (/[a-z]/i.test(k)) return 'Chave Pix inválida. Use CPF, celular com DDD, e-mail ou chave aleatória.';
  const dig = k.replace(/\D/g, ''), n = dig.length;
  if (k.startsWith('+')) return n >= 12 && n <= 13 ? '' : 'Celular incompleto. Digite o DDD e o número.';
  if (n === 14 || (n === 13 && dig.startsWith('55'))) return '';
  if (n === 8 || n === 9) return 'Falta o DDD. Digite o celular com o DDD.';
  if (n === 10) return '';
  if (n === 11) return cpfValid(dig) || (dig[2] === '9' && +dig.slice(0, 2) >= 11) ? '' : 'CPF inválido. Confira os números.';
  return 'Chave Pix inválida. Use CPF, celular com DDD, e-mail ou chave aleatória.';
}
// a chave como a pessoa lê: CPF com pontos, celular com DDD entre parênteses; e-mail e chave aleatória ficam como são
function pixBonita(k) {
  k = String(k || '').trim(); const dig = k.replace(/\D/g, '');
  if (/^\+55\d{10,11}$/.test(k)) { const t = dig.slice(2); return `(${t.slice(0, 2)}) ${t.slice(2, t.length - 4)}-${t.slice(-4)}`; }
  if (/^\d{11}$/.test(k)) return `${k.slice(0, 3)}.${k.slice(3, 6)}.${k.slice(6, 9)}-${k.slice(9)}`;
  if (/^\d{14}$/.test(k)) return `${k.slice(0, 2)}.${k.slice(2, 5)}.${k.slice(5, 8)}/${k.slice(8, 12)}-${k.slice(12)}`;
  return k;
}
// guarda a chave já no formato do Pix (CPF só dígitos, celular com +55); se não der para saber, pergunta
function savePixKey(name, key, done) {
  if (draft.isExample) { KitFacil.avisar('No exemplo, nada é salvo.'); return; }
  key = String(key || '').trim();
  const finish = k => { setPix(name, k); done && done(k); };
  if (!pixAmbiguous(key)) return finish(key ? normPixKey(key) : '');
  const dig = key.replace(/\D/g, '');
  openSheet({ title: 'Essa chave é CPF ou celular?', body: `<p class="hint" style="font-size:15px">O número ${esc(dig)} pode ser as duas coisas. Escolha o tipo da chave Pix de ${esc(name)}.</p>`,
    foot: `<button class="btn ghost" id="pk-cpf">CPF</button><button class="btn" id="pk-tel">Celular</button>`, onMount: s => {
    $('#pk-cpf', s).onclick = () => { closeSheet(true); finish(dig); };
    $('#pk-tel', s).onclick = () => { closeSheet(true); finish('+55' + dig); };
  } });
}
function setPix(name, key) {
  let p = catalog.people.find(x => norm(x.name) === norm(name));
  if (!p) { p = { name, last: Date.now() }; catalog.people.push(p); }
  p.pix = key.trim(); store.saveCatalog();
}
// Pix copia e cola (BR Code estático do Banco Central) com o valor já preenchido
// Pix copia e cola de cobrança (Kit: KitFacil.pix), com a chave do jeito que o Banco Central espera
const normPixKey = k => KitFacil.pix.chave(k);
const pixPayload = (key, name, amount) => KitFacil.pix.codigo({ chave: normPixKey(key), nome: name || 'RECEBEDOR', cidade: 'BRASIL', valor: amount });
// o que cada pessoa deve, para quem e com qual chave
function pixDebts(c) {
  return c.transfers.map(t => {
    const toName = c.per[t.to].person.name, key = pixOf(toName);
    return key ? { unit: c.unitOf[t.from], pid: t.from, value: t.value, toName, key } : null;
  }).filter(Boolean);
}
const qrMatrix = texto => KitFacil.pix.matriz(texto);
const drawQR = (...a) => KitFacil.pix.desenhar(...a);
// back: fechar volta para a janela de onde veio (cupom ou comanda do histórico)
const pixSheet = (debt, back) => KitFacil.pix.janela({ titulo: `Pix para ${debt.toName}`, sub: BRL(debt.value), codigo: pixPayload(debt.key, debt.toName, debt.value), aoFechar: back });
const couvertLabel = r => 'Couvert artístico' + (r.cvPayers > 1 ? ` (${r.cvPayers}×)` : '');
// o cupom é montado uma vez e desenhado igual na tela, na imagem, no PDF e no texto
function receiptRows(r, b, calc) {
  const p = r.person, R = [], add = (t, o = {}) => R.push({ t, ...o });
  add('brand', { text: 'CONTA FÁCIL' });
  add('center', { text: b.place || 'Comanda' });
  add('center', { text: fmtDateTime(b.closedAt || b.createdAt), tone: 'muted' });
  add('dash');
  add('who', { text: p.name });
  if (r.members && r.members.length > 1) add('center', { text: `Cupom compartilhado · ${r.members.length} pessoas`, tone: 'muted', small: true });
  add('dash');
  if (!r.lines.length) add('note', { text: 'Nenhum item consumido' });
  r.lines.forEach((l, i) => {
    if (l.header) { if (i) add('gap', { h: 6 }); add('sub', { left: l.header, right: BRL(l.value) }); return; }
    add('pair', { left: l.name, right: BRL(l.value) });
    add('detail', { text: lineDetail(l) });
    add('gap', { h: 5 });
  });
  add('dash');
  add('pair', { left: 'Consumo', right: BRL(r.gross) });
  const ds = r.discount > 0 ? () => add('pair', { left: 'Desconto' + (b.discount.at === 'after' ? ' (sobre o total)' : ''), right: '−' + BRL(r.discount) }) : null;
  if (ds && b.discount.at !== 'after') ds();
  if (b.service.enabled) {
    if (!p.payService) add('pair', { left: serviceLabel(b) + ' · não paga', right: BRL(0), tone: 'muted' });
    else {
      add('pair', { left: serviceLabel(b), right: BRL(r.service) });
      const extra = r.service - r.serviceNominal; if (extra > 0) add('detail', { text: `inclui ${BRL(extra)} redistribuídos` });
    }
  }
  if (b.couvert.enabled) add('pair', p.payCouvert ? { left: couvertLabel(r), right: BRL(r.couvert) } : { left: 'Couvert · não paga', right: BRL(0), tone: 'muted' });
  if (ds && b.discount.at === 'after') ds();
  add('total', { left: 'TOTAL', right: BRL(r.total) });
  const pay = payRows(r, calc);
  if (pay.length) { add('section', { text: 'PAGAMENTO' }); pay.forEach(x => R.push(x)); }
  add('foot', { text: `Total da comanda: ${BRL(calc.total)} · ${plural(b.people.length, 'pessoa', 'pessoas')}` });
  return R;
}
function receiptHTML(r, b, calc, rows0) {
  const body = (rows0 || receiptRows(r, b, calc)).map(x => {
    const tone = x.tone ? ' rc-' + x.tone : '';
    switch (x.t) {
      case 'brand': return `<div class="rc-brand">${esc(x.text)}</div>`;
      case 'center': return `<div class="rc-center${tone}${x.small ? ' rc-small' : ''}">${esc(x.text)}</div>`;
      case 'who': return `<div class="rc-who">${esc(x.text)}</div>`;
      case 'dash': return '<hr>';
      case 'gap': return `<div style="height:${x.h}px"></div>`;
      case 'note': return `<div class="rc-muted">${esc(x.text)}</div>`;
      case 'sub': return `<div class="rc-line rc-sub"><span>${esc(x.left)}</span><span>${esc(x.right)}</span></div>`;
      case 'pair': return `<div class="rc-line${tone}"><span>${esc(x.left)}</span><span>${esc(x.right)}</span></div>`;
      case 'detail': return `<div class="rc-detail">${esc(x.text)}</div>`;
      case 'total': return `<div class="rc-line rc-total"><span>${esc(x.left)}</span><span>${esc(x.right)}</span></div>`;
      case 'section': return `<div class="rc-section">${esc(x.text)}</div>`;
      case 'foot': return `<div class="rc-foot">${esc(x.text)}</div>`;
    }
    return '';
  }).join('');
  return `<div class="receipt">${body}</div>`;
}
function receiptText(r, b, calc, rows0) {
  const W = 34, pad = (a, z) => { a = String(a); z = String(z); return a + ' '.repeat(Math.max(1, W - a.length - z.length)) + z; };
  const L = [];
  (rows0 || receiptRows(r, b, calc)).forEach(x => {
    switch (x.t) {
      case 'brand': case 'center': L.push(x.text); break;
      case 'foot': L.push('', x.text); break;
      case 'who': L.push('Cupom de: ' + x.text); break;
      case 'dash': L.push('-'.repeat(W)); break;
      case 'note': L.push(x.text); break;
      case 'sub': if (!L[L.length - 1].startsWith('---')) L.push(''); L.push(pad(x.left.toUpperCase().slice(0, W - 12), x.right)); break;
      case 'pair': {
        const room = W - x.right.length - 1;
        if (x.left.length <= room) L.push(pad(x.left, x.right));
        else { L.push(x.left); L.push(pad('', x.right)); }
        break;
      }
      case 'detail': L.push('  ' + x.text); break;
      case 'total': L.push('='.repeat(W), pad(x.left, x.right)); break;
      case 'section': { const t = ' ' + x.text + ' ', l = Math.floor((W - t.length) / 2); L.push('', '-'.repeat(l) + t + '-'.repeat(W - l - t.length)); break; }
    }
  });
  if (r) pixDebts(calc).filter(x => x.unit === r.id).forEach(x => L.push('', `Pix copia e cola (${calc.per[x.pid].person.name}, ${BRL(x.value)}):`, pixPayload(x.key, x.toName, x.value)));
  return L.join('\n');
}
async function copyText(text, okMsg) {
  try { await navigator.clipboard.writeText(text); KitFacil.avisar(okMsg); return; } catch {}
  openSheet({ title: 'Copiar', body: `<textarea id="cp" readonly style="width:100%;min-height:220px;font-family:var(--f-mono);font-size:12.5px;background:var(--surface);color:var(--ink);border:1px solid var(--line);border-radius:10px;padding:10px">${esc(text)}</textarea><p class="hint">Toque e segure no texto e escolha Copiar.</p>`,
    foot: `<button class="btn" id="cp-x">Fechar</button>`, onMount: s => { $('#cp-x', s).onclick = () => closeSheet(); } });
}

/* ---------- render ---------- */
// o elemento tocado fica parado na tela quando algo acima dele muda de tamanho (o Safari não faz isso sozinho)
function anchorKey(el) {
  for (let x = el; x && x.id !== 'view'; x = x.parentElement) {
    if (x.dataset?.item) return `[data-item="${CSS.escape(x.dataset.item)}"]`;
    if (x.dataset?.unit) return `[data-unit="${CSS.escape(x.dataset.unit)}"]`;
    if (x.id) return '#' + CSS.escape(x.id);
  }
  return null;
}
function renderSync() { KitFacil.topo.atualizar(); }
/* ---------- aba Comanda ---------- */
let liveWho = false; // lista "Quem é você?" aberta depois de já ter escolhido
function liveCardHTML() {
  if (!draft.live) {
    if (!store.db && !draft.isExample) return '';
    return `<div class="card ex-card" id="live-offer">
      <div class="ex-head"><span class="ex-icon lo-icon">${I.live}</span><span><b>Comanda ao vivo</b></span></div>
      <button class="btn small" id="live-start">${I.share}Compartilhar com a turma</button></div>`;
  }
  const me = live.me(), mePerson = draft.people.find(p => p.id === me);
  const connected = !!live.unsub, closed = live.closed, host = draft.live.host && !closed;
  const st = closed ? ['warn', 'Encerrada'] : connected ? ['on', 'Ao vivo'] : !store.ready ? ['', 'Conectando…'] : ['warn', 'Sem conexão'];
  let who = '';
  if (!closed && draft.people.length) {
    who = mePerson && !liveWho
      ? `<div class="lp-me">${avatar(mePerson.name)}<span>Você é <b>${esc(mePerson.name)}</b></span><button class="lp-link" id="live-who">Trocar</button></div>`
      : `<div class="lp-who"><span class="lp-label">Quem é você?</span>
        <div class="ck-list">${draft.people.map(p => ckRow(`data-me="${p.id}"`, p.name, me === p.id)).join('')}</div></div>`;
  }
  const main = closed ? '' : connected ? `<button class="btn mustard" id="live-invite">${I.share}Convidar</button>`
    : store.ready ? `<button class="btn mustard" id="live-reconnect">${I.refresh}Reconectar</button>` : '';
  return `<section class="live-panel" id="live-card" data-kf-morf="live-card" aria-label="Comanda ao vivo">
    <div class="lp-head">
      <span class="lp-status ${st[0]}"><span class="lp-dot" aria-hidden="true"></span>${st[1]}</span>
      ${closed ? '' : `<button class="lp-code" id="live-code" aria-label="Código ${esc(draft.live.code.split('').join(' '))}. Mostrar convite">${esc(codeShort(draft.live.code))}${I.qr}</button>`}
    </div>
    ${closed ? '<p class="lp-msg">Quem criou encerrou a comanda ao vivo. Os dados continuam aqui para vocês fecharem a conta.</p>' : `<div class="lp-online" id="live-online">${presenceHTML()}</div>`}
    ${who}
    <div class="lp-actions ${main ? '' : 'one'}">${main}<button class="btn lp-ghost" id="live-end">${host ? 'Encerrar' : 'Sair'}</button></div>
  </section>`;
}

/* ---------- uso derivado do histórico (contagens sempre batem com as contas salvas) ---------- */
const placeKey = s => norm(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ');
function usage() {
  const people = {}, products = {}, places = {};
  bills.forEach(b => {
    const pk = placeKey(b.place);
    if (pk) { const pl = places[pk] = places[pk] || { name: (b.place || '').trim(), n: 0, last: 0 }; pl.n++; if (b.closedAt > pl.last) { pl.last = b.closedAt; pl.name = b.place.trim(); } }
    new Set(b.people.map(p => norm(p.name))).forEach(k => people[k] = (people[k] || 0) + 1);
    new Set(b.items.map(i => norm(i.name))).forEach(k => products[k] = (products[k] || 0) + 1);
  });
  return { people, products, places };
}
const recentPlaces = (U = usage()) => Object.values(U.places).sort((a, b) => b.last - a.last);

/* ---------- preço por local ---------- */
function findProduct(name) { return catalog.products.find(p => norm(p.name) === norm(name)); }
function priceInfo(prod, place) {
  if (!prod) return null;
  const pk = placeKey(place), prices = prod.prices || {};
  if (pk && prices[pk]) return { price: prices[pk].price, here: true, where: prices[pk].place };
  const others = Object.values(prices).sort((a, b) => (b.last || 0) - (a.last || 0));
  if (others.length) return { price: others[0].price, here: false, where: others[0].place };
  return prod.price ? { price: prod.price, here: false, where: '' } : null;
}
function rememberPrice(name, price, place, when) {
  let k = findProduct(name);
  if (!k) { k = { name, price, prices: {}, last: when }; catalog.products.push(k); }
  k.prices = k.prices || {};
  k.price = price; k.last = when;
  const pk = placeKey(place);
  if (pk) k.prices[pk] = { place: place.trim(), price, last: when };
}

// preenche preços por local que faltam, usando as comandas já salvas (comandas antigas não guardavam o local do preço)
function backfillPrices() {
  let changed = false;
  [...bills].sort((a, b) => (a.closedAt || 0) - (b.closedAt || 0)).forEach(b => {
    const pk = placeKey(b.place); if (!pk) return;
    (b.items || []).forEach(it => {
      const k = findProduct(it.name); if (!k) return;
      k.prices = k.prices || {};
      const e = k.prices[pk];
      if (!e) { k.prices[pk] = { place: b.place.trim(), price: it.price, last: b.closedAt }; changed = true; }
      else if (!e.edited && (e.last || 0) < b.closedAt && e.price !== it.price) { e.price = it.price; e.last = b.closedAt; changed = true; }
    });
  });
  return changed;
}

// o que existe nas comandas salvas e não está nos cadastros
function historyCatalog() {
  const prods = {}, ppl = {};
  [...bills].sort((a, b) => (a.closedAt || 0) - (b.closedAt || 0)).forEach(b => {
    const pk = placeKey(b.place);
    (b.items || []).forEach(it => {
      const k = norm(it.name);
      const p = prods[k] = prods[k] || { name: it.name.trim(), price: it.price, last: 0, prices: {} };
      p.price = it.price; p.last = b.closedAt || 0; p.name = it.name.trim();
      if (pk) p.prices[pk] = { place: b.place.trim(), price: it.price, last: b.closedAt || 0 };
    });
    (b.people || []).forEach(x => { const k = norm(x.name); ppl[k] = { name: x.name.trim(), last: b.closedAt || 0 }; });
  });
  const missingProducts = Object.values(prods).filter(p => !findProduct(p.name)).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  const missingPeople = Object.values(ppl).filter(p => !catalog.people.some(x => norm(x.name) === norm(p.name))).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  return { missingProducts, missingPeople };
}
function recoverSheet() {
  const { missingProducts: mp, missingPeople: mu } = historyCatalog();
  const priceList = p => Object.values(p.prices).sort((a, b) => b.last - a.last).map(e => `${e.place} ${BRL(e.price)}`).join(' · ') || BRL(p.price);
  openSheet({ title: 'Recuperar do histórico', body: `${mp.length ? `<div class="card-head"><span class="eyebrow">Produtos (${mp.length})</span><button class="btn small ghost" data-all="rp">Marcar todos</button></div>
      <div class="rec-list">${mp.map((p, i) => `<label class="rec-row"><input type="checkbox" data-rp="${i}" checked><span><b>${esc(p.name)}</b><small>${esc(priceList(p))}</small></span></label>`).join('')}</div>` : ''}
    ${mu.length ? `<div class="card-head"><span class="eyebrow">Pessoas (${mu.length})</span><button class="btn small ghost" data-all="ru">Marcar todos</button></div>
      <div class="rec-list">${mu.map((p, i) => `<label class="rec-row"><input type="checkbox" data-ru="${i}" checked><span><b>${esc(p.name)}</b></span></label>`).join('')}</div>` : ''}
`,
    foot: `<button class="btn ghost" id="rc-no">Cancelar</button><button class="btn" id="rc-ok">Recuperar selecionados</button>`, onMount: s => {
    $('#rc-no', s).onclick = () => closeSheet();
    $$('[data-all]', s).forEach(b => b.onclick = () => { const boxes = $$(`[data-${b.dataset.all}]`, s); const on = !boxes.every(x => x.checked); boxes.forEach(x => x.checked = on); });
    $('#rc-ok', s).onclick = () => {
      const pick = $$('[data-rp]', s).filter(x => x.checked).map(x => mp[+x.dataset.rp]);
      const pickU = $$('[data-ru]', s).filter(x => x.checked).map(x => mu[+x.dataset.ru]);
      if (!pick.length && !pickU.length) { KitFacil.avisar('Marque ao menos um item para recuperar.'); return; }
      pick.forEach(p => catalog.products.push(clone(p)));
      pickU.forEach(p => catalog.people.push({ name: p.name, last: p.last }));
      store.saveCatalog(); closeSheet(true); render();
      KitFacil.avisar(`Recuperado: ${[pick.length ? plural(pick.length, 'produto', 'produtos') : '', pickU.length ? plural(pickU.length, 'pessoa', 'pessoas') : ''].filter(Boolean).join(' e ')}.`);
    };
  } });
}

/* ---------- cupom como imagem e PDF ---------- */
// no iPhone o arquivo vai para o menu de compartilhar (WhatsApp, Salvar em Arquivos, Fotos)
let pendingFile = null;
const fileSaver = {
  async save({ filename, data }) {
    const file = new File([data], filename, { type: data.type || 'application/octet-stream' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file] }); return; }
      catch (e) {
        if (e && e.name === 'AbortError') { const x = new Error('declined'); x.code = 'declined'; throw x; }
        // o iPhone só abre o menu logo depois de um toque; se demorou, oferece um toque novo com o arquivo já pronto
        if (e && e.name === 'NotAllowedError') { pendingFile = file; const x = new Error('again'); x.code = 'again'; throw x; }
        throw e;
      }
    }
    const a = document.createElement('a'); a.href = URL.createObjectURL(data); a.download = filename;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  },
};
async function downloadsNS() { return fileSaver; }
const slug = s => placeKey(s || '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'conta';
async function receiptCanvas(r, b, calc, rows0) {
  try { await Promise.all(['400 24px "IBM Plex Mono"', '600 24px "IBM Plex Mono"', '800 36px "Atkinson Hyperlegible Next"'].map(f => document.fonts.load(f))); } catch {}
  const S = 2, M = 16 * S, W = 340 * S, PX = 20 * S, IW = W - PX * 2;
  // tinta única, como uma impressora térmica
  const C = { bg: '#EAF0EA', paper: '#FFFDF5', ink: '#1A1915' };
  const mono = (w, px) => `${w} ${px * S}px "IBM Plex Mono", ui-monospace, Menlo, Consolas, monospace`;
  const disp = px => `800 ${px * S}px "Atkinson Hyperlegible Next", system-ui, sans-serif`;
  const rows = rows0 ? [...rows0] : receiptRows(r, b, calc);
  // QR code do Pix logo abaixo da chave, quando o cupom tem um Pix só
  for (let i = rows.length - 1; i >= 0; i--) {
    const q = rows[i].qr;
    if (q) { try { rows.splice(i + 1, 0, { t: 'qr', m: await qrMatrix(pixPayload(q.key, q.toName, q.value)), label: `Pix de ${BRL(q.value)} para ${q.toName}` }); } catch {} }
  }
  const look = {
    brand: { font: mono(600, 14), lh: 22, align: 'center' },
    center: { font: mono(400, 12.5), lh: 18, align: 'center' },
    small: { font: mono(400, 11), lh: 16, align: 'center' },
    who: { font: disp(20), lh: 30, align: 'center' },
    note: { font: mono(400, 12.5), lh: 18 },
    detail: { font: mono(400, 11), lh: 15, indent: 8 },
    foot: { font: mono(400, 11), lh: 16, align: 'center' },
    pair: { font: mono(400, 12.5), lh: 19 },
    sub: { font: mono(600, 13), lh: 20 },
    total: { font: mono(600, 16), lh: 26 },
  };
  const toneColor = () => null;
  const wrap = (ctx, text, maxW) => {
    const out = []; let cur = '';
    String(text).split(' ').forEach(w => { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > maxW && cur) { out.push(cur); cur = w; } else cur = t; });
    if (cur) out.push(cur); return out.length ? out : [''];
  };
  const line = (ctx, x0, x1, y, dashed, width, color) => { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = width * S; if (dashed) ctx.setLineDash([4 * S, 3 * S]); ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); ctx.restore(); };
  const pass = (ctx, draw) => {
    let y = M + 22 * S;
    rows.forEach(row => {
      if (row.t === 'gap') { y += row.h * S; return; }
      if (row.t === 'dash') { y += 6 * S; if (draw) line(ctx, M + PX, M + PX + IW, y, true, 1, C.ink); y += 8 * S; return; }
      if (row.t === 'section') {
        y += 20 * S; ctx.font = mono(600, 11);
        // letras espaçadas como na tela (0,16em), desenhadas uma a uma
        const sp = 11 * .16 * S, chars = [...row.text], ws = chars.map(ch => ctx.measureText(ch).width);
        const tw = ws.reduce((a, w) => a + w, 0) + sp * (chars.length - 1), cx = M + W / 2;
        if (draw) {
          ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
          let x = cx - tw / 2; chars.forEach((ch, i) => { ctx.fillText(ch, x, y); x += ws[i] + sp; });
          line(ctx, M + PX, cx - tw / 2 - 8 * S, y, true, 1, C.ink); line(ctx, cx + tw / 2 + 8 * S, M + PX + IW, y, true, 1, C.ink);
        }
        y += 10 * S; return;
      }
      if (row.t === 'qr') {
        y += 10 * S; const size = 150 * S;
        if (draw) drawQR(ctx, row.m, M + (W - size) / 2, y, size, C.paper, C.ink);
        y += size + 4 * S; ctx.font = mono(400, 11);
        if (draw) { ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillText(row.label, M + W / 2, y + 12 * S); }
        y += 18 * S; return;
      }
      const lk = look[row.t === 'center' && row.small ? 'small' : row.t]; if (!lk) return;
      if (row.t === 'foot') y += 8 * S;
      if (row.t === 'total') { y += 6 * S; if (draw) line(ctx, M + PX, M + PX + IW, y, false, 2, C.ink); y += 4 * S; }
      ctx.font = lk.font; ctx.textBaseline = 'alphabetic';
      const color = toneColor(row.tone) || lk.color || C.ink;
      if (row.left !== undefined) {
        const rw = ctx.measureText(row.right).width;
        wrap(ctx, row.left, IW - rw - 12 * S).forEach((t, i) => {
          y += lk.lh * S;
          if (draw) {
            ctx.fillStyle = color; ctx.textAlign = 'left'; ctx.fillText(t, M + PX, y - 4 * S);
            if (!i) { ctx.textAlign = 'right'; ctx.fillText(row.right, M + PX + IW, y - 4 * S); }
          }
        });
        return;
      }
      const ind = (lk.indent || 0) * S;
      wrap(ctx, row.text, IW - ind).forEach(t => {
        y += lk.lh * S;
        if (draw) { ctx.fillStyle = color; ctx.textAlign = lk.align === 'center' ? 'center' : 'left'; ctx.fillText(t, lk.align === 'center' ? M + W / 2 : M + PX + ind, y - 4 * S); }
      });
    });
    return y + 26 * S + M;
  };
  const measure = document.createElement('canvas').getContext('2d');
  const H = pass(measure, false);
  const cv = document.createElement('canvas'); cv.width = W + M * 2; cv.height = H;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, cv.width, cv.height);
  // papel com borda serrilhada, como cupom de impressora térmica
  const z = 6 * S, x0 = M, x1 = M + W, y0 = M, y1 = H - M;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.12)'; ctx.shadowBlur = 10 * S; ctx.shadowOffsetY = 2 * S;
  ctx.beginPath(); ctx.moveTo(x0, y0 + z);
  for (let x = x0; x < x1; x += z * 2) { ctx.lineTo(x + z, y0); ctx.lineTo(Math.min(x + z * 2, x1), y0 + z); }
  ctx.lineTo(x1, y1 - z);
  for (let x = x1; x > x0; x -= z * 2) { ctx.lineTo(x - z, y1); ctx.lineTo(Math.max(x - z * 2, x0), y1 - z); }
  ctx.closePath(); ctx.fillStyle = C.paper; ctx.fill(); ctx.restore();
  pass(ctx, true);
  return cv;
}
const canvasBlob = cv => new Promise(res => cv.toBlob(res, 'image/png'));
let jsPDFReady;
function loadJsPDF() {
  if (window.jspdf?.jsPDF) return Promise.resolve(window.jspdf.jsPDF);
  if (!jsPDFReady) jsPDFReady = new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    s.crossOrigin = 'anonymous'; s.integrity = 'sha384-JcnsjUPPylna1s1fvi1u12X5qjY5OL56iySh75FdtrwhO/SWXgMjoVqcKyIIWOLk'; // impressão digital (SRI)
    s.onload = () => window.jspdf?.jsPDF ? res(window.jspdf.jsPDF) : rej(new Error('jspdf'));
    s.onerror = () => { jsPDFReady = null; rej(new Error('jspdf')); };
    document.head.appendChild(s);
  });
  return jsPDFReady;
}
async function canvasesToPDF(cvs) {
  const JsPDF = await loadJsPDF();
  let doc;
  cvs.forEach((cv, i) => {
    const w = cv.width / 2 * 0.75, h = cv.height / 2 * 0.75, o = h >= w ? 'p' : 'l';
    if (!i) doc = new JsPDF({ unit: 'pt', format: [w, h], orientation: o });
    else doc.addPage([w, h], o);
    // 'FAST' compacta a imagem dentro do PDF, sem perder qualidade; sem isso cada ponto ocupa 4 bytes (um cupom passava de 2 MB)
    doc.addImage(cv.toDataURL('image/png'), 'PNG', 0, 0, w, h, undefined, 'FAST');
  });
  return doc.output('blob');
}
async function saveFile(filename, blob) {
  const dl = await downloadsNS();
  if (!dl) { KitFacil.avisar('Salvar arquivo não está disponível aqui. Toque e segure a imagem para salvar.'); return false; }
  try { await dl.save({ filename, data: blob }); return true; }
  catch (e) {
    if (e?.code === 'declined') return false;
    if (e?.code === 'again') KitFacil.avisar('Arquivo pronto.', { label: 'Compartilhar', run: () => { const f = pendingFile; pendingFile = null; if (f) navigator.share({ files: [f] }).catch(() => {}); } });
    else KitFacil.avisar('Não foi possível gerar o arquivo agora.');
    return false;
  }
}
async function shareReceipt(r, b, calc, back) {
  loadJsPDF().catch(() => {});
  const dlg = openSheet({ title: `Cupom de ${r.person.name}`, onClose: back, body: `<div class="share-prev"><span class="hint">Gerando imagem…</span></div>` });
  const cv = await receiptCanvas(r, b, calc);
  const url = cv.toDataURL('image/png');
  const dl = await downloadsNS();
  const name = `cupom-${slug(r.person.name.replace(/ \+ /g, ' e '))}-${slug(b.place)}`;
  const s = dlg.isConnected && $('.kf-dlg-corpo', dlg); if (!s) return;
  $('.share-prev', s).innerHTML = `<img src="${url}" alt="Cupom de ${esc(r.person.name)}">`;
  s.insertAdjacentHTML('beforeend', `
    <div class="share-actions">
      <button class="share-btn" id="sr-txt">${I.copy}<span>Copiar texto</span></button>
      <button class="share-btn" id="sr-pdf">${I.file}<span>PDF</span></button>
      <button class="share-btn" id="sr-png">${I.image}<span>Imagem</span></button>
    </div>
    ${(() => { const ds = pixDebts(calc).filter(x => x.unit === r.id); return ds.map(x => `<button class="btn ghost" data-pixpay="${x.pid}">Pix copia e cola de ${esc(calc.per[x.pid].person.name.split(' ')[0])} · ${BRL(x.value)}</button>`).join(''); })()}`);
  $$('[data-pixpay]', s).forEach(x => x.onclick = () => { const dbt = pixDebts(calc).find(z => z.pid === x.dataset.pixpay); if (dbt) pixSheet(dbt, () => shareReceipt(r, b, calc, back)); });
  $('#sr-txt', s).onclick = () => copyText(receiptText(r, b, calc), 'Cupom copiado.');
  $('#sr-png', s)?.addEventListener('click', async () => saveFile(name + '.png', await canvasBlob(cv)));
  $('#sr-pdf', s)?.addEventListener('click', async e => {
    const btn = e.currentTarget; btn.disabled = true;
    try { await saveFile(name + '.pdf', await canvasesToPDF([cv])); } catch { KitFacil.avisar('Não foi possível gerar o PDF agora.'); }
    btn.disabled = false;
  });
}
async function shareAllPDF(b, calc, btn) {
  if (!(await downloadsNS())) { KitFacil.avisar('Salvar arquivo não está disponível aqui. Use Compartilhar em cada cupom.'); return; }
  if (btn) btn.disabled = true;
  try {
    const cvs = []; for (const u of calc.units) cvs.push(await receiptCanvas(u, b, calc));
    await saveFile(`cupons-${slug(b.place)}.pdf`, await canvasesToPDF(cvs));
  } catch { KitFacil.avisar('Não foi possível gerar o PDF agora.'); }
  if (btn) btn.disabled = false;
}

/* ---------- limpar e recomeçar ---------- */
function confirmReplace(go) {
  if (draft.isExample) exitExample();
  if (!draft.active) return go();
  const where = draft.place ? ` em ${draft.place}` : '';
  const text = draft.savedAt
    ? `Você está editando a comanda${where}, que já está no histórico. Alterações ainda não salvas serão perdidas; a versão do histórico continua.`
    : `A comanda${where} está em andamento e ainda não foi salva no histórico. Ela será descartada.`;
  confirmSheet('Substituir a comanda em andamento?', text, 'Substituir', go, true);
}
// excluir a comanda aberta (com Desfazer); se ela já estiver no histórico, sai de lá também
function deleteCurrent(ask) {
  if (draft.isExample) { exitExample(); tab = 'inicio'; render(); return; }
  const d = draft;
  const inHistory = bills.some(b => b.id === d.id);
  const go = () => {
    closeSheet(); pending = {};
    if (draft.live) live.end();
    const backup = { draft: clone(draft), bill: bills.find(b => b.id === d.id) || null };
    if (backup.bill) { bills = bills.filter(b => b.id !== d.id); store.deleteBill(d.id); }
    draft = blankDraft(); tab = 'inicio'; saveDraft(); render(); window.scrollTo({ top: 0 });
    KitFacil.avisar('Comanda excluída.', { label: 'Desfazer', run: () => {
      draft = migrate(backup.draft); draft.active = true; draft.live = null;
      if (backup.bill) { bills = [backup.bill, ...bills].sort((a, b) => b.closedAt - a.closedAt); store.saveBill(backup.bill); }
      tab = 'comanda'; saveDraft(); render(); window.scrollTo({ top: 0 });
    } });
  };
  if (inHistory) confirmSheet('Excluir também do histórico?', `A comanda de ${d.place || 'local sem nome'} sai do histórico e das estatísticas.`, 'Excluir', go, true);
  else if (ask) confirmSheet('Excluir esta comanda?', `A comanda${d.place ? ' de ' + d.place : ''} será descartada. Você pode desfazer logo em seguida.`, 'Excluir', go, true);
  else go();
}
function newBillAt(place, people) {
  const go = () => {
    if (draft.live) live.end();
    pending = {};
    draft = blankDraft(); draft.place = place || ''; draft.active = true;
    if (people) draft.people = people.map(n => newPerson(n));
    tab = 'comanda'; commit(); window.scrollTo({ top: 0 });
  };
  confirmReplace(go);
}

/* ---------- aba Início ---------- */
let pending = {};
function pendingDirty(it) { const p = pending[it.id]; if (!p) return false; return p.qty !== it.qty || JSON.stringify(Object.entries(p.a).filter(([, v]) => v > 0).sort()) !== JSON.stringify(Object.entries(it.a).filter(([, v]) => v > 0).sort()); }

// item selecionado: mostra Alterar e Remover
function renameSheet(it) { return produtoSheet(null, it); }
// 1.0: a divisão do item fica na mesma janela do produto (uma janela só para lançar)
function divisaoHTML(d) {
  return `<div class="field"><span class="eyebrow">Tipo de consumo</span><span id="lc-modo"></span></div>
      <div id="lc-lista" data-kf-morf="lc-lista"></div>
      <p class="share" id="lc-resumo" role="status" style="margin:0"></p>
      <p class="hint lc-pagou" id="lc-pagou" role="status" hidden></p>`;
}
function divisaoLigar(s, d, getIt, setQty, ini) {
  let modo = ini ? (ini.mode === 'units' ? 'units' : 'equal') : 'equal', tocou = false;
  const ids = d.people.map(p => p.id);
  // quem já pagou a conta fica fora de um item novo, a menos que alguém marque: o pagamento dessa pessoa não muda sem querer
  // quem já pagou e saiu da mesa fica travado: não entra em item novo e não muda nos que já tem
  const fora = id => saiu(d, id), aqui = ids.filter(id => !fora(id));
  const pagou = id => !!(d.pagos && d.pagos[id]), semPagos = aqui.filter(id => !pagou(id)), novos = !ini && semPagos.length && semPagos.length < ids.length ? semPagos : aqui;
  const todosMarcados = () => aqui.length > 0 && aqui.every(id => marcados.has(id));
  const nomeDe = id => d.people.find(p => p.id === id).name;
  const marcados = new Set(ini && ini.mode !== 'units' ? (ids.filter(id => (ini.a[id] || 0) > 0).length ? ids.filter(id => (ini.a[id] || 0) > 0) : ids) : novos), un = {};
  if (ini && ini.mode === 'units') ids.forEach(id => { if (ini.a[id] > 0) un[id] = ini.a[id]; });
  const soma = () => Object.values(un).reduce((a, b) => a + b, 0);
  const falta = () => getIt().qty - soma();
  const segModo = () => `<div class="seg" role="group" aria-label="Tipo de consumo">
      <button type="button" data-lc-modo="equal" aria-pressed="${modo === 'equal'}">Compartilhado</button>
      <button type="button" data-lc-modo="units" aria-pressed="${modo === 'units'}">Individual</button></div>`;
  const listaComp = () => `<div class="ck-list" role="group" aria-label="Quem dividiu">${d.people.map(p => ckRow(`data-lc-ck="${p.id}"${fora(p.id) ? ' disabled' : ''}`, p.name, marcados.has(p.id), fora(p.id) ? 'ck-saiu' : pagou(p.id) ? 'ck-pagou' : '')).join('')}
      <button type="button" class="ck-row ck-todos" data-lc-todos></button></div>`;
  const listaInd = () => `<div class="units">${d.people.map(p => `
      <div class="unit-row" data-lc-linha="${p.id}"><span class="who-name">${avatar(p.name)}<span>${esc(p.name)}</span></span>
        <span class="unit-count"><span class="num" data-lc-n="${p.id}">0</span></span>
        <span class="unit-btns"><button type="button" class="minus" data-lc-un="${p.id}" data-dir="-1" aria-label="−1: uma unidade a menos para ${esc(p.name)}">−1</button><button type="button" class="plus" data-lc-un="${p.id}" data-dir="1" ${fora(p.id) ? 'disabled' : ''} aria-label="+1: uma unidade a mais para ${esc(p.name)}">+1</button></span></div>`).join('')}</div>`;
  const pronto = () => modo === 'units' ? falta() === 0 : marcados.size > 0;
  const resumo = () => {
    const it = getIt(), total = (it.price || 0) * it.qty;
    if (modo === 'units') { const f = falta(); return f === 0 ? `${it.qty} de ${it.qty} ${it.qty === 1 ? 'distribuída' : 'distribuídas'}.` : f < 0 ? 'Há mais unidades distribuídas que a quantidade.' : `Faltam ${plural(f, 'unidade', 'unidades')} (${soma()} de ${it.qty}).`; }
    const n = marcados.size;
    if (!n) return 'Marque quem dividiu.';
    if (n === 1) return `Só ${esc(d.people.find(p => marcados.has(p.id)).name)} marcado: vira consumo individual.`;
    const quem = todosMarcados() ? 'Entre todos' : `Entre ${n}`;
    return total ? `${quem} · ${BRL(Math.round(total / n))} cada` : quem;
  };
  const atualizar = () => {
    if (modo === 'units') {
      const f = falta();
      d.people.forEach(p => {
        const u = un[p.id] || 0;
        $(`[data-lc-n="${p.id}"]`, s).textContent = u;
        $(`[data-lc-linha="${p.id}"]`, s).classList.toggle('on', u > 0);
        $(`[data-lc-un="${p.id}"][data-dir="-1"]`, s).disabled = !u || fora(p.id);
      });
    } else {
      $$('[data-lc-ck]', s).forEach(b => b.setAttribute('aria-pressed', String(marcados.has(b.dataset.lcCk))));
      const t = $('[data-lc-todos]', s); if (t) { t.hidden = aqui.length < 2; t.textContent = todosMarcados() ? 'Desmarcar todos' : 'Marcar todos'; }
    }
    $('#lc-resumo', s).innerHTML = resumo();
    const aviso = $('#lc-pagou', s);
    if (aviso) {
      // quem saiu da mesa já aparece travado na lista; o aviso fala só de quem pagou e continua na mesa
      const pg = aqui.filter(pagou), dentro = pg.filter(id => modo === 'units' ? (un[id] || 0) > 0 : marcados.has(id)), lista = L => L.map(nomeDe).join(', ');
      aviso.hidden = !pg.length || !!ini;
      aviso.textContent = !pg.length ? '' : dentro.length ? `${lista(dentro)} já ${dentro.length > 1 ? 'pagaram' : 'pagou'}: com este item, ${dentro.length > 1 ? 'voltam' : 'volta'} a dever a diferença.` : `${lista(pg)} já ${pg.length > 1 ? 'pagaram e ficaram' : 'pagou e ficou'} de fora. Marque se também ${pg.length > 1 ? 'consumiram' : 'consumiu'}.`;
    }
  };
  const trocarModo = m => {
    if (m === modo) return;
    modo = m; $('#lc-modo', s).innerHTML = segModo();
    comMovimento($('#lc-lista', s).parentElement, () => {
      $('#lc-lista', s).innerHTML = modo === 'units' ? listaInd() : listaComp();
      if (modo === 'units' && getIt().qty === 1 && marcados.size === 1) un[[...marcados][0]] = 1;
      atualizar();
    });
  };
  $('#lc-modo', s).innerHTML = segModo(); $('#lc-lista', s).innerHTML = modo === 'units' ? listaInd() : listaComp();
  $('#lc-modo', s).addEventListener('click', e => { const b = e.target.closest('[data-lc-modo]'); if (b) { tocou = true; trocarModo(b.dataset.lcModo); } });
  $('#lc-lista', s).addEventListener('click', e => {
    const ck = e.target.closest('[data-lc-ck]'), todos = e.target.closest('[data-lc-todos]'), ub = e.target.closest('[data-lc-un]');
    if (ck) { const id = ck.dataset.lcCk; if (fora(id)) return; marcados.has(id) ? marcados.delete(id) : marcados.add(id); }
    else if (todos) { if (todosMarcados()) aqui.forEach(id => marcados.delete(id)); else aqui.forEach(id => marcados.add(id)); }
    else if (ub && !ub.disabled) {
      const id = ub.dataset.lcUn, dir = +ub.dataset.dir;
      // +1 com tudo distribuído: a quantidade do item cresce junto (pediram mais um)
      if (dir > 0 && falta() <= 0) setQty(getIt().qty + 1);
      un[id] = Math.max(0, (un[id] || 0) + dir);
    }
    else return;
    tocou = true; atualizar();
  });
  atualizar();
  return {
    atualizar, pronto, tocou: () => tocou,
    porque: () => modo === 'units' ? 'Distribua todas as unidades entre as pessoas.' : 'Marque quem dividiu.',
    resultado: () => {
      const qty = getIt().qty;
      if (modo === 'units') return { a: Object.fromEntries(Object.entries(un).filter(([, v]) => v > 0)), todos: false, modo: 'units' };
      if (marcados.size === 1) return { a: { [[...marcados][0]]: qty }, todos: false, modo: 'units' };
      return { a: Object.fromEntries([...marcados].map(id => [id, 1])), todos: todosMarcados(), modo: 'equal' };
    },
  };
}

/* ---------- 1.0: Comanda nova (mini comandas, faixa do local, itens que abrem e fecham) ---------- */
let pesAberto = null, pesJuntando = false, pesSvc = false, pesCv = false;
let itensAbertos = true, itemAberto = null, totaisAnt = { id: null, v: {} }, itPend = {};
// quem está num item e quanto paga dele (mesma conta do compute)
function divisaoItem(it, d) {
  const ids = d.people.map(p => p.id), who = ids.filter(id => (it.a[id] || 0) > 0);
  const nome = id => d.people.find(p => p.id === id)?.name || '';
  const fq = Math.min(it.fq || 0, it.qty), charged = (it.qty - fq) * it.price;
  if (it.mode === 'units') {
    const frees = allocate(fq * it.price, who.map(id => it.a[id]));
    return who.map((id, i) => ({ id, nome: nome(id), txt: plural(it.a[id], 'unidade', 'unidades'), val: it.a[id] * it.price - frees[i] }));
  }
  const w = who.map(id => it.mode === 'parts' ? it.a[id] : 1), v = allocate(charged, w);
  return who.map((id, i) => ({ id, nome: nome(id), txt: it.mode === 'parts' && new Set(w).size > 1 ? plural(w[i], 'parte', 'partes') : '', val: v[i] }));
}
function tipoItem(it, d) {
  const n = d.people.filter(p => (it.a[p.id] || 0) > 0).length;
  if (it.mode === 'units') return 'individual';
  if (n === 1) return 'só de ' + (d.people.find(p => (it.a[p.id] || 0) > 0)?.name || '');
  return n === d.people.length ? 'entre todos' : 'entre ' + n;
}
// item que ainda espera a divisão: uma linha da comanda com a lista de marcar logo abaixo
function itemPendenteHTML(it, d) {
  const ids = d.people.map(p => p.id), who = ids.filter(id => (it.a[id] || 0) > 0), n = who.length;
  const units = who.reduce((s, id) => s + (it.a[id] || 0), 0), left = it.qty - units;
  const ok = it.mode === 'units' ? (n > 0 && left === 0) : n > 0;
  const div = divisaoItem(it, d), val = id => { const x = div.find(y => y.id === id); return x ? BRL(x.val).replace('R$', '').trim() : ''; };
  const brl = v => BRL(v).replace('R$', '').trim();
  let corpo;
  if (it.mode === 'units') {
    corpo = d.people.map(p => { const u = it.a[p.id] || 0; return `<div class="ip-lin ${u ? 'on' : ''}"><span class="ip-nome">${esc(p.name)}</span><span class="ip-n">${u}</span>
      <span class="unit-btns"><button type="button" class="minus" data-unit="${p.id}" data-dir="-1" ${u ? '' : 'disabled'} aria-label="−1: uma unidade a menos para ${esc(p.name)}">−1</button><button type="button" class="plus" data-unit="${p.id}" data-dir="1" ${left > 0 ? '' : 'disabled'} aria-label="+1: uma unidade a mais para ${esc(p.name)}">+1</button></span></div>`; }).join('')
      + `<p class="ip-status ${left === 0 ? 'ok' : ''}">${left === 0 ? `${it.qty} de ${it.qty} distribuídas` : left > 0 ? `Faltam ${plural(left, 'unidade', 'unidades')} · ${units} de ${it.qty}` : `${plural(-left, 'unidade', 'unidades')} a mais`}</p>`;
  } else {
    const todos = n === ids.length && n > 0;
    corpo = d.people.map(p => { const on = (it.a[p.id] || 0) > 0; return `<button type="button" class="ip-lin ip-ck ${on ? 'on' : ''}" data-toggle="${p.id}" aria-pressed="${on}"><span class="ip-box" aria-hidden="true">${on ? '✓' : ''}</span><span class="ip-nome">${esc(p.name)}</span><span class="ip-v">${on ? val(p.id) : ''}</span></button>`; }).join('')
      + (ids.length > 1 ? `<button type="button" class="it-novo ip-todos" data-all="${todos ? 'none' : 'all'}"><span class="it-q">${todos ? '−' : '+'}</span><span>${todos ? 'Desmarcar todos' : 'Marcar todos'}</span><span></span></button>` : '')
      + `<div class="ip-lin ip-qtd"><span class="ip-nome">Quantidade</span><span class="ip-n">${it.qty}</span><span class="unit-btns"><button type="button" class="minus" data-q="-1" ${it.qty > 1 ? '' : 'disabled'} aria-label="−1: uma unidade a menos">−1</button><button type="button" class="plus" data-q="1" aria-label="+1: uma unidade a mais">+1</button></span></div>`
      + `<p class="ip-status ${n ? 'ok' : ''}">${n ? `÷ ${n === ids.length ? 'todos' : n} · ${brl(Math.round((it.qty - Math.min(it.fq || 0, it.qty)) * it.price / n))} cada` : 'Marque quem consumiu'}</p>`;
  }
  return `<div class="item item-p" data-item="${it.id}">
    <div class="ip-cab"><span class="it-q">${it.qty}×</span><span class="it-nome"><span>${esc(it.name)}</span><span class="it-tipo">${brl(it.price)} cada · ${it.mode === 'units' ? 'individual' : 'compartilhado'}</span></span><span class="it-v">${brl(it.qty * it.price)}</span></div>
    <span class="ip-selo">FALTA DIVIDIR</span>
    <div class="ip-corpo">${corpo}</div>
    <div class="ip-acoes"><button type="button" class="btn ip-ok" data-confirm ${ok ? '' : 'disabled'}>Confirmar divisão</button><button type="button" class="btn" data-rename aria-label="Alterar ${esc(it.name)}" title="Alterar">${I.edit}</button><button type="button" class="btn danger" data-del aria-label="Remover ${esc(it.name)}">${I.trash}</button></div>
  </div>`;
}
// item aberto: dá para pôr ou tirar unidades e cortesias; tudo fica num rascunho até tocar em Salvar
const itCur = it => itPend[it.id] ? { ...it, ...itPend[it.id] } : it;
const itSujo = it => { const p = itPend[it.id]; return !!p && JSON.stringify({ qty: p.qty, a: p.a, fq: p.fq }) !== JSON.stringify({ qty: it.qty, a: it.a, fq: it.fq || 0 }); };
function itemFechadoHTML(it, d) {
  const aberto = itemAberto === it.id, cur = itCur(it), sujo = itSujo(it), div = divisaoItem(cur, d);
  const fq = cur.fq || 0;
  const linhas = cur.mode === 'units'
    ? d.people.map(p => { const u = cur.a[p.id] || 0, x = div.find(y => y.id === p.id);
        return `<div class="div-lin ${u ? '' : 'cs-zero'}"><span class="who-name">${avatar(p.name)}<span>${esc(p.name)}</span><span class="hint num">· ${u}</span></span>
          <span class="div-dir"><span class="num">${u ? BRL(x ? x.val : 0) : ''}</span><span class="unit-btns"><button type="button" class="minus" data-it-u="${it.id}" data-p="${p.id}" data-dir="-1" ${u && cur.qty > 1 && !saiu(d, p.id) ? '' : 'disabled'} aria-label="−1: uma unidade de ${esc(it.name)} a menos para ${esc(p.name)}">−1</button><button type="button" class="plus" data-it-u="${it.id}" data-p="${p.id}" data-dir="1" ${saiu(d, p.id) ? 'disabled' : ''} aria-label="+1: mais uma unidade de ${esc(it.name)} para ${esc(p.name)}">+1</button></span></span></div>`; }).join('')
    : div.map(x => `<div class="div-lin"><span class="who-name">${avatar(x.nome)}<span>${esc(x.nome)}</span>${x.txt ? `<span class="hint">· ${x.txt}</span>` : ''}</span><span class="num">${BRL(x.val)}</span></div>`).join('')
      + `<div class="div-lin"><span class="cs-tx"><span>Quantidade</span><span class="hint">${cur.qty} × ${BRL(cur.price)} = ${BRL(cur.qty * cur.price)}</span></span>
        <span class="div-dir"><span class="num fq-n">${cur.qty}</span><span class="unit-btns"><button type="button" class="minus" data-it-q="${it.id}" data-dir="-1" ${cur.qty > 1 ? '' : 'disabled'} aria-label="−1: uma unidade de ${esc(it.name)} a menos">−1</button><button type="button" class="plus" data-it-q="${it.id}" data-dir="1" aria-label="+1: mais uma unidade de ${esc(it.name)}">+1</button></span></span></div>`;
  const resumo = () => { const dq = cur.qty - it.qty, df = fq - (it.fq || 0), t = [];
    if (dq) t.push(`${dq > 0 ? '+' : ''}${plural(dq, 'unidade', 'unidades')}`); if (df) t.push(`cortesia ${it.fq || 0} → ${fq}`);
    if (!dq && cur.mode === 'units' && JSON.stringify(cur.a) !== JSON.stringify(it.a)) t.push('divisão'); return t.join(' · '); };
  return `<details class="item-d ${sujo ? 'sujo' : ''}" data-kf-secao data-item="${it.id}" ${aberto ? 'open' : ''}>
    <summary class="it-lin"><span class="it-q">${it.qty}×</span><span class="it-nome"><span>${esc(it.name)}</span><span class="it-tipo">${BRL(it.price).replace('R$', '').trim()} cada · ${esc(tipoItem(it, d))}${it.fq ? ` · ${plural(it.fq, 'cortesia', 'cortesias')}` : ''}</span></span><span class="it-v">${BRL(it.qty * it.price).replace('R$', '').trim()}</span></summary>
    <div class="item-corpo">
      <div class="div-lista">${linhas}</div>
      <div class="div-lin fq-lin"><span class="cs-tx"><span>Cortesia</span></span>
        <span class="div-dir"><span class="num fq-n" aria-label="${fq} de ${cur.qty} sem cobrança">${fq}<small>/${cur.qty}</small></span><span class="unit-btns"><button type="button" class="minus" data-it-fq="${it.id}" data-dir="-1" ${fq ? '' : 'disabled'} aria-label="−1: uma cortesia a menos em ${esc(it.name)}">−1</button><button type="button" class="plus" data-it-fq="${it.id}" data-dir="1" ${fq < cur.qty ? '' : 'disabled'} aria-label="+1: uma cortesia a mais em ${esc(it.name)}">+1</button></span></span></div>
      ${sujo ? `<div class="pending-bar" data-kf-exp="pend:${it.id}"><span><b>Alteração não salva</b> · ${esc(resumo())} · <span class="num">${BRL((it.qty - (it.fq || 0)) * it.price)} → ${BRL((cur.qty - fq) * cur.price)}</span></span><span class="grp"><button type="button" class="btn small ghost" data-it-desc="${it.id}">Descartar</button><button type="button" class="btn small" data-it-ok="${it.id}">${I.save}Salvar</button></span></div>`
        : `<div class="grp item-acoes"><button class="btn small ghost" data-it-alt="${it.id}">${I.edit}Alterar</button><button class="btn small danger" data-it-del="${it.id}">${I.trash}Remover</button></div>`}
    </div></details>`;
}
// movimento do Kit (Anexo V); quem pede movimento reduzido vê a troca direta
/* ---------- movimento: um relógio só ----------
   Regra do Bruno (15/11/2026): tudo o que o app abre ou fecha dura 600 ms, na mesma curva (começa macio e pousa
   devagar): janelas, o fundo escuro, linhas e trechos que abrem e recolhem, troca de tela, avisos e listas.
   Nenhum outro arquivo escreve duração de abrir ou fechar: usa MOVE aqui e --cf-ms / --cf-curva no CSS. */
const MOVE = { ms: KitFacil.movimento.ms, css: KitFacil.movimento.css };
const MV = () => { const m = window.KitFacil?.movimento; return { ms: MOVE.ms, css: MOVE.css, off: !!(m?.reduzido ? m.reduzido() : matchMedia('(prefers-reduced-motion: reduce)').matches) }; };
// Enquanto o app anima a altura de um trecho de uma janela, avisa o mecanismo das janelas (casca.js) para não deslizar
// a janela por cima: a altura já está mudando quadro a quadro.
function alturaPorContaDoApp(el, ms) { if (el && el.closest && el.closest('.kf-dlg')) KitFacil.janela.ocupada(ms); }
// atalhos de uma pessoa (ou de um cupom compartilhado), abertos ao tocar no nome
function atalhosPessoaHTML(u, calc, d) {
  const aqui = pesAberto === u.id, juntando = aqui && pesJuntando, svcAberto = aqui && pesSvc, cvAberto = aqui && pesCv;
  const multi = u.members.length > 1, pid = u.members[0], p = calc.per[pid].person;
  const sw = (attr, on, label, valor) => `<label class="pa-lin"><span class="pa-tx"><span>${label}</span>${valor ? `<span class="pa-v">${valor}</span>` : ''}</span><span class="kf-chave"><input type="checkbox" ${attr} ${on ? 'checked' : ''} aria-label="${esc(label)}"><span class="kf-chave-trilho"></span></span></label>`;
  const outros = calc.units.filter(x => x.id !== u.id && !cupomSaiu(d, x));
  if (cupomSaiu(d, u)) return `<div class="dv-atalhos" data-pa="${u.id}"><div class="pa-acoes"><button type="button" class="btn small" data-pa-cupom>${I.file}Ver cupom</button></div></div>`;
  let h = '';
  if (!multi && d.service.enabled) h += sw(`data-pa-svc="${pid}"`, p.payService, 'Paga serviço', p.payService ? BRL(calc.per[pid].service) : 'não paga');
  if (multi && d.service.enabled) {
    const nao = u.members.filter(m => !calc.per[m].person.payService), nm = m => calc.per[m].person.name;
    const resumo = !nao.length ? 'todos pagam' : nao.length === u.members.length ? 'ninguém paga' : `${u.members.length - nao.length} de ${u.members.length} · ${nao.length === 1 ? `${esc(nm(nao[0]))} não paga` : `${nao.length} não pagam`}`;
    h += `<button type="button" class="pa-lin pa-res" data-pa-svcabre aria-expanded="${svcAberto}"><span class="pa-tx"><span>Paga serviço</span><span class="pa-v">${resumo}</span></span><span class="pa-seta" aria-hidden="true"></span></button>`;
    if (svcAberto) h += `<div class="pa-sub" data-kf-exp="svc:${u.id}">${u.members.map(m => { const q = calc.per[m].person; return sw(`data-pa-svc="${m}"`, q.payService, esc(q.name), q.payService ? BRL(calc.per[m].service) : 'não paga'); }).join('')}</div>`;
  }
  if (!multi && d.couvert.enabled) h += sw(`data-pa-cv="${pid}"`, p.payCouvert, 'Paga couvert', p.payCouvert ? BRL(calc.per[pid].couvert) : 'não paga');
  if (multi && d.couvert.enabled) {
    const nao = u.members.filter(m => !calc.per[m].person.payCouvert), nm = m => calc.per[m].person.name;
    const resumo = !nao.length ? 'todos pagam' : nao.length === u.members.length ? 'ninguém paga' : `${u.members.length - nao.length} de ${u.members.length} · ${nao.length === 1 ? `${esc(nm(nao[0]))} não paga` : `${nao.length} não pagam`}`;
    h += `<button type="button" class="pa-lin pa-res" data-pa-cvabre aria-expanded="${cvAberto}"><span class="pa-tx"><span>Paga couvert</span><span class="pa-v">${resumo}</span></span><span class="pa-seta" aria-hidden="true"></span></button>`;
    if (cvAberto) h += `<div class="pa-sub" data-kf-exp="cv:${u.id}">${u.members.map(m => { const q = calc.per[m].person; return sw(`data-pa-cv="${m}"`, q.payCouvert, esc(q.name), q.payCouvert ? BRL(calc.per[m].couvert) : 'não paga'); }).join('')}</div>`;
  }
  const botoes = `<div class="pa-acoes">
      ${multi ? `<button type="button" class="btn small" data-pa-desfaz>${I.x}Separar</button>` : outros.length ? `<button type="button" class="btn small" data-pa-juntar aria-expanded="${juntando}">${I.users}Juntar</button>` : ''}
      <button type="button" class="btn small" data-pa-cupom>${I.file}Ver cupom</button>
      <button type="button" class="btn small" data-pa-mais aria-label="Editar ${esc(u.name)}">${I.edit}Editar</button></div>`;
  const junta = !multi && juntando ? `<div class="pa-junta" data-kf-exp="junta:${u.id}" role="group" aria-label="Juntar ${esc(u.name)} com"><p class="pa-junta-t">Juntar ${esc(u.name)} com:</p>${outros.map(x => `<button type="button" class="pa-alvo" data-pa-alvo="${x.members.length > 1 ? 'g:' : 'p:'}${x.id}"><span>${I.users}${esc(x.name)}</span><span>${BRL(x.total)}${I.next}</span></button>`).join('')}</div>` : '';
  return `<div class="dv-atalhos" data-pa="${u.id}">${h}${botoes}${junta}</div>`;
}
function removerPessoa(id) {
  const d = draft, p = d.people.find(x => x.id === id); if (!p) return;
  const has = d.items.some(i => (i.a[id] || 0) > 0), n = d.items.filter(i => (i.a[id] || 0) > 0).length;
  confirmSheet(`Remover ${p.name}?`, (has
    ? `${p.name} está em ${plural(n, 'item', 'itens')}. Nos itens de consumo individual, as unidades dessa pessoa saem da comanda. Nos compartilhados, o valor passa a ser dividido entre os demais.`
    : `${p.name} sai da comanda.`) + (d.pagos && d.pagos[id] ? ` ${p.name} já pagou ${BRL(valorPago(d, id, compute(d)))}: esse pagamento sai junto, e a conta dos outros é refeita sem ele.` : ''), 'Remover', () => {
    d.people = d.people.filter(x => x.id !== id); if (d.pagos) delete d.pagos[id]; if (d.saiu) delete d.saiu[id];
    d.items.forEach(i => {
      const u = i.a[id] || 0; if (!u) return;
      delete i.a[id]; delete pending[i.id];
      if (i.mode === 'units' && i.lk) i.qty = Math.max(1, i.qty - u);
      if (!Object.keys(i.a).length) i.lk = false;
    });
    leaveGroup(d, id);
    delete d.custom[id]; delete d.cover[id]; Object.keys(d.cover).forEach(k => { if (d.cover[k] === id) delete d.cover[k]; }); if (d.payer === id) d.payer = ''; commit();
  }, true);
}
function addPessoa(name) {
  const d = draft;
  name = String(name || '').trim().replace(/\s+/g, ' ');
  if (!name) return false;
  if (d.people.some(p => norm(p.name) === norm(name))) { KitFacil.avisar(`${name} já está na comanda.`); return false; }
  const p = newPerson(name);
  d.people.push(p);
  // regra do Bruno (1.9.3): quem chega depois não entra sozinho em nenhum item já lançado; para pôr a pessoa num item,
  // abre-se o item e marca-se o nome dela (Código, Art. 64-C: o app não decide pela pessoa)
  commit();
  return true;
}
function pessoaNovaSheet() {
  const d = draft, Uu = usage();
  const naMesa = () => d.people.length ? `Na mesa: ${esc(d.people.map(p => p.name).join(', '))}` : 'Ninguém na mesa ainda.';
  const turmas = !d.isExample && (catalog.groups || []).length ? `<div class="field field-sel"><label for="pn-turma">Pôr uma turma na mesa</label><select id="pn-turma"><option value="">Escolher turma</option>${[...catalog.groups].sort(ordemNome).map(g => { const falta = g.members.filter(n => !d.people.some(p => norm(p.name) === norm(n))).length; return `<option value="${esc(g.id)}" ${falta ? '' : 'disabled'}>${esc(g.name)} · ${falta ? plural(falta, 'pessoa', 'pessoas') + ' a pôr' : 'todos já na mesa'}</option>`; }).join('')}</select></div>` : '';
  openSheet({ title: 'Quem está na mesa?', body: `<form id="pn-form" style="display:flex;flex-direction:column;gap:12px" autocomplete="off">
      <div class="row kf-linha"><div class="field grow"><label for="pn-nome">Nome</label><input id="pn-nome" type="text" autocapitalize="words" autocomplete="off" enterkeyhint="next"></div><button class="btn" type="submit" id="pn-add">${I.plus}Adicionar</button></div>
      ${turmas}<p class="hint" id="pn-mesa" role="status" style="margin:0">${naMesa()}</p></form>`,
    onMount: s => {
      const inp = $('#pn-nome', s);
      const depois = () => { inp.value = ''; $('#pn-mesa', s).innerHTML = naMesa(); };
      attachSuggest(inp, () => catalog.people.filter(p => !d.people.some(x => norm(x.name) === norm(p.name)))
        .sort((a, b) => (Uu.people[norm(b.name)] || 0) - (Uu.people[norm(a.name)] || 0) || (b.last || 0) - (a.last || 0)).map(p => ({ label: p.name })), x => { if (addPessoa(x.label)) depois(); });
      $('#pn-form', s).addEventListener('submit', e => { e.preventDefault(); if (addPessoa(inp.value)) depois(); });
      // quem está digitando continua no campo (o foco não sai dele); quem não tocou no campo, como ao pôr uma turma, não ganha teclado.
      // depois do primeiro toque no campo o teclado fica aberto entre um nome e outro: Enter adiciona sem "enviar o formulário" (o que fecharia o teclado), e o botão Adicionar não tira o foco do campo
      inp.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.isComposing && !e.defaultPrevented) { e.preventDefault(); if (addPessoa(inp.value)) depois(); } });
      $('#pn-add', s).addEventListener('pointerdown', e => e.preventDefault());
      $('#pn-turma', s)?.addEventListener('change', e => {
        const g = (catalog.groups || []).find(x => x.id === e.target.value); if (!g) return;
        const novos = g.members.filter(n => !d.people.some(p => norm(p.name) === norm(n)));
        novos.forEach(n => addPessoa(n)); depois();
        KitFacil.avisar(`${plural(novos.length, 'pessoa entrou', 'pessoas entraram')} na mesa: ${novos.join(', ')}.`);
      });
    } });
}
function localSheet() {
  const d = draft;
  openSheet({ title: 'Nome do local', body: `<form id="lo-form" autocomplete="off"><div class="field"><label for="lo-nome">Local</label><input id="lo-nome" type="text" autocapitalize="words" autocomplete="off" placeholder="Ex.: Cantina da Praça" value="${esc(d.place)}"></div></form>`,
    foot: `<button type="button" class="btn ghost" id="lo-no">Cancelar</button><button type="submit" form="lo-form" class="btn">${I.save}Salvar</button>`, onMount: s => {
      const inp = $('#lo-nome', s);
      const salvar = v => { d.place = String(v || '').trim().replace(/\s+/g, ' '); closeSheet(true); commit(); };
      attachSuggest(inp, () => recentPlaces().map(p => ({ label: p.name, right: plural(p.n, 'vez', 'vezes'), dim: true })), x => salvar(x.label));
      $('#lo-no', s).onclick = () => closeSheet();
      $('#lo-form', s).addEventListener('submit', e => { e.preventDefault(); salvar(inp.value); });
    } });
}
// produto, quantidade e preço; depois, a janela de dividir (ou direto para uma pessoa)
function produtoSheet(paraId, ed) {
  const d = draft, Uu = usage(), para = !ed && paraId && d.people.find(p => p.id === paraId);
  openSheet({ title: ed ? `Alterar ${ed.name}` : para ? `Lançar para ${para.name}` : 'Lançar item', tall: !para && d.people.length > 1, body: `<form id="pr-form" style="display:flex;flex-direction:column;gap:12px" autocomplete="off">
      <div class="field"><label for="pr-nome">Produto</label><input id="pr-nome" type="text" autocapitalize="words" autocomplete="off" placeholder="Ex.: Suco de laranja" value="${ed ? esc(ed.name) : ''}"></div>
      <div class="row lado"><div class="field"><label for="pr-qtd">Quantidade</label>${KitFacil.ui.quantidade({ id: 'pr-qtd', valor: ed ? ed.qty : 1, min: 1, max: 999 })}</div>
        <div class="field grow"><label for="pr-preco">Valor unitário</label><input id="pr-preco" type="text" inputmode="numeric" data-kf-dinheiro placeholder="R$ 0,00" value="${ed ? moneyInput(ed.price) : ''}"></div></div>
      <p class="price-hint" id="pr-dica" hidden></p>${!para && d.people.length > 1 ? divisaoHTML(d) : ''}</form>`,
    foot: `<button type="button" class="btn ghost" id="pr-no">Cancelar</button><button type="submit" form="pr-form" class="btn" id="lc-ok">${ed ? `${I.save}Salvar alteração` : `${I.plus}Lançar`}</button>`, onMount: s => {
      const nomeEl = $('#pr-nome', s), precoEl = $('#pr-preco', s), qtdEl = $('#pr-qtd', s), dica = $('#pr-dica', s);
      const div = !para && d.people.length > 1 ? divisaoLigar(s, d, () => ({ qty: Math.max(1, parseInt(qtdEl.value) || 1), price: parseMoney(precoEl.value) }), n => { qtdEl.value = n; }, ed) : null;
      if (div) { qtdEl.addEventListener('input', div.atualizar); precoEl.addEventListener('input', () => setTimeout(div.atualizar)); }
      let auto = false;
      const preencher = (name, force) => {
        const info = priceInfo(findProduct(name), d.place);
        if (!info) { if (auto) { precoEl.value = ''; auto = false; } dica.hidden = true; return; }
        if (force || !precoEl.value || auto) { precoEl.value = moneyInput(info.price); auto = true; }
        dica.hidden = false; dica.className = 'price-hint' + (info.here ? '' : ' other');
        dica.textContent = info.here ? `Preço registrado ${d.place ? 'em ' + d.place : 'para este local'}.` : `Último preço${info.where ? ' em ' + info.where : ''}. Confira o cardápio daqui.`;
      };
      nomeEl.addEventListener('input', () => preencher(nomeEl.value));
      precoEl.addEventListener('input', () => { auto = false; dica.hidden = true; });
      attachSuggest(nomeEl, () => catalog.products.map(p => ({ p, i: priceInfo(p, d.place), n: Uu.products[norm(p.name)] || 0 }))
        .sort((a, b) => (!!b.i?.here - !!a.i?.here) || b.n - a.n || a.p.name.localeCompare(b.p.name, 'pt-BR'))
        .map(({ p, i }) => ({ label: p.name, right: i ? BRL(i.price) + (i.here ? '' : ' · outro local') : '', dim: i && !i.here })), x => preencher(x.label, true));
      // − e + são do Kit (passo a passo de quantidade): ele avisa com o evento input
      qtdEl.addEventListener('input', () => div?.atualizar());
      $('#pr-no', s).onclick = () => closeSheet();
      $('#pr-form', s).addEventListener('submit', e => {
        e.preventDefault();
        const name = nomeEl.value.trim().replace(/\s+/g, ' '), qty = Math.max(1, parseInt(qtdEl.value) || 1), price = parseMoney(precoEl.value);
        if (!name) { KitFacil.avisar('Informe o nome do produto.'); apontar(nomeEl); return; }
        if (price === null || price === 0) { KitFacil.avisar('Informe o valor unitário (por exemplo, 12,90).'); apontar(precoEl); return; }
        if (ed) {
          const cur = d.items.find(x => x.id === ed.id); if (!cur) { closeSheet(true); return; }
          if (div && !div.pronto()) { KitFacil.avisar(div.porque()); return; }
          cur.name = name; cur.price = price; cur.qty = qty; cur.fq = Math.min(cur.fq || 0, qty);
          // a divisão só muda se a pessoa mexeu nela (preserva partes desiguais feitas em outro lugar)
          if (div && div.tocou()) { const r = div.resultado(); cur.a = r.a; cur.mode = r.modo; cur.auto = false; cur.lk = true; }
          else if (cur.mode === 'units') { const tot = Object.values(cur.a).reduce((x, y) => x + y, 0); cur.lk = tot === qty; }
          delete pending[cur.id]; delete itPend[cur.id];
          closeSheet(true); itemAberto = cur.id; commit(); KitFacil.avisar(cur.mode === 'units' && !cur.lk ? `${cur.name}: distribua as unidades e confirme.` : 'Item alterado.');
          return;
        }
        if (para) {
          // o mesmo produto, pelo mesmo preço, já lançado como individual: só ganha unidades
          const igual = d.items.find(it => it.lk && it.mode === 'units' && norm(it.name) === norm(name) && it.price === price);
          if (igual) { igual.a[para.id] = (igual.a[para.id] || 0) + qty; igual.qty += qty; igual.auto = false; itemNovo = igual.id; }
          else { const id = newId(); itemNovo = id; d.items.push({ id, o: nextOrder(), name, qty, price, fq: 0, mode: 'units', lk: true, auto: false, a: { [para.id]: qty } }); }
          closeSheet(true); commit(); KitFacil.avisar(`${qty > 1 ? qty + ' × ' : ''}${name} para ${para.name}.`);
          return;
        }
        const lancar = (a, todos, modo = 'equal') => {
          const id = newId();
          d.items.push({ id, o: nextOrder(), name, qty, price, fq: 0, mode: modo, lk: d.people.length > 0, auto: false, a });
          itemAberto = null; itensAbertos = true; itemNovo = id; commit();
        };
        if (!div) { closeSheet(true); return lancar(Object.fromEntries(d.people.map(p => [p.id, 1])), true); }
        if (!div.pronto()) { KitFacil.avisar(div.porque()); return; }
        const r = div.resultado(); closeSheet(true); lancar(r.a, r.todos, r.modo);
      });
    } });
}
// quem já acertou a sua parte na mesa (só neste aparelho, guardado junto com a comanda)
/* ---------- quem já pagou ----------
   d.pagos[id da pessoa] = { v: centavos pagos, t: quando }. O valor pago fica guardado. Se a conta da pessoa mudar depois
   (item novo, desconto, serviço, alguém que entrou na divisão), o app mostra a diferença: falta receber ou há troco a devolver.
   (Até a 1.1 só se guardava "pago": esses registros valem pelo valor da conta e passam a guardar o valor na primeira tela.) */
const algumPago = d => !!d.pagos && Object.keys(d.pagos).length > 0;
const valorPago = (d, id, c) => { const x = d.pagos && d.pagos[id]; return !x ? 0 : x === true ? (c.per[id] ? c.per[id].total : 0) : (x.v || 0); };
function fixarPagos(d, c) { if (d.pagos) for (const id in d.pagos) { if (!c.per[id]) delete d.pagos[id]; else if (d.pagos[id] === true) d.pagos[id] = { v: c.per[id].total, t: 0 }; } }
// o que um cupom paga ao local: a parte dele, já com outro valor combinado (ou o total, quando uma pessoa paga a conta de todos)
const devido = (u, c) => c.payer ? u.total : u.members.reduce((a, id) => a + (c.per[id] ? c.per[id].paid : 0), 0);
// situação de um cupom: aberto, pago, falta (pagou e a conta subiu), troco (pagou e a conta desceu) ou parte (só alguns do cupom pagaram)
function contaPaga(d, u, c) {
  const marcados = u.members.filter(id => d.pagos && d.pagos[id]), dv = devido(u, c);
  if (!marcados.length) return { estado: 'aberto', pago: 0, devido: dv, falta: dv, troco: 0 };
  const pago = marcados.reduce((a, id) => a + valorPago(d, id, c), 0), dif = dv - pago;
  return { estado: dif > 0 ? (marcados.length < u.members.length ? 'parte' : 'falta') : dif < 0 ? 'troco' : 'pago', pago, devido: dv, falta: Math.max(0, dif), troco: Math.max(0, -dif) };
}
function marcarPago(d, ids, on, c = compute(d)) {
  d.pagos = { ...(d.pagos || {}) };
  ids.forEach(id => {
    const r = c.per[id];
    if (!on) { if (d.pagos[id] && d.pagos[id].fx) { if (d.custom) delete d.custom[id]; if (d.cover) delete d.cover[id]; } delete d.pagos[id]; if (d.saiu) delete d.saiu[id]; return; }
    const v = r ? (c.payer ? r.total : r.paid) : 0;
    // quem paga já dividindo a diferença de outra pessoa fica com esse valor fixo: o pagamento dele não muda sozinho depois
    const fx = !!r && !c.payer && !r.custom && r.paid !== r.share && r.paid > 0;
    if (fx) { d.custom = { ...(d.custom || {}), [id]: r.paid }; }
    d.pagos[id] = { v, t: Date.now(), ...(fx || (d.pagos[id] && d.pagos[id].fx) ? { fx: true } : {}) };
  });
}
// a conta de quem já pagou mudou e outra pessoa fica com a diferença: o que foi pago vira o valor desse cupom
function cobrirDiferenca(d, u, quem, c = compute(d)) {
  const pid = u.payers[0], p = contaPaga(d, u, c); if (!pid || u.payers.length !== 1) return false;
  d.custom = { ...(d.custom || {}), [pid]: p.pago }; d.cover = { ...(d.cover || {}) };
  if (quem) d.cover[pid] = quem; else delete d.cover[pid];
  d.pagos = { ...(d.pagos || {}), [pid]: { ...(d.pagos[pid] || {}), v: p.pago, fx: true } };
  return true;
}
// quem pode ficar com a diferença de alguém que paga outro valor: quem ainda vai pagar a própria parte, de outro cupom
function quemCobre(d, c, pid, dif) {
  return c.ids.filter(id => id !== pid && c.unitOf[id] !== c.unitOf[pid] && !(id in (d.custom || {})) && c.per[id].share > 0 && !(d.pagos && d.pagos[id]) && (dif > 0 || c.per[id].share + dif >= 0));
}
// quem é você nas comandas: o nome entra nos cadastros se ainda não estiver lá (vazio desfaz a escolha)
function definirEu(nome) {
  nome = String(nome || '').trim().replace(/\s+/g, ' ');
  if (!nome) { catalog.me = ''; store.saveCatalog(); return ''; }
  let p = catalog.people.find(x => norm(x.name) === norm(nome)); if (!p) { p = { name: nome, pix: '' }; catalog.people.push(p); }
  catalog.me = p.name; store.saveCatalog(); return p.name;
}
// já pagou e foi embora: o cupom fica travado e a pessoa não entra em mais nada
const saiu = (d, id) => !!(d.saiu && d.saiu[id]);
const cupomSaiu = (d, u) => u.members.length > 0 && u.members.every(id => saiu(d, id));
function faltaReceber(d, c) { return c.units.reduce((a, u) => a + contaPaga(d, u, c).falta, 0); }
function trocoDevolver(d, c) { return c.units.reduce((a, u) => a + contaPaga(d, u, c).troco, 0); }
// cupons de quem já pagou e cuja conta mudou depois
const pagosComDiferenca = (d, c) => c.units.map(u => ({ u, p: contaPaga(d, u, c) })).filter(x => x.p.estado === 'falta' || x.p.estado === 'troco');
const fraseDiferenca = (u, p) => `${u.name} pagou ${BRL(p.pago)} e a conta agora é ${BRL(p.devido)}: ${p.estado === 'falta' ? 'falta ' + BRL(p.falta) : 'devolver ' + BRL(p.troco)}.`;
// marca ou desmarca o pagamento de um cupom, com Desfazer; "acertar" registra que a diferença foi paga ou devolvida
function alternarPago(u, modo) {
  const d = draft, c = compute(d), antes = clone(d.pagos || {}), p = contaPaga(d, u, c);
  const antesX = { custom: { ...(d.custom || {}) }, cover: { ...(d.cover || {}) }, saiu: { ...(d.saiu || {}) } };
  const desfazer = { label: 'Desfazer', run: () => { d.pagos = antes; Object.assign(d, antesX); commit({ anchor: false }); } };
  if (modo === 'desmarcar') { marcarPago(d, u.members, false, c); commit({ anchor: false }); KitFacil.avisar(`${u.name}: pagamento desmarcado.`, desfazer); return; }
  marcarPago(d, u.members, true, c); commit({ anchor: false });
  if (modo === 'acertar') { KitFacil.avisar(p.estado === 'troco' ? `${u.name}: troco de ${BRL(p.troco)} devolvido.` : `${u.name}: diferença de ${BRL(p.falta)} recebida.`, desfazer); return; }
  const abertos = c.openItems.length + c.unassigned.length;
  KitFacil.avisar(`${u.name}: pago ${BRL(p.falta)}.${abertos ? ' Ainda há itens sem divisão: a conta pode mudar.' : ''}`, desfazer);
}
// botões de pagamento de um canhoto, conforme a situação (só existem com a comanda fechada)
function botoesPagoHTML(u, p) {
  const b = (modo, cls, txt) => `<button type="button" class="btn small ${cls}" data-can-pago="${modo}">${txt}</button>`;
  if (p.estado === 'aberto') return b('marcar', 'pa-pago cf-pri', `${I.ok}Marcar como pago`);
  if (p.estado === 'pago') return b('desmarcar', 'ghost', `${I.x}Desmarcar pago`);
  const acerto = p.estado === 'troco' ? `${I.ok}Devolvi ${BRL(p.troco)}` : p.estado === 'parte' ? `${I.ok}Recebi o resto: ${BRL(p.falta)}` : `${I.ok}Recebi ${BRL(p.falta)}`;
  return `<p class="pa-dif" role="status">${p.estado === 'parte' ? `Parte deste cupom já foi paga (${BRL(p.pago)}). Falta ${BRL(p.falta)}.` : esc(fraseDiferenca(u, p))}</p><div class="pa-acoes pa-acoes-2">${b('acertar', 'pa-pago', acerto)}${b('desmarcar', 'ghost', `${I.x}Desmarcar pago`)}</div>`;
}
// Abrir uma linha da comanda (pessoa ou pedido) fecha as irmãs. O título tocado fica parado na tela enquanto as outras
// encolhem acima dele; no fim, se o que abriu não coube, a tela desce só o necessário, sem esconder o título.
function abrirSoEsta(det, irmas) {
  const sm = det.querySelector(':scope > summary'); if (!sm) return;
  let fechouAcima = 0;
  [...det.parentNode.children].forEach(x => {
    if (x === det || !x.matches('details' + irmas) || !KitFacil.secao.aberta(x)) return;
    // quanto a irmã vai encolher: da altura de agora até só a linha do título
    const t = x.querySelector(':scope > summary'), some = t ? x.offsetHeight - (t.offsetHeight + x.offsetHeight - x.clientHeight) : 0;
    KitFacil.secao.fechar(x);
    if (x.compareDocumentPosition(det) & Node.DOCUMENT_POSITION_FOLLOWING) fechouAcima += Math.max(0, some);
  });
  const y0 = sm.getBoundingClientRect().top;
  // No quadro seguinte o Kit já sabe a altura final da linha que abre. Com ela, o destino da rolagem é calculado uma vez
  // (título parado quando dá; senão, o mínimo para a linha aberta caber) e a tela vai até lá num movimento só, no mesmo
  // tempo e na mesma curva das linhas. Antes a tela ia até o topo e voltava.
  requestAnimationFrame(() => {
    if (!sm.isConnected) return;
    const an = det.getAnimations().find(a => { try { return a.effect.getKeyframes().some(k => k.height); } catch { return false; } });
    let altura = det.offsetHeight; try { const kf = an && an.effect.getKeyframes(); if (kf && kf.length) altura = parseFloat(kf[kf.length - 1].height) || altura; } catch {}
    const cab = $('.cu-cab'), topo = (cab ? cab.getBoundingClientRect().bottom : 0) + 8, doca = $('#kf-gu-doca') || $$('.kf-nav').find(n => n.getClientRects().length), fundo = (doca ? doca.getBoundingClientRect().top : innerHeight) - 14;
    const tituloFim = y0 - fechouAcima;                 // onde o título para se a tela não rolar
    let r = -fechouAcima;                               // rolagem que deixa o título onde o dedo tocou
    const paraCaber = tituloFim + altura - fundo;       // rolagem mínima para a linha aberta caber acima do pé
    if (tituloFim - r + altura > fundo) r = Math.min(paraCaber, tituloFim - topo);
    if (tituloFim - r < topo) r = tituloFim - topo;
    const max = Math.max(0, document.documentElement.scrollHeight - fechouAcima + (altura - det.offsetHeight) - innerHeight);
    const de = window.scrollY, ate = Math.max(0, Math.min(max, de + r));
    if (Math.abs(ate - de) < 1) return;
    const m = MV(); if (m.off) { window.scrollTo({ top: ate, behavior: 'instant' }); return; }
    const curva = window.KitFacil?.movimento?.curva || (t => t), t0 = performance.now();
    const passo = agora => { const k = Math.min(1, (agora - t0) / m.ms); window.scrollTo({ top: de + (ate - de) * curva(k), behavior: 'instant' }); if (k < 1 && sm.isConnected) requestAnimationFrame(passo); };
    requestAnimationFrame(passo);
  });
}
// Linhas da comanda (pessoas e pedidos): lembra o que está aberto, para a tela voltar igual depois de cada mudança.
// Um ouvinte só, para o app inteiro: antes ele era ligado de novo a cada redesenho da comanda, e depois de algumas
// mudanças cada toque numa linha disparava várias rolagens ao mesmo tempo (a tela "bugava" ao abrir um nome).
document.addEventListener('kf-secao', e => {
  const el = e.target; if (!el.closest || !el.closest('#view')) return;
  if (el.id === 'itens-sec') itensAbertos = e.detail.aberta;
  else if (el.classList.contains('dv-pes')) { const id = el.dataset.pes; if (e.detail.aberta) { pesAberto = id; pesJuntando = false; pesSvc = false; pesCv = false; abrirSoEsta(el, '.dv-pes'); } else if (pesAberto === id) pesAberto = null; }
  else if (el.classList.contains('item-d')) { if (e.detail.aberta) { itemAberto = el.dataset.item; abrirSoEsta(el, '.item-d'); } else if (itemAberto === el.dataset.item) itemAberto = null; }
});
/* ---------- abrir e recolher com movimento ----------
   As telas são redesenhadas inteiras; este ajudante compara o antes e o depois de um redesenho e anima o que mudou:
   [data-kf-exp="chave"]  um trecho que aparece ou some (abre crescendo, fecha encolhendo);
   [data-kf-morf="chave"] uma caixa cujo conteúdo troca (a altura desliza de uma para a outra). */
const MOV_EXP = { duration: MOVE.ms, easing: MOVE.css };
// o redesenho com movimento é o do Kit (KitFacil.movimento.redesenhar); aqui, só como achar as linhas da comanda
const marcaConta = el => el.id ? '#' + CSS.escape(el.id) : el.dataset.pa ? `[data-pa="${CSS.escape(el.dataset.pa)}"]` : el.dataset.item ? `[data-item="${CSS.escape(el.dataset.item)}"]` : el.dataset.pes ? `[data-pes="${CSS.escape(el.dataset.pes)}"]` : '';
const comMovimento = (raiz, redesenhar) => KitFacil.movimento.redesenhar(raiz, redesenhar, { marca: marcaConta });
// o cupom compartilhado: quem está nele, quanto é de cada um e quem paga
// o cupom compartilhado: quem está nele e quem paga
function grupoSheet(uid) {
  const d = draft;
  const corpo = () => {
    const c = compute(d), u = c.U[uid]; if (!u || u.members.length < 2) return '';
    return `<div class="cs-topo"><span class="hint">${plural(u.members.length, 'pessoa', 'pessoas')}</span><b class="num cs-total">${BRL(u.total)}</b></div>
      <div class="cs-lista">${u.members.map(m => { const nome = esc(c.per[m].person.name), paga = u.payers.includes(m);
        return `<div class="cs-lin gs-lin"><span class="cs-tx"><b>${nome}</b><span class="hint num">${BRL(c.per[m].total)} · ${paga ? 'paga' : 'não paga'}</span></span>
          <button type="button" class="ic-btn" data-gs-p="${m}" aria-label="Editar ${nome}">${I.edit}</button>
          <label class="kf-chave"><input type="checkbox" data-gs-paga="${m}" ${paga ? 'checked' : ''} aria-label="${nome} paga este cupom"><span class="kf-chave-trilho"></span></label></div>`; }).join('')}</div>`;
  };
  if (!corpo()) return;
  openSheet({ title: 'Cupom compartilhado', body: `<div id="gs-corpo" class="cs">${corpo()}</div>`,
    onMount: s => {
      const box = $('#gs-corpo', s);
      box.addEventListener('click', e => { const b = e.target.closest('[data-gs-p]'); if (b) editarPessoaSheet(b.dataset.gsP); });
      box.addEventListener('change', e => {
        const el = e.target.closest('[data-gs-paga]'); if (!el) return;
        const pid = el.dataset.gsPaga, g = cleanGroups(d).find(x => x.members.includes(pid)); if (!g) return;
        const on = g.payers.includes(pid);
        if (on && g.payers.length === 1) { el.checked = true; KitFacil.avisar('O cupom compartilhado precisa de alguém que pague.'); return; }
        g.payers = on ? g.payers.filter(x => x !== pid) : [...g.payers, pid];
        if (on) dropCustom(d, pid);
        d.groups = cleanGroups(d).map(x => x.id === g.id ? g : x); commit({ anchor: false });
        const tx = el.closest('.gs-lin')?.querySelector('.hint'); if (tx) tx.textContent = tx.textContent.replace(/· .*$/, '· ' + (el.checked ? 'paga' : 'não paga'));
      });
    } });
}
// o cupom de uma pessoa (ou do grupo dela), para ver e compartilhar
function cupomSheet(pid) {
  const d = draft, c = compute(d), u = c.U[c.unitOf[pid]]; if (!u) return;
  const multi = u.members.length > 1, pg = contaPaga(d, u, c), fechada = !!d.fechada, pago = fechada && pg.estado === 'pago', dif = fechada && pg.estado !== 'aberto' && !pago;
  openSheet({ title: multi ? 'Cupom compartilhado' : `Cupom de ${u.name}`, body: `${dif ? `<p class="pa-dif" role="status">${pg.estado === 'parte' ? `Parte deste cupom já foi paga (${BRL(pg.pago)}). Falta ${BRL(pg.falta)}.` : esc(fraseDiferenca(u, pg))}</p>` : ''}<div class="cupom-1 ${pago ? 'cupom-pago' : ''}">${receiptHTML(u, d, c)}${pago ? '<span class="selo-pago" aria-hidden="true">PAGO</span>' : ''}</div>`,
    foot: `<button type="button" class="btn" id="cp-share">${I.share}Compartilhar</button>`, onMount: s => {
      $('#cp-share', s).onclick = e => compartilharCupomPDF(u, d, c, e.currentTarget);
    } });
}
// o cupom da mesa segue o mesmo padrão: a janela mostra o cupom, e Compartilhar manda o PDF
function mesaCupomSheet() {
  const d = draft, c = compute(d), rows = mesaRows(d, c);
  openSheet({ title: 'Cupom da mesa', body: `<div class="cupom-1">${receiptHTML(null, d, c, rows)}</div>`,
    foot: `<button type="button" class="btn" id="cp-share">${I.share}Compartilhar</button>`, onMount: s => {
      $('#cp-share', s).onclick = e => compartilharCupomPDF(null, d, c, e.currentTarget, rows);
    } });
}
// o cupom sai em PDF, direto para a folha de compartilhar do aparelho (onde ela não existe, o arquivo é baixado)
async function compartilharCupomPDF(u, d, c, botao, rows) {
  if (!(await downloadsNS())) { KitFacil.avisar('Compartilhar arquivo não está disponível aqui.'); return; }
  if (botao) botao.disabled = true;
  try { await saveFile(`cupom-${u ? slug(u.name.replace(/ \+ /g, ' e ')) : 'mesa'}-${slug(d.place)}.pdf`, await canvasesToPDF([await receiptCanvas(u, d, c, rows)])); } catch { KitFacil.avisar('Não foi possível gerar o PDF agora.'); }
  if (botao && botao.isConnected) botao.disabled = false;
}
// a pessoa na mesa: mudar o nome ou tirar da mesa. O resto (consumo, serviço, pagamento) fica na comanda e em Fechar
function editarPessoaSheet(pid) {
  const d = draft, p0 = d.people.find(p => p.id === pid); if (!p0) return;
  openSheet({ title: p0.name, body: `<form class="field" id="cs-nome-f" autocomplete="off"><label for="cs-nome">Nome</label><input id="cs-nome" type="text" autocapitalize="words" autocomplete="off" enterkeyhint="done" value="${esc(p0.name)}"></form>`,
    foot: `<button type="button" class="btn danger" id="cs-rm">${I.trash}Remover da mesa</button><button type="submit" form="cs-nome-f" class="btn" id="cs-ok">Salvar</button>`, onMount: s => {
      $('#cs-nome-f', s).addEventListener('submit', e => {
        e.preventDefault();
        const el = $('#cs-nome', s), nome = el.value.trim().replace(/\s+/g, ' '), p = d.people.find(x => x.id === pid); if (!p) return closeSheet();
        if (!nome) { KitFacil.avisar('Informe o nome.'); apontar(el); return; }
        if (d.people.some(x => x.id !== pid && norm(x.name) === norm(nome))) { KitFacil.avisar(`Já há ${nome} na mesa. Use outro nome.`); apontar(el); return; }
        if (nome === p.name) return closeSheet();
        const antigo = p.name; p.name = nome; closeSheet(true); commit({ anchor: false });
        KitFacil.avisar(`${antigo} agora é ${nome}${nome.endsWith('.') ? '' : '.'}`, { label: 'Desfazer', run: () => { const q = d.people.find(x => x.id === pid); if (q) { q.name = antigo; commit({ anchor: false }); } } });
      });
      $('#cs-rm', s).onclick = () => removerPessoa(pid);
    } });
}
// a conta da mesa: de onde vem o total, com uma chave para serviço, couvert e desconto
function contaSheet() {
  const d = draft, s = d.service, ds = d.discount;
  const bloco = (k, on, titulo, valor, extra) => `<div class="cm-bloco"><label class="cs-lin cs-sw"><span class="cs-tx"><b>${titulo}</b><span class="hint num">${valor}</span></span><span class="kf-chave"><input type="checkbox" data-cm="${k}" ${on ? 'checked' : ''} aria-label="${esc(titulo)}"><span class="kf-chave-trilho"></span></span></label>${on && extra ? `<div class="cm-extra" data-kf-exp="cm-${k}">${extra}</div>` : ''}</div>`;
  const corpo = () => {
    const c = compute(d), names = ids => ids.map(id => c.per[id].person.name).join(', ');
    let nota = '';
    if (s.enabled && c.skipped.length) nota = s.policy === 'discount' ? `${esc(names(c.skipped))} não paga${c.skipped.length > 1 ? 'm' : ''} o serviço; o total fica ${BRL(c.skippedValue)} menor.` : `${BRL(c.skippedValue)} de serviço de ${esc(names(c.skipped))} divididos entre os outros.`;
    const svc = `<div class="ds-row"><div class="seg" role="group" aria-label="Tipo de taxa"><button type="button" data-cm-svcmode="fixed" aria-pressed="${s.mode === 'fixed'}">R$</button><button type="button" data-cm-svcmode="pct" aria-pressed="${s.mode === 'pct'}">%</button></div>
      ${s.mode === 'fixed' ? `<input id="cm-svc-fixed" type="text" inputmode="numeric" data-kf-dinheiro value="${moneyInput(s.fixed)}" aria-label="Valor da taxa em reais">` : `<input id="cm-svc-pct" type="text" inputmode="numeric" data-kf-pct value="${pctInput(s.pct)}" aria-label="Percentual da taxa">`}</div>
      ${nota ? `<div class="policy-note pol-row" data-kf-exp="cm-pol"><span>${nota}</span><button type="button" class="btn small ghost" data-cm-pol>Mudar</button></div>` : ''}`;
    const cvPct = d.couvert.mode === 'pct';
    const cv = `<div class="ds-row"><div class="seg" role="group" aria-label="Tipo de couvert"><button type="button" data-cm-cvmode="value" aria-pressed="${!cvPct}">R$</button><button type="button" data-cm-cvmode="pct" aria-pressed="${cvPct}">%</button></div>
      <input id="cm-cv" type="text" inputmode="numeric" ${cvPct ? `data-kf-pct value="${pctInput(d.couvert.pct || 0)}" aria-label="Percentual do couvert sobre o consumo de cada um"` : `data-kf-dinheiro value="${moneyInput(d.couvert.value)}" aria-label="Couvert por pessoa"`}></div>`;
    const dsc = `<div class="ds-row"><div class="seg" role="group" aria-label="Tipo de desconto"><button type="button" data-cm-dsmode="value" aria-pressed="${ds.mode === 'value'}">R$</button><button type="button" data-cm-dsmode="pct" aria-pressed="${ds.mode === 'pct'}">%</button></div>
      <input id="cm-ds" type="text" inputmode="numeric" ${ds.mode === 'pct' ? `data-kf-pct value="${pctInput(ds.pct)}" aria-label="Percentual de desconto"` : `data-kf-dinheiro value="${moneyInput(ds.value)}" aria-label="Valor do desconto"`}></div>
      <div class="seg" role="group" aria-label="Onde o desconto incide"><button type="button" data-cm-dsat="after" aria-pressed="${ds.at === 'after'}">No valor total da comanda</button><button type="button" data-cm-dsat="before" aria-pressed="${ds.at !== 'after'}">Apenas no valor do consumo</button></div>`;
    const fqN = d.items.reduce((a, it) => a + (it.fq || 0), 0);
    let aviso = '';
    if (c.payDiff < 0) aviso = `Faltam ${BRL(-c.payDiff)} para cobrir o total. Ajuste quem paga outro valor.`;
    if (c.payDiff > 0) aviso = `Os valores escolhidos passam ${BRL(c.payDiff)} do total.`;
    const mexe = pagosComDiferenca(d, c);
    const jaPagou = mexe.length ? `<div class="aviso-pago" data-kf-exp="cm-pago" role="status"><b>${I.warn}Isso mexe com quem já pagou</b>${mexe.map(x => `<p><span>${esc(fraseDiferenca(x.u, x.p))}</span></p>`).join('')}<p class="hint">Serviço, couvert e desconto valem para a mesa toda. Acerte a diferença com a pessoa ao fechar a comanda.</p></div>` : '';
    return `${jaPagou}<div class="cs-lista">
        <div class="cs-lin"><span class="cs-tx"><b>Consumo</b>${c.freeValue ? '<span class="hint">já descontadas as cortesias</span>' : ''}</span><span class="num">${BRL(c.consumoBruto)}</span></div>
        ${bloco('svc', s.enabled, 'Serviço', s.enabled ? BRL(c.service) : 'não cobrado', svc)}
        ${bloco('cv', d.couvert.enabled, 'Couvert artístico', d.couvert.enabled ? `${BRL(c.couvert)}${d.couvert.mode === 'pct' ? ` · ${pctStr(d.couvert.pct || 0)}% do consumo de cada um` : ` · ${BRL(d.couvert.value)} por pessoa`}` : 'não cobrado', cv)}
        ${bloco('ds', ds.enabled, 'Desconto', ds.enabled ? '−' + BRL(c.discount) : 'sem desconto', dsc)}
        <div class="cs-lin cm-total"><b>Total da comanda</b><b class="num">${BRL(c.total)}</b></div>
      </div>
      ${aviso ? `<div class="status warn">${I.warn}<span>${aviso}</span></div>` : ''}
      `;
  };
  const podeFechar = d.items.length && d.people.length;
  openSheet({ title: 'Conta da mesa', body: `<div id="cm-corpo" class="cs">${corpo()}</div>`,
    foot: podeFechar ? `<button type="button" class="btn" id="cm-fechar">${I.receipt}Fechar comanda</button>` : '', onMount: sh => {
    $('#cm-fechar', sh)?.addEventListener('click', () => fecharComanda());
    const box = $('#cm-corpo', sh);
    let chave = '';
    const pintar = () => { const foco = box.contains(document.activeElement) && document.activeElement.id;
      comMovimento(box, () => { box.innerHTML = corpo(); prepFields(box); });
      const volta = foco && $('#' + CSS.escape(foco), box); if (volta) { try { volta.focus({ preventScroll: true }); } catch {} }
      const ck = chave && $(`[data-cm="${chave}"]`, box); chave = ''; if (ck && !MV().off) { const on = ck.checked; ck.checked = !on; void ck.nextElementSibling?.offsetWidth; ck.checked = on; } };
    const refazer = () => { commit({ anchor: false }); pintar(); };
    box.addEventListener('change', e => {
      const el = e.target, k = el.dataset.cm; if (k) chave = k;
      if (k === 'svc') s.enabled = el.checked;
      else if (k === 'cv') d.couvert.enabled = el.checked;
      else if (k === 'ds') ds.enabled = el.checked;
      else if (el.id === 'cm-svc-pct') s.pct = parsePct(el.value) ?? 0;
      else if (el.id === 'cm-svc-fixed') { const v = parseMoney(el.value); if (v !== null) s.fixed = v; }
      else if (el.id === 'cm-cv') { if (d.couvert.mode === 'pct') d.couvert.pct = parsePct(el.value) ?? 0; else { const v = parseMoney(el.value); if (v !== null) d.couvert.value = v; } }
      else if (el.id === 'cm-ds') { if (ds.mode === 'pct') ds.pct = parsePct(el.value) ?? 0; else ds.value = parseMoney(el.value) ?? 0; }
      else return;
      // chave: redesenha na hora. Valor digitado: só depois que o campo soltar o foco de verdade — se a janela fosse
      // refeita no meio da saída, o campo sumia sem avisar e o app continuava achando que o teclado estava aberto
      if (k) refazer(); else setTimeout(() => { if (box.isConnected) refazer(); }, 0);
    });
    box.addEventListener('click', e => {
      const t = sel => e.target.closest(sel), c = compute(d);
      const sm = t('[data-cm-svcmode]'), dm = t('[data-cm-dsmode]'), da = t('[data-cm-dsat]'), cm = t('[data-cm-cvmode]');
      if (cm) { const m = cm.dataset.cmCvmode; if (m === (d.couvert.mode || 'value')) return; d.couvert.mode = m; if (m === 'pct' && !d.couvert.pct) d.couvert.pct = 10; return refazer(); }
      if (sm) { const m = sm.dataset.cmSvcmode; if (m === s.mode) return; if (m === 'pct') { s.mode = 'pct'; if (!s.pct) s.pct = 10; } else { s.mode = 'fixed'; if (!s.fixed) s.fixed = Math.round(c.consumo * 0.1); } return refazer(); }
      if (dm) { ds.mode = dm.dataset.cmDsmode; return refazer(); }
      if (da) { ds.at = da.dataset.cmDsat; return refazer(); }
      if (t('[data-cm-pol]')) return politicaSheet(d);
      if (t('[data-cm-acertos]')) return copyText(['Acertos — ' + (d.place || 'Comanda'), ...c.transfers.map(x => { const to = c.per[x.to].person.name, k = pixOf(to); return `${c.per[x.from].person.name} paga ${BRL(x.value)} para ${to}${k ? ' (Pix: ' + pixBonita(k) + ')' : ''}`; })].join('\n'), 'Acertos copiados.');
      if (t('[data-cm-copiar]')) return copyText(c.units.map(u => receiptText(u, d, c)).join('\n\n'), 'Todos os cupons copiados.');
      if (t('[data-cm-pdf]')) return shareAllPDF(d, c, t('[data-cm-pdf]'));
    });
  } });
}

// fechar a comanda: o resumo de quem paga quanto, o que falta receber e salvar no histórico
// o cupom da mesa inteira, nas mesmas linhas dos outros cupons (tela, texto e PDF)
function mesaRows(d, c) {
  const s = d.service, R = [];
  // mesmo preâmbulo dos cupons de cada pessoa
  R.push({ t: 'brand', text: 'CONTA FÁCIL' }, { t: 'center', text: d.place || 'Comanda' }, { t: 'center', text: fmtDateTime(d.closedAt || d.createdAt), tone: 'muted' }, { t: 'dash' },
    { t: 'who', text: 'Mesa' }, { t: 'center', text: `Comanda da mesa · ${plural(d.people.length, 'pessoa', 'pessoas')}`, tone: 'muted', small: true }, { t: 'dash' });
  [...d.items].sort((x, y) => (x.o || 0) - (y.o || 0)).forEach(it => {
    R.push({ t: 'pair', left: it.name, right: BRL(it.qty * it.price) }, { t: 'detail', text: `${it.qty} un. × ${BRL(it.price)}` });
    if (it.fq) R.push({ t: 'detail', text: `${plural(it.fq, 'cortesia', 'cortesias')} · −${BRL(it.fq * it.price)}` });
  });
  R.push({ t: 'dash' }, { t: 'pair', left: 'Consumo', right: BRL(c.itemsGross + c.freeValue) });
  if (c.freeValue) R.push({ t: 'pair', left: 'Cortesia', right: '−' + BRL(c.freeValue) });
  if (s.enabled) R.push({ t: 'pair', left: serviceLabel(d), right: BRL(c.service) });
  if (d.couvert.enabled) R.push({ t: 'pair', left: 'Couvert', right: BRL(c.couvert) });
  if (d.discount.enabled) R.push({ t: 'pair', left: 'Desconto', right: '−' + BRL(c.discount) });
  R.push({ t: 'total', left: 'TOTAL', right: BRL(c.total) }); // o cupom da mesa termina no total: quem pagou fica nos canhotos
  return R;
}
/* ---------- comanda fechada: um canhoto por pessoa (1.12.0) ----------
   Fechar a comanda não abre janela: a própria tela muda. O papel é destacado em um canhoto por cupom, e receber é
   carimbar cada canhoto. d.fechada guarda quando a comanda foi fechada (só neste aparelho, como "pago" e "já saiu").
   Só há um caminho de volta: "Reabrir a comanda". */
let canAberto = '', canValor = '', barraDe = null; // canhoto aberto; campo de valor diferente aberto; de onde a barra vem (para o movimento)
const recebidoDe = (d, c) => c.units.reduce((a, u) => a + contaPaga(d, u, c).pago, 0);
// Pix para receber de um canhoto: a chave é a de "Você nas comandas". O botão só existe quando serve: há chave,
// ainda falta receber desse canhoto e ele não é o seu
function pixReceber(d, u, c) {
  const eu = d.demoEu || catalog.me || '', chave = eu && pixOf(eu), pg = contaPaga(d, u, c); // demoEu: "você" na comanda de exemplo e no guia
  if (!chave || pg.falta <= 0 || u.members.some(id => norm(c.per[id].person.name) === norm(eu))) return null;
  return { toName: eu, key: chave, value: pg.falta };
}
function fecharComanda() {
  const d = draft, c = compute(d);
  if (d.fechada || corteRodando || !d.items.length || !d.people.length) return;
  if (d.live && live.readOnly) { KitFacil.avisar('Você só pode acompanhar esta comanda.'); return; }
  if (d.items.some(pendingDirty)) { KitFacil.avisar('Há itens com alterações não salvas. Salve ou descarte antes de fechar.'); return; }
  if (c.unassigned.length || c.incomplete.length || c.openItems.length) { KitFacil.avisar('Divida todos os itens antes de fechar a comanda.'); return; }
  closeSheet(true);
  // a comanda em uso pode ser trocada por outra igual enquanto a tela sobe (o guia faz isso): vale sempre a atual
  const virar = sem => {
    const d = draft; d.fechada = Date.now(); if (d.payer || d.payMode !== 'none') pagaTodos(d, '');
    canAberto = ''; canValor = ''; barraDe = null; pesAberto = null; itemAberto = null; pesJuntando = false;
    commit({ anchor: false, semMovimento: sem }); window.scrollTo({ top: 0, behavior: 'instant' });
  };
  if (corteDireto() || tab !== 'comanda' || !$('#view #groups-card')) return virar(false);
  corteRodando = true; const vez = ++corteVez;
  subirAoTopo(() => { if (vez !== corteVez) return; if (draft.fechada || tab !== 'comanda' || !$('#view #groups-card')) { corteRodando = false; return; } try { corteFechar(() => virar(true)); } catch (e) { console.warn('corte', e); corteLimpar(); if (!draft.fechada) virar(false); } });
}
function reabrirComanda() {
  const d = draft; if (!d.fechada || corteRodando) return;
  if (d.live && live.readOnly) { KitFacil.avisar('Você só pode acompanhar esta comanda.'); return; }
  const virar = sem => { const d = draft; d.fechada = null; canAberto = ''; canValor = ''; barraDe = null; commit({ anchor: false, semMovimento: sem }); window.scrollTo({ top: 0, behavior: 'instant' }); };
  if (corteDireto() || tab !== 'comanda' || !$('#view #cf')) return virar(false);
  corteRodando = true; const vez = ++corteVez;
  subirAoTopo(() => { if (vez !== corteVez) return; if (!draft.fechada || tab !== 'comanda' || !$('#view #cf')) { corteRodando = false; return; } try { corteReabrir(() => virar(true)); } catch (e) { console.warn('corte', e); corteLimpar(); if (draft.fechada) virar(false); } });
}
/* ---------- o corte invisível entre a comanda aberta e a fechada (momento de marca: Código, Art. 72, § 4º) ----------
   1. A tela sobe até o topo. 2. O preâmbulo (lugar, data e total) é o mesmo nas duas telas, no mesmo lugar: não se mexe.
   3. Cada linha de nome se destaca do papel e vira canhoto: no quadro da troca, o número, o nome e o valor do canhoto estão
   exatamente onde estavam na linha (corte de correspondência), e só então andam. 4. O que não tem par (pedidos, total,
   botões) sai ou entra como "fantasma": uma cópia parada do que havia, que se desfaz por cima.
   Reabrir é o mesmo filme ao contrário. Tudo anda só com transform e opacity (e um recorte no papel, ao reabrir), para o
   aparelho não ter de refazer a tela a cada quadro. */
// com o guia em passo rápido (Pular), a troca é direta, como para quem pede movimento reduzido
const corteDireto = () => MV().off || !!(KitFacil.guia && KitFacil.guia.estado() && KitFacil.guia.estado().rapido);
let corteRodando = false, corteVez = 0; // corteVez: cada corte tem a sua vez; o que sobrou de um corte interrompido não mexe no seguinte
const CORTE = { ms: 680, passo: 42 };
const caixa = e => { const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height, b: r.bottom, r: r.right }; };
function subirAoTopo(feito) {
  const de = scrollY; if (de < 2) return requestAnimationFrame(feito);
  const dur = Math.min(620, 280 + de * .4), t0 = performance.now();
  const passo = agora => { const k = Math.min(1, (agora - t0) / dur), e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; window.scrollTo({ top: Math.round(de * (1 - e)), behavior: 'instant' }); if (k < 1) requestAnimationFrame(passo); else feito(); };
  requestAnimationFrame(passo);
}
// o palco dos fantasmas: uma camada fixa por cima da tela (e por baixo da navegação), que também segura os toques
function cortePalco() { corteLimpar(true); const p = document.createElement('div'); p.id = 'cf-palco'; p.setAttribute('aria-hidden', 'true'); const t = document.createElement('div'); t.id = 'cf-trava'; document.body.append(p, t); return p; }
function corteLimpar(soPalco) { if (!soPalco) { corteVez++; corteAnims.forEach(a => { try { a.cancel(); } catch {} }); corteAnims = []; } $('#cf-palco')?.remove(); $('#cf-trava')?.remove(); $$('.cf-cola').forEach(e => e.remove()); if (!soPalco) corteRodando = false; }
// cópia parada de um pedaço da tela, no lugar exato em que ele estava
function fantasma(palco, el, extra = '') {
  const r = caixa(el), f = el.cloneNode(true);
  f.querySelectorAll('canvas').forEach(x => x.remove()); f.inert = true; // os ids ficam: há estilos que dependem deles, e a cópia dura menos de um segundo
  f.style.cssText += `;position:absolute;left:${r.x}px;top:${r.y}px;width:${r.w}px;height:${r.h}px;margin:0;box-sizing:border-box;${extra}`;
  palco.append(f); return f;
}
/* Toda animação do corte nasce parada no primeiro quadro. O quadro da troca é o mais pesado (a tela é redesenhada e as
   camadas novas são pintadas): ele passa com a imagem imóvel, igual à de antes. Só quando o aparelho volta a entregar
   quadros no ritmo é que todas são soltas juntas, no mesmo instante. Assim o peso da troca nunca vira engasgo no movimento. */
let corteAnims = [];
const an = (el, quadros, o) => { if (!el) return null; const a = el.animate(quadros, { easing: MOVE.css, fill: 'both', ...o }); a.pause(); corteAnims.push(a); return a; };
function corteSoltar(vez, depois) {
  const anims = corteAnims; corteAnims = []; let n = 0, ult = performance.now();
  const q = agora => { if (vez !== corteVez) return; const dt = agora - ult; ult = agora; n++;
    if (n < 3 || (dt > 22 && n < 12)) return requestAnimationFrame(q);
    const t = document.timeline.currentTime; anims.forEach(a => { try { a.startTime = t; } catch {} }); depois && depois(); };
  requestAnimationFrame(q);
}
const medirLinhas = () => $$('#view #groups-card [data-pes]').map(det => { const s = det.querySelector('summary'); return { id: det.dataset.pes, lin: caixa(s), n: caixa(s.querySelector('.dv-n')), nome: caixa(s.querySelector('.dv-nome > span')), v: caixa(s.querySelector('.dv-v')) }; });
const medirCanhotos = raiz => $$('.cf-can', raiz).map(el => ({ id: el.dataset.can, el, can: caixa(el), n: caixa(el.querySelector('.cf-num')), nome: caixa(el.querySelector('.cf-nome')), v: caixa(el.querySelector('.cf-vn')) }));
function corteFechar(virar) {
  const { ms, passo } = CORTE, v = $('#view');
  // antes: onde está cada coisa na comanda aberta, e as cópias do que vai sair
  const art = $('.cmd-una', v), grupo = $('#groups-card', v), A = { art: caixa(art), cab: caixa($('.cu-cab', v)), grupo: caixa(grupo), linhas: medirLinhas() };
  const palco = cortePalco();
  const fRestos = fantasma(palco, art, `clip-path:inset(${A.grupo.b - A.art.y}px 0 -12px 0)`), fFim = $('.fim-acoes', v) && fantasma(palco, $('.fim-acoes', v));
  // das pessoas, fica só a "tinta" sem par (título, linhas tracejadas, setas): o papel e os nomes já são os dos canhotos
  const fGrupo = fantasma(palco, art, `clip-path:inset(${A.grupo.y - A.art.y}px 0 ${Math.max(0, A.art.b - A.grupo.b)}px 0)`); fGrupo.classList.add('cf-so-tinta');
  fGrupo.querySelectorAll('#groups-card .dv-n, #groups-card .dv-nome > span:first-child, #groups-card .dv-v').forEach(x => { x.style.visibility = 'hidden'; });
  // a troca: no mesmo quadro, a comanda fechada entra por baixo dos fantasmas
  virar();
  const cf = $('#cf', v); if (!cf) return corteLimpar();
  const B = medirCanhotos(cf), porId = Object.fromEntries(A.linhas.map(l => [l.id, l]));
  // papel "de cola": enquanto os canhotos ainda estão juntos, nenhum vão do papel antigo fica à mostra
  const cfr = caixa(cf), cola = document.createElement('div'); cola.className = 'cf-cola';
  cola.style.cssText = `left:${A.art.x - cfr.x}px;top:${A.cab.b - cfr.y}px;width:${A.art.w}px;height:${A.grupo.b - A.cab.b}px`; cf.prepend(cola);
  const fim = [];
  B.forEach((b, i) => {
    const a = porId[b.id], atraso = i * passo, o = { duration: ms, delay: atraso };
    const dy = a ? a.lin.y - b.can.y : 0, de = (p, q) => `translate(${p.x - q.x}px, ${p.y - q.y - dy}px)`;
    fim.push(an(b.el, [{ transform: `translateY(${dy}px)` }, { transform: 'none' }], o));
    an(b.el, [{ rotate: '0deg' }, { rotate: (i % 2 ? -.7 : .7) + 'deg' }, { rotate: '0deg' }], { ...o, easing: 'ease-in-out' });
    if (a) { an(b.el.querySelector('.cf-num'), [{ transform: de(a.n, b.n) }, { transform: 'none' }], o); an(b.el.querySelector('.cf-nome'), [{ transform: de(a.nome, b.nome) }, { transform: 'none' }], o);
      an(b.el.querySelector('.cf-vn'), [{ transform: `translate(${a.v.r - b.v.r}px, ${a.v.y - b.v.y - dy}px)` }, { transform: 'none' }], o); }
    an(b.el.querySelector('.cf-rs'), [{ opacity: 0 }, { opacity: 1 }], { duration: ms * .5, delay: atraso + ms * .3 });
    b.el.querySelectorAll('.cf-rapido, .cf-obs, .cf-dentro').forEach(x => an(x, [{ opacity: 0 }, { opacity: 1 }], { duration: ms * .5, delay: atraso + ms * .35 }));
    b.el.querySelectorAll('.cf-sombra, .cf-picote').forEach(x => an(x, [{ opacity: 0 }, { opacity: 1 }], o));
  });
  an(cola, [{ opacity: 1 }, { opacity: 0 }], { duration: 260 });
  an(fGrupo, [{ opacity: 1 }, { opacity: 0 }], { duration: 220 });
  [fRestos, fFim].forEach(f => an(f, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(44px)' }], { duration: 440, easing: 'cubic-bezier(.5,0,.75,.4)' }));
  $$('.cu-ico .i', cf).forEach(x => an(x, [{ opacity: .65 }, { opacity: 0 }], { duration: 220 }));
  const selo = $('.cf-selo', cf), tudo = ms + Math.max(0, B.length - 1) * passo;
  an($('#cf-reabrir', cf), [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: ms * .5, delay: 160 });
  an(selo, [{ opacity: 0, transform: 'rotate(-6deg) scale(1.7)' }, { opacity: 1, transform: 'rotate(-6deg) scale(.94)', offset: .7 }, { opacity: 1, transform: 'rotate(-6deg) scale(1)' }], { duration: 300, delay: tudo - 300, easing: 'cubic-bezier(.3,0,.2,1)' });
  $$('.cf-rec, .cf-mesa, .cf-pe', v).forEach((x, i) => an(x, [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { duration: ms * .6, delay: ms * .4 + i * 50 }));
  corteSoltar(corteVez, () => { setTimeout(() => { try { navigator.vibrate?.(16); } catch {} }, tudo - 90); corteAoFim(fim, tudo); });
}
function corteReabrir(virar) {
  const { ms, passo } = CORTE, v = $('#view'), cf0 = $('#cf', v);
  // antes: os canhotos e o que está em volta viram fantasmas, no lugar em que estão
  const cab0 = $('.cf-cabeca', cf0), A = { cabeca: caixa(cab0), cab: caixa($('.cu-cab', cf0)), cans: medirCanhotos(cf0) };
  const palco = cortePalco();
  const fFaixa = fantasma(palco, cab0, `clip-path:inset(${A.cab.h}px 0 -12px 0)`);
  const fSaem = $$('.cf-rec, .cf-mesa, .cf-pe', v).map(e => fantasma(palco, e));
  const fCans = A.cans.map(a => fantasma(palco, a.el));
  virar();
  const art = $('.cmd-una', v); if (!art) return corteLimpar();
  const linhas = medirLinhas(), porId = Object.fromEntries(linhas.map(l => [l.id, l])), n = fCans.length, tudo = ms + Math.max(0, n - 1) * passo;
  const R = { art: caixa(art), grupo: caixa($('#groups-card', v)) }, l0 = linhas[0], lf = linhas[linhas.length - 1];
  const fim = [];
  A.cans.forEach((a, i) => {
    const f = fCans[i], b = porId[a.id], atraso = (n - 1 - i) * passo, o = { duration: ms, delay: atraso };
    const dy = b ? b.lin.y - a.can.y : 0, ate = (p, q) => `translate(${p.x - q.x}px, ${p.y - q.y - dy}px)`;
    fim.push(an(f, [{ transform: 'none', clipPath: 'inset(0px 0px 0px 0px)' }, { transform: `translateY(${dy}px)`, clipPath: `inset(0px 0px ${Math.max(0, a.can.h - (b ? b.lin.h : a.can.h))}px 0px)` }], o));
    an(f, [{ rotate: '0deg' }, { rotate: (i % 2 ? -.7 : .7) + 'deg' }, { rotate: '0deg' }], { ...o, easing: 'ease-in-out' });
    if (b) { an(f.querySelector('.cf-num'), [{ transform: 'none' }, { transform: ate(b.n, a.n) }], o); an(f.querySelector('.cf-nome'), [{ transform: 'none' }, { transform: ate(b.nome, a.nome) }], o);
      an(f.querySelector('.cf-vn'), [{ transform: 'none' }, { transform: `translate(${b.v.r - a.v.r}px, ${b.v.y - a.v.y - dy}px)` }], o); }
    an(f.querySelector('.cf-rs'), [{ opacity: 1 }, { opacity: 0 }], { duration: ms * .4, delay: atraso });
    f.querySelectorAll('.cf-rapido, .cf-obs, .cf-dentro').forEach(x => an(x, [{ opacity: 1 }, { opacity: 0 }], { duration: ms * .4, delay: atraso }));
    f.querySelectorAll('.cf-sombra, .cf-picote').forEach(x => an(x, [{ opacity: 1 }, { opacity: 0 }], o));
  });
  fSaem.forEach(f => an(f, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(14px)' }], { duration: 240 }));
  an(fFaixa, [{ opacity: 1 }, { opacity: 0 }], { duration: 260 });
  // o papel da comanda aberta se estende por baixo dos canhotos que chegam e, quando eles encostam, desce de uma vez
  const H = R.art.h + 12, rec = y => `inset(-12px 0px ${Math.max(0, H - 12 - (y - R.art.y))}px 0px)`, fase2 = 340, total = tudo + fase2;
  const yIni = A.cabeca.b + 6, yLin = l0 ? l0.lin.y : R.grupo.y, yFimLin = lf ? lf.lin.b : R.grupo.b;
  an(art, [{ clipPath: rec(yIni), easing: MOVE.css }, { clipPath: rec(Math.max(yIni, yLin)), offset: tudo / total, easing: 'steps(1, jump-start)' }, { clipPath: rec(yFimLin), offset: tudo / total, easing: MOVE.css }, { clipPath: rec(R.art.b + 12) }], { duration: total, easing: 'linear', fill: 'backwards' });
  $$('#groups-card > .cu-tit, #groups-card > .dv-col', v).forEach(x => an(x, [{ opacity: 0 }, { opacity: 1 }], { duration: ms * .5, delay: 120 }));
  $$('.cu-ico .i', v).forEach(x => an(x, [{ opacity: 0 }, { opacity: getComputedStyle(x).opacity }], { duration: 260, delay: tudo * .5 }));
  [...$$('#groups-card > #add-pessoa', v), ...[...art.querySelectorAll('.cm-corpo > *')].filter(x => x.id !== 'groups-card'), ...$$('.fim-acoes, #live-offer', v)].forEach((x, i) => an(x, [{ opacity: 0, transform: 'translateY(-14px)' }, { opacity: 1, transform: 'none' }], { duration: fase2, delay: tudo - 40 + Math.min(i, 4) * 30 }));
  // no quadro em que os canhotos encostam, eles saem de cena: por baixo, as linhas da comanda estão no mesmo lugar
  Promise.allSettled(fim.filter(Boolean).map(a => a.finished)).then(() => { fCans.forEach(f => f.remove()); });
  corteSoltar(corteVez, () => corteAoFim([], total));
}
// no fim, nada sobra: as animações soltam os elementos e o palco sai
function corteAoFim(fim, ms) {
  const vez = corteVez, acabar = () => { if (!corteRodando || vez !== corteVez) return; $$('#view *').forEach(e => { if (e.getAnimations) e.getAnimations().forEach(a => { if (a.effect && a.effect.getComputedTiming().fill !== 'none' && a.playState === 'finished') a.cancel(); }); }); corteLimpar(); };
  setTimeout(acabar, ms + 120);
}
/* "Fechar comanda" chama a atenção quando a comanda está pronta para fechar. A animação é procedural: desenhada quadro a
   quadro num canvas, com o ritmo tirado de ruído, então nunca se repete igual. Um picote anda pela borda do botão e, de
   tempos em tempos, um brilho atravessa e o ícone dá um pulinho. Parada com movimento reduzido, fora da tela ou com a aba escondida. */
let fecharAnim = 0;
function animarBotaoFechar(btn) {
  cancelAnimationFrame(fecharAnim); fecharAnim = 0;
  if (!btn || MV().off) return;
  const cv = document.createElement('canvas'); cv.className = 'fechar-cv'; cv.setAttribute('aria-hidden', 'true'); btn.prepend(cv); btn.classList.add('vivo');
  const g = cv.getContext('2d'); if (!g) return;
  let w = 0, h = 0, raio = 12, visivel = true, ult = performance.now(), t = 0, passo = 0, prox = 1.1, brilho = -1, larg = 60, forca = .2;
  const medir = () => { const dpr = Math.min(3, devicePixelRatio || 1); w = btn.clientWidth; h = btn.clientHeight; raio = Math.max(2, Math.min(parseFloat(getComputedStyle(btn).borderTopLeftRadius) || 12, h / 2) - 4); cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); g.setTransform(dpr, 0, 0, dpr, 0, 0); };
  const ruido = x => (Math.sin(x * 1.31) + Math.sin(x * .73 + 1.7) + Math.sin(x * 2.17 + .3)) / 3; // suave, entre -1 e 1
  const suave = x => x * x * (3 - 2 * x);
  try { new IntersectionObserver(es => { visivel = es[es.length - 1].isIntersecting; }).observe(btn); } catch {}
  const quadro = agora => {
    if (!btn.isConnected) { fecharAnim = 0; return; }
    fecharAnim = requestAnimationFrame(quadro);
    const dt = Math.min(.05, (agora - ult) / 1000); ult = agora;
    if (!visivel || document.hidden) return;
    if (btn.clientWidth !== w || btn.clientHeight !== h) medir();
    t += dt; g.clearRect(0, 0, w, h);
    // picote: traços que andam pela borda, ora mais depressa, ora mais devagar
    passo -= dt * (16 + 9 * ruido(t * .6));
    g.lineWidth = 1.5; g.strokeStyle = 'rgba(255,255,255,.5)'; g.setLineDash([5, 5]); g.lineDashOffset = passo;
    g.beginPath(); g.roundRect ? g.roundRect(4, 4, w - 8, h - 8, raio) : g.rect(4, 4, w - 8, h - 8); g.stroke();
    // brilho: atravessa de vez em quando; a largura, a força e a espera mudam a cada passada
    if (brilho < 0 && t > prox) { brilho = 0; larg = 46 + 26 * (ruido(t * 3.1) + 1); forca = .16 + .07 * (ruido(t * 5.3) + 1); btn.classList.remove('salta'); void btn.offsetWidth; btn.classList.add('salta'); }
    if (brilho >= 0) {
      brilho += dt / .95; const x = -larg + (w + 2 * larg) * suave(Math.min(1, brilho)), gr = g.createLinearGradient(x - larg, 0, x + larg, 0);
      gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.5, `rgba(255,255,255,${forca})`); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.save(); g.setLineDash([]); g.transform(1, 0, -.35, 1, h * .175, 0); g.fillStyle = gr; g.fillRect(x - larg, 0, larg * 2, h); g.restore();
      if (brilho >= 1) { brilho = -1; prox = t + 2.6 + 2.2 * (ruido(t * 1.9) + 1); }
    }
  };
  medir(); fecharAnim = requestAnimationFrame(quadro);
}
// o que fica dentro do canhoto aberto, além do cupom: valor diferente, quem fica com a diferença e "já saiu da mesa"
function canhotoExtras(d, u, c) {
  const pg = contaPaga(d, u, c), pid = u.payers.length === 1 ? u.payers[0] : '', r = pid && c.per[pid];
  // com quem fica a diferença: os outros dividem (padrão) ou uma pessoa só
  const quem = (attr, dif, atual, rot) => { const L = pid ? quemCobre(d, c, pid, dif) : []; if (!L.length) return '';
    return `<div class="fc-cobre" role="group" aria-label="${rot} ${BRL(Math.abs(dif))}"><span class="fc-cobre-t">${rot} ${BRL(Math.abs(dif))}</span><div class="fc-quem">
      <button type="button" class="kf-escolha" ${attr}="" aria-pressed="${atual === ''}">Os outros dividem</button>${L.map(id => `<button type="button" class="kf-escolha" ${attr}="${id}" aria-pressed="${atual === id}">${esc(c.per[id].person.name)}</button>`).join('')}</div></div>`; };
  // valor diferente: só para quem paga o próprio cupom, enquanto ele não foi marcado como pago
  let valor = '';
  if (r && pg.estado === 'aberto') {
    const on = r.custom || canValor === pid, dif = r.custom ? r.share - (d.custom[pid] || 0) : 0;
    valor = on ? `<div class="fc-valor"><div class="field"><label for="can-v-${pid}">Vai pagar</label><input id="can-v-${pid}" data-can-custom="${pid}" type="text" inputmode="numeric" data-kf-dinheiro value="${moneyInput(r.custom ? d.custom[pid] || 0 : r.paid)}"></div>
        <button type="button" class="btn small ghost" data-can-conta="${pid}">${I.refresh}Valor da conta</button></div>${dif ? quem('data-can-cobre', dif, r.cover || '', dif > 0 ? 'Quem cobre' : 'Quem devolve') : ''}`
      : `<div class="cf-acoes"><button type="button" class="btn small ghost" data-can-valor="${pid}">${I.edit}Pagar valor diferente</button></div>`;
  }
  // a conta mudou depois de paga: além de receber ou devolver, outra pessoa pode ficar com a diferença
  const dif = pg.estado === 'falta' ? pg.falta : pg.estado === 'troco' ? -pg.troco : 0;
  const outro = dif ? quem('data-can-difcobre', dif, null, dif > 0 ? 'Ou quem cobre' : 'Ou quem devolve') : '';
  // já pagou: pode já ter ido embora (o canhoto trava e a pessoa não entra em mais nada se a comanda for reaberta)
  const foi = pg.estado !== 'aberto' && pg.estado !== 'parte' ? `<label class="pa-lin cf-saiu"><span class="pa-tx"><span>Já saiu da mesa</span></span><span class="kf-chave"><input type="checkbox" data-can-saiu="${u.id}" ${cupomSaiu(d, u) ? 'checked' : ''} aria-label="${esc(u.name)} já saiu da mesa"><span class="kf-chave-trilho"></span></span></label>` : '';
  return valor + outro + foi;
}
function canhotoHTML(d, u, i, c) {
  const pg = contaPaga(d, u, c), ab = canAberto === u.id, brl = v => BRL(v).replace('R$', '').trim();
  const obs = [u.members.length > 1 ? 'cupom compartilhado' : '', cupomSaiu(d, u) ? 'saiu da mesa' : '',
    pg.estado === 'falta' ? `pagou ${brl(pg.pago)} · falta ${brl(pg.falta)}` : pg.estado === 'troco' ? `pagou ${brl(pg.pago)} · devolver ${brl(pg.troco)}` : pg.estado === 'parte' ? `pago em parte · falta ${brl(pg.falta)}` : ''].filter(Boolean).join(' · ');
  const seta = `<button type="button" class="ic-btn cf-seta" data-can-abre="${u.id}" aria-expanded="${ab}" aria-label="${ab ? 'Fechar' : 'Abrir'} o canhoto de ${esc(u.name)}">${I.next}</button>`;
  const selo = pg.estado === 'pago' ? '<span class="cf-pago">PAGO</span>' : '';
  // fechado: a ação do momento, num toque; aberto: o cupom, as opções e, por último, a ação
  const rapido = pg.estado === 'aberto' ? `<button type="button" class="btn small" data-can-pago="marcar">${I.ok}Marcar como pago</button>`
    : pg.estado === 'pago' ? selo : `<button type="button" class="btn small" data-can-pago="acertar">${I.ok}${pg.estado === 'troco' ? 'Devolvi ' + BRL(pg.troco) : 'Recebi ' + BRL(pg.falta)}</button>`;
  const pix = pixReceber(d, u, c);
  const dentro = ab ? `<div class="cf-dentro" data-kf-exp="can-${u.id}">
      <div class="cf-acoes"><button type="button" class="btn small ghost" data-can-cupom>${I.file}Ver cupom</button>${pix ? `<button type="button" class="btn small ghost" data-can-pix>${I.qr}Receber com Pix</button>` : ''}</div>
      ${canhotoExtras(d, u, c)}<div class="cf-pg">${botoesPagoHTML(u, pg)}</div></div>` : '';
  return `<article class="cf-papel cf-can ${pg.estado}" data-can="${u.id}" aria-label="Canhoto de ${esc(u.name)}: ${BRL(pg.devido)}${pg.estado === 'pago' ? ', pago' : ''}">
    <span class="cf-sombra" aria-hidden="true"></span>
    <div class="cf-toco" aria-hidden="true"><span class="cf-num">${String(i + 1).padStart(2, '0')}</span><span class="cf-picote"></span></div>
    <div class="cf-corpo"><div class="cf-topo"><span class="cf-nome">${esc(u.name)}</span><span class="cf-valor"><span class="cf-rs">R$\u00a0</span><span class="cf-vn">${brl(pg.devido)}</span></span></div>${obs ? `<div class="cf-obs">${esc(obs)}</div>` : ''}
      <div class="cf-rapido">${ab ? selo : rapido}${seta}</div>${dentro}</div></article>`;
}
function fechadaHTML(d, c) {
  const falta = faltaReceber(d, c), troco = trocoDevolver(d, c), rec = recebidoDe(d, c), f = c.total > 0 ? Math.max(0, Math.min(1, rec / c.total)) : 0;
  const tudo = algumPago(d) && !falta;
  const aviso = c.payDiff < 0 ? `<div class="status warn" data-kf-exp="cf-aviso">${I.warn}<span>Faltam ${BRL(-c.payDiff)} para cobrir o total. Ajuste quem paga valor diferente.</span></div>` : c.payDiff > 0 ? `<div class="status warn" data-kf-exp="cf-aviso">${I.warn}<span>Os valores escolhidos passam ${BRL(c.payDiff)} do total.</span></div>` : '';
  return `
    ${d.isExample ? `<div class="banner ex-banner"><span><b>Comanda de exemplo</b></span><span class="grp"><button class="btn small ghost" id="ex-guide">Guia</button><button class="btn small ghost" id="clear-example">Sair</button></span></div>` : ''}
    ${d.live ? liveCardHTML() : ''}
    ${d.savedAt && !d.live ? `<div class="banner"><span>Esta comanda já está no histórico. As alterações são guardadas quando você salvar de novo.</span><button class="btn small ghost" id="new-bill-top">Encerrar edição</button></div>` : ''}
    <div class="cf" id="cf">
      <article class="cmd-una cf-cabeca" aria-label="Comanda fechada">
        <header class="cu-cab">
          <div class="cu-local"><span class="cu-nome ${d.place ? '' : 'vazio'}">${esc(d.place || 'Comanda')}<span class="cu-ico" aria-hidden="true">${I.edit}</span></span>
            <span class="cu-quando">${fmtDateTime(d.createdAt)}</span></div>
          <div class="cu-conta"><span class="cu-total">${BRL(c.total)}</span><span class="cu-ico" aria-hidden="true">${I.next}</span></div>
        </header>
        <div class="cf-faixa"><span class="cf-selo">FECHADA</span><button type="button" class="btn small ghost cf-reabrir" id="cf-reabrir">${I.unlock}Reabrir a comanda</button></div>
      </article>
      <div class="cf-rec"><div class="cf-rec-l"><span>Recebido</span><b>${BRL(rec)} de ${BRL(c.total)}</b></div>
        <div class="cf-barra ${tudo ? 'cheia' : ''}" role="img" aria-label="${Math.round(f * 100)}% recebido"><div class="cf-trilho"><div class="cf-barra-f" data-f="${f}" style="transform:scaleX(${f})"></div></div><span class="cf-ok" aria-hidden="true">${I.ok}</span></div></div>
      ${aviso}
      <div class="cf-cans" id="cf-cans">${c.units.map((u, i) => canhotoHTML(d, u, i, c)).join('')}</div>
      <div class="cf-mesa"><button type="button" class="btn small ghost" id="cf-mesa-cupom">${I.file}Ver cupom da mesa</button></div>
    </div>
    <div class="fim-acoes cf-pe">${tudo && !troco ? '' : `<p class="cf-falta" role="status">${[tudo ? '' : 'Faltam ' + BRL(falta), troco ? 'Devolver ' + BRL(troco) : ''].filter(Boolean).join(' · ')}</p>`}
      <button type="button" class="${tudo ? 'kf-btn kf-pri fechar-btn' : 'btn ghost'}" id="cf-salvar">${I.save}<span>Salvar no histórico</span></button></div>`;
}
// a barra de recebido tem o seu jeito: enche passando do ponto e voltando; esvazia murchando; cheia, estufa e ganha o check
function animarBarra(v) {
  const fEl = $('.cf-barra-f', v); if (!fEl) return;
  const para = +fEl.dataset.f || 0, de = barraDe; barraDe = para;
  if (de === null || Math.abs(de - para) < .001 || MV().off) return;
  const mola = 'cubic-bezier(.34,1.56,.64,1)', sobe = para > de, passa = Math.max(0, Math.min(1, para + (sobe ? .04 : -.04)));
  fEl.animate([{ transform: `scaleX(${de})` }, { transform: `scaleX(${passa})`, offset: .7 }, { transform: `scaleX(${para})` }], { duration: 700, easing: MOVE.css });
  const tr = fEl.parentNode, cheia = para >= .999;
  tr.animate(cheia ? [{ transform: 'scaleY(1)' }, { transform: 'scaleY(1)', offset: .6 }, { transform: 'scaleY(1.6)', offset: .8 }, { transform: 'scaleY(1)' }] : sobe ? [{ transform: 'scaleY(1)' }, { transform: 'scaleY(1.25)', offset: .7 }, { transform: 'scaleY(1)' }] : [{ transform: 'scaleY(1)' }, { transform: 'scaleY(.5)', offset: .35 }, { transform: 'scaleY(1.25)', offset: .75 }, { transform: 'scaleY(1)' }], { duration: 700, easing: mola });
  if (cheia) $('.cf-ok', v)?.animate([{ transform: 'scale(0)' }, { transform: 'scale(0)', offset: .55 }, { transform: 'scale(1.3)', offset: .85 }, { transform: 'scale(1)' }], { duration: 760, easing: mola });
}
function bindFechada(v) {
  const d = draft, raiz = $('#cf', v); if (!raiz) return;
  animarBarra(v);
  const U = el => compute(d).U[el.closest('[data-can]')?.dataset.can];
  const mudar = () => commit({ anchor: false });
  $('#cf-reabrir', v).addEventListener('click', reabrirComanda);
  $('#cf-salvar', v).addEventListener('click', () => saveBill());
  $('#cf-mesa-cupom', v).addEventListener('click', mesaCupomSheet);
  raiz.addEventListener('change', e => {
    const sa = e.target.closest('[data-can-saiu]');
    if (sa) { const u = compute(d).U[sa.dataset.canSaiu]; if (!u) return; d.saiu = { ...(d.saiu || {}) }; u.members.forEach(m => { if (sa.checked) d.saiu[m] = true; else delete d.saiu[m]; }); return mudar(); }
    const el = e.target.closest('[data-can-custom]'); if (!el || el._cfFeito) return; el._cfFeito = true;
    const pid = el.dataset.canCustom, val = parseMoney(el.value) || 0;
    // o canhoto só é refeito depois que o campo soltar o foco de verdade (o teclado e a barra do OK se recolhem antes)
    setTimeout(() => { if (document.activeElement === el) el.blur(); d.custom = d.custom || {}; d.custom[pid] = val; canValor = ''; mudar(); }, 0);
  });
  raiz.addEventListener('click', async e => {
    const t = q => e.target.closest(q);
    const ab = t('[data-can-abre]');
    if (ab) { const id = ab.dataset.canAbre; canAberto = canAberto === id ? '' : id; canValor = ''; return render({ anchor: { from: `[data-can="${CSS.escape(id)}"]` } }); }
    const pg = t('[data-can-pago]');
    if (pg) { const u = U(pg); if (u) alternarPago(u, pg.dataset.canPago); return; }
    if (t('[data-can-pix]')) { const u = U(e.target), x = u && pixReceber(d, u, compute(d)); if (x) pixSheet(x); return; }
    if (t('[data-can-cupom]')) { const u = U(e.target); if (u) cupomSheet(u.members[0]); return; }
    if (t('[data-can-valor]')) { canValor = t('[data-can-valor]').dataset.canValor; return render({ anchor: false }); }
    if (t('[data-can-conta]')) { const pid = t('[data-can-conta]').dataset.canConta; if (d.custom) delete d.custom[pid]; if (d.cover) delete d.cover[pid]; canValor = ''; return mudar(); }
    // com quem fica a diferença de quem paga valor diferente
    if (t('[data-can-cobre]')) { const b = t('[data-can-cobre]'), pid = U(b)?.payers[0]; if (!pid) return; d.cover = { ...(d.cover || {}) }; if (b.dataset.canCobre) d.cover[pid] = b.dataset.canCobre; else delete d.cover[pid]; return mudar(); }
    // a conta de quem já pagou mudou e outra pessoa fica com a diferença
    if (t('[data-can-difcobre]')) { const b = t('[data-can-difcobre]'), u = U(b); if (!u) return;
      const c = compute(d), antes = { pagos: clone(d.pagos || {}), custom: { ...(d.custom || {}) }, cover: { ...(d.cover || {}) } }, p = contaPaga(d, u, c), q = b.dataset.canDifcobre;
      if (!cobrirDiferenca(d, u, q, c)) return; mudar();
      KitFacil.avisar(`${q ? c.per[q].person.name : 'Os outros'} ${p.estado === 'troco' ? (q ? 'devolve' : 'devolvem') : (q ? 'cobre' : 'cobrem')} ${BRL(p.falta || p.troco)} de ${u.name}.`, { label: 'Desfazer', run: () => { Object.assign(d, antes); commit({ anchor: false }); } }); }
  });
}
function bindAoVivo(v) {
  const d = draft;
  $('#live-start', v)?.addEventListener('click', () => live.start());
  $('#live-invite', v)?.addEventListener('click', inviteSheet);
  $('#live-code', v)?.addEventListener('click', inviteSheet);
  $('#live-who', v)?.addEventListener('click', () => { liveWho = true; render({ preserve: true }); });
  $('#live-reconnect', v)?.addEventListener('click', () => { live.stop(); live.subscribe(); });
  $('#live-end', v)?.addEventListener('click', () => {
    const host = d.live.host && !live.closed;
    confirmSheet(host ? 'Encerrar a comanda ao vivo?' : 'Sair da comanda ao vivo?',
      host ? 'Os amigos param de conseguir marcar itens. A comanda continua aqui para você fechar.' : 'Você deixa de receber as atualizações. Uma cópia da comanda fica aqui com você.',
      host ? 'Encerrar' : 'Sair', () => live.end());
  });
  $$('[data-me]', v).forEach(b => b.addEventListener('click', () => { LS.set('me.' + d.live.code, b.dataset.me); liveWho = false; live.beat(); render({ preserve: true }); }));

}
const viewComanda = {
  html() {
    const d = draft, calc = compute(d), s = d.service;
    fixarPagos(d, calc);
    if (d.fechada) return fechadaHTML(d, calc);
    const me = d.live ? LS.get('me.' + d.live.code, '') : '';
    // mini comanda que mudou de valor dá um pulo (só quando muda, nunca na primeira vez)
    if (totaisAnt.id !== d.id) totaisAnt = { id: d.id, v: {} };
    const pulou = {};
    calc.units.forEach(u => { const a = totaisAnt.v[u.id]; if (a !== undefined && a !== u.total) pulou[u.id] = true; });
    totaisAnt.v = Object.fromEntries(calc.units.map(u => [u.id, u.total]));
    const ordenados = [...d.items].sort((x, y) => (x.o || 0) - (y.o || 0)); // o novo entra no fim da fila, onde fica o botão
    const itemsHTML = d.items.length ? ordenados.map(it => it.lk ? itemFechadoHTML(it, d) : itemPendenteHTML(it, d)).join('') : KitFacil.ui.vazio({ titulo: 'Nenhum item lançado' });
    const abertosN = d.items.filter(it => !it.lk).length;
    const aj = [s.enabled && (s.mode === 'fixed' ? 'Serviço' : `Serviço ${pctStr(s.pct)}%`), d.couvert.enabled && 'Couvert', d.discount.enabled && 'Desconto', calc.freeValue && 'Cortesia'].filter(Boolean);
    const nm = id => calc.per[id].person.name;
    const num = pid => String(d.people.findIndex(p => p.id === pid) + 1).padStart(2, '0');
    const brl = v => BRL(v).replace('R$', '').trim();
    // o que a pessoa consumiu, em linhas curtas de cupom: "3× Suco", "1/3 Porção"
    const linhas = pid => calc.per[pid].lines.slice().sort((x, y) => y.value - x.value).map(l => ({
      q: l.mode === 'units' ? l.units + '×' : l.n > 1 ? (l.uneq ? l.parts + '/' + l.totalParts : '1/' + l.n) : l.qty + '×', t: l.name, v: l.value }));
    const lista = pid => { const L = linhas(pid); if (!L.length) return '<span class="mc-vazio">nada ainda</span>';
      return L.slice(0, 3).map(x => `<span class="mc-it"><span class="mc-q">${esc(x.q)}</span><span class="mc-t">${esc(x.t)}</span><span class="mc-v">${brl(x.v)}</span></span>`).join('') + (L.length > 3 ? `<span class="mc-mais">+ ${plural(L.length - 3, 'item', 'itens')}</span>` : ''); };
    const giro = id => { let h = 0; for (const ch of String(id)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return ((h % 5) - 2) * 0.35; };
    const mini = u => {
      const st = `style="--giro:${giro(u.id)}deg"`;
      if (u.members.length === 1) { const pid = u.members[0], r = calc.per[pid];
        return `<div class="mini-cmd ${pulou[u.id] ? 'pula' : ''}" ${st} role="button" tabindex="0" data-unit="${u.id}" data-drop="p:${u.id}" data-abrir="${pid}" aria-label="${esc(nm(pid))}: ${BRL(u.total)}. Ver o cupom">
        <span class="mc-n">COMANDA Nº ${num(pid)}</span><span class="mc-nome">${esc(nm(pid))}</span><span class="mc-linha" aria-hidden="true"></span>
        <span class="mc-itens" aria-hidden="true">${lista(pid)}</span>
        <span class="mc-tot"><span>TOTAL</span><span class="mc-valor num">${BRL(u.total)}</span></span>${!r.person.payService && d.service.enabled ? '<span class="mc-obs">sem serviço</span>' : ''}</div>`; }
      const so = u.payers.length < u.members.length;
      return `<div class="mc-pilha" ${st} data-unit="${u.id}" data-drop="g:${u.id}"><span class="mc-tras" aria-hidden="true"></span>
        <div class="mini-cmd mc-grupo ${pulou[u.id] ? 'pula' : ''}" role="button" tabindex="0" data-grupo="${u.id}" aria-label="Cupom compartilhado de ${esc(u.name)}: ${BRL(u.total)}. Ver o cupom">
        <span class="mc-n">CUPOM COMPARTILHADO</span><span class="mc-nome">${u.members.length} pessoas</span><span class="mc-linha" aria-hidden="true"></span>
        <span class="mc-itens" aria-hidden="true">${u.members.map(m => `<span class="mc-it mc-it2"><span class="mc-t">${esc(nm(m))}</span><span class="mc-v">${brl(calc.per[m].total)}</span></span>`).join('')}</span>
        <span class="mc-tot"><span>TOTAL</span><span class="mc-valor num">${BRL(u.total)}</span></span></div></div>`;
    };
    return `
    ${d.isExample ? `<div class="banner ex-banner"><span><b>Comanda de exemplo</b></span><span class="grp"><button class="btn small ghost" id="ex-guide">Guia</button><button class="btn small ghost" id="clear-example">Sair</button></span></div>` : ''}
    ${d.live ? liveCardHTML() : ''}
    ${d.savedAt && !d.live ? `<div class="banner"><span>Esta comanda já está no histórico. As alterações são guardadas quando você salvar de novo.</span><button class="btn small ghost" id="new-bill-top">Encerrar edição</button></div>` : ''}
    ${calc.incomplete.length ? `<div class="banner warn"><span><b>Unidades a distribuir:</b> ${calc.incomplete.map(x => `${esc(x.it.name)} (${x.units} de ${x.it.qty})`).join(', ')}.</span></div>` : ''}
    ${calc.unassigned.length ? `<div class="banner warn"><span><b>Sem ninguém marcado, fora da conta:</b> ${esc(calc.unassigned.map(i => i.name).join(', '))}.</span></div>` : ''}

    <article class="cmd-una" aria-label="Comanda">
      <header class="cu-cab">
        <button type="button" class="cu-local" id="cmd-local">
          <span class="cu-nome ${d.place ? '' : 'vazio'}">${esc(d.place || 'Toque para dar nome')}<span class="cu-ico">${I.edit}</span></span>
          <span class="cu-quando">${fmtDateTime(d.createdAt)}</span><span class="so-leitor">. ${d.place ? 'Mudar o nome do local' : 'Dar nome ao local'}</span></button>
        <button type="button" class="cu-conta" id="cmd-conta" aria-label="Total: ${BRL(calc.total)}. ${esc(aj.join(', ') || 'Sem serviço')}. Abrir a conta da mesa: ajustes e fechar a comanda">
          <span class="cu-total">${BRL(calc.total)}</span><span class="cu-ico">${I.next}</span></button>
      </header>

      <div class="cm-corpo">
        <div class="cu-sec" id="groups-card" aria-label="Pessoas: quanto cada um paga">
          <div class="cu-tit">PESSOAS${d.people.length ? ` · ${d.people.length}` : ''}</div>
          <div class="cm-col dv-col" aria-hidden="true"><span>Nº</span><span>NOME</span><span>A PAGAR</span></div>
          ${calc.units.map(u => {
            // pagamento é assunto da comanda fechada: aqui, só o nome, o valor e o selo PAGO (quem saiu da mesa aparece, porque fica travado)
            const n = String(calc.units.indexOf(u) + 1).padStart(2, '0'), cls = pulou[u.id] ? 'pula' : '', pago = contaPaga(d, u, calc).estado === 'pago';
            const selo = pago ? '<span class="dv-selo" aria-hidden="true">PAGO</span>' : '', fala = pago ? ', pago' : '';
            if (u.members.length === 1) { const pid = u.members[0], r = calc.per[pid];
              return `<details class="dv-pes" data-kf-secao data-pes="${u.id}" ${pesAberto === u.id ? 'open' : ''}><summary class="dv-lin ${cls}" data-unit="${u.id}" data-drop="p:${u.id}" data-abrir="${pid}">
                <span class="dv-n">${n}</span><span class="dv-nome"><span>${esc(nm(pid))}</span>${!r.person.payService && d.service.enabled ? '<span class="dv-obs">sem serviço</span>' : ''}${saiu(d, pid) ? '<span class="dv-obs">saiu da mesa</span>' : ''}</span><span class="dv-v">${brl(u.total)}</span>${selo}<span class="so-leitor">${fala}. Mostrar atalhos. Segure e arraste sobre outra pessoa para juntar</span></summary>${atalhosPessoaHTML(u, calc, d)}</details>`; }
            return `<details class="dv-pes" data-kf-secao data-pes="${u.id}" ${pesAberto === u.id ? 'open' : ''}><summary class="dv-lin dv-grupo ${cls}" data-unit="${u.id}" data-drop="g:${u.id}" data-grupo="${u.id}">
              <span class="dv-n">${n}</span><span class="dv-nome"><span>${esc(u.name)}</span><span class="dv-obs">cupom compartilhado${cupomSaiu(d, u) ? ' · saiu da mesa' : ''}</span>${u.members.map(m => `<span class="dv-mem"><span>${esc(nm(m))}</span><span>${brl(calc.per[m].total)}</span></span>`).join('')}</span><span class="dv-v">${brl(u.total)}</span>${selo}<span class="so-leitor">${fala}. Mostrar atalhos</span></summary>${atalhosPessoaHTML(u, calc, d)}</details>`;
          }).join('')}
          <button type="button" class="it-novo dv-add" id="add-pessoa" data-drop="out"><span class="it-q ma-add">+</span><span class="ma-add">${d.people.length ? 'Pessoa' : 'Adicionar quem está na mesa'}</span><span class="it-q ma-des">×</span><span class="ma-des">Desfazer o cupom compartilhado</span><span></span></button>
        </div>

        <div class="cu-sec cmd-mesa-in">
          <div class="cu-tit">PEDIDOS${d.items.length ? ` · ${d.items.length}` : ''}${abertosN ? ` · ${abertosN} sem divisão` : ''}</div>
          <div class="cm-col" aria-hidden="true"><span>QTD</span><span>ITEM</span><span>VALOR</span></div>
          ${d.items.length ? `<div class="items">${itemsHTML}</div>` : ''}
          <button type="button" class="it-novo" id="it-novo"><span class="it-q">+</span><span>${d.items.length ? 'Novo item' : 'Lançar o primeiro item'}</span></button>
        </div>

        <button type="button" class="cm-pe" id="cm-pe">
          <span class="cm-l"><span>Consumo</span><span>${brl(calc.itemsGross + calc.freeValue)}</span></span>
          ${calc.freeValue ? `<span class="cm-l"><span>Cortesia</span><span>−${brl(calc.freeValue)}</span></span>` : ''}
          ${s.enabled ? `<span class="cm-l"><span>${esc(serviceLabel(d))}</span><span>${brl(calc.service)}</span></span>` : ''}
          ${d.couvert.enabled ? `<span class="cm-l"><span>Couvert</span><span>${brl(calc.couvert)}</span></span>` : ''}
          ${d.discount.enabled ? `<span class="cm-l"><span>Desconto</span><span>−${brl(calc.discount)}</span></span>` : ''}
          <span class="cm-l cm-tot"><span>TOTAL</span><span>${BRL(calc.total)}</span></span>
          <span class="cm-aj">Serviço, couvert e desconto ${I.next}</span><span class="so-leitor">. Abrir a conta da mesa: ajustes e fechar a comanda</span></button>
        <p class="cu-rodape">Conta Fácil · divida a conta</p>
      </div>
    </article>

    ${(() => {
      const fechar = d.items.length && d.people.length ? `<button type="button" class="kf-btn kf-pri fechar-btn" id="fechar-cmd">${I.receipt}<span>Fechar comanda</span></button>` : '';
      const lixo = !d.isExample && (d.items.length || d.people.length || d.place) ? `<button type="button" class="btn danger" id="cmd-excluir">${I.trash}Excluir comanda</button>` : '';
      return fechar || lixo ? `<div class="fim-acoes">${fechar}${lixo}</div>` : '';
    })()}

    ${d.live ? '' : liveCardHTML()}`;
  },
  bind(v) {
    const d = draft;
    $('#clear-example', v)?.addEventListener('click', () => { exitExample(); tab = 'inicio'; render(); window.scrollTo({ top: 0 }); });
    $('#ex-guide', v)?.addEventListener('click', () => guiaIniciar());
    $('#new-bill-top', v)?.addEventListener('click', () => { pending = {}; draft = blankDraft(); tab = 'inicio'; saveDraft(); render(); window.scrollTo({ top: 0 }); });
    if (d.fechada) { bindAoVivo(v); return bindFechada(v); }
    $('#cmd-local', v).addEventListener('click', localSheet);
    $('#cmd-conta', v).addEventListener('click', contaSheet);
    $('#cm-pe', v)?.addEventListener('click', contaSheet);
    $('#it-novo', v)?.addEventListener('click', () => { if (!d.people.length) { KitFacil.avisar('Primeiro, adicione quem está na mesa.'); pessoaNovaSheet(); return; } produtoSheet(); });
    $('#add-pessoa', v).addEventListener('click', pessoaNovaSheet);
    // mini comandas: tocar abre a pessoa; segurar e arrastar sobre outra junta as duas num cupom compartilhado
    const area = $('#groups-card', v);
    const abrir = e => {
      if (Date.now() - drag.droppedAt < 350) { if (e.target.closest('summary')) { e.preventDefault(); e.stopPropagation(); } return; }
      const pa = e.target.closest('[data-pa]');
      if (pa) {
        const c = compute(d), u = c.U[pa.dataset.pa]; if (!u) return;
        const t = sel => e.target.closest(sel);
        if (t('[data-pa-cupom]')) return cupomSheet(u.members[0]);
        if (t('[data-pa-mais]')) return u.members.length > 1 ? grupoSheet(u.id) : editarPessoaSheet(u.members[0]);
        if (t('[data-pa-juntar]')) { pesJuntando = !pesJuntando; render({ anchor: false }); if (pesJuntando && !guiaAtivo()) requestAnimationFrame(() => { const j = $('.pa-junta'); j?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); j?.querySelector('[data-pa-alvo]')?.focus({ preventScroll: true }); }); return; }
        if (t('[data-pa-svcabre]')) { pesSvc = !pesSvc; return render({ anchor: false }); }
        if (t('[data-pa-cvabre]')) { pesCv = !pesCv; return render({ anchor: false }); }
        if (t('[data-pa-desfaz]')) { const antes = clone(d.groups || []); u.members.forEach(m => leaveGroup(d, m)); pesAberto = null; commit({ anchor: false }); KitFacil.avisar('Cada um voltou a ter o seu cupom.', { label: 'Desfazer', run: () => { d.groups = antes; commit(); } }); return; }
        const alvo = t('[data-pa-alvo]');
        if (alvo) { const antes = clone(d.groups || []); if (joinGroup(d, u.members[0], alvo.dataset.paAlvo)) { pesAberto = null; pesJuntando = false; commit({ anchor: false }); destacarCupom(u.members[0]); KitFacil.avisar('Agora estão no mesmo cupom.', { label: 'Desfazer', run: () => { d.groups = antes; commit(); } }); } }
        return;
      }
    };
    area.addEventListener('click', abrir);
    area.addEventListener('change', e => {
      const pa = e.target.closest('[data-pa]'); if (!pa) return;
      const c = compute(d), u = c.U[pa.dataset.pa]; if (!u) return;
      const el = e.target, p = d.people.find(x => x.id === u.members[0]);
      if (el.matches('[data-pa-svc]')) { const p = d.people.find(x => x.id === el.dataset.paSvc); if (!p) return; p.payService = el.checked; commit({ anchor: false }); if (!el.checked) politicaSheet(d, p); return; }
      if (el.matches('[data-pa-cv]')) { const q = d.people.find(x => x.id === el.dataset.paCv) || p; if (q) { q.payCouvert = el.checked; commit({ anchor: false }); } }
    });
    area.addEventListener('touchstart', e => {
      if (e.touches.length !== 1) return dragCancel();
      const src = dragSource(e.target); if (!src) return;
      const t = e.touches[0];
      drag.pend = { ...src, x: t.clientX, y: t.clientY };
      clearTimeout(drag.timer); drag.timer = setTimeout(() => dragStart(drag.pend.x, drag.pend.y), 320);
    }, { passive: true });
    area.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse' || e.button) return;
      const src = dragSource(e.target); if (src) drag.pend = { ...src, x: e.clientX, y: e.clientY, mouse: true };
    });
    $('#fechar-cmd', v)?.addEventListener('click', () => fecharComanda());
    { const c = compute(d); animarBotaoFechar(c.unassigned.length || c.incomplete.length || c.openItems.length ? null : $('#fechar-cmd', v)); }
    $('#cmd-excluir', v)?.addEventListener('click', () => deleteCurrent(true));
    $$('[data-it-alt]', v).forEach(b => b.addEventListener('click', () => { const it = d.items.find(i => i.id === b.dataset.itAlt); if (it) renameSheet(it); }));
    const rasc = id => { const it = d.items.find(i => i.id === id); if (!it) return null; if (!itPend[id]) itPend[id] = { qty: it.qty, a: { ...it.a }, fq: it.fq || 0 }; return [it, itPend[id]]; };
    const repinta = () => render({ anchor: false });
    $$('[data-it-fq]', v).forEach(b => b.addEventListener('click', () => { const r = rasc(b.dataset.itFq); if (!r) return; const [, p] = r; p.fq = Math.max(0, Math.min(p.qty, p.fq + +b.dataset.dir)); repinta(); }));
    $$('[data-it-q]', v).forEach(b => b.addEventListener('click', () => { const r = rasc(b.dataset.itQ); if (!r) return; const [, p] = r; p.qty = Math.max(1, p.qty + +b.dataset.dir); p.fq = Math.min(p.fq, p.qty); repinta(); }));
    $$('[data-it-u]', v).forEach(b => b.addEventListener('click', () => { const r = rasc(b.dataset.itU); if (!r) return; const [, p] = r, pid = b.dataset.p, dir = +b.dataset.dir;
      if (dir < 0 && (!(p.a[pid] > 0) || p.qty <= 1)) return;
      p.a = { ...p.a, [pid]: (p.a[pid] || 0) + dir }; if (!p.a[pid]) delete p.a[pid]; p.qty += dir; p.fq = Math.min(p.fq, p.qty); repinta(); }));
    $$('[data-it-desc]', v).forEach(b => b.addEventListener('click', () => { delete itPend[b.dataset.itDesc]; repinta(); }));
    $$('[data-it-ok]', v).forEach(b => b.addEventListener('click', () => { const it = d.items.find(i => i.id === b.dataset.itOk), p = it && itPend[it.id]; if (!p) return;
      it.qty = p.qty; it.a = p.a; it.fq = p.fq; it.auto = false; delete itPend[it.id]; commit({ anchor: false }); KitFacil.avisar(`${it.name}: alteração salva.`); }));
    $$('[data-it-del]', v).forEach(b => b.addEventListener('click', () => { const it = d.items.find(i => i.id === b.dataset.itDel); if (!it) return;
      confirmSheet(`Remover ${it.name}?`, `${it.qty} × ${BRL(it.price)} sairá da comanda.`, 'Remover', () => { delete pending[it.id]; d.items = d.items.filter(i => i.id !== it.id); if (itemAberto === it.id) itemAberto = null; commit(); }, true); }));

    bindAoVivo(v);

    // itens ainda sem divisão confirmada: continuam com a lista de marcar e o Confirmar
    $$('.item[data-item]', v).forEach(card => {
      const it = d.items.find(i => i.id === card.dataset.item);
      if (!it || it.lk) return;
      $('[data-rename]', card)?.addEventListener('click', () => renameSheet(it));
      $('[data-del]', card)?.addEventListener('click', () => confirmSheet(`Remover ${it.name}?`, `${it.qty} × ${BRL(it.price)} sairá da comanda.`, 'Remover', () => { d.items = d.items.filter(i => i.id !== it.id); commit(); }, true));
      $('[data-confirm]', card)?.addEventListener('click', () => { it.lk = true; it.auto = false; commit(); KitFacil.avisar(`${it.name}: divisão confirmada.`); });
      $$('[data-unit]', card).forEach(b => b.addEventListener('click', () => {
        const id = b.dataset.unit, dir = +b.dataset.dir;
        const used = Object.values(it.a).reduce((s, x) => s + x, 0);
        if (dir > 0 && used >= it.qty) return;
        const nv = (it.a[id] || 0) + dir;
        if (nv <= 0) delete it.a[id]; else it.a[id] = nv;
        commit();
      }));
      $$('[data-toggle]', card).forEach(b => b.addEventListener('click', () => { const id = b.dataset.toggle; if ((it.a[id] || 0) > 0) delete it.a[id]; else it.a[id] = 1; commit(); }));
      $('[data-all]', card)?.addEventListener('click', e => { it.a = e.currentTarget.dataset.all === 'all' ? Object.fromEntries(d.people.map(p => [p.id, it.a[p.id] || 1])) : {}; commit(); });
      $$('[data-q]', card).forEach(b => b.addEventListener('click', () => { it.qty = Math.max(1, it.qty + +b.dataset.q); it.fq = Math.min(it.fq || 0, it.qty); commit(); }));
    });
  },
};

// quem passa a não pagar perde o valor personalizado e o "quem cobre a diferença"
function dropCustom(d, pid) {
  if (d.custom) delete d.custom[pid];
  if (d.cover) { delete d.cover[pid]; Object.keys(d.cover).forEach(k => { if (d.cover[k] === pid) delete d.cover[k]; }); }
}
// juntar a pessoa "pid" ao grupo de "target" (pessoa ou grupo); quem entra não paga até ser marcado como "paga"
function joinGroup(d, pid, target) {
  const groups = cleanGroups(d);
  const leave = id => groups.forEach(g => { g.members = g.members.filter(m => m !== id); g.payers = g.payers.filter(m => m !== id); });
  let dest;
  if (target.startsWith('g:')) dest = groups.find(g => g.id === target.slice(2));
  else {
    const other = target.slice(2); if (other === pid) return false;
    dest = groups.find(g => g.members.includes(other));
    if (!dest) { leave(pid); dest = { id: newId(), members: [other], payers: [other] }; groups.push(dest); }
  }
  if (!dest || dest.members.includes(pid)) return false;
  leave(pid); dest.members.push(pid); dropCustom(d, pid);
  d.groups = groups.map(g => ({ ...g, payers: g.payers.length ? g.payers : g.members.slice(0, 1) })).filter(g => g.members.length > 1);
  return true;
}
function leaveGroup(d, pid) {
  d.groups = cleanGroups(d).map(g => ({ ...g, members: g.members.filter(m => m !== pid), payers: g.payers.filter(m => m !== pid) }))
    .map(g => ({ ...g, payers: g.payers.length ? g.payers : g.members.slice(0, 1) })).filter(g => g.members.length > 1);
}
const c_groupOf = (d, pid) => cleanGroups(d).find(g => g.members.includes(pid))?.id || null;
// arrastar cartões de pagamento: segurar um instante levanta o cartão; deslizar sem segurar rola a página
const drag = { pend: null, timer: 0, on: null, x: 0, y: 0, ghost: null, over: null, raf: 0, droppedAt: 0 };
function dragSource(el) {
  // as linhas com chave também levantam o cartão; só a chave e os botões ficam de fora
  if (!el.closest || el.closest('button, input, select, textarea, a, .kf-chave, label:not(.prow)')) return null;
  const box = el.closest('#groups-card [data-unit]'); if (!box) return null;
  const c = compute(draft), u = c.U[box.dataset.unit]; if (!u || u.members.some(m => saiu(draft, m))) return null;
  const multi = u.members.length > 1;
  // num cupom compartilhado, segurar a parte de uma pessoa leva só ela; segurar o topo leva o grupo todo
  const m = multi && el.closest('[data-mem]')?.dataset.mem;
  const pids = !multi ? [u.members[0]] : m ? [m] : [...u.members];
  return { unit: u.id, pids, group: multi, whole: multi && pids.length > 1 };
}
function dragCancel() { clearTimeout(drag.timer); drag.pend = null; }
// o cupom que acabou de juntar pessoas pisca de leve e assenta no lugar
function destacarCupom(pid) {
  requestAnimationFrame(() => {
    const uid = compute(draft).unitOf[pid], el = uid && $(`#groups-card [data-unit="${CSS.escape(uid)}"]`); if (!el) return;
    try { navigator.vibrate?.([10, 40, 18]); } catch {}
    if (MV().off) return;
    el.animate([{ transform: 'scale(.96)', backgroundColor: 'rgba(232,180,80,.55)' }, { transform: 'scale(1.015)', backgroundColor: 'rgba(232,180,80,.35)', offset: .35 }, { transform: 'none', backgroundColor: 'rgba(232,180,80,0)' }], { duration: 900, easing: 'cubic-bezier(.2,.8,.2,1)' });
    $$('.dv-obs, .dv-mem', el).forEach((x, i) => x.animate([{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }], { duration: 420, delay: 120 + i * 70, easing: 'ease-out', fill: 'backwards' }));
  });
}
function dragStart(x, y) {
  const p = drag.pend; dragCancel(); if (!p || drag.on) return;
  const c = compute(draft), u = c.U[p.unit]; if (!u) return;
  const one = p.pids.length === 1, per = one && c.per[p.pids[0]];
  const name = one ? per.person.name : u.name, total = one ? per.total : u.total;
  const orig = p.whole || one ? $('#groups-card [data-unit="' + CSS.escape(p.unit) + '"]') : null;
  let g;
  if (orig) { // 1.0: arrasta o próprio cupom, não uma etiqueta com o nome
    g = orig.cloneNode(true); ['role', 'tabindex', 'data-unit', 'data-drop'].forEach(k => g.removeAttribute(k)); $$('[data-unit],[data-drop],[tabindex],[role]', g).forEach(x => ['role', 'tabindex', 'data-unit', 'data-drop'].forEach(k => x.removeAttribute(k)));
    // o cupom sai do lugar exatamente onde estava, preso ao ponto em que o dedo tocou
    const rc = orig.getBoundingClientRect();
    drag.off = { x: p.x - rc.left, y: p.y - rc.top }; drag.casa = rc;
    g.classList.add('drag-cupom'); g.style.width = rc.width + 'px'; g.style.height = rc.height + 'px'; g.setAttribute('aria-hidden', 'true');
    g.style.transform = `translate(${rc.left}px, ${rc.top}px)`;
  } else {
    g = document.createElement('div'); g.className = 'drag-ghost';
    g.innerHTML = `<span class="dg-avs">${p.pids.slice(0, 3).map(id => avatar(c.per[id].person.name)).join('')}</span><span class="dg-name">${esc(name)}</span><b class="num">${BRL(total)}</b>`;
  }
  document.body.appendChild(g);
  if (orig) requestAnimationFrame(() => g.classList.add('no-ar'));
  drag.on = p; drag.ghost = g;
  document.body.classList.add('is-dragging'); document.body.classList.toggle('drag-out', p.group);
  const out = $('.drop-out'); if (out) out.textContent = p.whole ? 'Solte aqui para desfazer o cupom compartilhado' : 'Solte aqui para sair do cupom compartilhado';
  try { navigator.vibrate?.(12); } catch {}
  dragMove(x, y);
  cancelAnimationFrame(drag.raf); drag.raf = requestAnimationFrame(dragScroll);
}
function dragTarget(x, y) {
  const t = document.elementFromPoint(x, y)?.closest('#groups-card [data-drop]');
  if (t && t.dataset.drop === 'out' && !drag.on.group) return null; // "+ Pessoa" só desfaz grupo
  if (t && t.dataset.unit) { const u = compute(draft).U[t.dataset.unit]; if (u && u.members.some(m => saiu(draft, m))) return null; }
  return t && t.dataset.unit !== drag.on.unit ? t : null;
}
function dragMove(x, y) {
  drag.x = x; drag.y = y;
  const g = drag.ghost; if (!g) return;
  g.style.transform = g.classList.contains('drag-cupom') ? `translate(${Math.round(x - drag.off.x)}px, ${Math.round(y - drag.off.y)}px)` : `translate(${Math.round(x - g.offsetWidth / 2)}px, ${Math.round(y - g.offsetHeight - 34)}px)`;
  $('#groups-card [data-unit="' + CSS.escape(drag.on.unit) + '"]')?.classList.add('lifting');
  const t = dragTarget(x, y);
  if (drag.over !== t) { drag.over?.classList.remove('drop-on'); drag.over = t; t?.classList.add('drop-on'); }
}
// perto do topo ou do pé da tela, a página rola sozinha para alcançar os outros cartões
function dragScroll() {
  if (!drag.on) return;
  // 1.13: as bordas vêm da barra do topo e da barra de seções do pé (que mudou de lugar no Kit); antes a conta
  // usava a barra de seções como se estivesse no alto e a página subia sem parar só de segurar um nome
  const vis = el => el && el.getClientRects().length ? el.getBoundingClientRect() : null;
  const barra = vis($('#barra')), nav = vis($('.kf-nav'));
  const top = (barra ? barra.bottom : 0) + 56;
  const bot = (nav && nav.top > window.innerHeight / 2 ? nav.top : window.innerHeight) - 56;
  const v = drag.y < top ? -Math.min(16, (top - drag.y) / 3) : drag.y > bot ? Math.min(16, (drag.y - bot) / 3) : 0;
  if (v) { window.scrollBy(0, v); dragMove(drag.x, drag.y); }
  drag.raf = requestAnimationFrame(dragScroll);
}
function dragEnd(drop) {
  const p = drag.on; if (!p) return dragCancel();
  cancelAnimationFrame(drag.raf);
  const t = drop ? dragTarget(drag.x, drag.y) : null, g = drag.ghost, casa = drag.casa;
  drag.ghost = null; drag.on = null; drag.over = null; drag.casa = null;
  document.body.classList.remove('is-dragging', 'drag-out');
  drag.droppedAt = Date.now();
  const aplicar = () => {
    $$('.drop-on').forEach(x => x.classList.remove('drop-on')); $$('.lifting').forEach(x => x.classList.remove('lifting'));
    if (!t) return;
    const d = draft, to = t.dataset.drop;
    if (to === 'out') { if (!p.group) return; p.pids.forEach(pid => leaveGroup(d, pid)); commit(); KitFacil.avisar(p.whole ? 'Grupo desfeito.' : 'Saiu do grupo.'); return; }
    let dest = to, changed = false;
    p.pids.forEach(pid => { if (joinGroup(d, pid, dest)) { changed = true; const gid = c_groupOf(d, pid); if (gid) dest = 'g:' + gid; } });
    if (changed) { LS.set('dicaJuntar', true); commit(); destacarCupom(p.pids[0]); KitFacil.avisar('Agora estão no mesmo cupom.'); } else render({ preserve: true });
  };
  // 1.0: o cupom pousa — entra no cupom de destino ou volta para o seu lugar
  const suave = g && g.classList.contains('drag-cupom') && !matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!suave) { g?.remove(); return aplicar(); }
  const alvo = t && t.dataset.drop !== 'out' ? t.getBoundingClientRect() : null;
  g.classList.remove('no-ar'); g.classList.add(alvo ? 'pousa-alvo' : t ? 'pousa-fora' : 'pousa-casa');
  if (alvo) g.style.transform = `translate(${alvo.left + alvo.width / 2 - g.offsetWidth / 2}px, ${alvo.top + alvo.height / 2 - g.offsetHeight / 2}px)`;
  else if (!t && casa) g.style.transform = `translate(${casa.left}px, ${casa.top}px)`;
  let feito = false; const fim = () => { if (feito) return; feito = true; g.remove(); aplicar(); };
  g.addEventListener('transitionend', e => { if (e.propertyName === 'transform' || e.propertyName === 'opacity') fim(); });
  setTimeout(fim, 320);
}
document.addEventListener('touchmove', e => {
  const t = e.touches[0]; if (!t) return;
  if (drag.on) { e.preventDefault(); dragMove(t.clientX, t.clientY); return; }
  if (drag.pend && Math.hypot(t.clientX - drag.pend.x, t.clientY - drag.pend.y) > 8) dragCancel();
}, { passive: false });
document.addEventListener('touchend', e => { if (drag.on) { e.preventDefault(); dragEnd(true); } else dragCancel(); }, { passive: false });
document.addEventListener('touchcancel', () => drag.on ? dragEnd(false) : dragCancel());
document.addEventListener('contextmenu', e => { if (drag.on || drag.pend) e.preventDefault(); });
document.addEventListener('pointermove', e => {
  if (e.pointerType !== 'mouse') return;
  if (drag.on) { dragMove(e.clientX, e.clientY); return; }
  if (drag.pend?.mouse && Math.hypot(e.clientX - drag.pend.x, e.clientY - drag.pend.y) > 6) dragStart(e.clientX, e.clientY);
});
document.addEventListener('pointerup', e => { if (e.pointerType !== 'mouse') return; drag.on ? dragEnd(true) : dragCancel(); });
window.addEventListener('blur', () => drag.on && dragEnd(false));
// cartão único de pagamento: quem pagou o local, grupos e quanto cada um paga, numa caixa por cupom
/* 1.4: "Uma pessoa paga a conta de todos" fica em Fechar a comanda e não junta ninguém: cada um continua com o seu
   cupom, que passa a dizer quanto pagar a quem pagou a conta */
function pagaTodos(d, pid) { d.payMode = pid ? 'single' : 'none'; d.payer = pid || ''; if (pid && d.custom) delete d.custom[pid]; }
/* 1.13: quem não paga o serviço. A pergunta aparece numa janela na hora em que o serviço é desligado na pessoa
   (antes surgia lá no alto, em Taxa de serviço, sem aviso) */
function politicaSheet(d, p) {
  const s = d.service, c = compute(d);
  const quem = p ? p.name : c.skipped.map(id => c.per[id].person.name).join(', ');
  const valor = p ? (c.per[p.id]?.serviceNominal || 0) : c.skippedValue;
  // a escolha só marca; quem decide é o Confirmar. Cancelar (ou fechar a janela) deixa tudo como estava antes da chave
  let sel = s.policy === 'redistribute' ? 'redistribute' : 'discount', confirmou = false;
  const op = (k, t) => `<button type="button" class="lanc-op" data-pol="${k}" aria-pressed="${sel === k}"><span class="pol-ck" aria-hidden="true">${I.check}</span><span><b>${t}</b></span></button>`;
  const desistir = () => { if (confirmou || !p) return; confirmou = true; const q = d.people.find(x => x.id === p.id); if (q && !q.payService) { q.payService = true; commit({ anchor: false }); } };
  openSheet({ title: `${quem} não paga o serviço`, onClose: desistir,
    body: `<p class="pol-perg">${valor ? `O que fazer com ${BRL(valor)} de serviço?` : 'O que fazer com essa parte do serviço?'}</p><div class="lanc-ops" role="group" aria-label="O que fazer com essa parte do serviço">${op('discount', 'Ninguém paga essa parte')}${op('redistribute', 'Os outros dividem essa parte')}</div>`,
    foot: `<button type="button" class="btn ghost" id="pol-no">Cancelar</button><button type="button" class="btn" id="pol-ok">${I.check}Confirmar</button>`,
    onMount: dl => {
      $$('[data-pol]', dl).forEach(b => b.addEventListener('click', () => { sel = b.dataset.pol; $$('[data-pol]', dl).forEach(x => x.setAttribute('aria-pressed', String(x === b))); }));
      $('#pol-no', dl).addEventListener('click', () => { desistir(); confirmou = true; closeSheet(true); });
      $('#pol-ok', dl).addEventListener('click', () => { confirmou = true; s.policy = sel; closeSheet(true); commit({ anchor: false }); KitFacil.avisar(sel === 'discount' ? 'Ninguém paga essa parte.' : 'Os outros dividem essa parte.'); });
    } });
}
function saveBill(opts = {}) {
  const d = draft, c = compute(d);
  if (d.isExample) { KitFacil.avisar('No exemplo, nada é salvo no histórico.'); return; }
  if (c.unassigned.length || c.incomplete.length) { KitFacil.avisar('Acerte a divisão de todos os itens antes de salvar.'); return; }
  if (d.items.some(pendingDirty)) { KitFacil.avisar('Há itens com alterações não salvas. Salve ou descarte antes de continuar.'); return; }
  if (c.openItems.length) { KitFacil.avisar(`Confirme a divisão de ${plural(c.openItems.length, 'item', 'itens')} antes de salvar.`); return; }
  if (c.missingPayer) { KitFacil.avisar('Escolha quem vai pagar a conta em Pagamento antes de salvar.'); return; }
  if (c.payDiff !== 0) { KitFacil.avisar(`Os valores personalizados ${c.payDiff > 0 ? 'passam' : 'ficam'} ${BRL(Math.abs(c.payDiff))} ${c.payDiff > 0 ? 'do' : 'abaixo do'} total. Ajuste antes de salvar.`); return; }
  const difs = pagosComDiferenca(d, c);
  if (difs.length && !opts.comDiferenca) { confirmSheet('Salvar com diferença?', difs.map(x => fraseDiferenca(x.u, x.p)).join(' ') + ' A comanda fica salva assim, com a diferença anotada.', 'Salvar assim', () => saveBill({ comDiferenca: true })); return; }
  const firstSave = !bills.some(b => b.id === d.id);
  const antes = { draft: clone(d), bills: clone(bills), catalog: clone(catalog), tab }, eraAoVivo = !!draft.live, jogoAntes = { ...jogoEstado() };
  const now = Date.now();
  d.savedAt = now;
  const { live: _l, isExample: _e, ...rest } = d;
  const bill = clone({ ...rest, closedAt: firstSave ? now : (bills.find(b => b.id === d.id)?.closedAt || now), total: c.total });
  bills = [bill, ...bills.filter(b => b.id !== bill.id)].sort((a, b) => b.closedAt - a.closedAt);
  d.people.forEach(p => {
    const k = catalog.people.find(x => norm(x.name) === norm(p.name));
    if (k) k.last = now; else catalog.people.push({ name: p.name, last: now });
  });
  d.items.forEach(it => rememberPrice(it.name, it.price, d.place, now));
  store.saveCatalog(); store.saveBill(bill);
  if (draft.live) live.end();
  pending = {};
  draft = blankDraft(); tab = 'inicio';
  saveDraft(); render(); window.scrollTo({ top: 0 });
  // salvar tem volta (a comanda ao vivo, se havia, já foi encerrada e não volta)
  const desfazer = eraAoVivo ? null : () => {
    bills = antes.bills; catalog = antes.catalog; draft = antes.draft; draft.savedAt = firstSave ? null : draft.savedAt; tab = 'comanda';
    jogoMemo.chave = ''; store.saveBill(); store.saveCatalog(); saveDraft(); render(); window.scrollTo({ top: 0 });
  };
  if (firstSave && festa(bill, jogoAntes, { desfazer })) return;
  KitFacil.avisar(firstSave ? 'Comanda salva no histórico.' : 'Comanda atualizada no histórico.', desfazer ? { label: 'Desfazer', run: desfazer } : undefined);
}

/* ---------- aba Ajustes: só as guias comuns do Kit Fácil ---------- */
function baixarCopiaConta() {
  const real = draft.isExample ? loadRealDraft() : draft;
  KitFacil.copia.baixar({ bills, catalog, draft: real.active ? real : null }, 1);
}
async function restaurarCopiaConta(f) {
  const j = await KitFacil.copia.ler(f);
  const d = j && j.dados;
  if (!d || !Array.isArray(d.bills) || !d.catalog || typeof d.catalog !== 'object') { KitFacil.avisar('Esse arquivo não é uma cópia do Conta Fácil.'); return; }
  const quando = fmtDate(Date.parse(j.em) || Date.now());
  const ppl = Array.isArray(d.catalog.people) ? d.catalog.people.length : 0;
  KitFacil.dialogo.confirmar({ titulo: 'Restaurar a cópia?', ok: 'Restaurar', perigo: true,
    texto: `A cópia de ${quando} tem ${plural(d.bills.length, 'comanda salva', 'comandas salvas')} e ${plural(ppl, 'pessoa cadastrada', 'pessoas cadastradas')}. O histórico e os cadastros deste aparelho${SY.ligada() ? ' e dos aparelhos sincronizados' : ''} serão substituídos.`,
    aoConfirmar: () => {
      bills = d.bills.map(migrate).sort(ordemBills);
      catalog = fixCatalog(d.catalog);
      store.saveBill(); store.saveCatalog();
      const real = draft.isExample ? loadRealDraft() : draft;
      let extra = '';
      if (d.draft && !real.active && !draft.live && !draft.isExample) { draft = migrate(d.draft); saveDraft(); extra = ' A comanda que estava aberta também voltou.'; }
      render(); KitFacil.avisar('Cópia restaurada.' + extra);
    } });
}