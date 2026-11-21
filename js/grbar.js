/* ---------- Ground Radar plugin global menu bar (pin, SETTINGS / WINDOW / FUNCTIONS, alerts, QNH, LVP, safety nets, clock, HITT) ---------- */
(()=>{
const bar=$('grb'),menu=$('gmenu');
const fit=()=>{bar.style.top=$('tb').offsetHeight+'px'};fit();addEventListener('resize',fit);
const NA='Not available in ESAAsim';
const na=(t,sub)=>({t,dis:true,sub});
/* menu trees follow the plugin manual (3.2 - 3.4); only entries that exist in ESAAsim are active */
const listsToggle=()=>order.map(n=>({t:n,chk:()=>WIN[n].vis,fn:()=>{const w=WIN[n];w.vis=!w.vis;w.el.style.display=w.vis?'':'none';if(w.vis)w.el.style.zIndex=++zTop}}));
const TREE={
 settings:[{t:'Units',sub:[na('Altitude'),na('- reference'),na('Flight level'),na('Distance'),na('Speed')]},
  {t:'Display',sub:[{hdr:'Surveillance------'},na('Pro mode'),{hdr:'Tracks------------'},{t:'Display',dis:true,chk:()=>true},{t:'History',dis:true,val:'5'},na('HDG line'),{t:'AltFilter',dis:true,val:'050'},{hdr:'Label Filters-----'}].concat(['Stby','SqError','NoState','OnFreq','Parked'].map(n=>({t:n,chk:()=>GRFILT[n],fn:()=>{GRFILT[n]=!GRFILT[n]}})))},
  {t:'Labels',sub:[{hdr:'Position---'},{t:'X',dis:true,val:'15'},{t:'Y',dis:true,val:'15'},{hdr:'Fields------'}].concat(['ATYP','DEP','RMK','STAND','WTC'].map(n=>({t:n,chk:()=>GRFLD[n],fn:()=>{GRFLD[n]=!GRFLD[n]}})))},
  {t:'Lists',sub:['Alerts','ARR','DEP','Dep Timer','Maps','Stands','TTT'].map(n=>na(n))},
  na('Raw Video')],
 window:[na('2nd'),na('APP 1'),na('Approach Path'),na('TTT'),na('Dep Timer'),{t:'Lists',sub:listsToggle()},{t:'Runway Conf',fn:()=>$('rwb').click()},na('RVR'),na('QNH'),na('METAR'),na('Wind Rose')],
 functions:[na('Flight Plan'),{t:'Text notes',dis:true,sub:[na('Create...'),na('Delete...'),na('Delete all')]},na('Map Selection')],
 dev:[na('Reload Settings'),na('Reload Data Files'),na('Show/Hide Airport Data')]};
let reg=[];
const build=items=>items.map(it=>{if(it.hdr)return`<div class="gh">${it.hdr}</div>`;const id=reg.push(it)-1;
 return`<div class="gi${it.dis?' dis':''}" data-i="${id}" ${it.dis?`title="${NA}"`:''}>${it.chk&&it.chk()?'<span class="ck">&#10003;</span>':''}${it.t}${it.val?'<span class="gv">'+it.val+'</span>':''}${it.sub?'<span class="arr">&#9656;</span><div class="gsub gmn">'+build(it.sub)+'</div>':''}</div>`}).join('');
let openBy=null;
const close=()=>{menu.style.display='none';if(openBy)openBy.classList.remove('op');openBy=null;bar.classList.remove('pk')};
const open=(el,key)=>{if(openBy===el){close();return}close();reg=[];menu.innerHTML=build(TREE[key]);const r=el.getBoundingClientRect();menu.style.left=r.left+'px';menu.style.top=r.bottom+'px';menu.style.display='';openBy=el;el.classList.add('op');bar.classList.add('pk')};
bar.querySelectorAll('.gm').forEach(el=>el.onclick=ev=>{ev.stopPropagation();open(el,el.dataset.m)});
$('ghi').onclick=ev=>{ev.stopPropagation();open($('ghi'),'dev')};
/* hovering another menu title while one is open switches to it */
bar.querySelectorAll('.gm').forEach(el=>el.onpointerenter=()=>{if(openBy&&openBy!==el&&openBy.classList.contains('gm'))open(el,el.dataset.m)});
menu.onclick=ev=>{const g=ev.target.closest('.gi');if(!g)return;const it=reg[+g.dataset.i];if(!it||it.dis||it.sub)return;it.fn&&it.fn();
 const ck=g.querySelector('.ck');if(it.chk){if(it.chk()){if(!ck)g.insertAdjacentHTML('afterbegin','<span class="ck">&#10003;</span>')}else if(ck)ck.remove()}else close()};
addEventListener('pointerdown',ev=>{if(!ev.target.closest('#gmenu,#grb .gm,#ghi'))close()});
bar.addEventListener('pointerenter',()=>{GRFILTOFF=true});bar.addEventListener('pointerleave',()=>{GRFILTOFF=false});
/* pin */
$('grp').onclick=()=>{const on=$('grp').classList.toggle('on');bar.classList.toggle('hid',!on);clampWins()};
/* alerts: filled when at least one alert is active, hollow otherwise */
const TRI=f=>`<svg viewBox="0 0 18 16"><path d="M9 1.5 L16.5 14.5 H1.5 Z" fill="${f?'#e00000':'none'}" stroke="#e00000" stroke-width="1.5" stroke-linejoin="miter"/><rect x="8.2" y="5.8" width="1.6" height="4.6" fill="${f?'#fff':'#e00000'}"/><rect x="8.2" y="11.6" width="1.6" height="1.6" fill="${f?'#fff':'#e00000'}"/></svg>`;
let alShown=null;
/* safety nets: green = on, yellow = switched off */
const NETS=['APM','APW','RIM','CBM','ICM','OSM','RVM','ECM','RUM'];window.GRNET={};
$('gsn').innerHTML=NETS.map(n=>{GRNET[n]=true;return`<b data-n="${n}" title="Toggle ${n} alerts on/off">${n}</b>`}).join('');
$('gsn').onclick=ev=>{const b=ev.target.closest('b');if(!b)return;GRNET[b.dataset.n]=!GRNET[b.dataset.n];b.classList.toggle('off',!GRNET[b.dataset.n])};
/* LVP */
window.GRLVP=false;$('glv').onclick=()=>{GRLVP=!GRLVP;$('glt').textContent=GRLVP?'LVP':'NORMAL';$('glv').classList.toggle('lvp',GRLVP)};
/* QNH: shows the latest QNH; yellow when it changed, click to acknowledge */
let qShown=null;
$('gq').onclick=()=>$('gq').classList.remove('chg');
/* clock (UTC dd-mm-yy hh:mm:ss) */
const p2=n=>String(n).padStart(2,'0');
const tick=()=>{const d=new Date();$('gdt').textContent=p2(d.getUTCDate())+'-'+p2(d.getUTCMonth()+1)+'-'+p2(d.getUTCFullYear()%100)+' '+p2(d.getUTCHours())+':'+p2(d.getUTCMinutes())+':'+p2(d.getUTCSeconds());
 const a=typeof planes!=='undefined'&&planes.some(p=>p.alert);if(a!==alShown){alShown=a;$('gal').innerHTML=TRI(a)}
 if(typeof ATIS!=='undefined'&&ATIS.q!=null){const q=String(ATIS.q).padStart(4,'0');if(q!==qShown){if(qShown!==null)$('gq').classList.add('chg');qShown=q;$('gqv').textContent=q}}};
tick();setInterval(tick,500);
/* lists must not slide under the bar */
window.topLim=()=>$('tb').offsetHeight+(bar.classList.contains('hid')?0:bar.offsetHeight);
window.clampWins=()=>{if(typeof WIN==='undefined')return;const lim=topLim();for(const n in WIN){const el=WIN[n].el;if(el&&parseInt(el.style.top||'0')<lim)el.style.top=lim+'px'}};
clampWins();
})();
