/* ---------- lists ---------- */
const LS=D.lists,order=Object.keys(LS);for(const n of order){const c=LS[n].cols,i=c.findIndex(x=>x[0]==='C/S');if(i>=0&&!c.some(x=>x[0]==='SI'))c.splice(i+1,0,['SI',4,0]);c.forEach(x=>{if(x[0]==='RMK')x[1]=8})}
const SECT='GGG';
const CTRL=[{id:'GG',cs:'ESGG_TWR',on:false},{id:'GE',cs:'ESGG_E_APP',on:false}];
const autoNx=()=>{const t=CTRL.find(c=>c.cs==='ESGG_TWR'&&c.on),a=CTRL.find(c=>c.cs==='ESGG_E_APP'&&c.on);return t?t.id:a?a.id:''};
const nextOf=p=>!p.own?'':p.nxm==='-'?'':p.nxm||(p.kind==='DEP'?autoNx():'');
function startXfer(p,t){if(!p.own||p.xfer||!t)return;p.nx=t;p.xfer=true;p.xt=8+Math.random()*7;log('transfer '+p.cs+' to '+t)}
function boxAt(e){return{getBoundingClientRect:()=>({left:e.clientX,top:e.clientY})}}
const etaSec=p=>p.app?-alongTh(p)/(Math.max(p.spd,30)*.5144):1e9;
const GET={
 'STS':(p,n)=>n==='ADCS'?(p.kind==='ARR'?'ARR':'DEP'):p.sts,'C/S':p=>p.cs,'R':()=>'I','ATYP':p=>p.type,'W':p=>p.w,'STD':p=>p.kind==='DEP'?parkedStand(p):p.std,'ADEP':p=>p.adep,'ADES':p=>p.ades,
 'DRWY':p=>p.kind==='DEP'?p.rwy:'','ARWY':p=>p.kind==='ARR'?p.rwy:'','RTE/AHD':p=>p.ahdg?'H'+p.ahdg:p.sid,'CFL':p=>fmtAlt(p.cfl),'XFL':p=>p.xfl,'COPX':p=>p.copx,'ASSR':p=>p.sq,
 'CLR':p=>p.clr?'OK':'','SI':p=>p.xfer?p.nx:p.owner?p.owner:nextOf(p),'RMK':p=>p.rmk,'EOBT':p=>p.eobt,'ETA':p=>p.app?hhmm(T0+T+etaSec(p)):'','HS':p=>p.hold?'HS':'','DSQ':p=>p.dsq||''};
const FIL={
 STUP:p=>p.kind==='DEP'&&['','FRQ','S/U','S/P'].includes(p.sts),
 TAXIOUT:p=>p.kind==='DEP'&&p.sts==='TXO',
 TAKEOFF:p=>p.kind==='DEP'&&!p.air&&(p.sts==='xLU'||p.sts==='xTO'),
 ADCS:p=>(p.kind==='ARR'&&!p.sts)||p.air,
 TAXIIN:p=>p.kind==='ARR'&&p.sts==='TXI'};
