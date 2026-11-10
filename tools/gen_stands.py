#!/usr/bin/env python3
"""Parse the ESGG section of GRpluginStands.txt into data/stands.js (stand rules + STANDLIST callsign weights).
usage: gen_stands.py GRpluginStands.txt data/stands.js"""
import sys, re, json, copy
src, out = sys.argv[1], sys.argv[2]
lines = [l.rstrip('\n') for l in open(src, encoding='utf-8', errors='replace')]
# groups are file-global; take ESGG section for stands
groups = {}
for l in lines:
    if l.startswith('GROUP:'):
        p = l.split(':'); groups[p[1]] = p[2:]
start = next(i for i, l in enumerate(lines) if re.match(r'//-+ESGG\s*$', l))
end = next((i for i in range(start + 1, len(lines)) if re.match(r'//-+[A-Z]{4}\s*$', lines[i])), len(lines))
sec = [l.strip() for l in lines[start:end]]
def expand(items):
    o = []
    for it in items:
        it = it.strip()
        if not it: continue
        if it.startswith('GROUP_'): o += groups.get(it[6:], [])
        else: o.append(it)
    return o
UB = dict(A=15, B=24, C=36, D=52, E=65, F=80); LB = dict(A=0, B=15, C=24, D=36, E=52, F=65)
defs = []; lists = []; cur = None
CARRY_RESET = ['sch', 'cs', 'notcs', 'adep', 'notadep', 'via', 'rem']
def push():
    global cur
    if cur and cur.get('name'): defs.append(cur)
for l in sec:
    if not l or l.startswith('//'): continue
    k, _, rest = l.partition(':'); k = k.upper(); P = rest.split(':') if rest else []
    if k == 'STANDLIST':
        # STANDLIST:ESGG:CallsignList:Points:StandList
        if P[0] != 'ESGG': continue
        lists.append(dict(cs=[c for c in P[1].split(',') if c], pts=float(P[2]), st=expand(P[3].split(','))))
    elif k == 'STAND':
        push(); cur = dict(name=P[1], use='', atyp=[], notatyp=[], wtc='', notwtc='', pri=0, ws=None, len=None, sch=0, manual=False, area=False, blocks=[], limits=[])
    elif cur is None: continue
    elif k == 'COPY':
        defs.append(cur); n = copy.deepcopy(cur)
        n['sch'] = 0
        cur = n
    elif k == 'USE': cur['use'] = P[0]
    elif k == 'ATYP': cur['atyp'] = expand(rest.split(','))
    elif k == 'NOTATYP': cur['notatyp'] = expand(rest.split(','))
    elif k == 'WTC': cur['wtc'] = P[0]
    elif k == 'NOTWTC': cur['notwtc'] = P[0]
    elif k == 'PRIORITY': cur['pri'] = int(P[0])
    elif k == 'WINGSPAN': cur['ws'] = [float(P[0]), float(P[1])] if len(P) > 1 else [0, float(P[0])]
    elif k == 'LENGTH': cur['len'] = [float(P[0]), float(P[1])] if len(P) > 1 else [0, float(P[0])]
    elif k == 'CODE':
        lo, hi = (P[0], P[1]) if len(P) > 1 else ('A', P[0])
        cur['ws'] = [LB[lo], UB[hi] - 0.001]
    elif k == 'SCHENGEN': cur['sch'] = 1
    elif k == 'NON-SCHENGEN': cur['sch'] = -1
    elif k == 'MANUAL': cur['manual'] = True
    elif k == 'AREA': cur['area'] = True
    elif k == 'BLOCKS': cur['blocks'].append([expand(P[0].split(',')), P[1] if len(P) > 1 else '', float(P[2]) if len(P) > 2 else 0])
    elif k == 'LIMITS': cur['limits'].append(P)
push()
# keep only fields that matter
js = 'const GST=' + json.dumps(dict(defs=defs, lists=lists), separators=(',', ':')) + ';\n'
open(out, 'w').write(js)
print(len(defs), 'definitions,', len(lists), 'standlists ->', out, len(js), 'bytes')
