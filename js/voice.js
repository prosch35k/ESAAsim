/* ---------- voice: ATC phraseology parser, pilot readbacks ---------- */
let VIA=null,VIAL=null;
function dijV(src){const m=VIAL.length,M=m+1,N=NET.n.length,d=Array.from({length:N},()=>Array(M).fill(1e9)),pr=Array.from({length:N},()=>Array(M).fill(null)),done=new Set(),q=[[src,0]];d[src][0]=0;
 while(q.length){q.sort((a,b)=>d[a[0]][a[1]]-d[b[0]][b[1]]);const[u,k]=q.shift();if(done.has(u*M+k))continue;done.add(u*M+k);
  for(const[v,i]of ADJ[u]){const T=TWP[i];let k2=k,c;if(k<m&&T.has(VIAL[k])){k2=k+1;c=.3}else if(k>0&&T.has(VIAL[k-1]))c=.3;else c=k===m?1:3;const nd=d[u][k]+NE[i].len*c*(TWP[i].has(VIAL[m-1])?.5:1);if(nd<d[v][k2]){d[v][k2]=nd;pr[v][k2]=[u,k,i];q.push([v,k2])}}}
 return{d,pr}}const TWL=NE.map(e=>new Set((e.n||'').split(/[\/\- ]/).filter(x=>/^[A-Z]$/.test(x)))),TWP=NE.map(e=>{const n=e.n||'';return new Set((n.includes('/')?n.split('/')[0]:n).split(/[\- ]/).filter(x=>/^[A-Z]$/.test(x)))});
const vw=i=>VIA&&VIA.size?(TWL[i].size&&[...TWL[i]].some(x=>VIA.has(x))?.3:1.6):1;
const TELE={WIF:'Widerøe',FPO:'french post',AFR:'airfrans',SAS:'scandinavian',NSZ:'norwegian',FIN:'finnair',DLH:'lufthansa',RYR:'ryanair',WZZ:'wizz',KLM:'Keyelem',BAW:'speedbird',EZY:'easy',AUI:'ukraine international'};
const NUMW={zero:'0',one:'1',two:'2',three:'3',tree:'3',four:'4',fower:'4',five:'5',fife:'5',six:'6',seven:'7',eight:'8',nine:'9',niner:'9'};
const PHON={alpha:'a',alfa:'a',bravo:'b',charlie:'c',delta:'d',echo:'e',foxtrot:'f',golf:'g',hotel:'h',india:'i',juliet:'j',juliett:'j',kilo:'k',lima:'l',mike:'m',november:'n',oscar:'o',papa:'p',quebec:'q',romeo:'r',sierra:'s',tango:'t',uniform:'u',victor:'v',whiskey:'w',xray:'x','x-ray':'x',yankee:'y',zulu:'z'};
const PHONR={};for(const[w,c]of Object.entries(PHON))(PHONR[c]=PHONR[c]||[]).push(w.replace('-','[- ]?'));
const PHN={A:'Alfa',B:'Bravo',C:'Charlie',D:'Delta',E:'Echo',F:'Foxtrot',G:'Golf',H:'Hotel',I:'India',J:'Juliett',K:'Kilo',L:'Lima',M:'Mike',N:'November',O:'Oscar',P:'Papa',Q:'Quebec',R:'Romeo',S:'Sierra',T:'Tango',U:'Uniform',V:'Victor',W:'Whiskey',X:'X-ray',Y:'Yankee',Z:'Zulu'};
const DW=['zero','one','two','three','four','five','six','seven','eight','niner'];
const spD=s=>String(s).split('').map(c=>DW[+c]??c).join(' ');
const CITY={ESSA:'Arlanda',ENGM:'Oslo',EKCH:'Copenhagen',EFHK:'Helsinki',EGLL:'Heathrow',EHAM:'Amsterdam',EDDF:'Frankfurt',LFPG:'Paris',LEMD:'Madrid',LOWW:'Vienna',EPWA:'Warsaw',LSZH:'Zurich',EHRD:'Rotterdam',ESKN:'Skavsta',ENTO:'Torp',EGSS:'Stansted',EDDM:'Munich',LEMG:'Malaga',ESGG:'Landvetter',ESSB:'Bromma',ESMS:'Malmo',ESGP:'Save',EDDN:'Nuremberg',ESTA:'Angelholm',EKDK:'Copenhagen'};
const TYPES={A319:'Airbus three nineteen',A320:'Airbus three twenty',A321:'Airbus three twenty one',A20N:'Airbus three twenty neo',A21N:'Airbus three twenty one neo',A332:'Airbus three thirty',A333:'Airbus three thirty',A359:'Airbus three fifty',A388:'Airbus three eighty',BCS3:'Airbus A two twenty three hundred',
 B737:'Boeing seven three seven',B738:'Boeing seven three seven eight hundred',B739:'Boeing seven three seven nine hundred',B38M:'Boeing seven three seven max eight',B752:'Boeing seven five seven',B763:'Boeing seven six seven',B772:'Boeing seven seven seven',B77W:'Boeing seven seven seven three hundred',B788:'Boeing seven eight seven eight',B789:'Boeing seven eight seven nine',B744:'Boeing seven four seven four hundred',
 E170:'Embraer one seventy',E190:'Embraer one ninety',E195:'Embraer one ninety five',AT72:'A T R seven two',AT76:'A T R seven two six hundred',DH8A:'Dash eight',DH8D:'Dash eight four hundred',SF34:'Saab three forty',SB20:'Saab two thousand',CRJ9:'C R J nine hundred',P28R:'Piper Arrow',TRIN:'Socata Trinidad',C172:'Cessna one seventy two',SR22:'Cirrus S R two two'};
