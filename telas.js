/* Conta Fácil · telas de apoio: Início, Histórico, Cadastros e Mais. A comanda fica em app.js; as tampinhas, em jogo.js. */

/* ---------- ícones e ilustrações ---------- */
Object.assign(I, {
  tampa: '<svg class="i" viewBox="0 0 24 24"><path d="M12 2.8l1.7 1.3 2.1-.4 1 1.900 2 .8-.1 2.100 1.500 1.500-1 1.900.7 2-1.700 1.300-.2 2.100-2.100.5-1.100 1.800-2.100-.4-1.700 1.300-1.700-1.300-2.100.4-1.100-1.800-2.100-.5-.2-2.100-1.700-1.300.7-2-1-1.900L4.200 8.500l-.1-2.100 2-.8 1-1.900 2.100.4z"/><circle cx="12" cy="12" r="4.200"/></svg>',
  mais: '<svg class="i" viewBox="0 0 24 24"><circle cx="5.500" cy="12" r="1.300"/><circle cx="12" cy="12" r="1.300"/><circle cx="18.500" cy="12" r="1.300"/></svg>',
  livro: '<svg class="i" viewBox="0 0 24 24"><path d="M4 5.500c2.800-1 5.500-.8 8 .7 2.500-1.500 5.200-1.700 8-.7V19c-2.800-1-5.500-.8-8 .700-2.500-1.500-5.200-1.700-8-.7zM12 6.200V19.700"/></svg>',
  estrela: '<svg class="i" viewBox="0 0 24 24"><path d="m12 3.500 2.600 5.400 5.900.8-4.300 4.100 1.100 5.900L12 16.900l-5.300 2.800 1.100-5.900-4.300-4.100 5.900-.8z"/></svg>',
  presente: '<svg class="i" viewBox="0 0 24 24"><rect x="4" y="11" width="16" height="9" rx="1.500"/><path d="M3 7.500h18V11H3zM12 7.500V20M12 7.500C10.500 3.500 6 4.200 7 6.500c.700 1.400 3 1.300 5 1zm0 0c1.500-4 6-3.300 5-1-.700 1.400-3 1.300-5 1z"/></svg>',
  pino: '<svg class="i" viewBox="0 0 24 24"><path d="M12 21s-6.500-5.700-6.500-10.800a6.500 6.500 0 0 1 13 0C18.500 15.300 12 21 12 21z"/><circle cx="12" cy="10" r="2.300"/></svg>',
  sparkle: '<svg class="i" viewBox="0 0 24 24"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.500 2.500M15.500 15.500 18 18M18 6l-2.500 2.500M8.500 15.500 6 18"/></svg>',
  garrafa: '<svg class="i" viewBox="0 0 24 24"><path d="M10 3h4v4l2.500 3.500V20a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1v-9.500L10 7z"/><path d="M7.500 14h9"/></svg>',
  exemplo: '<svg class="i" viewBox="0 0 24 24"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="m10 9.500 4.500 2.700-4.500 2.800z"/></svg>',
});
const ILU = {
  // mesa de bar vista de cima, com uma comanda e duas tampinhas
  mesa: `<svg viewBox="0 0 160 110" aria-hidden="true"><ellipse cx="80" cy="62" rx="72" ry="40" fill="var(--green-soft)"/><ellipse cx="80" cy="58" rx="72" ry="40" fill="var(--surface)" stroke="var(--line-2)" stroke-width="2"/>
    <g transform="rotate(-8 80 52)"><path d="M58 26h44v52l-5.500-4-5.500 4-5.500-4-5.500 4-5.500-4-5.500 4-5.500-4-5.500 4z" fill="#FFFDF5" stroke="var(--line-2)" stroke-width="1.500"/><path d="M66 38h28M66 47h28M66 56h16" stroke="#D3931A" stroke-width="3" stroke-linecap="round"/></g>
    <circle cx="122" cy="72" r="9" fill="#D9483B"/><circle cx="122" cy="72" r="5.500" fill="none" stroke="#fff" stroke-opacity=".6" stroke-dasharray="1.500 2.500"/><circle cx="36" cy="46" r="7" fill="#2E8B5C"/><circle cx="36" cy="46" r="4" fill="none" stroke="#fff" stroke-opacity=".6" stroke-dasharray="1.500 2.500"/></svg>`,
  // comanda em branco
  papel: `<svg viewBox="0 0 160 110" aria-hidden="true"><g transform="rotate(5 80 55)"><path d="M48 10h64v88l-8-6-8 6-8-6-8 6-8-6-8 6-8-6-8 6z" fill="#FFFDF5" stroke="var(--line-2)" stroke-width="1.500"/><path d="M60 28h40M60 42h40M60 56h40M60 70h22" stroke="var(--line-2)" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 7"/></g></svg>`,
};
const primeiroNome = n => String(n || '').trim().split(/\s+/)[0] || '';
const fmtDia = ts => new Date(ts).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
const mesNome = (y, m) => { const s = new Date(y, m, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }); return s.charAt(0).toUpperCase() + s.slice(1); };
// quanto a pessoa "eu" gastou numa comanda salva (null se não estava nela)
function meuTotal(b, c) { const eu = catalog.me && b.people.find(p => norm(p.name) === norm(catalog.me)); return eu ? (c || compute(b)).per[eu.id].total : null; }
let cacheBills = new WeakMap();
const calcBill = b => { let c = cacheBills.get(b); if (!c) { c = compute(b); cacheBills.set(b, c); } return c; };

