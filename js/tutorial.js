/* ---------- Tutorial: guided tour that starts when ESGG S1 SIM01 is loaded (and from Settings > Tutorial) ---------- */
(()=>{
const rectOf=el=>{if(!el||el.offsetParent===null&&getComputedStyle(el).position!=='fixed')return null;const r=el.getBoundingClientRect();return r.width?r:null};
const union=(...rs)=>{rs=rs.filter(Boolean);if(!rs.length)return null;const l=Math.min(...rs.map(r=>r.left)),t=Math.min(...rs.map(r=>r.top)),r=Math.max(...rs.map(r=>r.right)),b=Math.max(...rs.map(r=>r.bottom));return{left:l,top:t,right:r,bottom:b,width:r-l,height:b-t}};
const win=n=>rectOf(WIN[n]&&WIN[n].el);
const plane=()=>{const p=planes.find(q=>!q.air&&!q.app)||planes[0];if(!p)return null;const c=cv.getBoundingClientRect(),q=tr(p.x,p.y);return{left:c.left+q[0]-26,top:c.top+q[1]-26,right:c.left+q[0]+26,bottom:c.top+q[1]+26,width:52,height:52}};
const STEPS=[
 {t:'Welcome to ESAAsim',x:'You are ESGG_GND, ground control at Gothenburg Landvetter, runway 21. This short tour shows how the program works. Your objectives in this exercise: read departure clearances, approve pushback and start-up, taxi aircraft out for departure, hand them off to the position above (tower) and taxi arriving traffic in.'},
 {t:'Simulation clock',r:()=>rectOf($('simc')),x:'The simulation starts paused. Press 1× to run it in real time, or 2× / 4× to speed it up. Aircraft appear on the map at the START times given in the scenario file; the first one is already here.'},
 {t:'Top bar',r:()=>rectOf($('tb')),x:'Scenario loads another exercise. Next to it you see your position (ESGG_GND), the UTC clock and the ATIS box. QUICK SET shows or hides the lists, the runway button opens the active runway selector (this exercise uses runway 21) and the tower button lists other controllers.'},
 {t:'Menu bar',r:()=>rectOf($('grb')),x:'The Ground Radar menu bar. SETTINGS has label filters and label fields, WINDOW switches the lists on and off, FUNCTIONS holds extra tools. On the right: alerts, QNH, LVP toggle and the safety nets (green = on, yellow = switched off).'},
 {t:'STUP list',r:()=>win('STUP'),x:'Departures waiting at their stands, sorted by off-block time (EOBT). Click a cell to work with it: STS sets the ground state, CLR opens the departure clearance, RTE/AHD assigns a SID (right click: heading), ASSR the squawk, STD the stand, RMK a remark. Left-click the callsign to assume the aircraft.'},
 {t:'TAXIOUT and TAKEOFF',r:()=>union(win('TAXIOUT'),win('TAKEOFF')),x:'TAXIOUT shows departures that are taxiing to the runway, TAKEOFF the ones that are lined up or have started their take-off roll. HS shows the holding point they are heading for.'},
 {t:'ADCS and TAXIIN',r:()=>union(win('ADCS'),win('TAXIIN')),x:'ADCS lists arrivals on approach or rolling out, with their runway and ETA. When an arrival has vacated the runway it moves to TAXIIN, where you give it a taxi route to its stand (STD). Set the state to PRK when it is parked.'},
 {t:'Aircraft and tags',r:plane,x:'Click an aircraft to select it. Click the callsign in its tag to open the tag menu: ground state (STS), Assume, Trans (hand-off to the next controller), Man Trf, Free and FPL (flight plan). Click the stand to change it. Drag a tag with the left mouse button to move it. Tags of aircraft without a ground state are hidden until you hover over them (Settings > Display > Label Filters).'},
 {t:'Moving the map',x:'Scroll the mouse wheel to zoom and drag with the right mouse button to pan. Hover over a tag to see all its fields.'},
 {t:'Giving instructions',r:()=>rectOf($('sb')),x:'The M button opens the manual control menu. Select an aircraft (on the map or in a list), then use the state buttons, Clearance, Taxi to (a holding point or stand), Hold short, Continue and Takeoff. The Taxi route mode lets you click out a route on the taxiways. In the lists, right-click a callsign for Hold short and Taxi to assigned stand.'},
 {t:'A typical departure',x:'1. Select the aircraft and read the clearance (CLR in the STUP list).  2. Set the state: FRQ, then S/U (start-up) and S/P (push-back) as you approve them.  3. Taxi it to the holding point (Taxi to): state TXO.  4. Line up (xLU), then take-off (xTO).  5. Hand the aircraft off with Trans in the tag menu. Arrivals: after landing they appear in TAXIIN (TXI); taxi them to the stand and set PRK. Watch for conflicts: the alert triangle in the menu bar turns red.'},
 {t:'You are ready',x:'Press 1× and start working. You can open this tour again any time from the gear menu (Settings > Tutorial).'}];
let i=-1,ring,card,tm=null;
const place=()=>{if(i<0)return;const s=STEPS[i],r=s.r&&s.r();
 if(r){const pad=4;ring.style.cssText=`display:block;left:${r.left-pad}px;top:${r.top-pad}px;width:${r.width+pad*2}px;height:${r.height+pad*2}px`}else ring.style.display='none';
 const cw=card.offsetWidth,ch=card.offsetHeight,vw=innerWidth,vh=innerHeight,g=14;let x,y;
 if(!r){x=(vw-cw)/2;y=(vh-ch)/2}
 else{const opts=[[r.left,r.bottom+g],[r.left,r.top-ch-g],[r.right+g,r.top],[r.left-cw-g,r.top]];const ok=opts.find(([a,b])=>a>=8&&b>=8&&a+cw<=vw-8&&b+ch<=vh-8);[x,y]=ok||[vw-cw-16,vh-ch-16]}
 card.style.left=Math.max(8,Math.min(x,vw-cw-8))+'px';card.style.top=Math.max(8,Math.min(y,vh-ch-8))+'px'};
const render=()=>{const s=STEPS[i],last=i===STEPS.length-1;
 card.innerHTML=`<div class="tut-h"><b>${s.t}</b><span class="tut-n">${i+1} / ${STEPS.length}</span></div><div class="tut-x">${s.x}</div><div class="tut-b"><button data-a="skip">${last?'':'Skip tutorial'}</button><span></span><button data-a="back"${i?'':' disabled'}>Back</button><button data-a="next" class="pri">${last?'Finish':'Next'}</button></div>`;
 card.querySelector('[data-a=skip]').style.visibility=last?'hidden':'';place()};
const stop=()=>{i=-1;clearInterval(tm);if(ring)ring.remove();if(card)card.remove();ring=card=null;document.removeEventListener('keydown',key,true)};
const key=e=>{if(e.key==='Escape'){stop();e.stopPropagation()}};
window.startTutorial=()=>{stop();ring=document.createElement('div');ring.className='tut-ring';card=document.createElement('div');card.className='tut-card';document.body.append(ring,card);
 card.onclick=e=>{const a=e.target.dataset.a;if(!a)return;if(a==='skip')stop();else if(a==='back'){i--;render()}else if(i>=STEPS.length-1)stop();else{i++;render()}};
 card.onpointerdown=e=>e.stopPropagation();document.addEventListener('keydown',key,true);i=0;render();tm=setInterval(place,250)};
})();
