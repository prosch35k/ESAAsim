const OVL=new Map(),rk=v=>Math.round(v*2),segKey=(a,b)=>{const x=rk(a[0])+','+rk(a[1]),y=rk(b[0])+','+rk(b[1]);return x<y?x+'|'+y:y+'|'+x};
/* ---------- drawing ---------- */
function draw(){g.setTransform(1,0,0,1,0,0);g.fillStyle=C.COLOR_Terrain1;g.fillRect(0,0,cv.width,cv.height);const d=devicePixelRatio||1,s=cam.s;
 g.setTransform(d*s*cr,d*s*sr,d*s*sr,-d*s*cr,d*(W/2-s*(cr*cam.x+sr*cam.y)),d*(H/2-s*(sr*cam.x-cr*cam.y)));
 for(const[c,p]of regs){g.fillStyle=C[c];g.fill(p)}
 g.lineWidth=1.2/s;for(const[c,p]of lns){g.strokeStyle=C[c];g.stroke(p)}
 g.setTransform(d,0,0,d,0,0);
 g.textAlign='center';g.textBaseline='middle';
 g.font='400 12px system-ui,sans-serif';g.fillStyle=C.ESGG_ORANGE;for(const l of D.lab){const p=tr(l[1],l[2]);g.fillText(l[0],p[0],p[1])}
 g.font='400 12px system-ui,sans-serif';g.fillStyle=C.ESGG_ORANGE;for(const l of D.st){const p=tr(l[1],l[2]);g.fillText(l[0],p[0],p[1])}
 for(const o of D.ol){g.strokeStyle=C[o[0]];g.lineWidth=o[2];g.setLineDash(o[1]=='DOT'?[1,4]:o[1]=='DASH'?[6,4]:[]);const p=tr(o[3],o[4]),q=tr(o[5],o[6]);g.beginPath();g.moveTo(...p);g.lineTo(...q);g.stroke()}g.setLineDash([]);
 if(showNet){g.strokeStyle='rgb(0,255,60)';g.lineWidth=1;g.beginPath();for(const e of NE){e.pts.forEach((q,k)=>{const w=tr(q[0],q[1]);k?g.lineTo(...w):g.moveTo(...w)})}g.stroke()}
 g.textAlign='start';g.textBaseline='alphabetic';
 for(const p of planes){if(!p.leg||!p.copx||!FIXP[p.copx])continue;const f=FIXP[p.copx],fx=(f[1]-12.2832)*111320*Math.cos(57.6629*Math.PI/180),fy=(f[0]-57.6629)*111132,a=tr(p.rx??p.x,p.ry??p.y),b=tr(fx,fy),ap=APP[p.ades];
  g.strokeStyle='rgb(60,200,120)';g.lineWidth=2;g.setLineDash([]);g.beginPath();g.moveTo(...a);g.lineTo(...b);
  if(ap){const bx=(ap[1]-12.2832)*111320*Math.cos(57.6629*Math.PI/180),by=(ap[0]-57.6629)*111132,dx=bx-fx,dy=by-fy,l=Math.hypot(dx,dy)||1,e=tr(fx+dx/l*30000,fy+dy/l*30000);g.lineTo(...e)}g.stroke();
  g.fillStyle='rgb(60,200,120)';g.font='600 12px system-ui,sans-serif';g.fillText(p.copx,b[0]+6,b[1]-6)}
 if(typeof drawProps==='function')drawProps();if(typeof drawMan==='function')drawMan();
 g.fillStyle='#fff';for(const p of planes)if(p.hist)for(const h of p.hist){const u=tr(h[0],h[1]);g.fillRect(Math.round(u[0]),Math.round(u[1]),1,1)}
 OVL.clear();if(MP.role==='host')for(const p of planes){const r=p.route;if(!r||r.length<2)continue;const seen=new Set();for(let i=1;i<r.length;i++){const k=segKey(r[i-1],r[i]);if(!seen.has(k)){seen.add(k);OVL.set(k,(OVL.get(k)||0)+1)}}}
 for(const p of planes.slice().sort((a,b)=>(a===sel)-(b===sel))){if(p.rx===undefined){p.rx=p.x;p.ry=p.y;p.rh=p.hdg}const q=tr(p.rx,p.ry),on=p===sel;
  if(p.route.length&&MP.role==='host'){g.lineWidth=2.5;g.setLineDash([7,4]);let cur=null,run=false;const pts=[[p.rx,p.ry]].concat(p.route),flush=()=>{if(run){g.stroke();run=false}};
   for(let i=1;i<pts.length;i++){const ov=i>1&&OVL.get(segKey(pts[i-1],pts[i]))>1,col=ov?'#ff2d2d':'#ffd400';if(col!==cur||!run){flush();g.strokeStyle=cur=col;g.beginPath();const a=tr(pts[i-1][0],pts[i-1][1]);g.moveTo(...a);run=true}g.lineTo(...tr(pts[i][0],pts[i][1]))}
   flush();g.setLineDash([]);g.lineWidth=1}
  g.save();g.translate(q[0],q[1]);g.rotate((p.rh+D.rot)*Math.PI/180);g.fillStyle=p.hold?C.COLOR_Stopbar:C.COLOR_OtherMarking;g.beginPath();g.moveTo(0,-8);g.lineTo(5,6);g.lineTo(0,3);g.lineTo(-5,6);g.fill();g.restore();
  const hv=hovP===p,L_=labelLines(p,hv);p.lo=p.lo||[26,7];g.font=LFONT;let mw=0;for(const s of L_)mw=Math.max(mw,g.measureText(s).width);if(p.kind==='DEP')mw=Math.max(mw,g.measureText(p.cs+' RMK').width);
  const lh=15,pad=4,bw=mw+2*pad,bh=L_.length*lh+2*pad-1,bx=q[0]+p.lo[0],by=q[1]+p.lo[1];p._lr=[bx,by,bw,bh];{const ci=L_.findIndex(t=>t.includes(p.cs)),y0=by+pad+ci*lh,csw=g.measureText(p.cs).width;p._cs=[bx+pad,y0,csw,lh];p._sp=p.kind==='DEP'?[bx+pad+g.measureText(p.cs+' ').width,y0,Math.max(g.measureText('RMK').width,g.measureText(p.edRmk?'':p.rmk||'').width),lh]
:null;p._std=p.kind==='ARR'&&p.std?[bx+pad+g.measureText(p.cs+' ').width,y0,g.measureText(p.std).width,lh]:null}
  const tc=hv?'#fff':(p.adep==='ESGG'?'rgb(64,255,255)':p.ades==='ESGG'?'rgb(255,255,0)':'#fff');g.strokeStyle=tc;g.lineWidth=1;g.beginPath();g.moveTo(q[0],q[1]);g.lineTo(q[0]<bx+bw/2?bx:bx+bw,by+pad+lh);g.stroke();
  if(hv){g.fillStyle='rgba(108,108,111,0.8)';g.fillRect(bx,by,bw,bh);g.strokeStyle='rgba(0,0,0,.9)';g.lineWidth=1;g.strokeRect(bx+.5,by+.5,bw-1,bh-1)}
  
  L_.forEach((s,i)=>{g.fillStyle=(p.alert&&s.startsWith('!!')?C.COLOR_Stopbar:tc);g.fillText(s,bx+pad,by+pad+11+i*lh)})
  }}
