/* ---------- Tutorial: guided tour that starts when ESGG S1 SIM01 is loaded (and from Settings > Tutorial) ---------- */
(()=>{
const rectOf=el=>{if(!el||el.offsetParent===null&&getComputedStyle(el).position!=='fixed')return null;const r=el.getBoundingClientRect();return r.width?r:null};
const union=(...rs)=>{rs=rs.filter(Boolean);if(!rs.length)return null;const l=Math.min(...rs.map(r=>r.left)),t=Math.min(...rs.map(r=>r.top)),r=Math.max(...rs.map(r=>r.right)),b=Math.max(...rs.map(r=>r.bottom));return{left:l,top:t,right:r,bottom:b,width:r-l,height:b-t}};
const win=n=>rectOf(WIN[n]&&WIN[n].el);
const plane=()=>{const p=planes.find(q=>!q.air&&!q.app)||planes[0];if(!p)return null;const c=cv.getBoundingClientRect(),q=tr(p.x,p.y);return{left:c.left+q[0]-26,top:c.top+q[1]-26,right:c.left+q[0]+26,bottom:c.top+q[1]+26,width:52,height:52}};
const col=(n)=>()=>{const w=WIN.STUP&&WIN.STUP.el;if(!w)return null;const ths=[...w.querySelectorAll('th')],k=ths.findIndex(t=>t.textContent===n);if(k<0)return null;const row=w.querySelector('tbody tr'),td=row&&row.children[k],a=rectOf(ths[k]),b=td?rectOf(td):null;const u=union(a,b);return u&&{left:u.left-1,top:u.top-1,right:u.right+1,bottom:u.bottom+1,width:u.width+2,height:u.height+2}};
const rows=()=>{const w=WIN.STUP&&WIN.STUP.el;return w?[...w.querySelectorAll('tbody tr')]:[]};
const firstRow=cls=>rows().find(t=>t.classList.contains(cls))||rows()[0];
const csCell=()=>{const t=firstRow('un');return t?rectOf(t.querySelector('td[data-c="C/S"]')):null};
const rowRect=()=>rectOf(firstRow('as'));
const rowRect0=()=>rectOf(rows()[0]);
const adesCell=()=>{const t=firstRow('un')||rows()[0];return t?rectOf(t.querySelector('td[data-c="ADES"]')):null};
const fplEl=()=>document.querySelector('.fpl'),fplRect=()=>rectOf(fplEl());
const fld=n=>()=>{const d=fplEl();if(!d)return null;const l=[...d.querySelectorAll('label')].find(x=>!x.closest('span')&&x.textContent.trim()===n);if(!l)return null;const u=union(rectOf(l),rectOf(l.nextElementSibling));return u&&{left:u.left-2,top:u.top-2,right:u.right+2,bottom:u.bottom+2,width:u.width+4,height:u.height+4}};
const fq=sel=>()=>{const d=fplEl();return d?rectOf(d.querySelector(sel)):null};
const fp=(t,r,x)=>({t,r,at:fplRect,x});
const smr=()=>{const c=cv.getBoundingClientRect(),g=$('grb').getBoundingClientRect(),t=Math.max(g.bottom,c.top);return{left:c.left+8,top:t+8,right:c.right-8,bottom:c.bottom-8,width:c.width-16,height:c.bottom-t-16}};
const STEPS=[
 {t:'Welcome to ESAAsim',x:'ESAAsim is a replica of how EuroScope works. It lets you familiarise yourself with the workflows and tools before you start practical training with a mentor.'},
 {t:'Your radar screen',r:smr,x:'This is your radar screen: the Surface Movement Radar (SMR) picture of Gothenburg Landvetter. It shows the runway, the taxiways, the aprons and the stands. Aircraft on the airport are drawn on top of it.'},
 {t:'Radar position symbol',r:plane,x:'This is a radar position symbol (RPS). It shows that there is an aircraft here, parked at its stand.'},
 {t:'STUP list',r:()=>win('STUP'),x:'This is the start-up list (STUP). It shows flight strips of the aircraft that are on their stand, starting up or pushing back. It is used to keep track of each aircraft\'s status and of which clearances have been issued to it. Next we go through the columns one by one.'},
 {t:'Aircraft with a flight plan',r:rowRect0,x:'In the list we can see that there is one aircraft currently connected with a flight plan: LOT84R.'},
 {t:'Ground state',r:col('STS'),x:'The ground state of the aircraft. The states are:<br>FRQ - On Frequency<br>RDY - Ready<br>S/U - Start-up approved<br>S/P - Push-back approved<br>TXO - Taxiing Out<br>xLU - Lined Up<br>xTO - Taking Off'},
 {t:'Callsign',r:col('C/S'),x:'The callsign of the aircraft.'},
 {t:'Next controller',r:col('SI'),x:'Every controller has their own sector indicator (SI), a short code, for example GG for ESGG_TWR and GE for ESGG_E_APP. The column shows the indicator of the controller who will get the aircraft next, or of the controller who has it now.'},
 {t:'Flight rules',r:col('R'),x:'Flight rules: V for VFR. IFR flights are left blank.'},
 {t:'Aircraft type',r:col('ATYP'),x:'The ICAO aircraft type, for example A20N or B738.'},
 {t:'Wake turbulence category',r:col('W'),x:'The wake turbulence category of the aircraft: L (light), M (medium) or H (heavy).'},
 {t:'Stand',r:col('STD'),x:'The stand the aircraft is parked at.'},
 {t:'Departure airport',r:col('ADEP'),x:'The departure airport. Departures in this list all start at ESGG.'},
 {t:'Destination airport',r:col('ADES'),x:'The destination airport from the flight plan.'},
 {t:'Departure runway',r:col('DRWY'),x:'The runway the aircraft will depart from. It follows the active runway selector.'},
 {t:'Route or heading',r:col('RTE/AHD'),x:'The assigned SID (standard instrument departure) or, if one has been given, a heading.'},
 {t:'Cleared flight level',r:col('CFL'),x:'The cleared flight level: the level the aircraft is cleared to climb to.'},
 {t:'Exit flight level',r:col('XFL'),x:'The exit flight level: the level at which the aircraft is expected to leave the airspace. You can disregard the XFL for now.'},
 {t:'Exit point',r:col('COPX'),x:'The coordination point where the aircraft exits the sector. You can disregard the COPX for now.'},
 {t:'Assigned squawk',r:col('ASSR'),x:'The assigned squawk: the transponder code given to the aircraft.'},
 {t:'Clearance',r:col('CLR'),x:'Shows OK once the departure clearance has been given.'},
 {t:'Remarks',r:col('RMK'),x:'A free text remark. It is also shown in the radar label.'},
 {t:'Estimated off-block time',r:col('EOBT'),x:'The estimated off-block time (HHMM): when the aircraft expects to leave the stand. The list is sorted by it.'},
 {t:'Assuming an aircraft',r:col('C/S'),x:'Aircraft that have not been assumed are shown in grey or dark green. You assume an aircraft only when it calls up on frequency.'},
 {t:'Aircraft calling',r:rowRect0,audio:'audio/sim01/01-LOT84R.mp3',x:'Listen: LOT84R calls up on frequency.<div class="tut-q">LOT84R: &ldquo;Ground, good evening, Lot eight four romeo, stand one niner, information Yankee onboard, request clearance to Warsaw.&rdquo;</div><div class="tut-pg"><i></i></div>'},
 {t:'Checking the flight plan',x:'When the aircraft calls up, we will issue an IFR clearance. However, we first need to check that the pilot\'s flight plan is correctly filed.'},
 {t:'Open the flight plan',r:adesCell,at:()=>win('STUP'),until:()=>!!fplEl(),x:'Click the aircraft\'s ADES to open the flight plan dialog.'},
 fp('Callsign',fld('Callsign'),'The callsign of the aircraft. Check that it is the same as the pilot used on the frequency.'),
 fp('Flight rules',fq('.bd>span.full'),'The flight rules, IFR or VFR. LOT84R is filed as IFR, so it will get an IFR clearance.'),
 fp('Aircraft data',fld('AP data'),'The aircraft data: the aircraft type, the wake turbulence category and the equipment.'),
 fp('Origin',fld('Origin'),'The departure airport. For all departures in this exercise it is ESGG.'),
 fp('Destination',fld('Destination'),'The destination airport. Check that it is the destination the pilot asked for. LOT84R is going to EPWA, Warsaw.'),
 fp('Alternate',fld('Alternate'),'The alternate airport, if one has been filed.'),
 fp('TAS',fld('TAS'),'The true airspeed of the aircraft that is filed in the flight plan, in knots.'),
 fp('Altitude',fld('Altitude'),'The cruising altitude that is filed in the flight plan, in feet.'),
 fp('Squawk',fld('Squawk'),'The squawk code (transponder code) of the aircraft. It is empty until the aircraft has been given one.'),
 fp('Departure estimate',fld('Dep. EST'),'The estimated departure time.'),
 fp('Actual',fld('Actual'),'The actual departure time. It is empty until the aircraft has departed.'),
 fp('Temporary altitude',fld('Temp alt'),'A temporary altitude that can be assigned to the aircraft. It is empty for now.'),
 fp('Route',fld('Route'),'The filed route. For a departure it starts with the SID and ends at the destination. Check that it is correct for the runway in use.'),
 fp('Waypoints',fq('.wp'),'The waypoints of the route, with the airway, a comment and the estimated time over each waypoint (ETA).'),
 fp('Remarks',fld('Remarks'),'The remarks of the flight plan, for example the flight rules marker and anything else the pilot has filed.'),
 {t:'Close the dialog',r:fplRect,at:fplRect,until:()=>!fplEl(),x:'The flight plan is correct. Close the dialog with Cancel.'},
 {t:'Assume an aircraft',r:csCell,at:()=>win('STUP'),until:()=>planes.some(p=>p.own),x:'Try it yourself: left-click the callsign in the strip and choose assume in the small menu that opens.'},
 {t:'Assumed',r:rowRect,x:'The strip is now white. A white strip means that you have assumed the aircraft; grey strips belong to aircraft you have not assumed.'},
 {t:'Simulation clock',r:()=>rectOf($('simc')),x:'The simulation clock. It is controlled by the tutorial, so you cannot change it for now. The simulation is paused.'},
 {t:'Top bar',r:()=>rectOf($('tb')),x:'Scenario loads another exercise. Next to it you see your position (ESGG_GND), the UTC clock and the ATIS box. QUICK SET shows or hides the lists, the runway button opens the active runway selector (this exercise uses runway 21).'},
 {t:'Menu bar',r:()=>rectOf($('grb')),x:'The Ground Radar menu bar. SETTINGS has label filters and label fields, WINDOW switches the lists on and off, FUNCTIONS holds extra tools. On the right: alerts, QNH, LVP toggle and the safety nets (green = on, yellow = switched off).'},
 {t:'TAXIOUT and TAKEOFF',r:()=>union(win('TAXIOUT'),win('TAKEOFF')),x:'TAXIOUT shows departures that are taxiing to the runway, TAKEOFF the ones that are lined up or have started their take-off roll. HS shows the holding point they are heading for.'},
 {t:'ADCS and TAXIIN',r:()=>union(win('ADCS'),win('TAXIIN')),x:'ADCS lists arrivals on approach or rolling out, with their runway and ETA. When an arrival has vacated the runway it moves to TAXIIN, where you give it a taxi route to its stand (STD). Set the state to PRK when it is parked.'},
 {t:'Aircraft and tags',r:plane,x:'Click an aircraft to select it. Click the callsign in its tag to open the tag menu: ground state (STS), Assume, Trans (hand-off to the next controller), Man Trf, Free and FPL (flight plan). Click the stand to change it. Drag a tag with the left mouse button to move it. Tags of aircraft without a ground state are hidden until you hover over them (Settings > Display > Label Filters).'},
 {t:'Moving the map',x:'Scroll the mouse wheel to zoom and drag with the right mouse button to pan. Hover over a tag to see all its fields.'},
 {t:'Giving instructions',r:()=>rectOf($('sb')),x:'The M button opens the manual control menu. Select an aircraft (on the map or in a list), then use the state buttons, Clearance, Taxi to (a holding point or stand), Hold short, Continue and Takeoff. The Taxi route mode lets you click out a route on the taxiways. In the lists, right-click a callsign for Hold short and Taxi to assigned stand.'},
 {t:'A typical departure',x:'1. Select the aircraft and read the clearance (CLR in the STUP list).  2. Set the state: FRQ, then S/U (start-up) and S/P (push-back) as you approve them.  3. Taxi it to the holding point (Taxi to): state TXO.  4. Line up (xLU), then take-off (xTO).  5. Hand the aircraft off with Trans in the tag menu. Arrivals: after landing they appear in TAXIIN (TXI); taxi them to the stand and set PRK. Watch for conflicts: the alert triangle in the menu bar turns red.'},
 {t:'You are ready',x:'Press 1× and start working. You can open this tour again any time from the gear menu (Settings > Tutorial).'}];
let i=-1,ring,card,dim,tm=null,aud=null;
const stopAud=()=>{if(aud){aud.onended=aud.onerror=aud.ontimeupdate=null;aud.pause();aud=null}};
const playAud=n=>{stopAud();const a=aud=new Audio(s_url(STEPS[n].audio));const pg=card.querySelector('.tut-pg i'),unlock=()=>{card.querySelectorAll('[data-a=next],[data-a=back]').forEach(b=>b.disabled=false)};
 a.ontimeupdate=()=>{if(pg&&a.duration)pg.style.width=Math.min(100,a.currentTime/a.duration*100)+'%'};
 a.onended=()=>{if(aud===a&&i===n){aud=null;i++;render()}};
 a.onerror=()=>{unlock()};
 const pr=a.play();if(pr&&pr.catch)pr.catch(unlock)};
const s_url=u=>u;
const place=()=>{if(i<0)return;const s=STEPS[i];if(s.until&&s.until()){i++;render();return}const r=s.r&&s.r();
 if(r){const pad=4;ring.style.cssText=`display:block;left:${r.left-pad}px;top:${r.top-pad}px;width:${r.width+pad*2}px;height:${r.height+pad*2}px`}else ring.style.display='none';
 dim.style.display=r?'none':'block';
 const cw=card.offsetWidth,ch=card.offsetHeight,vw=innerWidth,vh=innerHeight,g=14;let x,y;
 if(!r){x=(vw-cw)/2;y=(vh-ch)/2}
 else{const pr=(s.at&&s.at())||r,lx=Math.min(Math.max(8,r.left),vw-cw-8),opts=s.at&&pr?[[pr.right+g,pr.top],[lx,pr.bottom+g]]:[[lx,r.bottom+g],[lx,r.top-ch-g],[r.right+g,r.top],[r.left-cw-g,r.top]];const ok=opts.find(([a,b])=>a>=8&&b>=8&&a+cw<=vw-8&&b+ch<=vh-8);[x,y]=ok||[vw-cw-16,vh-ch-16]}
 x=Math.max(8,Math.min(x,vw-cw-8));y=Math.max(8,Math.min(y,vh-ch-8));
 /* an open menu (assume menu, state menu, ...) is never covered: the card snaps to its right side, or goes below/above it when there is no room */
 for(const m of document.querySelectorAll('.ap,.tm,#pm')){const q=m.getBoundingClientRect();if(!q.width)continue;
  if(q.right+g+cw<=vw-8){x=q.right+g;y=Math.max(8,Math.min(q.top,vh-ch-8))}
  else if(x<q.right+6&&x+cw>q.left-6&&y<q.bottom+6&&y+ch>q.top-6){if(q.bottom+g+ch<=vh-8)y=q.bottom+g;else if(q.top-g-ch>=8)y=q.top-g-ch;else x=Math.max(8,q.left-g-cw)}
  break}
 card.style.left=x+'px';card.style.top=y+'px'};
const render=()=>{const s=STEPS[i],last=i===STEPS.length-1;if(s.sim!=null)setSim(s.sim);
 card.innerHTML=`<div class="tut-h"><b>${s.t}</b><span class="tut-n">${i+1} / ${STEPS.length}</span></div><div class="tut-x">${s.x}</div><div class="tut-b"><button data-a="skip">${last?'':'Skip tutorial'}</button><span></span><button data-a="back"${i?'':' disabled'}>Back</button><button data-a="next" class="pri">${last?'Finish':'Next'}</button></div>`;
 card.querySelector('[data-a=skip]').style.visibility=last?'hidden':'';
 if(s.audio){card.querySelectorAll('[data-a=next],[data-a=back]').forEach(b=>b.disabled=true);playAud(i)}else stopAud();place()};
const stop=()=>{stopAud();document.body.classList.remove('tut');i=-1;clearInterval(tm);if(ring)ring.remove();if(card)card.remove();if(dim)dim.remove();ring=card=dim=null;document.removeEventListener('keydown',key,true)};
const key=e=>{if(e.key==='Escape'){stop();e.stopPropagation()}};
window.startTutorial=()=>{stop();ring=document.createElement('div');ring.className='tut-ring';card=document.createElement('div');card.className='tut-card';dim=document.createElement('div');dim.className='tut-dim';document.body.append(dim,ring,card);
 card.onclick=e=>{const a=e.target.dataset.a;if(!a)return;if(a==='skip')stop();else if(a==='back'){i--;render()}else if(i>=STEPS.length-1)stop();else{i++;render()}};
 card.onpointerdown=e=>e.stopPropagation();document.addEventListener('keydown',key,true);document.body.classList.add('tut');setSim(0);i=0;render();tm=setInterval(place,250)};
})();
