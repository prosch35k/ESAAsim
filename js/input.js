/* ---------- input ---------- */
function pick(sx,sy){let b=null,bd=16;for(const p of planes){const q=tr(p.rx??p.x,p.ry??p.y),d=Math.hypot(q[0]-sx,q[1]-sy);if(d<bd){bd=d;b=p}}return b}
let drag=null;
cv.onpointerdown=e=>{if(e.button!==0&&e.button!==2)return;cv.setPointerCapture(e.pointerId);const lp=pickLabel(e.offsetX,e.offsetY);drag={b:e.button,x:e.offsetX,y:e.offsetY,px:e.offsetX,py:e.offsetY,cx:cam.x,cy:cam.y,m:false,lp,lo:lp?[...lp.lo]:null}};
cv.onpointermove=e=>{if(typeof MAN!=='undefined'&&MAN){MAN.w=inv(e.offsetX,e.offsetY);manPreview()}if(!drag){hovP=pickLabel(e.offsetX,e.offsetY);return}hovP=drag.lp||null;const dx=e.offsetX-drag.x,dy=e.offsetY-drag.y;if(Math.hypot(dx,dy)>4){if(drag.lp?drag.b===0:drag.b===2)drag.m=true;else drag.mv=true}if(drag.m&&drag.lp){drag.lp.lo=[drag.lo[0]+dx,drag.lo[1]+dy];if(sel!==drag.lp){sel=drag.lp;list()}}else if(drag.m){const ux=e.offsetX-drag.px,uy=e.offsetY-drag.py,w=inv(W/2-ux,H/2-uy);cam.x=w[0];cam.y=w[1]}drag.px=e.offsetX;drag.py=e.offsetY};
cv.onpointerup=e=>{if(typeof MAN!=='undefined'&&MAN&&drag&&!drag.m&&!drag.mv){if(drag.b===0)manClick();else if(drag.b===2)manFinish();drag=null;return}if(drag&&drag.b===2&&drag.lp&&!drag.m&&!drag.mv&&MP.on&&MP.role==='host'&&typeof startMan==='function'){startMan(drag.lp,null);drag=null;return}if(drag&&drag.b===0&&!drag.mv&&!drag.m){const p=drag.lp||pick(e.offsetX,e.offsetY),w=inv(e.offsetX,e.offsetY);
 if(p){sel=p;if(drag.lp){const hit=r=>r&&e.offsetX>=r[0]&&e.offsetX<=r[0]+r[2]&&e.offsetY>=r[1]&&e.offsetY<=r[1]+r[3];if(hit(p._cs))tagMenu(p,e);else if(hit(p._sp)&&!p.owner)editRmk(p);else if(hit(p._std))stdMenu(p,e)}}else if(mode==2){const n=mkPlane('DEP',w[0],w[1],rh,0,'');log(n.cs+' placed')}else if(mode==1&&sel)addTo(sel,w);list()}drag=null};
