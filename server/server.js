#!/usr/bin/env node
/* ESAAsim relay server — no dependencies (Node 18+). Run: node server/server.js   (PORT env var, default 8080)
 * Rooms by session code. One "host" (mentor, runs the simulation) and any number of "students".
 *   host    -> students : {t:'state'|'radio'|'res'|...}   (broadcast, or {to:<peerId>} for one student)
 *   student -> host     : {t:'prop'|'patch'|...}          (the server adds from/name)
 */
const http=require('http'),crypto=require('crypto');
const PORT=+process.env.PORT||8080,MAXMSG=2*1024*1024,rooms=new Map();let nid=1;
/* ---- VATSIM Connect (OAuth2 authorization-code flow; the client secret lives only here) ----
 * env: VATSIM_CLIENT_ID, VATSIM_CLIENT_SECRET, VATSIM_REDIRECT_URI (= https://<this server>/auth/callback),
 *      VATSIM_AUTH_BASE (default https://auth.vatsim.net, use https://auth-dev.vatsim.net for the sandbox), SESSION_SECRET
 *      VATSIM_MOCK=1 -> fake login for local testing only (rating via ?r=1..12 on /auth/login)
 * Without CLIENT_ID (and no MOCK) login is not required, so a local test server works with no setup. */
const AUTH={id:process.env.VATSIM_CLIENT_ID||'',secret:process.env.VATSIM_CLIENT_SECRET||'',base:(process.env.VATSIM_AUTH_BASE||'https://auth.vatsim.net').replace(/\/$/,''),redir:process.env.VATSIM_REDIRECT_URI||'',mock:process.env.VATSIM_MOCK==='1'};
const REQUIRE=!!(AUTH.id||AUTH.mock),SECRET=process.env.SESSION_SECRET||crypto.randomBytes(32).toString('hex'),pend=new Map();
const RN={1:'OBS',2:'S1',3:'S2',4:'S3',5:'C1',7:'C3',8:'I1',10:'I3',11:'SUP',12:'ADM'};
const b64=o=>Buffer.from(JSON.stringify(o)).toString('base64url'),sig=x=>crypto.createHmac('sha256',SECRET).update(x).digest('base64url');
const mkTok=u=>{const x=b64(Object.assign({exp:Date.now()+12*3600e3},u));return x+'.'+sig(x)};
function chkTok(t){try{const[x,s]=String(t).split('.');if(!x||!s||sig(x)!==s)return null;const u=JSON.parse(Buffer.from(x,'base64url'));return u.exp>Date.now()?u:null}catch(e){return null}}
const page=(r,m)=>{r.writeHead(200,{'content-type':'text/html; charset=utf-8'});r.end('<!doctype html><meta charset=utf8><title>ESAAsim</title><body style="font:16px system-ui;padding:40px;background:#121214;color:#e6e6e2">'+m+'</body>')};
async function authCb(q,r){const u=new URL(q.url,'http://x'),sid=u.searchParams.get('state')||'';if(!/^[\w-]{16,64}$/.test(sid))return page(r,'Invalid login request.');
 if(u.searchParams.get('error'))return page(r,'Login was cancelled or refused ('+u.searchParams.get('error').replace(/[<>&]/g,'')+'). You can close this window.');
 try{let usr;
  if(AUTH.mock){const rt=+u.searchParams.get('r')||3;usr={cid:'1000000',name:'Test User',rating:rt}}
  else{const tr=await fetch(AUTH.base+'/oauth/token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded',accept:'application/json'},body:new URLSearchParams({grant_type:'authorization_code',client_id:AUTH.id,client_secret:AUTH.secret,redirect_uri:AUTH.redir,code:u.searchParams.get('code')||''})}).then(x=>x.json());
   if(!tr.access_token)throw new Error(tr.error_description||tr.error||'token');
   const d=(await fetch(AUTH.base+'/api/user',{headers:{authorization:'Bearer '+tr.access_token,accept:'application/json'}}).then(x=>x.json())).data||{};
   usr={cid:String(d.cid),name:(d.personal&&(d.personal.name_full||(d.personal.name_first+' '+d.personal.name_last)))||String(d.cid),rating:d.vatsim&&d.vatsim.rating?+d.vatsim.rating.id:1}}
  usr.rn=RN[usr.rating]||String(usr.rating);pend.set(sid,{usr,tok:mkTok(usr),exp:Date.now()+5*60e3});page(r,'<h3>Logged in as '+usr.name.replace(/[<>&]/g,'')+' ('+usr.rn+')</h3>You can close this window and return to ESAAsim.')}
 catch(e){page(r,'Login failed: '+String(e.message).replace(/[<>&]/g,''))}}
const srv=http.createServer((q,r)=>{const u=new URL(q.url,'http://x');r.setHeader('access-control-allow-origin','*');
 if(u.pathname==='/auth/config'){r.writeHead(200,{'content-type':'application/json'});return r.end(JSON.stringify({auth:REQUIRE}))}
 if(u.pathname==='/auth/login'){const sid=u.searchParams.get('sid')||'';if(!REQUIRE||!/^[\w-]{16,64}$/.test(sid))return page(r,'Login is not available on this server.');
  if(AUTH.mock){r.writeHead(302,{location:'/auth/callback?state='+sid+'&r='+(+u.searchParams.get('r')||3)});return r.end()}
  r.writeHead(302,{location:AUTH.base+'/oauth/authorize?'+new URLSearchParams({response_type:'code',client_id:AUTH.id,redirect_uri:AUTH.redir,scope:'full_name vatsim_details',state:sid})});return r.end()}
 if(u.pathname==='/auth/callback')return authCb(q,r);
 if(u.pathname==='/auth/poll'){const sid=u.searchParams.get('sid')||'',p=pend.get(sid);r.writeHead(200,{'content-type':'application/json'});if(p&&p.exp>Date.now()){pend.delete(sid);return r.end(JSON.stringify({ok:true,token:p.tok,user:p.usr}))}return r.end('{"ok":false}')}
 r.writeHead(200,{'content-type':'text/plain'});r.end('ESAAsim relay OK\nrooms: '+rooms.size+'\n')});
