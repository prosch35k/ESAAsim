from playwright.sync_api import sync_playwright
with sync_playwright() as pw:
    b=pw.chromium.launch();pg=b.new_page(viewport={'width':1500,'height':900})
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
    pg.goto('file://'+__import__('os').path.abspath('index.html'));pg.wait_for_timeout(800)
    pg.evaluate("()=>{$('cs').value='SAS123';$('stsel').value='3';$('spst').click();$('cs').value='NSZ456';$('stsel').value='6';$('spst').click()}")
    def tx(t):
        pg.fill('#rtx',t);pg.click('#rsend');pg.wait_for_timeout(1500)
    for t in ["Scandinavian one two three, clearance: cleared to ESSA via DETNA three mike, climb altitude 5000 feet, squawk 2301",
              "Scandinavian 123 startup approved","Scandinavian 123 pushback approved",
              "Scandinavian 123 taxi to holding point Bravo runway 03 via Yankee",
              "Norwegian 456 taxi to holding point Charlie via Yankee",
              "Scandinavian 123 hold position","Scandinavian 123 continue taxi","blah"]:
        tx(t)
    print(pg.evaluate("()=>planes.map(p=>[p.cs,p.sts,p.sid,p.cfl,p.sq,p.clr,p.hold,p.route.length,p.own])"))
    for _ in range(40):
        pg.evaluate("()=>{for(let i=0;i<60;i++)step(1)}")
    print(pg.evaluate("()=>planes.map(p=>[p.cs,p.sts,Math.round(p.x),Math.round(p.y)])"))
    tx("Scandinavian 123 line up runway 03 via B");pg.evaluate("()=>{for(let i=0;i<200;i++)step(1)}")
    tx("Scandinavian 123 cleared for takeoff runway 03")
    print(pg.evaluate("()=>planes.map(p=>[p.cs,p.sts,p.to])"))
    print(pg.inner_text('#rl'));print(errs)
    pg.screenshot(path='v.png');b.close()
