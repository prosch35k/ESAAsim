/* ---------- top bar: position, UTC clock, QUICK SET list menu, runway + tower symbols ---------- */
const ICON_RWY='<svg width="17" height="20" viewBox="0 0 17 20" shape-rendering="crispEdges"><path fill="#e6e6e2" d="M9 0h1v1h-1zM10 0h1v1h-1zM11 0h1v1h-1zM12 0h1v1h-1zM13 0h1v1h-1zM14 0h1v1h-1zM15 0h1v1h-1zM16 0h1v1h-1zM8 1h1v1h-1zM16 1h1v1h-1zM7 2h1v1h-1zM11 2h1v1h-1zM15 2h1v1h-1zM7 3h1v1h-1zM15 3h1v1h-1zM6 4h1v1h-1zM10 4h1v1h-1zM15 4h1v1h-1zM5 5h1v1h-1zM14 5h1v1h-1zM4 6h1v1h-1zM9 6h1v1h-1zM14 6h1v1h-1zM4 7h1v1h-1zM13 7h1v1h-1zM3 8h1v1h-1zM13 8h1v1h-1zM2 9h1v1h-1zM5 9h1v1h-1zM6 9h1v1h-1zM9 9h1v1h-1zM12 9h1v1h-1zM1 10h1v1h-1zM4 10h1v1h-1zM5 10h1v1h-1zM8 10h1v1h-1zM9 10h1v1h-1zM12 10h1v1h-1zM1 11h1v1h-1zM11 11h1v1h-1zM0 12h1v1h-1zM1 12h1v1h-1zM2 12h1v1h-1zM3 12h1v1h-1zM4 12h1v1h-1zM5 12h1v1h-1zM6 12h1v1h-1zM7 12h1v1h-1zM8 12h1v1h-1zM9 12h1v1h-1zM10 12h1v1h-1zM11 12h1v1h-1zM2 13h1v1h-1zM4 13h1v1h-1zM6 13h1v1h-1zM8 13h1v1h-1zM3 14h1v1h-1zM5 14h1v1h-1zM7 14h1v1h-1zM2 15h1v1h-1zM4 15h1v1h-1zM6 15h1v1h-1zM3 17h1v1h-1zM2 19h1v1h-1z"/></svg>';
const ICON_TWR='<svg width="22" height="22" viewBox="0 0 22 22"><path d="M9 21V12H13V21" fill="none" stroke="#e6e6e2" stroke-width="1.3" stroke-linejoin="round"/><path d="M5 4H17L15 11H7Z" fill="#2b2e35" stroke="#e6e6e2" stroke-width="1.3" stroke-linejoin="round"/><path d="M6.2 7.5H15.8" stroke="#e6e6e2" stroke-width="1"/><path d="M11 4V1.2" stroke="#e6e6e2" stroke-width="1.3"/></svg>';
$('rwb').innerHTML=ICON_RWY;
/* pixel-font QUICK / SET (crisp, no anti-aliasing) */
{const G={Q:['111','101','101','101','111','001'],U:['101','101','101','101','101','111'],I:['111','010','010','010','010','111'],C:['111','100','100','100','100','111'],K:['101','101','110','101','101','101'],
 S:['01110','10001','10000','01110','00001','10001','10001','01110'],E:['11111','10000','10000','11110','10000','10000','10000','11111'],T:['11111','00100','00100','00100','00100','00100','00100','00100']};
 const word=(w,ox,oy,gap)=>{let d='',x=ox;for(const ch of w){G[ch].forEach((r,y)=>{[...r].forEach((c,k)=>{if(c==='1')d+=`M${x+k} ${oy+y}h1v1h-1z`})});x+=G[ch][0].length+gap}return d};
 $('qsb').innerHTML='<svg width="24" height="24" viewBox="0 0 24 24" shape-rendering="crispEdges"><path fill="#e6e6e2" d="'+word('QUICK',2,2,1)+word('SET',3,10,1)+'"/></svg>'}$('ocb').innerHTML=ICON_TWR;
setInterval(()=>{$('utc').textContent=new Date().toISOString().slice(11,19)},250);$('utc').textContent=new Date().toISOString().slice(11,19);
{const m=document.createElement('div');m.id='qsm';m.style.display='none';document.body.appendChild(m);
 const build=()=>{m.innerHTML='<div class="qt">Quick Settings Menu</div>'+order.map(n=>`<div class="qi" data-l="${n}"><span class="qc">${WIN[n].vis?'&#10003;':''}</span>Show ${n} List</div>`).join('')};
 $('qsb').onclick=ev=>{ev.stopPropagation();if(m.style.display===''){m.style.display='none';return}build();const r=$('qsb').getBoundingClientRect();m.style.left=r.left+'px';m.style.top=r.bottom+2+'px';m.style.display=''};
 m.onclick=ev=>{const it=ev.target.closest('.qi');if(!it)return;const n=it.dataset.l,w=WIN[n];w.vis=!w.vis;w.el.style.display=w.vis?'':'none';if(w.vis)w.el.style.zIndex=++zTop;it.querySelector('.qc').innerHTML=w.vis?'&#10003;':''};
 addEventListener('pointerdown',ev=>{if(!ev.target.closest('#qsm,#qsb'))m.style.display='none'})}
$('tb').append($('setb'),$('sb'));

/* ATIS box: airport, letter (light blue), report time (last XX20/XX50), QNH, wind */
function atisTime(){const d=new Date(),m=d.getUTCMinutes();let h=d.getUTCHours(),mm;if(m>=50)mm=50;else if(m>=20)mm=20;else{mm=50;h=(h+23)%24}return String(h).padStart(2,'0')+String(mm).padStart(2,'0')}
if(!ATIS.w){const sp=3+Math.floor(Math.random()*16),dir=(1+Math.floor(Math.random()*36))*10;ATIS.w=String(dir).padStart(3,'0')+String(sp).padStart(2,'0')+'KT'+(Math.random()<.5?' '+String((dir+350)%360||360).padStart(3,'0')+'V'+String((dir+40)%360||360).padStart(3,'0'):'')}
function renderAtis(){$('atis').innerHTML=`<span>ESGG</span><b>${ATIS.l}</b><span>${atisTime()}</span><span>Q${String(ATIS.q).padStart(4,'0')}</span><span>${ATIS.w}</span>`}
renderAtis();setInterval(renderAtis,15000);
