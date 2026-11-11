; 時間切れ・時間終了・結果（シナリオ.md §15・§16）

*timeup
[iscript]
G.timerStop();
[endscript]
[cm]
[slide]
[ch n=""]
[bgm n=""]
[layopt layer="message0" visible="true"]
[bg storage="qpc_black.png" time=300]
#
制限時間になった。[p]
[jump target="*common"]

*giveup
[iscript]
G.timerStop();
[endscript]
[cm]
[slide]
[ch n=""]
[bgm n=""]
[layopt layer="message0" visible="true"]
[bg storage="qpc_black.png" time=300]
#
あなたたちは、時間が来るのを待つことにした。[p]

*common
[if exp="!G.s.f.solved"]
#湯けむりの隠れ家
時間だよ、QPCの諸君。[p]
[endif]
[iscript]
G.ending();
[endscript]
[bgm n="shikou"]
[heading t="結果"]
[iscript]
tf.mw = TYRANO.kag.stat.is_skip ? 1 : 1500;
[endscript]
[wait time="&tf.mw"]
[if exp="G.s.f.detox"]
[showcard id="detox"]
[l]
[hidecard]
[endif]
[if exp="G.s.f.solved"]
[showcard id="solve"]
[l]
[hidecard]
[endif]
[if exp="G.s.f.resolved"]
[showcard id="resolve"]
[l]
[hidecard]
[endif]
[if exp="G.s.f.solved"]
[call target="*truth"]
[endif]

; ---------- 締め ----------
[cm]
[if exp="G.s.ending == 'perfect'"]
[bgm n="clear"]
#
制限時間が来た。毒は消え、[r]『湯けむりの隠れ家』の声も、もう聞こえない。[p]
ルームのパソコンも、予定どおり消えた。[r]対消滅システムが悪用されることは、もうない。[p]
[ch n="yugo"]
#ゆうご
……ちょっと惜しいけど、まあいっか！[p]
[ch n=""]
[iscript]
G.big('PERFECT');
[endscript]
[elsif exp="G.s.ending == 'clear'"]
[bgm n="clear"]
#
制限時間が来た。毒は消え、[r]『湯けむりの隠れ家』の声も、もう聞こえない。[p]
QPCの合宿は、まだ続く。[p]
[iscript]
G.big('CLEAR');
[endscript]
[elsif exp="G.s.f.detox"]
[bgm n="bad"]
#
制限時間が来た。薬は効いている。[r]倒れる者は、ひとりもいない。[p]
#湯けむりの隠れ家
薬までは作れたんだね。[r]……でも、それで本当によかったのかな？[p]
#
カチリ、と小さな音がした。[p]
[flash]
[iscript]
G.big('BAD END');
[endscript]
[elsif exp="G.s.f.solved"]
[bgm n="bad"]
#
制限時間が来た。『湯けむりの隠れ家』はもういない。[r]けれど、飲まされた毒は、まだ体の中に残っていた……。[p]
[iscript]
G.big('BAD END');
[endscript]
[else]
[bgm n="bad"]
#
制限時間が来た。[p]
『湯けむりの隠れ家』の思惑どおり、[r]QPCの合宿はここで幕を閉じた……。[p]
[iscript]
G.big('BAD END');
[endscript]
[endif]
[cm]
#
[layopt layer="message0" visible="false"]
[hub kind="end"]
[s]

; ---------- 真相（解決完了のとき・解説編から呼ぶ） ----------
*truth
[cm]
[ch n=""]
[bgm n="shikou"]
[bg storage="qpc_black.png" time=300]
[heading t="真相"]
[iscript]
tf.mw = TYRANO.kag.stat.is_skip ? 1 : 1500;
[endscript]
[wait time="&tf.mw"]
#
『湯けむりの隠れ家』の正体は、りさだった。[r]その名前は、一年前の合宿先の旅館の名前だ。[p]
一年前の合宿。りさが徹夜で作った合宿のしおりは、[r]配ったその夜、全員分まとめて鍋敷きにされた。[p]
誰も覚えていなかった。りさだけが覚えていた。[p]
次の日の鍋に毒を仕込み、食中毒に見せかけるつもりだった。[r]けれど大雨で、合宿は一日早く切り上げになった。[p]
ルームのパスワードを「ばいがえし」にしたのは、[r]そのすぐあとのことだ。[p]
そして今年。毒と爆弾、二段構えの「倍返し」。[r]怪しまれないよう、りさも同じものを飲んでいた。[p]
くすりをDBに登録したのは、自分の薬をなくしたときの予備。[r]爆弾は、ふつうなら手に入らない。[p]
けれどDBに書き込んでおけば、対消滅システムで作り出せる。[r]昨夜のうちに、ボールとルームから作っておいた。[p]
ボタンを押す役には、自分の身代わりを作るつもりだった。[r]けれど人間は出力できない。だから、自分で押すと決めた。[p]
[if exp="G.s.f.solved"]
『湯けむりの隠れ家』が消えた今、[r]そのボタンを押す者は、もういない。[p]
[else]
だから、りさを止めれば、[r]そのボタンを押す者はいなくなる。[p]
[endif]
[return]
