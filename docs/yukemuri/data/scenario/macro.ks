; 湯けむりの隠れ家からの脱出：マクロ

; 立ち絵 [ch n=yugo|risa|nks|""] （m=shake で揺らす）
[macro name="ch"]
[iscript]
G.chara(mp.n || '', mp.m);
[endscript]
[endmacro]

; LT のスライド [slide id=xxx]、[slide] で消す。fx=glitch で乱れる
[macro name="slide"]
[iscript]
G.slide(mp.id || null, mp.fx);
[endscript]
[endmacro]

; BGM [bgm n=title|fuon|shikou|kinpaku|clear|bad|""]
[macro name="bgm"]
[iscript]
G.bgm(mp.n || '');
[endscript]
[endmacro]

; メニューなどの画面を開く。このあとに必ず [s] を書く
[macro name="hub"]
[iscript]
G.hub(mp.kind);
[endscript]
[endmacro]

; スキップの目印
[macro name="cp"]
[iscript]
G.cp(mp.id);
[endscript]
[endmacro]

; ERROR の演出
[macro name="err"]
[iscript]
G.err();
[endscript]
[quake count=4 time=300 vmax=10 hmax=0 wait=false]
[endmacro]

; 成功の演出
[macro name="flash"]
[iscript]
G.flash();
[endscript]
[endmacro]

; 見出し（STEP 1 など）
[macro name="heading"]
[iscript]
G.heading(mp.t);
[endscript]
[endmacro]

; 指示枠
[macro name="order"]
[iscript]
G.s.order = mp.t;
[endscript]
[endmacro]

; 全画面のカード・画像を出す。このあと [l] で待ち、[hidecard] で消す（マクロの中で待つとスキップ中に止まるため）
[macro name="showcard"]
[iscript]
G.card(mp.id);
[endscript]
[layopt layer="message0" visible="false"]
[endmacro]

[macro name="hidecard"]
[iscript]
G.card(null);
[endscript]
[layopt layer="message0" visible="true"]
[endmacro]

; ドリルの10秒カウントダウン [cd s=10]、[cd s=0] で止める
[macro name="cd"]
[iscript]
G.cd(parseInt(mp.s || '0', 10));
[endscript]
[endmacro]

[return]
