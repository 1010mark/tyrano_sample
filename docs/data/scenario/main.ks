; 本編：はじめに・STEP1・STEP2・FINAL・メニュー・対消滅システム（シナリオ.md §3〜§10）

*intro
[iscript]
G.cp('intro');
G.skipOff();
G.slide(null);
G.movie(0);
[endscript]
[cm]
[layopt layer="message0" visible="true"]
[bg storage="qpc_blue.png" time=400]
[bgm n="fuon"]
[heading t="はじめに"]
[ch n="yugo"]
#ゆうご
現状を簡単にまとめたから参考にして！[p]
[ch n=""]
[showcard id="hajime"]
[l]
[hidecard]

*step1
[cm]
[bg storage="qpc_blue.png" time=300]
[iscript]
G.s.step = 1;
G.timerStart(3600);
[endscript]
[heading t="STEP 1"]
[bgm n="shikou"]
[ch n="yugo"]
#ゆうご
よし！まずはリモートでルームに繋いで……。[r]……あれ、パスワード何だっけ？[p]
[ch n="nks"]
#NKS
普段はルームで開発するから忘れちゃったな。[r]りささんが設定したんじゃないでしたっけ？[p]
[ch n="risa"]
#りさ
それはそうなんだけど、だいぶ前だから……。[p]
[ch n=""]
[order t="STEP1　パスを特定し、ゆうごに伝えよ。"]
#
［STEP1　パスを特定し、ゆうごに伝えよ。］[p]
[jump target="*menu"]

; ---------- メニュー ----------
*menu
[cm]
[ch n=""]
#
[hub kind="menu"]
[s]

*pw
[cm]
[ch n=""]
#
[hub kind="pw"]
[s]

*pw_hint
[ch n="yugo"]
#ゆうご
なにこのヒント……？それがパスワードに？[r]でも一体誰の目的？[p]
[jump target="*pw"]

; ---------- STEP2 ----------
*step2
[cm]
[bg storage="qpc_yellow.png" time=300]
[iscript]
G.s.step = 2;
[endscript]
[heading t="STEP 2"]
[ch n="yugo"]
#ゆうご
おっ！ついにアクセスできた！[r]それにしても変なパスワードだな。[p]
[ch n="risa"]
#りさ
……ああ、そんなパスワードだったね。覚えてる。[r]とにかくルームにはアクセスできたんでしょ？[p]
[ch n="yugo"]
#ゆうご
そう！俺たちの開発した「対消滅システム」に[r]アクセスできるようになった！[p]
[font size=17]
いや〜これを作るのは苦労したよ〜。大学の授業で対消滅の話を聞いてから、ずっと形にしたくてさ。粒子と反粒子が出会うと光になって消えるだろ？あれを文字でやったら面白いんじゃないかって思ったわけ。で、合宿の前から3人でルームにこもって、DBにルームのものを片っ端から登録して、テストして、また登録して、テストして、昨日なんか結局朝まで……あ、そうそう、名前を決めるのにも揉めてさ、最初は「ババ抜きマシン」って呼んでたんだけど、りさが「ダサい」って言うから三日くらい考えて……（以下延々と続く）[p]
[resetfont]
[ch n="nks"]
#NKS
ゆうごさん、[font size=40]長いです。[resetfont][r]全く関係ないのでさっさと次行ってください。[p]
[ch n="yugo"]
#ゆうご
……はい。使い方はこの説明書にまとめてあるから！[p]
[showcard id="sheet"]
[l]
[hidecard]
[ch n="risa"]
#りさ
ご丁寧に赤ペンで補足まで……。で、この[r]「ルーム」の中のものやDBはどっかにあるの？[p]
[ch n="yugo"]
#ゆうご
DBはないね。でもこのカメラで昨夜のルームを[r]撮ったよ！参考にはなると思う。ただ……。[p]
[ch n="yugo" m="shake"]
カメラはぶっ壊れちゃったんだよね……。[r]メモリもルームに置いてきちゃったし……。[p]
[ch n="nks"]
#NKS
（絶句）[p]
[ch n=""]
[order t="STEP2　昨夜のルームの様子を知る方法を考え、実行せよ。"]
#
［STEP2　昨夜のルームの様子を知る方法を考え、実行せよ。］[p]
[jump target="*menu"]

; ---------- 対消滅システム ----------
*sys_first
[ch n=""]
#
入力欄にものの名前を書いて「実行」。[r]出力欄には、作りたいものを1つだけ書ける。[p]
表記は自由（ひらがな・カタカナ・漢字など）。[r]規則はメニューの「対消滅システムの説明」を見ること。[p]
[jump target="*sys"]

*sys
[cm]
[ch n=""]
#
[hub kind="sys"]
[s]

*fail
[err]
#
[emb exp="G.res.msg"][p]
[if exp="G.res.ball && G.s.react.ball == 1"]
[ch n="yugo"]
#ゆうご
使用済み？ボールなんて使った覚えないけど……。[p]
[endif]
[jump target="*sys"]

*react_nks
[if exp="G.s.react.nks == 1"]
[ch n="yugo"]
#ゆうご
あー、確かに消せますね〜。……やってみますか。[p]
[err]
[ch n="yugo" m="shake"]
え？……なんかボールが使用済みらしい？[r]……なんで？一体……そんなはずじゃ……。[p]
[else]
[err]
[ch n="yugo" m="shake"]
#ゆうご
……やっぱりボールが使用済みらしい。なんで？[p]
[endif]
[jump target="*sys"]

