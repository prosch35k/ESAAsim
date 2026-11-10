#!/usr/bin/env python3
"""Build data/nav.js from EuroScope Navdata (airway.txt, icao.txt, isec.txt) + the sector .sct (local fixes/VOR/NDB).
Usage: gen_nav2.py <Navdata dir> <file.sct> <out.js>"""
import sys,json,os,re
nd,sct,out=sys.argv[1:4]
LAT=(34,72);LON=(-12,45)
inb=lambda a,b:LAT[0]<=a<=LAT[1] and LON[0]<=b<=LON[1]
fx={};aw={}
def rd(f):
    for l in open(os.path.join(nd,f),encoding='latin-1'):
        if l.startswith(';') or not l.strip():continue
        yield l.rstrip('\n').split('\t')
for t in rd('airway.txt'):
    if len(t)<14:continue
    n,la,lo,a,nn,nla,nlo=t[0],t[1],t[2],t[4],t[11],t[12],t[13]
    try:la,lo=float(la),float(lo)
    except:continue
    if not inb(la,lo):continue
    fx[n]=(la,lo)
    for nn,nla,nlo in((t[11],t[12],t[13]),(t[6],t[7],t[8])):
        if nn:
            try:nla,nlo=float(nla),float(nlo)
            except:continue
            if inb(nla,nlo):
                fx[nn]=(nla,nlo);aw.setdefault(a,set()).add(tuple(sorted((n,nn))))
ap={}
for t in rd('icao.txt'):
    try:la,lo=float(t[1]),float(t[2])
    except:continue
    if inb(la,lo):ap[t[0]]=(la,lo,t[3] if len(t)>3 else '')
# local intersections (Scandinavia) from isec
for t in rd('isec.txt'):
    try:la,lo=float(t[1]),float(t[2])
    except:continue
    if 53<=la<=72 and 3<=lo<=33:fx.setdefault(t[0],(la,lo))
for n,(la,lo,_) in ap.items():fx[n]=(la,lo)
d={'fx':{n:[round(v[0],4),round(v[1],4)] for n,v in sorted(fx.items())},'aw':{k:sorted(v) for k,v in sorted(aw.items())},'ap':{n:v[2].title() for n,v in sorted(ap.items()) if v[2]}}
open(out,'w').write('const NAV='+json.dumps(d,separators=(',',':'),ensure_ascii=False)+';\n')
print(len(d['fx']),'fixes',len(d['aw']),'airways',sum(len(v) for v in d['aw'].values()),'segments',len(d['ap']),'airports',os.path.getsize(out)//1024,'KB')
