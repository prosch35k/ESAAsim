/* ---------- top bar: position, UTC clock, QUICK SET list menu, runway + tower symbols ---------- */
const ICON_RWY='<svg width="22" height="22" viewBox="0 0 22 22"><g transform="rotate(-26 11 11)"><rect x="7" y="0.5" width="8" height="21" fill="#2b2e35" stroke="#e6e6e2" stroke-width="1"/><path d="M11 3.5V18.5" stroke="#e6e6e2" stroke-width="1.2" stroke-dasharray="2.4 2"/><path d="M8.5 2.2H13.5M8.5 19.8H13.5" stroke="#e6e6e2" stroke-width="1"/></g></svg>';
const ICON_TWR='<svg width="22" height="22" viewBox="0 0 22 22"><path d="M9 21V12H13V21" fill="none" stroke="#e6e6e2" stroke-width="1.3" stroke-linejoin="round"/><path d="M5 4H17L15 11H7Z" fill="#2b2e35" stroke="#e6e6e2" stroke-width="1.3" stroke-linejoin="round"/><path d="M6.2 7.5H15.8" stroke="#e6e6e2" stroke-width="1"/><path d="M11 4V1.2" stroke="#e6e6e2" stroke-width="1.3"/></svg>';
$('rwb').innerHTML=ICON_RWY;$('ocb').innerHTML=ICON_TWR;
setInterval(()=>{$('utc').textContent=new Date().toISOString().slice(11,19)},250);$('utc').textContent=new Date().toISOString().slice(11,19);
{const m=document.createElement('div');m.id='qsm';m.style.display='none';document.body.appendChild(m);
 const build=()=>{m.innerHTML='<div class="qt">Quick Settings Menu</div>'+order.map(n=>`<div class="qi" data-l="${n}"><span class="qc">${WIN[n].vis?'&#10003;':''}</span>Show ${n} List</div>`).join('')};
 $('qsb').onclick=ev=>{ev.stopPropagation();if(m.style.display===''){m.style.display='none';return}build();const r=$('qsb').getBoundingClientRect();m.style.left=r.left+'px';m.style.top=r.bottom+2+'px';m.style.display=''};
 m.onclick=ev=>{const it=ev.target.closest('.qi');if(!it)return;const n=it.dataset.l,w=WIN[n];w.vis=!w.vis;w.el.style.display=w.vis?'':'none';if(w.vis)w.el.style.zIndex=++zTop;it.querySelector('.qc').innerHTML=w.vis?'&#10003;':''};
 addEventListener('pointerdown',ev=>{if(!ev.target.closest('#qsm,#qsb'))m.style.display='none'})}
$('tb').append($('setb'),$('sb'));
