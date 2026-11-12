/* ---------- mentor menu: interactive radio log (pending pilot requests) ---------- */
const PEND=[];let pendId=0;
function addPend(p,t){const k=/request clearance/i.test(t)?'clr':/request pushback/i.test(t)?'push':null;if(!k)return;PEND.unshift({id:++pendId,cs:p.cs,t,k,at:clockStr(T0+T)});if(PEND.length>60)PEND.pop();pendRender()}
function pendRender(){const e=$('pend');if(!e)return;
 e.innerHTML=PEND.length?PEND.map(r=>`<div class="pi" data-id="${r.id}"><div class="px"><div class="pcs">${r.cs}</div><div class="ptx">${r.t.replace(/</g,'&lt;')}</div></div>${r.k==='push'?'<div class="pdb"><button class="pd" data-d="south" title="Face south (left on screen)">S</button><button class="pd" data-d="north" title="Face north (right on screen)">N</button></div>':'<button class="pk" title="Readback correct - done">&#10003;</button>'}</div>`).join(''):'<div class="pe">No pending clearance requests</div>';
 $('sb').classList.toggle('pn',PEND.length>0)}
function pendSync(){const n=PEND.length;for(let i=PEND.length-1;i>=0;i--)if(!planes.some(p=>p.cs===PEND[i].cs))PEND.splice(i,1);if(n!==PEND.length)pendRender()}
$('pend').onclick=ev=>{const b=ev.target.closest('.pk,.pd');if(!b)return;const id=+b.closest('.pi').dataset.id,i=PEND.findIndex(r=>r.id===id);if(i<0)return;const r=PEND[i],p=planes.find(q=>q.cs===r.cs);PEND.splice(i,1);
 if(p){if(b.classList.contains('pk')){if(p.rules!=='V'&&p.pushReqAt==null)p.pushReqAt=T+60}/* clearance done = readback correct: push request follows */
  else exec({act:'pushback',dir:b.dataset.d,p,raw:'',found:true})}
 pendRender();list()};
pendRender();
