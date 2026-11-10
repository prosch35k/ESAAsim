#!/usr/bin/env python3
"""Bundle PreSim into a single self-contained HTML file: dist/presim.html"""
import base64, re, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
html = (root / 'index.html').read_text()
css = (root / 'css/style.css').read_text()
font = base64.b64encode((root / 'fonts/SMR_ESGG.ttf').read_bytes()).decode()
css = css.replace('url(../fonts/SMR_ESGG.ttf)', f'url(data:font/ttf;base64,{font})')
html = html.replace('<link rel="stylesheet" href="css/style.css">', f'<style>{css}</style>')
html = re.sub(r'<script src="([^"]+)"></script>\n?', lambda m: '<script>' + (root / m.group(1)).read_text() + '</script>\n', html)
out = root / 'dist'; out.mkdir(exist_ok=True)
(out / 'presim.html').write_text(html)
print('wrote', out / 'presim.html', len(html), 'bytes')