const ACCENT={KLM:'nl',AFR:'fr',FPO:'fr',WIF:'no',SAS:['sv','no','da'],RYR:'sv',DLH:'de',FIN:'fi',NSZ:'no',BAW:'en-GB',EZY:'en-GB',WZZ:'pl',AUI:'uk'};
function langOf(p){return 'en';const m=(p.cs.match(/^[A-Z]+/)||[''])[0],a=ACCENT[m];return Array.isArray(a)?a[hashN(p.cs)%a.length]:(a||'en')}
function speechOf(p,t){for(const k in TYPES)if(t.includes(k))t=t.replace(new RegExp('\\b'+k+'\\b','g'),TYPES[k]);const m=(p.cs.match(/^[A-Z]+/)||[''])[0],num=p.cs.slice(m.length);
 t=t.split(p.cs).join(!num&&m.length===5?m.split('').map(c=>PHN[c]||c).join(' '):(TELE[m]||m)+' '+spD(num));
 t=t.replace(/(squawk )(\d{4})/gi,(a,b,c)=>b+spD(c)).replace(/\b(\d)000\b/g,(a,b)=>DW[b]+' thousand').replace(/\b(\d{2})000\b/g,(a,b)=>b+' thousand').replace(/\b0\d\b/g,a=>spD(a)).replace(/\b\d+\b/g,a=>spD(a));
 t=t.replace(/\b([A-Z]{3,})(\d)([A-Z])\b/g,(a,w,n,l)=>w+' '+DW[+n]+' '+PHN[l]).replace(/\b[A-Z]{4}\b/g,m=>CITY[m]||(typeof NAV!=='undefined'&&NAV.ap&&NAV.ap[m])||m.split('').map(c=>PHN[c]).join(' ')).replace(/\b(\d+)([A-Z])\b/g,(a,n,l)=>spD(n)+' '+PHN[l]);
 return t.replace(/\b[A-Z]\b/g,c=>PHN[c]||c).replace(/\bRWY\b/g,'runway')}
