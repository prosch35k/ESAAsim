/* ---------- run ---------- */
buildWins();
let last=performance.now(),RT=0;
function loop(n){if(n-last>=1000){last=n;if(sim){for(let i=0;i<4*sim;i++)step(.25);T+=sim;spawnDue();pilotCalls();if(T-RT>=2){RT=T;for(const p of planes){if(p.rx!==undefined){(p.hist=p.hist||[]).push([p.rx,p.ry]);if(p.hist.length>5)p.hist.shift()}p.rx=p.x;p.ry=p.y;p.rh=p.hdg}}}list()}alignWins();draw();requestAnimationFrame(loop)}
addEventListener('resize',fit);fit();cam.x=D.ctr[0];cam.y=D.ctr[1];cam.s=Math.min(W/D.span[0],H/D.span[1])*1.05;list();
alignWins();requestAnimationFrame(loop);
$('sb').onclick=()=>{const o=$('side').classList.toggle('open');$('sb').classList.toggle('on',o)};