const SRT={STUP:(a,b)=>a.eobt<b.eobt?-1:1,TAXIOUT:(a,b)=>a.txoT-b.txoT,TAKEOFF:(a,b)=>a.sts<b.sts?-1:a.sts>b.sts?1:0,ADCS:(a,b)=>etaSec(a)-etaSec(b),TAXIIN:(a,b)=>a.cs<b.cs?-1:1};
const WIN={};let zTop=6;
const WK=13/11;
function buildWins(){for(const n of order){const L=LS[n],el=document.createElement('div');el.className='win';el.style.left=Math.round(L.x*WK)+'px';el.style.top=Math.round(L.y*WK)+'px';
 el.innerHTML=`<div class="wh"><span>${n}</span><span class="cnt"></span></div><div class="wb"></div>`;$('map').appendChild(el);
 const wh=el.querySelector('.wh');let dr=null;
 wh.onpointerdown=e=>{if(e.button!==2)return;wh.setPointerCapture(e.pointerId);dr=[e.clientX-el.offsetLeft,e.clientY-el.offsetTop];el.style.zIndex=++zTop};
 wh.onpointermove=e=>{if(dr){WIN[n].moved=true;el.style.left=Math.max(0,e.clientX-dr[0])+'px';el.style.top=Math.max(0,e.clientY-dr[1])+'px'}};
 wh.onpointerup=()=>{dr=null};
 el.onpointerdown=()=>{el.style.zIndex=++zTop};
 const wb=el.querySelector('.wb');let rd=null,rdm=false;
 wb.onpointerdown=e=>{const t=e.target.closest('tr[data-id]');rd=t&&e.button===2?{id:t.dataset.id,x:e.clientX,y:e.clientY}:null;rdm=false};
 wb.onpointermove=e=>{if(rd&&!rdm&&Math.hypot(e.clientX-rd.x,e.clientY-rd.y)>4){rdm=true;const p=planes.find(q=>q.id==rd.id);if(p){sel=p;list()}}};
 wb.onpointerup=()=>{rd=null;setTimeout(()=>{rdm=false},80)};
 wb.onclick=e=>{if(rdm)return;cellClick(e,n,'L')};wb.oncontextmenu=e=>{e.preventDefault();if(rdm)return;cellClick(e,n,'R')};
 WIN[n]={el,body:el.querySelector('.wb'),cnt:el.querySelector('.cnt'),vis:L.vis};el.style.display=L.vis?'':'none'}
 $('lsw').innerHTML=order.map(n=>`<button data-l="${n}" class="${LS[n].vis?'on':''}">${n}</button>`).join('')}
const LINK={TAXIIN:'TAXIOUT',ADCS:'TAKEOFF'};
function alignWins(){for(const n in LINK){const a=WIN[n],b=WIN[LINK[n]];if(!a||!b||a.moved||b.el.style.display==='none')continue;a.el.style.left=(b.el.offsetLeft+b.el.offsetWidth+3)+'px';a.el.style.top=b.el.offsetTop+'px'}}
function renderLists(){
 const txo=planes.filter(p=>p.kind==='DEP'&&p.sts==='TXO').sort((a,b)=>a.txoT-b.txoT);planes.forEach(p=>p.dsq=0);txo.forEach((p,i)=>p.dsq=i+1);
 for(const n of order){const L=LS[n],w=WIN[n],rows=planes.filter(p=>(p.kind==='DEP'?apAct.dep:apAct.arr)&&FIL[n](p)).sort(SRT[n]);w.cnt.textContent=rows.length;
  const head=L.cols.map(c=>`<th class="${c[2]?'ra':''}" style="min-width:${c[1]}ch">${c[0]}</th>`).join('');
  const body=rows.map(p=>`<tr data-id="${p.id}" class="${p===sel?'sel':''} ${p.own?'as':'un'}${p.xfer?' xf':''}${p.owner?(T-(p.accT||0)>=3?' ob':' oa'):''}">`+L.cols.map(c=>`<td data-c="${c[0]}" class="${c[2]?'ra':''}">${(GET[c[0]](p,n)||'').toString().replace(/&/g,'&amp;').replace(/</g,'&lt;')}</td>`).join('')+'</tr>').join('');
  w.body.style.maxHeight=(L.lines*18+19)+'px';
  w.body.innerHTML=`<table><thead><tr>${head}</tr></thead><tbody>${body||`<tr><td class="em" colspan="${L.cols.length}">-</td></tr>`}</tbody></table>`}}
let fplEl=null,rwEl=null,pmEl=null,ocEl=null,hovP=null;
function closeMenu(){if(pmEl){pmEl.remove();pmEl=null}}
addEventListener('pointerdown',e=>{if(pmEl&&!pmEl.contains(e.target))closeMenu()},true);addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
function popup(ev,title,items,cur){closeMenu();const m=document.createElement('div');m.id='pm';pmEl=m;m.innerHTML=`<div class="pt">${title}</div>`;
 items.forEach(([lb,fn])=>{const d=document.createElement('div');d.className='mi'+(lb===cur?' cur':'');d.textContent=lb||'(none)';d.onclick=()=>{closeMenu();fn();list()};m.appendChild(d)});
 document.body.appendChild(m);const r=m.getBoundingClientRect();m.style.left=Math.max(0,Math.min(ev.clientX,innerWidth-r.width-4))+'px';m.style.top=Math.max(0,Math.min(ev.clientY,innerHeight-r.height-4))+'px'}
