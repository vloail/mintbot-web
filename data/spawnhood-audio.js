/* SPAWNHOOD — procedural audio engine (Web Audio, no asset files).
   Per-pool music loops + quirky gameplay SFX + distinct boss roars. */
(() => {
  'use strict';
  let ctx = null, master = null, musicGain = null, sfxGain = null;
  let muted = localStorage.getItem('snd_muted') === '1';
  let curPool = null, seqTimer = null, step = 0, padOscs = [];

  function init() {
    if (ctx) return;
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    master = ctx.createGain(); master.gain.value = muted ? 0 : 0.9; master.connect(ctx.destination);
    musicGain = ctx.createGain(); musicGain.gain.value = 0.34; musicGain.connect(master);
    sfxGain = ctx.createGain(); sfxGain.gain.value = 0.9; sfxGain.connect(master);
  }
  function resume() { if (ctx && ctx.state === 'suspended') ctx.resume(); }
  const now = () => ctx.currentTime;

  // ---- low-level voices ----
  function tone(freq, t0, dur, type, peak, dest) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(peak, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0008, t0 + dur);
    o.connect(g); g.connect(dest || sfxGain); o.start(t0); o.stop(t0 + dur + 0.02);
    return o;
  }
  function noise(t0, dur, peak, filterType, filterFreq, dest) {
    const n = Math.floor(ctx.sampleRate * dur), buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = buf;
    const g = ctx.createGain(); g.gain.setValueAtTime(peak, t0); g.gain.exponentialRampToValueAtTime(0.0008, t0 + dur);
    let node = src;
    if (filterType) { const f = ctx.createBiquadFilter(); f.type = filterType; f.frequency.value = filterFreq || 1000; src.connect(f); node = f; }
    node.connect(g); g.connect(dest || sfxGain); src.start(t0); src.stop(t0 + dur);
    return { src, g };
  }
  function slide(f0, f1, t0, dur, type, peak, dest) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sawtooth'; o.frequency.setValueAtTime(f0, t0); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t0 + dur);
    g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(peak, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0008, t0 + dur);
    o.connect(g); g.connect(dest || sfxGain); o.start(t0); o.stop(t0 + dur + 0.02);
    return o;
  }

  // ---- per-pool music ----
  const N = f => f; // freq helper
  const POOLS = {
    'primordial-ooze': { root: 110, scale: [0, 3, 5, 7, 10], tempo: 340, wave: 'sine', pad: 'sine', jump: 0.35, oct: 1 },
    'fairy-lake':      { root: 262, scale: [0, 2, 4, 7, 9], tempo: 240, wave: 'triangle', pad: 'triangle', jump: 0.55, oct: 1 },
    'dungeon-dam':     { root: 98,  scale: [0, 2, 3, 7, 8], tempo: 300, wave: 'square', pad: 'sawtooth', jump: 0.4, oct: 1 },
    'ravens-nest':     { root: 146, scale: [0, 1, 5, 6, 10], tempo: 380, wave: 'triangle', pad: 'sine', jump: 0.3, oct: 1 },
    'creature-swamp':  { root: 130, scale: [0, 3, 5, 6, 10], tempo: 260, wave: 'sine', pad: 'triangle', jump: 0.5, oct: 1 },
    'babblin-brook':   { root: 294, scale: [0, 2, 4, 5, 9], tempo: 200, wave: 'triangle', pad: 'sine', jump: 0.6, oct: 1 },
  };
  function noteAt(cfg, deg) { return cfg.root * Math.pow(2, (cfg.scale[((deg % cfg.scale.length) + cfg.scale.length) % cfg.scale.length] + 12 * Math.floor(deg / cfg.scale.length)) / 12); }

  function startPad(cfg) {
    stopPad();
    [0, 7].forEach((iv, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = cfg.pad; o.frequency.value = cfg.root * Math.pow(2, iv / 12) / 2;
      const lfo = ctx.createOscillator(), lg = ctx.createGain();
      lfo.frequency.value = 0.12 + i * 0.05; lg.gain.value = 0.03; lfo.connect(lg); lg.connect(g.gain);
      g.gain.value = 0.05; o.connect(g); g.connect(musicGain); o.start(); lfo.start();
      padOscs.push(o, lfo);
    });
  }
  function stopPad() { padOscs.forEach(o => { try { o.stop(); } catch (e) {} }); padOscs = []; }

  let melDeg = 0;
  function tickSeq() {
    if (!ctx || muted) return;
    const cfg = POOLS[curPool]; if (!cfg) return;
    const t = now();
    // melody: random walk on the pool's scale
    if (Math.random() < cfg.jump || step % 4 === 0) {
      melDeg += (Math.random() < 0.5 ? 1 : -1) * (1 + (Math.random() < 0.3 ? 1 : 0));
      if (melDeg > 9) melDeg = 6; if (melDeg < 0) melDeg = 2;
      const f = noteAt(cfg, melDeg) * cfg.oct;
      tone(f, t, cfg.tempo / 1000 * 1.6, cfg.wave, 0.16, musicGain);
    }
    // bass on the downbeat
    if (step % 4 === 0) tone(cfg.root / 2, t, cfg.tempo / 1000 * 3, 'sine', 0.18, musicGain);
    // gentle blip percussion
    if (step % 2 === 1) noise(t, 0.04, 0.05, 'highpass', 4000, musicGain);
    step++;
  }
  function playMusic(pool) {
    if (!ctx) return; curPool = pool; step = 0; melDeg = 3;
    const cfg = POOLS[pool]; if (!cfg) return;
    if (seqTimer) clearInterval(seqTimer);
    startPad(cfg);
    seqTimer = setInterval(tickSeq, cfg.tempo);
  }
  function stopMusic() { if (seqTimer) { clearInterval(seqTimer); seqTimer = null; } stopPad(); curPool = null; }

  // ---- SFX ----
  const SFX = {
    swing() { const t = now(); noise(t, 0.14, 0.16, 'bandpass', 1800, sfxGain); slide(520, 220, t, 0.14, 'sawtooth', 0.05); },
    hit() { // springy cartoon "boing!"
      const t = now(), o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(760, t);
      o.frequency.exponentialRampToValueAtTime(150, t + 0.16);
      o.frequency.exponentialRampToValueAtTime(240, t + 0.26);
      const lfo = ctx.createOscillator(), lg = ctx.createGain();
      lfo.type = 'sine'; lfo.frequency.value = 24; lg.gain.value = 55; lfo.connect(lg); lg.connect(o.frequency);
      g.gain.setValueAtTime(0.001, t); g.gain.linearRampToValueAtTime(0.22, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0008, t + 0.33);
      o.connect(g); g.connect(sfxGain); o.start(t); lfo.start(t); o.stop(t + 0.35); lfo.stop(t + 0.35);
    },
    capture() { const t = now(); [0, 4, 7, 12].forEach((iv, i) => tone(440 * Math.pow(2, iv / 12), t + i * 0.06, 0.18, 'triangle', 0.16)); noise(t, 0.3, 0.05, 'highpass', 6000); },
    mint() { const t = now(); [0, 4, 7, 11, 12].forEach((iv, i) => tone(523 * Math.pow(2, iv / 12), t + i * 0.07, 0.5, 'triangle', 0.18)); for (let i = 0; i < 6; i++) tone(1800 + Math.random() * 1500, t + 0.1 + Math.random() * 0.4, 0.12, 'sine', 0.06); },
    explode() { const t = now(); noise(t, 0.35, 0.4, 'lowpass', 900); slide(220, 40, t, 0.4, 'sawtooth', 0.2); slide(400, 60, t, 0.25, 'square', 0.1); },
    poof() { const t = now(); noise(t, 0.25, 0.18, 'bandpass', 1200); slide(200, 700, t, 0.25, 'sine', 0.06); },
    spawn() { const t = now(); slide(180, 520, t, 0.18, 'sine', 0.12); tone(660, t + 0.12, 0.12, 'triangle', 0.08); },
    blip() { const t = now(); tone(880, t, 0.07, 'square', 0.09); },
    chomp() { const t = now(); noise(t, 0.08, 0.3, 'lowpass', 700); noise(t + 0.1, 0.08, 0.28, 'lowpass', 600); slide(300, 90, t, 0.18, 'sawtooth', 0.14); },
    warn() { const t = now(); tone(180, t, 0.18, 'square', 0.14); tone(140, t + 0.2, 0.22, 'square', 0.14); },
    powerup() { const t = now(); [0, 4, 7, 12, 16].forEach((iv, i) => tone(523 * Math.pow(2, iv / 12), t + i * 0.05, 0.24, 'triangle', 0.15)); for (let i = 0; i < 8; i++) tone(2000 + Math.random() * 1800, t + 0.1 + Math.random() * 0.3, 0.1, 'sine', 0.05); },
    fanfare() { // triumphant brass tier fanfare
      const t = now(), r = 392; // G
      [[0, 0.14], [0, 0.14], [4, 0.14], [7, 0.34]].forEach((s, i) => { const st = t + i * 0.14; [0, 12].forEach(o => tone(r * Math.pow(2, (s[0] + o) / 12), st, s[1] + 0.05, 'sawtooth', 0.12)); });
      tone(r / 2, t, 0.7, 'triangle', 0.14); noise(t + 0.55, 0.3, 0.05, 'highpass', 6000);
      for (let i = 0; i < 6; i++) tone(1600 + Math.random() * 1600, t + 0.55 + Math.random() * 0.3, 0.12, 'sine', 0.05);
    },
    grand() { // big every-1000 celebration — rising run + sparkle + boom
      const t = now(), r = 523;
      [0, 2, 4, 7, 9, 12, 16, 19].forEach((iv, i) => tone(r * Math.pow(2, iv / 12), t + i * 0.06, 0.5, 'triangle', 0.16));
      [0, 4, 7, 12].forEach(iv => { tone(r * Math.pow(2, iv / 12), t + 0.55, 0.9, 'sawtooth', 0.1); });
      tone(r / 4, t + 0.5, 1.0, 'sine', 0.2); noise(t + 0.5, 0.5, 0.28, 'lowpass', 700);
      for (let i = 0; i < 16; i++) tone(2000 + Math.random() * 2500, t + 0.6 + Math.random() * 0.7, 0.14, 'sine', 0.05);
    },
    chapter() { // ominous blood-moon boss-rush knell
      const t = now();
      slide(140, 70, t, 1.4, 'sawtooth', 0.2); tone(46, t, 1.6, 'sine', 0.22);
      [0, 0.5, 1.0].forEach(d => { tone(110, t + d, 0.5, 'square', 0.12); tone(116, t + d, 0.5, 'square', 0.1); }); // dissonant bell tolls
      noise(t, 1.6, 0.14, 'lowpass', 400);
      slide(600, 120, t + 0.2, 0.9, 'sawtooth', 0.08);
    },
  };

  // ---- distinct boss roars ----
  function monster(kind) {
    if (!ctx || muted) return; const t = now();
    if (kind === 'lizard') { // hiss + screech
      noise(t, 0.5, 0.22, 'highpass', 3000);
      slide(300, 1400, t, 0.18, 'sawtooth', 0.14); slide(1400, 500, t + 0.18, 0.3, 'sawtooth', 0.14);
      slide(90, 60, t, 0.5, 'square', 0.1);
    } else if (kind === 'robot') { // mechanical warble + beeps
      const o = ctx.createOscillator(), g = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain();
      o.type = 'square'; o.frequency.value = 150; lfo.type = 'square'; lfo.frequency.value = 18; lg.gain.value = 80;
      lfo.connect(lg); lg.connect(o.frequency); g.gain.setValueAtTime(0.16, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
      o.connect(g); g.connect(sfxGain); o.start(t); lfo.start(t); o.stop(t + 0.72); lfo.stop(t + 0.72);
      [880, 660, 990].forEach((f, i) => tone(f, t + 0.5 + i * 0.09, 0.1, 'square', 0.1));
    } else { // yeti — low roar
      slide(70, 130, t, 0.5, 'sawtooth', 0.22); slide(130, 55, t + 0.45, 0.5, 'sawtooth', 0.2);
      noise(t, 0.9, 0.16, 'lowpass', 500);
      tone(48, t, 0.9, 'sine', 0.18);
    }
  }

  function setMuted(m) { muted = m; localStorage.setItem('snd_muted', m ? '1' : '0'); if (master) master.gain.value = m ? 0 : 0.9; }
  function toggleMute() { setMuted(!muted); return muted; }

  window.SND = {
    init, resume,
    playMusic(pool) { init(); resume(); playMusic(pool); },
    stopMusic,
    sfx(name) { if (!ctx || muted || !SFX[name]) return; try { SFX[name](); } catch (e) {} },
    monster,
    toggleMute, setMuted, get muted() { return muted; },
  };
  // unlock audio on any gesture (browsers require it)
  ['pointerdown', 'keydown', 'touchstart'].forEach(ev => window.addEventListener(ev, () => { init(); resume(); }, { once: false }));
})();