const hashN=s=>[...s].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,7);
const VOICES=['buttery','airy','glassy','rounded'];
const voiceOf=p=>VOICES[hashN(p.cs)%4],rateOf=p=>1.2+(hashN(p.cs+'r')%25)/100;
let DIC=null,TTS=null,SMP=null,listening=false;
const SQ=[],PQ=[];let sqRun=false,rbPending=0,busyUntil=0;
const chanBusy=()=>listening||pttDown||rbPending>0||sqRun||Date.now()<busyUntil;
setInterval(()=>{if(PQ.length&&!chanBusy()){const it=PQ.shift();pilot(it.p,it.t,true)}},400);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function pump(){if(sqRun)return;sqRun=true;
 while(SQ.length&&TTS){const it=SQ.shift();for(let k=0;k<8&&TTS;k++){try{await TTS.speak(speechOf(it.p,it.t),{voice:voiceOf(it.p),rate:rateOf(it.p),language:it.lg||langOf(it.p)});break}catch(e){if(e&&(e.code==='busy'||e.code==='rate_limited')){await sleep(600);continue}if(e&&e.code==='invalid_argument'&&(it.lg||langOf(it.p))!=='en'){it.lg='en';continue}if(e&&e.code==='not_granted'){TTS=null;SQ.length=0}break}}rbPending=Math.max(0,rbPending-1);busyUntil=Date.now()+500}
 sqRun=false;if(!TTS)rbPending=0}
