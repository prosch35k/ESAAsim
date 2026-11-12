/* ---------- mentor menu: interactive radio log (pending pilot requests) ---------- */
const PEND=[];let pendId=0;
function addPend(p,t){if(!/request clearance/i.test(t))return;PEND.unshift({id:++pendId,cs:p.cs,t,at:clockStr(T0+T)});if(PEND.length>60)PEND.pop();pendRender()}
function pendRender(){const e=$('pend');if(!e)return;
 e.innerHTML=PEND.length?PEND.map(r=>`<div class="pi" data-id="${r.id}"><div class="px"><div class="pcs">${r.cs}</div><div class="ptx">${r.t.replace(/</g,'&lt;')}</div></div><button class="pk" title="Transmitted - remove">&#10003;</button></div>`).join(''):'<div class="pe">No pending clearance requests</div>';
 $('sb').classList.toggle('pn',PEND.length>0)}
function pendSync(){const n=PEND.length;for(let i=PEND.length-1;i>=0;i--)if(!planes.some(p=>p.cs===PEND[i].cs))PEND.splice(i,1);if(n!==PEND.length)pendRender()}
$('pend').onclick=ev=>{const b=ev.target.closest('.pk');if(!b)return;const id=+b.closest('.pi').dataset.id,i=PEND.findIndex(r=>r.id===id);if(i>=0){PEND.splice(i,1);pendRender()}};
pendRender();
