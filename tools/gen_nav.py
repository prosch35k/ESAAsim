#!/usr/bin/env python3
"""Build data/nav.js (fixes + airways) from an EuroScope .sct file. Usage: gen_nav.py <file.sct> <out.js>"""
import re,sys,json
src,out=sys.argv[1],sys.argv[2]
L=open(src,encoding='latin-1').read().splitlines()
def dm(s):
    h=s[0];p=s[1:].split('.');v=int(p[0])+int(p[1])/60+float(p[2]+'.'+(p[3] if len(p)>3 else '0'))/3600
    return -v if h in 'SW' else v
sec=None;fx={};aw={};key=lambda a,b:(round(a,4),round(b,4))
rev={}
for l in L:
    if l.startswith('['):sec=l.strip();continue
    if not l.strip() or l.startswith(';'):continue
    t=l.split()
    if sec=='[FIXES]' and len(t)>=3:
        try:fx[t[0]]=(dm(t[1]),dm(t[2]))
        except:pass
    elif sec in('[VOR]','[NDB]') and len(t)>=4:
        try:fx[t[0]]=(dm(t[2]),dm(t[3]))
        except:pass
for n,(a,b) in fx.items():rev.setdefault(key(a,b),n)
grid={}
for n,(a,b) in fx.items():grid.setdefault((round(a,2),round(b,2)),[]).append(n)
def near(a,b):
    best=None;bd=1e9
    for da in(-.01,0,.01):
        for db in(-.01,0,.01):
            for n in grid.get((round(a+da,2),round(b+db,2)),[]):
                d=(fx[n][0]-a)**2+((fx[n][1]-b)*.54)**2
                if d<bd:bd=d;best=n
    return best if bd<(.004)**2 else None
bad=set()
segs={}
for sec2 in('[HIGH AIRWAY]','[LOW AIRWAY]'):
    on=False
    for l in L:
        if l.startswith('['):on=l.strip()==sec2;continue
        if not on or not l.strip():continue
        t=l.split()
        if len(t)<5:continue
        try:a=key(dm(t[1]),dm(t[2]));b=key(dm(t[3]),dm(t[4]))
        except:continue
        na,nb=rev.get(a) or near(*a),rev.get(b) or near(*b)
        if not na:bad.add(a)
        if not nb:bad.add(b)
        if na and nb and na!=nb:segs.setdefault(t[0],set()).add(tuple(sorted((na,nb))))
used=set(n for s in segs.values() for e in s for n in e)
out_=dict(fx={n:[round(fx[n][0],4),round(fx[n][1],4)] for n in sorted(fx)},aw={k:sorted(v) for k,v in sorted(segs.items())})
open(out,'w').write('const NAV='+json.dumps(out_,separators=(',',':'))+';\n')
print(len(bad),'unresolved endpoints');print(len(fx),'fixes',len(segs),'airways',sum(len(v) for v in segs.values()),'segments')