function rlog(cls,who,t){const d=document.createElement('div');d.className=cls;d.textContent=clockStr(T0+T)+' '+who+': '+t;const b=$('rl');b.prepend(d);while(b.children.length>40)b.lastChild.remove();if(MP.on&&MP.role==='host')MP.send({t:'radio',cls,line:d.textContent})}
function pilot(p,t,req){if(!t)return;if(req&&MP.role==='host')addPend(p,t);rbPending++;const go=()=>{rlog('rp',p.cs,t);if(TTS&&$('pv').checked&&!MP.on){SQ.push({p,t});pump()}else{busyUntil=Date.now()+Math.min(6000,t.length*55);rbPending=Math.max(0,rbPending-1)}};req?go():setTimeout(go,700+Math.random()*500)}
const askRadio=(p,t)=>PQ.push({p,t});
const SVW=[[/hållpunkt(en)?|hållplats(en)?|väntplats(en)?|väntpunkt(en)?/g,'holding point'],[/klarerad för start|startklarering|start klar/g,'cleared for takeoff'],[/klarerad för landning|klarerad att landa/g,'cleared to land'],[/ställ upp|ställ dig upp|gå in på banan/g,'line up'],[/vänta/g,'wait'],[/taxa|taxi/g,'taxi'],[/pushback|backa ut|skjut ut/g,'pushback'],[/starta motorerna|starta motorer|motorstart|starttillstånd/g,'start up'],[/stå kvar|stanna|håll position/g,'hold position'],[/fortsätt/g,'continue'],[/kontakta/g,'contact'],[/frekvens/g,'frequency'],[/bana/g,'runway'],[/\b(plats|gate|stand)\b/g,'stand'],[/norr/g,'north'],[/söder|syd/g,'south'],[/\bnoll\b/g,'zero'],[/\bett\b/g,'one'],[/(?<![a-zåäö])två(?![a-zåäö])/g,'two'],[/\btre\b/g,'three'],[/\bfyra\b/g,'four'],[/\bfem\b/g,'five'],[/\bsex\b/g,'six'],[/\bsju\b/g,'seven'],[/(?<![a-zåäö])åtta(?![a-zåäö])/g,'eight'],[/\bnio\b/g,'nine'],[/\bdecimal\b|\bkomma\b/g,'decimal'],[/\bsvara\b/g,''],[/(återläsning|återläsningen|readback) (stämmer|är korrekt|korrekt|rätt)/g,'readback correct']];
function norm(s){let t=s.toLowerCase();for(const[r,w]of SVW)t=t.replace(r,w);t=t.replace(/[.,;:!?"]/g,' ').replace(/(\d)\s*(?:decimal|point)\s*(\d)/g,'$1.$2').replace(/-/g,' ').replace(/\s+/g,' ').trim();
 t=t.split(' ').map(w=>NUMW[w]??w).join(' ');t=t.replace(/(\d)\s+(?=\d)/g,'$1').replace(/(\d)\s*thousand/g,'$1000');return t}
function findCs(s){let best=null,bs=0,span=null;const ns=s.replace(/\s/g,'');
 for(const p of planes){const m=(p.cs.match(/^[A-Z]+/)||[''])[0],num=p.cs.slice(m.length).toLowerCase(),tl=(TELE[m]||m).toLowerCase().replace('ø','[øo]');let sc=0,sp=null;
  const re=new RegExp('\\b(?:'+tl+'|'+m.toLowerCase()+')\\s*(?:'+num+')(?!\\d)');const mm=re.exec(s);
  let m2=null;if(!mm&&!num&&m.length===5){m2=new RegExp('\\b'+[...m.toLowerCase()].map(c=>'(?:'+(PHONR[c]||[c]).join('|')+')').join('\\s+')+'\\b').exec(s)}
  if(mm){sc=3;sp=mm[0]}else if(m2){sc=3;sp=m2[0]}else if(ns.includes(p.cs.toLowerCase()))sc=2;
  if(sc>bs){bs=sc;best=p;span=sp}}
 return{p:best,s:span?s.replace(span,' '):s}}
function parseLocal(text){let s=norm(text);const f=findCs(s);s=f.s;const p=f.p||sel;
 const b=s.split(' ').map(w=>PHON[w]??w).join(' '),tk=b.split(' ');const c={p,raw:text,found:!!f.p};
 const rwm=/runway\s*(\d{1,2})/.exec(b);if(rwm)c.rwy=rwm[1].padStart(2,'0');
 const vi=tk.indexOf('via');if(vi>=0){c.via=[];for(let i=vi+1;i<tk.length;i++){if(/^[a-z]$/.test(tk[i]))c.via.push(tk[i].toUpperCase());else if(!['and','then','thereafter','after','that','to','continue'].includes(tk[i]))break}}
 const sqm=/squawk\s*([0-7]{4})/.exec(b);if(sqm)c.sq=sqm[1];
 if(/read ?back (is )?correct/.test(b))c.act='rbok';
 else if(/(cleared|clear) (for )?take ?off/.test(b))c.act='takeoff';
 else if(/(cleared|clear) (to )?land/.test(b))c.act='land';
 else if(/line ?up/.test(b)){c.act='lineup';c.wait=/wait/.test(b)}
 else if(/taxi|continue|resume|proceed/.test(b)){c.act=/continue|resume|proceed/.test(b)&&!/to (stand|holding|hp)/.test(b)?'continue':'taxi';const st=/stand\s*(\d+)\s*([a-z])?(?![a-z])/.exec(b);
  if(st)c.stand=st[1]+(st[2]||'').toUpperCase();else{const h=/(?:holding point|holding position|holding|hp)\s+([a-z])(?![a-z])/.exec(b);if(h)c.hp=h[1].toUpperCase();else if(/holding point|holding position/.test(b)){c.hp='Y';c.hpDef=true}if(c.hp)c.cat=/cat ?3|category 3/.test(b)}}
 else if(/push ?back|push and start/.test(b))c.act='pushback';
 else if(/start ?up/.test(b))c.act='startup';
 else if(/contact|frequency|switch to/.test(b)){c.act='contact';const fm=/(\d{3}\.\d{1,3})/.exec(b);if(fm)c.freq=fm[1]}
 else if(/cleared to|climb|\bsid\b|departure/.test(b)){c.act='clearance';
  const L=D.sids[c.rwy||(p&&p.rwy)||rwyDep]||[],bn=b.replace(/\s/g,'');let m=L.find(x=>bn.includes(x[0].toLowerCase()));if(!m)m=L.find(x=>bn.includes(x[1].toLowerCase()));if(m)c.sid=m[0];
  const fl=/flight level\s*(\d{2,3})/.exec(b),al=/(?:climb|maintain|altitude|initially)\s*(?:and maintain\s*)?(?:altitude\s*)?(\d{3,5})/.exec(b);
  if(fl)c.alt=fl[1].padStart(3,'0');else if(al){const n=+al[1];c.alt=String(n>=1000?Math.round(n/100):n).padStart(3,'0')}}
 else if(c.sq)c.act='squawk';
 else if(/hold (position|short)|\bstop\b/.test(b))c.act='hold';
 else if(/continue|resume|proceed/.test(b))c.act='continue';
 const dm=/\b(north|south)\b/.exec(b);if(dm)c.dir=dm[1];if(p&&p.pbAsk&&!c.act&&c.dir)c.act='pushback';
 return c}
function pickHP(p,c){const r=c.rwy||p.rwy||rwyDep;let L=D.dest.filter(d=>d[3]==1&&d[0].split(' ')[1]===c.hp);if(!L.length)return null;
 const ok=d=>{const n=d[0].replace(/\s/g,'');return n.includes('RWY'+r)||n.includes('RWY03-21')};let R=L.filter(ok);if(!R.length)R=L;
 const ct=R.filter(d=>/CAT3/.test(d[0])===!!c.cat);return(ct.length?ct:R)[0]}
function doTakeoff(p,voice){if(!p||p.kind!=='DEP')return'not a departure';const rx=p.x-rw[0],ry=p.y-rw[1],off=Math.abs(rx*rdy-ry*rdx)/rl;
 if(off>25){log(p.cs+': not on runway centreline');return'not lined up'}p.hdg=Math.abs(nrm(p.hdg-rh))<90?rh:(rh+180)%360;p.route=[];p.pend=null;if(!voice)p.hold=false;p.vhold=false;p.to=true;NOSTS=!!voice;setSts(p,'xTO');NOSTS=false;log(p.cs+' takeoff');return''}
function exec(c){const p=c.p;
 if(!p){rlog('rx','ATC','No matching aircraft');return}
 if(p.owner){rlog('rx',p.cs,'(with '+p.owner+', no response)');return}
 const cs=p.cs,rn=a=>a&&a.length?' via '+a.join(' '):'';let t=null;const air=p.air||p.app||p.land;
 switch(c.act){
 case'startup':if(p.kind!=='DEP'||air){t='Unable, '+cs;break}t='Startup approved, '+cs;break;
 case'pushback':if(p.kind!=='DEP'||air||p.route.length||p.spd>0||p.pb){t='Unable, '+cs;break}
  if(p.pushed){t='Negative, we have already pushed back, '+cs;break}
  if(!c.dir){p.pbAsk=true;t='Which direction do we face, '+cs+'?';break}
  startPush(p,c.dir);p.wt=T+10+Math.random()*10;t='Pushback and start up approved, facing '+c.dir+', '+cs;break;
 case'taxi':{if(p.pb){t='Unable, we are being pushed back, '+cs;break}if(air||p.to){t='Unable, we are not on the ground taxiing, '+cs;break}
  let d=null,what='';if(c.stand){d=D.dest.find(x=>x[3]==0&&x[0]==='Stand '+c.stand);what='stand '+c.stand;}
  else if(c.hp){d=pickHP(p,c);if(d)what='holding point '+(c.hpDef?'':c.hp+(/CAT3/.test(d[0])?' CAT 3':'')+' ')+'runway '+(d[0].match(/RWY ?(\d\d(?:-\d\d)?)/)||[])[1]}
  if(!d){t='Say again destination, '+cs;break}
  if(c.stand&&p.kind==='DEP'){t='Unable, '+cs;break}
  const was0=p.spd<1&&!p.route.length;VIAL=c.via&&c.via.length?c.via:null;NOSTS=true;go(p,d);NOSTS=false;VIAL=null;p.pend=null;p.vhold=false;
  if(!p.route.length){t='Unable, no route, '+cs;break}if(was0)p.wt=T+10+Math.random()*10;
  t='Taxi to '+what+rn(c.via)+', '+cs;break}
 case'lineup':{if(p.kind!=='DEP'||air){t='Unable, '+cs;break}const r=c.rwy||p.rwy||rwyDep;let L=D.dest.filter(d=>d[3]==2&&d[0].includes('RWY '+r));if(!L.length){t='Say again runway, '+cs;break}
  const v=c.via&&c.via[0];let d=(v&&L.find(x=>x[0].endsWith(' via '+v)))||L.map(x=>[x,Math.hypot(x[1]-p.x,x[2]-p.y)]).sort((a,b)=>a[1]-b[1])[0][0];
  VIAL=null;NOSTS=true;go(p,d);NOSTS=false;p.pend=null;p.vhold=false;if(!p.route.length){t='Unable, no route, '+cs;break}t='Line up runway '+r+(c.via?rn(c.via):'')+(c.wait?' and wait':'')+', '+cs;break}
 case'takeoff':{const r=c.rwy||(Math.abs(nrm(p.hdg-rh))<90?'03':'21'),on=Math.abs(nrm(p.hdg-rh))<90?'03':'21';
  if(c.rwy&&c.rwy!==on){t='Negative, we are lined up runway '+on+', '+cs;break}
  const e=doTakeoff(p,true);t=e?'Negative, we are not lined up, '+cs:'Cleared for takeoff runway '+r+', '+cs;break}
 case'land':if(p.kind==='ARR'&&(p.app||p.air)){t='Cleared to land runway '+(c.rwy||p.rwy)+', '+cs}else t='Unable, '+cs;break;
 case'rbok':return;
 case'hold':p.vhold=true;t='Holding position, '+cs;break;
 case'continue':p.vhold=false;t='Continuing taxi, '+cs;break;
 case'squawk':t=c.sq?'Squawk '+c.sq+', '+cs:'Say again squawk, '+cs;break;
 case'contact':{const n=nextOf(p),ct=CTRL.find(x=>x.id===n),nm=/approach|departure/.test(c.raw||'')||(ct&&ct.cs==='ESGG_E_APP')?'approach':'tower';t='Contact '+nm+(c.freq?' '+c.freq:'')+', '+cs;break}
 case'clearance':{if(p.kind!=='DEP'||air){t='Unable, '+cs;break}
  const sid=c.sid||p.sid,al=c.alt||p.cfl||initCfl(p,sid),n=parseInt(al),sq=c.sq||p.sq;
  if(p.rules!=='V'&&MP.role!=='host')p.pushReqAt=T+60;p.vclr=true;t='Cleared to '+p.ades+(sid?' via '+sid+' departure':'')+(c.alt?', climb '+(n<=50?n*100+' feet':'flight level '+n):'')+(sq?', squawk '+sq:'')+', '+cs;break}
 default:t='Say again, '+cs}
 list();pilot(p,t)}
async function viaClaude(text){if(!SMP)return null;
 try{const L=planes.map(p=>p.cs+' ('+p.kind+', '+(p.sts||'-')+')').join(', ');
  const r=await SMP.json('You parse air traffic controller radio calls for a ground-control simulator at ESGG. Aircraft: '+L+'. Transmission (speech-to-text, may contain errors): "'+text+'". Reply with JSON only: {"cs":"exact callsign from the list or null","act":"startup|pushback|taxi|lineup|takeoff|land|hold|continue|contact|clearance|squawk|none","hp":"holding point letter or null","cat3":false,"rwy":"03 or 21 or null","via":["taxiway letters"],"stand":"stand number or null","sid":"SID name or null","alt":"altitude in feet or null","sq":"4 digit squawk or null"}',{modelTier:'quick'});
  if(!r||r.act==='none'||!r.act)return null;const p=planes.find(x=>x.cs===r.cs)||sel;
  const c={p,act:r.act,found:true};if(r.hp)c.hp=String(r.hp).toUpperCase();c.cat=!!r.cat3;if(r.rwy)c.rwy=String(r.rwy).padStart(2,'0');if(r.via&&r.via.length)c.via=r.via.map(v=>String(v).toUpperCase());if(r.stand)c.stand=String(r.stand).toUpperCase();if(r.sid)c.sid=r.sid;if(r.alt){const n=+r.alt;c.alt=String(n>=1000?Math.round(n/100):n).padStart(3,'0')}if(r.sq)c.sq=String(r.sq);return c}catch(e){return null}}
async function tx(text){text=text.trim();if(!text)return;busyUntil=Date.now()+2500;if(MP.role!=='student')rlog('tx','ATC',text);let c=parseLocal(text);
 if(!c.act||!c.p){const a=await viaClaude(text);if(a)c=a}
 if(!c.p||(!c.found&&!c.act)){rlog('rx','ATC','No matching aircraft — say the callsign');return}
 if(!c.act)c.act='?';
 if(MP.role==='student'){if(c.act==='?'){rlogRaw('rx','Not understood: '+text);return}MP.propose(c,text);return}
 exec(c)}
$('rsend').onclick=()=>{const i=$('rtx');const v=i.value;i.value='';tx(v)};
$('rtx').onkeydown=e=>{e.stopPropagation();if(e.key==='Enter')$('rsend').onclick()};$('rtx').onkeyup=e=>e.stopPropagation();
function setMic(){const b=$('mic');b.classList.toggle('on',listening&&!!sim);b.classList.toggle('pz',!sim);b.textContent=!sim?'UNPAUSE SIM FOR PTT':listening?'● Listening…':'PTT (LCtrl)'}
let pttDown=false,LANG='en';
const setLang=l=>{LANG=l;$('lng').textContent=l.toUpperCase();$('lng').title=l==='en'?'Speech recognition: English (click for Swedish)':'Taligenkänning: svenska (click for English)'};
$('lng').onclick=()=>setLang(LANG==='en'?'sv':'en');
setLang('en');
function pttStart(){if(!DIC||pttDown||!sim)return;pttDown=true;if(TTS)TTS.stop();DIC.start({language:LANG}).catch(e=>{pttDown=false;if(e&&e.code==='not_granted'){DIC=null;$('mic').style.display='none';$('lng').style.display='none'}else if(e&&e.code==='unavailable'&&LANG!=='en'){setLang('en');rlog('rx','ATC','Swedish dictation is not available here — switched to English')}})}
function pttStop(){if(!pttDown)return;pttDown=false;if(DIC)DIC.stop().catch(()=>{})}
$('mic').onpointerdown=e=>{e.preventDefault();pttStart()};$('mic').onpointerup=pttStop;$('mic').onpointerleave=pttStop;
addEventListener('keydown',e=>{if(e.code==='ControlLeft'&&!e.repeat)pttStart()});
addEventListener('keyup',e=>{if(e.code==='ControlLeft')pttStop()});
addEventListener('blur',pttStop);
(async()=>{if(!(window.claude&&claude.use))return;
 try{DIC=await claude.use('dictation')}catch(e){}try{TTS=await claude.use('tts')}catch(e){}try{SMP=await claude.use('sample')}catch(e){}
 $('mic').style.display=DIC?'':'none';$('lng').style.display=DIC?'':'none';$('pvl').style.display=TTS?'':'none';
 $('rhint').textContent=DIC?'Hold Left Ctrl (or the PTT button) while you speak, e.g. “Scandinavian 123, taxi to holding point runway two one via Yankee”. Voice calls only move the aircraft and get a readback; strips, status and tags are never changed.':'Voice input is not available here — type the call below.';
 if(DIC){DIC.onPartial(({text})=>{$('rtx').value=text});DIC.onFinal(({text})=>{$('rtx').value='';tx(text)});DIC.onState(({state})=>{listening=state==='listening';if(!listening)busyUntil=Math.max(busyUntil,Date.now()+2500);setMic();if(!listening)$('rtx').value=''})}
 if(TTS)TTS.onState(()=>{})})();


/* pilot calls 60 s (sim time) after pushback is complete */
function pilotCalls(){for(const p of planes){if(p.owner||p.air||p.app||p.land)continue;
 if(p.pbT!=null&&!p.reqTaxi&&T-p.pbT>=60){p.reqTaxi=true;if(!p.route.length&&!p.pb&&p.spd<1)askRadio(p,p.cs+', request taxi')}
 if(p.kind==='DEP'&&p.reqClrAt!=null&&!p.clrAsked&&T>=p.reqClrAt&&!p.pushed&&p.spd<1){p.clrAsked=true;
  if(p.rules==='V'){p.pushReqAt=T}else askRadio(p,'Landvetter Ground, '+p.cs+', stand '+(p.std||'')+', type '+p.type+', information '+ATIS.l+', QNH '+ATIS.q+', request clearance to '+p.ades+'.')}
 if(p.kind==='ARR'&&p.landed&&!p.arrAsked&&!p.route.length&&p.spd<1&&!p.pb){p.arrAsked=true;askRadio(p,'Landvetter Ground, '+p.cs+', on taxiway Y.')}
 if(p.pushReqAt!=null&&!p.pushAsked&&T>=p.pushReqAt&&!p.pushed&&p.spd<1){p.pushAsked=true;askRadio(p,p.cs+', stand '+(p.std||'')+', request pushback and start-up.')}}}