*react_yugo
[if exp="G.s.react.yugo == 1"]
[ch n="yugo"]
#ゆうご
なるほど！これで「ゆうご」が消せる！[p]
[ch n="yugo" m="shake"]
……え！？？！？！俺消えるの！？！？[p]
[ch n="nks"]
#NKS
お疲れ様です！[p]
[ch n="yugo" m="shake"]
#ゆうご
ちょっと待っ――[p]
[err]
[ch n="nks"]
#NKS
あれ？消せないな。理論上はできそうだけど、[r]入力が足りないらしいです。（ため息）[p]
[ch n="yugo" m="shake"]
#ゆうご
怖ぇ〜！ちなみに失敗だから、入力に使ったものは[r]他で未使用なら再利用できるからね！[p]
[else]
[err]
[ch n="nks"]
#NKS
やっぱり入力が足りないみたいです。残念。[p]
[ch n="yugo" m="shake"]
#ゆうご
今「残念」って言った！？[p]
[endif]
[jump target="*sys"]

*react_bomb
[if exp="G.s.react.bomb == 1"]
[ch n="nks"]
#NKS
ボム？爆弾ってことですか？物騒な……。[r]とりあえず実行してみますね。[p]
[err]
あれ？エラーですね。……ひょっとすると、[r]もう既に実行された後なのかもしれません。[p]
そうなると、爆弾に直接干渉することは[r]できないでしょうね……。[p]
爆弾そのものは置いておいて、[r]ほかにできることを探しましょう。[p]
[else]
[err]
[ch n="nks"]
#NKS
やっぱり爆弾には直接干渉できないみたいですね。[p]
[endif]
[jump target="*sys"]

; ---------- 成功 ----------
*ev_next
[iscript]
tf.ev = G.nextEv();
[endscript]
[jump target="&tf.ev"]

*got_out
[flash]
[ch n=""]
#
[emb exp="G.res.outRaw"]を出力しました。[p]
[jump target="*out_line"]

*got_empty
[flash]
[ch n=""]
#
対消滅しました。入力したものが消えました。[p]
*out_line
[if exp="G.outLine()"]
[ch n="yugo"]
#ゆうご
……で、これ何に使うの？[p]
[else]
[ch n="nks"]
#NKS
使い道があるといいですね。[p]
[endif]
[jump target="*ev_next"]

*got_memory
[flash]
[ch n=""]
#
メモリを出力しました。[p]
[ch n="yugo"]
#ゆうご
これ、俺のカメラのメモリだ！[r]カメラは壊れてるけど、中身は見られるはず！[p]
[showcard id="photo"]
[l]
[hidecard]
[cm]
[bg storage="qpc_purple.png" time=300]
[iscript]
G.s.step = 3;
[endscript]
[heading t="FINAL STEP"]
[bgm n="kinpaku"]
[ch n="yugo"]
#ゆうご
でかした！これで対消滅システムに使えるものが[r]格段に増えたぞ！[p]
[if exp="!G.s.f.solved"]
[ch n="risa"]
#りさ
とはいえ、これで何をするつもり？[p]
[else]
[ch n="nks"]
#NKS
……で、これで何をするつもりですか？[p]
[endif]
[ch n="yugo"]
#ゆうご
わからん！[p]
[ch n="nks"]
#NKS
……。とにかく毒を飲まされたんですよね？[r]じゃあ薬とか作ればいいんじゃないですか？[p]
[ch n=""]
[order t="FINAL　事件を解決せよ。"]
#
［FINAL　事件を解決せよ。］[p]
[jump target="*ev_next"]

*got_db
[flash]
[ch n=""]
#
DBを出力しました。[p]
[ch n="yugo" m="shake"]
#ゆうご
え！？なんか塗りつぶされてる！？[p]
[ch n=""]
#
[showcard id="db"]
[l]
[hidecard]
[jump target="*ev_next"]

*got_kusuri
[flash]
[ch n=""]
#
くすりを出力しました。[p]
[ch n="yugo"]
#ゆうご
薬だ！できた！みんな、すぐ飲んで！[p]
[ch n="nks"]
#NKS
……味については、何も言わないでおきます。[p]
[ch n=""]
[showcard id="detox"]
[l]
[hidecard]
[if exp="!G.s.f.solved"]
#
（本当にこれだけでいいんだろうか……）[p]
[else]
[ch n="yugo"]
#ゆうご
これで全部そろった！あとは時間を待つだけだな！[p]
[endif]
[jump target="*ev_next"]

*got_risa
[flash]
[ch n=""]
#
対消滅しました。[p]
[ch n="risa"]
#りさ
……そっか。[p]
[iscript]
G.vanish();
[endscript]
[bgm n=""]
[iscript]
tf.mw = TYRANO.kag.stat.is_skip ? 1 : 1800;
[endscript]
[wait time="&tf.mw"]
[ch n="yugo" m="shake"]
#ゆうご
……え？りさ？　今、消えた……？[p]
[ch n=""]
[showcard id="solve"]
[l]
[hidecard]
[bgm n="kinpaku"]
[ch n="yugo"]
#ゆうご
じゃあ『湯けむりの隠れ家』って……。[p]
[ch n="nks"]
#NKS
[if exp="!G.s.f.detox"]
話はあとにしましょう。[r]まずは薬です。毒はまだ残ってますから。[p]
[else]
話はあとにしましょう。[r]あとは時間が来るのを待つだけです。[p]
[endif]
[jump target="*ev_next"]

*got_pc
[flash]
[ch n=""]
#
対消滅しました。[p]
[showcard id="resolve"]
[l]
[hidecard]
[jump target="*ev_next"]

; ---------- やり直す ----------
*retry
[cm]
[slide]
[ch n=""]
[bgm n=""]
[bg storage="qpc_black.png" time=300]
[layopt layer="message0" visible="true"]
#
……もう一度、あの乱入の直後から。[r]制限時間は60分。[p]
[jump target="*step1"]
