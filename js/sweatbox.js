/* Sweatbox (.txt) import: loads flight plans; ground aircraft spawn at nearest stand, ESGG arrivals spawn on final */
const LL=(la,lo)=>[(lo-12.2832)*111320*Math.cos(57.6629*Math.PI/180),(la-57.6629)*111132];
function parseSweatbox(txt){const L=txt.split(/\r?\n/),pos={},fp={};
 let cur=null;for(const l of L){if(l.startsWith('@N:')){const f=l.split(':');cur=f[1];const pbh=+f[8]||0;pos[f[1]]={sq:f[2],la:+f[4],lo:+f[5],galt:+f[6],hdg:((pbh>>2)&1023)*360/1024}}
  else if(l.startsWith('START:')&&cur&&fp[cur])fp[cur].start=+l.slice(6)||0;
  else if(l.startsWith('$FP')){const f=l.split(':'),cs=f[0].slice(3);fp[cs]={cs,rules:f[2],type:(f[3]||'').split('/')[0],tas:f[4],adep:f[5],eobt:f[6],cruise:+f[8]||0,ades:f[9],alt:f[14],remarks:f[15],route:f.slice(16).join(':').trim()}}}
 return Object.keys(fp).map(c=>({...fp[c],...(pos[c]||{})}))}
let SPAWNQ=[];
function importSweatbox(txt){const fl=parseSweatbox(txt);SPAWNQ=SPAWNQ.concat(fl.map(f=>({at:T+(f.start||0)*60,f})));SPAWNQ.sort((a,b)=>a.at-b.at);
 const n=fl.length;spawnDue();list();log('Sweatbox: '+n+' flights loaded, spawning by START time ('+SPAWNQ.length+' waiting)')}
function spawnDue(){while(SPAWNQ.length&&SPAWNQ[0].at<=T)spawnFlight(SPAWNQ.shift().f)}
function spawnFlight(f){const keep=sel,gnd=f.adep==='ESGG'&&f.la,xy=f.la?LL(f.la,f.lo):null;
 const st=gnd&&xy?D.stands.map(s=>[s,Math.hypot(s[1]-xy[0],s[2]-xy[1])]).sort((a,b)=>a[1]-b[1])[0]:null;
 $('cs').value=f.cs;let p;
 if(st&&st[1]<400){const s=st[0];p=mkPlane('DEP',s[1],s[2],f.hdg!=null&&!isNaN(f.hdg)?f.hdg:(Math.atan2(-s[1],-s[2])*180/Math.PI+360)%360,0,s[0])}
 else if(f.ades==='ESGG'){const th=rwyArr=='03'?[rw[0],rw[1]]:[rw[2],rw[3]],h=rwyArr=='03'?rh:(rh+180)%360,r_=h*Math.PI/180;
  p=mkPlane('ARR',th[0]-Math.sin(r_)*5500,th[1]-Math.cos(r_)*5500,h,135,rnd(D.stands)[0]);p.th=th;p.app=true;p.rwy=rwyArr}
 else{$('cs').value='';return}
 p.type=f.type||p.type;p.w=WTC[p.type]||ACDIM[p.type]?.wtc||(/^(P28R|TRIN|SR22|C172)$/.test(p.type)?'L':'M');
 p.adep=f.adep;p.ades=f.ades;p.tas=f.tas;p.alt_=f.alt==='ESGG'&&f.ades==='ESGG'?'':(f.alt||'');p.rules=f.rules;p.remarks=f.remarks||'';p.route_=f.route;
 if(/^\d{4}$/.test(f.sq||''))p.sq=f.sq;
 if(p.kind==='DEP'){p.eobt=/^\d{4}$/.test(f.eobt)?f.eobt:p.eobt;const c=f.cruise;p.xfl=c?(c<=5000?'A'+String(Math.round(c/100)).padStart(2,'0'):String(Math.round(c/100)).padStart(3,'0')):'';applyRoute(p)}
 else{p.std=autoStand(p)||p.std}
 sel=keep;$('cs').value='';log(p.cs+' appeared ('+p.kind+')')}
const sbf=document.createElement('input');sbf.type='file';sbf.accept='.txt,.sweatbox,text/plain';sbf.style.display='none';document.body.appendChild(sbf);
$('swb').onclick=()=>sbf.click();
sbf.onchange=()=>{const f=sbf.files[0];if(!f)return;f.text().then(importSweatbox);sbf.value=''};
