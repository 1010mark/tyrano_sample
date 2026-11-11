/* 対消滅システムの判定・データ（ブラウザと node の両方で読める） */
(function (root) {
  'use strict';

  // 表記の正規化：全角→半角(NFKC)、空白を消す、英字は小文字、カタカナ→ひらがな
  function norm(s) {
    s = String(s || '').normalize('NFKC').replace(/\s+/g, '').toLowerCase();
    return s.replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
  }

  // id: [区分, {表記: 読み(null なら表記そのまま)}]
  // 区分 kit=最初から / room=写真のあと / start=最初から(カメラ) / memory / used / kusuri / bomb / human / mizu
  const ITEMS = {
    yama: ['kit', { '山': 'やま', 'やま': null }],
    sara: ['kit', { '皿': 'さら', 'さら': null }],
    hai: ['kit', { '肺': 'はい', 'はい': null }],
    ushi: ['kit', { '牛': 'うし', 'うし': null }],
    saru: ['kit', { '猿': 'さる', 'さる': null }],
    tora: ['kit', { '虎': 'とら', 'とら': null }],
    mekka: ['kit', { 'めっか': null }],
    imo: ['kit', { '芋': 'いも', 'いも': null }],
    tera: ['kit', { '寺': 'てら', 'てら': null }],
    tori: ['kit', { '鳥': 'とり', 'とり': null }],
    usu: ['kit', { '臼': 'うす', 'うす': null }],
    ame: ['kit', { '飴': 'あめ', 'あめ': null }],
    tea: ['kit', { 'てぃー': null }],
    moriarty: ['kit', { 'もりあーてぃ': null }],
    paper: ['kit', { '問題': 'もんだい', 'ぺーぱー': null, 'paper': null }],
    camera: ['start', { 'かめら': null, 'camera': null }],
    kumo: ['room', { 'くも': null, '蜘蛛': 'くも' }],
    uri: ['room', { '瓜': 'うり', 'うり': null }],
    e: ['room', { 'e': null }],
    wifi: ['room', { 'ぽけっとわいふぁい': null, 'ぽけっとwi-fi': 'ぽけっとわいふぁい', 'ぽけっとwifi': 'ぽけっとわいふぁい' }],
    pc: ['room', { 'ぱそこん': null, 'mac': null }],
    db: ['room', { 'db': null, 'でーたべーす': null }],
    bed: ['room', { 'べっど': null, 'bed': null }],
    futon: ['room', { '羽毛布団': 'うもうぶとん', 'うもうぶとん': null, '中身が飛び出た羽毛布団': 'なかみがとびでたうもうぶとん' }],
    umou: ['room', { '羽毛': 'うもう', 'うもう': null }],
    memory: ['memory', { 'めもり': null }],
    ball: ['used', { 'ぼーる': null, 'ball': null, 'たま': null, '玉': 'たま' }],
    room: ['used', { 'るーむ': null, 'room': null }],
    kusuri: ['kusuri', { 'くすり': null, '薬': 'くすり' }],
    bomb: ['bomb', { 'ぼむ': null, '爆弾': 'ばくだん', 'ばくだん': null }],
    risa: ['human', { 'りさ': null }],
    nks: ['human', { 'nks': null }],
    yugo: ['human', { 'ゆうご': null }],
    mizu: ['mizu', { 'みずたまり': null, '水たまり': 'みずたまり', '水溜まり': 'みずたまり', '水溜り': 'みずたまり' }]
  };
  const FORM = {};
  for (const id in ITEMS) {
    const forms = ITEMS[id][1];
    for (const f in forms) FORM[norm(f)] = { id, read: forms[f] || norm(f) };
  }
  function lookup(raw) { return FORM[norm(raw)] || null; }
  function kind(id) { return ITEMS[id][0]; }

  function counts(words) {
    const c = {};
    for (const w of words) for (const ch of Array.from(w)) c[ch] = (c[ch] || 0) + 1;
    return c;
  }
  function rest(words) {
    const c = counts(words), r = [];
    for (const ch in c) if (c[ch] % 2) r.push(ch);
    return r.sort().join('');
  }
  function sortChars(w) { return Array.from(w).sort().join(''); }

  /* st: { photo, memory, kusuri(作った), used: {id:true} }
     返り値: { ok:false, code, msg, name? } または { ok:true, out:id|null, outRaw, consume:[ids] } */
  function judge(inputsRaw, outputRaw, st) {
    st = st || {};
    const used = st.used || {};
    const ins = inputsRaw.map(s => String(s || '').trim()).filter(s => norm(s) !== '');
    const outRaw = String(outputRaw || '').trim();
    const outEmpty = norm(outRaw) === '';
    const fail = (code, msg, extra) => Object.assign({ ok: false, code, msg }, extra || {});

    // 1
    if (ins.length < 2) return fail(1, '入力が足りません。');
    // 2
    const items = [];
    for (const raw of ins) {
      const it = lookup(raw);
      if (!it) return fail(2, raw + 'はDBに登録されていません。');
      if (kind(it.id) === 'mizu') return fail(2, 'みずたまりは紙に書かれた単純な図形なので使えません。');
      items.push(Object.assign({ raw }, it));
    }
    let out = null;
    if (!outEmpty) {
      out = lookup(outRaw);
      if (!out || kind(out.id) === 'mizu') return fail(2, outRaw + 'はDBに登録されていません。');
    }
    // 3
    const seen = {};
    for (const it of items) {
      if (seen[it.id]) return fail(3, '同じものを同時に入力することはできません。');
      seen[it.id] = true;
    }
    // 4
    for (const it of items) {
      const k = kind(it.id);
      if ((k === 'room' && !st.photo) || (k === 'memory' && !st.memory) || (k === 'kusuri' && !st.kusuri))
        return fail(4, it.raw + 'のイラストか写真がありません。');
    }
    // 5
    for (const it of items) {
      if (kind(it.id) === 'used' || used[it.id] || (it.id === 'kusuri' && st.kusuri))
        return fail(5, it.raw + 'はすでに使用済みです。', { ball: it.id === 'ball' });
    }
    // 6 専用の反応（ボム → ゆうご → NKS）
    for (const id of ['bomb', 'yugo', 'nks']) {
      if (items.some(it => it.id === id)) return fail(6, '', { react: id });
    }
    // 7
    const words = items.map(it => it.read);
    const c = counts(words);
    for (const it of items) {
      if (!Array.from(it.read).some(ch => c[ch] >= 2)) return fail(7, it.raw + 'がババ抜きに関与していません。');
    }
    // 8
    const r = rest(words);
    const want = out ? sortChars(out.read) : '';
    if (r !== want) return fail(8, 'ババ抜きの結果と出力が一致しません。');
    // 9
    if (out && kind(out.id) === 'human') return fail(9, '人間を出力することはできません。');
    // 10
    return { ok: true, out: out ? out.id : null, outRaw, consume: items.map(it => it.id), inputs: items.map(it => it.raw) };
  }

  const api = { norm, lookup, judge, rest, ITEMS, FORM, kind };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.QPCLogic = api;
})(typeof window !== 'undefined' ? window : globalThis);
