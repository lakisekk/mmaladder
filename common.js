/* MMA Ladder – shared helpers (used by index.html and admin.html) */
window.MML = (function () {
  const COUNTRIES = {
    "ad": "Andorra",
    "ae": "United Arab Emirates",
    "af": "Afghanistan",
    "ag": "Antigua and Barbuda",
    "ai": "Anguilla",
    "al": "Albania",
    "am": "Armenia",
    "ao": "Angola",
    "aq": "Antarctica",
    "ar": "Argentina",
    "as": "American Samoa",
    "at": "Austria",
    "au": "Australia",
    "aw": "Aruba",
    "ax": "Åland Islands",
    "az": "Azerbaijan",
    "ba": "Bosnia and Herzegovina",
    "bb": "Barbados",
    "bd": "Bangladesh",
    "be": "Belgium",
    "bf": "Burkina Faso",
    "bg": "Bulgaria",
    "bh": "Bahrain",
    "bi": "Burundi",
    "bj": "Benin",
    "bl": "Saint Barthélemy",
    "bm": "Bermuda",
    "bn": "Brunei",
    "bo": "Bolivia",
    "bq": "Caribbean Netherlands",
    "br": "Brazil",
    "bs": "Bahamas",
    "bt": "Bhutan",
    "bv": "Bouvet Island",
    "bw": "Botswana",
    "by": "Belarus",
    "bz": "Belize",
    "ca": "Canada",
    "cc": "Cocos (Keeling) Islands",
    "cd": "DR Congo",
    "cf": "Central African Republic",
    "cg": "Congo",
    "ch": "Switzerland",
    "ci": "Ivory Coast",
    "ck": "Cook Islands",
    "cl": "Chile",
    "cm": "Cameroon",
    "cn": "China",
    "co": "Colombia",
    "cr": "Costa Rica",
    "cu": "Cuba",
    "cv": "Cape Verde",
    "cw": "Curaçao",
    "cx": "Christmas Island",
    "cy": "Cyprus",
    "cz": "Czechia",
    "de": "Germany",
    "dj": "Djibouti",
    "dk": "Denmark",
    "dm": "Dominica",
    "do": "Dominican Republic",
    "dz": "Algeria",
    "ec": "Ecuador",
    "ee": "Estonia",
    "eg": "Egypt",
    "eh": "Western Sahara",
    "er": "Eritrea",
    "es": "Spain",
    "et": "Ethiopia",
    "fi": "Finland",
    "fj": "Fiji",
    "fk": "Falkland Islands",
    "fm": "Micronesia",
    "fo": "Faroe Islands",
    "fr": "France",
    "ga": "Gabon",
    "gb": "United Kingdom",
    "gb-eng": "England",
    "gb-nir": "Northern Ireland",
    "gb-sct": "Scotland",
    "gb-wls": "Wales",
    "gd": "Grenada",
    "ge": "Georgia",
    "gf": "French Guiana",
    "gg": "Guernsey",
    "gh": "Ghana",
    "gi": "Gibraltar",
    "gl": "Greenland",
    "gm": "Gambia",
    "gn": "Guinea",
    "gp": "Guadeloupe",
    "gq": "Equatorial Guinea",
    "gr": "Greece",
    "gs": "South Georgia and the South Sandwich Islands",
    "gt": "Guatemala",
    "gu": "Guam",
    "gw": "Guinea-Bissau",
    "gy": "Guyana",
    "hk": "Hong Kong",
    "hm": "Heard Island and McDonald Islands",
    "hn": "Honduras",
    "hr": "Croatia",
    "ht": "Haiti",
    "hu": "Hungary",
    "id": "Indonesia",
    "ie": "Ireland",
    "il": "Israel",
    "im": "Isle of Man",
    "in": "India",
    "io": "British Indian Ocean Territory",
    "iq": "Iraq",
    "ir": "Iran",
    "is": "Iceland",
    "it": "Italy",
    "je": "Jersey",
    "jm": "Jamaica",
    "jo": "Jordan",
    "jp": "Japan",
    "ke": "Kenya",
    "kg": "Kyrgyzstan",
    "kh": "Cambodia",
    "ki": "Kiribati",
    "km": "Comoros",
    "kn": "Saint Kitts and Nevis",
    "kp": "North Korea",
    "kr": "South Korea",
    "kw": "Kuwait",
    "ky": "Cayman Islands",
    "kz": "Kazakhstan",
    "la": "Laos",
    "lb": "Lebanon",
    "lc": "Saint Lucia",
    "li": "Liechtenstein",
    "lk": "Sri Lanka",
    "lr": "Liberia",
    "ls": "Lesotho",
    "lt": "Lithuania",
    "lu": "Luxembourg",
    "lv": "Latvia",
    "ly": "Libya",
    "ma": "Morocco",
    "mc": "Monaco",
    "md": "Moldova",
    "me": "Montenegro",
    "mf": "Saint Martin",
    "mg": "Madagascar",
    "mh": "Marshall Islands",
    "mk": "North Macedonia",
    "ml": "Mali",
    "mm": "Myanmar",
    "mn": "Mongolia",
    "mo": "Macao",
    "mp": "Northern Mariana Islands",
    "mq": "Martinique",
    "mr": "Mauritania",
    "ms": "Montserrat",
    "mt": "Malta",
    "mu": "Mauritius",
    "mv": "Maldives",
    "mw": "Malawi",
    "mx": "Mexico",
    "my": "Malaysia",
    "mz": "Mozambique",
    "na": "Namibia",
    "nc": "New Caledonia",
    "ne": "Niger",
    "nf": "Norfolk Island",
    "ng": "Nigeria",
    "ni": "Nicaragua",
    "nl": "Netherlands",
    "no": "Norway",
    "np": "Nepal",
    "nr": "Nauru",
    "nu": "Niue",
    "nz": "New Zealand",
    "om": "Oman",
    "pa": "Panama",
    "pe": "Peru",
    "pf": "French Polynesia",
    "pg": "Papua New Guinea",
    "ph": "Philippines",
    "pk": "Pakistan",
    "pl": "Poland",
    "pm": "Saint Pierre and Miquelon",
    "pn": "Pitcairn",
    "pr": "Puerto Rico",
    "ps": "Palestine",
    "pt": "Portugal",
    "pw": "Palau",
    "py": "Paraguay",
    "qa": "Qatar",
    "re": "Réunion",
    "ro": "Romania",
    "rs": "Serbia",
    "ru": "Russia",
    "rw": "Rwanda",
    "sa": "Saudi Arabia",
    "sb": "Solomon Islands",
    "sc": "Seychelles",
    "sd": "Sudan",
    "se": "Sweden",
    "sg": "Singapore",
    "sh": "Saint Helena",
    "si": "Slovenia",
    "sj": "Svalbard and Jan Mayen",
    "sk": "Slovakia",
    "sl": "Sierra Leone",
    "sm": "San Marino",
    "sn": "Senegal",
    "so": "Somalia",
    "sr": "Suriname",
    "ss": "South Sudan",
    "st": "Sao Tome and Principe",
    "sv": "El Salvador",
    "sx": "Sint Maarten",
    "sy": "Syria",
    "sz": "Eswatini",
    "tc": "Turks and Caicos Islands",
    "td": "Chad",
    "tf": "French Southern Territories",
    "tg": "Togo",
    "th": "Thailand",
    "tj": "Tajikistan",
    "tk": "Tokelau",
    "tl": "Timor-Leste",
    "tm": "Turkmenistan",
    "tn": "Tunisia",
    "to": "Tonga",
    "tr": "Türkiye",
    "tt": "Trinidad and Tobago",
    "tv": "Tuvalu",
    "tw": "Taiwan",
    "tz": "Tanzania",
    "ua": "Ukraine",
    "ug": "Uganda",
    "um": "US Minor Outlying Islands",
    "us": "United States",
    "uy": "Uruguay",
    "uz": "Uzbekistan",
    "va": "Vatican City",
    "vc": "Saint Vincent and the Grenadines",
    "ve": "Venezuela",
    "vg": "British Virgin Islands",
    "vi": "US Virgin Islands",
    "vn": "Vietnam",
    "vu": "Vanuatu",
    "wf": "Wallis and Futuna",
    "ws": "Samoa",
    "xk": "Kosovo",
    "ye": "Yemen",
    "yt": "Mayotte",
    "za": "South Africa",
    "zm": "Zambia",
    "zw": "Zimbabwe"
  };

  // previous default text – replaced automatically by the new default if it was never edited
  const ABOUT_OLD = "## What we rank\nMMA Ladder ranks active professional MMA fighters in eight men's weight classes: worldwide, by country and by organization.\n\n## What matters\n- **Who you beat.** A win over a ranked, proven opponent counts far more than a win over an unknown one.\n- **When you did it.** Recent results weigh more than old ones. Long inactivity slowly costs places.\n- **How you won.** Finishes and dominant performances matter, but a win is a win.\n- **Level of competition.** Results are weighted by the strength of the opponent and the organization.\n- **Big fights.** Title fights and main events carry extra weight.\n\n## How it works\nEvery ranking starts from the same model built on fight results. The final order is then reviewed by our team, because no formula sees everything: injuries, short-notice fights, weight misses or controversial decisions. The exact formula and its weights are not public, so the rankings can't be gamed.\n\n## Updates\nRankings are updated after every major event. Arrows show how many places a fighter moved since the previous update.\n\n## Independence\nRankings are not for sale. Promoters, sponsors and betting partners have no influence on placements.";

  const ABOUT_DEFAULT = "## What we rank\nMMA Ladder ranks active professional MMA fighters in eight men's weight classes: worldwide, by country and by organization.\n\n## Our approach\nOur rankings answer one simple question: who would beat whom today?\n\nPurely statistical rankings reward whoever looks best on paper. In MMA that often misleads: records get padded, the level of competition differs hugely between organizations, and one fight can tell you more than ten wins on regional cards. That's why data is our foundation, not the final word.\n\n- **The numbers.** Every fighter is first rated by a model built on results: who they beat, how, when and at what level.\n- **The human factor.** The order is then reviewed fighter by fighter: styles and matchups, current form, activity, injuries, weight cuts and what we actually see in the cage. Where the numbers miss reality, we correct them.\n\nThe goal: the fighter ranked #3 should beat the fighter ranked #4, not just have a better-looking record.\n\nThe exact formula and its weights are not public, so the rankings can't be gamed.\n\n## What matters\n- **Who you beat.** A win over a ranked, proven opponent counts far more than a win over an unknown one.\n- **When you did it.** Recent results weigh more than old ones. Long inactivity slowly costs places.\n- **How you won.** Finishes and dominant performances matter, but a win is a win.\n- **Level of competition.** Results are weighted by the strength of the opponent and the organization.\n- **Big fights.** Title fights and main events carry extra weight.\n\n## Updates\nRankings are updated after every major event. Arrows show how many places a fighter moved since the previous update.";
  const ABOUT_DEFAULT_CS = "## Co hodnotíme\nMMA Ladder hodnotí aktivní profesionální MMA zápasníky v osmi mužských vahách: celosvětově, podle zemí a podle organizací.\n\n## Náš přístup\nNaše žebříčky odpovídají na jednoduchou otázku: kdo by dnes koho porazil?\n\nČistě statistické žebříčky odměňují toho, kdo vypadá nejlíp na papíře. V MMA to často klame: bilance se dají nafouknout, úroveň soupeřů se mezi organizacemi obrovsky liší a jeden zápas řekne víc než deset výher na regionálních turnajích. Proto jsou pro nás data základ, ne konečný verdikt.\n\n- **Čísla.** Každého zápasníka nejdřív ohodnotí model postavený na výsledcích: koho porazil, jak, kdy a na jaké úrovni.\n- **Lidský faktor.** Pořadí pak procházíme zápasníka po zápasníkovi: styly a vzájemné souboje, aktuální forma, aktivita, zranění, shazování váhy a to, co skutečně vidíme v kleci. Kde čísla míjí realitu, opravíme je.\n\nCíl: zápasník na 3. místě by měl porazit zápasníka na 4. místě, ne mít jen hezčí bilanci.\n\nPřesný vzorec a jeho váhy nezveřejňujeme, aby se žebříčky nedaly obejít.\n\n## Na čem záleží\n- **Koho porazil.** Výhra nad hodnoceným, prověřeným soupeřem má mnohem větší váhu než výhra nad neznámým.\n- **Kdy to dokázal.** Čerstvé výsledky váží víc než staré. Dlouhá neaktivita postupně stojí místa.\n- **Jak vyhrál.** Ukončení a dominantní výkony se počítají, ale výhra je výhra.\n- **Úroveň soupeřů.** Výsledky vážíme podle síly soupeře i organizace.\n- **Velké zápasy.** Titulové zápasy a hlavní zápasy večera mají větší váhu.\n\n## Aktualizace\nŽebříčky aktualizujeme po každém velkém turnaji. Šipky ukazují, o kolik míst se zápasník posunul od poslední aktualizace.";
  const ABOUT_DEFAULT_DE = "## Was wir ranken\nMMA Ladder rankt aktive professionelle MMA-Kämpfer in acht Gewichtsklassen der Männer: weltweit, nach Land und nach Organisation.\n\n## Unser Ansatz\nUnsere Rankings beantworten eine einfache Frage: Wer würde heute wen schlagen?\n\nRein statistische Rankings belohnen, wer auf dem Papier am besten aussieht. Im MMA führt das oft in die Irre: Kampfbilanzen werden aufgepolstert, das Niveau der Gegner unterscheidet sich zwischen Organisationen enorm, und ein einziger Kampf sagt oft mehr als zehn Siege auf regionalen Events. Deshalb sind Daten für uns die Grundlage, nicht das letzte Wort.\n\n- **Die Zahlen.** Jeder Kämpfer wird zuerst von einem Modell bewertet, das auf Ergebnissen basiert: wen er geschlagen hat, wie, wann und auf welchem Niveau.\n- **Der menschliche Faktor.** Danach prüfen wir die Reihenfolge Kämpfer für Kämpfer: Stile und Matchups, aktuelle Form, Aktivität, Verletzungen, Gewichtmachen und was wir tatsächlich im Käfig sehen. Wo die Zahlen an der Realität vorbeigehen, korrigieren wir sie.\n\nDas Ziel: Der Kämpfer auf Platz 3 sollte den Kämpfer auf Platz 4 schlagen, nicht nur die schönere Bilanz haben.\n\nDie genaue Formel und ihre Gewichtung veröffentlichen wir nicht, damit sich die Rankings nicht manipulieren lassen.\n\n## Worauf es ankommt\n- **Wen er geschlagen hat.** Ein Sieg gegen einen gerankten, bewährten Gegner zählt weit mehr als einer gegen einen Unbekannten.\n- **Wann.** Aktuelle Ergebnisse zählen mehr als alte. Lange Inaktivität kostet nach und nach Plätze.\n- **Wie.** Finishes und dominante Leistungen zählen, aber ein Sieg ist ein Sieg.\n- **Niveau der Konkurrenz.** Ergebnisse werden nach der Stärke des Gegners und der Organisation gewichtet.\n- **Große Kämpfe.** Titelkämpfe und Main Events zählen mehr.\n\n## Updates\nDie Rankings werden nach jedem großen Event aktualisiert. Pfeile zeigen, um wie viele Plätze sich ein Kämpfer seit dem letzten Update bewegt hat.";

  // earlier defaults (with the "Independence" section) – upgraded automatically if never edited
  const ABOUT_PREV = "## What we rank\nMMA Ladder ranks active professional MMA fighters in eight men's weight classes: worldwide, by country and by organization.\n\n## Our approach\nOur rankings answer one simple question: who would beat whom today?\n\nPurely statistical rankings reward whoever looks best on paper. In MMA that often misleads: records get padded, the level of competition differs hugely between organizations, and one fight can tell you more than ten wins on regional cards. That's why data is our foundation, not the final word.\n\n- **The numbers.** Every fighter is first rated by a model built on results: who they beat, how, when and at what level.\n- **The human factor.** The order is then reviewed fighter by fighter: styles and matchups, current form, activity, injuries, weight cuts and what we actually see in the cage. Where the numbers miss reality, we correct them.\n\nThe goal: the fighter ranked #3 should beat the fighter ranked #4, not just have a better-looking record.\n\nThe exact formula and its weights are not public, so the rankings can't be gamed.\n\n## What matters\n- **Who you beat.** A win over a ranked, proven opponent counts far more than a win over an unknown one.\n- **When you did it.** Recent results weigh more than old ones. Long inactivity slowly costs places.\n- **How you won.** Finishes and dominant performances matter, but a win is a win.\n- **Level of competition.** Results are weighted by the strength of the opponent and the organization.\n- **Big fights.** Title fights and main events carry extra weight.\n\n## Updates\nRankings are updated after every major event. Arrows show how many places a fighter moved since the previous update.\n\n## Independence\nRankings are not for sale. Promoters, sponsors and betting partners have no influence on placements.";
  const ABOUT_PREV_CS = "## Co hodnotíme\nMMA Ladder hodnotí aktivní profesionální MMA zápasníky v osmi mužských vahách: celosvětově, podle zemí a podle organizací.\n\n## Náš přístup\nNaše žebříčky odpovídají na jednoduchou otázku: kdo by dnes koho porazil?\n\nČistě statistické žebříčky odměňují toho, kdo vypadá nejlíp na papíře. V MMA to často klame: bilance se dají nafouknout, úroveň soupeřů se mezi organizacemi obrovsky liší a jeden zápas řekne víc než deset výher na regionálních turnajích. Proto jsou pro nás data základ, ne konečný verdikt.\n\n- **Čísla.** Každého zápasníka nejdřív ohodnotí model postavený na výsledcích: koho porazil, jak, kdy a na jaké úrovni.\n- **Lidský faktor.** Pořadí pak procházíme zápasníka po zápasníkovi: styly a vzájemné souboje, aktuální forma, aktivita, zranění, shazování váhy a to, co skutečně vidíme v kleci. Kde čísla míjí realitu, opravíme je.\n\nCíl: zápasník na 3. místě by měl porazit zápasníka na 4. místě, ne mít jen hezčí bilanci.\n\nPřesný vzorec a jeho váhy nezveřejňujeme, aby se žebříčky nedaly obejít.\n\n## Na čem záleží\n- **Koho porazil.** Výhra nad hodnoceným, prověřeným soupeřem má mnohem větší váhu než výhra nad neznámým.\n- **Kdy to dokázal.** Čerstvé výsledky váží víc než staré. Dlouhá neaktivita postupně stojí místa.\n- **Jak vyhrál.** Ukončení a dominantní výkony se počítají, ale výhra je výhra.\n- **Úroveň soupeřů.** Výsledky vážíme podle síly soupeře i organizace.\n- **Velké zápasy.** Titulové zápasy a hlavní zápasy večera mají větší váhu.\n\n## Aktualizace\nŽebříčky aktualizujeme po každém velkém turnaji. Šipky ukazují, o kolik míst se zápasník posunul od poslední aktualizace.\n\n## Nezávislost\nUmístění v žebříčku nejde koupit. Promotéři, sponzoři ani sázkoví partneři pořadí neovlivňují.";
  const ABOUT_PREV_DE = "## Was wir ranken\nMMA Ladder rankt aktive professionelle MMA-Kämpfer in acht Gewichtsklassen der Männer: weltweit, nach Land und nach Organisation.\n\n## Unser Ansatz\nUnsere Rankings beantworten eine einfache Frage: Wer würde heute wen schlagen?\n\nRein statistische Rankings belohnen, wer auf dem Papier am besten aussieht. Im MMA führt das oft in die Irre: Kampfbilanzen werden aufgepolstert, das Niveau der Gegner unterscheidet sich zwischen Organisationen enorm, und ein einziger Kampf sagt oft mehr als zehn Siege auf regionalen Events. Deshalb sind Daten für uns die Grundlage, nicht das letzte Wort.\n\n- **Die Zahlen.** Jeder Kämpfer wird zuerst von einem Modell bewertet, das auf Ergebnissen basiert: wen er geschlagen hat, wie, wann und auf welchem Niveau.\n- **Der menschliche Faktor.** Danach prüfen wir die Reihenfolge Kämpfer für Kämpfer: Stile und Matchups, aktuelle Form, Aktivität, Verletzungen, Gewichtmachen und was wir tatsächlich im Käfig sehen. Wo die Zahlen an der Realität vorbeigehen, korrigieren wir sie.\n\nDas Ziel: Der Kämpfer auf Platz 3 sollte den Kämpfer auf Platz 4 schlagen, nicht nur die schönere Bilanz haben.\n\nDie genaue Formel und ihre Gewichtung veröffentlichen wir nicht, damit sich die Rankings nicht manipulieren lassen.\n\n## Worauf es ankommt\n- **Wen er geschlagen hat.** Ein Sieg gegen einen gerankten, bewährten Gegner zählt weit mehr als einer gegen einen Unbekannten.\n- **Wann.** Aktuelle Ergebnisse zählen mehr als alte. Lange Inaktivität kostet nach und nach Plätze.\n- **Wie.** Finishes und dominante Leistungen zählen, aber ein Sieg ist ein Sieg.\n- **Niveau der Konkurrenz.** Ergebnisse werden nach der Stärke des Gegners und der Organisation gewichtet.\n- **Große Kämpfe.** Titelkämpfe und Main Events zählen mehr.\n\n## Updates\nDie Rankings werden nach jedem großen Event aktualisiert. Pfeile zeigen, um wie viele Plätze sich ein Kämpfer seit dem letzten Update bewegt hat.\n\n## Unabhängigkeit\nPlatzierungen sind nicht käuflich. Veranstalter, Sponsoren und Wettpartner haben keinen Einfluss auf die Reihenfolge.";

  /* fighter social links: stored as typed (handle, @handle or full URL), turned into URLs here */
  const SOCIALS = [
    { k: "instagram", label: "Instagram", base: "https://instagram.com/", host: /instagram\.com/i },
    { k: "tiktok", label: "TikTok", base: "https://www.tiktok.com/@", host: /tiktok\.com/i },
    { k: "x", label: "X", base: "https://x.com/", host: /(twitter|x)\.com/i },
    { k: "youtube", label: "YouTube", base: "https://www.youtube.com/@", host: /youtube\.com|youtu\.be/i },
    { k: "facebook", label: "Facebook", base: "https://www.facebook.com/", host: /facebook\.com|fb\.com/i },
    { k: "web", label: "Web", base: "https://", host: /./ }
  ];
  function socialUrl(k, v) {
    v = String(v || "").trim();
    if (!v) return "";
    if (/^https?:\/\//i.test(v)) return v;
    const s = SOCIALS.find(x => x.k === k);
    if (!s) return "";
    if (k === "web") return "https://" + v.replace(/^\/+/, "");
    if (/\.[a-z]{2,}\//i.test(v) && s.host.test(v)) return "https://" + v.replace(/^\/+/, "");
    return s.base + v.replace(/^@+/, "").replace(/\/+$/, "");
  }

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

  const LOCALES = { en: "en-GB", cs: "cs-CZ", de: "de-DE" };
  function fmtDate(iso, lang) {
    if (!iso) return "";
    const d = new Date(iso + "T12:00:00");
    if (isNaN(d)) return iso;
    return d.toLocaleDateString(LOCALES[lang] || "en-GB", { day: "numeric", month: "short", year: "numeric" });
  }
  // country name in the page language (Czech / German via the browser's built-in translations)
  const SUBDIV = { cs: { "gb-eng": "Anglie", "gb-sct": "Skotsko", "gb-wls": "Wales", "gb-nir": "Severní Irsko" }, de: { "gb-eng": "England", "gb-sct": "Schottland", "gb-wls": "Wales", "gb-nir": "Nordirland" } };
  const dnCache = {};
  function countryNameL(code, lang) {
    if (!code) return "";
    if (!lang || lang === "en") return countryName(code);
    if (SUBDIV[lang] && SUBDIV[lang][code]) return SUBDIV[lang][code];
    try {
      dnCache[lang] = dnCache[lang] || new Intl.DisplayNames([lang], { type: "region" });
      const n = dnCache[lang].of(code.toUpperCase());
      if (n && n !== code.toUpperCase()) return n;
    } catch (e) {}
    return countryName(code);
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
    d.rankings.p4p = Array.isArray(d.rankings.p4p) ? d.rankings.p4p : [];
    d.fights = Array.isArray(d.fights) ? d.fights : [];
    d.history = Array.isArray(d.history) ? d.history : [];
    d.settings = Object.assign({ p4pPublic: false, siteUrl: "", domain: "", analyticsType: "", analyticsId: "", instagram: "mmaladder" }, d.settings || {});
    d.ads = Object.assign({ enabled: false, disclaimer: "18+ · Ministerstvo financí varuje: Účastí na hazardní hře může vzniknout závislost.", items: [] }, d.ads || {});
    d.ads.items = Array.isArray(d.ads.items) ? d.ads.items : [];
    d.newsletter = Object.assign({ enabled: false, action: "", field: "email", title: "Rankings in your inbox", text: "One short email after every major event: new rankings, biggest movers and upsets.", button: "Subscribe", consent: "By subscribing you agree to receive emails from MMA Ladder. Unsubscribe anytime." }, d.newsletter || {});
    d.about = Object.assign({ enabled: true, body: ABOUT_DEFAULT, body_cs: ABOUT_DEFAULT_CS, body_de: ABOUT_DEFAULT_DE }, d.about || {});
    if (d.about.body === ABOUT_OLD || d.about.body === ABOUT_PREV) d.about.body = ABOUT_DEFAULT;
    if (d.about.body_cs === ABOUT_PREV_CS) d.about.body_cs = ABOUT_DEFAULT_CS;
    if (d.about.body_de === ABOUT_PREV_DE) d.about.body_de = ABOUT_DEFAULT_DE;
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

  return { SOCIALS, socialUrl, COUNTRIES, esc, countryName, countryNameL, flag, slug, fmtDate, normalize, readDraft, writeDraft, clearDraft };
})();
