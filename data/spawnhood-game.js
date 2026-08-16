/* SPAWN — HOOD Genesis client */
(() => {
  'use strict';
  const WORLD = { w: 1600, h: 1000 };
  const POOLS = ['primordial-ooze','fairy-lake','dungeon-dam','ravens-nest','creature-swamp','babblin-brook'];
  const THEMES = {
    'primordial-ooze': { label:"Primordial Ooze", bg:['#0c1f13','#04120a'], ground:'#0e2417', liquid:'#2f8f45', liquid2:'#57c96e', fog:'rgba(60,150,80,.10)', particle:'bubble' },
    'fairy-lake':      { label:"Fairy Lake",      bg:['#152a52','#0a1330'], ground:'#173463', liquid:'#3a7bd5', liquid2:'#7fd0ff', fog:'rgba(150,200,255,.10)', particle:'spark' },
    'dungeon-dam':     { label:"Dungeon Dam",     bg:['#1a1e26','#0b0d12'], ground:'#23262e', liquid:'#2a3542', liquid2:'#516074', fog:'rgba(255,150,60,.07)', particle:'ember' },
    'ravens-nest':     { label:"Raven's Nest",    bg:['#1c1230','#0a0713'], ground:'#241633', liquid:'#3a2350', liquid2:'#7d5aa8', fog:'rgba(170,130,230,.10)', particle:'feather' },
    'creature-swamp':  { label:"Creature Swamp",  bg:['#171e11','#0a0f08'], ground:'#20281a', liquid:'#4a5a2a', liquid2:'#8aa04a', fog:'rgba(150,170,90,.10)', particle:'mist' },
    'babblin-brook':   { label:"Babblin' Brook",  bg:['#0f2a3d','#081826'], ground:'#123246', liquid:'#2f9fc7', liquid2:'#7fe6df', fog:'rgba(130,220,230,.10)', particle:'drop' },
  };
  const RCOL = {
    gold:    { main:'#ffd54a', glow:'#fff0b0', dark:'#a97b0e', label:'#ffd54a' },
    diamond: { main:'#8fe9ff', glow:'#e2fbff', dark:'#2b8fb5', label:'#8fe9ff' },
    ruby:    { main:'#ff5a7a', glow:'#ffc2ce', dark:'#a01530', label:'#ff5a7a' },
    green:   { main:'#6ee06e', glow:'#c8ffc8', dark:'#2e7d32', label:'#6ee06e' },
  };
  const RARITY_LABEL = { gold:'GOLD · SUPER RARE', diamond:'DIAMOND · RARE', ruby:'RUBY · UNCOMMON', green:'GREEN · COMMON' };
  // Each creature type has 5 sub-types (variant 0-4), matching the 5 name prefixes.
  // Secondary accent colour per variant, layered on top of the rarity body colour.
  const VAR_ACCENT = ['#ff9a3a', '#7fd0ff', '#c88cff', '#7CFC7C', '#ffd54a'];
  // Care-Bear-style belly badges — one per NFT. Floats above the head on the field, sits on the belly in the hero pose.
  const BADGES = ['cupcake', 'crown', 'wings', 'ember', 'snowflake', 'horns', 'halo'];
  const badgeOf = (nftId) => (nftId * 3 + 2) % 7; // deterministic per NFT, spread across all 7
  function drawBadge(g, b, x, y, s, frame) {
    g.save(); g.translate(x, y);
    if (b === 0) { // cupcake
      g.fillStyle = '#e8b06a'; g.beginPath(); g.moveTo(-s*0.7, 0); g.lineTo(s*0.7, 0); g.lineTo(s*0.5, s*0.85); g.lineTo(-s*0.5, s*0.85); g.closePath(); g.fill();
      // frosting: solid base first (fills any gap), then swirl bumps — each filled separately so there are no holes
      g.fillStyle = '#ff9ecf';
      g.beginPath(); g.ellipse(0, -s*0.12, s*0.68, s*0.5, 0, 0, 7); g.fill();
      g.beginPath(); g.arc(-s*0.36, -s*0.22, s*0.34, 0, 7); g.fill();
      g.beginPath(); g.arc(s*0.36, -s*0.22, s*0.34, 0, 7); g.fill();
      g.beginPath(); g.arc(0, -s*0.52, s*0.36, 0, 7); g.fill();
      g.fillStyle = '#ff3b6b'; g.beginPath(); g.arc(0, -s*0.82, s*0.22, 0, 7); g.fill();
    } else if (b === 1) { // crown
      g.fillStyle = '#ffd54a'; g.strokeStyle = '#a97b0e'; g.lineWidth = 1;
      g.beginPath(); g.moveTo(-s*0.85, s*0.5); g.lineTo(-s*0.85, -s*0.3); g.lineTo(-s*0.32, s*0.12); g.lineTo(0, -s*0.6); g.lineTo(s*0.32, s*0.12); g.lineTo(s*0.85, -s*0.3); g.lineTo(s*0.85, s*0.5); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = '#ff5a7a'; g.beginPath(); g.arc(0, -s*0.1, s*0.16, 0, 7); g.fill();
    } else if (b === 2) { // wings
      g.fillStyle = '#eaf4ff'; const fl = Math.sin(frame*0.25) * s*0.15;
      g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(-s*1.2, -s*0.6 - fl, -s*1.35, s*0.35); g.quadraticCurveTo(-s*0.6, 0, 0, s*0.3); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(s*1.2, -s*0.6 - fl, s*1.35, s*0.35); g.quadraticCurveTo(s*0.6, 0, 0, s*0.3); g.closePath(); g.fill();
    } else if (b === 3) { // ember
      const f = Math.abs(Math.sin(frame*0.4)) * s*0.3;
      g.fillStyle = '#ff7a18'; g.beginPath(); g.moveTo(-s*0.5, s*0.6); g.quadraticCurveTo(-s*0.65, -s*0.3, 0, -s*0.95 - f); g.quadraticCurveTo(s*0.65, -s*0.3, s*0.5, s*0.6); g.quadraticCurveTo(0, s*0.35, -s*0.5, s*0.6); g.closePath(); g.fill();
      g.fillStyle = '#ffd54a'; g.beginPath(); g.moveTo(-s*0.24, s*0.4); g.quadraticCurveTo(0, -s*0.4, s*0.24, s*0.4); g.quadraticCurveTo(0, s*0.2, -s*0.24, s*0.4); g.closePath(); g.fill();
    } else if (b === 4) { // snowflake
      g.strokeStyle = '#bfeaff'; g.lineWidth = Math.max(1, s*0.16); g.lineCap = 'round';
      for (let i = 0; i < 3; i++) { g.save(); g.rotate(i * Math.PI / 3); g.beginPath(); g.moveTo(0, -s); g.lineTo(0, s); g.stroke();
        g.beginPath(); g.moveTo(0, -s); g.lineTo(-s*0.35, -s*0.62); g.moveTo(0, -s); g.lineTo(s*0.35, -s*0.62); g.moveTo(0, s); g.lineTo(-s*0.35, s*0.62); g.moveTo(0, s); g.lineTo(s*0.35, s*0.62); g.stroke(); g.restore(); }
    } else if (b === 5) { // horns
      g.fillStyle = '#c8452f';
      g.beginPath(); g.moveTo(-s*0.15, s*0.4); g.quadraticCurveTo(-s*1.0, s*0.2, -s*0.9, -s*0.7); g.quadraticCurveTo(-s*0.4, -s*0.1, -s*0.05, s*0.3); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(s*0.15, s*0.4); g.quadraticCurveTo(s*1.0, s*0.2, s*0.9, -s*0.7); g.quadraticCurveTo(s*0.4, -s*0.1, s*0.05, s*0.3); g.closePath(); g.fill();
    } else { // halo
      g.strokeStyle = '#ffe98a'; g.lineWidth = Math.max(1.5, s*0.22); g.shadowColor = '#ffe98a'; g.shadowBlur = s*0.9;
      g.beginPath(); g.ellipse(0, 0, s*0.95, s*0.42, 0, 0, 7); g.stroke(); g.shadowBlur = 0;
    }
    g.restore();
  }

  // ---------- DOM ----------
  const $ = id => document.getElementById(id);
  const canvas = $('game'), ctx = canvas.getContext('2d');
  let VW = 0, VH = 0, DPR = 1;
  function resize() {
    const vv = window.visualViewport;
    VW = Math.round(vv ? vv.width : window.innerWidth);
    VH = Math.round(vv ? vv.height : window.innerHeight);
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = VW * DPR; canvas.height = VH * DPR;
    canvas.style.width = VW + 'px'; canvas.style.height = VH + 'px'; // match buffer aspect exactly (no mobile stretch)
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', resize);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', resize);
  resize();
  if ('ontouchstart' in window) document.body.classList.add('touch');

  // ---------- pixel-art buffer (renders sprites chunky, xcpinata Orange Collection style) ----------
  const PXSIZE = 3, PBUF = 46;
  const _buf = document.createElement('canvas'); _buf.width = PBUF; _buf.height = PBUF;
  const _bx = _buf.getContext('2d');
  function pixelSprite(g, drawFn, scale) {
    _bx.setTransform(1, 0, 0, 1, 0, 0); _bx.clearRect(0, 0, PBUF, PBUF);
    _bx.save(); _bx.translate(PBUF / 2, PBUF / 2); _bx.scale(1 / PXSIZE, 1 / PXSIZE); drawFn(_bx); _bx.restore();
    g.save(); g.imageSmoothingEnabled = false; g.scale(scale, scale);
    g.drawImage(_buf, -(PBUF / 2) * PXSIZE, -(PBUF / 2) * PXSIZE, PBUF * PXSIZE, PBUF * PXSIZE);
    g.restore();
  }

  // ---------- State ----------
  const state = {
    pid: localStorage.getItem('hood_pid') || ('p' + Math.random().toString(36).slice(2, 10)),
    name: localStorage.getItem('hood_name') || 'HOOD',
    color: '#6ee7ff', pool: null, joined: false,
    me: { x: WORLD.w/2, y: WORLD.h/2, angle: 0, moving: false, frame: 0 },
    others: [], enemies: [], genesisMinted: 0, counts: {},
    stunUntil: 0, lastAttack: 0, bursts: [], floats: [], poofs: [], confetti: [], blasts: [],
    claim: null, enemyDir: {}, heroToken: 0,
    yeti: null, yetiWasActive: false, shakeUntil: 0, eatenUntil: 0, eatenPoofPending: false,
    wallet: null, mode: null, spectator: false, pendingRespawn: null, decor: null,
    gem: null, bladeUntil: 0, bladeLeft: 0, myHits: {},
  };
  const CONFETTI_COLORS = ['#ff7a18', '#ffd54a', '#ff5a7a', '#6ee06e', '#8fe9ff', '#b98bff', '#ffffff'];
  function pinataBurst(x, y, n) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, sp = 2 + Math.random() * 5;
      state.confetti.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 3, t: performance.now(), col: CONFETTI_COLORS[(Math.random() * CONFETTI_COLORS.length) | 0], s: 3 + Math.random() * 4, rot: Math.random() * 6 });
    }
  }
  // orange laser explosion (HOOD destroyed) — drawn in world space
  function drawBlast(g, b, now) {
    const life = 480, age = (now - b.t) / life; if (age > 1) return;
    const e = 1 - age;
    g.save(); g.translate(b.x, b.y);
    // shockwave rings
    g.strokeStyle = `rgba(255,130,20,${e * 0.85})`; g.lineWidth = 6 * e + 2; g.beginPath(); g.arc(0, 0, 18 + age * 72, 0, 7); g.stroke();
    g.strokeStyle = `rgba(255,225,160,${e})`; g.lineWidth = 3 * e + 1; g.beginPath(); g.arc(0, 0, 18 + age * 72, 0, 7); g.stroke();
    // radiating laser beams
    g.lineCap = 'round';
    for (let i = 0; i < 10; i++) {
      const a = i / 10 * Math.PI * 2 + b.t * 0.001;
      const r0 = 10 + age * 34, r1 = r0 + 54 * e;
      const x0 = Math.cos(a) * r0, y0 = Math.sin(a) * r0, x1 = Math.cos(a) * r1, y1 = Math.sin(a) * r1;
      g.strokeStyle = `rgba(255,120,10,${e * 0.9})`; g.lineWidth = 5 * e + 1; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
      g.strokeStyle = `rgba(255,245,200,${e})`; g.lineWidth = 2 * e + 0.5; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
    }
    // core flash
    g.shadowColor = '#ff7a18'; g.shadowBlur = 34 * e;
    g.fillStyle = `rgba(255,${(200 - age * 80) | 0},110,${e})`; g.beginPath(); g.arc(0, 0, 26 * e + 4, 0, 7); g.fill();
    g.shadowBlur = 0; g.fillStyle = `rgba(255,255,240,${e * 0.9})`; g.beginPath(); g.arc(0, 0, 13 * e + 2, 0, 7); g.fill();
    g.restore();
  }
  localStorage.setItem('hood_pid', state.pid);
  // tiered mint price by mint number: 1-100 FREE · 101-200 $10 · 201-300 $15 · 301-400 $20 · rest $24
  function mintPriceLabel(n) {
    return 'FREE · just gas'; // all bands free; real price still read on-chain at mint
  }
  const snd = (n) => { try { window.SND && SND.sfx(n); } catch (e) {} };
  const mon = (k) => { try { window.SND && SND.monster(k); } catch (e) {} };
  // orange gem power-up (faceted, glowing, bobbing)
  function drawGem(g, frame) {
    const bob = Math.sin(frame * 0.15) * 3, s = 14;
    g.save(); g.translate(0, bob);
    g.fillStyle = 'rgba(255,140,20,.22)'; g.beginPath(); g.arc(0, 0, 22 + Math.sin(frame * 0.2) * 2, 0, 7); g.fill();
    g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(0, s + 5 - bob, 12, 3, 0, 0, 7); g.fill();
    g.fillStyle = '#ff7a18'; g.beginPath(); g.moveTo(0, -s); g.lineTo(s * 0.8, -s * 0.2); g.lineTo(s * 0.5, s); g.lineTo(-s * 0.5, s); g.lineTo(-s * 0.8, -s * 0.2); g.closePath(); g.fill();
    g.fillStyle = '#ffb454'; g.beginPath(); g.moveTo(0, -s); g.lineTo(s * 0.8, -s * 0.2); g.lineTo(0, -s * 0.1); g.lineTo(-s * 0.8, -s * 0.2); g.closePath(); g.fill();
    g.fillStyle = '#e05e0e'; g.beginPath(); g.moveTo(-s * 0.8, -s * 0.2); g.lineTo(0, -s * 0.1); g.lineTo(-s * 0.5, s); g.closePath(); g.fill();
    g.fillStyle = '#c85010'; g.beginPath(); g.moveTo(s * 0.8, -s * 0.2); g.lineTo(0, -s * 0.1); g.lineTo(s * 0.5, s); g.closePath(); g.fill();
    g.fillStyle = '#ff9a3a'; g.beginPath(); g.moveTo(0, -s * 0.1); g.lineTo(-s * 0.5, s); g.lineTo(s * 0.5, s); g.closePath(); g.fill();
    g.fillStyle = 'rgba(255,255,255,.75)'; g.beginPath(); g.moveTo(-2, -s * 0.7); g.lineTo(2, -s * 0.7); g.lineTo(0, -s * 0.3); g.closePath(); g.fill();
    const a = frame * 0.1; g.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(frame * 0.3)); g.fillStyle = '#fff'; g.beginPath(); star(g, 13 * Math.cos(a), -13 * Math.sin(a), 2.6); g.fill(); g.globalAlpha = 1;
    g.restore();
  }

  // ================= SPRITES =================
  function _hoodShape(g, color, angle, frame, moving, attacking, stunned, bladeMul) {
    const bm = bladeMul || 1;
    g.save();
    g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(0, 20, 17, 6.5, 0, 0, 7); g.fill();
    if (attacking) g.rotate(frame * 0.7); // HOOD spins with the blade
    const bounce = moving ? Math.abs(Math.sin(frame * 0.35)) * 4 : Math.sin(frame * 0.06) * 1.4;
    const step = moving ? Math.sin(frame * 0.35) * 5 : 0;
    g.fillStyle = '#0c0e15';
    g.beginPath(); g.ellipse(-6, 16 + step, 3.6, 5.5, 0, 0, 7); g.fill();
    g.beginPath(); g.ellipse(6, 16 - step, 3.6, 5.5, 0, 0, 7); g.fill();
    g.translate(0, -bounce);
    // cloak — tinted with the player's colour so each HOOD is distinct
    const cg = g.createLinearGradient(0, -14, 0, 18);
    cg.addColorStop(0, shade(color, -0.42)); cg.addColorStop(1, shade(color, -0.68));
    g.fillStyle = cg;
    g.beginPath(); g.moveTo(-14, 16); g.quadraticCurveTo(-16.5, -6, -8, -14);
    g.quadraticCurveTo(0, -18, 8, -14); g.quadraticCurveTo(16.5, -6, 14, 16);
    g.quadraticCurveTo(0, 12, -14, 16); g.closePath(); g.fill();
    // shoulders trim in player color
    g.strokeStyle = color; g.globalAlpha = .5; g.lineWidth = 2;
    g.beginPath(); g.moveTo(-13, 4); g.quadraticCurveTo(0, 10, 13, 4); g.stroke(); g.globalAlpha = 1;
    // hood (player color)
    const hg = g.createLinearGradient(0, -22, 0, -4);
    hg.addColorStop(0, color); hg.addColorStop(1, shade(color, -.35));
    g.fillStyle = hg;
    g.beginPath(); g.moveTo(-11, -5); g.quadraticCurveTo(-13, -19, 0, -23);
    g.quadraticCurveTo(13, -19, 11, -5); g.quadraticCurveTo(0, -11, -11, -5); g.closePath(); g.fill();
    g.fillStyle = color; g.beginPath(); g.arc(0, -21 - Math.max(0, bounce*0.3), 3.4, 0, 7); g.fill();
    // face void
    g.fillStyle = '#04050a'; g.beginPath(); g.ellipse(0, -8, 5.5, 6.5, 0, 0, 7); g.fill();
    // eyes
    g.fillStyle = stunned ? '#6b7280' : '#ff8a2a'; g.shadowColor = '#ff7a18'; g.shadowBlur = stunned?0:6;
    g.beginPath(); g.arc(-2.2, -8, 1.1, 0, 7); g.arc(2.2, -8, 1.1, 0, 7); g.fill(); g.shadowBlur = 0;
    // blade
    g.save(); g.rotate(angle);
    if (attacking) {
      const t = frame * 0.9;
      g.shadowColor = bm > 1 ? '#ffb040' : '#ff7a18'; g.shadowBlur = bm > 1 ? 26 : 20; g.lineCap = 'round';
      g.strokeStyle = 'rgba(255,140,20,.55)'; g.lineWidth = 12;
      g.beginPath(); g.arc(0, 0, 40 * bm, t, t + Math.PI * 1.7); g.stroke();
      g.strokeStyle = 'rgba(255,180,70,.95)'; g.lineWidth = 6;
      g.beginPath(); g.arc(0, 0, 38 * bm, t, t + Math.PI * 1.7); g.stroke();
      g.strokeStyle = 'rgba(255,225,150,.9)'; g.lineWidth = 2.5;
      g.beginPath(); g.arc(0, 0, 40 * bm, t, t + Math.PI * 1.7); g.stroke();
      g.shadowBlur = 0;
    } else {
      const bg = g.createLinearGradient(6, 0, 44 * bm, 0); bg.addColorStop(0, '#ff8a2a'); bg.addColorStop(1, '#ffe0a0');
      g.fillStyle = bg; g.shadowColor = '#ff7a18'; g.shadowBlur = bm > 1 ? 16 : 10;
      g.beginPath(); g.moveTo(8, -3); g.lineTo(40 * bm, -1.6); g.lineTo(46 * bm, 0); g.lineTo(40 * bm, 1.6); g.lineTo(8, 3); g.closePath(); g.fill();
      g.shadowBlur = 0; g.fillStyle = '#3a2a12'; g.fillRect(3, -2, 7, 4);
    }
    g.restore();
    if (stunned) {
      g.fillStyle = '#ffd54a';
      for (let i = 0; i < 3; i++) { const a = frame * 0.15 + i * 2.1; g.beginPath(); star(g, Math.cos(a)*13, -26 + Math.sin(a)*4, 2.4); g.fill(); }
    }
    g.restore();
  }
  function drawHood(g, color, angle, frame, moving, attacking, stunned, scale, bladeMul) {
    g.save(); g.scale(scale, scale); _hoodShape(g, color, angle, frame, moving, attacking, stunned, bladeMul); g.restore();
  }

  function _enemyShape(g, type, rarity, frame, hero, dir, variant, badge) {
    const c = RCOL[rarity] || RCOL.green;
    const v = ((variant % 5) + 5) % 5;
    const acc = VAR_ACCENT[v];
    g.save(); if (dir < 0) g.scale(-1, 1);
    if (!hero) { g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(0, 22, 20, 7, 0, 0, 7); g.fill(); }
    const bob = Math.sin(frame * 0.2) * 2.5;
    g.translate(0, -bob);
    if (hero) { g.shadowColor = c.glow; g.shadowBlur = 30; }
    const body = () => { const bg = g.createLinearGradient(0, -20, 0, 22); bg.addColorStop(0, c.glow); bg.addColorStop(.5, c.main); bg.addColorStop(1, c.dark); g.fillStyle = bg; };
    const eye = (x, y, r) => { g.fillStyle = '#0a0a0a'; g.beginPath(); g.arc(x, y, r || 1.5, 0, 7); g.fill(); };

    if (type === 'dragon') {
      // v0 Wyrm · v1 Drake(big wings, raised head) · v2 Scale(back ridge) · v3 Ember(fire breath) · v4 Fang(land, big fangs+tail)
      const flap = Math.sin(frame * 0.3) * 0.5;
      const ws = v === 1 ? 1.4 : v === 4 ? 0.5 : 1;
      g.fillStyle = shade(acc, -.05);
      g.beginPath(); g.moveTo(-4, -4); g.quadraticCurveTo(-30 * ws, (-20 - flap * 10) * ws, -34 * ws, 4); g.quadraticCurveTo(-20 * ws, -2, -4, 6); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(4, -4); g.quadraticCurveTo(30 * ws, (-20 - flap * 10) * ws, 34 * ws, 4); g.quadraticCurveTo(20 * ws, -2, 4, 6); g.closePath(); g.fill();
      g.strokeStyle = c.main; g.lineWidth = 6; g.lineCap = 'round';
      const tl = v === 4 ? 34 : 24; g.beginPath(); g.moveTo(0, 10); g.quadraticCurveTo(18, 20, tl + Math.sin(frame * 0.3) * 4, 8); g.stroke();
      if (v === 4) { g.fillStyle = acc; g.beginPath(); g.moveTo(tl, 8); g.lineTo(tl + 8, 2); g.lineTo(tl + 8, 12); g.closePath(); g.fill(); } // tail fin
      body(); g.beginPath(); g.ellipse(0, 4, 13, 15, 0, 0, 7); g.fill();
      if (v === 2) { g.fillStyle = acc; for (let i = -1; i <= 2; i++) { g.beginPath(); g.moveTo(i * 6, -8); g.lineTo(i * 6 + 3, -17); g.lineTo(i * 6 + 6, -8); g.closePath(); g.fill(); } }
      const hy = v === 1 ? -18 : -14;
      body(); g.beginPath(); g.ellipse(2, hy, 9, 8, 0, 0, 7); g.fill();
      g.fillStyle = c.glow; g.beginPath(); g.moveTo(8, hy - 4); g.lineTo(16, hy - 8); g.lineTo(9, hy + 1); g.closePath(); g.fill(); // snout
      g.fillStyle = c.dark; const hh = v === 4 ? 8 : 6;
      g.beginPath(); g.moveTo(-2, hy - 8); g.lineTo(-4, hy - 8 - hh); g.lineTo(1, hy - 9); g.closePath();
      g.moveTo(4, hy - 8); g.lineTo(6, hy - 8 - hh); g.lineTo(7, hy - 8); g.fill();
      if (v === 3) { const f = Math.abs(Math.sin(frame * 0.5)) * 5; g.fillStyle = '#ff7a18'; g.beginPath(); g.moveTo(15, hy - 5); g.quadraticCurveTo(27, hy - 8 - f, 21, hy); g.quadraticCurveTo(27, hy + 3 + f, 15, hy - 1); g.closePath(); g.fill(); g.fillStyle = '#ffd54a'; g.beginPath(); g.arc(19, hy - 2, 2, 0, 7); g.fill(); }
      if (v === 4) { g.fillStyle = '#fff'; g.beginPath(); g.moveTo(9, hy + 2); g.lineTo(10, hy + 8); g.lineTo(13, hy + 2); g.closePath(); g.fill(); }
      eye(5, hy - 1, 1.6);
    } else if (type === 'orc') {
      // v0 Grunt · v1 Tusk(helmet) · v2 Maw(big mouth) · v3 Brute(shoulder spikes) · v4 Cleaver(axe+mohawk)
      g.fillStyle = shade(c.main, -.2); g.fillRect(-6, 8, 4, 12); g.fillRect(3, 8, 4, 12); // legs
      const bw = v === 3 ? 16 : 13;
      body(); g.beginPath(); g.moveTo(-bw, 12); g.quadraticCurveTo(-bw - 2, -8, 0, -10); g.quadraticCurveTo(bw + 2, -8, bw, 12); g.closePath(); g.fill();
      if (v === 3) { g.fillStyle = acc; g.beginPath(); g.moveTo(-16, -4); g.lineTo(-20, -12); g.lineTo(-11, -6); g.closePath(); g.moveTo(16, -4); g.lineTo(20, -12); g.lineTo(11, -6); g.fill(); } // shoulder spikes
      g.fillStyle = c.main; g.beginPath(); g.ellipse(0, -14, 10, 9, 0, 0, 7); g.fill(); // head
      if (v === 1) { g.fillStyle = acc; g.beginPath(); g.arc(0, -16, 10, Math.PI, 0); g.fill(); g.fillStyle = shade(acc, -.25); g.fillRect(-10, -16, 20, 2); } // helmet
      if (v === 4) { g.fillStyle = acc; for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(i * 3, -22); g.lineTo(i * 3 + 1.5, -28); g.lineTo(i * 3 + 3, -22); g.closePath(); g.fill(); } } // mohawk
      g.fillStyle = '#f4f0e0'; const tk = v === 1 ? 7 : 4; // tusks (Tusk variant bigger)
      g.beginPath(); g.moveTo(-4, -9); g.lineTo(-6, -9 + tk); g.lineTo(-2, -9); g.closePath();
      g.moveTo(4, -9); g.lineTo(6, -9 + tk); g.lineTo(2, -9); g.fill();
      if (v === 2) { g.fillStyle = '#2a0808'; g.beginPath(); g.ellipse(0, -10, 6, 4, 0, 0, 7); g.fill(); } // gaping maw
      eye(-4, -15); eye(4, -15);
      if (v === 4) { g.strokeStyle = shade(c.dark, -.1); g.lineWidth = 4; g.beginPath(); g.moveTo(11, 6); g.lineTo(19, -10); g.stroke(); g.fillStyle = acc; g.beginPath(); g.moveTo(15, -12); g.lineTo(24, -8); g.lineTo(20, -2); g.lineTo(14, -6); g.closePath(); g.fill(); } // axe
      else { g.strokeStyle = shade(c.dark, -.1); g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.moveTo(11, 4); g.lineTo(20, -8); g.stroke(); g.fillStyle = shade(c.dark, .1); g.beginPath(); g.arc(21, -10, 5, 0, 7); g.fill(); } // club
    } else if (type === 'unicorn') {
      // v0 Prism · v1 Horn(long) · v2 Mane(big) · v3 Gleam(pegasus wings) · v4 Star(pony+star)
      const sc = v === 4 ? 0.85 : 1;
      g.save(); g.scale(sc, sc);
      const s = Math.sin(frame * 0.3) * 3;
      if (v === 3) { g.fillStyle = shade(acc, .1); const fl = Math.sin(frame * 0.3) * 5; g.beginPath(); g.ellipse(-8, -2, 8, 15 + fl, 0.5, 0, 7); g.fill(); g.beginPath(); g.ellipse(4, -2, 8, 15 + fl, 0.5, 0, 7); g.fill(); } // wings behind
      g.fillStyle = shade(c.main, -.15);
      g.fillRect(-9, 8, 3.5, 12 + s); g.fillRect(-2, 8, 3.5, 12 - s); g.fillRect(5, 8, 3.5, 12 + s); // legs
      body(); g.beginPath(); g.ellipse(-2, 2, 15, 10, 0, 0, 7); g.fill(); // body
      g.beginPath(); g.moveTo(8, -2); g.quadraticCurveTo(16, -6, 14, -18); g.quadraticCurveTo(12, -22, 8, -18); g.quadraticCurveTo(6, -8, 4, -2); g.closePath(); g.fill(); // neck+head
      // mane (Mane variant big + accent)
      g.fillStyle = v === 2 ? acc : c.dark;
      if (v === 2) { g.beginPath(); g.moveTo(7, -18); g.quadraticCurveTo(-6, -14, -2, 4); g.quadraticCurveTo(4, -6, 9, -12); g.closePath(); g.fill(); }
      else { g.beginPath(); g.moveTo(6, -16); g.quadraticCurveTo(-2, -12, 2, 0); g.quadraticCurveTo(6, -8, 8, -14); g.closePath(); g.fill(); }
      // horn (Horn variant longer, Prism uses accent segments)
      const htip = v === 1 ? -34 : -30;
      g.fillStyle = hero ? c.glow : '#fff'; g.shadowColor = c.glow; g.shadowBlur = hero ? 30 : 8;
      g.beginPath(); g.moveTo(11, -18); g.lineTo(14, htip); g.lineTo(13, -18); g.closePath(); g.fill(); g.shadowBlur = 0;
      if (v === 0) { g.fillStyle = acc; g.beginPath(); g.arc(13, -24, 1.6, 0, 7); g.fill(); }
      if (v === 4) { g.fillStyle = acc; star(g, -4, 2, 3); g.fill(); const a = frame * 0.15; g.fillStyle = '#fff'; g.beginPath(); star(g, Math.cos(a) * 16, -16 + Math.sin(a) * 6, 1.8); g.fill(); } // star mark + sparkle
      eye(11, -14, 1.4);
      g.restore();
    } else if (type === 'robot') {
      // v0 Unit(box) · v1 Cog(dome) · v2 Bolt(tall antenna, thin) · v3 Servo(treads) · v4 Cipher(hover, one big eye)
      const hover = v === 4 ? Math.sin(frame * 0.25) * 3 : 0;
      g.translate(0, hover);
      const bw = v === 2 ? 9 : 12;
      if (v === 3) { g.fillStyle = c.dark; g.beginPath(); g.moveTo(-15, 8); g.lineTo(15, 8); g.lineTo(13, 20); g.lineTo(-13, 20); g.closePath(); g.fill(); g.fillStyle = '#0a0f16'; for (let i = -12; i <= 12; i += 6) { g.fillRect(i, 12, 3, 6); } } // treads
      else if (v !== 4) { g.fillStyle = c.dark; g.fillRect(-9, 14, 6, 8); g.fillRect(3, 14, 6, 8); } // legs (Cipher hovers, none)
      body(); g.fillRect(-bw, -12, bw * 2, 26); // body
      if (v === 1) { body(); g.beginPath(); g.arc(0, -12, bw, Math.PI, 0); g.fill(); } // dome head
      g.fillStyle = shade(c.dark, .05); g.fillRect(-bw, -12, bw * 2, 6); // band
      g.fillStyle = '#0a0f16'; g.fillRect(-8, -6, 16, 10); // screen
      const ex = Math.sin(frame * 0.2) * 3;
      g.fillStyle = hero ? c.glow : acc; g.shadowColor = acc; g.shadowBlur = 8;
      if (v === 4) { g.beginPath(); g.arc(0, -1, 5, 0, 7); g.fill(); } // one big eye
      else { g.beginPath(); g.arc(ex, -1, 3, 0, 7); g.fill(); }
      g.shadowBlur = 0;
      // antenna (Bolt tall + lightning)
      const at = v === 2 ? -30 : -20;
      g.strokeStyle = c.dark; g.lineWidth = 3; g.beginPath(); g.moveTo(0, -12); g.lineTo(0, at); g.stroke();
      g.fillStyle = acc; g.beginPath(); g.arc(0, at - 1, 2.4, 0, 7); g.fill();
      if (v === 2) { g.strokeStyle = '#ffd54a'; g.lineWidth = 2; g.beginPath(); g.moveTo(-3, at + 4); g.lineTo(2, at + 8); g.lineTo(-2, at + 10); g.stroke(); }
      g.fillStyle = shade(c.main, -.2); g.fillRect(-bw - 4, -8, 4, 14); g.fillRect(bw, -8, 4, 14); // arms
    } else if (type === 'darkhood') { // dark HOOD, extra glowing eyes, blue (v1) or orange (v0) blade
      const blue = (variant % 2) === 1;
      const blade = blue ? '#3aa0ff' : '#ff8a2a', gl = blue ? '#8fd0ff' : '#ffb454';
      if (hero) { g.shadowColor = gl; g.shadowBlur = 22; }
      const cg = g.createLinearGradient(0, -20, 0, 22); cg.addColorStop(0, blue ? '#161e2e' : '#211820'); cg.addColorStop(1, '#05060b');
      g.fillStyle = cg;
      g.beginPath(); g.moveTo(-18, 20); g.quadraticCurveTo(-21, -8, -10, -18); g.quadraticCurveTo(0, -23, 10, -18); g.quadraticCurveTo(21, -8, 18, 20); g.quadraticCurveTo(0, 15, -18, 20); g.closePath(); g.fill();
      if (hero) g.shadowBlur = 0;
      g.fillStyle = '#090b12';
      g.beginPath(); g.moveTo(-14, -5); g.quadraticCurveTo(-16, -24, 0, -29); g.quadraticCurveTo(16, -24, 14, -5); g.quadraticCurveTo(0, -13, -14, -5); g.closePath(); g.fill();
      g.fillStyle = '#000'; g.beginPath(); g.ellipse(0, -10, 7, 8, 0, 0, 7); g.fill();
      g.fillStyle = gl; g.shadowColor = gl; g.shadowBlur = 8;
      g.beginPath(); g.arc(-3.6, -12, 1.5, 0, 7); g.arc(3.6, -12, 1.5, 0, 7); g.fill();
      g.beginPath(); g.arc(-2.1, -6.5, 1.2, 0, 7); g.arc(2.1, -6.5, 1.2, 0, 7); g.fill();
      g.shadowBlur = 0;
      g.save(); g.rotate(-0.32);
      const bgd = g.createLinearGradient(8, 0, 48, 0); bgd.addColorStop(0, blade); bgd.addColorStop(1, blue ? '#d6f0ff' : '#ffe0a0');
      g.fillStyle = bgd; g.shadowColor = blade; g.shadowBlur = 12;
      g.beginPath(); g.moveTo(10, -3); g.lineTo(42, -1.6); g.lineTo(49, 0); g.lineTo(42, 1.6); g.lineTo(10, 3); g.closePath(); g.fill();
      g.shadowBlur = 0; g.fillStyle = '#2a2016'; g.fillRect(6, -2, 7, 4);
      g.restore();
    } else { // slime — v0 Blob · v1 Gel(tall) · v2 Drip · v3 Goo(bubbles) · v4 Morph(3 eyes)
      const wob = Math.sin(frame * 0.3) * 1.6;
      const h = v === 1 ? 24 : 16;
      body();
      g.beginPath(); g.moveTo(-16, 14); g.quadraticCurveTo(-18, -h + wob, 0, -h); g.quadraticCurveTo(18, -h - wob, 16, 14); g.quadraticCurveTo(0, 20, -16, 14); g.closePath(); g.fill();
      if (v === 2) { body(); for (const dx of [-10, 2, 11]) { g.beginPath(); g.ellipse(dx, 14, 3, 6 + Math.abs(Math.sin(frame * 0.3 + dx)) * 3, 0, 0, 7); g.fill(); } } // drips
      if (v === 3) { g.fillStyle = 'rgba(255,255,255,.22)'; g.beginPath(); g.arc(-5, 4, 3, 0, 7); g.arc(6, 2, 2, 0, 7); g.arc(1, 9, 2.4, 0, 7); g.fill(); } // bubbles
      g.fillStyle = 'rgba(255,255,255,.4)'; g.beginPath(); g.ellipse(-5, -7, 6, 4, -0.4, 0, 7); g.fill(); // shine
      g.fillStyle = '#fff';
      if (v === 4) { g.beginPath(); g.arc(-6, -4, 3, 0, 7); g.arc(6, -4, 3, 0, 7); g.arc(0, -11, 2.6, 0, 7); g.fill(); g.fillStyle = '#0a0a0a'; g.beginPath(); g.arc(-6, -3.4, 1.4, 0, 7); g.arc(6, -3.4, 1.4, 0, 7); g.arc(0, -10.4, 1.2, 0, 7); g.fill(); }
      else { g.beginPath(); g.arc(-6, -4, 3.4, 0, 7); g.arc(6, -4, 3.4, 0, 7); g.fill(); g.fillStyle = '#0a0a0a'; g.beginPath(); g.arc(-6, -3.3, 1.6, 0, 7); g.arc(6, -3.3, 1.6, 0, 7); g.fill(); }
      g.strokeStyle = '#0a0a0a'; g.lineWidth = 1.2; g.lineCap = 'round'; g.beginPath(); g.arc(0, 2, 4, 0.25, Math.PI - 0.25); g.stroke(); // smile
    }
    // trait badge floats above the head (both on the field and in the hero pose)
    if (badge != null) {
      const by = -42 + Math.sin(frame * 0.15) * 2.5;
      drawBadge(g, badge, 0, by, hero ? 7.5 : 5.5, frame);
    }
    g.restore();
  }
  function drawEnemy(g, type, rarity, frame, scale, hero, dir, variant, badge) {
    g.save(); g.scale(scale, scale); _enemyShape(g, type, rarity, frame, hero, dir, variant, badge); g.restore();
  }
  // ---------- Giant Yeti (invulnerable pool hazard that eats HOODs) ----------
  function drawYeti(g, frame, eating, dir, moving, scale) {
    g.save(); g.scale(scale, scale);
    dir = dir || 1;
    const spd = moving ? 0.28 : 0.09;          // stride faster while walking
    const walk = Math.sin(frame * spd);        // step cycle
    const amp = moving ? 1 : 0.3;
    const stepUpL = Math.max(0, walk) * 8 * amp;   // left foot lifts
    const stepUpR = Math.max(0, -walk) * 8 * amp;  // right foot lifts
    const strideL = walk * 10 * amp, strideR = -walk * 10 * amp;
    const bob = -Math.abs(walk) * 4 * amp;         // body rises mid-step
    const lean = walk * 3 * amp * dir;             // weight shift
    const breathe = Math.sin(frame * 0.18) * 1.2;
    const nod = walk * 1.5 * amp;
    // ground shadow (stays planted)
    g.fillStyle = 'rgba(0,0,0,.4)'; g.beginPath(); g.ellipse(0, 44, 44, 12, 0, 0, 7); g.fill();
    const bg = g.createLinearGradient(0, -46, 0, 40);
    bg.addColorStop(0, '#f4fbff'); bg.addColorStop(.55, '#cfe6f5'); bg.addColorStop(1, '#9fc2da');
    g.translate(lean, bob);
    // legs (stride forward/back + lift) + feet
    g.fillStyle = '#bcd7e8';
    g.beginPath(); g.ellipse(-15 + strideL, 34 - stepUpL, 12, 15, strideL * 0.01, 0, 7); g.fill();
    g.beginPath(); g.ellipse(15 + strideR, 34 - stepUpR, 12, 15, strideR * 0.01, 0, 7); g.fill();
    g.fillStyle = '#a7c8dd';
    g.beginPath(); g.ellipse(-15 + strideL, 46 - stepUpL, 13, 6, 0, 0, 7); g.fill();
    g.beginPath(); g.ellipse(15 + strideR, 46 - stepUpR, 13, 6, 0, 0, 7); g.fill();
    // arms (swing opposite the legs; reach out when eating)
    const reach = eating ? 14 : 0;
    const swingL = (eating ? 0 : -walk * 9 * amp), swingR = (eating ? 0 : walk * 9 * amp);
    g.fillStyle = '#d7ecfa';
    g.beginPath(); g.ellipse(-30 + swingL - reach * 0.3, 4 + reach + swingL * 0.4, 11, 17, 0.3 + swingL * 0.02, 0, 7); g.fill();
    g.beginPath(); g.ellipse(30 + swingR + reach * 0.3, 4 + reach + swingR * 0.4, 11, 17, -0.3 + swingR * 0.02, 0, 7); g.fill();
    // furry body (jagged silhouette)
    g.fillStyle = bg; g.beginPath();
    const R = 34;
    for (let i = 0; i <= 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      const jag = (i % 2 ? 1 : 0.86) * (1 + Math.sin(i * 1.7 + frame * 0.1) * 0.04);
      const rx = R * jag, ry = (40 + breathe) * jag;
      const px = Math.cos(a) * rx, py = Math.sin(a) * ry - 4;
      if (i === 0) g.moveTo(px, py); else g.lineTo(px, py);
    }
    g.closePath(); g.fill();
    g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.ellipse(0, 8, 18, 22, 0, 0, 7); g.fill();
    // head (nods with steps)
    g.save(); g.translate(dir * 2, -34 + nod);
    g.fillStyle = bg; g.beginPath(); g.ellipse(0, 0, 26, 22, 0, 0, 7); g.fill();
    g.fillStyle = '#e7f4ff'; g.beginPath(); g.ellipse(-22, -12, 7, 10, -0.4, 0, 7); g.fill();
    g.beginPath(); g.ellipse(22, -12, 7, 10, 0.4, 0, 7); g.fill();
    g.fillStyle = '#8fb4cc'; g.fillRect(-16, -6, 32, 5);
    g.fillStyle = '#0a1a26'; g.beginPath(); g.ellipse(-9, 2, 4.5, 5.5, 0, 0, 7); g.ellipse(9, 2, 4.5, 5.5, 0, 0, 7); g.fill();
    g.fillStyle = '#ff5a2a'; g.shadowColor = '#ff5a2a'; g.shadowBlur = 8;
    g.beginPath(); g.arc(-9, 1, 1.8, 0, 7); g.arc(9, 1, 1.8, 0, 7); g.fill(); g.shadowBlur = 0;
    const gape = eating ? 12 + Math.abs(Math.sin(frame * 0.6)) * 10 : 5;
    g.fillStyle = '#3a0d10'; g.beginPath(); g.ellipse(0, 14, 15, gape, 0, 0, 7); g.fill();
    g.fillStyle = '#fff';
    g.beginPath(); g.moveTo(-9, 14 - gape * 0.5); g.lineTo(-6, 14 - gape * 0.5 + 7); g.lineTo(-12, 14 - gape * 0.5 + 5); g.closePath();
    g.moveTo(9, 14 - gape * 0.5); g.lineTo(6, 14 - gape * 0.5 + 7); g.lineTo(12, 14 - gape * 0.5 + 5); g.closePath(); g.fill();
    g.restore();
    g.restore();
  }

  // Giant Lizard — quadruped boss, same interface as the Yeti
  function drawBigLizard(g, frame, eating, dir, moving, scale) {
    g.save(); g.scale(scale, scale); if ((dir || 1) < 0) g.scale(-1, 1);
    const spd = moving ? 0.28 : 0.1, walk = Math.sin(frame * spd), amp = moving ? 1 : 0.3;
    const bob = -Math.abs(walk) * 3 * amp;
    g.fillStyle = 'rgba(0,0,0,.4)'; g.beginPath(); g.ellipse(0, 44, 52, 12, 0, 0, 7); g.fill();
    g.translate(0, bob);
    const bg = g.createLinearGradient(0, -24, 0, 40); bg.addColorStop(0, '#9ee34f'); bg.addColorStop(.5, '#5aa832'); bg.addColorStop(1, '#3a7d22');
    // tail
    g.strokeStyle = '#5aa832'; g.lineWidth = 15; g.lineCap = 'round'; g.beginPath(); g.moveTo(-22, 22); g.quadraticCurveTo(-46, 26, -60 + Math.sin(frame * 0.2) * 7, 8); g.stroke();
    g.lineWidth = 8; g.strokeStyle = '#4a8f28'; g.beginPath(); g.moveTo(-44, 20); g.lineTo(-60 + Math.sin(frame * 0.2) * 7, 8); g.stroke();
    // legs (quadruped, diagonal gait)
    const la = walk * 9 * amp, lb = -walk * 9 * amp;
    g.fillStyle = '#4a8f28';
    g.fillRect(-24 + la * 0.3, 22, 9, 20 - Math.max(0, la)); g.fillRect(-2 - lb * 0.3, 22, 9, 20 - Math.max(0, lb));
    g.fillRect(8 + la * 0.3, 20, 9, 22 - Math.max(0, -la)); g.fillRect(24 - lb * 0.3, 20, 9, 22 - Math.max(0, -lb));
    // body
    g.fillStyle = bg; g.beginPath(); g.ellipse(0, 10, 34, 22, 0, 0, 7); g.fill();
    g.fillStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.ellipse(-4, 16, 20, 12, 0, 0, 7); g.fill();
    // back ridge spikes
    g.fillStyle = '#3a6d1e'; for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(i * 8, -8); g.lineTo(i * 8 + 4, -20 - (i === 0 ? 4 : 0)); g.lineTo(i * 8 + 8, -8); g.closePath(); g.fill(); }
    // head
    g.fillStyle = bg; g.beginPath(); g.ellipse(30, 2, 22, 15, 0, 0, 7); g.fill();
    const gape = eating ? 8 + Math.abs(Math.sin(frame * 0.6)) * 11 : 3;
    g.fillStyle = '#5aa832'; g.beginPath(); g.moveTo(42, -6); g.lineTo(62, -4); g.lineTo(60, 1); g.lineTo(42, 2); g.closePath(); g.fill(); // upper jaw
    g.fillStyle = '#3a0d10'; g.beginPath(); g.ellipse(52, 3 + gape * 0.3, 12, gape, 0, 0, 7); g.fill(); // mouth
    g.fillStyle = '#5aa832'; g.beginPath(); g.moveTo(42, 5 + gape); g.lineTo(60, 3 + gape); g.lineTo(56, 10 + gape); g.lineTo(42, 9 + gape); g.closePath(); g.fill(); // lower jaw
    g.fillStyle = '#fff'; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(45 + i * 4, 0); g.lineTo(47 + i * 4, 4); g.lineTo(49 + i * 4, 0); g.closePath(); g.fill(); }
    // eye (slit, glowing)
    g.fillStyle = '#ffdb3a'; g.shadowColor = '#ffdb3a'; g.shadowBlur = 8; g.beginPath(); g.ellipse(27, -7, 4.5, 6, 0, 0, 7); g.fill(); g.shadowBlur = 0;
    g.fillStyle = '#0a0a0a'; g.fillRect(25.6, -11, 3, 8);
    g.restore();
  }

  // Giant Robot — heavy bipedal boss, same interface as the Yeti
  function drawBigRobot(g, frame, eating, dir, moving, scale) {
    g.save(); g.scale(scale, scale); dir = dir || 1;
    const spd = moving ? 0.26 : 0.09, walk = Math.sin(frame * spd), amp = moving ? 1 : 0.3;
    const stepL = Math.max(0, walk) * 9 * amp, stepR = Math.max(0, -walk) * 9 * amp;
    const strideL = walk * 8 * amp, strideR = -walk * 8 * amp, bob = -Math.abs(walk) * 3 * amp;
    g.fillStyle = 'rgba(0,0,0,.42)'; g.beginPath(); g.ellipse(0, 46, 46, 12, 0, 0, 7); g.fill();
    g.translate(dir * walk * 2 * amp, bob);
    const bg = g.createLinearGradient(0, -30, 0, 24); bg.addColorStop(0, '#b3bdca'); bg.addColorStop(.5, '#6a7484'); bg.addColorStop(1, '#454d59');
    // legs + feet
    g.fillStyle = '#5a6472'; g.fillRect(-18 + strideL, 20, 14, 24 - stepL); g.fillRect(4 + strideR, 20, 14, 24 - stepR);
    g.fillStyle = '#3a424e'; g.fillRect(-21 + strideL, 42 - stepL, 20, 6); g.fillRect(1 + strideR, 42 - stepR, 20, 6);
    // arms (reach/crush when eating)
    const reach = eating ? 16 : 0;
    g.save(); g.translate(-30, -8); g.rotate(eating ? -0.6 : 0.22 + strideR * 0.02); g.fillStyle = '#5a6472'; g.fillRect(-6, 0, 12, 24 + reach); g.fillStyle = '#3a424e'; g.fillRect(-7, 22 + reach, 14, 8); g.restore();
    g.save(); g.translate(30, -8); g.rotate(eating ? 0.6 : -0.22 + strideL * 0.02); g.fillStyle = '#5a6472'; g.fillRect(-6, 0, 12, 24 + reach); g.fillStyle = '#3a424e'; g.fillRect(-7, 22 + reach, 14, 8); g.restore();
    // torso
    g.fillStyle = bg; g.beginPath(); g.moveTo(-26, 20); g.lineTo(-30, -14); g.quadraticCurveTo(0, -24, 30, -14); g.lineTo(26, 20); g.closePath(); g.fill();
    g.fillStyle = '#2a303a'; g.fillRect(-16, -6, 32, 16); // vent
    g.fillStyle = eating ? '#ff3b3b' : '#ff7a18'; g.shadowColor = '#ff5a2a'; g.shadowBlur = 8; for (let i = -1; i <= 1; i++) { g.beginPath(); g.arc(i * 9, 2, 2.6, 0, 7); g.fill(); } g.shadowBlur = 0;
    // head + visor
    g.fillStyle = bg; g.fillRect(-16, -42, 32, 22);
    g.fillStyle = '#2a303a'; g.fillRect(-12, -38, 24, 13);
    const ex = Math.sin(frame * 0.2) * 6; g.fillStyle = eating ? '#ff3b3b' : '#ff5a2a'; g.shadowColor = '#ff5a2a'; g.shadowBlur = 12; g.beginPath(); g.arc(ex, -31, 4.2, 0, 7); g.fill(); g.shadowBlur = 0;
    g.strokeStyle = '#3a424e'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, -42); g.lineTo(0, -52); g.stroke(); g.fillStyle = '#ff5a2a'; g.beginPath(); g.arc(0, -53, 3, 0, 7); g.fill();
    g.restore();
  }
  const BOSS_DRAW = { yeti: drawYeti, lizard: drawBigLizard, robot: drawBigRobot };
  const BOSS_NAME = { yeti: 'GIANT YETI', lizard: 'GIANT LIZARD', robot: 'GIANT ROBOT' };
  const BOSS_ICON = { yeti: '❄', lizard: '🦎', robot: '🤖' };

  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) & 255, gg = (n >> 8) & 255, b = n & 255;
    if (amt < 0) { r *= (1 + amt); gg *= (1 + amt); b *= (1 + amt); }
    else { r += (255 - r) * amt; gg += (255 - gg) * amt; b += (255 - b) * amt; }
    return `rgb(${r | 0},${gg | 0},${b | 0})`;
  }
  function star(g, x, y, r) { g.moveTo(x, y - r); for (let i = 1; i < 10; i++) { const a = Math.PI * i / 5, rr = i % 2 ? r * .45 : r; g.lineTo(x + Math.sin(a) * rr, y - Math.cos(a) * rr); } }

  // ================= BACKGROUND DECOR (per-area, purely visual, non-interactive) =================
  const DECOR = {
    'primordial-ooze': [['fern', 5], ['bone', 3], ['rock', 5], ['ooze', 5]],
    'fairy-lake':      [['mushroom', 5], ['lilypad', 5], ['reed', 6], ['firefly', 10]],
    'dungeon-dam':     [['boulder', 6], ['crate', 3], ['torch', 4], ['bat', 4]],
    'ravens-nest':     [['deadtree', 3], ['tomb', 3], ['bone', 4], ['raven', 4]],
    'creature-swamp':  [['log', 3], ['lilypad', 5], ['reed', 7], ['frog', 5]],
    'babblin-brook':   [['stone', 7], ['flower', 5], ['reed', 5], ['fish', 6]],
  };
  function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return h >>> 0; }
  function seededRng(seed) { let s = (seed >>> 0) || 1; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }
  function placeItem(kind, rng) {
    const cx = 800, cy = 500;
    if (kind === 'lilypad' || kind === 'fish') { const a = rng() * 6.283, r = rng() * 170; return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r * 0.68 }; }
    if (kind === 'reed') { const a = rng() * 6.283, r = 195 + rng() * 70; return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r * 0.68 }; }
    if (kind === 'bat' || kind === 'raven' || kind === 'firefly') return { x: 120 + rng() * 1360, y: 100 + rng() * 520 };
    let x, y, t = 0; do { x = 120 + rng() * 1360; y = 130 + rng() * 740; t++; } while (t < 24 && ((x - cx) * (x - cx) / 90000 + (y - cy) * (y - cy) / 44100 < 1));
    return { x, y };
  }
  function buildDecor(pool) {
    const rng = seededRng(hashStr(pool || '')); const list = [];
    for (const [kind, n] of (DECOR[pool] || [])) {
      for (let i = 0; i < n; i++) {
        const p = placeItem(kind, rng); const it = { kind, x: p.x, y: p.y, seed: rng() * 100 };
        if (kind === 'bat' || kind === 'raven') { const a = rng() * 6.283, sp = kind === 'raven' ? 1.0 : 1.5; it.vx = Math.cos(a) * sp; it.vy = Math.sin(a) * sp * 0.5; }
        if (kind === 'frog') { it.homeX = p.x; it.homeY = p.y; it._nextHop = 0; }
        if (kind === 'fish') { it.angle = rng() * 6.283; it.rr = 40 + rng() * 120; it.spd = 0.008 + rng() * 0.014; it.cx = 800; it.cy = 500; }
        if (kind === 'firefly') { it.bx = p.x; it.by = p.y; it.ph = rng() * 6.283; }
        list.push(it);
      }
    }
    return list;
  }
  function drawDecor(g, now) {
    if (!state.decor) return;
    for (const it of state.decor) {
      const t = now * 0.001 + it.seed;
      g.save();
      if (it.kind === 'bat' || it.kind === 'raven') {
        it.x += it.vx; it.y += it.vy;
        if (it.x < 90) { it.x = 90; it.vx = Math.abs(it.vx); } if (it.x > 1510) { it.x = 1510; it.vx = -Math.abs(it.vx); }
        if (it.y < 90) { it.y = 90; it.vy = Math.abs(it.vy); } if (it.y > 640) { it.y = 640; it.vy = -Math.abs(it.vy); }
        g.translate(it.x, it.y); if (it.vx < 0) g.scale(-1, 1); (it.kind === 'bat' ? dBat : dRaven)(g, t);
      } else if (it.kind === 'frog') {
        if (now > it._nextHop) { it._nextHop = now + 1800 + Math.random() * 3200; it._hopStart = now; it._fx = it.x; it._fy = it.y; const a = Math.random() * 6.283, d = 18 + Math.random() * 34; it._tx = Math.max(120, Math.min(1480, it.homeX + Math.cos(a) * d)); it._ty = Math.max(140, Math.min(870, it.homeY + Math.sin(a) * d)); }
        let jh = 0; if (it._hopStart) { const k = Math.min(1, (now - it._hopStart) / 480); it.x = it._fx + (it._tx - it._fx) * k; it.y = it._fy + (it._ty - it._fy) * k; jh = Math.sin(k * Math.PI) * 11; if (k >= 1) it._hopStart = 0; }
        g.translate(it.x, it.y); dFrog(g, jh);
      } else if (it.kind === 'fish') {
        it.angle += it.spd; it.x = it.cx + Math.cos(it.angle) * it.rr; it.y = it.cy + Math.sin(it.angle) * it.rr * 0.6; g.translate(it.x, it.y); if (Math.cos(it.angle) < 0) g.scale(-1, 1); dFish(g, t);
      } else if (it.kind === 'firefly') {
        it.x = it.bx + Math.sin(t * 0.8 + it.ph) * 20; it.y = it.by + Math.cos(t * 0.6 + it.ph) * 15; g.translate(it.x, it.y); dFirefly(g, t);
      } else { g.translate(it.x, it.y); dStatic(g, it.kind, t, it); }
      g.restore();
    }
  }
  // living critters
  function dBat(g, t) { const f = Math.sin(t * 9); g.fillStyle = '#191320';
    g.beginPath(); g.moveTo(0, -1); g.quadraticCurveTo(-10, -6 - f * 4, -16, 0); g.quadraticCurveTo(-9, 0, 0, 3); g.closePath();
    g.moveTo(0, -1); g.quadraticCurveTo(10, -6 - f * 4, 16, 0); g.quadraticCurveTo(9, 0, 0, 3); g.closePath(); g.fill();
    g.beginPath(); g.ellipse(0, 0, 4, 5, 0, 0, 7); g.fill();
    g.fillStyle = '#ff5a2a'; g.fillRect(-2.2, -2, 1.3, 1.3); g.fillRect(1, -2, 1.3, 1.3); }
  function dRaven(g, t) { const f = Math.sin(t * 8); g.fillStyle = '#141420';
    g.beginPath(); g.ellipse(0, 0, 6, 4, 0, 0, 7); g.fill();
    g.beginPath(); g.moveTo(4, -1); g.lineTo(12, 0); g.lineTo(4, 2); g.fill();
    g.beginPath(); g.ellipse(-5, -3, 4, 3, 0.3, 0, 7); g.fill();
    g.fillStyle = '#0a0a0a'; g.beginPath(); g.moveTo(-8, -3); g.lineTo(-13, -2); g.lineTo(-8, -1); g.fill();
    g.fillStyle = '#141420'; g.beginPath(); g.moveTo(0, -1); g.quadraticCurveTo(-4, -9 - f * 6, -3, -2); g.quadraticCurveTo(3, -9 - f * 6, 2, -1); g.closePath(); g.fill();
    g.fillStyle = '#8a5aff'; g.fillRect(-6.5, -4, 1.3, 1.3); }
  function dFrog(g, jh) { g.translate(0, -jh);
    g.fillStyle = 'rgba(0,0,0,.22)'; g.beginPath(); g.ellipse(0, 7 + jh, 9, 3, 0, 0, 7); g.fill();
    g.fillStyle = '#4a9e3a'; g.beginPath(); g.ellipse(0, 2, 9, 7, 0, 0, 7); g.fill();
    g.strokeStyle = '#3a7d2e'; g.lineWidth = 2.4; g.lineCap = 'round'; g.beginPath(); g.moveTo(-7, 6); g.lineTo(-11, 8 - jh * 0.4); g.moveTo(7, 6); g.lineTo(11, 8 - jh * 0.4); g.stroke();
    g.fillStyle = '#4a9e3a'; g.beginPath(); g.ellipse(-6, -3, 3.2, 3.2, 0, 0, 7); g.ellipse(6, -3, 3.2, 3.2, 0, 0, 7); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(-6, -3, 1.6, 0, 7); g.arc(6, -3, 1.6, 0, 7); g.fill();
    g.fillStyle = '#0a0a0a'; g.beginPath(); g.arc(-6, -3, 0.9, 0, 7); g.arc(6, -3, 0.9, 0, 7); g.fill(); }
  function dFish(g, t) { const wig = Math.sin(t * 6) * 2;
    g.fillStyle = '#5ec8e8'; g.beginPath(); g.ellipse(0, 0, 7, 4, 0, 0, 7); g.fill();
    g.beginPath(); g.moveTo(-6, 0); g.lineTo(-12, -4 + wig); g.lineTo(-12, 4 + wig); g.closePath(); g.fill();
    g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.ellipse(1, -1, 3, 1.4, 0, 0, 7); g.fill();
    g.fillStyle = '#0a0a0a'; g.beginPath(); g.arc(4, -1, 1, 0, 7); g.fill(); }
  function dFirefly(g, t) { const gl = 0.45 + 0.55 * Math.sin(t * 4); g.globalAlpha = gl; g.shadowColor = '#fff2a0'; g.shadowBlur = 9; g.fillStyle = '#fff6b0'; g.beginPath(); g.arc(0, 0, 2.2, 0, 7); g.fill(); g.shadowBlur = 0; g.globalAlpha = 1; }
  // static scenery
  function dStatic(g, kind, t, it) {
    if (kind === 'rock' || kind === 'boulder' || kind === 'stone') {
      const b = kind === 'boulder' ? 1.45 : kind === 'stone' ? 0.75 : 1;
      g.fillStyle = 'rgba(0,0,0,.26)'; g.beginPath(); g.ellipse(0, 8 * b, 13 * b, 4, 0, 0, 7); g.fill();
      const gr = g.createLinearGradient(0, -10 * b, 0, 8 * b); gr.addColorStop(0, kind === 'stone' ? '#9aa6b2' : '#8a8f99'); gr.addColorStop(1, '#464b55'); g.fillStyle = gr;
      g.beginPath(); g.moveTo(-12 * b, 7 * b); g.quadraticCurveTo(-13 * b, -6 * b, -3 * b, -9 * b); g.quadraticCurveTo(10 * b, -10 * b, 12 * b, 4 * b); g.quadraticCurveTo(6 * b, 8 * b, -12 * b, 7 * b); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 1; g.beginPath(); g.moveTo(-4 * b, -6 * b); g.lineTo(0, 2 * b); g.stroke();
    } else if (kind === 'fern') {
      g.strokeStyle = '#2f8f45'; g.lineWidth = 2.5; g.lineCap = 'round';
      for (let i = -2; i <= 2; i++) { g.save(); g.rotate(i * 0.28); g.beginPath(); g.moveTo(0, 7); g.quadraticCurveTo(i * 2, -14, i * 3, -22); g.stroke(); g.restore(); }
    } else if (kind === 'mushroom') {
      g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.ellipse(0, 9, 7, 2.5, 0, 0, 7); g.fill();
      g.fillStyle = '#f0e6d0'; g.fillRect(-2.2, -2, 4.4, 11);
      g.fillStyle = '#e0484f'; g.beginPath(); g.ellipse(0, -3, 9, 6, 0, 0, 7); g.fill();
      g.fillStyle = '#fff'; g.beginPath(); g.arc(-3, -4, 1.4, 0, 7); g.arc(3, -3, 1.2, 0, 7); g.arc(0, -6, 1.1, 0, 7); g.fill();
    } else if (kind === 'lilypad') {
      g.fillStyle = 'rgba(0,0,0,.12)'; g.beginPath(); g.ellipse(0, 2, 14, 7, 0, 0, 7); g.fill();
      g.fillStyle = '#3f9d4a'; g.beginPath(); g.ellipse(0, 0, 13, 7, 0, 0.45, Math.PI * 2 - 0.45); g.closePath(); g.fill();
      if ((it.seed | 0) % 3 === 0) { g.fillStyle = '#ff9ecf'; for (let i = 0; i < 5; i++) { g.save(); g.rotate(i * 1.2566); g.beginPath(); g.ellipse(0, -3.5, 2, 3.4, 0, 0, 7); g.fill(); g.restore(); } g.fillStyle = '#ffd54a'; g.beginPath(); g.arc(0, 0, 1.6, 0, 7); g.fill(); }
    } else if (kind === 'reed') {
      const sway = Math.sin(t * 1.5) * 3; g.strokeStyle = '#3a7d2e'; g.lineWidth = 2.4; g.lineCap = 'round';
      for (let i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(i * 4, 8); g.quadraticCurveTo(i * 4 + sway * 0.5, -8, i * 4 + sway, -22); g.stroke(); g.fillStyle = '#6a4a2e'; g.beginPath(); g.ellipse(i * 4 + sway, -22, 1.6, 4, 0, 0, 7); g.fill(); }
    } else if (kind === 'bone') {
      g.strokeStyle = '#e8e2d0'; g.lineWidth = 3; g.lineCap = 'round'; g.beginPath(); g.moveTo(-6, 4); g.lineTo(6, -4); g.stroke();
      g.fillStyle = '#e8e2d0'; g.beginPath(); g.arc(-7, 3, 2, 0, 7); g.arc(-5, 5, 2, 0, 7); g.arc(7, -3, 2, 0, 7); g.arc(5, -5, 2, 0, 7); g.fill();
    } else if (kind === 'crate') {
      g.fillStyle = 'rgba(0,0,0,.22)'; g.beginPath(); g.ellipse(0, 10, 11, 3, 0, 0, 7); g.fill();
      g.fillStyle = '#6b4a2a'; g.fillRect(-9, -9, 18, 18); g.strokeStyle = '#4a3018'; g.lineWidth = 2; g.strokeRect(-9, -9, 18, 18); g.beginPath(); g.moveTo(-9, -9); g.lineTo(9, 9); g.moveTo(9, -9); g.lineTo(-9, 9); g.stroke();
    } else if (kind === 'torch') {
      g.fillStyle = '#4a3018'; g.fillRect(-2, -4, 4, 18);
      const fl = Math.sin(t * 10) * 2, fl2 = Math.cos(t * 13) * 1.5;
      g.fillStyle = '#ff7a18'; g.shadowColor = '#ff7a18'; g.shadowBlur = 14; g.beginPath(); g.moveTo(-5, -4); g.quadraticCurveTo(-4, -16 - fl, 0, -22 - fl); g.quadraticCurveTo(4, -16 + fl2, 5, -4); g.quadraticCurveTo(0, -2, -5, -4); g.closePath(); g.fill();
      g.fillStyle = '#ffd54a'; g.shadowBlur = 0; g.beginPath(); g.moveTo(-2, -5); g.quadraticCurveTo(0, -14 - fl, 2, -5); g.quadraticCurveTo(0, -3, -2, -5); g.closePath(); g.fill();
    } else if (kind === 'deadtree') {
      g.strokeStyle = '#3a2f28'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 15); g.lineTo(0, -14); g.stroke();
      g.lineWidth = 3; g.beginPath(); g.moveTo(0, -4); g.lineTo(-10, -14); g.moveTo(0, -8); g.lineTo(9, -16); g.moveTo(0, 2); g.lineTo(-8, -2); g.stroke();
    } else if (kind === 'tomb') {
      g.fillStyle = 'rgba(0,0,0,.24)'; g.beginPath(); g.ellipse(0, 12, 12, 3, 0, 0, 7); g.fill();
      g.fillStyle = '#6a7079'; g.beginPath(); g.moveTo(-9, 12); g.lineTo(-9, -6); g.quadraticCurveTo(0, -16, 9, -6); g.lineTo(9, 12); g.closePath(); g.fill();
      g.strokeStyle = '#474c54'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(0, -8); g.lineTo(0, 2); g.moveTo(-4, -3); g.lineTo(4, -3); g.stroke();
    } else if (kind === 'log') {
      g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.ellipse(0, 7, 17, 3, 0, 0, 7); g.fill();
      g.fillStyle = '#5a3f28'; g.beginPath(); if (g.roundRect) g.roundRect(-16, -6, 32, 12, 6); else g.rect(-16, -6, 32, 12); g.fill();
      g.fillStyle = '#8a6a44'; g.beginPath(); g.ellipse(16, 0, 4, 6, 0, 0, 7); g.fill(); g.strokeStyle = '#6a4a2e'; g.lineWidth = 1; g.beginPath(); g.arc(16, 0, 2, 0, 7); g.stroke();
      g.fillStyle = '#3f9d4a'; g.beginPath(); g.ellipse(-4, -6, 5, 2, 0, 0, 7); g.fill();
    } else if (kind === 'flower') {
      g.strokeStyle = '#3a7d2e'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(0, 9); g.lineTo(0, -2); g.stroke();
      const cols = ['#ff6fae', '#ffd54a', '#8fd7ff', '#c88cff', '#ff9a3a']; g.fillStyle = cols[(it.seed | 0) % 5];
      for (let i = 0; i < 5; i++) { g.save(); g.rotate(i * 1.2566); g.beginPath(); g.ellipse(0, -6, 2.5, 4, 0, 0, 7); g.fill(); g.restore(); }
      g.fillStyle = '#ffd54a'; g.beginPath(); g.arc(0, -4, 2, 0, 7); g.fill();
    } else if (kind === 'ooze') {
      const b = Math.sin(t * 2) * 1.5;
      g.fillStyle = 'rgba(70,190,85,.5)'; g.beginPath(); g.ellipse(0, 0, 12, 6 + b, 0, 0, 7); g.fill();
      g.fillStyle = 'rgba(130,255,140,.6)'; g.beginPath(); g.arc(-3, -1, 2, 0, 7); g.arc(4, 0, 1.5, 0, 7); g.fill();
      const by = (t * 22) % 22; g.globalAlpha = 1 - by / 22; g.beginPath(); g.arc(2, -by, 1.6, 0, 7); g.fill(); g.globalAlpha = 1;
    }
  }

  // ================= RENDER =================
  let _bgGrad = null, _bgKey = '';
  function worldBg(theme, camX, camY) {
    const key = theme.bg[0] + theme.bg[1] + '|' + VH;   // rebuild only on theme/size change, not every frame
    if (_bgKey !== key) { _bgGrad = ctx.createLinearGradient(0, 0, 0, VH); _bgGrad.addColorStop(0, theme.bg[0]); _bgGrad.addColorStop(1, theme.bg[1]); _bgKey = key; }
    ctx.fillStyle = _bgGrad; ctx.fillRect(0, 0, VW, VH);
    // ground rect (world)
    ctx.save(); ctx.translate(-camX, -camY);
    ctx.fillStyle = theme.ground; ctx.fillRect(0, 0, WORLD.w, WORLD.h);
    // subtle grid
    ctx.strokeStyle = 'rgba(255,255,255,.03)'; ctx.lineWidth = 1;
    for (let x = 0; x <= WORLD.w; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, WORLD.h); ctx.stroke(); }
    for (let y = 0; y <= WORLD.h; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WORLD.w, y); ctx.stroke(); }
    // central spawning pool
    const t = performance.now() * 0.001;
    const px = WORLD.w / 2, py = WORLD.h / 2;
    for (let i = 3; i >= 0; i--) {
      ctx.beginPath(); ctx.ellipse(px, py, 210 + i * 8 + Math.sin(t + i) * 6, 150 + i * 6 + Math.cos(t + i) * 5, 0, 0, 7);
      ctx.fillStyle = i % 2 ? theme.liquid : theme.liquid2; ctx.globalAlpha = i === 0 ? .9 : .18; ctx.fill();
    }
    ctx.globalAlpha = 1;
    // ripples
    ctx.strokeStyle = 'rgba(255,255,255,.10)'; ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) { const rr = ((t * 40 + i * 60) % 180); ctx.globalAlpha = 1 - rr / 180; ctx.beginPath(); ctx.ellipse(px, py, rr + 40, (rr + 40) * .72, 0, 0, 7); ctx.stroke(); }
    ctx.globalAlpha = 1;
    // border wall
    ctx.strokeStyle = 'rgba(0,0,0,.5)'; ctx.lineWidth = 10; ctx.strokeRect(0, 0, WORLD.w, WORLD.h);
    ctx.restore();
    // fog vignette
    const vg = ctx.createRadialGradient(VW/2, VH/2, VH*.3, VW/2, VH/2, VH*.75);
    vg.addColorStop(0, 'transparent'); vg.addColorStop(1, 'rgba(0,0,0,.55)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, VW, VH);
  }

  let ambient = [];
  function initAmbient() { ambient = []; for (let i = 0; i < 42; i++) ambient.push({ x: Math.random()*VW, y: Math.random()*VH, s: Math.random()*2+1, sp: Math.random()*0.4+0.1, o: Math.random()*.5+.2 }); }
  initAmbient();
  function drawAmbient(theme) {
    const p = theme.particle;
    for (const a of ambient) {
      a.y -= a.sp; if (a.y < -10) { a.y = VH + 10; a.x = Math.random()*VW; }
      ctx.globalAlpha = a.o;
      if (p === 'ember') ctx.fillStyle = '#ff8a2a';
      else if (p === 'spark') ctx.fillStyle = '#bfe8ff';
      else if (p === 'feather') ctx.fillStyle = '#b98bff';
      else if (p === 'bubble') ctx.fillStyle = '#7CFC7C';
      else if (p === 'drop') ctx.fillStyle = '#9bf0e8';
      else ctx.fillStyle = '#c2d67a';
      ctx.beginPath(); ctx.arc(a.x, a.y, a.s, 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function frameLoop(now) {
    requestAnimationFrame(frameLoop);
    if (!state.joined) return;
    const theme = THEMES[state.pool];
    updateMovement();
    // camera (spectators follow the first visible HOOD, else the pool centre)
    let focusX = state.me.x, focusY = state.me.y;
    if (state.spectator) { const f = state.others[0]; focusX = f ? f.x : WORLD.w / 2; focusY = f ? f.y : WORLD.h / 2; }
    let camX = focusX - VW / 2, camY = focusY - VH / 2;
    camX = Math.max(0, Math.min(camX, WORLD.w - VW)); camY = Math.max(0, Math.min(camY, WORLD.h - VH));
    if (WORLD.w < VW) camX = (WORLD.w - VW) / 2; if (WORLD.h < VH) camY = (WORLD.h - VH) / 2;
    if (state.shakeUntil > now) { const s = (state.shakeUntil - now) / 600 * 10; camX += (Math.random() - .5) * s; camY += (Math.random() - .5) * s; }
    worldBg(theme, camX, camY);
    ctx.save(); ctx.translate(-camX, -camY);

    // themed background decor (behind everything)
    drawDecor(ctx, now);

    // poofs (spawn smoke)
    state.poofs = state.poofs.filter(p => now - p.t < 600);
    for (const p of state.poofs) { const k = (now - p.t) / 600; ctx.strokeStyle = `rgba(200,200,200,${(1-k)*.6})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(p.x, p.y, 8 + k * 34, 0, 7); ctx.stroke(); }

    // enemies
    for (const e of state.enemies) {
      // dir
      const prev = state.enemyDir[e.id] || { x: e.x };
      const dir = e.x < prev.x - 0.5 ? -1 : (e.x > prev.x + 0.5 ? 1 : (prev.dir || 1));
      state.enemyDir[e.id] = { x: e.x, dir };
      if (e.spawnAge != null && e.spawnAge < 250 && !prev.poofed) { state.poofs.push({ x: e.x, y: e.y, t: now }); state.enemyDir[e.id].poofed = true; snd('spawn'); }
      if (e.x - camX < -70 || e.x - camX > VW + 70 || e.y - camY < -70 || e.y - camY > VH + 70) continue; // cull offscreen
      ctx.save(); ctx.translate(e.x, e.y);
      // TTL ring
      const ttlFrac = Math.max(0, e.ttl / 10);
      ctx.strokeStyle = ttlFrac < 0.35 ? '#ff5a5a' : (RCOL[e.rarity]?.main || '#fff');
      ctx.lineWidth = 3; ctx.globalAlpha = .8;
      ctx.beginPath(); ctx.arc(0, 0, 30, -Math.PI/2, -Math.PI/2 + ttlFrac * Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
      drawEnemy(ctx, e.type, e.rarity, e.frame || 0, 1, false, dir, e.nftId % 5, badgeOf(e.nftId));
      // hit pips (my own progress, tracked locally from 'hit' events)
      const eh = Math.max(e.hits || 0, state.myHits[e.id] || 0);
      if (eh > 0) { for (let i = 0; i < 3; i++) { ctx.fillStyle = i < eh ? '#ff7a18' : 'rgba(255,255,255,.2)'; ctx.beginPath(); ctx.arc(-8 + i * 8, -36, 3, 0, 7); ctx.fill(); } }
      ctx.restore();
    }
    // orange gem power-up
    if (state.gem) { ctx.save(); ctx.translate(state.gem.x, state.gem.y); drawGem(ctx, now * 0.06); ctx.restore(); }
    // other players (viewport-culled — only draw HOODs on screen)
    for (const o of state.others) {
      if (o.x - camX < -70 || o.x - camX > VW + 70 || o.y - camY < -90 || o.y - camY > VH + 90) continue;
      ctx.save(); ctx.translate(o.x, o.y);
      drawHood(ctx, o.color, o.angle, o.frame || 0, o.moving, o.attacking, o.stunned, 1, o.buffed ? 1.95 : 1);
      ctx.fillStyle = 'rgba(230,236,245,.75)'; ctx.font = '11px system-ui'; ctx.textAlign = 'center';
      ctx.fillText(o.name, 0, -34); ctx.restore();
    }
    // me
    const stunnedMe = state.stunUntil > now;
    const eatenMe = state.eatenUntil > now;
    if (!eatenMe && !state.spectator) { // while eaten/exploded, HOOD is hidden
      ctx.save(); ctx.translate(state.me.x, state.me.y);
      drawHood(ctx, state.color, state.me.angle, state.me.frame, state.me.moving && !stunnedMe, now - state.lastAttack < 420, stunnedMe, 1, state.bladeUntil > now ? 1.95 : 1);
      ctx.restore();
    }
    // Giant Yeti (drawn on top — it looms over everything)
    if (state.yeti) {
      ctx.save(); ctx.translate(state.yeti.x, state.yeti.y);
      (BOSS_DRAW[state.yeti.kind] || drawYeti)(ctx, state.yeti.frame || 0, state.yeti.eating, state.yeti.dir || 1, state.yeti.moving, 2.4);
      ctx.restore();
    }
    // respawn poof once you're eaten/exploded timer wears off
    if (state.eatenPoofPending && !eatenMe) {
      state.eatenPoofPending = false;
      if (state.pendingRespawn) { state.me.x = state.pendingRespawn.x; state.me.y = state.pendingRespawn.y; state.pendingRespawn = null; }
      state.poofs.push({ x: state.me.x, y: state.me.y, t: now });
      pinataBurst(state.me.x, state.me.y, 24); snd('poof');
      toast('↩ Respawned!');
    }

    // bursts + floats
    state.bursts = state.bursts.filter(b => now - b.t < 350);
    for (const b of state.bursts) { const k = (now - b.t)/350; ctx.strokeStyle = `rgba(255,150,40,${1-k})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(b.x, b.y, 10 + k*26, 0, 7); ctx.stroke(); }
    state.floats = state.floats.filter(f => now - f.t < 900);
    for (const f of state.floats) { const k = (now - f.t)/900; ctx.globalAlpha = 1 - k; ctx.fillStyle = f.col; ctx.font = 'bold 15px system-ui'; ctx.textAlign = 'center'; ctx.fillText(f.txt, f.x, f.y - k*30); ctx.globalAlpha = 1; }
    // piñata confetti
    state.confetti = state.confetti.filter(c => now - c.t < 1400);
    ctx.imageSmoothingEnabled = false;
    for (const c of state.confetti) {
      const age = (now - c.t) / 1000; c.x += c.vx; c.y += c.vy; c.vy += 0.28; c.vx *= 0.99; c.rot += 0.3;
      ctx.globalAlpha = Math.max(0, 1 - age / 1.4); ctx.fillStyle = c.col;
      ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.rot); ctx.fillRect(-c.s/2, -c.s/2, c.s, c.s); ctx.restore();
    }
    ctx.globalAlpha = 1;

    // orange laser blasts (HOOD destroyed) — on top, seen by everyone in the pool
    state.blasts = state.blasts.filter(b => now - b.t < 500);
    for (const b of state.blasts) drawBlast(ctx, b, now);

    ctx.restore();
    drawAmbient(theme);
    // long-blade buff indicator (bottom-left)
    if (state.bladeUntil > now) {
      const left = Math.ceil((state.bladeUntil - now) / 1000);
      ctx.save(); ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(8,11,18,.72)'; ctx.strokeStyle = 'rgba(255,180,84,.5)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(12, VH - 44, 168, 30, 8) : ctx.rect(12, VH - 44, 168, 30); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ffb454'; ctx.font = 'bold 14px system-ui'; ctx.fillText('⚔ LONG BLADE  ' + left + 's', 24, VH - 24);
      ctx.restore();
    }
    if (state.claim) updateClaimTimer(now);
  }
  requestAnimationFrame(frameLoop);

  // ================= MOVEMENT / INPUT =================
  const keys = {};
  const dpad = { up:0, down:0, left:0, right:0 };
  let lastMoveT = performance.now(), lastNet = 0;
  function updateMovement() {
    const now = performance.now();
    const dt = Math.min(40, now - lastMoveT); lastMoveT = now;
    if (state.spectator) { state.me.moving = false; return; }
    if (state.stunUntil > now) { state.me.moving = false; return; }
    let dx = 0, dy = 0;
    if (keys['ArrowUp'] || keys['w'] || dpad.up) dy -= 1;
    if (keys['ArrowDown'] || keys['s'] || dpad.down) dy += 1;
    if (keys['ArrowLeft'] || keys['a'] || dpad.left) dx -= 1;
    if (keys['ArrowRight'] || keys['d'] || dpad.right) dx += 1;
    const moving = dx || dy;
    state.me.moving = !!moving;
    if (moving) {
      const len = Math.hypot(dx, dy); dx /= len; dy /= len;
      const sp = 0.26 * dt;
      state.me.x = Math.max(70, Math.min(WORLD.w - 70, state.me.x + dx * sp));
      state.me.y = Math.max(70, Math.min(WORLD.h - 70, state.me.y + dy * sp));
      state.me.angle = Math.atan2(dy, dx);
      state.me.frame += 1;
    } else { state.me.frame += 0.3; }
    if (now - lastNet > 100) { lastNet = now; sendState(); } // 10Hz position updates (lighter on the server under crowds)
  }

  window.addEventListener('keydown', e => {
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
    keys[e.key] = true;
    if ((e.key === 'Enter' || e.key === ' ') && state.joined && !state.spectator) attack();
  });
  window.addEventListener('keyup', e => { keys[e.key] = false; });

  // mobile dpad
  document.querySelectorAll('#pad .key').forEach(k => {
    const dir = k.dataset.dir;
    const on = e => { e.preventDefault(); dpad[dir] = 1; };
    const off = e => { e.preventDefault(); dpad[dir] = 0; };
    k.addEventListener('touchstart', on); k.addEventListener('touchend', off); k.addEventListener('touchcancel', off);
    k.addEventListener('mousedown', on); k.addEventListener('mouseup', off);
  });
  $('atkBtn').addEventListener('touchstart', e => { e.preventDefault(); attack(); });
  $('atkBtn').addEventListener('mousedown', e => { e.preventDefault(); attack(); });
  // double-tap on canvas to attack
  let lastTap = 0;
  canvas.addEventListener('touchend', e => { const n = Date.now(); if (n - lastTap < 300) attack(); lastTap = n; });

  function attack() {
    if (state.spectator) return;
    const now = performance.now();
    if (now - state.lastAttack < 450 || state.stunUntil > now) return;
    state.lastAttack = now; send({ t: 'attack' }); snd('swing');
  }

  // ================= NETWORK =================
  let ws = null;
  function connect() {
    const base = location.pathname.replace(/\/[^/]*$/, '');
    const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws = new WebSocket(`${proto}//${location.host}${base}/ws`);
    ws.onopen = () => { send(state.spectator ? { t: 'spectate', pool: state.pool } : { t: 'join', pid: state.pid, name: state.name, pool: state.pool }); };
    ws.onmessage = ev => handle(JSON.parse(ev.data));
    ws.onclose = () => { if (state.joined) { toast('Reconnecting…'); setTimeout(connect, 1500); } };
    ws.onerror = () => {};
  }
  function send(o) { if (ws && ws.readyState === 1) ws.send(JSON.stringify(o)); }
  function sendState() { send({ t: 'state', x: Math.round(state.me.x), y: Math.round(state.me.y), angle: +state.me.angle.toFixed(2), moving: state.me.moving, frame: Math.round(state.me.frame) }); }

  function handle(m) {
    switch (m.t) {
      case 'full':
        state.joined = false;
        toast('🔥 Server at capacity — huge crowd! Refresh in a minute to grab a spot.');
        try { $('intro').classList.remove('hidden'); $('hud').classList.add('hidden'); } catch (e) {}
        break;
      case 'pool_full':
        state.joined = false;
        toast('🔥 ' + ((THEMES[m.pool] && THEMES[m.pool].label) || 'That pool') + ' is full — pick another pool!');
        try { $('intro').classList.remove('hidden'); $('hud').classList.add('hidden'); document.body.classList.remove('spectating'); } catch (e) {}
        break;
      case 'joined':
        state.color = m.color; state.genesisMinted = m.genesisMinted; updateGenUI();
        if (m.genesisComplete) showGenesisComplete(); break;
      case 'world':
        state.enemies = m.enemies; state.others = m.players; state.genesisMinted = m.genesisMinted;
        { const live = {}; for (const e of m.enemies) if (state.myHits[e.id]) live[e.id] = state.myHits[e.id]; state.myHits = live; } // drop hits for gone enemies
        state.counts = m.counts || {}; updateGenUI();
        state.gem = m.gem || null; state.bladeLeft = m.bladeLeft || 0;
        state.yeti = m.yeti || null;
        if (state.yeti) {
          const k = state.yeti.kind || 'yeti';
          if (!state.yetiWasActive) { toast(`${BOSS_ICON[k]} A ${BOSS_NAME[k]} emerges — it can't be hurt. RUN!`); snd('warn'); mon(k); state.lastBossSnd = performance.now(); }
          else if (performance.now() - (state.lastBossSnd || 0) > 5200) { mon(k); state.lastBossSnd = performance.now(); }
        }
        state.yetiWasActive = !!state.yeti;
        { const cnt = state.counts[state.pool] || 0; $('players').textContent = cnt + ' HOOD' + (cnt === 1 ? '' : 's') + ' here'; }
        if (m.genesisComplete) showGenesisComplete();
        break;
      case 'hit': {
        if (m.enemyId != null) state.myHits[m.enemyId] = m.hits; // track my hit progress locally (world sends 0)
        state.bursts.push({ x: m.x, y: m.y, t: performance.now() });
        state.floats.push({ x: m.x, y: m.y, t: performance.now(), txt: m.hits + '/3', col: RCOL[m.rarity]?.main || '#ff7a18' });
        snd('hit');
        if (m.hits >= 3) { pinataBurst(m.x, m.y, 46); snd('capture'); toast('Piñata cracked! Claim it before it escapes'); }
        break; }
      case 'exploded': {
        const rem = Math.max(0, m.until - Date.now());
        state.stunUntil = performance.now() + rem; state.eatenUntil = performance.now() + rem;
        state.shakeUntil = performance.now() + 500;
        // the visual blast comes from the broadcast 'explode_fx' (so both HOODs see it)
        state.pendingRespawn = { x: m.x, y: m.y }; state.eatenPoofPending = true;
        toast(`💥 ${m.by} blasted you! Respawning in 2s…`);
        if (state.claim) closeModal();
        break; }
      case 'explode_fx':
        state.blasts.push({ x: m.x, y: m.y, t: performance.now() });
        state.shakeUntil = Math.max(state.shakeUntil, performance.now() + 250);
        snd('explode');
        break;
      case 'gem': {
        const rem = Math.max(0, m.until - Date.now());
        state.bladeUntil = performance.now() + rem;
        if (m.x != null) pinataBurst(m.x, m.y, 28);
        snd('powerup'); toast('🔶 Orange Gem! Blade DOUBLED for ' + Math.round(rem / 1000) + 's ⚔');
        break; }
      case 'eaten': {
        const rem = Math.max(0, m.until - Date.now());
        state.stunUntil = performance.now() + rem; state.eatenUntil = performance.now() + rem;
        state.shakeUntil = performance.now() + 600;
        state.pendingRespawn = { x: m.x, y: m.y }; state.eatenPoofPending = true;
        { const k = (state.yeti && state.yeti.kind) || 'yeti'; toast(`${BOSS_ICON[k]} The ${BOSS_NAME[k]} DEVOURED you! Respawning…`); snd('chomp'); mon(k); }
        if (state.claim) closeModal();
        break; }
      case 'spectating':
        state.genesisMinted = m.genesisMinted; updateGenUI();
        if (m.genesisComplete) showGenesisComplete(); break;
      case 'claim': $('chooser').style.display = 'none'; openClaim(m.nft); break;
      case 'claim_choice': showChooser(m.options); break;
      case 'claim_expired':
        if (state.claim && state.claim.nftId === m.nftId) { closeModal(); toast('It slipped back into the pool…'); } break;
      case 'minted':
        state.genesisMinted = m.genesisMinted; updateGenUI();
        addTicker(m.hero);
        if (m.genesisComplete) showGenesisComplete();
        break;
      case 'milestone': showMilestone(m); break;
      case 'voucher': doOnchainMint(m); break;
      case 'mint_result':
        if (m.ok) showMinted(m.hero);
        else if (m.pending) { /* on-chain mint already confirmed; server/reconciler will sync — keep the minted reveal */ }
        else if (state.claim && state.onchain) { setMintStatus('⚠ ' + (m.error || 'mint failed')); $('mintBtn').textContent = 'TRY MINT AGAIN'; $('mintBtn').disabled = false; }
        else { toast(m.error || 'Mint failed'); closeModal(); }
        break;
      case 'genesis_complete': showGenesisComplete(); break;
    }
  }

  // ================= UI: genesis + toast =================
  const COLLECTION_TOTAL = 10000;
  function updateGenUI() {
    $('gnum').textContent = state.genesisMinted.toLocaleString();
    $('gfill').style.width = Math.min(100, state.genesisMinted / COLLECTION_TOTAL * 100) + '%';
    $('poolName').textContent = THEMES[state.pool] ? THEMES[state.pool].label : '';
  }
  let toastTimer;
  function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2600); }

  // ================= CLAIM / MINT =================
  function openClaim(nft) {
    state.claim = nft; state.onchain = false; setMintStatus(''); const c = RCOL[nft.rarity];
    $('mRar').textContent = RARITY_LABEL[nft.rarity]; $('mRar').style.background = c.dark; $('mRar').style.color = c.glow;
    $('mName').textContent = nft.name;
    $('claimStage').classList.remove('hidden'); $('mintedStage').classList.add('hidden');
    { const rb = document.querySelector('.robin'); if (rb) rb.textContent = 'SPAWNHOOD Genesis · Mint price: ' + mintPriceLabel(state.genesisMinted); }
    $('mintBtn').textContent = 'MINT GENESIS NFT'; $('mintBtn').disabled = false;
    $('modal').style.display = 'flex';
    renderHero(nft, false);
    toast('You cornered it! Mint within 2:00');
  }
  function updateClaimTimer(now) {
    if (!state.claim) return;
    const rem = Math.max(0, state.claim.deadline - Date.now());
    const s = Math.ceil(rem / 1000); const mm = Math.floor(s / 60), ss = String(s % 60).padStart(2, '0');
    $('mTimer').textContent = `${mm}:${ss}`; $('mTbar').style.width = (rem / 120000 * 100) + '%';
    if (rem <= 0 && $('claimStage').classList.contains('hidden') === false) { /* server will release */ }
  }
  $('mintBtn').addEventListener('click', () => { if (state.claim && !$('mintBtn').disabled) { setMintStatus(''); send({ t: 'mint', nftId: state.claim.nftId }); $('mintBtn').textContent = 'Minting…'; $('mintBtn').disabled = true; } });

  // ---------- on-chain mint (voucher → contract.mint, paid from the player's wallet) ----------
  const RH_NET = {
    4663:  { chainId: '0x1237', chainName: 'Robinhood Chain',   rpcUrls: ['https://rpc.mainnet.chain.robinhood.com'], blockExplorerUrls: ['https://robinhoodchain.blockscout.com'], nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 } },
    46630: { chainId: '0xB626', chainName: 'Robinhood Testnet', rpcUrls: ['https://rpc.testnet.chain.robinhood.com'], blockExplorerUrls: ['https://robinhoodchain.blockscout.com'], nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 } },
  };
  const setMintStatus = html => { const s = $('mintStatus'); if (s) s.innerHTML = html || ''; };
  async function ensureChain(id) {
    const n = RH_NET[id]; if (!n) return;
    const eth = WEB3 || window.ethereum;
    try { await eth.request({ method: 'wallet_addEthereumChain', params: [n] }); } catch (e) {}
    await eth.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: n.chainId }] });
  }
  async function doOnchainMint(m) {
    state.onchain = true;
    console.log('[SPAWNHOOD] on-chain mint → contract', m.contract, 'chain', m.chainId, 'token', m.voucher && m.voucher.tokenId);
    try {
      const eth = WEB3 || window.ethereum;
      if (!eth) throw new Error('No wallet found — reconnect your wallet to mint.');
      setMintStatus('Preparing your mint…'); await ensureEthers();
      // only switch chains if we're not already on it — a redundant switch eats the gesture and stops the wallet auto-popping
      const targetHex = (m.chainHex || (RH_NET[m.chainId] && RH_NET[m.chainId].chainId) || '').toLowerCase();
      let cur = null; try { cur = (await eth.request({ method: 'eth_chainId' })).toLowerCase(); } catch (e) {}
      if (targetHex && cur !== targetHex) await ensureChain(m.chainId);
      const provider = new ethers.BrowserProvider(eth);
      const signer = await provider.getSigner();
      const abi = ['function mint((address to,uint256 tokenId,uint256 nonce,uint256 deadline) v, bytes sig) payable'];
      const c = new ethers.Contract(m.contract, abi, signer);
      // price comes from the voucher (server-read) — no extra on-chain call before the wallet pops
      let price = 0n; try { price = BigInt(m.price != null ? m.price : 0); } catch (e) {}
      setMintStatus('✍️ Confirm in your wallet' + (price > 0n ? ' — ' + (+ethers.formatEther(price)).toFixed(5) + ' ETH' : ' — free (just gas)'));
      const tx = await c.mint(m.voucher, m.sig, { value: price });
      setMintStatus('⏳ Minting on-chain… <span class="mono">' + tx.hash.slice(0, 12) + '…</span>');
      await tx.wait();
      // on-chain mint is CONFIRMED — that's the source of truth. Tell the server to sync
      // the ledger (it also auto-reconciles), and reveal the NFT optimistically now.
      send({ t: 'mint_onchain', nftId: Number(m.voucher.tokenId), txHash: tx.hash });
      if (state.claim) showMinted({ nftId: Number(m.voucher.tokenId), rarity: state.claim.rarity, type: state.claim.type, name: state.claim.name, variant: state.claim.variant, minter: state.pid });
    } catch (e) {
      const raw = (e && (e.info?.error?.message || e.shortMessage || e.message)) || '';
      console.error('[SPAWNHOOD] on-chain mint failed:', e);
      const rejected = e && (e.code === 4001 || e.code === 'ACTION_REJECTED');
      const lowFunds = /insufficient funds|exceeds balance|not enough|insufficient balance/i.test(raw) || (e && e.code === -32000);
      let priceStr = ''; try { priceStr = (+ethers.formatEther(BigInt(m.price || 0))).toFixed(5); } catch (_) {}
      const friendly = rejected ? 'Mint rejected in wallet.'
        : lowFunds ? ('Not enough ETH to mint. You need ~' + (priceStr || '0.0053') + ' ETH + a little gas — top up your wallet on Robinhood Chain, then try again.')
        : /json-rpc|revert|expired|estimate|internal/i.test(raw) ? 'That mint didn’t go through (the confirmation may have timed out). Tap “Try mint again” for a fresh one.'
        : (raw || 'Mint failed — tap “Try mint again”.');
      setMintStatus('⚠ ' + friendly); toast(friendly);
      $('mintBtn').textContent = '↻ Try mint again'; $('mintBtn').disabled = false;
    }
  }
  $('releaseBtn').addEventListener('click', () => { closeModal(); toast('Released back to the pool.'); });
  $('closeMinted').addEventListener('click', closeModal);
  function closeModal() {
    if (state.claim) send({ t: 'release_claim', nftId: state.claim.nftId }); // frees the NFT + ends invulnerability
    $('modal').style.display = 'none'; state.claim = null; state.onchain = false; setMintStatus(''); state.heroToken++; // kill any running hero loop
    $('mintBtn').textContent = 'MINT GENESIS NFT'; $('mintBtn').disabled = false;
    $('claimStage').classList.remove('hidden'); $('mintedStage').classList.add('hidden');
    const hc = $('heroCanvas'); hc.getContext('2d').clearRect(0, 0, hc.width, hc.height);
  }
  function showMinted(hero) {
    $('claimStage').classList.add('hidden'); $('mintedStage').classList.remove('hidden');
    renderHero(hero, true); pinataBurst(state.me.x, state.me.y, 70); snd('mint'); toast(`Minted! Genesis ${state.genesisMinted.toLocaleString()}/10,000`);
  }
  function hexA(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; }
  function renderHero(nft, minted) {
    const myToken = ++state.heroToken; // invalidates any prior hero loop
    const hc = $('heroCanvas'), g = hc.getContext('2d');
    const cx = hc.width / 2, cy = hc.height / 2 + 24;
    const c = RCOL[nft.rarity] || RCOL.green;
    const spk = []; let f = 0;
    function loop() {
      if (state.heroToken !== myToken || $('modal').style.display !== 'flex') return; // superseded or closed
      const now = performance.now();
      g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, hc.width, hc.height);
      // soft radial backdrop glow in the rarity colour
      const rg = g.createRadialGradient(cx, cy - 30, 20, cx, cy - 30, 250);
      rg.addColorStop(0, hexA(c.main, minted ? 0.30 : 0.14)); rg.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = rg; g.fillRect(0, 0, hc.width, hc.height);
      // rotating light rays (minted only)
      if (minted) { g.save(); g.translate(cx, cy - 20); const t = now * 0.0005; for (let i = 0; i < 16; i++) { g.rotate(Math.PI / 8 + t); g.fillStyle = i % 2 ? c.dark : c.main; g.globalAlpha = .10; g.beginPath(); g.moveTo(0, 0); g.lineTo(24, 320); g.lineTo(-24, 320); g.fill(); } g.restore(); g.globalAlpha = 1; }
      // pedestal glow
      g.save(); g.translate(cx, cy + 72); g.fillStyle = hexA(c.glow, 0.35); g.shadowColor = c.main; g.shadowBlur = 28; g.beginPath(); g.ellipse(0, 0, 92, 18, 0, 0, 7); g.fill(); g.shadowBlur = 0; g.restore();
      const bob = Math.sin(now * 0.002) * 6;
      // rim-light halo — creature drawn slightly larger behind, in glow colour
      g.save(); g.translate(cx, cy + bob); g.globalAlpha = 0.5; g.shadowColor = c.glow; g.shadowBlur = minted ? 26 : 14;
      drawEnemy(g, nft.type, nft.rarity, f, 3.78, minted, 1, nft.nftId % 5, null); // no badge on the rim pass (avoids double badge)
      g.restore();
      // main creature
      g.save(); g.translate(cx, cy + bob);
      drawEnemy(g, nft.type, nft.rarity, f, 3.6, minted, 1, nft.nftId % 5, badgeOf(nft.nftId));
      g.restore();
      // twinkling sparkles (minted)
      if (minted) {
        if (spk.length < 16 && f % 3 === 0) spk.push({ a: Math.random() * 6.28, r: 55 + Math.random() * 130, s: now, life: 900 + Math.random() * 700, sz: 1.5 + Math.random() * 2.6 });
        for (let i = spk.length - 1; i >= 0; i--) { const p = spk[i]; const k = (now - p.s) / p.life; if (k >= 1) { spk.splice(i, 1); continue; } const x = cx + Math.cos(p.a) * p.r, y = cy - 24 + Math.sin(p.a) * p.r * 0.7 - k * 22; g.globalAlpha = Math.sin(k * Math.PI); g.fillStyle = '#fff'; g.beginPath(); star(g, x, y, p.sz); g.fill(); g.globalAlpha = 1; }
      }
      f += 1; requestAnimationFrame(loop);
    }
    loop();
  }

  function showGenesisComplete() { $('gover').style.display = 'flex'; }

  // ---------- milestone fanfare + live mint ticker ----------
  const capW = s => (s || '').charAt(0).toUpperCase() + (s || '').slice(1);
  function screenFireworks(n) {
    for (let i = 0; i < n; i++) setTimeout(() => {
      const ox = state.me.x + (Math.random() - 0.5) * VW * 0.85;
      const oy = state.me.y + (Math.random() - 0.5) * VH * 0.7;
      pinataBurst(ox, oy, 20);
    }, i * 55);
  }
  function bloodMoon(ms) { const bm = $('bloodmoon'); if (!bm) return; bm.classList.add('on'); clearTimeout(bloodMoon._t); bloodMoon._t = setTimeout(() => bm.classList.remove('on'), ms); }
  function showMilestone(m) {
    const el = $('milestone'), big = $('msBig'), small = $('msSmall'); if (!el) return;
    el.classList.toggle('chapter', m.kind === 'chapter');
    if (m.kind === 'tier') { big.textContent = m.count.toLocaleString() + ' MINTED!'; small.textContent = m.left.toLocaleString() + ' of 10,000 still to catch'; snd('fanfare'); screenFireworks(18); }
    else if (m.kind === 'grand') { big.textContent = m.count.toLocaleString() + ' MINTED! 🎆'; small.textContent = m.left.toLocaleString() + ' Genesis remain'; snd('grand'); screenFireworks(42); }
    else if (m.kind === 'chapter') { big.textContent = 'CHAPTER ' + Math.round(m.count / 2500) + ' · BLOOD MOON'; small.textContent = 'The bosses rise… survive the hunt'; snd('chapter'); bloodMoon(30000); mon('yeti'); screenFireworks(14); }
    else if (m.kind === 'rarity') { big.textContent = 'ONLY ' + m.left + ' ' + m.rarity.toUpperCase() + ' LEFT'; small.textContent = 'They\'re nearly gone — hunt fast'; snd('fanfare'); }
    else return;
    el.classList.add('show');
    clearTimeout(showMilestone._t); showMilestone._t = setTimeout(() => el.classList.remove('show'), m.kind === 'chapter' ? 5200 : 3800);
  }
  // live mint ticker
  const ticks = []; let tickerX = null; const tickerInner = $('tickerInner');
  function addTicker(hero) {
    if (!tickerInner || !hero) return;
    const col = (RCOL[hero.rarity] || {}).main || '#9fb0cc';
    let who = hero.minter || 'someone';
    who = who.startsWith('0x') ? who.slice(0, 6) + '…' + who.slice(-4) : who.slice(0, 14).replace(/[<>]/g, '');
    ticks.push('<span><b>' + who + '</b> minted a <span style="color:' + col + '">' + capW(hero.rarity) + ' ' + capW(hero.type) + '</span> ⚔</span>');
    if (ticks.length > 24) ticks.shift();
    tickerInner.innerHTML = ticks.join('');
    if (tickerX === null) { tickerX = VW; runTicker(); }
  }
  function runTicker() {
    tickerX -= 1.1; tickerInner.style.transform = 'translateX(' + tickerX + 'px)';
    if (tickerX < -tickerInner.offsetWidth) tickerX = VW;
    requestAnimationFrame(runTicker);
  }

  // ---------- Multi-capture chooser ----------
  let chooserToken = 0;
  function showChooser(options) {
    const my = ++chooserToken;
    const wrap = $('chooserOpts'); wrap.innerHTML = '';
    $('chooser').style.display = 'flex'; // must be set before the option loops start
    options.forEach(o => {
      const c = RCOL[o.rarity] || RCOL.green;
      const opt = document.createElement('div'); opt.className = 'opt'; opt.style.borderColor = c.dark;
      const cv = document.createElement('canvas'); cv.width = 140; cv.height = 104;
      const g = cv.getContext('2d');
      let f = 0;
      (function loop() {
        if (chooserToken !== my || $('chooser').style.display !== 'flex') return;
        g.clearRect(0, 0, 140, 104); g.save(); g.translate(70, 66); drawEnemy(g, o.type, o.rarity, f, 1.9, true, 1, o.nftId % 5, badgeOf(o.nftId)); g.restore();
        f++; requestAnimationFrame(loop);
      })();
      const on = document.createElement('div'); on.className = 'on'; on.style.color = c.main; on.textContent = o.name;
      const or = document.createElement('div'); or.className = 'or'; or.textContent = RARITY_LABEL[o.rarity];
      opt.appendChild(cv); opt.appendChild(on); opt.appendChild(or);
      opt.onclick = () => { send({ t: 'claim_pick', nftId: o.nftId }); chooserToken++; $('chooser').style.display = 'none'; };
      wrap.appendChild(opt);
    });
  }

  // ================= INTRO / POOL SELECT =================
  const ENEMY_PREVIEW = { 'primordial-ooze':'orc', 'fairy-lake':'unicorn', 'dungeon-dam':'robot', 'ravens-nest':'dragon', 'creature-swamp':'orc', 'babblin-brook':'unicorn' };
  const PREVIEW_RAR = { 'primordial-ooze':'green', 'fairy-lake':'diamond', 'dungeon-dam':'ruby', 'ravens-nest':'gold', 'creature-swamp':'ruby', 'babblin-brook':'green' };
  const PREVIEW_HOOD = { 'primordial-ooze':'#6ee06e', 'fairy-lake':'#8fd7ff', 'dungeon-dam':'#ff9e4a', 'ravens-nest':'#b98bff', 'creature-swamp':'#c2d67a', 'babblin-brook':'#57e0d0' };
  const grid = $('poolGrid');
  POOLS.forEach(pool => {
    const th = THEMES[pool];
    const card = document.createElement('div'); card.className = 'pool';
    const cv = document.createElement('canvas'); cv.width = 220; cv.height = 150; card.appendChild(cv);
    const pn = document.createElement('div'); pn.className = 'pn'; pn.textContent = th.label; card.appendChild(pn);
    const pc = document.createElement('div'); pc.className = 'pc'; pc.textContent = '0 here'; card.appendChild(pc);
    card.dataset.pool = pool; card._pc = pc;
    grid.appendChild(card);
    // preview
    const g = cv.getContext('2d');
    const bg = g.createLinearGradient(0, 0, 0, 150); bg.addColorStop(0, th.bg[0]); bg.addColorStop(1, th.bg[1]);
    g.fillStyle = bg; g.fillRect(0, 0, 220, 150);
    g.fillStyle = th.liquid; g.globalAlpha = .5; g.beginPath(); g.ellipse(110, 95, 70, 34, 0, 0, 7); g.fill(); g.globalAlpha = 1;
    g.save(); g.translate(80, 96); drawEnemy(g, ENEMY_PREVIEW[pool], PREVIEW_RAR[pool], 8, 1.5, false, 1, POOLS.indexOf(pool) % 5, POOLS.indexOf(pool) % 7); g.restore();
    g.save(); g.translate(148, 100); drawHood(g, PREVIEW_HOOD[pool], -0.4, 8, true, false, false, 1.4); g.restore();
    card.addEventListener('click', () => choosePool(pool));
  });
  function pickName() { const v = $('nameInput').value.trim(); if (v) { state.name = v.slice(0,16); localStorage.setItem('hood_name', state.name); } }
  $('nameInput').value = (state.name === 'HOOD' ? '' : state.name);

  // ---------- Wallet (Robinhood Chain — Arbitrum L2) ----------
  const RH_CHAIN = { chainId: '0x1237', chainName: 'Robinhood Chain', nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }, rpcUrls: ['https://rpc.mainnet.chain.robinhood.com'], blockExplorerUrls: ['https://robinhoodchain.blockscout.com'] };
  const shortAddr = a => a.slice(0, 6) + '…' + a.slice(-4);
  // pick the best injected provider (prefer MetaMask if several wallets are present)
  let WEB3 = null;
  function getProvider() {
    const eth = window.ethereum; if (!eth) return null;
    if (eth.providers && eth.providers.length) return eth.providers.find(p => p.isMetaMask) || eth.providers[0];
    return eth;
  }
  const inIframe = (() => { try { return window.self !== window.top; } catch (e) { return true; } })();
  function openInTab() { try { window.open(location.href, '_blank', 'noopener'); } catch (e) {} }
  const wStatus = (msg, col) => { const w = $('walletStatus'); if (w) { w.style.color = col || '#8fd7ff'; w.textContent = msg; } toast(msg); }; // toast too — visible in-game (spectator connect)

  async function connectWallet() {
    const eth = getProvider();
    if (!eth) {
      if (inIframe) { wStatus('↗ Open the game in its own browser tab to connect a wallet…', '#ffd447'); openInTab(); }
      else wStatus('No wallet found — install MetaMask, or tap “Watch as Spectator”.', '#ff9a4a');
      return null;
    }
    WEB3 = eth;
    wStatus('🦊 Check your wallet — approve the connection (open the MetaMask extension if it doesn’t pop up)…', '#ffd447');
    try {
      const accts = await eth.request({ method: 'eth_requestAccounts' });
      const addr = accts && accts[0];
      if (!addr) { wStatus('Unlock your wallet, then tap Connect again.', '#ff9a4a'); return null; }
      state.wallet = addr; state.pid = addr.toLowerCase(); localStorage.setItem('hood_pid', state.pid);
      // pre-warm so the mint later fires instantly within the click gesture (wallet auto-pops):
      try { await eth.request({ method: 'wallet_addEthereumChain', params: [RH_CHAIN] }); } catch (e) {}
      try { await eth.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: RH_CHAIN.chainId }] }); } catch (e) {}
      ensureEthers().catch(() => {});           // preload the ethers lib now, not at mint time
      state.mode = 'play';
      wStatus('✓ Connected ' + shortAddr(addr) + ' — choose a spawning pool ↓', '#7CFC7C');
      $('connectBtn').textContent = '✓ ' + shortAddr(addr);
      $('nameBar').style.display = 'flex';
      $('poolHead').textContent = 'Choose your spawning pool';
      if (addr.toLowerCase() === OWNER_ADDR.toLowerCase()) { $('adminDeployBtn').style.display = 'block'; $('adminPricesBtn').style.display = 'block'; }
      return addr;
    } catch (e) {
      const code = e && e.code;
      if (code === -32002) wStatus('🦊 A connect request is already open — click the MetaMask icon in your browser toolbar to approve it.', '#ffd447');
      else if (code === 4001) wStatus('Connection rejected — tap Connect to try again.', '#ff9a4a');
      else if (inIframe) { wStatus('Wallet is blocked inside the embedded view — opening the game in a new tab…', '#ffd447'); openInTab(); }
      else wStatus('⚠ ' + ((e && (e.message || e)) || 'could not connect') + ' — is MetaMask unlocked?', '#ff9a4a');
      return null;
    }
  }
  $('connectBtn').addEventListener('click', connectWallet);

  // ---------- Owner console: one-click contract deploy ----------
  const OWNER_ADDR = '0x1dCFc1970C138B6a05C2Ada5Bb3C2c6730f319dD';
  let deployCfg = null, ethersReady = null, dpChain = '46630';
  const dp = id => $(id), setDp = html => { const s = $('dpStatus'); if (s) s.innerHTML = html; };
  function ensureEthers() {
    if (window.ethers) return Promise.resolve();
    if (ethersReady) return ethersReady;
    ethersReady = new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'vendor/ethers.min.js'; s.onload = res; s.onerror = () => rej(new Error('failed to load ethers')); document.head.appendChild(s); });
    return ethersReady;
  }
  const fmtEth = wei => { try { return (Number(BigInt(wei) / 10n ** 9n) / 1e9).toFixed(5).replace(/0+$/, '').replace(/\.$/, ''); } catch (e) { return '?'; } };
  async function openDeployModal() {
    $('deployModal').classList.add('show'); setDp('Loading deploy config…');
    try {
      if (!deployCfg) deployCfg = await fetch('api/deploy/config').then(r => r.json());
      if (deployCfg.error) { setDp('⚠ ' + deployCfg.error); return; }
      $('dpOwner').textContent = shortAddr(deployCfg.args.initialOwner);
      const t = deployCfg.args.tierPrice, u = deployCfg.tiersUsd;
      $('dpTiers').innerHTML = 'FREE · $' + u[1] + '≈' + fmtEth(t[1]) + 'Ξ · $' + u[2] + '≈' + fmtEth(t[2]) + 'Ξ · $' + u[3] + '≈' + fmtEth(t[3]) + 'Ξ · $' + u[4] + '≈' + fmtEth(t[4]) + 'Ξ';
      const saved = deployCfg.saved || {};
      if (saved.contract_mainnet || saved.contract_testnet) {
        setDp('Already deployed: ' + (saved.contract_mainnet ? 'mainnet <span class=mono>' + shortAddr(saved.contract_mainnet) + '</span> ' : '') + (saved.contract_testnet ? 'testnet <span class=mono>' + shortAddr(saved.contract_testnet) + '</span>' : '') + '. Deploying again replaces it.');
      } else setDp('');
    } catch (e) { setDp('⚠ ' + e.message); }
  }
  async function deployContract() {
    const cid = dpChain, chain = deployCfg.chains[cid], a = deployCfg.args;
    const btn = $('dpDeployBtn'); btn.disabled = true;
    try {
      setDp('Loading libraries…'); await ensureEthers();
      setDp('Switching wallet to ' + chain.name + '…');
      try { await window.ethereum.request({ method: 'wallet_addEthereumChain', params: [{ chainId: chain.hex, chainName: chain.name, nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }, rpcUrls: [chain.rpc], blockExplorerUrls: [chain.explorer] }] }); } catch (e) {}
      try { await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: chain.hex }] }); } catch (e) { setDp('⚠ Please switch your wallet to ' + chain.name + ' and retry.'); btn.disabled = false; return; }
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const factory = new ethers.ContractFactory(a.abi || deployCfg.abi, deployCfg.bytecode, signer);
      setDp('✍️ Confirm the deployment in your wallet…');
      const c = await factory.deploy(a.initialOwner, a.minterSigner, a.tierPrice, a.baseURI, a.contractURI, a.royaltyReceiver, a.royaltyBps);
      const tx = c.deploymentTransaction();
      setDp('⏳ Deploying… <span class=mono>' + tx.hash.slice(0, 10) + '…</span><br>waiting for the block to mine');
      await c.waitForDeployment();
      const addr = await c.getAddress();
      setDp('🔎 Verifying on-chain & saving…');
      const r = await fetch('api/deploy/confirm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ txHash: tx.hash, chainId: cid }) }).then(r => r.json());
      if (r.ok) { setDp('✅ <b>Live on ' + chain.name + '!</b><br><span class=mono>' + addr + '</span><br><a href="' + r.explorer + '" target="_blank">View on explorer ↗</a>'); snd('mint'); }
      else setDp('Deployed at <span class=mono>' + addr + '</span> but auto-save said: ' + (r.error || '?') + '. It\'s live on-chain — re-open to retry save.');
    } catch (e) {
      const msg = (e && (e.info?.error?.message || e.shortMessage || e.message)) || 'deploy failed';
      setDp('⚠ ' + msg);
    } finally { btn.disabled = false; }
  }
  (function wireDeploy() {
    const ab = $('adminDeployBtn'); if (ab) ab.addEventListener('click', openDeployModal);
    const cb = $('dpCloseBtn'); if (cb) cb.addEventListener('click', () => $('deployModal').classList.remove('show'));
    const db = $('dpDeployBtn'); if (db) db.addEventListener('click', deployContract);
    document.querySelectorAll('.dpNetBtn').forEach(b => b.addEventListener('click', () => {
      document.querySelectorAll('.dpNetBtn').forEach(x => x.classList.remove('active'));
      b.classList.add('active'); dpChain = b.dataset.cid;
      const mainnet = dpChain === '4663', note = $('dpNote');
      note.classList.toggle('warn', mainnet);
      note.innerHTML = mainnet
        ? '🚀 <b>MAINNET — this is the real launch.</b> Deploying here makes SPAWNHOOD Genesis live for real ETH. Do a testnet run first if you haven\'t. Your wallet pays gas; no key touches our server.'
        : 'Your connected wallet deploys the contract and pays gas. No key ever touches our server. After it mines, the address is verified on-chain and saved automatically.';
    }));
  })();

  // ---------- Owner console: update tier prices ----------
  let pricesCfg = null;
  const setPr = html => { const s = $('prStatus'); if (s) s.innerHTML = html || ''; };
  const weiBig = w => { try { return BigInt(w); } catch (e) { return 0n; } };
  const priceLabel = (wei) => {
    const bn = weiBig(wei); if (bn === 0n) return 'FREE';
    const eth = +ethers.formatEther(bn);
    const usd = (pricesCfg && pricesCfg.ethUsd) ? ' (~$' + (eth * pricesCfg.ethUsd).toFixed(2) + ')' : '';
    return eth.toFixed(4) + ' Ξ' + usd;
  };
  async function openPricesModal() {
    $('pricesModal').classList.add('show'); setPr('Loading live prices…');
    try {
      await ensureEthers();
      pricesCfg = await fetch('api/prices/config').then(r => r.json());
      if (!pricesCfg.address) { setPr('⚠ No deployed contract found — deploy first.'); return; }
      const t = pricesCfg.tierPrice;
      $('pr1').textContent = priceLabel(t[1]);   // 100–199
      $('pr2').textContent = priceLabel(t[2]);   // 200–299
      $('pr3').textContent = priceLabel(t[3]);   // 300–399
      $('pr4').textContent = priceLabel(t[4]);   // 400+
      setPr('ETH rate: $' + Math.round(pricesCfg.ethUsd));
    } catch (e) { setPr('⚠ ' + e.message); }
  }
  async function updatePrices() {
    if (!pricesCfg || !pricesCfg.address) return;
    const btn = $('prApplyBtn'); btn.disabled = true;
    try {
      setPr('Loading…'); await ensureEthers();
      const eth = WEB3 || window.ethereum;
      const targetHex = (pricesCfg.chainHex || '').toLowerCase();
      let cur = null; try { cur = (await eth.request({ method: 'eth_chainId' })).toLowerCase(); } catch (e) {}
      if (targetHex && cur !== targetHex) await ensureChain(pricesCfg.chainId);
      const signer = await new ethers.BrowserProvider(eth).getSigner();
      const c = new ethers.Contract(pricesCfg.address, ['function setTierPrices(uint256[5] p)'], signer);
      setPr('✍️ Confirm the price update in your wallet…');
      const tx = await c.setTierPrices(pricesCfg.tierPrice);
      setPr('⏳ Updating… <span class="mono">' + tx.hash.slice(0, 12) + '…</span>');
      await tx.wait();
      const t = pricesCfg.tierPrice;
      const anyPaid = t.some(w => weiBig(w) > 0n);
      const ladderStr = !anyPaid ? 'Every mint is now FREE (players pay only gas)'
        : pricesCfg.bands.slice(1).map((b, i) => b + ' ' + (weiBig(t[i + 1]) === 0n ? 'FREE' : (+ethers.formatEther(weiBig(t[i + 1]))).toFixed(4) + ' Ξ')).join(' · ');
      setPr('✅ <b>Prices updated on-chain!</b><br>' + ladderStr); snd('mint');
    } catch (e) {
      const msg = (e && (e.info?.error?.message || e.shortMessage || e.message)) || 'update failed';
      setPr('⚠ ' + msg);
    } finally { btn.disabled = false; }
  }
  (function wirePrices() {
    const pb = $('adminPricesBtn'); if (pb) pb.addEventListener('click', openPricesModal);
    const cb = $('prCloseBtn'); if (cb) cb.addEventListener('click', () => $('pricesModal').classList.remove('show'));
    const ap = $('prApplyBtn'); if (ap) ap.addEventListener('click', updatePrices);
  })();
  $('spectateBtn').addEventListener('click', () => {
    state.mode = 'spectate';
    $('walletStatus').style.color = '#8fd7ff';
    $('walletStatus').textContent = '👁 Spectator mode — pick a pool to watch the action';
    $('poolHead').textContent = 'Pick a pool to spectate';
  });
  function choosePool(pool) {
    snd('blip');
    if (state.mode === 'play') return startGame(pool);
    if (state.mode === 'spectate') return spectate(pool);
    toast('Connect a wallet to play — or tap “Watch as Spectator”.');
  }
  // audio mute toggle
  (function () {
    const mb = $('muteBtn'); if (!mb) return;
    const upd = () => { mb.textContent = (window.SND && SND.muted) ? '🔇' : '🔊'; };
    mb.addEventListener('click', (e) => { e.stopPropagation(); if (window.SND) { SND.toggleMute(); if (!SND.muted && state.pool) SND.playMusic(state.pool); } upd(); });
    upd();
  })();
  function enterPool(pool, asSpectator) {
    state.pool = pool; state.spectator = asSpectator;
    state.me.x = WORLD.w / 2; state.me.y = WORLD.h / 2;
    document.body.classList.toggle('spectating', asSpectator);
    $('intro').classList.add('hidden'); $('hud').classList.remove('hidden');
    $('specBar').classList.toggle('hidden', !asSpectator);
    if (asSpectator) $('specPool').textContent = '· ' + THEMES[pool].label;
    state.decor = buildDecor(pool); initAmbient(); updateGenUI();
    try { window.SND && SND.playMusic(pool); } catch (e) {}
    if (state.joined && ws && ws.readyState === 1) {
      send(asSpectator ? { t: 'spectate', pool } : (state.wasSpectator ? { t: 'join', pid: state.pid, name: state.name, pool } : { t: 'switchPool', pool }));
    } else { state.joined = true; connect(); }
    state.wasSpectator = asSpectator;
  }
  function startGame(pool) { pickName(); enterPool(pool, false); }
  function spectate(pool) { enterPool(pool, true); }

  // spectator → connect wallet and drop into play in the same pool
  $('specConnect').addEventListener('click', async () => {
    const addr = await connectWallet(); if (!addr) return;
    state.spectator = false; document.body.classList.remove('spectating'); $('specBar').classList.add('hidden');
    state.me.x = WORLD.w / 2; state.me.y = WORLD.h / 2;
    send({ t: 'join', pid: state.pid, name: state.name, pool: state.pool });
    toast('Wallet connected — you\'re in!');
  });

  $('poolBtn').addEventListener('click', () => {
    // change pool: back to intro (keeps ws; re-pick will switch/spectate)
    $('intro').classList.remove('hidden'); refreshStats();
  });

  // stats for intro
  async function refreshStats() {
    try {
      const s = await fetch('api/stats').then(r => r.json());
      $('introGen').textContent = (s.genesisMinted || 0).toLocaleString(); $('gnum').textContent = (s.genesisMinted || 0).toLocaleString();
      const counts = s.counts || {};
      document.querySelectorAll('.pool').forEach(card => { const n = counts[card.dataset.pool] || 0; card._pc.textContent = n + ' here'; });
      if (s.genesisComplete) showGenesisComplete();
    } catch (e) {}
  }
  // social share
  (function () {
    const url = 'https://spawnhood.com/';
    const text = 'Catch to mint in SPAWNHOOD Genesis ⚔️🔶 — chase creatures out of the spawning pools and mint 1 of 10,000. Art inscribed on Bitcoin, token on Robinhood Chain.';
    const sx = $('shareX');
    if (sx) sx.href = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent(url) + '&via=Spawntoshi&hashtags=SPAWNHOOD,Ordinals,NFT';
    const cl = $('copyLink');
    if (cl) cl.addEventListener('click', () => { try { navigator.clipboard.writeText(url); } catch (e) {} cl.textContent = '✓ Copied!'; setTimeout(() => cl.textContent = '🔗 Copy link', 1500); });
  })();
  refreshStats(); setInterval(() => { if (!$('intro').classList.contains('hidden')) refreshStats(); }, 4000);
})();