cv.oncontextmenu=e=>e.preventDefault();addEventListener('contextmenu',e=>{if(!/INPUT|TEXTAREA/.test((e.target||{}).tagName||''))e.preventDefault()});
$('side').addEventListener('click',e=>{const b=e.target.closest('button,select');if(b&&sel&&sel.owner&&['stb','clrnc','taxi','tostd','hold','cont','clr','to','del'].some(i=>b.id===i||b.parentElement.id===i)){e.stopPropagation();e.preventDefault();log(sel.cs+' is controlled by '+sel.owner)}},true);
cv.onpointerleave=()=>{hovP=null};
cv.onwheel=e=>{e.preventDefault();cam.s*=e.deltaY<0?1.15:1/1.15};
$('modes').onclick=e=>{if(e.target.dataset.m){mode=+e.target.dataset.m;[...e.currentTarget.children].forEach(b=>b.classList.toggle('on',b===e.target))}};
function setSim(s){sim=s;document.querySelectorAll('#spd button,#sbs button').forEach(b=>b.classList.toggle('on',+b.dataset.s===s));list()}
$('spd').onclick=$('sbs').onclick=e=>{if(e.target.dataset.s!=null)setSim(+e.target.dataset.s)};
const STATES=[['','none'],['FRQ','FRQ'],['S/U','S/U'],['S/P','S/P'],['TXO','TXO'],['xLU','xLU'],['xTO','xTO'],['TXI','TXI'],['PRK','PRK']];
$('stb').innerHTML=STATES.map(s=>`<button data-st="${s[0]}">${s[1]}</button>`).join('');
$('stb').onclick=e=>{if(e.target.dataset.st!=null&&sel){setSts(sel,e.target.dataset.st);list()}};
$('clrnc').onclick=e=>{if(sel&&sel.kind==='DEP')openClr(sel,e)};
$('rmk').oninput=()=>{if(sel){sel.rmk=$('rmk').value.toUpperCase().slice(0,12);$('rmk').value=sel.rmk;renderLists()}};
function rwLabel(){return 'ESGG RWY '+(rwyDep===rwyArr?rwyDep:rwyDep+'/'+rwyArr)}
$('ocb').onclick=()=>{if(ocEl){ocEl.remove();ocEl=null;return}const e=document.createElement('div');e.className='fpl';ocEl=e;e.style.width='300px';e.style.left='320px';e.style.top='40px';
 const draw=()=>{e.innerHTML=`<div class="th"><b>Other controllers</b><span id="ocx">✕</span></div><div class="bd"><div class="rt" style="height:auto"><table><thead><tr><th>Online</th><th>Callsign</th><th>SI</th></tr></thead><tbody>${CTRL.map((c,i)=>`<tr><td><input type="checkbox" data-i="${i}" ${c.on?'checked':''}></td><td>${c.cs}</td><td>${c.id}</td></tr>`).join('')}</tbody></table></div></div>`;
  $('ocx').onclick=()=>{e.remove();ocEl=null};
  e.querySelectorAll('input').forEach(i=>i.onchange=()=>{const c=CTRL[+i.dataset.i];c.on=i.checked;if(!c.on)for(const p of planes){if(p.owner===c.id)p.owner='';if(p.nxm===c.id)p.nxm='';if(p.nx===c.id){p.nx='';p.xfer=false}}list()});
  const th=e.querySelector('.th');let dr=null;th.onpointerdown=ev=>{if(ev.target.closest('span')||ev.button!==2)return;th.setPointerCapture(ev.pointerId);dr=[ev.clientX-e.offsetLeft,ev.clientY-e.offsetTop]};th.onpointermove=ev=>{if(dr){e.style.left=Math.max(0,ev.clientX-dr[0])+'px';e.style.top=Math.max(0,ev.clientY-dr[1])+'px'}};th.onpointerup=()=>{dr=null}};
 $('map').appendChild(e);draw()};
function updRw(){$('rwb').title=rwLabel()}updRw();
$('rwb').onclick=()=>{if(rwEl){rwEl.remove();rwEl=null;return}const e=document.createElement('div');e.className='fpl';rwEl=e;e.style.width='420px';e.style.left='200px';e.style.top='40px';
 let st={d:rwyDep,a:rwyArr,ad:apAct.dep,aa:apAct.arr};
 const draw=()=>{e.innerHTML=`<div class="th"><b>Active airport/runway selector dialog</b><span id="rx">✕</span></div><div class="bd"><div class="rt"><table><thead><tr><th>Airport</th><th>DEP</th><th>ARR</th><th>RWY</th><th>DEP</th><th>ARR</th></tr></thead><tbody>${['03','21'].map(r=>`<tr class="${r===st.d||r===st.a?'on':''}"><td>ESGG</td><td><input type="checkbox" data-k="ad" ${st.ad?'checked':''}></td><td><input type="checkbox" data-k="aa" ${st.aa?'checked':''}></td><td>${r}</td><td><input type="checkbox" data-k="d" data-r="${r}" ${st.d===r?'checked':''}></td><td><input type="checkbox" data-k="a" data-r="${r}" ${st.a===r?'checked':''}></td></tr>`).join('')}</tbody></table></div><div class="bt"><button id="rok">OK</button><button id="rc">Cancel</button></div></div>`;
  const close=()=>{e.remove();rwEl=null};$('rx').onclick=close;$('rc').onclick=close;
  e.querySelectorAll('input').forEach(i=>i.onchange=()=>{const k=i.dataset.k;if(k==='ad')st.ad=i.checked;else if(k==='aa')st.aa=i.checked;else st[k]=i.dataset.r;draw()});
  $('rok').onclick=()=>{const ch=rwyDep!==st.d||rwyArr!==st.a;rwyDep=st.d;rwyArr=st.a;if(ch)planes.forEach(q=>{if(q.kind==='DEP'&&!q.force&&!q.clr&&!q.to&&!q.air)applyRoute(q)});apAct={dep:st.ad,arr:st.aa};updRw();if(ch)log('Active runways: DEP '+rwyDep+', ARR '+rwyArr);close();list()};
  const th=e.querySelector('.th');let dr=null;th.onpointerdown=ev=>{if(ev.target.closest('span')||ev.button!==2)return;th.setPointerCapture(ev.pointerId);dr=[ev.clientX-e.offsetLeft,ev.clientY-e.offsetTop]};th.onpointermove=ev=>{if(dr){e.style.left=Math.max(0,ev.clientX-dr[0])+'px';e.style.top=Math.max(0,ev.clientY-dr[1])+'px'}};th.onpointerup=()=>{dr=null}};
 $('map').appendChild(e);draw()};
