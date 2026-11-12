/* ---------- GR plugin ground label (Label=GND:ARR/DEP lines from GRpluginSettings [ESGG]) ---------- */
const LFONT='500 14px "SMR ESGG","DejaVu Sans Mono",Menlo,Consolas,monospace';
/* Settings > Labels > Fields and Settings > Display > Label Filters (Ground Radar plugin menu); ticked = default */
const GRFLD={ATYP:true,DEP:false,RMK:true,STAND:true,WTC:true},GRFILT={Stby:false,SqError:false,NoState:true,OnFreq:true,Parked:true};
/* filters only hide labels of stationary tracks (never the selected one) */
function labelHidden(p){if(p===sel||p.spd>=1||p.air||p.app||p.land)return false;if(p.kind==='DEP'){if(!p.sts&&!GRFILT.NoState)return true;if(p.sts==='FRQ'&&!GRFILT.OnFreq)return true}else if(p.sts==='PRK'&&!GRFILT.Parked)return true;return false}
function labelLines(p,hv){const F=GRFLD,rm=F.RMK?(p.edRmk?'':p.rmk):'',wt=p.hideW||!F.WTC?'':'/'+p.w,ty=F.ATYP?p.type:'',al=p.alert?'!!':'',cm='',j=(...a)=>a.filter(x=>x).join(' '),sd=F.DEP&&hv&&(p.ahdg?'H'+p.ahdg:p.sid)?(p.ahdg?'H'+p.ahdg:p.sid):'';
 const l=p.kind==='ARR'?[j(al,cm),j(p.cs,F.STAND?p.std:''),j(ty+wt,F.RMK?p.rmk:'')]:[j(al,cm),j(p.cs,rm||(F.RMK&&hv?'RMK':'')),j(ty+wt,sd)];return l.filter(x=>x)}
function updateAlerts(){const gp=planes.filter(p=>!p.air&&!p.app);gp.forEach(p=>p.alert=false);for(let i=0;i<gp.length;i++)for(let k=i+1;k<gp.length;k++){const a=gp[i],b=gp[k];if(Math.hypot(a.x-b.x,a.y-b.y)<40&&(a.spd>2||b.spd>2))a.alert=b.alert=true}}
function pickLabel(sx,sy){for(const p of planes.slice().reverse()){const r=p._lr;if(r&&sx>=r[0]&&sx<=r[0]+r[2]&&sy>=r[1]&&sy<=r[1]+r[3])return p}return null}