function editCell(ev,val,max,fn){closeMenu();const td=ev.target.closest('td');if(!td)return;document.getElementById('cellin')?.remove();const r=td.getBoundingClientRect(),i=document.createElement('input');i.id='cellin';i.value=val||'';i.maxLength=max;
 i.style.cssText=`position:fixed;z-index:60;left:${r.left}px;top:${r.top}px;width:${Math.max(r.width,max*8+10)}px;height:${r.height}px;box-sizing:border-box;font:inherit;font-size:13px;padding:0 4px;margin:0;background:rgb(108,108,111);color:#fff;border:1px solid #000;border-radius:0;outline:none;text-transform:uppercase`;
 document.body.appendChild(i);i.focus();i.select();let done=false;const fin=ok=>{if(done)return;done=true;if(ok)fn(i.value.trim());i.remove();list()};
 i.onkeydown=e=>{e.stopPropagation();if(e.key==='Enter')fin(true);else if(e.key==='Escape')fin(false)};i.onkeyup=e=>e.stopPropagation();i.onblur=()=>fin(true);i.onpointerdown=e=>e.stopPropagation()}
function ask(ev,title,val,fn){closeMenu();const m=document.createElement('div');m.id='pm';pmEl=m;m.innerHTML=`<div class="pt">${title}</div><div class="pi"><input value="${(val||'').toString().replace(/"/g,'&quot;')}"><button>OK</button></div>`;
 document.body.appendChild(m);const r=m.getBoundingClientRect();m.style.left=Math.max(0,Math.min(ev.clientX,innerWidth-r.width-4))+'px';m.style.top=Math.max(0,Math.min(ev.clientY,innerHeight-r.height-4))+'px';
 const i=m.querySelector('input');i.focus();i.select();const ok=()=>{const v=i.value.trim().toUpperCase();closeMenu();fn(v);list()};m.querySelector('button').onclick=ok;i.onkeydown=k=>{if(k.key==='Enter')ok()}}
function initCfl(p,sid){return /^(MISV|SOJW)/.test(sid||'')&&PROP.includes(p.type)?'040':'050'}
function newSq(){let c;do{c=String(1+(Math.random()*6|0))+(Math.random()*8|0)+(Math.random()*8|0)+(Math.random()*8|0)}while(planes.some(q=>q.sq===c));return c}
let clEl=null,apEl=null;
function closeAp(){if(apEl){apEl.remove();apEl=null}}
addEventListener('pointerdown',e=>{if(apEl&&!apEl.contains(e.target))closeAp()},true);
function placeAt(el,x,y){document.body.appendChild(el);const r=el.getBoundingClientRect();el.style.left=Math.max(0,Math.min(x,innerWidth-r.width-4))+'px';el.style.top=Math.max(0,Math.min(y,innerHeight-r.height-4))+'px'}
function apList(box,title,items,cur,cb,grey,focus,cls){closeAp();const m=document.createElement('div');m.className='ap'+(grey?' gr':'')+(cls?' '+cls:'');apEl=m;m.innerHTML=`<div class="at">${title}</div><div class="al">${items.map(([lb,v])=>`<div class="ai${v===cur?' cur':''}" data-v="${v}">${lb}</div>`).join('')}</div>`;
 m.onclick=e=>{const it=e.target.closest('.ai');if(it){closeAp();cb(it.dataset.v)}};const r=box.getBoundingClientRect();placeAt(m,r.left+4,r.top);const c=m.querySelector('.cur')||(focus&&[...m.querySelectorAll('.ai')].find(x=>x.dataset.v===focus));if(c)c.scrollIntoView({block:'center'})}
