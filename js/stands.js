/* ---------- arrival stand assignment (rules from GRpluginStands.txt, parsed into data/stands.js) ---------- */
const ACDIM={A320:{ws:35.8,len:37.6,wtc:'M'},B738:{ws:35.8,len:39.5,wtc:'M'},E190:{ws:28.7,len:36.2,wtc:'M'},AT76:{ws:27.05,len:27.2,wtc:'M'},SF34:{ws:21.4,len:19.7,wtc:'L'},A21N:{ws:35.8,len:44.5,wtc:'M'},A333:{ws:60.3,len:63.7,wtc:'H'},B789:{ws:60.1,len:62.8,wtc:'H'}};
const SCHENGEN_AP=new Set(['ESSA','ENGM','EKCH','EFHK','EHAM','EDDF','LFPG','LEMD','LOWW','EPWA','LSZH','ESGG']);
const WCODE={A:15,B:24,C:36,D:52,E:65,F:80};
const typeMatch=(list,t)=>list.some(a=>a==='*'||(a.endsWith('*')?t.startsWith(a.slice(0,-1))&&t.length>a.length-1:a===t));
function standOccupied(s,except){return planes.some(q=>q!==except&&((q.kind==='ARR'&&q.std===s)||(q.kind==='DEP'&&!q.air&&q.spd<2&&parkedStand(q)===s)))}
// stands that are blocked / dimension-limited by other stands that are assigned or occupied
function standBlocks(p){const bl=new Set(),lim={};
 const occ=new Set();for(const q of planes){if(q===p)continue;if(q.kind==='ARR'&&q.std)occ.add([q.std,q]);else if(q.kind==='DEP'&&!q.air&&q.spd<2){const s=parkedStand(q);if(s)occ.add([s,q])}}
 for(const [s,q] of occ){const dm=ACDIM[q.type]||{ws:36,len:40};
  for(const d of GST.defs.filter(x=>x.name===s)){
   for(const[b,woc,ln] of d.blocks){const lim=woc?(WCODE[woc]||parseFloat(woc)):0;if(!woc||dm.ws>lim||(ln&&dm.len>ln))b.forEach(x=>bl.add(x))}
   for(const L of d.limits){const lim=WCODE[L[1]]||parseFloat(L[1]);if(dm.ws>lim){const lw=WCODE[L[2]]||parseFloat(L[2]);L[0].split(',').forEach(x=>{lim[x]=Math.min(lim[x]||1e9,lw)})}}}}
 return{bl,lim}}
function standFits(d,p,dm,relax){const t=p.type;
 if(d.manual)return false;
 if(d.use&&!d.use.includes('A'))return false;               // sim aircraft are airliners (use category A)
 if(d.atyp.length&&!typeMatch(d.atyp,t))return false;
 if(d.notatyp.length&&typeMatch(d.notatyp,t))return false;
 if(d.wtc&&!d.wtc.includes(dm.wtc))return false;
 if(d.notwtc&&d.notwtc.includes(dm.wtc))return false;
 if(d.ws&&(dm.ws<d.ws[0]||dm.ws>d.ws[1]))return false;
 if(d.len&&(dm.len<d.len[0]||dm.len>d.len[1]))return false;
 if(!relax){const sch=SCHENGEN_AP.has(p.adep);if(d.sch===1&&!sch)return false;if(d.sch===-1&&sch)return false}
 return true}
function autoStand(p,avoidCurrent){const dm=ACDIM[p.type]||{ws:36,len:40,wtc:p.w||'M'},have=new Set(D.stands.map(s=>String(s[0])));
 const{bl,lim}=standBlocks(p);
 for(const relax of[false,true]){
  let C=GST.defs.filter(d=>have.has(d.name)&&!bl.has(d.name)&&!standOccupied(d.name,p)&&standFits(d,p,dm,relax)&&(lim[d.name]===undefined||dm.ws<=lim[d.name]));
  if(avoidCurrent&&p.std){const o=C.filter(d=>d.name!==p.std);if(o.length)C=o}
  if(!C.length)continue;
  const pris=[...new Set(C.map(d=>d.pri))].sort((a,b)=>b-a),mine=GST.lists.filter(l=>l.cs.some(c=>p.cs.startsWith(c)));
  const pick=a=>a[Math.random()*a.length|0].name;
  if(mine.length){
   for(const pr of pris){const G=C.filter(d=>d.pri===pr),w={};
    for(const l of mine)for(const s of l.st)if(G.some(d=>d.name===s))w[s]=(w[s]||0)+l.pts;
    const ks=Object.keys(w),pos=ks.filter(k=>w[k]>0),pool=pos.length?pos:ks;
    if(pool.length){if(!pos.length)return pool[Math.random()*pool.length|0];let r=Math.random()*pool.reduce((a,k)=>a+w[k],0);for(const k of pool){r-=w[k];if(r<=0)return k}return pool[0]}}
  }
  const top=C.filter(d=>d.pri===pris[0]);return pick(top)}
 return avoidCurrent?p.std:''}
function stdMenu(p,e){if(p.kind!=='ARR'||p.owner)return;closeAp();closeMenu();const m=document.createElement('div');m.className='tm';apEl=m;const box=boxAt(e);
 m.innerHTML=`<div class="tt">${p.cs} ${p.std||''}</div><div class="ti" data-a="auto">Auto</div><div class="ti" data-a="manual">Manual</div>`;
 m.onclick=ev=>{const t=ev.target.closest('[data-a]');if(!t)return;closeAp();
  if(t.dataset.a==='auto'){const s=autoStand(p,true);if(s){p.std=s;log(p.cs+' stand '+s+' (auto)')}else log(p.cs+': no stand available')}
  else apList(box,'Stand',D.stands.map(s_=>[s_[0],s_[0]]),p.std,v=>{p.std=v;log(p.cs+' stand '+v);list()},true);
  list()};
 placeAt(m,e.clientX-m.offsetWidth/2,e.clientY-18)}
