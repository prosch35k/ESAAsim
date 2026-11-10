/* ---------- aircraft model ---------- */
const AIRL=['SAS','NSZ','FIN','DLH','RYR','WZZ','KLM','BAW','EZY','AUI'];
const OTHER=['ESSA','ENGM','EKCH','EFHK','EGLL','EHAM','EDDF','LFPG','LEMD','LOWW','EPWA','LSZH'];
const WTC={A320:'M',B738:'M',E190:'M',AT76:'M',SF34:'L',A21N:'M',A333:'H',B789:'H'};
const FIXP={DETNA:[57.5876,11.0691],LABAN:[58.1694,13.2943],LUKAX:[57.7136,13.1483],MISVI:[57.825,12.6936],NEGIL:[58.2514,12.6253],PEVAK:[57.7733,11.8229],SABAK:[58.1767,11.6428],SULIX:[58.2015,12.6296],TOPLA:[57.1358,12.3389],VADIN:[57.1378,11.6439]};
const APP={ESSA:[59.651,17.919],ENGM:[60.194,11.1],EKCH:[55.618,12.656],EFHK:[60.317,24.963],EGLL:[51.47,-0.454],EHAM:[52.309,4.764],EDDF:[50.033,8.571],LFPG:[49.013,2.55],LEMD:[40.472,-3.561],LOWW:[48.11,16.57],EPWA:[52.166,20.967],LSZH:[47.458,8.548]};
const GG=[57.6628,12.2798];
function brg(a,b){const r=Math.PI/180,dl=(b[1]-a[1])*r*Math.cos((a[0]+b[0])/2*r),dp=(b[0]-a[0])*r;return(Math.atan2(dl,dp)/r+360)%360}
function adiff(a,b){const d=Math.abs(a-b)%360;return d>180?360-d:d}
// SID choice: exit fix closest in bearing to the destination; if several SIDs share the exit fix, the one listed first in the ESE [SIDSSTARS] wins
const PROP=['AT76','SF34','DH8D'];
function bestSid(rwy,ades,type){const t=APP[ades];let L=D.sids[rwy]||[];if(!PROP.includes(type)){const J=L.filter(s_=>/[MJ]$/.test(s_[0]));if(J.length)L=J}if(!t)return L[0]||null;const b=brg(GG,t);let best=null,bd=1e9;
 L.forEach((s_,i)=>{const f=FIXP[s_[1]];if(!f)return;const d=adiff(brg(GG,f),b);if(d<bd-1e-9){bd=d;best=s_}});return best}
function sidFromRoute(rwy,route){const t=(route||'').trim().toUpperCase().split(/\s+/)[0],L=D.sids[rwy]||[];return L.find(s_=>s_[0]===t)||L.find(s_=>s_[1]===t)||null}
function mkPlane(kind,x,y,hdg,spd,std){
 const p={id:nid++,kind,x,y,hdg,spd,route:[],last:null,hold:false,to:false,land:false,app:false,air:false,pend:null,sts:'',clr:false,rmk:'',txoT:0,airT:0,std:std||''};
 const cs=$('cs').value.trim().toUpperCase();$('cs').value='';
 p.cs=cs||rnd(AIRL)+(100+Math.random()*899|0);p.type=$('ty').value;p.w=WTC[p.type]||'M';p.rwy=p.kind==='ARR'?rwyArr:rwyDep;
 p.sq='';
 if(kind==='DEP'){p.adep='ESGG';p.ades=rnd(OTHER.filter(a=>a!=='ESGG'));const s=bestSid(rwyDep,p.ades,p.type)||rnd(D.sids[rwyDep]);p.sid=s[0];p.copx=s[1];p.cfl='';p.xfl='';p.eobt=hhmm(T0+T+Math.random()*600)}
 else{p.sq=newSq();p.adep=rnd(OTHER);p.ades='ESGG';p.sid='';p.copx='';p.cfl='';p.xfl='';p.eobt=''}
 planes.push(p);sel=p;return p}
let NOSTS=false;function setSts(p,s){if(NOSTS)return;if(p.kind==='DEP'&&(s==='TXI'||s==='PRK'))return;if(p.kind==='ARR'&&(s!=='TXI'&&s!=='PRK'||p.app||p.air))return;p.sts=s;if(s==='TXO')p.txoT=T}
function autoTaxi(p){}
function addTo(p,w,sn){const B=sn||snap(w[0],w[1]);if(!B||B.d>80){log('Click closer to a taxiway');return false}const A=p.last||snap(p.x,p.y),r=findRoute(A,B);if(!r){log(p.cs+': no route');return false}p.route.push(...r);p.last=B;autoTaxi(p);return true}
function go(p,d){p.route=[];p.last=null;p.hold=false;p.pend=null;if(!addTo(p,null,snap(d[1],d[2])))return;if(d[3]==2)p.pend='xLU';else if(d[3]==0&&p.kind==='ARR')p.pend='PRK';log(p.cs+' taxi to '+d[0])}
function mv(p,dt){const m=p.spd*.5144*dt;p.x+=Math.sin(p.hdg*Math.PI/180)*m;p.y+=Math.cos(p.hdg*Math.PI/180)*m}
const AIMP=400;
function pickExit(p){const nm=p.rwy==='03'?'EXIT 03 E':(Math.random()<.5?'EXIT 21 C':'EXIT 21 D'),E=NE.find(e=>e.n===nm),off=q=>Math.abs((q[0]-rw[0])*rdy-(q[1]-rw[1])*rdx)/rl;
 if(!E){return{d:1700,e:[p.x,p.y]}}const P=NET.n[E.a],Q=NET.n[E.b],st=off(P)<off(Q)?P:Q,Y=NE.find(e=>e.n==={E:'E/Y-HPE21',C:'C/Y-HPC03',D:'D/Y-HPD0321'}[nm.slice(-1)]),yp=Y?[NET.n[Y.a],NET.n[Y.b]].sort((u,v)=>off(v)-off(u))[0]:(st===P?Q:P);return{d:Math.hypot(st[0]-p.th[0],st[1]-p.th[1]),e:yp,n:nm}}
