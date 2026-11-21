/* ---------- Scenario dialog: pick a built-in sweatbox scenario or load one from a file ---------- */
{const b=$('scb');let el=null;
 const close=()=>{if(el){el.remove();el=null}};
 b.onclick=()=>{if(el){close();return}el=document.createElement('div');el.className='fpl sdl';
  el.innerHTML='<div class="th"><b>Scenario</b><span id="sdx">✕</span></div><div class="sb">'+Object.keys(window.SCENARIOS||{}).map(n=>`<button data-s="${n}">${n}</button>`).join('')+'<hr><button data-f="1">Load from Files</button></div>';
  $('map').appendChild(el);$('sdx').onclick=close;
  el.querySelector('.sb').onclick=ev=>{const x=ev.target.closest('button');if(!x)return;
   if(x.dataset.f){sbf.click();close();return}
   const n=x.dataset.s;importSweatbox(window.SCENARIOS[n]);close()};
  const th=el.querySelector('.th');let dr=null;th.onpointerdown=ev=>{if(ev.target.closest('span'))return;th.setPointerCapture(ev.pointerId);dr=[ev.clientX-el.offsetLeft,ev.clientY-el.offsetTop]};th.onpointermove=ev=>{if(dr){el.style.left=Math.max(0,ev.clientX-dr[0])+'px';el.style.top=Math.max(0,ev.clientY-dr[1])+'px'}};th.onpointerup=()=>{dr=null}};
 addEventListener('pointerdown',ev=>{if(el&&!ev.target.closest('.sdl,#scb'))close()})}
