# MMA Ladder

Static MMA rankings site: world, country and organization rankings across 8 weight classes. Runs on GitHub Pages, no build step.

## Files

| File | What it is |
|---|---|
| `index.html` | The public website (English) |
| `admin.html` | Rankings editor (Czech UI) |
| `data.js` | All data: fighters, rankings, countries, organizations |
| `common.js` | Shared helpers (flags, country names) |
| `assets/` | Share image for social networks (logo itself is embedded in the HTML) |

## Jak upravovat žebříčky

1. Otevři `admin.html` (lokálně dvojklikem, nebo na `tvuj-web/admin.html`).
2. Po turnaji klikni **Nová aktualizace**. Uloží se současné pozice, aby web ukazoval šipky ▲▼.
3. Přeskládej žebříčky, přidej nové zápasníky, uprav bilance.
4. **Náhled webu** ukáže výsledek ještě před nahráním.
5. **Stáhnout data.js** a stažený soubor nahraj do repozitáře místo starého `data.js` (na GitHubu: Add file → Upload files → Commit).

Rozpracované změny se průběžně ukládají v prohlížeči, takže o ně nepřijdeš, když editor zavřeš. Na web se ale dostanou až po nahrání `data.js`.

`admin.html` na webu nic nerozbije. Kdokoli ho otevře, mění jen kopii ve svém prohlížeči. Kdo ho nechce mít veřejně, nechá ho jen u sebe v počítači a do repozitáře ho nenahraje.

## Nasazení na GitHub Pages

1. Nový repozitář (např. `mmaladder`), nahraj do něj celý obsah této složky.
2. Settings → Pages → Source: *Deploy from a branch*, branch `main`, složka `/ (root)` → Save.
3. Vlastní doména `mmaladder.com`: Settings → Pages → Custom domain, a u registrátora nastav DNS podle návodu GitHubu.

## Odkazy na konkrétní žebříček

- `/#/world/lw` – světový lightweight
- `/#/country/cz/mw` – Česko, middleweight
- `/#/org/oktagon/fw` – OKTAGON, featherweight
- `/#/fighter/jiri-prochazka` – profil zápasníka se všemi jeho pozicemi

Vlajky se načítají z flagcdn.com, písma z Google Fonts.
