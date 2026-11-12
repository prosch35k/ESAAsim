/* ---------- ground network ---------- */
const NET=D.net;
const NE=NET.e.map(e=>{const pts=[];for(let i=0;i<e.p.length;i+=2)pts.push([e.p[i],e.p[i+1]]);const cum=[0];for(let i=1;i<pts.length;i++)cum.push(cum[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));return{a:e.a,b:e.b,s:e.s,n:e.n,pts,cum,len:cum[cum.length-1]}});
const ADJ=NET.n.map(()=>[]);NE.forEach((e,i)=>{ADJ[e.a].push([e.b,i]);ADJ[e.b].push([e.a,i])});
let showNet=false;
function snap(x,y){let b=null;NE.forEach((e,i)=>{for(let k=1;k<e.pts.length;k++){const p=e.pts[k-1],q=e.pts[k],dx=q[0]-p[0],dy=q[1]-p[1],L2=dx*dx+dy*dy||1,t=Math.max(0,Math.min(1,((x-p[0])*dx+(y-p[1])*dy)/L2)),px=p[0]+t*dx,py=p[1]+t*dy,d=Math.hypot(x-px,y-py);if(!b||d<b.d)b={e:i,s:e.cum[k-1]+t*Math.sqrt(L2),x:px,y:py,d}}});return b}
function slice(ei,s0,s1){const E=NE[ei],o=[];const at=s=>{for(let k=1;k<E.pts.length;k++)if(s<=E.cum[k]||k==E.pts.length-1){const l=E.cum[k]-E.cum[k-1]||1,t=Math.max(0,Math.min(1,(s-E.cum[k-1])/l));return[E.pts[k-1][0]+t*(E.pts[k][0]-E.pts[k-1][0]),E.pts[k-1][1]+t*(E.pts[k][1]-E.pts[k-1][1])]}};
 o.push(at(s0));if(s0<s1){for(let k=0;k<E.pts.length;k++)if(E.cum[k]>s0&&E.cum[k]<s1)o.push(E.pts[k])}else{for(let k=E.pts.length-1;k>=0;k--)if(E.cum[k]<s0&&E.cum[k]>s1)o.push(E.pts[k])}
 o.push(at(s1));return o.map(p=>[p[0],p[1],E.s])}
function dij(src){const d=NET.n.map(()=>1e9),pr=NET.n.map(()=>null),done=new Set(),q=[src];d[src]=0;
 while(q.length){q.sort((a,b)=>d[a]-d[b]);const u=q.shift();if(done.has(u))continue;done.add(u);for(const[v,i]of ADJ[u]){const nd=d[u]+NE[i].len*vw(i);if(nd<d[v]){d[v]=nd;pr[v]=[u,i];q.push(v)}}}return{d,pr}}
/* a plane already standing on a preferred taxiway (e.g. Y) has satisfied that "via" - otherwise the route doubles back to the node behind it */
function findRoute(A,B){const V0=VIAL;try{if(VIAL){const V=VIAL.slice();while(V.length&&typeof TWP!=='undefined'&&TWP[A.e]&&TWP[A.e].has(V[0]))V.shift();VIAL=V.length?V:null}return findRoute0(A,B)}finally{VIAL=V0}}
function findRoute0(A,B){let out;if(A.e==B.e)out=slice(A.e,A.s,B.s);else{let best=null;
 for(const ea of[0,1])for(const eb of[0,1]){const na=ea?NE[A.e].b:NE[A.e].a,nb=eb?NE[B.e].b:NE[B.e].a,sa=ea?NE[A.e].len:0,sb=eb?NE[B.e].len:0;let Rr,c,kk=0;
  if(VIAL){Rr=dijV(na);let bv=1e9;for(let k=0;k<=VIAL.length;k++){const v=Rr.d[nb][k]+(VIAL.length-k)*3000;if(v<bv){bv=v;kk=k}}c=Math.abs(A.s-sa)+bv+Math.abs(B.s-sb)}else{Rr=dij(na);c=Math.abs(A.s-sa)+Rr.d[nb]+Math.abs(B.s-sb)}
  if(!best||c<best.c)best={c,na,nb,sa,sb,R:Rr,kk}}
 if(!best||best.c>1e8)return null;out=slice(A.e,A.s,best.sa);const seq=[];let n=best.nb;if(VIAL){let k=best.kk,q;while((q=best.R.pr[n][k])){seq.unshift([q[0],n,q[2]]);n=q[0];k=q[1]}}else while(n!==best.na){const[u,i]=best.R.pr[n];seq.unshift([u,n,i]);n=u}window._seq=seq.map(x=>NE[x[2]].n);
 for(const[u,v,i]of seq){const E=NE[i];out.push(...(E.a==u?slice(i,0,E.len):slice(i,E.len,0)))}out.push(...slice(B.e,best.sb,B.s))}
 return out.filter((p,k)=>k==0||Math.hypot(p[0]-out[k-1][0],p[1]-out[k-1][1])>.5)}
