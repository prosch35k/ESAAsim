/* ---------- GR plugin ground label (Label=GND:ARR/DEP lines from GRpluginSettings [ESGG]) ---------- */
const LFONT='500 14px "SMR ESGG","DejaVu Sans Mono",Menlo,Consolas,monospace';
function labelLines(p,hv){const rm=p.edRmk?'':p.rmk,wt=p.hideW?'':'/'+p.w,al=p.alert?'!!':'',cm='',j=(...a)=>a.filter(x=>x).join(' ');
 const l=p.kind==='ARR'?[j(al,cm),j(p.cs,p.std),p.type+wt+(p.rmk?' '+p.rmk:'')]:[j(al,cm),j(p.cs,rm||(hv?'RMK':'')),p.type+wt+(hv&&(p.ahdg?'H'+p.ahdg:p.sid)?' '+(p.ahdg?'H'+p.ahdg:p.sid):'')];return l.filter(x=>x)}
function updateAlerts(){const gp=planes.filter(p=>!p.air&&!p.app);gp.forEach(p=>p.alert=false);for(let i=0;i<gp.length;i++)for(let k=i+1;k<gp.length;k++){const a=gp[i],b=gp[k];if(Math.hypot(a.x-b.x,a.y-b.y)<40&&(a.spd>2||b.spd>2))a.alert=b.alert=true}}
function pickLabel(sx,sy){for(const p of planes.slice().reverse()){const r=p._lr;if(r&&sx>=r[0]&&sx<=r[0]+r[2]&&sy>=r[1]&&sy<=r[1]+r[3])return p}return null}
