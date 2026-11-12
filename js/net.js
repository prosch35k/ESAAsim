/* ---------- mentor/student sessions over the relay server ----------
   Mentor (host) runs the simulation and broadcasts its state once per second.
   Student sees the same traffic; list edits are sent as patches, spoken/typed instructions are sent as PROPOSALS
   that the mentor approves or rejects before they are executed. */
const MP={on:false,role:'',ws:null,code:'',id:0,name:'',peers:[],status:'Offline',props:[]};
const EDIT=['sts','cfl','xfl','sq','rmk','sid','copx','rwy','force','ahdg','clr','std','eobt','route_','rules','adep','ades','tas','type','alt_','remarks','owner','own','nx','nxm','xfer','xt','accT','hideW','w'];
const CMDF=['act','hp','hpDef','cat','rwy','via','stand','sq','sid','alt','dir','wait','freq'];
const NLS={get(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
MP.send=o=>{if(MP.ws&&MP.ws.readyState===1)MP.ws.send(JSON.stringify(o))};
function netUrl(u){u=(u||'').trim();if(!u)return'';if(/^https?:\/\//i.test(u))u=u.replace(/^http/i,'ws');else if(!/^wss?:\/\//i.test(u))u=(/^(localhost|127\.|192\.168\.|10\.)/.test(u)?'ws://':'wss://')+u;return u}
function netToast(t){const d=document.createElement('div');d.className='ntoast';d.textContent=t;document.body.appendChild(d);setTimeout(()=>d.remove(),8000);d.onclick=()=>d.remove()}
function netStatus(s){MP.status=s;const b=$('ncb');if(b){b.textContent=MP.on?(MP.role==='host'?'Mentor ':'Student ')+MP.code+(MP.role==='host'?' ('+MP.peers.length+')':''):'Connect';b.classList.toggle('on',MP.on)}const e=$('nst');if(e)e.textContent=s;const g=$('ngo'),d=$('nds');if(g)g.disabled=MP.on;if(d)d.disabled=!MP.on}
function netConnect(o){if(MP.ws)netDisconnect(true);MP.role='';MP.base=httpOf(o.url);MP.code=o.code.toUpperCase();MP.name=o.name||'User';let ws;
 try{ws=new WebSocket(netUrl(o.url))}catch(e){netStatus('Bad server address');return}MP.ws=ws;netStatus('Connecting…');
 ws.onopen=()=>ws.send(JSON.stringify({t:'hello',role:o.role,code:MP.code,name:MP.name,token:o.token||''}));
 ws.onmessage=e=>{let m;try{m=JSON.parse(e.data)}catch(x){return}netMsg(m)};
 ws.onerror=()=>netStatus('Could not reach the server');
 ws.onclose=()=>{if(MP.ws===ws){MP.ws=null;const was=MP.on;MP.on=false;document.body.classList.remove('student','host');MP.role='';MP.peers=[];netStatus(was?'Disconnected':MP.status);}}}
function netDisconnect(quiet){const w=MP.ws;MP.ws=null;MP.on=false;MP.role='';MP.peers=[];document.body.classList.remove('student','host');if(w)try{w.close()}catch(e){}if(!quiet)netStatus('Offline')}
function netMsg(m){
 if(m.t==='ok'){MP.on=true;MP.role=m.role;MP.id=m.id;MP.code=m.code;document.body.classList.add(m.role==='host'?'host':'student');
  if(m.role==='student'){planes=[];sel=null;SPAWNQ=[];sim=0;list()}netStatus('Connected as '+(m.role==='host'?'mentor':'student')+', session '+m.code);if(ncEl){ncEl.remove();ncEl=null}}
 else if(m.t==='err'){netStatus(m.msg);if(/Log in with VATSIM/.test(m.msg))try{NLS.set('esaasim.auth1',null)}catch(x){};if(MP.ws){const w=MP.ws;MP.ws=null;try{w.close()}catch(e){}}}
 else if(m.t==='closed'){netStatus(m.msg);netDisconnect(true);planes=[];sel=null;list();netToast(m.msg+' - you have been disconnected')}
 else if(m.t==='peers'){MP.peers=m.students||[];netStatus(MP.status.startsWith('Connected')?'Connected as '+(MP.role==='host'?'mentor':'student')+', session '+MP.code+' · '+(MP.peers.length)+' student(s)':MP.status)}
 else if(m.t==='joined'&&MP.role==='host'){rlog('rx','Session',m.name+' joined');netState()}
 else if(MP.role==='host'){if(m.t==='prop')netProp(m);else if(m.t==='patch')netPatch(m)}
 else if(MP.role==='student'){if(m.t==='state')netApply(m);else if(m.t==='radio')rlogRaw(m.cls,m.line);else if(m.t==='res')rlogRaw(m.ok?'rp':'rx','('+(m.ok?'Approved':'Rejected')+') '+m.desc)}}
/* ---- host: state broadcast ---- */
const skipK=(k,v)=>k[0]==='_'||k==='lo'||k==='edRmk'?undefined:v;
function netState(){if(!(MP.on&&MP.role==='host'))return;MP.send({t:'state',T,sim,rwyDep,rwyArr,apAct,atis:ATIS,ctrl:CTRL.map(c=>[c.id,c.on]),planes:JSON.parse(JSON.stringify(planes,skipK))})}
function netTick(){if(MP.on&&MP.role==='host'&&MP.peers.length)netState()}
function rlogRaw(cls,line){const d=document.createElement('div');d.className=cls;d.textContent=line;const b=$('rl');b.prepend(d);while(b.children.length>40)b.lastChild.remove()}
/* ---- host: patches from students ---- */
function netPatch(m){const p=planes.find(q=>q.id===m.id);if(!p||p.owner&&false)return;for(const f of Object.keys(m.f))if(EDIT.includes(f))p[f]=m.f[f];list()}
/* ---- host: proposals ---- */
const PROPS=MP.props;
function describe(c,cs){const r=c.rwy?' runway '+c.rwy:'',v=c.via&&c.via.length?' via '+c.via.join(' '):'';
 switch(c.act){case'taxi':return c.stand?'taxi to stand '+c.stand:c.hp?'taxi to holding point '+(c.hpDef?'':c.hp+' ')+'runway '+(c.rwy||'?')+v:'taxi'+v;
 case'continue':return'continue taxi';case'hold':return'hold position';case'lineup':return'line up'+r+(c.wait?' and wait':'')+v;case'takeoff':return'cleared for takeoff'+r;case'land':return'cleared to land'+r;
 case'pushback':return'pushback and start up approved'+(c.dir?', facing '+c.dir:' (direction not given)');case'startup':return'start up approved';
 case'clearance':return'clearance'+(c.sid?' via '+c.sid:'')+(c.alt?', climb '+c.alt:'')+(c.sq?', squawk '+c.sq:'');case'rbok':return'readback correct';case'contact':return'contact '+(c.freq||'next');case'squawk':return'squawk '+c.sq;default:return String(c.act)}}
MP.propose=(c,text)=>{const f={};CMDF.forEach(k=>{if(c[k]!==undefined)f[k]=c[k]});const d=describe(f);
 MP.send({t:'prop',pid:Math.random().toString(36).slice(2,8),cs:c.p?c.p.cs:null,c:f,text});rlogRaw('rx','Sent for approval: '+(c.p?c.p.cs+' ':'')+d)};
function netProp(m){const p=planes.find(q=>q.cs===m.cs);if(!p){MP.send({t:'res',pid:m.pid,ok:false,desc:'unknown aircraft'});rlog('rx','Session','Proposal from '+m.name+' for unknown aircraft');return}
 const pr={pid:m.pid,from:m.from,name:m.name,cs:m.cs,c:m.c,text:m.text,desc:m.cs+': '+describe(m.c)};pr.pv=previewRoute(p,m.c);PROPS.push(pr);propRender()}
function propDone(pr,ok){const i=PROPS.indexOf(pr);if(i<0)return;PROPS.splice(i,1);
 if(ok){const p=planes.find(q=>q.cs===pr.cs);if(p){const c=Object.assign({},pr.c,{p,raw:pr.text,found:true});rlog('tx',pr.name,pr.text);exec(c)}}
 else rlog('rx','ATC','Rejected: '+pr.desc);MP.send({t:'res',pid:pr.pid,ok,desc:pr.desc});propRender();list()}
function propRender(){const e=$('prop');if(!e)return;e.style.display=PROPS.length?'':'none';
 e.innerHTML='<div class="pt">Proposed instructions</div>'+PROPS.map((pr,i)=>`<div class="pc"><div class="px"><b>${pr.name}</b>: ${pr.desc}<br><i>“${pr.text.replace(/</g,'&lt;')}”</i></div><button data-a="1" data-i="${i}">Approve</button><button data-a="0" data-i="${i}">Reject</button></div>`).join('')}
$('prop').onclick=e=>{const b=e.target.closest('button');if(b)propDone(PROPS[+b.dataset.i],b.dataset.a==='1')};
addEventListener('keydown',e=>{if(!PROPS.length||/INPUT|TEXTAREA|SELECT/.test((e.target||{}).tagName||''))return;if(e.key==='Enter'){propDone(PROPS[0],true);e.preventDefault()}else if(e.key==='Delete'||e.key==='Backspace'){propDone(PROPS[0],false);e.preventDefault()}});
/* route preview for taxi proposals */
function previewRoute(p,c){if(c.act!=='taxi')return null;let d=null;if(c.stand)d=D.dest.find(x=>x[3]==0&&x[0]==='Stand '+c.stand);else if(c.hp)d=pickHP(p,Object.assign({},c));if(!d)return null;
 const sv=[p.route,p.last,p.pend,p.hold];VIAL=c.via&&c.via.length?c.via:null;NOSTS=true;let r=null;try{p.route=[];p.last=null;if(addTo(p,null,snap(d[1],d[2])))r=p.route.map(q=>[q[0],q[1]])}catch(e){}NOSTS=false;VIAL=null;[p.route,p.last,p.pend,p.hold]=sv;
 if(r)r.unshift([p.x,p.y]);return r}
function drawProps(){for(const pr of PROPS){if(!pr.pv)continue;g.strokeStyle='#ffd400';g.lineWidth=2.5;g.setLineDash([8,5]);g.beginPath();pr.pv.forEach((q,k)=>{const w=tr(q[0],q[1]);k?g.lineTo(...w):g.moveTo(...w)});g.stroke();g.setLineDash([])}}
/* ---- student: apply state ---- */
function netApply(m){T=m.T;sim=m.sim;rwyDep=m.rwyDep;rwyArr=m.rwyArr;apAct=m.apAct;Object.assign(ATIS,m.atis);m.ctrl.forEach(([id,on])=>{const c=CTRL.find(x=>x.id===id);if(c)c.on=on});updRw();
 const now=Date.now(),by=new Map(planes.map(p=>[p.id,p])),out=[];
 for(const s of m.planes){let p=by.get(s.id);if(!p){p=s;p._pend={};}else{const keep={lo:p.lo,_pend:p._pend||{}};for(const k of Object.keys(p))if(k[0]!=='_'&&k!=='lo')delete p[k];Object.assign(p,s,keep)}
  for(const f of Object.keys(p._pend||{})){if(now-p._pend[f].t<3000)p[f]=p._pend[f].v;else delete p._pend[f]}
  p._nb={};EDIT.forEach(f=>p._nb[f]=JSON.parse(JSON.stringify(p[f]??null)));out.push(p)}
 planes=out;if(sel&&!planes.includes(sel))sel=planes.find(p=>p.id===sel.id)||null;
 document.querySelectorAll('#spd button,#sbs button').forEach(b=>b.classList.toggle('on',+b.dataset.s===sim));list()}
/* ---- student: send list edits ---- */
function netEdits(){if(!(MP.on&&MP.role==='student'))return;for(const p of planes){if(!p._nb)continue;const d={};for(const f of EDIT){const v=JSON.stringify(p[f]??null);if(v!==JSON.stringify(p._nb[f])){d[f]=p[f]??null;p._nb[f]=JSON.parse(v);(p._pend=p._pend||{})[f]={v:p[f],t:Date.now()}}}
  if(Object.keys(d).length)MP.send({t:'patch',id:p.id,f:d})}}
/* ---- connect dialog ---- */
/* login always goes to this server; after login the user may pick any server that shares its SESSION_SECRET */
const AUTH_SERVER=NLS.get('esaasim.authserver','ws://localhost:8080');
/* TEMPORARY: auto-login until the VATSIM organization is approved. Set to false to use the real VATSIM login. */
const DEV_AUTOLOGIN=true,DEV_USER={name:'Rey',cid:'0',rating:5,rn:'C1'};
let ncEl=null;const httpOf=u=>netUrl(u).replace(/^ws/i,'http').replace(/\/$/,'');
const authGet=()=>NLS.get('esaasim.auth1',null),authSet=(b,v)=>NLS.set('esaasim.auth1',v||null);
function netDialog(){if(ncEl){ncEl.remove();ncEl=null;return}const cfg=NLS.get('esaasim.net',{servers:[AUTH_SERVER],last:{}}),L=cfg.last||{};
 const e=document.createElement('div');e.className='fpl';ncEl=e;e.style.width='440px';e.style.left='160px';e.style.top='40px';const ST={req:true,poll:0};
 e.innerHTML=`<div class="th"><b>Connect to session</b><span id="nx">✕</span></div><div class="bd" style="grid-template-columns:auto 1fr">
  <label class="gt">Server</label><select id="ns" class="gt"></select>
  <label class="gt">Address</label><input class="gt" id="nu" placeholder="wss://your-server.onrender.com" value="${L.url||AUTH_SERVER}">
  <div class="gt"></div><div class="gt" style="display:flex;gap:6px"><button id="nsv">Save to list</button><button id="ndl">Remove</button></div>
  <label>VATSIM</label><div id="nlg" style="display:flex;gap:8px;align-items:center"></div>
  <label id="nrl" class="gt">Role</label><div class="gt" id="nrd" style="display:flex;flex-direction:column;gap:3px"><label style="text-align:left" id="nrh"><input type="radio" name="nrole" value="host"> Mentor (runs the simulation)</label><label style="text-align:left"><input type="radio" name="nrole" value="student"> Student</label></div>
  <label id="nswl" class="gt">Simulation</label><div class="gt" id="nswd" style="display:flex;gap:8px;align-items:center"><button id="nsw">Import Sweatbox</button><span id="nsc"></span></div>
  <label class="gt">Session</label><div class="gt" style="display:flex;gap:6px"><input id="nc" maxlength="12" placeholder="e.g. K7Q2XD" value="${L.code||''}"><button id="ng">New</button></div>
  <label class="gt">Name</label><input class="gt" id="nn" maxlength="24" value="${L.name||''}">
  <div class="full" id="nst" style="min-height:16px;color:#333">${MP.status}</div>
  <div class="bt gt"><button id="ngo">Connect</button><button id="nds">Disconnect</button></div></div>`;
 $('map').appendChild(e);
 const base=()=>httpOf(AUTH_SERVER),me=()=>DEV_AUTOLOGIN?{token:'',user:DEV_USER}:authGet(),user=()=>{const a=me();return a&&a.user},isMentor=()=>e.querySelector('input[name=nrole]:checked').value==='host',setSt=t=>{$('nst').textContent=t};
 const fill=()=>{$('ns').innerHTML=cfg.servers.map(s=>`<option>${s}</option>`).join('')+'<option value="">(other…)</option>'};fill();
 if(L.url&&cfg.servers.includes(L.url))$('ns').value=L.url;
 const render=()=>{const u=user(),ok=!ST.req||!!u,canM=!ST.req||(u&&u.rating>=3);
  $('nlg').innerHTML=!ST.req?'<i>This server does not require login</i>':u?`<span>${u.name.replace(/</g,'&lt;')} · ${u.cid} · <b>${u.rn}</b>${DEV_AUTOLOGIN?' <i>(temporary auto-login)</i>':''}</span>${DEV_AUTOLOGIN?'':'<button id="nlo">Log out</button>'}`:'<button id="nli">Login with VATSIM</button>';
  if($('nli'))$('nli').onclick=doLogin;if($('nlo'))$('nlo').onclick=()=>{authSet(base(),null);render()};
  e.querySelectorAll('.gt').forEach(x=>x.style.display=ok?'':'none');$('ngo').disabled=MP.on;$('nds').disabled=!MP.on;$('nrh').style.display=canM?'':'none';
  const rs=[...e.querySelectorAll('input[name=nrole]')];if(!canM)rs[1].checked=true;else if(!rs.some(r=>r.checked))rs[L.role==='host'?0:1].checked=true;
  const m=ok&&isMentor()&&canM;$('nswl').style.display=$('nswd').style.display=ok&&m?'':'none';$('nsc').textContent=SPAWNQ.length?SPAWNQ.length+' flight(s) waiting to appear':'';
  $('nn').readOnly=!!u&&ST.req;if(u&&ST.req)$('nn').value=u.name.slice(0,24);};
 const probe=async()=>{ST.req=true;if(DEV_AUTOLOGIN)return render();const b=base();if(!b)return render();try{const j=await fetch(b+'/auth/config').then(r=>r.json());ST.req=!!j.auth}catch(x){}render()};
 const doLogin=()=>{const b=base();const sid=Array.from(crypto.getRandomValues(new Uint8Array(24)),x=>(x%36).toString(36)).join('');
  const url=b+'/auth/login?sid='+sid;clearInterval(ST.poll);window.open(url,'_blank');
  $('nst').innerHTML='Waiting for VATSIM login… <a href="'+url+'" target="_blank">open the login page</a>';const t0=Date.now();
  ST.poll=setInterval(async()=>{if(!ncEl||Date.now()-t0>300000){clearInterval(ST.poll);return}try{const j=await fetch(b+'/auth/poll?sid='+sid).then(r=>r.json());if(j.ok){clearInterval(ST.poll);authSet(b,{token:j.token,user:j.user});setSt('Logged in');render()}}catch(x){}},1500)};
 $('ns').onchange=()=>{if($('ns').value)$('nu').value=$('ns').value};
 $('nsv').onclick=()=>{const u=$('nu').value.trim();if(u&&!cfg.servers.includes(u)){cfg.servers.push(u);NLS.set('esaasim.net',cfg);fill();$('ns').value=u}};
 $('ndl').onclick=()=>{const u=$('ns').value;cfg.servers=cfg.servers.filter(s=>s!==u);NLS.set('esaasim.net',cfg);fill()};
 $('ng').onclick=()=>{$('nc').value=Array.from({length:6},()=>'ABCDEFGHJKMNPQRSTUVWXYZ23456789'[Math.random()*31|0]).join('')};
 e.querySelectorAll('input[name=nrole]').forEach(r=>r.onchange=render);
 $('nsw').onclick=()=>sbf.click();sbf.addEventListener('change',()=>setTimeout(()=>{if(ncEl)render()},600));
 $('ngo').onclick=()=>{const u=user(),role=isMentor()&&(!ST.req||u&&u.rating>=3)?'host':'student',url=$('nu').value.trim(),code=$('nc').value.trim().toUpperCase(),name=$('nn').value.trim()||(role==='host'?'Mentor':'Student');
  if(!url){setSt('Enter a server address');return}if(code.length<4){setSt('Session code must be at least 4 characters');return}
  cfg.last={url,role,code,name};if(!cfg.servers.includes(url))cfg.servers.push(url);NLS.set('esaasim.net',cfg);netConnect({url,role,code,name,token:me()?me().token:''})};
 $('nds').onclick=()=>{netDisconnect()};$('nx').onclick=()=>{clearInterval(ST.poll);e.remove();ncEl=null};
 e.querySelectorAll('input').forEach(i=>{i.onkeydown=ev=>ev.stopPropagation();i.onkeyup=ev=>ev.stopPropagation()});
 const th=e.querySelector('.th');let dr=null;th.onpointerdown=ev=>{if(ev.target.closest('span'))return;th.setPointerCapture(ev.pointerId);dr=[ev.clientX-e.offsetLeft,ev.clientY-e.offsetTop]};th.onpointermove=ev=>{if(dr){e.style.left=Math.max(0,ev.clientX-dr[0])+'px';e.style.top=Math.max(0,ev.clientY-dr[1])+'px'}};th.onpointerup=()=>{dr=null};
 probe()}
$('ncb').onclick=netDialog;netStatus('Offline');