function alongTh(p){const h=p.hdg*Math.PI/180;return(p.x-p.th[0])*Math.sin(h)+(p.y-p.th[1])*Math.cos(h)}
function drop(p){planes=planes.filter(q=>q!==p);if(sel===p)sel=null}
function step(dt){for(const p of planes.slice()){if(p.xfer){p.xt-=dt;if(p.xt<=0){const c=CTRL.find(c_=>c_.id===p.nx);p.xfer=false;if(c&&c.on){p.own=false;p.owner=c.id;p.accT=T;p.nx='';p.nxm='';log(c.cs+' accepted '+p.cs)}else{p.nx='';log('handoff of '+p.cs+' failed')}}}let tg=0;
 if(p.pb){pushStep(p,dt);continue}
 if(p.air){p.spd=Math.min(165,p.spd+3*dt);p.airT+=dt;mv(p,dt);if(p.airT>90)drop(p);continue}
 if(p.to){p.spd+=4*dt;mv(p,dt);if(p.spd>=140){p.to=false;p.air=true;p.airT=0;log(p.cs+' airborne')}continue}
 if(p.app){p.spd+=Math.max(-2*dt,Math.min(2*dt,135-p.spd));mv(p,dt);if(alongTh(p)>=0){p.app=false;p.land=true;p.vx=pickExit(p);p.da=0;log(p.cs+' touchdown')}continue}
 if(p.land){const x=p.vx,a=alongTh(p);
  if(a<AIMP)tg=p.spd;else{if(!p.da){const v0=p.spd*.5144,v1=22*.5144,dd=Math.max(300,x.d-AIMP);p.da=Math.max(.6,(v0*v0-v1*v1)/(2*dd))/.5144}tg=22}
  if(a>=x.d){p.land=false;p.vx=null;if(!p.route.length){const A=snap(p.x,p.y),B=snap(x.e[0],x.e[1]),rt=A&&B&&findRoute(A,B);if(rt){p.route=rt;p.last=B}}}}
 if(!p.land&&p.route.length&&!p.hold&&!p.vhold){const t=p.route[0],dx=t[0]-p.x,dy=t[1]-p.y,d=Math.hypot(dx,dy),df=nrm(Math.atan2(dx,dy)*180/Math.PI-p.hdg);
  p.hdg=(p.hdg+Math.max(-30*dt,Math.min(30*dt,df))+360)%360;const bs=t[2]||15;tg=Math.abs(df)>35||(p.route.length==1&&d<30)?Math.min(5,bs):bs;if(d<(p.route.length>1?6:3)){p.route.shift()}}
 p.spd+=Math.max(-(p.land?(p.da||5):3)*dt,Math.min(2*dt,tg-p.spd));if(p.spd<0)p.spd=0;
 if(!p.route.length&&p.pend&&!p.land&&p.spd<3){p.pend=null}
 mv(p,dt)}}

/* ---------- pushback: reverse at 5 kt up to the apron centreline (AP/* edges), then turn to face north/south (screen right/left) ---------- */
const SCR_RIGHT=(Math.atan2(cr,sr)*180/Math.PI+360)%360;
function startPush(p,dir){const h=p.hdg*Math.PI/180,rx=-Math.sin(h),ry=-Math.cos(h);let best=null;
 NE.forEach(e=>{if(!/^AP\//.test(e.n||''))return;for(let k=1;k<e.pts.length;k++){const P=e.pts[k-1],Q=e.pts[k],ex=Q[0]-P[0],ey=Q[1]-P[1],den=rx*ey-ry*ex;if(Math.abs(den)<1e-6)continue;
  const t=((P[0]-p.x)*ey-(P[1]-p.y)*ex)/den,u=((P[0]-p.x)*ry-(P[1]-p.y)*rx)/den;if(t>3&&t<250&&u>=0&&u<=1&&(!best||t<best.t))best={t,ex,ey}}});
 let tx,ty,eh;if(best){tx=p.x+rx*best.t;ty=p.y+ry*best.t;eh=Math.atan2(best.ex,best.ey)*180/Math.PI}else{tx=p.x+rx*60;ty=p.y+ry*60;eh=SCR_RIGHT}
 const north=nrm(eh-SCR_RIGHT),face=Math.abs(north)<=90?(eh+360)%360:(eh+180)%360,fh=dir==='north'?face:(face+180)%360;
 p.pb={tx,ty,fh,ph:0};p.route=[];p.last=null;p.pend=null;p.hold=false;p.vhold=false;p.pbAsk=false;p.pushed=true}
function pushStep(p,dt){const b=p.pb;
 if(b.ph===0){const m=5*.5144*dt,dx=b.tx-p.x,dy=b.ty-p.y,d=Math.hypot(dx,dy);p.spd=5;
  if(d<=m){p.x=b.tx;p.y=b.ty;b.ph=1;p.spd=0}else{const h=p.hdg*Math.PI/180;p.x-=Math.sin(h)*m;p.y-=Math.cos(h)*m}}
 else{const df=nrm(b.fh-p.hdg),st=8*dt;if(Math.abs(df)<=st){p.hdg=b.fh;p.pb=null;p.spd=0;log(p.cs+' pushback complete')}else p.hdg=(p.hdg+Math.sign(df)*st+360)%360}}
