/* ---------- GR plugin ground label (Label=GND:ARR/DEP lines from GRpluginSettings [ESGG]) ---------- */
const LFONT='500 14px "SMR ESGG","DejaVu Sans Mono",Menlo,Consolas,monospace';
/* DEP field = the RTE/AHD list column (SID or assigned heading). Settings > Labels > Fields: ticked = shown in the label (hovering shows everything). Settings > Display > Label Filters: ticked = labels of that kind are hidden */
const GRFLD={ATYP:true,DEP:false,RMK:true,STAND:true,WTC:true},GRFILT={Stby:false,SqError:false,NoState:true,OnFreq:true,Parked:true};
const sqErr=p=>!!p.sq&&p.tsq!==p.sq;/* assigned squawk not set on the transponder */
/* filters only hide labels of stationary ground tracks (never the selected/hovered one) */
function labelHidden(p){if(p===sel||p===hovP||p.spd>=1||p.air||p.app||p.land)return false;const F=GRFILT;
 return F.Stby||(F.SqError&&sqErr(p))||(p.kind==='DEP'&&((F.NoState&&!p.sts)||(F.OnFreq&&p.sts==='FRQ')))||(p.kind==='ARR'&&F.Parked&&p.sts==='PRK')}
function labelLines(p,hv){const F=hv?{ATYP:1,DEP:1,RMK:1,STAND:1,WTC:1}:GRFLD,rm=F.RMK?(p.edRmk?'':p.rmk):'',wt=p.hideW||!F.WTC?'':'/'+p.w,ty=F.ATYP?p.type:'',al=p.alert?'!!':'',cm=sqErr(p)?p.sq:'',j=(...a)=>a.filter(x=>x).join(' ');
 p._r0=!!(al||cm);
 const l=p.kind==='ARR'?[j(al,cm),j(p.cs,F.STAND?p.std:''),j(ty+wt,F.RMK?p.rmk:'')]:[j(al,cm),j(p.cs,rm||(F.RMK&&hv?'RMK':'')),j(ty+wt,F.DEP&&(p.ahdg?'H'+p.ahdg:p.sid)?(p.ahdg?'H'+p.ahdg:p.sid):'')];return l.filter(x=>x)}
function updateAlerts(){const gp=planes.filter(p=>!p.air&&!p.app);gp.forEach(p=>p.alert=false);for(let i=0;i<gp.length;i++)for(let k=i+1;k<gp.length;k++){const a=gp[i],b=gp[k];if(Math.hypot(a.x-b.x,a.y-b.y)<40&&(a.spd>2||b.spd>2))a.alert=b.alert=true}}
function pickLabel(sx,sy){for(const p of planes.slice().reverse()){const r=p._lr;if(r&&sx>=r[0]&&sx<=r[0]+r[2]&&sy>=r[1]&&sy<=r[1]+r[3])return p}return null}
