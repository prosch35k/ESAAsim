/* ---------- mentor menu: interactive radio log (pending pilot requests) ---------- */
const PEND=[];let pendId=0;
function addPend(p,t){PEND.unshift({id:++pendId,cs:p.cs,t,at:clockStr(T0+T)});if(PEND.length>60)PEND.pop();pendRender()}
function pendRender(){const e=$('pend');if(!e)return;
 e.innerHTML=PEND.length?PEND.map(r=>`<div class="pi" data-id="${r.id}"><div class="px"><span class="pt">${r.at}</span> <b>${r.cs}</b>: ${r.t.replace(/</g,'&lt;')}</div><button class="pk" title="Transmitted - remove">&#10003;</button></div>`).join(''):'<div class="pe">No pending requests</div>';
 $('sb').classList.toggle('pn',PEND.length>0)}
function pendSync(){const n=PEND.length;for(let i=PEND.length-1;i>=0;i--)if(!planes.some(p=>p.cs===PEND[i].cs))PEND.splice(i,1);if(n!==PEND.length)pendRender()}
$('pend').onclick=ev=>{const b=ev.target.closest('.pk');if(!b)return;const id=+b.closest('.pi').dataset.id,i=PEND.findIndex(r=>r.id===id);if(i>=0){PEND.splice(i,1);pendRender()}};
/* the radio history moves into the mentor menu while connected as mentor */
const rlHome=$('rl').parentNode;
function mentorLog(on){if(on)$('plog').appendChild($('rl'));else rlHome.appendChild($('rl'))}
new MutationObserver(()=>mentorLog(document.body.classList.contains('host'))).observe(document.body,{attributes:true,attributeFilter:['class']});
pendRender();
