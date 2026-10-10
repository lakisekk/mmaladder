/* MMA Ladder – video generator for the editor (admin.html).
   Draws an animated vertical video (1080×1920) on a canvas and exports it as MP4
   (WebCodecs + mp4-muxer, faster than real time). Fallback: real-time MediaRecorder.
   Types: "rank" = countdown #N → #1 (→ champion), "movers" = biggest movers since last update. */
window.MLV = (function () {
  const W = 1080, H = 1920, FPS = 30;
  const BC = '"Barlow Condensed", "Arial Narrow", Arial', IN = 'Inter, Arial';
  const GOLD = "#d9b45a", UP = "#2ecc71", DOWN = "#ff4d4d";

  /* ---------- easing & helpers ---------- */
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const easeOut = t => 1 - Math.pow(1 - clamp(t), 3);
  const easeInOut = t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  const prog = (t, start, dur) => clamp((t - start) / dur);
  function rrect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function fit(c, text, weight, fam, size, maxW, style) {
    let s = size;
    do { c.font = `${style || ""} ${weight} ${s}px ${fam}`; if (c.measureText(text).width <= maxW) break; s -= 2; } while (s > 10);
    return s;
  }
  function spaced(c, text, x, y, sp, align) {
    const w = [...text].reduce((a, ch) => a + c.measureText(ch).width + sp, -sp);
    let cx = align === "right" ? x - w : align === "center" ? x - w / 2 : x;
    const prev = c.textAlign; c.textAlign = "left";
    for (const ch of text) { c.fillText(ch, cx, y); cx += c.measureText(ch).width + sp; }
    c.textAlign = prev; return w;
  }
  const imgCache = new Map();
  function loadImg(src, cors) {
    if (!src) return Promise.resolve(null);
    if (imgCache.has(src)) return imgCache.get(src);
    const p = new Promise(res => { const i = new Image(); if (cors) i.crossOrigin = "anonymous"; i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
    imgCache.set(src, p); return p;
  }
  function flag(c, img, code, x, y, w, h) {
    c.save(); rrect(c, x, y, w, h, Math.max(3, h * .12)); c.clip();
    if (img) {
      const ir = img.width / img.height, r = w / h;
      let sw = img.width, sh = img.height, sx = 0, sy = 0;
      if (ir > r) { sw = img.height * r; sx = (img.width - sw) / 2; } else { sh = img.width / r; sy = (img.height - sh) / 2; }
      c.drawImage(img, sx, sy, sw, sh, x, y, w, h);
    } else {
      c.fillStyle = "#222"; c.fillRect(x, y, w, h);
      c.fillStyle = "#999"; c.font = `700 ${Math.round(h * .42)}px ${IN}`; c.textAlign = "center"; c.textBaseline = "middle";
      c.fillText((code || "").toUpperCase(), x + w / 2, y + h / 2); c.textAlign = "left"; c.textBaseline = "alphabetic";
    }
    c.restore();
    c.strokeStyle = "rgba(255,255,255,.2)"; c.lineWidth = 2; rrect(c, x, y, w, h, Math.max(3, h * .12)); c.stroke();
  }

  /* ---------- scene building ---------- */
  // Builds a plain description of the video from the data; drawing only reads this.
  async function build(D, opt) {
    const host = (() => { try { return new URL(D.settings.siteUrl).hostname.replace(/^www\./, ""); } catch (e) { return "mmaladder.com"; } })();
    const sc = { type: opt.type, host, date: MML.fmtDate(D.updated).toUpperCase(), photo: !!opt.photo, items: [], champ: null };
    if (opt.type === "rank") {
      const list = MLR.rows(D, opt.scope, MLR.getList(D, opt.scope, opt.sub, opt.div));
      sc.champ = list.find(r => r.champ) || null;
      sc.items = list.filter(r => !r.champ).slice(0, opt.count);
      sc.label = (opt.scope === "p4p" ? "All divisions" : MLR.scopeLabel(D, opt.scope, opt.sub)) + " · Rankings";
      sc.heading = opt.scope === "p4p" ? "Pound-for-Pound" : (D.divisions.find(d => d.id === opt.div) || {}).name || "";
      sc.labelFlag = opt.scope === "country" ? opt.sub : null;
      sc.labelColor = opt.scope === "org" ? ((MLR.orgById(D, opt.sub) || {}).color || null) : null;
      const per = sc.items.length > 7 ? 1.25 : sc.items.length > 4 ? 1.6 : 2.1;
      sc.tIntro = 2.4;
      sc.tList = sc.tIntro;                                    // list countdown starts
      sc.per = per;
      const listCount = Math.max(0, sc.items.length - 1);      // #1 is revealed as hero, not in the list
      sc.tHero1 = sc.tList + listCount * per + .5;
      sc.tChamp = sc.champ ? sc.tHero1 + 3.4 : null;
      sc.tOutro = (sc.champ ? sc.tChamp : sc.tHero1) + 3.6;
    } else {
      const m = MLR.movers(D, false);
      const where = x => x.scope === "p4p" ? "Pound-for-Pound" : MLR.scopeLabel(D, x.scope, x.sub) + " · " + ((D.divisions.find(d => d.id === x.div) || {}).name || "");
      sc.up = m.up.map(x => Object.assign({ where: where(x) }, x)); sc.down = m.down.map(x => Object.assign({ where: where(x) }, x));
      sc.label = "Since the previous update"; sc.heading = "Biggest movers";
      sc.tIntro = 2.4;
      const n = m.up.length + m.down.length;
      sc.per = n > 6 ? 1.1 : 1.4;
      sc.tOutro = sc.tIntro + (m.up.length ? .6 : 0) + (m.down.length ? .6 : 0) + n * sc.per + 2.2;
    }
    sc.duration = sc.tOutro + 2.8;
    // preload images so every frame draws synchronously
    sc.mark = await loadImg(opt.markSrc, false);
    const codes = new Set();
    (sc.items || []).forEach(r => codes.add(r.fighter.country));
    if (sc.champ) codes.add(sc.champ.fighter.country);
    (sc.up || []).concat(sc.down || []).forEach(x => codes.add(x.r.fighter.country));
    if (sc.labelFlag) codes.add(sc.labelFlag);
    sc.flags = {};
    await Promise.all([...codes].filter(Boolean).map(async code => { sc.flags[code] = await loadImg(`https://flagcdn.com/w320/${code}.png`, true); }));
    sc.orgs = {};
    D.orgs.forEach(o => sc.orgs[o.id] = o);
    try { await Promise.all(['800 100px "Barlow Condensed"', 'italic 800 60px "Barlow Condensed"', '600 30px "Barlow Condensed"', '700 30px Inter', '600 30px Inter'].map(f => document.fonts.load(f))); } catch (e) {}
    return sc;
  }

  /* ---------- drawing ---------- */
  const P = 80;
  function background(c, t) {
    c.fillStyle = "#000"; c.fillRect(0, 0, W, H);
    const gx = W * (.8 + .08 * Math.sin(t * .4));
    const g = c.createRadialGradient(gx, 0, 0, gx, 0, W * 1.1);
    g.addColorStop(0, "rgba(255,255,255,.08)"); g.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = g; c.fillRect(0, 0, W, H);
  }
  function header(c, sc, a) {
    c.globalAlpha = a;
    if (sc.mark) c.drawImage(sc.mark, P, 92, 72, 72);
    c.fillStyle = "#fff"; c.font = `italic 800 48px ${BC}`; c.textBaseline = "alphabetic";
    c.fillText("MMA", P + 92, 146);
    const w = c.measureText("MMA").width;
    c.font = `600 26px ${BC}`; c.fillStyle = "#9a9a9a"; spaced(c, "LADDER", P + 100 + w, 144, 7);
    c.font = `600 24px ${IN}`; c.fillStyle = "#8a8a8a"; c.textAlign = "right"; c.fillText(sc.date, W - P, 140); c.textAlign = "left";
    c.globalAlpha = 1;
  }
  function footer(c, sc, a) {
    c.globalAlpha = a;
    c.fillStyle = "#262626"; c.fillRect(P, H - 170, W - 2 * P, 2);
    c.fillStyle = "#fff"; c.font = `700 26px ${IN}`; spaced(c, sc.host.toUpperCase(), P, H - 118, 5);
    c.fillStyle = "#6a6a6a"; c.font = `600 22px ${IN}`; spaced(c, "THE HOME OF MMA RANKINGS", W - P, H - 118, 4, "right");
    c.globalAlpha = 1;
  }
  function titleBlock(c, sc, y, a, big) {
    c.globalAlpha = a;
    let lx = P;
    if (sc.labelFlag) { flag(c, sc.flags[sc.labelFlag], sc.labelFlag, P, y - 30, 48, 33); lx += 64; }
    if (sc.labelColor) { c.fillStyle = sc.labelColor; c.beginPath(); c.arc(P + 10, y - 12, 10, 0, Math.PI * 2); c.fill(); lx += 34; }
    c.fillStyle = "#a8a8a8"; c.font = `700 28px ${IN}`; spaced(c, sc.label.toUpperCase(), lx, y, 4);
    const hs = fit(c, sc.heading.toUpperCase(), 800, BC, big ? 190 : 120, W - 2 * P);
    c.fillStyle = "#fff"; c.font = `800 ${hs}px ${BC}`; c.textBaseline = "top"; c.fillText(sc.heading.toUpperCase(), P - 4, y + 22); c.textBaseline = "alphabetic";
    c.globalAlpha = 1;
    return y + 22 + hs * .92;
  }
  function moveText(r) {
    if (r.move.t === "up") return { s: "▲ " + r.move.n, col: UP };
    if (r.move.t === "down") return { s: "▼ " + r.move.n, col: DOWN };
    if (r.move.t === "new") return { s: "NEW", col: "#fff", pill: true };
    return { s: "–", col: "#555" };
  }
  function listRow(c, sc, r, y, h, a, slide) {
    const f = r.fighter, mid = y + h / 2;
    c.save(); c.globalAlpha = a; c.translate(slide, 0);
    c.fillStyle = "rgba(255,255,255,.035)"; rrect(c, P, y + 6, W - 2 * P, h - 12, 14); c.fill();
    c.fillStyle = "#fff"; c.font = `800 ${Math.round(h * .5)}px ${BC}`; c.textAlign = "center"; c.textBaseline = "middle";
    c.fillText(String(r.pos), P + 62, mid + 3);
    const m = moveText(r);
    if (m.pill) { c.fillStyle = "#fff"; rrect(c, P + 122, mid - 15, 64, 30, 6); c.fill(); c.fillStyle = "#000"; c.font = `800 17px ${IN}`; c.fillText("NEW", P + 154, mid + 1); }
    else { c.fillStyle = m.col; c.font = `700 ${Math.round(h * .19)}px ${IN}`; c.fillText(m.s, P + 154, mid); }
    c.textAlign = "left";
    const fw = Math.round(h * .5), fh = Math.round(fw * .7);
    flag(c, sc.flags[f.country], f.country, P + 214, mid - fh / 2, fw, fh);
    const nx = P + 214 + fw + 26;
    const recW = f.record ? 170 : 0;
    const ns = fit(c, f.name, 700, IN, Math.round(h * .28), W - P - recW - nx - 20);
    c.fillStyle = "#fff"; c.font = `700 ${ns}px ${IN}`; c.textBaseline = "alphabetic"; c.fillText(f.name, nx, mid + 2);
    const o = sc.orgs[f.org];
    if (o) { c.fillStyle = o.color || "#888"; c.fillRect(nx, mid + h * .13, h * .085, h * .085); c.fillStyle = "#bdbdbd"; c.font = `700 ${Math.round(h * .14)}px ${IN}`; spaced(c, o.name.toUpperCase(), nx + h * .14, mid + h * .21, 2); }
    if (f.record) { c.fillStyle = "#d8d8d8"; c.font = `600 ${Math.round(h * .28)}px ${BC}`; c.textAlign = "right"; c.textBaseline = "middle"; c.fillText(f.record, W - P - 24, mid); c.textAlign = "left"; }
    c.textBaseline = "alphabetic";
    c.restore();
  }
  // Big reveal card for #1 / champion. With photo=true the upper part stays empty for a photo added in post-production.
  function hero(c, sc, r, t0, t, kind, preview) {
    const p = easeOut(prog(t, t0, .7));
    const f = r.fighter, gold = kind === "champ";
    const top = sc.photo ? 1050 : 700;
    if (sc.photo) {
      // empty photo zone: keep it clean so a cut-out photo can be dropped in later
      if (preview) {
        c.save(); c.globalAlpha = .55 * p; c.strokeStyle = "#555"; c.setLineDash([16, 14]); c.lineWidth = 3;
        rrect(c, P, 250, W - 2 * P, 760, 24); c.stroke(); c.setLineDash([]);
        c.fillStyle = "#666"; c.font = `700 30px ${IN}`; c.textAlign = "center"; spaced(c, "FOTO (POSTPRODUKCE)", W / 2, 640, 4, "center"); c.textAlign = "left";
        c.restore();
      }
      const g = c.createLinearGradient(0, top - 260, 0, top + 40);
      g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,1)");
      c.fillStyle = g; c.fillRect(0, top - 260, W, 300);
    }
    c.save();
    c.globalAlpha = p; c.translate(0, (1 - p) * 60);
    let y = top;
    if (gold) {
      c.font = `800 60px ${BC}`;
      const bw = [..."CHAMPION"].reduce((acc, ch) => acc + c.measureText(ch).width + 6, -6) + 64;
      c.fillStyle = GOLD; rrect(c, P, y, bw, 96, 14); c.fill();
      c.fillStyle = "#000"; c.textBaseline = "middle"; spaced(c, "CHAMPION", P + bw / 2, y + 51, 6, "center");
      y += 140;
    } else {
      const S = sc.photo ? 170 : 280;
      c.fillStyle = "#fff"; c.font = `800 ${S}px ${BC}`; c.textBaseline = "top"; c.fillText("#1", P - 8, y - S * .08);
      y += S * .9;
    }
    c.textBaseline = "alphabetic";
    flag(c, sc.flags[f.country], f.country, P, y, 120, 84);
    y += 84 + 34;
    const nameUp = f.name.toUpperCase();
    const ns = fit(c, nameUp, 800, BC, 170, W - 2 * P);
    c.fillStyle = gold ? GOLD : "#fff"; c.font = `800 ${ns}px ${BC}`; c.textBaseline = "top"; c.fillText(nameUp, P - 4, y); c.textBaseline = "alphabetic";
    y += ns * .92 + 44;
    const o = sc.orgs[f.org];
    if (o) { c.fillStyle = o.color || "#888"; c.fillRect(P, y - 26, 26, 26); c.fillStyle = "#cfcfcf"; c.font = `700 34px ${IN}`; spaced(c, o.name.toUpperCase(), P + 44, y, 4); }
    if (f.record) { c.fillStyle = "#e0e0e0"; c.font = `600 64px ${BC}`; c.textAlign = "right"; c.fillText(f.record, W - P, y + 6); c.textAlign = "left"; }
    y += 62;
    if (f.nick) { c.fillStyle = "#8a8a8a"; c.font = `italic 500 36px ${IN}`; c.fillText("\u201c" + f.nick + "\u201d", P, y); }
    if (!gold) {
      const m = moveText(r);
      if (m.s !== "–") { c.fillStyle = m.col; c.font = `700 36px ${IN}`; c.textAlign = "right"; c.fillText(m.pill ? "NEW" : m.s, W - P, y); c.textAlign = "left"; }
    }
    c.restore();
  }
  function outro(c, sc, t) {
    const p = easeOut(prog(t, sc.tOutro, .8));
    c.save(); c.globalAlpha = p;
    if (sc.mark) { const s = 260; c.drawImage(sc.mark, W / 2 - s / 2, 620 - (1 - p) * 40, s, s); }
    c.fillStyle = "#fff"; c.textAlign = "center";
    c.font = `italic 800 120px ${BC}`; c.fillText("MMA LADDER", W / 2, 1040);
    c.fillStyle = "#9a9a9a"; c.font = `700 34px ${IN}`; spaced(c, "THE HOME OF MMA RANKINGS", W / 2, 1110, 6, "center");
    c.fillStyle = "#fff"; c.font = `700 44px ${IN}`; c.fillText("Full rankings at " + sc.host, W / 2, 1260);
    c.textAlign = "left"; c.restore();
  }

  function drawRank(c, sc, t, preview) {
    const introA = easeOut(prog(t, 0, .8));
    const listEnd = sc.tHero1;
    const fadeOutList = 1 - easeInOut(prog(t, listEnd - .4, .5));
    const outA = 1 - easeInOut(prog(t, sc.tOutro - .5, .5));
    header(c, sc, introA * outA);
    if (t < sc.tOutro) {
      // title: big during intro, then shrinks to the top
      const shrink = easeInOut(prog(t, sc.tIntro - .7, .7));
      const y0 = 760 - (760 - 300) * shrink;
      const titleA = introA * (t < listEnd ? 1 : 1 - easeInOut(prog(t, listEnd, .4)));
      c.save(); c.globalAlpha = 1;
      c.translate(0, (1 - easeOut(prog(t, .2, .8))) * 40);
      const big = shrink < .5;
      titleBlock(c, sc, y0, titleA, big);
      c.restore();
      // list (#N … #2), revealed bottom-up
      const listItems = sc.items.slice(1);
      if (listItems.length && t < listEnd + .2) {
        const areaTop = 520, areaBot = H - 230;
        const n = listItems.length;
        const h = Math.min(170, (areaBot - areaTop) / Math.max(n, 1));
        listItems.forEach((r, i) => {
          const order = n - 1 - i;                     // last item appears first
          const t0 = sc.tList + order * sc.per;
          const p = easeOut(prog(t, t0, .45));
          if (p <= 0) return;
          const y = areaTop + i * h + (areaBot - areaTop - n * h) / 2;
          listRow(c, sc, r, y, h, p * fadeOutList, (1 - p) * 120);
        });
      }
      // empty list (only #1 ranked)
      if (sc.items.length && t >= sc.tHero1 && (!sc.champ || t < sc.tChamp)) {
        const a = sc.champ ? 1 - easeInOut(prog(t, sc.tChamp - .4, .4)) : 1;
        c.save(); c.globalAlpha = a; hero(c, sc, sc.items[0], sc.tHero1, t, "one", preview); c.restore();
      }
      if (sc.champ && t >= sc.tChamp) hero(c, sc, sc.champ, sc.tChamp, t, "champ", preview);
      if (!sc.items.length && !sc.champ) { c.fillStyle = "#777"; c.font = `600 40px ${IN}`; c.fillText("No fighters ranked yet.", P, 900); }
    }
    if (t >= sc.tOutro) outro(c, sc, t);
    footer(c, sc, introA);
  }

  function drawMovers(c, sc, t) {
    const introA = easeOut(prog(t, 0, .8));
    header(c, sc, introA);
    if (t < sc.tOutro) {
      const outA = 1 - easeInOut(prog(t, sc.tOutro - .5, .5));
      const shrink = easeInOut(prog(t, sc.tIntro - .7, .7));
      c.save(); c.globalAlpha = outA;
      titleBlock(c, sc, 760 - 460 * shrink, introA, shrink < .5);
      c.restore();
      let y = 520, tt = sc.tIntro;
      const groups = [["RISING", sc.up, UP], ["FALLING", sc.down, DOWN]].filter(g => g[1].length);
      const total = (sc.up.length + sc.down.length);
      const h = Math.min(150, (H - 260 - y - groups.length * 70) / Math.max(total, 1));
      if (!groups.length && t > sc.tIntro) { c.globalAlpha = outA; c.fillStyle = "#777"; c.font = `600 40px ${IN}`; c.fillText("No movement since the last update.", P, 900); c.globalAlpha = 1; }
      for (const [title, items, col] of groups) {
        const ga = easeOut(prog(t, tt, .4)) * outA;
        c.globalAlpha = ga; c.fillStyle = "#6a6a6a"; c.font = `700 30px ${IN}`; spaced(c, title, P, y + 44, 6); c.globalAlpha = 1;
        y += 70; tt += .6;
        for (const x of items) {
          const p = easeOut(prog(t, tt, .45));
          if (p > 0) {
            const f = x.r.fighter, mid = y + h / 2;
            c.save(); c.globalAlpha = p * outA; c.translate((1 - p) * 120, 0);
            c.fillStyle = "#0e0e0e"; rrect(c, P, y + 6, W - 2 * P, h - 12, 16); c.fill();
            c.fillStyle = col; c.font = `800 ${Math.round(h * .42)}px ${BC}`; c.textBaseline = "middle"; c.fillText((x.delta > 0 ? "▲ " : "▼ ") + Math.abs(x.delta), P + 30, mid + 3);
            const fw = Math.round(h * .46), fh = Math.round(fw * .7);
            flag(c, sc.flags[f.country], f.country, P + 190, mid - fh / 2, fw, fh);
            const nx = P + 190 + fw + 24;
            c.textBaseline = "alphabetic";
            const ns = fit(c, f.name, 700, IN, Math.round(h * .26), W - P - nx - 30);
            c.fillStyle = "#fff"; c.font = `700 ${ns}px ${IN}`; c.fillText(f.name, nx, mid);
            const where = x.where + " · now #" + x.r.pos;
            c.fillStyle = "#9a9a9a"; c.font = `600 ${fit(c, where, 600, IN, Math.round(h * .16), W - P - nx - 30)}px ${IN}`; c.fillText(where, nx, mid + h * .25);
            c.restore();
          }
          y += h; tt += sc.per;
        }
      }
    }
    if (t >= sc.tOutro) outro(c, sc, t);
    footer(c, sc, introA);
  }

  function draw(c, sc, t, preview) {
    c.save(); background(c, t);
    if (sc.type === "rank") drawRank(c, sc, t, preview); else drawMovers(c, sc, t);
    c.restore();
  }

  /* ---------- export ---------- */
  // codecs: [encoder codec string, mp4-muxer codec] tried in order (H.264 first – what Instagram/TikTok expect)
  const CODECS = [["avc1.640028", "avc"], ["avc1.4d0028", "avc"], ["avc1.42002a", "avc"], ["avc1.420028", "avc"]];
  async function exportMp4(sc, onProgress, codecs) {
    const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    const c = cv.getContext("2d");
    const frames = Math.ceil(sc.duration * FPS);
    if (window.VideoEncoder && window.Mp4Muxer) {
      let codec = null, mcodec = null;
      for (const [cand, mc] of (codecs || CODECS)) {
        try { const s = await VideoEncoder.isConfigSupported({ codec: cand, width: W, height: H, bitrate: 8e6, framerate: FPS }); if (s.supported) { codec = cand; mcodec = mc; break; } } catch (e) {}
      }
      if (codec) {
        const muxer = new Mp4Muxer.Muxer({ target: new Mp4Muxer.ArrayBufferTarget(), video: { codec: mcodec, width: W, height: H, frameRate: FPS }, fastStart: "in-memory" });
        let err = null;
        const enc = new VideoEncoder({ output: (chunk, meta) => muxer.addVideoChunk(chunk, meta), error: e => { err = e; } });
        enc.configure(Object.assign({ codec, width: W, height: H, bitrate: 8e6, framerate: FPS }, mcodec === "avc" ? { avc: { format: "avc" } } : {}));
        for (let i = 0; i < frames; i++) {
          if (err) throw err;
          draw(c, sc, i / FPS, false);
          const vf = new VideoFrame(cv, { timestamp: Math.round(i * 1e6 / FPS), duration: Math.round(1e6 / FPS) });
          enc.encode(vf, { keyFrame: i % (FPS * 2) === 0 });
          vf.close();
          if (enc.encodeQueueSize > 8) await new Promise(r => setTimeout(r, 0));
          if (i % 10 === 0) { onProgress && onProgress(i / frames); await new Promise(r => setTimeout(r, 0)); }
        }
        await enc.flush(); if (err) throw err;
        muxer.finalize();
        onProgress && onProgress(1);
        return { blob: new Blob([muxer.target.buffer], { type: "video/mp4" }), ext: "mp4" };
      }
    }
    // Fallback: record in real time (keep the tab visible)
    const mime = ["video/mp4;codecs=avc1", "video/mp4", "video/webm;codecs=vp9", "video/webm"].find(m => window.MediaRecorder && MediaRecorder.isTypeSupported(m));
    if (!mime) throw new Error("Tento prohlížeč neumí nahrávat video. Použij Chrome nebo Edge.");
    const stream = cv.captureStream(FPS);
    const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 8e6 });
    const parts = []; rec.ondataavailable = e => e.data.size && parts.push(e.data);
    const done = new Promise(r => rec.onstop = r);
    rec.start();
    const t0 = performance.now();
    await new Promise(res => {
      const tick = () => {
        const t = (performance.now() - t0) / 1000;
        draw(c, sc, Math.min(t, sc.duration), false);
        onProgress && onProgress(t / sc.duration);
        if (t >= sc.duration) return res();
        requestAnimationFrame(tick);
      };
      tick();
    });
    rec.stop(); await done;
    return { blob: new Blob(parts, { type: mime.split(";")[0] }), ext: mime.includes("mp4") ? "mp4" : "webm" };
  }

  return { W, H, FPS, build, draw, exportMp4 };
})();
