/* ---------- mentor menu: interactive radio log (pending pilot requests) ---------- */
const PEND=[],ARCH=[];let pendId=0,showArch=false;
function archive(r){ARCH.unshift(Object.assign({},r,{done:clockStr(T0+T)}));if(ARCH.length>80)ARCH.pop()}
function addPend(p,t){const k=/request clearance/i.test(t)?'clr':/request pushback/i.test(t)?'push':/request start-?up/i.test(t)?'start':/request taxi|on taxiway/i.test(t)?'taxi':null;if(!k)return;PEND.unshift({id:++pendId,cs:p.cs,t,k,at:clockStr(T0+T)});if(PEND.length>60)PEND.pop();pendRender()}
function pendRender(){const e=$('pend');if(!e)return;
 const ab=$('arb');if(ab){ab.classList.toggle('on',showArch);ab.textContent=showArch?'Pending':'Archive';ab.title=showArch?'Back to pending requests':'Show acknowledged requests'}
 const ph=document.querySelector('#side .ph span');if(ph)ph.textContent=showArch?'Archive':'Pending requests';
 if(showArch)e.innerHTML=ARCH.length?ARCH.map(r=>`<div class="pi ar"><div class="px"><div class="pcs">${r.cs} <span class="pt">${r.done}</span></div><div class="ptx">${r.t.replace(/</g,'&lt;')}</div></div></div>`).join(''):'<div class="pe">No acknowledged requests</div>';
 else e.innerHTML=PEND.length?PEND.map(r=>`<div class="pi" data-id="${r.id}"><div class="px"><div class="pcs">${r.cs}</div><div class="ptx">${r.t.replace(/</g,'&lt;')}</div></div>${r.k==='taxi'?'<div class="pdb"><button class="pk" title="Standard taxi route">&#10003;</button><button class="pm" title="Draw the taxi route manually">Man</button></div>':r.k==='push'?'<div class="pdb"><button class="pd" data-d="south" title="Face south (left on screen)">S</button><button class="pd" data-d="north" title="Face north (right on screen)">N</button></div>':'<button class="pk" title="Readback correct - done">&#10003;</button>'}</div>`).join(''):'<div class="pe">No pending requests</div>';
 $('sb').classList.toggle('pn',PEND.length>0)}
function pendSync(){const n=PEND.length;for(let i=PEND.length-1;i>=0;i--)if(!planes.some(p=>p.cs===PEND[i].cs))PEND.splice(i,1);if(n!==PEND.length)pendRender()}
const CONN=['K','J','H','G','F','L'];
/* closest point of a taxiway's edges to (x,y); optional ahead-of-heading filter; edges sampled every ~8 m */
function conDist(L,x,y,h){const fx=h==null?0:Math.sin(h*Math.PI/180),fy=h==null?0:Math.cos(h*Math.PI/180);let best=1e9;
 NE.forEach((e,i)=>{if(!TWP[i].has(L))return;for(let k=1;k<e.pts.length;k++){const P=e.pts[k-1],Q=e.pts[k],n=Math.max(1,Math.ceil(Math.hypot(Q[0]-P[0],Q[1]-P[1])/8));for(let s=0;s<=n;s++){const px=P[0]+(Q[0]-P[0])*s/n,py=P[1]+(Q[1]-P[1])*s/n,dx=px-x,dy=py-y;if(h!=null&&dx*fx+dy*fy<=0)continue;const d=Math.hypot(dx,dy);if(d<best)best=d}}});return best}
function pickConn(p){if(p.kind==='ARR'){const s=D.stands.find(z=>z[0]===p.std);if(!s)return null;let b=null,bd=1e9;for(const L of CONN){const d=conDist(L,s[1],s[2]);if(d<bd){bd=d;b=L}}return b}
 let b=null,bd=1e9;for(const L of CONN){const d=conDist(L,p.x,p.y,p.hdg);if(d<bd){bd=d;b=L}}if(b)return b;for(const L of CONN){const d=conDist(L,p.x,p.y);if(d<bd){bd=d;b=L}}return b}
