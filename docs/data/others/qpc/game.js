/* 湯けむりの隠れ家からの脱出：ゲーム本体（ティラノのシナリオから G.xxx を呼ぶ） */
(function () {
  'use strict';
  const G = window.G = window.G || {};
  const L = window.QPCLogic, SL = window.QPCSlides;
  const K = () => window.TYRANO.kag;
  const BASE = './data/others/qpc/';
  const IMG = './data/image/qpc/';
  const $q = s => document.querySelector(s);
  function el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function btn(text, fn, cls) {
    const b = el('button', 'qb ' + (cls || ''), text);
    b.addEventListener('click', ev => { ev.stopPropagation(); fn(ev); });
    return b;
  }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- 素材の復元（難読化した .dat → Blob URL） ---------- */
  function decode(buf) {
    const u = new Uint8Array(buf);
    if (u[0] !== 81 || u[1] !== 80 || u[2] !== 67 || u[3] !== 49) throw new Error('bad asset');
    const n = u.length - 4, o = new Uint8Array(n);
    let x = 0x2026A5C3 >>> 0;
    for (let i = 0; i < n; i++) {
      x = (x ^ (x << 13)) >>> 0; x = (x ^ (x >>> 17)) >>> 0; x = (x ^ (x << 5)) >>> 0;
      o[i] = u[i + 4] ^ (x & 255);
    }
    return o;
  }
  const cache = {};
  G.asset = function (name, type) {
    if (!cache[name]) {
      cache[name] = fetch(BASE + 'a/' + name + '.dat')
        .then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
        .then(b => URL.createObjectURL(new Blob([decode(b)], { type: type || (name[0] === 'b' ? 'audio/mpeg' : 'image/png') })));
    }
    return cache[name];
  };
  function fillAssets(root) {
    root.querySelectorAll('img[data-asset]').forEach(img => G.asset(img.dataset.asset).then(u => { img.src = u; }));
  }

  /* ---------- 状態 ---------- */
  function fresh() {
    return {
      step: 0, order: '', memory: false, used: {}, ending: '',
      f: { photo: false, db: false, detox: false, solved: false, resolved: false },
      react: { nks: 0, yugo: 0, bomb: 0, ball: 0 }, outCount: 0, sysSeen: false, pwHint: false, hints: {}
    };
  }
  G.s = fresh();
  G.sys = ['', '', '', '', '', '', ''];
  G.ev = [];

  /* ---------- 画面の土台 ---------- */
  let stage, slideBox, charaBox, ui, modal, timerEl, skipBtn, cardBox, movieBox, toastBox, headBox;
  G.setup = function () {
    if (G.ready) return;
    G.ready = true;
    const base = document.getElementById('tyrano_base');
    stage = el('div', 'qpc-stage'); stage.id = 'qpc-stage';
    slideBox = el('div', 'qpc-slide'); charaBox = el('div', 'qpc-chara');
    stage.appendChild(slideBox); stage.appendChild(charaBox);
    base.appendChild(stage);
    ui = el('div', 'qpc-ui'); ui.id = 'qpc-ui';
    cardBox = el('div', 'qpc-card'); movieBox = el('div', 'qpc-movie'); headBox = el('div', 'qpc-head');
    toastBox = el('div', 'qpc-toast');
    timerEl = el('div', 'qpc-timer'); timerEl.style.display = 'none';
    skipBtn = btn('スキップ ▶▶', () => openSkip(), 'skip'); skipBtn.style.display = 'none';
    const snd = btn('♪ ON', () => G.mute(!muted), 'snd'); snd.id = 'qpc-snd';
    modal = el('div', 'qpc-modal'); modal.style.display = 'none';
    [cardBox, movieBox, headBox, toastBox, timerEl, skipBtn, snd, modal].forEach(e => ui.appendChild(e));
    base.appendChild(ui);
    try { muted = localStorage.getItem('qpc_mute') === '1'; } catch (e) { /* 使えなくてもよい */ }
    G.mute(muted);
    ['c_yugo', 'c_risa', 'c_nks'].forEach(n => G.asset(n));
    document.addEventListener('pointerdown', () => { if (pendingAudio) { pendingAudio.play().catch(() => {}); pendingAudio = null; } }, true);
  };

  /* ---------- 立ち絵 ---------- */
  const CH = { yugo: 'c_yugo', risa: 'c_risa', nks: 'c_nks' };
  let curChara = '';
  G.chara = function (name, mood) {
    name = name || '';
    if (name === curChara && !mood) return;
    charaBox.querySelectorAll('img').forEach(img => { img.classList.add('out'); setTimeout(() => img.remove(), 250); });
    curChara = name;
    if (!name) return;
    const img = el('img', 'ch ch-' + name + (mood === 'shake' ? ' shake' : ''));
    G.asset(CH[name]).then(u => { if (curChara === name) { img.src = u; charaBox.appendChild(img); } });
  };
  G.vanish = function () {
    const img = charaBox.querySelector('img');
    curChara = '';
    if (img) { img.classList.add('vanish'); setTimeout(() => img.remove(), 2200); }
  };

  /* ---------- LT のスライド ---------- */
  const JPG = { k04: 1, k08: 1, k20: 1, k57: 1 };
  G.slideSrc = id => IMG + (id[0] === 'k' ? 'kai/' : 'lt/') + id + (JPG[id] ? '.jpg' : '.png');
  G.slideHtml = id => /^(lt|k)\d+$/.test(id) ? '<img class="slimg" src="' + G.slideSrc(id) + '">' : '<div class="sl sl-' + id + '">' + (SL[id] || '') + '</div>';
  G.slide = function (id, cls) {
    if (!id) { slideBox.classList.remove('on', 'glitch'); stage.classList.remove('with-slide'); return; }
    slideBox.innerHTML = G.slideHtml(id) + '<div class="cd"></div>';
    slideBox.classList.add('on');
    slideBox.classList.toggle('glitch', cls === 'glitch');
    stage.classList.add('with-slide');
  };
  let cdTimer = null, cdToken = 0;
  G.cd = function (sec) {
    clearInterval(cdTimer);
    const box = slideBox.querySelector('.cd');
    const token = ++cdToken;
    if (!sec || K().stat.is_skip) { if (box) box.textContent = ''; return; }
    let n = sec;
    if (box) box.textContent = n;
    cdTimer = setInterval(() => {
      n--;
      if (box) box.textContent = n > 0 ? n : '';
      if (n <= 0) {
        clearInterval(cdTimer);
        const k = K();
        if (token === cdToken && !k.stat.is_skip && !k.stat.is_adding_text && !k.stat.is_strong_stop && modal.style.display === 'none') k.key_mouse.next();
      }
    }, 1000);
  };

  /* ---------- BGM ---------- */
  let audio = null, bgmName = '', muted = false, pendingAudio = null;
  const VOL = 0.4;
  function fadeOut(a) {
    const t = setInterval(() => { a.volume = Math.max(0, a.volume - 0.05); if (a.volume <= 0.001) { clearInterval(t); a.pause(); } }, 40);
  }
  G.bgm = function (name) {
    name = name || '';
    if (name === bgmName) return;
    bgmName = name;
    if (audio) { fadeOut(audio); audio = null; }
    if (!name) return;
    G.asset('b_' + name, 'audio/mpeg').then(u => {
      if (bgmName !== name) return;
      const a = new Audio(u); a.loop = true; a.volume = muted ? 0 : VOL;
      audio = a; G._audio = a;
      a.play().catch(() => { pendingAudio = a; });
    }).catch(() => {});
  };
  G.mute = function (m) {
    muted = !!m;
    if (audio) audio.volume = muted ? 0 : VOL;
    const b = document.getElementById('qpc-snd'); if (b) b.textContent = muted ? '♪ OFF' : '♪ ON';
    try { localStorage.setItem('qpc_mute', muted ? '1' : '0'); } catch (e) { /* 使えなくてもよい */ }
  };

  /* ---------- 演出 ---------- */
  G.err = function () {
    const e = el('div', 'qpc-err', '<span>⚠ ERROR</span>'); ui.appendChild(e); setTimeout(() => e.remove(), 1100);
  };
  G.flash = function () { const e = el('div', 'qpc-flash'); ui.appendChild(e); setTimeout(() => e.remove(), 900); };
  G.heading = function (t) {
    headBox.innerHTML = '<div>' + esc(t) + '</div>'; headBox.classList.remove('on'); void headBox.offsetWidth; headBox.classList.add('on');
  };
  G.toast = function (name, text) {
    const t = el('div', 'tt', '<b>' + esc(name) + '</b>' + esc(text)); toastBox.appendChild(t); setTimeout(() => t.remove(), 5000);
  };
  G.big = function (t) { G.card(null); cardBox.innerHTML = '<div class="bigword">' + esc(t) + '</div>'; cardBox.className = 'qpc-card on bigw'; };

  const MOVIE = {
    1: ['m1', '<div class="box">「鈴音旅館からの脱出」に乱入してきたのは</div>'],
    2: ['m2', '<div>昨年度の合宿先<br><span class="red">『湯けむりの隠れ家』</span>を名乗る人物だった</div>'],
    3: ['m3', '<div class="bgw">annihilation</div><div>毒を飲まされたあなたたちは<br><span class="yel">とあるシステム</span>を使って事件の解決を目指す</div>'],
    4: ['m4', '<div class="t1">制限<br>時間</div><div class="t60">60分</div>'],
    5: ['m5', '<div>怪事件を、</div>'],
    6: ['m6', '<div>解決せよ</div>'],
    7: ['m7', '<div class="ttl"><span class="tape">湯けむりの隠れ家</span>からの脱出</div><div class="sub">ESCAPE with A<span>NN</span>IHILATION</div>']
  };
  G.movie = function (n) {
    if (!n || !MOVIE[n]) { movieBox.className = 'qpc-movie'; movieBox.innerHTML = ''; return; }
    movieBox.className = 'qpc-movie on ' + MOVIE[n][0];
    movieBox.innerHTML = MOVIE[n][1];
  };

  /* ---------- カード・全画面の画像（Illustrator で名前を直して書き出したもの） ---------- */
  const FULL = { sheet: 'sheet.png', photo: 'photo.png', db: 'db.png', hajime: 'hajime.png', detox: 'card_detox.jpg', solve: 'card_solve.jpg', resolve: 'card_resolve.jpg' };
  G.card = function (id) {
    if (!id || !FULL[id]) { cardBox.className = 'qpc-card'; cardBox.innerHTML = ''; return; }
    cardBox.innerHTML = '<img class="full ' + id + '" src="' + IMG + FULL[id] + '">';
    cardBox.className = 'qpc-card on img';
  };

  /* ---------- 進行（ティラノとのやりとり） ---------- */
  G.atHub = false;
  G.go = function (target, storage) {
    G.atHub = false;
    closeModal();
    const k = K();
    k.stat.is_skip = false;
    k.layer.showEventLayer();
    k.ftag.startTag('cm', {});
    k.ftag.startTag('jump', { storage: storage || 'main.ks', target });
  };
  // [hub kind=...] の直前に呼ばれる。このあと [s] で止まる
  G.hub = function (kind) {
    const k = K();
    k.stat.is_skip = false;
    G.atHub = true;
    G.skipTo = null;
    if (G.timeUp && G.phase === 'play') { setTimeout(() => G.go('*timeup', 'result.ks'), 30); return; }
    if (kind === 'title') openTitle();
    else if (kind === 'menu') openMenu();
    else if (kind === 'sys') openSys();
    else if (kind === 'pw') openPw();
    else if (kind === 'end') openEnd();
    else if (kind === 'giveup') openGiveup();
  };
  G.fastForward = function () {
    const k = K();
    if (k.stat.is_skip) return;
    k.stat.is_skip = true;
    if (!k.stat.is_adding_text && !k.stat.is_strong_stop) k.ftag.nextOrder();
  };

  /* ---------- スキップ ---------- */
  const SKIPSETS = {
    op: { cps: ['op_pre', 'op_self', 'op_ch1', 'op_ch2', 'op_ch3', 'op_ch4', 'op_intrude', 'op_movie', 'intro'], jumps: [['乱入まで', 'op_intrude'], ['はじめにまで', 'intro']] },
    ks: { cps: ['k1', 'k2', 'k3', 'k4', 'k5', 'k6', 'k7', 'k8', 'k_end'], jumps: [['終わりまで', 'k_end']] }
  };
  let skipSet = null;
  G.skipTo = null; G.curCp = '';
  G.skipOn = function (set) { skipSet = SKIPSETS[set]; skipBtn.style.display = ''; };
  G.skipOff = function () { skipSet = null; skipBtn.style.display = 'none'; G.skipTo = null; };
  G.cp = function (id) {
    G.curCp = id;
    if (G.skipTo === id) { K().stat.is_skip = false; G.skipTo = null; }
  };
  function openSkip() {
    if (!skipSet || G.atHub) return;
    const box = showModal('skipdlg', '<div class="mt">どこまで飛ばしますか？</div>');
    const row = el('div', 'row');
    const i = skipSet.cps.indexOf(G.curCp);
    const next = skipSet.cps[Math.min(i + 1, skipSet.cps.length - 1)];
    row.appendChild(btn('次の章へ', () => doSkip(next)));
    skipSet.jumps.forEach(j => { if (skipSet.cps.indexOf(j[1]) > i) row.appendChild(btn(j[0], () => doSkip(j[1]))); });
    row.appendChild(btn('やめる', closeModal, 'sub'));
    box.appendChild(row);
  }
  function doSkip(target) { closeModal(); G.skipTo = target; G.fastForward(); }

  /* ---------- モーダル ---------- */
  function showModal(cls, html) {
    modal.innerHTML = '';
    modal.className = 'qpc-modal ' + cls;
    const box = el('div', 'mbox', html || '');
    modal.appendChild(box);
    modal.style.display = '';
    modal.onclick = ev => ev.stopPropagation();
    return box;
  }
  function closeModal() { modal.style.display = 'none'; modal.innerHTML = ''; }

  /* ---------- タイトル ---------- */
  function openTitle() {
    const box = showModal('title', '<img class="cover" src="' + IMG + 'kit0.png"><div class="ttl2">湯けむりの隠れ家からの脱出</div>');
    box.appendChild(btn('はじめる', () => { G.reset(); G.go('*start', 'opening.ks'); }, 'start'));
  }

  /* ---------- タイマー ---------- */
  let endAt = 0, tick = null, warned = {};
  G.phase = '';
  G.timerStart = function (sec) {
    endAt = Date.now() + (sec || 3600) * 1000; warned = {}; G.timeUp = false; G.phase = 'play';
    timerEl.style.display = ''; clearInterval(tick); tick = setInterval(updTimer, 250); updTimer();
  };
  G.timerStop = function () { clearInterval(tick); timerEl.style.display = 'none'; G.phase = ''; };
  G.remain = () => Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
  function updTimer() {
    const r = G.remain();
    timerEl.innerHTML = '残り <b>' + String(Math.floor(r / 60)).padStart(2, '0') + ':' + String(r % 60).padStart(2, '0') + '</b>';
    timerEl.classList.toggle('low', r <= 600);
    if (r <= 600 && !warned[600]) { warned[600] = true; G.toast('NKS', '残り10分です。そろそろ決めにいきましょう。'); if (G.s.step >= 3) G.bgm('kinpaku'); }
    if (r <= 60 && !warned[60]) { warned[60] = true; G.toast('ゆうご', 'あと1分！？やばいやばい！'); }
    if (r <= 0 && !G.timeUp) {
      G.timeUp = true; clearInterval(tick); G.endReason = 'timeup';
      if (G.atHub) G.go('*timeup', 'result.ks'); else G.fastForward();
    }
  }

  /* ---------- メニュー ---------- */
  const STEPNAME = ['', 'STEP 1', 'STEP 2', 'FINAL STEP'];
  function openMenu() {
    const s = G.s;
    const box = showModal('menu', '<div class="stepname">' + STEPNAME[s.step] + '</div><div class="order">' + esc(s.order) + '</div><div class="mt">どうする？</div>');
    const list = el('div', 'mlist');
    const add = (t, fn, cls) => list.appendChild(btn(t, fn, cls));
    if (s.step === 1) add('パスワードを入力する', openPw, 'key');
    add('キット（問題）を見る', () => openViewer('kit', 0));
    add('LTのスライドを見る', () => openViewer('lt', 0));
    if (s.step >= 2) add('対消滅システムの説明', () => openView('sheet'));
    if (s.step >= 2) add('対消滅システムを使う', () => { if (!s.sysSeen) { s.sysSeen = true; G.go('*sys_first'); } else openSys(); }, 'key');
    if (s.f.photo) add('昨夜のルームの写真', () => openView('photo'));
    if (s.f.db) add('DB', () => openView('db'));
    add('目的を確認する', openGoal);
    add('ヒント', () => openHints());
    if (s.step >= 3) add('時間終了（結果を見る）', openGiveup, 'end');
    box.appendChild(list);
  }
  const KIT = ['表紙', '問題A', '問題B', '問題C', '問題D', '問題E', '問題F', 'まとめ'];
  function openViewer(kind, i) {
    const n = kind === 'kit' ? KIT.length : window.QPCLTOrder.length;
    i = (i + n) % n;
    let html;
    if (kind === 'kit') html = '<div class="vt">' + KIT[i] + '（' + (i + 1) + '/' + n + '）</div><img class="kitimg" src="' + IMG + 'kit' + i + '.png">';
    else html = '<div class="vt">LTのスライド（' + (i + 1) + '/' + n + '）</div><div class="ltwrap">' + G.slideHtml(window.QPCLTOrder[i]) + '</div>';
    const box = showModal('viewer', html);
    fillAssets(box);
    const row = el('div', 'row');
    row.appendChild(btn('＜ 前へ', () => openViewer(kind, i - 1)));
    row.appendChild(btn('次へ ＞', () => openViewer(kind, i + 1)));
    row.appendChild(btn('戻る', openMenu, 'sub'));
    box.appendChild(row);
  }
  function openView(id) {
    const box = showModal('viewer', '');
    box.innerHTML = '<img class="kitimg ' + id + '" src="' + IMG + FULL[id] + '">';
    const row = el('div', 'row'); row.appendChild(btn('戻る', openMenu, 'sub')); box.appendChild(row);
  }
  function goalText() {
    const s = G.s, f = s.f;
    if (s.step === 1) return 'キットの問題A〜Fとまとめを解くと、<br>ひらがな五文字のパスワードになる。';
    if (s.step === 2) return 'カメラは壊れ、メモリはルームに置いてきてしまった。<br>使えるのは対消滅システムだけ。';
    if (!f.detox && !f.solved) return '毒を飲まされている。まずは薬を作りたい。';
    if (f.detox && !f.solved) return '薬は飲めた。……でも、まだ何か引っかかる。';
    if (!f.detox && f.solved) return '『湯けむりの隠れ家』はもういない。あとは薬だ。';
    if (!f.resolved) return '事件は解決した。あとは時間が来るのを待とう。<br>……ルームのパソコンのデータは、残ったままだ。';
    return 'やれることは全部やった。あとは時間が来るのを待とう。';
  }
  function openGoal() {
    const box = showModal('goal', '<div class="stepname">' + STEPNAME[G.s.step] + '</div><div class="order big">' + esc(G.s.order) + '</div><div class="gt">' + goalText() + '</div>');
    const row = el('div', 'row'); row.appendChild(btn('戻る', openMenu, 'sub')); box.appendChild(row);
  }
  function openGiveup() {
    const box = showModal('confirm', '<div class="mt">まだ時間が残っています。ここで結果を見ますか？<br>結果を見ると、もう戻れません。</div>');
    const row = el('div', 'row');
    row.appendChild(btn('結果を見る', () => { G.endReason = 'giveup'; G.go('*giveup', 'result.ks'); }, 'end'));
    row.appendChild(btn('やめる', openMenu, 'sub'));
    box.appendChild(row);
  }

  /* ---------- ヒント ---------- */
  const A = t => ({ t, ans: true });
  const HINTS = {
    1: [
      ['全体（どこから手をつければいいかわからない）', ['まずは解けそうな問題から手をつけましょう。<br>問題A〜Fの答えは、どれもひらがな2〜3文字です。', '全部そろったら、答えを「まとめ」にあてはめましょう。']],
      ['問題A', ['この図は「スマホのフリック入力」を表しているようです。', 'イラストはそれぞれ「やま」「さら」です。', '両方ともア段なので、答えもア段を拾うはずです。', A('答えは「かた」です。')]],
      ['問題B', ['①②＝「はい」のようです。', '質問に答えるときは「はい」と「いい③」ですね。', A('②②③＝「いいえ」になるため、答えは「いえ」です。')]],
      ['問題C', ['この問題の枠と図の並び、どこかで見覚えがありませんか。', 'キットの表紙（タイトル画面）と似ているようです。見比べてみましょう。', A('答えは「はかた」です。')]],
      ['問題D', ['12個並んでいて、3番目が「とら」、9番目が「さる」のものは何でしょう？', A('干支です。答えは「うし」です。')]],
      ['問題E', ['「あめ」→「いも」、「てら」→「とり」。矢印の前後でどうなっていますか？', '五十音順に注目しましょう。あ→い、め→も、て→と、ら→り。', A('矢印で五十音順が一つ進んでいます。「うす」を一つ戻して、答えは「いし」です。')]],
      ['問題F', ['この図は五十音表を表しています。', A('答えは「はす」です。')]],
      ['まとめ', ['いままでの答えを埋めていきましょう。', A('「ぱすはばいがえし」になります。パスワードは「ばいがえし」です。')]]
    ],
    2: [
      ['昨夜のルームの様子を知る方法がわからない', ['昨夜のルームの様子を知るには、何が必要でしょうか。', '写真があれば、昨夜のルームの様子がわかりそうです。写真を手に入れるには、どうすればいいでしょうか。',
        '対消滅システムを使えばよさそうです。手元にはSTEP1のキットがあり、イラストがたくさんあります。', '問題には「もりあーてぃ」「てぃー」「あめ」があります。', A('入力に「もりあーてぃ」「てぃー」「あめ」、出力に「メモリ」と入れて実行しましょう。')]]
    ],
    3: [
      ['薬の手に入れ方がわからない', ['対消滅システムを使って薬を作りましょう。', '「く」「す」「り」を含むものを拾いましょう。写真とキットの両方から拾えます。', '「うす」「うり」「くも」で、あとは「も」を消せればよさそうです。「も」を含むものは？',
        '「うす」「うり」「くも」「うもうぶとん」のようです。でも「ぶとん」が邪魔です。「うもう」なら？', A('写真には、布団から飛び出た羽毛も写っています。入力に「うす」「うり」「くも」「うもう」、出力に「くすり」。')]],
      ['解毒のあと、何をすればいいかわからない', ['対消滅システムで何ができるか、よく見直しましょう。', 'DBがあれば、もっとできることがわかりそうです。「DB」を対消滅システムで作れないでしょうか。', '「データベース」では難しいようです。「DB」を作り出す方法を考えましょう。',
        '意味深に「e」があるので、これを使うはずです。d、b、e を含むものを探しましょう。', '「e」と「bed」（ベッド）で、DBが作り出せるはずです。', 'DBを手に入れたら、インクで隠れた部分を推測しましょう。',
        '赤い字は、どうやら「人間を出力することはできない」と読めます。上にあるのは人間の名前です。', 'この青色の字、どこかで見たことありませんか。', '人間は「出力」できないようです。そのうえで、対消滅システムの説明をもう一度よく見直しましょう。'], 'detox']
    ]
  };
  function openHints(sel) {
    const s = G.s, list = HINTS[s.step] || [];
    const box = showModal('hints', '<div class="mt">ヒント（' + STEPNAME[s.step] + '）</div><div class="hs">見たいヒントだけを開いてください。答えは一番深いヒントの中にあります。</div>');
    if (sel == null) {
      const l = el('div', 'mlist');
      list.forEach((h, i) => {
        if (h[2] === 'detox' && !s.f.detox) return;
        const key = s.step + '-' + i, n = s.hints[key] || 0;
        l.appendChild(btn(h[0] + '　<small>' + n + '/' + h[1].length + '</small>', () => openHints(i)));
      });
      box.appendChild(l);
      const row = el('div', 'row'); row.appendChild(btn('戻る', openMenu, 'sub')); box.appendChild(row);
      return;
    }
    const h = list[sel], key = s.step + '-' + sel, n = s.hints[key] || 0;
    box.appendChild(el('div', 'htitle', esc(h[0])));
    const ol = el('ol', 'hl');
    h[1].slice(0, n).forEach(x => ol.appendChild(el('li', x.ans ? 'ans' : '', (x.ans ? '（答え）' : '') + (x.t || x))));
    if (n >= h[1].length && h[2] === 'detox') ol.appendChild(el('li', 'self', 'ここから先は自分の力で！'));
    box.appendChild(ol);
    const row = el('div', 'row');
    if (n < h[1].length) {
      row.appendChild(btn('次のヒントを開く', () => {
        const nx = h[1][n];
        if (nx.ans) {
          const c = showModal('confirm', '<div class="mt">次のヒントには答えが書いてあります。開きますか？</div>');
          const r2 = el('div', 'row');
          r2.appendChild(btn('開く', () => { s.hints[key] = n + 1; openHints(sel); }));
          r2.appendChild(btn('やめる', () => openHints(sel), 'sub'));
          c.appendChild(r2);
        } else { s.hints[key] = n + 1; openHints(sel); }
      }));
    }
    row.appendChild(btn('ヒントの一覧', () => openHints(), 'sub'));
    row.appendChild(btn('戻る', openMenu, 'sub'));
    box.appendChild(row);
  }

  /* ---------- パスワード ---------- */
  let pwVal = '', pwMsg = '';
  function openPw() {
    const s = G.s;
    const box = showModal('pw', '<div class="mt">ルームにリモート接続</div><div class="hs">パスワードを入力してください。</div>');
    const inp = el('input', 'pwin'); inp.placeholder = 'ひらがな五文字'; inp.value = pwVal; inp.maxLength = 20;
    inp.addEventListener('keydown', ev => { ev.stopPropagation(); if (ev.key === 'Enter') check(); });
    inp.addEventListener('input', () => { pwVal = inp.value; });
    box.appendChild(inp);
    const msg = el('div', 'pwmsg', esc(pwMsg)); box.appendChild(msg);
    const row = el('div', 'row');
    function check() {
      const v = L.norm(inp.value);
      if (v === 'ばいがえし') { pwMsg = ''; G.go('*step2'); return; }
      pwMsg = /^[ぁ-ゖ]{5}$/.test(v) ? 'パスワードが違います。' : 'ひらがな五文字で入力してください。';
      msg.textContent = pwMsg; msg.classList.remove('shake'); void msg.offsetWidth; msg.classList.add('shake');
    }
    row.appendChild(btn('決定', check, 'key'));
    row.appendChild(btn('戻る', openMenu, 'sub'));
    box.appendChild(row);
    const link = el('div', 'pwlink', s.pwHint ? '⇒ hint：<b>わたしの目的</b>' : '<a>わからない場合はこちらをクリック</a>');
    if (!s.pwHint) link.querySelector('a').addEventListener('click', ev => { ev.stopPropagation(); s.pwHint = true; G.go('*pw_hint'); });
    box.appendChild(link);
    setTimeout(() => inp.focus(), 50);
  }

  /* ---------- 対消滅システム ---------- */
  G.res = null;
  function openSys() {
    const box = showModal('sys', '<div class="systtl">対消滅システム</div><div class="hs">文字をババ抜きしてものに干渉できるシステム</div>');
    const tbl = el('div', 'systbl');
    const colIn = el('div', 'col', '<div class="ch">入力（2つ以上）</div>');
    const colOut = el('div', 'col out', '<div class="ch">出力（1つまで・空欄でもよい）</div>');
    const inputs = [];
    for (let i = 0; i < 7; i++) {
      const inp = el('input', 'sin'); inp.value = G.sys[i] || ''; inp.maxLength = 30;
      inp.placeholder = i < 6 ? '入力' + (i + 1) : '出力';
      inp.addEventListener('input', () => { G.sys[i] = inp.value; });
      inp.addEventListener('keydown', ev => { ev.stopPropagation(); if (ev.key === 'Enter') run(); });
      inputs.push(inp);
      (i < 6 ? colIn : colOut).appendChild(inp);
    }
    tbl.appendChild(colIn); tbl.appendChild(colOut);
    box.appendChild(tbl);
    const row = el('div', 'row');
    row.appendChild(btn('実行', run, 'key'));
    row.appendChild(btn('入力を消す', () => { G.sys = ['', '', '', '', '', '', '']; openSys(); }, 'sub'));
    row.appendChild(btn('閉じる', openMenu, 'sub'));
    box.appendChild(row);
    box.appendChild(el('div', 'snote', '※失敗した場合、入力に使ったものは他で未使用ならまた使うことができる。'));
    function run() {
      const s = G.s;
      const r = L.judge(G.sys.slice(0, 6), G.sys[6], { photo: s.f.photo, memory: s.memory, kusuri: s.f.detox, used: s.used });
      G.res = r;
      if (!r.ok) {
        if (r.react) { s.react[r.react]++; G.go('*react_' + r.react); return; }
        if (r.ball) { s.react.ball++; }
        G.go('*fail');
        return;
      }
      G.ev = applyOk(r);
      G.sys = ['', '', '', '', '', '', ''];
      G.go('*ev_next');
    }
  }
  function applyOk(r) {
    const s = G.s, ev = [];
    G.evSpecial = false;
    r.consume.forEach(id => { s.used[id] = true; });
    if (r.out && r.out !== 'kusuri' && r.out !== 'memory') delete s.used[r.out];
    if (r.out === 'memory' && !s.memory) { s.memory = true; s.f.photo = true; ev.push('*got_memory'); }
    else if (r.out === 'db' && !s.f.db) { s.f.db = true; ev.push('*got_db'); }
    else if (r.out === 'kusuri') { s.f.detox = true; ev.push('*got_kusuri'); }
    else if (r.out) ev.push('*got_out');
    if (r.consume.indexOf('risa') >= 0 && !s.f.solved) { s.f.solved = true; ev.push('*got_risa'); }
    if (r.consume.indexOf('pc') >= 0 && !s.f.resolved) { s.f.resolved = true; ev.push('*got_pc'); }
    if (!ev.length) ev.push('*got_empty');
    return ev;
  }
  G.nextEv = function () {
    const n = G.ev.shift();
    if (n) { if (!/got_(out|empty)/.test(n)) G.evSpecial = true; return n; }
    const r = G.evSpecial ? '*menu' : '*sys'; G.evSpecial = false; return r;
  };
  G.outLine = function () { return (G.s.outCount++ % 2) === 0; };

  /* ---------- 結果 ---------- */
  G.ending = function () {
    const f = G.s.f;
    G.s.ending = f.detox && f.solved ? (f.resolved ? 'perfect' : 'clear') : 'bad';
    return G.s.ending;
  };
  function openEnd() {
    const e = G.s.ending;
    const box = showModal('endsel', '');
    const row = el('div', 'row');
    if (e === 'kaisetsu') {
      row.appendChild(btn('もう一度遊ぶ', () => G.retry(), 'key'));
      row.appendChild(btn('タイトルへ戻る', () => G.toTitle(), 'sub'));
      box.appendChild(row);
      return;
    }
    if (e === 'bad') row.appendChild(btn('やり直す', () => G.retry(), 'key'));
    row.appendChild(btn('解説編へ進む', confirmKaisetsu, e === 'bad' ? '' : 'key'));
    if (e !== 'bad') row.appendChild(btn('タイトルへ戻る', () => G.toTitle(), 'sub'));
    box.appendChild(row);
  }
  function confirmKaisetsu() {
    const box = showModal('confirm', '<div class="mt">解説編には、謎の答えと事件の真相がすべて書いてあります。<br>進みますか？</div>');
    const row = el('div', 'row');
    row.appendChild(btn('進む', () => { G.card(null); G.go('*start', 'kaisetsu.ks'); }, 'key'));
    row.appendChild(btn('やめる', openEnd, 'sub'));
    box.appendChild(row);
  }
  G.reset = function () {
    G.s = fresh(); G.sys = ['', '', '', '', '', '', '']; G.ev = []; G.res = null; pwVal = ''; pwMsg = '';
    G.timeUp = false; G.endReason = ''; G.timerStop(); G.card(null); G.movie(0); G.slide(null); G.chara('');
  };
  G.retry = function () { G.reset(); G.go('*retry', 'main.ks'); };
  G.toTitle = function () { G.reset(); G.skipOff(); G.go('*title', 'first.ks'); };
  G.endBox = openEnd;
})();
