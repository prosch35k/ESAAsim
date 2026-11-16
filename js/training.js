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
 else if(it.type==='quiz'){if(att&&att.id!==id){clearInterval(att.iv);att=null}const qs=it.questions||[];await need(it.intro+JSON.stringify(qs));let n=0;
  doc(head+'<div class="tmeta">Quiz'+(it.limit?' &middot; time limit '+it.limit+' min':'')+(qs.length?' &middot; '+qs.filter(x=>x.t!=='description').length+' questions &middot; '+fmt(qs.reduce((a,q)=>a+(q.t==='description'?0:q.mm),0))+' points':'')+'</div>'+fixHtml(it.intro)+(qs.length?'<div class="tpg"><button id="tst">Start test</button><button id="tsa">'+(showAns?'Hide answers':'Show answers')+'</button></div>'+(showAns?qs.map(q=>qRender(q,q.t==='description'?0:++n,true)).join(''):''):''));
  const b=$('tsa');if(b)b.onclick=()=>{showAns=!showAns;show(id)};const st=$('tst');if(st)st.onclick=()=>startAttempt(id)}
 else doc(head)}

let showAns=false;
const ok=f=>f>0;
const li=(t,f,sa,raw)=>`<li class="${sa&&ok(f)?'ok':''}">${raw?t:esc(t)}</li>`;
function qRender(q,n,sa){let b='';const T=q.t;
 if(T==='description'){return`<div class="qq"><div class="qn">Information</div>${fixHtml(q.text)}</div>`}
 let txt=fixHtml(q.text);
 if(T==='multianswer'){txt=txt.replace(/\{#(\d+)\}/g,(m,i)=>{const s=q.subs[+i-1];if(!s)return'[ ]';return'<span class="cz">'+(sa?s.a.filter(x=>ok(x.f)).map(x=>esc(x.t)).join(' / '):s.t==='multichoice'?'['+s.a.map(x=>esc(x.t)).join(' | ')+']':'[ ____ ]')+'</span>'})}
 else if(T==='ddwtos'){txt=txt.replace(/\[\[(\d+)\]\]/g,(m,i)=>'<span class="cz">'+(sa?esc(q.a[+i-1]||''):'[ ____ ]')+'</span>')}
 b+=`<div class="qq"><div class="qn">Question ${n} &middot; ${esc(q.name)}</div><div class="qt">${txt}</div>`;
 if(T==='multichoice')b+='<ul class="qa">'+q.a.map(x=>li(x.t,x.f,sa,1)).join('')+'</ul><div class="qh">'+(q.single?'Select one':'Select one or more')+'</div>';
 else if(T==='truefalse')b+='<ul class="qa">'+q.a.map(x=>li(x.t,x.f,sa)).join('')+'</ul>';
 else if(T==='shortanswer'||T==='numerical'){if(sa)b+='<ul class="qa">'+q.a.filter(x=>x.f>0).map(x=>li(x.t,1,1)).join('')+'</ul>';else b+='<div class="qh">'+(T==='numerical'?'Numerical answer':'Short answer')+'</div>'}
 else if(T==='match')b+='<table class="qm">'+q.pairs.map(p=>`<tr><td>${fixHtml(p[0])}</td><td>${sa?'<span class="ok">'+esc(p[1])+'</span>':'&nbsp;'}</td></tr>`).join('')+'</table>'+(sa?'':'<div class="qh">Choices: '+q.pairs.map(p=>esc(p[1])).sort().join(' | ')+'</div>');
 else if(T==='ordering')b+=(sa?'<ol class="qa">'+q.a.map(x=>li(x,1,1)).join('')+'</ol>':'<div class="qh">Put in order: '+q.a.slice().sort().map(esc).join(' | ')+'</div>');
 else if(T==='ddwtos'&&!sa)b+='<div class="qh">Choices: '+q.a.map(esc).join(' | ')+'</div>';
 else if(T==='ddimageortext'){if(q.bg)b+=`<img src="${fixHtml(q.bg)}">`;b+='<div class="qh">Drop zones: '+q.drops.map(esc).join(' | ')+'</div>'}
 else if(T==='essay'){b+='<div class="qh">Free-text answer'+'</div>';if(sa&&q.gi)b+='<div class="gi2"><div class="qh">Grader information</div>'+fixHtml(q.gi)+'</div>'}
 if(sa&&q.gf)b+='<div class="gi2">'+fixHtml(q.gf)+'</div>';
 return b+'</div>'}

/* ---- quiz attempt with scoring ---- */
let att=null;
const shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
const sel=(nm,opts)=>`<select data-k="${nm}"><option value="">&nbsp;</option>${opts.map(([v,t])=>`<option value="${v}">${esc(t)}</option>`).join('')}</select>`;
const norm=x=>String(x).trim().toLowerCase();
const wild=(p,v)=>new RegExp('^'+norm(p).replace(/[.+?^${}()|[\]\\]/g,'\\$&').replace(/\*/g,'.*')+'$').test(norm(v));
function qForm(q,n){const T=q.t;if(T==='description')return qRender(q,0,false);
 let txt=fixHtml(q.text),b='';
 if(T==='multianswer')txt=txt.replace(/\{#(\d+)\}/g,(m,i)=>{const s=q.subs[+i-1];if(!s)return'';return s.t==='multichoice'?sel('s'+i,s.a.map((x,j)=>[j,x.t])):`<input data-k="s${i}" size="10">`});
 else if(T==='ddwtos')txt=txt.replace(/\[\[(\d+)\]\]/g,(m,i)=>sel('d'+i,q.a.map((x,j)=>[j+1,x])));
 b=`<div class="qq" data-n="${n}"><div class="qn">Question ${n} &middot; ${esc(q.name)} &middot; ${q.mm} p</div><div class="qt">${txt}</div>`;
 if(T==='multichoice')b+='<ul class="qf">'+q.a.map((x,j)=>`<li><label><input type="${q.single?'radio':'checkbox'}" name="q${n}" value="${j}"> ${x.t}</label></li>`).join('')+'</ul>';
 else if(T==='truefalse')b+='<ul class="qf">'+q.a.map((x,j)=>`<li><label><input type="radio" name="q${n}" value="${j}"> ${esc(x.t)}</label></li>`).join('')+'</ul>';
 else if(T==='shortanswer'||T==='numerical')b+=`<input data-k="v" size="30">`;
 else if(T==='match'){const o=[...new Set(q.pairs.map(p=>p[1]))].sort();b+='<table class="qm">'+q.pairs.map((p,i)=>`<tr><td>${fixHtml(p[0])}</td><td>${sel('m'+i,o.map(x=>[x,x]))}</td></tr>`).join('')+'</table>'}
 else if(T==='ordering')b+='<div class="qh">Use the arrows to put the items in the correct order</div><ol class="qo">'+shuf(q.a.map((x,i)=>i)).map(i=>`<li data-i="${i}"><button class="up">&#9650;</button><button class="dn">&#9660;</button> ${esc(q.a[i])}</li>`).join('')+'</ol>';
 else if(T==='ddimageortext'){if(q.bg)b+=`<img src="${fixHtml(q.bg)}">`;b+='<div class="qh">Draggable items</div><div class="dg">'+q.drags.map(d=>`<span>${esc(d.n)}${d.img?`<img src="${fixHtml(d.img)}">`:' '+esc(d.l)}</span>`).join('')+'</div><table class="qm">'+q.drops.map((d,i)=>`<tr><td>${esc(d.l)}</td><td>${sel('p'+i,q.drags.map(x=>[x.n,x.n+' '+(x.img?'':x.l)]))}</td></tr>`).join('')+'</table>'}
 else if(T==='essay')b+='<textarea data-k="e" rows="8"></textarea><div class="qh">Graded manually - not part of the score</div>';
 return b+'</div>'}
function qGrade(q,el){const T=q.t,g=k=>{const e=el.querySelector('[data-k="'+k+'"]');return e?e.value:''};
 const chk=[...el.querySelectorAll('input[type=radio]:checked,input[type=checkbox]:checked')].map(x=>+x.value);
 if(T==='multichoice'||T==='truefalse'){const f=chk.reduce((s,j)=>s+q.a[j].f,0);return{s:Math.max(0,Math.min(1,f)),r:chk.map(j=>q.a[j].t.replace(/<[^>]*>/g,'')).join(', ')}}
 if(T==='shortanswer'||T==='numerical'){const v=g('v');let f=0;if(v!==''){for(const a of q.a){if(T==='numerical'?(parseFloat(String(v).replace(',','.'))===parseFloat(a.t)):wild(a.t,v)){f=a.f;break}}}return{s:Math.max(0,f),r:v}}
 if(T==='match'){let c=0,rs=[];q.pairs.forEach((p,i)=>{const v=g('m'+i);rs.push(v);if(v===p[1])c++});return{s:c/q.pairs.length,r:rs.join(' | ')}}
 if(T==='ordering'){const cur=[...el.querySelectorAll('.qo li')].map(x=>+x.dataset.i);let c=0;cur.forEach((x,i)=>{if(x===i)c++});return{s:c/q.a.length,r:cur.map(i=>q.a[i]).join(' > ')}}
 if(T==='ddwtos'){const m=(q.text.match(/\[\[(\d+)\]\]/g)||[]);let c=0;m.forEach(x=>{const i=x.replace(/\D/g,'');if(g('d'+i)===i)c++});return{s:m.length?c/m.length:0,r:''}}
 if(T==='ddimageortext'){let c=0;q.drops.forEach((d,i)=>{if(g('p'+i)===d.c)c++});return{s:q.drops.length?c/q.drops.length:0,r:''}}
 if(T==='multianswer'){let c=0;q.subs.forEach((sub,i)=>{const v=g('s'+(i+1));if(sub.t==='multichoice'){if(v!==''&&sub.a[+v]&&sub.a[+v].f>0)c++}else{for(const a of sub.a){if(a.f>0&&(sub.t==='numerical'?parseFloat(v)===parseFloat(a.t):wild(a.t,v))){c++;break}}}});return{s:q.subs.length?c/q.subs.length:0,r:''}}
 if(T==='essay')return{s:null,r:g('e')};
 return{s:null,r:''}}
const fmt=n=>(Math.round(n*100)/100).toString();
function startAttempt(id){const it=MDATA[id],qs=it.questions;att={id,t0:Date.now(),end:it.limit?Date.now()+it.limit*60000:0};
 let n=0;doc('<h1>'+esc(it.name)+'</h1><div class="tmeta" id="tclk"></div><div id="tqs">'+qs.map(q=>qForm(q,q.t==='description'?0:++n)).join('')+'</div><div class="tpg"><button id="tfin">Finish attempt</button><button id="tcan">Cancel</button></div>');
 $('tdoc').querySelectorAll('.qo').forEach(ol=>ol.onclick=e=>{const b=e.target.closest('button'),li=e.target.closest('li');if(!b||!li)return;if(b.classList.contains('up')&&li.previousElementSibling)ol.insertBefore(li,li.previousElementSibling);else if(b.classList.contains('dn')&&li.nextElementSibling)ol.insertBefore(li.nextElementSibling,li)});
 const upd=()=>{if(!att||att.id!==id){clearInterval(att&&att.iv);return}const e=$('tclk');if(!e){clearInterval(att.iv);return}if(att.end){const l=Math.max(0,att.end-Date.now()),m=Math.floor(l/60000),s=Math.floor(l%60000/1000);e.textContent='Time left '+m+':'+String(s).padStart(2,'0');if(!l)finish(id)}else e.textContent='Attempt in progress'};
 upd();att.iv=setInterval(upd,1000);$('tfin').onclick=()=>{if(confirm('Finish the attempt and see your score?'))finish(id)};$('tcan').onclick=()=>{clearInterval(att.iv);att=null;show(id)}}
function finish(id){const it=MDATA[id],qs=it.questions;clearInterval(att&&att.iv);const els=[...$('tdoc').querySelectorAll('#tqs .qq')];
 let got=0,max=0,man=0,n=0;const res=[];let ei=0;
 qs.forEach(q=>{if(q.t==='description'){res.push(null);return}const el=els[ei++];const r=qGrade(q,el);n++;if(r.s===null){man+=q.mm;res.push({r:r.r,man:1})}else{got+=r.s*q.mm;max+=q.mm;res.push({s:r.s,r:r.r})}});
 att=null;const pct=max?got/max*100:0;let k=0;
 doc('<h1>'+esc(it.name)+'</h1><div class="qq"><div class="qn">Result</div><div class="qt">Score: '+fmt(got)+' / '+fmt(max)+' points ('+fmt(pct)+'%)'+(man?'<br>'+fmt(man)+' points are graded manually and not included.':'')+'<br>'+(pct>=80?'<span class="ok">Passed (80% required)</span>':'Not passed (80% required)')+'</div></div><div class="tpg"><button id="tag">Try again</button><button id="tbk">Back to the test</button></div>'+
  qs.map((q,i)=>{if(q.t==='description')return'';k++;const r=res[i];return qRender(q,k,true).replace(/<\/div>$/,'')+`<div class="gi2"><div class="qh">Your answer${r.r?': '+esc(r.r):' not given'}</div>${r.man?'<div class="qh">Graded manually (max '+fmt(q.mm)+' p)</div>':`<div class="${r.s>=1?'ok':''}">${fmt(r.s*q.mm)} / ${fmt(q.mm)} p</div>`}</div></div>`}).join(''));
 $('tag').onclick=()=>startAttempt(id);$('tbk').onclick=()=>show(id)}
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