function apKeypad(box,p,val,cb,gen){closeAp();const m=document.createElement('div');m.className='ap kp';apEl=m;let v=val||'';
 const draw=()=>{m.innerHTML=`<div class="at">${p.cs}</div><div class="ab" id="k_s">SSR</div><div class="ab" id="k_g">Get SSR</div><div class="kd">${v}</div><div class="kg">${[1,2,3,4,5,6,7,8,9,'C',0,'Ok'].map(k=>`<div class="kb${(k===8||k===9)?' dis':''}" data-k="${k}">${k}</div>`).join('')}</div>`;
  m.querySelector('#k_g').onclick=()=>{v=gen();draw()};m.querySelectorAll('.kb').forEach(b=>b.onclick=()=>{const k=b.dataset.k;if(k==='C')v='';else if(k==='Ok'){closeAp();cb(v)}else if(!b.classList.contains('dis')&&v.length<4)v+=k;draw()})};
 draw();const r=box.getBoundingClientRect();placeAt(m,r.left-40,r.top-30)}
const CFLOPT=['080','070','060','050','045','040','035','030','025','020'];
const XFLOPT=[];for(let f=400;f>=100;f-=10)XFLOPT.push(String(f));['090','080','070','060','050','045','040','035','030','025','020'].forEach(v=>XFLOPT.push(v));
const optAlt=a=>a.map(v=>[fmtAlt(v),v]);
function ahdgOpts(){const o=[['AHDG','']];for(let h=360;h>=5;h-=5)o.push([String(h).padStart(3,'0'),String(h).padStart(3,'0')]);return o}
const rwFocus=r=>r==='03'?'025':'205';
const sidOpts=(p,rwy)=>(D.sids[rwy]||[]).filter(x=>!/^VFR/.test(x[0])).map(x=>[`<span>${x[0]}</span><span>${rwy}</span>`,x[0]]);
const rwOpts=()=>[['03','03'],['21','21']];
function openClr(p,e){if(clEl){clEl.remove();clEl=null}closeAp();const d=document.createElement('div');d.id='cl';clEl=d;
 let st={rwy:p.rwy,sid:p.sid,ahdg:p.ahdg||'',cfl:p.cfl||initCfl(p,p.sid),sq:p.sq||newSq()};
 d.innerHTML=`<div class="ct">DEP CLEARANCE</div><div id="cb"></div>`;const ct=d.querySelector('.ct');let dr=null;
 ct.onpointerdown=ev=>{if(ev.button!==2)return;ct.setPointerCapture(ev.pointerId);dr=[ev.clientX-d.offsetLeft,ev.clientY-d.offsetTop]};ct.onpointermove=ev=>{if(dr){d.style.left=Math.max(0,ev.clientX-dr[0])+'px';d.style.top=Math.max(0,ev.clientY-dr[1])+'px'}};ct.onpointerup=()=>{dr=null};
 const sync=()=>{const oc=fmtAlt(p.cfl);if(!p.xfl||p.xfl===oc)p.xfl=fmtAlt(st.cfl);p.cfl=st.cfl;p.sq=st.sq;list()};
 const draw=()=>{sync();$('cb').innerHTML=`<div class="cc">${p.cs}</div>
  <div class="cr"><span>RWY</span><div class="fl" id="c_r">${st.rwy}</div></div><div class="cr"><span>SID</span><div class="fl" id="c_s">${st.sid||''}</div></div>
  <div class="cr"><span>AHDG</span><div class="fl" id="c_h">${st.ahdg}</div></div><div class="cr"><span>CFL</span><div class="fl" id="c_c">${fmtAlt(st.cfl)}</div></div>
  <div class="cr"><span>ASSR</span><div class="fl" id="c_q">${st.sq}</div></div><button id="c_ok">Ok</button><button id="c_x">Cancel</button>`;
  $('c_h').onclick=()=>apList($('c_h'),p.cs,ahdgOpts(),st.ahdg||null,v=>{st.ahdg=v;draw()},true,rwFocus(st.rwy));
  $('c_r').onclick=()=>apList($('c_r'),'Assign',rwOpts(),st.rwy,v=>{st.rwy=v;const b=bestSid(v,p.ades,p.type);st.sid=b?b[0]:'';st.cfl=initCfl(p,st.sid);draw()});
  $('c_s').onclick=()=>apList($('c_s'),'Assign SID',sidOpts(p,st.rwy),st.sid,v=>{st.sid=v;st.cfl=initCfl(p,v);draw()});
  $('c_c').onclick=()=>apList($('c_c'),p.cs,optAlt(CFLOPT),st.cfl,v=>{st.cfl=v;draw()},true);
  $('c_q').onclick=()=>apKeypad($('c_q'),p,st.sq,v=>{if(/^[0-7]{4}$/.test(v))st.sq=v;draw()},newSq);
  $('c_x').onclick=()=>{closeAp();p.clr=false;d.remove();clEl=null;list()};
  $('c_ok').onclick=()=>{closeAp();const h=parseInt(st.ahdg);p.rwy=st.rwy;const s_=(D.sids[p.rwy]||[]).find(x=>x[0]===st.sid);if(s_)setSid(p,s_);p.ahdg=h>=1&&h<=360?String(h).padStart(3,'0'):'';p.cfl=st.cfl;if(!p.xfl)p.xfl=fmtAlt(p.cfl);p.sq=st.sq;p.clr=true;log(p.cs+' cleared '+(p.sid||'')+' '+fmtAlt(p.cfl)+' '+p.sq);d.remove();clEl=null;list()}};
 placeAt(d,e.clientX,e.clientY);draw()}
