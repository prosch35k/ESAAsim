/* Route parsing / expansion using nav data (fixes + airways) */
const posOf=n=>NAV.fx[n]||FIXP[n]||FXP[n]||APP[n]||null;
const AWG={};for(const[k,v]of Object.entries(NAV.aw)){const m=AWG[k]={};for(const[a,b]of v){(m[a]=m[a]||[]).push(b);(m[b]=m[b]||[]).push(a)}}
function awPath(aw,a,b){const g=AWG[aw];if(!g||!g[a]||!g[b])return null;const prev={[a]:null},q=[a];
 for(let i=0;i<q.length;i++){const n=q[i];if(n===b)break;for(const m of g[n]){if(!(m in prev)){prev[m]=n;q.push(m)}}}
 if(!(b in prev))return null;const r=[];for(let n=b;n!=null;n=prev[n])r.unshift(n);return r}
const isLvl=t=>/^[NKM]\d{3,4}[FSAM]\d{3,4}$/.test(t)||/^[FSAM]\d{3,4}$/.test(t);
/* tokens -> list of {t:'sid'|'dct'|'aw'|'fix',v} */
function routeTokens(route,rwy,adep,ades){const out=[];
 for(let t of(route||'').toUpperCase().split(/\s+/)){if(!t)continue;t=t.split('/')[0];if(!t||isLvl(t)||t===adep&&!out.length||t===ades)continue;
  if(t==='DCT')out.push({t:'dct'});else if((D.sids[rwy]||[]).some(s=>s[0]===t)&&!out.length)out.push({t:'sid',v:t});
  else if(AWG[t]&&!posOf(t))out.push({t:'aw',v:t});else out.push({t:'fix',v:t})}
 return out}
/* first point of route -> SID for runway (exit fix name or SID name) */
function sidFromFirst(rwy,route,adep){const tk=routeTokens(route,rwy,adep||'ESGG','').filter(x=>x.t!=='dct');
 if(!tk.length)return null;const f=tk[0];const L=D.sids[rwy]||[];return L.find(s=>s[0]===f.v)||L.find(s=>s[1]===f.v)||null}
/* expand to rows [from, airway, comment, to, ETA] */
function expandRoute(o){const{kind,rwy,route,adep,ades,sid,eobt,tas}=o,rows=[],GGp=[57.6628,12.2798];
 const ev=/^\d{4}$/.test(eobt||'')?(+eobt.slice(0,2))*3600+(+eobt.slice(2))*60:T0+T;let t=ev+600;const spd0=Math.max(200,+tas||440);
 let cur=kind==='DEP'?'ESGG':adep,curP=kind==='DEP'?GGp:posOf(adep),first=true;
 const add=(to,aw,cm,spd)=>{const p=posOf(to);if(p&&curP)t+=nm(curP,p)/(spd||spd0)*3600;rows.push([cur,aw,cm,to,p&&curP?hhmm(t).replace(/(..)(..)/,'$1:$2'):'']);cur=to;if(p)curP=p};
 let tk=routeTokens(route,rwy,adep,ades);
 if(kind==='DEP'&&sid){const fx=(SIDF[rwy]||{})[sid]||[];fx.forEach(f=>{if(posOf(f))add(f,sid,'ok',230)});
  const ex=(D.sids[rwy]||[]).find(s=>s[0]===sid)?.[1];while(tk.length&&(tk[0].t==='sid'||tk[0].t==='dct'||tk[0].v===ex))tk.shift()}
 else if(kind==='DEP'&&tk.length&&tk[0].t==='fix'&&!posOf(tk[0].v)){}
 let aw=null;
 for(let i=0;i<tk.length;i++){const k=tk[i];
  if(k.t==='dct'){aw=null;continue}
  if(k.t==='aw'){aw=k.v;continue}
  if(k.t==='sid')continue;
  if(aw&&cur!==k.v){const pth=awPath(aw,cur,k.v);
   if(pth){pth.slice(1).forEach(n=>add(n,aw,'ok'))}else add(k.v,aw,posOf(k.v)?'not on airway':'');aw=null}
  else{add(k.v,'DCT','')}}
 if(cur!==(kind==='DEP'?ades:'ESGG')){add(kind==='DEP'?ades:'ESGG','DCT','')}
 return rows}

/* Apply SID logic from the route text (DEP):
   - route starts with a SID name (optionally /RWY): force runway + SID (green = runway in use, pink = other runway)
   - otherwise: first point with a SID in the active departure runway -> that SID; else the bare point is shown as RTE */
function applyRoute(p){if(p.kind!=='DEP')return;
 const tk=(p.route_||'').toUpperCase().split(/\s+/).filter(t=>t&&!isLvl(t)&&t!=='DCT'&&t!=='ESGG');if(!tk.length)return;
 let rF=null;const m0=tk[0].match(/^ESGG\/(\d\d)/);if(m0){rF=m0[1];tk.shift();if(!tk.length){p.rwy=rF;p.force=true;return}}
 const[nmz,sfx]=tk[0].split('/'),rs=/^\d\d[LRC]?$/.test(sfx||'')?sfx.slice(0,2):null;
 for(const r of rs?[rs,'03','21']:['03','21']){const s=(D.sids[r]||[]).find(x=>x[0]===nmz);
  if(s){p.rwy=r;p.sid=s[0];p.copx=s[1];p.force=true;p.ahdg='';return}}
 const R=rF||rwyDep;p.force=!!rF;p.rwy=R;let L=(D.sids[R]||[]).filter(x=>x[1]===nmz&&!/^VFR/.test(x[0]));
 if(!PROP.includes(p.type)){const J=L.filter(x=>/[MJ]$/.test(x[0]));if(J.length)L=J}
 if(L.length){p.sid=L[0][0];p.copx=L[0][1]}else{p.sid=nmz;p.copx=nmz}p.ahdg=''}
/* route text editing for forced SID / runway */
function routeHead(p){const t=(p.route_||genRoute(p)).toUpperCase().split(/\s+/).filter(Boolean),lead=[];let was=null;while(t.length&&isLvl(t[0].split('/')[0]))lead.push(t.shift());
 if(t.length&&/^ESGG(\/\d\d)?$/.test(t[0]))t.shift();
 if(t.length){const n=t[0].split('/')[0],s=['03','21'].map(r=>(D.sids[r]||[]).find(x=>x[0]===n)).find(Boolean);if(s){was=s;t.shift()}}
 return{t,was,lead}}
function forceSid(p,s_){const{t,was,lead}=routeHead(p);if(was&&t[0]===was[1])t.shift();if(t[0]===s_[1])t.shift();
 p.route_=[...lead,s_[0]+'/'+p.rwy,...t].join(' ');applyRoute(p)}
function forceRwy(p,r){const{t,was,lead}=routeHead(p);if(was)t.unshift(was[1]);p.route_=[...lead,'ESGG/'+r,...t].join(' ');applyRoute(p)}
