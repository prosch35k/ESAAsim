#!/usr/bin/env node
/* ESAAsim relay server — no dependencies (Node 18+). Run: node server/server.js   (PORT env var, default 8080)
 * Rooms by session code. One "host" (mentor, runs the simulation) and any number of "students".
 *   host    -> students : {t:'state'|'radio'|'res'|...}   (broadcast, or {to:<peerId>} for one student)
 *   student -> host     : {t:'prop'|'patch'|...}          (the server adds from/name)
 */
const http=require('http'),crypto=require('crypto');
const PORT=+process.env.PORT||8080,MAXMSG=2*1024*1024,rooms=new Map();let nid=1;
const srv=http.createServer((q,r)=>{r.writeHead(200,{'content-type':'text/plain'});r.end('ESAAsim relay OK\nrooms: '+rooms.size+'\n')});
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
 if(o.t==='hello'){if(c.room)return;const code=String(o.code||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,12),name=String(o.name||'User').slice(0,24);
  if(code.length<4){send(c,{t:'err',msg:'Session code must be at least 4 characters'});return}
  let r=rooms.get(code);
  if(o.role==='host'){if(r&&r.host){send(c,{t:'err',msg:'That session already has a mentor connected'});return}if(!r){r={code,host:null,students:new Set()};rooms.set(code,r)}r.host=c;c.role='host'}
  else{if(!r||!r.host){send(c,{t:'err',msg:'No mentor is hosting that session code'});return}r.students.add(c);c.role='student'}
  c.room=r;c.name=name;send(c,{t:'ok',role:c.role,code,id:c.id});presence(r);if(c.role==='student')send(r.host,{t:'joined',id:c.id,name});return}
 const r=c.room;if(!r)return;
 if(c.role==='host'){if(o.to){const s=[...r.students].find(x=>x.id===o.to);if(s)send(s,o)}else r.students.forEach(s=>send(s,o))}
 else if(r.host){o.from=c.id;o.name=c.name;send(r.host,o)}}
function close(c){if(!c.alive)return;c.alive=false;try{c.sock.destroy()}catch(e){}const r=c.room;if(!r)return;
 if(c.role==='host'){r.students.forEach(s=>{send(s,{t:'closed',msg:'The mentor left the session'});try{s.sock.end()}catch(e){}});rooms.delete(r.code)}
 else{r.students.delete(c);presence(r)}}
setInterval(()=>{rooms.forEach(r=>{[r.host,...r.students].forEach(c=>{if(c&&c.alive&&!c.sock.destroyed)c.sock.write(frame(9,Buffer.alloc(0)))})})},25000);
srv.listen(PORT,()=>console.log('ESAAsim relay listening on :'+PORT));
