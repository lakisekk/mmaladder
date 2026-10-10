/* MMA Ladder – browser app: routing, search, interactions. Rendering lives in render.js. */
(function () {
  const { esc, flag, countryName, normalize } = MML;
  const $ = id => document.getElementById(id);

  const SITE = window.__SITE__ || null;                 // set by build.js on the deployed site
  const preview = /[?&]preview\b/.test(location.search);
  const draft = preview ? MML.readDraft() : null;
  const D = normalize(draft || window.MMA_DATA);
  const built = !!SITE && !preview;                      // clean URLs (/fighter/x/) vs hash URLs (#/fighter/x)
  const base = SITE ? SITE.base : "";
  if (preview) $("previewBar").hidden = false;
  $("year").textContent = new Date().getFullYear();

  const link = p => built ? base + (p ? p + "/" : "") : "#/" + p;
  const ctx = { link, preview };

  function currentPath() {
    if (built) {
      let p = decodeURIComponent(location.pathname);
      p = p.startsWith(base) ? p.slice(base.length) : p.replace(/^\/+/, "");
      return p.replace(/index\.html$/, "");
    }
    return decodeURIComponent(location.hash.replace(/^#\/?/, ""));
  }

  function setMeta(sel, attr, val) { const m = document.querySelector(sel); if (m) m.setAttribute(attr, val); }

  let route = null;
  function render() {
    route = MLR.parse(D, currentPath(), preview);
    const pg = MLR.page(D, route, ctx);
    document.title = pg.title;
    setMeta('meta[name="description"]', "content", pg.desc);
    setMeta('meta[property="og:title"]', "content", pg.title);
    setMeta('meta[property="og:description"]', "content", pg.desc);
    $("app").innerHTML = pg.html;
    const on = document.querySelector(".divs .on");
    if (on) { const nav = on.parentElement; const l = on.offsetLeft - nav.offsetLeft; if (l < nav.scrollLeft || l + on.offsetWidth > nav.scrollLeft + nav.clientWidth) nav.scrollLeft = l - 16; }
    if (window.goatcounter && window.goatcounter.count && !preview) window.goatcounter.count({ path: location.pathname + location.hash });
  }

  function navigate(p) {
    // stay in place when switching between rankings; jump to top for fighter / info pages
    const boardish = r => r && (r.type === "board" || r.type === "home");
    const wasFighter = !(boardish(route) && boardish(MLR.parse(D, p, preview)));
    if (built) { history.pushState(null, "", link(p)); render(); }
    else if (location.hash === "#/" + p) render();
    else { location.hash = "#/" + p; return void (pendingScroll = wasFighter); }
    if (wasFighter) window.scrollTo(0, 0);
  }
  let pendingScroll = false;

  // a legacy #/ link opened on the built site → move it to the clean URL
  if (built && location.hash.startsWith("#/")) history.replaceState(null, "", link(location.hash.slice(2).replace(/\/$/, "")));

  document.addEventListener("click", e => {
    const a = e.target.closest("a[data-r]");
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
    e.preventDefault();
    navigate(a.dataset.r);
  });
  window.addEventListener("popstate", () => { if (built) render(); });
  window.addEventListener("hashchange", () => { if (!built) { render(); if (pendingScroll) window.scrollTo(0, 0); pendingScroll = false; } });

  /* chart tabs + "as of" history view */
  $("app").addEventListener("click", e => {
    const b = e.target.closest("[data-chart]"); if (!b) return;
    const card = b.closest(".f-card");
    card.querySelectorAll("[data-chart]").forEach(x => x.classList.toggle("on", x === b));
    card.querySelectorAll("[data-chart-pane]").forEach(x => { x.hidden = x.dataset.chartPane !== b.dataset.chart; });
  });
  $("app").addEventListener("change", e => {
    const s = e.target.closest("select[data-history]"); if (!s) return;
    const key = s.dataset.history;
    const listEl = document.querySelector(`[data-list="${CSS.escape(key)}"]`);
    const note = document.querySelector(".history-note");
    if (note) note.remove();
    if (!s.value) { render(); return; }
    const rows = MLR.historyRows(D, key, s.value) || [];
    listEl.innerHTML = MLR.listHtml(D, rows, ctx, { noMoves: true, emptyText: "Nobody was ranked here on that date." });
    listEl.insertAdjacentHTML("beforebegin", `<div class="history-note">Showing the ranking as it stood on ${esc(MML.fmtDate(s.value))}.</div>`);
  });

  /* search */
  const norm = s => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  let active = 0, hits = [];
  function search() {
    const q = norm($("q").value.trim());
    const box = $("results");
    if (!q) { box.classList.remove("open"); return; }
    hits = Object.entries(D.fighters)
      .filter(([id, f]) => norm(f.name).includes(q) || (f.nick && norm(f.nick).includes(q)))
      .sort((a, b) => norm(a[1].name).indexOf(q) - norm(b[1].name).indexOf(q))
      .slice(0, 7);
    active = 0;
    box.innerHTML = hits.length ? hits.map(([id, f], i) => {
      const o = MLR.orgById(D, f.org);
      return `<button data-id="${esc(id)}" class="${i === 0 ? "active" : ""}">${flag(f.country)}<span><span class="r-name">${esc(f.name)}</span><span class="r-sub">${esc(countryName(f.country))}${o ? " · " + esc(o.name) : ""}</span></span></button>`;
    }).join("") : `<div class="empty">No fighter found</div>`;
    box.classList.add("open");
  }
  function pick(id) { $("q").value = ""; $("results").classList.remove("open"); $("q").blur(); navigate("fighter/" + id); }
  $("q").addEventListener("input", search);
  $("q").addEventListener("keydown", e => {
    const btns = [...$("results").querySelectorAll("button")];
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault(); if (!btns.length) return;
      active = (active + (e.key === "ArrowDown" ? 1 : -1) + btns.length) % btns.length;
      btns.forEach((b, i) => b.classList.toggle("active", i === active));
    } else if (e.key === "Enter" && hits[active]) pick(hits[active][0]);
    else if (e.key === "Escape") { $("results").classList.remove("open"); $("q").blur(); }
  });
  $("results").addEventListener("mousedown", e => { const b = e.target.closest("button[data-id]"); if (b) { e.preventDefault(); pick(b.dataset.id); } });
  $("q").addEventListener("blur", () => setTimeout(() => $("results").classList.remove("open"), 120));

  /* analytics (configured in the editor → Nastavení) */
  function analytics() {
    const t = D.settings.analyticsType, id = (D.settings.analyticsId || "").trim();
    if (preview || !t || !id) return;
    const s = document.createElement("script");
    if (t === "cloudflare") { s.defer = true; s.src = "https://static.cloudflareinsights.com/beacon.min.js"; s.setAttribute("data-cf-beacon", JSON.stringify({ token: id })); }
    else if (t === "goatcounter") { s.async = true; s.src = "https://gc.zgo.at/count.js"; s.setAttribute("data-goatcounter", `https://${id}.goatcounter.com/count`); }
    else if (t === "ga4") {
      s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { dataLayer.push(arguments); };
      gtag("js", new Date()); gtag("config", id);
    } else return;
    document.head.appendChild(s);
  }

  /* partner banners (configured in the editor → Nastavení → Reklamy) */
  function renderAds() {
    const A = D.ads;
    const items = A.enabled ? A.items.filter(x => x.active !== false && x.img && x.url) : [];
    const side = $("adsSide"), inline = $("adsInline");
    if (!items.length) { side.hidden = inline.hidden = true; return; }
    const shuffled = items.slice().sort(() => Math.random() - .5);
    const one = x => `<a class="ad" href="${esc(x.url)}" target="_blank" rel="sponsored noopener nofollow" data-ad="${esc(x.name || "")}"><img src="${esc(x.img)}" alt="${esc(x.alt || x.name || "Partner")}" loading="lazy" width="300" height="250"></a>`;
    const note = A.disclaimer ? `<p class="ad-note">${esc(A.disclaimer)}</p>` : "";
    const sideItems = shuffled.filter(x => x.place !== "inline").slice(0, 2);
    const inlineItem = shuffled.find(x => x.place !== "side");
    side.innerHTML = sideItems.length ? `<p class="ad-label">Partner</p>${sideItems.map(one).join("")}${note}` : "";
    side.hidden = !sideItems.length;
    inline.innerHTML = inlineItem ? `<div class="ad-box"><p class="ad-label">Partner</p>${one(inlineItem)}${note}</div>` : "";
    inline.hidden = !inlineItem;
    inline.classList.toggle("has-side", !!sideItems.length);
  }
  document.addEventListener("click", e => {
    const a = e.target.closest("a[data-ad]");
    if (a && window.gtag) gtag("event", "partner_click", { partner: a.dataset.ad });
    if (a && window.goatcounter && window.goatcounter.count) goatcounter.count({ path: "partner-click-" + a.dataset.ad, event: true });
  });

  /* newsletter (configured in the editor → Nastavení → Newsletter; off by default) */
  function renderNewsletter() {
    const N = D.newsletter, box = $("newsletter");
    const action = (N.action || "").trim();
    if (!N.enabled || !/^https:\/\//i.test(action)) { box.hidden = true; return; }
    box.innerHTML = `<div class="nl-box">
      <div><h2>${esc(N.title)}</h2><p>${esc(N.text)}</p></div>
      <form class="nl-form" action="${esc(action)}" method="post" target="_blank">
        <input type="email" name="${esc(N.field || "email")}" required placeholder="Your email" aria-label="Email address" autocomplete="email">
        <button type="submit">${esc(N.button || "Subscribe")}</button>
      </form>
      ${N.consent ? `<p class="nl-consent">${esc(N.consent)}</p>` : ""}
    </div>`;
    box.hidden = false;
  }
  if (!D.about.enabled) $("aboutLink").remove();
  else if (!built) $("aboutLink").setAttribute("href", "#/how-we-rank");

  render();
  renderAds();
  renderNewsletter();
  analytics();
})();
