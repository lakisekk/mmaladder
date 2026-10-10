/* MMA Ladder – page rendering shared by the browser (app.js), the editor and the SEO build (build.js).
   Every function is pure: data in, HTML string out. */
window.MLR = (function () {
  const { esc, flag, countryName, slug, fmtDate } = window.MML;

  /* ---------- lookups ---------- */
  const divSlug = d => slug(d.name);
  const findDiv = (D, s) => D.divisions.find(d => d.id === s || divSlug(d) === s);
  const countrySlug = (D, code) => { const c = D.countries.find(x => x.code === code); return slug((c && c.name) || countryName(code)); };
  const findCountry = (D, s) => D.countries.find(c => c.code === s || slug(c.name || countryName(c.code)) === s);
  const orgById = (D, id) => D.orgs.find(o => o.id === id);
  const rankedOrgs = D => D.orgs.filter(o => o.ranked);
  const p4pOn = (D, preview) => !!(D.settings.p4pPublic || preview);

  function getList(D, scope, sub, div) {
    const R = D.rankings;
    if (scope === "p4p") return R.p4p || [];
    if (scope === "world") return R.world[div] || [];
    return ((R[scope] || {})[sub] || {})[div] || [];
  }

  function scopeLabel(D, scope, sub) {
    if (scope === "world") return "World";
    if (scope === "p4p") return "Pound-for-Pound";
    if (scope === "country") { const c = D.countries.find(x => x.code === sub); return (c && c.name) || countryName(sub); }
    const o = orgById(D, sub); return o ? o.name : sub;
  }

  /* ---------- routes ---------- */
  function parse(D, path, preview) {
    const p = String(path || "").replace(/^\/+|\/+$/g, "").replace(/(^|\/)index\.html$/, "").split("/").filter(Boolean).map(decodeURIComponent);
    const first = D.divisions[0] || {};
    if (!p.length) return { type: "home", scope: "world", div: first.id };
    if (p[0] === "world") { const d = findDiv(D, p[1] || first.id); return d ? { type: "board", scope: "world", div: d.id } : { type: "notfound" }; }
    if (p[0] === "country") {
      const c = findCountry(D, p[1] || (D.countries[0] || {}).code); const d = findDiv(D, p[2] || first.id);
      return c && d ? { type: "board", scope: "country", sub: c.code, div: d.id } : { type: "notfound" };
    }
    if (p[0] === "org") {
      const o = rankedOrgs(D).find(x => x.id === (p[1] || (rankedOrgs(D)[0] || {}).id)); const d = findDiv(D, p[2] || first.id);
      return o && d ? { type: "board", scope: "org", sub: o.id, div: d.id } : { type: "notfound" };
    }
    if (p[0] === "p4p") return p4pOn(D, preview) ? { type: "board", scope: "p4p" } : { type: "notfound" };
    if (p[0] === "how-we-rank") return D.about.enabled ? { type: "about" } : { type: "notfound" };
    if (p[0] === "fighter" && D.fighters[p[1]]) return { type: "fighter", id: p[1] };
    return { type: "notfound" };
  }

  function path(D, r) {
    const d = r.div && D.divisions.find(x => x.id === r.div);
    if (r.type === "fighter") return "fighter/" + r.id;
    if (r.type === "about") return "how-we-rank";
    if (r.type === "home") return "";
    if (r.scope === "p4p") return "p4p";
    if (r.scope === "world") return "world/" + divSlug(d);
    if (r.scope === "country") return "country/" + countrySlug(D, r.sub) + "/" + divSlug(d);
    if (r.scope === "org") return "org/" + r.sub + "/" + divSlug(d);
    return "";
  }

  /* All public routes – used by the build for static pages and the sitemap */
  function allRoutes(D) {
    const out = [{ type: "home", scope: "world", div: (D.divisions[0] || {}).id }];
    D.divisions.forEach(d => out.push({ type: "board", scope: "world", div: d.id }));
    D.countries.forEach(c => D.divisions.forEach(d => out.push({ type: "board", scope: "country", sub: c.code, div: d.id })));
    rankedOrgs(D).forEach(o => D.divisions.forEach(d => out.push({ type: "board", scope: "org", sub: o.id, div: d.id })));
    if (D.settings.p4pPublic) out.push({ type: "board", scope: "p4p" });
    if (D.about.enabled) out.push({ type: "about" });
    Object.keys(D.fighters).forEach(id => out.push({ type: "fighter", id }));
    return out;
  }

  /* ---------- rankings ---------- */
  function rows(D, scope, list) {
    let pos = 0;
    return list.map((e, i) => {
      const champ = scope === "org" && i === 0 && !!e.c;
      if (!champ) pos++;
      let move = { t: "none" };
      if (!champ) {
        if (e.prev === 0 || e.prev === "new") move = { t: "new" };
        else if (e.prev != null && e.prev !== "") { const n = Number(e.prev) - pos; move = n > 0 ? { t: "up", n } : n < 0 ? { t: "down", n: -n } : { t: "same" }; }
      }
      return { f: e.f, fighter: D.fighters[e.f], champ, pos: champ ? 0 : pos, move };
    }).filter(r => r.fighter);
  }

  /* ---------- fights ---------- */
  function side(D, fight, s) {
    const id = fight[s];
    if (id && D.fighters[id]) return { id, name: D.fighters[id].name, country: D.fighters[id].country };
    return { id: null, name: fight[s + "Name"] || "Unknown", country: fight[s + "Country"] || "" };
  }
  function fightsOf(D, id) {
    return D.fights.filter(f => f.a === id || f.b === id).map(f => {
      const me = f.a === id ? "a" : "b", opp = me === "a" ? "b" : "a";
      const res = f.winner === "draw" ? "D" : f.winner === "nc" ? "NC" : f.winner === me ? "W" : f.winner === opp ? "L" : "";
      return { date: f.date, event: f.event || "", method: f.method || "", round: f.round || "", res, opp: side(D, f, opp) };
    }).sort((a, b) => String(b.date).localeCompare(String(a.date)));
  }
  const lastFight = (D, id) => fightsOf(D, id)[0] || null;
  function resultBadge(res) {
    if (!res) return "";
    return `<span class="res res-${res.toLowerCase()}">${esc(res)}</span>`;
  }
  function lastFightLine(lf) {
    if (!lf) return "";
    const bits = [lf.method, lf.round ? "R" + lf.round : ""].filter(Boolean).join(" ");
    return `<span class="lastfight">${resultBadge(lf.res)}${bits ? `<span>${esc(bits)}</span>` : ""}${lf.event ? `<span class="ev">${esc(lf.event)}</span>` : ""}</span>`;
  }

  /* ---------- history ---------- */
  // compact snapshot of every list: {"world/hw": ["id", ...], "org/oktagon/mw": ["!champ", ...], "p4p": [...]}
  function snapshot(D) {
    const r = {};
    const put = (key, l, scope) => { if (l && l.length) r[key] = l.map((e, i) => (scope === "org" && i === 0 && e.c ? "!" : "") + e.f); };
    Object.entries(D.rankings.world).forEach(([d, l]) => put("world/" + d, l, "world"));
    ["country", "org"].forEach(sc => Object.entries(D.rankings[sc]).forEach(([sub, g]) => Object.entries(g).forEach(([d, l]) => put(sc + "/" + sub + "/" + d, l, sc))));
    put("p4p", D.rankings.p4p, "p4p");
    return r;
  }
  function keyInfo(D, key) {
    const p = key.split("/");
    if (p[0] === "p4p") return { scope: "p4p", label: "Pound-for-Pound" };
    if (p[0] === "world") return { scope: "world", div: p[1], label: "World · " + ((D.divisions.find(d => d.id === p[1]) || {}).name || p[1]) };
    return { scope: p[0], sub: p[1], div: p[2], label: scopeLabel(D, p[0], p[1]) + " · " + ((D.divisions.find(d => d.id === p[2]) || {}).name || p[2]) };
  }
  function keyVisible(D, key, preview) {
    const i = keyInfo(D, key);
    if (i.scope === "p4p") return p4pOn(D, preview);
    if (i.scope === "country") return D.countries.some(c => c.code === i.sub);
    if (i.scope === "org") return rankedOrgs(D).some(o => o.id === i.sub);
    return true;
  }
  // timeline points: history entries (oldest first) + the current state
  function timeline(D) {
    const h = D.history.filter(x => String(x.date) < String(D.updated)).sort((a, b) => String(a.date).localeCompare(String(b.date)));
    return h.concat([{ date: D.updated, r: snapshot(D), current: true }]);
  }
  function rankIn(arr, id) {
    if (!arr) return null;
    let pos = 0;
    for (const raw of arr) {
      const champ = raw[0] === "!";
      const f = champ ? raw.slice(1) : raw;
      if (!champ) pos++;
      if (f === id) return champ ? 0 : pos;
    }
    return null;
  }
  function rankHistory(D, id, preview) {
    const tl = timeline(D);
    const keys = new Set();
    tl.forEach(t => Object.entries(t.r).forEach(([k, arr]) => { if (arr.some(x => x === id || x === "!" + id) && keyVisible(D, k, preview)) keys.add(k); }));
    const order = k => (k.startsWith("world") ? 0 : k.startsWith("country") ? 1 : k.startsWith("org") ? 2 : 3);
    return [...keys].sort((a, b) => order(a) - order(b) || a.localeCompare(b)).map(k => ({
      key: k, label: keyInfo(D, k).label,
      points: tl.map(t => ({ date: t.date, rank: rankIn(t.r[k], id) }))
    }));
  }
  function historyRows(D, key, date) {
    const h = D.history.find(x => x.date === date);
    if (!h) return null;
    const arr = h.r[key] || [];
    let pos = 0;
    return arr.map(raw => {
      const champ = raw[0] === "!"; const f = champ ? raw.slice(1) : raw;
      if (!champ) pos++;
      return { f, fighter: D.fighters[f], champ, pos: champ ? 0 : pos, move: { t: "none" } };
    }).filter(r => r.fighter);
  }

  function chartSvg(series) {
    const pts = series.points;
    const ranks = pts.map(p => p.rank).filter(r => r != null);
    if (!ranks.length) return "";
    const W = 640, H = 220, L = 34, R = 18, T = 18, B = 34;
    const maxR = Math.max(5, ...ranks);
    const hasC = ranks.includes(0);
    const minR = hasC ? 0 : 1;
    const x = i => pts.length === 1 ? (L + (W - L - R) / 2) : L + i * (W - L - R) / (pts.length - 1);
    const y = r => T + (r - minR) * (H - T - B) / Math.max(1, maxR - minR);
    let grid = "";
    const ticks = [];
    for (let r = minR; r <= maxR; r++) if (r === minR || r === maxR || (maxR - minR <= 10) || r % 5 === 0) ticks.push(r);
    ticks.forEach(r => { grid += `<line x1="${L}" x2="${W - R}" y1="${y(r)}" y2="${y(r)}" class="g"/><text x="${L - 8}" y="${y(r) + 4}" class="tl" text-anchor="end">${r === 0 ? "C" : "#" + r}</text>`; });
    let paths = "", seg = [];
    const flush = () => { if (seg.length > 1) paths += `<polyline points="${seg.join(" ")}" class="ln"/>`; seg = []; };
    pts.forEach((p, i) => { if (p.rank == null) flush(); else seg.push(x(i) + "," + y(p.rank)); });
    flush();
    const dots = pts.map((p, i) => p.rank == null ? "" : `<circle cx="${x(i)}" cy="${y(p.rank)}" r="${i === pts.length - 1 ? 5 : 3.5}" class="${p.rank === 0 ? "dc" : "d"}"><title>${esc(fmtDate(p.date))}: ${p.rank === 0 ? "Champion" : "#" + p.rank}</title></circle>`).join("");
    const lbl = (i, anchor) => `<text x="${x(i)}" y="${H - 10}" class="tl" text-anchor="${anchor}">${esc(fmtDate(pts[i].date))}</text>`;
    const xl = pts.length === 1 ? lbl(0, "middle") : lbl(0, "start") + lbl(pts.length - 1, "end");
    return `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="Ranking history: ${esc(series.label)}">${grid}${paths}${dots}${xl}</svg>`;
  }

  /* ---------- movers ---------- */
  function movers(D, preview) {
    const out = [];
    const scan = (scope, sub, div, list) => rows(D, scope, list).forEach(r => {
      if (r.move.t === "up" || r.move.t === "down") out.push({ r, scope, sub, div, delta: r.move.t === "up" ? r.move.n : -r.move.n });
    });
    D.divisions.forEach(d => {
      scan("world", null, d.id, getList(D, "world", null, d.id));
      D.countries.forEach(c => scan("country", c.code, d.id, getList(D, "country", c.code, d.id)));
      rankedOrgs(D).forEach(o => scan("org", o.id, d.id, getList(D, "org", o.id, d.id)));
    });
    if (p4pOn(D, preview)) scan("p4p", null, null, D.rankings.p4p);
    // one card per fighter: keep their biggest move
    const best = new Map();
    out.forEach(m => { const b = best.get(m.r.f); if (!b || Math.abs(m.delta) > Math.abs(b.delta)) best.set(m.r.f, m); });
    const all = [...best.values()];
    return {
      up: all.filter(m => m.delta > 0).sort((a, b) => b.delta - a.delta).slice(0, 4),
      down: all.filter(m => m.delta < 0).sort((a, b) => a.delta - b.delta).slice(0, 4)
    };
  }

  /* ---------- HTML pieces ---------- */
  function orgTag(D, id) {
    const o = orgById(D, id);
    if (!o) return "";
    return `<span class="org"><i style="background:${esc(o.color || "#888")}"></i>${esc(o.name)}</span>`;
  }
  function moveHtml(m) {
    if (m.t === "up") return `<span class="move up">▲ ${m.n}</span>`;
    if (m.t === "down") return `<span class="move down">▼ ${m.n}</span>`;
    if (m.t === "new") return `<span class="move new">NEW</span>`;
    return `<span class="move same">–</span>`;
  }
  const a = (link, p, inner, cls, extra) => `<a href="${esc(link(p))}" data-r="${esc(p)}"${cls ? ` class="${cls}"` : ""}${extra || ""}>${inner}</a>`;

  function listHtml(D, list, ctx, opts) {
    opts = opts || {};
    if (!list.length) return `<div class="empty-state"><div>${opts.emptyText || "No fighters ranked in this division yet."}</div></div>`;
    return list.map((r, i) => {
      const f = r.fighter;
      const lf = lastFight(D, r.f);
      const bits = [orgTag(D, f.org)];
      if (f.nick) bits.push(`<span class="nick">“${esc(f.nick)}”</span>`);
      if (f.record) bits.push(`<span class="rec-inline">${esc(f.record)}</span>`);
      const sub = bits.filter(Boolean).join(`<span class="sep">·</span>`);
      const rank = r.champ ? `<span class="rank c">C</span>` : `<span class="rank">${r.pos}</span>`;
      const mv = r.champ ? `<span class="move champ">CHAMP</span>` : opts.noMoves ? `<span class="move same"></span>` : moveHtml(r.move);
      const extra = opts.divOf ? `<span class="divtag">${esc(opts.divOf(r.f))}</span>` : "";
      return a(ctx.link, "fighter/" + r.f, `
        ${rank}${mv}
        <span class="who">${flag(f.country)}<span class="who-text"><span class="name">${esc(f.name)}</span><span class="sub-line">${sub}${extra}</span></span></span>
        <span class="right"><span class="record">${esc(f.record || "")}</span>${lastFightLine(lf)}</span>`, `row${i === 0 ? " top1" : ""}${r.champ ? " is-champ" : ""}`);
    }).join("");
  }

  function controls(D, r, ctx) {
    const scope = r.scope || "world";
    const div = r.div || (D.divisions[0] || {}).id;
    const defC = (D.countries[0] || {}).code, defO = (rankedOrgs(D)[0] || {}).id;
    const tab = (sc, label, p) => a(ctx.link, p, label, scope === sc ? "on" : "");
    let html = `<nav class="scopes" aria-label="Ranking type">
      ${tab("world", "World", path(D, { scope: "world", div }))}
      ${D.countries.length ? tab("country", "By Country", path(D, { scope: "country", sub: scope === "country" ? r.sub : defC, div })) : ""}
      ${rankedOrgs(D).length ? tab("org", "By Organization", path(D, { scope: "org", sub: scope === "org" ? r.sub : defO, div })) : ""}
      ${p4pOn(D, ctx.preview) ? tab("p4p", "P4P" + (!D.settings.p4pPublic ? " · hidden" : ""), "p4p") : ""}
    </nav>`;
    if (scope === "country") html += `<div class="subs">${D.countries.map(c => a(ctx.link, path(D, { scope: "country", sub: c.code, div }), flag(c.code) + esc(c.name || countryName(c.code)), "sub" + (c.code === r.sub ? " on" : ""))).join("")}</div>`;
    if (scope === "org") html += `<div class="subs">${rankedOrgs(D).map(o => a(ctx.link, path(D, { scope: "org", sub: o.id, div }), `<span class="swatch" style="background:${esc(o.color || "#888")}"></span>${esc(o.name)}`, "sub" + (o.id === r.sub ? " on" : ""))).join("")}</div>`;
    if (scope !== "p4p") html += `<nav class="divs" aria-label="Weight classes">${D.divisions.map(d => {
      const n = rows(D, scope, getList(D, scope, r.sub, d.id)).length;
      return a(ctx.link, path(D, { scope, sub: r.sub, div: d.id }), `${esc(d.name)}${n ? `<sup>${n}</sup>` : ""}`, "div-btn" + (d.id === div ? " on" : ""));
    }).join("")}</nav>`;
    return `<section class="controls wrap">${html}</section>`;
  }

  function scopeTagHtml(D, scope, sub) {
    let icon;
    if (scope === "country") icon = flag(sub);
    else if (scope === "org") { const o = orgById(D, sub); icon = `<span class="swatch" style="background:${esc(o ? o.color : "#888")}"></span>`; }
    else icon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>`;
    return icon + esc(scopeLabel(D, scope, sub)) + " Ranking";
  }

  function historySelect(D, key) {
    const dates = D.history.filter(h => h.r[key] && h.r[key].length && String(h.date) < String(D.updated)).map(h => h.date).sort().reverse();
    if (!dates.length) return "";
    return `<label class="asof">As of
      <select data-history="${esc(key)}"><option value="">${esc(fmtDate(D.updated))} (current)</option>${dates.map(d => `<option value="${esc(d)}">${esc(fmtDate(d))}</option>`).join("")}</select></label>`;
  }

  function moversHtml(D, ctx) {
    const m = movers(D, ctx.preview);
    if (!m.up.length && !m.down.length) return "";
    const card = x => {
      const f = x.r.fighter, up = x.delta > 0;
      const where = x.scope === "p4p" ? "Pound-for-Pound" : scopeLabel(D, x.scope, x.sub) + " · " + ((D.divisions.find(d => d.id === x.div) || {}).name || "");
      return a(ctx.link, "fighter/" + x.r.f, `
        <span class="mv-delta ${up ? "up" : "down"}">${up ? "▲" : "▼"} ${Math.abs(x.delta)}</span>
        <span class="mv-who">${flag(f.country)}<span><span class="mv-name">${esc(f.name)}</span><span class="mv-where">${esc(where)} · now #${x.r.pos}</span></span></span>`, "mover");
    };
    return `<section class="movers wrap">
      <div class="sec-head"><h2>Biggest movers</h2><span>Since the previous update</span></div>
      <div class="mv-grid">
        ${m.up.length ? `<div class="mv-col"><h3>Rising</h3>${m.up.map(card).join("")}</div>` : ""}
        ${m.down.length ? `<div class="mv-col"><h3>Falling</h3>${m.down.map(card).join("")}</div>` : ""}
      </div></section>`;
  }

  /* ---------- pages ---------- */
  function boardPage(D, r, ctx) {
    const scope = r.scope;
    const div = D.divisions.find(d => d.id === r.div) || { name: "", limit: "" };
    const list = rows(D, scope, getList(D, scope, r.sub, r.div));
    const key = scope === "p4p" ? "p4p" : scope === "world" ? "world/" + r.div : scope + "/" + r.sub + "/" + r.div;
    const isHome = r.type === "home";
    const label = scopeLabel(D, scope, r.sub);
    const heading = scope === "p4p" ? "Pound-for-Pound" : div.name;
    const divOf = scope === "p4p" ? (id => {
      for (const d of D.divisions) { const p = rows(D, "world", getList(D, "world", null, d.id)).find(x => x.f === id); if (p) return d.name; }
      return "";
    }) : null;

    const title = isHome ? "MMA Ladder · MMA Rankings — World, Country & Organization"
      : scope === "p4p" ? "Pound-for-Pound MMA Rankings · MMA Ladder"
      : scope === "world" ? `${div.name} MMA Rankings (World) · MMA Ladder`
      : scope === "country" ? `${label} ${div.name} MMA Rankings · MMA Ladder`
      : `${label} ${div.name} Rankings · MMA Ladder`;
    const top = list.slice(0, 5).map(x => (x.champ ? "C " : "#" + x.pos + " ") + x.fighter.name).join(", ");
    const desc = isHome ? "The home of MMA rankings. World, national and organization rankings in every men's weight class, with fighter profiles, ranking history and fight results."
      : `Current ${scope === "p4p" ? "pound-for-pound" : (label === "World" ? "world " : label + " ") + div.name.toLowerCase()} MMA rankings${top ? ": " + top : ""}. Updated ${fmtDate(D.updated)}.`;

    const hero = isHome ? `<section class="hero wrap">
        <h1>The home of <em>MMA</em> rankings</h1>
        <p><span><span class="dot"></span>Updated ${esc(fmtDate(D.updated))}</span><span>${countRanked(D, ctx.preview)} ranked fighters · ${D.divisions.length} divisions</span></p>
      </section>${moversHtml(D, ctx)}` : "";
    const H = isHome ? "h2" : "h1";
    const html = `${hero}${controls(D, r, ctx)}
      <section class="board wrap">
        <div class="board-head">
          <div><${H} class="board-title">${esc(heading)}${!isHome ? `<span class="sr"> ${esc(scope === "p4p" ? "MMA rankings" : label + " MMA rankings")}</span>` : ""}</${H}>
          <div class="meta">${esc(scope === "p4p" ? "All weight classes" : div.limit || "")}${!isHome ? ` · Updated ${esc(fmtDate(D.updated))}` : ""}</div></div>
          <div class="head-right">${historySelect(D, key)}<span class="scope-tag">${scopeTagHtml(D, scope, r.sub)}</span></div>
        </div>
        ${scope === "p4p" && !D.settings.p4pPublic ? `<div class="notice-hidden">This ranking is hidden from the public. Only visible in preview.</div>` : ""}
        <div class="list" data-list="${esc(key)}">${listHtml(D, list, ctx, { divOf })}</div>
      </section>`;
    return { title, desc, html, path: path(D, r) };
  }

  function countRanked(D, preview) {
    const s = new Set();
    const c = l => l.forEach(e => s.add(e.f));
    Object.values(D.rankings.world).forEach(c);
    Object.values(D.rankings.country).forEach(g => Object.values(g).forEach(c));
    Object.values(D.rankings.org).forEach(g => Object.values(g).forEach(c));
    if (p4pOn(D, preview)) c(D.rankings.p4p);
    return s.size;
  }

  function standings(D, id, preview) {
    const out = [];
    const add = (scope, sub, divId, list) => rows(D, scope, list).forEach(r => { if (r.f === id) out.push({ scope, sub, div: divId, rank: r.champ ? "C" : r.pos }); });
    if (p4pOn(D, preview)) add("p4p", null, null, D.rankings.p4p);
    D.divisions.forEach(d => {
      add("world", null, d.id, getList(D, "world", null, d.id));
      D.countries.forEach(c => add("country", c.code, d.id, getList(D, "country", c.code, d.id)));
      rankedOrgs(D).forEach(o => add("org", o.id, d.id, getList(D, "org", o.id, d.id)));
    });
    const order = { p4p: 0, world: 1, country: 2, org: 3 };
    return out.sort((x, y) => order[x.scope] - order[y.scope]);
  }

  function fighterPage(D, r, ctx) {
    const id = r.id, f = D.fighters[id];
    const o = orgById(D, f.org);
    const st = standings(D, id, ctx.preview);
    const fights = fightsOf(D, id);
    const lf = fights[0];
    const hist = rankHistory(D, id, ctx.preview);

    const stHtml = st.length ? st.map(s => {
      const p = s.scope === "p4p" ? "p4p" : path(D, { scope: s.scope, sub: s.sub, div: s.div });
      const icon = s.scope === "country" ? flag(s.sub) : s.scope === "org" ? `<span class="swatch" style="background:${esc((orgById(D, s.sub) || {}).color || "#888")}"></span>` : "";
      const t = s.scope === "p4p" ? "Pound-for-Pound" : `${scopeLabel(D, s.scope, s.sub)} · ${(D.divisions.find(d => d.id === s.div) || {}).name || ""}`;
      const kind = s.scope === "p4p" ? "All divisions" : s.scope === "world" ? "Global ranking" : s.scope === "country" ? "National ranking" : "Organization ranking";
      return a(ctx.link, p, `<span><span class="st-title">${icon}${esc(t)}</span><span class="st-sub">${kind}</span></span>
        <span class="st-rank ${s.rank === "C" ? "c" : ""}">${s.rank === "C" ? "CHAMPION" : "#" + s.rank}</span>`, "standing");
    }).join("") : `<p class="muted">Currently unranked.</p>`;

    const multiPoint = hist.some(h => h.points.filter(p => p.rank != null).length > 1);
    const histHtml = hist.length ? `
      <div class="chart-tabs">${hist.map((h, i) => `<button data-chart="${i}" class="${i === 0 ? "on" : ""}">${esc(h.label)}</button>`).join("")}</div>
      ${hist.map((h, i) => `<div class="chart-wrap" data-chart-pane="${i}" ${i ? "hidden" : ""}>${chartSvg(h)}</div>`).join("")}
      ${!multiPoint ? `<p class="muted small">The chart grows with every rankings update.</p>` : ""}` : `<p class="muted">No ranking history yet.</p>`;

    const fightsHtml = fights.length ? `<div class="fights">${fights.map(x => `
      <div class="fight">
        ${resultBadge(x.res)}
        <span class="f-opp">${flag(x.opp.country)}${x.opp.id ? a(ctx.link, "fighter/" + x.opp.id, esc(x.opp.name)) : `<span>${esc(x.opp.name)}</span>`}</span>
        <span class="f-meth">${esc([x.method, x.round ? "R" + x.round : ""].filter(Boolean).join(" · "))}</span>
        <span class="f-ev">${esc(x.event)}<small>${esc(fmtDate(x.date))}</small></span>
      </div>`).join("")}</div>` : `<p class="muted">No fights recorded yet.</p>`;

    const title = `${f.name} – MMA Ranking & Record · MMA Ladder`;
    const desc = `${f.name}${f.nick ? ` “${f.nick}”` : ""} (${countryName(f.country) || "MMA"}${o ? ", " + o.name : ""})` +
      (st.length ? ": " + st.slice(0, 3).map(s => (s.rank === "C" ? "Champion " : "#" + s.rank + " ") + (s.scope === "p4p" ? "P4P" : scopeLabel(D, s.scope, s.sub) + " " + ((D.divisions.find(d => d.id === s.div) || {}).name || ""))).join(", ") : "") +
      (f.record ? `. Record ${f.record}` : "") + ". Ranking history and fight results on MMA Ladder.";
    const jsonld = { "@context": "https://schema.org", "@type": "Person", name: f.name, nationality: countryName(f.country) || undefined, alternateName: f.nick || undefined, memberOf: o ? { "@type": "SportsOrganization", name: o.name } : undefined };

    const html = `<section class="fighter wrap">
      <nav class="crumbs">${a(ctx.link, "", "Rankings")}<span>/</span><span>${esc(f.name)}</span></nav>
      <div class="f-hero">
        ${f.country ? `<img class="bgflag" src="https://flagcdn.com/w640/${esc(f.country)}.png" alt="" onerror="this.remove()">` : ""}
        ${flag(f.country, "flag-lg")}
        <h1>${esc(f.name)}</h1>
        ${f.nick ? `<div class="nickbig">“${esc(f.nick)}”</div>` : ""}
        <div class="facts">
          <div class="fact"><small>Country</small><div>${esc(countryName(f.country)) || "–"}</div></div>
          <div class="fact"><small>Organization</small><div>${o ? orgTag(D, f.org) : "–"}</div></div>
          <div class="fact"><small>Record</small><div>${esc(f.record || "–")}</div></div>
          ${lf ? `<div class="fact"><small>Last fight</small><div>${resultBadge(lf.res)} ${esc(lf.opp.name)}${lf.method ? ` <span class="muted">· ${esc(lf.method)}</span>` : ""}</div></div>` : ""}
        </div>
      </div>
      <div class="f-grid">
        <div class="f-card"><h2>Current standings</h2>${stHtml}</div>
        <div class="f-card"><h2>Ranking history</h2>${histHtml}</div>
      </div>
      <div class="f-card"><h2>Fight history</h2>${fightsHtml}</div>
    </section>`;
    return { title, desc, html, path: path(D, r), jsonld };
  }

  // tiny, safe markdown: "## heading", "- item", **bold**, blank line = new paragraph
  function md(text) {
    const inline = s => esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    const out = []; let list = null, para = [];
    const flushP = () => { if (para.length) { out.push(`<p>${inline(para.join(" "))}</p>`); para = []; } };
    const flushL = () => { if (list) { out.push(`<ul>${list.map(li => `<li>${inline(li)}</li>`).join("")}</ul>`); list = null; } };
    String(text || "").split(/\r?\n/).forEach(line => {
      const l = line.trim();
      if (!l) { flushP(); flushL(); }
      else if (l.startsWith("## ")) { flushP(); flushL(); out.push(`<h2>${inline(l.slice(3))}</h2>`); }
      else if (/^[-*] /.test(l)) { flushP(); (list = list || []).push(l.slice(2)); }
      else { flushL(); para.push(l); }
    });
    flushP(); flushL();
    return out.join("\n");
  }
  function aboutPage(D, ctx) {
    const html = `<section class="wrap about">
      <nav class="crumbs">${a(ctx.link, "", "Rankings")}<span>/</span><span>How we rank</span></nav>
      <h1>How we rank</h1>
      <div class="prose">${md(D.about.body)}</div>
      <p class="muted small">Last updated ${esc(fmtDate(D.updated))}.</p>
    </section>`;
    return { title: "How We Rank · MMA Ladder", desc: "How MMA Ladder ranks fighters: quality of opposition, recency, performance and level of competition, reviewed by our team.", html, path: "how-we-rank" };
  }

  function notFoundPage(D, ctx) {
    return { title: "Page not found · MMA Ladder", desc: "Page not found.", html: `<section class="wrap nf"><h1>Not found</h1><p class="muted">This page doesn't exist. ${a(ctx.link, "", "Back to rankings")}</p></section>`, path: "404" };
  }

  function page(D, r, ctx) {
    if (r.type === "fighter") return fighterPage(D, r, ctx);
    if (r.type === "about") return aboutPage(D, ctx);
    if (r.type === "home" || r.type === "board") return boardPage(D, r, ctx);
    return notFoundPage(D, ctx);
  }

  return { parse, path, allRoutes, page, rows, getList, listHtml, historyRows, snapshot, timeline, movers, scopeLabel, fightsOf, lastFight, side, divSlug, rankedOrgs, orgById };
})();
