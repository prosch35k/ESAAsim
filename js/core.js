const $=id=>document.getElementById(id);
const cv=$('cv'),g=cv.getContext('2d');
const R=D.rot*Math.PI/180,cr=Math.cos(R),sr=Math.sin(R);
const C=D.c;
const mk=a=>a.map(v=>v/10);
const regs=D.r.map(([c,f])=>{const p=new Path2D(),a=mk(f);p.moveTo(a[0],a[1]);for(let i=2;i<a.length;i+=2)p.lineTo(a[i],a[i+1]);p.closePath();return[c,p]});
const lns=Object.entries(D.l).map(([c,ch])=>{const p=new Path2D();ch.forEach(f=>{const a=mk(f);p.moveTo(a[0],a[1]);for(let i=2;i<a.length;i+=2)p.lineTo(a[i],a[i+1])});return[c,p]});
const rw=D.rw,rdx=rw[2]-rw[0],rdy=rw[3]-rw[1],rl=Math.hypot(rdx,rdy),rh=Math.atan2(rdx,rdy)*180/Math.PI;
const cam={x:0,y:0,s:.2};let W=0,H=0,mode=0,sim=0,sel=null,T=0,planes=[],nid=1,rwyDep='21',rwyArr='21',apAct={dep:true,arr:true};
const T0=12*3600;
function fit(){const b=cv.parentElement.getBoundingClientRect(),d=devicePixelRatio||1;W=b.width;H=b.height;cv.width=W*d;cv.height=H*d;g.setTransform(d,0,0,d,0,0)}
function tr(x,y){x-=cam.x;y-=cam.y;return[W/2+cam.s*(cr*x+sr*y),H/2+cam.s*(sr*x-cr*y)]}
function inv(sx,sy){const dx=(sx-W/2)/cam.s,dy=-(sy-H/2)/cam.s;return[cam.x+dx*cr-dy*sr,cam.y+dx*sr+dy*cr]}
const p2=n=>String(n).padStart(2,'0');
const hhmm=s=>{s=Math.floor(s)%86400;return p2(Math.floor(s/3600))+p2(Math.floor(s%3600/60))};
const clockStr=s=>{s=Math.floor(s)%86400;return p2(Math.floor(s/3600))+':'+p2(Math.floor(s%3600/60))+':'+p2(s%60)+'Z'};
function log(t){const l=$('log');l.innerHTML=`${clockStr(T0+T)} ${t}<br>`+l.innerHTML.split('<br>').slice(0,5).join('<br>')}
const nrm=a=>((a+540)%360)-180;
const rnd=a=>a[Math.random()*a.length|0];
const ATIS={l:String.fromCharCode(65+Math.floor(Math.random()*26)),q:990+Math.floor(Math.random()*51)};
