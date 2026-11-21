/* ---------- Scenario dialog: one button per sweatbox file in scenarios/ (built into data/scenarios.js),
   plus any extra .txt files a web server lists for the scenarios/ folder, plus "Load from Files" ---------- */
{const b=$('scb');let el=null;
 const close=()=>{if(el){el.remove();el=null}};
 const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const fill=()=>{if(!el)return;el.querySelector('.sl').innerHTML=Object.keys(window.SCENARIOS||{}).map(n=>`<button data-s="${esc(n)}">${esc(n)}</button>`).join('')};
 /* live folder listing (works where the server shows a directory index); silently ignored otherwise */
 const live=async()=>{try{const r=await fetch('scenarios/',{cache:'no-store'});if(!r.ok)return;const h=await r.text();
   const names=[...h.matchAll(/href="([^"?#]+?\.txt)"/gi)].map(m=>decodeURIComponent(m[1].split('/').pop()));
   for(const f of names){const n=f.replace(/\.txt$/i,'');if(window.SCENARIOS[n])continue;const t=await fetch('scenarios/'+encodeURIComponent(f),{cache:'no-store'}).then(x=>x.ok?x.text():null);if(t)window.SCENARIOS[n]=t.replace(/\r\n/g,'\n')}
   fill()}catch(e){}};
 b.onclick=()=>{if(el){close();return}window.SCENARIOS=window.SCENARIOS||{};el=document.createElement('div');el.className='fpl sdl';
  el.innerHTML='<div class="th"><b>Scenario</b><span id="sdx">✕</span></div><div class="sb"><div class="sl"></div><hr><button data-f="1">Load from Files</button></div>';
  $('map').appendChild(el);fill();live();$('sdx').onclick=close;
  el.querySelector('.sb').onclick=ev=>{const x=ev.target.closest('button');if(!x)return;
   if(x.dataset.f){sbf.click();close();return}
   importSweatbox(window.SCENARIOS[x.dataset.s]);CTRL.forEach(q=>q.on=true);list();close();if(x.dataset.s==='ESGG S1 SIM01'&&window.startTutorial)startTutorial()};
  const th=el.querySelector('.th');let dr=null;th.onpointerdown=ev=>{if(ev.target.closest('span'))return;th.setPointerCapture(ev.pointerId);dr=[ev.clientX-el.offsetLeft,ev.clientY-el.offsetTop]};th.onpointermove=ev=>{if(dr){el.style.left=Math.max(0,ev.clientX-dr[0])+'px';el.style.top=Math.max(0,ev.clientY-dr[1])+'px'}};th.onpointerup=()=>{dr=null}};
 addEventListener('pointerdown',ev=>{if(el&&!ev.target.closest('.sdl,#scb'))close()})}