$('hold').onclick=()=>{if(sel){sel.hold=true;log(sel.cs+' hold short');list()}};$('cont').onclick=()=>{if(sel){sel.hold=false;log(sel.cs+' continue');list()}};
$('clr').onclick=()=>{if(sel){sel.route=[];sel.last=null;sel.pend=null}};
$('del').onclick=()=>{drop(sel);list()};
$('to').onclick=()=>{const p=sel;if(!p||p.kind!=='DEP')return;doTakeoff(p);list()};
$('taxi').onclick=()=>{if(sel){go(sel,D.dest[+$('dest').value]);list()}};
$('tostd').onclick=()=>{const p=sel;if(!p||!p.std)return;const d=D.dest.find(x=>x[3]==0&&x[0]==='Stand '+p.std);if(d){go(p,d);list()}};
$('net').onclick=e=>{showNet=!showNet;e.target.classList.toggle('on',showNet)};
$('spst').onclick=()=>{const s=D.stands[+$('stsel').value],p=mkPlane('DEP',s[1],s[2],(Math.atan2(-s[1],-s[2])*180/Math.PI+360)%360,0,s[0]);log(p.cs+' at stand '+s[0]);list()};
$('spar').onclick=()=>{const th=rwyArr=='03'?[rw[0],rw[1]]:[rw[2],rw[3]],h=rwyArr=='03'?rh:(rh+180)%360,r_=h*Math.PI/180;
 const p=mkPlane('ARR',th[0]-Math.sin(r_)*5500,th[1]-Math.cos(r_)*5500,h,135,rnd(D.stands)[0]);p.th=th;p.app=true;p.std=autoStand(p)||p.std;log(p.cs+' on final RWY '+rwyArr);list()};
$('stsel').innerHTML=D.stands.map((s,i)=>`<option value="${i}">Stand ${s[0]}</option>`).join('');
$('dest').innerHTML=D.dest.map((d,i)=>`<option value="${i}">${d[0]}</option>`).join('');

function editRmk(p){if(p.edRmk)return;const r=p._sp;if(!r)return;p.edRmk=true;const i=document.createElement('input');i.id='rmkin';i.value=p.rmk||'';i.maxLength=12;
 i.style.cssText=`position:absolute;z-index:9;left:${r[0]-2}px;top:${r[1]-1}px;width:${Math.max(86,r[2]+12)}px;height:${r[3]}px;box-sizing:border-box;font:500 14px "SMR ESGG","DejaVu Sans Mono",Menlo,Consolas,monospace;padding:0 2px;background:rgb(108,108,111);color:#fff;border:1px solid #000;border-radius:0;outline:none;text-transform:uppercase`;
 $('map').appendChild(i);i.focus();i.select();let done=false;
 const fin=ok=>{if(done)return;done=true;if(ok){p.rmk=i.value.trim().toUpperCase().slice(0,12);if(sel===p)$('rmk').value=p.rmk;renderLists()}p.edRmk=false;i.remove()};
 i.onkeydown=e=>{e.stopPropagation();if(e.key==='Enter')fin(true);else if(e.key==='Escape')fin(false)};i.onkeyup=e=>e.stopPropagation();i.onblur=()=>fin(true);i.onpointerdown=e=>e.stopPropagation()}