function assumeMenu(p,e){if(p.owner)return;const box=boxAt(e),on=CTRL.filter(c=>c.on),it=[];
 if(p.xfer)it.push(['assume','c']);else if(!p.own)it.push(['assume','a']);else{it.push(['free','f']);if(nextOf(p)&&!p.xfer)it.push(['transfer','t']);if(on.length&&!p.xfer)it.push(['manual transfer','m'])}
 apList(box,p.cs,it,null,v=>{if(v==='c'){p.xfer=false;p.nx='';log(p.cs+' transfer cancelled')}else if(v==='a'||v==='f')assume(p);else if(v==='t')startXfer(p,nextOf(p));else if(v==='m')apList(box,'Transfer to',on.map(c=>[`<span>${c.id}</span><span>${c.cs}</span>`,c.id]),null,t=>{startXfer(p,t);list()},true,null,'cm');list()},true,null,'cm')}
function assume(p){if(p.owner)return;p.own=!p.own;if(!p.own){p.nx='';p.nxm='';p.xfer=false}log(p.cs+(p.own?' assumed':' freed'))}
function parkedStand(p){let b='',bd=30;for(const s_ of D.stands){const d=Math.hypot(p.x-s_[1],p.y-s_[2]);if(d<bd){bd=d;b=s_[0]}}return b}
const STSL=[['(none)',''],['FRQ','FRQ'],['S/U','S/U'],['S/P','S/P'],['TXO','TXO'],['xLU','xLU'],['xTO','xTO'],['TXI','TXI'],['PRK','PRK']];
const fmtAlt=v=>{const n=parseInt(v);return isNaN(n)?(v||''):n<=50?'A'+String(n).padStart(2,'0'):String(n).padStart(3,'0')};
const CFLS=['020','030','040','050','060','070','080','090','100'],XFLS=[];for(let f=100;f<=400;f+=10)XFLS.push('F'+f);
const sidList=p=>(D.sids[p.rwy]||[]);
function setSid(p,s_){p.sid=s_[0];p.copx=s_[1];p.ahdg='';if(p.route_)p.route_=genRoute(p)}
function sidForFix(p,fix){const L=sidList(p),J=L.filter(s_=>s_[1]===fix&&(PROP.includes(p.type)||/[MJ]$/.test(s_[0])));return J[0]||L.find(s_=>s_[1]===fix)}
function setRwy(p,r){if(p.rwy===r)return;if(p.kind==='ARR'&&(p.app||p.land||p.sts)){log(p.cs+': cannot change runway now');return}p.rwy=r;if(p.kind==='DEP'){const s_=bestSid(r,p.ades,p.type);if(s_)setSid(p,s_)}else{const t=r=='03'?[rw[0],rw[1]]:[rw[2],rw[3]];p.th=t}log(p.cs+' runway '+r)}
function cellClick(e,n,btn){const td=e.target.closest('td[data-c]'),tr_=e.target.closest('tr[data-id]');if(!tr_)return;const p=planes.find(q=>q.id==tr_.dataset.id);if(!p)return;sel=p;list();if(!td||p.owner)return;
 const c=td.dataset.c,A=ACT[c];if(!A||!A[btn])return;A[btn](p,e,n)}
