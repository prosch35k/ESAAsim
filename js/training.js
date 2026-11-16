/* ---------- Training Material: offline copy of the Moodle course (structure + content) ---------- */
(()=>{
let loaded=false,cur=null,showHid=false;const packs={},ld={};
window.MPACK=o=>Object.assign(packs,o);
const body=$('hbd'),esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const byId={};
const walk=(n,par)=>n.forEach(x=>{byId[x.id]=x;x.par=par;if(x.children)walk(x.children,x)});
const ico={page:'page',book:'book',lesson:'less',quiz:'quiz',section:''};
function loadScript(src){return new Promise(r=>{const s=document.createElement('script');s.src=src;s.onload=s.onerror=()=>r();document.head.appendChild(s)})}
async function need(html){const ids=new Set();(html.match(/mimg:[0-9a-f]+/g)||[]).forEach(m=>{const i=MPIDX[m.slice(5)];if(i!=null&&!ld[i])ids.add(i)});
 await Promise.all([...ids].map(i=>ld[i]=loadScript('training/p/'+i+'.js?v='+(window.TRV||''))))}
const fixHtml=h=>h.replace(/mimg:([0-9a-f]+)/g,(m,k)=>packs[k]||'data:,')
 .replace(/https?:\/\/moodle\.vatsim-scandinavia\.org\/mod\/(?:page|book|lesson|quiz|subsection)\/view\.php\?id=(\d+)[^"']*/g,'#m$1')
 .replace(/<a /g,'<a rel="noopener" ');
function tree(nodes,d){return nodes.filter(x=>showHid||!x.hidden).map(x=>{
 const pad=`padding-left:${10+d*14}px`;
 if(x.type==='section'){const open=x._o?'v':'>';return`<div class="ts${x.hidden?' hid':''}" style="${pad}" data-s="${x.id}"><span class="tk">${open}</span>${esc(x.name)}</div>`+(x._o?tree(x.children,d+1):'')}
 return`<div class="ti${x.hidden?' hid':''}${cur===x.id?' cur':''}" style="${pad}" data-i="${x.id}"><span class="tk"></span><span class="ty">${ico[x.type]||x.type}</span>${esc(x.name)}</div>`}).join('')}
function drawNav(){const n=$('tnav');const st=n.scrollTop;n.innerHTML='<label><input type="checkbox" id="thd"'+(showHid?' checked':'')+'> Show hidden items</label>'+tree(MTREE,0);n.scrollTop=st;
 $('thd').onchange=e=>{showHid=e.target.checked;drawNav()}}
const doc=h=>{$('tdoc').innerHTML=h;$('tmain').scrollTop=0};
async function show(id,sub){const it=MDATA[id],nd=byId[id];if(!it)return;cur=id;for(let p=nd&&nd.par;p;p=p.par)p._o=true;drawNav();
 const head=`<h1>${esc(it.name)}</h1>`+(it.hidden?'<div class="tmeta">Hidden in Moodle</div>':'');
 if(it.type==='page'){await need(it.html);doc(head+fixHtml(it.html))}
 else if(it.type==='book'){const k=sub||0,ch=it.chapters,c=ch[k];await need(c?c.html:'');
  doc(head+(it.intro?fixHtml(it.intro):'')+'<div class="tpg">'+ch.map((x,i)=>`<button data-c="${i}" class="${i===k?'cur':''}">${i+1}. ${esc(x.title)}</button>`).join('')+'</div>'+(c?`<h2>${esc(c.title)}</h2>`+fixHtml(c.html):'')+`<div class="tpgb">${k>0?`<button data-c="${k-1}">&lt; Previous</button>`:''}${k<ch.length-1?`<button data-c="${k+1}">Next &gt;</button>`:''}</div>`);
  document.querySelectorAll('#tdoc [data-c]').forEach(b=>b.onclick=()=>show(id,+b.dataset.c))}
 else if(it.type==='lesson'){const k=sub||0,pg=it.pages;const p=pg[k];await need(p?p.html:'');
  doc(head+(it.intro?fixHtml(it.intro):'')+(pg.length>1?'<div class="tpg">'+pg.map((x,i)=>`<button data-c="${i}" class="${i===k?'cur':''}">${esc(x.title)}</button>`).join('')+'</div>':'')+(p?`<h2>${esc(p.title)}</h2>`+fixHtml(p.html):'')+(p&&p.answers.length?'<div class="ans">Answer options: '+p.answers.map(esc).join(' / ')+'</div>':''));
  document.querySelectorAll('#tdoc [data-c]').forEach(b=>b.onclick=()=>show(id,+b.dataset.c))}
 else if(it.type==='quiz'){await need(it.intro);doc(head+'<div class="tmeta">Quiz'+(it.limit?' &middot; time limit '+it.limit+' min':'')+(it.attempts&&it.attempts!=='0'?' &middot; attempts '+it.attempts:'')+(it.slots?' &middot; '+it.slots+' questions':'')+' &middot; the questions themselves are not part of the training material</div>'+fixHtml(it.intro))}
 else doc(head)}
function toSection(id){const nd=byId[id];nd._o=!nd._o;drawNav()}
async function open(){if(!loaded){body.innerHTML='<div id="tnav"></div><div id="tmain"><div id="tdoc"><div class="tmeta">Loading...</div></div></div>';
  await loadScript('training/tree.js?v='+(window.TRV||''));if(!window.MTREE){$('tdoc').innerHTML='Training material could not be loaded.';return}
  walk(MTREE,null);loaded=true;
  $('tnav').onclick=e=>{const s=e.target.closest('.ts'),i=e.target.closest('.ti');if(s)toSection(s.dataset.s);else if(i)show(i.dataset.i)};
  $('tdoc').onclick=e=>{const a=e.target.closest('a');if(!a)return;const h=a.getAttribute('href')||'';const m=h.match(/^#m(\d+)$/);if(m){e.preventDefault();if(MDATA[m[1]])show(m[1])}else if(h.startsWith('#'))e.preventDefault()};
  MTREE[0]._o=true;drawNav();const f=MTREE[0].children.find(x=>x.type!=='section');if(f)show(f.id);else $('tdoc').innerHTML=''}
 body.classList.remove('nov')}
window.trainingOpen=open;window.trainingClose=()=>body.classList.add('nov');
})();