function stdTaxi(p){
 if(p.kind==='ARR'){const L=pickConn(p);if(!L)return false;exec({act:'taxi',stand:p.std,via:['Y',L],p,raw:'',found:true});return true}
 /* departures: connectors ahead of the aircraft, nearest first; after a pushback the first leg must go the way the nose points */
 const h=p.pushH!=null?p.pushH:p.hdg,fx=Math.sin(h*Math.PI/180),fy=Math.cos(h*Math.PI/180);
 let L=CONN.map(c=>[c,conDist(c,p.x,p.y,h)]).filter(x=>x[1]<1e8).sort((a,b)=>a[1]-b[1]).map(x=>x[0]);
 if(!L.length)L=CONN.map(c=>[c,conDist(c,p.x,p.y)]).sort((a,b)=>a[1]-b[1]).map(x=>x[0]);
 const sv=[p.route,p.last,p.wt,p.pend];
 for(const c of L){p.route=[];p.last=null;exec({act:'taxi',hp:'Y',hpDef:true,rwy:rwyDep,via:[c,'Z'],p,raw:'',found:true});
  const r0=p.route[0],f=r0&&p.route.find(q=>Math.hypot(q[0]-r0[0],q[1]-r0[1])>8);
  if(p.pushH==null||!f||((f[0]-r0[0])*fx+(f[1]-r0[1])*fy)>-3)return true;
  p.route=sv[0];p.last=sv[1];p.wt=sv[2];p.pend=sv[3]}
 /* nothing satisfied the direction: fall back to the nearest connector */
 exec({act:'taxi',hp:'Y',hpDef:true,rwy:rwyDep,via:[L[0],'Z'],p,raw:'',found:true});return true}
/* manual taxi route: left click = add node (route follows the ground network), right click = finish at the last node */
let MAN=null;
function manPreview(){if(!MAN||!MAN.w)return;const A=MAN.last||snap(MAN.p.x,MAN.p.y),B=snap(MAN.w[0],MAN.w[1]);MAN.pv=null;if(!A||!B||B.d>80)return;const r=findRoute(A,B);if(r&&r.length){MAN.pv=r;MAN.pvB=B}}
function manClick(){if(!MAN||!MAN.pv)return;MAN.pts.push(...MAN.pv);MAN.nodes.push(MAN.pv[MAN.pv.length-1]);MAN.last=MAN.pvB;MAN.pv=null;manPreview()}
function manFinish(){const M=MAN;MAN=null;if(!M||!M.pts.length){log('Manual taxi route cancelled');return}const p=M.p,was0=p.spd<1&&!p.route.length;
 p.route=M.pts;p.last=M.last;p.hold=false;p.vhold=false;p.pend=null;if(was0)p.wt=T+10+Math.random()*10;
 for(let i=PEND.length-1;i>=0;i--)if(PEND[i].id===M.pid||(PEND[i].k==='taxi'&&PEND[i].cs===p.cs)){archive(PEND[i]);PEND.splice(i,1)}pendRender();log(p.cs+' taxi (manual route)');list()}
function manCancel(){if(MAN){MAN=null;log('Manual taxi route cancelled')}}
function startMan(p,pid){MAN={p,pid,pts:[],nodes:[],last:null,pv:null,w:null};log(p.cs+': draw the taxi route - left click adds a node, right click finishes, Esc cancels')}
function drawMan(){if(!MAN)return;g.save();g.lineWidth=2.5;g.setLineDash([7,4]);g.strokeStyle='#ffd400';const pts=[[MAN.p.rx??MAN.p.x,MAN.p.ry??MAN.p.y]].concat(MAN.pts);
 if(pts.length>1){g.beginPath();pts.forEach((q,k)=>{const w=tr(q[0],q[1]);k?g.lineTo(...w):g.moveTo(...w)});g.stroke()}
 if(MAN.pv){g.strokeStyle='#ffffff';g.beginPath();const a=pts[pts.length-1],s=tr(a[0],a[1]);g.moveTo(...s);MAN.pv.forEach(q=>g.lineTo(...tr(q[0],q[1])));g.stroke()}
 g.setLineDash([]);g.fillStyle='#ffd400';for(const n of MAN.nodes){const w=tr(n[0],n[1]);g.fillRect(w[0]-3,w[1]-3,6,6)}g.restore()}
addEventListener('keydown',e=>{if(MAN&&e.key==='Escape')manCancel()});
$('arb').onclick=()=>{showArch=!showArch;pendRender()};
$('pend').onclick=ev=>{const b=ev.target.closest('.pk,.pd,.pm');if(!b)return;const id=+b.closest('.pi').dataset.id,i=PEND.findIndex(r=>r.id===id);if(i<0)return;const r=PEND[i],p=planes.find(q=>q.cs===r.cs);if(!p){PEND.splice(i,1);pendRender();return}
 if(b.classList.contains('pm')){startMan(p,id);return}
 archive(r);PEND.splice(i,1);
 if(b.classList.contains('pd'))exec({act:'pushback',dir:b.dataset.d,p,raw:'',found:true});
 else if(r.k==='taxi')stdTaxi(p);
 else if(r.k==='start'){p.pushed=true;p.pbT=T-40;log(p.cs+' start-up approved')}
 else if(p.rules!=='V'&&p.pushReqAt==null)p.pushReqAt=T+60;/* clearance done = readback correct: push request follows */
 pendRender();list()};
pendRender();
