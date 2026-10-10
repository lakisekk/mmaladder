# MMA Ladder

MMA rankings site: world, country, organization and pound-for-pound rankings, fighter profiles with ranking history and fight results. Runs on GitHub Pages.

## Soubory

| Soubor | Co to je |
|---|---|
| `index.html` | Vzhled webu (anglicky) |
| `render.js` | Skládání stránek – žebříčky, profily, grafy |
| `app.js` | Chování webu v prohlížeči – vyhledávání, přepínání, analytika |
| `admin.html` | Editor (česky) |
| `data.js` | **Všechna data** – zápasníci, žebříčky, zápasy, historie, nastavení |
| `common.js` | Seznam zemí a pomocné funkce |
| `build.js` | Vyrobí z dat samostatnou stránku pro každý žebříček a zápasníka (kvůli Googlu) |
| `.github/workflows/deploy.yml` | Říká GitHubu, ať po každé změně spustí `build.js` a web nasadí |
| `og.png` | Náhledový obrázek při sdílení odkazu |

## Běžná práce

1. Otevři `https://lakisekk.github.io/mmaladder/admin.html`.
2. Po turnaji klikni **Nová aktualizace**. Uloží se současný stav do historie a od něj se počítají šipky ▲▼.
3. V záložce **Zápasy** zapiš výsledky, v **Žebříčcích** přeskládej pořadí.
4. **Náhled webu** ukáže výsledek. **Grafiky** ti vyrobí obrázky na Instagram.
5. **Stáhnout data.js** a na GitHubu nahraď starý `data.js` (Add file → Upload files → Commit changes).
6. Za 1–2 minuty je web aktualizovaný.

## Jednorázové nastavení SEO buildu

Bez tohoto kroku web funguje dál, jen s adresami typu `/#/fighter/...`, které Google skoro neindexuje.

1. V repozitáři dej **Add file → Create new file**.
2. Jako název napiš přesně `.github/workflows/deploy.yml` (lomítka vytvoří složky).
3. Vlož obsah souboru `deploy.yml` z balíčku a dej **Commit changes**.
4. Nahraj soubory `build.js`, `render.js`, `app.js`, `index.html`, `admin.html`, `common.js`, `data.js`.
5. **Settings → Pages → Build and deployment → Source** přepni na **GitHub Actions**.
6. V záložce **Actions** uvidíš běh „Build & deploy“. Až bude zelený, web má čisté adresy jako `/fighter/jiri-prochazka/` a soubor `sitemap.xml`.
7. Volitelně: [Google Search Console](https://search.google.com/search-console) → přidej web → odešli `sitemap.xml`.

Když build selže, web zůstane ve stavu z posledního úspěšného běhu – nic se nerozbije.

## Až bude doména mmaladder.com

1. U registrátora nastav DNS podle návodu GitHubu: „Managing a custom domain for your GitHub Pages site“ (4× A záznam na GitHub IP, `www` jako CNAME na `lakisekk.github.io`).
2. GitHub → **Settings → Pages → Custom domain**: `mmaladder.com`, zaškrtni **Enforce HTTPS**.
3. V editoru → **Nastavení → Adresa webu**: `https://mmaladder.com`, stáhni a nahraj `data.js`.
4. V Search Console přidej novou doménu a znovu odešli sitemapu.

## Měření návštěvnosti

V editoru → **Nastavení → Měření návštěvnosti** vyber službu a vlož ID:
- **Cloudflare Web Analytics** – zdarma, bez cookies, bez cookie lišty. ID = token z dashboardu Cloudflare.
- **GoatCounter** – jednoduché, bez cookies. ID = název účtu (z `nazev.goatcounter.com`).
- **Google Analytics 4** – nejvíc funkcí, ale v EU potřebuje cookie lištu se souhlasem. ID = `G-XXXXXXX`.

## Odkazy

- `/` – úvod s „Biggest movers“
- `/world/lightweight/`, `/country/czechia/middleweight/`, `/org/oktagon/featherweight/`
- `/p4p/` – jen když je P4P v editoru zveřejněný
- `/fighter/jiri-prochazka/` – profil se všemi pozicemi, grafem a zápasy

Staré odkazy `#/...` se samy přesměrují.

## Reklamy (partnerské bannery)

Editor → **Nastavení → Reklamy**:
1. Zaškrtni **Zobrazovat na webu**.
2. **+ Přidat banner**, vlož affiliate odkaz a obrázek (ideálně 300×250).
   - Obrázek buď jako URL od sázkovky, nebo nahraj soubor do složky `ads/` v repozitáři a napiš `ads/nazev.png`.
3. Stáhni a nahraj `data.js`.

Na monitoru od šířky 1600 px se ukážou max. 2 bannery vpravo, jinde 1 banner pod obsahem. Pod bannerem je vždy povinné upozornění (18+ a varování MF), jeho text jde upravit.
Odkazy jsou označené `rel="sponsored"`, takže je Google nebere jako placené SEO odkazy.