const ACT={
 'STS':{L:(p,e)=>p.kind==='ARR'&&p.app?null:popup(e,'Ground state',STSL.filter(([l])=>p.kind==='ARR'?(!p.app&&(l==='TXI'||l==='PRK')):(l!=='TXI'&&l!=='PRK')).map(([l,v])=>[l,()=>{setSts(p,v);if(v==='TXO'&&!p.route.length)log(p.cs+' state TXO')}]),p.sts||'(none)')},
 'C/S':{L:(p,e)=>assumeMenu(p,e),R:(p,e)=>popup(e,p.cs,[[p.xfer?'Assume':p.own?'Free':'Assume',()=>{if(p.xfer){p.xfer=false;p.nx='';log(p.cs+' transfer cancelled')}else assume(p)}],...(p.own&&nextOf(p)&&!p.xfer?[['Transfer',()=>startXfer(p,nextOf(p))]]:[]),['Flight plan…',()=>openFpl(p)],[p.hold?'Continue':'Hold short',()=>{p.hold=!p.hold;log(p.cs+(p.hold?' hold short':' continue'))}],['Taxi to assigned stand',()=>{const d=p.std&&D.dest.find(x=>x[3]==0&&x[0]==='Stand '+p.std);if(d)go(p,d)}],['Delete aircraft',()=>drop(p)]])},
 'W':{L:p=>{p.hideW=!p.hideW}},
 'STD':{L:(p,e)=>p.kind==='ARR'&&popup(e,'Stand',D.stands.map(s_=>[s_[0],()=>{p.std=s_[0];log(p.cs+' stand '+s_[0])}]),p.std)},
 'ADES':{L:p=>openFpl(p)},
 'DRWY':{L:(p,e)=>apList(e.target.closest('td'),'Assign',rwOpts(),p.rwy,v=>{setRwy(p,v);list()})},
 'ARWY':{L:(p,e)=>popup(e,'Arrival runway',['03','21'].map(r=>[r,()=>setRwy(p,r)]),p.rwy)},
 'RTE/AHD':{L:(p,e)=>apList(e.target.closest('td'),'Assign SID',sidOpts(p,p.rwy),p.sid,v=>{const s_=(D.sids[p.rwy]||[]).find(x=>x[0]===v);if(s_)setSid(p,s_);list()}),
            R:(p,e)=>apList(e.target.closest('td'),p.cs,ahdgOpts(),p.ahdg||null,v=>{p.ahdg=v;list()},true,rwFocus(p.rwy))},
 'CFL':{L:(p,e)=>apList(e.target.closest('td'),p.cs,optAlt(CFLOPT),p.cfl,v=>{p.cfl=v;if(!p.xfl)p.xfl=fmtAlt(v);list()},true)},
 'XFL':{L:(p,e)=>apList(e.target.closest('td'),p.cs,optAlt(XFLOPT),/^A/.test(p.xfl||'')?'0'+p.xfl.slice(1):p.xfl,v=>{p.xfl=fmtAlt(v);list()},true,/^A/.test(p.xfl||'')?'0'+p.xfl.slice(1):(p.xfl||'330'))},
 'COPX':{L:(p,e)=>popup(e,'Waypoint (COPX)',[...new Set(sidList(p).filter(s_=>!/^VFR/.test(s_[0])).map(s_=>s_[1]))].map(f=>[f,()=>{const s_=sidForFix(p,f);if(s_)setSid(p,s_)}]),p.copx),
         R:p=>{p.leg=!p.leg}},
 'ASSR':{L:(p,e)=>apKeypad(e.target.closest('td'),p,p.sq,v=>{if(/^[0-7]{4}$/.test(v))p.sq=v;list()},newSq)},
 'CLR':{L:(p,e)=>{if(p.kind==='DEP')openClr(p,e)}},
 'RMK':{L:(p,e)=>editCell(e,p.rmk,12,v=>{p.rmk=v.toUpperCase();if(sel===p)$('rmk').value=p.rmk})},
 'EOBT':{L:(p,e)=>editCell(e,p.eobt,4,v=>{if(/^([01]\d|2[0-3])[0-5]\d$/.test(v))p.eobt=v})},
 'SI':{L:(p,e)=>{if(p.owner||p.xfer)return;const on=CTRL.filter(c=>c.on);apList(e.target.closest('td'),p.cs,[['(none)','-']].concat(on.map(c=>[`<span>${c.id}</span><span>${c.cs}</span>`,c.id])),nextOf(p)||null,v=>{p.nxm=v;list()},true)},
  R:p=>{startXfer(p,nextOf(p))}},
 'DSQ':{L:p=>dsqMove(p,1),R:p=>dsqMove(p,-1)},
 'HS':{L:p=>{p.hold=!p.hold;log(p.cs+(p.hold?' hold short':' continue'))}}};