/* ---------- nova comanda ---------- */
function novaComandaSheet() {
  const U = usage(), lugares = recentPlaces(U).slice(0, 5), turmas = [...(catalog.groups || [])].sort(ordemNome);
  let turma = '';
  openSheet({ title: 'Nova comanda', body: `<form id="nc-form" class="pilha" autocomplete="off">
      <div class="field"><label for="nc-local">Onde vai ser?</label><input id="nc-local" type="text" autocapitalize="words" autocomplete="off" placeholder="Nome do bar ou restaurante" maxlength="80"></div>
      ${lugares.length ? `<div class="chips" role="group" aria-label="Lugares recentes">${lugares.map(l => `<button type="button" class="chip" data-nc-lugar="${esc(l.name)}">${I.pino}${esc(l.name)}</button>`).join('')}</div>` : ''}
      ${turmas.length ? `<div class="field"><span class="eyebrow" id="nc-t">Já pôr uma turma na mesa</span><div class="chips" role="group" aria-labelledby="nc-t">${turmas.map(g => `<button type="button" class="chip" data-nc-turma="${esc(g.id)}" aria-pressed="false">${I.users}${esc(g.name)} · ${g.members.length}</button>`).join('')}</div></div>` : ''}
    </form>`,
    foot: `<button type="button" class="btn ghost" id="nc-no">Cancelar</button><button type="submit" form="nc-form" class="btn chopp">Abrir comanda</button>`,
    onMount: s => {
      const inp = $('#nc-local', s);
      const abrir = lugar => { const g = (catalog.groups || []).find(x => x.id === turma); closeSheet(true); newBillAt(String(lugar || '').trim().replace(/\s+/g, ' '), g ? g.members : null); };
      attachSuggest(inp, () => recentPlaces(U).map(p => ({ label: p.name, right: plural(p.n, 'vez', 'vezes'), dim: true })));
      $$('[data-nc-lugar]', s).forEach(b => b.onclick = () => abrir(b.dataset.ncLugar));
      $$('[data-nc-turma]', s).forEach(b => b.onclick = () => { turma = turma === b.dataset.ncTurma ? '' : b.dataset.ncTurma; $$('[data-nc-turma]', s).forEach(x => x.setAttribute('aria-pressed', String(x.dataset.ncTurma === turma))); });
      $('#nc-no', s).onclick = () => closeSheet();
      $('#nc-form', s).addEventListener('submit', e => { e.preventDefault(); abrir(inp.value); });
      if (!isTouch) inp.focus();
    } });
}
function entrarAoVivo(valor) {
  const code = String(valor || '').toLowerCase().replace(/^.*#m/, '').replace(/[^a-z0-9]/g, '');
  if (!/^[a-z0-9]{6,16}$/.test(code)) { toast('Código inválido. Ele tem 10 letras e números.'); return false; }
  if (!store.db) { toast(store.ready ? 'A comanda ao vivo precisa de internet. Verifique a conexão e tente de novo.' : 'Conectando… tente de novo em instantes.'); return false; }
  live.browserOk = true;
  if (location.hash === '#m' + code) live.boot(); else location.hash = '#m' + code;
  return true;
}

/* ---------- Início ---------- */
let aoVivoAberto = false, heroVisto = false;
const viewInicio = {
  html() {
    const d = draft, U = usage(), lugares = recentPlaces(U).slice(0, 3), s = jogoEstado();
    const h = new Date().getHours(), oi = h < 5 ? 'Boa noite' : h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
    const n = String(bills.length + 1).padStart(3, '0');
    const anima = heroVisto ? '' : 'sai'; heroVisto = true;
    let papel;
    if (d.active && !d.isExample) {
      const c = compute(d), falta = faltaReceber(d, c), pend = d.items.filter(it => !it.lk).length;
      papel = `<span class="mono ip-n">COMANDA Nº ${n} · ABERTA${d.live ? ' · AO VIVO' : ''}</span>
        <h1 class="ip-t">${esc(d.place || 'Comanda sem nome')}</h1>
        <div class="ip-linhas mono"><span><span>Pessoas</span><span>${d.people.length}</span></span><span><span>Pedidos</span><span>${d.items.length}${pend ? ` (${pend} sem divisão)` : ''}</span></span>
          <span class="ip-tot"><span>TOTAL</span><span>${BRL(c.total)}</span></span>${falta < c.total ? `<span><span>Falta pagar</span><span>${BRL(falta)}</span></span>` : ''}</div>
        <button type="button" class="btn bloco ip-btn" id="ini-continuar">${I.receipt}Continuar a comanda</button>`;
    } else {
      papel = `<span class="mono ip-n">COMANDA Nº ${n}</span>
        <h1 class="ip-t"><label for="ini-local">Onde vai ser hoje?</label></h1>
        <form id="ini-form" class="pilha" autocomplete="off"><input id="ini-local" type="text" autocapitalize="words" autocomplete="off" placeholder="Nome do bar" maxlength="80" data-keep>
          <button type="submit" class="btn chopp bloco">Abrir comanda</button></form>
        ${lugares.length ? `<div class="chips ip-chips" role="group" aria-label="Voltar a um lugar">${lugares.map(l => `<button type="button" class="chip" data-ini-lugar="${esc(l.name)}">${I.pino}${esc(l.name)}</button>`).join('')}</div>` : ''}`;
    }
    const proxima = jogoLigado() ? TAMPINHAS.find(t => !s.ganhas.includes(t.id)) : null;
    // este mês
    const agora = new Date(), doMes = bills.filter(b => { const x = new Date(b.closedAt); return x.getFullYear() === agora.getFullYear() && x.getMonth() === agora.getMonth(); });
    const usaEu = !!catalog.me, gastoMes = doMes.reduce((a, b) => { const c = calcBill(b); return a + (usaEu ? (meuTotal(b, c) || 0) : c.total); }, 0);
    return `<p class="saudacao">${oi}${catalog.me ? ', ' + esc(primeiroNome(catalog.me)) : ''}.</p>
      <section class="imp" aria-label="${d.active && !d.isExample ? 'Comanda aberta' : 'Nova comanda'}"><div class="imp-boca" aria-hidden="true"></div><div class="imp-saida"><div class="papel imp-papel ${anima}">${papel}</div></div></section>

      ${d.active && !d.isExample ? '' : `<div class="aovivo ${aoVivoAberto ? 'aberto' : ''}" id="ini-aovivo">
        ${aoVivoAberto ? `<form id="av-form" class="av-form" autocomplete="off"><label class="so-leitor" for="av-codigo">Código da comanda ao vivo</label><input id="av-codigo" type="text" autocapitalize="off" autocorrect="off" spellcheck="false" inputmode="text" placeholder="Código de 10 letras" maxlength="60" data-keep>
          <button type="button" class="ic-btn" id="av-colar" aria-label="Colar o código">${I.paste}</button><button type="submit" class="btn small">Entrar</button></form>`
        : `<button type="button" class="av-abre" id="av-abre"><span class="av-pulso" aria-hidden="true"></span><span><b>Entrar numa comanda ao vivo</b><small>Alguém da mesa já abriu? Use o código.</small></span>${I.next}</button>`}</div>`}

      ${jogoLigado() ? `<button type="button" class="card nivel-card" id="ini-nivel" aria-label="Nível ${s.nivel}, ${esc(s.nivelNome)}. ${s.ganhas.length} de ${TAMPINHAS.length} tampinhas. Ver a coleção">${bolachaHTML(s)}${nivelHTML(s)}
        ${proxima ? `<span class="nivel-prox"><span class="tampa-mini">${tampaSVG(proxima, { apagada: true })}</span><span><small>Próxima tampinha</small><b>${esc(proxima.nome)}</b></span></span>` : ''}</button>` : ''}

      ${bills.length ? `<div class="sec-cab"><h2 class="sec-t">Últimas comandas</h2><button type="button" class="btn link small" id="ini-hist">Ver histórico</button></div>
        ${doMes.length ? `<p class="mes-linha">${usaEu ? 'Seu gasto' : 'Gasto'} neste mês: <b>${BRL(gastoMes)}</b> em ${plural(doMes.length, 'comanda', 'comandas')}.</p>` : ''}
        <ul class="tiras">${bills.slice(0, 6).map((b, i) => `<li>${tiraHTML(b, i)}</li>`).join('')}</ul>` : ''}

      <div class="lista card lista-card">
        ${d.isExample ? `<button type="button" class="lin" id="ini-ex-sair"><span class="lin-ic ambar">${I.exemplo}</span><span class="lin-tx"><b>Sair da comanda de exemplo</b><small>Nada do exemplo é salvo.</small></span>${I.next}</button>`
          : `<button type="button" class="lin" id="ini-ex"><span class="lin-ic ambar">${I.exemplo}</span><span class="lin-tx"><b>Ver uma comanda de exemplo</b><small>Uma mesa pronta para mexer à vontade.</small></span>${I.next}</button>`}
        <button type="button" class="lin" id="ini-guia"><span class="lin-ic">${I.livro}</span><span class="lin-tx"><b>Ver o guia</b><small>O app mostra cada passo na tela, como um vídeo.</small></span>${I.next}</button>
      </div>`;
  },
  bind(v) {
    $('#ini-continuar', v)?.addEventListener('click', () => irPara('comanda'));
    const inp = $('#ini-local', v);
    if (inp) attachSuggest(inp, () => recentPlaces().map(p => ({ label: p.name, right: plural(p.n, 'vez', 'vezes'), dim: true })));
    $('#ini-form', v)?.addEventListener('submit', e => { e.preventDefault(); const nome = inp.value.trim().replace(/\s+/g, ' '); if (!nome) { toast('Digite o nome do local ou escolha um da lista.'); inp.focus(); return; } newBillAt(nome); });
    $$('[data-ini-lugar]', v).forEach(b => b.addEventListener('click', () => newBillAt(b.dataset.iniLugar)));
    $('#av-abre', v)?.addEventListener('click', () => { aoVivoAberto = true; render({ anchor: false }); requestAnimationFrame(() => $('#av-codigo')?.focus()); });
    $('#av-form', v)?.addEventListener('submit', e => { e.preventDefault(); entrarAoVivo($('#av-codigo', v).value); });
    $('#av-colar', v)?.addEventListener('click', async () => {
      try { const t = (await navigator.clipboard.readText()).trim(); if (!t) { toast('Nada copiado.'); return; } $('#av-codigo', v).value = t; entrarAoVivo(t); }
      catch { toast('Não deu para colar. Toque e segure no campo e escolha Colar.'); $('#av-codigo', v)?.focus(); }
    });
    $('#ini-nivel', v)?.addEventListener('click', () => irPara('tampinhas'));
    $('#ini-hist', v)?.addEventListener('click', () => irPara('historico'));
    $$('[data-bill]', v).forEach(b => b.addEventListener('click', () => openBill(b.dataset.bill)));
    $('#ini-ex', v)?.addEventListener('click', () => enterExample());
    $('#ini-ex-sair', v)?.addEventListener('click', () => { exitExample(); render(); });
    $('#ini-guia', v)?.addEventListener('click', () => guiaIniciar());
  },
};
// comanda salva como tira de papel (Início)
function tiraHTML(b, i = 0) {
  const c = calcBill(b), giro = ((i * 37) % 5 - 2) * .6;
  return `<button type="button" class="papel tira" data-bill="${esc(b.id)}" style="--giro:${giro}deg" aria-label="${esc(b.place || 'Comanda sem nome')}, ${fmtDate(b.closedAt)}, ${BRL(c.total)}. Abrir">
    <span class="mono tira-d">${esc(fmtDia(b.closedAt))}</span><span class="tira-l">${esc(b.place || 'Sem nome')}</span><span class="tira-p mono">${plural(b.people.length, 'pessoa', 'pessoas')}</span><span class="tira-v mono">${BRL(c.total)}</span></button>`;
}

/* ---------- Histórico ---------- */
let histPod = { lugares: false, gente: false, pedidos: false };
function retrospectivaHTML() {
  const meName = catalog.me || '', useMine = !!meName, eu = esc(primeiroNome(meName));
  const rows = bills.map(b => { const c = calcBill(b); return { b, c, mine: meuTotal(b, c) }; });
  const mineRows = rows.filter(r => r.mine !== null), base = useMine ? mineRows : rows;
  const val = r => useMine ? (r.mine || 0) : r.c.total;
  const total = base.reduce((a, r) => a + val(r), 0), media = base.length ? Math.round(total / base.length) : 0;
  const now = new Date(), months = [];
  for (let k = 5; k >= 0; k--) { const dt = new Date(now.getFullYear(), now.getMonth() - k, 1); months.push({ y: dt.getFullYear(), m: dt.getMonth(), v: 0, n: 0, label: dt.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '') }); }
  base.forEach(r => { const dt = new Date(r.b.closedAt), mo = months.find(x => x.y === dt.getFullYear() && x.m === dt.getMonth()); if (mo) { mo.v += val(r); mo.n++; } });
  const max = Math.max(...months.map(m => m.v), 1);
  const places = {}; (useMine ? mineRows.filter(r => r.mine > 0) : rows).forEach(r => { const k = (r.b.place || 'Sem nome').trim(), key = norm(k); places[key] = places[key] || { name: k, n: 0, v: 0 }; places[key].n++; places[key].v += val(r); });
  const friends = {}; base.forEach(r => r.b.people.forEach(p => { if (norm(p.name) === norm(meName)) return; const key = norm(p.name); friends[key] = friends[key] || { name: p.name, n: 0 }; friends[key].n++; }));
  const prods = {}; rows.forEach(r => r.b.items.forEach(it => { const key = norm(it.name); prods[key] = prods[key] || { name: it.name, q: 0 }; prods[key].q += it.qty; }));
  const podio = (id, titulo, lista, valor, fmt) => {
    const L = lista.sort((a, b) => valor(b) - valor(a)).slice(0, 5); if (!L.length) return '';
    const mx = Math.max(...L.map(valor), 1), aberto = histPod[id], ver = aberto ? L : L.slice(0, 3);
    return `<div class="podio"><h3>${titulo}</h3><ol>${ver.map((x, i) => `<li><span class="podio-n">${i + 1}</span><span class="podio-tx"><b>${esc(x.name)}</b><small>${fmt(x)}</small><span class="podio-barra"><i style="width:${Math.max(6, Math.round(valor(x) / mx * 100))}%"></i></span></span></li>`).join('')}</ol>
      ${L.length > 3 ? `<button type="button" class="btn link small" data-podio="${id}" aria-expanded="${aberto}">${aberto ? 'Mostrar menos' : 'Mostrar os 5'}</button>` : ''}</div>`;
  };
  return `<section class="card retro" aria-labelledby="retro-t"><h2 class="so-leitor" id="retro-t">Resumo dos gastos</h2>
    <div class="retro-cab"><div><p class="retro-rot">${useMine ? 'Gasto de ' + eu : 'Gasto total'}</p><p class="retro-num">${BRL(total)}</p><p class="hint">${plural(base.length, 'comanda', 'comandas')}, ${BRL(media)} em média</p></div>
      <div class="field retro-quem"><label for="me-select">Mostrar gastos de</label><select id="me-select"><option value="">Todas as pessoas</option>${[...catalog.people].sort(ordemNome).map(p => `<option value="${esc(p.name)}" ${norm(p.name) === norm(meName) ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select></div></div>
    <div class="graf" role="img" aria-label="Gasto por mês nos últimos 6 meses: ${months.map(m => `${m.label} ${BRL(m.v)}`).join(', ')}">${months.map((m, i) => `<div class="graf-col ${i === 5 ? 'atual' : ''}"><span class="graf-v">${m.v ? BRL(m.v).replace(/,\d\d$/, '').replace('R$', '').trim() : ''}</span><i style="height:${m.v ? Math.max(4, Math.round(m.v / max * 100)) : 2}%"></i><span class="graf-m">${m.label}</span></div>`).join('')}</div>
    <div class="podios">
      ${podio('lugares', 'Onde você mais vai', Object.values(places), x => x.n, x => `${plural(x.n, 'vez', 'vezes')}, ${BRL(x.v)}`)}
      ${podio('gente', useMine ? 'Com quem ' + eu + ' mais sai' : 'Quem mais aparece', Object.values(friends), x => x.n, x => plural(x.n, 'comanda', 'comandas'))}
      ${podio('pedidos', 'O que mais sai', Object.values(prods), x => x.q, x => plural(x.q, 'unidade', 'unidades'))}
    </div></section>`;
}
const viewHistorico = {
  html() {
    const cab = `<header class="tela-cab"><h1 class="tela-t">Histórico</h1><p class="tela-sub">As comandas que você salvou e para onde foi o dinheiro.</p></header>`;
    if (!bills.length) return `${cab}<div class="card vazio">${ILU.papel}<b>Nenhuma comanda salva</b><p>Quando você fechar e salvar uma comanda, ela aparece aqui.</p><button type="button" class="btn chopp" id="hi-nova">Abrir uma comanda</button></div>`;
    const grupos = []; bills.forEach(b => { const d = new Date(b.closedAt), k = d.getFullYear() * 12 + d.getMonth(); let g = grupos.find(x => x.k === k); if (!g) { g = { k, y: d.getFullYear(), m: d.getMonth(), L: [] }; grupos.push(g); } g.L.push(b); });
    return `${cab}${retrospectivaHTML()}
      <div class="sec-cab"><h2 class="sec-t">Comandas salvas</h2><span class="hint">${bills.length}</span></div>
      ${grupos.map(g => `<section class="papel topo-serrilha hist-mes" aria-label="${esc(mesNome(g.y, g.m))}"><h3 class="mono hm-t"><span>${esc(mesNome(g.y, g.m)).toUpperCase()}</span><span>${BRL(g.L.reduce((a, b) => a + calcBill(b).total, 0))}</span></h3>
        ${g.L.map(b => { const c = calcBill(b), mine = meuTotal(b, c); return `<button type="button" class="hm-lin mono" data-bill="${esc(b.id)}" aria-label="${esc(b.place || 'Comanda sem nome')}, ${fmtDate(b.closedAt)}, ${BRL(c.total)}. Abrir"><span class="hm-d">${String(new Date(b.closedAt).getDate()).padStart(2, '0')}</span><span class="hm-n"><b>${esc(b.place || 'Sem nome')}</b><small>${plural(b.people.length, 'pessoa', 'pessoas')}${mine !== null ? ` · você ${BRL(mine).replace('R$', '').trim()}` : ''}</small></span><span class="hm-v">${BRL(c.total).replace('R$', '').trim()}</span></button>`; }).join('')}</section>`).join('')}`;
  },
  bind(v) {
    $('#hi-nova', v)?.addEventListener('click', novaComandaSheet);
    $$('[data-bill]', v).forEach(b => b.addEventListener('click', () => openBill(b.dataset.bill)));
    $('#me-select', v)?.addEventListener('change', e => { catalog.me = e.target.value; store.saveCatalog(); render({ anchor: false }); });
    $$('[data-podio]', v).forEach(b => b.addEventListener('click', () => { histPod[b.dataset.podio] = !histPod[b.dataset.podio]; render(); }));
  },
};
// quanto cada um paga e para quem (só leitura, na comanda do histórico)
function acertosHTML(c) {
  if (!c.units.length || c.total <= 0) return '';
  const debts = pixDebts(c);
  return `<div class="lista acertos">${c.ids.map(id => { const nm = c.per[id].person.name, plan = planOf(c, id), out = plan.filter(x => x.k !== 'in').reduce((a, x) => a + x.v, 0);
    return `<div class="lin"><span class="lin-tx"><b>${esc(nm)}</b><small>${plan.length ? esc(plan.map(x => x.t).join(', ')) : 'não paga nada'}</small></span>${debts.some(x => x.pid === id) ? `<button type="button" class="btn small ghost" data-pixpay="${id}">Pix</button>` : ''}<span class="lin-v">${out ? BRL(out) : '—'}</span></div>`; }).join('')}</div>`;
}
function openBill(id) {
  const b = bills.find(x => x.id === id); if (!b) return;
  const c = calcBill(b);
  openSheet({ title: b.place || 'Comanda sem nome', sub: `${fmtDateTime(b.closedAt)}, ${plural(b.people.length, 'pessoa', 'pessoas')}, total ${BRL(c.total)}`, tall: true, body: `${acertosHTML(c)}
    <div class="receipts">${c.units.map(u => `<div class="receipt-wrap"><div class="cupom-1 ${pagoDe(b, u.members) ? 'cupom-pago' : ''}">${receiptHTML(u, b, c)}${pagoDe(b, u.members) ? '<span class="selo-pago" aria-hidden="true">PAGO</span>' : ''}</div><button type="button" class="btn small ghost" data-share="${u.id}">${I.share}Compartilhar</button></div>`).join('')}</div>
    <div class="sheet-actions"><button type="button" class="btn ghost" id="sh-pdf">${I.file}Todos em PDF</button><button type="button" class="btn ghost danger-text" id="sh-del">${I.trash}Excluir</button></div>`,
    foot: `<button type="button" class="btn ghost" id="sh-edit">Abrir para editar</button><button type="button" class="btn" id="sh-reuse">Repetir comanda</button>`, onMount: s => {
    $$('[data-share]', s).forEach(x => x.onclick = () => shareReceipt(c.U[x.dataset.share], b, c, () => openBill(id)));
    $$('[data-pixpay]', s).forEach(x => x.onclick = () => { const dbt = pixDebts(c).find(z => z.pid === x.dataset.pixpay); if (dbt) pixSheet(dbt, () => openBill(id)); });
    $('#sh-pdf', s).onclick = e => shareAllPDF(b, c, e.currentTarget);
    $('#sh-del', s).onclick = () => confirmSheet('Excluir esta comanda?', 'Ela sai do histórico e das estatísticas. Pessoas e produtos cadastrados continuam, e dá para desfazer logo em seguida.', 'Excluir comanda', () => {
      const gone = bills.find(x => x.id === id);
      bills = bills.filter(x => x.id !== id); store.deleteBill(id); closeSheet(true); if (draft.id === id) draft.savedAt = null; saveDraft(); render();
      toast('Comanda excluída.', { label: 'Desfazer', run: () => { bills = [gone, ...bills].sort((a, b) => b.closedAt - a.closedAt); store.saveBill(gone); render(); } });
    }, true);
    const replace = fn => confirmReplace(() => { if (draft.live) live.end(); pending = {}; itPend = {}; draft = fn(); draft.active = true; tab = 'comanda'; closeSheet(true); commit(); window.scrollTo({ top: 0 }); });
    $('#sh-edit', s).onclick = () => replace(() => semPagadorUnico(migrate({ ...clone(b), savedAt: b.closedAt, isExample: false, live: null })));
    $('#sh-reuse', s).onclick = () => replace(() => {
      const d = blankDraft(); d.place = b.place;
      const map = {}; b.people.forEach(p => { const np = { ...newPerson(p.name) }; map[p.id] = np.id; d.people.push(np); });
      d.items = b.items.map(i => ({ ...clone(i), id: newId(), fq: 0, a: Object.fromEntries(Object.entries(i.a).filter(([k]) => map[k]).map(([k, v]) => [map[k], v])) }));
      d.service = { ...b.service }; d.couvert = { ...b.couvert }; d.discount = { ...b.discount, enabled: false };
      return d;
    });
  } });
}

/* ---------- Cadastros ---------- */
let cadAba = 'pessoas';
function pessoaSheet() {
  openSheet({ title: 'Nova pessoa', body: `<form id="np-form" class="pilha" autocomplete="off">
      <div class="field"><label for="np-nome">Nome</label><input id="np-nome" type="text" autocapitalize="words" maxlength="40" placeholder="Nome ou apelido"></div>
      <div class="field"><label for="np-pix">Chave Pix (opcional)</label><input id="np-pix" type="text" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="CPF, celular, e-mail ou chave aleatória"></div>
    </form>`, foot: `<button type="button" class="btn ghost" id="np-no">Cancelar</button><button type="submit" form="np-form" class="btn">${I.save}Salvar pessoa</button>`, onMount: s => {
    $('#np-no', s).onclick = () => closeSheet();
    if (!isTouch) setTimeout(() => $('#np-nome', s)?.focus(), 60);
    $('#np-form', s).addEventListener('submit', e => {
      e.preventDefault();
      const nome = $('#np-nome', s).value.trim().replace(/\s+/g, ' '), pix = $('#np-pix', s).value.trim();
      if (!nome) { toast('Informe o nome.'); $('#np-nome', s).focus(); return; }
      if (catalog.people.some(p => norm(p.name) === norm(nome))) { toast(`${nome} já está nos cadastros.`); return; }
      catalog.people.push({ name: nome, pix: '' });
      store.saveCatalog(); closeSheet(true);
      if (pix) savePixKey(nome, pix, () => { render(); toast(`${nome} cadastrado com a chave Pix.`); });
      else { render(); toast(`${nome} cadastrado.`); }
    });
  } });
}
function pixEditSheet(name) {
  openSheet({ title: `Chave Pix de ${name}`, body: `<form id="px-form" class="pilha" autocomplete="off"><div class="field"><label for="px-in">Chave Pix</label><input id="px-in" type="text" value="${esc(pixOf(name))}" placeholder="CPF, celular, e-mail ou chave aleatória" autocapitalize="off" autocorrect="off" spellcheck="false"></div></form>`,
    foot: `<button type="button" class="btn ghost" id="px-no">Cancelar</button><button type="submit" form="px-form" class="btn">${I.save}Salvar chave</button>`, onMount: s => {
    $('#px-no', s).onclick = () => closeSheet();
    $('#px-form', s).addEventListener('submit', e => { e.preventDefault(); const val = $('#px-in', s).value; closeSheet(true); savePixKey(name, val, k => { render(); toast(k ? 'Chave Pix salva.' : 'Chave Pix removida.'); }); });
  } });
}
function turmaSheet(g) {
  const nomes = [...catalog.people].sort(ordemNome).map(p => p.name), sel = new Set(g ? g.members : []);
  openSheet({ title: g ? `Turma ${g.name}` : 'Nova turma', body: `<form id="tg-form" class="pilha" autocomplete="off">
      <div class="field"><label for="tg-nome">Nome da turma</label><input id="tg-nome" type="text" maxlength="40" placeholder="Turma do futebol" value="${esc(g ? g.name : '')}"></div>
      <div class="field"><span class="eyebrow">Quem faz parte</span><div class="ck-list" role="group" aria-label="Quem faz parte da turma">${nomes.map(n => ckRow(`data-tg="${esc(n)}"`, n, sel.has(n))).join('')}</div></div>
    </form>`, foot: `<button type="button" class="btn ghost" id="tg-no">Cancelar</button><button type="submit" form="tg-form" class="btn">${I.save}Salvar turma</button>`, onMount: s => {
    $('#tg-no', s).onclick = () => closeSheet();
    $$('[data-tg]', s).forEach(b => b.addEventListener('click', () => { const n = b.dataset.tg; if (sel.has(n)) sel.delete(n); else sel.add(n); b.setAttribute('aria-pressed', sel.has(n)); }));
    $('#tg-form', s).addEventListener('submit', e => {
      e.preventDefault();
      const nome = $('#tg-nome', s).value.trim().replace(/\s+/g, ' ');
      if (!nome) { toast('Dê um nome para a turma.'); $('#tg-nome', s).focus(); return; }
      if (sel.size < 2) { toast('Escolha ao menos duas pessoas.'); return; }
      if ((catalog.groups || []).some(x => x !== g && norm(x.name) === norm(nome))) { toast(`Já existe a turma ${nome}.`); return; }
      const members = nomes.filter(n => sel.has(n));
      if (g) Object.assign(g, { name: nome, members }); else catalog.groups.push({ id: newId(), name: nome, members });
      store.saveCatalog(); closeSheet(true); render(); toast(g ? 'Turma atualizada.' : `Turma ${nome} criada.`);
    });
  } });
}
const viewCadastros = {
  html() {
    const U = usage(), cnt = p => U.people[norm(p.name)] || 0, pc = p => U.products[norm(p.name)] || 0;
    const used = n => n ? `em ${plural(n, 'comanda salva', 'comandas salvas')}` : 'em nenhuma comanda salva';
    if (backfillPrices()) store.saveCatalog();
    const H = historyCatalog(), nMiss = H.missingProducts.length + H.missingPeople.length;
    const abas = [['pessoas', 'Pessoas', catalog.people.length], ['turmas', 'Turmas', (catalog.groups || []).length], ['produtos', 'Produtos', catalog.products.length]];
    let corpo = '';
    if (cadAba === 'pessoas') {
      const ppl = [...catalog.people].sort((a, b) => cnt(b) - cnt(a) || a.name.localeCompare(b.name, 'pt-BR'));
      corpo = `${ppl.length ? `<div class="lista">${ppl.map(p => `<div class="lin">${avatar(p.name)}<span class="lin-tx"><b>${esc(p.name)}${norm(p.name) === norm(catalog.me) ? ' <span class="tag">você</span>' : ''}</b><small>${used(cnt(p))}${p.pix ? ' · Pix: ' + esc(p.pix) : ''}</small></span>
          <button type="button" class="btn small ghost" data-pix-edit="${esc(p.name)}">${p.pix ? 'Pix' : '+ Pix'}</button><button type="button" class="ic-btn del" data-del-person="${esc(p.name)}" aria-label="Excluir ${esc(p.name)}">${I.trash}</button></div>`).join('')}</div>`
        : `<div class="vazio">${ILU.mesa}<b>Nenhuma pessoa cadastrada</b><p>Quem entra numa comanda salva aparece aqui sozinho. Você também pode cadastrar antes, já com a chave Pix.</p></div>`}
        <button type="button" class="btn bloco" id="cad-pessoa">${I.plus}Nova pessoa</button>`;
    } else if (cadAba === 'turmas') {
      const gs = [...(catalog.groups || [])].sort(ordemNome);
      corpo = `${gs.length ? `<div class="lista">${gs.map(g => `<div class="lin"><span class="lin-ic">${I.users}</span><span class="lin-tx"><b>${esc(g.name)}</b><small>${esc(g.members.join(', '))}</small></span><button type="button" class="btn small ghost" data-turma-ed="${esc(g.id)}">Alterar</button><button type="button" class="ic-btn del" data-turma-del="${esc(g.id)}" aria-label="Excluir a turma ${esc(g.name)}">${I.trash}</button></div>`).join('')}</div>`
        : `<div class="vazio">${ILU.mesa}<b>Nenhuma turma</b><p>Turma é quem sai junto: com um toque, todos entram na mesa.</p></div>`}
        <button type="button" class="btn bloco" id="cad-turma" ${catalog.people.length > 1 ? '' : 'disabled'}>${I.plus}Nova turma</button>${catalog.people.length > 1 ? '' : '<p class="hint centro">Cadastre ao menos duas pessoas para criar uma turma.</p>'}`;
    } else {
      const prods = [...catalog.products].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
      corpo = prods.length ? `<div class="prods">${prods.map((p, i) => {
        const entries = Object.entries(p.prices || {}).sort((a, b) => (b[1].last || 0) - (a[1].last || 0));
        return `<div class="prod"><div class="prod-cab"><span class="lin-tx"><b>${esc(p.name)}</b><small>${used(pc(p))}</small></span><button type="button" class="ic-btn del" data-del-prod="${esc(p.name)}" aria-label="Excluir ${esc(p.name)}">${I.trash}</button></div>
          ${entries.length ? entries.map(([k, e]) => `<div class="preco-lin"><label for="pp-${i}-${esc(k.replace(/[^a-z0-9]/g, '-'))}">${esc(e.place)}</label><input type="text" inputmode="numeric" data-money value="${moneyInput(e.price)}" data-pprod="${esc(p.name)}" data-pk="${esc(k)}" id="pp-${i}-${esc(k.replace(/[^a-z0-9]/g, '-'))}"><button type="button" class="ic-btn del" data-pdel="${esc(p.name)}" data-pk="${esc(k)}" aria-label="Apagar o preço de ${esc(p.name)} em ${esc(e.place)}">${I.x}</button></div>`).join('')
          : `<div class="preco-lin"><label for="pp-${i}-x" class="hint">Sem local</label><input type="text" inputmode="numeric" data-money value="${moneyInput(p.price || 0)}" data-pprod="${esc(p.name)}" data-pk="" id="pp-${i}-x"><span></span></div>`}</div>`; }).join('')}</div>`
        : `<div class="vazio">${ILU.papel}<b>Nenhum produto cadastrado</b><p>Os produtos e os preços de cada lugar entram aqui quando você salva uma comanda.</p></div>`;
    }
    return `<header class="tela-cab">${voltarMaisHTML()}<h1 class="tela-t">Cadastros</h1><p class="tela-sub">Pessoas, chaves Pix, turmas e o preço de cada produto em cada lugar.</p></header>
      <div class="seg cad-seg" role="group" aria-label="O que mostrar">${abas.map(([k, t, n]) => `<button type="button" data-cad="${k}" aria-pressed="${cadAba === k}">${t}${n ? ` <span class="seg-n">${n}</span>` : ''}</button>`).join('')}</div>
      <div class="card cad-card">${corpo}</div>
      ${bills.length && nMiss ? `<button type="button" class="card lin-card" id="recover"><span class="lin-ic ambar">${I.refresh}</span><span class="lin-tx"><b>Recuperar do histórico</b><small>${[H.missingProducts.length ? plural(H.missingProducts.length, 'produto', 'produtos') : '', H.missingPeople.length ? plural(H.missingPeople.length, 'pessoa', 'pessoas') : ''].filter(Boolean).join(' e ')} das comandas salvas ${nMiss === 1 ? 'está' : 'estão'} fora dos cadastros.</small></span>${I.next}</button>` : ''}`;
  },
  bind(v) {
    $$('[data-cad]', v).forEach(b => b.addEventListener('click', () => { cadAba = b.dataset.cad; render({ anchor: false }); }));
    $('#recover', v)?.addEventListener('click', recoverSheet);
    $('#cad-pessoa', v)?.addEventListener('click', () => pessoaSheet());
    $('#cad-turma', v)?.addEventListener('click', () => turmaSheet());
    $$('[data-turma-ed]', v).forEach(b => b.addEventListener('click', () => turmaSheet((catalog.groups || []).find(g => g.id === b.dataset.turmaEd))));
    $$('[data-turma-del]', v).forEach(b => b.addEventListener('click', () => {
      const idx = catalog.groups.findIndex(g => g.id === b.dataset.turmaDel); if (idx < 0) return;
      const [gone] = catalog.groups.splice(idx, 1); store.saveCatalog(); render();
      toast(`Turma ${gone.name} excluída.`, { label: 'Desfazer', run: () => { catalog.groups.splice(idx, 0, gone); store.saveCatalog(); render(); } });
    }));
    $$('[data-pix-edit]', v).forEach(b => b.addEventListener('click', () => pixEditSheet(b.dataset.pixEdit)));
    $$('[data-del-person]', v).forEach(b => b.addEventListener('click', () => confirmSheet(`Excluir ${b.dataset.delPerson} do cadastro?`, 'A pessoa deixa de aparecer nas sugestões. As comandas do histórico não mudam.', 'Excluir pessoa', () => {
      const idx = catalog.people.findIndex(p => p.name === b.dataset.delPerson); if (idx < 0) return;
      const [gone] = catalog.people.splice(idx, 1), wasMe = norm(catalog.me) === norm(gone.name);
      if (wasMe) catalog.me = '';
      store.saveCatalog(); render();
      toast(`Cadastro de ${gone.name} excluído.`, { label: 'Desfazer', run: () => { catalog.people.splice(idx, 0, gone); if (wasMe) catalog.me = gone.name; store.saveCatalog(); render(); } });
    }, true)));
    $$('[data-del-prod]', v).forEach(b => b.addEventListener('click', () => confirmSheet(`Excluir ${b.dataset.delProd} do cadastro?`, 'O produto e os preços guardados por local saem das sugestões. As comandas do histórico não mudam, e dá para recuperar o produto a partir delas.', 'Excluir produto', () => {
      const idx = catalog.products.findIndex(p => p.name === b.dataset.delProd); if (idx < 0) return;
      const [gone] = catalog.products.splice(idx, 1);
      store.saveCatalog(); render();
      toast(`Cadastro de ${gone.name} excluído.`, { label: 'Desfazer', run: () => { catalog.products.splice(idx, 0, gone); store.saveCatalog(); render(); } });
    }, true)));
    $$('[data-pdel]', v).forEach(b => b.addEventListener('click', () => {
      const p = catalog.products.find(x => x.name === b.dataset.pdel); if (!p) return;
      delete p.prices[b.dataset.pk]; store.saveCatalog(); render(); toast('Preço do local apagado.');
    }));
    $$('[data-pprod]', v).forEach(i => i.addEventListener('change', () => {
      const c = parseMoney(i.value), p = catalog.products.find(x => x.name === i.dataset.pprod);
      if (!c || !p) { toast('Valor inválido. Digite, por exemplo, 12,90.'); render(); return; }
      if (i.dataset.pk && p.prices[i.dataset.pk]) Object.assign(p.prices[i.dataset.pk], { price: c, edited: true }); else p.price = c;
      store.saveCatalog(); i.value = moneyInput(c); toast('Preço atualizado.');
    }));
  },
};

/* ---------- Mais ---------- */
const voltarMaisHTML = () => `<button type="button" class="voltar" data-ir="mais">${I.back}Mais</button>`;
const viewMais = {
  html() {
    const lin = (attrs, ic, t, sub, cor = '') => `<button type="button" class="lin" ${attrs}><span class="lin-ic ${cor}">${ic}</span><span class="lin-tx"><b>${t}</b><small>${sub}</small></span>${I.next}</button>`;
    return `<header class="tela-cab"><h1 class="tela-t">Mais</h1></header>
      <div class="card lista lista-card">
        ${lin('data-ir="cadastros"', I.users, 'Cadastros', `${plural(catalog.people.length, 'pessoa', 'pessoas')}, ${plural((catalog.groups || []).length, 'turma', 'turmas')} e ${plural(catalog.products.length, 'produto', 'produtos')}`)}
        ${lin('data-kf="ajustes"', I.ajustes, 'Ajustes', 'Sincronização, aparência, privacidade e cópia de segurança')}
      </div>
      <div class="card lista lista-card">
        ${lin('id="ma-guia"', I.livro, 'Ver o guia', 'O app mostra cada passo na tela')}
        ${lin('id="ma-abertura"', I.sparkle, 'Rever a apresentação', 'As telas de boas-vindas')}
        ${lin('id="ma-garrafa"', I.garrafa, 'Girar a garrafa', 'Sorteie alguém da mesa', 'ambar')}
      </div>
      <div class="card lista lista-card">
        ${lin('data-kf="feedback"', I.estrela, 'Avaliar ou relatar um problema', 'Sua opinião chega direto ao criador')}
        ${KitFacil.apoio.ativo() ? lin('data-kf="apoio"', I.presente, 'Mandar um presente para o criador', 'O app é gratuito. O presente é opcional, por Pix', 'ambar') : ''}
        ${lin('data-kf="novidades"', I.receipt, 'Novidades', `Versão ${VERSAO}`)}
      </div>`;
  },
  bind(v) {
    $('#ma-guia', v).addEventListener('click', () => guiaIniciar());
    $('#ma-abertura', v).addEventListener('click', () => aberturaAbrir({ rever: true }));
    $('#ma-garrafa', v).addEventListener('click', () => garrafaSheet());
  },
};