setInterval(()=>pend.forEach((v,k)=>{if(v.exp<Date.now())pend.delete(k)}),60000);
/* ---- minimal RFC6455 ---- */
function frame(op,buf){const n=buf.length;let h;if(n<126)h=Buffer.from([0x80|op,n]);else if(n<65536){h=Buffer.alloc(4);h[0]=0x80|op;h[1]=126;h.writeUInt16BE(n,2)}else{h=Buffer.alloc(10);h[0]=0x80|op;h[1]=127;h.writeBigUInt64BE(BigInt(n),2)}return Buffer.concat([h,buf])}
function send(c,o){if(c.alive&&!c.sock.destroyed)c.sock.write(frame(1,Buffer.from(JSON.stringify(o))))}
srv.on('upgrade',(req,sock)=>{const k=req.headers['sec-websocket-key'];if(!k){sock.destroy();return}
 sock.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: '+crypto.createHash('sha1').update(k+'258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64')+'\r\n\r\n');
 const c={id:nid++,sock,alive:true,buf:Buffer.alloc(0),frag:null,room:null,role:null,name:''};sock.setNoDelay(true);
 sock.on('data',d=>{c.buf=Buffer.concat([c.buf,d]);try{parse(c)}catch(e){close(c)}});sock.on('close',()=>close(c));sock.on('error',()=>close(c))});
function parse(c){for(;;){const b=c.buf;if(b.length<2)return;const fin=b[0]&128,op=b[0]&15,mk=b[1]&128;let n=b[1]&127,o=2;
 if(n===126){if(b.length<4)return;n=b.readUInt16BE(2);o=4}else if(n===127){if(b.length<10)return;n=Number(b.readBigUInt64BE(2));o=10}
 if(n>MAXMSG)throw 0;if(!mk)throw 0;if(b.length<o+4+n)return;const m=b.subarray(o,o+4),p=Buffer.from(b.subarray(o+4,o+4+n));for(let i=0;i<n;i++)p[i]^=m[i&3];c.buf=b.subarray(o+4+n);
 if(op===8){close(c);return}if(op===9){c.sock.write(frame(10,p));continue}if(op===10){c.alive=true;continue}
 if(op===1||op===2||op===0){c.frag=op===0?Buffer.concat([c.frag||Buffer.alloc(0),p]):p;if(fin){const t=c.frag.toString();c.frag=null;msg(c,t)}}}}
/* ---- rooms ---- */
const peers=r=>[...r.students].map(s=>({id:s.id,name:s.name}));
function presence(r){const o={t:'peers',host:r.host?r.host.name:null,students:peers(r)};if(r.host)send(r.host,o);r.students.forEach(s=>send(s,o))}
function msg(c,t){let o;try{o=JSON.parse(t)}catch(e){return}
 if(o.t==='hello'){if(c.room)return;const code=String(o.code||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,12);let name=String(o.name||'User').slice(0,24),ident='c:'+String(o.cid||'').slice(0,40);
  if(REQUIRE){const u=chkTok(o.token);if(!u){send(c,{t:'err',msg:'Log in with VATSIM first'});return}name=String(u.name).slice(0,24);ident='u:'+u.cid;if(o.role==='host'&&u.rating<3){send(c,{t:'err',msg:'The mentor role requires rating S2 or higher'});return}}
  if(code.length<4){send(c,{t:'err',msg:'Session code must be at least 4 characters'});return}
  let r=rooms.get(code);
  if(o.role==='host'){if(r&&r.host){if(r.host.alive&&r.host.ident===ident&&ident.length>2){const old=r.host;old.replaced=true;close(old);r.host=null}else{send(c,{t:'err',msg:'That session already has a mentor connected'});return}}if(!r){r={code,host:null,students:new Set()};rooms.set(code,r)}r.host=c;c.role='host'}
  else{if(!r||!r.host){send(c,{t:'err',msg:'No mentor is hosting that session code'});return}r.students.add(c);c.role='student'}
  c.room=r;c.name=name;c.ident=ident;send(c,{t:'ok',role:c.role,code,id:c.id});presence(r);if(c.role==='student')send(r.host,{t:'joined',id:c.id,name});return}
 const r=c.room;if(!r)return;
 if(c.role==='host'){if(o.to){const s=[...r.students].find(x=>x.id===o.to);if(s)send(s,o)}else r.students.forEach(s=>send(s,o))}
 else if(r.host){o.from=c.id;o.name=c.name;send(r.host,o)}}
function close(c){if(!c.alive)return;c.alive=false;try{c.sock.destroy()}catch(e){}const r=c.room;if(!r)return;
 if(c.role==='host'){if(c.replaced)return;r.students.forEach(s=>{send(s,{t:'closed',msg:'The mentor left the session'});try{s.sock.end()}catch(e){}});rooms.delete(r.code)}
 else{r.students.delete(c);presence(r)}}
setInterval(()=>{rooms.forEach(r=>{[r.host,...r.students].forEach(c=>{if(c&&c.alive&&!c.sock.destroyed)c.sock.write(frame(9,Buffer.alloc(0)))})})},25000);
srv.listen(PORT,()=>console.log('ESAAsim relay listening on :'+PORT));