function dsqMove(p,d){const t=planes.filter(q=>q.kind==='DEP'&&q.sts==='TXO').sort((a,b)=>a.txoT-b.txoT),i=t.indexOf(p),q=t[i+d];if(!q)return;const x=p.txoT;p.txoT=q.txoT;q.txoT=x}
function nm(a,b){const r=Math.PI/180,dl=(b[1]-a[1])*r*Math.cos((a[0]+b[0])/2*r),dp=(b[0]-a[0])*r;return Math.hypot(dl,dp)*3440.065}
function fplRows(p){const rows=[],GGp=[57.6628,12.2798];
 if(p.kind!=='DEP'||!p.sid){return[[p.adep,'DCT','',p.ades,'']]}
 const ev=/^\d{4}$/.test(p.eobt||'')?(+p.eobt.slice(0,2))*3600+(+p.eobt.slice(2))*60:T0+T;let t=ev+600;
 const fx=(SIDF[p.rwy]||{})[p.sid]||[];let prev=['ESGG',GGp];const tas=Math.max(200,+p.tas||440);
 const add=(to,pos,aw,spd,cm)=>{t+=nm(prev[1],pos)/spd*3600;rows.push([prev[0],aw,cm,to,hhmm(t).replace(/(..)(..)/,'$1:$2')]);prev=[to,pos]};
 fx.forEach(f=>{if(FXP[f])add(f,FXP[f],p.sid,230,'ok')});
 const ap=APP[p.ades];if(ap)add(p.ades,ap,'DCT',tas,'');else rows.push([prev[0],'DCT','',p.ades,'']);return rows}
