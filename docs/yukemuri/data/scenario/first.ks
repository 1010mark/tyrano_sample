; 湯けむりの隠れ家からの脱出（QPC の謎解きの移植）
*start

[title name="湯けむりの隠れ家からの脱出"]
[hidemenubutton]
[wait time=200]
[freeimage layer="base"]

[loadjs storage="qpc/logic.js"]
[loadjs storage="qpc/slides.js"]
[loadjs storage="qpc/game.js"]
[loadcss file="./data/others/qpc/game.css"]
[call storage="macro.ks"]

[iscript]
G.setup();
[endscript]

; メッセージ欄と名前欄
[position layer="message0" left=40 top=505 width=1200 height=200 page=fore visible=false color="0x08101e" opacity=215]
[position layer="message0" page=fore margint="52" marginl="60" marginr="60" marginb="20"]
[ptext name="chara_name_area" layer="message0" color="0x5df29a" size=26 bold=true x=78 y=514]
[chara_config ptext="chara_name_area"]
[deffont size=27 color=0xffffff]
[resetfont]

*title
[cm]
[layopt layer="message0" visible="false"]
[bg storage="qpc_black.png" time=100]
[iscript]
G.skipOff();
G.slide(null);
G.chara('');
G.movie(0);
G.card(null);
G.bgm('title');
[endscript]
[hub kind="title"]
[s]
