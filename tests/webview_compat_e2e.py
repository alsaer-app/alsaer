"""Modern no-op gate, simulated unsupported CSS branch. Not an old-WebView device test."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
CSS=(ROOT/'src/styles/webview-compat.css').read_text()
async def main():
 async with async_playwright() as w:
  b=await w.chromium.launch(channel='chrome',args=['--no-sandbox']);p=await b.new_page(viewport={'width':360,'height':780})
  await p.set_content('<style>:root{--surface:#123456;--surface-2:#234567;--gold:#00aabb;--line:#345678}.sg-ic{background:rgb(12,34,56)}.ups-card.qws{max-height:500px}</style><div class="sg-ic">icon</div><div class="ups-card qws">popup</div>')
  before=await p.locator('.sg-ic').evaluate('(e)=>getComputedStyle(e).backgroundColor');await p.add_style_tag(content=CSS)
  assert await p.locator('.sg-ic').evaluate('(e)=>getComputedStyle(e).backgroundColor')==before
  simulated=CSS.replace('@supports not (color:color-mix(in srgb,red,blue))','@media all').replace('@supports not (height:100dvh)','@media all')
  await p.add_style_tag(content=simulated)
  assert await p.locator('.sg-ic').evaluate('(e)=>getComputedStyle(e).backgroundColor')=='rgba(95, 207, 193, 0.14)'
  assert await p.locator('.ups-card').evaluate('(e)=>getComputedStyle(e).maxHeight')=='732px'
  await p.screenshot(path='/tmp/webview-compat-simulated.png');await p.evaluate('document.body.classList.add("rd")')
  assert await p.locator('.sg-ic').evaluate('(e)=>getComputedStyle(e).backgroundColor')==before
  assert 'reader' not in CSS.split('@supports')[1] and 'svh' not in CSS
  await b.close()
 print('PASS modern CSS unchanged, unsupported-feature fallback simulated, vh fallback, reader excluded; old device unproven')
asyncio.run(main())