function genRoute(p){return p.kind==='DEP'?(p.copx?p.copx+' DCT ':'DCT ')+p.ades:p.adep+' DCT ESGG'}
function fplRoute(p){return p.kind==='DEP'?(p.sid?['ESGG',p.sid,p.copx,p.ades]:['ESGG','DCT',p.ades]):[p.adep,'DCT','ESGG']}
function openFpl(p){if(!p)return;if(fplEl)fplEl.remove();const e=document.createElement('div');e.className='fpl';fplEl=e;e.od=p.ades;
 const v=x=>(x==null?'':String(x)).replace(/"/g,'&quot;'),alt=p.kind==='DEP'&&p.xfl?String(parseInt(p.xfl.replace(/\D/g,''))*100):'',tas=p.tas||(p.w==='H'?480:p.w==='L'?260:440);
 const wp=fplRoute(p),route=p.route_=p.route_||genRoute(p),eta0=T0+T;
 e.innerHTML=`<div class="th"><b>Flight plan setting dialog</b><span id="fx">✕</span></div><div class="bd">
 <label>Callsign</label><input id="f_cs" value="${v(p.cs)}"><span class="full" style="grid-column:3/5;text-align:center"><label style="margin-right:8px"><input type="radio" name="frul" checked style="width:auto"> IFR</label><label><input type="radio" name="frul" style="width:auto"> VFR</label></span><label>AP data</label><input value="${v(p.type)}/${v(p.w)}-S/C">
 <label>Origin</label><input id="f_o" value="${v(p.adep)}"><label>Destination</label><input id="f_d" value="${v(p.ades)}"><label>Alternate</label><input id="f_a" value="${v(p.alt_||'')}">
 <label>TAS</label><input id="f_t" value="${tas}"><label>Altitude</label><input id="f_al" value="${alt}"><label>Squawk</label><input id="f_sq" value="${v(p.sq)}">
 <label>Dep. EST</label><input value="${v(p.eobt||'')}"><label>Actual</label><input value=""><label>Temp alt</label><input>
 <label class="full" style="grid-column:1/2">Route</label><textarea class="full" id="f_r" style="grid-column:2/-1">${v(route)}</textarea>
 <div class="wp"><table><thead><tr><th>Waypoint</th><th>Airway</th><th>Comment</th><th>Waypoint</th><th>ETA</th></tr></thead><tbody>${fplRows(p).map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td>${r[4]}</td></tr>`).join('')}</tbody></table></div>
 <label>Remarks</label><textarea class="full" id="f_rm" style="grid-column:2/-1">${v(p.remarks||'/V/'+(p.rmk?' RMK/'+p.rmk:''))}</textarea>
 <div class="bt"><button id="f_ok">OK</button><button id="f_c">Cancel</button></div></div>`;
 $('map').appendChild(e);e.style.zIndex=++zTop+50;
 const th=e.querySelector('.th');let dr=null;th.onpointerdown=ev=>{if(ev.target.closest('span')||ev.button!==2)return;th.setPointerCapture(ev.pointerId);dr=[ev.clientX-e.offsetLeft,ev.clientY-e.offsetTop]};th.onpointermove=ev=>{if(dr){e.style.left=Math.max(0,ev.clientX-dr[0])+'px';e.style.top=Math.max(0,ev.clientY-dr[1])+'px'}};th.onpointerup=()=>{dr=null};
 const close=()=>{e.remove();fplEl=null};$('fx').onclick=close;$('f_c').onclick=close;
 $('f_ok').onclick=()=>{p.cs=$('f_cs').value.trim().toUpperCase()||p.cs;p.adep=$('f_o').value.trim().toUpperCase();p.ades=$('f_d').value.trim().toUpperCase();p.alt_=$('f_a').value.trim().toUpperCase();p.tas=$('f_t').value;p.sq=$('f_sq').value||p.sq;const od=e.od,rt=$('f_r').value;
  if(p.kind==='DEP'){if(rt===p.route_&&od!==p.ades){const s_=bestSid(p.rwy,p.ades,p.type);if(s_){p.sid=s_[0];p.copx=s_[1]}p.route_=genRoute(p)}else{p.route_=rt;const s_=sidFromRoute(p.rwy,rt);if(s_){p.sid=s_[0];p.copx=s_[1]}}}else p.route_=rt;
  p.remarks=$('f_rm').value;
  if(p.kind==='DEP'){const a=parseInt($('f_al').value);if(a)p.xfl=a<=5000?'A'+String(Math.round(a/100)).padStart(2,'0'):String(Math.round(a/100)).padStart(3,'0')}close();list()}}
let lastSel=null;
function list(){$('ac').innerHTML=planes.map(p=>`<div data-id="${p.id}" class="${p===sel?'s':''}">${p.cs} ${p.kind} ${p.sts||'---'} ${Math.round(p.spd)}kt</div>`).join('')||'<span style="color:var(--mu)">No aircraft</span>';
 $('clk').textContent=clockStr(T0+T);updateAlerts();renderLists();
 [...$('stb').children].forEach(b=>b.classList.toggle('on',!!sel&&sel.sts===b.dataset.st));
 $('clrnc').classList.toggle('on',!!(sel&&sel.clr));[...$('stb').children].forEach(b=>b.disabled=!!sel&&(sel.kind==='DEP'?(b.dataset.st==='TXI'||b.dataset.st==='PRK'):(sel.app||!(b.dataset.st==='TXI'||b.dataset.st==='PRK'))));
 if(sel!==lastSel){lastSel=sel;$('rmk').value=sel?sel.rmk:''}}
$('ac').onclick=e=>{const id=e.target.dataset.id;if(id){sel=planes.find(p=>p.id==id);list()}};
