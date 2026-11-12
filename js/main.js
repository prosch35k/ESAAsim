/* ---------- run ---------- */
buildWins();
let last=performance.now(),RT=0;
/* one simulated second; driven by a timer that keeps running when the tab is in the background */
function second(){if(sim&&MP.role!=='student'){for(let i=0;i<4*sim;i++)step(.25);T+=sim;spawnDue();pilotCalls();if(T-RT>=2){RT=T;for(const p of planes){if(p.rx!==undefined){(p.hist=p.hist||[]).push([p.rx,p.ry]);if(p.hist.length>5)p.hist.shift()}p.rx=p.x;p.ry=p.y;p.rh=p.hdg}}}list();netTick()}
function tickSim(){const n=performance.now();let k=0;while(n-last>=1000&&k<600){last+=1000;second();k++}if(n-last>=1000)last=n}
/* a Web Worker timer is not throttled in background tabs (plain timers are); fall back to setInterval */
try{const w=new Worker(URL.createObjectURL(new Blob(['setInterval(()=>postMessage(0),250)'],{type:'text/javascript'})));w.onmessage=tickSim}catch(e){setInterval(tickSim,250)}
setInterval(tickSim,1000);
function frame(){alignWins();draw();requestAnimationFrame(frame)}
addEventListener('resize',fit);fit();cam.x=D.ctr[0];cam.y=D.ctr[1];cam.s=Math.min(W/D.span[0],H/D.span[1])*1.05;list();
alignWins();requestAnimationFrame(frame);
$('sb').onclick=()=>{const o=$('side').classList.toggle('open');$('sb').classList.toggle('on',o)};
/* ask before the tab is closed or refreshed (while connected or while aircraft exist) and disconnect from the session when it really goes */
addEventListener('beforeunload',e=>{if(MP.on||planes.length){e.preventDefault();e.returnValue=''}});
addEventListener('pagehide',()=>{if(MP.ws)netDisconnect(true)});
