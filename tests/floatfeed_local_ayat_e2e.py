import re,json
from pathlib import Path
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1]
src=(R/'src/services/floatfeed.js').read_text()
assert 'alquran.cloud' not in src and 'alquran.cloud' not in (R/'src/shell/markup-0.html').read_text()
code=re.search(r"function ffAyat\(\).*",src).group(0).split('\n')[0]+'\n'+src[src.index('function ffFetchAyat'):src.index('/* تجديد')]
with sync_playwright() as p:
    b=p.chromium.launch(channel='chrome',args=['--no-sandbox']);pg=b.new_page()
    pg.goto((R/'www/index.html').as_uri()+'?alsaertest');pg.wait_for_timeout(1500)
    r=pg.evaluate("(code)=>{var f=new Function('ar','window',code+';return ffFetchAyat().then(function(n){var a=ffAyat();var Q=window.QDATA;return [n,a.length,a.every(function(x){var t=x.b.slice(1,-1);return Q.s.some(function(s){return s.indexOf(t)>=0})})]})');return f(function(x){return String(x)},window)}",code)
    assert r==[14,14,True],r;print('PASS floatfeed local ayat',r)
