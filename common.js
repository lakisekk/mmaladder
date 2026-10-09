/* MMA Ladder – shared helpers (used by index.html and admin.html) */
window.MML = (function () {
  const COUNTRIES = {
    af:"Afghanistan", al:"Albania", dz:"Algeria", ao:"Angola", ar:"Argentina", am:"Armenia", au:"Australia",
    at:"Austria", az:"Azerbaijan", by:"Belarus", be:"Belgium", ba:"Bosnia and Herzegovina", br:"Brazil",
    bg:"Bulgaria", cm:"Cameroon", ca:"Canada", cl:"Chile", cn:"China", co:"Colombia", hr:"Croatia", cu:"Cuba",
    cy:"Cyprus", cz:"Czechia", cd:"DR Congo", dk:"Denmark", do:"Dominican Republic", ec:"Ecuador", eg:"Egypt",
    "gb-eng":"England", ee:"Estonia", fi:"Finland", fr:"France", ge:"Georgia", de:"Germany", gh:"Ghana",
    gr:"Greece", hu:"Hungary", is:"Iceland", in:"India", id:"Indonesia", ir:"Iran", iq:"Iraq", ie:"Ireland",
    il:"Israel", it:"Italy", jm:"Jamaica", jp:"Japan", kz:"Kazakhstan", kr:"South Korea", xk:"Kosovo",
    kg:"Kyrgyzstan", lv:"Latvia", lt:"Lithuania", mx:"Mexico", md:"Moldova", mn:"Mongolia", me:"Montenegro",
    ma:"Morocco", mm:"Myanmar", nl:"Netherlands", nz:"New Zealand", ng:"Nigeria", mk:"North Macedonia",
    no:"Norway", pe:"Peru", ph:"Philippines", pl:"Poland", pt:"Portugal", ro:"Romania", ru:"Russia",
    "gb-sct":"Scotland", rs:"Serbia", sk:"Slovakia", si:"Slovenia", za:"South Africa", es:"Spain", se:"Sweden",
    ch:"Switzerland", tj:"Tajikistan", th:"Thailand", tn:"Tunisia", tr:"Türkiye", tm:"Turkmenistan",
    ua:"Ukraine", ae:"United Arab Emirates", gb:"United Kingdom", us:"United States", uz:"Uzbekistan",
    ve:"Venezuela", "gb-wls":"Wales"
  };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, c =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function countryName(code) { return COUNTRIES[code] || (code ? code.toUpperCase() : ""); }

  function flag(code, cls) {
    if (!code) return `<span class="flag flag-empty ${cls || ""}"></span>`;
    const c = esc(code.toLowerCase());
    return `<img class="flag ${cls || ""}" src="https://flagcdn.com/w40/${c}.png" ` +
      `srcset="https://flagcdn.com/w80/${c}.png 2x" alt="${esc(countryName(code))}" ` +
      `title="${esc(countryName(code))}" loading="lazy" ` +
      `onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'flag flag-text',textContent:'${c.toUpperCase()}'}))">`;
  }

  function slug(s) {
    return String(s).normalize("NFD").replace(/[̀-ͯ]/g, "")
      .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function fmtDate(iso) {
    if (!iso) return "";
    const d = new Date(iso + "T12:00:00");
    if (isNaN(d)) return iso;
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  /* Ensure data has every expected key so pages never crash on partial files */
  function normalize(d) {
    d = d || {};
    d.divisions = d.divisions || [];
    d.countries = d.countries || [];
    d.orgs = d.orgs || [];
    d.fighters = d.fighters || {};
    d.rankings = d.rankings || {};
    d.rankings.world = d.rankings.world || {};
    d.rankings.country = d.rankings.country || {};
    d.rankings.org = d.rankings.org || {};
    return d;
  }

  const DRAFT_KEY = "mmaladder_draft";
  function readDraft() {
    try { const t = localStorage.getItem(DRAFT_KEY); return t ? JSON.parse(t) : null; } catch (e) { return null; }
  }
  function writeDraft(d) {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(d)); return true; } catch (e) { return false; }
  }
  function clearDraft() { try { localStorage.removeItem(DRAFT_KEY); } catch (e) {} }

  return { COUNTRIES, esc, countryName, flag, slug, fmtDate, normalize, readDraft, writeDraft, clearDraft };
})();
